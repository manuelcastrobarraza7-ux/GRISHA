import React, { useState } from 'react';
import { Flame, Atom, Sparkles, ArrowRight, ShieldAlert, RefreshCw, Zap } from 'lucide-react';
import { PERIODIC_ELEMENTS } from '../data/periodicTable';

interface HeavyNuclide {
  id: string;
  name: string;
  symbol: string;
  z: number;
  n: number;
  mass: number;
  halfLife: string;
  decayEnergy: string;
  daughterSymbol: string;
  daughterName: string;
}

const HEAVY_NUCLIDES: HeavyNuclide[] = [
  {
    id: 'u238',
    name: 'Uranio-238',
    symbol: '²³⁸U',
    z: 92,
    n: 146,
    mass: 238.050,
    halfLife: '4.47 Mil millones de años',
    decayEnergy: '4.27 MeV (Alfa)',
    daughterSymbol: '²³⁴Th',
    daughterName: 'Torio-234'
  },
  {
    id: 'ra226',
    name: 'Radio-226',
    symbol: '²²⁶Ra',
    z: 88,
    n: 138,
    mass: 226.025,
    halfLife: '1,600 años',
    decayEnergy: '4.87 MeV (Alfa)',
    daughterSymbol: '²²²Rn',
    daughterName: 'Radón-222'
  },
  {
    id: 'po210',
    name: 'Polonio-210',
    symbol: '²¹⁰Po',
    z: 84,
    n: 126,
    mass: 209.982,
    halfLife: '138.4 días',
    decayEnergy: '5.41 MeV (Alfa)',
    daughterSymbol: '²⁰⁶Pb',
    daughterName: 'Plomo-206 (Estable)'
  },
  {
    id: 'th232',
    name: 'Torio-232',
    symbol: '²³²Th',
    z: 90,
    n: 142,
    mass: 232.038,
    halfLife: '14.0 Mil millones de años',
    decayEnergy: '4.08 MeV (Alfa)',
    daughterSymbol: '²²⁸Ra',
    daughterName: 'Radio-228'
  },
  {
    id: 'am241',
    name: 'Americio-241',
    symbol: '²⁴¹Am',
    z: 95,
    n: 146,
    mass: 241.056,
    halfLife: '432.2 años',
    decayEnergy: '5.64 MeV (Alfa)',
    daughterSymbol: '²³⁷Np',
    daughterName: 'Neptunio-237'
  }
];

export const AlphaFissionTool: React.FC = () => {
  const [selectedNuclideId, setSelectedNuclideId] = useState<string>('u238');
  const [isFiringAlpha, setIsFiringAlpha] = useState<boolean>(false);
  const [fireCount, setFireCount] = useState<number>(0);

  const currentNuclide = HEAVY_NUCLIDES.find(n => n.id === selectedNuclideId) || HEAVY_NUCLIDES[0];

  const handleFireAlpha = () => {
    setIsFiringAlpha(true);
    setTimeout(() => {
      setIsFiringAlpha(false);
      setFireCount(prev => prev + 1);
    }, 1200);
  };

  return (
    <div className="bg-[#0b111a] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-6 my-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 block font-bold">
              Panel Interactivo de Fisión & Desintegración Alfa
            </span>
            <h3 className="text-lg font-bold text-white">Disparo Virtual de Partícula Alfa (α = ⁴He) & Núcleos Pesados</h3>
          </div>
        </div>

        {/* Nuclide selector */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Núcleo Padre:</span>
          <select
            value={selectedNuclideId}
            onChange={(e) => setSelectedNuclideId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-cyan-300 rounded-lg px-3 py-1.5 focus:border-cyan-500 focus:outline-none"
          >
            {HEAVY_NUCLIDES.map((n) => (
              <option key={n.id} value={n.id}>
                {n.symbol} - {n.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Interactive Display & Animation Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left 7 Cols: Visual Fission / Alpha Emission Animation Canvas */}
        <div className="lg:col-span-7 h-[340px] bg-[#070b12] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-6 shadow-inner">
          <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-[11px] text-purple-300 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulador Cuántico de Túnel & Emisión Alfa</span>
          </div>

          {/* Nucleus visual representation */}
          <div className="relative flex items-center justify-center w-full h-full gap-8">
            {/* Parent Nucleus */}
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-purple-900/80 to-slate-900 border-2 border-purple-500 flex flex-col items-center justify-center shadow-2xl shadow-purple-500/20 transition-all ${
              isFiringAlpha ? 'scale-95 animate-pulse' : 'scale-100'
            }`}>
              <span className="text-2xl font-black text-white font-mono">{currentNuclide.symbol}</span>
              <span className="text-[10px] text-purple-300 font-mono mt-0.5">Z={currentNuclide.z}, N={currentNuclide.n}</span>
              <span className="text-[9px] text-slate-400 font-mono">Núcleo Padre</span>
            </div>

            {/* Emitted Alpha Particle (Animated) */}
            <div className={`flex flex-col items-center transition-all duration-1000 ${
              isFiringAlpha 
                ? 'translate-x-24 opacity-100 scale-110' 
                : 'translate-x-0 opacity-0 scale-50'
            }`}>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-red-600 border border-amber-300 flex flex-col items-center justify-center shadow-lg shadow-amber-500/40">
                <span className="text-xs font-black text-black font-mono">⁴He</span>
                <span className="text-[8px] text-black font-mono">α</span>
              </div>
              <span className="text-[10px] font-mono text-amber-400 mt-1">v ≈ 0.05 c</span>
            </div>

            {/* Daughter Nuclide */}
            <div className={`w-28 h-28 rounded-full bg-gradient-to-br from-cyan-950 to-slate-900 border border-cyan-500/60 flex flex-col items-center justify-center shadow-xl transition-all ${
              isFiringAlpha ? 'opacity-90 scale-100' : 'opacity-70 scale-95'
            }`}>
              <span className="text-xl font-bold text-cyan-300 font-mono">{currentNuclide.daughterSymbol}</span>
              <span className="text-[9px] text-slate-400 font-mono">Z={currentNuclide.z - 2}</span>
              <span className="text-[9px] text-cyan-400 font-mono">Hija</span>
            </div>
          </div>

          <div className="absolute bottom-3 text-center w-full font-mono text-[11px] text-slate-400">
            {isFiringAlpha ? '⚡ ¡Efecto Túnel Cuántico: Partícula Alfa eyectada!' : 'Haz clic en "Disparar Partícula Alfa" para iniciar la desintegración'}
          </div>
        </div>

        {/* Right 5 Cols: Data & Trigger */}
        <div className="lg:col-span-5 space-y-4 font-mono text-xs">
          <div className="bg-[#070b12] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] uppercase text-purple-400 font-bold">Propiedades de Desintegración:</span>
              <span className="text-slate-400 text-[10px]">Ciclos: {fireCount}</span>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Núcleo Inicial:</span>
                <strong className="text-white">{currentNuclide.name} ({currentNuclide.symbol})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Núcleo Resultante (Hija):</span>
                <strong className="text-cyan-400">{currentNuclide.daughterName} ({currentNuclide.daughterSymbol})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vida Media ($t_{1/2}$):</span>
                <strong className="text-amber-400">{currentNuclide.halfLife}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Energía de Decaimiento Q:</span>
                <strong className="text-emerald-400">{currentNuclide.decayEnergy}</strong>
              </div>
            </div>

            <p className="text-[11px] font-sans text-slate-400 pt-2 border-t border-slate-800 leading-relaxed">
              La desintegración alfa es un proceso cuántico donde un núcleo pesado expulsa un racimo ligado de 2 protones y 2 neutrones (⁴He), superando la barrera de potencial mediante efecto túnel.
            </p>
          </div>

          <button
            onClick={handleFireAlpha}
            disabled={isFiringAlpha}
            className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold rounded-lg shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>{isFiringAlpha ? 'Eyectando Partícula Alfa...' : 'Disparar Partícula Alfa (Simular)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
