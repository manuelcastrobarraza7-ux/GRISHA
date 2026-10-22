import React, { useState } from 'react';
import { CHEMICAL_DATABASE, ChemicalReagent } from '../data/chemicals';
import { analyzeReactionChain, ReactionResult } from '../data/reactions';
import { EquationMath, ChemicalText } from './ChemicalLatex';
import { Sparkles, ArrowRight, Layers, Zap, Loader2, BookOpen, AlertCircle } from 'lucide-react';

interface ProfessorReactionSolverProps {
  onAskProfessor?: (query: string) => void;
}

export const ProfessorReactionSolver: React.FC<ProfessorReactionSolverProps> = ({ onAskProfessor }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(['H2SO4', 'KOH']);
  const [result, setResult] = useState<ReactionResult | null>(() => analyzeReactionChain(['H2SO4', 'KOH']));
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  const presets = [
    { label: 'Fertilizantes K₂SO₄ + KNO₃', ids: ['H2SO4', 'KNO3', 'KOH'] },
    { label: 'Neutralización HCl + NaOH', ids: ['HCl', 'NaOH'] },
    { label: 'Alúmina Al + O₂ (Corindón)', ids: ['Al', 'O2'] },
    { label: 'Precipitado Cu(OH)₂', ids: ['CuSO4', 'NaOH'] },
    { label: 'Deshidratación Azúcar', ids: ['H2SO4', 'Azucar'] },
  ];

  const handleSelectPreset = (ids: string[]) => {
    setSelectedIds(ids);
    const localRes = analyzeReactionChain(ids);
    setResult(localRes);
    setAiAnalysis(null);
  };

  const handleAddId = (id: string) => {
    if (!id || selectedIds.includes(id)) return;
    const newIds = [...selectedIds, id];
    setSelectedIds(newIds);
    setResult(analyzeReactionChain(newIds));
  };

  const handleRemoveId = (index: number) => {
    const newIds = selectedIds.filter((_, i) => i !== index);
    setSelectedIds(newIds);
    setResult(newIds.length > 0 ? analyzeReactionChain(newIds) : null);
  };

  const handleDeepAiAnalyze = async () => {
    if (selectedIds.length === 0) return;
    setIsLoadingAi(true);
    setAiAnalysis(null);
    try {
      const response = await fetch('/api/analyze-reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reactants: selectedIds,
          useHighThinking: true,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setAiAnalysis(data.analysis || 'Análisis completado.');
      }
    } catch (e) {
      console.warn('Error fetching deep AI analysis:', e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="bg-[#0b111a] border border-cyan-500/20 rounded-xl p-4 shadow-xl flex flex-col h-full overflow-hidden text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Pizarra de Mecanismos & Ecuaciones
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              Resolutor iónico, termodinámico y derivación KaTeX
            </span>
          </div>
        </div>

        <button
          onClick={handleDeepAiAnalyze}
          disabled={isLoadingAi || selectedIds.length === 0}
          className="px-2.5 py-1 text-xs font-mono font-semibold bg-cyan-500 hover:bg-cyan-400 text-black rounded transition flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
        >
          {isLoadingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
          <span>Derivación Profunda IA</span>
        </button>
      </div>

      {/* Preset Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 text-[11px] font-mono">
        <span className="text-slate-500 text-[10px] uppercase shrink-0">Protocolos:</span>
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectPreset(p.ids)}
            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 whitespace-nowrap transition"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Sequence Chips */}
      <div className="bg-[#070b12] border border-slate-800 rounded-lg p-2.5 mb-3 flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="text-slate-500 text-[10px] uppercase">Secuencia:</span>
        {selectedIds.length === 0 ? (
          <span className="text-slate-500 italic text-[11px]">Selecciona o añade reactivos abajo...</span>
        ) : (
          selectedIds.map((id, idx) => {
            const reagent = CHEMICAL_DATABASE.find(c => c.id === id);
            return (
              <span
                key={`${id}-${idx}`}
                className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-cyan-300"
              >
                <ChemicalText formula={reagent?.formula || id} />
                <button
                  onClick={() => handleRemoveId(idx)}
                  className="text-slate-500 hover:text-red-400 font-bold ml-0.5"
                  title="Eliminar"
                >
                  ✕
                </button>
              </span>
            );
          })
        )}
      </div>

      {/* Quick Add Selector */}
      <div className="flex items-center gap-2 mb-3">
        <select
          onChange={(e) => {
            if (e.target.value) {
              handleAddId(e.target.value);
              e.target.value = '';
            }
          }}
          className="bg-[#070b12] border border-slate-800 text-xs font-mono text-slate-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-cyan-500/50"
          defaultValue=""
        >
          <option value="" disabled>+ Añadir reactivo a la mezcla...</option>
          {CHEMICAL_DATABASE.map(c => (
            <option key={c.id} value={c.id}>
              {c.formula} — {c.nombre}
            </option>
          ))}
        </select>

        {onAskProfessor && (
          <button
            onClick={() => onAskProfessor(`Explica detalladamente la reacción y mecanismo entre ${selectedIds.join(' + ')}`)}
            className="px-2.5 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 text-slate-300 hover:text-white rounded transition shrink-0"
            title="Enviar consulta de esta mezcla al chat del Profesor"
          >
            Consultar al Chat
          </button>
        )}
      </div>

      {/* Main Equations Results Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
        {result ? (
          <>
            <div className="bg-[#070b12] border border-cyan-500/30 rounded-lg p-3">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block mb-1">
                Ecuación Química Balanceada
              </span>
              <EquationMath equation={result.balancedEquation} className="text-cyan-200 text-sm font-bold block my-1" />
              {result.enthalpy && (
                <div className="text-[11px] font-mono text-amber-400 mt-1">
                  Termodinámica: <span className="text-slate-200 font-semibold">{result.enthalpy}</span>
                </div>
              )}
            </div>

            {result.ionicEquationNet && (
              <div className="bg-[#070b12] border border-slate-800 rounded-lg p-3">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1">
                  Ecuación Iónica Neta
                </span>
                <EquationMath equation={result.ionicEquationNet} className="text-emerald-300 text-sm font-bold block" />
                {result.spectatorIons && result.spectatorIons.length > 0 && (
                  <div className="text-[10px] font-mono text-slate-400 mt-1.5">
                    Iones espectadores: {result.spectatorIons.join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* Step by step mechanics */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Pasos de Transferencia Iónica:
              </span>
              {result.steps.map((st) => (
                <div key={st.stepNumber} className="bg-[#070b12] border border-slate-800/80 rounded-lg p-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-[10px] flex items-center justify-center font-bold">
                      {st.stepNumber}
                    </span>
                    <span className="font-mono text-xs font-semibold text-white">{st.title}</span>
                  </div>
                  <div className="bg-slate-900/80 p-1.5 rounded mb-1 text-[11px]">
                    <EquationMath equation={st.equation} />
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{st.description}</p>
                </div>
              ))}
            </div>

            {/* AI Deep Analysis if fetched */}
            {aiAnalysis && (
              <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold text-xs mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Derivación Científica del Profesor IA:</span>
                </div>
                <div className="text-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                  {aiAnalysis}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-slate-500 font-mono text-xs flex flex-col items-center justify-center h-full">
            <AlertCircle className="w-8 h-8 mb-2 text-slate-600" />
            <span>Selecciona reactivos para visualizar la derivación estequiométrica en KaTeX.</span>
          </div>
        )}
      </div>
    </div>
  );
};
