import { SupabaseClient } from '@supabase/supabase-js'
import { findNetworkMatchesEnhanced, generateInviteMessage, extractEventDetailsFromText } from './prime-nlp'

export interface PrimeTaskSpec {
  type: 'EVENT_PLANNING' | 'EVENT_UPDATE' | 'EVENT_DELETE'
  user_id: string
  stella_handle: string
  context: {
    event_details: {
      date: string // ISO8601
      time?: string
      location: string
      theme?: string[]
      max_attendees?: number
      title?: string
      description?: string
    }
    auto_invite?: boolean
    invite_criteria?: {
      location?: string
      interests?: string[]
      max_results?: number
    }
  }
}

export interface PrimeResult {
  success: boolean
  event?: {
    id: string
    title: string
    date: string
    location: string
  }
  invites?: {
    sent: number
    matches_found: number
    details: Array<{
      user_id: string
      name: string
      compatibility_score?: number
    }>
  }
  error?: string
}

/**
 * Get week start (Monday) for a given date
 */
function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().split('T')[0]
}

/**
 * Create an event in the database
 */
export async function createEvent(
  supabase: SupabaseClient,
  taskSpec: PrimeTaskSpec
): Promise<{ id: string; title: string; date: string; location: string } | null> {
  try {
    const { event_details } = taskSpec.context
    
    // Parse date and time
    const dateStr = event_details.date
    const timeStr = event_details.time || '19:00'
    
    // Combine date and time into ISO8601
    let startDate: Date
    if (dateStr.includes('T')) {
      // Already ISO8601
      startDate = new Date(dateStr)
    } else {
      // Date only, add time
      const [hours, minutes] = timeStr.split(':').map(Number)
      startDate = new Date(dateStr)
      startDate.setHours(hours || 19, minutes || 0, 0, 0)
    }
    
    const endDate = new Date(startDate)
    endDate.setHours(endDate.getHours() + 3) // Default 3 hour event
    
    const weekStart = getWeekStart(startDate)
    
    // Generate event title if not provided
    const eventTitle = event_details.title || 
      `${event_details.theme?.join(' & ') || 'Networking'} Event`
    
    const eventName = event_details.description || eventTitle
    
    // Create event
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
      .single()
    
    if (error) {
      console.error('Error creating event:', error)
      return null
    }
    
    return {
      id: event.id,
      title: event.event_title || eventTitle,
      date: startDate.toISOString(),
      location: event.location
    }
  } catch (error) {
    console.error('Error in createEvent:', error)
    return null
  }
}

/**
 * Find network matches for event invites
 * Simplified version: location + interests matching
 */
export async function findNetworkMatches(
  supabase: SupabaseClient,
  taskSpec: PrimeTaskSpec,
  eventId: string
): Promise<Array<{ user_id: string; name: string; compatibility_score?: number }>> {
  try {
    const { invite_criteria, event_details } = taskSpec.context
    
    if (!invite_criteria && !taskSpec.context.auto_invite) {
      return []
    }
    
    const location = invite_criteria?.location || event_details.location
    const interests = invite_criteria?.interests || event_details.theme || []
    const maxResults = invite_criteria?.max_results || event_details.max_attendees || 10
    
    // Build query
    let query = supabase
      .from('profiles')
      .select('id, full_name, location, interests')
      .neq('id', taskSpec.user_id) // Exclude event host
    
    // Filter by location if provided
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }
    
    // Filter by interests if provided
    if (interests.length > 0) {
      query = query.overlaps('interests', interests)
    }
    
    // Limit results
    query = query.limit(maxResults)
    
    const { data: profiles, error } = await query
    
    if (error) {
      // If profiles table doesn't exist, return empty matches (graceful degradation)
      if (error.code === '42P01') {
        console.warn('Profiles table not found - network matching disabled')
        return []
      }
      console.error('Error finding network matches:', error)
      return []
    }
    
    if (!profiles) {
      return []
    }
    
    // Map to result format
    return profiles.map(profile => ({
      user_id: profile.id,
      name: profile.full_name || 'Unknown',
      compatibility_score: 0.5 // Placeholder - would calculate from vectors in full version
    }))
  } catch (error) {
    console.error('Error in findNetworkMatches:', error)
    return []
  }
}

/**
 * Create invite records for matched users
 */
export async function createInvites(
  supabase: SupabaseClient,
  eventId: string,
  matches: Array<{ user_id: string; name: string }>
): Promise<number> {
  try {
    if (matches.length === 0) {
      return 0
    }
    
    // Check current capacity
    const { data: event } = await supabase
      .from('user_weekly_activities')
      .select('max_capacity')
      .eq('id', eventId)
      .single()
    
    if (!event) {
      return 0
    }
    
    // Check current attendee count
    const { count: currentCount } = await supabase
      .from('event_attendees')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .in('status', ['pending', 'confirmed', 'maybe'])
    
    const availableSlots = (event.max_capacity || 50) - (currentCount || 0)
    const invitesToCreate = Math.min(matches.length, availableSlots)
    
    if (invitesToCreate <= 0) {
      return 0
    }
    
    // Create invites
    const invites = matches.slice(0, invitesToCreate).map(match => ({
      event_id: eventId,
      user_id: match.user_id,
      status: 'pending' as const
    }))
    
    const { error } = await supabase
      .from('event_attendees')
      .insert(invites)
    
    if (error) {
      console.error('Error creating invites:', error)
      return 0
    }
    
    return invitesToCreate
  } catch (error) {
    console.error('Error in createInvites:', error)
    return 0
  }
}

/**
 * Log Prime agent execution to agent_usage_logs
 */
export async function logExecution(
  supabase: SupabaseClient,
  taskSpec: PrimeTaskSpec,
  result: PrimeResult,
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
      })
  } catch (error) {
    console.error('Error logging execution:', error)
    // Don't throw - logging failure shouldn't break the request
  }
}

/**
 * Main Prime agent execution function
 */
export async function executePrime(
  supabase: SupabaseClient,
  taskSpec: PrimeTaskSpec,
  agentId: string
): Promise<PrimeResult> {
  const startTime = Date.now()
  const taskSteps: string[] = []
  
  try {
    // Validate input
    if (!taskSpec.context.event_details.date || !taskSpec.context.event_details.location) {
      return {
        success: false,
        error: 'Missing required fields: date and location are required'
      }
    }
    
    // Step 1: Create event
    taskSteps.push('creating_event')
    const event = await createEvent(supabase, taskSpec)
    
    if (!event) {
      return {
        success: false,
        error: 'Failed to create event'
      }
    }
    
    // Step 2: Find network matches (if auto_invite enabled) - Using enhanced matching
    let matches: Array<{ user_id: string; name: string; compatibility_score?: number }> = []
    let invitesSent = 0
    
    if (taskSpec.context.auto_invite || taskSpec.context.invite_criteria) {
      taskSteps.push('finding_network_matches_enhanced')
      matches = await findNetworkMatchesEnhanced(supabase, taskSpec, event.id)
      taskSteps.push(`found_${matches.length}_matches`)
      
      if (matches.length > 0) {
        taskSteps.push('creating_invites')
        invitesSent = await createInvites(supabase, event.id, matches)
        taskSteps.push(`sent_${invitesSent}_invites`)
      }
    }
    
    const latencyMs = Date.now() - startTime
    
    const result: PrimeResult = {
      success: true,
      event,
      invites: {
        sent: invitesSent,
        matches_found: matches.length,
        details: matches.slice(0, invitesSent)
      }
    }
    
    // Log execution
    await logExecution(supabase, taskSpec, result, latencyMs, agentId, taskSteps)
    
    return result
  } catch (error: any) {
    const latencyMs = Date.now() - startTime
    
    const errorResult: PrimeResult = {
      success: false,
      error: error.message || 'Unknown error occurred'
    }
    
    // Log error
    await logExecution(supabase, taskSpec, errorResult, latencyMs, agentId, taskSteps)
    
    return errorResult
  }
}

