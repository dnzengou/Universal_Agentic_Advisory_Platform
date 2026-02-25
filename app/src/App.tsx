import { useState, useEffect } from 'react'
import './App.css'
import { 
  Rocket, Brain, Shield, Coins, Bot, Lock, Zap, 
  Scale, Lightbulb, Orbit, TrendingUp, Layers, Target,
  CheckCircle, Play, Calculator,
  MessageSquare, Menu, X, Star, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

// Module data
const modules = [
  { id: 'M01', title: 'System-Thinking Vetting & De-Hype', level: 'All', icon: Brain, color: 'from-purple-500 to-pink-500', hasCalculator: true },
  { id: 'M02', title: 'Fast-Track Development Framework', level: 'Technical', icon: Zap, color: 'from-blue-500 to-cyan-500', hasCalculator: true },
  { id: 'M03', title: 'Regulatory-First Design', level: 'Specialist', icon: Shield, color: 'from-emerald-500 to-teal-500', hasCalculator: false },
  { id: 'M04', title: 'Go-To-Market & Tokenomics', level: 'Business', icon: Coins, color: 'from-green-500 to-emerald-500', hasCalculator: true },
  { id: 'M05', title: 'Building AI Agents for Deep Tech', level: 'Advanced', icon: Bot, color: 'from-violet-500 to-purple-500', hasCalculator: false },
  { id: 'M06', title: 'PQC & Quantum-Safe Systems', level: 'Specialist', icon: Lock, color: 'from-orange-500 to-red-500', hasCalculator: true },
  { id: 'M07', title: 'Nuclear + Fusion Energy', level: 'Specialist', icon: Zap, color: 'from-yellow-500 to-orange-500', hasCalculator: false },
  { id: 'M08', title: 'Space Tech: From Project to Hero', level: 'Intrapreneur', icon: Rocket, color: 'from-cyan-500 to-blue-500', hasCalculator: true },
  { id: 'M09', title: 'AI Ethics & Governance', level: 'All', icon: Scale, color: 'from-indigo-500 to-violet-500', hasCalculator: false },
  { id: 'M10', title: 'Frugal Innovation', level: 'Entrepreneur', icon: Lightbulb, color: 'from-amber-500 to-yellow-500', hasCalculator: false },
  { id: 'M11', title: 'AI Agents in Space Tech', level: 'Advanced', icon: Orbit, color: 'from-fuchsia-500 to-pink-500', hasCalculator: false },
  { id: 'M12', title: 'Unit Economics & Sovereign Scaling', level: 'Business', icon: TrendingUp, color: 'from-lime-500 to-green-500', hasCalculator: true },
  { id: 'M13', title: 'First-Principles + Systems Thinking', level: 'All', icon: Layers, color: 'from-rose-500 to-red-500', hasCalculator: false },
  { id: 'M14', title: 'Agentic Monetization & Unicorn Playbook', level: 'Founder', icon: Target, color: 'from-sky-500 to-blue-500', hasCalculator: false },
]

// De-Hype Calculator Component
function DeHypeCalculator() {
  const [tech, setTech] = useState('Quantum Computing')
  const [trl, setTrl] = useState(4)
  const [crl, setCrl] = useState(3)
  const [risk, setRisk] = useState(8)
  const [energy, setEnergy] = useState(6)

  const score = Math.round((trl + crl) * 10 / (risk + (10 - energy)))
  const verdict = score >= 80 ? 'UNICORN' : score >= 60 ? 'STRONG' : score >= 40 ? 'RISKY' : 'KILL IT'
  const verdictColor = score >= 80 ? 'text-green-500' : score >= 60 ? 'text-blue-500' : score >= 40 ? 'text-yellow-500' : 'text-red-500'

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl">
      <h3 className="text-2xl font-bold mb-4 text-purple-800">De-Hype Scoreboard 2026</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Input value={tech} onChange={(e) => setTech(e.target.value)} placeholder="Tech Name" className="text-lg" />
          <div>
            <label className="text-sm font-medium">TRL: {trl}</label>
            <Slider value={[trl]} onValueChange={(v) => setTrl(v[0])} min={1} max={9} />
          </div>
          <div>
            <label className="text-sm font-medium">CRL: {crl}</label>
            <Slider value={[crl]} onValueChange={(v) => setCrl(v[0])} min={1} max={9} />
          </div>
          <div>
            <label className="text-sm font-medium">Sovereign Risk: {risk}</label>
            <Slider value={[risk]} onValueChange={(v) => setRisk(v[0])} min={1} max={10} />
          </div>
          <div>
            <label className="text-sm font-medium">Energy Feasibility: {energy}</label>
            <Slider value={[energy]} onValueChange={(v) => setEnergy(v[0])} min={1} max={10} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white p-6 rounded-xl flex flex-col items-center justify-center">
          <div className="text-6xl font-black">{score}</div>
          <div className={`text-2xl font-bold mt-2 ${verdictColor}`}>{verdict}</div>
          <Button className="mt-4 bg-white text-purple-700 hover:bg-gray-100">Export Scorecard</Button>
        </div>
      </div>
    </div>
  )
}

// Sprint Builder Calculator
function SprintCalculator() {
  const [project, setProject] = useState('Sovereign AI Agent Platform')
  const [weeks, setWeeks] = useState(Array.from({length: 12}, (_, i) => ({ id: i + 1, goal: '', owner: '' })))

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl">
      <h3 className="text-2xl font-bold mb-4 text-blue-800">90-Day MVP Sprint Builder</h3>
      <Input value={project} onChange={(e) => setProject(e.target.value)} placeholder="Project Name" className="text-lg mb-4" />
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
        {weeks.map((week) => (
          <div key={week.id} className="bg-white p-3 rounded-lg shadow">
            <div className="font-bold text-blue-700">W{week.id}</div>
            <input 
              placeholder="Goal" 
              className="w-full text-xs border rounded px-2 py-1 mt-1"
              value={week.goal}
              onChange={(e) => {
                const newWeeks = [...weeks]
                newWeeks[week.id - 1].goal = e.target.value
                setWeeks(newWeeks)
              }}
            />
          </div>
        ))}
      </div>
      <Button className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-600">Generate Roadmap</Button>
    </div>
  )
}

// Tokenomics Calculator
function TokenomicsCalculator() {
  const [name, setName] = useState('DEEPTECH')
  const [supply, setSupply] = useState(100000000)
  const [price, setPrice] = useState(0.1)
  const [vesting, setVesting] = useState(24)
  const [revenue, setRevenue] = useState(70)

  const marketCap = Math.round(supply * price * (1 + revenue / 100))

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl">
      <h3 className="text-2xl font-bold mb-4 text-green-800">Live Tokenomics Designer</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Token Name" />
          <Input type="number" value={supply} onChange={(e) => setSupply(Number(e.target.value))} placeholder="Total Supply" />
          <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="Initial Price ($)" step="0.01" />
          <div>
            <label className="text-sm font-medium">Vesting: {vesting} months</label>
            <Slider value={[vesting]} onValueChange={(v) => setVesting(v[0])} min={0} max={48} />
          </div>
          <div>
            <label className="text-sm font-medium">Revenue Share: {revenue}%</label>
            <Slider value={[revenue]} onValueChange={(v) => setRevenue(v[0])} min={0} max={90} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white p-6 rounded-xl flex flex-col items-center justify-center">
          <div className="text-sm opacity-80">Projected Market Cap</div>
          <div className="text-4xl font-black">${marketCap.toLocaleString()}</div>
          <Button className="mt-4 bg-white text-green-700 hover:bg-gray-100">Mint Token</Button>
        </div>
      </div>
    </div>
  )
}

// PQC Calculator
function PQCCalculator() {
  const [ecdsa, setEcdsa] = useState(50000)
  const [data, setData] = useState(1200)

  const risk = Math.min(99, Math.round((ecdsa / 10000) + (data / 100)))
  const days = 1825 - (risk * 15)
  const algo = risk > 70 ? 'SLH-DSA' : 'Kyber-768'

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl">
      <h3 className="text-2xl font-bold mb-4 text-orange-800">PQC Migration Risk Calculator</h3>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white p-4 rounded-xl text-center shadow">
          <div className="text-4xl font-black text-orange-600">{risk}</div>
          <div className="text-sm text-gray-600">Risk Score</div>
        </div>
        <div className="bg-white p-4 rounded-xl text-center shadow">
          <div className="text-4xl font-black text-red-600">{days}</div>
          <div className="text-sm text-gray-600">Days to Q-Day</div>
        </div>
        <div className="bg-white p-4 rounded-xl text-center shadow">
          <div className="text-2xl font-black text-purple-600">{algo}</div>
          <div className="text-sm text-gray-600">Recommended</div>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">ECDSA Keys: {ecdsa.toLocaleString()}</label>
          <Slider value={[ecdsa]} onValueChange={(v) => setEcdsa(v[0])} min={0} max={1000000} step={1000} />
        </div>
        <div>
          <label className="text-sm font-medium">Data (TB): {data}</label>
          <Slider value={[data]} onValueChange={(v) => setData(v[0])} min={0} max={10000} step={100} />
        </div>
      </div>
      <Button className="mt-4 bg-gradient-to-r from-red-600 to-orange-600">Generate Migration Plan</Button>
    </div>
  )
}

// Space Launch Calculator
function SpaceCalculator() {
  const [rocket, setRocket] = useState('Vikram-3')
  const [payload, setPayload] = useState(500)

  const cost = payload * 18000
  const breakeven = Math.round(100000000 / cost)
  const marketFit = payload > 1000 ? 'UNICORN' : 'NICHE'

  return (
    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-2xl">
      <h3 className="text-2xl font-bold mb-4 text-cyan-800">Space Tech Launch Calculator</h3>
      <Input value={rocket} onChange={(e) => setRocket(e.target.value)} placeholder="Rocket Name" className="mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white p-4 rounded-xl text-center shadow">
          <input 
            type="number" 
            value={payload} 
            onChange={(e) => setPayload(Number(e.target.value))}
            className="text-2xl font-black w-full text-center border rounded"
          />
          <div className="text-sm text-gray-600">Payload (kg)</div>
        </div>
        <div className="bg-white p-4 rounded-xl text-center shadow">
          <div className="text-2xl font-black text-cyan-600">${cost.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Cost to LEO</div>
        </div>
        <div className="bg-white p-4 rounded-xl text-center shadow">
          <div className="text-2xl font-black text-green-600">{breakeven}x</div>
          <div className="text-sm text-gray-600">Breakeven</div>
        </div>
        <div className="bg-white p-4 rounded-xl text-center shadow">
          <div className="text-2xl font-black text-purple-600">{marketFit}</div>
          <div className="text-sm text-gray-600">Market Fit</div>
        </div>
      </div>
      <Button className="bg-gradient-to-r from-cyan-600 to-blue-600">Simulate Launch</Button>
    </div>
  )
}

// Sovereign Scaling Calculator
function SovereignCalculator() {
  const [location, setLocation] = useState('UAE')

  const locations = [
    { id: 'UAE', name: 'UAE', benefit: '0% Tax + $10B AI Fund' },
    { id: 'India', name: 'India', benefit: '1B+ Users' },
    { id: 'Switzerland', name: 'Swiss', benefit: 'Neutral + DLT Laws' },
  ]

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-2xl">
      <h3 className="text-2xl font-bold mb-4 text-yellow-800">Sovereign Scaling Decision Engine</h3>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {locations.map((loc) => (
          <button
            key={loc.id}
            onClick={() => setLocation(loc.id)}
            className={`p-4 rounded-xl text-center transition ${
              location === loc.id 
                ? 'bg-yellow-600 text-white' 
                : 'bg-white hover:bg-yellow-100'
            }`}
          >
            <div className="text-xl font-black">{loc.name}</div>
            <div className="text-sm opacity-80">{loc.benefit}</div>
          </button>
        ))}
      </div>
      <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white p-4 rounded-xl text-center">
        <div className="text-xl font-bold">Your 2026 HQ: {location}</div>
        <Button className="mt-3 bg-white text-yellow-700 hover:bg-gray-100">Generate Scaling Plan</Button>
      </div>
    </div>
  )
}

// Launchpad Readiness Calculator
function ReadinessCalculator() {
  const [scores, setScores] = useState({ tech: 4, market: 6, team: 7, regulatory: 3, financial: 5, ai: 2 })
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)
  const maxScore = 60
  const percentage = Math.round((totalScore / maxScore) * 100)
  const status = percentage >= 70 ? 'SCALING PHASE' : percentage >= 50 ? 'GROWTH PHASE' : 'DEVELOPMENT PHASE'
  const recommendedModules = percentage >= 70 ? ['M12', 'M14'] : percentage >= 50 ? ['M04', 'M08', 'M12'] : ['M01', 'M02', 'M03', 'M10']

  const handleSubmit = () => {
    if (email) setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-indigo-800 mb-2">Report Sent!</h3>
        <p className="text-gray-600">Check your email for your personalized DeepTechX roadmap.</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl">
      <h3 className="text-2xl font-bold mb-4 text-indigo-800">Launchpad Readiness Calculator</h3>
      <div className="space-y-3 mb-6">
        {Object.entries({ tech: 'Technology Maturity', market: 'Market Validation', team: 'Team Strength', regulatory: 'Regulatory Readiness', financial: 'Financial Runway', ai: 'AI Integration' }).map(([key, label]) => (
          <div key={key}>
            <div className="flex justify-between text-sm">
              <span>{label}</span>
              <span>{scores[key as keyof typeof scores]}/10</span>
            </div>
            <Slider 
              value={[scores[key as keyof typeof scores]]} 
              onValueChange={(v) => setScores({ ...scores, [key]: v[0] })} 
              min={1} 
              max={10} 
            />
          </div>
        ))}
      </div>
      <div className="bg-white p-4 rounded-xl mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold">Your Score: {percentage}/100</span>
          <Badge className={percentage >= 70 ? 'bg-green-500' : percentage >= 50 ? 'bg-blue-500' : 'bg-yellow-500'}>{status}</Badge>
        </div>
        <Progress value={percentage} className="h-3" />
        <div className="mt-3 text-sm text-gray-600">
          Recommended Modules: {recommendedModules.join(', ')}
        </div>
      </div>
      <div className="flex gap-2">
        <Input 
          type="email" 
          placeholder="Enter your email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <Button onClick={handleSubmit} className="bg-gradient-to-r from-indigo-600 to-purple-600">
          Get Report
        </Button>
      </div>
    </div>
  )
}

// Main App Component
function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = (window.scrollY / totalScroll) * 100
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  const getCalculator = (moduleId: string) => {
    switch (moduleId) {
      case 'M01': return <DeHypeCalculator />
      case 'M02': return <SprintCalculator />
      case 'M04': return <TokenomicsCalculator />
      case 'M06': return <PQCCalculator />
      case 'M08': return <SpaceCalculator />
      case 'M12': return <SovereignCalculator />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-1 left-0 right-0 bg-white/80 backdrop-blur-md border-b z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              DeepTechX
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollToSection('hero')} className="text-sm font-medium hover:text-purple-600 transition">Home</button>
            <button onClick={() => scrollToSection('modules')} className="text-sm font-medium hover:text-purple-600 transition">Modules</button>
            <button onClick={() => scrollToSection('calculator')} className="text-sm font-medium hover:text-purple-600 transition">Calculator</button>
            <button onClick={() => scrollToSection('pricing')} className="text-sm font-medium hover:text-purple-600 transition">Pricing</button>
          </div>

          <div className="flex items-center gap-2">
            <Button className="hidden md:flex bg-gradient-to-r from-purple-600 to-pink-600">
              Enroll Now $597
            </Button>
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 space-y-2">
            <button onClick={() => scrollToSection('hero')} className="block w-full text-left py-2">Home</button>
            <button onClick={() => scrollToSection('modules')} className="block w-full text-left py-2">Modules</button>
            <button onClick={() => scrollToSection('calculator')} className="block w-full text-left py-2">Calculator</button>
            <button onClick={() => scrollToSection('pricing')} className="block w-full text-left py-2">Pricing</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-100">2026 Edition</Badge>
              <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  DeepTechX
                </span>
                <br />
                <span className="text-slate-900">Launchpad</span>
              </h1>
              <p className="text-xl text-slate-600 mb-6">
                From PoC to AI-Agent-Powered Product. Master the commercialization of space and deep tech ventures.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
                  Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline">
                  <Play className="mr-2 w-5 h-5" /> Watch Demo
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>14 Modules</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Interactive Tools</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>NFT Certificate</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-white rounded-3xl shadow-2xl p-8">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {modules.slice(0, 6).map((m) => (
                    <div key={m.id} className={`p-4 rounded-xl bg-gradient-to-br ${m.color} text-white text-center`}>
                      <m.icon className="w-8 h-8 mx-auto mb-2" />
                      <div className="text-xs font-bold">{m.id}</div>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-slate-900">14</div>
                  <div className="text-slate-500">Comprehensive Modules</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl font-black text-purple-600">14</div>
                <div className="text-slate-500">Modules</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl font-black text-green-600">6</div>
                <div className="text-slate-500">Interactive Tools</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl font-black text-blue-600">90%</div>
                <div className="text-slate-500">Success Rate</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl font-black text-pink-600">$2B+</div>
                <div className="text-slate-500">Student Value Created</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">14-Module Curriculum</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Master every aspect of deep tech commercialization, from initial vetting to unicorn exit.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <Dialog key={module.id}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-xl transition-shadow group">
                    <CardHeader className={`bg-gradient-to-br ${module.color} text-white rounded-t-lg`}>
                      <div className="flex items-center justify-between">
                        <module.icon className="w-8 h-8" />
                        <Badge className="bg-white/20 text-white">{module.level}</Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">{module.id}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <h3 className="font-bold text-slate-900 group-hover:text-purple-600 transition">
                        {module.title}
                      </h3>
                      {module.hasCalculator && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-purple-600">
                          <Calculator className="w-4 h-4" />
                          <span>Interactive Tool</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center`}>
                        <module.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">{module.id}</div>
                        <div>{module.title}</div>
                      </div>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <p className="text-slate-600 mb-4">
                      Learn the fundamentals of {module.title.toLowerCase()} with real-world case studies 
                      and actionable frameworks used by successful deep tech ventures.
                    </p>
                    {module.hasCalculator && (
                      <div className="mt-6">
                        <h4 className="font-bold mb-3 flex items-center gap-2">
                          <Calculator className="w-5 h-5 text-purple-600" />
                          Interactive Calculator
                        </h4>
                        {getCalculator(module.id)}
                      </div>
                    )}
                    <div className="mt-6 flex gap-3">
                      <Button className={`bg-gradient-to-r ${module.color}`}>
                        Start Module
                      </Button>
                      <Button variant="outline">
                        <Play className="mr-2 w-4 h-4" /> Preview
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </section>

      {/* Readiness Calculator Section */}
      <section id="calculator" className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-green-100 text-green-700">Free Tool</Badge>
            <h2 className="text-4xl font-black mb-4">Launchpad Readiness Calculator</h2>
            <p className="text-slate-600">
              Assess your venture across 6 critical dimensions and get a personalized roadmap.
            </p>
          </div>
          <ReadinessCalculator />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">Choose Your Path</h2>
            <p className="text-slate-600">Invest in your deep tech future. Revenue decoupled from time.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-xl">Lifetime Access</CardTitle>
                <div className="text-4xl font-black text-purple-600">$597</div>
                <p className="text-sm text-slate-500">One-time payment</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" /> All 14 modules
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Interactive calculators
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Progress tracking
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Community access
                  </li>
                </ul>
                <Button className="w-full bg-purple-600">Get Started</Button>
              </CardContent>
            </Card>

            <Card className="relative border-2 border-pink-500 shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-pink-500">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">NFT Edition</CardTitle>
                <div className="text-4xl font-black text-pink-600">$1,197</div>
                <p className="text-sm text-slate-500">One-time + NFT</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Everything in Lifetime
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Exclusive NFT certificate
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" /> 1-on-1 consultation
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Advanced tools access
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Alumni network
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">Get NFT Edition</Button>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-xl">Monthly Digest</CardTitle>
                <div className="text-4xl font-black text-blue-600">$67<span className="text-lg text-slate-500">/mo</span></div>
                <p className="text-sm text-slate-500">Cancel anytime</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Weekly insights
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Market updates
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Deal flow access
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Expert interviews
                  </li>
                </ul>
                <Button className="w-full bg-blue-600">Subscribe</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-8">What Founders Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800 p-6 rounded-xl">
              <div className="flex justify-center mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-slate-300 mb-4">"The De-Hype calculator alone saved us from a $2M mistake. Worth 10x the price."</p>
              <div className="font-bold">Sarah Chen</div>
              <div className="text-sm text-slate-400">CEO, QuantumBridge</div>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl">
              <div className="flex justify-center mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-slate-300 mb-4">"Went from project to product in 6 months using the M08 framework. Now valued at $50M."</p>
              <div className="font-bold">Marcus Webb</div>
              <div className="text-sm text-slate-400">Founder, OrbitAI</div>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl">
              <div className="flex justify-center mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-slate-300 mb-4">"The sovereign scaling module helped us set up in UAE. Zero tax, full support."</p>
              <div className="font-bold">Aisha Patel</div>
              <div className="text-sm text-slate-400">CTO, FusionGrid</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-4">Ready to Launch?</h2>
          <p className="text-xl opacity-90 mb-8">
            Join 500+ deep tech founders who transformed their ventures with DeepTechX.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Enroll Now — $597
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <MessageSquare className="mr-2 w-5 h-5" /> Talk to an Advisor
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-950 text-slate-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-black text-white">DeepTechX</span>
              </div>
              <p className="text-sm">From PoC to AI-Agent-Powered Product. Master deep tech commercialization.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Curriculum</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollToSection('modules')} className="hover:text-white transition">All Modules</button></li>
                <li><button onClick={() => scrollToSection('calculator')} className="hover:text-white transition">Calculators</button></li>
                <li><a href="#" className="hover:text-white transition">Case Studies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            © 2026 DeepTechX. All rights reserved. Built for the future of deep tech.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
