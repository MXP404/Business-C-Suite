export type AgentId = 'PRICING' | 'CLEANING' | 'MAINT' | 'PROPERTY' | 'CFO' | 'COO' | 'CEO';

export interface CartoonAgent {
  id: AgentId;
  name: string;
  nickName: string;
  role: string;
  discipline: string;
  reportsTo: string;
  accentColor: string;
  sparkleColor: string;
  badgeClass: string;
  avatarSvgType: 'pricing' | 'cleaning' | 'maint' | 'property' | 'cfo' | 'coo' | 'ceo';
  motto: string;
  workingOn: string;
  bottleneck: string;
  priority: string;
  opportunity: string;
  focusedNodeIds: string[];
}

export type NodeStatus = 'critical' | 'warning' | 'healthy';
export type NodeType = 'root' | 'pnl_macro' | 'line_item' | 'unit';

export interface CausalNode {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  type: NodeType;
  status: NodeStatus;
  title: string;
  metric: string;
  subMetric: string;
  categoryBadge: string;
  primaryAgentId: AgentId;
  involvedAgentIds: AgentId[];
  isDrillable?: boolean;
  propertyId?: 'SM-101' | 'SM-202' | 'SM-303';
  description: string;
  keyDrivers: string[];
  remedyAction?: string;
}

export interface CausalEdge {
  from: string;
  to: string;
  label?: string;
  isProblemFlow?: boolean;
}

export interface TrialProposal {
  id: string;
  title: string;
  targetUnit: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  tierLabel: string;
  coDesigners: AgentId[];
  durationDays: number;
  autoRevertCondition: string;
  monthlyNetCashLift: number;
  status: 'auto_applied' | 'pending_approval' | 'authorized' | 'rejected';
  rationale: string;
  parameters: string[];
  targetNodeId: string;
}

export interface PropertyCohort {
  id: 'SM-101' | 'SM-202' | 'SM-303';
  name: string;
  cohort: string;
  cohortBadge: string;
  bedsBaths: string;
  builtYear: number;
  occupancy: number;
  adr: number;
  avgStayNights: number;
  ytdRevenue: number;
  ytdProfitLoss: number;
  ytdNetCash: number;
  mortgagePrincipalMo: number;
  routineVendorExpense: string;
  hardships: string;
  primaryRemedy: string;
}
