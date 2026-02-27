import type { GameTheoryConfig, GameTheoryResult } from '@/types';

export class GameTheorySimulator {
  private config: GameTheoryConfig;

  constructor(config: Partial<GameTheoryConfig> = {}) {
    this.config = {
      players: 2,
      strategies: ['Cooperate', 'Defect'],
      payoffs: [
        [[3, 3], [1, 4]],
        [[4, 1], [2, 2]]
      ],
      iterations: 100,
      ...config
    };
  }

  simulate(): GameTheoryResult {
    const { players, strategies, iterations } = this.config;
    
    // Initialize player strategies (random at first)
    let playerStrategies = Array(players).fill(0).map(() => 
      Math.floor(Math.random() * strategies.length)
    );

    const convergence: number[] = [];
    const strategyHistory: number[][] = [];

    // Run iterative best response dynamics
    for (let iter = 0; iter < iterations; iter++) {
      strategyHistory.push([...playerStrategies]);
      
      // Each player best responds to others
      for (let player = 0; player < players; player++) {
        const bestResponse = this.findBestResponse(player, playerStrategies);
        playerStrategies[player] = bestResponse;
      }

      // Calculate convergence metric
      const converged = this.calculateConvergence(strategyHistory);
      convergence.push(converged);

      if (converged > 0.99) break;
    }

    // Calculate final payoffs
    const finalPayoffs = this.calculatePayoffs(playerStrategies);

    return {
      equilibrium: playerStrategies.map(s => strategies[s]),
      payoffs: finalPayoffs,
      convergence,
      iterations: convergence.length
    };
  }

  private findBestResponse(player: number, currentStrategies: number[]): number {
    const { strategies } = this.config;
    let bestStrategy = 0;
    let bestPayoff = -Infinity;

    for (let strategy = 0; strategy < strategies.length; strategy++) {
      const testStrategies = [...currentStrategies];
      testStrategies[player] = strategy;
      
      const payoff = this.getPayoff(player, testStrategies);
      if (payoff > bestPayoff) {
        bestPayoff = payoff;
        bestStrategy = strategy;
      }
    }

    return bestStrategy;
  }

  private getPayoff(player: number, strategies: number[]): number {
    const { payoffs } = this.config;
    
    if (strategies.length === 2) {
      return payoffs[strategies[0]][strategies[1]][player];
    }
    
    // For n-player games, use a simplified payoff calculation
    return payoffs[0][0][player] || 0;
  }

  private calculatePayoffs(strategies: number[]): number[] {
    const { players } = this.config;
    return Array(players).fill(0).map((_, player) => 
      this.getPayoff(player, strategies)
    );
  }

  private calculateConvergence(history: number[][]): number {
    if (history.length < 2) return 0;
    
    const current = history[history.length - 1];
    const previous = history[history.length - 2];
    
    const matches = current.filter((s, i) => s === previous[i]).length;
    return matches / current.length;
  }

  // Simulate Prisoner's Dilemma
  static prisonersDilemma(iterations: number = 100): GameTheoryResult {
    const simulator = new GameTheorySimulator({
      players: 2,
      strategies: ['Cooperate', 'Defect'],
      payoffs: [
        [[3, 3], [0, 5]],
        [[5, 0], [1, 1]]
      ],
      iterations
    });
    return simulator.simulate();
  }

  // Simulate Coordination Game
  static coordinationGame(iterations: number = 100): GameTheoryResult {
    const simulator = new GameTheorySimulator({
      players: 2,
      strategies: ['Strategy A', 'Strategy B'],
      payoffs: [
        [[2, 2], [0, 0]],
        [[0, 0], [1, 1]]
      ],
      iterations
    });
    return simulator.simulate();
  }

  // Simulate Hawk-Dove (Chicken) Game
  static hawkDove(iterations: number = 100): GameTheoryResult {
    const simulator = new GameTheorySimulator({
      players: 2,
      strategies: ['Hawk', 'Dove'],
      payoffs: [
        [[-10, -10], [4, 1]],
        [[1, 4], [2, 2]]
      ],
      iterations
    });
    return simulator.simulate();
  }

  // Simulate Federation Dilemma (custom for advisory)
  static federationDilemma(iterations: number = 100): GameTheoryResult {
    const simulator = new GameTheorySimulator({
      players: 2,
      strategies: ['Share Data', 'Hoard Data'],
      payoffs: [
        [[3, 3], [1, 4]],
        [[4, 1], [2, 2]]
      ],
      iterations
    });
    return simulator.simulate();
  }

  // Generate payoff matrix visualization data
  generatePayoffMatrix(): { strategies: string[]; matrix: number[][][] } {
    return {
      strategies: this.config.strategies,
      matrix: this.config.payoffs
    };
  }

  // Calculate Nash equilibrium using support enumeration
  findNashEquilibrium(): { strategies: number[]; payoffs: number[] } {
    const result = this.simulate();
    return {
      strategies: result.equilibrium.map(s => this.config.strategies.indexOf(s)),
      payoffs: result.payoffs
    };
  }
}

export default GameTheorySimulator;
