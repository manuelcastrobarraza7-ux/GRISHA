import React, { useState } from 'react';
import { Sparkles, Image, RefreshCw, ZoomIn, Download, Layers } from 'lucide-react';
import { InlineMath } from 'react-katex';

interface ScienceDiagramStudioProps {
  discipline: 'chemistry' | 'physics_astrophysics';
}

export const ScienceDiagramStudio: React.FC<ScienceDiagramStudioProps> = ({ discipline }) => {
  const isChemistry = discipline === 'chemistry';

  const chemistryDiagrams = [
    {
      id: 'alumina-crystal',
      title: 'Red Cristalina de Alúmina (Al₂O₃) & Corindón',
      category: 'Mineralogía & Gemología',
      description: 'Estructura hexagonal compacta de aniones O²⁻ con 2/3 de huecos octaédricos ocupados por Al³⁺. Dopajes con Cr³⁺ generan Rubí; Fe²⁺/Ti⁴⁺ originan Zafiro.',
      svg: (
        <svg viewBox="0 0 400 240" className="w-full h-48 bg-[#070b12] rounded-lg border border-slate-800">
          <defs>
            <radialGradient id="alGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#0891b2" />
            </radialGradient>
            <radialGradient id="oGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#b91c1c" />
            </radialGradient>
            <radialGradient id="crGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#881337" />
            </radialGradient>
          </defs>
          {/* Lattice bounds */}
          <polygon points="200,30 340,90 340,190 200,220 60,190 60,90" fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="200" y1="30" x2="200" y2="220" stroke="#1e293b" strokeWidth="1.5" />
          <line x1="60" y1="90" x2="340" y2="90" stroke="#1e293b" strokeWidth="1.5" />
          {/* Bonds */}
          <line x1="200" y1="120" x2="130" y2="80" stroke="#334155" strokeWidth="2" />
          <line x1="200" y1="120" x2="270" y2="80" stroke="#334155" strokeWidth="2" />
          <line x1="200" y1="120" x2="150" y2="170" stroke="#334155" strokeWidth="2" />
          <line x1="200" y1="120" x2="250" y2="170" stroke="#334155" strokeWidth="2" />
          {/* Atoms */}
          <circle cx="130" cy="80" r="14" fill="url(#oGrad)" />
          <text x="130" y="84" textAnchor="middle" fill="#fff" fontSize="10" fontFamily="monospace" fontWeight="bold">O²⁻</text>
          <circle cx="270" cy="80" r="14" fill="url(#oGrad)" />
          <text x="270" y="84" textAnchor="middle" fill="#fff" fontSize="10" fontFamily="monospace" fontWeight="bold">O²⁻</text>
          <circle cx="150" cy="170" r="14" fill="url(#oGrad)" />
          <text x="150" y="174" textAnchor="middle" fill="#fff" fontSize="10" fontFamily="monospace" fontWeight="bold">O²⁻</text>
          <circle cx="250" cy="170" r="14" fill="url(#oGrad)" />
          <text x="250" y="174" textAnchor="middle" fill="#fff" fontSize="10" fontFamily="monospace" fontWeight="bold">O²⁻</text>
          {/* Central cation (Al or Cr dopant) */}
          <circle cx="200" cy="120" r="18" fill="url(#crGrad)" className="animate-pulse" />
          <text x="200" y="124" textAnchor="middle" fill="#fff" fontSize="10" fontFamily="monospace" fontWeight="bold">Cr³⁺/Al³⁺</text>
          <text x="200" y="210" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">Coordinación Octaédrica de Corindón [AlO₆]</text>
        </svg>
      )
    },
    {
      id: 'potassium-salts',
      title: 'Mecanismo de Asimilación Osmótica de K₂SO₄ vs KCl',
      category: 'Agronomía & Nutrición Vegetal',
      description: 'El sulfato de potasio presenta índice salino de solo 46 frente al 116 del cloruro potásico (KCl), protegiendo pelos absorbentes radiculares.',
      svg: (
        <svg viewBox="0 0 400 240" className="w-full h-48 bg-[#070b12] rounded-lg border border-slate-800">
          {/* Plant Root cell membrane */}
          <path d="M 50 190 Q 200 170 350 190" fill="none" stroke="#10b981" strokeWidth="4" />
          <text x="200" y="215" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontFamily="sans-serif">Membrana Celular de Raíz (Alta tolerancia a SO₄²⁻)</text>
          {/* K+ ions passing */}
          <circle cx="120" cy="80" r="16" fill="#38bdf8" />
          <text x="120" y="85" textAnchor="middle" fill="#000" fontSize="12" fontWeight="bold" fontFamily="monospace">K⁺</text>
          <path d="M 120 100 L 120 160" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#arrow)" />
          {/* SO4 2- */}
          <rect x="230" y="65" width="46" height="30" rx="8" fill="#fbbf24" />
          <text x="253" y="84" textAnchor="middle" fill="#000" fontSize="11" fontWeight="bold" fontFamily="monospace">SO₄²⁻</text>
          <text x="253" y="120" textAnchor="middle" fill="#fbbf24" fontSize="10" fontFamily="sans-serif">Azufre Asimilable</text>
          <text x="60" y="40" textAnchor="start" fill="#f87171" fontSize="10" fontFamily="sans-serif">✗ Cl⁻ Fitotóxico Ausente</text>
        </svg>
      )
    }
  ];

  const physicsDiagrams = [
    {
      id: 'coulomb-tunnel',
      title: 'Barrera de Coulomb y Efecto Túnel Mecano-Cuántico',
      category: 'Mecánica Cuántica & Fusión',
      description: 'La función de onda nuclear penetra exponencialmente la barrera potencial de Coulomb en el centro estelar.',
      svg: (
        <svg viewBox="0 0 400 240" className="w-full h-48 bg-[#070b12] rounded-lg border border-slate-800">
          {/* Coulomb barrier curve */}
          <path d="M 40 200 L 140 200 Q 170 50 200 40 Q 230 50 260 200 L 360 200" fill="none" stroke="#f43f5e" strokeWidth="3" />
          {/* Quantum wave entering and penetrating */}
          <path d="M 40 140 Q 60 120 80 140 T 120 140 T 160 140 Q 180 145 200 150 Q 220 155 240 160 T 280 160 T 320 160 T 360 160" fill="none" stroke="#a855f7" strokeWidth="2.5" />
          <text x="200" y="30" textAnchor="middle" fill="#fda4af" fontSize="10" fontFamily="sans-serif">Barrera Clásica V_coulomb ≈ 1 MeV</text>
          <line x1="40" y1="140" x2="360" y2="140" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
          <text x="90" y="130" textAnchor="middle" fill="#c084fc" fontSize="10" fontFamily="sans-serif">Energía Térmica E ≈ 1 keV</text>
          <text x="300" y="185" textAnchor="middle" fill="#34d399" fontSize="10" fontFamily="sans-serif">Amplitud Transmitida |ψ|² &gt; 0</text>
        </svg>
      )
    },
    {
      id: 'brown-dwarf-structure',
      title: 'Estructura Interna de una Enana Marrón',
      category: 'Astrofísica Subestelar',
      description: 'Atmósfera molecular rica en H₂O, CH₄ y NH₃ que cubre un manto convectivo soportado por gas de Fermi degenerado de electrones.',
      svg: (
        <svg viewBox="0 0 400 240" className="w-full h-48 bg-[#070b12] rounded-lg border border-slate-800">
          <circle cx="200" cy="120" r="90" fill="#4c0519" stroke="#be123c" strokeWidth="2" />
          <circle cx="200" cy="120" r="60" fill="#881337" stroke="#e11d48" strokeWidth="1.5" />
          <circle cx="200" cy="120" r="30" fill="#701a75" stroke="#a21caf" strokeWidth="1.5" />
          <text x="200" y="124" textAnchor="middle" fill="#fbcfe8" fontSize="10" fontWeight="bold" fontFamily="monospace">Núcleo Degenerado</text>
          <text x="200" y="70" textAnchor="middle" fill="#fda4af" fontSize="9" fontFamily="sans-serif">Manto Convectivo Metálico</text>
          <text x="200" y="225" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontFamily="sans-serif">Enana Marrón Tipo L / T (Fusión de Deuterio ^2H)</text>
        </svg>
      )
    }
  ];

  const diagrams = isChemistry ? chemistryDiagrams : physicsDiagrams;
  const [activeDiagramIndex, setActiveDiagramIndex] = useState(0);
  const current = diagrams[activeDiagramIndex];

  return (
    <div className="bg-[#0b111a] border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col h-full overflow-hidden text-slate-100">
      <div className="border-b border-slate-800 pb-3 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Image className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Estudio de Diagramas & Esquemas Científicos
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              Modalidad de imagen independiente: representaciones visuales
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
          {isChemistry ? 'Química & Cristales' : 'Física & Astrofísica'}
        </span>
      </div>

      {/* Diagram selection selector */}
      <div className="flex items-center gap-2 mb-3">
        {diagrams.map((d, idx) => (
          <button
            key={d.id}
            onClick={() => setActiveDiagramIndex(idx)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition flex-1 text-left truncate border ${
              activeDiagramIndex === idx
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {d.title}
          </button>
        ))}
      </div>

      {/* Main Diagram Canvas */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs font-sans">
        <div className="p-2 bg-[#070b12] rounded-xl border border-slate-800 shadow-inner">
          {current.svg}
        </div>

        <div className="bg-[#070b12] border border-slate-800 rounded-lg p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-white text-xs">{current.title}</h5>
            <span className="text-[10px] font-mono text-cyan-400">{current.category}</span>
          </div>
          <p className="text-slate-300 text-[11.5px] leading-relaxed">
            {current.description}
          </p>
        </div>
      </div>
    </div>
  );
};
