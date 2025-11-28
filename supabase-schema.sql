-- Agentic App Store Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Agents Table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  domain TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Agent Passports Table (Performance metrics for agents)
CREATE TABLE IF NOT EXISTS agent_passports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  success_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.0 CHECK (success_rate >= 0 AND success_rate <= 1),
  average_latency_ms INTEGER NOT NULL DEFAULT 0,
  total_uses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id)
);

-- 3. Agent Usage Logs Table (User interaction history)
CREATE TABLE IF NOT EXISTS agent_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  task_type TEXT,
  success_flag BOOLEAN NOT NULL DEFAULT false,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_slug ON agents(slug);
CREATE INDEX IF NOT EXISTS idx_agent_passports_agent_id ON agent_passports(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_logs_user_id ON agent_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_logs_agent_id ON agent_usage_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_logs_created_at ON agent_usage_logs(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agents (public read, admin write)
CREATE POLICY "Agents are viewable by everyone" ON agents
  FOR SELECT USING (true);

-- RLS Policies for agent_passports (public read)
CREATE POLICY "Agent passports are viewable by everyone" ON agent_passports
  FOR SELECT USING (true);

-- RLS Policies for agent_usage_logs (users can only see their own logs)
CREATE POLICY "Users can view their own usage logs" ON agent_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage logs" ON agent_usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_passports_updated_at BEFORE UPDATE ON agent_passports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional - remove if you don't want sample data)
INSERT INTO agents (name, slug, description, domain, status) VALUES
  ('Study Planner Agent', 'study-planner', 'Helps students create personalized study plans', 'education', 'ACTIVE'),
  ('Financial Advisor Agent', 'financial-advisor', 'Provides financial planning and investment advice', 'finance', 'ACTIVE'),
  ('Code Review Agent', 'code-review', 'Reviews code and suggests improvements', 'development', 'ACTIVE')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample agent passports
INSERT INTO agent_passports (agent_id, success_rate, average_latency_ms, total_uses)
SELECT 
  id,
  0.85 + (RANDOM() * 0.15), -- Random success rate between 85-100%
  200 + (RANDOM() * 300)::INTEGER, -- Random latency between 200-500ms
  (RANDOM() * 1000)::INTEGER -- Random total uses up to 1000
FROM agents
ON CONFLICT (agent_id) DO NOTHING;


