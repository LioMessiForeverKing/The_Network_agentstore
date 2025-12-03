-- Bulk Insert Experimental Agents - Part 4 (SOCIAL, COMMUNICATION, WRITING, FINANCE, LEGAL, MARKETING, DESIGN)
-- Run this to create experimental agents for testing Gaia routing

-- ============================================================================
-- SOCIAL AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Boundary-Setting Script Generator', 'boundaries-script', 'Generates scripts for saying no politely.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Roommate Problem Analyzer', 'roommate-problem-agent', 'Diagnoses roommate conflicts and suggests mediation strategies.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Thumbnail Caption Writer', 'thumbnail-caption-agent', 'Writes compelling thumbnail text for YouTube videos.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Social Media Caption Writer', 'caption-writer', 'Creates captions for IG, TikTok, or Twitter in various tones.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Text Womanizer Detector', 'intention-detector', 'Analyzes flirty text to detect intentions (fun).', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Rent Negotiation Agent', 'rent-negotiator', 'Generates scripts to negotiate rent with landlords.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Gift Wrapping Style Advisor', 'giftwrap-advisor', 'Suggests wrapping styles and techniques based on theme.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Social Battery Planner', 'social-battery-agent', 'Helps manage energy for social events.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Do I Like Them? Analyzer', 'crush-analyzer-agent', 'Helps users understand romantic feelings.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Friend Group Dynamics Analyst', 'friend-dynamics-agent', 'Analyzes friend group behavior patterns.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Holiday Gift Planner', 'holiday-gift-agent', 'Suggests gifts for each holiday context.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Party Games Generator', 'party-games-agent', 'Suggests fun party games based on group size.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Personal Coolness Strategist', 'coolness-agent', 'Helps refine personal vibe and charisma.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Wingman Script Agent', 'wingman-script-agent', 'Generates conversational scripts for flirting.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Should I Go? Event Decider', 'event-decider', 'Helps decide if an event is worth attending.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Sleepover Activity Planner', 'sleepover-agent', 'Suggests activities & snacks for sleepovers.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Club Night Gameplan Agent', 'club-gameplan-agent', 'Helps plan outfits, logistics, pregames, exits.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Social Calendar Agent', 'social-calendar-agent', 'Helps plan balanced social schedules.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Roommate Conflict Resolver', 'roommate-conflict', 'Mediates conflicts between roommates by generating scripts + compromise plans.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Workplace Conflict Resolver', 'workplace-conflict-agent', 'Mediates workplace issues and suggests scripts + solutions.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Social Script Coach', 'social-script-coach', 'Generates scripts for social interactions, flirting, and conversations.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Friendship Builder', 'friendship-builder', 'Helps users form friendships with strategies + conversation seeds.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Date Night Planner', 'datenight-planner', 'Generates tailored date ideas based on personality and vibe.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Conflict Mediation Agent', 'mediation-agent', 'Provides conflict resolution steps and scripts for personal disputes.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Small Talk Starter Pack', 'smalltalk-agent', 'Provides safe, easy conversation starters.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Gift Idea Generator', 'gift-idea-generator', 'Suggests personalized gift ideas based on relationship + interests.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Relationship Advice Agent', 'relationship-agent', 'Gives level-headed relationship guidance with communication strategies.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Dating Profile Optimizer', 'dating-profile-agent', 'Improves dating bios, photo choices, first messages, and conversation tactics with personalized suggestions.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Party Planner Agent', 'party-planner-agent', 'Designs party concepts, guest lists, themes, and schedules.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Roommate Matcher', 'roommate-matcher', 'Suggests roommate compatibility profiles and red flags.', 'SOCIAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- COMMUNICATION AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Text Tone Shifter', 'tone-shifter', 'Changes text tone (friendly, serious, excited, neutral).', 'COMMUNICATION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Text Softener', 'text-softener', 'Softens harsh texts into gentler language.', 'COMMUNICATION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Apology Writer', 'apology-writer', 'Writes apologies in different tones based on scenario.', 'COMMUNICATION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Email Subject Line Generator', 'subjectline-generator', 'Generates high-conversion subject lines for different contexts.', 'COMMUNICATION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Out-of-Office Message Writer', 'ooo-writer', 'Writes professional OOO messages.', 'COMMUNICATION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Email Thread Summarizer', 'email-thread-summary', 'Summarizes long email threads into actionable bullets.', 'COMMUNICATION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Email Rewriter', 'email-rewriter', 'Rewrites emails in different tones (professional, friendly, urgent, apologetic).', 'COMMUNICATION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Public Speaking Script Coach', 'speech-script-agent', 'Writes speeches with rhetorical structure and pacing.', 'COMMUNICATION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Website Copy Editor', 'website-copy-agent', 'Edits landing page copy for clarity + conversions.', 'COMMUNICATION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Corporate Jargon Translator', 'jargon-translator-agent', 'Turns corporate jargon into plain English.', 'COMMUNICATION', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- WRITING AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Essay Introduction Writer', 'intro-writer', 'Generates compelling essay introductions with hooks and positioning.', 'WRITING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Essay Conclusion Writer', 'conclusion-writer', 'Writes strong conclusions that synthesize arguments and give closure.', 'WRITING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Text Expander', 'text-expander', 'Expands short notes into detailed paragraphs with coherent flow.', 'WRITING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Thesis Statement Generator', 'thesis-generator', 'Produces strong thesis statements with arguable positions.', 'WRITING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Counterargument Builder', 'counterargument-builder', 'Generates counterclaims and rebuttals for essays or debates.', 'WRITING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Essay Feedback Agent', 'essay-feedback-agent', 'Provides critique on argumentation, clarity, flow, grammar, and structure.', 'WRITING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Critique Generator', 'critique-generator', 'Writes critiques of essays, art, or arguments.', 'WRITING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Grant Writer', 'grant-writer', 'Generates grant proposals and narratives for research or nonprofits.', 'WRITING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Content Paraphraser', 'content-paraphraser', 'Rewrites text while preserving meaning, avoiding plagiarism and improving clarity.', 'WRITING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Text Polisher', 'text-polisher', 'Improves grammar, readability, clarity, and tone for any written text.', 'WRITING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Grammar Corrector', 'grammar-corrector', 'Fixes grammar, punctuation, and sentence structure.', 'WRITING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Essay Outline Agent', 'essay-outline-agent', 'Creates structured essay outlines with thesis options, paragraph flow, evidence suggestions, and transitions.', 'WRITING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- FINANCE AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Financial Model Builder', 'financial-model-builder', 'Generates simplified financial models with revenue, CAC, margin projections.', 'FINANCE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Personal Finance Planner', 'finance-planner', 'Creates personal financial plans with saving/investing strategies.', 'FINANCE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Tax Estimator', 'tax-estimator', 'Estimates taxes based on income, state, and deductions.', 'FINANCE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Financial Projection Builder', 'financial-projection-agent', 'Creates 1-5 year projections.', 'FINANCE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Debt Reduction Planner', 'debt-reduction-agent', 'Creates payoff strategies (snowball/avalanche) for debt.', 'FINANCE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Inflation Impact Calculator', 'inflation-calculator', 'Shows how inflation affects budgets, savings, and pricing.', 'FINANCE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Portfolio Allocator', 'portfolio-allocator', 'Suggests investment portfolio allocations based on risk.', 'FINANCE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Budgeting Coach', 'budgeting-agent', 'Builds personal budgets, tracks expenses, and recommends saving strategies based on income + behavior patterns.', 'FINANCE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Frugal Lifestyle Planner', 'frugal-agent', 'Creates plans to save money day-to-day.', 'FINANCE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Apartment Budget Planner', 'apartment-budget-planner', 'Helps users understand costs of renting, deposits, utilities, and budgeting.', 'FINANCE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Credit Score Advisor', 'credit-score-advisor', 'Explains credit scores, how to improve them, and common pitfalls.', 'FINANCE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Car Buying Strategy Agent', 'car-buying-agent', 'Helps negotiate car purchases.', 'FINANCE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Insurance Explainer', 'insurance-explainer', 'Explains health, car, renters, and travel insurance in simple terms.', 'FINANCE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Crypto Alpha Digest', 'crypto-alpha-digest', 'Summarizes todays crypto news and alpha leaks into digestible insights.', 'FINANCE', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- LEGAL AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Startup Legal Question Helper', 'legal-question-agent', 'Explains legal concepts (non-advice, purely educational).', 'LEGAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Lease Agreement Interpreter', 'lease-interpreter', 'Explains lease clauses in simple language (non-legal).', 'LEGAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Legal Contract Simplifier', 'contract-simplifier', 'Translates complex legal contracts into simple language.', 'LEGAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Privacy Policy Generator', 'privacy-policy-generator', 'Drafts privacy policies tailored to a products data flows.', 'LEGAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Startup Compliance Agent', 'compliance-agent', 'Explains filing requirements, incorporation steps, and regulations.', 'LEGAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Legal Entity Selector', 'entity-selector-agent', 'Explains LLC vs C-Corp vs S-Corp differences.', 'LEGAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Contract Clause Simplifier', 'clause-simplifier-agent', 'Rewrites contract language in plain English.', 'LEGAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Policy Compliance Checker', 'compliance-check-agent', 'Summarizes compliance requirements.', 'LEGAL', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- MARKETING AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Brand Voice Generator', 'brand-voice-generator', 'Crafts a companys brand voice, tone, and messaging pillars.', 'MARKETING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Ad Copywriter', 'ad-copywriter', 'Generates ad copy for Meta, Google, TikTok, and landing pages.', 'MARKETING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Social Content Generator', 'content-generator', 'Produces content ideas, hooks, and scripts for social platforms.', 'MARKETING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Email Drip Sequence Designer', 'drip-sequence-agent', 'Designs automated email drip sequences.', 'MARKETING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Brand Positioning Agent', 'brand-positioning-agent', 'Defines brand pillars and positioning.', 'MARKETING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Product Storytelling Agent', 'product-storytelling-agent', 'Crafts compelling product narratives.', 'MARKETING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Brand Voice Generator', 'brand-voice-agent', 'Creates brand voice guidelines.', 'MARKETING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Competitive Positioning Agent', 'positioning-agent', 'Builds positioning statements comparing competitors.', 'MARKETING', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- ============================================================================
-- DESIGN AGENTS
-- ============================================================================

INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES
  ('Visual Aesthetic Generator', 'aesthetic-generator', 'Suggests aesthetics with references (dark academia, coquette, cyber).', 'DESIGN', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Text Contrast Checker', 'contrast-checker', 'Evaluates accessibility and readability of text for design projects.', 'DESIGN', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Apartment Lighting Planner', 'apartment-light-agent', 'Suggests lighting setups for rooms.', 'DESIGN', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Home Feng Shui Agent', 'fengshui-agent', 'Suggests home layout changes based on feng shui principles.', 'DESIGN', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Interior Color Palette Agent', 'color-palette-agent', 'Generates color palette recommendations for interiors.', 'DESIGN', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Creative Moodboard Agent', 'moodboard-agent', 'Creates concept moodboards (text-based).', 'DESIGN', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Graphic Style Advisor', 'graphic-style-agent', 'Suggests art styles (flat, vaporwave, bauhaus).', 'DESIGN', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Infographic Layout Planner', 'infographic-layout-agent', 'Designs text-based layout structures.', 'DESIGN', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Color Theory Coach', 'color-theory-agent', 'Explains color theory for designers.', 'DESIGN', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Monitor Color Calibration Agent', 'monitor-calibration-agent', 'Helps calibrate monitor colors.', 'DESIGN', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Room Decor Planner', 'decor-planner', 'Helps design room layouts, color palettes, and aesthetic decisions.', 'DESIGN', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Minimalist Coach', 'minimalist-coach', 'Guides decluttering routines and minimalism lifestyle choices.', 'DESIGN', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('Interior Aesthetic Agent', 'interior-aesthetic-agent', 'Suggests aesthetics (Japandi, minimalist, brutalist) with mood boards.', 'DESIGN', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb),
  ('UX Feedback Agent', 'ux-feedback-agent', 'Gives actionable UX/UI feedback for screens.', 'DESIGN', 'EXPERIMENTAL', 'INTERNAL_FUNCTION', '{"function_name": "experimental-agent", "endpoint": "/functions/v1/experimental-agent", "method": "POST"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

SELECT 'Part 4 complete: SOCIAL, COMMUNICATION, WRITING, FINANCE, LEGAL, MARKETING, DESIGN agents inserted' as status;

