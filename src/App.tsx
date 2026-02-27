import { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Play, Download, Brain, Plus, Search,
  Box, Menu, X, ChevronRight, Sparkles, Layers, Cpu,
  Globe, Briefcase, Heart, Leaf, Scale, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';

import { Orchestrator } from '@/core/Orchestrator';
import { AgentFactory } from '@/core/AgentFactory';
import { PluginRegistry } from '@/core/PluginRegistry';
import { WorkflowEngine } from '@/core/WorkflowEngine';
import { ProblemManager } from '@/core/ProblemManager';
import { GameTheorySimulator } from '@/models/GameTheory';
import { EvolutionarySimulator } from '@/models/Evolutionary';
import { ProspectTheorySimulator } from '@/models/ProspectTheory';
import { EPRSimulator } from '@/models/EPR';
import { ExportManager } from '@/utils/export';

import type { Agent } from '@/types';
import type { 
  ProblemDefinition, 
  Workflow as WorkflowType, 
  Plugin,
  DomainTemplate 
} from '@/types/problem';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Domain icons mapping
const DOMAIN_ICONS: Record<string, React.ElementType> = {
  business: Briefcase,
  technology: Cpu,
  healthcare: Heart,
  policy: Scale,
  environmental: Leaf,
  general: Globe,
  innovation: Sparkles,
  all: Layers
};

function App() {
  // Core Systems
  const [orchestrator] = useState(() => new Orchestrator({
    maxAgents: 15,
    enableTraceability: true,
    enableLOK: true
  }));
  const [pluginRegistry] = useState(() => PluginRegistry.getInstance());
  const [workflowEngine] = useState(() => new WorkflowEngine());
  const [problemManager] = useState(() => new ProblemManager());

  // UI State
  const [activeTab, setActiveTab] = useState('problems');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data State
  const [agents, setAgents] = useState<Agent[]>([]);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [problems, setProblems] = useState<ProblemDefinition[]>([]);
  const [templates, setTemplates] = useState<DomainTemplate[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<ProblemDefinition | null>(null);

  // Problem Form State
  const [newProblemTitle, setNewProblemTitle] = useState('');
  const [newProblemDescription, setNewProblemDescription] = useState('');
  const [newProblemDomain, setNewProblemDomain] = useState('general');
  const [newProblemUrgency, setNewProblemUrgency] = useState<ProblemDefinition['urgency']>('medium');
  const [newProblemComplexity, setNewProblemComplexity] = useState<ProblemDefinition['complexity']>('moderate');

  // CAS Model States
  const [gameTheoryResult, setGameTheoryResult] = useState<any>(null);
  const [evolutionaryResult, setEvolutionaryResult] = useState<any>(null);
  const [prospectTheoryResult, setProspectTheoryResult] = useState<any>(null);
  const [eprResult, setEprResult] = useState<any>(null);

  // Initialize
  useEffect(() => {
    // Register agents
    const allAgents = AgentFactory.createAllAgents();
    allAgents.forEach(agent => orchestrator.registerAgent(agent));
    setAgents(orchestrator.getAgents());

    // Register plugins
    pluginRegistry.registerBuiltIns();
    pluginRegistry.registerDomainPack('business');
    pluginRegistry.registerDomainPack('technology');
    pluginRegistry.registerDomainPack('policy');
    setPlugins(pluginRegistry.getActive());

    // Get workflows
    setWorkflows(workflowEngine.getAllWorkflows());

    // Get templates
    setTemplates(problemManager.getAllTemplates());

    // Get problems
    setProblems(problemManager.getAllProblems());
  }, []);

  // Create Problem
  const createProblem = useCallback(() => {
    if (!newProblemTitle || !newProblemDescription) return;

    const problem = problemManager.createQuickProblem(
      newProblemTitle,
      newProblemDescription,
      newProblemDomain,
      {
        urgency: newProblemUrgency,
        complexity: newProblemComplexity
      }
    );

    setProblems(problemManager.getAllProblems());
    setSelectedProblem(problem);
    
    // Reset form
    setNewProblemTitle('');
    setNewProblemDescription('');
  }, [newProblemTitle, newProblemDescription, newProblemDomain, newProblemUrgency, newProblemComplexity]);

  // Run Workflow
  const runWorkflow = useCallback(async (workflowId: string, problemId: string) => {
    await workflowEngine.executeWorkflow(workflowId, problemId);
    
    // Refresh problem data
    const problem = problemManager.getProblem(problemId);
    if (problem) {
      setSelectedProblem(problem);
    }
  }, []);

  // CAS Simulations
  const runGameTheory = useCallback(() => {
    setGameTheoryResult(GameTheorySimulator.prisonersDilemma(100));
  }, []);

  const runEvolutionary = useCallback(() => {
    setEvolutionaryResult(EvolutionarySimulator.evolveBusinessModel(50, ['normal', 'crisis', 'tech_disruption']));
  }, []);

  const runProspectTheory = useCallback(() => {
    const simulator = new ProspectTheorySimulator({ lokLevel: 0.5 });
    setProspectTheoryResult(simulator.simulate(50));
  }, []);

  const runEPR = useCallback(() => {
    const scenario = EPRSimulator.demographicsCollapse();
    const simulator = new EPRSimulator(scenario);
    setEprResult(simulator.simulate());
  }, []);

  // Export
  const exportAll = useCallback(() => {
    const data = {
      problems: problemManager.getAllProblems(),
      statistics: problemManager.getStatistics()
    };
    ExportManager.exportToJSON(data, `problem-framework-${Date.now()}`);
  }, []);

  // Navigation items
  const navItems = [
    { id: 'problems', label: 'Problems', icon: Search },
    { id: 'solutions', label: 'Solutions', icon: Sparkles },
    { id: 'workflows', label: 'Workflows', icon: Layers },
    { id: 'plugins', label: 'Plugins', icon: Box },
    { id: 'models', label: 'CAS Models', icon: Cpu },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  // Get domain icon
  const getDomainIcon = (domain: string) => {
    return DOMAIN_ICONS[domain] || Globe;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside 
        className={`bg-slate-900 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-blue-400" />
              <span className="font-bold text-lg">Agentic AI</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-slate-800"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="mt-6">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
            <div className="text-xs text-slate-500 space-y-1">
              <p>Agents: {agents.length}</p>
              <p>Plugins: {plugins.length}</p>
              <p>Problems: {problems.length}</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Universal Problem-Solving Framework
            </h1>
            <p className="text-sm text-slate-500">
              Subject-agnostic advisory system for actionable decision-making
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={exportAll}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </header>

        <div className="p-6">
          {/* Problems Tab */}
          {activeTab === 'problems' && (
            <div className="space-y-6">
              {/* Create Problem Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Define New Problem
                  </CardTitle>
                  <CardDescription>
                    Describe your problem to get AI-powered analysis and solutions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Problem Title</Label>
                      <Input 
                        placeholder="e.g., Declining Customer Retention"
                        value={newProblemTitle}
                        onChange={e => setNewProblemTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Domain</Label>
                      <Select value={newProblemDomain} onValueChange={setNewProblemDomain}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="policy">Policy</SelectItem>
                          <SelectItem value="environmental">Environmental</SelectItem>
                          <SelectItem value="innovation">Innovation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Problem Description</Label>
                    <Textarea 
                      placeholder="Describe the problem, its context, and what you're trying to achieve..."
                      value={newProblemDescription}
                      onChange={e => setNewProblemDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Urgency</Label>
                      <Select value={newProblemUrgency} onValueChange={(v: any) => setNewProblemUrgency(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Complexity</Label>
                      <Select value={newProblemComplexity} onValueChange={(v: any) => setNewProblemComplexity(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simple">Simple</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="complex">Complex</SelectItem>
                          <SelectItem value="wicked">Wicked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    onClick={createProblem}
                    disabled={!newProblemTitle || !newProblemDescription}
                    className="w-full"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Problem & Analyze
                  </Button>
                </CardContent>
              </Card>

              {/* Templates */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Start Templates</CardTitle>
                  <CardDescription>Pre-configured problem templates by domain</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {templates.map(template => {
                      const Icon = getDomainIcon(template.domain);
                      return (
                        <Card key={template.id} className="cursor-pointer hover:border-blue-400 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className="h-5 w-5 text-blue-500" />
                              <span className="font-medium text-sm">{template.name}</span>
                            </div>
                            <p className="text-xs text-slate-500">{template.description}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Problems List */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Problems</CardTitle>
                </CardHeader>
                <CardContent>
                  {problems.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No problems defined yet</p>
                      <p className="text-sm">Create your first problem above</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {problems.map(problem => {
                        const Icon = getDomainIcon(problem.domain);
                        return (
                          <Card 
                            key={problem.id} 
                            className={`cursor-pointer transition-colors ${
                              selectedProblem?.id === problem.id ? 'border-blue-500 border-2' : 'hover:border-blue-300'
                            }`}
                            onClick={() => setSelectedProblem(problem)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <Icon className="h-5 w-5 text-slate-400 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">{problem.title}</h4>
                                    <p className="text-sm text-slate-500 line-clamp-2">{problem.description}</p>
                                    <div className="flex gap-2 mt-2">
                                      <Badge variant="outline">{problem.domain}</Badge>
                                      <Badge variant={problem.urgency === 'critical' ? 'destructive' : 'secondary'}>
                                        {problem.urgency}
                                      </Badge>
                                      <Badge variant="outline">{problem.complexity}</Badge>
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-400" />
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Selected Problem Detail */}
              {selectedProblem && (
                <Card className="border-blue-500 border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedProblem.title}</CardTitle>
                        <CardDescription>Problem ID: {selectedProblem.id.slice(0, 8)}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {workflows.map(workflow => (
                          <Button 
                            key={workflow.id}
                            size="sm"
                            onClick={() => runWorkflow(workflow.id, selectedProblem.id)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {workflow.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="overview">
                      <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="solutions">Solutions</TabsTrigger>
                        <TabsTrigger value="analyses">Analyses</TabsTrigger>
                      </TabsList>
                      <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-slate-500">Domain</Label>
                            <p className="font-medium">{selectedProblem.domain}</p>
                          </div>
                          <div>
                            <Label className="text-slate-500">Category</Label>
                            <p className="font-medium">{selectedProblem.category}</p>
                          </div>
                          <div>
                            <Label className="text-slate-500">Urgency</Label>
                            <p className="font-medium">{selectedProblem.urgency}</p>
                          </div>
                          <div>
                            <Label className="text-slate-500">Complexity</Label>
                            <p className="font-medium">{selectedProblem.complexity}</p>
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <Label className="text-slate-500">Description</Label>
                          <p className="mt-1">{selectedProblem.description}</p>
                        </div>
                      </TabsContent>
                      <TabsContent value="solutions">
                        <div className="space-y-3">
                          {problemManager.getSolutions(selectedProblem.id).map(solution => (
                            <Card key={solution.id}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium">{solution.title}</h4>
                                    <p className="text-sm text-slate-500">{solution.description}</p>
                                  </div>
                                  <Badge>{solution.approach}</Badge>
                                </div>
                                <div className="mt-2 flex gap-2">
                                  <Badge variant="outline">Feasibility: {(solution.feasibility.overall * 100).toFixed(0)}%</Badge>
                                  <Badge variant="outline">Confidence: {(solution.confidence * 100).toFixed(0)}%</Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          {problemManager.getSolutions(selectedProblem.id).length === 0 && (
                            <p className="text-slate-500 text-center py-8">No solutions generated yet. Run a workflow to generate solutions.</p>
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="analyses">
                        <div className="space-y-3">
                          {problemManager.getAnalyses(selectedProblem.id).map(analysis => (
                            <Card key={analysis.id}>
                              <CardContent className="p-4">
                                <h4 className="font-medium capitalize">{analysis.type} Analysis</h4>
                                <div className="mt-2">
                                  <p className="text-sm text-slate-500">Findings: {analysis.findings.length}</p>
                                  <p className="text-sm text-slate-500">Insights: {analysis.insights.length}</p>
                                  <p className="text-sm text-slate-500">Recommendations: {analysis.recommendations.length}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          {problemManager.getAnalyses(selectedProblem.id).length === 0 && (
                            <p className="text-slate-500 text-center py-8">No analyses yet. Run a workflow to generate analyses.</p>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Solutions Tab */}
          {activeTab === 'solutions' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generated Solutions</CardTitle>
                  <CardDescription>All solutions across problems</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {problems.flatMap(p => 
                      problemManager.getSolutions(p.id).map(s => ({ ...s, problemTitle: p.title }))
                    ).map(solution => (
                      <Card key={solution.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{solution.title}</h4>
                              <p className="text-sm text-slate-500">For: {solution.problemTitle}</p>
                              <p className="text-sm mt-1">{solution.description}</p>
                            </div>
                            <div className="text-right">
                              <Badge>{solution.approach}</Badge>
                              <p className="text-sm text-slate-500 mt-1">
                                Feasibility: {(solution.feasibility.overall * 100).toFixed(0)}%
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {problems.flatMap(p => problemManager.getSolutions(p.id)).length === 0 && (
                      <p className="text-slate-500 text-center py-8">No solutions generated yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Workflows Tab */}
          {activeTab === 'workflows' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Workflows</CardTitle>
                  <CardDescription>Pre-configured problem-solving workflows</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workflows.map(workflow => (
                      <Card key={workflow.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{workflow.name}</CardTitle>
                          <CardDescription>{workflow.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-slate-500">Steps: {workflow.steps.length}</p>
                          <Accordion type="single" collapsible>
                            <AccordionItem value="steps">
                              <AccordionTrigger>View Steps</AccordionTrigger>
                              <AccordionContent>
                                <ol className="list-decimal list-inside space-y-1 text-sm">
                                  {workflow.steps.map((step: any) => (
                                    <li key={step.id}>{step.name}</li>
                                  ))}
                                </ol>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Plugins Tab */}
          {activeTab === 'plugins' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Plugin Registry</CardTitle>
                  <CardDescription>Active plugins and capabilities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plugins.map(plugin => (
                      <Card key={plugin.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{plugin.name}</CardTitle>
                            <Badge variant="outline">{plugin.type}</Badge>
                          </div>
                          <CardDescription className="text-xs">v{plugin.version}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-slate-600 mb-2">{plugin.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {plugin.capabilities.slice(0, 3).map(cap => (
                              <Badge key={cap} variant="secondary" className="text-xs">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* CAS Models Tab */}
          {activeTab === 'models' && (
            <div className="space-y-6">
              <Tabs defaultValue="gameTheory">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="gameTheory">Game Theory</TabsTrigger>
                  <TabsTrigger value="evolutionary">Evolutionary</TabsTrigger>
                  <TabsTrigger value="prospectTheory">Prospect Theory</TabsTrigger>
                  <TabsTrigger value="epr">EPR</TabsTrigger>
                </TabsList>

                <TabsContent value="gameTheory" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Game Theory Simulation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={runGameTheory}>
                        <Play className="h-4 w-4 mr-2" />
                        Run Simulation
                      </Button>
                      {gameTheoryResult && (
                        <div className="mt-4 h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={gameTheoryResult.convergence.map((c: number, i: number) => ({ 
                              iteration: i, 
                              convergence: c 
                            }))}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="iteration" />
                              <YAxis domain={[0, 1]} />
                              <Tooltip />
                              <Line type="monotone" dataKey="convergence" stroke="#8884d8" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="evolutionary" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Evolutionary Optimization</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={runEvolutionary}>
                        <Play className="h-4 w-4 mr-2" />
                        Run Evolution
                      </Button>
                      {evolutionaryResult && (
                        <div className="mt-4 h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={evolutionaryResult.generations}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="generation" />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="bestFitness" stroke="#00C49F" />
                              <Line type="monotone" dataKey="avgFitness" stroke="#8884D8" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="prospectTheory" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Prospect Theory Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={runProspectTheory}>
                        <Play className="h-4 w-4 mr-2" />
                        Analyze
                      </Button>
                      {prospectTheoryResult && (
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div className="h-48">
                            <p className="text-sm font-medium mb-2">Value Function</p>
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={prospectTheoryResult.valueFunction.map((v: number, i: number) => ({ 
                                x: i - 50, 
                                value: v 
                              }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="x" />
                                <YAxis />
                                <Line type="monotone" dataKey="value" stroke="#8884d8" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="h-48">
                            <p className="text-sm font-medium mb-2">Wealth Evolution</p>
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={prospectTheoryResult.wealth.map((w: number, i: number) => ({ 
                                step: i, 
                                wealth: w 
                              }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="step" />
                                <YAxis />
                                <Line type="monotone" dataKey="wealth" stroke="#FF8042" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="epr" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>EPR Simulation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={runEPR}>
                        <Play className="h-4 w-4 mr-2" />
                        Run EPR Simulation
                      </Button>
                      {eprResult && (
                        <div className="mt-4">
                          <div className="grid grid-cols-4 gap-4 mb-4">
                            <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Value</p><p className="text-xl font-bold">{eprResult.finalState.value.toFixed(1)}</p></CardContent></Card>
                            <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Stability</p><p className="text-xl font-bold">{eprResult.finalState.stability.toFixed(2)}</p></CardContent></Card>
                            <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Equity</p><p className="text-xl font-bold">{eprResult.finalState.equity.toFixed(2)}</p></CardContent></Card>
                            <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Reputation</p><p className="text-xl font-bold">{eprResult.finalState.reputation.toFixed(2)}</p></CardContent></Card>
                          </div>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={eprResult.history.value.map((_: number, i: number) => ({
                                step: i,
                                value: eprResult.history.value[i],
                                stability: eprResult.history.stability[i],
                                equity: eprResult.history.equity[i],
                                reputation: eprResult.history.reputation[i]
                              }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="step" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="value" stroke="#0088FE" name="Economic Value" />
                                <Line type="monotone" dataKey="stability" stroke="#00C49F" name="Political Stability" />
                                <Line type="monotone" dataKey="equity" stroke="#FFBB28" name="Social Equity" />
                                <Line type="monotone" dataKey="reputation" stroke="#FF8042" name="Gracián Reputation" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Problems</CardDescription>
                    <CardTitle className="text-3xl">{problemManager.getStatistics().totalProblems}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Solutions</CardDescription>
                    <CardTitle className="text-3xl">{problemManager.getStatistics().totalSolutions}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Analyses</CardDescription>
                    <CardTitle className="text-3xl">{problemManager.getStatistics().totalAnalyses}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Active Plugins</CardDescription>
                    <CardTitle className="text-3xl">{plugins.length}</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Domain Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Problems by Domain</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(problemManager.getStatistics().problemsByDomain).map(([domain, count]) => ({ domain, count }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="domain" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8">
                        {Object.entries(problemManager.getStatistics().problemsByDomain).map((_, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
