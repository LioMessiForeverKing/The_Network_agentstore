// Supabase Edge Function: chaos-chef
// Agent: Chaos Chef
// Task Type: FOOD

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Extract food request details from user message
 */
function extractFoodRequestDetails(message: string, context: any): {
  ingredients: string[];
  budget?: number;
  timeConstraint?: string;
  isLateNight: boolean;
  hasMicrowave: boolean;
  location?: string;
  wantsSocial: boolean;
} {
  const lowerMessage = message.toLowerCase();
  
  // Extract ingredients
  const ingredients: string[] = [];
  const ingredientPatterns = [
    /i have ([^,.!?]+)/i,
    /i've got ([^,.!?]+)/i,
    /with ([^,.!?]+)/i,
    /ingredients?: ([^,.!?]+)/i
  ];
  
  for (const pattern of ingredientPatterns) {
    const match = lowerMessage.match(pattern);
    if (match) {
      const items = match[1]
        .split(/and|,|&/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
      ingredients.push(...items);
    }
  }

  // Extract budget
  const budgetMatch = lowerMessage.match(/\$(\d+)/);
  const budget = budgetMatch ? parseInt(budgetMatch[1]) : undefined;

  // Check for late night context
  const isLateNight = /(drunk|1am|2am|3am|late night|midnight|late|tired)/i.test(lowerMessage);

  // Check for microwave
  const hasMicrowave = /microwave/i.test(lowerMessage);

  // Extract location
  const locationMatch = lowerMessage.match(/(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  const location = locationMatch ? locationMatch[1] : context?.location;

  // Check if user wants social
  const wantsSocial = /(together|with|friends|people|network|social)/i.test(lowerMessage);

  return {
    ingredients: ingredients.length > 0 ? ingredients : [],
    budget,
    timeConstraint: isLateNight ? 'late_night' : undefined,
    isLateNight,
    hasMicrowave,
    location,
    wantsSocial
  };
}

/**
 * Generate recipe suggestions (good decision + degenerate but fun)
 */
async function generateRecipeSuggestions(
  details: any,
  userProfile: any
): Promise<Array<{
  type: 'good_decision' | 'degenerate_but_fun';
  title: string;
  description: string;
  time: string;
  ingredients: string[];
  instructions: string[];
  cost?: string;
}>> {
  const suggestions: any[] = [];
  const { ingredients, budget, isLateNight, hasMicrowave } = details;

  // If we have ingredients, generate recipes
  if (ingredients.length > 0) {
    // GOOD DECISION recipe
    const goodRecipe = generateGoodRecipe(ingredients, hasMicrowave);
    if (goodRecipe) {
      suggestions.push({
        type: 'good_decision',
        ...goodRecipe
      });
    }

    // DEGENERATE BUT FUN recipe
    const chaosRecipe = generateChaosRecipe(ingredients, hasMicrowave);
    if (chaosRecipe) {
      suggestions.push({
        type: 'degenerate_but_fun',
        ...chaosRecipe
      });
    }
  }

  // If late night and budget, suggest delivery/quick options
  if (isLateNight && budget) {
    if (suggestions.length === 0) {
      // No ingredients, suggest delivery
      suggestions.push({
        type: 'good_decision',
        title: 'Late-Night Delivery',
        description: `Order from nearby restaurants - budget: $${budget}`,
        time: '20-30 minutes',
        ingredients: [],
        instructions: ['Open delivery app', 'Filter by price', 'Order within budget'],
        cost: `$${budget}`
      });

      suggestions.push({
        type: 'degenerate_but_fun',
        title: 'Microwave Chaos Meal',
        description: 'Whatever you have + cheese + hot sauce = instant satisfaction',
        time: '2 minutes',
        ingredients: ['Whatever you have', 'Cheese (if available)', 'Hot sauce'],
        instructions: [
          'Put everything in a bowl',
          'Add cheese if you have it',
          'Microwave for 90 seconds',
          'Add hot sauce',
          'Accept the chaos'
        ],
        cost: '$0 (use what you have)'
      });
    }
  }

  // Default suggestions if nothing matched
  if (suggestions.length === 0) {
    suggestions.push({
      type: 'good_decision',
      title: 'Simple Pasta',
      description: 'Quick, filling, and always works',
      time: '10 minutes',
      ingredients: ['Pasta', 'Butter/Oil', 'Salt', 'Pepper'],
      instructions: [
        'Boil water',
        'Cook pasta',
        'Drain and add butter/oil',
        'Season with salt and pepper'
      ]
    });

    suggestions.push({
      type: 'degenerate_but_fun',
      title: 'Ramen Upgrade',
      description: 'Make instant ramen less sad',
      time: '5 minutes',
      ingredients: ['Instant ramen', 'Egg', 'Hot sauce', 'Cheese (optional)'],
      instructions: [
        'Cook ramen normally',
        'Crack an egg in while cooking',
        'Add cheese if you have it',
        'Drown in hot sauce',
        'Enjoy the upgrade'
      ]
    });
  }

  return suggestions;
}

/**
 * Generate a "good decision" recipe from ingredients
 */
function generateGoodRecipe(ingredients: string[], hasMicrowave: boolean): any | null {
  const lowerIngredients = ingredients.map(i => i.toLowerCase());
  
  // Check for common ingredient combinations
  if (lowerIngredients.some(i => i.includes('egg')) && 
      lowerIngredients.some(i => i.includes('rice'))) {
    return {
      title: 'Sriracha Fried Rice with Scrambled Eggs',
      description: 'Quick, filling, and actually good. A proper meal.',
      time: '10 minutes',
      ingredients: ingredients.filter(i => 
        !i.toLowerCase().includes('sriracha') || lowerIngredients.some(ing => ing.includes('sriracha'))
      ),
      instructions: [
        'Heat oil in pan',
        'Scramble eggs, set aside',
        'Fry rice in same pan',
        'Add eggs back in',
        'Mix in sriracha',
        'Serve hot'
      ]
    };
  }

  if (lowerIngredients.some(i => i.includes('pasta'))) {
    return {
      title: 'Simple Aglio e Olio',
      description: 'Classic Italian pasta - simple and delicious',
      time: '12 minutes',
      ingredients: ['Pasta', 'Olive oil', 'Garlic', 'Red pepper flakes', 'Parsley (optional)'],
      instructions: [
        'Cook pasta',
        'Heat oil, add garlic',
        'Add red pepper flakes',
        'Toss pasta in oil',
        'Garnish with parsley'
      ]
    };
  }

  if (lowerIngredients.some(i => i.includes('bread')) || 
      lowerIngredients.some(i => i.includes('tortilla'))) {
    return {
      title: 'Proper Quesadilla/Grilled Cheese',
      description: 'Simple but satisfying',
      time: hasMicrowave ? '3 minutes' : '5 minutes',
      ingredients: ['Tortilla/Bread', 'Cheese', 'Butter/Oil'],
      instructions: hasMicrowave ? [
        'Place cheese between tortilla/bread',
        'Microwave for 90 seconds',
        'Let cool slightly',
        'Enjoy'
      ] : [
        'Butter outside of bread/tortilla',
        'Place cheese inside',
        'Cook in pan until golden',
        'Flip and cook other side'
      ]
    };
  }

  return null;
}

/**
 * Generate a "degenerate but fun" recipe from ingredients
 */
function generateChaosRecipe(ingredients: string[], hasMicrowave: boolean): any | null {
  const lowerIngredients = ingredients.map(i => i.toLowerCase());
  
  if (lowerIngredients.some(i => i.includes('egg')) && 
      lowerIngredients.some(i => i.includes('rice'))) {
    return {
      title: 'Chaos Rice Bowl',
      description: 'Mix everything together. It\'s not pretty but it works.',
      time: '5 minutes',
      ingredients: ingredients,
      instructions: [
        'Put everything in a bowl',
        'Mix aggressively',
        'Add cheese if you have it',
        hasMicrowave ? 'Microwave for 2 minutes' : 'Heat in pan',
        'Add hot sauce',
        'Accept the chaos and enjoy'
      ]
    };
  }

  if (lowerIngredients.some(i => i.includes('ramen')) || 
      lowerIngredients.some(i => i.includes('noodle'))) {
    return {
      title: 'Ramen Chaos',
      description: 'Upgrade your ramen with whatever you have',
      time: '5 minutes',
      ingredients: ['Ramen', ...ingredients.filter(i => 
        !i.toLowerCase().includes('ramen') && !i.toLowerCase().includes('noodle')
      )],
      instructions: [
        'Cook ramen normally',
        'Add all other ingredients',
        'Mix everything together',
        'Add hot sauce',
        'It\'s weirdly good'
      ]
    };
  }

  return {
    title: 'Everything Bowl',
    description: 'Just... put it all together. Trust the process.',
    time: '3 minutes',
    ingredients: ingredients,
    instructions: [
      'Get a bowl',
      'Put everything in it',
      hasMicrowave ? 'Microwave for 2 minutes' : 'Mix and eat cold',
      'Add condiments if you have them',
      'Embrace the chaos'
    ]
  };
}

/**
 * Find food enthusiasts in user's network
 */
async function findFoodEnthusiasts(
  supabase: any,
  userId: string,
  location: string | null,
  userInterests: string[]
): Promise<Array<{
  user_id: string;
  name: string;
  reason: string;
  compatibility_score: number;
}>> {
  try {
    // Get user's connections
    const { data: connections, error: connError } = await supabase
      .from('user_connections')
      .select('sender_id, receiver_id')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (connError || !connections || connections.length === 0) {
      return [];
    }

    // Extract connected user IDs
    const connectedUserIds = connections.map((conn: any) =>
      conn.sender_id === userId ? conn.receiver_id : conn.sender_id
    );

    if (connectedUserIds.length === 0) {
      return [];
    }

    // Food-related interests
    const foodInterests = ['cooking', 'food', 'eating', 'recipes', 'baking', 'chef', 'restaurant'];

    // Find profiles with food interests
    let query = supabase
      .from('profiles')
      .select('id, full_name, interests, location')
      .in('id', connectedUserIds);

    // Filter by food interests
    const { data: profiles, error: profileError } = await query;

    if (profileError || !profiles) {
      return [];
    }

    // Filter and score matches
    const foodMatches = profiles
      .filter((profile: any) => {
        const interests = profile.interests || [];
        return interests.some((interest: string) =>
          foodInterests.some(food => interest.toLowerCase().includes(food))
        );
      })
      .map((profile: any) => {
        const interests = profile.interests || [];
        const foodInterestCount = interests.filter((interest: string) =>
          foodInterests.some(food => interest.toLowerCase().includes(food))
        ).length;

        let reason = 'Loves food and cooking';
        if (foodInterestCount > 2) {
          reason = 'Food enthusiast and cooking experimenter';
        }
        if (location && profile.location && profile.location.toLowerCase().includes(location.toLowerCase())) {
          reason += ' (same area)';
        }

        return {
          user_id: profile.id,
          name: profile.full_name || 'Unknown',
          reason,
          compatibility_score: 0.5 + (foodInterestCount * 0.1)
        };
      })
      .sort((a: any, b: any) => b.compatibility_score - a.compatibility_score)
      .slice(0, 5);

    return foodMatches;
  } catch (error) {
    console.error('Error finding food enthusiasts:', error);
    return [];
  }
}

/**
 * Create a co-cooking event
 */
async function createCoCookingEvent(
  supabase: any,
  taskSpec: any,
  matches: any[],
  details: any
): Promise<any> {
  try {
    // Get week start for event
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    const weekStart = monday.toISOString().split('T')[0];

    // Create event
    const eventDate = new Date();
    eventDate.setHours(20, 0, 0, 0); // Default to 8pm
    const endDate = new Date(eventDate);
    endDate.setHours(23, 0, 0, 0);

    const { data: event, error: eventError } = await supabase
      .from('user_weekly_activities')
      .insert({
        user_id: taskSpec.user_id,
        activity_description: 'Co-cooking session with food enthusiasts',
        event_name: 'Co-Cooking Session',
        event_title: 'Co-Cooking Session',
        location: details.location || 'Your place',
        start_date: eventDate.toISOString(),
        end_date: endDate.toISOString(),
        week_start: weekStart,
        tags: ['cooking', 'food', 'social'],
        is_hosting: true,
        max_capacity: matches.length + 1,
        metadata: {
          created_by: 'chaos-chef',
          co_cooking: true,
          participants: matches.map(m => ({ user_id: m.user_id, name: m.name }))
        }
      })
      .select()
      .single();

    if (eventError || !event) {
      console.error('Error creating co-cooking event:', eventError);
      return null;
    }

    // Create invites for matches
    if (matches.length > 0) {
      const invites = matches.map(match => ({
        event_id: event.id,
        user_id: match.user_id,
        status: 'pending'
      }));

      await supabase
        .from('event_attendees')
        .insert(invites);
    }

    return {
      created: true,
      event_id: event.id,
      message: `Created a co-cooking event with ${matches.length} food enthusiast${matches.length !== 1 ? 's' : ''}`
    };
  } catch (error) {
    console.error('Error creating co-cooking event:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      return new Response(
        JSON.stringify({ error: 'Missing environment variables' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase clients
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false
      }
    });
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

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

    // Parse request body
    const body = await req.json();
    const taskSpec = body.task_spec || body;

    // Validate required fields
    if (!taskSpec.type || !taskSpec.user_id) {
      return new Response(
        JSON.stringify({ error: 'Invalid task spec: type and user_id are required' }),
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

    // ============================================
    // CHAOS CHEF AGENT LOGIC
    // ============================================
    
    console.log('Chaos Chef agent execution started:', {
      type: taskSpec.type,
      user_id: taskSpec.user_id,
      context: taskSpec.context
    });

    // Extract request details from context or task spec
    const userMessage = taskSpec.context?.message || taskSpec.context?.user_message || '';
    const extractedDetails = extractFoodRequestDetails(userMessage, taskSpec.context);
    
    // Get user profile for location and interests
    const { data: userProfile } = await serviceClient
      .from('profiles')
      .select('id, full_name, location, interests')
      .eq('id', taskSpec.user_id)
      .single();

    // Generate recipe suggestions
    const suggestions = await generateRecipeSuggestions(
      extractedDetails,
      userProfile
    );

    // Find food enthusiasts in network (optional)
    let socialMatches: any[] = [];
    let coCookingEvent: any = null;
    
    if (extractedDetails.wantsSocial || taskSpec.context?.find_cooking_partners) {
      socialMatches = await findFoodEnthusiasts(
        serviceClient,
        taskSpec.user_id,
        userProfile?.location || null,
        userProfile?.interests || []
      );

      // Optionally create a co-cooking event if matches found
      if (socialMatches.length > 0 && taskSpec.context?.create_co_cooking_event) {
        coCookingEvent = await createCoCookingEvent(
          serviceClient,
          taskSpec,
          socialMatches,
          extractedDetails
        );
      }
    }

    const result = {
      success: true,
      suggestions: suggestions,
      social_matches: socialMatches,
      co_cooking_event: coCookingEvent,
      extracted_details: extractedDetails
    };

    // ============================================
    // END CHAOS CHEF LOGIC
    // ============================================

    console.log('Chaos Chef agent execution finished:', result);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Error in chaos-chef:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
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
