import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  badge?: string | React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function CollapsibleSection({
  title,
  subtitle,
  icon,
  defaultExpanded = true,
  badge,
  action,
  children,
  className = ''
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  return (
    <div className={`bg-[#0b111a] border border-cyan-500/20 rounded-xl overflow-hidden shadow-lg transition-all duration-200 ${className}`}>
      {/* Header bar - Always visible, clickable to toggle */}
      <div 
        onClick={() => setIsExpanded(prev => !prev)}
        className="px-4 py-3 bg-[#0a1019]/90 backdrop-blur border-b border-slate-800/80 flex items-center justify-between cursor-pointer select-none group hover:bg-[#0d1522] transition"
      >
        <div className="flex items-center gap-2.5 truncate">
          {icon && (
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 group-hover:scale-105 transition shrink-0">
              {icon}
            </div>
          )}
          <div className="truncate">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider truncate">
                {title}
              </h3>
              {badge && <div className="shrink-0">{badge}</div>}
            </div>
            {subtitle && (
              <div className="text-[11px] text-slate-400 truncate font-sans">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
          {action}
          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs font-mono"
            title={isExpanded ? 'Plegar sección (Ahorrar CPU / 0% recursos)' : 'Expandir sección'}
          >
            <span className="text-[10px] hidden sm:inline text-slate-400">
              {isExpanded ? 'Plegado [0 CPU]' : 'Expandido'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-cyan-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Content Body - Unmounted entirely when collapsed to save CPU & boost FPS to 60+ */}
      {isExpanded ? (
        <div className="p-4 sm:p-5 animate-in fade-in duration-150">
          {children}
        </div>
      ) : (
        <div className="px-4 py-2.5 bg-[#070b12]/50 text-[11px] font-mono text-slate-500 flex items-center justify-between">
          <span className="italic">Sección plegada en modo de ahorro de recursos (0% uso de CPU / FPS optimizado).</span>
          <button
            onClick={() => setIsExpanded(true)}
            className="text-cyan-400 hover:underline font-bold"
          >
            [Expandir]
          </button>
        </div>
      )}
    </div>
  );
}
