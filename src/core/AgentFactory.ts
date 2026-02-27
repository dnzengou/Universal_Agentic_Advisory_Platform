import type { Agent, AgentState } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class AgentFactory {
  static createDiaAgent(): Agent {
    return {
      id: uuidv4(),
      name: 'DIA - Data Ingestion Agent',
      role: 'DIA',
      description: 'Ingests and analyzes input data, extracts key information',
      capabilities: ['data_ingestion', 'pattern_recognition', 'context_analysis'],
      state: this.createInitialState(),
      memory: []
    };
  }

  static createRvaAgent(): Agent {
    return {
      id: uuidv4(),
      name: 'RVA - Research & Validation Agent',
      role: 'RVA',
      description: 'Validates assumptions and enriches data through research',
      capabilities: ['validation', 'research', 'enrichment', 'fact_checking'],
      state: this.createInitialState(),
      memory: []
    };
  }

  static createDmaAgent(): Agent {
    return {
      id: uuidv4(),
      name: 'DMA - Decision Modeling Agent',
      role: 'DMA',
      description: 'Creates decision frameworks and models scenarios',
      capabilities: ['modeling', 'simulation', 'optimization', 'scenario_analysis'],
      state: this.createInitialState(),
      memory: []
    };
  }

  static createSaaAgent(): Agent {
    return {
      id: uuidv4(),
      name: 'SAA - Strategic Advisory Agent',
      role: 'SAA',
      description: 'Synthesizes outputs and generates strategic recommendations',
      capabilities: ['synthesis', 'recommendation', 'strategic_planning', 'communication'],
      state: this.createInitialState(),
      memory: []
    };
  }

  static createGameTheoryAgent(): Agent {
    return {
      id: uuidv4(),
      name: 'Game Theory Analyst',
      role: 'GameTheory',
      description: 'Analyzes strategic interactions using game theory',
      capabilities: ['nash_equilibrium', 'payoff_analysis', 'strategy_optimization'],
      state: this.createInitialState(),
      memory: []
    };
  }

  static createEvolutionaryAgent(): Agent {
    return {
      id: uuidv4(),
      name: 'Evolutionary Optimizer',
      role: 'Evolutionary',
      description: 'Optimizes solutions using evolutionary algorithms',
      capabilities: ['genetic_algorithm', 'fitness_optimization', 'population_dynamics'],
      state: this.createInitialState(),
      memory: []
    };
  }

  static createProspectTheoryAgent(): Agent {
    return {
      id: uuidv4(),
      name: 'Behavioral Analyst',
      role: 'ProspectTheory',
      description: 'Analyzes decision-making under uncertainty',
      capabilities: ['value_function', 'probability_weighting', 'risk_analysis'],
      state: this.createInitialState(),
      memory: []
    };
  }

  static createEprAgent(): Agent {
    return {
      id: uuidv4(),
      name: 'EPR Simulation Agent',
      role: 'EPR',
      description: 'Runs Equitable Prudent Resilience simulations',
      capabilities: ['epr_simulation', 'zone_analysis', 'virtue_modeling'],
      state: this.createInitialState(),
      memory: []
    };
  }

  static createTemplateAgent(): Agent {
    return {
      id: uuidv4(),
      name: 'Template Generator',
      role: 'Template',
      description: 'Generates customizable templates for various use cases',
      capabilities: ['template_generation', 'document_structuring', 'variable_substitution'],
      state: this.createInitialState(),
      memory: []
    };
  }

  static createKpiAgent(): Agent {
    return {
      id: uuidv4(),
      name: 'KPI Framework Agent',
      role: 'KPI',
      description: 'Defines and structures KPI frameworks',
      capabilities: ['kpi_definition', 'metric_design', 'measurement_framework'],
      state: this.createInitialState(),
      memory: []
    };
  }

  static createLokAgent(): Agent {
    return {
      id: uuidv4(),
      name: 'LOK - Lack of Knowledge Agent',
      role: 'LOK',
      description: 'Handles reasoning under uncertainty and knowledge gaps',
      capabilities: ['deductive_reasoning', 'inductive_reasoning', 'abductive_reasoning', 'uncertainty_quantification'],
      state: this.createInitialState(),
      memory: []
    };
  }

  static createPanopticAgent(): Agent {
    return {
      id: uuidv4(),
      name: 'Panoptic Oversight Agent',
      role: 'Panoptic',
      description: 'Provides multi-view oversight and traceability',
      capabilities: ['structural_view', 'semantic_view', 'temporal_view', 'traceability'],
      state: this.createInitialState(),
      memory: []
    };
  }

  static createAllAgents(): Agent[] {
    return [
      this.createDiaAgent(),
      this.createRvaAgent(),
      this.createDmaAgent(),
      this.createSaaAgent(),
      this.createGameTheoryAgent(),
      this.createEvolutionaryAgent(),
      this.createProspectTheoryAgent(),
      this.createEprAgent(),
      this.createTemplateAgent(),
      this.createKpiAgent(),
      this.createLokAgent(),
      this.createPanopticAgent()
    ];
  }

  private static createInitialState(): AgentState {
    return {
      status: 'idle',
      progress: 0,
      lastUpdated: new Date()
    };
  }
}

export default AgentFactory;
