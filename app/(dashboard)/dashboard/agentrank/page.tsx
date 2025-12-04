import { createClient } from '@/lib/supabase-server';
import { Badge } from '@/components/Badge';

export const revalidate = 0; // Dynamic data

export default async function AgentRankDashboard() {
  const supabase = createClient();

  // Fetch agents with capabilities
  const { data: agents, error } = await supabase
    .from('agents')
    .select(`
      id,
      name,
      slug,
      domain,
      status,
      agent_capabilities (
        success_rate,
        recent_success_rate,
        validation_count,
        average_latency_ms,
        passport_data
      )
    `)
    .order('status', { ascending: true });

  if (error) {
    return <div className="p-8 text-red-500">Error loading agents: {error.message}</div>;
  }

  // Calculate scores client-side (or server-side here) to match Gaia logic for display
  const rankedAgents = agents?.map(agent => {
    const caps = agent.agent_capabilities?.[0] || {};
    const passportData = caps.passport_data || {};
    const metrics = passportData.metrics || {};
    const signals = passportData.ranking_signals || {};

    // Try to get stored score first, or recalculate
    // Note: Gaia calculates this at runtime, but we can emulate it here for the dashboard view
    
    const SRr = caps.recent_success_rate ?? 0.5;
    const SRg = caps.success_rate ?? 0.5;
    const V = metrics.average_validator_score ?? SRg;
    const latency = caps.average_latency_ms || 1000;
    const L = Math.max(0, 1 - (latency / 5000));
    const N = (caps.validation_count || 0) < 50 ? 1 : 0;
    const D = 0; // Cannot calculate domain alignment without a task

    // Base score without Domain alignment
    const score = (0.30 * SRr) + (0.20 * SRg) + (0.20 * V) + (0.15 * L) - (0.05 * N);

    return {
      ...agent,
      metrics: { SRr, SRg, V, L, N },
      score: signals.agent_rank_score || score, // Use stored if available, else calculated base
      latency,
      validation_count: caps.validation_count || 0
    };
  }).sort((a, b) => b.score - a.score) || [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AgentRank v0 Dashboard</h1>
          <p className="text-gray-500 mt-2">Real-time ranking of {rankedAgents.length} agents based on performance, latency, and validation.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success (Recent)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validator</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uses</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rankedAgents.map((agent, index) => (
                  <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                          <div className="text-xs text-gray-500">@{agent.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-indigo-600">{agent.score.toFixed(3)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={agent.status === 'ACTIVE' ? 'success' : 'warning'}>
                        {agent.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {(agent.metrics.SRr * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {(agent.metrics.V * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {agent.latency}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {agent.validation_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

