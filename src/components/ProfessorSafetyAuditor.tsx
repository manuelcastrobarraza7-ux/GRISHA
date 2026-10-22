import React, { useState } from 'react';
import { CHEMICAL_DATABASE, ChemicalReagent } from '../data/chemicals';
import { NFPADiamond } from './NFPADiamond';
import { ChemicalText } from './ChemicalLatex';
import { ShieldAlert, Truck, AlertTriangle, Search, Info, CheckCircle2, ShieldCheck, HeartPulse } from 'lucide-react';

interface ProfessorSafetyAuditorProps {
  onAskProfessor?: (query: string) => void;
}

export const ProfessorSafetyAuditor: React.FC<ProfessorSafetyAuditorProps> = ({ onAskProfessor }) => {
  const [search, setSearch] = useState('');
  const [selectedReagentId, setSelectedReagentId] = useState<string>('H2SO4');

  const selectedReagent = CHEMICAL_DATABASE.find(c => c.id === selectedReagentId) || CHEMICAL_DATABASE[0];

  const filteredReagents = CHEMICAL_DATABASE.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.formula.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.unNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#0b111a] border border-cyan-500/20 rounded-xl p-4 shadow-xl flex flex-col h-full overflow-hidden text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Auditor de Seguridad NFPA & ADR
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              Riesgos químicos, códigos de túneles y protocolos de seguridad
            </span>
          </div>
        </div>

        {onAskProfessor && selectedReagent && (
          <button
            onClick={() => onAskProfessor(`Explica las medidas de seguridad, EPP y código de túnel ADR para ${selectedReagent.nombre} (${selectedReagent.formula})`)}
            className="px-2.5 py-1 text-xs font-mono bg-slate-900 border border-slate-700 text-slate-300 hover:text-white rounded transition shadow-sm"
          >
            Preguntar al Chat
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar reactivo (ej. H2SO4, KNO3, Ácido nítrico, UN 1830)..."
          className="w-full bg-[#070b12] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 font-mono focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      {/* Quick Reagent Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 text-[11px] font-mono">
        {filteredReagents.slice(0, 10).map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedReagentId(r.id)}
            className={`px-2.5 py-1 rounded transition whitespace-nowrap flex items-center gap-1 border ${
              selectedReagentId === r.id
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <ChemicalText formula={r.formula} />
            <span className="text-[10px] opacity-75">({r.nombre})</span>
          </button>
        ))}
      </div>

      {/* Main Details Area */}
      {selectedReagent && (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          {/* Top Identity & NFPA Diamond Box */}
          <div className="bg-[#070b12] border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-4">
            <div className="shrink-0 flex flex-col items-center">
              <NFPADiamond data={selectedReagent.nfpa} size={110} />
            </div>

            <div className="flex-1 min-w-0 space-y-1.5 text-left font-mono">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-cyan-300">
                  <ChemicalText formula={selectedReagent.formula} />
                </span>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedReagent.categoria}
                </span>
                {selectedReagent.molarMass && (
                  <span className="text-[10px] text-slate-400">
                    {selectedReagent.molarMass} g/mol
                  </span>
                )}
              </div>
              <h5 className="text-xs font-bold text-white font-sans">{selectedReagent.nombre}</h5>
              <div className="text-[11px] text-slate-400 font-sans leading-relaxed">
                {selectedReagent.hazardClass}
              </div>

              {/* NFPA Quadrants Breakdown */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                <div className="p-1 rounded bg-blue-950/40 border border-blue-500/30 text-blue-300">
                  Salud: <strong>{selectedReagent.nfpa.health}/4</strong>
                </div>
                <div className="p-1 rounded bg-red-950/40 border border-red-500/30 text-red-300">
                  Inflamabilidad: <strong>{selectedReagent.nfpa.flammability}/4</strong>
                </div>
                <div className="p-1 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300">
                  Inestabilidad: <strong>{selectedReagent.nfpa.instability}/4</strong>
                </div>
                <div className="p-1 rounded bg-slate-800/80 border border-slate-700 text-slate-300">
                  Especial: <strong>{selectedReagent.nfpa.special || 'Ninguno'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ADR Logistics & Tunnel Restrictions */}
          <div className="bg-[#070b12] border border-slate-800 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Truck className="w-3.5 h-3.5" />
                <span>Normativa de Transporte ADR (Capítulo 8.6)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                Túnel: {selectedReagent.adrTunnelCode}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-500 text-[9px] uppercase block">Número ONU:</span>
                <span className="text-slate-200 font-bold">{selectedReagent.unNumber}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-500 text-[9px] uppercase block">Código Kemler:</span>
                <span className="text-slate-200 font-bold">{selectedReagent.kemlerCode}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              {selectedReagent.tunnelDescription}
            </p>
          </div>

          {/* PPE & Storage */}
          <div className="bg-[#070b12] border border-slate-800 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Equipo de Protección Individual (EPP) Obligatorio:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 font-sans pl-1">
              {selectedReagent.ppe.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 font-sans">
              <span className="text-amber-400 font-mono font-bold block mb-0.5">Incompatibilidades Críticas:</span>
              <span>{selectedReagent.storage.incompatibles.join(', ')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
