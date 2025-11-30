# Chaos Chef Agent - Setup Guide

## Agent Creation Form Values

Fill in the admin dashboard form with these values:

### Basic Information
- **Agent Name**: `Chaos Chef`
- **Slug**: `chaos-chef`
- **Description**: `Late-night food and cooking agent. Suggests creative recipes from available ingredients, finds late-night eats, and connects food enthusiasts for co-cooking.`
- **Domain**: `food` (this becomes `FOOD` task type)

### Invocation Configuration
- **Invocation Type**: `INTERNAL_FUNCTION`
- **Function Name**: `chaos-chef`
- **Endpoint**: `/functions/v1/chaos-chef`
- **Method**: `POST`

### Options
- ✅ **Automatically create edge function file**: Check this box

## What the Agent Does

### Core Functionality

1. **Recipe Suggestions from Ingredients**
   - User: "I have eggs, rice, and sriracha in my dorm. What can I make?"
   - Agent suggests 2-3 options:
     - 1 "good decision" (proper recipe)
     - 1 "degenerate but fun" (chaotic but edible)
     - Optionally: 1 social option (cook with friends)

2. **Late-Night Eats Finder**
   - User: "I'm drunk, it's 1am, I have $12 and a microwave."
   - Agent suggests:
     - Late-night delivery options
     - Microwave-friendly recipes
     - Budget-friendly options

3. **Social Food Connections**
   - Recommends people in network who:
     - Share cooking interests
     - Are "food weirdos"
     - Might want to cook together
   - Creates micro-events for co-cooking

### Task Types Handled

- `FOOD` - General food/cooking requests
- `RECIPE_SUGGESTION` - Recipe from ingredients
- `LATE_NIGHT_EATS` - Late-night food options
- `COOKING_SOCIAL` - Find cooking partners

## Example Interactions

### Example 1: Recipe from Ingredients
```
User: "I have eggs, rice, and sriracha. What can I make?"

Chaos Chef:
1. GOOD DECISION: "Sriracha Fried Rice with Scrambled Eggs"
   - Quick, filling, actually good
   - Takes 10 minutes
   
2. DEGENERATE BUT FUN: "Chaos Rice Bowl"
   - Mix everything together, add cheese if you have it
   - Microwave for 2 minutes
   - It's... edible and weirdly satisfying
   
3. SOCIAL OPTION: "Want to cook together? I found 3 people in your network who love late-night cooking experiments!"
```

### Example 2: Late-Night Drunk Food
```
User: "I'm drunk, it's 1am, I have $12 and a microwave."

Chaos Chef:
1. GOOD DECISION: "Order from [Restaurant] - $8.99, delivers in 20 min"
   
2. DEGENERATE BUT FUN: "Microwave Quesadilla Hack"
   - Tortilla + cheese + whatever you have
   - 90 seconds in microwave
   - Add hot sauce
   - It's not pretty but it works
   
3. SOCIAL OPTION: "3 people in your network are also up and hungry. Want to order together and split delivery?"
```

## Implementation Notes

### Data Sources
- **User interests**: Check for food/cooking related interests
- **User location**: For late-night delivery options
- **Network connections**: Find food enthusiasts
- **User weekly activities**: Check for existing food events

### Response Format
```json
{
  "success": true,
  "suggestions": [
    {
      "type": "good_decision",
      "title": "Recipe Name",
      "description": "Why this is good",
      "time": "10 minutes",
      "ingredients": ["list"],
      "instructions": "step by step"
    },
    {
      "type": "degenerate_but_fun",
      "title": "Chaos Recipe Name",
      "description": "Why this is chaotic but fun",
      "time": "5 minutes",
      "ingredients": ["list"],
      "instructions": "chaotic steps"
    }
  ],
  "social_matches": [
    {
      "user_id": "...",
      "name": "...",
      "reason": "Also loves late-night cooking experiments"
    }
  ],
  "co_cooking_event": {
    "created": true,
    "event_id": "...",
    "message": "Created a co-cooking event with 2 people"
  }
}
```

## After Creation

1. **Edit the function** at `supabase/functions/chaos-chef/index.ts`
2. **Implement the logic**:
   - Parse user request (ingredients, budget, time, etc.)
   - Generate recipe suggestions (use AI or recipe database)
   - Find social matches in network
   - Optionally create co-cooking events
3. **Deploy**:
   ```bash
   supabase functions deploy chaos-chef
   ```

## Testing

Test with:
- "I have eggs, rice, and sriracha. What can I make?"
- "I'm drunk, it's 1am, I have $12 and a microwave."
- "What can I make with [ingredients]?"
- "Find me late-night food near me"

## Why This Works

- 🍳 **Universal need**: Everyone gets hungry, especially late at night
- 😄 **Low-stakes fun**: Food experiments are safe and shareable
- 👥 **Social connection**: Food brings people together
- 🎯 **Micro-events**: Creates small, casual co-cooking opportunities
- 📱 **Shareable**: "Chaos Chef told me to put peanut butter in my ramen lol"

