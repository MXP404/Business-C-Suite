/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CARTOON_AGENTS,
  INITIAL_MACRO_NODES,
  PROPERTY_UNIT_NODES,
  CAUSAL_EDGES,
  UNIT_DRILLDOWN_EDGES,
  INITIAL_TRIALS,
} from './data/portfolioData';
import { AgentId, CausalNode } from './types';
import { AgentSquadBar } from './components/AgentSquadBar';
import { CausalNetworkCanvas } from './components/CausalNetworkCanvas';
import { SankeyFinancialFlow } from './components/SankeyFinancialFlow';
import { LiveResolutionStage } from './components/LiveResolutionStage';
import { AgentDossierModal } from './components/AgentDossierModal';
import { BoardroomDebateModal } from './components/BoardroomDebateModal';
import { TrialAuthorizationDeck } from './components/TrialAuthorizationDeck';
import { COMPANY_PROFILES, CompanyProfileId } from './data/companyProfiles';
import { TrendingDown, TrendingUp } from 'lucide-react';

export type PrimaryVisualizerTab = 'SPHERE' | 'SANKEY';

export default function App() {
  const [activeVisualizerTab, setActiveVisualizerTab] =
    useState<PrimaryVisualizerTab>('SANKEY');
  const [activeCompanyId, setActiveCompanyId] =
    useState<CompanyProfileId>('NEW_ROASTERY_SMB');
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId | null>('CEO');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    'NODE_ROOT_SOLVENCY'
  );
  const [showProperties, setShowProperties] = useState<boolean>(false);
  const [activeTrialIds, setActiveTrialIds] = useState<string[]>(['TRIAL_1']);
  const [focusedResolutionTrialId, setFocusedResolutionTrialId] =
    useState<string>('TRIAL_1');
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [isDebateOpen, setIsDebateOpen] = useState<boolean>(false);
  const [debatePair, setDebatePair] = useState<[AgentId, AgentId]>([
    'PRICING',
    'CLEANING',
  ]);

  const currentCompanyProfile =
    COMPANY_PROFILES[activeCompanyId] || COMPANY_PROFILES.NEW_ROASTERY_SMB;

  // Baseline monthly net cash: -$429/mo burn + $310/mo Tier-1 Auto already captured = -$119/mo
  const baseMonthlyNetCash = -119;
  const trialLift = INITIAL_TRIALS.reduce((sum, trial) => {
    return (
      sum + (activeTrialIds.includes(trial.id) ? trial.monthlyNetCashLift : 0)
    );
  }, 0);
  const currentNetCash = baseMonthlyNetCash + trialLift;

  // Compute dynamic nodes based on authorized trials
  const currentMacroNodes: CausalNode[] = INITIAL_MACRO_NODES.map((node) => {
    if (node.id === 'NODE_PRICE_WALL' && activeTrialIds.includes('TRIAL_1')) {
      return {
        ...node,
        status: 'healthy',
        metric: '2-Nt Min + $515',
        subMetric: 'Occupancy Target: 42%',
      };
    }
    if (node.id === 'NODE_CLEAN_DRAG' && activeTrialIds.includes('TRIAL_2')) {
      return {
        ...node,
        status: 'healthy',
        metric: 'Turns -30%',
        subMetric: '+$654/mo Preserved',
      };
    }
    if (node.id === 'NODE_REPAIRS_BLEED' && activeTrialIds.includes('TRIAL_3')) {
      return {
        ...node,
        status: 'healthy',
        metric: '$350/mo Cap',
        subMetric: 'Audit & Clawback Issued',
      };
    }
    if (node.id === 'NODE_ROOT_SOLVENCY' && currentNetCash >= 0) {
      return {
        ...node,
        status: 'healthy',
        metric: `+$${currentNetCash.toLocaleString()}/mo`,
        subMetric: 'Portfolio Solvency Restored',
      };
    }
    return node;
  });

  const currentUnitNodes: CausalNode[] = PROPERTY_UNIT_NODES.map((unit) => {
    if (
      unit.id === 'UNIT_202' &&
      (activeTrialIds.includes('TRIAL_1') || activeTrialIds.includes('TRIAL_3'))
    ) {
      const isBoth =
        activeTrialIds.includes('TRIAL_1') &&
        activeTrialIds.includes('TRIAL_3');
      return {
        ...unit,
        status: isBoth ? 'healthy' : 'warning',
        metric: isBoth ? '+$891/mo Cash' : '-$659/mo Cash',
        subMetric: 'Trials Active in Simulation',
      };
    }
    if (unit.id === 'UNIT_303' && activeTrialIds.includes('TRIAL_2')) {
      return {
        ...unit,
        status: 'healthy',
        metric: '+$385/mo Cash',
        subMetric: 'Turn Drag Cleared',
      };
    }
    return unit;
  });

  const allDynamicNodes = [...currentMacroNodes, ...currentUnitNodes];
  const allDynamicEdges = [...CAUSAL_EDGES, ...UNIT_DRILLDOWN_EDGES];

  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    const clickedNode = allDynamicNodes.find((n) => n.id === nodeId);
    if (clickedNode?.primaryAgentId) {
      setSelectedAgentId(clickedNode.primaryAgentId);
    }
    if (nodeId === 'NODE_PRICE_WALL' || nodeId === 'UNIT_202') {
      setFocusedResolutionTrialId('TRIAL_1');
    } else if (nodeId === 'NODE_CLEAN_DRAG' || nodeId === 'UNIT_303') {
      setFocusedResolutionTrialId('TRIAL_2');
    } else if (nodeId === 'NODE_REPAIRS_BLEED') {
      setFocusedResolutionTrialId('TRIAL_3');
    }
  };

  const handleSelectAgent = (agentId: AgentId) => {
    setSelectedAgentId(agentId);
    setIsDossierOpen(true);
  };

  const handleToggleTrial = (trialId: string) => {
    setFocusedResolutionTrialId(trialId);
    setActiveTrialIds((prev) =>
      prev.includes(trialId)
        ? prev.filter((id) => id !== trialId)
        : [...prev, trialId]
    );
  };

  const handleAuthorizeAll = () => {
    if (activeTrialIds.length === INITIAL_TRIALS.length) {
      setActiveTrialIds([]);
    } else {
      setActiveTrialIds(INITIAL_TRIALS.map((t) => t.id));
    }
  };

  const handleOpenDebate = (a1: AgentId, a2: AgentId) => {
    setDebatePair([a1, a2]);
    setIsDebateOpen(true);
  };

  const currentAgent =
    CARTOON_AGENTS.find((a) => a.id === selectedAgentId) || CARTOON_AGENTS[0];

  const allAuthorized = activeTrialIds.length === INITIAL_TRIALS.length;

  return (
    <div className="min-h-screen w-full flex flex-col bg-white text-slate-900">
      {/* STRICT 3-ZONE TOP BAR CONTRACT (API Guide Removed) */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 py-4 bg-white/95 backdrop-blur-md border-b border-slate-200">
        {/* Zone 1: Single Text Element Brand Wordmark */}
        <a
          href="#visualizer"
          className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00C4B4] bg-clip-text text-transparent whitespace-nowrap shrink-0"
        >
          Agentic C-Suite
        </a>

        {/* Zone 2: 5 Concise Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveVisualizerTab('SANKEY')}
            className={`hover:text-indigo-600 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeVisualizerTab === 'SANKEY'
                ? 'text-indigo-600 font-bold underline'
                : ''
            }`}
          >
            Profit & Expense Flow
          </button>
          <button
            onClick={() => setActiveVisualizerTab('SPHERE')}
            className={`hover:text-indigo-600 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeVisualizerTab === 'SPHERE'
                ? 'text-indigo-600 font-bold underline'
                : ''
            }`}
          >
            Causal Sphere
          </button>
          <a
            href="#resolution"
            className="hover:text-indigo-600 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Agent Resolution
          </a>
          <a
            href="#trials"
            className="hover:text-indigo-600 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Trial Queue
          </a>
          <button
            onClick={() => handleOpenDebate('PRICING', 'CLEANING')}
            className="hover:text-indigo-600 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Peer Debate
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Button */}
        <div className="flex items-center shrink-0">
          <button
            onClick={handleAuthorizeAll}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              allAuthorized
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-[#2563EB] text-white hover:bg-indigo-700'
            }`}
          >
            {allAuthorized
              ? 'Reset All Trials'
              : 'Authorize All Trials (+$4,642/mo)'}
          </button>
        </div>
      </header>

      {/* WORKSPACE CONTEXT & HORIZONTAL AGENT SQUAD BAR */}
      <section className="border-b border-slate-200 bg-slate-50/60 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-bold text-slate-900">
                {currentCompanyProfile.companyName}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-[#2563EB] font-semibold">
                {currentCompanyProfile.industryTag}
              </span>
              <span aria-hidden="true">·</span>
              <span>Click any Human-AI Peer Lead to inspect bottlenecks</span>
            </div>

            {/* Live Portfolio Cash Run-Rate Readout */}
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-500 font-medium">
                2026 YTD P&L Profit:{' '}
                <strong className="font-mono text-slate-800 tabular-nums">
                  +$1,641/mo
                </strong>
              </span>
              <span className="text-slate-300" aria-hidden="true">
                |
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 font-semibold">
                  Projected Net Cash:
                </span>
                <span
                  className={`text-sm font-extrabold font-mono tabular-nums flex items-center gap-1 ${
                    currentNetCash >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {currentNetCash >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  {currentNetCash >= 0 ? '+$' : '-$'}
                  {Math.abs(currentNetCash).toLocaleString()}/mo
                </span>
              </div>
            </div>
          </div>

          <AgentSquadBar
            agents={CARTOON_AGENTS}
            selectedAgentId={selectedAgentId}
            onSelectAgent={handleSelectAgent}
            onOpenDebate={handleOpenDebate}
          />
        </div>
      </section>

      {/* MAIN CONTENT VIEWPORT */}
      <main className="flex-1 px-6 py-6 flex flex-col gap-8 max-w-7xl mx-auto w-full">
        {/* 01. PRIMARY VISUALIZER SECTION WITH TAB SWITCHER (Sankey Profit/Expense Flow vs Causal Sphere) */}
        <section id="visualizer" className="w-full space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setActiveVisualizerTab('SANKEY')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeVisualizerTab === 'SANKEY'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                01. Profit & Expense Sankey Flow (Per-Unit Zoom)
              </button>
              <button
                onClick={() => setActiveVisualizerTab('SPHERE')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeVisualizerTab === 'SPHERE'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                02. Holistic Causal Sphere Network
              </button>
            </div>

            <span className="text-xs text-slate-500">
              {activeVisualizerTab === 'SANKEY'
                ? 'Switch companies or click any division card / expense ribbon to zoom into unit-level P&L and line-item costs'
                : 'Click any outer sphere to zoom into its P&L drivers and assigned agents'}
            </span>
          </div>

          {activeVisualizerTab === 'SANKEY' ? (
            <SankeyFinancialFlow
              activeCompanyId={activeCompanyId}
              onSelectCompany={setActiveCompanyId}
              activeTrialIds={activeTrialIds}
              onToggleTrial={handleToggleTrial}
              onSelectAgent={handleSelectAgent}
            />
          ) : (
            <CausalNetworkCanvas
              nodes={allDynamicNodes}
              edges={allDynamicEdges}
              selectedNodeId={selectedNodeId}
              selectedAgentId={selectedAgentId}
              onSelectNode={handleSelectNode}
              onSelectAgent={handleSelectAgent}
              showProperties={showProperties}
              onToggleShowProperties={() => setShowProperties(!showProperties)}
              activeTrialIds={activeTrialIds}
              onAuthorizeTrial={handleToggleTrial}
            />
          )}
        </section>

        {/* 02. LIVE MULTI-AGENT RESOLUTION CHOREOGRAPHY STAGE */}
        <section id="resolution" className="w-full">
          <LiveResolutionStage
            activeTrialId={focusedResolutionTrialId}
            trials={INITIAL_TRIALS}
            onSelectTrialToWatch={(id) => setFocusedResolutionTrialId(id)}
            onSelectAgent={handleSelectAgent}
            authorizedTrialIds={activeTrialIds}
            onToggleAuthorize={handleToggleTrial}
          />
        </section>

        {/* 03. OWNER TRIAL AUTHORIZATION QUEUE */}
        <section id="trials" className="w-full pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              03. Owner Decision Queue & Bounded Trials
            </h2>
            <span className="text-xs text-slate-500">
              Authorizing any decision triggers live agent-to-agent execution above
            </span>
          </div>

          <TrialAuthorizationDeck
            trials={INITIAL_TRIALS}
            onToggleTrial={handleToggleTrial}
            activeTrialIds={activeTrialIds}
            onWatchResolution={(id) => {
              setFocusedResolutionTrialId(id);
              document
                .getElementById('resolution')
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </section>
      </main>

      {/* SLIDE-OUT AGENT TRANSPARENCY DOSSIER */}
      {isDossierOpen && (
        <AgentDossierModal
          agent={currentAgent}
          onClose={() => setIsDossierOpen(false)}
          onOpenDebate={handleOpenDebate}
          activeTrialIds={activeTrialIds}
        />
      )}

      {/* PEER DEBATE MODAL */}
      {isDebateOpen && (
        <BoardroomDebateModal
          initialAgent1={debatePair[0]}
          initialAgent2={debatePair[1]}
          onClose={() => setIsDebateOpen(false)}
          onAuthorizeTrial={(id) => {
            setFocusedResolutionTrialId(id);
            if (!activeTrialIds.includes(id)) {
              setActiveTrialIds([...activeTrialIds, id]);
            }
          }}
        />
      )}
    </div>
  );
}
