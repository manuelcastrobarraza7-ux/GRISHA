import React, { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { Sparkles, Sun, Flame, Zap, Layers, Activity } from 'lucide-react';

interface ProfessorQuantumSimulatorProps {
  onAskProfessor?: (query: string) => void;
}

export const ProfessorQuantumSimulator: React.FC<ProfessorQuantumSimulatorProps> = ({ onAskProfessor }) => {
  const [selectedProcess, setSelectedProcess] = useState<'pp-chain' | 'tunneling' | 'brown-dwarf' | 'cno'>('pp-chain');
  const [coreTempMillionK, setCoreTempMillionK] = useState<number>(15); // Core temp in Million Kelvin
  const [stellarMassMsun, setStellarMassMsun] = useState<number>(0.07); // in solar masses (M☉)

  // Gamow factor estimate for Coulomb penetration
  const gamowFactor = (1 / Math.sqrt(coreTempMillionK)).toFixed(3);
  const isBrownDwarf = stellarMassMsun < 0.075;
  const burnsDeuterium = stellarMassMsun >= 0.013; // > 13 Jupiter masses

  return (
    <div className="bg-[#0b111a] border border-purple-500/20 rounded-xl p-4 shadow-xl flex flex-col h-full overflow-hidden text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Simulador Cuántico & Termonuclear
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              Efecto túnel, fusión estelar p-p y física de enanas marrones
            </span>
          </div>
        </div>

        {onAskProfessor && (
          <button
            onClick={() => onAskProfessor(`Explica detalladamente el proceso de ${selectedProcess} y el efecto túnel cuántico bajo temperatura de ${coreTempMillionK} MK.`)}
            className="px-2.5 py-1 text-xs font-mono bg-purple-950/40 border border-purple-500/40 text-purple-300 hover:text-white rounded transition shadow-sm"
          >
            Preguntar al Chat
          </button>
        )}
      </div>

      {/* Process Selection Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 text-[11px] font-mono">
        <button
          onClick={() => setSelectedProcess('pp-chain')}
          className={`px-2.5 py-1 rounded transition whitespace-nowrap border ${
            selectedProcess === 'pp-chain'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
              : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          Cadena p-p (Fusión Solar)
        </button>

        <button
          onClick={() => setSelectedProcess('tunneling')}
          className={`px-2.5 py-1 rounded transition whitespace-nowrap border ${
            selectedProcess === 'tunneling'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
              : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          Efecto Túnel de Gamow
        </button>

        <button
          onClick={() => setSelectedProcess('brown-dwarf')}
          className={`px-2.5 py-1 rounded transition whitespace-nowrap border ${
            selectedProcess === 'brown-dwarf'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
              : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          Enanas Marrones & Degeneración
        </button>

        <button
          onClick={() => setSelectedProcess('cno')}
          className={`px-2.5 py-1 rounded transition whitespace-nowrap border ${
            selectedProcess === 'cno'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
              : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          Ciclo CNO (Estrellas Masivas)
        </button>
      </div>

      {/* Main Interactive Calculation Viewport */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs font-sans">
        {selectedProcess === 'pp-chain' && (
          <div className="space-y-3">
            <div className="bg-[#070b12] border border-purple-500/30 rounded-lg p-3">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block mb-1">
                Ecuación Neta de la Cadena p-p I:
              </span>
              <div className="text-purple-200 text-sm font-mono overflow-x-auto py-1">
                <BlockMath math="4 \, ^1\text{H} \longrightarrow \, ^4\text{He} + 2e^+ + 2\nu_e + 2\gamma \; (Q = +26.73\,\text{MeV})" />
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed mt-1">
                El paso limitante es la fusión protón-protón mecano-cuántica gobernada por la interacción débil:
                {' '}<InlineMath math="p + p \rightarrow \, ^2\text{H} + e^+ + \nu_e" />, con una vida media por protón de <InlineMath math="\sim 10^9" /> años.
              </p>
            </div>

            {/* Slider for core temperature */}
            <div className="bg-[#070b12] border border-slate-800 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Temperatura del Núcleo Estelar (<InlineMath math="T_c" />):</span>
                <span className="text-purple-300 font-bold">{coreTempMillionK} MK</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="1"
                value={coreTempMillionK}
                onChange={(e) => setCoreTempMillionK(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>5 MK (Enana M)</span>
                <span>15 MK (Sol)</span>
                <span>40 MK (Dominio CNO)</span>
              </div>
            </div>
          </div>
        )}

        {selectedProcess === 'tunneling' && (
          <div className="space-y-3">
            <div className="bg-[#070b12] border border-purple-500/30 rounded-lg p-3">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block mb-1">
                Probabilidad de Transmisión por Barrera de Coulomb (Gamow):
              </span>
              <div className="text-purple-200 text-sm font-mono overflow-x-auto py-1">
                <BlockMath math="P(E) = \exp\left( -2\pi \eta \right) = \exp\left( -\sqrt{\frac{E_G}{E}} \right)" />
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed mt-1">
                La energía cinética térmica clásica en el centro del Sol (<InlineMath math="\sim 1\,\text{keV}" />) es mil veces menor que la repulsión electrostática de Coulomb (<InlineMath math="\sim 1\,\text{MeV}" />). La fusión estelar solo ocurre gracias al <strong>efecto túnel cuántico</strong>.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 text-[9px] uppercase block">Factor de Gamow Estimado:</span>
                <span className="text-purple-300 text-sm font-bold block mt-1">{gamowFactor}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 text-[9px] uppercase block">Pico de Gamow:</span>
                <span className="text-emerald-400 text-sm font-bold block mt-1"><InlineMath math="E_0 \approx 5.9\,\text{keV}" /></span>
              </div>
            </div>
          </div>
        )}

        {selectedProcess === 'brown-dwarf' && (
          <div className="space-y-3">
            <div className="bg-[#070b12] border border-purple-500/30 rounded-lg p-3">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block mb-1">
                Física de Objetos Subestelares (Enanas Marrones):
              </span>
              <div className="text-purple-200 text-sm font-mono overflow-x-auto py-1">
                <BlockMath math="P_{\text{deg}} = \frac{(3\pi^2)^{2/3}\hbar^2}{5 m_e} n_e^{5/3} \quad (\text{Gas de Fermi No Relativista})" />
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed mt-1">
                Las enanas marrones no alcanzan la masa crítica de Hayashi (\(\approx 0.075\,M_\odot\)). Su núcleo queda degenerado por electrones antes de que la temperatura alcance los 10 millones de Kelvin.
              </p>
            </div>

            {/* Mass slider */}
            <div className="bg-[#070b12] border border-slate-800 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Masa del Objeto Celeste:</span>
                <span className="text-purple-300 font-bold">{(stellarMassMsun * 1047).toFixed(1)} M_Júpiter ({stellarMassMsun.toFixed(3)} M_☉)</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.10"
                step="0.002"
                value={stellarMassMsun}
                onChange={(e) => setStellarMassMsun(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-slate-400">Régimen Astrofísico:</span>
                  <span className={`font-bold ${isBrownDwarf ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {isBrownDwarf ? 'Enana Marrón Subestelar' : 'Estrella de Secuencia Principal (Enana Roja)'}
                  </span>
                </div>
                <div className="text-slate-400 text-[10px]">
                  Fusión de Deuterio: <strong className={burnsDeuterium ? 'text-emerald-400' : 'text-rose-400'}>{burnsDeuterium ? 'VIABLE (>13 MJ)' : 'NO VIABLE (<13 MJ, Planeta Gigante)'}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedProcess === 'cno' && (
          <div className="space-y-3">
            <div className="bg-[#070b12] border border-purple-500/30 rounded-lg p-3">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block mb-1">
                Ciclo CNO de Bethe-Weizsäcker (<InlineMath math="T > 17\,\text{MK}" />):
              </span>
              <div className="text-purple-200 text-sm font-mono overflow-x-auto py-1">
                <BlockMath math="^{12}\text{C}(p,\gamma)^{13}\text{N}(\beta^+\nu)^{13}\text{C}(p,\gamma)^{14}\text{N}(p,\gamma)^{15}\text{O}(\beta^+\nu)^{15}\text{N}(p,\alpha)^{12}\text{C}" />
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed mt-1">
                En estrellas de masa <InlineMath math="M > 1.3\,M_\odot" />, el ciclo CNO domina completamente con una dependencia térmica extrema <InlineMath math="\epsilon_{\text{CNO}} \propto T^{16}" />.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
