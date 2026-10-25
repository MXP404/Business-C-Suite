import React, { useState } from 'react';
import { AgentId } from '../types';
import { CARTOON_AGENTS } from '../data/portfolioData';
import { CartoonAgentAvatar, GeminiStarNode } from './CartoonAgentAvatars';
import { X, Play, RefreshCw, CheckCircle2 } from 'lucide-react';

interface BoardroomDebateModalProps {
  initialAgent1: AgentId;
  initialAgent2: AgentId;
  onClose: () => void;
  onAuthorizeTrial: (trialId: string) => void;
}

export const BoardroomDebateModal: React.FC<BoardroomDebateModalProps> = ({
  initialAgent1,
  initialAgent2,
  onClose,
  onAuthorizeTrial,
}) => {
  const [agent1Id, setAgent1Id] = useState<AgentId>(initialAgent1);
  const [agent2Id, setAgent2Id] = useState<AgentId>(initialAgent2);
  const [topic, setTopic] = useState(
    'SM-202 Rate Drop vs Variable Turn Friction & Pipe Wear'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [turns, setTurns] = useState<Array<{ agent: AgentId; text: string }>>([
    {
      agent: 'PRICING',
      text: 'Look at the pace on SM-202: 21.98% occupancy! We are pricing out multi-night travelers. If we drop the nightly rate to $509, we will immediately stimulate booking volume.',
    },
    {
      agent: 'CLEANING',
      text: 'Hold on, Pippa! Peninsula Sparkle charges $225 per turn on SM-202. Dropping the nightly rate without stay-length constraints will flood us with 1-night parties that erase our operating margin!',
    },
    {
      agent: 'MAINT',
      text: 'Co-signing Toby! SM-202 is 88 years old. We spent $20,385 on expensed repairs and $9,200 on roof CapEx in 2026. High 1-night turnover will rupture the sewer line again.',
    },
    {
      agent: 'PRICING',
      text: 'Compromise accepted: We enforce a strict 2-Night Minimum Stay (killing 1-night party churn), and apply the $515 rate ONLY to 3+ night family vacations. That doubles occupied nights while cutting cleaning turns by 33%!',
    },
    {
      agent: 'CFO',
      text: 'Ledger verified: That trial generates +$2,438/mo net cash and protects the $484 contribution floor. Staged as Trial Proposal #1 for Owner authorization.',
    },
  ]);

  const agent1 = CARTOON_AGENTS.find((a) => a.id === agent1Id)!;
  const agent2 = CARTOON_AGENTS.find((a) => a.id === agent2Id)!;

  const handleRunLiveDebate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/boardroom-debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent1Id,
          agent2Id,
          topic,
        }),
      });
      const data = await res.json();
      if (data.transcript) {
        setTurns(data.transcript);
      } else if (data.rawText) {
        setTurns([
          { agent: agent1Id, text: `${data.rawText.slice(0, 320)}...` },
          {
            agent: agent2Id,
            text: 'Consensus reached on bounded trial parameters with 14-day auto-revert trigger.',
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-indigo-50/70 via-white to-teal-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center -space-x-2">
              <CartoonAgentAvatar
                type={agent1.avatarSvgType}
                size="md"
                className="ring-2 ring-indigo-500"
              />
              <CartoonAgentAvatar
                type={agent2.avatarSvgType}
                size="md"
                className="ring-2 ring-teal-500"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Live Cross-Agent Debate & Resolution
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                {agent1.name} ({agent1.role.split(' ')[0]}) · {agent2.name} (
                {agent2.role.split(' ')[0]})
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

        {/* Topic Input Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <span className="text-slate-500 font-semibold">Topic:</span>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-medium focus:outline-none focus:border-indigo-600"
            />
          </div>

          <button
            onClick={handleRunLiveDebate}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-indigo-700 text-white font-semibold transition whitespace-nowrap cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Simulate Debate</span>
          </button>
        </div>

        {/* Debate Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-white text-xs">
          {turns.map((turn, i) => {
            const ag =
              CARTOON_AGENTS.find((a) => a.id === turn.agent) || CARTOON_AGENTS[0];
            return (
              <div
                key={i}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80"
              >
                <CartoonAgentAvatar type={ag.avatarSvgType} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      {ag.name}
                      <span className="text-slate-300" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-slate-500 font-normal">
                        {ag.role}
                      </span>
                    </span>
                    <span className="text-[11px] font-mono text-indigo-600 tabular-nums">
                      0{i + 1}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{turn.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="text-xs flex items-center gap-2">
            <GeminiStarNode variant="teal" size="sm" />
            <span className="text-slate-600">Co-Designed Resolution:</span>
            <span className="text-emerald-700 font-bold font-mono tabular-nums">
              Trial #1 (+$2,438/mo Net Cash)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition whitespace-nowrap cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onAuthorizeTrial('TRIAL_1');
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition whitespace-nowrap cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Authorize Trial & Watch Resolution</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
