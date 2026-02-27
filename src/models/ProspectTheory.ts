import type { ProspectTheoryConfig, ProspectTheoryResult } from '@/types';

export interface PTAgent {
  wealth: number;
  gamma: number;
  lokLevel: number;
  referencePoint: number;
}

export class ProspectTheorySimulator {
  private config: ProspectTheoryConfig;
  private agents: PTAgent[] = [];

  constructor(config: Partial<ProspectTheoryConfig> = {}) {
    this.config = {
      alpha: 0.88,
      beta: 0.88,
      lambda: 2.25,
      gamma: 0.61,
      delta: 0.69,
      lokLevel: 0,
      ...config
    };
  }

  initialize(nAgents: number = 500, initialWealth: number = 1000): void {
    const half = Math.floor(nAgents / 2);
    
    // Knowledgeable agents (standard prospect theory)
    const knowledgeable: PTAgent[] = Array(half).fill(0).map(() => ({
      wealth: initialWealth,
      gamma: this.config.gamma,
      lokLevel: 0,
      referencePoint: 0
    }));

    // LOK agents (high uncertainty)
    const lokAgents: PTAgent[] = Array(nAgents - half).fill(0).map(() => ({
      wealth: initialWealth,
      gamma: 0.3, // Highly distorted weighting
      lokLevel: this.config.lokLevel || 1.0,
      referencePoint: 0
    }));

    this.agents = [...knowledgeable, ...lokAgents];
  }

  simulate(steps: number = 50): ProspectTheoryResult {
    if (this.agents.length === 0) {
      this.initialize();
    }

    const wealth: number[] = [];
    const riskPropensity: number[] = [];
    const decisions: number[] = [];

    for (let step = 0; step < steps; step++) {
      const stepWealth: number[] = [];
      const stepRisk: number[] = [];
      const stepDecisions: number[] = [];

      for (const agent of this.agents) {
        const result = this.simulateAgentDecision(agent);
        stepWealth.push(agent.wealth);
        stepRisk.push(result.riskTaken);
        stepDecisions.push(result.choice);
      }

      wealth.push(this.average(stepWealth));
      riskPropensity.push(this.average(stepRisk));
      decisions.push(this.average(stepDecisions));
    }

    return {
      valueFunction: this.calculateValueFunction(),
      weightingFunction: this.calculateWeightingFunction(),
      decisions,
      wealth,
      riskPropensity
    };
  }

  private simulateAgentDecision(agent: PTAgent): { choice: number; riskTaken: number } {
    // Gamble: 20% chance to win 300, else 0
    const pTrue = 0.20;
    const gambleHigh = 300;
    const sureGain = 50;

    // LOK adds noise to probability perception
    const pPerceived = this.config.lokLevel > 0 
      ? Math.max(0.01, Math.min(0.99, pTrue + (Math.random() - 0.5) * 0.3 * agent.lokLevel))
      : pTrue;

    // LOK adds noise to reference point
    const refNoise = agent.lokLevel > 0
      ? (Math.random() - 0.5) * 200 * agent.lokLevel
      : 0;

    const refPoint = agent.referencePoint + refNoise;

    // Evaluate prospects using prospect theory
    const wP = this.weightingFunction(pPerceived, agent.gamma);
    const vGamble = wP * this.valueFunction(gambleHigh - refPoint);
    const vSure = this.valueFunction(sureGain - refPoint);

    // Decision with temperature (higher LOK = more random)
    const temperature = 1.0 + 10.0 * agent.lokLevel;
    const logit = (vGamble - vSure) / temperature;
    const probChooseGamble = 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, logit))));

    const choice = Math.random() < probChooseGamble ? 1 : 0;

    // Outcome
    if (choice === 1) {
      // Chose gamble
      const won = Math.random() < pTrue;
      agent.wealth += won ? gambleHigh : 0;
    } else {
      // Chose sure thing
      agent.wealth += sureGain;
    }

    return {
      choice,
      riskTaken: choice === 1 ? probChooseGamble : 0
    };
  }

  private valueFunction(x: number): number {
    const { alpha, beta, lambda } = this.config;
    
    if (x >= 0) {
      return Math.pow(x, alpha);
    } else {
      return -lambda * Math.pow(-x, beta);
    }
  }

  private weightingFunction(p: number, gamma: number = this.config.gamma): number {
    if (p <= 0) return 0;
    if (p >= 1) return 1;

    const num = Math.pow(p, gamma);
    const den = Math.pow(Math.pow(p, gamma) + Math.pow(1 - p, gamma), 1 / gamma);
    return num / den;
  }

  private calculateValueFunction(): number[] {
    const range = 50;
    const step = 1;
    const values: number[] = [];

    for (let x = -range; x <= range; x += step) {
      values.push(this.valueFunction(x));
    }

    return values;
  }

  private calculateWeightingFunction(): number[] {
    const steps = 100;
    const weights: number[] = [];

    for (let i = 0; i <= steps; i++) {
      const p = i / steps;
      weights.push(this.weightingFunction(p));
    }

    return weights;
  }

  private average(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  // Compare knowledgeable vs LOK agents
  compareAgents(steps: number = 50): {
    knowledgeable: { wealth: number[]; risk: number[] };
    lok: { wealth: number[]; risk: number[] };
  } {
    // Save current state
    const savedAgents = this.agents;

    // Simulate knowledgeable agents
    this.agents = savedAgents.filter(a => a.lokLevel === 0);
    const knowledgeableResult = this.simulate(steps);

    // Simulate LOK agents
    this.agents = savedAgents.filter(a => a.lokLevel > 0);
    const lokResult = this.simulate(steps);

    // Restore state
    this.agents = savedAgents;

    return {
      knowledgeable: {
        wealth: knowledgeableResult.wealth,
        risk: knowledgeableResult.riskPropensity
      },
      lok: {
        wealth: lokResult.wealth,
        risk: lokResult.riskPropensity
      }
    };
  }

  // EU Strategic Autonomy Analysis
  static analyzeStrategicAutonomy(): {
    dependencies: string[];
    values: { statusQuo: number[]; strategicAutonomy: number[] };
    recommendations: string[];
  } {
    const simulator = new ProspectTheorySimulator();
    
    const dependencies = [
      'Russia (Nuclear)',
      'China (Rare Earths)',
      'US (Tech/AI)'
    ];

    const pShock = [0.15, 0.10, 0.05];
    const lossIfShock = [-800, -1200, -500];
    const costToDecouple = [-200, -300, -100];
    const gainAutonomy = [100, 150, 80];

    const values = {
      statusQuo: [] as number[],
      strategicAutonomy: [] as number[]
    };

    for (let i = 0; i < dependencies.length; i++) {
      // Prospect 1: Status Quo (gamble)
      const vSQ = simulator.weightingFunction(pShock[i]) * 
        simulator.valueFunction(lossIfShock[i]);
      
      // Prospect 2: Strategic Autonomy (sure cost + gain)
      const vSA = simulator.valueFunction(costToDecouple[i] + gainAutonomy[i]);

      values.statusQuo.push(vSQ);
      values.strategicAutonomy.push(vSA);
    }

    const recommendations = dependencies.map((dep, i) => {
      const decision = values.strategicAutonomy[i] > values.statusQuo[i] 
        ? 'Pursue Strategic Autonomy' 
        : 'Maintain Status Quo';
      return `${dep}: ${decision}`;
    });

    return {
      dependencies,
      values,
      recommendations
    };
  }

  getAgents(): PTAgent[] {
    return this.agents;
  }
}

export default ProspectTheorySimulator;
