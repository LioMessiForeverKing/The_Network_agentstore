import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { executePrime, PrimeTaskSpec } from '@/lib/agents/prime'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Parse request body (test form data)
    const body = await request.json()
    const {
      date,
      time,
      location,
      theme,
      max_attendees,
      title,
      description,
      auto_invite
    } = body
    
    // Validate required fields
    if (!date || !location) {
      return NextResponse.json(
        { error: 'Date and location are required' },
        { status: 400 }
      )
    }
    
    // Build task spec
    const taskSpec: PrimeTaskSpec = {
      type: 'EVENT_PLANNING',
      user_id: user.id,
      stella_handle: `@user.${user.id.slice(0, 8)}.network`,
      context: {
        event_details: {
          date,
          time: time || '19:00',
          location,
          theme: theme ? (Array.isArray(theme) ? theme : [theme]) : [],
          max_attendees: max_attendees ? parseInt(max_attendees) : 10,
          title,
          description
        },
        auto_invite: auto_invite || false,
        invite_criteria: auto_invite ? {
          location,
          interests: theme ? (Array.isArray(theme) ? theme : [theme]) : [],
          max_results: max_attendees ? parseInt(max_attendees) : 10
        } : undefined
      }
    }
    
    // Get Prime agent ID
    const { data: primeAgent } = await supabase
      .from('agents')
      .select('id')
      .eq('slug', 'prime')
      .single()
    
    if (!primeAgent) {
      return NextResponse.json(
        { error: 'Prime agent not found' },
        { status: 404 }
      )
    }
    
    // Execute Prime agent
    const result = await executePrime(supabase, taskSpec, primeAgent.id)
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 500 
    })
  } catch (error: any) {
    console.error('Error in Prime test route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

