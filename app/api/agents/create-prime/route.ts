import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // Check if Prime agent already exists
    const { data: existingAgent } = await supabase
      .from('agents')
      .select('id')
      .eq('slug', 'prime')
      .single()

    if (existingAgent) {
      return NextResponse.json(
        { message: 'Prime agent already exists', agentId: existingAgent.id },
        { status: 200 }
      )
    }

    // Insert the Prime agent
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .insert({
        name: 'Prime',
        slug: 'prime',
        description: 'The first and most powerful agent in our store. Prime is designed to handle complex tasks with exceptional performance and reliability.',
        domain: 'general',
        status: 'ACTIVE',
      })
      .select()
      .single()

    if (agentError) {
      console.error('Error creating Prime agent:', agentError)
      return NextResponse.json(
        { error: 'Failed to create Prime agent', details: agentError.message },
        { status: 500 }
      )
    }

    // Note: agent_passports table has a different structure (user_id, handle_id, dna_id, passport_d)
    // So we're not creating a passport here. The app will handle missing passports gracefully.

    return NextResponse.json(
      {
        message: 'Prime agent created successfully',
        agent,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

