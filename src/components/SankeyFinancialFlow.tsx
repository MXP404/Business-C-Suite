import React, { useState, useEffect } from 'react';
import { AgentId } from '../types';
import { CARTOON_AGENTS } from '../data/portfolioData';
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
} from 'lucide-react';

export type UnitFilterId = 'ALL' | 'SM-101' | 'SM-202' | 'SM-303';

interface ExpenseLineItem {
  id: string;
  shortLabel: string; // Condensed 1-2 word label so words never clip or overlap
  fullLabel: string;
  group: 'COGS' | 'OPEX';
  color: string;
  agentId: AgentId;
  values: {
    'SM-101': number;
    'SM-202': number;
    'SM-303': number;
  };
  agentNote: string;
  trialFixId?: string;
}

const EXPENSE_LINE_ITEMS: ExpenseLineItem[] = [
  // =========================================================================
  // 1. COGS (Cost of Revenue / Direct Unit Fulfillment & Upkeep) — Gemini Violet Spectrum
  // =========================================================================
  {
    id: 'EXP_CLEANING',
    shortLabel: 'Cleaning',
    fullLabel: 'COGS · Cleaning Crew (Peninsula Sparkle)',
    group: 'COGS',
    color: '#6D28D9',
    agentId: 'CLEANING',
    values: { 'SM-101': 8845, 'SM-202': 8915, 'SM-303': 12075 },
    agentNote:
      'Toby (Cleaning): -$29,835 YTD (-$73,805 over 21 mos). On SM-303, 1-night stays caused direct cleaning COGS to swallow 36.8% of accommodation revenue!',
    trialFixId: 'TRIAL_2',
  },
  {
    id: 'EXP_REPAIRS',
    shortLabel: 'Repairs',
    fullLabel: 'COGS · Direct Repairs & Maintenance',
    group: 'COGS',
    color: '#7C3AED',
    agentId: 'MAINT',
    values: { 'SM-101': 1620, 'SM-202': 20385, 'SM-303': 4767 },
    agentNote:
      'Manny (Maint): SM-202 (age 88) accounts for 76% of all direct repair COGS (-$20,385 YTD), plus -$9,200 roof CapEx and -$5,400 repeat roof billing.',
    trialFixId: 'TRIAL_3',
  },
  {
    id: 'EXP_UTIL_LAND',
    shortLabel: 'Utilities',
    fullLabel: 'COGS · Utilities, Wi-Fi & Landscaping',
    group: 'COGS',
    color: '#8B5CF6',
    agentId: 'PROPERTY',
    values: { 'SM-101': 4050, 'SM-202': 6480, 'SM-303': 4290 },
    agentNote:
      'Pia (Property): Direct unit PG&E power/gas, water/sewer, fiber internet, and yard care (-$14,820 YTD). SM-202 large lot requires -$420/mo landscaping.',
  },
  {
    id: 'EXP_SUPPLIES',
    shortLabel: 'Supplies',
    fullLabel: 'COGS · Guest Supplies, Linens & Consumables',
    group: 'COGS',
    color: '#A855F7',
    agentId: 'CLEANING',
    values: { 'SM-101': 2600, 'SM-202': 3080, 'SM-303': 1960 },
    agentNote:
      'Toby (Cleaning): Direct guest consumables, toiletries, and linen replacement (-$7,640 YTD). High 1-night turnover inflates per-stay consumable burn.',
    trialFixId: 'TRIAL_1',
  },

  // =========================================================================
  // 2. OPERATIONAL EXPENSES (Fixed OpEx, SG&A, Debt Interest, Tax & Depr.) — Gemini Cobalt/Indigo Spectrum
  // =========================================================================
  {
    id: 'EXP_INTEREST',
    shortLabel: 'Mortgage Int.',
    fullLabel: 'OpEx · Mortgage Interest (P&L Financing Cost)',
    group: 'OPEX',
    color: '#1D4ED8',
    agentId: 'CFO',
    values: { 'SM-101': 12150, 'SM-202': 14400, 'SM-303': 11700 },
    agentNote:
      'Finn (CFO): Largest Operational Expense on the P&L (-$38,250 YTD). Requires higher multi-night occupancy on SM-202 to amortize fixed debt cost.',
  },
  {
    id: 'EXP_TAX_INS',
    shortLabel: 'Tax & Ins.',
    fullLabel: 'OpEx · Property Taxes & Hazard Insurance',
    group: 'OPEX',
    color: '#2563EB',
    agentId: 'CFO',
    values: { 'SM-101': 7650, 'SM-202': 10440, 'SM-303': 6060 },
    agentNote:
      'Finn (CFO): Fixed San Mateo County property tax & hazard insurance (-$24,150 YTD). SM-202 carries -$850/mo property tax + -$310/mo vintage insurance.',
  },
  {
    id: 'EXP_DEPRECIATION',
    shortLabel: 'Depreciation',
    fullLabel: 'OpEx · Depreciation (Non-Cash P&L Expense)',
    group: 'OPEX',
    color: '#3B82F6',
    agentId: 'CFO',
    values: { 'SM-101': 4500, 'SM-202': 5580, 'SM-303': 3240 },
    agentNote:
      'Finn (CFO): Non-cash P&L depreciation (-$13,320 YTD: -$500/mo SM-101, -$620/mo SM-202, -$360/mo SM-303). Deducted for Net Income; added back for Cash Flow.',
  },
  {
    id: 'EXP_PLATFORM',
    shortLabel: 'Platform Fees',
    fullLabel: 'OpEx · Channel Commissions & PMS Software',
    group: 'OPEX',
    color: '#0EA5E9',
    agentId: 'PRICING',
    values: { 'SM-101': 3164, 'SM-202': 2749, 'SM-303': 2579 },
    agentNote:
      'Pippa (Pricing): 3.5% host channel fee plus dynamic pricing & PMS software (-$8,492 YTD across the 3 properties).',
  },
];

// Balance sheet cash outflows below Net Income (Principal + CapEx) for Cash Reconciliation
const CASH_DEBT_CAPEX: Record<'SM-101' | 'SM-202' | 'SM-303', { principal: number; capex: number }> = {
  'SM-101': { principal: 11250, capex: 0 },
  'SM-202': { principal: 13050, capex: 9200 },
  'SM-303': { principal: 7650, capex: 0 },
};

interface UnitRevenueData {
  id: 'SM-101' | 'SM-202' | 'SM-303';
  name: string;
  shortName: string;
  cohortLabel: string;
  accommRev: number;
  cleaningFeeRev: number;
  occupancy: string;
  adr: string;
  avgStay: string;
  color: string;
}

const UNIT_REVENUES: Record<'SM-101' | 'SM-202' | 'SM-303', UnitRevenueData> = {
  'SM-101': {
    id: 'SM-101',
    name: 'SM-101 Central Park Luxe (2BR)',
    shortName: 'SM-101 Central',
    cohortLabel: 'Cohort A · Turnkey Cash Cow',
    accommRev: 68911,
    cleaningFeeRev: 8855,
    occupancy: '81.7%',
    adr: '$313.25',
    avgStay: '4.54 Nts',
    color: '#2563EB',
  },
  'SM-202': {
    id: 'SM-202',
    name: 'SM-202 Baywood Heritage (4BR)',
    shortName: 'SM-202 Baywood',
    cohortLabel: 'Cohort B · Distressed Vintage',
    accommRev: 41579,
    cleaningFeeRev: 12470,
    occupancy: '22.0%',
    adr: '$692.94',
    avgStay: '1.25 Nts',
    color: '#7C3AED',
  },
  'SM-303': {
    id: 'SM-303',
    name: 'SM-303 Shoreview Bungalow (3BR)',
    shortName: 'SM-303 Shoreview',
    cohortLabel: 'Cohort C · Turnover Trap',
    accommRev: 32766,
    cleaningFeeRev: 13471,
    occupancy: '48.7%',
    adr: '$246.36',
    avgStay: '1.80 Nts',
    color: '#00C4B4',
  },
};

type ArgonMode = 'ELASTICITY' | 'KILLSWITCH' | 'SCALE_30';

interface ArgonSynthesisResponse {
  title: string;
  badge: string;
  summary: string;
  metrics: Array<{ label: string; value: string; delta: string }>;
  recommendations: string[];
}

interface SankeyFinancialFlowProps {
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
  activeTrialIds,
  onToggleTrial,
  onSelectAgent,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<UnitFilterId>('ALL');
  const [hoveredItemId, setHoveredItemId] = useState<string>('EXP_INTEREST');

  // 24-HOURS (SANDBOX) EVERY 5-MINUTES (TRUE TIME) ENGINE
  const [isSandboxRunning, setIsSandboxRunning] = useState<boolean>(true);
  const [isWarpSpeed, setIsWarpSpeed] = useState<boolean>(false);
  const [sandboxHoursElapsed, setSandboxHoursElapsed] = useState<number>(96); // Start at Day 4.0

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
            selectedUnit,
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
  }, [argonMode, selectedUnit, activeTrialIds, currentSandboxDay]);

  const sandboxScaleFactor = Math.min(1, Math.max(0.35, currentSandboxDay / 14));

  const getUnitFinancials = (unitId: 'SM-101' | 'SM-202' | 'SM-303') => {
    const baseRev = UNIT_REVENUES[unitId];
    const t1Active = activeTrialIds.includes('TRIAL_1') && unitId === 'SM-202';
    const t2Active = activeTrialIds.includes('TRIAL_2') && unitId === 'SM-303';
    const t3Active = activeTrialIds.includes('TRIAL_3') && unitId === 'SM-202';

    const accommRev =
      baseRev.accommRev +
      (t1Active ? Math.round(17892 * sandboxScaleFactor) : 0) +
      (t2Active ? Math.round(2200 * sandboxScaleFactor) : 0);
    const cleaningFeeRev = baseRev.cleaningFeeRev;
    const totalRev = accommRev + cleaningFeeRev;

    const itemValues = EXPENSE_LINE_ITEMS.map((item) => {
      let val = item.values[unitId];
      if (item.id === 'EXP_CLEANING' && t1Active)
        val = Math.max(4800, val - Math.round(4050 * sandboxScaleFactor));
      if (item.id === 'EXP_CLEANING' && t2Active)
        val = Math.max(8200, val - Math.round(3686 * sandboxScaleFactor));
      if (item.id === 'EXP_REPAIRS' && t3Active)
        val = Math.max(6435, val - Math.round(13950 * sandboxScaleFactor));
      return { ...item, amount: val };
    });

    const cogsItems = itemValues.filter((i) => i.group === 'COGS');
    const opexItems = itemValues.filter((i) => i.group === 'OPEX');

    const totalCogs = cogsItems.reduce((s, i) => s + i.amount, 0);
    const totalOpex = opexItems.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = totalCogs + totalOpex;
    const depreciation =
      opexItems.find((i) => i.id === 'EXP_DEPRECIATION')?.amount || 0;

    const debtCapex =
      CASH_DEBT_CAPEX[unitId].principal + CASH_DEBT_CAPEX[unitId].capex;

    const netIncome = totalRev - totalExpenses;
    const netCash = netIncome + depreciation - debtCapex;

    return {
      unitId,
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

  const u101 = getUnitFinancials('SM-101');
  const u202 = getUnitFinancials('SM-202');
  const u303 = getUnitFinancials('SM-303');

  const activeData =
    selectedUnit === 'SM-101'
      ? u101
      : selectedUnit === 'SM-202'
      ? u202
      : selectedUnit === 'SM-303'
      ? u303
      : {
          unitId: 'ALL' as const,
          accommRev: u101.accommRev + u202.accommRev + u303.accommRev,
          cleaningFeeRev:
            u101.cleaningFeeRev + u202.cleaningFeeRev + u303.cleaningFeeRev,
          totalRev: u101.totalRev + u202.totalRev + u303.totalRev,
          totalCogs: u101.totalCogs + u202.totalCogs + u303.totalCogs,
          totalOpex: u101.totalOpex + u202.totalOpex + u303.totalOpex,
          totalExpenses:
            u101.totalExpenses + u202.totalExpenses + u303.totalExpenses,
          depreciation:
            u101.depreciation + u202.depreciation + u303.depreciation,
          debtCapex: u101.debtCapex + u202.debtCapex + u303.debtCapex,
          netIncome: u101.netIncome + u202.netIncome + u303.netIncome,
          netCash: u101.netCash + u202.netCash + u303.netCash,
          itemValues: EXPENSE_LINE_ITEMS.map((item, idx) => ({
            ...item,
            amount:
              u101.itemValues[idx].amount +
              u202.itemValues[idx].amount +
              u303.itemValues[idx].amount,
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

  const col1X = 215; // Left Income Stream bars; labels in [10..200]
  const col2X = 435; // Central Revenue bar; label sits ABOVE bar
  const col3X = 675; // P&L Buckets: 1. COGS (Top) -> 2. OpEx (Mid) -> 3. Net Income (Bottom)
  const col4X = 915; // Right-hand Granular Line Items (Sorted Most Expensive -> Least Expensive) + Net Income at bottom

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
            id: 'SRC_101',
            unitFilter: 'SM-101' as UnitFilterId,
            label: 'SM-101 Central',
            sub: `82% Occ · ${formatCompactDollar(u101.netIncome, true)}`,
            amount: u101.totalRev,
            color: '#2563EB', // Gemini Cobalt
          },
          {
            id: 'SRC_202',
            unitFilter: 'SM-202' as UnitFilterId,
            label: 'SM-202 Baywood',
            sub: `22% Occ · ${formatCompactDollar(u202.netIncome, true)}`,
            amount: u202.totalRev,
            color: '#7C3AED', // Gemini Violet
          },
          {
            id: 'SRC_303',
            unitFilter: 'SM-303' as UnitFilterId,
            label: 'SM-303 Shoreview',
            sub: `49% Occ · ${formatCompactDollar(u303.netIncome, true)}`,
            amount: u303.totalRev,
            color: '#00C4B4', // Gemini Aqua Teal
          },
        ]
      : [
          {
            id: 'SRC_ACCOMM',
            unitFilter: selectedUnit,
            label: 'Booking Revenue',
            sub: `${Math.round((activeData.accommRev / activeData.totalRev) * 100)}% of Gross`,
            amount: activeData.accommRev,
            color: '#2563EB',
          },
          {
            id: 'SRC_CLEAN_FEE',
            unitFilter: selectedUnit,
            label: 'Cleaning Fees',
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

  // COLUMN 3: P&L Hierarchy from Top to Bottom in Gemini Brand Colors:
  // 1. COGS (Direct Costs) at Top -> Gemini Violet (#7C3AED)
  // 2. Operational Expenses in Middle -> Gemini Cobalt (#2563EB)
  // 3. Net Income at Bottom -> Gemini Aqua Teal (#00C4B4)
  const netMarginPct = Math.round(
    (activeData.netIncome / Math.max(1, activeData.totalRev)) * 100
  );
  const col3Buckets = [
    {
      id: 'BUCKET_COGS',
      label: 'COGS (Direct Costs)',
      sub: `${formatNegativeAccounting(activeData.totalCogs)} · ${Math.round((activeData.totalCogs / activeData.totalRev) * 100)}% of rev`,
      amount: activeData.totalCogs,
      color: '#7C3AED', // Gemini Violet
      ribbonColor: '#C4B5FD',
    },
    {
      id: 'BUCKET_OPEX',
      label: 'Operational Expenses',
      sub: `${formatNegativeAccounting(activeData.totalOpex)} · ${Math.round((activeData.totalOpex / activeData.totalRev) * 100)}% of rev`,
      amount: activeData.totalOpex,
      color: '#2563EB', // Gemini Cobalt
      ribbonColor: '#93C5FD',
    },
    {
      id: 'BUCKET_NET_INCOME',
      label: activeData.netIncome >= 0 ? 'Net Income (P&L)' : 'Net Loss (P&L)',
      sub: `${formatCompactDollar(activeData.netIncome, true)} · ${netMarginPct}% margin`,
      amount: Math.abs(activeData.netIncome),
      color: activeData.netIncome >= 0 ? '#00C4B4' : '#E11D48', // Gemini Aqua Teal
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
    if (idx > 0 && orderedExpenseItems[idx - 1].group === 'COGS' && item.group === 'OPEX') {
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
                ? 'San Mateo Portfolio FY26 P&L Income Statement'
                : `${UNIT_REVENUES[selectedUnit].name} FY26 P&L Income Statement`}
            </h3>
            <p className="text-xs text-slate-500">
              P&L Hierarchy: COGS (top) → Operational Expenses (middle) → Net Income (bottom), sorted from largest negative cost at top to smallest
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-200/75 rounded-xl">
          {(
            [
              { id: 'ALL', label: 'All 3 Units' },
              { id: 'SM-101', label: 'SM-101 Central' },
              { id: 'SM-202', label: 'SM-202 Baywood' },
              { id: 'SM-303', label: 'SM-303 Shoreview' },
            ] as Array<{ id: UnitFilterId; label: string }>
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
          { data: u101, meta: UNIT_REVENUES['SM-101'] },
          { data: u202, meta: UNIT_REVENUES['SM-202'] },
          { data: u303, meta: UNIT_REVENUES['SM-303'] },
        ].map(({ data, meta }) => {
          const isSelected = selectedUnit === data.unitId;
          const profitMargin = Math.round(
            (data.netIncome / data.totalRev) * 100
          );
          return (
            <div
              key={data.unitId}
              onClick={() => setSelectedUnit(isSelected ? 'ALL' : data.unitId)}
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
                    {meta.cohortLabel} · {meta.occupancy} Occ · {meta.avgStay}
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
                Net Cash (after Principal & CapEx): {formatCompactDollar(activeData.netCash, true)}
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
              <div className="text-[10px] font-sans text-slate-400">SM-101</div>
              <div className="font-bold text-[#2563EB]">
                -${u101.itemValues.find((i) => i.id === inspectedExpense.id)?.amount.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-sans text-slate-400">SM-202</div>
              <div className="font-bold text-[#7C3AED]">
                -${u202.itemValues.find((i) => i.id === inspectedExpense.id)?.amount.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-sans text-slate-400">SM-303</div>
              <div className="font-bold text-teal-600">
                -${u303.itemValues.find((i) => i.id === inspectedExpense.id)?.amount.toLocaleString()}
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
                Select an elevation pillar below to see how Gemini 4 Argon stress-tests and protects your P&L Sankey flows in real time
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
