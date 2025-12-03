// Supabase Edge Function: validator-agent
// Validator Agent - Evaluates and scores agent outputs for quality assurance
// - Uses LLM to evaluate agent outputs against original task specs
// - Returns validation scores, labels, and error types
// - Supports custom rubrics for evaluation

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Validate agent output using LLM
 */
async function validateOutput(
  originalTaskSpec: any,
  agentOutput: any,
  agentSlug: string,
  rubric?: any
): Promise<{
  score: number;
  label: 'PASS' | 'FAIL' | 'NEEDS_REVIEW';
  error_type: 'HALLUCINATION' | 'MISSING_FIELD' | 'BAD_FORMAT' | 'OFF_POLICY' | 'OTHER' | 'NONE';
  explanation: string;
}> {
  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Build validation prompt
    const taskType = originalTaskSpec.type || 'UNKNOWN';
    const taskContext = JSON.stringify(originalTaskSpec.context || {}, null, 2);
    const outputStr = JSON.stringify(agentOutput, null, 2);

    let validationPrompt = `You are a quality assurance validator for AI agent outputs. Evaluate the agent's output against the original task specification.

TASK TYPE: ${taskType}
AGENT: ${agentSlug}

ORIGINAL TASK SPECIFICATION:
${JSON.stringify(originalTaskSpec, null, 2)}

AGENT OUTPUT:
${outputStr}`;

    if (rubric) {
      validationPrompt += `\n\nCUSTOM RUBRIC:\n${JSON.stringify(rubric, null, 2)}`;
    }

    validationPrompt += `\n\nEvaluate the output and respond with a JSON object containing:
{
  "score": <number between 0 and 1, where 1 is perfect>,
  "label": <"PASS" | "FAIL" | "NEEDS_REVIEW">,
  "error_type": <"HALLUCINATION" | "MISSING_FIELD" | "BAD_FORMAT" | "OFF_POLICY" | "OTHER" | "NONE">,
  "explanation": <detailed explanation of your evaluation>
}

Criteria:
- PASS: Output is correct, complete, and matches the task spec (score >= 0.8)
- FAIL: Output is incorrect, incomplete, or violates policy (score < 0.5)
- NEEDS_REVIEW: Output is partially correct but needs human review (0.5 <= score < 0.8)
- HALLUCINATION: Agent made up information not in the task spec
- MISSING_FIELD: Required fields are missing from the output
- BAD_FORMAT: Output format doesn't match expected schema
- OFF_POLICY: Output violates system policies or constraints
- OTHER: Other types of errors
- NONE: No errors detected

Respond ONLY with valid JSON, no other text.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a quality assurance validator. Evaluate agent outputs objectively and return only valid JSON.'
          },
          {
            role: 'user',
            content: validationPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3, // Lower temperature for more consistent evaluations
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    let validationResult;
    try {
      validationResult = JSON.parse(content);
    } catch (e) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        validationResult = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse validation response as JSON');
      }
    }

    // Validate and normalize response
    const score = Math.max(0, Math.min(1, parseFloat(validationResult.score) || 0.5));
    const label = ['PASS', 'FAIL', 'NEEDS_REVIEW'].includes(validationResult.label)
      ? validationResult.label
      : (score >= 0.8 ? 'PASS' : score < 0.5 ? 'FAIL' : 'NEEDS_REVIEW');
    const errorType = ['HALLUCINATION', 'MISSING_FIELD', 'BAD_FORMAT', 'OFF_POLICY', 'OTHER', 'NONE'].includes(validationResult.error_type)
      ? validationResult.error_type
      : (score >= 0.8 ? 'NONE' : 'OTHER');
    const explanation = validationResult.explanation || 'No explanation provided';

    return {
      score,
      label: label as 'PASS' | 'FAIL' | 'NEEDS_REVIEW',
      error_type: errorType as 'HALLUCINATION' | 'MISSING_FIELD' | 'BAD_FORMAT' | 'OFF_POLICY' | 'OTHER' | 'NONE',
      explanation
    };
  } catch (error) {
    console.error('Error validating output:', error);
    // Return a conservative validation result on error
    return {
      score: 0.5,
      label: 'NEEDS_REVIEW',
      error_type: 'OTHER',
      explanation: `Validation error: ${error.message || 'Unknown error'}`
    };
  }
}

// Main Edge Function Handler
Deno.serve(async (req) => {
  try {
    console.log(`Validator agent called: ${req.method} ${new URL(req.url).pathname}`);

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

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing environment variables'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Create Supabase client with service role key
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false
      }
    });

    // Parse request body
    const body = await req.json();
    const {
      original_task_spec,
      agent_output,
      agent_slug,
      usage_log_id,
      rubric
    } = body;

    console.log('[Validator] Request received:', {
      has_original_task_spec: !!original_task_spec,
      has_agent_output: !!agent_output,
      agent_slug,
      usage_log_id,
      body_keys: Object.keys(body)
    });

    // Validate required fields
    if (!original_task_spec || !agent_output || !agent_slug) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: original_task_spec, agent_output, and agent_slug are required'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Get validator agent ID
    const { data: validatorAgent, error: agentError } = await serviceClient
      .from('agents')
      .select('id')
      .eq('slug', 'validator')
      .single();

    if (agentError || !validatorAgent) {
      console.error('Error fetching validator agent:', agentError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Validator agent not found in database'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Perform validation
    const validationResult = await validateOutput(
      original_task_spec,
      agent_output,
      agent_slug,
      rubric
    );

    // Store validation event if usage_log_id is provided
    let storageSuccess = false;
    let storageError: any = null;
    
    if (usage_log_id) {
      try {
        console.log(`[Validator] Storing validation event for usage_log_id: ${usage_log_id}`);
        console.log(`[Validator] Validation result:`, {
          score: validationResult.score,
          label: validationResult.label,
          error_type: validationResult.error_type,
          validator_agent_id: validatorAgent.id
        });
        
        // Verify usage_log_id exists
        const { data: usageLogCheck, error: usageLogError } = await serviceClient
          .from('agent_usage_logs')
          .select('id, agent_id')
          .eq('id', usage_log_id)
          .single();
        
        if (usageLogError || !usageLogCheck) {
          console.error('[Validator] Usage log not found:', {
            usage_log_id,
            error: usageLogError,
            message: 'Cannot store validation event without valid usage_log_id'
          });
          storageError = { type: 'usage_log_not_found', error: usageLogError };
        } else {
          console.log('[Validator] Usage log verified:', {
            usage_log_id: usageLogCheck.id,
            agent_id: usageLogCheck.agent_id
          });
          
          const { data: validationEvent, error: insertError } = await serviceClient
            .from('agent_validation_events')
            .insert({
              usage_log_id,
              validator_agent_id: validatorAgent.id,
              score: validationResult.score,
              label: validationResult.label,
              error_type: validationResult.error_type,
              explanation: validationResult.explanation,
              is_human: false
            })
            .select('id, usage_log_id, created_at, score, label')
            .single();

          if (insertError) {
            console.error('[Validator] ❌ Error storing validation event:', insertError);
            console.error('[Validator] Insert error details:', JSON.stringify(insertError, null, 2));
            console.error('[Validator] Insert payload was:', {
              usage_log_id,
              validator_agent_id: validatorAgent.id,
              score: validationResult.score,
              label: validationResult.label,
              error_type: validationResult.error_type
            });
            storageError = { type: 'insert_error', error: insertError };
          } else {
            console.log(`[Validator] ✅ Validation event stored successfully:`, {
              id: validationEvent.id,
              usage_log_id: validationEvent.usage_log_id,
              score: validationEvent.score,
              label: validationEvent.label,
              created_at: validationEvent.created_at
            });
            console.log(`[Validator] Learning system will update agent capabilities automatically via trigger`);
            storageSuccess = true;
          }
        }
      } catch (error) {
        console.error('[Validator] Exception storing validation event:', error);
        console.error('[Validator] Exception details:', error instanceof Error ? error.stack : String(error));
        storageError = { type: 'exception', error: error instanceof Error ? error.message : String(error) };
      }
    } else {
      console.warn('[Validator] No usage_log_id provided, skipping validation event storage');
    }

    // Return response with validation result
    // Include storage status so caller knows if it was stored
    return new Response(JSON.stringify({
      success: true,
      validation: validationResult,
      storage: {
        attempted: !!usage_log_id,
        success: storageSuccess,
        error: storageError
      }
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error('[Validator] Error in validator agent:', error);
    console.error('[Validator] Error stack:', error instanceof Error ? error.stack : String(error));
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error',
      details: error instanceof Error ? error.stack : String(error)
    }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
});

