import React, { useState } from 'react';
import { CausalNode, CausalEdge, AgentId } from '../types';
import { CARTOON_AGENTS } from '../data/portfolioData';
import { CartoonAgentAvatar, GeminiStarNode } from './CartoonAgentAvatars';
import {
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  AlertTriangle,
  TrendingDown,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  Check,
} from 'lucide-react';

interface CausalNetworkCanvasProps {
  nodes: CausalNode[];
  edges: CausalEdge[];
  selectedNodeId: string | null;
  selectedAgentId: AgentId | null;
  onSelectNode: (nodeId: string) => void;
  onSelectAgent: (agentId: AgentId) => void;
  showProperties: boolean;
  onToggleShowProperties: () => void;
  activeTrialIds: string[];
  onAuthorizeTrial?: (trialId: string) => void;
}

type SphereClusterId = 'MACRO' | 'REVENUE_CLUSTER' | 'OPEX_CLUSTER' | 'CAPEX_CLUSTER' | 'UNITS_CLUSTER';

interface OrbitalNodeSpec {
  id: string;
  shortLabel: string;
  angleDeg?: number; // undefined means Center Core Sphere
  linkedCluster?: SphereClusterId;
  trialIdToFix?: string;
}

// Live inter-agent dialogue snippets for each sphere
const NODE_AGENT_DIALOGUES: Record<string, { speaker: AgentId; listener: AgentId; text: string }> = {
  NODE_ROOT_SOLVENCY: {
    speaker: 'CFO',
    listener: 'CEO',
    text: 'Finn to Nova: Our P&L shows +$14,773 operating profit, but $31,950 in mortgage principal and $9,200 in roof CapEx drain actual bank cash to -$13,057 YTD.',
  },
  NODE_REVENUE: {
    speaker: 'PRICING',
    listener: 'PROPERTY',
    text: 'Pippa to Pia: SM-101 carries the portfolio at 81.7% occupancy, while SM-202 sits empty 78% of the year due to its $692 ADR price barrier.',
  },
  NODE_OPEX: {
    speaker: 'COO',
    listener: 'CLEANING',
    text: 'Ollie to Toby & Manny: Two variable vendor lines—Cleaning ($29.8k YTD) and Repairs ($26.8k YTD)—consume 38% of all operating expenses.',
  },
  NODE_CAPEX_DRAIN: {
    speaker: 'MAINT',
    listener: 'CFO',
    text: 'Manny to Finn: I separated the $9,200 April roof replacement (TX-001823) from P&L repairs so EBITDA is never distorted by capital outflows.',
  },
  NODE_PRICE_WALL: {
    speaker: 'PRICING',
    listener: 'CLEANING',
    text: 'Pippa to Toby: A 4-night stay at SM-202 costs $3,030, scaring off families and leaving 75% 1-night stays. Let’s enforce a 2-night minimum and a $515 rate for 3+ night families!',
  },
  NODE_CLEAN_DRAG: {
    speaker: 'CLEANING',
    listener: 'PRICING',
    text: 'Toby to Pippa: Peninsula Sparkle took 40.5% of SM-303 revenue across 173 turns! Enforcing 2-night weekends + a $212 corporate bundle cuts turns by 30%.',
  },
  NODE_REPAIRS_BLEED: {
    speaker: 'MAINT',
    listener: 'COO',
    text: 'Manny to Ollie: Peninsula Property Repairs billed $5,400 for a roof repair just 30 days after our $9,200 roof CapEx! Issuing warranty audit & $350/mo retainer cap.',
  },
  UNIT_101: {
    speaker: 'PRICING',
    listener: 'CFO',
    text: 'Pippa to Finn: SM-101 is our turnkey cash cow (+$26,436 YTD net cash). Our Tier-1 +4.5% Tue–Thu rate lift ($308/nt) is already generating +$310/mo.',
  },
  UNIT_202: {
    speaker: 'MAINT',
    listener: 'PRICING',
    text: 'Manny & Pippa: Combining Trial #1 (3+ night family rate: +$2,438/mo) and Escalation #1 (vendor warranty clawback: +$1,550/mo) heals SM-202.',
  },
  UNIT_303: {
    speaker: 'CLEANING',
    listener: 'CFO',
    text: 'Toby to Finn: Stopping 1-night weekend churn flips SM-303 from -$269/mo cash burn to +$385/mo positive net cash after its $850 mortgage principal.',
  },
};

export const CausalNetworkCanvas: React.FC<CausalNetworkCanvasProps> = ({
  nodes,
  selectedNodeId,
  selectedAgentId,
  onSelectNode,
  onSelectAgent,
  activeTrialIds,
  onAuthorizeTrial,
}) => {
  const [activeCluster, setActiveCluster] = useState<SphereClusterId>('MACRO');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const allNodesMap = new Map<string, CausalNode>();
  nodes.forEach((n) => allNodesMap.set(n.id, n));

  // Define the spherical orbital layouts for each zoom level so spheres NEVER overlap
  const CLUSTER_CONFIGS: Record<
    SphereClusterId,
    {
      title: string;
      subtitle: string;
      centerNode: OrbitalNodeSpec;
      satellites: OrbitalNodeSpec[];
    }
  > = {
    MACRO: {
      title: 'Holistic Business Sphere (Macro View)',
      subtitle: 'Click any outer sphere to zoom into its P&L line items and property units',
      centerNode: {
        id: 'NODE_ROOT_SOLVENCY',
        shortLabel: 'Portfolio Cash Solvency',
      },
      satellites: [
        {
          id: 'NODE_REVENUE',
          shortLabel: 'Gross Revenue',
          angleDeg: 215,
          linkedCluster: 'REVENUE_CLUSTER',
        },
        {
          id: 'NODE_CAPEX_DRAIN',
          shortLabel: 'Debt & CapEx',
          angleDeg: 325,
          linkedCluster: 'CAPEX_CLUSTER',
        },
        {
          id: 'NODE_OPEX',
          shortLabel: 'Operating Expenses',
          angleDeg: 145,
          linkedCluster: 'OPEX_CLUSTER',
        },
        {
          id: 'NODE_PRICE_WALL',
          shortLabel: '1-Night Price Wall',
          angleDeg: 270,
          linkedCluster: 'REVENUE_CLUSTER',
          trialIdToFix: 'TRIAL_1',
        },
        {
          id: 'NODE_CLEAN_DRAG',
          shortLabel: 'Cleaning Turn Drag',
          angleDeg: 90,
          linkedCluster: 'OPEX_CLUSTER',
          trialIdToFix: 'TRIAL_2',
        },
        {
          id: 'NODE_REPAIRS_BLEED',
          shortLabel: 'Repairs & Warranty',
          angleDeg: 35,
          linkedCluster: 'OPEX_CLUSTER',
          trialIdToFix: 'TRIAL_3',
        },
      ],
    },
    REVENUE_CLUSTER: {
      title: 'Revenue & Price Elasticity Sphere',
      subtitle: 'Zoomed into booking volume, stay-length elasticity, and unit occupancy',
      centerNode: {
        id: 'NODE_REVENUE',
        shortLabel: 'Gross Revenue',
      },
      satellites: [
        {
          id: 'NODE_PRICE_WALL',
          shortLabel: '1-Night Price Wall',
          angleDeg: 270,
          trialIdToFix: 'TRIAL_1',
        },
        {
          id: 'UNIT_101',
          shortLabel: 'SM-101 Central Park',
          angleDeg: 195,
        },
        {
          id: 'UNIT_202',
          shortLabel: 'SM-202 Baywood',
          angleDeg: 345,
          trialIdToFix: 'TRIAL_1',
        },
        {
          id: 'UNIT_303',
          shortLabel: 'SM-303 Shoreview',
          angleDeg: 90,
          trialIdToFix: 'TRIAL_2',
        },
      ],
    },
    OPEX_CLUSTER: {
      title: 'Operating Expense & Vendor Sphere',
      subtitle: 'Zoomed into cleaning turnover drag and 88-year-old corrective repair bleed',
      centerNode: {
        id: 'NODE_OPEX',
        shortLabel: 'Operating Expenses',
      },
      satellites: [
        {
          id: 'NODE_REPAIRS_BLEED',
          shortLabel: 'Repairs & Warranty',
          angleDeg: 270,
          trialIdToFix: 'TRIAL_3',
        },
        {
          id: 'NODE_CLEAN_DRAG',
          shortLabel: 'Cleaning Turn Drag',
          angleDeg: 180,
          trialIdToFix: 'TRIAL_2',
        },
        {
          id: 'UNIT_202',
          shortLabel: 'SM-202 Baywood',
          angleDeg: 0,
          trialIdToFix: 'TRIAL_3',
        },
        {
          id: 'UNIT_303',
          shortLabel: 'SM-303 Shoreview',
          angleDeg: 90,
          trialIdToFix: 'TRIAL_2',
        },
      ],
    },
    CAPEX_CLUSTER: {
      title: 'Debt Service & Capital Outflow Sphere',
      subtitle: 'Zoomed into non-P&L mortgage principal and capitalized roof replacement',
      centerNode: {
        id: 'NODE_CAPEX_DRAIN',
        shortLabel: 'Debt & CapEx',
      },
      satellites: [
        {
          id: 'NODE_ROOT_SOLVENCY',
          shortLabel: 'Portfolio Solvency',
          angleDeg: 270,
        },
        {
          id: 'NODE_REPAIRS_BLEED',
          shortLabel: 'Roof CapEx Overlap',
          angleDeg: 195,
          trialIdToFix: 'TRIAL_3',
        },
        {
          id: 'UNIT_202',
          shortLabel: 'SM-202 ($1,450 Prin)',
          angleDeg: 345,
          trialIdToFix: 'TRIAL_1',
        },
        {
          id: 'UNIT_101',
          shortLabel: 'SM-101 ($1,250 Prin)',
          angleDeg: 90,
        },
      ],
    },
    UNITS_CLUSTER: {
      title: 'Property Cohorts Comparison Sphere',
      subtitle: 'Scalable cohort clustering across SM-101 (Cash Cow), SM-202 (Distressed), and SM-303 (Turnover)',
      centerNode: {
        id: 'NODE_ROOT_SOLVENCY',
        shortLabel: 'Portfolio Cash Flow',
      },
      satellites: [
        {
          id: 'UNIT_101',
          shortLabel: 'SM-101 Cash Cow',
          angleDeg: 210,
        },
        {
          id: 'UNIT_202',
          shortLabel: 'SM-202 Baywood',
          angleDeg: 330,
          trialIdToFix: 'TRIAL_1',
        },
        {
          id: 'UNIT_303',
          shortLabel: 'SM-303 Shoreview',
          angleDeg: 90,
          trialIdToFix: 'TRIAL_2',
        },
      ],
    },
  };

  const currentCluster = CLUSTER_CONFIGS[activeCluster];
  const inspectedId = hoveredId || selectedNodeId || currentCluster.centerNode.id;
  const inspectedNode =
    allNodesMap.get(inspectedId) ||
    allNodesMap.get(currentCluster.centerNode.id) ||
    nodes[0];

  const dialogue = NODE_AGENT_DIALOGUES[inspectedNode.id] || NODE_AGENT_DIALOGUES['NODE_ROOT_SOLVENCY'];
  const activeAgent = selectedAgentId
    ? CARTOON_AGENTS.find((a) => a.id === selectedAgentId)
    : null;

  const handleSphereClick = (spec: OrbitalNodeSpec, isCenter: boolean) => {
    onSelectNode(spec.id);
    if (!isCenter && spec.linkedCluster && activeCluster === 'MACRO') {
      setActiveCluster(spec.linkedCluster);
    }
  };

  // Radial position helper (returns x%, y% inside the 560x560 orbital square)
  const getCoordinates = (angleDeg?: number) => {
    if (angleDeg === undefined) return { x: 50, y: 50 };
    const rad = (angleDeg * Math.PI) / 180;
    const radiusPct = 35; // 35% of container guarantees generous separation from center & edges
    return {
      x: 50 + radiusPct * Math.cos(rad),
      y: 50 + radiusPct * Math.sin(rad),
    };
  };

  const renderSphereOrb = (spec: OrbitalNodeSpec, isCenter: boolean) => {
    const node = allNodesMap.get(spec.id);
    if (!node) return null;

    const coords = getCoordinates(spec.angleDeg);
    const isSelected = inspectedNode.id === node.id;
    const isHighlightedByAgent =
      activeAgent && activeAgent.focusedNodeIds.includes(node.id);

    const isCritical = node.status === 'critical';
    const isWarning = node.status === 'warning';

    const sphereGradient = isCritical
      ? 'bg-gradient-to-br from-white via-red-50/90 to-rose-100/90 border-red-500 text-slate-900 shadow-red-500/15'
      : isWarning
      ? 'bg-gradient-to-br from-white via-amber-50/90 to-orange-100/80 border-amber-500 text-slate-900 shadow-amber-500/15'
      : 'bg-gradient-to-br from-white via-teal-50/90 to-indigo-100/80 border-[#00C4B4] text-slate-900 shadow-teal-500/15';

    const metricColor = isCritical
      ? 'text-red-600'
      : isWarning
      ? 'text-amber-700'
      : 'text-emerald-700';

    const sizeClasses = isCenter
      ? 'w-40 h-40 sm:w-44 sm:h-44 p-4'
      : 'w-32 h-32 sm:w-36 sm:h-36 p-3';

    return (
      <div
        key={`${activeCluster}-${spec.id}`}
        onClick={() => handleSphereClick(spec, isCenter)}
        onMouseEnter={() => setHoveredId(spec.id)}
        onMouseLeave={() => setHoveredId(null)}
        style={{
          left: `${coords.x}%`,
          top: `${coords.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
        className={`absolute rounded-full border-2 shadow-xl transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center select-none ${sizeClasses} ${sphereGradient} ${
          isSelected
            ? 'ring-4 ring-[#2563EB]/40 scale-108 z-30'
            : isHighlightedByAgent
            ? 'ring-3 ring-indigo-400/50 scale-105 z-20'
            : 'hover:scale-105 z-10'
        }`}
      >
        {/* Top Status Indicator */}
        <div className="mb-1 flex items-center justify-center">
          {isCritical ? (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          ) : isWarning ? (
            <TrendingDown className="w-4 h-4 text-amber-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
        </div>

        {/* Clean Uncut Sphere Label */}
        <div className="text-xs sm:text-[13px] font-bold text-slate-900 leading-tight px-1">
          {spec.shortLabel}
        </div>

        {/* Key Metric in Tabular Monospace */}
        <div className={`text-xs sm:text-sm font-extrabold font-mono tabular-nums mt-1 leading-none ${metricColor}`}>
          {node.metric.replace(' YTD Net Cash', '').replace(' Net Cash Burn', '').replace(' Net Cash', '')}
        </div>

        {/* Zoom Affordance Hint if Outer Sphere in Macro Mode */}
        {!isCenter && spec.linkedCluster && activeCluster === 'MACRO' && (
          <span className="mt-1.5 text-[10px] font-semibold text-indigo-700 flex items-center gap-0.5">
            <ZoomIn className="w-3 h-3" />
            <span>Zoom</span>
          </span>
        )}

        {/* Assigned Editorial Human Agents Perched on Bottom Rim */}
        <div className="absolute -bottom-2.5 flex items-center -space-x-2 bg-white px-1.5 py-0.5 rounded-full border border-slate-200 shadow-xs">
          {node.involvedAgentIds.slice(0, 2).map((agId) => {
            const ag = CARTOON_AGENTS.find((a) => a.id === agId);
            if (!ag) return null;
            return (
              <div
                key={agId}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAgent(agId);
                }}
                className="hover:scale-120 transition-transform"
                title={`${ag.name} (${ag.role})`}
              >
                <CartoonAgentAvatar type={ag.avatarSvgType} size="sm" />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
      {/* TOP NAVIGATION BAR FOR SPHERE ZOOM LEVELS */}
      <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {activeCluster !== 'MACRO' && (
            <button
              onClick={() => setActiveCluster('MACRO')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Zoom Out to Core Sphere</span>
            </button>
          )}
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {currentCluster.title}
            </h3>
            <p className="text-xs text-slate-500">
              {currentCluster.subtitle}
            </p>
          </div>
        </div>

        {/* Segmented Sphere Section Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl overflow-x-auto">
          {(
            [
              { id: 'MACRO', label: 'Holistic Sphere' },
              { id: 'REVENUE_CLUSTER', label: 'Revenue & Yield' },
              { id: 'OPEX_CLUSTER', label: 'OpEx & Repairs' },
              { id: 'CAPEX_CLUSTER', label: 'Debt & CapEx' },
              { id: 'UNITS_CLUSTER', label: '3 Property Units' },
            ] as Array<{ id: SphereClusterId; label: string }>
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCluster(tab.id);
                onSelectNode(CLUSTER_CONFIGS[tab.id].centerNode.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeCluster === tab.id
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN 2-COLUMN WORKSPACE: LEFT ORBITAL SPHERE + RIGHT FULL-TEXT INSPECTOR (Zero Overlap!) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* LEFT 7 COLUMNS: RADIAL SPHERE VISUALIZATION */}
        <div className="lg:col-span-7 relative h-[500px] sm:h-[540px] bg-canvas-grid-light overflow-hidden flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200">
          {/* Soft Gemini Radial Glow in Center */}
          <div className="pointer-events-none absolute w-80 h-80 rounded-full bg-gradient-to-tr from-[#2563EB]/10 via-[#7C3AED]/10 to-[#00D4B2]/15 blur-2xl" />

          {/* SVG Orbital Rings & Radial Connectors */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Outer Orbital Track Circle */}
            <circle
              cx="50%"
              cy="50%"
              r="35%"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.5"
              strokeDasharray="6 6"
            />
            {/* Inner Subtle Aura Ring */}
            <circle
              cx="50%"
              cy="50%"
              r="18%"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="1"
            />

            {/* Radial Spokes from Center Sphere to Each Satellite Sphere */}
            {currentCluster.satellites.map((sat) => {
              const satNode = allNodesMap.get(sat.id);
              if (!satNode) return null;
              const coords = getCoordinates(sat.angleDeg);
              const isCritical = satNode.status === 'critical';
              const isWarning = satNode.status === 'warning';
              const isSelected = inspectedNode.id === sat.id;

              const strokeColor = isSelected
                ? '#2563EB'
                : isCritical
                ? '#DC2626'
                : isWarning
                ? '#D97706'
                : '#00C4B4';

              return (
                <g key={`spoke-${sat.id}`}>
                  <line
                    x1="50%"
                    y1="50%"
                    x2={`${coords.x}%`}
                    y2={`${coords.y}%`}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? 5 : 3}
                    opacity={isSelected ? 0.25 : 0.15}
                  />
                  <line
                    x1="50%"
                    y1="50%"
                    x2={`${coords.x}%`}
                    y2={`${coords.y}%`}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? 2.8 : 2}
                    className={
                      isCritical
                        ? 'animated-dash-critical'
                        : 'animated-dash-gemini'
                    }
                  />
                </g>
              );
            })}
          </svg>

          {/* HTML SPHERE NODES */}
          <div className="relative w-full h-full z-10">
            {/* Center Core Sphere */}
            {renderSphereOrb(currentCluster.centerNode, true)}

            {/* Orbiting Satellite Spheres */}
            {currentCluster.satellites.map((sat) => renderSphereOrb(sat, false))}
          </div>

          {/* Bottom Legend Bar */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-500 pointer-events-none">
            <span>Click any outer sphere to zoom in · Hover or click to read full details on right</span>
          </div>
        </div>

        {/* RIGHT 5 COLUMNS: DEDICATED FULL-TEXT SPHERE INSPECTOR (No Truncation, Full Clarity!) */}
        <div className="lg:col-span-5 p-6 bg-white flex flex-col justify-between gap-5">
          <div className="space-y-5">
            {/* Selected Sphere Header */}
            <div className="pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-indigo-600">
                  {inspectedNode.categoryBadge}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    inspectedNode.status === 'critical'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : inspectedNode.status === 'warning'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {inspectedNode.status === 'critical'
                    ? 'Critical Cash Bleed'
                    : inspectedNode.status === 'warning'
                    ? 'Margin Friction'
                    : 'Healthy / Healed'}
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {inspectedNode.title}
              </h2>

              <div className="mt-3 flex items-baseline gap-3">
                <span
                  className={`text-2xl font-extrabold font-mono tabular-nums ${
                    inspectedNode.status === 'critical'
                      ? 'text-red-600'
                      : inspectedNode.status === 'warning'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {inspectedNode.metric}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {inspectedNode.subMetric.replace('Click to Zoom Units 🔎', '')}
                </span>
              </div>
            </div>

            {/* Complete Uncut Diagnostic Explanation */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900">
                01. What We Are Seeing in the General Ledger
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                {inspectedNode.description}
              </p>
            </div>

            {/* Key Financial Drivers List (Full Wrapping Text) */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900">
                02. Verified Line-Item Drivers
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {inspectedNode.keyDrivers.map((driver, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="font-mono font-bold text-indigo-600 shrink-0">
                      ·
                    </span>
                    <span>{driver}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Live Inter-Agent Conversation Bubble on This Sphere */}
            {dialogue && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-teal-50/60 border border-indigo-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center -space-x-2">
                      <CartoonAgentAvatar
                        type={
                          CARTOON_AGENTS.find((a) => a.id === dialogue.speaker)
                            ?.avatarSvgType || 'ceo'
                        }
                        size="sm"
                      />
                      <CartoonAgentAvatar
                        type={
                          CARTOON_AGENTS.find((a) => a.id === dialogue.listener)
                            ?.avatarSvgType || 'cfo'
                        }
                        size="sm"
                      />
                    </div>
                    <span className="text-xs font-bold text-indigo-900">
                      Live Agent Dialogue
                    </span>
                  </div>
                  <GeminiStarNode variant="blue" size="sm" />
                </div>

                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  "{dialogue.text}"
                </p>
              </div>
            )}
          </div>

          {/* Bottom Action Bar inside Inspector */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            {/* Responsible Agents Quick Click */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Assigned Peers:</span>
              <div className="flex items-center gap-1.5">
                {inspectedNode.involvedAgentIds.map((agId) => {
                  const ag = CARTOON_AGENTS.find((a) => a.id === agId);
                  if (!ag) return null;
                  return (
                    <button
                      key={agId}
                      onClick={() => onSelectAgent(agId)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {ag.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direct Trial Fix Button if Node Has an Associated Trial */}
            {onAuthorizeTrial &&
              (inspectedNode.id === 'NODE_PRICE_WALL' ||
                inspectedNode.id === 'UNIT_202' ||
                inspectedNode.id === 'NODE_CLEAN_DRAG' ||
                inspectedNode.id === 'UNIT_303' ||
                inspectedNode.id === 'NODE_REPAIRS_BLEED') && (
                <button
                  onClick={() => {
                    const trialId =
                      inspectedNode.id === 'NODE_CLEAN_DRAG' ||
                      inspectedNode.id === 'UNIT_303'
                        ? 'TRIAL_2'
                        : inspectedNode.id === 'NODE_REPAIRS_BLEED'
                        ? 'TRIAL_3'
                        : 'TRIAL_1';
                    onAuthorizeTrial(trialId);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Toggle Trial Remedy</span>
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
