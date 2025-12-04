
// Test script for AgentRank v0 Logic
// Run with: deno run agent_store/scripts/test_agent_rank.ts

interface Agent {
  id: string;
  name: string;
  slug: string;
  domain: string;
  agent_capabilities: any[];
  ranking_debug?: any;
}

const mockAgents: Agent[] = [
  {
    id: "1",
    name: "High Performer",
    slug: "high-perf",
    domain: "FINANCE",
    agent_capabilities: [{
      recent_success_rate: 0.95,
      success_rate: 0.90,
      validation_count: 100,
      average_latency_ms: 500, // Fast
      passport_data: { metrics: { average_validator_score: 0.92 } }
    }]
  },
  {
    id: "2",
    name: "Low Performer",
    slug: "low-perf",
    domain: "FINANCE",
    agent_capabilities: [{
      recent_success_rate: 0.60,
      success_rate: 0.65,
      validation_count: 80,
      average_latency_ms: 2000, // Slower
      passport_data: { metrics: { average_validator_score: 0.70 } }
    }]
  },
  {
    id: "3",
    name: "New Agent",
    slug: "new-agent",
    domain: "FINANCE",
    agent_capabilities: [{
      recent_success_rate: 0.50, // Default
      success_rate: 0.50,
      validation_count: 5, // < 50 uses (Newness penalty)
      average_latency_ms: 1000,
      passport_data: {}
    }]
  },
  {
    id: "4",
    name: "Wrong Domain",
    slug: "wrong-domain",
    domain: "HEALTH", // Mismatch
    agent_capabilities: [{
      recent_success_rate: 0.99,
      success_rate: 0.99,
      validation_count: 200,
      average_latency_ms: 500,
      passport_data: { metrics: { average_validator_score: 0.99 } }
    }]
  }
];

function calculateRank(agents: Agent[], taskType: string) {
  console.log(`\n--- Ranking Agents for Task: ${taskType} ---`);
  
  agents.forEach(agent => {
    const caps = agent.agent_capabilities?.[0] || {};
    const passportData = caps.passport_data || {};
    
    // SRr: Recent Success Rate
    const SRr = caps.recent_success_rate !== undefined ? caps.recent_success_rate : 0.5;
    
    // SRg: Global Success Rate
    const SRg = caps.success_rate !== undefined ? caps.success_rate : 0.5;
    
    // V: Average Validator Score
    const V = passportData.metrics?.average_validator_score !== undefined 
      ? passportData.metrics.average_validator_score 
      : SRg; 
    
    // L: Normalized Latency (0-1)
    const latency = caps.average_latency_ms || 1000;
    const L = Math.max(0, 1 - (latency / 5000));
    
    // D: Domain Alignment
    const D = agent.domain === taskType ? 1 : 0;
    
    // N: Newness Penalty
    const totalUses = caps.validation_count || caps.total_uses || 0;
    const N = totalUses < 50 ? 1 : 0;
    
    // Formula
    const score = (0.30 * SRr) + 
                  (0.20 * SRg) + 
                  (0.20 * V) + 
                  (0.15 * L) + 
                  (0.10 * D) - 
                  (0.05 * N);
    
    agent.ranking_debug = {
      score,
      components: { SRr, SRg, V, L, D, N }
    };
  });

  // Sort
  agents.sort((a, b) => (b.ranking_debug?.score || 0) - (a.ranking_debug?.score || 0));

  // Output results
  agents.forEach((a, i) => {
    const c = a.ranking_debug.components;
    console.log(`${i + 1}. ${a.name} (${a.slug})`);
    console.log(`   Score: ${a.ranking_debug.score.toFixed(4)}`);
    console.log(`   Breakdown: 0.3*${c.SRr} + 0.2*${c.SRg} + 0.2*${c.V} + 0.15*${c.L.toFixed(2)} + 0.1*${c.D} - 0.05*${c.N}`);
  });
}

// Run Test
calculateRank(mockAgents, "FINANCE");

