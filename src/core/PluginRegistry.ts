import type { Plugin, PluginType, PluginConfig } from '@/types/problem';

export class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  private static instance: PluginRegistry;

  static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin ${plugin.id} already registered. Updating...`);
    }
    this.plugins.set(plugin.id, { ...plugin, isActive: true });
    console.log(`Plugin registered: ${plugin.name} (${plugin.id})`);
  }

  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.isActive = false;
      this.plugins.set(pluginId, plugin);
      console.log(`Plugin unregistered: ${pluginId}`);
    }
  }

  get(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  getActive(): Plugin[] {
    return Array.from(this.plugins.values()).filter(p => p.isActive);
  }

  getByType(type: PluginType): Plugin[] {
    return this.getActive().filter(p => p.type === type);
  }

  getByCapability(capability: string): Plugin[] {
    return this.getActive().filter(p => 
      p.capabilities.includes(capability) || 
      p.capabilities.includes('*')
    );
  }

  hasCapability(pluginId: string, capability: string): boolean {
    const plugin = this.plugins.get(pluginId);
    return plugin?.isActive && (
      plugin.capabilities.includes(capability) || 
      plugin.capabilities.includes('*')
    ) || false;
  }

  updateConfig(pluginId: string, config: Partial<PluginConfig>): boolean {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.config = { ...plugin.config, ...config };
      this.plugins.set(pluginId, plugin);
      return true;
    }
    return false;
  }

  // Built-in plugins registration
  registerBuiltIns(): void {
    // Analysis plugins
    this.register({
      id: 'root-cause-analysis',
      name: 'Root Cause Analysis',
      version: '1.0.0',
      description: 'Identifies underlying causes of problems using 5 Whys and Fishbone methods',
      type: 'analysis',
      capabilities: ['root_cause', 'problem_decomposition', 'causal_analysis'],
      config: { method: '5_whys', depth: 5 },
      isActive: true
    });

    this.register({
      id: 'stakeholder-analysis',
      name: 'Stakeholder Analysis',
      version: '1.0.0',
      description: 'Maps stakeholders by influence and interest',
      type: 'analysis',
      capabilities: ['stakeholder_mapping', 'power_interest_grid', 'engagement_strategy'],
      config: { gridSize: 3 },
      isActive: true
    });

    this.register({
      id: 'risk-analysis',
      name: 'Risk Analysis',
      version: '1.0.0',
      description: 'Evaluates risks by probability and impact',
      type: 'analysis',
      capabilities: ['risk_assessment', 'risk_matrix', 'mitigation_planning'],
      config: { matrixSize: 5 },
      isActive: true
    });

    this.register({
      id: 'opportunity-analysis',
      name: 'Opportunity Analysis',
      version: '1.0.0',
      description: 'Identifies and evaluates opportunities',
      type: 'analysis',
      capabilities: ['opportunity_identification', 'value_assessment', 'priority_ranking'],
      config: {},
      isActive: true
    });

    this.register({
      id: 'feasibility-analysis',
      name: 'Feasibility Analysis',
      version: '1.0.0',
      description: 'Evaluates technical, economic, and operational feasibility',
      type: 'analysis',
      capabilities: ['feasibility_assessment', 'viability_scoring', 'constraint_analysis'],
      config: { dimensions: ['technical', 'economic', 'operational', 'legal', 'schedule'] },
      isActive: true
    });

    // Decision plugins
    this.register({
      id: 'decision-matrix',
      name: 'Decision Matrix',
      version: '1.0.0',
      description: 'Multi-criteria decision analysis',
      type: 'analysis',
      capabilities: ['mcda', 'weighted_scoring', 'alternative_comparison'],
      config: {},
      isActive: true
    });

    this.register({
      id: 'cost-benefit',
      name: 'Cost-Benefit Analysis',
      version: '1.0.0',
      description: 'Compares costs and benefits of alternatives',
      type: 'analysis',
      capabilities: ['cBA', 'roi_calculation', 'npv_analysis'],
      config: { discountRate: 0.05 },
      isActive: true
    });

    // Model plugins
    this.register({
      id: 'game-theory-model',
      name: 'Game Theory Model',
      version: '1.0.0',
      description: 'Strategic interaction modeling',
      type: 'model',
      capabilities: ['nash_equilibrium', 'strategic_analysis', 'payoff_optimization'],
      config: {},
      isActive: true
    });

    this.register({
      id: 'evolutionary-model',
      name: 'Evolutionary Model',
      version: '1.0.0',
      description: 'Optimization through evolutionary algorithms',
      type: 'model',
      capabilities: ['optimization', 'genetic_algorithm', 'fitness_maximization'],
      config: { populationSize: 50, generations: 100 },
      isActive: true
    });

    this.register({
      id: 'system-dynamics',
      name: 'System Dynamics',
      version: '1.0.0',
      description: 'Complex system behavior modeling',
      type: 'model',
      capabilities: ['system_modeling', 'feedback_loops', 'stock_flow'],
      config: {},
      isActive: true
    });

    // Agent plugins
    this.register({
      id: 'problem-analyzer',
      name: 'Problem Analyzer Agent',
      version: '1.0.0',
      description: 'Decomposes and analyzes problems',
      type: 'agent',
      capabilities: ['problem_decomposition', 'requirement_extraction', 'constraint_identification'],
      config: {},
      isActive: true
    });

    this.register({
      id: 'solution-generator',
      name: 'Solution Generator Agent',
      version: '1.0.0',
      description: 'Generates potential solutions',
      type: 'agent',
      capabilities: ['solution_generation', 'creativity', 'innovation'],
      config: {},
      isActive: true
    });

    this.register({
      id: 'solution-evaluator',
      name: 'Solution Evaluator Agent',
      version: '1.0.0',
      description: 'Evaluates solutions against criteria',
      type: 'agent',
      capabilities: ['solution_evaluation', 'scoring', 'ranking'],
      config: {},
      isActive: true
    });

    this.register({
      id: 'action-planner',
      name: 'Action Planner Agent',
      version: '1.0.0',
      description: 'Creates actionable implementation plans',
      type: 'agent',
      capabilities: ['action_planning', 'timeline_creation', 'resource_allocation'],
      config: {},
      isActive: true
    });

    // Export plugins
    this.register({
      id: 'json-exporter',
      name: 'JSON Exporter',
      version: '1.0.0',
      description: 'Exports data in JSON format',
      type: 'export',
      capabilities: ['json_export', 'structured_data'],
      config: {},
      isActive: true
    });

    this.register({
      id: 'csv-exporter',
      name: 'CSV Exporter',
      version: '1.0.0',
      description: 'Exports data in CSV format',
      type: 'export',
      capabilities: ['csv_export', 'tabular_data'],
      config: {},
      isActive: true
    });

    this.register({
      id: 'pdf-exporter',
      name: 'PDF Exporter',
      version: '1.0.0',
      description: 'Exports reports in PDF format',
      type: 'export',
      capabilities: ['pdf_export', 'report_generation'],
      config: {},
      isActive: true
    });

    this.register({
      id: 'markdown-exporter',
      name: 'Markdown Exporter',
      version: '1.0.0',
      description: 'Exports documents in Markdown format',
      type: 'export',
      capabilities: ['markdown_export', 'documentation'],
      config: {},
      isActive: true
    });
  }

  // Domain-specific plugin packs
  registerDomainPack(domain: string): void {
    const packs: Record<string, Plugin[]> = {
      'business': [
        {
          id: 'swot-analysis',
          name: 'SWOT Analysis',
          version: '1.0.0',
          description: 'Strengths, Weaknesses, Opportunities, Threats analysis',
          type: 'analysis',
          capabilities: ['swot', 'strategic_planning'],
          config: {},
          isActive: true
        },
        {
          id: 'pestle-analysis',
          name: 'PESTLE Analysis',
          version: '1.0.0',
          description: 'Political, Economic, Social, Technological, Legal, Environmental analysis',
          type: 'analysis',
          capabilities: ['pestle', 'environmental_scanning'],
          config: {},
          isActive: true
        },
        {
          id: 'porter-five-forces',
          name: "Porter's Five Forces",
          version: '1.0.0',
          description: 'Industry competitiveness analysis',
          type: 'analysis',
          capabilities: ['five_forces', 'competitive_analysis'],
          config: {},
          isActive: true
        }
      ],
      'technology': [
        {
          id: 'tech-readiness',
          name: 'Technology Readiness Assessment',
          version: '1.0.0',
          description: 'Evaluates technology maturity and readiness',
          type: 'analysis',
          capabilities: ['trl_assessment', 'technology_evaluation'],
          config: {},
          isActive: true
        },
        {
          id: 'architecture-analysis',
          name: 'Architecture Analysis',
          version: '1.0.0',
          description: 'System architecture evaluation',
          type: 'analysis',
          capabilities: ['architecture_review', 'scalability_assessment'],
          config: {},
          isActive: true
        }
      ],
      'policy': [
        {
          id: 'policy-impact',
          name: 'Policy Impact Analysis',
          version: '1.0.0',
          description: 'Evaluates policy impacts and effectiveness',
          type: 'analysis',
          capabilities: ['impact_assessment', 'stakeholder_impact'],
          config: {},
          isActive: true
        },
        {
          id: 'regulatory-compliance',
          name: 'Regulatory Compliance Check',
          version: '1.0.0',
          description: 'Checks compliance with regulations',
          type: 'analysis',
          capabilities: ['compliance_check', 'regulatory_mapping'],
          config: {},
          isActive: true
        }
      ],
      'healthcare': [
        {
          id: 'clinical-decision',
          name: 'Clinical Decision Support',
          version: '1.0.0',
          description: 'Evidence-based clinical decision making',
          type: 'analysis',
          capabilities: ['evidence_review', 'treatment_recommendation'],
          config: {},
          isActive: true
        },
        {
          id: 'health-economics',
          name: 'Health Economics',
          version: '1.0.0',
          description: 'Cost-effectiveness and health outcomes analysis',
          type: 'analysis',
          capabilities: ['cea', 'qaly_calculation', 'budget_impact'],
          config: {},
          isActive: true
        }
      ]
    };

    const pack = packs[domain];
    if (pack) {
      pack.forEach(plugin => this.register(plugin));
      console.log(`Registered ${pack.length} plugins for domain: ${domain}`);
    }
  }
}

export default PluginRegistry;
