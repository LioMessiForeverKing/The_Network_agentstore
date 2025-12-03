-- Master Script: Create All Experimental Agents
-- 
-- ============================================================================
-- IMPORTANT: FOR SUPABASE SQL EDITOR
-- ============================================================================
-- The Supabase SQL Editor does NOT support \i or \echo commands.
-- You must run each script SEPARATELY in this order:
--
--   1. bulk-experimental-agents-part1.sql  (TRAVEL, LIFESTYLE, CREATIVE, GAMING, WELLNESS)
--   2. bulk-experimental-agents-part2.sql  (HEALTH, FASHION, FOOD, FITNESS, TECH)
--   3. bulk-experimental-agents-part3.sql  (EDUCATION, PRODUCTIVITY, BUSINESS, CAREER)
--   4. bulk-experimental-agents-part4.sql  (SOCIAL, COMMUNICATION, WRITING, FINANCE, LEGAL, MARKETING, DESIGN)
--   5. bulk-experimental-agents-part5.sql  (ENTERTAINMENT, MUSIC, ART, PHOTOGRAPHY, FILM, etc.)
--   6. bulk-experimental-agents-capabilities.sql  (Creates agent_capabilities entries)
--
-- Then run this script to verify the results.
-- ============================================================================

-- ============================================================================
-- VERIFICATION QUERIES - Run these after all parts are complete
-- ============================================================================

-- Count total experimental agents
SELECT 
  'Total Experimental Agents: ' || COUNT(*)::text as summary
FROM agents 
WHERE status = 'EXPERIMENTAL';

-- Count agents by domain
SELECT 
  domain,
  COUNT(*) as agent_count
FROM agents
WHERE status = 'EXPERIMENTAL'
GROUP BY domain
ORDER BY agent_count DESC;

-- Count agents with capabilities
SELECT 
  COUNT(DISTINCT a.id) as total_experimental_agents,
  COUNT(DISTINCT ac.agent_id) as agents_with_capabilities,
  COUNT(DISTINCT a.id) - COUNT(DISTINCT ac.agent_id) as agents_missing_capabilities
FROM agents a
LEFT JOIN agent_capabilities ac ON a.id = ac.agent_id
WHERE a.status = 'EXPERIMENTAL';

-- Sample of created agents
SELECT 
  name,
  slug,
  domain,
  status
FROM agents
WHERE status = 'EXPERIMENTAL'
ORDER BY created_at DESC
LIMIT 20;

