import type { 
  Workflow, 
  WorkflowStep, 
  ProblemDefinition,
  Solution
} from '@/types/problem';
import { PluginRegistry } from './PluginRegistry';
import { v4 as uuidv4 } from 'uuid';

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  problemId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  currentStep: string | null;
  completedSteps: string[];
  results: Record<string, any>;
  logs: WorkflowLog[];
  startedAt: Date;
  completedAt?: Date;
}

export interface WorkflowLog {
  timestamp: Date;
  stepId: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  data?: any;
}

export class WorkflowEngine {
  private workflows: Map<string, Workflow> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private pluginRegistry: PluginRegistry;

  constructor() {
    this.pluginRegistry = PluginRegistry.getInstance();
    this.registerDefaultWorkflows();
  }

  // Workflow Management
  registerWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow);
    console.log(`Workflow registered: ${workflow.name} (${workflow.id})`);
  }

  getWorkflow(id: string): Workflow | undefined {
    return this.workflows.get(id);
  }

  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  getWorkflowsByTrigger(triggerType: string): Workflow[] {
    return this.getAllWorkflows().filter(w => 
      w.isActive && w.triggers.some(t => t.type === triggerType)
    );
  }

  // Execution Management
  async executeWorkflow(
    workflowId: string, 
    problemId: string,
    inputs: Record<string, any> = {}
  ): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const execution: WorkflowExecution = {
      id: uuidv4(),
      workflowId,
      problemId,
      status: 'running',
      currentStep: null,
      completedSteps: [],
      results: { ...inputs },
      logs: [],
      startedAt: new Date()
    };

    this.executions.set(execution.id, execution);

    try {
      for (const step of workflow.steps) {
        execution.currentStep = step.id;
        await this.executeStep(execution, step);
        execution.completedSteps.push(step.id);
      }

      execution.status = 'completed';
      execution.completedAt = new Date();
    } catch (error) {
      execution.status = 'failed';
      this.log(execution, stepId(workflow.steps, execution.currentStep), 'error', 
        error instanceof Error ? error.message : 'Unknown error');
    }

    return execution;
  }

  private async executeStep(
    execution: WorkflowExecution, 
    step: WorkflowStep
  ): Promise<void> {
    this.log(execution, step.id, 'info', `Executing step: ${step.name}`);

    const result = await this.runStepLogic(execution, step);
    
    if (result !== undefined) {
      execution.results[step.id] = result;
      step.outputs.forEach((output, index) => {
        if (Array.isArray(result) && index < result.length) {
          execution.results[output] = result[index];
        } else if (typeof result === 'object' && output in result) {
          execution.results[output] = result[output];
        }
      });
    }

    this.log(execution, step.id, 'info', `Step completed: ${step.name}`);
  }

  private async runStepLogic(
    execution: WorkflowExecution,
    step: WorkflowStep
  ): Promise<any> {
    const inputs = step.inputs.map(input => execution.results[input]);

    switch (step.type) {
      case 'agent':
        return this.runAgentStep(step, inputs);
      case 'model':
        return this.runModelStep(step, inputs);
      case 'analysis':
        return this.runAnalysisStep(step, inputs);
      case 'decision':
        return this.runDecisionStep(step, inputs);
      case 'action':
        return this.runActionStep(step, inputs);
      case 'custom':
        return this.runCustomStep(step, inputs);
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  private async runAgentStep(step: WorkflowStep, inputs: any[]): Promise<any> {
    // Plugin lookup for future extension
    void (step.pluginId ? this.pluginRegistry.get(step.pluginId) : null);
    
    // Simulate agent processing
    await this.delay(500);

    const agentType = step.config.agentType || 'generic';
    
    switch (agentType) {
      case 'problem-analyzer':
        return this.simulateProblemAnalysis(inputs[0]);
      case 'solution-generator':
        return this.simulateSolutionGeneration(inputs[0]);
      case 'solution-evaluator':
        return this.simulateSolutionEvaluation(inputs[0], inputs[1]);
      case 'action-planner':
        return this.simulateActionPlanning(inputs[0]);
      default:
        return { processed: true, inputs };
    }
  }

  private async runModelStep(step: WorkflowStep, inputs: any[]): Promise<any> {
    const modelType = step.config.modelType || 'generic';
    
    switch (modelType) {
      case 'game-theory':
        return this.simulateGameTheory(inputs[0]);
      case 'evolutionary':
        return this.simulateEvolutionary(inputs[0]);
      case 'system-dynamics':
        return this.simulateSystemDynamics(inputs[0]);
      default:
        return { modeled: true, inputs };
    }
  }

  private async runAnalysisStep(step: WorkflowStep, inputs: any[]): Promise<any> {
    const analysisType = step.config.analysisType || 'generic';
    
    switch (analysisType) {
      case 'root-cause':
        return this.simulateRootCauseAnalysis(inputs[0]);
      case 'stakeholder':
        return this.simulateStakeholderAnalysis(inputs[0]);
      case 'risk':
        return this.simulateRiskAnalysis(inputs[0]);
      case 'feasibility':
        return this.simulateFeasibilityAnalysis(inputs[0]);
      case 'cost-benefit':
        return this.simulateCostBenefitAnalysis(inputs[0]);
      default:
        return { analyzed: true, inputs };
    }
  }

  private async runDecisionStep(step: WorkflowStep, inputs: any[]): Promise<any> {
    const decisionType = step.config.decisionType || 'generic';
    
    switch (decisionType) {
      case 'decision-matrix':
        return this.simulateDecisionMatrix(inputs[0], inputs[1]);
      default:
        return { decided: true, inputs };
    }
  }

  private async runActionStep(_step: WorkflowStep, _inputs: any[]): Promise<any> {
    return { actioned: true, timestamp: new Date() };
  }

  private async runCustomStep(step: WorkflowStep, inputs: any[]): Promise<any> {
    const customLogic = step.config.customLogic;
    if (customLogic && typeof customLogic === 'function') {
      return customLogic(...inputs);
    }
    return { custom: true, inputs };
  }

  // Simulation Methods
  private simulateProblemAnalysis(problem: ProblemDefinition): any {
    return {
      decomposed: true,
      keyIssues: [
        `Core challenge: ${problem.description.substring(0, 50)}...`,
        `Primary constraint: ${problem.constraints[0]?.description || 'None identified'}`,
        `Main objective: ${problem.objectives[0]?.description || 'Not defined'}`
      ],
      complexity: problem.complexity,
      urgency: problem.urgency
    };
  }

  private simulateSolutionGeneration(problem: ProblemDefinition): Solution[] {
    const solutions: Solution[] = [
      {
        id: uuidv4(),
        problemId: problem.id,
        title: `Incremental approach to ${problem.title}`,
        description: 'Phased implementation with minimal disruption',
        approach: 'incremental',
        actions: [],
        expectedOutcomes: [],
        resourceRequirements: [],
        timeline: { phases: [], totalDuration: '6 months', criticalPath: [] },
        risks: [],
        feasibility: {
          technical: 0.8,
          economic: 0.7,
          operational: 0.9,
          legal: 0.85,
          schedule: 0.75,
          overall: 0.8
        },
        confidence: 0.75,
        generatedBy: 'solution-generator',
        createdAt: new Date()
      },
      {
        id: uuidv4(),
        problemId: problem.id,
        title: `Transformational approach to ${problem.title}`,
        description: 'Fundamental rethinking and redesign',
        approach: 'transformational',
        actions: [],
        expectedOutcomes: [],
        resourceRequirements: [],
        timeline: { phases: [], totalDuration: '18 months', criticalPath: [] },
        risks: [],
        feasibility: {
          technical: 0.6,
          economic: 0.5,
          operational: 0.6,
          legal: 0.7,
          schedule: 0.5,
          overall: 0.58
        },
        confidence: 0.65,
        generatedBy: 'solution-generator',
        createdAt: new Date()
      }
    ];
    return solutions;
  }

  private simulateSolutionEvaluation(_problem: ProblemDefinition, solutions: any[]): any {
    return {
      evaluated: solutions.length,
      rankings: solutions.map((s, i) => ({
        solutionId: s.id,
        rank: i + 1,
        score: s.feasibility.overall,
        recommendation: i === 0 ? 'Recommended' : 'Alternative'
      }))
    };
  }

  private simulateActionPlanning(_solution: any): any {
    return {
      plan: {
        phases: [
          { name: 'Phase 1: Preparation', duration: '2 weeks', milestones: ['Team assembled'], dependencies: [] },
          { name: 'Phase 2: Implementation', duration: '3 months', milestones: ['Core delivered'], dependencies: ['Phase 1'] },
          { name: 'Phase 3: Evaluation', duration: '2 weeks', milestones: ['Results measured'], dependencies: ['Phase 2'] }
        ],
        totalDuration: '4 months'
      }
    };
  }

  private simulateGameTheory(_config: any): any {
    return {
      equilibrium: ['Strategy A', 'Strategy B'],
      payoffs: [3.5, 3.5],
      convergence: Array(10).fill(0).map((_, i) => 1 - Math.exp(-i / 3))
    };
  }

  private simulateEvolutionary(_config: any): any {
    return {
      generations: Array(20).fill(0).map((_, i) => ({
        generation: i,
        bestFitness: 50 + i * 5 + Math.random() * 10,
        avgFitness: 40 + i * 4 + Math.random() * 8
      })),
      finalFitness: 150
    };
  }

  private simulateSystemDynamics(_config: any): any {
    return {
      stocks: ['Resource', 'Demand', 'Capacity'],
      flows: ['Inflow', 'Outflow', 'Growth'],
      behavior: 'oscillating'
    };
  }

  private simulateRootCauseAnalysis(problem: ProblemDefinition): any {
    return {
      rootCauses: [
        { category: 'Process', cause: 'Inefficient workflow', evidence: ['Time delays'] },
        { category: 'Resource', cause: 'Insufficient capacity', evidence: ['Backlogs'] },
        { category: 'Technology', cause: 'Legacy systems', evidence: ['Integration issues'] }
      ],
      fishbone: {
        problem: problem.title,
        categories: ['People', 'Process', 'Technology', 'Environment']
      }
    };
  }

  private simulateStakeholderAnalysis(problem: ProblemDefinition): any {
    return {
      matrix: problem.stakeholders.map(s => ({
        name: s.name,
        influence: s.influence,
        interest: s.interest,
        strategy: s.influence === 'high' && s.interest === 'high' ? 'Manage closely' :
                  s.influence === 'high' ? 'Keep satisfied' :
                  s.interest === 'high' ? 'Keep informed' : 'Monitor'
      }))
    };
  }

  private simulateRiskAnalysis(problem: ProblemDefinition): any {
    return {
      risks: problem.context.risks.map(r => ({
        ...r,
        score: r.probability * r.impact,
        priority: r.probability * r.impact > 0.5 ? 'High' : 'Medium'
      }))
    };
  }

  private simulateFeasibilityAnalysis(_solution: Solution): any {
    return {
      dimensions: {
        technical: { score: 0.8, factors: ['Available expertise', 'Proven technology'] },
        economic: { score: 0.7, factors: ['Positive ROI', 'Affordable investment'] },
        operational: { score: 0.9, factors: ['Minimal disruption', 'Clear process'] },
        legal: { score: 0.85, factors: ['Compliant', 'No regulatory issues'] },
        schedule: { score: 0.75, factors: ['Realistic timeline', 'Buffer included'] }
      },
      overall: 0.8
    };
  }

  private simulateCostBenefitAnalysis(alternatives: any[]): any {
    return alternatives.map((alt, i) => ({
      alternative: alt.name || `Option ${i + 1}`,
      costs: Math.random() * 100000,
      benefits: Math.random() * 150000,
      netBenefit: Math.random() * 50000,
      roi: (Math.random() * 50 + 10).toFixed(1) + '%'
    }));
  }

  private simulateDecisionMatrix(criteria: any[], alternatives: any[]): any {
    const scores: Record<string, Record<string, number>> = {};
    
    alternatives.forEach(alt => {
      scores[alt.id] = {};
      criteria.forEach(crit => {
        scores[alt.id][crit.id] = Math.random() * 10;
      });
    });

    const weightedScores = alternatives.map(alt => {
      let total = 0;
      criteria.forEach(crit => {
        total += (scores[alt.id][crit.id] || 0) * crit.weight;
      });
      return { alternativeId: alt.id, score: total };
    });

    weightedScores.sort((a, b) => b.score - a.score);

    return {
      scores,
      weightedScores,
      recommendation: weightedScores[0]?.alternativeId
    };
  }

  // Utility Methods
  private log(
    execution: WorkflowExecution, 
    stepId: string, 
    level: WorkflowLog['level'], 
    message: string,
    data?: any
  ): void {
    execution.logs.push({
      timestamp: new Date(),
      stepId,
      level,
      message,
      data
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getExecution(id: string): WorkflowExecution | undefined {
    return this.executions.get(id);
  }

  getExecutionsByProblem(problemId: string): WorkflowExecution[] {
    return Array.from(this.executions.values()).filter(e => e.problemId === problemId);
  }

  // Default Workflows
  private registerDefaultWorkflows(): void {
    // Standard Problem-Solving Workflow
    this.registerWorkflow({
      id: 'standard-problem-solving',
      name: 'Standard Problem Solving',
      description: 'Complete problem analysis and solution generation workflow',
      steps: [
        {
          id: 'analyze-problem',
          name: 'Analyze Problem',
          type: 'agent',
          pluginId: 'problem-analyzer',
          config: { agentType: 'problem-analyzer' },
          inputs: ['problem'],
          outputs: ['problemAnalysis'],
          nextSteps: ['identify-stakeholders']
        },
        {
          id: 'identify-stakeholders',
          name: 'Identify Stakeholders',
          type: 'analysis',
          config: { analysisType: 'stakeholder' },
          inputs: ['problem'],
          outputs: ['stakeholderAnalysis'],
          nextSteps: ['assess-risks']
        },
        {
          id: 'assess-risks',
          name: 'Assess Risks',
          type: 'analysis',
          config: { analysisType: 'risk' },
          inputs: ['problem'],
          outputs: ['riskAnalysis'],
          nextSteps: ['generate-solutions']
        },
        {
          id: 'generate-solutions',
          name: 'Generate Solutions',
          type: 'agent',
          pluginId: 'solution-generator',
          config: { agentType: 'solution-generator' },
          inputs: ['problem', 'problemAnalysis'],
          outputs: ['solutions'],
          nextSteps: ['evaluate-solutions']
        },
        {
          id: 'evaluate-solutions',
          name: 'Evaluate Solutions',
          type: 'agent',
          pluginId: 'solution-evaluator',
          config: { agentType: 'solution-evaluator' },
          inputs: ['problem', 'solutions'],
          outputs: ['evaluation'],
          nextSteps: ['create-action-plan']
        },
        {
          id: 'create-action-plan',
          name: 'Create Action Plan',
          type: 'agent',
          pluginId: 'action-planner',
          config: { agentType: 'action-planner' },
          inputs: ['solutions', 'evaluation'],
          outputs: ['actionPlan'],
          nextSteps: []
        }
      ],
      triggers: [{ type: 'manual', config: {} }],
      isActive: true
    });

    // Rapid Decision Workflow
    this.registerWorkflow({
      id: 'rapid-decision',
      name: 'Rapid Decision',
      description: 'Quick decision-making for time-sensitive problems',
      steps: [
        {
          id: 'define-criteria',
          name: 'Define Decision Criteria',
          type: 'analysis',
          config: { analysisType: 'criteria-definition' },
          inputs: ['problem'],
          outputs: ['criteria'],
          nextSteps: ['identify-alternatives']
        },
        {
          id: 'identify-alternatives',
          name: 'Identify Alternatives',
          type: 'agent',
          config: { agentType: 'solution-generator' },
          inputs: ['problem'],
          outputs: ['alternatives'],
          nextSteps: ['decision-matrix']
        },
        {
          id: 'decision-matrix',
          name: 'Decision Matrix Analysis',
          type: 'decision',
          config: { decisionType: 'decision-matrix' },
          inputs: ['criteria', 'alternatives'],
          outputs: ['decision'],
          nextSteps: []
        }
      ],
      triggers: [{ type: 'manual', config: {} }],
      isActive: true
    });

    // Strategic Planning Workflow
    this.registerWorkflow({
      id: 'strategic-planning',
      name: 'Strategic Planning',
      description: 'Comprehensive strategic planning workflow',
      steps: [
        {
          id: 'environment-scan',
          name: 'Environment Scan',
          type: 'analysis',
          config: { analysisType: 'pestle' },
          inputs: ['problem'],
          outputs: ['environmentAnalysis'],
          nextSteps: ['swot-analysis']
        },
        {
          id: 'swot-analysis',
          name: 'SWOT Analysis',
          type: 'analysis',
          config: { analysisType: 'swot' },
          inputs: ['problem', 'environmentAnalysis'],
          outputs: ['swot'],
          nextSteps: ['generate-strategies']
        },
        {
          id: 'generate-strategies',
          name: 'Generate Strategies',
          type: 'agent',
          config: { agentType: 'solution-generator' },
          inputs: ['problem', 'swot'],
          outputs: ['strategies'],
          nextSteps: ['feasibility-check']
        },
        {
          id: 'feasibility-check',
          name: 'Feasibility Check',
          type: 'analysis',
          config: { analysisType: 'feasibility' },
          inputs: ['strategies'],
          outputs: ['feasibility'],
          nextSteps: ['select-strategy']
        },
        {
          id: 'select-strategy',
          name: 'Select Strategy',
          type: 'decision',
          config: { decisionType: 'decision-matrix' },
          inputs: ['strategies', 'feasibility'],
          outputs: ['selectedStrategy'],
          nextSteps: ['implementation-plan']
        },
        {
          id: 'implementation-plan',
          name: 'Implementation Plan',
          type: 'agent',
          config: { agentType: 'action-planner' },
          inputs: ['selectedStrategy'],
          outputs: ['implementationPlan'],
          nextSteps: []
        }
      ],
      triggers: [{ type: 'manual', config: {} }],
      isActive: true
    });

    // Innovation Workflow
    this.registerWorkflow({
      id: 'innovation-workflow',
      name: 'Innovation Process',
      description: 'Structured innovation and creative problem solving',
      steps: [
        {
          id: 'problem-reframe',
          name: 'Reframe Problem',
          type: 'agent',
          config: { agentType: 'problem-analyzer', reframe: true },
          inputs: ['problem'],
          outputs: ['reframedProblem'],
          nextSteps: ['divergent-thinking']
        },
        {
          id: 'divergent-thinking',
          name: 'Divergent Thinking',
          type: 'agent',
          config: { agentType: 'solution-generator', mode: 'divergent' },
          inputs: ['reframedProblem'],
          outputs: ['ideas'],
          nextSteps: ['convergent-selection']
        },
        {
          id: 'convergent-selection',
          name: 'Convergent Selection',
          type: 'decision',
          config: { decisionType: 'voting' },
          inputs: ['ideas'],
          outputs: ['selectedIdeas'],
          nextSteps: ['prototype-plan']
        },
        {
          id: 'prototype-plan',
          name: 'Prototype Plan',
          type: 'agent',
          config: { agentType: 'action-planner', focus: 'prototype' },
          inputs: ['selectedIdeas'],
          outputs: ['prototypePlan'],
          nextSteps: []
        }
      ],
      triggers: [{ type: 'manual', config: {} }],
      isActive: true
    });
  }
}

function stepId(steps: WorkflowStep[], currentStep: string | null): string {
  if (!currentStep) return 'unknown';
  const step = steps.find(s => s.id === currentStep);
  return step?.id || 'unknown';
}

export default WorkflowEngine;
