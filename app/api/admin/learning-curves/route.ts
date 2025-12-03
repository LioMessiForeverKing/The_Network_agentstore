import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agent_id')
    const days = parseInt(searchParams.get('days') || '30')

    // Build query for validation history
    let query = supabase
      .from('agent_validation_history')
      .select(`
        id,
        agent_id,
        reward,
        success_rate_before,
        success_rate_after,
        learning_rate,
        created_at,
        validation_event_id,
        agents(
          id,
          name,
          slug
        )
      `)
      .order('created_at', { ascending: true })

    // Filter by agent if provided
    if (agentId) {
      query = query.eq('agent_id', agentId)
    }

    // Filter by date range
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    query = query.gte('created_at', cutoffDate.toISOString())

    const { data: history, error } = await query

    if (error) {
      console.error('Error fetching learning history:', error)
      return NextResponse.json(
        { error: 'Failed to fetch learning history' },
        { status: 500 }
      )
    }

    // Also get current agent capabilities for comparison
    let capabilitiesQuery = supabase
      .from('agent_capabilities')
      .select(`
        agent_id,
        success_rate,
        recent_success_rate,
        validation_count,
        trend,
        last_validation_at,
        agents(
          id,
          name,
          slug
        )
      `)

    if (agentId) {
      capabilitiesQuery = capabilitiesQuery.eq('agent_id', agentId)
    }

    const { data: capabilities, error: capsError } = await capabilitiesQuery

    if (capsError) {
      console.error('Error fetching capabilities:', capsError)
    }

    // Group by agent and build time series
    const agentCurves: Record<string, any> = {}
    
    if (history) {
      history.forEach((entry: any) => {
        const agentSlug = entry.agents?.slug || 'unknown'
        if (!agentCurves[agentSlug]) {
          agentCurves[agentSlug] = {
            agent: {
              id: entry.agents?.id,
              name: entry.agents?.name,
              slug: agentSlug
            },
            dataPoints: []
          }
        }

        agentCurves[agentSlug].dataPoints.push({
          timestamp: entry.created_at,
          success_rate_before: parseFloat(entry.success_rate_before),
          success_rate_after: parseFloat(entry.success_rate_after),
          reward: parseFloat(entry.reward),
          learning_rate: parseFloat(entry.learning_rate),
          validation_event_id: entry.validation_event_id
        })
      })
    }

    // Add current capabilities to each agent
    if (capabilities) {
      capabilities.forEach((cap: any) => {
        const agentSlug = cap.agents?.slug || 'unknown'
        if (agentCurves[agentSlug]) {
          agentCurves[agentSlug].current = {
            success_rate: parseFloat(cap.success_rate || 0),
            recent_success_rate: cap.recent_success_rate ? parseFloat(cap.recent_success_rate) : null,
            validation_count: cap.validation_count || 0,
            trend: cap.trend,
            last_validation_at: cap.last_validation_at
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      curves: Object.values(agentCurves),
      days
    })
  } catch (error: any) {
    console.error('Error in learning-curves API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

