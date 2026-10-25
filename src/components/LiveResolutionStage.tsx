import React, { useEffect, useState } from 'react';
import { AgentId, TrialProposal } from '../types';
import { CARTOON_AGENTS } from '../data/portfolioData';
import { CartoonAgentAvatar, GeminiBotCompanion, GeminiStarNode } from './CartoonAgentAvatars';
import {
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Send,
  Sparkles,
  MessageSquarePlus,
  ShieldCheck,
  Check,
} from 'lucide-react';

export interface ResolutionStep {
  stepNumber: number;
  fromAgent: AgentId;
  toAgent: AgentId;
  actionTag: string;
  dialogue: string;
  financialDelta: string;
}

export const RESOLUTION_WORKFLOWS: Record<string, ResolutionStep[]> = {
  TRIAL_1: [
    {
      stepNumber: 1,
      fromAgent: 'PRICING',
      toAgent: 'CLEANING',
      actionTag: 'PMS Rate & Rule Push',
      dialogue:
        'Owner authorized Trial #1! Toby, I am locking the 2-night minimum stay on SM-202 and activating the $515/nt rate for 3+ night family stays (safely above our $484 floor).',
      financialDelta: '+$2,185/mo Gross Rev',
    },
    {
      stepNumber: 2,
      fromAgent: 'CLEANING',
      toAgent: 'MAINT',
      actionTag: 'Vendor Turn Re-Batching',
      dialogue:
        'Received, Pippa! Syncing with Peninsula Sparkle Cleaning Co. Blocking 1-night stays drops SM-202 monthly turns from 5.3 to 3.5—Manny, your plumbing load is dropping by 33%.',
      financialDelta: '+$405/mo Saved Turns',
    },
    {
      stepNumber: 3,
      fromAgent: 'MAINT',
      toAgent: 'CFO',
      actionTag: 'Asset Stress Guardrail',
      dialogue:
        'Huge relief on the 1938 cast-iron sewer line, Toby. Finn, multi-night family stays cut emergency corrective pipe spikes while keeping 14-day occupancy telemetry armed.',
      financialDelta: '33% Lower Pipe Wear',
    },
    {
      stepNumber: 4,
      fromAgent: 'CFO',
      toAgent: 'CEO',
      actionTag: 'General Ledger Verified',
      dialogue:
        'Nova, I have updated the General Ledger projection: SM-202 net cash flow lifts by +$2,438/mo after its $1,450 mortgage principal. 14-day auto-revert kill-switch is active.',
      financialDelta: '+$2,438/mo Net Cash',
    },
  ],
  TRIAL_2: [
    {
      stepNumber: 1,
      fromAgent: 'CLEANING',
      toAgent: 'PRICING',
      actionTag: 'Weekend Turn Gate',
      dialogue:
        'Owner approved Trial #2 on SM-303! Pippa, I have blocked 1-night Friday/Saturday turnovers so Peninsula Sparkle stops eating 40.5% of our accommodation revenue.',
      financialDelta: '-30% Turn Churn',
    },
    {
      stepNumber: 2,
      fromAgent: 'PRICING',
      toAgent: 'PROPERTY',
      actionTag: 'Corporate Bundle Live',
      dialogue:
        'On it, Toby! Launching the $212/night 4-night Mon–Fri Peninsula Professional bundle. Pia, let’s shift unit positioning toward mid-week corporate travelers.',
      financialDelta: '2.80 Nts/Stay Target',
    },
    {
      stepNumber: 3,
      fromAgent: 'PROPERTY',
      toAgent: 'COO',
      actionTag: 'Cohort C Re-Aligned',
      dialogue:
        'Cohort C playbook updated, Ollie! SM-303 is now prioritized for 3–4 night professional stays, eliminating single-night gap erosion.',
      financialDelta: '52%+ Occ Held',
    },
    {
      stepNumber: 4,
      fromAgent: 'CFO',
      toAgent: 'CEO',
      actionTag: 'Solvency Flip Verified',
      dialogue:
        'Verified in the ledger: SM-303 flips from a -$269/mo cash deficit to +$385/mo positive net cash flow after servicing its $850/mo mortgage principal!',
      financialDelta: '+$654/mo Net Cash',
    },
  ],
  TRIAL_3: [
    {
      stepNumber: 1,
      fromAgent: 'MAINT',
      toAgent: 'COO',
      actionTag: 'Warranty Clawback Audit',
      dialogue:
        'Owner signed off on Escalation #1! Ollie, I am issuing the formal warranty claim on MNT-00063 ($5,400 roof repair billed 30 days after our $9,200 roof CapEx TX-001823).',
      financialDelta: '$5,400 Claim Issued',
    },
    {
      stepNumber: 2,
      fromAgent: 'COO',
      toAgent: 'CFO',
      actionTag: 'Retainer Cap & RFP',
      dialogue:
        'Dispatched to Peninsula Property Repairs, Manny. Finn, we have frozen open-ended $550/mo routine inspection bills and locked the $350/mo fixed preventive retainer.',
      financialDelta: '+$200/mo Fixed Cap',
    },
    {
      stepNumber: 3,
      fromAgent: 'CFO',
      toAgent: 'PRICING',
      actionTag: 'Break-Even Floor Lowered',
      dialogue:
        'Great work, Ollie. Enforcing the 2-quote gate on work orders >$500 saves +$1,550/mo in corrective bleed—lowering SM-202’s cash break-even floor by 25%.',
      financialDelta: '-25% Cash Hurdle',
    },
    {
      stepNumber: 4,
      fromAgent: 'CEO',
      toAgent: 'CFO',
      actionTag: 'Resolution Complete',
      dialogue:
        'All 3 operational & financial guardrails are locked. Portfolio Repairs & Warranty node is officially healed on the Holistic Business Canvas.',
      financialDelta: '+$1,550/mo Net Cash',
    },
  ],
};

interface ThreadMessage {
  id: string;
  sender: 'OWNER' | AgentId;
  text: string;
  impactTag?: string;
  timestamp: string;
}

interface CoResolutionProposal {
  title: string;
  summary: string;
  monthlyImpact: number;
  guardrail: string;
  steps: string[];
}

const PRESET_REALTIME_ISSUES = [
  'SM-202 guest reported a slow bathroom drain & requested a $200 refund',
  'Peninsula Sparkle wants to add a $55 Sunday turnover surcharge on SM-303',
  'SM-303 has 4 unbooked weeknights next week during a local tech conference',
];

interface LiveResolutionStageProps {
  activeTrialId: string;
  trials: TrialProposal[];
  onSelectTrialToWatch: (trialId: string) => void;
  onSelectAgent: (agentId: AgentId) => void;
  authorizedTrialIds: string[];
  onToggleAuthorize: (trialId: string) => void;
}

export const LiveResolutionStage: React.FC<LiveResolutionStageProps> = ({
  activeTrialId,
  trials,
  onSelectTrialToWatch,
  onSelectAgent,
  authorizedTrialIds,
  onToggleAuthorize,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Real-Time Issue & Owner Co-Resolution State
  const [issueInput, setIssueInput] = useState<string>('');
  const [chimeInInput, setChimeInInput] = useState<string>('');
  const [activeIssueBanner, setActiveIssueBanner] = useState<string>(
    'SM-202 guest reported a slow bathroom drain & requested a $200 refund'
  );
  const [isSubmittingIssue, setIsSubmittingIssue] = useState<boolean>(false);
  const [isCustomResolutionLocked, setIsCustomResolutionLocked] =
    useState<boolean>(false);

  const [threadMessages, setThreadMessages] = useState<ThreadMessage[]>([
    {
      id: 'msg-1',
      sender: 'OWNER',
      text: 'Real-Time Issue: SM-202 guest reported a slow bathroom drain & requested a $200 refund.',
      timestamp: 'Just now',
    },
    {
      id: 'msg-2',
      sender: 'MAINT',
      text: 'SM-202 already absorbed $20,385 in OpEx repairs. Instead of a $450 emergency plumber call, I am dispatching our capped $350/mo retainer tech within 90 minutes and checking if this is covered under Peninsula Property Repairs prior drain warranty.',
      impactTag: '$450 Call Avoided',
      timestamp: 'Just now',
    },
    {
      id: 'msg-3',
      sender: 'COO',
      text: 'Agreed, Manny. To protect our 4.9★ rating without refunding $200 of nightly revenue, Pia and I can send a $45 downtown San Mateo coffee & pastry hospitality voucher while the tech clears the line.',
      impactTag: '+$155 Rate Saved',
      timestamp: 'Just now',
    },
    {
      id: 'msg-4',
      sender: 'CFO',
      text: 'Using the retainer tech + a $45 amenity voucher instead of a $200 refund + $450 emergency bill preserves +$605 in net cash on this stay alone.',
      impactTag: '+$605 Cash Preserved',
      timestamp: 'Just now',
    },
  ]);

  const [coResolution, setCoResolution] = useState<CoResolutionProposal>({
    title: 'Capped Retainer Dispatch & Zero-Refund Guest Recovery',
    summary:
      'Dispatch preventive tech under the $350/mo retainer cap within 90 mins, invoke vendor warranty on prior drain work, and send a $45 hospitality voucher instead of a $200 rate refund.',
    monthlyImpact: 1120,
    guardrail: 'Owner sign-off required if secondary plumbing quote exceeds $300',
    steps: [
      'Manny (Maint): Dispatch retainer tech within 90m & file warranty notice.',
      'Ollie (COO) & Pia (Property): Deliver $45 local cafe voucher to guest.',
      'Finn (CFO): Preserve full $692 nightly ADR and log +$1,120/mo run-rate savings.',
    ],
  });

  const steps = RESOLUTION_WORKFLOWS[activeTrialId] || RESOLUTION_WORKFLOWS['TRIAL_1'];
  const activeStep = steps[currentStepIndex] || steps[0];
  const currentTrial = trials.find((t) => t.id === activeTrialId) || trials[0];
  const isAuthorized = authorizedTrialIds.includes(currentTrial.id);

  // Auto-advance through the 4 agent-to-agent resolution steps when playing
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(true);
  }, [activeTrialId, authorizedTrialIds.length]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        setIsPlaying(false);
        return prev;
      });
    }, 3200);
    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  // Handler for submitting a new Real-Time Issue
  const handleSubmitNewIssue = async (customText?: string) => {
    const textToSubmit = (customText ?? issueInput).trim();
    if (!textToSubmit) return;

    setIsSubmittingIssue(true);
    setIsCustomResolutionLocked(false);
    setActiveIssueBanner(textToSubmit);
    if (!customText) setIssueInput('');

    const ownerMsg: ThreadMessage = {
      id: `owner-${Date.now()}`,
      sender: 'OWNER',
      text: `Real-Time Issue: ${textToSubmit}`,
      timestamp: 'Live',
    };

    const updatedHistory = [ownerMsg];
    setThreadMessages(updatedHistory);

    try {
      const res = await fetch('/api/realtime-issue-resolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueText: textToSubmit,
          history: updatedHistory,
        }),
      });
      const data = await res.json();
      if (data.status === 'ok') {
        const agentMsgs: ThreadMessage[] = (data.replies || []).map(
          (r: { agentId: AgentId; text: string; impactTag: string }, i: number) => ({
            id: `agent-${Date.now()}-${i}`,
            sender: (r.agentId as AgentId) || 'CEO',
            text: r.text,
            impactTag: r.impactTag,
            timestamp: 'Live reply',
          })
        );
        setThreadMessages([ownerMsg, ...agentMsgs]);
        if (data.resolutionProposal) {
          setCoResolution(data.resolutionProposal);
        }
      }
    } catch {
      // Fallback if offline
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  // Handler for Owner Chime-In to steer the agents and update the resolution
  const handleOwnerChimeIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const chimeText = chimeInInput.trim();
    if (!chimeText) return;

    setIsSubmittingIssue(true);
    setIsCustomResolutionLocked(false);
    setChimeInInput('');

    const ownerChimeMsg: ThreadMessage = {
      id: `chime-${Date.now()}`,
      sender: 'OWNER',
      text: `Owner Chime-In: "${chimeText}"`,
      timestamp: 'Just now',
    };

    const nextHistory = [...threadMessages, ownerChimeMsg];
    setThreadMessages(nextHistory);

    try {
      const res = await fetch('/api/realtime-issue-resolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueText: activeIssueBanner,
          ownerChimeIn: chimeText,
          history: nextHistory.slice(-6),
        }),
      });
      const data = await res.json();
      if (data.status === 'ok') {
        const agentMsgs: ThreadMessage[] = (data.replies || []).map(
          (r: { agentId: AgentId; text: string; impactTag: string }, i: number) => ({
            id: `agent-chime-${Date.now()}-${i}`,
            sender: (r.agentId as AgentId) || 'CEO',
            text: r.text,
            impactTag: r.impactTag,
            timestamp: 'Updated plan',
          })
        );
        setThreadMessages([...nextHistory, ...agentMsgs]);
        if (data.resolutionProposal) {
          setCoResolution(data.resolutionProposal);
        }
      }
    } catch {
      // Fallback if offline
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  const speaker = CARTOON_AGENTS.find((a) => a.id === activeStep.fromAgent)!;
  const listener = CARTOON_AGENTS.find((a) => a.id === activeStep.toAgent)!;

  return (
    <div className="w-full rounded-3xl border border-indigo-100 bg-gradient-to-br from-[#F8FAFF] via-white to-[#F0FDFA] p-5 sm:p-6 shadow-sm relative overflow-hidden space-y-8">
      {/* =====================================================================
          PART 1: LIVE MULTI-AGENT RESOLUTION CHOREOGRAPHY
         ===================================================================== */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#2563EB] mb-1">
              <span>Live Multi-Agent Resolution Choreography</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-slate-600">
                {isAuthorized
                  ? 'Decision Authorized & Executing'
                  : 'Previewing Resolution Path'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {currentTrial.title}
            </h3>
          </div>

          {/* 4-Point Gemini Star Chain */}
          <div className="flex items-center gap-2">
            {steps.map((step, idx) => {
              const isDone = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <React.Fragment key={step.stepNumber}>
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStepIndex(idx);
                    }}
                    className="group relative flex flex-col items-center cursor-pointer"
                    title={`Step ${step.stepNumber}: ${step.actionTag}`}
                  >
                    <GeminiStarNode
                      variant={isCurrent ? 'blue' : isDone ? 'teal' : 'white'}
                      size="md"
                      pulse={isCurrent}
                    />
                    <span
                      className={`mt-1 text-[10px] font-mono whitespace-nowrap ${
                        isCurrent ? 'font-bold text-[#2563EB]' : 'text-slate-500'
                      }`}
                    >
                      0{step.stepNumber}. {step.fromAgent}
                    </span>
                  </button>
                  {idx < steps.length - 1 && (
                    <div
                      className={`w-6 sm:w-10 h-0.5 -mt-4 transition-colors duration-300 ${
                        idx < currentStepIndex ? 'bg-[#00C4B4]' : 'bg-indigo-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Playback & Trial Switcher Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              {trials.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => onSelectTrialToWatch(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTrialId === t.id
                      ? 'bg-white text-[#2563EB] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Decision #{i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setCurrentStepIndex(0);
                setIsPlaying(true);
              }}
              className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition cursor-pointer"
              title="Replay Agent Resolution Sequence"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MAIN VISUAL STAGE: GEMINI CAPSULES & SPEECH BUBBLES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Capsule 1: Finance & Yield Pod */}
              <div
                className={`rounded-full px-4 py-3 border-2 transition-all flex items-center justify-between ${
                  ['PRICING', 'CFO'].includes(activeStep.fromAgent) ||
                  ['PRICING', 'CFO'].includes(activeStep.toAgent)
                    ? 'border-[#2563EB] bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-cyan-400/20 shadow-md'
                    : 'border-indigo-100 bg-slate-50/80 opacity-85'
                }`}
              >
                <GeminiBotCompanion size="md" />
                <div className="flex flex-col items-center px-2">
                  <GeminiStarNode variant="blue" size="sm" />
                  <span className="text-[10px] font-semibold text-indigo-950 mt-1 whitespace-nowrap">
                    Yield & Ledger Pod
                  </span>
                </div>
                <div className="flex items-center -space-x-2">
                  <button
                    onClick={() => onSelectAgent('PRICING')}
                    className={`rounded-full transition-transform cursor-pointer ${
                      activeStep.fromAgent === 'PRICING'
                        ? 'scale-115 ring-3 ring-[#2563EB] z-10'
                        : ''
                    }`}
                  >
                    <CartoonAgentAvatar type="pricing" size="md" />
                  </button>
                  <button
                    onClick={() => onSelectAgent('CFO')}
                    className={`rounded-full transition-transform cursor-pointer ${
                      activeStep.fromAgent === 'CFO'
                        ? 'scale-115 ring-3 ring-[#00C4B4] z-10'
                        : ''
                    }`}
                  >
                    <CartoonAgentAvatar type="cfo" size="md" />
                  </button>
                </div>
              </div>

              {/* Capsule 2: Operations & Turn Pod */}
              <div
                className={`rounded-full px-4 py-3 border-2 transition-all flex items-center justify-between ${
                  ['CLEANING', 'MAINT', 'PROPERTY', 'COO'].includes(
                    activeStep.fromAgent
                  ) ||
                  ['CLEANING', 'MAINT', 'PROPERTY', 'COO'].includes(
                    activeStep.toAgent
                  )
                    ? 'border-[#00C4B4] bg-gradient-to-r from-cyan-400/20 via-indigo-500/15 to-purple-500/15 shadow-md'
                    : 'border-indigo-100 bg-slate-50/80 opacity-85'
                }`}
              >
                <GeminiBotCompanion size="md" />
                <div className="flex flex-col items-center px-2">
                  <GeminiStarNode variant="teal" size="sm" />
                  <span className="text-[10px] font-semibold text-teal-950 mt-1 whitespace-nowrap">
                    Ops & Asset Pod
                  </span>
                </div>
                <div className="flex items-center -space-x-2">
                  <button
                    onClick={() => onSelectAgent('CLEANING')}
                    className={`rounded-full transition-transform cursor-pointer ${
                      activeStep.fromAgent === 'CLEANING'
                        ? 'scale-115 ring-3 ring-[#2563EB] z-10'
                        : ''
                    }`}
                  >
                    <CartoonAgentAvatar type="cleaning" size="md" />
                  </button>
                  <button
                    onClick={() => onSelectAgent('MAINT')}
                    className={`rounded-full transition-transform cursor-pointer ${
                      activeStep.fromAgent === 'MAINT'
                        ? 'scale-115 ring-3 ring-[#00C4B4] z-10'
                        : ''
                    }`}
                  >
                    <CartoonAgentAvatar type="maint" size="md" />
                  </button>
                  <button
                    onClick={() => onSelectAgent('COO')}
                    className={`rounded-full transition-transform cursor-pointer ${
                      activeStep.fromAgent === 'COO'
                        ? 'scale-115 ring-3 ring-[#7C3AED] z-10'
                        : ''
                    }`}
                  >
                    <CartoonAgentAvatar type="coo" size="md" />
                  </button>
                </div>
              </div>
            </div>

            {/* LIVE SPEECH BUBBLE STAGE */}
            <div className="relative rounded-3xl bg-white border-2 border-indigo-200/90 p-5 shadow-lg">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <CartoonAgentAvatar type={speaker.avatarSvgType} size="md" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {speaker.name} ({speaker.role.split(' ')[0]})
                      </div>
                      <div className="text-[11px] text-[#2563EB] font-medium">
                        Speaking to {listener.name} ({listener.role.split(' ')[0]})
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0" />

                  <CartoonAgentAvatar type={listener.avatarSvgType} size="sm" />
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 tabular-nums">
                    {activeStep.financialDelta}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/70">
                <GeminiStarNode variant="blue" size="sm" />
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  "{activeStep.dialogue}"
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT (5 Cols): Human Business Owner Desk & Final Sign-Off Card */}
          <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200 p-5 shadow-sm flex flex-col justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00D4B2]/20 via-indigo-100 to-purple-100 border border-indigo-200/80 flex items-center justify-center shrink-0 overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path d="M18 55 Q18 38 34 42 L38 85 L18 85 Z" fill="#2563EB" />
                  <path
                    d="M28 85 C28 60, 56 60, 56 85 Z"
                    fill="#FFFFFF"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M28 24 C22 36, 24 54, 30 62 L48 58 L46 24 Z"
                    fill="#1E293B"
                  />
                  <path
                    d="M32 28 C32 18, 48 18, 48 30 C48 38, 42 44, 35 42 Z"
                    fill="#FDBA74"
                  />
                  <circle cx="36" cy="36" r="2.2" fill="#00C4B4" />
                  <line
                    x1="42"
                    y1="74"
                    x2="92"
                    y2="74"
                    stroke="#1E1B4B"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <polygon
                    points="56,72 82,72 88,52 62,52"
                    fill="#E0F2FE"
                    stroke="#00C4B4"
                    strokeWidth="1.5"
                  />
                  <circle cx="72" cy="62" r="2.5" fill="#00C4B4" />
                </svg>
              </div>

              <div>
                <div className="text-xs font-semibold text-[#2563EB]">
                  Human-in-the-Loop Control
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Business Owner Authorization
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                  Agents co-design the trial and verify the General Ledger math; you authorize the capital movement.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <div className="text-slate-500">Projected Monthly Lift</div>
                <div className="text-base font-extrabold font-mono text-teal-600 tabular-nums mt-0.5">
                  +${currentTrial.monthlyNetCashLift.toLocaleString()}/mo
                </div>
              </div>
              <div>
                <div className="text-slate-500">Auto-Revert Guardrail</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">
                  {currentTrial.durationDays}-Day Bounded Trial
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onToggleAuthorize(currentTrial.id);
                setCurrentStepIndex(0);
                setIsPlaying(true);
              }}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isAuthorized
                  ? 'bg-[#00C4B4] hover:bg-teal-500 text-slate-950 shadow-sm'
                  : 'bg-[#2563EB] hover:bg-indigo-700 text-white shadow-sm'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isAuthorized
                  ? 'Decision Authorized — Replay Agent Execution'
                  : `Authorize Decision (+$${currentTrial.monthlyNetCashLift.toLocaleString()}/mo) & Run Resolution`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          PART 2: REAL-TIME OWNER ISSUE INPUT, AGENT REPLIES & CO-RESOLUTION ROOM
         ===================================================================== */}
      <div className="pt-6 border-t-2 border-indigo-100/90 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <GeminiStarNode variant="blue" size="md" />
            <div>
              <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                Real-Time Issue & Owner Co-Resolution Studio
              </h4>
              <p className="text-xs text-slate-600">
                Input any real-time operational or financial issue below. Agents will reply with solutions, and you can chime in to steer the final resolution.
              </p>
            </div>
          </div>

          {/* Preset Real-Time Incident Pills for 1-Click Testing */}
          <div className="flex flex-wrap items-center gap-1.5">
            {PRESET_REALTIME_ISSUES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSubmitNewIssue(preset)}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-indigo-50 text-[11px] font-semibold text-[#2563EB] border border-indigo-200/80 transition-colors cursor-pointer shadow-2xs"
              >
                Scenario #{idx + 1}: {preset.slice(0, 34)}...
              </button>
            ))}
          </div>
        </div>

        {/* 1. NEW REAL-TIME ISSUE INPUT BAR */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitNewIssue();
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-white p-2.5 rounded-2xl border border-indigo-200/90 shadow-xs"
        >
          <div className="flex items-center gap-2 px-2 flex-1">
            <Sparkles className="w-4 h-4 text-[#7C3AED] shrink-0" />
            <input
              type="text"
              value={issueInput}
              onChange={(e) => setIssueInput(e.target.value)}
              placeholder="Report a real-time issue (e.g., 'SM-202 guest wants a $200 refund for slow Wi-Fi' or 'Cleaning crew raised weekend rates 15%')..."
              className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmittingIssue || !issueInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {isSubmittingIssue ? 'Agents Analyzing...' : 'Dispatch Issue to Agents'}
            </span>
          </button>
        </form>

        {/* 2. TWO-COLUMN LIVE AGENT REPLY FEED + CO-DESIGNED RESOLUTION BLUEPRINT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT (7 Cols): Multi-Agent Discussion Feed + Owner Chime-In Box */}
          <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200 p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xs">
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {threadMessages.map((msg) => {
                if (msg.sender === 'OWNER') {
                  return (
                    <div
                      key={msg.id}
                      className="flex items-start justify-end gap-2.5"
                    >
                      <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white px-4 py-2.5 shadow-2xs">
                        <div className="flex items-center justify-between gap-3 mb-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">
                            You · Business Owner
                          </span>
                          <span className="text-[10px] font-mono text-indigo-200">
                            {msg.timestamp}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed font-medium">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  );
                }

                const agentObj =
                  CARTOON_AGENTS.find((a) => a.id === msg.sender) ||
                  CARTOON_AGENTS[0];

                return (
                  <div key={msg.id} className="flex items-start gap-3">
                    <button
                      onClick={() => onSelectAgent(agentObj.id)}
                      className="shrink-0 cursor-pointer mt-0.5"
                    >
                      <CartoonAgentAvatar
                        type={agentObj.avatarSvgType}
                        size="sm"
                      />
                    </button>
                    <div className="flex-1 rounded-2xl rounded-tl-xs bg-slate-50 border border-slate-200/80 px-3.5 py-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-extrabold text-slate-900">
                          {agentObj.name}{' '}
                          <span className="font-medium text-slate-500">
                            · {agentObj.role}
                          </span>
                        </span>
                        {msg.impactTag && (
                          <span className="text-[10px] font-mono font-bold text-[#2563EB] bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                            {msg.impactTag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* OWNER CHIME-IN BAR (Reply back to steer the agents!) */}
            <form
              onSubmit={handleOwnerChimeIn}
              className="pt-3 border-t border-slate-100 flex items-center gap-2"
            >
              <div className="flex items-center gap-2 flex-1 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <MessageSquarePlus className="w-4 h-4 text-[#2563EB] shrink-0" />
                <input
                  type="text"
                  value={chimeInInput}
                  onChange={(e) => setChimeInInput(e.target.value)}
                  placeholder="Chime in with your thoughts or constraints (e.g., 'Cap upfront spend at $250 and don't lower weekend ADR')..."
                  className="w-full text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingIssue || !chimeInInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Chime In
              </button>
            </form>
          </div>

          {/* RIGHT (5 Cols): Synthesized Co-Resolution Blueprint & Owner Lock-In */}
          <div className="lg:col-span-5 rounded-3xl bg-white border-2 border-indigo-200/80 p-5 flex flex-col justify-between gap-4 shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#7C3AED] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200/70">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Live Co-Designed Resolution</span>
                </span>
                <span className="text-xs font-mono font-extrabold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 tabular-nums">
                  +${coResolution.monthlyImpact.toLocaleString()}/mo Impact
                </span>
              </div>

              <div>
                <h5 className="text-sm font-extrabold text-slate-900">
                  {coResolution.title}
                </h5>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {coResolution.summary}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-800">
                  Agreed Multi-Agent Execution Steps:
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {coResolution.steps.map((st, i) => (
                    <li key={i} className="flex items-start gap-2 leading-snug">
                      <span className="font-mono font-bold text-[#2563EB] shrink-0">
                        0{i + 1}.
                      </span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-2 text-[11px] text-slate-700">
                <ShieldCheck className="w-4 h-4 text-[#00C4B4] shrink-0" />
                <span>
                  <strong>Guardrail:</strong> {coResolution.guardrail}
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                setIsCustomResolutionLocked(!isCustomResolutionLocked)
              }
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isCustomResolutionLocked
                  ? 'bg-[#00C4B4] text-slate-950 shadow-xs'
                  : 'bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:opacity-95 text-white shadow-xs'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {isCustomResolutionLocked
                  ? 'Co-Resolution Approved & Dispatched to Ledger'
                  : 'Approve & Lock This Co-Resolution'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
