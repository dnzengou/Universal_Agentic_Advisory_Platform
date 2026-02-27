import type { EPRState, EPRAgent, EPRScenario } from '@/types';

export interface EPRSimulationResult {
  history: {
    value: number[];
    stability: number[];
    equity: number[];
    reputation: number[];
  };
  finalState: EPRState;
  insights: string[];
  zone: 'red' | 'blue';
}

export class EPRSimulator {
  private state: EPRState;
  private agents: EPRAgent[];
  private scenario: EPRScenario;

  constructor(scenario: EPRScenario) {
    this.scenario = scenario;
    this.state = {
      value: scenario.initial.value || 80,
      stability: scenario.initial.stability || 1.0,
      equity: scenario.initial.equity || 0.5,
      reputation: scenario.initial.reputation || 0.7,
      resources: scenario.initial.resources || 100
    };

    this.agents = [
      {
        name: 'EcoAgent',
        role: 'economic',
        state: { ...this.state },
        principles: ['prudence', 'growth']
      },
      {
        name: 'PolAgent',
        role: 'political',
        state: { ...this.state },
        principles: ['stability', 'negotiation']
      },
      {
        name: 'SocAgent',
        role: 'social',
        state: { ...this.state },
        principles: ['equity', 'redistribution']
      },
      {
        name: 'GraciánMaster',
        role: 'mastery',
        state: { ...this.state },
        principles: ['gracian_restraint', 'reputation', 'timing']
      }
    ];
  }

  simulate(): EPRSimulationResult {
    const history = {
      value: [] as number[],
      stability: [] as number[],
      equity: [] as number[],
      reputation: [] as number[]
    };

    for (let step = 0; step < this.scenario.steps; step++) {
      // Record current state
      history.value.push(this.state.value);
      history.stability.push(this.state.stability);
      history.equity.push(this.state.equity);
      history.reputation.push(this.state.reputation);

      // Determine zone
      const zone = this.state.stability < 1.2 ? 'red' : 'blue';

      // Each agent acts
      for (const agent of this.agents) {
        this.executeAgentAction(agent, zone);
      }

      // Apply system dynamics
      this.applySystemDynamics(zone);

      // Update agent states
      for (const agent of this.agents) {
        agent.state = { ...this.state };
      }
    }

    const insights = this.generateInsights(history);

    return {
      history,
      finalState: { ...this.state },
      insights,
      zone: this.state.stability < 1.2 ? 'red' : 'blue'
    };
  }

  private executeAgentAction(agent: EPRAgent, zone: 'red' | 'blue'): void {
    const action = this.selectAction(agent);
    this.calculateReward(action, zone);

    // Apply action effects
    switch (action) {
      case 'allocate':
        if (this.state.resources >= 10) {
          this.state.resources -= 10;
          this.state.value += zone === 'red' ? 8 : 5;
        }
        break;
      case 'negotiate':
        this.state.stability += zone === 'red' ? 0.15 : 0.08;
        break;
      case 'redistribute':
        this.state.equity += 0.08;
        this.state.reputation = Math.min(1, this.state.reputation + 0.05);
        break;
      case 'restrain':
        // Gracián restraint
        this.state.reputation = Math.min(1, this.state.reputation + 0.08);
        break;
    }

    // Machiavellian necessity boost
    if (this.state.stability < 1.2) {
      // In red zone, actions have higher impact
    }

    // EPR prudence check
    if (this.state.resources < 20) {
      // Reduce risk-taking when resources are low
    }
  }

  private selectAction(agent: EPRAgent): string {
    const actions = ['allocate', 'negotiate', 'redistribute', 'restrain'];
    
    // Gracián restraint: 25% chance to choose restraint
    if (agent.principles.includes('gracian_restraint') && Math.random() < 0.25) {
      return 'restrain';
    }

    // Otherwise, select based on agent role
    switch (agent.role) {
      case 'economic':
        return Math.random() < 0.6 ? 'allocate' : 'negotiate';
      case 'political':
        return Math.random() < 0.7 ? 'negotiate' : 'allocate';
      case 'social':
        return Math.random() < 0.8 ? 'redistribute' : 'negotiate';
      case 'mastery':
        return 'restrain';
      default:
        return actions[Math.floor(Math.random() * actions.length)];
    }
  }

  private calculateReward(action: string, zone: 'red' | 'blue'): number {
    const baseRewards: Record<string, number> = {
      allocate: zone === 'red' ? 8 : 5,
      negotiate: 12,
      redistribute: 10,
      restrain: 6
    };

    let reward = baseRewards[action] || 5;

    // Machiavellian necessity boost in red zone
    if (zone === 'red' && this.state.stability < 1.2) {
      reward *= 1.15;
    }

    // EPR prudence penalty
    if (this.state.resources < 20) {
      reward -= 5;
    }

    return reward;
  }

  private applySystemDynamics(_zone: 'red' | 'blue'): void {
    // Natural decay/growth
    this.state.value += (Math.random() - 0.3) * 5;
    this.state.stability += (Math.random() - 0.5) * 0.05;
    this.state.equity += (Math.random() - 0.5) * 0.02;
    this.state.reputation += (Math.random() - 0.4) * 0.03;

    // Resource regeneration
    this.state.resources += 2;

    // Bounds
    this.state.stability = Math.max(0, Math.min(2, this.state.stability));
    this.state.equity = Math.max(0, Math.min(1, this.state.equity));
    this.state.reputation = Math.max(0, Math.min(1, this.state.reputation));
    this.state.resources = Math.max(0, Math.min(300, this.state.resources));
  }

  private generateInsights(history: EPRSimulationResult['history']): string[] {
    const insights: string[] = [];

    const valueTrend = history.value[history.value.length - 1] - history.value[0];
    const stabilityTrend = history.stability[history.stability.length - 1] - history.stability[0];
    const equityTrend = history.equity[history.equity.length - 1] - history.equity[0];
    const reputationTrend = history.reputation[history.reputation.length - 1] - history.reputation[0];

    if (reputationTrend > 0.1) {
      insights.push('Gracián restraint built reputation early → graceful execution');
    }

    if (stabilityTrend > 0 && this.state.stability >= 1.2) {
      insights.push('Virtuous motion achieved (Red/Blue zone toggling prevented decadence)');
    }

    if (equityTrend > 0) {
      insights.push('EPR equity safeguards prevented plutonomy');
    }

    if (valueTrend > 50) {
      insights.push('Strong economic value creation through strategic allocation');
    }

    if (this.state.stability < 1.0) {
      insights.push('Warning: Political instability requires attention');
    }

    return insights;
  }

  getState(): EPRState {
    return { ...this.state };
  }

  getAgents(): EPRAgent[] {
    return this.agents;
  }

  // Preset scenarios
  static demographicsCollapse(): EPRScenario {
    return {
      name: 'Demographics Collapse 2026',
      initial: {
        value: 40,
        stability: 0.85,
        equity: 0.35,
        reputation: 0.6,
        resources: 40
      },
      steps: 20,
      zone: 'red'
    };
  }

  static militaryDefence(): EPRScenario {
    return {
      name: 'Military Defence-Pushed Growth',
      initial: {
        value: 120,
        stability: 0.75,
        equity: 0.55,
        reputation: 0.7,
        resources: 150
      },
      steps: 20,
      zone: 'red'
    };
  }

  static corporateSustainability(): EPRScenario {
    return {
      name: 'Corporate Sustainability Crisis',
      initial: {
        value: 65,
        stability: 0.9,
        equity: 0.6,
        reputation: 0.75,
        resources: 90
      },
      steps: 15,
      zone: 'blue'
    };
  }

  static customScenario(
    name: string,
    value: number,
    stability: number,
    equity: number,
    resources: number,
    steps: number = 20
  ): EPRScenario {
    return {
      name,
      initial: {
        value,
        stability,
        equity,
        reputation: 0.7,
        resources
      },
      steps,
      zone: stability < 1.2 ? 'red' : 'blue'
    };
  }
}

export default EPRSimulator;
