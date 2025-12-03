// Supabase Edge Function: gaia-router
// Gaia - The Agent Router/Orchestrator
// - Routes tasks from Stella to appropriate specialist agents
// - Analyzes task specs, checks agent capabilities, orchestrates execution
// - Logs all routing decisions

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Get user's agent passport (Stella's passport)
 */
async function getUserPassport(supabase, userId, stellaHandle) {
  try {
    const { data: passport } = await supabase
      .from('agent_passports')
      .select('*')
      .eq('user_id', userId)
      .eq('handle_id', stellaHandle)
      .single();
    
    return passport || null;
  } catch (error) {
    console.error('Error fetching user passport:', error);
    return null;
  }
}

/**
 * Find agents that can handle the task type
 * @param isSyntheticTask - If true, only query EXPERIMENTAL agents (for synthetic testing)
 *                          If false, only query ACTIVE agents (for production/Stella)
 */
async function findCandidateAgents(supabase, taskType, isSyntheticTask = false) {
  try {
    // Query agents first - make sure to get invocation_config
    let query = supabase
      .from('agents')
      .select('id, name, slug, domain, description, invocation_type, invocation_config, status, version')
      .order('name');
    
    if (isSyntheticTask) {
      // Synthetic testing: ONLY query EXPERIMENTAL agents (what we're testing)
      query = query.eq('status', 'EXPERIMENTAL');
      console.log(`[Gaia Router] Synthetic task detected - querying EXPERIMENTAL agents only`);
    } else {
      // Production (Stella): ONLY query ACTIVE agents (production-ready)
      query = query.eq('status', 'ACTIVE');
      console.log(`[Gaia Router] Production task detected - querying ACTIVE agents only`);
    }
    
    const { data: agents, error: agentsError } = await query;

    if (agentsError) {
      console.error('Error fetching agents:', agentsError);
      return [];
    }

    if (!agents || agents.length === 0) {
      console.log('No active agents found');
      return [];
    }

    console.log(`Found ${agents.length} active agents`);

    // Query capabilities separately and join manually
    const agentIds = agents.map(a => a.id);
    const { data: capabilities, error: capsError } = await supabase
      .from('agent_capabilities')
      .select('*')
      .in('agent_id', agentIds);

    if (capsError) {
      console.error('Error fetching capabilities:', capsError);
    }

    // Join capabilities to agents
    const agentsWithCaps = agents.map(agent => {
      const agentCaps = capabilities?.filter(cap => cap.agent_id === agent.id) || [];
      return {
        ...agent,
        agent_capabilities: agentCaps
      };
    });

    console.log(`Active agents with capabilities:`, agentsWithCaps.map(a => ({
      slug: a.slug,
      status: a.status,
      has_capabilities: !!a.agent_capabilities?.[0],
      capabilities_count: a.agent_capabilities?.length || 0
    })));

    // Debug: Check Atlas specifically
    const atlasAgent = agentsWithCaps.find(a => a.slug === 'atlas');
    if (atlasAgent) {
      console.log(`Atlas agent check:`, {
        id: atlasAgent.id,
        name: atlasAgent.name,
        slug: atlasAgent.slug,
        domain: atlasAgent.domain,
        has_capabilities: !!atlasAgent.agent_capabilities?.[0],
        capabilities_count: atlasAgent.agent_capabilities?.length || 0,
        capabilities_data: atlasAgent.agent_capabilities?.[0]?.passport_data
      });
    } else {
      console.log('Atlas agent not found in results');
    }

    // Filter agents that support this task type
    const candidates = agentsWithCaps.filter(agent => {
      const capabilities = agent.agent_capabilities?.[0];
      if (!capabilities) {
        console.log(`Agent ${agent.slug} has no capabilities`);
        return false;
      }
      
      // Prefer agents with recent validations (they're learning)
      // But don't exclude agents without validations yet

      // Try multiple paths to find supported_task_types
      const passportData = capabilities.passport_data || {};
      const supportedTypes = passportData.capabilities?.supported_task_types || 
                            passportData.supported_task_types || [];

      console.log(`Agent ${agent.slug} supports:`, supportedTypes, `Looking for: ${taskType}`);
      
      const matches = supportedTypes.includes(taskType);
      
      if (!matches && agent.slug === 'atlas') {
        console.log(`Atlas agent full passport_data:`, JSON.stringify(passportData, null, 2));
        console.log(`Atlas agent capabilities structure:`, Object.keys(passportData));
      }

      return matches;
    });

    // Sort by learning-enhanced metrics
    // Priority: recent_success_rate > success_rate > validation_count (confidence) > latency
    candidates.sort((a, b) => {
      const aCap = a.agent_capabilities?.[0];
      const bCap = b.agent_capabilities?.[0];
      
      // Use recent_success_rate if available (more responsive to learning)
      const aRate = aCap?.recent_success_rate ?? aCap?.success_rate ?? 0.5;
      const bRate = bCap?.recent_success_rate ?? bCap?.success_rate ?? 0.5;
      
      // If rates are close, prefer agents with more validations (higher confidence)
      if (Math.abs(aRate - bRate) < 0.05) {
        const aConfidence = aCap?.validation_count ?? 0;
        const bConfidence = bCap?.validation_count ?? 0;
        if (aConfidence !== bConfidence) {
          return bConfidence - aConfidence;
        }
        // If confidence is same, prefer lower latency
        const aLatency = aCap?.average_latency_ms || 1000;
        const bLatency = bCap?.average_latency_ms || 1000;
        return aLatency - bLatency;
      }
      
      return bRate - aRate;
    });

    return candidates;
  } catch (error) {
    console.error('Error in findCandidateAgents:', error);
    return [];
  }
}

/**
 * Route task to appropriate agent(s)
 */
async function routeTask(supabase, taskSpec, userPassport) {
  const routes = [];
  const reasoning = [];

  // Check if this is a synthetic task (has stella_handle with 'synthetic' or 'test')
  const isSyntheticTask = taskSpec.stella_handle?.includes('synthetic') || 
                          taskSpec.stella_handle?.includes('test') ||
                          taskSpec.user_id === '89b49bcc-4be4-4d94-aa3e-abdc9367eb60'; // Synthetic user ID
  
  // Find candidate agents (include EXPERIMENTAL for synthetic tasks)
  const candidates = await findCandidateAgents(supabase, taskSpec.type, isSyntheticTask);

  if (candidates.length === 0) {
    // Log for debugging
    console.log(`No candidates found for task type: ${taskSpec.type}`);
    const allAgents = await supabase.from('agents').select('slug, status').eq('status', 'ACTIVE');
    console.log(`Active agents:`, allAgents.data);
    
    reasoning.push(`No agents found that support this task type: ${taskSpec.type}`);
    return [];
  }

  // For now, use the first (best) candidate as primary agent
  const primaryAgent = candidates[0];
  const primaryCapabilities = primaryAgent.agent_capabilities?.[0];

  reasoning.push(`Found ${candidates.length} candidate agent(s)`);
  reasoning.push(`Selected ${primaryAgent.name} as primary agent (success rate: ${((primaryCapabilities?.success_rate || 0) * 100).toFixed(1)}%)`);

  // Check constraints
  const constraints = primaryCapabilities?.passport_data?.constraints || {};
  if (taskSpec.context?.event_details?.max_attendees) {
    const maxAllowed = constraints.max_attendees || 50;
    if (taskSpec.context.event_details.max_attendees > maxAllowed) {
      reasoning.push(`Warning: max_attendees (${taskSpec.context.event_details.max_attendees}) exceeds agent limit (${maxAllowed})`);
    }
  }

  // Create routing decision
  console.log(`Primary agent data:`, {
    id: primaryAgent.id,
    slug: primaryAgent.slug,
    name: primaryAgent.name,
    invocation_type: primaryAgent.invocation_type,
    invocation_config: primaryAgent.invocation_config,
    has_invocation_config: !!primaryAgent.invocation_config
  });

  const invocationConfig = primaryAgent.invocation_config;
  if (!invocationConfig) {
    reasoning.push(`ERROR: Agent ${primaryAgent.slug} has no invocation_config`);
    console.error(`Agent ${primaryAgent.slug} missing invocation_config. Full agent data:`, JSON.stringify(primaryAgent, null, 2));
    return [];
  }

  // invocation_type is a separate column, not in invocation_config
  // Add it to the config for the executeAgent function
  const fullConfig = {
    invocation_type: primaryAgent.invocation_type || 'INTERNAL_FUNCTION',
    ...invocationConfig
  };

  if (!fullConfig.invocation_type) {
    reasoning.push(`ERROR: Agent ${primaryAgent.slug} missing invocation_type`);
    console.error(`Agent ${primaryAgent.slug} missing invocation_type. Full agent data:`, JSON.stringify(primaryAgent, null, 2));
    return [];
  }

  console.log(`Routing to ${primaryAgent.name} with config:`, JSON.stringify(fullConfig, null, 2));

  routes.push({
    agent_id: primaryAgent.id,
    agent_slug: primaryAgent.slug,
    agent_name: primaryAgent.name,
    priority: 1,
    role: 'primary',
    invocation_config: fullConfig,
    confidence: primaryCapabilities?.success_rate || 0.5,
    reasoning: reasoning
  });

  return routes;
}

/**
 * Transform standard task spec to agent-specific format based on agent passport
 * Returns both the transformed spec and transformation metadata
 */
function transformTaskSpecForAgent(standardTaskSpec: any, agentCapabilities: any): { transformed: any, metadata: any } {
  const passportData = agentCapabilities?.passport_data || {};
  const inputFormat = passportData.capabilities?.input_format || 
                     passportData.input_format || 
                     'standard'; // Default: no transformation
  
  // Initialize transformation metadata
  const transformationMetadata: any = {
    input_format: inputFormat,
    transformation_applied: false,
    transformation_type: null,
    standard_format: {
      has_raw_message: !!standardTaskSpec.raw_message,
      has_extracted_entities: !!standardTaskSpec.extracted_entities,
      intent: standardTaskSpec.intent,
      type: standardTaskSpec.type
    },
    agent_format: null,
    preferred_fields_used: {},
    mapping_applied: {}
  };
  
  console.log(`[Gaia Transform] Agent input_format: ${inputFormat}`);
  
  // Detect if task spec is already in agent-specific format (backward compatibility)
  // Check if it has agent-specific structure (e.g., context.action + context.message for nlp_create)
  const hasRawMessage = !!standardTaskSpec.raw_message;
  const hasContextAction = !!standardTaskSpec.context?.action;
  const hasContextMessage = !!standardTaskSpec.context?.message;
  const hasEventDetails = !!standardTaskSpec.context?.event_details;
  
  // If task spec already looks like agent format, skip transformation
  if (hasContextAction && (hasContextMessage || hasEventDetails) && !hasRawMessage) {
    console.log(`[Gaia Transform] Task spec appears to be in agent format already, skipping transformation`);
    transformationMetadata.transformation_applied = false;
    transformationMetadata.reason = 'Task spec already in agent format (backward compatibility)';
    return { transformed: standardTaskSpec, metadata: transformationMetadata };
  }
  
  // Special handling for GOAL_PLANNING tasks - always extract goal regardless of input_format
  // This ensures Atlas (and other goal planning agents) always get context.goal
  if (standardTaskSpec.type === 'GOAL_PLANNING' && !standardTaskSpec.context?.goal) {
    // Ensure context exists
    if (!standardTaskSpec.context) {
      standardTaskSpec.context = {};
    }
    
    // Try to extract goal from multiple sources
    if (standardTaskSpec.extracted_entities?.goal) {
      standardTaskSpec.context.goal = standardTaskSpec.extracted_entities.goal;
    } else if (standardTaskSpec.raw_message) {
      try {
        const message = String(standardTaskSpec.raw_message).trim();
        if (message) {
          const goal = message
            .replace(/^(i\s+(want|wanna|would like|need|plan|hope)\s+to\s+)/i, '')
            .replace(/^(i\s+(want|wanna|would like|need|plan|hope)\s+)/i, '')
            .replace(/^(let'?s\s+)/i, '')
            .replace(/^(can\s+we\s+)/i, '')
            .split(/[.!?]/)[0]
            .trim();
          
          standardTaskSpec.context.goal = goal || message.substring(0, 100);
          standardTaskSpec.context.goal_description = message;
        }
      } catch (extractError) {
        console.error('[Gaia Transform] Error extracting goal:', extractError);
        standardTaskSpec.context.goal = String(standardTaskSpec.raw_message || standardTaskSpec.description || '').substring(0, 200);
        standardTaskSpec.context.goal_description = standardTaskSpec.raw_message || standardTaskSpec.description || '';
      }
    } else if (standardTaskSpec.description) {
      standardTaskSpec.context.goal = String(standardTaskSpec.description).substring(0, 200);
      standardTaskSpec.context.goal_description = standardTaskSpec.description;
    }
    
    // Ensure goal is never null
    if (!standardTaskSpec.context.goal) {
      console.warn('[Gaia Transform] Warning: Could not extract goal for GOAL_PLANNING task, using fallback');
      standardTaskSpec.context.goal = 'Unspecified goal';
    }
    
    console.log(`[Gaia Transform] Extracted goal for GOAL_PLANNING: "${standardTaskSpec.context.goal}"`);
  }
  
  // If already in standard format or agent accepts standard, return as-is (but with goal extracted above)
  if (inputFormat === 'standard' || inputFormat === 'raw_message') {
    transformationMetadata.transformation_applied = false;
    transformationMetadata.reason = `Agent accepts ${inputFormat} format (no transformation needed)`;
    return { transformed: standardTaskSpec, metadata: transformationMetadata };
  }
  
  // Helper functions for path resolution (used in custom transformations)
  function resolvePath(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    return current;
  }
  
  function setNestedField(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }
  
  // Transform based on agent's declared format
  const transformed = {
    type: standardTaskSpec.type,
    user_id: standardTaskSpec.user_id,
    stella_handle: standardTaskSpec.stella_handle,
    description: standardTaskSpec.raw_message || standardTaskSpec.description,
    // Preserve extracted_entities and intent from standard format for NLP extraction
    extracted_entities: standardTaskSpec.extracted_entities,
    intent: standardTaskSpec.intent,
    context: {}
  };
  
  // Get transformation preferences from passport
  const transformation = passportData.capabilities?.input_transformation || 
                        passportData.input_transformation || {};
  const preferredFields = passportData.capabilities?.preferred_fields || 
                          passportData.preferred_fields || {};
  
  // Generic transformation based on input_format
  transformationMetadata.transformation_applied = true;
  transformationMetadata.transformation_type = inputFormat;
  
  if (inputFormat === 'nlp_create') {
    // Transform to NLP format (Prime agent, or any agent that extracts from natural language)
    transformed.context = {
      action: preferredFields.action || 'nlp_create',
      message: standardTaskSpec.raw_message || standardTaskSpec.description,
      ...(preferredFields.auto_invite !== undefined && { auto_invite: preferredFields.auto_invite })
    };
    
    transformationMetadata.preferred_fields_used = {
      action: transformed.context.action,
      ...(preferredFields.auto_invite !== undefined && { auto_invite: preferredFields.auto_invite })
    };
    
    // Add any preferred fields
    if (preferredFields) {
      Object.keys(preferredFields).forEach(key => {
        if (key !== 'action' && !transformed.context[key]) {
          transformed.context[key] = preferredFields[key];
          transformationMetadata.preferred_fields_used[key] = preferredFields[key];
        }
      });
    }
    
    transformationMetadata.agent_format = {
      context_action: transformed.context.action,
      context_message_length: transformed.context.message?.length || 0,
      has_auto_invite: transformed.context.auto_invite !== undefined
    };
  } else if (inputFormat === 'structured') {
    // Transform to structured format (generic - works for any task type)
    // Use extracted_entities or context data, mapped to agent's expected structure
    const structuredData = standardTaskSpec.extracted_entities || standardTaskSpec.context || {};
    
    transformed.context = {
      action: preferredFields.action || standardTaskSpec.intent || 'execute',
      ...structuredData  // Spread extracted entities or context data
    };
    
    // Special handling for GOAL_PLANNING tasks - extract goal from raw_message if not in extracted_entities
    if (standardTaskSpec.type === 'GOAL_PLANNING') {
      // Ensure context.goal exists - try multiple sources
      if (!transformed.context.goal) {
        // Try to extract goal from extracted_entities first
        if (structuredData && structuredData.goal) {
          transformed.context.goal = structuredData.goal;
        } else if (standardTaskSpec.extracted_entities?.goal) {
          transformed.context.goal = standardTaskSpec.extracted_entities.goal;
        } else if (standardTaskSpec.raw_message) {
          try {
            // Extract goal from raw_message (simple heuristic: use first sentence or first 100 chars)
            const message = String(standardTaskSpec.raw_message).trim();
            if (message) {
              // Remove common prefixes like "I want to", "I'd like to", etc.
              const goal = message
                .replace(/^(i\s+(want|wanna|would like|need|plan|hope)\s+to\s+)/i, '')
                .replace(/^(i\s+(want|wanna|would like|need|plan|hope)\s+)/i, '')
                .replace(/^(let'?s\s+)/i, '')
                .replace(/^(can\s+we\s+)/i, '')
                .split(/[.!?]/)[0]  // Take first sentence
                .trim();
              
              transformed.context.goal = goal || message.substring(0, 100); // Fallback to first 100 chars
              transformed.context.goal_description = message; // Keep full message as description
            }
          } catch (extractError) {
            console.error('[Gaia Transform] Error extracting goal from message:', extractError);
            // Fallback: use raw_message as goal
            transformed.context.goal = String(standardTaskSpec.raw_message || standardTaskSpec.description || '').substring(0, 200);
            transformed.context.goal_description = standardTaskSpec.raw_message || standardTaskSpec.description || '';
          }
        } else if (standardTaskSpec.description) {
          // Last resort: use description
          transformed.context.goal = String(standardTaskSpec.description).substring(0, 200);
          transformed.context.goal_description = standardTaskSpec.description;
        }
      }
      
      // Ensure goal is set - if still not set, this will cause an error but at least we tried
      if (!transformed.context.goal) {
        console.warn('[Gaia Transform] Warning: Could not extract goal for GOAL_PLANNING task');
        transformed.context.goal = 'Unspecified goal'; // Fallback to prevent null constraint violation
      }
    }
    
    transformationMetadata.preferred_fields_used = {
      action: transformed.context.action
    };
    
    // Apply preferred fields
    if (preferredFields) {
      Object.keys(preferredFields).forEach(key => {
        if (key !== 'action') {
          transformed.context[key] = preferredFields[key];
          transformationMetadata.preferred_fields_used[key] = preferredFields[key];
        }
      });
    }
    
    transformationMetadata.agent_format = {
      context_action: transformed.context.action,
      extracted_entities_count: Object.keys(structuredData).length,
      extracted_entities_keys: Object.keys(structuredData),
      ...(standardTaskSpec.type === 'GOAL_PLANNING' && {
        goal_extracted: !!transformed.context.goal,
        goal_length: transformed.context.goal?.length || 0
      })
    };
  } else if (inputFormat === 'custom') {
    // Custom transformation using input_transformation mapping
    // This allows agents to define their own transformation rules
    if (transformation.mapping) {
      // Apply custom mapping rules
      transformed.context = {};
      const mappingResults: any = {};
      Object.keys(transformation.mapping).forEach(targetField => {
        const sourcePath = transformation.mapping[targetField];
        // Simple path resolution (e.g., "raw_message" or "extracted_entities.amount")
        const value = resolvePath(standardTaskSpec, sourcePath);
        if (value !== undefined) {
          setNestedField(transformed.context, targetField, value);
          mappingResults[targetField] = {
            source: sourcePath,
            value: typeof value === 'object' ? 'object' : value,
            mapped: true
          };
        } else {
          mappingResults[targetField] = {
            source: sourcePath,
            mapped: false,
            reason: 'Source path not found'
          };
        }
      });
      transformationMetadata.mapping_applied = mappingResults;
      transformationMetadata.agent_format = {
        custom_mappings: Object.keys(mappingResults).length,
        successful_mappings: Object.values(mappingResults).filter((m: any) => m.mapped).length
      };
    } else {
      // Fallback: return standard format
      console.warn(`[Gaia Transform] Custom format without mapping, returning standard`);
      transformationMetadata.transformation_applied = false;
      transformationMetadata.reason = 'Custom format specified but no mapping provided';
      return { transformed: standardTaskSpec, metadata: transformationMetadata };
    }
  } else {
    // Unknown format, return standard (agent should handle it)
    console.warn(`[Gaia Transform] Unknown input_format: ${inputFormat}, returning standard format`);
    transformationMetadata.transformation_applied = false;
    transformationMetadata.reason = `Unknown input_format: ${inputFormat}`;
    return { transformed: standardTaskSpec, metadata: transformationMetadata };
  }
  
  // Merge any additional context from standard task spec
  if (standardTaskSpec.context) {
    Object.keys(standardTaskSpec.context).forEach(key => {
      if (!transformed.context[key]) {
        transformed.context[key] = standardTaskSpec.context[key];
      }
    });
  }
  
  transformationMetadata.agent_format = {
    ...transformationMetadata.agent_format,
    final_context_keys: Object.keys(transformed.context),
    final_context_size: JSON.stringify(transformed.context).length
  };
  
  console.log(`[Gaia Transform] Transformed task spec:`, JSON.stringify(transformed, null, 2));
  console.log(`[Gaia Transform] Transformation metadata:`, JSON.stringify(transformationMetadata, null, 2));
  
  return { transformed, metadata: transformationMetadata };
}

/**
 * Execute agent based on routing decision
 * Returns execution result and transformation metadata
 */
async function executeAgent(supabase, route, taskSpec, agentCapabilities: any): Promise<{ result: any, transformationMetadata: any }> {
  try {
    const config = route.invocation_config;
    if (!config) {
      throw new Error(`Agent ${route.agent_slug} has no invocation_config`);
    }

    console.log(`Executing agent ${route.agent_slug} with config:`, JSON.stringify(config, null, 2));
    
    // Transform standard task spec to agent-specific format
    const { transformed: agentTaskSpec, metadata: transformationMetadata } = transformTaskSpecForAgent(taskSpec, agentCapabilities);
    console.log(`[Gaia] Transformed task spec for ${route.agent_slug}:`, JSON.stringify(agentTaskSpec, null, 2));
    console.log(`[Gaia] Transformation metadata:`, JSON.stringify(transformationMetadata, null, 2));
    
    // Store transformation metadata for logging
    const transformationLog = {
      agent_slug: route.agent_slug,
      agent_input_format: transformationMetadata.input_format,
      transformation_applied: transformationMetadata.transformation_applied,
      transformation_type: transformationMetadata.transformation_type,
      standard_format: transformationMetadata.standard_format,
      agent_format: transformationMetadata.agent_format,
      preferred_fields_used: transformationMetadata.preferred_fields_used,
      mapping_applied: transformationMetadata.mapping_applied,
      reason: transformationMetadata.reason
    };

    if (config.invocation_type === 'INTERNAL_FUNCTION') {
      // Call Supabase Edge Function
      // Make sure function_name matches the deployed function name exactly (case-sensitive!)
      // Default fallback: capitalize first letter of agent slug (e.g., "atlas" -> "Atlas")
      const functionName = config.function_name || 
                          (route.agent_slug.charAt(0).toUpperCase() + route.agent_slug.slice(1));
      const functionUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/${functionName}`;
      
      console.log(`[Gaia] Calling agent function: ${functionUrl}`);
      console.log(`[Gaia] Function name from config: ${config.function_name || 'not set, using default'}`);
      console.log(`[Gaia] Agent slug: ${route.agent_slug}`);
      
      const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      const response = await fetch(functionUrl, {
        method: config.method || 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY // Also pass as apikey for Supabase edge function auth
        },
        body: JSON.stringify({
          task_spec: agentTaskSpec
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Agent execution failed: ${errorText}`;
        
        // Try to parse error JSON for better error messages
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.code === 'NOT_FOUND' || errorJson.message?.includes('not found')) {
            errorMessage = `Function "${functionName}" not found. Please verify: 1) The function is deployed in Supabase, 2) The function name in agent's invocation_config matches the deployed name exactly (case-sensitive). Current function name: "${functionName}"`;
          } else {
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          }
        } catch {
          // Not JSON, use text as-is
        }
        
        throw new Error(errorMessage);
      }

      const executionResult = await response.json();
      return { result: executionResult, transformationMetadata: transformationLog };
    } else if (config.invocation_type === 'HTTP_ENDPOINT') {
      // Call external HTTP endpoint
      // Note: For external endpoints, we still transform the task spec
      const response = await fetch(config.endpoint, {
        method: config.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers || {}
        },
        body: JSON.stringify({
          task_spec: agentTaskSpec  // Use transformed task spec
        })
      });

      if (!response.ok) {
        throw new Error(`External agent execution failed: ${response.statusText}`);
      }

      const executionResult = await response.json();
      return { result: executionResult, transformationMetadata: transformationLog };
    } else {
      throw new Error(`Unknown invocation type: ${config.invocation_type}`);
    }
  } catch (error) {
    console.error('Error executing agent:', error);
    // Return error result with empty transformation metadata
    return { 
      result: { success: false, error: error.message || 'Unknown error' },
      transformationMetadata: null
    };
  }
}

/**
 * Log routing decision
 */
async function logRouting(supabase, taskSpec, routes, result, latencyMs) {
  try {
    const { data: routingLog, error } = await supabase.from('agent_usage_logs').insert({
      stella_handle: taskSpec.stella_handle,
      agent_id: null,
      user_id: taskSpec.user_id,
      task_type: 'ROUTING',
      task_description: `Gaia routing: ${taskSpec.type}`,
      full_context_json: taskSpec,
      input_json: {
        task_spec: taskSpec,
        routes
      },
      output_json: result,
      success_flag: result.success !== false,
      latency_ms: latencyMs,
      task_steps: routes.map(r => `routed_to_${r.agent_slug}`),
      error_message: result.error || null
    }).select('id').single();
    
    if (error) {
      console.error('Error logging routing:', error);
      return null;
    }
    
    return routingLog;
  } catch (error) {
    console.error('Error logging routing:', error);
    // Don't throw - logging failure shouldn't break the request
    return null;
  }
}

/**
 * Log agent execution
 */
async function logAgentExecution(supabase, taskSpec, route, executionResult, latencyMs, transformationMetadata: any = null) {
  try {
    // Build routing_metadata with transformation details
    const routingMetadata: any = {
      agent_slug: route.agent_slug,
      agent_name: route.agent_name,
      routing_confidence: route.confidence,
      routing_reasoning: route.reasoning || []
    };
    
    // Add transformation metadata if available
    if (transformationMetadata) {
      routingMetadata.transformation = transformationMetadata;
    }
    
    const { data: executionLog, error } = await supabase.from('agent_usage_logs').insert({
      stella_handle: taskSpec.stella_handle,
      agent_id: route.agent_id,
      user_id: taskSpec.user_id,
      task_type: taskSpec.type,
      task_description: `Agent execution: ${route.agent_name}`,
      full_context_json: taskSpec,
      input_json: {
        task_spec: taskSpec
      },
      output_json: executionResult,
      routing_metadata: routingMetadata,  // Store transformation metadata here
      success_flag: executionResult.success !== false,
      latency_ms: latencyMs,
      error_message: executionResult.error || null
    }).select('id').single();
    
    if (error) {
      console.error('Error logging agent execution:', error);
      return null;
    }
    
    return executionLog;
  } catch (error) {
    console.error('Error logging agent execution:', error);
    return null;
  }
}

// Main Edge Function Handler
Deno.serve(async (req) => {
  try {
    console.log(`Gaia router called: ${req.method} ${new URL(req.url).pathname}`);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
    };

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Get environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      return new Response(JSON.stringify({
        error: 'Missing environment variables'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Create Supabase client with service role key (bypasses RLS)
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false
      }
    });

    // Authenticate user (if Authorization header provided)
    let userId = null;
    const authHeader = req.headers.get('Authorization');
    const apiKey = req.headers.get('apikey');

    // Check if this is a service key (internal call from another edge function)
    const isServiceKey = apiKey === SUPABASE_SERVICE_ROLE_KEY || 
                        (authHeader && authHeader.includes(SUPABASE_SERVICE_ROLE_KEY));

    if (authHeader && !isServiceKey) {
      // Try to authenticate user with their token
      const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      });

      const { data: { user }, error: authError } = await anonClient.auth.getUser();
      if (!authError && user) {
        userId = user.id;
      }
    }

    // If service key is used, we'll rely on user_id in task_spec
    // No need to reject if no user auth - we'll check task_spec.user_id later

    // Parse request body
    const body = await req.json();
    const taskSpec = body.task_spec || body;
    const userPassport = body.user_passport || null;

    // Validate required fields
    if (!taskSpec.type || !taskSpec.user_id) {
      return new Response(JSON.stringify({
        error: 'Invalid task spec: type and user_id are required'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Set user_id if not provided (use authenticated user)
    if (!taskSpec.user_id && userId) {
      taskSpec.user_id = userId;
    }

    if (!taskSpec.user_id) {
      return new Response(JSON.stringify({
        error: 'user_id is required'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Set stella_handle if not provided
    if (!taskSpec.stella_handle) {
      taskSpec.stella_handle = `@user.${taskSpec.user_id.slice(0, 8)}.network`;
    }

    const startTime = Date.now();

    // Get user passport if not provided
    let passport = userPassport;
    if (!passport) {
      passport = await getUserPassport(serviceClient, taskSpec.user_id, taskSpec.stella_handle);
    }

    // Route task
    console.log(`Routing task type: ${taskSpec.type}, user_id: ${taskSpec.user_id}`);
    const routes = await routeTask(serviceClient, taskSpec, passport);

    if (routes.length === 0) {
      // Additional debugging
      const allAgentsCheck = await serviceClient.from('agents').select('slug, status').eq('status', 'ACTIVE');
      console.log('Available agents:', allAgentsCheck.data);

      const atlasCheck = await serviceClient.from('agents')
        .select(`
          *,
          agent_capabilities (
            passport_data
          )
        `)
        .eq('slug', 'atlas')
        .single();

      console.log('Atlas agent check:', atlasCheck.data);

      return new Response(JSON.stringify({
        success: false,
        routes: [],
        error: `No suitable agent found for this task type: ${taskSpec.type}`,
        debug: {
          task_type: taskSpec.type,
          available_agents: allAgentsCheck.data?.map(a => a.slug) || [],
          atlas_exists: !!atlasCheck.data,
          atlas_has_capabilities: !!atlasCheck.data?.agent_capabilities?.[0]
        }
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Execute primary agent
    const primaryRoute = routes.find(r => r.role === 'primary');
    if (!primaryRoute) {
      return new Response(JSON.stringify({
        success: false,
        routes,
        error: 'No primary agent found in routes'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const executionStartTime = Date.now();
    // Get agent capabilities for transformation
    const { data: agentCaps } = await serviceClient
      .from('agent_capabilities')
      .select('*')
      .eq('agent_id', primaryRoute.agent_id)
      .maybeSingle();
    
    const { result: executionResult, transformationMetadata } = await executeAgent(serviceClient, primaryRoute, taskSpec, agentCaps);
    const executionLatencyMs = Date.now() - executionStartTime;
    const totalLatencyMs = Date.now() - startTime;

    const result = {
      success: executionResult.success !== false,
      routes,
      execution_result: executionResult
    };

    // Log routing decision
    await logRouting(serviceClient, taskSpec, routes, result, totalLatencyMs);

    // Log agent execution (separate from routing log) with transformation metadata
    const executionLog = await logAgentExecution(serviceClient, taskSpec, primaryRoute, executionResult, executionLatencyMs, transformationMetadata);

    // Automatically trigger validation for successful executions (if validator agent exists)
    if (result.success && executionResult && primaryRoute.agent_slug !== 'validator' && executionLog?.id) {
      try {
        // Check if validator agent exists
        const { data: validatorAgent } = await serviceClient
          .from('agents')
          .select('id, slug')
          .eq('slug', 'validator')
          .eq('status', 'ACTIVE')
          .single();

        if (validatorAgent) {
          console.log(`[Gaia] Triggering validation for ${primaryRoute.agent_slug} execution`);
          
          // Call validator agent asynchronously (don't block the response)
          const validatorUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/validator-agent`;
          const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
          
          fetch(validatorUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SERVICE_KEY}`,
              'Content-Type': 'application/json',
              'apikey': SERVICE_KEY
            },
            body: JSON.stringify({
              original_task_spec: taskSpec,
              agent_output: executionResult,
              agent_slug: primaryRoute.agent_slug,
              usage_log_id: executionLog.id
            })
          }).catch(error => {
            console.error('[Gaia] Error calling validator (non-blocking):', error);
            // Don't throw - validation failure shouldn't break the request
          });
        }
      } catch (validationError) {
        console.error('[Gaia] Error triggering validation (non-blocking):', validationError);
        // Don't throw - validation failure shouldn't break the request
      }
    }

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error in Gaia router:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: errorMessage,
      ...(errorStack && { stack: errorStack }),
      debug: {
        timestamp: new Date().toISOString(),
        error_type: error instanceof Error ? error.constructor.name : typeof error
      }
    }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
});
