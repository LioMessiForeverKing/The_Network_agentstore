// Experimental Agent - Generic handler for testing Gaia routing
// This edge function handles all experimental agents for routing tests
// It simulates agent responses based on the task input

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TaskInput {
  task_id?: string;
  user_id?: string;
  agent_slug?: string;
  task_type?: string;
  raw_message?: string;
  context?: Record<string, unknown>;
  extracted_entities?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

interface AgentResponse {
  success: boolean;
  response: string;
  data: Record<string, unknown>;
  agent_slug: string;
  task_type: string;
  processing_time_ms: number;
  is_experimental: boolean;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const input: TaskInput = await req.json();
    
    console.log("[experimental-agent] Received task:", {
      task_id: input.task_id,
      agent_slug: input.agent_slug,
      task_type: input.task_type,
      raw_message: input.raw_message?.substring(0, 100),
    });

    // Extract key information
    const agentSlug = input.agent_slug || input.metadata?.agent_slug || "unknown";
    const taskType = input.task_type || input.context?.task_type || "UNKNOWN";
    const rawMessage = input.raw_message || input.context?.message || "";

    // Simulate processing delay (100-500ms)
    const simulatedDelay = Math.floor(Math.random() * 400) + 100;
    await new Promise(resolve => setTimeout(resolve, simulatedDelay));

    // Generate a contextual response based on the task
    const response = generateResponse(agentSlug as string, taskType as string, rawMessage as string);

    const processingTime = Date.now() - startTime;

    const result: AgentResponse = {
      success: true,
      response: response.message,
      data: response.data,
      agent_slug: agentSlug as string,
      task_type: taskType as string,
      processing_time_ms: processingTime,
      is_experimental: true,
    };

    console.log("[experimental-agent] Response generated:", {
      agent_slug: agentSlug,
      task_type: taskType,
      processing_time_ms: processingTime,
      success: true,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("[experimental-agent] Error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        is_experimental: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

function generateResponse(agentSlug: string, taskType: string, rawMessage: string): { message: string; data: Record<string, unknown> } {
  // Clean up the slug for display
  const agentName = agentSlug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Generate contextual responses based on domain/task type
  const domainResponses: Record<string, () => { message: string; data: Record<string, unknown> }> = {
    TRAVEL: () => ({
      message: `[${agentName}] Here's your travel recommendation based on your request: "${rawMessage.substring(0, 50)}..."`,
      data: {
        recommendations: [
          { item: "Pack light layers", priority: "high" },
          { item: "Check visa requirements", priority: "medium" },
          { item: "Download offline maps", priority: "medium" },
        ],
        estimated_budget: "$500-$1500",
        best_time_to_visit: "Spring or Fall",
      },
    }),
    LIFESTYLE: () => ({
      message: `[${agentName}] Based on your lifestyle needs, here are my suggestions for: "${rawMessage.substring(0, 50)}..."`,
      data: {
        tips: [
          "Start with small, achievable goals",
          "Create a routine that works for your schedule",
          "Track your progress weekly",
        ],
        resources: ["Apps", "Books", "Communities"],
      },
    }),
    WELLNESS: () => ({
      message: `[${agentName}] Here's my wellness advice for your request: "${rawMessage.substring(0, 50)}..."`,
      data: {
        recommendations: [
          { practice: "Morning meditation", duration: "5 minutes" },
          { practice: "Breathing exercises", duration: "2 minutes" },
          { practice: "Gratitude journaling", duration: "3 minutes" },
        ],
        frequency: "Daily",
        expected_benefits: ["Reduced stress", "Better focus", "Improved mood"],
      },
    }),
    EDUCATION: () => ({
      message: `[${agentName}] Here's your educational guidance for: "${rawMessage.substring(0, 50)}..."`,
      data: {
        learning_path: [
          { step: 1, topic: "Fundamentals", duration: "1 week" },
          { step: 2, topic: "Core concepts", duration: "2 weeks" },
          { step: 3, topic: "Practice & application", duration: "2 weeks" },
        ],
        resources: ["Video courses", "Practice problems", "Study groups"],
        study_schedule: "2-3 hours daily",
      },
    }),
    PRODUCTIVITY: () => ({
      message: `[${agentName}] Here's your productivity plan for: "${rawMessage.substring(0, 50)}..."`,
      data: {
        tasks: [
          { task: "Break down into subtasks", estimated_time: "30 min" },
          { task: "Set priorities", estimated_time: "15 min" },
          { task: "Schedule focus blocks", estimated_time: "10 min" },
        ],
        technique: "Pomodoro (25/5)",
        tools_suggested: ["Calendar blocking", "Task manager", "Focus timer"],
      },
    }),
    BUSINESS: () => ({
      message: `[${agentName}] Here's my business analysis for: "${rawMessage.substring(0, 50)}..."`,
      data: {
        analysis: {
          strengths: ["Market opportunity", "Unique value prop"],
          weaknesses: ["Limited resources", "Competition"],
          opportunities: ["Growing market", "Tech trends"],
          threats: ["Market saturation", "Economic factors"],
        },
        next_steps: ["Validate assumptions", "Build MVP", "Get user feedback"],
        estimated_timeline: "3-6 months",
      },
    }),
    FITNESS: () => ({
      message: `[${agentName}] Here's your fitness recommendation for: "${rawMessage.substring(0, 50)}..."`,
      data: {
        workout_plan: [
          { day: "Monday", focus: "Upper body", exercises: 4 },
          { day: "Wednesday", focus: "Lower body", exercises: 4 },
          { day: "Friday", focus: "Full body", exercises: 5 },
        ],
        intensity: "Moderate",
        rest_days: 4,
        nutrition_tip: "Prioritize protein intake",
      },
    }),
    FOOD: () => ({
      message: `[${agentName}] Here's your food recommendation for: "${rawMessage.substring(0, 50)}..."`,
      data: {
        suggestions: [
          { meal: "Quick healthy option", prep_time: "15 min" },
          { meal: "Meal prep idea", prep_time: "45 min" },
          { meal: "Weekend special", prep_time: "1 hour" },
        ],
        ingredients: ["Fresh vegetables", "Lean protein", "Whole grains"],
        calories_estimate: "400-600 per serving",
      },
    }),
    CREATIVE: () => ({
      message: `[${agentName}] Here's my creative suggestion for: "${rawMessage.substring(0, 50)}..."`,
      data: {
        ideas: [
          "Start with brainstorming without judgment",
          "Explore different perspectives and angles",
          "Combine unexpected elements",
        ],
        inspiration_sources: ["Nature", "Art", "Music", "Conversations"],
        next_steps: ["Sketch initial concepts", "Get feedback", "Iterate"],
      },
    }),
    TECH: () => ({
      message: `[${agentName}] Here's my tech recommendation for: "${rawMessage.substring(0, 50)}..."`,
      data: {
        solution: "Based on your requirements",
        options: [
          { option: "Budget-friendly", price_range: "$-$$" },
          { option: "Mid-range", price_range: "$$-$$$" },
          { option: "Premium", price_range: "$$$-$$$$" },
        ],
        key_features: ["Performance", "Reliability", "Support"],
      },
    }),
    SOCIAL: () => ({
      message: `[${agentName}] Here's my social advice for: "${rawMessage.substring(0, 50)}..."`,
      data: {
        suggestions: [
          "Start with open-ended questions",
          "Listen actively and show genuine interest",
          "Follow up on shared interests",
        ],
        conversation_starters: ["Current events", "Shared experiences", "Future plans"],
        tips: ["Be authentic", "Stay positive", "Be present"],
      },
    }),
    CAREER: () => ({
      message: `[${agentName}] Here's your career guidance for: "${rawMessage.substring(0, 50)}..."`,
      data: {
        roadmap: [
          { phase: "Current skills assessment", duration: "1 week" },
          { phase: "Gap analysis", duration: "1 week" },
          { phase: "Skill development", duration: "3-6 months" },
          { phase: "Job search", duration: "2-3 months" },
        ],
        skills_to_develop: ["Technical skills", "Soft skills", "Industry knowledge"],
        networking_tips: ["LinkedIn optimization", "Industry events", "Mentorship"],
      },
    }),
  };

  // Get the response generator for the task type, or use default
  const generator = domainResponses[taskType] || (() => ({
    message: `[${agentName}] I've processed your request: "${rawMessage.substring(0, 50)}..." Here's my analysis and recommendations.`,
    data: {
      status: "completed",
      agent: agentSlug,
      task_type: taskType,
      recommendations: [
        "Consider the key factors involved",
        "Break down the problem into smaller parts",
        "Seek additional information if needed",
      ],
      confidence: 0.85,
      experimental_note: "This is an experimental agent response for routing tests",
    },
  }));

  return generator();
}

