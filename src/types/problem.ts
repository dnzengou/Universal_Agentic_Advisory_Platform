// Generic Problem-Solving Framework Types

export interface ProblemDefinition {
  id: string;
  title: string;
  description: string;
  domain: string;
  category: ProblemCategory;
  constraints: Constraint[];
  objectives: Objective[];
  stakeholders: Stakeholder[];
  context: ProblemContext;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  complexity: 'simple' | 'moderate' | 'complex' | 'wicked';
  createdAt: Date;
}

export type ProblemCategory = 
  | 'strategic'
  | 'operational'
  | 'technical'
  | 'organizational'
  | 'financial'
  | 'social'
  | 'environmental'
  | 'political'
  | 'custom';

export interface Constraint {
  id: string;
  type: 'budget' | 'time' | 'resource' | 'regulatory' | 'technical' | 'social' | 'ethical' | 'custom';
  description: string;
  value?: number;
  unit?: string;
  isHard: boolean;
}

export interface Objective {
  id: string;
  description: string;
  priority: number; // 1-10
  measurable: boolean;
  target?: string;
  metric?: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  influence: 'low' | 'medium' | 'high';
  interest: 'low' | 'medium' | 'high';
  concerns: string[];
}

export interface ProblemContext {
  industry?: string;
  marketConditions?: string;
  regulatoryEnvironment?: string;
  competitiveLandscape?: string;
  internalFactors?: string[];
  externalFactors?: string[];
  assumptions: string[];
  risks: Risk[];
}

export interface Risk {
  id: string;
  description: string;
  probability: number; // 0-1
  impact: number; // 0-1
  mitigation?: string;
}

// Solution Types

export interface Solution {
  id: string;
  problemId: string;
  title: string;
  description: string;
  approach: SolutionApproach;
  actions: ActionItem[];
  expectedOutcomes: ExpectedOutcome[];
  resourceRequirements: ResourceRequirement[];
  timeline: Timeline;
  risks: Risk[];
  feasibility: FeasibilityScore;
  confidence: number; // 0-1
  generatedBy: string;
  createdAt: Date;
}

export type SolutionApproach =
  | 'incremental'
  | 'transformational'
  | 'innovative'
  | 'adaptive'
  | 'preventive'
  | 'corrective'
  | 'evidence-based';

export interface ActionItem {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  owner?: string;
  dependencies: string[];
  estimatedEffort: number; // hours
  estimatedCost?: number;
}

export interface ExpectedOutcome {
  description: string;
  metric: string;
  target: string;
  timeframe: string;
}

export interface ResourceRequirement {
  type: 'human' | 'financial' | 'technical' | 'material' | 'time';
  description: string;
  quantity: number;
  unit: string;
}

export interface Timeline {
  phases: Phase[];
  totalDuration: string;
  criticalPath: string[];
}

export interface Phase {
  name: string;
  duration: string;
  milestones: string[];
  dependencies: string[];
}

export interface FeasibilityScore {
  technical: number; // 0-1
  economic: number; // 0-1
  operational: number; // 0-1
  legal: number; // 0-1
  schedule: number; // 0-1
  overall: number; // 0-1
}

// Decision Support Types

export interface DecisionMatrix {
  criteria: DecisionCriterion[];
  alternatives: Alternative[];
  scores: Record<string, Record<string, number>>;
  weights: Record<string, number>;
  recommendation: string;
}

export interface DecisionCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  isMaximizing: boolean;
}

export interface Alternative {
  id: string;
  name: string;
  description: string;
  solutionId: string;
}

// Plugin System Types

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  type: PluginType;
  capabilities: string[];
  config: PluginConfig;
  isActive: boolean;
}

export type PluginType = 
  | 'agent'
  | 'model'
  | 'visualization'
  | 'export'
  | 'analysis'
  | 'integration';

export interface PluginConfig {
  [key: string]: any;
}

export interface PluginRegistry {
  plugins: Map<string, Plugin>;
  register(plugin: Plugin): void;
  unregister(pluginId: string): void;
  getByType(type: PluginType): Plugin[];
  getByCapability(capability: string): Plugin[];
}

// Workflow Engine Types

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  isActive: boolean;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'agent' | 'model' | 'analysis' | 'decision' | 'action' | 'custom';
  pluginId?: string;
  config: Record<string, any>;
  inputs: string[];
  outputs: string[];
  nextSteps: string[];
  conditions?: StepCondition[];
}

export interface StepCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';
  value: any;
}

export interface WorkflowTrigger {
  type: 'manual' | 'scheduled' | 'event' | 'api';
  config: Record<string, any>;
}

// Analysis Types

export interface AnalysisResult {
  id: string;
  problemId: string;
  type: AnalysisType;
  findings: Finding[];
  insights: string[];
  recommendations: string[];
  visualizations: VisualizationConfig[];
  confidence: number;
  generatedAt: Date;
}

export type AnalysisType =
  | 'root_cause'
  | 'stakeholder'
  | 'risk'
  | 'opportunity'
  | 'constraint'
  | 'impact'
  | 'feasibility'
  | 'trend'
  | 'comparative';

export interface Finding {
  id: string;
  category: string;
  description: string;
  evidence: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface VisualizationConfig {
  type: 'chart' | 'graph' | 'table' | 'matrix' | 'tree' | 'map';
  config: Record<string, any>;
  data: any;
}

// Domain Templates

export interface DomainTemplate {
  id: string;
  domain: string;
  name: string;
  description: string;
  defaultObjectives: Objective[];
  defaultConstraints: Constraint[];
  defaultStakeholders: Stakeholder[];
  suggestedApproaches: SolutionApproach[];
  relevantModels: string[];
  relevantAgents: string[];
}
