import React, { useState, useMemo } from 'react';
import { ChemicalReagent } from '../data/chemicals';
import { analyzeReactionChain, ReactionResult } from '../data/reactions';
import { SafetyCard } from './SafetyCard';
import { DilutionCalculator } from './DilutionCalculator';
import { EnthalpyChart } from './EnthalpyChart';
import { StoichiometryCalculator } from './StoichiometryCalculator';
import { ChemicalText, EquationMath } from './ChemicalLatex';
import { 
  Sparkles, 
  Trash2, 
  ArrowRight, 
  BookOpen, 
  Layers, 
  Lightbulb, 
  Zap, 
  Loader2, 
  Brain, 
  Calculator,
  Thermometer,
  ThermometerSun,
  ThermometerSnowflake,
  Flame,
  AlertTriangle,
  Activity,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

/* ========================================================================= */
/* BASE DE DATOS TERMODINÁMICA: ENTALPÍAS ESTÁNDAR DE FORMACIÓN ΔH°f (kJ/mol) */
/* ========================================================================= */
export const FORMATION_ENTHALPIES: Record<string, number> = {
  // Ácidos
  'HCl': -92.31,
  'H2SO4': -814.0,
  'HNO3': -174.1,
  'CH3COOH': -484.5,
  'H3PO4': -1279.0,
  'C6H8O7': -1543.8,
  'H2CO3': -619.9,
  // Bases
  'LiOH': -487.5,
  'NaOH': -425.6,
  'KOH': -424.8,
  'Ca(OH)2': -986.1,
  'Mg(OH)2': -924.5,
  'Ba(OH)2': -944.7,
  'NH4OH': -366.5,
  'Al(OH)3': -1277.0,
  'Fe(OH)3': -823.0,
  'Cu(OH)2': -450.4,
  'Zn(OH)2': -641.9,
  // Sales
  'NaCl': -411.2,
  'KCl': -436.5,
  'KNO3': -494.6,
  'NaNO3': -467.9,
  'K2SO4': -1437.8,
  'Na2SO4': -1387.1,
  'CuSO4': -771.4,
  'CaCO3': -1206.9,
  'NaHCO3': -950.8,
  'Na2CO3': -1130.7,
  'NH4NO3': -365.6,
  '(NH4)2SO4': -1180.9,
  'CaCl2': -795.8,
  'MgCl2': -641.6,
  'BaCl2': -858.6,
  'FeCl3': -399.5,
  'AgNO3': -124.4,
  'KI': -327.9,
  'NaOCl': -346.0,
  'KMnO4': -837.2,
  'KClO3': -397.7,
  'KClO4': -432.8,
  'NH4Cl': -314.4,
  'NaH2PO4': -1537.0,
  'Na2HPO4': -1748.0,
  'K3PO4': -1988.0,
  'Ca3(PO4)2': -4121.0,
  'Na2S': -364.8,
  'FeS': -100.0,
  'CuS': -53.1,
  'ZnS': -206.0,
  'Na2CrO4': -1342.2,
  'K2Cr2O7': -2068.5,
  'KIO3': -501.0,
  'NaIO3': -508.0,
  'Na2B4O7': -3291.0,
  'LiCH3COO': -700.0,
  'NaCH3COO': -708.8,
  'KCH3COO': -723.0,
  'Ca(CH3COO)2': -1480.0,
  'Al2(SO4)3': -3440.8,
  'FeSO4': -928.4,
  'MgSO4': -1284.9,
  // Elementos (ΔH°f = 0 por definición termodinámica en estado de referencia)
  'Al': 0.0,
  'Fe': 0.0,
  'Cu': 0.0,
  'Zn': 0.0,
  'Mg': 0.0,
  'O2': 0.0,
  'H2': 0.0,
  'N2': 0.0,
  'C': 0.0,
  'S': 0.0,
  'Cl2': 0.0,
  // Orgánicos / Otros
  'Azucar': -2222.0,
  'Sacarosa': -2222.0,
  'Glucosa': -1273.3,
  'Fenolftaleina': -750.0,
  'H2O2': -187.8,
  'H2O': -285.8,
  'CO2': -393.5,
  'NH3': -45.9,
};

/**
 * Obtiene la entalpía de formación de un reactivo químico, con aproximación consistente por categoría.
 */
export function getFormationEnthalpy(reagent: ChemicalReagent): number {
  if (FORMATION_ENTHALPIES[reagent.id] !== undefined) {
    return FORMATION_ENTHALPIES[reagent.id];
  }
  if (FORMATION_ENTHALPIES[reagent.formula] !== undefined) {
    return FORMATION_ENTHALPIES[reagent.formula];
  }
  const mass = reagent.molarMass || 60;
  if (reagent.categoria === 'elementos') return 0;
  if (reagent.categoria === 'sales') return -Math.round(mass * 4.5);
  if (reagent.categoria === 'acidos') return -Math.round(mass * 5.0);
  if (reagent.categoria === 'bases') return -Math.round(mass * 6.0);
  if (reagent.categoria === 'organicos') return -Math.round(mass * 4.0);
  return -Math.round(mass * 3.5);
}

/* ========================================================================= */
/* HOOK: useThermodynamicInstability                                         */
/* Calcula el índice de inestabilidad termodinámica a partir de la suma de   */
/* entalpías de formación y factores de acoplamiento reactivo de la mezcla.  */
/* ========================================================================= */
export interface ReagentEnthalpyDetail {
  id: string;
  nombre: string;
  formula: string;
  categoria: string;
  deltaHf: number; // kJ/mol
  instabilityNfpa: number;
  flammabilityNfpa: number;
}

export interface ThermodynamicInstabilityResult {
  totalEnthalpy: number; // Suma de entalpías de formación en kJ/mol
  averageEnthalpy: number; // Entalpía media en kJ/mol
  instabilityIndex: number; // Índice normalizado 0 a 100
  riskLevel: 'Estable' | 'Moderado' | 'Elevado' | 'Crítico';
  riskLabel: string;
  colorHex: string;
  themeClasses: {
    border: string;
    bg: string;
    text: string;
    badge: string;
    glow: string;
    barGradient: string;
  };
  estimatedTempRise: number; // Estimación de salto adiabático ΔT en °C
  alerts: string[];
  details: ReagentEnthalpyDetail[];
  reagentCount: number;
}

export function useThermodynamicInstability(
  selectedReagents: ChemicalReagent[]
): ThermodynamicInstabilityResult {
  return useMemo(() => {
    const valid = selectedReagents.filter((r): r is ChemicalReagent => Boolean(r && r.id));

    if (valid.length === 0) {
      return {
        totalEnthalpy: 0,
        averageEnthalpy: 0,
        instabilityIndex: 0,
        riskLevel: 'Estable',
        riskLabel: 'En Reposo (0 reactivos seleccionados)',
        colorHex: '#10b981',
        themeClasses: {
          border: 'border-emerald-500/30',
          bg: 'bg-emerald-950/20',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          glow: 'rgba(16, 185, 129, 0.25)',
          barGradient: 'from-emerald-500 to-teal-400',
        },
        estimatedTempRise: 0,
        alerts: ['Añade reactivos a la secuencia para calcular el índice termodinámico.'],
        details: [],
        reagentCount: 0,
      };
    }

    const details: ReagentEnthalpyDetail[] = valid.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      formula: r.formula,
      categoria: r.categoria,
      deltaHf: getFormationEnthalpy(r),
      instabilityNfpa: r.nfpa?.instability ?? 0,
      flammabilityNfpa: r.nfpa?.flammability ?? 0,
    }));

    // Suma de las entalpías estándar de formación: Σ ΔH°f
    const totalEnthalpy = details.reduce((sum, d) => sum + d.deltaHf, 0);
    const averageEnthalpy = totalEnthalpy / details.length;

    // Componente base: sustancias con entalpías de formación menos negativas o positivas
    // guardan mayor potencial químico libre susceptible a liberarse exotérmicamente
    const enthalpyBaseline = Math.max(5, Math.min(42, Math.round(((averageEnthalpy + 1200) / 1200) * 35)));

    // Factores de acoplamiento termodinámico y reactividad química
    let couplingPoints = 0;
    const alerts: string[] = [];

    const hasAcid = valid.some((r) => r.categoria === 'acidos');
    const hasBase = valid.some((r) => r.categoria === 'bases');
    if (hasAcid && hasBase) {
      couplingPoints += 28;
      alerts.push('Acoplamiento Ácido-Base fuertemente exotérmico (neutralización iónica rápida, ΔH ≈ -57.3 kJ/mol).');
    }

    const oxidizers = ['HNO3', 'H2O2', 'KMnO4', 'KClO3', 'KClO4', 'NaOCl'];
    const fuels = ['Azucar', 'Glucosa', 'Al', 'Mg', 'Zn', 'H2', 'Fe', 'C'];
    const hasOxidizer = valid.some((r) => oxidizers.includes(r.id) || r.nfpa?.special === 'OX');
    const hasFuel = valid.some((r) => fuels.includes(r.id) || r.categoria === 'organicos');
    if (hasOxidizer && hasFuel) {
      couplingPoints += 34;
      alerts.push('Potencial Redox extremo (Agente oxidante activo acoplado con reductor orgánico/metálico).');
    }

    const hasWaterSensitive = valid.some((r) => r.nfpa?.special === 'W' || r.id === 'H2SO4');
    if (hasWaterSensitive && valid.length > 1) {
      couplingPoints += 14;
      alerts.push('Reactivo altamente ávido de agua o deshidratante (riesgo de ebullición violenta localizada).');
    }

    const maxNfpaInstability = Math.max(...details.map((d) => d.instabilityNfpa));
    const maxNfpaFlammability = Math.max(...details.map((d) => d.flammabilityNfpa));
    couplingPoints += maxNfpaInstability * 8 + maxNfpaFlammability * 4;

    const rawIndex = Math.round(enthalpyBaseline + couplingPoints);
    const instabilityIndex = Math.min(100, Math.max(5, rawIndex));

    let riskLevel: 'Estable' | 'Moderado' | 'Elevado' | 'Crítico';
    let riskLabel: string;
    let colorHex: string;
    let themeClasses: ThermodynamicInstabilityResult['themeClasses'];

    if (instabilityIndex <= 28) {
      riskLevel = 'Estable';
      riskLabel = 'Bajo Riesgo / Termodinámicamente Estable';
      colorHex = '#10b981';
      themeClasses = {
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-950/20',
        text: 'text-emerald-400',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        glow: 'rgba(16, 185, 129, 0.3)',
        barGradient: 'from-emerald-500 to-teal-400',
      };
    } else if (instabilityIndex <= 54) {
      riskLevel = 'Moderado';
      riskLabel = 'Riesgo Moderado / Exotermia Controlable';
      colorHex = '#06b6d4';
      themeClasses = {
        border: 'border-cyan-500/30',
        bg: 'bg-cyan-950/20',
        text: 'text-cyan-400',
        badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
        glow: 'rgba(6, 182, 212, 0.3)',
        barGradient: 'from-cyan-500 to-blue-500',
      };
    } else if (instabilityIndex <= 78) {
      riskLevel = 'Elevado';
      riskLabel = 'Riesgo Elevado / Desprendimiento Térmico Acelerado';
      colorHex = '#f59e0b';
      themeClasses = {
        border: 'border-amber-500/40',
        bg: 'bg-amber-950/20',
        text: 'text-amber-400',
        badge: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
        glow: 'rgba(245, 158, 11, 0.35)',
        barGradient: 'from-amber-500 to-orange-500',
      };
    } else {
      riskLevel = 'Crítico';
      riskLabel = 'Inestabilidad Crítica / Reacción Altamente Exotérmica';
      colorHex = '#ef4444';
      themeClasses = {
        border: 'border-rose-500/50',
        bg: 'bg-rose-950/30',
        text: 'text-rose-400',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse',
        glow: 'rgba(239, 68, 68, 0.45)',
        barGradient: 'from-rose-500 via-red-500 to-amber-500',
      };
    }

    const estimatedTempRise = Math.round(8 + (instabilityIndex / 100) * 80 * Math.sqrt(valid.length));

    return {
      totalEnthalpy: Math.round(totalEnthalpy * 10) / 10,
      averageEnthalpy: Math.round(averageEnthalpy * 10) / 10,
      instabilityIndex,
      riskLevel,
      riskLabel,
      colorHex,
      themeClasses,
      estimatedTempRise,
      alerts,
      details,
      reagentCount: valid.length,
    };
  }, [selectedReagents]);
}

/* ========================================================================= */
/* COMPONENTE: INDICADOR VISUAL TIPO TERMÓMETRO DE RIESGO TERMODINÁMICO       */
/* ========================================================================= */
export const ThermodynamicRiskThermometer: React.FC<{
  instability: ThermodynamicInstabilityResult;
}> = ({ instability }) => {
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  const {
    totalEnthalpy,
    averageEnthalpy,
    instabilityIndex,
    riskLevel,
    riskLabel,
    themeClasses,
    estimatedTempRise,
    alerts,
    details,
    reagentCount,
    colorHex,
  } = instability;

  const isCritical = riskLevel === 'Crítico';
  const isElevated = riskLevel === 'Elevado';

  return (
    <div className={`my-3 bg-[#070c14] border ${themeClasses.border} rounded-xl p-3.5 shadow-lg relative overflow-hidden transition-all duration-300`}>
      {/* Background ambient thermal glow */}
      <div 
        className="absolute top-0 right-0 w-52 h-40 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-500"
        style={{ backgroundColor: colorHex }}
      />

      {/* Thermometer Instrument Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${themeClasses.bg} border ${themeClasses.border} ${themeClasses.text} flex items-center justify-center`}>
            {isCritical || isElevated ? (
              <Flame className={`w-4 h-4 ${isCritical ? 'animate-bounce text-rose-400' : 'text-amber-400'}`} />
            ) : reagentCount === 0 ? (
              <ThermometerSnowflake className="w-4 h-4 text-emerald-400" />
            ) : (
              <ThermometerSun className="w-4 h-4 text-cyan-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                Termodinámica Cuantitativa
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Σ ΔH°f
              </span>
            </div>
            <h4 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
              <span>Termómetro de Riesgo e Inestabilidad Térmica</span>
            </h4>
          </div>
        </div>

        {/* Dynamic Risk Badge */}
        <div className="flex items-center gap-2">
          <div className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border flex items-center gap-1.5 ${themeClasses.badge}`}>
            {isCritical && <AlertTriangle className="w-3.5 h-3.5 animate-pulse text-rose-400" />}
            {!isCritical && !isElevated && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
            {isElevated && <Activity className="w-3.5 h-3.5 text-amber-400" />}
            <span>{riskLevel.toUpperCase()}</span>
            <span className="text-[10px] opacity-75">({instabilityIndex}%)</span>
          </div>
        </div>
      </div>

      {/* Main Thermometer Column & Readouts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Left Col: Physical Stylized Laboratory Thermometer (Visual Tube + Mercury Bulb) */}
        <div className="md:col-span-4 bg-[#0a0f19] border border-slate-800/90 rounded-lg p-2.5 flex items-center justify-center gap-3">
          {/* Vertical Glass Thermometer */}
          <div className="flex items-center gap-1.5">
            {/* Calibration scale labels */}
            <div className="flex flex-col justify-between h-28 text-[8px] font-mono text-slate-500 select-none text-right py-0.5">
              <span className="text-rose-400 font-bold">100°</span>
              <span className="text-amber-400">75°</span>
              <span className="text-cyan-400">50°</span>
              <span className="text-emerald-400">25°</span>
              <span className="text-slate-400">0°</span>
            </div>

            {/* Graduated Tick Marks */}
            <div className="flex flex-col justify-between h-28 w-2 py-1 select-none">
              <div className="w-2 h-0.5 bg-rose-500/70" />
              <div className="w-1.5 h-0.5 bg-slate-700" />
              <div className="w-2 h-0.5 bg-amber-500/70" />
              <div className="w-1.5 h-0.5 bg-slate-700" />
              <div className="w-2 h-0.5 bg-cyan-500/70" />
              <div className="w-1.5 h-0.5 bg-slate-700" />
              <div className="w-2 h-0.5 bg-emerald-500/70" />
              <div className="w-1.5 h-0.5 bg-slate-700" />
              <div className="w-2 h-0.5 bg-slate-600" />
            </div>

            {/* Glass Tube Container */}
            <div className="flex flex-col items-center">
              {/* Stem Glass Tube */}
              <div className="w-3.5 h-28 rounded-t-full bg-slate-900/90 border border-slate-700 relative overflow-hidden flex flex-col justify-end shadow-inner p-0.5">
                {/* Specular glass reflection line */}
                <div className="absolute left-0.5 top-0 bottom-0 w-0.5 bg-white/20 rounded-full z-10 pointer-events-none" />

                {/* Mercury Liquid Column */}
                <div
                  className={`w-full rounded-t-sm transition-all duration-700 ease-out bg-gradient-to-t ${themeClasses.barGradient} relative`}
                  style={{
                    height: `${reagentCount === 0 ? 4 : Math.max(6, instabilityIndex)}%`,
                    boxShadow: `0 0 10px ${colorHex}`,
                  }}
                >
                  {/* Meniscus curvature highlight */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 rounded-full" />
                </div>
              </div>

              {/* Spherical Mercury Bulb at the bottom */}
              <div
                className="w-6 h-6 -mt-1.5 rounded-full border-2 border-slate-700 relative flex items-center justify-center transition-all duration-500"
                style={{
                  backgroundColor: colorHex,
                  boxShadow: `0 0 14px ${colorHex}`,
                }}
              >
                {/* Specular curved reflection on the bulb */}
                <div className="w-2 h-2 rounded-full bg-white/50 absolute top-1 left-1 blur-[0.5px]" />
                <div className="w-1 h-1 rounded-full bg-white/70 absolute top-1.5 left-1.5" />
              </div>
            </div>
          </div>

          {/* Quick Gauge summary next to the tube */}
          <div className="flex flex-col justify-center space-y-1 font-mono">
            <div className="text-[10px] uppercase text-slate-400">Nivel de Riesgo</div>
            <div className="text-xl font-black text-white tracking-tight flex items-baseline gap-1">
              <span>{instabilityIndex}</span>
              <span className="text-xs font-semibold text-slate-400">%</span>
            </div>
            <div className="text-[11px] text-slate-300 font-sans leading-tight">
              {reagentCount === 0 ? 'Sin reactivos' : riskLabel}
            </div>
            {reagentCount > 0 && (
              <div className="text-[10px] text-amber-300/90 flex items-center gap-1 font-mono pt-0.5">
                <Flame className="w-3 h-3 text-amber-400 shrink-0" />
                <span>ΔT est: ~+{estimatedTempRise} °C</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Thermodynamic Values, Horizontal Gauge & Diagnostics */}
        <div className="md:col-span-8 space-y-2.5">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="bg-[#0a0f19] border border-slate-800 rounded-lg p-2">
              <div className="text-[9px] font-mono uppercase text-slate-400 flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span>Suma de Entalpías (Σ ΔH°f)</span>
              </div>
              <div className="text-xs font-mono font-bold text-white mt-0.5">
                {reagentCount === 0 ? '0.0 kJ/mol' : `${totalEnthalpy > 0 ? '+' : ''}${totalEnthalpy} kJ/mol`}
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                {reagentCount === 0 ? 'Vacío' : `${reagentCount} compuesto${reagentCount > 1 ? 's' : ''}`}
              </div>
            </div>

            <div className="bg-[#0a0f19] border border-slate-800 rounded-lg p-2">
              <div className="text-[9px] font-mono uppercase text-slate-400 flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-amber-400" />
                <span>Entalpía Media (ΔH°f prom)</span>
              </div>
              <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                {reagentCount === 0 ? '0.0 kJ/mol' : `${averageEnthalpy > 0 ? '+' : ''}${averageEnthalpy} kJ/mol`}
              </div>
              <div className="text-[9px] text-slate-400 font-mono">Por reactivo</div>
            </div>

            <div className="bg-[#0a0f19] border border-slate-800 rounded-lg p-2 col-span-2 sm:col-span-1">
              <div className="text-[9px] font-mono uppercase text-slate-400 flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-400" />
                <span>Potencial Térmico</span>
              </div>
              <div className={`text-xs font-mono font-bold mt-0.5 ${themeClasses.text}`}>
                {reagentCount === 0 ? 'Estable (0)' : `Índice ${instabilityIndex}/100`}
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                {instabilityIndex > 75 ? 'Riesgo Crítico' : instabilityIndex > 50 ? 'Exotermia Alta' : 'Controlado'}
              </div>
            </div>
          </div>

          {/* Horizontal Track Bar Visualizer */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorHex }} />
                <span>Escala Termodinámica de Inestabilidad:</span>
              </span>
              <span className="font-bold text-slate-300">{instabilityIndex} / 100</span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5 relative">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${themeClasses.barGradient}`}
                style={{
                  width: `${reagentCount === 0 ? 0 : Math.max(4, instabilityIndex)}%`,
                  boxShadow: `0 0 8px ${colorHex}`,
                }}
              />
            </div>
            <div className="flex justify-between text-[8px] font-mono text-slate-500 px-0.5">
              <span>0% Estable</span>
              <span>25% Neutro</span>
              <span>50% Moderado</span>
              <span>75% Elevado</span>
              <span>100% Crítico</span>
            </div>
          </div>

          {/* Specific chemical safety coupling alerts if triggered */}
          {alerts.length > 0 && reagentCount > 0 && (
            <div className="space-y-1 pt-1">
              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className={`text-[10px] font-mono rounded px-2 py-1 flex items-start gap-1.5 ${
                    isCritical
                      ? 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
                      : isElevated
                      ? 'bg-amber-950/40 border border-amber-500/40 text-amber-300'
                      : 'bg-cyan-950/30 border border-cyan-500/30 text-cyan-300'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                  <span>{alert}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expandable Reagent Enthalpy Breakdown Drawer */}
      {reagentCount > 0 && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setShowBreakdown((prev) => !prev)}
            className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 flex items-center justify-between w-full py-1 px-1 rounded transition"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3 h-3 text-cyan-400" />
              <span>Ver balance individual de entalpías estándar de formación (ΔH°f)</span>
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              {showBreakdown ? (
                <>
                  <span>Ocultar</span>
                  <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  <span>Desplegar ({details.length})</span>
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </span>
          </button>

          {showBreakdown && (
            <div className="mt-2 bg-[#0a0f19] border border-slate-800 rounded-lg p-2.5 space-y-2 animate-fadeIn">
              <div className="text-[10px] font-mono text-slate-400 flex justify-between border-b border-slate-800 pb-1">
                <span>Reactivo en Cadena</span>
                <span>Entalpía de Formación (ΔH°f)</span>
                <span>Inestabilidad NFPA</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {details.map((d, idx) => (
                  <div
                    key={`${d.id}-${idx}`}
                    className="flex items-center justify-between text-xs font-mono bg-slate-900/70 border border-slate-800 rounded px-2 py-1"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-cyan-300 font-bold">{d.formula}</span>
                      <span className="text-[10px] text-slate-400 hidden sm:inline">({d.nombre})</span>
                    </div>

                    <div className="font-bold flex items-center gap-1">
                      <span className={d.deltaHf <= -500 ? 'text-blue-400' : d.deltaHf <= 0 ? 'text-amber-400' : 'text-rose-400'}>
                        {d.deltaHf > 0 ? `+${d.deltaHf}` : d.deltaHf} kJ/mol
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-slate-500 uppercase">NFPA Inst:</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          d.instabilityNfpa >= 3
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : d.instabilityNfpa >= 1
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {d.instabilityNfpa}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-[9px] text-slate-400 font-mono text-right pt-1 border-t border-slate-800 flex justify-between">
                <span className="text-slate-500">Ley de Hess: Σ ΔH°f(reactivos) = {totalEnthalpy} kJ/mol</span>
                <span className="text-cyan-400 font-semibold">Base de cálculo estándar (298.15 K, 1 atm)</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface ReactionWorkspaceProps {
  selectedReagents: ChemicalReagent[];
  onRemoveReagent: (index: number) => void;
  onClearWorkspace: () => void;
  onLoadPreset: (reagentIds: string[]) => void;
}

export const ReactionWorkspace: React.FC<ReactionWorkspaceProps> = ({
  selectedReagents,
  onRemoveReagent,
  onClearWorkspace,
  onLoadPreset,
}) => {
  const [reactionResult, setReactionResult] = useState<ReactionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [useHighThinking, setUseHighThinking] = useState<boolean>(false);
  const [aiCustomInsight, setAiCustomInsight] = useState<string | null>(null);
  const [showDilutionCalculator, setShowDilutionCalculator] = useState<boolean>(false);

  // Hook que calcula el índice de inestabilidad termodinámica basado en la suma de entalpías de formación
  const thermoInstability = useThermodynamicInstability(selectedReagents);

  // Estados de control ambiental en tiempo real (Temperatura y Presión)
  const [temperatureK, setTemperatureK] = useState<number>(298.15); // Kelvin (25°C)
  const [pressureAtm, setPressureAtm] = useState<number>(1.0); // atm

  // Cálculo estequiométrico, cinético y de equilibrio en tiempo real según T y P
  const { arrheniusFactor, equilibriumYield, adjustedEnthalpy } = useMemo(() => {
    const deltaT = temperatureK - 298.15;
    const arrhenius = Math.exp(-3500 * ((1 / temperatureK) - (1 / 298.15)));
    const baseH = thermoInstability.totalEnthalpy;
    const adjH = baseH + 0.05 * deltaT;

    let baseYield = 85.0;
    if (baseH < -100) {
      baseYield = Math.max(15, 95 - (temperatureK - 298.15) * 0.08 + (pressureAtm - 1) * 0.5);
    } else if (baseH > 100) {
      baseYield = Math.min(99, 40 + (temperatureK - 298.15) * 0.07 + (pressureAtm - 1) * 0.3);
    } else {
      baseYield = Math.max(30, 90 - Math.abs(temperatureK - 298.15) * 0.04 + (pressureAtm - 1) * 0.4);
    }
    const finalYield = Math.min(100, Math.max(5, baseYield));

    return {
      arrheniusFactor: Math.round(arrhenius * 100) / 100,
      equilibriumYield: Math.round(finalYield * 10) / 10,
      adjustedEnthalpy: Math.round(adjH * 10) / 10,
    };
  }, [temperatureK, pressureAtm, thermoInstability.totalEnthalpy]);

  const handleExecuteReaction = async () => {
    if (selectedReagents.length === 0) return;

    setIsAnalyzing(true);
    setAiCustomInsight(null);

    // 1. Instant local scientific analysis
    const validReagents = selectedReagents.filter((r): r is ChemicalReagent => Boolean(r && r.id));
    if (validReagents.length === 0) return;
    const reagentIds = validReagents.map((r) => r.id);
    const localResult = analyzeReactionChain(reagentIds);
    setReactionResult(localResult);

    // 2. Call backend Gemini endpoint for deep explanation
    try {
      const response = await fetch('/api/analyze-reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reactants: reagentIds,
          useHighThinking,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.analysis) {
          setAiCustomInsight(data.analysis);
        }
      }
    } catch (err) {
      console.warn('Backend reaction analysis call completed with local engine fallback:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Workspace Chain Container */}
      <div className="bg-[#0b111a] border border-cyan-500/20 rounded-xl p-4 shadow-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Workspace Title & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Espacio de Trabajo & Secuencia de Reacción
            </h3>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              {selectedReagents.length} en cadena
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={useHighThinking}
                onChange={(e) => setUseHighThinking(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
              />
              <Brain className={`w-3.5 h-3.5 ${useHighThinking ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span className="text-[11px]">Razonamiento Profundo (Gemini 4 Argon)</span>
            </label>

            {selectedReagents.length > 0 && (
              <button
                onClick={onClearWorkspace}
                className="text-[11px] font-mono text-slate-400 hover:text-red-400 px-2 py-1 rounded hover:bg-slate-800/80 transition flex items-center gap-1"
                title="Limpiar secuencia"
              >
                <Trash2 className="w-3 h-3" /> Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Reaction Sequence Visualizer */}
        <div className="min-h-[70px] bg-[#070b12] border border-slate-800 rounded-lg p-3 flex flex-wrap items-center gap-2 font-mono text-sm mb-3">
          {selectedReagents.length === 0 ? (
            <span className="text-slate-500 text-xs italic">
              Selecciona reactivos del catálogo o pulsa uno de los protocolos rápidos abajo...
            </span>
          ) : (
            selectedReagents
              .filter((r): r is ChemicalReagent => Boolean(r && r.id))
              .map((reagent, idx, arr) => (
                <React.Fragment key={`${reagent.id}-${idx}`}>
                  <div className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-700 text-cyan-300 px-2.5 py-1 rounded-md text-xs shadow-sm group">
                    <ChemicalText formula={reagent.formula} name={reagent.nombre} />
                    <button
                      onClick={() => onRemoveReagent(idx)}
                      className="text-slate-500 hover:text-red-400 ml-1 text-xs font-bold leading-none"
                      title="Quitar de la secuencia"
                    >
                      ✕
                    </button>
                  </div>
                  {idx < arr.length - 1 && (
                    <span className="text-cyan-400 font-extrabold text-xs">+</span>
                  )}
                </React.Fragment>
              ))
          )}
        </div>

        {/* Panel de Control Ambiental Deslizante (Temperatura y Presión en Tiempo Real) */}
        <div className="bg-[#070b12] border border-cyan-500/30 rounded-xl p-3.5 mb-4 space-y-3 font-mono text-xs shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-cyan-400" /> Control Ambiental en Tiempo Real ($T$ y $P$)
            </span>
            <button
              onClick={() => { setTemperatureK(298.15); setPressureAtm(1.0); }}
              className="text-[10px] text-slate-400 hover:text-white bg-slate-900 border border-slate-700 px-2 py-0.5 rounded transition"
            >
              Restablecer STP (25°C, 1 atm)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Temperature Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Temperatura Ambiente ($T$):</span>
                <span className="text-cyan-400 font-bold">
                  {temperatureK.toFixed(1)} K ({ (temperatureK - 273.15).toFixed(1) } °C)
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="1000"
                step="5"
                value={temperatureK}
                onChange={(e) => setTemperatureK(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>200 K (-73°C)</span>
                <span>298 K (STP)</span>
                <span>1000 K (727°C)</span>
              </div>
            </div>

            {/* Pressure Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Presión del Sistema ($P$):</span>
                <span className="text-emerald-400 font-bold">{pressureAtm.toFixed(1)} atm</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="50"
                step="0.5"
                value={pressureAtm}
                onChange={(e) => setPressureAtm(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.1 atm (Vacío)</span>
                <span>1.0 atm (STP)</span>
                <span>50 atm (Alta P)</span>
              </div>
            </div>
          </div>

          {/* Thermodynamic & Stoichiometric Impact Summary Badge */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Factor Cinético ($k$ Arrhenius): <strong className="text-white font-mono">{arrheniusFactor.toFixed(2)}x</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Rendimiento de Equilibrio Estequiométrico:</span>
              <strong className={`font-mono font-extrabold ${equilibriumYield >= 80 ? 'text-emerald-400' : equilibriumYield >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                {equilibriumYield.toFixed(1)}%
              </strong>
            </div>
          </div>
        </div>

        {/* Indicador Visual Tipo Termómetro de Riesgo Termodinámico */}
        <ThermodynamicRiskThermometer instability={thermoInstability} />

        {/* Quick Example Sequence Chips */}
        <div className="mb-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
            Protocolos de Ensayo Rápidos (Ejemplos Oficiales):
          </span>
          <div className="flex flex-wrap gap-1.5 text-xs font-mono">
            <button
              onClick={() => onLoadPreset(['HCl', 'NaOH'])}
              className="px-2 py-1 rounded bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition"
            >
              Neutralización HCl + NaOH
            </button>
            <button
              onClick={() => onLoadPreset(['H2SO4', 'KNO3', 'KOH'])}
              className="px-2 py-1 rounded bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 transition font-medium"
            >
              Cadena K₂SO₄ + KNO₃ (Fertilizantes)
            </button>
            <button
              onClick={() => onLoadPreset(['Al', 'O2'])}
              className="px-2 py-1 rounded bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition"
            >
              Síntesis Alúmina Al + O₂ (Gemas)
            </button>
            <button
              onClick={() => onLoadPreset(['CuSO4', 'NaOH'])}
              className="px-2 py-1 rounded bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition"
            >
              Precipitado Cu(OH)₂
            </button>
            <button
              onClick={() => onLoadPreset(['H2SO4', 'Azucar'])}
              className="px-2 py-1 rounded bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition"
            >
              Deshidratación Azúcar + H₂SO₄
            </button>
            <button
              onClick={() => onLoadPreset(['Fenolftaleina', 'NaOH'])}
              className="px-2 py-1 rounded bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition"
            >
              Viraje Fenolftaleína
            </button>
          </div>
        </div>

        {/* Action Trigger Button & Dilution Calculator Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExecuteReaction}
            disabled={selectedReagents.length === 0 || isAnalyzing}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 ${
              selectedReagents.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 active:scale-[0.99]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Simulando Reacción & Analizando Iones...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>Reaccionar & Analizar Secuencia</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowDilutionCalculator(prev => !prev)}
            className={`px-4 py-2.5 rounded-lg font-mono font-semibold text-xs uppercase tracking-wider transition flex items-center gap-2 border ${
              showDilutionCalculator
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-700'
            }`}
          >
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span>Calculadora Diluciones ($C_1V_1$)</span>
          </button>
        </div>
      </div>

      {/* Dilution Calculator Viewport */}
      {showDilutionCalculator && (
        <div className="animate-fadeIn">
          <DilutionCalculator initialReagent={selectedReagents[0]} />
        </div>
      )}

      {/* Stoichiometry & Molar Mass Calculator Panel */}
      <StoichiometryCalculator selectedReagents={selectedReagents} />

      {/* Results Viewport */}
      {reactionResult && (
        <div className="space-y-4">
          {/* Reaction Header Card */}
          <div className="bg-[#0b111a] border border-cyan-500/30 rounded-xl p-4 shadow-lg">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block mb-0.5">
                  Resultado de la Simulación Química
                </span>
                <h3 className="text-lg font-bold text-white">{reactionResult.title}</h3>
              </div>
              {reactionResult.enthalpy && (
                <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-right">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Termodinámica</span>
                  <span className="text-xs font-mono font-bold text-amber-400">{reactionResult.enthalpy}</span>
                </div>
              )}
            </div>

            {/* Stoichiometric & Net Ionic Equations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 font-mono text-xs">
              <div className="bg-[#070b12] border border-slate-800 rounded-lg p-2.5">
                <span className="text-[10px] uppercase text-slate-400 block mb-1">Ecuación Estequiométrica:</span>
                <EquationMath equation={reactionResult.balancedEquation} className="text-cyan-300 font-bold block text-sm" />
              </div>
              {reactionResult.ionicEquationNet && (
                <div className="bg-[#070b12] border border-slate-800 rounded-lg p-2.5">
                  <span className="text-[10px] uppercase text-slate-400 block mb-1">Ecuación Iónica Neta:</span>
                  <EquationMath equation={reactionResult.ionicEquationNet} className="text-emerald-300 font-bold block text-sm" />
                </div>
              )}
            </div>

            {/* Spectator ions if any */}
            {reactionResult.spectatorIons && reactionResult.spectatorIons.length > 0 && (
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                <span>Iones espectadores (no participan en la entalpía neta):</span>
                <div className="flex gap-1">
                  {reactionResult.spectatorIons.map((ion, i) => (
                    <span key={i} className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                      {ion}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Multi-Step Ionic Mechanics */}
          <div className="bg-[#0b111a] border border-slate-800 rounded-xl p-4 shadow-lg">
            <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4" /> Secuencia Mecanística & Pasos de Intercambio Iónico
            </h4>
            <div className="space-y-3">
              {reactionResult.steps.map((st) => (
                <div key={st.stepNumber} className="bg-[#070b12] border border-slate-800/80 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center border border-cyan-500/40">
                      {st.stepNumber}
                    </span>
                    <span className="text-xs font-bold text-white font-mono">{st.title}</span>
                  </div>
                  <div className="font-mono text-xs text-cyan-300 bg-slate-900/60 p-2 rounded mb-2 border border-slate-800">
                    <EquationMath equation={st.equation} />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{st.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Professor IA Module (Detailed Didactic Teaching & Real World Context) */}
          <div className="bg-[#0b111a] border border-cyan-500/20 rounded-xl p-5 shadow-lg relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block font-semibold">
                    Módulo del Profesor IA
                  </span>
                  <h4 className="text-sm font-bold text-white">Explicación Didáctica & Contexto Científico</h4>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <p className="font-medium text-slate-200">
                {reactionResult.explicacionProfesor.introduccion}
              </p>

              <div className="bg-[#070b12] border border-slate-800 rounded-lg p-3">
                <span className="text-[10px] font-mono uppercase text-cyan-400 block mb-1 font-bold flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> Mecanismo Iónico Detallado:
                </span>
                <p className="text-slate-300">{reactionResult.explicacionProfesor.mecanismoIónico}</p>
              </div>

              {/* Agriculture context if applicable */}
              {reactionResult.explicacionProfesor.agricultura && (
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-3">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 block mb-1 font-bold flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5" /> Contexto Agrícola (Nutrición de Precisión Libre de Cloruros):
                  </span>
                  <p className="text-slate-200">{reactionResult.explicacionProfesor.agricultura}</p>
                </div>
              )}

              {/* Mineralogy / Gemology context if applicable */}
              {reactionResult.explicacionProfesor.mineralogia && (
                <div className="bg-purple-950/20 border border-purple-500/30 rounded-lg p-3">
                  <span className="text-[10px] font-mono uppercase text-purple-400 block mb-1 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Mineralogía & Génesis de Gemas (Rubí y Zafiro):
                  </span>
                  <p className="text-slate-200">{reactionResult.explicacionProfesor.mineralogia}</p>
                </div>
              )}

              {/* Industry context if applicable */}
              {reactionResult.explicacionProfesor.industria && (
                <div className="bg-blue-950/20 border border-blue-500/30 rounded-lg p-3">
                  <span className="text-[10px] font-mono uppercase text-blue-400 block mb-1 font-bold">
                    Aplicación Industrial & Control de Procesos:
                  </span>
                  <p className="text-slate-200">{reactionResult.explicacionProfesor.industria}</p>
                </div>
              )}

              {/* Live Gemini AI Analysis if returned */}
              {aiCustomInsight && (
                <div className="bg-cyan-950/30 border border-cyan-500/40 rounded-lg p-3 mt-3">
                  <span className="text-[10px] font-mono uppercase text-cyan-300 font-bold block mb-1 flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-cyan-400" /> Ampliación Neuronal del Profesor IA (En Tiempo Real):
                  </span>
                  <div className="text-slate-200 text-xs whitespace-pre-line leading-relaxed font-mono">
                    {aiCustomInsight}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                {reactionResult.explicacionProfesor.conclusion}
              </p>
            </div>
          </div>

          {/* Enthalpy & Energy Profile Chart */}
          <EnthalpyChart
            enthalpyText={reactionResult.enthalpy}
            reactionTitle={reactionResult.title}
            reactionType={reactionResult.type}
          />

          {/* Safety & Logistics Card */}
          <SafetyCard
            productName={reactionResult.safetyInfo.productoPrincipal}
            hazardClass={reactionResult.safetyInfo.hazardClass}
            unNumber={reactionResult.safetyInfo.unNumber}
            kemlerCode={reactionResult.safetyInfo.kemlerCode}
            adrTunnelCode={reactionResult.safetyInfo.adrTunnelCode}
            tunnelReason={reactionResult.safetyInfo.tunnelReason}
            nfpa={reactionResult.safetyInfo.nfpa}
            ppe={reactionResult.safetyInfo.ppe}
            storage={reactionResult.safetyInfo.almacenamiento}
            stability={reactionResult.safetyInfo.estabilidad}
          />
        </div>
      )}
    </div>
  );
};
