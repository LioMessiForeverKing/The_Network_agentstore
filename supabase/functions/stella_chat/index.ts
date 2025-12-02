// Supabase Edge Function: stella_chat
// - Conversational AI companion
// - Answers questions about the app
// - Maintains context across conversations
// - Routes event planning tasks to Prime via Gaia router

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Helper: Parse date from various formats
function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  // Handle ISO date strings (YYYY-MM-DD)
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const d = new Date(dateStr + 'T00:00:00Z');
    return isNaN(d.getTime()) ? null : d;
  }
  // Try standard Date parsing
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Extract event details from natural language using pattern recognition
 */
function extractEventDetailsFromText(text: string): {
  date?: string;
  time?: string;
  location?: string;
  theme?: string[];
  max_attendees?: number;
  title?: string;
  description?: string;
  confidence: number;
} {
  const result: {
    date?: string;
    time?: string;
    location?: string;
    theme?: string[];
    max_attendees?: number;
    title?: string;
    description?: string;
    confidence: number;
  } = {
    confidence: 0.0,
    theme: []
  };

  const lowerText = text.toLowerCase();

  // Pattern 1: Date extraction
  const datePatterns = [
    /(?:next|this)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /(?:next|this)\s+week/i,
    /(?:in|on)\s+(\d{1,2})\s+(days?|weeks?)/i,
    /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/,
    /(\d{4})-(\d{2})-(\d{2})/,
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?/i,
    /(today|tomorrow|next\s+friday|next\s+weekend)/i
  ];

  for (const pattern of datePatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      result.date = parseDateFromMatch(match, lowerText);
      result.confidence += 0.2;
      break;
    }
  }

  // Pattern 2: Time extraction
  const timePatterns = [
    /(\d{1,2}):(\d{2})\s*(am|pm)/i,
    /(\d{1,2})\s*(am|pm)/i,
    /at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
    /(morning|afternoon|evening|night)/i
  ];

  for (const pattern of timePatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      result.time = parseTimeFromMatch(match);
      result.confidence += 0.15;
      break;
    }
  }

  // Pattern 3: Location extraction
  const locationPatterns = [
    /(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})/,
    /(?:in|at|near)\s+(san\s+francisco|new\s+york|los\s+angeles|chicago|boston|seattle|austin|denver|miami|atlanta|sf|nyc|la)/i,
    /(?:in|at|near)\s+([a-z]+(?:\s+[a-z]+)*)\s+(?:for|with|at)/i
  ];

  for (const pattern of locationPatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      result.location = match[1] + (match[2] ? `, ${match[2]}` : '');
      result.confidence += 0.2;
      break;
    }
  }

  // Pattern 4: Theme/Interests extraction
  const themeKeywords: Record<string, string[]> = {
    entrepreneurship: ['entrepreneur', 'startup', 'business', 'founder', 'venture', 'tech'],
    music: ['music', 'concert', 'band', 'dj', 'sound', 'audio', 'song'],
    networking: ['network', 'connect', 'meet', 'social', 'community'],
    technology: ['tech', 'software', 'coding', 'programming', 'ai', 'ml', 'developer'],
    art: ['art', 'creative', 'design', 'painting', 'gallery', 'exhibition'],
    sports: ['sport', 'fitness', 'gym', 'workout', 'running', 'biking'],
    food: ['food', 'dinner', 'lunch', 'restaurant', 'cooking', 'culinary'],
    education: ['learn', 'education', 'workshop', 'seminar', 'class', 'course']
  };

  const foundThemes: string[] = [];
  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        foundThemes.push(theme);
        result.confidence += 0.05;
        break;
      }
    }
  }
  result.theme = [...new Set(foundThemes)];

  // Pattern 5: Number of attendees
  const attendeePatterns = [
    /(?:invite|with|for)\s+(\d+)\s+(?:people|attendees|guests|friends)/i,
    /(\d+)\s+(?:people|attendees|guests|friends)/i,
    /(?:max|maximum|up\s+to)\s+(\d+)/i
  ];

  for (const pattern of attendeePatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      result.max_attendees = parseInt(match[1]);
      result.confidence += 0.1;
      break;
    }
  }

  result.confidence = Math.min(1.0, result.confidence);
  return result;
}

function parseDateFromMatch(match: RegExpMatchArray, text: string): string {
  const today = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  // Check for "today" first (before other day checks)
  if (match[0].toLowerCase().includes('today')) {
    return today.toISOString().split('T')[0];
  }
  
  // Check for "tomorrow"
  if (match[0].toLowerCase().includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  const dayIndex = dayNames.findIndex(day => match[0].toLowerCase().includes(day));
  if (dayIndex !== -1) {
    const currentDay = today.getDay();
    let daysUntil = dayIndex - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    if (text.includes('next')) daysUntil += 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntil);
    return targetDate.toISOString().split('T')[0];
  }

  if (text.includes('next friday')) {
    const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday);
    return nextFriday.toISOString().split('T')[0];
  }

  try {
    const parsed = new Date(match[0]);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  } catch {}

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  return nextWeek.toISOString().split('T')[0];
}

function parseTimeFromMatch(match: RegExpMatchArray): string {
  const timeStr = match[0].toLowerCase();
  const timeMatch = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const period = timeMatch[3];
    if (period === 'pm' && hours !== 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  if (timeStr.includes('morning')) return '09:00';
  if (timeStr.includes('afternoon')) return '14:00';
  if (timeStr.includes('evening') || timeStr.includes('night')) return '19:00';
  return '19:00';
}

/**
 * Route event planning task to Prime via Gaia
 * Handles: create, edit, invite actions
 */
async function routeEventTask(
  supabase: any,
  userId: string,
  stellaHandle: string,
  extractedDetails: any,
  userAuthToken: string | null
): Promise<any> {
  try {
    let taskSpec: any;
    
    // Handle different actions
    if (extractedDetails.action === 'edit' && extractedDetails.taskSpec) {
      // Edit event - use provided task spec
      taskSpec = extractedDetails.taskSpec;
    } else if (extractedDetails.action === 'invite' && extractedDetails.taskSpec) {
      // Invite person - use provided task spec
      taskSpec = extractedDetails.taskSpec;
    } else {
      // Default: Create event
      taskSpec = {
        type: 'EVENT_PLANNING',
        user_id: userId,
        stella_handle: stellaHandle,
        context: {
          action: 'create',
          event_details: {
            date: extractedDetails.date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default: next week
            time: extractedDetails.time || '19:00',
            location: extractedDetails.location || 'San Francisco, CA',
            theme: extractedDetails.theme || [],
            max_attendees: extractedDetails.max_attendees || 10,
            title: extractedDetails.title,
            description: extractedDetails.description
          },
          auto_invite: extractedDetails.theme && extractedDetails.theme.length > 0
        }
      };
    }

    // Call Gaia router
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // For internal edge function calls, use service key
    // Pass user's auth token if available for user context, but use service key for auth
    // Call Gaia router - make sure function name matches deployment
    const GAIA_FUNCTION_NAME = 'gaia-router'; // Must match deployed function name
    const gaiaUrl = `${SUPABASE_URL}/functions/v1/${GAIA_FUNCTION_NAME}`;
    
    console.log(`Calling Gaia router at: ${gaiaUrl}`);
    console.log(`Task spec type: ${taskSpec.type}, user_id: ${taskSpec.user_id}`);
    
    const response = await fetch(
      gaiaUrl,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_KEY}`, // Use service key for internal calls
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY, // Also pass as apikey for Supabase edge function auth
          'x-user-token': userAuthToken || '' // Pass user token separately for context
        },
        body: JSON.stringify({
          task_spec: taskSpec
        })
      }
    );

    console.log(`Gaia router response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorText;
        if (errorJson.debug) {
          console.log('Gaia router debug info:', errorJson.debug);
        }
      } catch {
        // Not JSON, use as-is
      }
      
      // Better error message for 404
      if (response.status === 404) {
        console.error(`Gaia router 404 - Function may not be deployed or name mismatch. URL: ${gaiaUrl}`);
        throw new Error(`Gaia router function not found (404). URL: ${gaiaUrl}. Check Supabase Dashboard → Edge Functions → gaia-router`);
      }
      
      throw new Error(`Gaia router failed (${response.status}): ${errorMessage}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error routing event task:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!SUPABASE_URL || !SERVICE_KEY || !ANON_KEY) {
      return new Response(JSON.stringify({
        error: "env_not_configured"
      }), {
        status: 500
      });
    }

    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({
        error: "openai_key_missing"
      }), {
        status: 500
      });
    }

    // Authenticate user
    const authed = createClient(SUPABASE_URL, ANON_KEY, {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization") ?? ""
        }
      }
    });

    const { data: userData, error: userError } = await authed.auth.getUser();

    if (userError || !userData?.user) {
      return new Response(JSON.stringify({
        error: "unauthorized"
      }), {
        status: 401
      });
    }

    const userId = userData.user.id;

    // Parse request body
    const reqData = await req.json();
    const { message, conversation_history } = reqData;
    const conversationHistory = conversation_history || [];

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({
        error: "message_required"
      }), {
        status: 400
      });
    }

    const svc = createClient(SUPABASE_URL, SERVICE_KEY);

    // Fetch user's profile data
    const { data: profileData } = await svc.from("profiles").select("location, interests, full_name").eq("id", userId).maybeSingle();
    const userProfileLocation = profileData?.location || null;
    const userInterests = profileData?.interests || [];
    const userName = profileData?.full_name || "there";

    // Store user message in conversation history
    try {
      await svc.from("stella_conversations").insert({
        user_id: userId,
        message: message,
        is_from_user: true
      });
    } catch (e) {
      console.error("Error storing user message:", e);
    }

    // Get today's date for context
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const dayName = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ][today.getDay()];

    const interestsContext = userInterests.length > 0 ? `User's interests: ${userInterests.join(', ')}` : 'User has no interests set yet.';

    // Detect if user wants to create/manage events
    const lowerMessage = message.toLowerCase();
    const eventKeywords = ['create event', 'plan event', 'host event', 'organize event', 'schedule event', 'event planning', 'make an event', 'set up event'];
    const isEventRequest = eventKeywords.some(keyword => lowerMessage.includes(keyword)) || 
                          (lowerMessage.includes('event') && (lowerMessage.includes('create') || lowerMessage.includes('plan') || lowerMessage.includes('host')));
    
    // Detect edit event requests
    const editKeywords = ['edit event', 'change event', 'update event', 'modify event', 'edit my event', 'change my event'];
    const isEditRequest = editKeywords.some(keyword => lowerMessage.includes(keyword)) ||
                         (lowerMessage.includes('edit') && lowerMessage.includes('event'));
    
    // Detect invite person requests
    const inviteKeywords = ['invite', 'add', 'send event to'];
    const isInviteRequest = (inviteKeywords.some(keyword => lowerMessage.includes(keyword)) && 
                            (lowerMessage.includes('event') || lowerMessage.includes('to this'))) ||
                           (lowerMessage.includes('invite') && lowerMessage.includes('to'));

    let eventResult = null;
    let extractedEventDetails = null;

    // If event request, extract details and route to Prime
    if (isEventRequest && !isEditRequest && !isInviteRequest) {
      try {
        extractedEventDetails = extractEventDetailsFromText(message);
        
        // Only route if we have minimum required info (location or date)
        if (extractedEventDetails.location || extractedEventDetails.date || extractedEventDetails.confidence > 0.3) {
          const stellaHandle = `@user.${userId.slice(0, 8)}.network`;
          // Get user's auth token from the request
          const userAuthToken = req.headers.get("Authorization")?.replace("Bearer ", "") || null;
          eventResult = await routeEventTask(svc, userId, stellaHandle, extractedEventDetails, userAuthToken);
        }
      } catch (error: any) {
        console.error("Error routing event task:", error);
        // Continue with normal conversation even if routing fails
      }
    }
    
    // Handle edit event requests
    if (isEditRequest) {
      try {
        // Find the most recent event for this user
        const { data: recentEvents } = await svc
          .from('user_weekly_activities')
          .select('id, event_title, start_date, location')
          .eq('user_id', userId)
          .eq('is_hosting', true)
          .order('start_date', { ascending: false })
          .limit(1);
        
        if (recentEvents && recentEvents.length > 0) {
          const eventToEdit = recentEvents[0];
          const extractedUpdates = extractEventDetailsFromText(message);
          
          // Route edit request to Prime via Gaia
          const stellaHandle = `@user.${userId.slice(0, 8)}.network`;
          const userAuthToken = req.headers.get("Authorization")?.replace("Bearer ", "") || null;
          
          const editTaskSpec = {
            type: 'EVENT_PLANNING',
            user_id: userId,
            stella_handle: stellaHandle,
            context: {
              action: 'edit',
              event_id: eventToEdit.id,
              event_updates: {
                title: extractedUpdates.title,
                location: extractedUpdates.location,
                date: extractedUpdates.date,
                time: extractedUpdates.time,
                max_attendees: extractedUpdates.max_attendees,
                theme: extractedUpdates.theme,
                description: extractedUpdates.description
              }
            }
          };
          
          eventResult = await routeEventTask(svc, userId, stellaHandle, { action: 'edit', taskSpec: editTaskSpec }, userAuthToken);
        } else {
          eventResult = {
            success: false,
            error: "I couldn't find any events to edit. Create an event first!"
          };
        }
      } catch (error: any) {
        console.error("Error handling edit event request:", error);
        eventResult = {
          success: false,
          error: error.message || "Failed to edit event"
        };
      }
    }
    
    // Handle invite person requests
    if (isInviteRequest) {
      try {
        // Extract person name from message
        const inviteMatch = message.match(/invite\s+([^to]+?)(?:\s+to|$)/i) || 
                           message.match(/add\s+([^to]+?)(?:\s+to|$)/i);
        const personName = inviteMatch ? inviteMatch[1].trim() : null;
        
        if (!personName) {
          eventResult = {
            success: false,
            error: "Who would you like to invite? Please tell me their name."
          };
        } else {
          // Find the most recent event for this user
          const { data: recentEvents } = await svc
            .from('user_weekly_activities')
            .select('id, event_title')
            .eq('user_id', userId)
            .eq('is_hosting', true)
            .order('start_date', { ascending: false })
            .limit(1);
          
          if (recentEvents && recentEvents.length > 0) {
            const eventToInvite = recentEvents[0];
            const stellaHandle = `@user.${userId.slice(0, 8)}.network`;
            const userAuthToken = req.headers.get("Authorization")?.replace("Bearer ", "") || null;
            
            const inviteTaskSpec = {
              type: 'EVENT_PLANNING',
              user_id: userId,
              stella_handle: stellaHandle,
              context: {
                action: 'invite',
                event_id: eventToInvite.id,
                invite_person: personName
              }
            };
            
            eventResult = await routeEventTask(svc, userId, stellaHandle, { action: 'invite', taskSpec: inviteTaskSpec }, userAuthToken);
          } else {
            eventResult = {
              success: false,
              error: "I couldn't find any events to invite people to. Create an event first!"
            };
          }
        }
      } catch (error: any) {
        console.error("Error handling invite request:", error);
        eventResult = {
          success: false,
          error: error.message || "Failed to invite person"
        };
      }
    }

    // Updated system prompt - Now includes event routing capability
    const systemPrompt = `You are Stella (also called Gaia), a friendly and conversational AI companion integrated into TheNetwork app.

Your personality:
- Friendly, approachable, and helpful
- Conversational, not robotic or transactional
- Can chat about anything
- Maintains context throughout conversations
- Feels like talking to a helpful friend

Your role:
- You are a MEMORY-RICH COMPANION who remembers and understands
- You help users navigate and understand the app
- You answer questions about features
- You have natural, engaging conversations
- You can now route event planning requests to Prime agent!

Event Management (NEW):
- When users want to create/plan events, you extract details and route to Prime agent
- Prime handles: event creation, network matching, sending invites
- You explain what happened in a friendly, conversational way
- If event creation succeeds, celebrate with the user!
- If it fails, explain what went wrong and suggest alternatives

Your capabilities:
1. General conversation - chat about anything
2. Answer questions about the app and features
3. Help users navigate and understand the app
4. Provide information and explanations
5. Maintain context and remember previous conversations
6. Route event planning tasks to Prime agent (NEW!)

Today's date: ${todayStr} (${dayName})
User's name: ${userName}
User's profile location: ${userProfileLocation || 'Not set'}
${interestsContext}

When users chat with you:
- Respond naturally and conversationally
- Match the user's tone and energy
- Remember context from earlier in the conversation
- If they want to create events, route to Prime and explain what happened
- If they just want to chat, chat with them
- If they ask about the app, explain features helpfully
- Be warm, empathetic, and human-like

INTENT DETECTION:
Determine the user's intent and set "intent" to one of:
- "chat" - General conversation, casual chat, user wants to talk
- "general_question" - Questions about how the app works, features, etc.
- "event_planning" - User wants to create/plan an event (NEW!)

${eventResult ? `EVENT ROUTING RESULT:
${eventResult.success ? `Event created successfully! Event ID: ${eventResult.execution_result?.event?.id || 'N/A'}
Event title: ${eventResult.execution_result?.event?.title || 'N/A'}
Location: ${eventResult.execution_result?.event?.location || 'N/A'}
Invites sent: ${eventResult.execution_result?.invites?.sent || 0}
` : `Event creation failed: ${eventResult.execution_result?.error || 'Unknown error'}`}` : ''}

Respond in JSON format:
{
  "response": "Your natural, conversational response. If event was created, celebrate it!",
  "intent": "chat" | "general_question" | "event_planning"
}`;

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      ...conversationHistory.slice(-10).map((m: any) => ({
        role: m.role,
        content: m.content
      })),
      {
        role: "user",
        content: message
      }
    ];

    const openaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.7,
        response_format: {
          type: "json_object"
        }
      })
    });

    if (!openaiResp.ok) {
      const errorText = await openaiResp.text();
      console.error("OpenAI error:", errorText);
      return new Response(JSON.stringify({
        error: "openai_error",
        details: errorText
      }), {
        status: 500
      });
    }

    const openaiData = await openaiResp.json();
    const content = openaiData.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({
        error: "no_openai_response"
      }), {
        status: 500
      });
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      console.error("Error parsing OpenAI response:", e);
      return new Response(JSON.stringify({
        error: "invalid_openai_response"
      }), {
        status: 500
      });
    }

    const response = parsedContent.response || "I'm here to help! What would you like to know?";
    const intent = parsedContent.intent || (isEventRequest ? "event_planning" : "chat");

    // Store Stella's response in conversation history
    try {
      await svc.from("stella_conversations").insert({
        user_id: userId,
        message: response,
        is_from_user: false,
        metadata: {
          intent: intent,
          event_result: eventResult ? {
            success: eventResult.success,
            event_id: eventResult.execution_result?.event?.id
          } : null
        }
      });
    } catch (e) {
      console.error("Error storing Stella response:", e);
    }

    // Return response with event results if available
    return new Response(JSON.stringify({
      response: response,
      intent: intent,
      event_result: eventResult ? {
        success: eventResult.success,
        event: eventResult.execution_result?.event,
        invites: eventResult.execution_result?.invites
      } : null,
      matches: [],
      events: eventResult?.execution_result?.event ? [eventResult.execution_result.event] : []
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    console.error("Stella chat error:", error);
    return new Response(JSON.stringify({
      error: "internal_error",
      message: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
});

