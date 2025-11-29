# Agent System Reference Documentation

This folder contains comprehensive documentation for all database tables, components, and concepts used in TheNetwork's agent routing system.

## 📚 Table of Contents

### Core Identity & Routing
1. [Agent Handles](./01_agent_handles.md) - Stella's unique identity
2. [Agent Passports (User)](./02_agent_passports_user.md) - User's Stella personality & DNA
3. [Agent Capabilities](./03_agent_passports_agent.md) - Specialist agent capabilities (agent_capabilities table)
4. [Agents Catalog](./04_agents_catalog.md) - Registry of all available agents
5. [Agent Usage Logs](./05_agent_usage_logs.md) - Complete audit trail

### Event System
6. [Weekly Activities](./06_weekly_activities.md) - Events table
7. [Event Attendees](./07_event_attendees.md) - Invites & attendance

### User & Network Data
8. [Profiles](./08_profiles.md) - User profiles with interests
9. [User Compatibility Vectors](./09_user_compatibility_vectors.md) - Vector embeddings for matching
10. [Graph Nodes & Edges](./10_graph_nodes_edges.md) - Network graph structure

### Digital DNA System
11. [Digital DNA v2](./11_digital_dna_v2.md) - User personality vectors
12. [DNA Computation Log](./12_dna_computation_log.md) - DNA versioning

### Twin Memory System
13. [Twin Episodic Memory](./13_twin_episodic_memory.md) - Detailed memories
14. [Twin Semantic Memory](./14_twin_semantic_memory.md) - Summarized facts
15. [Twin Actions](./15_twin_actions.md) - Action log

## 🎯 Quick Reference

### What is an Agent Handle?
- Unique identifier for each user's Stella instance
- Format: `@firstname.lastname.network`
- Example: `@ayen.monasha.network`
- See: [Agent Handles](./01_agent_handles.md)

### What is an Agent Passport?
- **User Passport** (`agent_passports` table): Stella's personality (DNA, preferences, trust)
- **Agent Capabilities** (`agent_capabilities` table): Specialist agent's capabilities (Prime, Study Planner, etc.)
- See: [Agent Passports (User)](./02_agent_passports_user.md) and [Agent Capabilities](./03_agent_passports_agent.md)

### What is the Agents Catalog?
- Registry of all available specialist agents
- Prime, Study Planner, Ledger, etc.
- See: [Agents Catalog](./04_agents_catalog.md)

### How Does Routing Work?
1. User talks to Stella (identified by agent_handle)
2. Stella generates task spec
3. Stella calls Gaia (router)
4. Gaia routes to appropriate agent(s)
5. Agent executes and logs to agent_usage_logs
6. Result returns to Stella → User

See: [ROUTING_AND_AGENT_SYSTEM_EXPLAINED.md](../ROUTING_AND_AGENT_SYSTEM_EXPLAINED.md) for complete flow.

## 🔗 Related Documentation

- [Complete System Architecture](../COMPLETE_SYSTEM_ARCHITECTURE.md) - Full system diagram
- [Routing & Agent System Explained](../ROUTING_AND_AGENT_SYSTEM_EXPLAINED.md) - How routing works
- [Agentic App Store Summary](../AGENTIC_APP_STORE_SUMMARY.md) - High-level overview

## 📖 How to Use This Reference

1. **New to the system?** Start with [Agent Handles](./01_agent_handles.md)
2. **Understanding routing?** Read [Agents Catalog](./04_agents_catalog.md) and [Agent Usage Logs](./05_agent_usage_logs.md)
3. **Building an agent?** Read [Agent Capabilities](./03_agent_passports_agent.md)
4. **Working with events?** Read [Weekly Activities](./06_weekly_activities.md) and [Event Attendees](./07_event_attendees.md)
5. **Understanding matching?** Read [User Compatibility Vectors](./09_user_compatibility_vectors.md) and [Graph Nodes & Edges](./10_graph_nodes_edges.md)

