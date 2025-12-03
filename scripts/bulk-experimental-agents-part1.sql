-- Bulk Insert Experimental Agents - Part 1 (TRAVEL, LIFESTYLE, CREATIVE, GAMING, WELLNESS)
-- Run this to create experimental agents for testing Gaia routing

-- ============================================================================
-- TRAVEL AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Trip Packing Weight Checker', 'packing-weight-checker', 'Estimates luggage weight based on item list.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Ferry & Train Route Planner', 'ferry-train-planner', 'Suggests land/sea routes between cities.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Travel Adapter Finder', 'adapter-finder', 'Suggests plug adapters + voltage details for countries.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Visa Requirement Checker', 'visa-checker-agent', 'Summarizes required visas for specific nationalities (general info only).', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Parking Strategy Agent', 'parking-strategy-agent', 'Suggests parking tactics & risk areas in dense cities.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Sunset/Sunrise Planner', 'goldenhour-agent', 'Tells golden hour + blue hour times anywhere.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Compression Packing Coach', 'compression-packing', 'Helps maximize suitcase space using packing hacks.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Safe Travel Zones Advisor', 'safe-travel-advisor', 'Explains which neighborhoods of a city are safe or risky.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Car Rental Strategy Agent', 'rental-strategy-agent', 'Helps pick rental companies & insurance.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('City Noise Level Analyzer', 'noise-level-agent', 'Gives noise level expectations by neighborhood.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Luggage Space Maximizer', 'luggage-maximizer-agent', 'Teaches advanced packing compression.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Travel Budget Estimator', 'travel-budget-estimator', 'Estimates total travel costs for a trip based on destination.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Border Crossing Checklist', 'border-crossing-agent', 'Suggests what to prep for border crossings.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Travel Currency Planner', 'currency-planner-agent', 'Suggests how much foreign currency to bring.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Backpacking Gear Advisor', 'backpacking-gear-agent', 'Suggests gear for backpacking trips.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Packing Checklist Generator', 'packing-checklist-agent', 'Creates packing lists for any destination and duration.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Multi-City Travel Planner', 'multicity-planner-agent', 'Generates multi-stop itineraries.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Travel Snack Planner', 'travel-snack-planner', 'Recommends snacks for flights and long trips.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Packing List Generator', 'packing-list-agent', 'Creates packing lists based on destination, weather, and trip purpose.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Flight Deal Finder', 'flight-deal-finder', 'Finds cheap flight opportunities using flexible date logic.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Travel Planner', 'travel-agent', 'Designs optimized itineraries including flights, hotels, activities, and daily schedules based on user preferences.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Weekend Trip Planner', 'weekend-trip-planner', 'Creates short getaway itineraries based on travel distance and budget.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Festival Planner', 'festival-planner', 'Helps plan festival trips including packing, schedule, and logistics.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Holiday Planner', 'holiday-planner', 'Designs holiday trip itineraries with activities and rest time.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Travel Safety Agent', 'travel-safety-agent', 'Gives safety tips for traveling to specific cities or regions.', 'TRAVEL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- LIFESTYLE AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Apartment Noise Troubleshooter', 'noise-troubleshooter', 'Suggests solutions for noisy neighbors or insulation.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Furniture Assembly Helper', 'assembly-helper', 'Gives step-by-step assembly advice based on description.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Laundry Sorting Assistant', 'laundry-sort-agent', 'Helps categorize clothes into proper wash loads.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Cat Behavior Interpreter', 'cat-behavior-agent', 'Explains cat behaviors and what they may mean.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Dog Training Script Agent', 'dog-training-agent', 'Provides training scripts for commands and behavior issues.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Bathroom Cleaning Guide', 'bathroom-cleaner-agent', 'Gives step-by-step cleaning routine for bathrooms.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Home Safety Advisor', 'home-safety-agent', 'Suggests home safety improvements, detectors, locks, lighting.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Plant Watering Schedule Agent', 'plant-watering-agent', 'Suggests watering/lighting schedules for houseplants.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Home Repair Advisor', 'homerepair-advisor', 'Offers simple, safe repair suggestions for common household issues.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Car Maintenance Advisor', 'car-maintenance-agent', 'Suggests maintenance schedules and basic troubleshooting.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Bike Maintenance Advisor', 'bike-maintenance-agent', 'Teaches basic bike maintenance.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Closet Organization Agent', 'closet-org-agent', 'Gives closet organization strategies.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Lost Item Detective', 'lost-item-detective', 'Helps users reason through where a lost item might be.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Laundry Care Coach', 'laundry-care-agent', 'Explains how to wash/dry/maintain different fabrics safely.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Clothing Stain Solver', 'stain-solver', 'Gives stain removal strategies based on material & stain type.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Candle Scent Selector', 'candle-scent-agent', 'Picks scents based on mood + season.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Perfume Selector', 'perfume-selector-agent', 'Picks perfumes based on gender, climate, vibe.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Minimalist Lifestyle Coach', 'minimalist-agent', 'Helps declutter physical and digital life.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Moving Day Checklist Agent', 'moving-checklist-agent', 'Creates moving-day checklists and timelines.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Apartment Essentials List Maker', 'apt-essentials-agent', 'Generates a list of apartment items based on lifestyle.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Cleaning Rotation Planner', 'cleaning-rotation-planner', 'Creates home cleaning rotation schedules.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Neighborhood Finder', 'neighborhood-finder', 'Suggests neighborhoods to live in based on lifestyle preferences.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Apartment Finder Helper', 'apartment-agent', 'Helps search for apartments based on budget, location, amenities.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Pet Care Advisor', 'pet-care-agent', 'Gives guidance on feeding, training, and caring for pets.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Home Organizer Agent', 'home-organizer', 'Helps declutter and organize living spaces by zone.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Cleaning Routine Planner', 'cleaning-planner', 'Builds cleaning + chore schedules for individuals or roommates.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Hair Routine Advisor', 'haircare-advisor', 'Suggests hair care routines based on texture and goals.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Subscription Tracker', 'subscription-tracker', 'Helps track and evaluate recurring subscriptions.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Dorm Organization Agent', 'dorm-organizer', 'Suggests layouts, essentials, and storage hacks for dorm rooms.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Cleaning Product Advisor', 'cleaning-product-agent', 'Recommends cleaning products for specific surfaces and issues.', 'LIFESTYLE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- CREATIVE AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Flash Fiction Writer', 'flashfiction-writer', 'Generates ultra-short stories with twists.', 'CREATIVE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Rap Lyric Generator', 'rap-lyric-agent', 'Creates rap lyrics in chosen style (trap, drill, lyrical).', 'CREATIVE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Rapid Brainstorm Agent', 'rapid-brainstorm', 'Generates 20 ideas instantly for any creative need.', 'CREATIVE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Tattoo Concept Generator', 'tattoo-concept-agent', 'Generates tattoo ideas with symbolism and style guides.', 'CREATIVE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Video Idea Generator', 'video-idea-generator', 'Generates video concepts for YouTube, TikTok, Reels.', 'CREATIVE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('DIY Craft Project Agent', 'diy-craft-agent', 'Suggests craft projects with materials lists and instructions.', 'CREATIVE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Brainstorm Buddy', 'brainstorming-buddy', 'Generates creative ideas, lists, and angles for any topic.', 'CREATIVE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Idea Expander', 'idea-expander', 'Takes a seed idea and expands it into multiple creative directions.', 'CREATIVE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Script Dialogue Generator', 'dialogue-generator', 'Writes dialogue in different styles and tones for scripts.', 'CREATIVE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Story Structure Agent', 'story-structure-agent', 'Helps users craft stories using narrative arcs like Heros Journey or 3-act format.', 'CREATIVE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Character Creation Coach', 'character-creator-agent', 'Helps develop characters for stories.', 'CREATIVE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Short Story Navigator', 'story-navigator-agent', 'Helps structure short stories.', 'CREATIVE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Storyworld Builder', 'worldbuilding-agent', 'Helps build fictional worlds.', 'CREATIVE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Character Voice Generator', 'character-voice-agent', 'Crafts written voices for characters.', 'CREATIVE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Tattoo Placement Advisor', 'tattoo-placement-agent', 'Suggests placements based on body/map.', 'CREATIVE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Story Ending Generator', 'story-ending-agent', 'Suggests endings for any narrative.', 'CREATIVE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Creative Prompt Generator', 'creative-prompt-agent', 'Generates creative prompts for writing, art, or brainstorming.', 'CREATIVE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Poem Format Selector', 'poem-format-agent', 'Suggests poetry forms that match themes.', 'CREATIVE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Photography Coach', 'photography-coach', 'Teaches composition, lighting, camera settings, and editing.', 'CREATIVE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- GAMING AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Minecraft Build Advisor', 'minecraft-builder', 'Suggests building ideas & block palettes.', 'GAMING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('D&D Dungeon Generator', 'dungeon-generator', 'Creates dungeons, maps, traps, and encounters.', 'GAMING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Pokemon Team Builder', 'pokemon-team-builder', 'Suggests competitive Pokemon teams.', 'GAMING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Virtual Dungeon Master', 'virtual-dm-agent', 'Acts as an improvisational DM.', 'GAMING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Game Idea Generator', 'game-idea-generator', 'Generates game concepts.', 'GAMING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Gaming Strategy Coach', 'gaming-strategy-agent', 'Analyzes gameplay strategies for popular games.', 'GAMING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('D&D Character Builder', 'dnd-builder', 'Builds D&D characters with stats, backgrounds, and lore.', 'GAMING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- WELLNESS AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Breakup Recovery Buddy', 'breakup-buddy', 'Gives emotional support and recovery steps after breakups.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Sleep Chronotype Advisor', 'chronotype-agent', 'Determines chronotype and suggests sleep patterns.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Cold Immersion Coach', 'coldplunge-coach', 'Gives safety steps and breathing techniques for cold plunges.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Alarm Optimization Agent', 'alarm-optimizer', 'Suggests alarm schedules to minimize sleep inertia.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Winter Depression Strategy Agent', 'winter-blues-agent', 'Suggests tactics for seasonal depression (non-medical).', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Social Anxiety Rehearsal Agent', 'anxiety-rehearsal-agent', 'Helps rehearse conversations to reduce anxiety.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Anxiety Grounding Coach', 'grounding-agent', 'Provides grounding exercises for acute anxiety.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Micro-Meditation Agent', 'micromeditation-agent', 'Generates fast 1-minute meditation sessions.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Social Energy Manager', 'social-energy-agent', 'Helps users manage introvert/extrovert social energy.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Emotional Boundary Coach', 'boundary-coach', 'Helps users set healthy emotional boundaries.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Speech Anxiety Coach', 'speech-anxiety-agent', 'Gives coping strategies for public speaking stress.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Daily Affirmations Agent', 'affirmation-agent', 'Generates affirmations aligned with users goals and emotional state.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Mood Logger', 'mood-logger', 'Helps users log and analyze mood patterns with suggestions for emotional regulation.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Habit Restart Agent', 'habit-restart', 'Helps users reboot habits theyve failed to keep.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Routine Diagnosis Agent', 'routine-diagnosis-agent', 'Analyzes a users routine and finds weaknesses + fixes.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Goal Tracker', 'goal-tracker', 'Generates progress plans and weekly check-ins for academic or personal goals.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Brain Fog Fixer', 'brainfog-fixer', 'Provides techniques to restore clarity when the user feels mentally stuck.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Stress Release Coach', 'stress-release-agent', 'Gives breathing exercises, grounding techniques, and cognitive calm strategies.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Habit Reminder Agent', 'habit-reminder', 'Generates reminder systems and daily nudges for forming habits.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Habit Formation Coach', 'habit-agent', 'Creates habit-building systems using cues, triggers, reward loops, and tracking strategies.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Habit Accountability Agent', 'habit-accountability', 'Sends behavioral strategies to keep habits on track.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Emotional Support Agent', 'emotional-support-agent', 'Gives empathetic, supportive responses during stress moments.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Motivation Coach', 'motivation-coach', 'Provides motivational pushes tailored to user psychology.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Light Therapy Planner', 'lighttherapy-agent', 'Suggests light therapy routines for mood/energy.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Sleep Environment Optimizer', 'sleep-env-agent', 'Helps optimize bedroom for sleep.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Napping Strategy Agent', 'nap-strategy-agent', 'Suggests nap lengths for energy.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Pillow Type Selector', 'pillow-selector-agent', 'Suggests pillows based on sleep patterns.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Morning Energy Boost Agent', 'morning-boost-agent', 'Suggests ways to wake up with more energy.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Self-Care Routine Builder', 'selfcare-routine-agent', 'Builds emotional, physical, and mental self-care routines.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Quick Mood Check Agent', 'mood-check-agent', 'Performs a fast emotional scan and coping suggestion.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Sleep Sound Selector', 'sleep-sound-agent', 'Recommends sounds for falling asleep faster.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Micro-Motivation Agent', 'micro-motivation-agent', 'Delivers one-sentence motivational boosts.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('People Pleaser Recovery Agent', 'people-pleaser-agent', 'Helps users set boundaries & stop overgiving.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Emotional Burnout Detector', 'burnout-detector-agent', 'Identifies patterns of emotional burnout.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Jealousy Interpreter', 'jealousy-interpreter', 'Helps users understand feelings of jealousy.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Attachment Style Detector', 'attachment-style-agent', 'Identifies attachment style from behavior patterns.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Grooming Routine Builder', 'grooming-agent', 'Creates grooming routines for hair, skin, beard.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Morning Routine Designer', 'morning-routine-design', 'Designs science-backed morning routines for productivity and mood.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Night Routine Optimizer', 'night-routine-optimizer', 'Builds night routines to improve sleep quality and reduce stress.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Sleep Schedule Optimizer', 'sleep-optimizer', 'Designs sleep schedules for optimal circadian alignment.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Night Shift Survival Agent', 'nightshift-agent', 'Helps plan schedules for night-shift workers.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Sleep Debt Calculator', 'sleep-debt-calculator', 'Calculates sleep debt + recovery strategy.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Noise Sensitivity Coach', 'noise-sensitivity-agent', 'Coping strategies for noise-sensitive users.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Climate Anxiety Coach', 'climate-anxiety-agent', 'Provides grounding tools for climate fear.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Screen Time Reducer', 'screentime-agent', 'Suggests ways to reduce screen addiction.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Mindset Reset Coach', 'mindset-reset', 'Provides cognitive reframing strategies for stress, fear, or overwhelm.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Stress Journal Coach', 'stress-journal', 'Builds journaling prompts for emotional regulation.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Dream Interpreter', 'dream-interpreter', 'Interprets dreams using symbolic patterns and emotional context.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Mental Performance Coach', 'performance-coach', 'Teaches focus strategies, productivity systems, cognitive enhancement techniques, and burnout prevention.', 'WELLNESS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

SELECT 'Part 1 complete: TRAVEL, LIFESTYLE, CREATIVE, GAMING, WELLNESS agents inserted' as status;

