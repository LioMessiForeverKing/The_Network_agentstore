// Supabase Edge Function: prime-agent
// - Event planning specialist agent
// - Creates events, finds network matches, sends invites
// - Uses structured logic primarily, with optional AI enhancements

// Supabase Edge Function: prime-agent
// - Event planning specialist agent
// - Creates events, finds network matches, sends invites
// - Uses structured logic + enhanced pattern recognition & NLP

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Get week start (Monday) for a given date
 */
function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

/**
 * Create an event in the database
 */
async function createEvent(
  supabase: any,
  taskSpec: any
): Promise<{ id: string; title: string; date: string; location: string } | null> {
  console.log('createEvent called with user_id:', taskSpec.user_id);
  try {
    const { event_details } = taskSpec.context;
    
    // Parse date and time
    const dateStr = event_details.date;
    const timeStr = event_details.time || '19:00';
    
    // Combine date and time into ISO8601
    let startDate: Date;
    if (dateStr.includes('T')) {
      // Already ISO8601
      startDate = new Date(dateStr);
    } else {
      // Date only, add time
      const [hours, minutes] = timeStr.split(':').map(Number);
      startDate = new Date(dateStr);
      startDate.setHours(hours || 19, minutes || 0, 0, 0);
    }
    
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 3); // Default 3 hour event
    
    const weekStart = getWeekStart(startDate);
    
    // Generate event title if not provided
    const eventTitle = event_details.title || 
      `${event_details.theme?.join(' & ') || 'Networking'} Event`;
    
    const eventName = event_details.description || eventTitle;
    
    // Create event
    console.log('Creating event with data:', {
      user_id: taskSpec.user_id,
      location: event_details.location,
      start_date: startDate.toISOString(),
      week_start: weekStart
    });
    
    const { data: event, error } = await supabase
      .from('user_weekly_activities')
      .insert({
        user_id: taskSpec.user_id,
        activity_description: eventName,
        event_name: eventTitle,
        event_title: eventTitle,
        location: event_details.location,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        week_start: weekStart,
        tags: event_details.theme || [],
        is_hosting: true,
        max_capacity: event_details.max_attendees || 10,
        metadata: {
          created_by: 'prime-agent',
          auto_invited: taskSpec.context.auto_invite || false,
          theme: event_details.theme || []
        }
      })
      .select()
      .single();
    
    if (error) {
      // Log comprehensive error details
      const errorDetails = {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        full_error: error
      };
      console.error('=== EVENT CREATION ERROR ===');
      console.error('Error details:', JSON.stringify(errorDetails, null, 2));
      console.error('Event data attempted:', JSON.stringify({
        user_id: taskSpec.user_id,
        activity_description: eventName,
        event_name: eventTitle,
        event_title: eventTitle,
        location: event_details.location,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        week_start: weekStart,
        tags: event_details.theme || [],
        is_hosting: true,
        max_capacity: event_details.max_attendees || 10
      }, null, 2));
      console.error('=== END ERROR ===');
      
      // Return error details in a way that can be logged
      throw new Error(`Database error: ${error.code} - ${error.message}${error.hint ? ` (${error.hint})` : ''}`);
    }
    
    console.log('Event created successfully:', event.id);
    
    return {
      id: event.id,
      title: event.event_title || eventTitle,
      date: startDate.toISOString(),
      location: event.location
    };
  } catch (error: any) {
    console.error('=== EXCEPTION IN createEvent ===');
    console.error('Error:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('=== END EXCEPTION ===');
    throw error; // Re-throw to get better error messages
  }
}

/**
 * Find network matches for event invites
 * Simplified version: location + interests matching
 */
async function findNetworkMatches(
  supabase: any,
  taskSpec: any,
  eventId: string
): Promise<Array<{ user_id: string; name: string; compatibility_score?: number }>> {
  try {
    const { invite_criteria, event_details } = taskSpec.context;
    
    if (!invite_criteria && !taskSpec.context.auto_invite) {
      return [];
    }
    
    const location = invite_criteria?.location || event_details.location;
    const interests = invite_criteria?.interests || event_details.theme || [];
    const maxResults = invite_criteria?.max_results || event_details.max_attendees || 10;
    
    // Build query
    let query = supabase
      .from('profiles')
      .select('id, full_name, location, interests')
      .neq('id', taskSpec.user_id); // Exclude event host
    
    // Filter by location if provided
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    
    // Filter by interests if provided
    if (interests.length > 0) {
      query = query.overlaps('interests', interests);
    }
    
    // Limit results
    query = query.limit(maxResults);
    
    const { data: profiles, error } = await query;
    
    if (error) {
      // If profiles table doesn't exist, return empty matches (graceful degradation)
      if (error.code === '42P01') {
        console.warn('Profiles table not found - network matching disabled');
        return [];
      }
      console.error('Error finding network matches:', error);
      return [];
    }
    
    if (!profiles) {
      return [];
    }
    
    // Map to result format
    return profiles.map((profile: any) => ({
      user_id: profile.id,
      name: profile.full_name || 'Unknown',
      compatibility_score: 0.5 // Placeholder - would calculate from vectors in full version
    }));
  } catch (error) {
    console.error('Error in findNetworkMatches:', error);
    return [];
  }
}

/**
 * Create invite records for matched users
 * IMPORTANT: Excludes the event host from being added to event_attendees
 */
async function createInvites(
  supabase: any,
  eventId: string,
  matches: Array<{ user_id: string; name: string }>,
  hostUserId: string
): Promise<number> {
  try {
    if (matches.length === 0) {
      return 0;
    }
    
    // Check current capacity and get event host
    const { data: event } = await supabase
      .from('user_weekly_activities')
      .select('max_capacity, user_id')
      .eq('id', eventId)
      .single();
    
    if (!event) {
      return 0;
    }
    
    // Get the actual host user_id from the event (in case it differs from parameter)
    const actualHostId = event.user_id || hostUserId;
    
    // Filter out the host from matches - host should NEVER be in event_attendees
    const nonHostMatches = matches.filter(match => match.user_id !== actualHostId);
    
    if (nonHostMatches.length === 0) {
      console.log('All matches were the host - no invites to create');
      return 0;
    }
    
    // Check current attendee count (excluding host)
    const { count: currentCount } = await supabase
      .from('event_attendees')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .neq('user_id', actualHostId) // Exclude host from count
      .in('status', ['pending', 'confirmed', 'maybe']);
    
    const availableSlots = (event.max_capacity || 50) - (currentCount || 0);
    const invitesToCreate = Math.min(nonHostMatches.length, availableSlots);
    
    if (invitesToCreate <= 0) {
      return 0;
    }
    
    // Create invites (host already excluded)
    const invites = nonHostMatches.slice(0, invitesToCreate).map(match => ({
      event_id: eventId,
      user_id: match.user_id,
      status: 'pending'
    }));
    
    const { error } = await supabase
      .from('event_attendees')
      .insert(invites);
    
    if (error) {
      console.error('Error creating invites:', error);
      return 0;
    }
    
    return invitesToCreate;
  } catch (error) {
    console.error('Error in createInvites:', error);
    return 0;
  }
}

/**
 * Find user by name in network (connections)
 */
async function findUserByName(
  supabase: any,
  userName: string,
  hostUserId: string
): Promise<{ user_id: string; name: string } | null> {
  try {
    // Get user's connections
    const { data: connections, error: connError } = await supabase
      .from('user_connections')
      .select('sender_id, receiver_id')
      .or(`sender_id.eq.${hostUserId},receiver_id.eq.${hostUserId}`)
      .eq('status', 'accepted');
    
    // If connections table doesn't exist or no connections, try searching all profiles
    if (connError) {
      if (connError.code === '42P01') {
        console.warn('user_connections table not found - searching all profiles');
        // Fallback: search all profiles (not ideal, but works)
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .neq('id', hostUserId)
          .ilike('full_name', `%${userName}%`)
          .limit(1);
        
        if (profileError || !profiles || profiles.length === 0) {
          return null;
        }
        
        return {
          user_id: profiles[0].id,
          name: profiles[0].full_name || userName
        };
      }
      return null;
    }
    
    if (!connections || connections.length === 0) {
      return null;
    }
    
    // Extract connected user IDs
    const connectedUserIds = connections.map((conn: any) =>
      conn.sender_id === hostUserId ? conn.receiver_id : conn.sender_id
    );
    
    if (connectedUserIds.length === 0) {
      return null;
    }
    
    // Search profiles for matching name
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', connectedUserIds)
      .ilike('full_name', `%${userName}%`);
    
    if (profileError || !profiles || profiles.length === 0) {
      return null;
    }
    
    // Return first match (or handle multiple matches if needed)
    const match = profiles[0];
    return {
      user_id: match.id,
      name: match.full_name || userName
    };
  } catch (error) {
    console.error('Error in findUserByName:', error);
    return null;
  }
}

/**
 * Invite specific person to event
 */
async function invitePersonToEvent(
  supabase: any,
  eventId: string,
  userName: string,
  hostUserId: string
): Promise<{ success: boolean; invited?: { user_id: string; name: string }; error?: string }> {
  try {
    // Find user by name
    const user = await findUserByName(supabase, userName, hostUserId);
    
    if (!user) {
      return {
        success: false,
        error: `Could not find "${userName}" in your network. Make sure you're connected with them first!`
      };
    }
    
    // Check if already invited
    const { data: existing } = await supabase
      .from('event_attendees')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.user_id)
      .maybeSingle();
    
    if (existing) {
      return {
        success: false,
        error: `${user.name} is already invited to this event.`
      };
    }
    
    // Check capacity
    const { data: event } = await supabase
      .from('user_weekly_activities')
      .select('max_capacity, user_id')
      .eq('id', eventId)
      .single();
    
    if (!event) {
      return {
        success: false,
        error: 'Event not found'
      };
    }
    
    // Ensure we're not inviting the host
    if (user.user_id === event.user_id) {
      return {
        success: false,
        error: 'You are the host of this event. You don\'t need to invite yourself!'
      };
    }
    
    // Check current attendee count
    const { count: currentCount } = await supabase
      .from('event_attendees')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .neq('user_id', event.user_id) // Exclude host
      .in('status', ['pending', 'confirmed', 'maybe']);
    
    if (currentCount >= (event.max_capacity || 50)) {
      return {
        success: false,
        error: 'Event is at capacity. Cannot invite more people.'
      };
    }
    
    // Create invite
    const { error: inviteError } = await supabase
      .from('event_attendees')
      .insert({
        event_id: eventId,
        user_id: user.user_id,
        status: 'pending'
      });
    
    if (inviteError) {
      console.error('Error creating invite:', inviteError);
      return {
        success: false,
        error: 'Failed to create invite'
      };
    }
    
    return {
      success: true,
      invited: user
    };
  } catch (error: any) {
    console.error('Error in invitePersonToEvent:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}

/**
 * Edit an existing event
 */
async function editEvent(
  supabase: any,
  eventId: string,
  updates: {
    title?: string;
    location?: string;
    date?: string;
    time?: string;
    max_attendees?: number;
    theme?: string[];
    description?: string;
  },
  hostUserId: string
): Promise<{ success: boolean; event?: any; error?: string }> {
  try {
    // Verify user is the host
    const { data: event, error: eventError } = await supabase
      .from('user_weekly_activities')
      .select('id, user_id, start_date')
      .eq('id', eventId)
      .single();
    
    if (eventError || !event) {
      return {
        success: false,
        error: 'Event not found'
      };
    }
    
    if (event.user_id !== hostUserId) {
      return {
        success: false,
        error: 'Only the event host can edit this event'
      };
    }
    
    // Build update object
    const updateData: any = {};
    
    if (updates.title) {
      updateData.event_title = updates.title;
      updateData.event_name = updates.title;
    }
    
    if (updates.description) {
      updateData.activity_description = updates.description;
    }
    
    if (updates.location) {
      updateData.location = updates.location;
    }
    
    if (updates.max_attendees) {
      updateData.max_capacity = updates.max_attendees;
    }
    
    if (updates.theme) {
      updateData.tags = updates.theme;
    }
    
    // Handle date/time updates
    if (updates.date || updates.time) {
      let startDate: Date;
      
      if (updates.date) {
        // Parse new date
        const dateStr = updates.date;
        const timeStr = updates.time || '19:00';
        
        if (dateStr.includes('T')) {
          startDate = new Date(dateStr);
        } else {
          const [hours, minutes] = timeStr.split(':').map(Number);
          startDate = new Date(dateStr);
          startDate.setHours(hours || 19, minutes || 0, 0, 0);
        }
      } else {
        // Keep existing date, update time only
        startDate = new Date(event.start_date);
        if (updates.time) {
          const [hours, minutes] = updates.time.split(':').map(Number);
          startDate.setHours(hours || 19, minutes || 0, 0, 0);
        }
      }
      
      updateData.start_date = startDate.toISOString();
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 3);
      updateData.end_date = endDate.toISOString();
      updateData.week_start = getWeekStart(startDate);
    }
    
    // Update event
    const { data: updatedEvent, error: updateError } = await supabase
      .from('user_weekly_activities')
      .update(updateData)
      .eq('id', eventId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating event:', updateError);
      return {
        success: false,
        error: 'Failed to update event'
      };
    }
    
    return {
      success: true,
      event: updatedEvent
    };
  } catch (error: any) {
    console.error('Error in editEvent:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}

/**
 * Log Prime agent execution to agent_usage_logs
 */
async function logExecution(
  supabase: any,
  taskSpec: any,
  result: any,
  latencyMs: number,
  agentId: string,
  taskSteps?: string[]
): Promise<void> {
  try {
    await supabase
      .from('agent_usage_logs')
      .insert({
        stella_handle: taskSpec.stella_handle,
        agent_id: agentId,
        user_id: taskSpec.user_id,
        task_type: taskSpec.type,
        task_description: `Prime ${taskSpec.type.toLowerCase()}`,
        full_context_json: taskSpec,
        input_json: taskSpec,
        output_json: result,
        resulting_event_id: result.event?.id || null,
        success_flag: result.success,
        latency_ms: latencyMs,
        task_steps: taskSteps || [],
        error_message: result.error || null
      });
  } catch (error) {
    console.error('Error logging execution:', error);
    // Don't throw - logging failure shouldn't break the request
  }
}

/**
 * Main Prime agent execution function
 * Handles: EVENT_PLANNING (create), EVENT_EDIT (edit), EVENT_INVITE (invite specific person)
 */
async function executePrime(
  supabase: any,
  taskSpec: any,
  agentId: string
): Promise<any> {
  console.log('executePrime called with:', {
    task_type: taskSpec.type,
    user_id: taskSpec.user_id,
    has_event_details: !!taskSpec.context?.event_details,
    action: taskSpec.context?.action // 'create', 'edit', 'invite'
  });
  const startTime = Date.now();
  const taskSteps: string[] = [];
  
  try {
    const action = taskSpec.context?.action || 'create'; // Default to create
    
    // Handle different actions
    if (action === 'invite' && taskSpec.context?.invite_person) {
      // Invite specific person to event
      const { event_id, invite_person } = taskSpec.context;
      
      if (!event_id) {
        return {
          success: false,
          error: 'Event ID is required for inviting'
        };
      }
      
      if (!invite_person) {
        return {
          success: false,
          error: 'Person name is required for inviting'
        };
      }
      
      taskSteps.push('inviting_person');
      const inviteResult = await invitePersonToEvent(
        supabase,
        event_id,
        invite_person,
        taskSpec.user_id
      );
      
      const latencyMs = Date.now() - startTime;
      const result = {
        success: inviteResult.success,
        invite: inviteResult.invited || null,
        error: inviteResult.error || null
      };
      
      await logExecution(supabase, taskSpec, result, latencyMs, agentId, taskSteps);
      return result;
    }
    
    if (action === 'edit' && taskSpec.context?.event_id) {
      // Edit existing event
      const { event_id, event_updates } = taskSpec.context;
      
      if (!event_id) {
        return {
          success: false,
          error: 'Event ID is required for editing'
        };
      }
      
      taskSteps.push('editing_event');
      const editResult = await editEvent(
        supabase,
        event_id,
        event_updates || {},
        taskSpec.user_id
      );
      
      const latencyMs = Date.now() - startTime;
      const result = {
        success: editResult.success,
        event: editResult.event || null,
        error: editResult.error || null
      };
      
      await logExecution(supabase, taskSpec, result, latencyMs, agentId, taskSteps);
      return result;
    }
    
    // Default: Create event
    // Validate input
    if (!taskSpec.context.event_details.date || !taskSpec.context.event_details.location) {
      return {
        success: false,
        error: 'Missing required fields: date and location are required'
      };
    }
    
    // Step 1: Create event
    taskSteps.push('creating_event');
    const event = await createEvent(supabase, taskSpec);
    
    if (!event) {
      console.error('createEvent returned null - this should not happen if error was thrown');
      return {
        success: false,
        error: 'Failed to create event (no event returned)'
      };
    }
    
    // Step 2: Find network matches (if auto_invite enabled)
    let matches: Array<{ user_id: string; name: string; compatibility_score?: number }> = [];
    let invitesSent = 0;
    
    if (taskSpec.context.auto_invite || taskSpec.context.invite_criteria) {
      taskSteps.push('finding_network_matches');
      matches = await findNetworkMatches(supabase, taskSpec, event.id);
      taskSteps.push(`found_${matches.length}_matches`);
      
      if (matches.length > 0) {
        taskSteps.push('creating_invites');
        invitesSent = await createInvites(supabase, event.id, matches, taskSpec.user_id);
        taskSteps.push(`sent_${invitesSent}_invites`);
      }
    }
    
    const latencyMs = Date.now() - startTime;
    
    const result = {
      success: true,
      event,
      invites: {
        sent: invitesSent,
        matches_found: matches.length,
        details: matches.slice(0, invitesSent)
      }
    };
    
    // Log execution
    await logExecution(supabase, taskSpec, result, latencyMs, agentId, taskSteps);
    
    return result;
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    
    const errorResult = {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
    
    // Log error
    await logExecution(supabase, taskSpec, errorResult, latencyMs, agentId, taskSteps);
    
    return errorResult;
  }
}

// Main Edge Function Handler
Deno.serve(async (req) => {
  try {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      return new Response(
        JSON.stringify({ error: 'Missing environment variables' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create Supabase clients with service role key (bypasses RLS)
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false
      }
    });
    
    // Authenticate user (if Authorization header provided)
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    const apiKey = req.headers.get('apikey');
    
    // Check if this is a service key (internal call from Gaia router)
    const isServiceKey = apiKey === SUPABASE_SERVICE_ROLE_KEY || 
                        (authHeader && authHeader.replace('Bearer ', '') === SUPABASE_SERVICE_ROLE_KEY);
    
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

    // Validate required fields
    if (!taskSpec.type || !taskSpec.context?.event_details) {
      return new Response(
        JSON.stringify({ error: 'Invalid task spec: type and event_details are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Set user_id if not provided (use authenticated user)
    if (!taskSpec.user_id && userId) {
      taskSpec.user_id = userId;
    }

    if (!taskSpec.user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Set stella_handle if not provided
    if (!taskSpec.stella_handle) {
      taskSpec.stella_handle = `@user.${taskSpec.user_id.slice(0, 8)}.network`;
    }

    // Get Prime agent ID
    const { data: primeAgent, error: agentError } = await serviceClient
      .from('agents')
      .select('id')
      .eq('slug', 'prime')
      .single();

    if (agentError || !primeAgent) {
      return new Response(
        JSON.stringify({ error: 'Prime agent not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Execute Prime agent
    console.log('Executing Prime with taskSpec:', JSON.stringify({
      type: taskSpec.type,
      user_id: taskSpec.user_id,
      stella_handle: taskSpec.stella_handle,
      has_event_details: !!taskSpec.context?.event_details
    }, null, 2));
    
    const result = await executePrime(serviceClient, taskSpec, primeAgent.id);
    
    console.log('Prime execution result:', JSON.stringify({
      success: result.success,
      has_event: !!result.event,
      error: result.error
    }, null, 2));

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Error in Prime edge function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});

