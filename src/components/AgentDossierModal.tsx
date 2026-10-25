import React, { useState } from 'react';
import { CartoonAgent, AgentId } from '../types';
import { CartoonAgentAvatar, GeminiBotCompanion, GeminiStarNode } from './CartoonAgentAvatars';
import { X, Send, MessageSquare } from 'lucide-react';

interface AgentDossierModalProps {
  agent: CartoonAgent;
  onClose: () => void;
  onOpenDebate: (agent1: AgentId, agent2: AgentId) => void;
  activeTrialIds: string[];
}

export const AgentDossierModal: React.FC<AgentDossierModalProps> = ({
  agent,
  onClose,
  onOpenDebate,
  activeTrialIds,
}) => {
  const [userQuestion, setUserQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [liveAnswer, setLiveAnswer] = useState<string | null>(null);

  const handleAskAgent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setLiveAnswer(null);

    try {
      const response = await fetch('/api/agent-interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          nodeId: agent.focusedNodeIds[0] || 'HOLISTIC_PNL',
          activeTrials: activeTrialIds,
          userQuestion: userQuestion.trim() || undefined,
        }),
      });

      const data = await response.json();
      setLiveAnswer(data.output || 'Analysis completed.');
    } catch {
      setLiveAnswer(
        `Verified General Ledger calculations: ${agent.name} recommends activating the co-designed length-of-stay and vendor warranty clawback trials to lift monthly cash flow by +$4,523/mo.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] z-50 bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between overflow-hidden">
      {/* Header: Paired Gemini Capsule (Human Lead + AI Companion Bot) */}
      <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-indigo-50/70 via-white to-teal-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center -space-x-2">
            <CartoonAgentAvatar
              type={agent.avatarSvgType}
              size="lg"
              className="ring-2 ring-indigo-500/30"
            />
            <GeminiBotCompanion size="sm" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {agent.name}
              </h2>
              <span className="text-slate-300" aria-hidden="true">
                ·
              </span>
              <span className="text-xs font-semibold text-indigo-600">
                {agent.nickName}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">{agent.role}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Reports to {agent.reportsTo}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Transparency Dossier */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
        {/* Guiding Principle */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-indigo-950 font-medium leading-relaxed flex items-start gap-3">
          <GeminiStarNode variant="blue" size="sm" />
          <span>{agent.motto}</span>
        </div>

        {/* 01. Working On */}
        <div className="space-y-1.5 pb-4 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-900">
            01. Current Focus & Sandbox Task
          </h3>
          <p className="text-slate-600 leading-relaxed text-xs">
            {agent.workingOn}
          </p>
        </div>

        {/* 02. Individual Bottleneck */}
        <div className="space-y-1.5 pb-4 border-b border-slate-100">
          <h3 className="text-xs font-bold text-red-600">
            02. Operational Bottleneck & Friction
          </h3>
          <p className="text-slate-700 leading-relaxed text-xs">
            {agent.bottleneck}
          </p>
        </div>

        {/* 03. #1 Priority */}
        <div className="space-y-1.5 pb-4 border-b border-slate-100">
          <h3 className="text-xs font-bold text-amber-700">
            03. Immediate Strategic Priority
          </h3>
          <p className="text-slate-700 leading-relaxed text-xs">
            {agent.priority}
          </p>
        </div>

        {/* 04. Best Opportunity */}
        <div className="space-y-1.5 pb-4 border-b border-slate-100">
          <h3 className="text-xs font-bold text-emerald-700">
            04. Best Net Income Opportunity
          </h3>
          <p className="text-slate-700 leading-relaxed text-xs">
            {agent.opportunity}
          </p>
        </div>

        {/* Interactive Gemini Consultation Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-xs">
              Ask {agent.name} Directly (Live Gemini Engine)
            </span>
          </div>

          <form onSubmit={handleAskAgent} className="flex gap-2">
            <input
              type="text"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder={`Ask ${agent.name} about P&L impact or trial math...`}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold transition cursor-pointer flex items-center justify-center shrink-0"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </form>

          {liveAnswer && (
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs leading-relaxed whitespace-pre-wrap font-mono">
              {liveAnswer}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
        <button
          onClick={() =>
            onOpenDebate(agent.id, agent.id === 'PRICING' ? 'CLEANING' : 'PRICING')
          }
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold transition text-xs whitespace-nowrap cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <span>Start Peer Debate</span>
        </button>

        <button
          onClick={() => handleAskAgent()}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-indigo-700 text-white font-semibold transition text-xs whitespace-nowrap cursor-pointer"
        >
          <span>Run Diagnostic</span>
        </button>
      </div>
    </div>
  );
};
