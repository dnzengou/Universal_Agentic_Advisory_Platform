import type { EvolutionaryConfig, EvolutionaryResult, GenerationData } from '@/types';

export interface Individual {
  genes: number[];
  fitness: number;
}

export class EvolutionarySimulator {
  private config: EvolutionaryConfig;
  private population: Individual[] = [];
  private generationHistory: GenerationData[] = [];

  constructor(config: Partial<EvolutionaryConfig> = {}) {
    this.config = {
      populationSize: 50,
      generations: 100,
      mutationRate: 0.1,
      selectionPressure: 0.2,
      fitnessFunction: 'default',
      ...config
    };
  }

  initialize(geneLength: number = 5): void {
    this.population = Array(this.config.populationSize).fill(0).map(() => ({
      genes: Array(geneLength).fill(0).map(() => Math.random()),
      fitness: 0
    }));
  }

  evolve(fitnessCallback?: (genes: number[]) => number): EvolutionaryResult {
    const geneLength = this.population[0]?.genes.length || 5;
    
    if (this.population.length === 0) {
      this.initialize(geneLength);
    }

    for (let gen = 0; gen < this.config.generations; gen++) {
      // Evaluate fitness
      this.evaluateFitness(fitnessCallback);

      // Sort by fitness
      this.population.sort((a, b) => b.fitness - a.fitness);

      // Record generation data
      const generationData: GenerationData = {
        generation: gen,
        avgFitness: this.getAverageFitness(),
        bestFitness: this.population[0].fitness,
        diversity: this.calculateDiversity()
      };
      this.generationHistory.push(generationData);

      // Selection and reproduction
      this.evolveGeneration();
    }

    // Final evaluation
    this.evaluateFitness(fitnessCallback);
    this.population.sort((a, b) => b.fitness - a.fitness);

    return {
      generations: this.generationHistory,
      finalFitness: this.population[0].fitness,
      bestSolution: this.population[0].genes,
      convergence: this.calculateConvergence()
    };
  }

  private evaluateFitness(fitnessCallback?: (genes: number[]) => number): void {
    for (const individual of this.population) {
      if (fitnessCallback) {
        individual.fitness = fitnessCallback(individual.genes);
      } else {
        individual.fitness = this.defaultFitnessFunction(individual.genes);
      }
    }
  }

  private defaultFitnessFunction(genes: number[]): number {
    // Default: maximize sum of squares (favor higher values)
    return genes.reduce((sum, gene) => sum + gene * gene, 0);
  }

  private evolveGeneration(): void {
    const { populationSize, selectionPressure, mutationRate } = this.config;
    
    // Elitism: keep top individuals
    const eliteCount = Math.floor(populationSize * selectionPressure);
    const elite = this.population.slice(0, eliteCount);

    // Generate new population
    const newPopulation: Individual[] = [...elite];

    while (newPopulation.length < populationSize) {
      // Tournament selection
      const parent1 = this.tournamentSelection();
      const parent2 = this.tournamentSelection();

      // Crossover
      const child = this.crossover(parent1, parent2);

      // Mutation
      this.mutate(child, mutationRate);

      newPopulation.push(child);
    }

    this.population = newPopulation;
  }

  private tournamentSelection(tournamentSize: number = 3): Individual {
    let best = this.population[Math.floor(Math.random() * this.population.length)];
    
    for (let i = 1; i < tournamentSize; i++) {
      const candidate = this.population[Math.floor(Math.random() * this.population.length)];
      if (candidate.fitness > best.fitness) {
        best = candidate;
      }
    }
    
    return best;
  }

  private crossover(parent1: Individual, parent2: Individual): Individual {
    const genes: number[] = [];
    const crossoverPoint = Math.floor(Math.random() * parent1.genes.length);

    for (let i = 0; i < parent1.genes.length; i++) {
      if (i < crossoverPoint) {
        genes.push(parent1.genes[i]);
      } else {
        genes.push(parent2.genes[i]);
      }
    }

    return { genes, fitness: 0 };
  }

  private mutate(individual: Individual, mutationRate: number): void {
    for (let i = 0; i < individual.genes.length; i++) {
      if (Math.random() < mutationRate) {
        individual.genes[i] = Math.max(0, Math.min(1, 
          individual.genes[i] + (Math.random() - 0.5) * 0.2
        ));
      }
    }
  }

  private getAverageFitness(): number {
    const sum = this.population.reduce((acc, ind) => acc + ind.fitness, 0);
    return sum / this.population.length;
  }

  private calculateDiversity(): number {
    if (this.population.length === 0) return 0;

    const geneLength = this.population[0].genes.length;
    let totalVariance = 0;

    for (let i = 0; i < geneLength; i++) {
      const values = this.population.map(ind => ind.genes[i]);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
      totalVariance += variance;
    }

    return totalVariance / geneLength;
  }

  private calculateConvergence(): number {
    if (this.generationHistory.length < 2) return 0;

    const recent = this.generationHistory.slice(-10);
    const bestFitnesses = recent.map(g => g.bestFitness);
    const avgFitnesses = recent.map(g => g.avgFitness);

    const bestVariance = this.calculateVariance(bestFitnesses);
    const avgVariance = this.calculateVariance(avgFitnesses);

    // Lower variance = higher convergence
    return Math.max(0, 1 - (bestVariance + avgVariance) / 100);
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  }

  getPopulation(): Individual[] {
    return this.population;
  }

  getGenerationHistory(): GenerationData[] {
    return this.generationHistory;
  }

  // Business Model Evolution (specific use case)
  static evolveBusinessModel(
    generations: number = 50,
    scenarios: ('normal' | 'crisis' | 'tech_disruption')[] = ['normal']
  ): EvolutionaryResult {
    const simulator = new EvolutionarySimulator({
      populationSize: 50,
      generations,
      mutationRate: 0.1,
      selectionPressure: 0.2
    });

    simulator.initialize(3); // ARR, Usage, AI Investment

    let scenarioIndex = 0;

    return simulator.evolve((genes) => {
      const [arr, usage, ai] = genes;
      const scenario = scenarios[scenarioIndex % scenarios.length];
      scenarioIndex++;

      switch (scenario) {
        case 'crisis':
          return arr * 1.5 + usage * 0.5 + ai * 0.3;
        case 'tech_disruption':
          return arr * 0.6 + usage * 0.6 + ai * 2.0;
        default:
          return arr + usage + ai;
      }
    });
  }

  // Strategy Optimization (specific use case)
  static optimizeStrategy(
    objectives: string[],
    constraints: number[][]
  ): EvolutionaryResult {
    const simulator = new EvolutionarySimulator({
      populationSize: 100,
      generations: 100,
      mutationRate: 0.15,
      selectionPressure: 0.15
    });

    simulator.initialize(objectives.length);

    return simulator.evolve((genes) => {
      // Multi-objective optimization
      let score = 0;
      
      for (let i = 0; i < genes.length; i++) {
        score += genes[i] * (objectives.length - i); // Weight by priority
      }

      // Apply constraints penalty
      for (const constraint of constraints) {
        const violation = constraint.reduce((sum, c, i) => sum + c * (genes[i] || 0), 0);
        if (violation > 1) {
          score -= violation * 10;
        }
      }

      return Math.max(0, score);
    });
  }
}

export default EvolutionarySimulator;
