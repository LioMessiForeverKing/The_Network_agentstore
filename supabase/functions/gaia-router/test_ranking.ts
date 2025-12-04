
// Mock data for agents with different profiles
const mockAgents = [
  {
    id: '1',
    slug: 'high-performer',
    domain: 'TEST',
    agent_capabilities: [{
      recent_success_rate: 0.95,
      success_rate: 0.90,
      validation_count: 200, // Established
      average_latency_ms: 500, // Fast
      passport_data: { metrics: { average_validator_score: 0.92 } }
    }]
  },
  {
    id: '2',
    slug: 'slow-but-reliable',
    domain: 'TEST',
    agent_capabilities: [{
      recent_success_rate: 0.98,
      success_rate: 0.98,
      validation_count: 500, // Very Established
      average_latency_ms: 4000, // Slow
      passport_data: { metrics: { average_validator_score: 0.99 } }
    }]
  },
  {
    id: '3',
    slug: 'fast-but-fail',
    domain: 'TEST',
    agent_capabilities: [{
      recent_success_rate: 0.40,
      success_rate: 0.50,
      validation_count: 150,
      average_latency_ms: 100, // Very Fast
      passport_data: { metrics: { average_validator_score: 0.45 } }
    }]
  },
  {
    id: '4',
    slug: 'new-promising',
    domain: 'TEST',
    agent_capabilities: [{
      recent_success_rate: 0.90, // Good start
      success_rate: 0.90,
      validation_count: 10, // New (< 50)
      average_latency_ms: 800,
      passport_data: { metrics: { average_validator_score: 0.90 } }
    }]
  },
  {
    id: '5',
    slug: 'wrong-domain',
    domain: 'OTHER', // Domain mismatch
    agent_capabilities: [{
      recent_success_rate: 0.90,
      success_rate: 0.90,
      validation_count: 200,
      average_latency_ms: 800,
      passport_data: { metrics: { average_validator_score: 0.90 } }
    }]
  }
];

function calculateRank(agent: any, taskType: string) {
    const caps = agent.agent_capabilities?.[0] || {};
    const passportData = caps.passport_data || {};
    
    // SRr: Recent Success Rate (default 0.5)
    const SRr = caps.recent_success_rate !== undefined ? caps.recent_success_rate : 0.5;
    
    // SRg: Global Success Rate (default 0.5)
    const SRg = caps.success_rate !== undefined ? caps.success_rate : 0.5;
    
    // V: Average Validator Score (default to SRg)
    const V = passportData.metrics?.average_validator_score !== undefined 
      ? passportData.metrics.average_validator_score 
      : SRg; 
    
    // L: Normalized Latency (0-1, higher is better)
    const latency = caps.average_latency_ms || 1000;
    const L = Math.max(0, 1 - (latency / 5000));
    
    // D: Domain Alignment
    const D = agent.domain === 'TEST' ? 1 : 0; // Assuming taskType is 'TEST'
    
    // N: Newness Penalty (< 50 uses)
    const totalUses = caps.validation_count || caps.total_uses || 0;
    const N = totalUses < 50 ? 1 : 0;
    
    // Formula
    const score = (0.30 * SRr) + 
                  (0.20 * SRg) + 
                  (0.20 * V) + 
                  (0.15 * L) + 
                  (0.10 * D) - 
                  (0.05 * N);
                  
    return {
        slug: agent.slug,
        score: score.toFixed(4),
        components: { SRr, SRg, V, L: L.toFixed(2), D, N }
    };
}

console.log("--- AgentRank v0 Simulation ---\n");
const results = mockAgents.map(a => calculateRank(a, 'TEST'));

// Sort descending
results.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));

console.table(results);

// Expected winner: 'high-performer' should likely win or be close to 'slow-but-reliable'.
// 'new-promising' should be penalized slightly.
// 'fast-but-fail' should lose due to poor success rates.

