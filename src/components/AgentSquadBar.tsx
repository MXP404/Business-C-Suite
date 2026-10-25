import React from 'react';
import { CartoonAgent, AgentId } from '../types';
import { CartoonAgentAvatar, GeminiStarNode } from './CartoonAgentAvatars';
import { MessageSquareText } from 'lucide-react';

interface AgentSquadBarProps {
  agents: CartoonAgent[];
  selectedAgentId: AgentId | null;
  onSelectAgent: (agentId: AgentId) => void;
  onOpenDebate: (agent1: AgentId, agent2: AgentId) => void;
}

export const AgentSquadBar: React.FC<AgentSquadBarProps> = ({
  agents,
  selectedAgentId,
  onSelectAgent,
  onOpenDebate,
}) => {
  return (
    <div className="w-full flex items-center justify-between gap-4 overflow-x-auto py-1">
      {/* Horizontal Flat Peer Squad in Gemini Capsules */}
      <div className="flex items-center gap-2.5 overflow-x-auto py-1">
        {agents.map((agent) => {
          const isSelected = selectedAgentId === agent.id;
          return (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              className={`group relative flex items-center gap-3 px-3.5 py-2 rounded-full border transition-all duration-150 shrink-0 text-left cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-50 via-purple-50 to-teal-50 border-indigo-600 shadow-sm ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/70'
              }`}
            >
              {/* Editorial Human Portrait */}
              <CartoonAgentAvatar
                type={agent.avatarSvgType}
                size="md"
                className="transition-transform group-hover:scale-105"
              />

              {/* Clean Unboxed Metadata */}
              <div className="min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 tracking-tight whitespace-nowrap">
                    {agent.name}
                  </span>
                  <span className="text-slate-300" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-[11px] font-medium text-indigo-600 whitespace-nowrap">
                    {agent.role.split(' ')[0]}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[130px] mt-0.5">
                  {agent.nickName}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Peer Debate Trigger Button */}
      <button
        onClick={() => onOpenDebate('PRICING', 'CLEANING')}
        className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
        title="Open peer-to-peer debate between agents"
      >
        <MessageSquareText className="w-3.5 h-3.5 text-indigo-600" />
        <span>Launch Peer Debate</span>
      </button>
    </div>
  );
};
