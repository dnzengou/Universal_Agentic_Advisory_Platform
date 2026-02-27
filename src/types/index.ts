// Core Agentic Framework Types

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  state: AgentState;
  memory: MemoryEntry[];
}

export interface AgentState {
  status: 'idle' | 'working' | 'completed' | 'error';
  currentTask?: string;
  progress: number;
  lastUpdated: Date;
}

export interface MemoryEntry {
  id: string;
  timestamp: Date;
  type: 'input' | 'output' | 'reasoning' | 'action';
  content: string;
  agentId: string;
  metadata?: Record<string, any>;
}

export interface OrchestratorConfig {
  maxAgents: number;
  enableTraceability: boolean;
  enableLOK: boolean;
  simulationSteps: number;
}

export interface AdvisoryOutput {
  id: string;
  type: 'template' | 'kpi' | 'userStory' | 'quantitative' | 'qualitative' | 'framework';
  title: string;
  content: any;
  metadata: OutputMetadata;
  createdAt: Date;
}

export interface OutputMetadata {
  source: string;
  agentId: string;
  confidence: number;
  tags: string[];
  version: string;
}

// CAS Modeling Types

export interface GameTheoryConfig {
  players: number;
  strategies: string[];
  payoffs: number[][][];
  iterations: number;
}

export interface GameTheoryResult {
  equilibrium: string[];
  payoffs: number[];
  convergence: number[];
  iterations: number;
}

export interface EvolutionaryConfig {
  populationSize: number;
  generations: number;
  mutationRate: number;
  selectionPressure: number;
  fitnessFunction: string;
}

export interface EvolutionaryResult {
  generations: GenerationData[];
  finalFitness: number;
  bestSolution: number[];
  convergence: number;
}

export interface GenerationData {
  generation: number;
  avgFitness: number;
  bestFitness: number;
  diversity: number;
}

export interface ProspectTheoryConfig {
  alpha: number;
  beta: number;
  lambda: number;
  gamma: number;
  delta: number;
  lokLevel: number;
}

export interface ProspectTheoryResult {
  valueFunction: number[];
  weightingFunction: number[];
  decisions: number[];
  wealth: number[];
  riskPropensity: number[];
}

// Visualization Types

export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface Dataset {
  label: string;
  data: number[];
  color?: string;
  fill?: boolean;
}

export interface DashboardConfig {
  title: string;
  charts: ChartConfig[];
  refreshInterval?: number;
}

export interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'area' | 'pie' | 'radar' | 'heatmap';
  title: string;
  data: ChartData;
  options?: any;
}

// Advisory Framework Types

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  sections: TemplateSection[];
  variables: string[];
}

export interface TemplateSection {
  title: string;
  content: string;
  placeholder?: string;
}

export interface KPI {
  id: string;
  name: string;
  category: string;
  description: string;
  formula: string;
  target?: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
}

export interface UserStory {
  id: string;
  title: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  storyPoints?: number;
}

export interface Framework {
  id: string;
  name: string;
  description: string;
  principles: string[];
  components: FrameworkComponent[];
  applicability: string[];
}

export interface FrameworkComponent {
  name: string;
  description: string;
  inputs: string[];
  outputs: string[];
}

// EPR Framework Types

export interface EPRState {
  value: number;
  stability: number;
  equity: number;
  reputation: number;
  resources: number;
}

export interface EPRAgent {
  name: string;
  role: 'economic' | 'political' | 'social' | 'mastery';
  state: EPRState;
  principles: string[];
}

export interface EPRScenario {
  name: string;
  initial: Partial<EPRState>;
  steps: number;
  zone: 'red' | 'blue';
}

// Export Types

export interface ExportConfig {
  format: 'json' | 'csv' | 'pdf' | 'xlsx';
  includeMetadata: boolean;
  includeTimestamp: boolean;
  filename?: string;
}

// LOK (Lack of Knowledge) Types

export interface LOKConfig {
  entropyLevel: number;
  referencePointDrift: boolean;
  probabilityDistortion: boolean;
  informationAsymmetry: number;
}

export interface PanopticView {
  structural: any;
  semantic: any;
  temporal: any;
  traceability: TraceabilityEntry[];
}

export interface TraceabilityEntry {
  step: number;
  agent: string;
  action: string;
  reasoning: string;
  state: any;
}

// Re-export problem types
export * from './problem';
