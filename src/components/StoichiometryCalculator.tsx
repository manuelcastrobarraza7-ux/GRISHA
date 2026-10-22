import React, { useState } from 'react';
import { ChemicalReagent } from '../data/chemicals';
import { Scale, Calculator, ArrowRight, Layers, Sparkles, CheckCircle2 } from 'lucide-react';

interface StoichiometryCalculatorProps {
  selectedReagents: ChemicalReagent[];
}

export const StoichiometryCalculator: React.FC<StoichiometryCalculatorProps> = ({ selectedReagents }) => {
  // Input masses (in grams) for each reagent index
  const [massInputs, setMassInputs] = useState<Record<number, string>>({ 0: '10.0', 1: '10.0', 2: '10.0' });

  const handleMassChange = (index: number, val: string) => {
    setMassInputs(prev => ({ ...prev, [index]: val }));
  };

  const validReagents = selectedReagents.filter((r): r is ChemicalReagent => Boolean(r && r.id));

  // Compute moles and limiting reagent
  const calculatedData = React.useMemo(() => {
    if (validReagents.length === 0) return { items: [], limitingIndex: 0, theoreticalYieldGrams: 0, productMolarMass: 58.44 };

    const items = validReagents.map((reagent, idx) => {
      const massG = parseFloat(massInputs[idx]) || 0;
      const molarMass = reagent.molarMass || 1.0;
      const moles = molarMass > 0 ? massG / molarMass : 0;
      const stoichCoeff = 1;
      const molesRatio = moles / stoichCoeff;

      return {
        reagent,
        massG,
        molarMass,
        moles,
        molesRatio,
      };
    });

    // Find limiting reactant (smallest molesRatio)
    let limitingIndex = 0;
    let minRatio = items[0]?.molesRatio ?? 0;
    items.forEach((item, idx) => {
      if (item.molesRatio < minRatio) {
        minRatio = item.molesRatio;
        limitingIndex = idx;
      }
    });

    // Theoretical yield based on limiting reagent moles
    const limitingMoles = items[limitingIndex]?.moles || 0;
    const productMolarMass = items.reduce((acc, curr) => acc + curr.molarMass, 0) / Math.max(1, items.length);
    const theoreticalYieldGrams = limitingMoles * productMolarMass;

    return {
      items,
      limitingIndex,
      theoreticalYieldGrams,
      productMolarMass: productMolarMass || 58.44
    };
  }, [validReagents, massInputs]);

  if (validReagents.length === 0) {
    return (
      <div className="bg-[#0b111a] border border-cyan-500/20 rounded-xl p-4 text-xs font-mono text-slate-400 text-center">
        Selecciona reactivos en el espacio de trabajo para calcular masas molares, moles y rendimiento estequiométrico teórico.
      </div>
    );
  }

  return (
    <div className="bg-[#0b111a] border border-cyan-500/30 rounded-xl p-4 shadow-xl space-y-4 my-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block font-bold">
              Estequiometría & Masas Molares
            </span>
            <h4 className="text-sm font-bold text-white">Calculador de Reactivo Limitante & Rendimiento Teórico</h4>
          </div>
        </div>
      </div>

      {/* Reagents Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
              <th className="py-2 px-2">Reactivo</th>
              <th className="py-2 px-2">Fórmula (PM)</th>
              <th className="py-2 px-2">Masa Ingresada (g)</th>
              <th className="py-2 px-2">Moles (n = m/PM)</th>
              <th className="py-2 px-2">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {calculatedData.items.map((item, idx) => {
              const isLimiting = idx === calculatedData.limitingIndex;
              return (
                <tr key={`${item.reagent.id}-${idx}`} className={isLimiting ? 'bg-cyan-950/20' : ''}>
                  <td className="py-2 px-2 font-bold text-white flex items-center gap-1.5">
                    <span>{item.reagent.formula}</span>
                    {isLimiting && (
                      <span className="bg-cyan-500/20 text-cyan-300 text-[9px] px-1.5 py-0.5 rounded border border-cyan-500/40">
                        Limitante
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-cyan-300">
                    {item.molarMass > 0 ? `${item.molarMass} g/mol` : 'N/A'}
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      step="0.1"
                      value={massInputs[idx] ?? '10.0'}
                      onChange={(e) => handleMassChange(idx, e.target.value)}
                      className="w-24 bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-2 text-emerald-300 font-bold">
                    {item.moles.toFixed(4)} mol
                  </td>
                  <td className="py-2 px-2 text-slate-400 capitalize">
                    {item.reagent.state}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Yield Summary Card */}
      <div className="bg-[#070b12] border border-slate-800 rounded-lg p-3 grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Reactivo Limitante:</span>
          <span className="text-cyan-400 font-bold text-sm">
            {validReagents[calculatedData.limitingIndex]?.nombre} ({validReagents[calculatedData.limitingIndex]?.formula})
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Masa Molar Producto Estimado:</span>
          <span className="text-slate-200 font-bold">
            ~{calculatedData.productMolarMass.toFixed(2)} g/mol
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Producto Teórico Esperado:</span>
          <span className="text-emerald-400 font-bold text-sm">
            ~{calculatedData.theoreticalYieldGrams.toFixed(2)} g
          </span>
        </div>
      </div>
    </div>
  );
};
