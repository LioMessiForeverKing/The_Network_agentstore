-- Bulk Insert Experimental Agents - Part 2 (HEALTH, FASHION, FOOD, FITNESS, TECH)
-- Run this to create experimental agents for testing Gaia routing

-- ============================================================================
-- HEALTH AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Sunburn Care Advisor', 'sunburn-advisor', 'Gives simple care steps for sunburn recovery.', 'HEALTH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Air Quality Advisor', 'airquality-agent', 'Interprets AQI levels and suggests precautions.', 'HEALTH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Bug Bite Advisor', 'bugbite-advisor', 'Suggests first-aid steps for bites/stings.', 'HEALTH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Minor Injury Advisor', 'firstaid-advisor', 'Gives first-aid steps for minor injuries (non-medical).', 'HEALTH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Skincare Ingredient Checker', 'ingredient-checker', 'Explains what skincare ingredients do and compatibility.', 'HEALTH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Water Intake Planner', 'hydration-agent', 'Suggests water intake based on activity.', 'HEALTH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Sugar Craving Manager', 'sugar-craving-agent', 'Helps manage sugar cravings.', 'HEALTH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Food Sensitivity Analyzer', 'sensitivity-agent', 'Suggests if symptoms might be common sensitivities.', 'HEALTH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Skin Irritation Advisor', 'irritation-agent', 'Suggests possible causes for minor skin issues.', 'HEALTH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Headache Relief Tips Agent', 'headache-relief-agent', 'Gives safe, simple headache relief suggestions.', 'HEALTH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Home Allergy Checker', 'allergy-checker', 'Helps identify common home allergens.', 'HEALTH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Jet Lag Meal Planner', 'jetlag-meal-agent', 'Suggests eating schedules to reduce jet lag severity.', 'HEALTH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Jet Lag Recovery Agent', 'jetlag-agent', 'Creates recovery plans to minimize jet lag based on timezone shift.', 'HEALTH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Nutrition Advisor', 'nutrition-agent', 'Generates meal plans, calorie targets, macros, and nutrition advice based on health goals and dietary restrictions.', 'HEALTH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Skincare Routine Builder', 'skincare-builder', 'Creates skincare routines tailored to skin type and concerns.', 'HEALTH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Splinter Removal Guide', 'splinter-guide-agent', 'Explains safe splinter removal steps.', 'HEALTH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Nutrition Label Interpreter', 'nutrition-interpreter', 'Explains nutrition labels and suggests healthier alternatives.', 'HEALTH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Sun Protection Planner', 'sun-protection-agent', 'Suggests SPF routines based on UV index.', 'HEALTH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Dehydration Warning Agent', 'dehydration-agent', 'Explains mild dehydration signs + fixes.', 'HEALTH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Calories Per Meal Estimator', 'meal-calorie-estimator', 'Estimates calories based on ingredients and amounts.', 'HEALTH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- FASHION AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Shoe Cleaner Guide', 'shoe-cleaner-agent', 'Explains how to clean different fabrics/leathers.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Fashion Color Matching Agent', 'color-matching-agent', 'Suggests what colors pair well with a given item.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Hair Dye Advisor', 'hairdye-advisor', 'Suggests dye colors based on skin tone and undertones.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Winter Clothing Advisor', 'winter-clothing-agent', 'Helps pick winter gear based on climate and style.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Haircut Style Selector', 'haircut-selector', 'Suggests haircut styles based on face shape and vibe.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Ring & Jewelry Advisor', 'jewelry-advisor', 'Suggests jewelry styles that match outfits + personality.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Closet Purge Assistant', 'closet-purge-agent', 'Helps decide what clothes to keep or discard.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Closet Fit Checker', 'outfit-checker', 'Suggests what items pair well together in a wardrobe.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Streetwear Outfit Stylist', 'streetwear-stylist', 'Creates streetwear fits based on brand preferences and vibe.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Fashion Capsule Wardrobe Builder', 'capsule-wardrobe-agent', 'Creates capsule wardrobes tailored to style.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Skin Undertone Detector', 'undertone-agent', 'Determines skin undertones and color palettes.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Season Style Switch Planner', 'seasonal-style-agent', 'Helps transition outfits between seasons.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Haircare Routine Agent', 'haircare-agent', 'Builds hair routines for curl type + porosity.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Jewelry Matching Agent', 'jewelry-match-agent', 'Suggests jewelry combos for outfits.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Face Shape Detector', 'faceshape-agent', 'Determines face shape from description.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Outfit Color Analyzer', 'outfit-color-agent', 'Evaluates color harmony of outfit choices.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Festival Outfit Planner', 'festival-outfit-agent', 'Suggests festival outfits (Coachella, EDC).', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Outfit Roast Agent', 'outfit-roast-agent', 'Gives playful but insightful outfit critique.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Wedding Guest Outfit Planner', 'wedding-outfit-agent', 'Suggests wedding-appropriate outfits.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Party Outfit Picker', 'party-outfit-picker', 'Generates outfits for specific party vibes.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Weather-Aware Outfit Planner', 'weather-outfit-agent', 'Suggests outfits based on weather and vibe.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Costume Party Outfit Agent', 'costume-outfit-agent', 'Suggests themed costume ideas.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Wet Weather Clothing Agent', 'rain-outfit-agent', 'Suggests outfits for rain.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Sneaker Cleaning Agent', 'sneaker-clean-agent', 'Provides sneaker cleaning instructions.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Style & Outfit Advisor', 'style-advisor', 'Suggests outfits based on event, weather, and personal style.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Closet Organizer Agent', 'closet-organizer', 'Organizes closets, builds capsule wardrobes, and item categories.', 'FASHION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- FOOD AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('High-Protein Meal Builder', 'protein-meal-agent', 'Suggests simple high-protein meals using common ingredients.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Late Night Snack Advisor', 'latenight-snack-agent', 'Suggests healthy/quick snacks late at night.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('What Should I Eat? Agent', 'eat-what-agent', 'Recommends meals based on cravings, calorie needs, and diet.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Wine Pairing Agent', 'wine-pairing-agent', 'Suggests wine pairings for meals or occasions.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Coffee Brewing Coach', 'coffee-brewing-coach', 'Guides optimal brewing settings for espresso, pour-over, etc.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Cocktail Recipe Advisor', 'cocktail-advisor', 'Suggests cocktail recipes based on ingredients on hand.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Salad Builder Agent', 'salad-builder-agent', 'Designs custom salads with macros and flavor balance.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Cooking Technique Coach', 'cooking-technique-agent', 'Teaches cooking techniques like sauteing, braising, reduction.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Cheap Eats Finder', 'cheap-eats-finder', 'Finds affordable food options in a city or neighborhood.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Grocery Budget Maximizer', 'grocery-maximizer', 'Suggests how to get maximum nutrition for minimum cost.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Grocery Healthy Swap Agent', 'grocery-swap-agent', 'Suggests healthier alternatives to common foods.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Grocery Storage Guide', 'grocery-storage-agent', 'Explains how to store different foods for freshness.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Cooking Time Estimator', 'cooking-time-estimator', 'Estimates cooking times for ingredients and recipes.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('5-Minute Meal Generator', '5min-meal-agent', 'Suggests meals requiring 5 minutes or less.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Recipe Ingredient Substituter', 'ingredient-swap-agent', 'Suggests replacements for missing ingredients.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Kitchen Tools Advisor', 'kitchen-tool-advisor', 'Suggests cookware & appliances based on cooking goals.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Menu Optimizer', 'menu-optimizer-agent', 'Suggests best-value menu items based on diet & taste.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Cocktail Name Generator', 'cocktail-name-agent', 'Generates creative names for drinks.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Kitchen Knife Care Agent', 'knife-care-agent', 'Helps sharpen & maintain knives.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Cooking Coach', 'cooking-coach', 'Suggests recipes, techniques, and cooking plans based on ingredients.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Grocery List Generator', 'grocery-list-agent', 'Builds weekly grocery lists based on diet + recipes.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Meal Prep Planner', 'mealprep-planner', 'Creates weekly meal-prep menus with grocery lists and calorie counts.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Dinner Party Menu Planner', 'dinner-menu-planner', 'Designs menus based on theme, dietary needs, and difficulty.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Shopping List Optimizer', 'shopping-optimizer', 'Optimizes grocery lists for cost, efficiency, and store layout.', 'FOOD', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- FITNESS AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Bulking Meal Plan Agent', 'bulking-meal-agent', 'Creates high-calorie bulking plans optimized for macros.', 'FITNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Cutting Meal Plan Agent', 'cutting-meal-agent', 'Designs calorie-deficit plans for fat loss.', 'FITNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Home Workout Equipment Advisor', 'home-gym-advisor', 'Recommends equipment based on space and goals.', 'FITNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Micro-Workout Agent', 'microworkout-agent', 'Suggests 2-5 min workouts throughout the day.', 'FITNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Winter Running Gear Selector', 'winter-running-agent', 'Suggests running layers for cold weather.', 'FITNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Gym Injury Prevention Coach', 'injury-prevention-agent', 'Suggests form and warm-up strategies.', 'FITNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Running Shoe Selector', 'running-shoe-agent', 'Suggests running shoes based on gait.', 'FITNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Gym Workout Planner', 'gym-planner', 'Builds tailored workout programs based on goals (hypertrophy, strength, fat loss), equipment, and training split.', 'FITNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Gym Bro Motivator', 'gym-bro', 'Speaks like a hype gym bro; gives workout advice, motivation, and form cues in a high-energy, friendly tone.', 'FITNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Macro Calculator', 'macro-calculator', 'Calculates macros and meal targets for fitness goals.', 'FITNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Workout Form Checker', 'workout-form-checker', 'Gives advice on correct lifting form based on descriptions.', 'FITNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Running Coach', 'running-coach', 'Builds running programs for endurance, speed, or fat loss goals.', 'FITNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Running Shoe Advisor', 'shoe-advisor', 'Recommends running shoes based on gait, terrain, and mileage.', 'FITNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Bodyweight Exercise Selector', 'bodyweight-exercise-agent', 'Suggests bodyweight exercises by muscle group.', 'FITNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('No-Equipment Workout Agent', 'no-equipment-agent', 'Generates workouts requiring zero equipment.', 'FITNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Gym Etiquette Coach', 'gym-etiquette-agent', 'Teaches gym manners and do/dont guidelines.', 'FITNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Fitness Beginner Coach', 'fitness-beginner', 'Provides beginner-friendly fitness routines requiring minimal equipment.', 'FITNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- TECH AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Lost Password Helper', 'password-recovery-helper', 'Gives recovery advice for locked accounts (non-hacking).', 'TECH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Laptop Buying Advisor', 'laptop-advisor', 'Helps choose a laptop based on workload + budget.', 'TECH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Phone Comparison Agent', 'phone-compare-agent', 'Compares phone models based on specs and use cases.', 'TECH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Headphone Selection Agent', 'headphone-selector', 'Suggests headphones for budget, comfort, sound profile.', 'TECH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Gaming PC Builder', 'pc-builder-agent', 'Suggests PC parts based on budget + performance needs.', 'TECH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Wifi Troubleshooting Agent', 'wifi-troubleshoot-agent', 'Diagnoses common Wi-Fi issues and suggests fixes.', 'TECH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('SQL Query Builder', 'sql-query-agent', 'Writes and explains SQL queries for any use case.', 'TECH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('API Debugging Agent', 'api-debug-agent', 'Helps debug common API issues with structured steps.', 'TECH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Tech Stack Selector', 'techstack-selector-agent', 'Suggests tech stacks for apps, sites, startups.', 'TECH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Data Cleaning Agent', 'dataclean-agent', 'Suggests methods to clean and preprocess datasets.', 'TECH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Workflow Automation Planner', 'automation-planner-agent', 'Suggests what tasks can be automated.', 'TECH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Keyboard Maintenance Agent', 'keyboard-clean-agent', 'Suggests mechanical keyboard cleaning steps.', 'TECH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Laptop Cooling Advisor', 'laptop-cool-agent', 'Suggests cooling strategies for laptops.', 'TECH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Hard Drive Recovery Tips Agent', 'drive-recovery-agent', 'Suggests safe steps for lost data (non-intrusive).', 'TECH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Battery Life Saver Agent', 'battery-optimizer', 'Suggests ways to extend phone/laptop battery life.', 'TECH', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

SELECT 'Part 2 complete: HEALTH, FASHION, FOOD, FITNESS, TECH agents inserted' as status;

