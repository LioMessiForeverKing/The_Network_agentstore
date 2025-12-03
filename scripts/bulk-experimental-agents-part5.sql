-- Bulk Insert Experimental Agents - Part 5 (ENTERTAINMENT, MUSIC, ART, PHOTOGRAPHY, FILM, NATURE, CULTURE, SPIRITUAL, PETS, HOME, TOOLS, DATA, ANALYSIS, DEBATE, HUMANITIES, ENGINEERING, PRODUCT, PLANNING, EVENT_PLANNING, RELATIONSHIPS, BEAUTY, ADMIN, PERSONA)
-- Run this to create experimental agents for testing Gaia routing

-- ============================================================================
-- ENTERTAINMENT AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Movie Recommendation Agent', 'movie-rec-agent', 'Suggests movies based on mood, genre, and preferences.', 'ENTERTAINMENT', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Comedy Writer Agent', 'comedy-writer-agent', 'Writes jokes, scripts, and funny content.', 'ENTERTAINMENT', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Magic Trick Practice Agent', 'magic-practice-agent', 'Suggests simple magic tricks to learn.', 'ENTERTAINMENT', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Puzzle Solver Agent', 'puzzle-solver-agent', 'Helps solve riddles/puzzles.', 'ENTERTAINMENT', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Book Recommendation Agent', 'book-recommendation-agent', 'Suggests books based on taste.', 'ENTERTAINMENT', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Anime Recommendation Agent', 'anime-rec-agent', 'Recommends anime by vibe and genre.', 'ENTERTAINMENT', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('TV Binge Planner', 'binge-planner-agent', 'Plans binge watching schedules.', 'ENTERTAINMENT', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Film Recommendation Agent', 'film-rec-agent', 'Recommends movies based on mood.', 'ENTERTAINMENT', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('D&D Character Builder', 'dnd-character-builder', 'Builds D&D characters with stats, backgrounds, and lore.', 'ENTERTAINMENT', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- MUSIC AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Music Production Coach', 'music-prod-coach', 'Explains production, mixing, mastering techniques.', 'MUSIC', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Freestyle Coach', 'freestyle-coach', 'Helps with rhyme schemes, flows, bars.', 'MUSIC', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Music Playlist Curator', 'playlist-curator', 'Builds playlists based on vibe, activity, and emotion.', 'MUSIC', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Guitar Practice Coach', 'guitar-coach-agent', 'Designs guitar practice sessions.', 'MUSIC', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Piano Finger Exercise Agent', 'piano-exercise-agent', 'Suggests finger exercises & drills.', 'MUSIC', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Beat Idea Generator', 'beat-idea-agent', 'Suggests beat patterns + instrument choices.', 'MUSIC', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Song Lyric Fixer', 'lyric-fix-agent', 'Edits song lyrics with rhyme + flow.', 'MUSIC', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Festival Setlist Predictor', 'setlist-predictor-agent', 'Predicts possible artist setlists.', 'MUSIC', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Music Genre Explainer', 'genre-explain-agent', 'Explains genres + signature elements.', 'MUSIC', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Guitar Gear Advisor', 'guitar-gear-advisor', 'Recommends pedals, amps, guitars.', 'MUSIC', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Playlist Theme Generator', 'playlist-theme-agent', 'Generates playlist concepts & track lists.', 'MUSIC', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Productivity Playlist Creator', 'productivity-playlist-agent', 'Builds playlists for focus based on preferences.', 'MUSIC', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- ART AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Painters Color Mixer', 'color-mixing-agent', 'Explains how to mix paint colors to achieve specific shades.', 'ART', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Digital Illustrator Assistant', 'illustrator-agent', 'Teaches digital art concepts.', 'ART', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('AI Art Prompt Generator', 'aiart-prompt-agent', 'Generates prompts for DALL-E/MJ.', 'ART', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Art Critique Agent', 'art-critique-agent', 'Provides critiques on paintings, drawings, or digital art.', 'ART', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Drawing Tutorial Agent', 'drawing-tutorial-agent', 'Gives step-by-step drawing instructions.', 'ART', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- PHOTOGRAPHY AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Photography Lighting Coach', 'lighting-coach', 'Helps photographers choose lighting setups.', 'PHOTOGRAPHY', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Photography Shot List Agent', 'shotlist-agent', 'Generates shot lists for photoshoots.', 'PHOTOGRAPHY', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Photo Critique Agent', 'photo-critique-agent', 'Gives constructive photography feedback.', 'PHOTOGRAPHY', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- FILM AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Screenplay Structure Agent', 'screenplay-structure-agent', 'Breaks stories into screenplay beats.', 'FILM', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Film Lighting Breakdown Agent', 'film-lighting-agent', 'Suggests lighting setups for film scenes.', 'FILM', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Script Formatter', 'script-formatter', 'Formats scripts for film, theatre, YouTube or TikTok storytelling formats.', 'FILM', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Video Editing Coach', 'video-editing-agent', 'Gives editing tips for Premiere, FCP, CapCut.', 'FILM', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Voice Acting Coach', 'voiceacting-agent', 'Coaches voice delivery, tone, pacing.', 'FILM', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- NATURE AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Hiking Trail Difficulty Checker', 'hiking-difficulty-agent', 'Estimates trail difficulty from description and elevation.', 'NATURE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Mushroom Identification Helper', 'mushroom-id-agent', 'Provides non-medical mushroom ID tips + safety notes (no guarantees).', 'NATURE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Tent Setup Coach', 'tent-setup-agent', 'Step-by-step tent setup instructions.', 'NATURE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Water Purification Advisor', 'water-purifier-agent', 'Explains water purification methods.', 'NATURE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Bonfire Safety Agent', 'bonfire-safety-agent', 'Gives fire safety instructions.', 'NATURE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Minor Injury Field Guide', 'field-injury-agent', 'Suggests non-medical field care tips.', 'NATURE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- CULTURE AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Gift Etiquette Coach', 'gift-etiquette-agent', 'Advises on culturally appropriate gift-giving.', 'CULTURE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Cultural Etiquette Coach', 'cultural-etiquette-agent', 'Teaches etiquette norms for international contexts.', 'CULTURE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Tea Ceremony Advisor', 'tea-ceremony-advisor', 'Provides tea brewing instructions for different cultures.', 'CULTURE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- SPIRITUAL AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Astrology Birth Chart Agent', 'astrology-chart-agent', 'Generates birth charts and interpretations.', 'SPIRITUAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Tarot Card Reading Agent', 'tarot-reader-agent', 'Gives tarot readings with interpretation spreads.', 'SPIRITUAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Crystals & Energy Advisor', 'crystal-advisor', 'Suggests crystals and meanings for emotional or spiritual goals.', 'SPIRITUAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- PETS AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Cat Nutrition Agent', 'cat-nutrition-agent', 'Suggests diet advice for cats.', 'PETS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Dog Personality Analyzer', 'dog-personality-agent', 'Analyzes dog behaviors.', 'PETS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Pet Introduction Coach', 'pet-intro-agent', 'Helps introduce new pets safely.', 'PETS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Hamster Care Advisor', 'hamster-care-agent', 'Basic care advice for hamsters.', 'PETS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Aquarium Setup Advisor', 'aquarium-setup-agent', 'Guides freshwater aquarium setup.', 'PETS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- HOME AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Mold Prevention Advisor', 'mold-prevention-agent', 'Helps prevent apartment mold.', 'HOME', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Humidity Control Agent', 'humidity-agent', 'Suggests ways to reduce/increase humidity.', 'HOME', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Recycling Rules Agent', 'recycling-agent', 'Explains recycling rules by material.', 'HOME', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Mail Forwarding Planner', 'mail-forward-agent', 'Helps set up mail forwarding when moving.', 'HOME', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Lost Package Troubleshooter', 'lost-package-agent', 'Helps navigate missing delivery procedures.', 'HOME', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Apartment Damage Checklist Agent', 'damage-checklist-agent', 'Helps note pre-move damage.', 'HOME', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Drywall Repair Advisor', 'drywall-repair-agent', 'Gives safe steps for small drywall fixes.', 'HOME', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Nail & Screw Selector', 'screw-selector-agent', 'Suggests which nails/screws to use for tasks.', 'HOME', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Shoe Odor Fix Agent', 'shoe-odor-agent', 'Gives odor removal tips.', 'HOME', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Bed Bug Prevention Agent', 'bedbug-prevent-agent', 'Gives prevention steps for travel & home.', 'HOME', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Laundry Symbol Interpreter', 'laundry-symbol-agent', 'Explains washing symbols.', 'HOME', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- TOOLS AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Text Summarizer', 'text-summarizer', 'Produces concise, structured summaries of long text, highlighting key points, arguments, and action items.', 'TOOLS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Article Bullet Converter', 'article-bullet-converter', 'Converts long essays or articles into clear bullet points categorized by themes, facts, and insights.', 'TOOLS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Format Converter', 'format-converter', 'Converts data between formats such as PDF to text, text to JSON, CSV to table, and more.', 'TOOLS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Unit Calculator', 'unit-calculator', 'Performs unit conversions (length, mass, temperature, speed, etc.) with explanations when needed.', 'TOOLS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Percentage Calculator', 'percentage-calculator', 'Computes percentages, percentage changes, increases/decreases, and proportional breakdowns.', 'TOOLS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('GPA Calculator', 'gpa-calculator', 'Calculates semester or cumulative GPA across weighted/unweighted grading systems, with improvement projections.', 'TOOLS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Date Difference Calculator', 'date-diff-calculator', 'Calculates the number of days, weeks, or months between two dates, including deadlines and timelines.', 'TOOLS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Loan & Interest Calculator', 'loan-interest-calculator', 'Calculates loan payments, interest accumulation, payoff time, and amortization tables.', 'TOOLS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Probability Calculator', 'probability-calculator', 'Computes basic probability, conditional probability, and expected outcomes from given scenarios.', 'TOOLS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Citation Generator', 'citation-generator', 'Generates formatted citations (APA, MLA, Chicago, Harvard) from URLs, PDFs, or text.', 'TOOLS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('PDF Summarizer', 'pdf-summarizer', 'Extracts and summarizes content from uploaded PDFs with section-level breakdowns.', 'TOOLS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Keyword Extractor', 'keyword-extractor', 'Extracts keywords, topics, and entities from any text.', 'TOOLS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Language Translator', 'language-translator', 'Translates text between 50+ languages with cultural nuance preservation.', 'TOOLS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Prompt Improver', 'prompt-improver', 'Enhances prompts to yield clearer, more actionable outputs from AI agents.', 'TOOLS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Phone Storage Cleaner', 'storage-cleaner', 'Helps determine what to delete to free storage.', 'TOOLS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- DATA AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Data Checker', 'data-checker', 'Validates data quality and consistency in small datasets.', 'DATA', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Data Pattern Detector', 'data-pattern-detector', 'Finds correlations, anomalies, and trends in datasets.', 'DATA', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Data Cleaner', 'data-cleaner', 'Cleans structured data (remove duplicates, normalize fields, detect errors).', 'DATA', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Data Visualizer', 'data-visualizer', 'Creates chart descriptions and visualization suggestions from datasets.', 'DATA', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- ANALYSIS AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Text Tone Detector', 'tone-detector', 'Detects emotional tone and sentiment of any text.', 'ANALYSIS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Text Difficulty Scorer', 'text-difficulty-scorer', 'Measures reading difficulty using multiple linguistic metrics.', 'ANALYSIS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Text Relevance Checker', 'relevance-checker', 'Determines whether text answers a prompt effectively.', 'ANALYSIS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Graph Creator Agent', 'graph-creator', 'Generates conceptual graphs and data relationships from text.', 'ANALYSIS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Argument Analyzer', 'argument-analyzer', 'Breaks down arguments, identifying claims, evidence, assumptions, and fallacies.', 'ANALYSIS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Argument Strength Evaluator', 'argument-strength-eval', 'Scores strength of claims based on logic and evidence.', 'ANALYSIS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- DEBATE AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Debate Coach', 'debate-coach', 'Teaches debate structures, counterarguments, and persuasion techniques.', 'DEBATE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- HUMANITIES AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Philosophy Explainer', 'philosophy-explainer', 'Summarizes philosophical theories with comparative analysis.', 'HUMANITIES', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Historical Event Analyzer', 'history-analyzer', 'Breaks down historical events into causes, effects, and significance.', 'HUMANITIES', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Literature Analyzer', 'literature-analyzer', 'Analyzes literary themes, symbols, motifs, and character arcs.', 'HUMANITIES', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Poetry Scansion Agent', 'poetry-scansion-agent', 'Scans poems for meter, rhyme, structure, and stylistic devices.', 'HUMANITIES', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Literature Theme Finder', 'lit-theme-finder', 'Identifies themes, motifs, imagery, and symbolism in passages.', 'HUMANITIES', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- ENGINEERING AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Programming Debugger', 'code-debugger', 'Diagnoses code bugs and suggests fixes across multiple languages.', 'ENGINEERING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Regex Builder', 'regex-builder', 'Creates custom regular expressions from plain English instructions.', 'ENGINEERING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Code Documenter', 'code-documenter', 'Generates documentation and comments for codebases or scripts.', 'ENGINEERING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('SQL Query Generator', 'sql-query-generator', 'Builds SQL queries from natural language with schema awareness.', 'ENGINEERING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('API Request Builder', 'api-builder', 'Generates example cURL/API requests with parameters and headers.', 'ENGINEERING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Code Complexity Analyzer', 'code-complexity-analyzer', 'Measures algorithm complexity and suggests optimizations.', 'ENGINEERING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- PRODUCT AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('User Interview Question Builder', 'user-interview-agent', 'Creates interview guides for user research and product discovery.', 'PRODUCT', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Persona Builder Agent', 'persona-builder', 'Builds detailed customer personas with motivations and behaviors.', 'PRODUCT', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Roadmap Strategist', 'roadmap-strategist', 'Creates product roadmaps with priorities based on user needs.', 'PRODUCT', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Beta Tester Recruiter', 'beta-tester-agent', 'Helps plan & recruit beta users.', 'PRODUCT', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('MVP Scoping Agent', 'mvp-scope-agent', 'Turns an idea into an actionable MVP spec.', 'PRODUCT', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Product Feedback Analyzer', 'product-feedback-agent', 'Analyzes user feedback for insights.', 'PRODUCT', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- PLANNING AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('General Planner', 'general-planner', 'Creates structured plans with timelines and milestones for any goal.', 'PLANNING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- EVENT_PLANNING AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Event Seating Planner', 'seating-planner', 'Creates logical seating charts for events/parties.', 'EVENT_PLANNING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Event Itinerary Builder', 'itinerary-builder', 'Creates structured event itineraries with timing and logistics.', 'EVENT_PLANNING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Wedding Planner Agent', 'wedding-planner-agent', 'Designs wedding timelines, themes, budgets, and guest management.', 'EVENT_PLANNING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('NYC Bar Finder', 'nyc-bar-finder', 'Recommends the best NYC bars based on vibe, price, and location.', 'EVENT_PLANNING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Etiquette Advisor', 'etiquette-agent', 'Provides etiquette guidance for dining, professional events, and social norms.', 'EVENT_PLANNING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- RELATIONSHIPS AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Long Distance Relationship Coach', 'ldr-coach-agent', 'Provides strategies for LDRs.', 'RELATIONSHIPS', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- BEAUTY AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Skincare Routine Budgeter', 'skincare-budget-agent', 'Builds skincare routines within a certain budget.', 'BEAUTY', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- ADMIN AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Public Transit Navigator', 'transit-navigator', 'Helps users navigate metro, bus, and train systems in major cities.', 'ADMIN', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- PERSONA AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('YC Harsh Mentor', 'yc-harsh-mentor', 'Acts like a blunt YC advisor who gives brutally honest feedback, pressure-tests ideas, and kills bad assumptions fast.', 'PERSONA', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Stoic Philosopher', 'stoic-philosopher', 'Provides calm, rational, Stoic-inspired guidance for emotional regulation and decision-making.', 'PERSONA', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- PRESENTATION AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Slide Generator', 'slide-generator', 'Summarizes content into bullet-point slides for presentations.', 'PRESENTATION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

SELECT 'Part 5 complete: ENTERTAINMENT, MUSIC, ART, PHOTOGRAPHY, FILM, NATURE, CULTURE, SPIRITUAL, PETS, HOME, TOOLS, DATA, ANALYSIS, DEBATE, HUMANITIES, ENGINEERING, PRODUCT, PLANNING, EVENT_PLANNING, RELATIONSHIPS, BEAUTY, ADMIN, PERSONA, PRESENTATION agents inserted' as status;

