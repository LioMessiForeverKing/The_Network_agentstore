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
    
    // Parse request body
    const body = await request.json()
    const taskSpec: PrimeTaskSpec = body.task_spec || body
    
    // Validate required fields
    if (!taskSpec.type || !taskSpec.context?.event_details) {
      return NextResponse.json(
        { error: 'Invalid task spec: type and event_details are required' },
        { status: 400 }
      )
    }
    
    // Set user_id and stella_handle if not provided
    if (!taskSpec.user_id) {
      taskSpec.user_id = user.id
    }
    
    if (!taskSpec.stella_handle) {
      // Generate a simple handle for now (in production, get from agent_handles table)
      taskSpec.stella_handle = `@user.${user.id.slice(0, 8)}.network`
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
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error, result },
        { status: 500 }
      )
    }
    
    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Error in Prime execute route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

