import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

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
    const taskSpec = body.task_spec || body
    const userPassport = body.user_passport || null
    
    // Validate required fields
    if (!taskSpec.type || !taskSpec.user_id) {
      return NextResponse.json(
        { error: 'Invalid task spec: type and user_id are required' },
        { status: 400 }
      )
    }
    
    // Set user_id if not provided
    if (!taskSpec.user_id) {
      taskSpec.user_id = user.id
    }
    
    // Set stella_handle if not provided
    if (!taskSpec.stella_handle) {
      taskSpec.stella_handle = `@user.${user.id.slice(0, 8)}.network`
    }
    
    // Call Gaia router edge function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const response = await fetch(
      `${supabaseUrl}/functions/v1/gaia-router`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          task_spec: taskSpec,
          user_passport: userPassport
        })
      }
    )
    
    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: 'Gaia router failed', details: error },
        { status: response.status }
      )
    }
    
    const result = await response.json()
    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Error in Gaia route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

