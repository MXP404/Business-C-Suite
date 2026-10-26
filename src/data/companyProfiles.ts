import { AgentId } from '../types';

export type CompanyProfileId =
  | 'NEW_ROASTERY_SMB'
  | 'NEW_LOGISTICS_SMB'
  | 'SAN_MATEO_STR'
  | 'CUSTOM_SMB';

export interface CompanyUnitMeta {
  id: 'UNIT_A' | 'UNIT_B' | 'UNIT_C';
  code: string;
  name: string;
  shortName: string;
  cohortLabel: string;
  primaryRevLabel: string;
  secondaryRevLabel: string;
  primaryRev: number;
  secondaryRev: number;
  utilizationLabel: string;
  avgTicketLabel: string;
  turnMetricLabel: string;
  color: string;
  principalOutflow: number;
  capexOutflow: number;
  trial1Lift?: number;
  trial2Lift?: number;
}

export interface CompanyExpenseItem {
  id: string;
  shortLabel: string;
  fullLabel: string;
  group: 'COGS' | 'OPEX';
  color: string;
  agentId: AgentId;
  values: {
    UNIT_A: number;
    UNIT_B: number;
    UNIT_C: number;
  };
  agentNote: string;
  trialFixId?: string;
}

export interface CompanyProfileConfig {
  id: CompanyProfileId;
  companyName: string;
  industryTag: string;
  statementTitle: string;
  subtitle: string;
  units: Record<'UNIT_A' | 'UNIT_B' | 'UNIT_C', CompanyUnitMeta>;
  expenses: CompanyExpenseItem[];
}

export const COMPANY_PROFILES: Record<CompanyProfileId, CompanyProfileConfig> = {
  // =========================================================================
  // 1. NEW COMPANY PREVIEW: BAY AREA ARTISANAL ROASTERS & CAFES (3 LOCATIONS)
  // =========================================================================
  NEW_ROASTERY_SMB: {
    id: 'NEW_ROASTERY_SMB',
    companyName: 'Peninsula Artisanal Roasters & Cafes LLC',
    industryTag: 'New Company Preview · Specialty F&B & Wholesale Roastery',
    statementTitle: 'Peninsula Roasters & Cafes FY26 P&L Income Statement',
    subtitle:
      'New Company Layout Preview · COGS (top) → Operational Expenses (middle) → Net Income (bottom)',
    units: {
      UNIT_A: {
        id: 'UNIT_A',
        code: 'CAFE-101',
        name: 'CAFE-101 Burlingame Ave Flagship',
        shortName: 'Burlingame Cafe',
        cohortLabel: 'Cohort A · High-Margin Flagship',
        primaryRevLabel: 'In-Store Beverage & Pastry Sales',
        secondaryRevLabel: 'Beans & Merch Retail',
        primaryRev: 142500,
        secondaryRev: 24800,
        utilizationLabel: '88% Peak Cap',
        avgTicketLabel: '$14.80 Avg Ticket',
        turnMetricLabel: '410 Orders/Day',
        color: '#2563EB',
        principalOutflow: 14000,
        capexOutflow: 0,
      },
      UNIT_B: {
        id: 'UNIT_B',
        code: 'ROAST-202',
        name: 'ROAST-202 San Carlos Roastery & B2B',
        shortName: 'San Carlos Roastery',
        cohortLabel: 'Cohort B · Distressed Equipment & B2B Under-Priced',
        primaryRevLabel: 'Wholesale B2B Bean Contracts',
        secondaryRevLabel: 'Tasting Room & Cold Brew Kegs',
        primaryRev: 98400,
        secondaryRev: 19200,
        utilizationLabel: '39% Roaster Util',
        avgTicketLabel: '$11.20/lb Wholesale',
        turnMetricLabel: '68 Small Batches',
        color: '#7C3AED',
        principalOutflow: 18500,
        capexOutflow: 14200,
        trial1Lift: 24500,
      },
      UNIT_C: {
        id: 'UNIT_C',
        code: 'KIOSK-303',
        name: 'KIOSK-303 Caltrain Commuter Express',
        shortName: 'Caltrain Kiosk',
        cohortLabel: 'Cohort C · Delivery App Fee & Rush Overtime Trap',
        primaryRevLabel: 'Counter & Mobile Pre-Order',
        secondaryRevLabel: '3rd-Party Delivery Apps',
        primaryRev: 74200,
        secondaryRev: 31900,
        utilizationLabel: '64% Daily Util',
        avgTicketLabel: '$8.90 Avg Ticket',
        turnMetricLabel: '58% App Orders',
        color: '#00C4B4',
        principalOutflow: 9500,
        capexOutflow: 0,
        trial2Lift: 9800,
      },
    },
    expenses: [
      // COGS (Gemini Violet Spectrum — Sorted Largest to Smallest dynamically)
      {
        id: 'EXP_CLEANING',
        shortLabel: 'Shift & Rush Labor',
        fullLabel: 'COGS · Barista, Roaster & Overtime Shift Labor',
        group: 'COGS',
        color: '#6D28D9',
        agentId: 'CLEANING',
        values: { UNIT_A: 34200, UNIT_B: 31800, UNIT_C: 36400 },
        agentNote:
          'Toby (Fulfillment & Shift Ops): -$102,400 YTD. Unbatched small-lot roasting on ROAST-202 and single-drink delivery rushes on KIOSK-303 inflated overtime labor to 34% of KIOSK revenue!',
        trialFixId: 'TRIAL_2',
      },
      {
        id: 'EXP_UTIL_LAND',
        shortLabel: 'Green Beans & Dairy',
        fullLabel: 'COGS · Specialty Green Coffee, Organic Oat/Dairy & Pastry Inputs',
        group: 'COGS',
        color: '#7C3AED',
        agentId: 'PROPERTY',
        values: { UNIT_A: 31500, UNIT_B: 29400, UNIT_C: 21800 },
        agentNote:
          'Pia (Unit Strategist): -$82,700 YTD raw ingredient COGS. Wholesale B2B contracts at ROAST-202 were priced at $11.20/lb despite a 22% jump in Arabica green bean landed cost.',
        trialFixId: 'TRIAL_1',
      },
      {
        id: 'EXP_REPAIRS',
        shortLabel: 'Equipment Repairs',
        fullLabel: 'COGS · Loring Roaster & La Marzocco Espresso Emergency Repairs',
        group: 'COGS',
        color: '#8B5CF6',
        agentId: 'MAINT',
        values: { UNIT_A: 3400, UNIT_B: 24600, UNIT_C: 5800 },
        agentNote:
          'Manny (Maint & CapEx): ROAST-202 bled -$24,600 in emergency afterburner & boiler calls on top of a -$14,200 drum CapEx—same vendor double-billed calibration 3 weeks later!',
        trialFixId: 'TRIAL_3',
      },
      {
        id: 'EXP_SUPPLIES',
        shortLabel: 'Cups & Packaging',
        fullLabel: 'COGS · Compostable Cups, Valve Bags & Cold Brew Packaging',
        group: 'COGS',
        color: '#A855F7',
        agentId: 'CLEANING',
        values: { UNIT_A: 8900, UNIT_B: 7400, UNIT_C: 9600 },
        agentNote:
          'Toby (Fulfillment Ops): -$25,900 YTD packaging burn. Individual 1-drink delivery orders on KIOSK-303 consume $1.15 in bags/carriers per $8.90 order.',
        trialFixId: 'TRIAL_1',
      },
      // OPERATIONAL EXPENSES (Gemini Cobalt Spectrum — Sorted Largest to Smallest dynamically)
      {
        id: 'EXP_TAX_INS',
        shortLabel: 'Commercial Lease',
        fullLabel: 'OpEx · Retail & Industrial Facility Rent, NNN CAM & Insurance',
        group: 'OPEX',
        color: '#1D4ED8',
        agentId: 'CFO',
        values: { UNIT_A: 26500, UNIT_B: 24000, UNIT_C: 14500 },
        agentNote:
          'Finn (CFO): Fixed occupancy & liability insurance (-$65,000 YTD). ROAST-202 industrial lease requires at least 65% roaster utilization to amortize fixed facility overhead.',
      },
      {
        id: 'EXP_INTEREST',
        shortLabel: 'SBA Debt Int.',
        fullLabel: 'OpEx · SBA 7(a) Equipment & Buildout Loan Interest',
        group: 'OPEX',
        color: '#2563EB',
        agentId: 'CFO',
        values: { UNIT_A: 11200, UNIT_B: 15800, UNIT_C: 7900 },
        agentNote:
          'Finn (CFO): -$34,900 YTD loan interest on the P&L, plus -$42,000 in non-P&L SBA loan principal draining cash directly from the operating bank account.',
      },
      {
        id: 'EXP_PLATFORM',
        shortLabel: 'App & POS Fees',
        fullLabel: 'OpEx · 3rd-Party Delivery Commissions (28%) & POS Processing',
        group: 'OPEX',
        color: '#3B82F6',
        agentId: 'PRICING',
        values: { UNIT_A: 5800, UNIT_B: 3100, UNIT_C: 11400 },
        agentNote:
          'Pippa (Pricing): -$20,300 YTD. On KIOSK-303, 28% delivery app commissions swallow nearly all margin on single-item latte orders under $15.',
        trialFixId: 'TRIAL_2',
      },
      {
        id: 'EXP_DEPRECIATION',
        shortLabel: 'Depreciation',
        fullLabel: 'OpEx · Roaster, Espresso & Leasehold Depreciation (Non-Cash)',
        group: 'OPEX',
        color: '#0EA5E9',
        agentId: 'CFO',
        values: { UNIT_A: 6400, UNIT_B: 8900, UNIT_C: 4200 },
        agentNote:
          'Finn (CFO): -$19,500 YTD non-cash depreciation deducted for P&L Net Income and added back when reconciling actual Bank Net Cash Flow.',
      },
    ],
  },

  // =========================================================================
  // 2. NEW COMPANY PREVIEW: PENINSULA EV FLEET & LAST-MILE LOGISTICS
  // =========================================================================
  NEW_LOGISTICS_SMB: {
    id: 'NEW_LOGISTICS_SMB',
    companyName: 'Peninsula Velocity EV Logistics LLC',
    industryTag: 'New Company Preview · Commercial Fleet & Cold-Chain B2B',
    statementTitle: 'Peninsula EV Logistics FY26 P&L Income Statement',
    subtitle:
      'New Company Layout Preview · COGS (top) → Operational Expenses (middle) → Net Income (bottom)',
    units: {
      UNIT_A: {
        id: 'UNIT_A',
        code: 'HUB-SFO',
        name: 'HUB-SFO Biopharma & Cold-Chain Route',
        shortName: 'SFO Cold-Chain',
        cohortLabel: 'Cohort A · High-Yield Contract Anchor',
        primaryRevLabel: 'Dedicated B2B Route Retainers',
        secondaryRevLabel: 'Cold-Chain Surcharges',
        primaryRev: 185000,
        secondaryRev: 34000,
        utilizationLabel: '86% Van Load',
        avgTicketLabel: '$410/Route Stop',
        turnMetricLabel: '4.8 Stops/Run',
        color: '#2563EB',
        principalOutflow: 19000,
        capexOutflow: 0,
      },
      UNIT_B: {
        id: 'UNIT_B',
        code: 'HUB-SV',
        name: 'HUB-SV Silicon Valley Heavy Freight',
        shortName: 'SV Heavy Hub',
        cohortLabel: 'Cohort B · Aging Diesel/Hybrid Maintenance Bleed',
        primaryRevLabel: 'Commercial Pallet & Hardware Runs',
        secondaryRevLabel: 'Same-Day Rush Dispatch',
        primaryRev: 112000,
        secondaryRev: 21500,
        utilizationLabel: '34% Backhaul Util',
        avgTicketLabel: '$295/Dispatch',
        turnMetricLabel: '68% Empty Return',
        color: '#7C3AED',
        principalOutflow: 22000,
        capexOutflow: 16500,
        trial1Lift: 28400,
      },
      UNIT_C: {
        id: 'UNIT_C',
        code: 'HUB-EB',
        name: 'HUB-EB East Bay E-Commerce Last-Mile',
        shortName: 'East Bay Last-Mile',
        cohortLabel: 'Cohort C · High-Stop Parcel Churn Trap',
        primaryRevLabel: 'Per-Parcel Drop Revenue',
        secondaryRevLabel: 'Weekend Peak Surcharges',
        primaryRev: 94000,
        secondaryRev: 26800,
        utilizationLabel: '58% Route Density',
        avgTicketLabel: '$4.40/Parcel',
        turnMetricLabel: '142 Stops/Van',
        color: '#00C4B4',
        principalOutflow: 13500,
        capexOutflow: 0,
        trial2Lift: 11200,
      },
    },
    expenses: [
      {
        id: 'EXP_CLEANING',
        shortLabel: 'Driver Wages',
        fullLabel: 'COGS · Route Driver Wages, Overtime & Dispatch Crew',
        group: 'COGS',
        color: '#6D28D9',
        agentId: 'CLEANING',
        values: { UNIT_A: 52000, UNIT_B: 46500, UNIT_C: 49800 },
        agentNote:
          'Toby (Route & Shift Ops): -$148,300 YTD. Unbatched single-parcel residential drops in East Bay force 18 hours/week of driver overtime.',
        trialFixId: 'TRIAL_2',
      },
      {
        id: 'EXP_REPAIRS',
        shortLabel: 'Fleet Repairs',
        fullLabel: 'COGS · Fleet Suspension, Inverter & Tire Maintenance',
        group: 'COGS',
        color: '#7C3AED',
        agentId: 'MAINT',
        values: { UNIT_A: 8400, UNIT_B: 34200, UNIT_C: 11600 },
        agentNote:
          'Manny (Fleet Maint): HUB-SV aging box trucks bled -$34,200 in roadside repairs plus -$16,500 inverter CapEx. Capped preventive fleet SLA saves +$1,550/mo.',
        trialFixId: 'TRIAL_3',
      },
      {
        id: 'EXP_UTIL_LAND',
        shortLabel: 'EV Power & Fuel',
        fullLabel: 'COGS · Peak DC Fast-Charging, Diesel & Bridge Tolls',
        group: 'COGS',
        color: '#8B5CF6',
        agentId: 'PROPERTY',
        values: { UNIT_A: 14200, UNIT_B: 19800, UNIT_C: 15400 },
        agentNote:
          'Pia (Hub Manager): -$49,400 YTD energy cost. Shifting HUB-SV charging from 5pm peak PG&E rates to overnight off-peak cuts kWh cost by 42%.',
      },
      {
        id: 'EXP_SUPPLIES',
        shortLabel: 'Cold-Pack & Gear',
        fullLabel: 'COGS · Dry Ice, Thermal Liners, Pallets & Scanner Consumables',
        group: 'COGS',
        color: '#A855F7',
        agentId: 'CLEANING',
        values: { UNIT_A: 9200, UNIT_B: 5400, UNIT_C: 6100 },
        agentNote:
          'Toby (Ops): -$20,700 YTD thermal packaging & pallet consumables.',
        trialFixId: 'TRIAL_1',
      },
      {
        id: 'EXP_INTEREST',
        shortLabel: 'Fleet Loan Int.',
        fullLabel: 'OpEx · Commercial Vehicle Financing Interest (P&L)',
        group: 'OPEX',
        color: '#1D4ED8',
        agentId: 'CFO',
        values: { UNIT_A: 16500, UNIT_B: 19200, UNIT_C: 14100 },
        agentNote:
          'Finn (CFO): -$49,800 YTD vehicle loan interest on P&L, plus -$54,500 in balance-sheet principal payments.',
      },
      {
        id: 'EXP_TAX_INS',
        shortLabel: 'Depot & Fleet Ins.',
        fullLabel: 'OpEx · Commercial Auto Liability, Cargo Insurance & Depot Lease',
        group: 'OPEX',
        color: '#2563EB',
        agentId: 'CFO',
        values: { UNIT_A: 15800, UNIT_B: 17400, UNIT_C: 12900 },
        agentNote:
          'Finn (CFO): -$46,100 YTD commercial fleet insurance & yard lease.',
      },
      {
        id: 'EXP_DEPRECIATION',
        shortLabel: 'Depreciation',
        fullLabel: 'OpEx · Commercial EV & Box Truck Depreciation (Non-Cash)',
        group: 'OPEX',
        color: '#3B82F6',
        agentId: 'CFO',
        values: { UNIT_A: 11000, UNIT_B: 12500, UNIT_C: 8500 },
        agentNote:
          'Finn (CFO): -$32,000 YTD non-cash vehicle depreciation.',
      },
      {
        id: 'EXP_PLATFORM',
        shortLabel: 'Telematics SaaS',
        fullLabel: 'OpEx · Route Optimization AI, Telematics & Freight Broker Fees',
        group: 'OPEX',
        color: '#0EA5E9',
        agentId: 'PRICING',
        values: { UNIT_A: 4800, UNIT_B: 6200, UNIT_C: 5100 },
        agentNote:
          'Pippa (Pricing): -$16,100 YTD dispatch software & broker commissions.',
      },
    ],
  },

  // =========================================================================
  // 3. SAN MATEO 3-PROPERTY AIRBNB BENCHMARK (ORIGINAL)
  // =========================================================================
  SAN_MATEO_STR: {
    id: 'SAN_MATEO_STR',
    companyName: 'San Mateo Short-Term Stays LLC',
    industryTag: 'Original Benchmark · 3-Property Short-Term Rental Portfolio',
    statementTitle: 'San Mateo Portfolio FY26 P&L Income Statement',
    subtitle:
      'P&L Hierarchy: COGS (top) → Operational Expenses (middle) → Net Income (bottom), sorted from largest negative cost at top to smallest',
    units: {
      UNIT_A: {
        id: 'UNIT_A',
        code: 'SM-101',
        name: 'SM-101 Central Park Luxe (2BR)',
        shortName: 'SM-101 Central',
        cohortLabel: 'Cohort A · Turnkey Cash Cow',
        primaryRevLabel: 'Booking Revenue',
        secondaryRevLabel: 'Cleaning Fees',
        primaryRev: 68911,
        secondaryRev: 8855,
        utilizationLabel: '81.7% Occ',
        avgTicketLabel: '$313.25 ADR',
        turnMetricLabel: '4.54 Nts/Stay',
        color: '#2563EB',
        principalOutflow: 11250,
        capexOutflow: 0,
      },
      UNIT_B: {
        id: 'UNIT_B',
        code: 'SM-202',
        name: 'SM-202 Baywood Heritage (4BR)',
        shortName: 'SM-202 Baywood',
        cohortLabel: 'Cohort B · Distressed Vintage',
        primaryRevLabel: 'Booking Revenue',
        secondaryRevLabel: 'Cleaning Fees',
        primaryRev: 41579,
        secondaryRev: 12470,
        utilizationLabel: '22.0% Occ',
        avgTicketLabel: '$692.94 ADR',
        turnMetricLabel: '1.25 Nts/Stay',
        color: '#7C3AED',
        principalOutflow: 13050,
        capexOutflow: 9200,
        trial1Lift: 17892,
      },
      UNIT_C: {
        id: 'UNIT_C',
        code: 'SM-303',
        name: 'SM-303 Shoreview Bungalow (3BR)',
        shortName: 'SM-303 Shoreview',
        cohortLabel: 'Cohort C · Turnover Trap',
        primaryRevLabel: 'Booking Revenue',
        secondaryRevLabel: 'Cleaning Fees',
        primaryRev: 32766,
        secondaryRev: 13471,
        utilizationLabel: '48.7% Occ',
        avgTicketLabel: '$246.36 ADR',
        turnMetricLabel: '1.80 Nts/Stay',
        color: '#00C4B4',
        principalOutflow: 7650,
        capexOutflow: 0,
        trial2Lift: 2200,
      },
    },
    expenses: [
      {
        id: 'EXP_CLEANING',
        shortLabel: 'Cleaning',
        fullLabel: 'COGS · Cleaning Crew (Peninsula Sparkle)',
        group: 'COGS',
        color: '#6D28D9',
        agentId: 'CLEANING',
        values: { UNIT_A: 8845, UNIT_B: 8915, UNIT_C: 12075 },
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
        values: { UNIT_A: 1620, UNIT_B: 20385, UNIT_C: 4767 },
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
        values: { UNIT_A: 4050, UNIT_B: 6480, UNIT_C: 4290 },
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
        values: { UNIT_A: 2600, UNIT_B: 3080, UNIT_C: 1960 },
        agentNote:
          'Toby (Cleaning): Direct guest consumables, toiletries, and linen replacement (-$7,640 YTD). High 1-night turnover inflates per-stay consumable burn.',
        trialFixId: 'TRIAL_1',
      },
      {
        id: 'EXP_INTEREST',
        shortLabel: 'Mortgage Int.',
        fullLabel: 'OpEx · Mortgage Interest (P&L Financing Cost)',
        group: 'OPEX',
        color: '#1D4ED8',
        agentId: 'CFO',
        values: { UNIT_A: 12150, UNIT_B: 14400, UNIT_C: 11700 },
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
        values: { UNIT_A: 7650, UNIT_B: 10440, UNIT_C: 6060 },
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
        values: { UNIT_A: 4500, UNIT_B: 5580, UNIT_C: 3240 },
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
        values: { UNIT_A: 3164, UNIT_B: 2749, UNIT_C: 2579 },
        agentNote:
          'Pippa (Pricing): 3.5% host channel fee plus dynamic pricing & PMS software (-$8,492 YTD across the 3 properties).',
      },
    ],
  },

  // =========================================================================
  // 4. CUSTOM COMPANY BUILDER PLACEHOLDER (DYNAMICALLY EDITABLE BY USER)
  // =========================================================================
  CUSTOM_SMB: {
    id: 'CUSTOM_SMB',
    companyName: 'Apex Modular Wellness Studios LLC',
    industryTag: 'Custom Company Preview · Paste Any Business from Parallel Session',
    statementTitle: 'Apex Wellness Studios FY26 P&L Income Statement',
    subtitle:
      'Custom Company Preview · Click "Customize / Paste Company" to load any business model',
    units: {
      UNIT_A: {
        id: 'UNIT_A',
        code: 'STUDIO-01',
        name: 'STUDIO-01 Downtown Flagship Club',
        shortName: 'Downtown Flagship',
        cohortLabel: 'Cohort A · Recurring Membership Anchor',
        primaryRevLabel: 'Monthly Memberships',
        secondaryRevLabel: '1-on-1 Recovery Sessions',
        primaryRev: 158000,
        secondaryRev: 32000,
        utilizationLabel: '84% Class Cap',
        avgTicketLabel: '$229/mo Member',
        turnMetricLabel: '92% Retention',
        color: '#2563EB',
        principalOutflow: 15000,
        capexOutflow: 0,
      },
      UNIT_B: {
        id: 'UNIT_B',
        code: 'STUDIO-02',
        name: 'STUDIO-02 Westside Thermal & Spa',
        shortName: 'Westside Thermal',
        cohortLabel: 'Cohort B · High Chiller/Sauna Upkeep & Drop-In Churn',
        primaryRevLabel: 'Day-Pass & Drop-In Revenue',
        secondaryRevLabel: 'Private Suite Bookings',
        primaryRev: 92000,
        secondaryRev: 24500,
        utilizationLabel: '31% Weekday Util',
        avgTicketLabel: '$85 Drop-In',
        turnMetricLabel: '71% 1-Time Guests',
        color: '#7C3AED',
        principalOutflow: 19500,
        capexOutflow: 12800,
        trial1Lift: 26200,
      },
      UNIT_C: {
        id: 'UNIT_C',
        code: 'STUDIO-03',
        name: 'STUDIO-03 Corporate & Pop-Up Annex',
        shortName: 'Corporate Annex',
        cohortLabel: 'Cohort C · Aggregator Commission & Laundry Drag',
        primaryRevLabel: 'ClassPass & Aggregator Drops',
        secondaryRevLabel: 'Corporate Wellness Packs',
        primaryRev: 68000,
        secondaryRev: 27400,
        utilizationLabel: '54% Studio Util',
        avgTicketLabel: '$24 Net/Visit',
        turnMetricLabel: '64% Aggregator',
        color: '#00C4B4',
        principalOutflow: 10200,
        capexOutflow: 0,
        trial2Lift: 10400,
      },
    },
    expenses: [
      {
        id: 'EXP_CLEANING',
        shortLabel: 'Instructor & Turn',
        fullLabel: 'COGS · Instructor Payroll, Towel Laundry & Suite Sanitization',
        group: 'COGS',
        color: '#6D28D9',
        agentId: 'CLEANING',
        values: { UNIT_A: 38000, UNIT_B: 34500, UNIT_C: 31200 },
        agentNote:
          'Toby (Turn & Sanitization): -$103,700 YTD. High single-visit aggregator churn on STUDIO-03 spikes linen & sanitization cost per guest.',
        trialFixId: 'TRIAL_2',
      },
      {
        id: 'EXP_REPAIRS',
        shortLabel: 'Chiller & Sauna',
        fullLabel: 'COGS · Cold-Plunge Chiller, Infrared Sauna & HVAC Repairs',
        group: 'COGS',
        color: '#7C3AED',
        agentId: 'MAINT',
        values: { UNIT_A: 4200, UNIT_B: 26800, UNIT_C: 6100 },
        agentNote:
          'Manny (Maint & CapEx): STUDIO-02 absorbed -$26,800 in emergency chiller/plumbing repairs plus -$12,800 CapEx.',
        trialFixId: 'TRIAL_3',
      },
      {
        id: 'EXP_UTIL_LAND',
        shortLabel: 'Power & Water',
        fullLabel: 'COGS · High-Load Commercial Power, Steam Water & Filtration',
        group: 'COGS',
        color: '#8B5CF6',
        agentId: 'PROPERTY',
        values: { UNIT_A: 12400, UNIT_B: 18900, UNIT_C: 9800 },
        agentNote:
          'Pia (Studio Ops): -$41,100 YTD commercial utilities across the 3 studios.',
      },
      {
        id: 'EXP_SUPPLIES',
        shortLabel: 'Amenities',
        fullLabel: 'COGS · Locker Room Botanicals, Electrolytes & Linen Replacements',
        group: 'COGS',
        color: '#A855F7',
        agentId: 'CLEANING',
        values: { UNIT_A: 7800, UNIT_B: 8400, UNIT_C: 6900 },
        agentNote:
          'Toby (Ops): -$23,100 YTD guest recovery consumables.',
        trialFixId: 'TRIAL_1',
      },
      {
        id: 'EXP_TAX_INS',
        shortLabel: 'Studio Lease',
        fullLabel: 'OpEx · Commercial Studio Leases, Property Tax & Liability Insurance',
        group: 'OPEX',
        color: '#1D4ED8',
        agentId: 'CFO',
        values: { UNIT_A: 28000, UNIT_B: 26500, UNIT_C: 18500 },
        agentNote:
          'Finn (CFO): -$73,000 YTD fixed retail lease & liability insurance.',
      },
      {
        id: 'EXP_INTEREST',
        shortLabel: 'Buildout Int.',
        fullLabel: 'OpEx · Equipment & Tenant Improvement Debt Interest',
        group: 'OPEX',
        color: '#2563EB',
        agentId: 'CFO',
        values: { UNIT_A: 13200, UNIT_B: 16800, UNIT_C: 9400 },
        agentNote:
          'Finn (CFO): -$39,400 YTD P&L debt interest, plus -$44,700 non-P&L loan principal.',
      },
      {
        id: 'EXP_DEPRECIATION',
        shortLabel: 'Depreciation',
        fullLabel: 'OpEx · Leasehold Buildout & Recovery Tech Depreciation',
        group: 'OPEX',
        color: '#3B82F6',
        agentId: 'CFO',
        values: { UNIT_A: 7500, UNIT_B: 9200, UNIT_C: 5100 },
        agentNote:
          'Finn (CFO): -$21,800 YTD non-cash depreciation.',
      },
      {
        id: 'EXP_PLATFORM',
        shortLabel: 'Aggregator Fees',
        fullLabel: 'OpEx · ClassPass/Aggregator Payout Haircuts & Booking SaaS',
        group: 'OPEX',
        color: '#0EA5E9',
        agentId: 'PRICING',
        values: { UNIT_A: 4900, UNIT_B: 5400, UNIT_C: 9600 },
        agentNote:
          'Pippa (Pricing): -$19,900 YTD booking software & aggregator commission drag.',
      },
    ],
  },
};
