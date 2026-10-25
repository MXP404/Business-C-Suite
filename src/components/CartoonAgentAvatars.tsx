import React from 'react';
import { CartoonAgent } from '../types';

interface AvatarProps {
  type: CartoonAgent['avatarSvgType'] | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBotBadge?: boolean;
}

/**
 * Sleek AI Companion Bot icon directly inspired by the white-and-cobalt
 * robot in the user's reference illustration.
 */
export const GeminiBotCompanion: React.FC<{ size?: 'xs' | 'sm' | 'md'; className?: string }> = ({
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-5 h-5',
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
  };
  return (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden shrink-0 shadow-sm border border-indigo-200 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center ${className}`}
      title="Gemini Autonomous Sub-Agent Companion"
    >
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <defs>
          <linearGradient id="botBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B5BDB" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="32" fill="url(#botBg)" />
        {/* Antennae */}
        <line x1="22" y1="14" x2="20" y2="8" stroke="#67E8F9" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="20" cy="7" r="2" fill="#00D4B2" />
        <line x1="42" y1="14" x2="44" y2="8" stroke="#67E8F9" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="44" cy="7" r="2" fill="#00D4B2" />
        {/* Sleek White Robot Head Helmet */}
        <rect x="14" y="13" width="36" height="24" rx="12" fill="#FFFFFF" />
        <rect x="16" y="15" width="32" height="20" rx="10" fill="#E0F2FE" />
        {/* Dark Visor Screen */}
        <rect x="19" y="18" width="26" height="14" rx="7" fill="#0F172A" />
        {/* Friendly Glowing Cyan Eyes & Smile inside Visor */}
        <circle cx="26" cy="24" r="2" fill="#38BDF8" />
        <circle cx="38" cy="24" r="2" fill="#38BDF8" />
        <path d="M28 28 Q32 31 36 28" stroke="#38BDF8" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Neck & Torso */}
        <rect x="28" y="37" width="8" height="4" fill="#93C5FD" />
        <path d="M18 64 C18 44, 46 44, 46 64 Z" fill="#FFFFFF" />
        <ellipse cx="32" cy="53" rx="8" ry="7" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1.5" />
        {/* Arms */}
        <path d="M18 46 Q10 52 14 60" stroke="#93C5FD" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M46 46 Q54 42 52 34" stroke="#93C5FD" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
};

/**
 * Four-Point Gemini Star Node (matching the blue and white circular star nodes in the reference image)
 */
export const GeminiStarNode: React.FC<{
  variant?: 'blue' | 'white' | 'teal' | 'violet';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}> = ({ variant = 'blue', size = 'md', pulse = false }) => {
  const sizeCls = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const bgCls =
    variant === 'blue'
      ? 'bg-[#3B5BDB] text-white border-[#2563EB]'
      : variant === 'teal'
      ? 'bg-[#00C4B4] text-white border-[#0D9488]'
      : variant === 'violet'
      ? 'bg-[#7C3AED] text-white border-[#6D28D9]'
      : 'bg-white text-[#3B5BDB] border-indigo-200';

  return (
    <div
      className={`${sizeCls} ${bgCls} rounded-full border-2 shadow-md flex items-center justify-center shrink-0 transition-transform ${
        pulse ? 'scale-110 ring-4 ring-indigo-500/20' : ''
      }`}
    >
      <svg viewBox="0 0 24 24" className="w-3/5 h-3/5 fill-current">
        <path d="M12 2 C12.8 8.2 15.8 11.2 22 12 C15.8 12.8 12.8 15.8 12 22 C11.2 15.8 8.2 12.8 2 12 C8.2 11.2 11.2 8.2 12 2 Z" />
      </svg>
    </div>
  );
};

/**
 * Editorial Human Portrait Avatars directly inspired by the vector human profiles
 * in the user's reference image (blonde ponytail strategist, silver-bearded CFO in suit,
 * dark-haired operations leads, and modern executive silhouettes).
 */
export const CartoonAgentAvatar: React.FC<AvatarProps> = ({
  type,
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const containerClass = `${sizeMap[size]} relative shrink-0 rounded-full overflow-hidden shadow-sm border-2 border-white select-none ${className}`;

  switch (type.toLowerCase()) {
    case 'pricing':
      // Inspired by the blonde high-ponytail woman in soft lavender/lilac from the reference image
      return (
        <div className={containerClass} title="Pippa • Pricing & Yield Strategist">
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle cx="40" cy="40" r="40" fill="#F3E8FF" />
            {/* High Ponytail Hair (Back) */}
            <path d="M44 20 C62 16, 70 34, 64 52 C58 46, 54 34, 46 28 Z" fill="#FDE68A" />
            {/* Neck & Shoulders (Lavender Turtleneck like reference image) */}
            <path d="M16 80 C18 58, 60 58, 62 80 Z" fill="#A855F7" />
            <rect x="33" y="46" width="12" height="14" rx="4" fill="#FDBA74" />
            <path d="M31 54 L47 54 L49 62 L29 62 Z" fill="#9333EA" />
            {/* Editorial Side/3-Quarter Human Head Profile */}
            <path d="M24 34 C24 22, 46 22, 46 36 C46 46, 38 52, 30 50 C25 48, 24 42, 22 39 L20 38 L24 34 Z" fill="#FDBA74" />
            {/* Sculpted Blonde Hair Front */}
            <path d="M25 26 C32 18, 48 20, 48 34 C44 30, 36 28, 26 32 Z" fill="#FEF08A" />
            {/* Ear & Minimalist Stud */}
            <circle cx="43" cy="39" r="3.5" fill="#FDBA74" />
            <circle cx="43" cy="41" r="1.5" fill="#06B6D4" />
            {/* Calm Editorial Eye & Brow */}
            <path d="M27 33 Q31 31 34 33" stroke="#92400E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <circle cx="30" cy="36" r="1.6" fill="#0F172A" />
            <path d="M27 44 Q31 46 34 44" stroke="#C2410C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'cfo':
      // Directly inspired by the bearded silver-haired gentleman in a navy suit & tie in the cyan circle of the reference image
      return (
        <div className={containerClass} title="Finn • CFO Ledger Lead">
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle cx="40" cy="40" r="40" fill="#CFFAFE" />
            <circle cx="40" cy="40" r="36" fill="#22D3EE" opacity="0.25" />
            {/* Navy Suit & Crisp Shirt & Tie */}
            <path d="M18 80 C20 56, 62 56, 64 80 Z" fill="#1E293B" />
            <polygon points="34,54 44,54 38,78 30,78" fill="#FFFFFF" />
            <polygon points="35,56 39,56 36,78 32,78" fill="#0F172A" />
            {/* Neck & Head in Profile */}
            <rect x="34" y="44" width="13" height="14" fill="#F9A8D4" opacity="0" />
            <path d="M34 45 L46 45 L46 57 L34 57 Z" fill="#FDBA74" />
            <path d="M24 32 C24 20, 48 20, 48 36 C48 46, 40 52, 30 50 L24 32 Z" fill="#FDBA74" />
            {/* Nose profile */}
            <path d="M24 34 L20 40 L25 42 Z" fill="#FDBA74" />
            {/* Silver Hair & Full Trimmed Beard (exact match to reference) */}
            <path d="M26 24 C26 16, 52 16, 52 34 C52 40, 48 44, 45 44 C45 34, 38 28, 26 28 Z" fill="#F1F5F9" />
            <path d="M23 42 C23 50, 34 53, 40 48 C40 44, 34 43, 25 42 Z" fill="#F1F5F9" />
            {/* Eye & Brow */}
            <path d="M26 32 Q30 30 33 32" stroke="#64748B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <circle cx="29" cy="35" r="1.6" fill="#0F172A" />
          </svg>
        </div>
      );

    case 'cleaning':
      // Inspired by the woman with dark curly bun and bright cobalt shirt in the reference image
      return (
        <div className={containerClass} title="Toby • Turnover & Fulfillment Lead">
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle cx="40" cy="40" r="40" fill="#E0E7FF" />
            {/* Dark Textured Bun (Back) */}
            <circle cx="56" cy="26" r="10" fill="#1E293B" />
            <circle cx="60" cy="22" r="6" fill="#0F172A" />
            <circle cx="58" cy="31" r="6" fill="#0F172A" />
            {/* Bright Cobalt Top */}
            <path d="M16 80 C18 58, 60 58, 62 80 Z" fill="#2563EB" />
            {/* Warm Brown Skin Tone Neck & Profile */}
            <rect x="33" y="45" width="12" height="15" rx="4" fill="#B45309" />
            <path d="M24 34 C24 22, 46 22, 46 36 C46 46, 38 52, 30 50 C25 48, 23 43, 21 39 L24 34 Z" fill="#B45309" />
            {/* Nose */}
            <path d="M24 35 L20 40 L25 42 Z" fill="#B45309" />
            {/* Sculpted Dark Hair */}
            <path d="M26 25 C32 18, 49 20, 49 36 C44 30, 35 28, 26 32 Z" fill="#0F172A" />
            {/* Ear & Gold Hoop */}
            <circle cx="42" cy="40" r="3" fill="#B45309" />
            <circle cx="42" cy="43" r="2.5" stroke="#FBBF24" strokeWidth="1.5" fill="none" />
            {/* Eye & Warm Expression */}
            <circle cx="29" cy="36" r="1.6" fill="#0F172A" />
            <path d="M26 44 Q30 46 34 44" stroke="#78350F" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'property':
      // Inspired by the woman on the left capsule with flowing dark hair and periwinkle sweater
      return (
        <div className={containerClass} title="Pia • Portfolio Cohort Strategist">
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle cx="40" cy="40" r="40" fill="#F1F5F9" />
            {/* Flowing Dark Hair Back */}
            <path d="M20 26 C14 38, 14 54, 24 62 L44 56 L42 24 Z" fill="#1E293B" />
            {/* Periwinkle / Indigo Sweater */}
            <path d="M16 80 C18 58, 60 58, 62 80 Z" fill="#6366F1" />
            {/* Neck & Warm Terracotta Skin Tone Facing Right */}
            <rect x="34" y="45" width="12" height="15" rx="4" fill="#C2410C" />
            <path d="M32 34 C32 22, 54 22, 54 36 C54 46, 46 52, 38 50 L32 34 Z" fill="#C2410C" />
            <path d="M53 35 L58 40 L52 42 Z" fill="#C2410C" />
            {/* Hair Front Wave */}
            <path d="M28 24 C34 18, 50 20, 48 32 C42 28, 34 30, 30 38 Z" fill="#0F172A" />
            {/* Eye */}
            <circle cx="48" cy="36" r="1.6" fill="#0F172A" />
            <path d="M44 44 Q48 46 51 44" stroke="#7C2D12" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'maint':
      // Sleek human architectural engineer / asset specialist in deep teal blazer
      return (
        <div className={containerClass} title="Manny • Asset & CapEx Lead">
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle cx="40" cy="40" r="40" fill="#FFE4E6" />
            {/* Structured Teal/Slate Jacket */}
            <path d="M16 80 C18 58, 62 58, 64 80 Z" fill="#0F766E" />
            <polygon points="34,55 46,55 42,78 36,78" fill="#CCFBF1" />
            {/* Neck & Head */}
            <rect x="34" y="45" width="12" height="14" rx="4" fill="#E0A96D" />
            <path d="M25 32 C25 20, 52 20, 52 36 C52 47, 44 53, 34 52 C27 51, 25 44, 25 32 Z" fill="#E0A96D" />
            {/* Short Cropped Dark Brown Hair */}
            <path d="M25 30 C25 18, 53 18, 53 30 C48 25, 30 25, 25 30 Z" fill="#27272A" />
            {/* Modern Architectural Glasses */}
            <rect x="29" y="34" width="9" height="6" rx="2" fill="none" stroke="#0F172A" strokeWidth="1.8" />
            <rect x="41" y="34" width="9" height="6" rx="2" fill="none" stroke="#0F172A" strokeWidth="1.8" />
            <line x1="38" y1="37" x2="41" y2="37" stroke="#0F172A" strokeWidth="1.8" />
            <circle cx="33.5" cy="37" r="1.4" fill="#0F172A" />
            <circle cx="45.5" cy="37" r="1.4" fill="#0F172A" />
            {/* Confident Smile */}
            <path d="M35 45 Q40 48 44 45" stroke="#78350F" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'coo':
      // Operations Director in crisp cobalt blazer
      return (
        <div className={containerClass} title="Ollie • COO Operations Lead">
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle cx="40" cy="40" r="40" fill="#DBEAFE" />
            {/* Cobalt Blazer & White Crewneck */}
            <path d="M16 80 C18 58, 62 58, 64 80 Z" fill="#1D4ED8" />
            <circle cx="40" cy="64" r="8" fill="#FFFFFF" />
            {/* Neck & Head */}
            <rect x="34" y="45" width="12" height="14" rx="4" fill="#FDBA74" />
            <path d="M26 32 C26 20, 54 20, 54 36 C54 47, 46 53, 36 52 C28 51, 26 44, 26 32 Z" fill="#FDBA74" />
            {/* Side-parted Auburn/Chestnut Hair */}
            <path d="M25 32 C25 17, 55 17, 55 32 C48 24, 34 24, 25 32 Z" fill="#7C2D12" />
            {/* Eyes & Expression */}
            <circle cx="34" cy="37" r="1.7" fill="#0F172A" />
            <circle cx="46" cy="37" r="1.7" fill="#0F172A" />
            <path d="M35 45 Q40 48 45 45" stroke="#9A3412" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'ceo':
    default:
      // Inspired by the central executive woman in crisp white blouse with turquoise stud earring from the reference image
      return (
        <div className={containerClass} title="Nova • CEO Synthesis Lead">
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle cx="40" cy="40" r="40" fill="#E0F2FE" />
            {/* Sleek Long Dark Hair Back */}
            <path d="M22 24 C16 38, 18 58, 24 68 L52 64 L48 24 Z" fill="#1E293B" />
            {/* Crisp White/Mint Executive Blouse (like center figure in reference image) */}
            <path d="M16 80 C18 58, 60 58, 62 80 Z" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="1.5" />
            {/* Neck & Head */}
            <rect x="34" y="45" width="11" height="14" rx="4" fill="#FDBA74" />
            <path d="M28 32 C28 20, 52 20, 52 36 C52 46, 44 52, 36 50 L28 32 Z" fill="#FDBA74" />
            <path d="M51 35 L55 40 L50 42 Z" fill="#FDBA74" />
            {/* Sleek Side-Swept Hair */}
            <path d="M24 28 C28 16, 52 18, 50 31 C42 26, 32 28, 28 38 Z" fill="#0F172A" />
            {/* Signature Turquoise Circle Earring (from reference image!) */}
            <circle cx="34" cy="41" r="3" fill="#06B6D4" />
            {/* Eye & Poised Expression */}
            <circle cx="46" cy="36" r="1.6" fill="#0F172A" />
            <path d="M43 44 Q47 46 50 44" stroke="#C2410C" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      );
  }
};
