import React, { useState, useEffect } from 'react';
import { AgentId } from '../types';
import { CARTOON_AGENTS } from '../data/portfolioData';
import {
  COMPANY_PROFILES,
  CompanyProfileId,
  CompanyProfileConfig,
} from '../data/companyProfiles';
import { CartoonAgentAvatar, GeminiStarNode } from './CartoonAgentAvatars';
import {
  ZoomIn,
  ArrowLeft,
  Check,
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Sparkles,
  Clock,
  ShieldCheck,
  Building2,
  SlidersHorizontal,
} from 'lucide-react';

export type UnitSlotId = 'ALL' | 'UNIT_A' | 'UNIT_B' | 'UNIT_C';

type ArgonMode = 'ELASTICITY' | 'KILLSWITCH' | 'SCALE_30';

interface ArgonSynthesisResponse {
  title: string;
  badge: string;
  summary: string;
  metrics: Array<{ label: string; value: string; delta: string }>;
  recommendations: string[];
}

interface SankeyFinancialFlowProps {
  activeCompanyId: CompanyProfileId;
  onSelectCompany: (companyId: CompanyProfileId) => void;
  activeTrialIds: string[];
  onToggleTrial: (trialId: string) => void;
  onSelectAgent: (agentId: AgentId) => void;
}

const formatCompactDollar = (val: number, signed = false) => {
  const abs = Math.abs(val);
  const prefix = signed ? (val >= 0 ? '+$' : '-$') : '$';
  if (abs >= 1000) {
    return `${prefix}${(abs / 1000).toFixed(1)}K`;
  }
  return `${prefix}${abs.toLocaleString()}`;
};

const formatNegativeAccounting = (val: number) => {
  const abs = Math.abs(val);
  if (abs >= 1000) {
    return `-$${(abs / 1000).toFixed(1)}K`;
  }
  return `-$${abs.toLocaleString()}`;
};

export const SankeyFinancialFlow: React.FC<SankeyFinancialFlowProps> = ({
  activeCompanyId,
  onSelectCompany,
  activeTrialIds,
  onToggleTrial,
  onSelectAgent,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<UnitSlotId>('ALL');
  const [hoveredItemId, setHoveredItemId] = useState<string>('EXP_CLEANING');

  // Custom Company quick-editor state so user can paste/rename from a parallel session
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [customCompanyName, setCustomCompanyName] = useState<string>(
    COMPANY_PROFILES.CUSTOM_SMB.companyName
  );
  const [customUnitAName, setCustomUnitAName] = useState<string>(
    COMPANY_PROFILES.CUSTOM_SMB.units.UNIT_A.name
  );
  const [customUnitBName, setCustomUnitBName] = useState<string>(
    COMPANY_PROFILES.CUSTOM_SMB.units.UNIT_B.name
  );
  const [customUnitCName, setCustomUnitCName] = useState<string>(
    COMPANY_PROFILES.CUSTOM_SMB.units.UNIT_C.name
  );

  // Build active company profile (merging custom names if CUSTOM_SMB is active)
  const baseProfile: CompanyProfileConfig =
    COMPANY_PROFILES[activeCompanyId] || COMPANY_PROFILES.NEW_ROASTERY_SMB;

  const activeProfile: CompanyProfileConfig =
    activeCompanyId === 'CUSTOM_SMB'
      ? {
          ...baseProfile,
          companyName: customCompanyName || baseProfile.companyName,
          statementTitle: `${customCompanyName || 'Custom Company'} FY26 P&L Income Statement`,
          units: {
            UNIT_A: {
              ...baseProfile.units.UNIT_A,
              name: customUnitAName || baseProfile.units.UNIT_A.name,
              shortName: (customUnitAName || 'Unit A').slice(0, 18),
            },
            UNIT_B: {
              ...baseProfile.units.UNIT_B,
              name: customUnitBName || baseProfile.units.UNIT_B.name,
              shortName: (customUnitBName || 'Unit B').slice(0, 18),
            },
            UNIT_C: {
              ...baseProfile.units.UNIT_C,
              name: customUnitCName || baseProfile.units.UNIT_C.name,
              shortName: (customUnitCName || 'Unit C').slice(0, 18),
            },
          },
        }
      : baseProfile;

  // 24-HOURS (SANDBOX) EVERY 5-MINUTES (TRUE TIME) ENGINE
  const [isSandboxRunning, setIsSandboxRunning] = useState<boolean>(true);
  const [isWarpSpeed, setIsWarpSpeed] = useState<boolean>(false);
  const [sandboxHoursElapsed, setSandboxHoursElapsed] = useState<number>(96);

  // Gemini 4 Argon Elevation state
  const [argonMode, setArgonMode] = useState<ArgonMode>('ELASTICITY');
  const [argonData, setArgonData] = useState<ArgonSynthesisResponse | null>(null);
  const [isArgonLoading, setIsArgonLoading] = useState<boolean>(false);

  const currentSandboxDay = Math.min(
    30,
    Math.max(1, Math.floor(sandboxHoursElapsed / 24) + 1)
  );
  const hourOfDay = Math.floor(sandboxHoursElapsed % 24);
  const progressWithinDayPct = Math.round(((sandboxHoursElapsed % 24) / 24) * 100);

  // Tick timer: 24 sandbox hours per 300 real seconds (0.08 sandbox hours per 1 real second)
  useEffect(() => {
    if (!isSandboxRunning) return;
    const intervalMs = 1000;
    const hoursPerTick = isWarpSpeed ? 0.8 : 24 / 300;
    const timer = setInterval(() => {
      setSandboxHoursElapsed((prev) => {
        if (prev >= 24 * 30) return 24;
        return prev + hoursPerTick;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isSandboxRunning, isWarpSpeed]);

  // Fetch Gemini 4 Argon Elevation insights
  useEffect(() => {
    let isMounted = true;
    const fetchArgonSynthesis = async () => {
      setIsArgonLoading(true);
      try {
        const res = await fetch('/api/argon-elevation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: argonMode,
            sandboxDay: currentSandboxDay,
            activeTrials: activeTrialIds,
            selectedUnit:
              selectedUnit === 'ALL'
                ? activeProfile.companyName
                : activeProfile.units[selectedUnit].name,
          }),
        });
        const data = await res.json();
        if (isMounted && data.status === 'ok') {
          setArgonData(data);
        }
      } catch {
        // Fallback handled on server
      } finally {
        if (isMounted) setIsArgonLoading(false);
      }
    };
    fetchArgonSynthesis();
    return () => {
      isMounted = false;
    };
  }, [argonMode, selectedUnit, activeTrialIds, currentSandboxDay, activeProfile.companyName]);

  const sandboxScaleFactor = Math.min(1, Math.max(0.35, currentSandboxDay / 14));

  const getUnitFinancials = (slotId: 'UNIT_A' | 'UNIT_B' | 'UNIT_C') => {
    const baseUnit = activeProfile.units[slotId];
    const t1Active = activeTrialIds.includes('TRIAL_1') && slotId === 'UNIT_B';
    const t2Active = activeTrialIds.includes('TRIAL_2') && slotId === 'UNIT_C';
    const t3Active = activeTrialIds.includes('TRIAL_3') && slotId === 'UNIT_B';

    const accommRev =
      baseUnit.primaryRev +
      (t1Active ? Math.round((baseUnit.trial1Lift || 18000) * sandboxScaleFactor) : 0) +
      (t2Active ? Math.round((baseUnit.trial2Lift || 4500) * sandboxScaleFactor) : 0);
    const cleaningFeeRev = baseUnit.secondaryRev;
    const totalRev = accommRev + cleaningFeeRev;

    const itemValues = activeProfile.expenses.map((item) => {
      let val = item.values[slotId];
      if (item.id === 'EXP_CLEANING' && t1Active)
        val = Math.max(Math.round(val * 0.65), val - Math.round(4500 * sandboxScaleFactor));
      if (item.id === 'EXP_CLEANING' && t2Active)
        val = Math.max(Math.round(val * 0.72), val - Math.round(5200 * sandboxScaleFactor));
      if (item.id === 'EXP_REPAIRS' && t3Active)
        val = Math.max(Math.round(val * 0.42), val - Math.round(14200 * sandboxScaleFactor));
      return { ...item, amount: val };
    });

    const cogsItems = itemValues.filter((i) => i.group === 'COGS');
    const opexItems = itemValues.filter((i) => i.group === 'OPEX');

    const totalCogs = cogsItems.reduce((s, i) => s + i.amount, 0);
    const totalOpex = opexItems.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = totalCogs + totalOpex;
    const depreciation =
      opexItems.find((i) => i.id === 'EXP_DEPRECIATION')?.amount || 0;

    const debtCapex = baseUnit.principalOutflow + baseUnit.capexOutflow;

    const netIncome = totalRev - totalExpenses;
    const netCash = netIncome + depreciation - debtCapex;

    return {
      slotId,
      accommRev,
      cleaningFeeRev,
      totalRev,
      totalCogs,
      totalOpex,
      totalExpenses,
      depreciation,
      debtCapex,
      netIncome,
      netCash,
      itemValues,
    };
  };

  const uA = getUnitFinancials('UNIT_A');
  const uB = getUnitFinancials('UNIT_B');
  const uC = getUnitFinancials('UNIT_C');

  const activeData =
    selectedUnit === 'UNIT_A'
      ? uA
      : selectedUnit === 'UNIT_B'
      ? uB
      : selectedUnit === 'UNIT_C'
      ? uC
      : {
          slotId: 'ALL' as const,
          accommRev: uA.accommRev + uB.accommRev + uC.accommRev,
          cleaningFeeRev:
            uA.cleaningFeeRev + uB.cleaningFeeRev + uC.cleaningFeeRev,
          totalRev: uA.totalRev + uB.totalRev + uC.totalRev,
          totalCogs: uA.totalCogs + uB.totalCogs + uC.totalCogs,
          totalOpex: uA.totalOpex + uB.totalOpex + uC.totalOpex,
          totalExpenses:
            uA.totalExpenses + uB.totalExpenses + uC.totalExpenses,
          depreciation:
            uA.depreciation + uB.depreciation + uC.depreciation,
          debtCapex: uA.debtCapex + uB.debtCapex + uC.debtCapex,
          netIncome: uA.netIncome + uB.netIncome + uC.netIncome,
          netCash: uA.netCash + uB.netCash + uC.netCash,
          itemValues: activeProfile.expenses.map((item, idx) => ({
            ...item,
            amount:
              uA.itemValues[idx].amount +
              uB.itemValues[idx].amount +
              uC.itemValues[idx].amount,
          })),
        };

  // ============================================================================
  // P&L SHEET SANKEY GEOMETRY (GEMINI BRAND COLORS):
  // Top: COGS (Largest Negative -> Smallest Negative) in Gemini Violet (#7C3AED)
  // Middle: Operational Expenses (Largest Negative -> Smallest Negative) in Gemini Cobalt (#2563EB)
  // Bottom: Net Income (Anchored at the bottom!) in Gemini Aqua Teal (#00C4B4)
  // ============================================================================
  const svgW = 1180;
  const svgH = 620;
  const barW = 18;

  const col1X = 215;
  const col2X = 435;
  const col3X = 675;
  const col4X = 915;

  const totalPnlVolume =
    activeData.totalCogs +
    activeData.totalOpex +
    Math.abs(activeData.netIncome);
  const scaleVolume = Math.max(activeData.totalRev, totalPnlVolume, 1);
  const maxBarSumPx = 280;
  const pxPerDollar = maxBarSumPx / scaleVolume;

  // COLUMN 1: Left Income Sources (Sorted Largest -> Smallest at top, in Gemini Brand Colors!)
  const rawCol1Sources =
    selectedUnit === 'ALL'
      ? [
          {
            id: 'SRC_A',
            unitFilter: 'UNIT_A' as UnitSlotId,
            label: activeProfile.units.UNIT_A.shortName,
            sub: `${activeProfile.units.UNIT_A.utilizationLabel} · ${formatCompactDollar(uA.netIncome, true)}`,
            amount: uA.totalRev,
            color: '#2563EB',
          },
          {
            id: 'SRC_B',
            unitFilter: 'UNIT_B' as UnitSlotId,
            label: activeProfile.units.UNIT_B.shortName,
            sub: `${activeProfile.units.UNIT_B.utilizationLabel} · ${formatCompactDollar(uB.netIncome, true)}`,
            amount: uB.totalRev,
            color: '#7C3AED',
          },
          {
            id: 'SRC_C',
            unitFilter: 'UNIT_C' as UnitSlotId,
            label: activeProfile.units.UNIT_C.shortName,
            sub: `${activeProfile.units.UNIT_C.utilizationLabel} · ${formatCompactDollar(uC.netIncome, true)}`,
            amount: uC.totalRev,
            color: '#00C4B4',
          },
        ]
      : [
          {
            id: 'SRC_PRIMARY',
            unitFilter: selectedUnit,
            label: activeProfile.units[selectedUnit].primaryRevLabel.slice(0, 18),
            sub: `${Math.round((activeData.accommRev / activeData.totalRev) * 100)}% of Gross`,
            amount: activeData.accommRev,
            color: '#2563EB',
          },
          {
            id: 'SRC_SECONDARY',
            unitFilter: selectedUnit,
            label: activeProfile.units[selectedUnit].secondaryRevLabel.slice(0, 18),
            sub: `${Math.round((activeData.cleaningFeeRev / activeData.totalRev) * 100)}% of Gross`,
            amount: activeData.cleaningFeeRev,
            color: '#00C4B4',
          },
        ];

  const col1Sources = [...rawCol1Sources].sort((a, b) => b.amount - a.amount);

  let c1CursorY = 120;
  const col1Rects = col1Sources.map((src) => {
    const h = Math.max(36, src.amount * pxPerDollar);
    const rect = { ...src, y: c1CursorY, h };
    c1CursorY += h + 56;
    return rect;
  });

  // COLUMN 2: Central Gross Revenue Bar
  const col2H = Math.max(125, activeData.totalRev * pxPerDollar);
  const col2Y = 155;

  // COLUMN 3: P&L Hierarchy from Top to Bottom in Gemini Brand Colors
  const netMarginPct = Math.round(
    (activeData.netIncome / Math.max(1, activeData.totalRev)) * 100
  );
  const col3Buckets = [
    {
      id: 'BUCKET_COGS',
      label: 'COGS (Direct Costs)',
      sub: `${formatNegativeAccounting(activeData.totalCogs)} · ${Math.round((activeData.totalCogs / activeData.totalRev) * 100)}% of rev`,
      amount: activeData.totalCogs,
      color: '#7C3AED',
      ribbonColor: '#C4B5FD',
    },
    {
      id: 'BUCKET_OPEX',
      label: 'Operational Expenses',
      sub: `${formatNegativeAccounting(activeData.totalOpex)} · ${Math.round((activeData.totalOpex / activeData.totalRev) * 100)}% of rev`,
      amount: activeData.totalOpex,
      color: '#2563EB',
      ribbonColor: '#93C5FD',
    },
    {
      id: 'BUCKET_NET_INCOME',
      label: activeData.netIncome >= 0 ? 'Net Income (P&L)' : 'Net Loss (P&L)',
      sub: `${formatCompactDollar(activeData.netIncome, true)} · ${netMarginPct}% margin`,
      amount: Math.abs(activeData.netIncome),
      color: activeData.netIncome >= 0 ? '#00C4B4' : '#E11D48',
      ribbonColor: activeData.netIncome >= 0 ? '#5EEAD4' : '#FDA4AF',
    },
  ];

  let c3CursorY = 100;
  const col3Rects = col3Buckets.map((b) => {
    const h = Math.max(34, b.amount * pxPerDollar);
    const rect = { ...b, y: c3CursorY, h };
    c3CursorY += h + 84;
    return rect;
  });

  // COLUMN 4 (Right):
  // Top Section: COGS items sorted from MOST EXPENSIVE (largest negative) at top to LEAST EXPENSIVE!
  // Middle Section: Operational Expenses sorted from MOST EXPENSIVE (largest negative) at top to LEAST EXPENSIVE!
  // Bottom Section: Net Income anchored at the bottom!
  const sortedCogsItems = activeData.itemValues
    .filter((i) => i.group === 'COGS' && i.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const sortedOpexItems = activeData.itemValues
    .filter((i) => i.group === 'OPEX' && i.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const orderedExpenseItems = [...sortedCogsItems, ...sortedOpexItems];

  let c4CursorY = 58;
  const itemGap = 20;
  const groupDividerGap = 28;

  const col4ExpenseRects = orderedExpenseItems.map((item, idx) => {
    const h = Math.max(18, item.amount * pxPerDollar);
    if (
      idx > 0 &&
      orderedExpenseItems[idx - 1].group === 'COGS' &&
      item.group === 'OPEX'
    ) {
      c4CursorY += groupDividerGap - itemGap;
    }
    const rect = { ...item, y: c4CursorY, h };
    c4CursorY += h + itemGap;
    return rect;
  });

  // Net Income sits cleanly at the bottom of Column 4
  const netIncomeCol3 = col3Rects[2];
  const netIncomeCol4Y = Math.max(c4CursorY + 18, netIncomeCol3.y);
  const netIncomeCol4H = netIncomeCol3.h;

  const createSankeyRibbon = (
    x0: number,
    y0: number,
    h0: number,
    x1: number,
    y1: number,
    h1: number
  ) => {
    const midX = (x0 + x1) / 2;
    return `
      M ${x0} ${y0}
      C ${midX} ${y0}, ${midX} ${y1}, ${x1} ${y1}
      L ${x1} ${y1 + h1}
      C ${midX} ${y1 + h1}, ${midX} ${y0 + h0}, ${x0} ${y0 + h0}
      Z
    `;
  };

  let col2InOffset = col2Y;
  let col2OutOffset = col2Y;
  const cogsBucketRect = col3Rects[0];
  const opexBucketRect = col3Rects[1];
  let cogsOutOffset = cogsBucketRect.y;
  let opexOutOffset = opexBucketRect.y;

  const inspectedExpense =
    activeData.itemValues.find((i) => i.id === hoveredItemId) ||
    orderedExpenseItems[0];
  const assignedAgent =
    CARTOON_AGENTS.find((a) => a.id === inspectedExpense.agentId) ||
    CARTOON_AGENTS[0];

  return (
    <div className="w-full rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
      {/* =====================================================================
          0. NEW COMPANY / CROSS-INDUSTRY SWITCHER BAR
         ===================================================================== */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#2563EB]" />
          <span className="text-xs font-extrabold text-slate-900">
            Company Layout Preview:
          </span>
          <span className="text-xs font-semibold text-[#7C3AED]">
            {activeProfile.companyName}
          </span>
          <span className="hidden md:inline-block text-[11px] text-slate-500">
            ({activeProfile.industryTag})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              {
                id: 'NEW_ROASTERY_SMB',
                label: 'New Co #1: Roasters & Cafes',
              },
              {
                id: 'NEW_LOGISTICS_SMB',
                label: 'New Co #2: EV Fleet Logistics',
              },
              {
                id: 'CUSTOM_SMB',
                label: 'New Co #3: Wellness Studios',
              },
              {
                id: 'SAN_MATEO_STR',
                label: 'Original: San Mateo Airbnb',
              },
            ] as Array<{ id: CompanyProfileId; label: string }>
          ).map((co) => (
            <button
              key={co.id}
              onClick={() => {
                onSelectCompany(co.id);
                setSelectedUnit('ALL');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeCompanyId === co.id
                  ? 'bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white shadow-2xs'
                  : 'bg-white hover:bg-indigo-50/70 text-slate-700 border border-slate-200'
              }`}
            >
              {co.label}
            </button>
          ))}

          <button
            onClick={() => {
              onSelectCompany('CUSTOM_SMB');
              setIsCustomModalOpen(!isCustomModalOpen);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#00C4B4]" />
            <span>Customize / Paste Co.</span>
          </button>
        </div>
      </div>

      {/* INLINE CUSTOM COMPANY CONFIGURER (IF OPEN) */}
      {isCustomModalOpen && (
        <div className="px-5 py-4 bg-indigo-50/60 border-b border-indigo-200/80 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
              New Company Name
            </label>
            <input
              type="text"
              value={customCompanyName}
              onChange={(e) => setCustomCompanyName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
              Division / Unit 1 (Cash Cow)
            </label>
            <input
              type="text"
              value={customUnitAName}
              onChange={(e) => setCustomUnitAName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
              Division / Unit 2 (High Upkeep)
            </label>
            <input
              type="text"
              value={customUnitBName}
              onChange={(e) => setCustomUnitBName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Division / Unit 3 (Turn Trap)
              </label>
              <input
                type="text"
                value={customUnitCName}
                onChange={(e) => setCustomUnitCName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900"
              />
            </div>
            <button
              onClick={() => setIsCustomModalOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-bold cursor-pointer shrink-0"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          1. TIME-ACCELERATED SANDBOX BAR (LIGHT GEMINI BRAND PALETTE)
         ===================================================================== */}
      <div className="px-5 py-3 bg-gradient-to-r from-indigo-50/90 via-white to-teal-50/80 text-slate-900 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-100/80 border border-indigo-200 text-[11px] font-mono font-bold text-[#2563EB]">
            <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>24h Sandbox = 5m True Time</span>
          </span>
          <div className="text-xs font-mono tabular-nums flex items-center gap-2">
            <span className="font-extrabold text-slate-900">
              Sandbox Day {currentSandboxDay} of 30
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[#7C3AED] font-bold">
              {String(hourOfDay).padStart(2, '0')}:00 hrs
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 w-28 bg-slate-200/80 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00C4B4] h-full transition-all duration-500"
              style={{ width: `${progressWithinDayPct}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsSandboxRunning(!isSandboxRunning)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
          >
            {isSandboxRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[#00C4B4]" />
                <span>Resume (24h/5m)</span>
              </>
            )}
          </button>

          <button
            onClick={() =>
              setSandboxHoursElapsed((prev) =>
                prev + 24 > 24 * 30 ? 24 : prev + 24
              )
            }
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2563EB] hover:bg-indigo-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-2xs"
            title="Advance 24 sandbox hours immediately"
          >
            <span>+24h Step</span>
          </button>

          <button
            onClick={() => setIsWarpSpeed(!isWarpSpeed)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
              isWarpSpeed
                ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="10x Warp Speed (24h every 30s)"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{isWarpSpeed ? '10x Warp ON' : '10x Warp'}</span>
          </button>

          <button
            onClick={() => setSandboxHoursElapsed(24)}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            title="Reset to Sandbox Day 1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =====================================================================
          2. UNIT FILTER TABS & PROFIT PER UNIT SCORECARDS
         ===================================================================== */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {selectedUnit !== 'ALL' && (
            <button
              onClick={() => setSelectedUnit('ALL')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Units</span>
            </button>
          )}
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {selectedUnit === 'ALL'
                ? activeProfile.statementTitle
                : `${activeProfile.units[selectedUnit].name} — Unit P&L Statement`}
            </h3>
            <p className="text-xs text-slate-500">{activeProfile.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-200/75 rounded-xl">
          {(
            [
              { id: 'ALL', label: 'All 3 Units' },
              {
                id: 'UNIT_A',
                label: activeProfile.units.UNIT_A.shortName,
              },
              {
                id: 'UNIT_B',
                label: activeProfile.units.UNIT_B.shortName,
              },
              {
                id: 'UNIT_C',
                label: activeProfile.units.UNIT_C.shortName,
              },
            ] as Array<{ id: UnitSlotId; label: string }>
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedUnit(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedUnit === tab.id
                  ? 'bg-white text-[#2563EB] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* PROFIT PER UNIT SCORECARD STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200 bg-white">
        {[
          { data: uA, meta: activeProfile.units.UNIT_A },
          { data: uB, meta: activeProfile.units.UNIT_B },
          { data: uC, meta: activeProfile.units.UNIT_C },
        ].map(({ data, meta }) => {
          const isSelected = selectedUnit === data.slotId;
          const profitMargin = Math.round(
            (data.netIncome / data.totalRev) * 100
          );
          return (
            <div
              key={data.slotId}
              onClick={() => setSelectedUnit(isSelected ? 'ALL' : data.slotId)}
              className={`p-4 transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'bg-indigo-50/50 ring-2 ring-inset ring-[#2563EB]'
                  : 'hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-900">
                    {meta.name}
                  </span>
                  <div className="text-[11px] text-slate-500">
                    {meta.cohortLabel} · {meta.utilizationLabel} ·{' '}
                    {meta.turnMetricLabel}
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#2563EB] flex items-center gap-1 shrink-0">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>{isSelected ? 'Viewing' : 'Zoom Unit'}</span>
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs font-mono tabular-nums">
                <div>
                  <div className="text-[10px] font-sans text-slate-400">Revenue</div>
                  <div className="font-bold text-slate-800">
                    {formatCompactDollar(data.totalRev)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-sans text-slate-400">COGS</div>
                  <div className="font-bold text-[#7C3AED]">
                    {formatNegativeAccounting(data.totalCogs)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-sans text-slate-400">OpEx</div>
                  <div className="font-bold text-[#2563EB]">
                    {formatNegativeAccounting(data.totalOpex)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-sans text-slate-400">
                    Net Inc ({profitMargin}%)
                  </div>
                  <div
                    className={`font-extrabold ${
                      data.netIncome >= 0 ? 'text-teal-600' : 'text-rose-600'
                    }`}
                  >
                    {formatCompactDollar(data.netIncome, true)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================================
          3. P&L-ALIGNED SANKEY DIAGRAM IN GEMINI BRAND COLORS
         ===================================================================== */}
      <div className="w-full overflow-x-auto bg-white px-4 py-6 sm:px-8">
        <div className="min-w-[960px] max-w-full mx-auto">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full h-auto select-none overflow-visible"
          >
            {/* STAGE 1 -> 2 RIBBONS (Income Sources merging into Revenue in Gemini Sky/Cobalt) */}
            {col1Rects.map((src) => {
              const targetH = (src.amount / activeData.totalRev) * col2H;
              const pathD = createSankeyRibbon(
                col1X + barW,
                src.y,
                src.h,
                col2X,
                col2InOffset,
                targetH
              );
              col2InOffset += targetH;
              return (
                <path
                  key={`rib1-${src.id}`}
                  d={pathD}
                  fill="#93C5FD"
                  fillOpacity={0.45}
                  className="hover:fill-opacity-75 transition-all cursor-pointer"
                  onClick={() => setSelectedUnit(src.unitFilter)}
                />
              );
            })}

            {/* STAGE 2 -> 3 RIBBONS (Top: Violet COGS | Middle: Cobalt OpEx | Bottom: Aqua Teal Net Income) */}
            {col3Rects.map((bucket) => {
              const srcH = Math.max(
                18,
                (bucket.amount / totalPnlVolume) * col2H
              );
              const pathD = createSankeyRibbon(
                col2X + barW,
                col2OutOffset,
                srcH,
                col3X,
                bucket.y,
                bucket.h
              );
              col2OutOffset += srcH;
              return (
                <path
                  key={`rib2-${bucket.id}`}
                  d={pathD}
                  fill={bucket.ribbonColor}
                  fillOpacity={0.65}
                />
              );
            })}

            {/* STAGE 3 -> 4 EXPENSE RIBBONS (COGS in Violet & OpEx in Cobalt, sorted Largest -> Smallest) */}
            {col4ExpenseRects.map((item) => {
              const isCogs = item.group === 'COGS';
              const parentBucket = isCogs ? cogsBucketRect : opexBucketRect;
              const parentTotal = isCogs
                ? Math.max(1, activeData.totalCogs)
                : Math.max(1, activeData.totalOpex);

              const srcH = Math.max(
                3,
                (item.amount / parentTotal) * parentBucket.h
              );
              const startY = isCogs ? cogsOutOffset : opexOutOffset;
              if (isCogs) {
                cogsOutOffset += srcH;
              } else {
                opexOutOffset += srcH;
              }

              const isHovered = hoveredItemId === item.id;
              const pathD = createSankeyRibbon(
                col3X + barW,
                startY,
                srcH,
                col4X,
                item.y,
                item.h
              );

              return (
                <path
                  key={`rib3-${item.id}`}
                  d={pathD}
                  fill={isCogs ? '#C4B5FD' : '#93C5FD'}
                  fillOpacity={isHovered ? 0.88 : 0.52}
                  stroke={isHovered ? item.color : 'none'}
                  strokeWidth={isHovered ? 1.5 : 0}
                  className="transition-all duration-150 cursor-pointer"
                  onMouseEnter={() => setHoveredItemId(item.id)}
                  onClick={() => setHoveredItemId(item.id)}
                />
              );
            })}

            {/* STAGE 3 -> 4 BOTTOM NET INCOME RIBBON (Gemini Aqua Teal anchored at bottom!) */}
            <path
              d={createSankeyRibbon(
                col3X + barW,
                netIncomeCol3.y,
                netIncomeCol3.h,
                col4X,
                netIncomeCol4Y,
                netIncomeCol4H
              )}
              fill={activeData.netIncome >= 0 ? '#5EEAD4' : '#FDA4AF'}
              fillOpacity={0.75}
            />

            {/* COLUMN 1 BARS & LEFT-SIDE LABELS */}
            {col1Rects.map((src) => (
              <g
                key={`bar1-${src.id}`}
                className="cursor-pointer"
                onClick={() => setSelectedUnit(src.unitFilter)}
              >
                <rect
                  x={col1X}
                  y={src.y}
                  width={barW}
                  height={src.h}
                  rx={4}
                  fill={src.color}
                />
                <text
                  x={col1X - 14}
                  y={src.y + src.h / 2 - 4}
                  textAnchor="end"
                  className="text-[13px] font-extrabold fill-slate-900"
                >
                  {src.label}
                </text>
                <text
                  x={col1X - 14}
                  y={src.y + src.h / 2 + 13}
                  textAnchor="end"
                  className="text-[11px] font-mono font-semibold fill-slate-600"
                >
                  {formatCompactDollar(src.amount)} · {src.sub.split('·')[0]}
                </text>
              </g>
            ))}

            {/* COLUMN 2 CENTRAL REVENUE PILLAR (Gemini Cobalt) */}
            <g>
              <text
                x={col2X + barW / 2}
                y={col2Y - 30}
                textAnchor="middle"
                className="text-[14px] font-extrabold fill-slate-900"
              >
                Revenue
              </text>
              <text
                x={col2X + barW / 2}
                y={col2Y - 12}
                textAnchor="middle"
                className="text-[13px] font-mono font-extrabold fill-[#2563EB]"
              >
                {formatCompactDollar(activeData.totalRev)}
              </text>
              <rect
                x={col2X}
                y={col2Y}
                width={barW}
                height={col2H}
                rx={4}
                fill="#1D4ED8"
              />
            </g>

            {/* COLUMN 3 P&L BUCKET BARS (1. COGS Top, 2. OpEx Mid, 3. Net Income Bottom) */}
            {col3Rects.map((bucket) => (
              <g key={`bar3-${bucket.id}`}>
                <text
                  x={col3X + barW / 2}
                  y={bucket.y - 24}
                  textAnchor="middle"
                  className={`text-[13px] font-extrabold ${
                    bucket.id === 'BUCKET_NET_INCOME'
                      ? activeData.netIncome >= 0
                        ? 'fill-teal-700'
                        : 'fill-rose-600'
                      : bucket.id === 'BUCKET_COGS'
                      ? 'fill-[#7C3AED]'
                      : 'fill-[#2563EB]'
                  }`}
                >
                  {bucket.label}
                </text>
                <text
                  x={col3X + barW / 2}
                  y={bucket.y - 8}
                  textAnchor="middle"
                  className="text-[11px] font-mono font-bold fill-slate-600"
                >
                  {bucket.sub}
                </text>
                <rect
                  x={col3X}
                  y={bucket.y}
                  width={barW}
                  height={bucket.h}
                  rx={4}
                  fill={bucket.color}
                />
              </g>
            ))}

            {/* COLUMN 4 CONDENSED EXPENSE BARS (Sorted Largest Negative at top -> Least at bottom) */}
            {col4ExpenseRects.map((item) => {
              const isHovered = hoveredItemId === item.id;
              const pctOfRev = Math.round(
                (item.amount / activeData.totalRev) * 100
              );
              return (
                <g
                  key={`bar4-${item.id}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredItemId(item.id)}
                  onClick={() => setHoveredItemId(item.id)}
                >
                  <rect
                    x={col4X}
                    y={item.y}
                    width={barW}
                    height={item.h}
                    rx={3}
                    fill={item.color}
                  />
                  <text
                    x={col4X + barW + 12}
                    y={item.y + item.h / 2 + 4}
                    textAnchor="start"
                    className={`text-[12px] ${
                      isHovered
                        ? 'font-extrabold fill-slate-950'
                        : item.group === 'COGS'
                        ? 'font-bold fill-[#6D28D9]'
                        : 'font-bold fill-[#1D4ED8]'
                    }`}
                  >
                    {item.shortLabel}{' '}
                    <tspan className="font-mono font-semibold fill-slate-600">
                      ({formatNegativeAccounting(item.amount)} · {pctOfRev}%)
                    </tspan>
                  </text>
                </g>
              );
            })}

            {/* COLUMN 4 BOTTOM NET INCOME BAR & LABEL (Gemini Aqua Teal) */}
            <g>
              <rect
                x={col4X}
                y={netIncomeCol4Y}
                width={barW}
                height={netIncomeCol4H}
                rx={4}
                fill={activeData.netIncome >= 0 ? '#00C4B4' : '#E11D48'}
              />
              <text
                x={col4X + barW + 12}
                y={netIncomeCol4Y + netIncomeCol4H / 2 - 3}
                textAnchor="start"
                className={`text-[14px] font-extrabold ${
                  activeData.netIncome >= 0
                    ? 'fill-teal-700'
                    : 'fill-rose-600'
                }`}
              >
                {activeData.netIncome >= 0 ? 'Net Income' : 'Net Loss'}{' '}
                {formatCompactDollar(activeData.netIncome, true)}
              </text>
              <text
                x={col4X + barW + 12}
                y={netIncomeCol4Y + netIncomeCol4H / 2 + 14}
                textAnchor="start"
                className="text-[11px] font-mono font-semibold fill-slate-600"
              >
                Net Cash (after Principal & CapEx):{' '}
                {formatCompactDollar(activeData.netCash, true)}
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* =====================================================================
          4. INSPECTED EXPENSE LINE-ITEM DETAIL & 1-CLICK TRIAL REMEDY
         ===================================================================== */}
      <div className="p-5 border-t border-slate-200 bg-slate-50/80 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 flex items-start gap-3.5">
          <button
            onClick={() => onSelectAgent(assignedAgent.id)}
            className="shrink-0 cursor-pointer"
          >
            <CartoonAgentAvatar type={assignedAgent.avatarSvgType} size="md" />
          </button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900">
                {inspectedExpense.shortLabel} — {inspectedExpense.fullLabel}
              </span>
              <span className="text-slate-300" aria-hidden="true">
                ·
              </span>
              <span className="text-xs font-mono font-bold text-[#7C3AED] tabular-nums">
                -${inspectedExpense.amount.toLocaleString()} YTD
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {inspectedExpense.agentNote}
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-wrap items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
            <div>
              <div className="text-[10px] font-sans text-slate-400">
                {activeProfile.units.UNIT_A.code}
              </div>
              <div className="font-bold text-[#2563EB]">
                -${uA.itemValues.find((i) => i.id === inspectedExpense.id)?.amount.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-sans text-slate-400">
                {activeProfile.units.UNIT_B.code}
              </div>
              <div className="font-bold text-[#7C3AED]">
                -${uB.itemValues.find((i) => i.id === inspectedExpense.id)?.amount.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-sans text-slate-400">
                {activeProfile.units.UNIT_C.code}
              </div>
              <div className="font-bold text-teal-600">
                -${uC.itemValues.find((i) => i.id === inspectedExpense.id)?.amount.toLocaleString()}
              </div>
            </div>
          </div>

          {inspectedExpense.trialFixId && (
            <button
              onClick={() => onToggleTrial(inspectedExpense.trialFixId!)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTrialIds.includes(inspectedExpense.trialFixId)
                  ? 'bg-[#00C4B4] text-slate-950'
                  : 'bg-[#2563EB] hover:bg-indigo-700 text-white'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>
                {activeTrialIds.includes(inspectedExpense.trialFixId)
                  ? 'Remedy Active'
                  : 'Apply Trial Fix'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* =====================================================================
          5. GEMINI 4 ARGON BUSINESS FLOW ELEVATION ENGINE
         ===================================================================== */}
      <div className="p-5 border-t border-slate-200 bg-gradient-to-r from-indigo-50/40 via-white to-teal-50/40">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <GeminiStarNode size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold text-slate-900">
                  Elevated with Gemini 4 Argon · Autonomous Flow Intelligence
                </h4>
                <span className="text-[11px] font-mono font-semibold text-[#2563EB] bg-indigo-100/80 px-2 py-0.5 rounded-md">
                  {argonData?.badge || `Day ${currentSandboxDay} Active`}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Select an elevation pillar below to see how Gemini 4 Argon stress-tests and protects {activeProfile.companyName}&apos;s P&L Sankey flows
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                {
                  id: 'ELASTICITY',
                  label: '1. Cross-Ribbon Elasticity',
                },
                {
                  id: 'KILLSWITCH',
                  label: '2. 24h/5m Kill-Switch Audit',
                },
                {
                  id: 'SCALE_30',
                  label: '3. 30-Unit Scale Simulation',
                },
              ] as Array<{ id: ArgonMode; label: string }>
            ).map((btn) => (
              <button
                key={btn.id}
                onClick={() => setArgonMode(btn.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  argonMode === btn.id
                    ? 'bg-[#2563EB] text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-indigo-50/50'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {argonData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-7 bg-white p-4 rounded-2xl border border-slate-200/90 flex flex-col justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#2563EB] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>{argonData.title}</span>
                  </span>
                  {isArgonLoading && (
                    <span className="text-[11px] font-mono text-slate-400">
                      Syncing sandbox...
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {argonData.summary}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
                {argonData.metrics.map((m, i) => (
                  <div key={i} className="bg-slate-50/80 p-2.5 rounded-xl">
                    <div className="text-[10px] text-slate-500 font-medium">
                      {m.label}
                    </div>
                    <div className="text-xs font-extrabold font-mono text-slate-900 tabular-nums mt-0.5">
                      {m.value}
                    </div>
                    <div className="text-[10px] font-mono font-semibold text-teal-600">
                      {m.delta}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-slate-200/90 flex flex-col justify-between gap-2">
              <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00C4B4]" />
                <span>Autonomous C-Suite Directives</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {argonData.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-snug">
                    <span className="font-mono font-bold text-[#2563EB] shrink-0">
                      0{idx + 1}.
                    </span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
