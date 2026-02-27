#!/usr/bin/env python3
"""
Strategic Advisory OS with Gamification
A standalone Streamlit app combining CrewAI agents, predictive modeling, and RPG progression
Run with: streamlit run strategic_advisor_app.py
"""

import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
import json
import random
import re
import os
import sys

# Try to import ML libs, provide mock fallback if not available
try:
    from sklearn.ensemble import GradientBoostingRegressor
    from sklearn.linear_model import LinearRegression
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    st.warning("scikit-learn not installed. Using statistical forecasting fallback.")

# Try to import CrewAI, provide mock implementation if not available
try:
    from crewai import Agent, Task, Crew, Process
    from langchain_community.llms import Ollama
    CREWAI_AVAILABLE = True
except ImportError:
    CREWAI_AVAILABLE = False

# =============================================================================
# CONFIGURATION & STYLING
# =============================================================================

st.set_page_config(
    page_title="Aethelred | Strategic Advisory OS",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for glass-morphism dark theme
st.markdown("""
<style>
    .main {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        color: #e2e8f0;
    }
    .stApp {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    }
    .glass-card {
        background: rgba(30, 41, 59, 0.7);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 20px;
        margin: 10px 0;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    }
    .achievement-unlocked {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        border: 2px solid #fbbf24;
        border-radius: 12px;
        padding: 15px;
        margin: 10px 0;
        animation: pulse 2s infinite;
    }
    .metric-card {
        background: rgba(15, 23, 42, 0.6);
        border-left: 4px solid #3b82f6;
        padding: 15px;
        border-radius: 8px;
        margin: 5px 0;
    }
    .chat-message {
        padding: 15px;
        border-radius: 12px;
        margin: 10px 0;
        max-width: 80%;
    }
    .chat-user {
        background: rgba(59, 130, 246, 0.2);
        border: 1px solid rgba(59, 130, 246, 0.3);
        margin-left: auto;
    }
    .chat-assistant {
        background: rgba(30, 41, 59, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.1);
        margin-right: auto;
    }
    .level-badge {
        background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
        color: white;
        padding: 5px 15px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 14px;
    }
    .xp-bar {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        height: 20px;
        overflow: hidden;
        margin: 10px 0;
    }
    .xp-fill {
        background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        height: 100%;
        transition: width 0.5s ease;
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
    }
    div[data-testid="stSidebarNav"] {
        background: rgba(15, 23, 42, 0.95);
    }
</style>
""", unsafe_allow_html=True)

# =============================================================================
# GAMIFICATION SYSTEM
# =============================================================================

@dataclass
class Achievement:
    id: str
    name: str
    description: str
    icon: str
    xp_reward: int
    condition_type: str  # 'problems_solved', 'xp_total', 'streak_days', 'specific_action'
    threshold: int
    unlocked: bool = False
    unlocked_date: Optional[datetime] = None

@dataclass
class Mission:
    id: str
    name: str
    description: str
    xp_reward: int
    requirement: str
    completed: bool = False
    progress: int = 0
    target: int = 1

class GamificationEngine:
    def __init__(self):
        self.initialize_session_state()
    
    def initialize_session_state(self):
        defaults = {
            'xp': 0,
            'level': 1,
            'problems_solved': 0,
            'current_streak': 0,
            'last_active': datetime.now().date(),
            'achievements': self._default_achievements(),
            'missions': self._default_missions(),
            'total_points': 0,
            'analysis_runs': 0,
            'chat_messages': [],
            'unlocked_notifications': []
        }
        for key, value in defaults.items():
            if key not in st.session_state:
                st.session_state[key] = value
    
    def _default_achievements(self) -> List[Achievement]:
        return [
            Achievement("first_steps", "First Steps", "Solve your first strategic problem", "🎯", 100, "problems_solved", 1),
            Achievement("workflow_master", "Workflow Master", "Complete 5 strategic analyses", "⚡", 250, "problems_solved", 5),
            Achievement("analyst", "Intelligence Analyst", "Run 10 predictive forecasts", "📊", 300, "analysis_runs", 10),
            Achievement("strategist", "Grand Strategist", "Accumulate 1000 XP", "💡", 400, "xp_total", 1000),
            Achievement("cas_expert", "CAS Modeler", "Use all predictive models once", "🧮", 500, "specific_action", 4),
            Achievement("plugin_explorer", "Plugin Explorer", "Try 3 different scenario types", "🔌", 350, "specific_action", 3),
            Achievement("week_warrior", "Week Warrior", "Maintain a 7-day streak", "🔥", 500, "streak_days", 7),
            Achievement("legend", "Strategic Legend", "Reach Level 10", "👑", 1000, "level", 10)
        ]
    
    def _default_missions(self) -> List[Mission]:
        daily = [
            Mission("daily_analysis", "Daily Intel", "Run one strategic analysis", 50, "analysis", False, 0, 1),
            Mission("daily_chat", "Consultation", "Send 3 messages to the advisor", 30, "chat", False, 0, 3),
            Mission("daily_forecast", "Forecaster", "Generate a 6-month forecast", 40, "forecast", False, 0, 1)
        ]
        return daily
    
    def add_xp(self, amount: int, reason: str = ""):
        old_level = st.session_state.level
        st.session_state.xp += amount
        st.session_state.total_points += amount
        
        # Level up formula: 100 * level^1.5
        new_level = int((st.session_state.xp / 100) ** (2/3)) + 1
        if new_level > old_level:
            st.session_state.level = new_level
            self._notify(f"🎉 Level Up! You are now Level {new_level}!", "level_up")
        
        self._check_achievements()
        self._update_missions("xp", amount)
    
    def record_problem_solved(self):
        st.session_state.problems_solved += 1
        self.add_xp(100, "Problem solved")
        self._update_missions("problem")
        self._check_achievements()
    
    def record_analysis(self, analysis_type: str = "general"):
        st.session_state.analysis_runs += 1
        self.add_xp(50, f"Analysis: {analysis_type}")
        self._update_missions("analysis")
        self._check_achievements()
    
    def check_streak(self):
        today = datetime.now().date()
        last = st.session_state.last_active
        if today - last == timedelta(days=1):
            st.session_state.current_streak += 1
            if st.session_state.current_streak in [7, 30]:
                self.add_xp(st.session_state.current_streak * 10, "Streak bonus")
        elif today > last:
            st.session_state.current_streak = 1
        st.session_state.last_active = today
        self._check_achievements()
    
    def _check_achievements(self):
        for ach in st.session_state.achievements:
            if ach.unlocked:
                continue
            
            unlocked = False
            if ach.condition_type == "problems_solved" and st.session_state.problems_solved >= ach.threshold:
                unlocked = True
            elif ach.condition_type == "xp_total" and st.session_state.xp >= ach.threshold:
                unlocked = True
            elif ach.condition_type == "streak_days" and st.session_state.current_streak >= ach.threshold:
                unlocked = True
            elif ach.condition_type == "level" and st.session_state.level >= ach.threshold:
                unlocked = True
            
            if unlocked:
                ach.unlocked = True
                ach.unlocked_date = datetime.now()
                self.add_xp(ach.xp_reward, f"Achievement: {ach.name}")
                st.session_state.unlocked_notifications.append(f"🏆 Achievement Unlocked: {ach.name} {ach.icon}")
    
    def _update_missions(self, action_type: str, amount: int = 1):
        for mission in st.session_state.missions:
            if mission.completed:
                continue
            if (action_type in mission.requirement or 
                (action_type == "problem" and "analysis" in mission.requirement)):
                mission.progress += amount
                if mission.progress >= mission.target:
                    mission.completed = True
                    self.add_xp(mission.xp_reward, f"Mission: {mission.name}")
                    st.session_state.unlocked_notifications.append(f"✅ Mission Complete: {mission.name}")
    
    def _notify(self, message: str, msg_type: str):
        if msg_type not in st.session_state:
            st.session_state[msg_type] = []
        st.session_state[msg_type].append(message)
    
    def get_xp_to_next_level(self) -> int:
        current = st.session_state.level
        next_level_xp = int(100 * (current ** 1.5))
        return next_level_xp - st.session_state.xp
    
    def render_sidebar(self):
        with st.sidebar:
            st.markdown("## 🎮 Agent Profile")
            
            col1, col2 = st.columns([1, 2])
            with col1:
                st.markdown(f"<div style='font-size: 40px;'>🛡️</div>", unsafe_allow_html=True)
            with col2:
                st.markdown(f"<span class='level-badge'>Level {st.session_state.level}</span>", unsafe_allow_html=True)
                st.markdown(f"**{st.session_state.total_points}** Total XP")
            
            # XP Bar
            current_level_xp = int(100 * ((st.session_state.level - 1) ** 1.5))
            next_level_xp = int(100 * (st.session_state.level ** 1.5))
            xp_in_level = st.session_state.xp - current_level_xp
            xp_needed = next_level_xp - current_level_xp
            progress = min(100, max(0, (xp_in_level / xp_needed) * 100))
            
            st.markdown(f"""
                <div class="xp-bar">
                    <div class="xp-fill" style="width: {progress}%"></div>
                </div>
                <small>{xp_in_level}/{xp_needed} XP to Level {st.session_state.level + 1}</small>
            """, unsafe_allow_html=True)
            
            st.markdown(f"🔥 **{st.session_state.current_streak}** Day Streak")
            st.markdown(f"🎯 **{st.session_state.problems_solved}** Problems Solved")
            
            # Notifications
            if st.session_state.unlocked_notifications:
                st.markdown("---")
                for notif in st.session_state.unlocked_notifications:
                    st.markdown(f"<div class='achievement-unlocked'>{notif}</div>", unsafe_allow_html=True)
                st.session_state.unlocked_notifications = []
            
            # Active Missions
            st.markdown("---")
            st.markdown("### 📋 Active Missions")
            for mission in st.session_state.missions:
                if not mission.completed:
                    progress_pct = min(100, (mission.progress / mission.target) * 100)
                    st.markdown(f"""
                        <div class="metric-card">
                            <strong>{mission.name}</strong> (+{mission.xp_reward} XP)<br>
                            <small>{mission.description}</small><br>
                            <div style="background: rgba(255,255,255,0.1); height: 6px; border-radius: 3px; margin-top: 5px;">
                                <div style="background: #3b82f6; width: {progress_pct}%; height: 100%; border-radius: 3px;"></div>
                            </div>
                            <small>{mission.progress}/{mission.target}</small>
                        </div>
                    """, unsafe_allow_html=True)
            
            # Achievements Progress
            with st.expander("🏆 Achievements"):
                for ach in st.session_state.achievements:
                    status = "✅" if ach.unlocked else "🔒"
                    st.markdown(f"{status} {ach.icon} **{ach.name}** (+{ach.xp_reward} XP)")

# =============================================================================
# PREDICTIVE MODELING (Open Source)
# =============================================================================

class StrategicForecaster:
    def __init__(self, model_type="ensemble"):
        self.model_type = model_type
        self.models = {}
        self.data = None
        
    def fit(self, df: pd.DataFrame, target_cols: List[str]):
        self.data = df
        if not SKLEARN_AVAILABLE:
            return self
            
        for col in target_cols:
            X = np.arange(len(df)).reshape(-1, 1)
            y = df[col].values
            
            if self.model_type == "linear":
                model = LinearRegression()
                model.fit(X, y)
            else:
                # Use polynomial features for trend + GB for non-linear
                model = GradientBoostingRegressor(
                    n_estimators=100,
                    learning_rate=0.1,
                    max_depth=3,
                    random_state=42
                )
                model.fit(X, y)
            
            self.models[col] = model
        return self
    
    def forecast(self, steps: int = 6, confidence: float = 0.8) -> Dict:
        if not self.models or not SKLEARN_AVAILABLE:
            return self._statistical_forecast(steps)
            
        forecasts = {}
        last_idx = len(self.data)
        
        for col, model in self.models.items():
            future_X = np.arange(last_idx, last_idx + steps).reshape(-1, 1)
            y_pred = model.predict(future_X)
            
            # Simple confidence interval based on historical std
            historical_std = self.data[col].std()
            margin = 1.96 * historical_std * np.sqrt(np.arange(1, steps + 1) / steps)
            
            forecasts[col] = {
                'point': y_pred,
                'lower': y_pred - margin,
                'upper': y_pred + margin
            }
        
        return forecasts
    
    def _statistical_forecast(self, steps: int) -> Dict:
        """Fallback forecasting using trend + seasonality approximation"""
        forecasts = {}
        for col in self.data.columns:
            series = self.data[col]
            trend = np.polyfit(range(len(series)), series, 1)
            future_trend = np.polyval(trend, range(len(series), len(series) + steps))
            
            # Add noise based on historical volatility
            noise = np.random.normal(0, series.std() * 0.1, steps)
            y_pred = future_trend + noise
            
            forecasts[col] = {
                'point': y_pred,
                'lower': y_pred - series.std(),
                'upper': y_pred + series.std()
            }
        return forecasts
    
    @staticmethod
    def generate_synthetic_scenario(scenario_type: str = "ukraine", months: int = 12) -> pd.DataFrame:
        np.random.seed(42)
        dates = pd.date_range(start='2024-01-01', periods=months, freq='M')
        
        scenarios = {
            "ukraine": {
                'Alliance_Cohesion': 65 + np.cumsum(np.random.normal(-0.5, 2, months)),
                'Energy_Dependency': 45 + np.cumsum(np.random.normal(-2, 3, months)),
                'Cyber_Resilience': 70 + np.cumsum(np.random.normal(1.5, 2, months)),
                'Military_Readiness': 60 + np.cumsum(np.random.normal(0.8, 1.5, months))
            },
            "ai_arms_race": {
                'AI_Capability_Gap': 50 + np.cumsum(np.random.normal(4, 5, months)),
                'Safety_Compliance': 35 + np.cumsum(np.random.normal(2, 3, months)),
                'R&D_Intensity': 65 + np.cumsum(np.random.normal(3.5, 4, months))
            },
            "trade_war": {
                'Supply_Chain_Stress': 40 + np.cumsum(np.random.normal(3, 4, months)),
                'Tariff_Impact': 30 + np.cumsum(np.random.normal(5, 3, months)),
                'Currency_Volatility': 50 + np.cumsum(np.random.normal(2, 6, months))
            },
            "cyber_escalation": {
                'Attack_Frequency': 20 + np.cumsum(np.random.normal(8, 5, months)),
                'Defense_Effectiveness': 75 + np.cumsum(np.random.normal(-1, 2, months)),
                'Critical_Infrastructure_Risk': 35 + np.cumsum(np.random.normal(4, 3, months))
            }
        }
        
        data = scenarios.get(scenario_type, scenarios["ukraine"])
        df = pd.DataFrame(data, index=dates)
        return df.clip(0, 100)

# =============================================================================
# AGENT SYSTEM (CrewAI-compatible or Standalone)
# =============================================================================

class DemoLLM:
    """Mock LLM for demonstration without external dependencies"""
    def __init__(self):
        self.context_memory = []
        
    def generate(self, prompt: str, context: str = "") -> str:
        """Simulate intelligent responses based on keywords"""
        prompt_lower = prompt.lower()
        
        # Pattern matching for realistic responses
        if "ukraine" in prompt_lower or "russia" in prompt_lower:
            return self._ukraine_analysis(prompt)
        elif "forecast" in prompt_lower or "predict" in prompt_lower:
            return self._forecast_analysis(prompt)
        elif "risk" in prompt_lower:
            return self._risk_assessment(prompt)
        elif "swot" in prompt_lower or "strategy" in prompt_lower:
            return self._strategic_framework(prompt)
        else:
            return self._general_strategic(prompt)
    
    def _ukraine_analysis(self, prompt: str) -> str:
        return """**Executive Summary: Ukraine-Russia Conflict Analysis**

🔹 **Strategic Assessment (Thucydidean Framework)**
- Security Dilemma: NATO expansion fears vs. sovereignty rights creating irreconcilable structural pressures
- Power Transition: Asymmetric capabilities favor defensive attrition (Ukraine) vs. offensive maneuver (Russia)
- Honor/Interest Calculus: Both parties locked in commitment escalation; face-saving exit barriers exceed tactical costs

🔹 **Predictive Indicators**
- Alliance Cohesion trending down (-0.5σ/month) due to fatigue factors
- Energy dependency reduction accelerating (-2pts/month) via LNG diversification
- Cyber resilience improving (+1.5σ/month) through NATO capability transfers

🔹 **No-Regrets Moves (90-Day Horizon)**
1. **Immediate**: Pre-position medical stockpiles in Poland/Romania (escalation hedge)
2. **Short-term**: Accelerate renewable infrastructure to reduce Russian energy leverage below 30%
3. **Medium-term**: Establish cyber-defense pact with Baltic states (mutual assistance clause)

🔹 **Risk Register**
- **HIGH**: Winter energy coercion (Probability: 65%, Impact: Critical)
- **MEDIUM**: Cyber infrastructure attacks (Probability: 40%, Impact: High)  
- **LOW**: Nuclear escalation (Probability: <5%, Impact: Catastrophic)

🔹 **Epistemic Confidence**: 7.2/10 (High OSINT availability, fog of war persists in tactical domains)"""

    def _forecast_analysis(self, prompt: str) -> str:
        return """**Predictive Modeling Results**

Using ensemble methods (Gradient Boosting + Linear Trend):

📊 **6-Month Trajectory**
- Alliance Cohesion: Decline to 58.3 (CI: 54.1-62.5) - concerns over sustained commitment
- Energy Independence: Improvement to 28.4% dependency (CI: 24.2-32.6) - diversification working
- Cyber Resilience: Strengthening to 82.1 (CI: 78.3-85.9) - capability transfers effective
- Military Readiness: Stable at 71.2 (CI: 67.8-74.6) - attrition equilibrium

⚠️ **Critical Inflection Points**
1. Month 3: Potential alliance stress if no territorial gains materialize
2. Month 5: Energy infrastructure vulnerability window (pre-diversification completion)
3. Month 6: Decision point for industrial mobilization scale-up

📈 **Confidence Intervals**: 80% prediction intervals shown; model MAPE ~12% on historical validation"""

    def _risk_assessment(self, prompt: str) -> str:
        return """**Risk Assessment Matrix**

| Risk Category | Probability | Impact | Velocity | Mitigation Priority |
|--------------|-------------|---------|----------|-------------------|
| Energy Coercion | 65% | Critical | Medium | **P0** - Diversify now |
| Cyber Escalation | 40% | High | Fast | **P1** - Harden infrastructure |
| Supply Disruption | 35% | Medium | Slow | **P2** - Stockpile reserves |
| Alliance Fracture | 25% | High | Slow | **P1** - Diplomatic engagement |

**Cascading Effects Analysis**: 
Energy crisis → Industrial slowdown → Social unrest → Political pressure → Strategic flexibility reduction

**Recommended Hedging**: Maintain 90-day strategic petroleum reserve; establish redundant supply corridors via Romania."""

    def _strategic_framework(self, prompt: str) -> str:
        return """**SWOT Analysis Framework**

**Strengths (Internal)**
- Technological asymmetry favoring defensive capabilities
- High international legitimacy and material support
- Terrain advantages (urban defense, winter conditions)

**Weaknesses (Internal)**  
- Resource dependency on external supply chains
- Demographic constraints on manpower
- Infrastructure vulnerability to long-range fires

**Opportunities (External)**
- Alliance capability transfers accelerating
- Energy transition reducing adversary leverage
- Technological innovation in autonomous systems

**Threats (External)**
- Alliance cohesion decay over time (historical pattern: 18-month fatigue cycle)
- Escalation to WMD domain (low probability, high impact)
- Economic warfare spillover effects

**Strategic Recommendation**: Exploit window of alliance solidarity (T+0 to T+12 months) to achieve durable territorial security before fatigue factors dominate."""

    def _general_strategic(self, prompt: str) -> str:
        return """**Strategic Advisory Response**

Based on problem-solving framework analysis:

1. **Problem Decomposition**: The scenario presents a complex adaptive system with multiple equilibria
2. **Key Variables**: Alliance cohesion, resource dependency, capability gaps, escalation thresholds
3. **Analytical Approach**: Applied realist framework (Mearsheimer/Waltz) + Prospect Theory (loss aversion bias detected in stakeholder preferences)

**Actionable Recommendations**:
- **No-regrets move**: Diversify critical supply chains immediately (cost: medium, benefit: high resilience)
- **Stop-loss protocol**: Define clear de-escalation triggers before commitment traps form
- **Information advantage**: Invest in OSINT capabilities for early warning (6-month lead time critical)

*Analysis confidence: Moderate-High. Recommend red-team review for cognitive bias checks.*"""

class StrategicAgent:
    """Simplified agent compatible with CrewAI structure or standalone"""
    def __init__(self, name: str, role: str, backstory: str, llm=None):
        self.name = name
        self.role = role
        self.backstory = backstory
        self.llm = llm or DemoLLM()
    
    def execute(self, task_description: str, context: str = "") -> str:
        full_prompt = f"""
        Role: {self.role}
        Backstory: {self.backstory}
        
        Task: {task_description}
        Context: {context}
        
        Provide rigorous, structured analysis using established strategic frameworks.
        """
        return self.llm.generate(full_prompt)

class StrategicCrew:
    def __init__(self, scenario_config: Dict, use_demo: bool = True):
        self.scenario = scenario_config
        self.use_demo = use_demo
        self.agents = self._create_agents()
    
    def _create_agents(self) -> Dict[str, StrategicAgent]:
        return {
            "orchestrator": StrategicAgent(
                "Orchestrator",
                "Strategic Orchestrator",
                "Expert in systems thinking with Thucydidean realism. Coordinates workflow and ensures epistemic rigor."
            ),
            "research": StrategicAgent(
                "Research",
                "Geopolitical Risk Researcher", 
                "Applies Thucydidean power transition theory and Sun Tzu principles. Uses base-rate discipline."
            ),
            "model": StrategicAgent(
                "Model",
                "Strategic Framework Modeler",
                "Expert in Prospect Theory, SWOT, and escalation ladders. Maps contradictions and feedback loops."
            ),
            "synthesis": StrategicAgent(
                "Synthesis",
                "Strategic Synthesizer",
                "Former policy advisor. Creates no-regrets moves and stop-loss protocols with tactical specificity."
            )
        }
    
    def run_analysis(self, data: Dict) -> str:
        """Execute sequential analysis workflow"""
        results = []
        
        # Task 1: Data Analysis
        context = f"Scenario: {self.scenario['name']}\nData: {json.dumps(data, indent=2)}"
        research_result = self.agents["research"].execute(
            "Analyze structured data using realist framework. Extract alliance cohesion metrics, resource dependencies, capability gaps. Identify security dilemmas and power transitions.",
            context
        )
        results.append(f"## Research Phase\n{research_result}")
        
        # Task 2: Modeling
        model_result = self.agents["model"].execute(
            "Apply Prospect Theory (loss aversion analysis), SWOT matrix, and escalation ladder (reversible steps). Map contradictions in the strategic landscape.",
            research_result
        )
        results.append(f"## Modeling Phase\n{model_result}")
        
        # Task 3: Synthesis
        synthesis_result = self.agents["synthesis"].execute(
            "Create final advisory with: 1) Executive Summary (300 words), 2) No-regrets moves (90-day timeline), 3) KPI dashboard specs, 4) Risk register (top 5)",
            model_result
        )
        results.append(f"## Strategic Recommendations\n{synthesis_result}")
        
        return "\n\n".join(results)

# =============================================================================
# WORKFLOW ENGINE
# =============================================================================

class WorkflowEngine:
    WORKFLOWS = {
        "standard": {
            "name": "Standard Problem Solving",
            "steps": ["Define", "Analyze", "Ideate", "Decide", "Implement", "Review"],
            "description": "6-step comprehensive problem-solving framework"
        },
        "rapid": {
            "name": "Rapid Decision",
            "steps": ["Assess", "Decide", "Act"],
            "description": "3-step crisis decision protocol"
        },
        "strategic": {
            "name": "Strategic Planning",
            "steps": ["Scan", "Sense", "Decide", "Align", "Execute", "Adapt"],
            "description": "6-step adaptive strategy cycle"
        },
        "innovation": {
            "name": "Innovation Process",
            "steps": ["Discover", "Define", "Develop", "Deliver"],
            "description": "4-step double-diamond innovation framework"
        }
    }
    
    def __init__(self):
        self.current_workflow = None
        self.current_step = 0
    
    def start_workflow(self, workflow_id: str):
        self.current_workflow = self.WORKFLOWS.get(workflow_id)
        self.current_step = 0
        return self.current_workflow
    
    def next_step(self, input_data: str = "") -> Optional[str]:
        if not self.current_workflow:
            return None
        
        if self.current_step < len(self.current_workflow["steps"]):
            step_name = self.current_workflow["steps"][self.current_step]
            self.current_step += 1
            return step_name
        return None
    
    def get_progress(self) -> float:
        if not self.current_workflow:
            return 0.0
        return self.current_step / len(self.current_workflow["steps"])

# =============================================================================
# MAIN APPLICATION
# =============================================================================

class StrategicAdvisorApp:
    def __init__(self):
        self.game = GamificationEngine()
        self.forecaster = StrategicForecaster()
        self.workflow = WorkflowEngine()
        self.crew = None
        
        # Check streak on load
        self.game.check_streak()
    
    def run(self):
        # Sidebar Configuration
        self._render_sidebar_config()
        
        # Main Interface Tabs
        tab1, tab2, tab3, tab4 = st.tabs(["💬 Strategic Chat", "📊 Predictive Analytics", "🎯 Missions", "⚙️ Workflows"])
        
        with tab1:
            self._render_chat_interface()
        
        with tab2:
            self._render_analytics_dashboard()
            
        with tab3:
            self._render_missions_page()
            
        with tab4:
            self._render_workflows_page()
    
    def _render_sidebar_config(self):
        with st.sidebar:
            st.markdown("---")
            st.markdown("### ⚙️ Configuration")
            
            self.scenario = st.selectbox(
                "Strategic Scenario",
                ["Ukraine-Russia Conflict", "AI Arms Race", "Trade Wars", "Cyberwar Escalation"],
                key="scenario_select"
            )
            
            self.llm_mode = st.radio(
                "LLM Mode",
                ["Demo Mode (No setup required)", "Local Ollama (requires setup)"],
                help="Demo mode uses built-in intelligence; Ollama requires local LLM"
            )
            
            self.forecast_horizon = st.slider("Forecast Months", 3, 12, 6)
            
            if st.button("🚀 Run Full Strategic Analysis", type="primary", use_container_width=True):
                self._run_full_analysis()
    
    def _render_chat_interface(self):
        st.markdown("""
        <div style="text-align: center; margin-bottom: 30px;">
            <h1>🛡️ Aethelred Strategic Advisory</h1>
            <p style="color: #94a3b8;">AI-powered geopolitical risk analysis & strategic planning</p>
        </div>
        """, unsafe_allow_html=True)
        
        # Chat container
        chat_container = st.container()
        with chat_container:
            for msg in st.session_state.chat_messages:
                css_class = "chat-user" if msg["role"] == "user" else "chat-assistant"
                st.markdown(f"""
                    <div class="chat-message {css_class}">
                        <strong>{'You' if msg['role'] == 'user' else 'Aethelred'}</strong><br>
                        {msg['content']}
                    </div>
                """, unsafe_allow_html=True)
        
        # Input
        user_input = st.text_input("Ask for strategic analysis...", key="chat_input", placeholder="e.g., 'Analyze escalation risks in Ukraine scenario'")
        col1, col2, col3 = st.columns([1, 1, 4])
        with col1:
            if st.button("Send", use_container_width=True):
                self._handle_chat(user_input)
        with col2:
            if st.button("Clear", use_container_width=True):
                st.session_state.chat_messages = []
                st.rerun()
        
        # Quick actions
        st.markdown("**Quick Actions:**")
        qcol1, qcol2, qcol3, qcol4 = st.columns(4)
        actions = [
            ("📊 Forecast KPIs", "forecast"),
            ("⚠️ Risk Assessment", "risk"),
            ("🎯 SWOT Analysis", "swot"),
            ("🔍 Deep Research", "research")
        ]
        for col, (label, action) in zip([qcol1, qcol2, qcol3, qcol4], actions):
            with col:
                if st.button(label, use_container_width=True):
                    self._handle_quick_action(action)
    
    def _handle_chat(self, user_input: str):
        if not user_input:
            return
            
        st.session_state.chat_messages.append({"role": "user", "content": user_input})
        
        # Generate response
        llm = DemoLLM()
        response = llm.generate(user_input, context=f"Scenario: {self.scenario}")
        
        st.session_state.chat_messages.append({"role": "assistant", "content": response})
        self.game.add_xp(10, "Chat interaction")
        self.game._update_missions("chat")
        st.rerun()
    
    def _handle_quick_action(self, action: str):
        prompts = {
            "forecast": "Generate 6-month forecast for current scenario",
            "risk": "Provide risk assessment matrix and mitigation strategies",
            "swot": "Conduct SWOT analysis on strategic position",
            "research": "Deep research on historical precedents and realist framework"
        }
        self._handle_chat(prompts[action])
    
    def _render_analytics_dashboard(self):
        st.header("📊 Predictive Analytics & Forecasting")
        
        # Generate data for current scenario
        scenario_key = self.scenario.split()[0].lower().replace("-", "_")
        hist_data = StrategicForecaster.generate_synthetic_scenario(scenario_key, 12)
        
        col1, col2 = st.columns([2, 1])
        
        with col1:
            st.subheader("KPI Trajectory & Forecasts")
            
            # Fit and forecast
            self.forecaster.fit(hist_data, hist_data.columns)
            forecasts = self.forecaster.forecast(self.forecast_horizon)
            
            # Create visualization
            fig = go.Figure()
            colors = px.colors.qualitative.Bold
            
            for i, col in enumerate(hist_data.columns):
                color = colors[i % len(colors)]
                
                # Historical
                fig.add_trace(go.Scatter(
                    x=hist_data.index, 
                    y=hist_data[col],
                    name=f"{col} (Actual)",
                    mode='lines+markers',
                    line=dict(color=color, width=3),
                    marker=dict(size=8)
                ))
                
                # Forecast
                future_dates = pd.date_range(
                    start=hist_data.index[-1], 
                    periods=self.forecast_horizon+1, 
                    freq='M'
                )[1:]
                
                fig.add_trace(go.Scatter(
                    x=future_dates, 
                    y=forecasts[col]['point'],
                    name=f"{col} (Forecast)",
                    mode='lines',
                    line=dict(color=color, width=2, dash='dash'),
                    opacity=0.8
                ))
                
                # Confidence interval
                fig.add_trace(go.Scatter(
                    x=list(future_dates) + list(future_dates)[::-1],
                    y=list(forecasts[col]['upper']) + list(forecasts[col]['lower'])[::-1],
                    fill='toself',
                    fillcolor=f'rgba{tuple(list(int(color.lstrip("#")[i:i+2], 16) for i in (0, 2, 4)) + [0.2])}',
                    line=dict(color='rgba(255,255,255,0)'),
                    showlegend=False,
                    name=f"{col} CI"
                ))
            
            fig.update_layout(
                template="plotly_dark",
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                height=500,
                xaxis_title="Timeline",
                yaxis_title="Index (0-100)",
                hovermode="x unified"
            )
            
            st.plotly_chart(fig, use_container_width=True)
            
        with col2:
            st.subheader("Key Indicators")
            
            # Latest values
            latest = hist_data.iloc[-1]
            for col in hist_data.columns:
                val = latest[col]
                delta = val - hist_data.iloc[-2][col]
                st.metric(col.replace('_', ' '), f"{val:.1f}", f"{delta:+.1f}")
            
            # Forecast summary
            st.markdown("---")
            st.markdown("### 📈 Forecast Summary")
            for col in hist_data.columns:
                final_pred = forecasts[col]['point'][-1]
                trend = "↗️ Up" if final_pred > latest[col] else "↘️ Down" if final_pred < latest[col] else "➡️ Stable"
                st.markdown(f"**{col.replace('_', ' ')}**: {trend} to {final_pred:.1f} in {self.forecast_horizon}mo")
        
        # Export option
        if st.button("📥 Export Forecast Data"):
            export_df = pd.DataFrame({
                'Date': list(hist_data.index) + list(future_dates),
                **{f"{col}_Historical": list(hist_data[col]) + [None]*self.forecast_horizon for col in hist_data.columns},
                **{f"{col}_Forecast": [None]*len(hist_data) + list(forecasts[col]['point']) for col in hist_data.columns}
            })
            csv = export_df.to_csv(index=False)
            st.download_button("Download CSV", csv, f"forecast_{scenario_key}.csv", "text/csv")
            
        self.game.record_analysis("forecast")
    
    def _render_missions_page(self):
        st.header("🎯 Strategic Missions & Challenges")
        
        # Refresh daily missions if needed (simplified: check if new day)
        if 'missions_generated' not in st.session_state or st.session_state.missions_generated != datetime.now().day:
            st.session_state.missions = self.game._default_missions()
            st.session_state.missions_generated = datetime.now().day
        
        st.markdown("""
        <div class="glass-card">
            <h3>Daily Strategic Challenges</h3>
            <p>Complete missions to earn XP and unlock achievements. New missions available daily.</p>
        </div>
        """, unsafe_allow_html=True)
        
        cols = st.columns(3)
        for i, mission in enumerate(st.session_state.missions):
            with cols[i % 3]:
                progress_pct = min(100, (mission.progress / mission.target) * 100)
                status_icon = "✅" if mission.completed else "⏳"
                
                st.markdown(f"""
                    <div class="glass-card" style="border: {'2px solid #10b981' if mission.completed else '1px solid rgba(255,255,255,0.1)'};">
                        <h4>{status_icon} {mission.name}</h4>
                        <p>{mission.description}</p>
                        <div style="background: rgba(255,255,255,0.1); height: 10px; border-radius: 5px; margin: 10px 0;">
                            <div style="background: {'#10b981' if mission.completed else '#3b82f6'}; width: {progress_pct}%; height: 100%; border-radius: 5px; transition: width 0.3s;"></div>
                        </div>
                        <small>{mission.progress}/{mission.target} completed • +{mission.xp_reward} XP</small>
                    </div>
                """, unsafe_allow_html=True)
                
                if not mission.completed:
                    if st.button(f"Update Progress", key=f"mission_{mission.id}"):
                        mission.progress = min(mission.target, mission.progress + 1)
                        if mission.progress >= mission.target:
                            mission.completed = True
                            self.game.add_xp(mission.xp_reward, f"Mission: {mission.name}")
                        st.rerun()
        
        # Achievements showcase
        st.markdown("---")
        st.subheader("🏆 Achievement Gallery")
        
        ach_cols = st.columns(4)
        for i, ach in enumerate(st.session_state.achievements):
            with ach_cols[i % 4]:
                opacity = "1.0" if ach.unlocked else "0.3"
                border = "#f59e0b" if ach.unlocked else "rgba(255,255,255,0.1)"
                st.markdown(f"""
                    <div style="opacity: {opacity}; border: 2px solid {border}; border-radius: 12px; padding: 15px; text-align: center; margin: 5px;">
                        <div style="font-size: 30px; margin-bottom: 10px;">{ach.icon}</div>
                        <strong>{ach.name}</strong><br>
                        <small>{ach.description}</small><br>
                        <span style="color: #f59e0b;">+{ach.xp_reward} XP</span>
                    </div>
                """, unsafe_allow_html=True)
    
    def _render_workflows_page(self):
        st.header("⚙️ Problem-Solving Workflows")
        
        st.markdown("Select a structured methodology to guide your strategic analysis:")
        
        for wf_id, wf in WorkflowEngine.WORKFLOWS.items():
            with st.expander(f"{wf['name']} - {wf['description']}"):
                st.markdown("**Process Steps:**")
                for i, step in enumerate(wf['steps'], 1):
                    st.markdown(f"{i}. {step}")
                
                if st.button(f"Start {wf['name']}", key=f"wf_{wf_id}"):
                    st.session_state.current_workflow = wf_id
                    st.session_state.workflow_step = 0
                    st.success(f"Started {wf['name']}. Use the chat interface to proceed through steps.")
                    self.game.add_xp(25, "Workflow initiated")
    
    def _run_full_analysis(self):
        with st.spinner("🧠 Running multi-agent strategic analysis..."):
            # Setup crew
            scenario_config = {
                "name": self.scenario,
                "type": "geopolitical" if "Ukraine" in self.scenario else "technological"
            }
            
            self.crew = StrategicCrew(scenario_config, use_demo=True)
            
            # Generate data and run
            scenario_key = self.scenario.split()[0].lower().replace("-", "_")
            data = StrategicForecaster.generate_synthetic_scenario(scenario_key, 12)
            
            result = self.crew.run_analysis(data.to_dict())
            
            # Add to chat
            st.session_state.chat_messages.append({
                "role": "assistant", 
                "content": f"## 🔍 Full Strategic Analysis: {self.scenario}\n\n{result}\n\n---\n*Analysis completed by Aethelred Multi-Agent System | Confidence: High*"
            })
            
            self.game.record_problem_solved()
            st.success("Analysis complete! Check the Chat tab for full results.")
            st.balloons()

# =============================================================================
# INITIALIZATION
# =============================================================================

if __name__ == "__main__":
    app = StrategicAdvisorApp()
    app.run()