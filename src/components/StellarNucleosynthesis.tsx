import React, { useState, useMemo } from 'react';
import { Flame, Sparkles, Atom, Sun, Compass, Orbit, ShieldAlert, BookOpen, Layers, BarChart3, Sliders, Box, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { IsotopeComparisonTool } from './IsotopeComparisonTool';
import { PPChainVisualizer } from './PPChainVisualizer';
import { AlphaFissionTool } from './AlphaFissionTool';
import { BindingEnergyCurveChart } from './BindingEnergyCurveChart';

const NUCLEOSYNTHESIS_ABUNDANCE_DATA = [
  { elemento: 'H (Hidrógeno)', bigBang: 73.5, stellarFusion: 0, supernova: 0, sProcess: 0, rProcess: 0 },
  { elemento: 'He (Helio)', bigBang: 25.0, stellarFusion: 1.3, supernova: 0.2, sProcess: 0, rProcess: 0 },
  { elemento: 'C (Carbono)', bigBang: 0, stellarFusion: 0.5, supernova: 0.05, sProcess: 0.01, rProcess: 0 },
  { elemento: 'N (Nitrógeno)', bigBang: 0, stellarFusion: 0.1, supernova: 0.01, sProcess: 0.01, rProcess: 0 },
  { elemento: 'O (Oxígeno)', bigBang: 0, stellarFusion: 0.8, supernova: 0.2, sProcess: 0.02, rProcess: 0 },
  { elemento: 'Mg (Magnesio)', bigBang: 0, stellarFusion: 0.06, supernova: 0.04, sProcess: 0.01, rProcess: 0 },
  { elemento: 'Si (Silicio)', bigBang: 0, stellarFusion: 0.05, supernova: 0.05, sProcess: 0.01, rProcess: 0 },
  { elemento: 'Fe (Hierro)', bigBang: 0, stellarFusion: 0, supernova: 0.15, sProcess: 0.05, rProcess: 0.01 },
  { elemento: 'Sr (Estroncio)', bigBang: 0, stellarFusion: 0, supernova: 0.001, sProcess: 0.008, rProcess: 0.002 },
  { elemento: 'Ba (Bario)', bigBang: 0, stellarFusion: 0, supernova: 0.0005, sProcess: 0.005, rProcess: 0.001 },
  { elemento: 'Au (Oro)', bigBang: 0, stellarFusion: 0, supernova: 0, sProcess: 0.0001, rProcess: 0.0015 },
  { elemento: 'U (Uranio)', bigBang: 0, stellarFusion: 0, supernova: 0, sProcess: 0, rProcess: 0.0005 },
];

export const StellarNucleosynthesis: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState<'bigbang' | 'ppchain' | 'cno' | 'triplealpha' | 'supernova' | 'abundance' | 'isotopes' | 'binding_energy'>('binding_energy');
  const [stellarTempMK, setStellarTempMK] = useState<number>(15); // in Million Kelvin (MK) e.g. 15 MK = Sun core

  // Dynamic stage based on stellar core temperature
  const stellarPhaseInfo = useMemo(() => {
    if (stellarTempMK <= 20) {
      return {
        phase: 'Secuencia Principal (Núcleo Solar Tipo G)',
        tempDesc: `${stellarTempMK} Millones de K (~1.5 × 10⁷ K)`,
        dominantReaction: 'Cadena Protón-Protón (p-p chain)',
        dominantIsotopes: ['¹H (Protio)', '²H (Deuterio)', '³He', '⁴He'],
        intermediates: ['p + p ➔ ²H + e⁺ + ν_e', '³He + ³He ➔ ⁴He + 2p'],
        description: 'Temperatura moderada donde los protones se fusionan en helio con lenta eficiencia, garantizando estabilidad estelar durante miles de millones de años.'
      };
    } else if (stellarTempMK <= 120) {
      return {
        phase: 'Gigante Roja / Quema de Helio (Triple-Alfa)',
        tempDesc: `${stellarTempMK} Millones de K (~1.0 × 10⁸ K)`,
        dominantReaction: 'Proceso Triple-Alfa (Resonancia de Hoyle)',
        dominantIsotopes: ['⁴He', '⁸Be (Inestable)', '¹²C (Carbono)', '¹⁶O (Oxígeno)'],
        intermediates: ['⁴He + ⁴He ⇌ ⁸Be', '⁸Be + ⁴He ➔ ¹²C* ➔ ¹²C + 2γ'],
        description: 'El núcleo se contrae y calienta. Se activa la síntesis de carbono-12 y oxígeno-16 a partir de helio, clave para la química orgánica cósmica.'
      };
    } else if (stellarTempMK <= 800) {
      return {
        phase: 'Supergigante / Quema de Carbono, Neón y Oxígeno',
        tempDesc: `${stellarTempMK} Millones de K (~5.0 × 10⁸ K - 1.0 × 10⁹ K)`,
        dominantReaction: 'Fusión avanzada de elementos alfa',
        dominantIsotopes: ['¹²C', '¹⁶O', '²⁰Ne', '²⁴Mg', '²⁸Si'],
        intermediates: ['¹²C + ¹²C ➔ ²⁴Mg*', '²⁰Ne + γ ➔ ¹⁶O + ⁴He'],
        description: 'La estrella desarrolla capas concéntricas ("cebolla") donde se fusionan elementos cada vez más pesados con emisiones colosales de neutrinos.'
      };
    } else {
      return {
        phase: 'Fase Terminal / Colapso de Supernova & Proceso r',
        tempDesc: `${stellarTempMK} Millones de K (> 3.0 × 10⁹ K)`,
        dominantReaction: 'Quema de Silicio & Captura Rápida de Neutrones',
        dominantIsotopes: ['⁵⁶Fe (Hierro)', '⁵⁶Ni', '¹⁹⁷Au (Oro)', '²³⁸U (Uranio)'],
        intermediates: ['¹⁶O + ¹⁶O ➔ ²⁸Si + ⁴He', 'Captura r-process de neutrones'],
        description: 'Al agotarse el silicio, el núcleo de hierro colapsa en milisegundos produciendo una supernova con síntesis masiva de oro, platino y uranio.'
      };
    }
  }, [stellarTempMK]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
            <Sun className="w-6 h-6 animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block font-bold">
              Astrophysics & Nuclear Genesis Hub
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">Química Estelar, Astrofísica Primordial & Termonuclear</h2>
          </div>
        </div>
        <p className="text-sm text-slate-300 max-w-4xl leading-relaxed font-sans">
          Explora el origen cósmico de los elementos químicos, la evolución de la temperatura estelar, las abundancias con Recharts, la cadena PP y el constructor 3D de núcleos.
        </p>

        {/* Chapter Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-5 font-mono text-xs">
          <button
            onClick={() => setActiveChapter('bigbang')}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeChapter === 'bigbang'
                ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/25'
                : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> 1. Big Bang
          </button>
          <button
            onClick={() => setActiveChapter('ppchain')}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeChapter === 'ppchain'
                ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/25'
                : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <Sun className="w-3.5 h-3.5" /> 2. Cadena PP 3D
          </button>
          <button
            onClick={() => setActiveChapter('cno')}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeChapter === 'cno'
                ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/25'
                : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <Orbit className="w-3.5 h-3.5" /> 3. Ciclo CNO
          </button>
          <button
            onClick={() => setActiveChapter('triplealpha')}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeChapter === 'triplealpha'
                ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/25'
                : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> 4. Triple-Alfa
          </button>
          <button
            onClick={() => setActiveChapter('supernova')}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeChapter === 'supernova'
                ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/25'
                : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> 5. Fisión Alfa & Supernovas
          </button>
          <button
            onClick={() => setActiveChapter('abundance')}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeChapter === 'abundance'
                ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/25'
                : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> 6. Abundancias
          </button>
          <button
            onClick={() => setActiveChapter('isotopes')}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeChapter === 'isotopes'
                ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/25'
                : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <Atom className="w-3.5 h-3.5" /> 7. Isótopos
          </button>
          <button
            onClick={() => setActiveChapter('binding_energy')}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeChapter === 'binding_energy'
                ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-extrabold shadow-lg shadow-cyan-500/30'
                : 'bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 border border-cyan-500/40'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> 8. Curva B/A (Recharts)
          </button>
        </div>
      </div>

      {/* Stellar Temperature Evolution Control Panel */}
      <div className="bg-[#0b111a] border border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block font-bold">
                Evolución Termonuclear Interactiva
              </span>
              <h4 className="text-sm font-bold text-white">Simulador de Temperatura Estelar & Génesis de Isótopos</h4>
            </div>
          </div>
          <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-lg font-mono text-xs font-bold border border-cyan-500/40">
            {stellarTempMK} Millones de K
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>15 MK (Sol / Secuencia Ppl.)</span>
            <span>100 MK (Gigante Roja / Triple-Alfa)</span>
            <span>1,000 MK (Quema de Neón/Silicio)</span>
            <span>3,500+ MK (Supernova / Proceso r)</span>
          </div>
          <input
            type="range"
            min="10"
            max="3500"
            step="10"
            value={stellarTempMK}
            onChange={(e) => setStellarTempMK(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer bg-slate-800 h-2 rounded-lg"
          />
        </div>

        {/* Phase Output Card */}
        <div className="bg-[#070b12] border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div>
            <span className="text-[10px] uppercase text-slate-400 block mb-1">Fase Estelar Actual:</span>
            <span className="text-cyan-400 font-bold text-sm block">{stellarPhaseInfo.phase}</span>
            <span className="text-[10px] text-slate-500 block mt-1">Temp: {stellarPhaseInfo.tempDesc}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 block mb-1">Reacción Termonuclear Dominante:</span>
            <span className="text-amber-300 font-bold block">{stellarPhaseInfo.dominantReaction}</span>
            <p className="text-slate-300 text-[11px] font-sans mt-1 leading-tight">{stellarPhaseInfo.description}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 block mb-1">Isótopos & Intermedios Generados:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {stellarPhaseInfo.dominantIsotopes.map((iso, i) => (
                <span key={i} className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded text-[10px]">
                  {iso}
                </span>
              ))}
            </div>
            <div className="text-[10px] text-emerald-300 mt-2">
              <strong>Pasos intermedios:</strong> {stellarPhaseInfo.intermediates.join(' ➔ ')}
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Content Viewports */}
      <div className="bg-[#0b111a] border border-cyan-500/20 rounded-2xl p-6 shadow-xl space-y-6">
        {activeChapter === 'bigbang' && (
          <div className="space-y-4 font-sans text-slate-300">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block font-bold">Capítulo I</span>
              <h3 className="text-lg font-bold text-white">Nucleosíntesis Primordial (Big Bang - Primeros 3 Minutos)</h3>
            </div>
            <p className="leading-relaxed text-sm">
              Durante los primeros tres minutos tras el Big Bang, el universo se encontraba a temperaturas superiores a 1,000 millones de grados, permitiendo la síntesis de Hidrógeno, Helio-4 y trazas de Litio-7.
            </p>
          </div>
        )}

        {activeChapter === 'ppchain' && (
          <div className="space-y-4 font-sans text-slate-300">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block font-bold">Capítulo II</span>
              <h3 className="text-lg font-bold text-white">Cadena Protón-Protón (Proceso PP) en 3D</h3>
            </div>
            <PPChainVisualizer />
          </div>
        )}

        {activeChapter === 'cno' && (
          <div className="space-y-4 font-sans text-slate-300">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block font-bold">Capítulo III</span>
              <h3 className="text-lg font-bold text-white">El Ciclo Catalítico CNO (Carbono-Nitrógeno-Oxígeno)</h3>
            </div>
            <p className="leading-relaxed text-sm">
              En estrellas con masas superiores a 1.3 masas solares, el ciclo CNO utiliza núcleos de carbono como catalizadores para fusionar protones en helio de manera mucho más acelerada.
            </p>
          </div>
        )}

        {activeChapter === 'triplealpha' && (
          <div className="space-y-4 font-sans text-slate-300">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block font-bold">Capítulo IV</span>
              <h3 className="text-lg font-bold text-white">Proceso Triple-Alfa (Resonancia de Hoyle)</h3>
            </div>
            <p className="leading-relaxed text-sm">
              Cuando el núcleo estelar agota su hidrógeno y asciende a 100 millones de grados (Gigante Roja), tres núcleos de helio-4 se fusionan simultáneamente para formar Carbono-12 gracias a una resonancia cuántica predicha por Fred Hoyle.
            </p>
          </div>
        )}

        {activeChapter === 'supernova' && (
          <div className="space-y-4 font-sans text-slate-300">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block font-bold">Capítulo V</span>
              <h3 className="text-lg font-bold text-white">Fisión de Partículas Alfa & Supernovas (Procesos s y r)</h3>
            </div>
            <AlphaFissionTool />
          </div>
        )}

        {activeChapter === 'abundance' && (
          <div className="space-y-4 font-sans text-slate-300">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block font-bold">Capítulo VI — Recharts</span>
              <h3 className="text-lg font-bold text-white">Abundancia Cósmica de los Elementos</h3>
            </div>
            <div className="h-80 w-full bg-[#070b12] border border-slate-800 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={NUCLEOSYNTHESIS_ABUNDANCE_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="elemento" stroke="#64748b" fontSize={10} angle={-30} textAnchor="end" />
                  <YAxis stroke="#64748b" fontSize={10} unit="%" />
                  <Tooltip contentStyle={{ backgroundColor: '#0b111a', borderColor: '#06b6d4', borderRadius: '0.5rem' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  <Bar dataKey="bigBang" name="Big Bang" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="stellarFusion" name="Fusión Estelar" stackId="a" fill="#06b6d4" />
                  <Bar dataKey="supernova" name="Supernovas" stackId="a" fill="#10b981" />
                  <Bar dataKey="sProcess" name="Proceso s" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="rProcess" name="Proceso r" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeChapter === 'isotopes' && (
          <div className="space-y-4 font-sans text-slate-300">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block font-bold">Capítulo VII — Herramienta Isótopos</span>
              <h3 className="text-lg font-bold text-white">Comparativa de Isótopos & Vidas Medias (Recharts)</h3>
            </div>
            <IsotopeComparisonTool />
          </div>
        )}

        {activeChapter === 'binding_energy' && (
          <div className="space-y-4 font-sans text-slate-300">
            <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block font-bold">
                  Capítulo VIII — Física Nuclear y Astrofísica con Recharts
                </span>
                <h3 className="text-lg font-bold text-white">
                  Curva de Energía de Enlace por Nucleón (B/A) vs Número Másico (A)
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-lg self-start">
                Isótopos Estables vs Inestables
              </span>
            </div>
            <BindingEnergyCurveChart />
          </div>
        )}


      </div>
    </div>
  );
};
