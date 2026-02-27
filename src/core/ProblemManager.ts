import type { 
  ProblemDefinition, 
  Solution,
  AnalysisResult,
  DomainTemplate,
  Objective,
  Constraint
} from '@/types/problem';
import { v4 as uuidv4 } from 'uuid';

export class ProblemManager {
  private problems: Map<string, ProblemDefinition> = new Map();
  private solutions: Map<string, Solution[]> = new Map();
  private analyses: Map<string, AnalysisResult[]> = new Map();
  private domainTemplates: Map<string, DomainTemplate> = new Map();

  constructor() {
    this.registerDefaultTemplates();
  }

  // Problem CRUD Operations
  createProblem(problem: Omit<ProblemDefinition, 'id' | 'createdAt'>): ProblemDefinition {
    const newProblem: ProblemDefinition = {
      ...problem,
      id: uuidv4(),
      createdAt: new Date()
    };
    
    this.problems.set(newProblem.id, newProblem);
    this.solutions.set(newProblem.id, []);
    this.analyses.set(newProblem.id, []);
    
    return newProblem;
  }

  getProblem(id: string): ProblemDefinition | undefined {
    return this.problems.get(id);
  }

  updateProblem(id: string, updates: Partial<ProblemDefinition>): ProblemDefinition | undefined {
    const problem = this.problems.get(id);
    if (problem) {
      const updated = { ...problem, ...updates };
      this.problems.set(id, updated);
      return updated;
    }
    return undefined;
  }

  deleteProblem(id: string): boolean {
    this.solutions.delete(id);
    this.analyses.delete(id);
    return this.problems.delete(id);
  }

  getAllProblems(): ProblemDefinition[] {
    return Array.from(this.problems.values());
  }

  getProblemsByDomain(domain: string): ProblemDefinition[] {
    return this.getAllProblems().filter(p => p.domain === domain);
  }

  getProblemsByCategory(category: string): ProblemDefinition[] {
    return this.getAllProblems().filter(p => p.category === category);
  }

  // Solution Management
  addSolution(problemId: string, solution: Omit<Solution, 'id' | 'problemId' | 'createdAt'>): Solution {
    const newSolution: Solution = {
      ...solution,
      id: uuidv4(),
      problemId,
      createdAt: new Date()
    };

    const problemSolutions = this.solutions.get(problemId) || [];
    problemSolutions.push(newSolution);
    this.solutions.set(problemId, problemSolutions);

    return newSolution;
  }

  getSolutions(problemId: string): Solution[] {
    return this.solutions.get(problemId) || [];
  }

  getSolutionById(problemId: string, solutionId: string): Solution | undefined {
    const solutions = this.getSolutions(problemId);
    return solutions.find(s => s.id === solutionId);
  }

  updateSolution(problemId: string, solutionId: string, updates: Partial<Solution>): Solution | undefined {
    const solutions = this.solutions.get(problemId) || [];
    const index = solutions.findIndex(s => s.id === solutionId);
    
    if (index !== -1) {
      solutions[index] = { ...solutions[index], ...updates };
      this.solutions.set(problemId, solutions);
      return solutions[index];
    }
    return undefined;
  }

  deleteSolution(problemId: string, solutionId: string): boolean {
    const solutions = this.solutions.get(problemId) || [];
    const filtered = solutions.filter(s => s.id !== solutionId);
    this.solutions.set(problemId, filtered);
    return solutions.length !== filtered.length;
  }

  // Analysis Management
  addAnalysis(problemId: string, analysis: Omit<AnalysisResult, 'id' | 'problemId' | 'generatedAt'>): AnalysisResult {
    const newAnalysis: AnalysisResult = {
      ...analysis,
      id: uuidv4(),
      problemId,
      generatedAt: new Date()
    };

    const problemAnalyses = this.analyses.get(problemId) || [];
    problemAnalyses.push(newAnalysis);
    this.analyses.set(problemId, problemAnalyses);

    return newAnalysis;
  }

  getAnalyses(problemId: string): AnalysisResult[] {
    return this.analyses.get(problemId) || [];
  }

  getAnalysesByType(problemId: string, type: string): AnalysisResult[] {
    return this.getAnalyses(problemId).filter(a => a.type === type);
  }

  // Domain Templates
  registerTemplate(template: DomainTemplate): void {
    this.domainTemplates.set(template.id, template);
  }

  getTemplate(id: string): DomainTemplate | undefined {
    return this.domainTemplates.get(id);
  }

  getTemplatesByDomain(domain: string): DomainTemplate[] {
    return Array.from(this.domainTemplates.values()).filter(t => t.domain === domain);
  }

  getAllTemplates(): DomainTemplate[] {
    return Array.from(this.domainTemplates.values());
  }

  applyTemplate(problemId: string, templateId: string): ProblemDefinition | undefined {
    const problem = this.problems.get(problemId);
    const template = this.domainTemplates.get(templateId);
    
    if (problem && template) {
      const updated: ProblemDefinition = {
        ...problem,
        objectives: [...problem.objectives, ...template.defaultObjectives.map(o => ({ ...o, id: uuidv4() }))],
        constraints: [...problem.constraints, ...template.defaultConstraints.map(c => ({ ...c, id: uuidv4() }))],
        stakeholders: [...problem.stakeholders, ...template.defaultStakeholders.map(s => ({ ...s, id: uuidv4() }))]
      };
      
      this.problems.set(problemId, updated);
      return updated;
    }
    return undefined;
  }

  // Quick Problem Creation
  createQuickProblem(
    title: string,
    description: string,
    domain: string = 'general',
    options: {
      urgency?: ProblemDefinition['urgency'];
      complexity?: ProblemDefinition['complexity'];
      objectives?: string[];
      constraints?: string[];
    } = {}
  ): ProblemDefinition {
    const objectives: Objective[] = (options.objectives || []).map((desc) => ({
      id: uuidv4(),
      description: desc,
      priority: 5,
      measurable: true
    }));

    const constraints: Constraint[] = (options.constraints || []).map((desc) => ({
      id: uuidv4(),
      type: 'custom',
      description: desc,
      isHard: true,
      value: undefined,
      unit: undefined
    }));

    return this.createProblem({
      title,
      description,
      domain,
      category: 'custom',
      objectives,
      constraints,
      stakeholders: [],
      context: {
        assumptions: [],
        risks: []
      },
      urgency: options.urgency || 'medium',
      complexity: options.complexity || 'moderate'
    });
  }

  // Statistics
  getStatistics(): {
    totalProblems: number;
    problemsByDomain: Record<string, number>;
    problemsByCategory: Record<string, number>;
    totalSolutions: number;
    totalAnalyses: number;
  } {
    const problems = this.getAllProblems();
    
    const problemsByDomain: Record<string, number> = {};
    const problemsByCategory: Record<string, number> = {};
    
    problems.forEach(p => {
      problemsByDomain[p.domain] = (problemsByDomain[p.domain] || 0) + 1;
      problemsByCategory[p.category] = (problemsByCategory[p.category] || 0) + 1;
    });

    let totalSolutions = 0;
    this.solutions.forEach(sols => totalSolutions += sols.length);

    let totalAnalyses = 0;
    this.analyses.forEach(analyses => totalAnalyses += analyses.length);

    return {
      totalProblems: problems.length,
      problemsByDomain,
      problemsByCategory,
      totalSolutions,
      totalAnalyses
    };
  }

  // Default Templates
  private registerDefaultTemplates(): void {
    // Business Strategy Template
    this.registerTemplate({
      id: 'business-strategy',
      domain: 'business',
      name: 'Business Strategy',
      description: 'Template for strategic business problems',
      defaultObjectives: [
        { id: '', description: 'Increase market share', priority: 8, measurable: true, target: '15%', metric: 'market share %' },
        { id: '', description: 'Improve profitability', priority: 9, measurable: true, target: '20%', metric: 'profit margin %' },
        { id: '', description: 'Enhance customer satisfaction', priority: 7, measurable: true, target: '4.5', metric: 'NPS score' }
      ],
      defaultConstraints: [
        { id: '', type: 'budget', description: 'Limited budget for investment', isHard: true },
        { id: '', type: 'time', description: 'Results needed within fiscal year', isHard: false },
        { id: '', type: 'resource', description: 'Limited team capacity', isHard: true }
      ],
      defaultStakeholders: [
        { id: '', name: 'Executive Team', role: 'Decision maker', influence: 'high', interest: 'high', concerns: ['ROI', 'Strategic alignment'] },
        { id: '', name: 'Operations Team', role: 'Implementer', influence: 'medium', interest: 'high', concerns: ['Feasibility', 'Resources'] },
        { id: '', name: 'Customers', role: 'Beneficiary', influence: 'medium', interest: 'medium', concerns: ['Value', 'Experience'] }
      ],
      suggestedApproaches: ['incremental', 'transformational'],
      relevantModels: ['porter-five-forces', 'swot-analysis', 'pestle-analysis'],
      relevantAgents: ['problem-analyzer', 'solution-generator', 'solution-evaluator']
    });

    // Technology Implementation Template
    this.registerTemplate({
      id: 'tech-implementation',
      domain: 'technology',
      name: 'Technology Implementation',
      description: 'Template for technology adoption and implementation problems',
      defaultObjectives: [
        { id: '', description: 'Improve system performance', priority: 9, measurable: true, target: '50%', metric: 'response time reduction' },
        { id: '', description: 'Reduce technical debt', priority: 7, measurable: true, target: '30%', metric: 'code quality score' },
        { id: '', description: 'Enhance security posture', priority: 8, measurable: true, target: 'Zero', metric: 'critical vulnerabilities' }
      ],
      defaultConstraints: [
        { id: '', type: 'technical', description: 'Legacy system integration required', isHard: true },
        { id: '', type: 'regulatory', description: 'Compliance requirements', isHard: true },
        { id: '', type: 'time', description: 'Minimal downtime allowed', isHard: true }
      ],
      defaultStakeholders: [
        { id: '', name: 'IT Leadership', role: 'Decision maker', influence: 'high', interest: 'high', concerns: ['Architecture', 'Security'] },
        { id: '', name: 'Development Team', role: 'Implementer', influence: 'medium', interest: 'high', concerns: ['Complexity', 'Maintainability'] },
        { id: '', name: 'End Users', role: 'User', influence: 'low', interest: 'medium', concerns: ['Usability', 'Performance'] }
      ],
      suggestedApproaches: ['incremental', 'adaptive'],
      relevantModels: ['tech-readiness', 'architecture-analysis'],
      relevantAgents: ['problem-analyzer', 'solution-generator', 'action-planner']
    });

    // Policy Development Template
    this.registerTemplate({
      id: 'policy-development',
      domain: 'policy',
      name: 'Policy Development',
      description: 'Template for policy and regulatory problems',
      defaultObjectives: [
        { id: '', description: 'Ensure compliance', priority: 10, measurable: true, target: '100%', metric: 'compliance rate' },
        { id: '', description: 'Minimize negative impact', priority: 8, measurable: true, target: 'Minimal', metric: 'stakeholder complaints' },
        { id: '', description: 'Achieve policy goals', priority: 9, measurable: true, target: 'Defined', metric: 'KPI achievement' }
      ],
      defaultConstraints: [
        { id: '', type: 'regulatory', description: 'Legal framework requirements', isHard: true },
        { id: '', type: 'social', description: 'Public acceptance needed', isHard: false },
        { id: '', type: 'time', description: 'Implementation deadlines', isHard: true }
      ],
      defaultStakeholders: [
        { id: '', name: 'Regulators', role: 'Oversight', influence: 'high', interest: 'high', concerns: ['Compliance', 'Enforcement'] },
        { id: '', name: 'Industry', role: 'Subject', influence: 'high', interest: 'high', concerns: ['Cost', 'Feasibility'] },
        { id: '', name: 'Public', role: 'Affected party', influence: 'medium', interest: 'medium', concerns: ['Impact', 'Fairness'] }
      ],
      suggestedApproaches: ['incremental', 'adaptive'],
      relevantModels: ['policy-impact', 'regulatory-compliance'],
      relevantAgents: ['problem-analyzer', 'stakeholder-analysis', 'solution-generator']
    });

    // Healthcare Intervention Template
    this.registerTemplate({
      id: 'healthcare-intervention',
      domain: 'healthcare',
      name: 'Healthcare Intervention',
      description: 'Template for healthcare and clinical problems',
      defaultObjectives: [
        { id: '', description: 'Improve patient outcomes', priority: 10, measurable: true, target: 'Significant', metric: 'clinical endpoints' },
        { id: '', description: 'Reduce costs', priority: 7, measurable: true, target: '15%', metric: 'cost per patient' },
        { id: '', description: 'Enhance quality of care', priority: 9, measurable: true, target: 'High', metric: 'quality scores' }
      ],
      defaultConstraints: [
        { id: '', type: 'regulatory', description: 'Clinical trial requirements', isHard: true },
        { id: '', type: 'ethical', description: 'Patient safety paramount', isHard: true },
        { id: '', type: 'resource', description: 'Limited healthcare resources', isHard: true }
      ],
      defaultStakeholders: [
        { id: '', name: 'Clinicians', role: 'Provider', influence: 'high', interest: 'high', concerns: ['Efficacy', 'Safety'] },
        { id: '', name: 'Patients', role: 'Recipient', influence: 'medium', interest: 'high', concerns: ['Outcomes', 'Access'] },
        { id: '', name: 'Payers', role: 'Financier', influence: 'high', interest: 'medium', concerns: ['Cost', 'Value'] }
      ],
      suggestedApproaches: ['incremental', 'evidence-based'],
      relevantModels: ['clinical-decision', 'health-economics'],
      relevantAgents: ['problem-analyzer', 'solution-generator', 'solution-evaluator']
    });

    // Innovation Challenge Template
    this.registerTemplate({
      id: 'innovation-challenge',
      domain: 'innovation',
      name: 'Innovation Challenge',
      description: 'Template for innovation and creative problem solving',
      defaultObjectives: [
        { id: '', description: 'Generate breakthrough ideas', priority: 9, measurable: false },
        { id: '', description: 'Validate feasibility', priority: 8, measurable: true, target: '3+', metric: 'viable concepts' },
        { id: '', description: 'Create competitive advantage', priority: 9, measurable: true, target: 'Unique', metric: 'differentiation' }
      ],
      defaultConstraints: [
        { id: '', type: 'budget', description: 'R&D budget limitations', isHard: false },
        { id: '', type: 'time', description: 'Time-to-market pressure', isHard: false },
        { id: '', type: 'technical', description: 'Technology readiness', isHard: true }
      ],
      defaultStakeholders: [
        { id: '', name: 'Innovation Team', role: 'Creator', influence: 'high', interest: 'high', concerns: ['Creativity', 'Resources'] },
        { id: '', name: 'Leadership', role: 'Sponsor', influence: 'high', interest: 'medium', concerns: ['ROI', 'Strategic fit'] },
        { id: '', name: 'Market', role: 'Customer', influence: 'medium', interest: 'medium', concerns: ['Value', 'Adoption'] }
      ],
      suggestedApproaches: ['innovative', 'adaptive'],
      relevantModels: ['system-dynamics', 'evolutionary-model'],
      relevantAgents: ['problem-analyzer', 'solution-generator', 'solution-evaluator']
    });
  }
}

export default ProblemManager;
