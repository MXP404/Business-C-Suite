import React from 'react';
import { TrialProposal } from '../types';
import { CARTOON_AGENTS } from '../data/portfolioData';
import { CartoonAgentAvatar, GeminiStarNode } from './CartoonAgentAvatars';
import { ShieldCheck, Check, Clock, MessageSquare } from 'lucide-react';

interface TrialAuthorizationDeckProps {
  trials: TrialProposal[];
  onToggleTrial: (trialId: string) => void;
  activeTrialIds: string[];
  onWatchResolution?: (trialId: string) => void;
}

export const TrialAuthorizationDeck: React.FC<TrialAuthorizationDeckProps> = ({
  trials,
  onToggleTrial,
  activeTrialIds,
  onWatchResolution,
}) => {
  return (
    <div className="w-full space-y-5">
      {/* Tier 1 Autonomous Guardrail Row */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <GeminiStarNode variant="teal" size="sm" />
          <div>
            <span className="font-bold text-slate-900">
              01. Tier-1 Autonomous Guardrail Execution
            </span>
            <span className="text-slate-400 mx-2" aria-hidden="true">
              ·
            </span>
            <span className="text-slate-600">
              Routine preventive inspections under $250 and ±5% dynamic rate shifts auto-applied
            </span>
          </div>
        </div>

        <div className="font-mono text-xs font-bold text-emerald-700 tabular-nums">
          3 Auto-Actions Live (+$310/mo Net Cash)
        </div>
      </div>

      {/* Tier 2 & Tier 3 Co-Designed Trial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {trials.map((trial, idx) => {
          const isAuthorized = activeTrialIds.includes(trial.id);

          return (
            <div
              key={trial.id}
              className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                isAuthorized
                  ? 'bg-gradient-to-b from-indigo-50/60 via-white to-teal-50/40 border-[#2563EB] shadow-md ring-2 ring-indigo-500/15'
                  : 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
              }`}
            >
              <div>
                {/* Clean Unboxed Metadata Header + Tabular Net Cash Impact */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <span>0{idx + 1}. {trial.tier}</span>
                    <span aria-hidden="true">·</span>
                    <span>{trial.durationDays}-Day Trial</span>
                  </div>
                  <span className="text-sm font-extrabold font-mono text-emerald-600 tabular-nums">
                    +${trial.monthlyNetCashLift.toLocaleString()}/mo
                  </span>
                </div>

                {/* Primary Title */}
                <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                  {trial.title}
                </h3>

                {/* Rationale */}
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {trial.rationale}
                </p>

                {/* Target Unit & Co-Designing Agents */}
                <div className="flex items-center justify-between text-xs text-slate-600 py-2.5 border-t border-slate-100">
                  <span className="font-semibold text-slate-800">{trial.targetUnit}</span>
                  <div className="flex items-center -space-x-2">
                    {trial.coDesigners.map((agId) => {
                      const ag = CARTOON_AGENTS.find((a) => a.id === agId);
                      if (!ag) return null;
                      return (
                        <div key={agId} title={`${ag.name} (${ag.role})`}>
                          <CartoonAgentAvatar type={ag.avatarSvgType} size="sm" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Auto-Revert Guardrail */}
                <div className="py-2.5 border-t border-slate-100 text-[11px] text-slate-600 flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>{trial.autoRevertCondition}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                {onWatchResolution && (
                  <button
                    onClick={() => onWatchResolution(trial.id)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Watch Agents</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onToggleTrial(trial.id);
                    if (onWatchResolution) onWatchResolution(trial.id);
                  }}
                  className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
                    isAuthorized
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-[#2563EB] hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isAuthorized ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Authorized & Active</span>
                    </>
                  ) : (
                    <span>Authorize Decision</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
