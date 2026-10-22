import React, { useState } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import { Telescope, Compass, Orbit, Atom, Scale, Sparkles, BookOpen } from 'lucide-react';

interface ProfessorPhysicsObservatoryProps {
  onAskProfessor?: (query: string) => void;
}

export const ProfessorPhysicsObservatory: React.FC<ProfessorPhysicsObservatoryProps> = ({ onAskProfessor }) => {
  const [blackHoleMassMsun, setBlackHoleMassMsun] = useState<number>(10); // Solar masses

  // Schwarzschild radius: Rs = 2.95 km * (M / Msun)
  const schwarzschildRadiusKm = (2.953 * blackHoleMassMsun).toFixed(2);

  const constants = [
    { symbol: '\\hbar', name: 'Constante reducida de Planck', value: '1.05457 \\times 10^{-34} \\; \\text{J}\\cdot\\text{s}' },
    { symbol: 'c', name: 'Velocidad de la luz en el vacío', value: '2.99792 \\times 10^8 \\; \\text{m/s}' },
    { symbol: 'G', name: 'Constante gravitacional de Newton', value: '6.67430 \\times 10^{-11} \\; \\text{m}^3/(\\text{kg}\\cdot\\text{s}^2)' },
    { symbol: 'k_B', name: 'Constante de Boltzmann', value: '1.38065 \\times 10^{-23} \\; \\text{J/K}' },
    { symbol: 'm_e', name: 'Masa en reposo del electrón', value: '9.10938 \\times 10^{-31} \\; \\text{kg}' },
    { symbol: 'M_{\\text{Ch}}', name: 'Límite de masa de Chandrasekhar', value: '\\approx 1.44 \\; M_\\odot' },
  ];

  return (
    <div className="bg-[#0b111a] border border-purple-500/20 rounded-xl p-4 shadow-xl flex flex-col h-full overflow-hidden text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Telescope className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Observatorio Relativista & Leyes Cuánticas
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              Constantes universales, curvatura espacio-temporal y agujeros negros
            </span>
          </div>
        </div>

        {onAskProfessor && (
          <button
            onClick={() => onAskProfessor(`Explica la deducción del radio de Schwarzschild R_s = 2GM/c^2 para un agujero negro de ${blackHoleMassMsun} masas solares.`)}
            className="px-2.5 py-1 text-xs font-mono bg-purple-950/40 border border-purple-500/40 text-purple-300 hover:text-white rounded transition shadow-sm"
          >
            Preguntar al Chat
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs font-sans">
        {/* Schwarzschild Interactive Calculator */}
        <div className="bg-[#070b12] border border-purple-500/30 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-purple-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Orbit className="w-3.5 h-3.5" /> Radio de Schwarzschild (\(R_s\)):
            </span>
            <span className="text-slate-300 text-[11px] font-normal">Métrica de Schwarzschild</span>
          </div>

          <div className="overflow-x-auto py-1 font-mono text-purple-200">
            <BlockMath math="R_s = \frac{2GM}{c^2} \approx 2.953 \, \left(\frac{M}{M_\odot}\right) \text{km}" />
          </div>

          <div className="space-y-1.5 font-mono pt-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Masa de la Singularidad:</span>
              <span className="text-purple-300 font-bold">{blackHoleMassMsun} M_☉</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={blackHoleMassMsun}
              onChange={(e) => setBlackHoleMassMsun(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between items-center text-xs bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 font-mono">Horizonte de Sucesos:</span>
              <span className="text-emerald-400 font-bold font-mono text-sm">{schwarzschildRadiusKm} km</span>
            </div>
          </div>
        </div>

        {/* Fundamental Constants of Nature */}
        <div className="bg-[#070b12] border border-slate-800 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 mb-1">
            <Scale className="w-3.5 h-3.5" />
            <span>Constantes Físicas Universales de la Naturaleza:</span>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            {constants.map((c, idx) => (
              <div key={idx} className="bg-slate-900/60 p-2 rounded border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="text-purple-300 font-bold mr-2"><InlineMath math={c.symbol} /></span>
                  <span className="text-slate-400 text-[10px] font-sans">{c.name}</span>
                </div>
                <span className="text-slate-200 font-mono text-[10px]"><InlineMath math={c.value} /></span>
              </div>
            ))}
          </div>
        </div>

        {/* Quantum & Relativistic Principles */}
        <div className="bg-[#070b12] border border-slate-800 rounded-xl p-3 space-y-2 text-[11px] leading-relaxed">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400">
            <Atom className="w-3.5 h-3.5" />
            <span>Postulados Cuánticos & Relativistas:</span>
          </div>
          <p className="text-slate-300">
            <strong>Principio de Incertidumbre de Heisenberg:</strong> <InlineMath math="\Delta x \, \Delta p \ge \frac{\hbar}{2}" />.
            En el núcleo de una enana marrón o enana blanca, confinar electrones en un volumen hiperdenso incrementa su momento (<InlineMath math="\Delta p" />), generando la presión mecano-cuántica que balancea la gravedad.
          </p>
          <p className="text-slate-300 pt-1 border-t border-slate-800/60">
            <strong>Ecuaciones de Campo de Einstein:</strong> <InlineMath math="G_{\mu\nu} + \Lambda g_{\mu\nu} = \frac{8\pi G}{c^4} T_{\mu\nu}" />.
            La materia-energía le dice al espacio-tiempo cómo curvarse, y la curvatura le dice a la materia cómo moverse.
          </p>
        </div>
      </div>
    </div>
  );
};
