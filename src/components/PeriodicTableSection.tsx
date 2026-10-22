import React, { useState, useMemo, useEffect } from 'react';
import { 
  PERIODIC_ELEMENTS, 
  PeriodicElement, 
  ELEMENT_CATEGORIES, 
  searchElements,
  getElementPhysicsData,
  ElementPhysicsDetails
} from '../data/periodicTable';
import { 
  getIsotopesForElement, 
  getIsotopesSummary, 
  IsotopeDefinition,
  superscriptNumber 
} from '../data/isotopesData';
import { ChemicalReagent, CHEMICAL_DATABASE } from '../data/chemicals';
import { 
  Atom, 
  Search, 
  Sparkles, 
  Compass, 
  Plus, 
  X, 
  ArrowRight,
  Maximize2,
  Grid,
  LayoutGrid,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Zap,
  Check,
  Copy,
  Layers,
  Flame,
  Radio,
  SlidersHorizontal
} from 'lucide-react';

interface PeriodicTableSectionProps {
  onAddReagentToWorkspace?: (reagent: ChemicalReagent) => void;
  onNavigateToWorkspace?: () => void;
  onOpenIn3DBuilder?: (element: PeriodicElement, isotope?: IsotopeDefinition) => void;
  initialElementSymbol?: string;
}

type IsotopeFilterType = 'all' | 'stable' | 'monoisotopic' | 'radioactive' | 'medical';
type ModalTabType = 'isotopes' | 'properties' | 'spectrum';

export const PeriodicTableSection: React.FC<PeriodicTableSectionProps> = ({
  onAddReagentToWorkspace,
  onNavigateToWorkspace,
  onOpenIn3DBuilder,
  initialElementSymbol,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIsotopeFilter, setSelectedIsotopeFilter] = useState<IsotopeFilterType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectingElement, setInspectingElement] = useState<PeriodicElement | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modal inspection state
  const [modalTab, setModalTab] = useState<ModalTabType>('isotopes');
  const [activeIsotope, setActiveIsotope] = useState<IsotopeDefinition | null>(null);
  const [isotopeTabFilter, setIsotopeTabFilter] = useState<'all' | 'stable' | 'radioactive' | 'medical'>('all');
  const [spectrumTrimMin, setSpectrumTrimMin] = useState<number>(350);
  const [spectrumTrimMax, setSpectrumTrimMax] = useState<number>(750);
  const [copiedIsoId, setCopiedIsoId] = useState<string | null>(null);

  // Deep-linking: Auto-open initial element if provided via URL
  useEffect(() => {
    if (initialElementSymbol) {
      const match = PERIODIC_ELEMENTS.find(
        (e) =>
          e.symbol.toLowerCase() === initialElementSymbol.toLowerCase() ||
          String(e.z) === String(initialElementSymbol)
      );
      if (match) {
        setInspectingElement(match);
      }
    }
  }, [initialElementSymbol]);

  // When inspecting element changes, set default active isotope
  useEffect(() => {
    if (inspectingElement) {
      const isotopes = getIsotopesForElement(inspectingElement.z);
      // Prefer dominant or first stable
      const dominant = isotopes.find(i => i.abundance.includes('%') && parseFloat(i.abundance) > 50) 
        || isotopes.find(i => i.category === 'Estable')
        || isotopes[0];
      setActiveIsotope(dominant || null);
    } else {
      setActiveIsotope(null);
    }
  }, [inspectingElement]);

  // Keyboard navigation when inspecting modal is open
  useEffect(() => {
    if (!inspectingElement) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInspectingElement(null);
      } else if (e.key === 'ArrowLeft') {
        handlePrevElement();
      } else if (e.key === 'ArrowRight') {
        handleNextElement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectingElement]);

  // Navigate elements in modal
  const handlePrevElement = () => {
    if (!inspectingElement) return;
    const prevZ = inspectingElement.z === 1 ? 118 : inspectingElement.z - 1;
    const target = PERIODIC_ELEMENTS.find(e => e.z === prevZ);
    if (target) setInspectingElement(target);
  };

  const handleNextElement = () => {
    if (!inspectingElement) return;
    const nextZ = inspectingElement.z === 118 ? 1 : inspectingElement.z + 1;
    const target = PERIODIC_ELEMENTS.find(e => e.z === nextZ);
    if (target) setInspectingElement(target);
  };

  const handleJumpPrev = () => {
    if (!inspectingElement) return;
    const targetZ = Math.max(1, inspectingElement.z - 10);
    const target = PERIODIC_ELEMENTS.find(e => e.z === targetZ);
    if (target) setInspectingElement(target);
  };

  const handleJumpNext = () => {
    if (!inspectingElement) return;
    const targetZ = Math.min(118, inspectingElement.z + 10);
    const target = PERIODIC_ELEMENTS.find(e => e.z === targetZ);
    if (target) setInspectingElement(target);
  };

  // Isotope summary cache map for fast badge rendering
  const isotopesSummaryMap = useMemo(() => {
    const map = new Map<number, ReturnType<typeof getIsotopesSummary>>();
    for (const el of PERIODIC_ELEMENTS) {
      map.set(el.z, getIsotopesSummary(el.z));
    }
    return map;
  }, []);

  // Filter matching set for dimming non-matches in full table
  const matchingZSet = useMemo(() => {
    let results = searchElements(searchQuery, selectedCategory);

    // Apply Isotope filter
    if (selectedIsotopeFilter !== 'all') {
      results = results.filter(e => {
        const sum = isotopesSummaryMap.get(e.z);
        if (!sum) return true;
        if (selectedIsotopeFilter === 'stable') return sum.stableCount > 0;
        if (selectedIsotopeFilter === 'monoisotopic') return sum.isMonoisotopic;
        if (selectedIsotopeFilter === 'radioactive') return sum.stableCount === 0;
        if (selectedIsotopeFilter === 'medical') return sum.hasMedicalUse;
        return true;
      });
    }

    return new Set(results.map(e => e.z));
  }, [searchQuery, selectedCategory, selectedIsotopeFilter, isotopesSummaryMap]);

  const filteredElementsList = useMemo(() => {
    let results = searchElements(searchQuery, selectedCategory);
    if (selectedIsotopeFilter !== 'all') {
      results = results.filter(e => {
        const sum = isotopesSummaryMap.get(e.z);
        if (!sum) return true;
        if (selectedIsotopeFilter === 'stable') return sum.stableCount > 0;
        if (selectedIsotopeFilter === 'monoisotopic') return sum.isMonoisotopic;
        if (selectedIsotopeFilter === 'radioactive') return sum.stableCount === 0;
        if (selectedIsotopeFilter === 'medical') return sum.hasMedicalUse;
        return true;
      });
    }
    return results;
  }, [searchQuery, selectedCategory, selectedIsotopeFilter, isotopesSummaryMap]);

  // Color mapping helper
  const getCategoryTheme = (cat: PeriodicElement['category']) => {
    switch (cat) {
      case 'alkali_metal':
        return {
          border: 'border-rose-500/50',
          bg: 'bg-rose-950/30 hover:bg-rose-900/50 text-rose-300',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          text: 'text-rose-400',
          dot: 'bg-rose-400'
        };
      case 'alkaline_earth':
        return {
          border: 'border-orange-500/50',
          bg: 'bg-orange-950/30 hover:bg-orange-900/50 text-orange-300',
          badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          text: 'text-orange-400',
          dot: 'bg-orange-400'
        };
      case 'transition_metal':
        return {
          border: 'border-amber-500/50',
          bg: 'bg-amber-950/30 hover:bg-amber-900/50 text-amber-300',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          text: 'text-amber-400',
          dot: 'bg-amber-400'
        };
      case 'post_transition':
        return {
          border: 'border-emerald-500/50',
          bg: 'bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-300',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          text: 'text-emerald-400',
          dot: 'bg-emerald-400'
        };
      case 'metalloid':
        return {
          border: 'border-teal-500/50',
          bg: 'bg-teal-950/30 hover:bg-teal-900/50 text-teal-300',
          badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
          text: 'text-teal-400',
          dot: 'bg-teal-400'
        };
      case 'reactive_nonmetal':
        return {
          border: 'border-cyan-500/50',
          bg: 'bg-cyan-950/30 hover:bg-cyan-900/50 text-cyan-300',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          text: 'text-cyan-400',
          dot: 'bg-cyan-400'
        };
      case 'noble_gas':
        return {
          border: 'border-purple-500/50',
          bg: 'bg-purple-950/30 hover:bg-purple-900/50 text-purple-300',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          text: 'text-purple-400',
          dot: 'bg-purple-400'
        };
      case 'lanthanide':
        return {
          border: 'border-pink-500/50',
          bg: 'bg-pink-950/30 hover:bg-pink-900/50 text-pink-300',
          badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
          text: 'text-pink-400',
          dot: 'bg-pink-400'
        };
      case 'actinide':
        return {
          border: 'border-violet-500/50',
          bg: 'bg-violet-950/30 hover:bg-violet-900/50 text-violet-300',
          badge: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
          text: 'text-violet-400',
          dot: 'bg-violet-400'
        };
      default:
        return {
          border: 'border-slate-700',
          bg: 'bg-slate-900/60 hover:bg-slate-800 text-slate-300',
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          text: 'text-slate-400',
          dot: 'bg-slate-400'
        };
    }
  };

  const getIsotopeCategoryBadge = (category: IsotopeDefinition['category']) => {
    switch (category) {
      case 'Estable':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Radiactivo β⁻':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Radiactivo β⁺':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Radiactivo α':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Primordial':
        return 'bg-violet-500/20 text-violet-300 border-violet-500/40';
      case 'Fisionable':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const handleTransferToHub = (el: PeriodicElement) => {
    if (!el.reagentId || !onAddReagentToWorkspace) return;
    const reagent = CHEMICAL_DATABASE.find(c => c.id === el.reagentId);
    if (reagent) {
      onAddReagentToWorkspace(reagent);
      if (onNavigateToWorkspace) {
        onNavigateToWorkspace();
      }
    }
  };

  const handleCopyIsotope = (iso: IsotopeDefinition) => {
    const text = `[ISÓTOPO] ${iso.name} (${iso.symbol}) | Z=${iso.z}, N=${iso.n}, A=${iso.massNumber} | Masa: ${iso.atomicMassAmu.toFixed(4)} uma | Vida Media: ${iso.halfLife} | Decaimiento: ${iso.decayMode} | Abundancia: ${iso.abundance}`;
    navigator.clipboard.writeText(text);
    setCopiedIsoId(iso.id);
    setTimeout(() => setCopiedIsoId(null), 2000);
  };

  // Group elements into main table and f-block (lanthanides and actinides)
  const mainTableElements = useMemo(() => {
    return PERIODIC_ELEMENTS.filter(e => e.category !== 'lanthanide' && e.category !== 'actinide');
  }, []);

  const lanthanides = useMemo(() => {
    return PERIODIC_ELEMENTS.filter(e => e.category === 'lanthanide');
  }, []);

  const actinides = useMemo(() => {
    return PERIODIC_ELEMENTS.filter(e => e.category === 'actinide');
  }, []);

  // Quick lookup map: "period-group" -> element
  const gridMap = useMemo(() => {
    const map = new Map<string, PeriodicElement>();
    mainTableElements.forEach(e => {
      map.set(`${e.period}-${e.group}`, e);
    });
    return map;
  }, [mainTableElements]);

  // Active element calculations when inspecting
  const inspectingPhysics = useMemo(() => {
    if (!inspectingElement) return null;
    return getElementPhysicsData(inspectingElement, activeIsotope?.n);
  }, [inspectingElement, activeIsotope]);

  const inspectingIsotopesList = useMemo(() => {
    if (!inspectingElement) return [];
    return getIsotopesForElement(inspectingElement.z);
  }, [inspectingElement]);

  const filteredIsotopesList = useMemo(() => {
    if (!inspectingIsotopesList.length) return [];
    if (isotopeTabFilter === 'all') return inspectingIsotopesList;
    if (isotopeTabFilter === 'stable') {
      return inspectingIsotopesList.filter(i => i.category === 'Estable' || i.halfLife.includes('Estable'));
    }
    if (isotopeTabFilter === 'radioactive') {
      return inspectingIsotopesList.filter(i => i.category !== 'Estable' && !i.halfLife.includes('Estable'));
    }
    if (isotopeTabFilter === 'medical') {
      return inspectingIsotopesList.filter(i => 
        i.description.toLowerCase().includes('médic') || 
        i.description.toLowerCase().includes('pet') || 
        i.description.toLowerCase().includes('cáncer') ||
        i.description.toLowerCase().includes('terapia')
      );
    }
    return inspectingIsotopesList;
  }, [inspectingIsotopesList, isotopeTabFilter]);

  // Spectral lines visible in trimmed range
  const filteredSpectralLines = useMemo(() => {
    if (!inspectingPhysics) return [];
    return inspectingPhysics.spectralLines.filter(
      wl => wl >= spectrumTrimMin && wl <= spectrumTrimMax
    );
  }, [inspectingPhysics, spectrumTrimMin, spectrumTrimMax]);

  return (
    <div className="space-y-6">
      {/* Control Deck */}
      <div className="bg-[#0b111a] border border-cyan-500/20 rounded-xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Atom className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-bold">
                  Catálogo Periódico & Base Isotópica Canónica
                </span>
                <span className="bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.2 text-[10px] font-mono rounded font-bold">
                  118 Elementos & Isótopos
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white font-mono tracking-tight">
                Tabla Periódica con Isótopos & Espectrometría
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-[#070b12] border border-slate-700 p-0.5 rounded-lg text-xs font-mono">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-cyan-500 text-black font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Vista Canónica de 18 Columnas IUPAC"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabla 18-Col</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'cards' ? 'bg-cyan-500 text-black font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Vista en Cuadrícula de Fichas"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Fichas ({filteredElementsList.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar símbolo (Fe), nombre o Z..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-7 py-1.5 text-xs bg-[#070b12] border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Isotope Filter Row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5 pb-2.5 border-b border-slate-800/60 text-xs font-mono">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Radio className="w-3.5 h-3.5 text-cyan-400" /> Filtro de Isótopos:
          </span>
          {[
            { id: 'all', label: 'Todos los Isótopos', icon: '🧬' },
            { id: 'stable', label: 'Con Isótopos Estables (Z ≤ 82)', icon: '🛡️' },
            { id: 'monoisotopic', label: 'Monoisotópicos (1 estable)', icon: '🎯' },
            { id: 'radioactive', label: 'Puramente Radiactivos (Z ≥ 83, Tc, Pm)', icon: '☢️' },
            { id: 'medical', label: 'Radioisótopos Médicos (PET/SPECT)', icon: '🏥' },
          ].map((flt) => (
            <button
              key={flt.id}
              onClick={() => setSelectedIsotopeFilter(flt.id as IsotopeFilterType)}
              className={`px-2.5 py-1 text-[11px] rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                selectedIsotopeFilter === flt.id
                  ? 'bg-amber-500 text-black font-bold border-amber-400 shadow-sm'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:text-white'
              }`}
            >
              <span>{flt.icon}</span>
              <span>{flt.label}</span>
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {ELEMENT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow-sm shadow-cyan-500/30'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-slate-800 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: CANONICAL 18-COLUMN IUPAC TABLE */}
      {viewMode === 'table' && (
        <div className="bg-[#0b111a] border border-slate-800 rounded-xl p-4 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Estructura Canónica Oficial IUPAC con Indicadores Isotópicos
            </span>
            <span className="text-[11px] text-slate-500 hidden md:inline">
              ← Haz clic en cualquier elemento para abrir sus isótopos y espectro →
            </span>
          </div>

          {/* 18-Column Scrollable Canvas */}
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="min-w-[1050px] space-y-4">
              
              {/* Main 7 Periods Grid */}
              <div 
                className="grid gap-1.5 font-mono"
                style={{
                  gridTemplateColumns: '32px repeat(18, minmax(52px, 1fr))',
                  gridTemplateRows: '24px repeat(7, minmax(68px, auto))'
                }}
              >
                {/* Column Headers (Groups 1 to 18) */}
                <div className="text-[10px] text-slate-500 flex items-center justify-center font-bold">P\G</div>
                {Array.from({ length: 18 }, (_, i) => i + 1).map((grp) => (
                  <div key={`grp-${grp}`} className="text-[10px] text-slate-500 font-bold text-center flex items-center justify-center">
                    {grp}
                  </div>
                ))}

                {/* 7 Periods */}
                {Array.from({ length: 7 }, (_, r) => r + 1).map((period) => (
                  <React.Fragment key={`period-${period}`}>
                    {/* Period Row Label */}
                    <div className="text-xs text-cyan-400/70 font-bold flex items-center justify-center bg-slate-900/40 rounded border border-slate-800/60">
                      {period}
                    </div>

                    {/* 18 Columns for this Period */}
                    {Array.from({ length: 18 }, (_, c) => c + 1).map((group) => {
                      // Check for Lanthanides placeholder at Period 6, Group 3
                      if (period === 6 && group === 3) {
                        return (
                          <div 
                            key="lanthanide-placeholder"
                            className="rounded border border-pink-500/40 bg-pink-950/20 text-pink-300 p-1 flex flex-col justify-center items-center text-center cursor-default text-[9px] leading-tight"
                            title="Serie de los Lantánidos (Z = 57 a 71, desglosada abajo)"
                          >
                            <span className="font-bold text-[10px]">57-71</span>
                            <span className="font-extrabold">La-Lu</span>
                            <span className="text-[8px] opacity-75">Lantánidos</span>
                          </div>
                        );
                      }

                      // Check for Actinides placeholder at Period 7, Group 3
                      if (period === 7 && group === 3) {
                        return (
                          <div 
                            key="actinide-placeholder"
                            className="rounded border border-violet-500/40 bg-violet-950/20 text-violet-300 p-1 flex flex-col justify-center items-center text-center cursor-default text-[9px] leading-tight"
                            title="Serie de los Actínidos (Z = 89 a 103, desglosada abajo)"
                          >
                            <span className="font-bold text-[10px]">89-103</span>
                            <span className="font-extrabold">Ac-Lr</span>
                            <span className="text-[8px] opacity-75">Actínidos</span>
                          </div>
                        );
                      }

                      const el = gridMap.get(`${period}-${group}`);
                      if (!el) {
                        return <div key={`empty-${period}-${group}`} className="pointer-events-none" />;
                      }

                      const isMatch = matchingZSet.has(el.z);
                      const isInspecting = inspectingElement?.z === el.z;
                      const theme = getCategoryTheme(el.category);
                      const isoSummary = isotopesSummaryMap.get(el.z);

                      return (
                        <button
                          key={el.z}
                          onClick={() => setInspectingElement(el)}
                          className={`rounded border p-1 text-left flex flex-col justify-between transition-all group relative cursor-pointer ${
                            theme.bg
                          } ${theme.border} ${
                            !isMatch ? 'opacity-25 grayscale-[60%] hover:opacity-100 hover:grayscale-0' : 'opacity-100'
                          } ${
                            isInspecting ? 'ring-2 ring-cyan-400 shadow-lg scale-105 z-10 bg-cyan-950/60' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between text-[9px] leading-none">
                            <span className="font-bold text-slate-400 group-hover:text-white">{el.z}</span>
                            {isoSummary && isoSummary.stableCount > 0 ? (
                              <span className="text-[7px] text-emerald-400 font-bold" title={`${isoSummary.stableCount} isótopos estables`}>
                                ●{isoSummary.stableCount}
                              </span>
                            ) : (
                              <span className="text-[7px] text-rose-400 font-bold" title="Radioisótopo inestable">
                                ☢
                              </span>
                            )}
                          </div>

                          <div className="my-0.5 text-center">
                            <span className="text-base font-extrabold text-white block group-hover:scale-110 transition-transform">
                              {el.symbol}
                            </span>
                            <span className="text-[9px] font-sans text-slate-300 truncate block">
                              {el.name}
                            </span>
                          </div>

                          <div className="text-[8px] text-slate-400 text-center leading-none flex items-center justify-between px-0.5">
                            <span>{el.atomicMass.toFixed(1)}</span>
                            {isoSummary?.hasMedicalUse && (
                              <span className="text-[7px] text-amber-300" title="Uso médico / radiofármaco">✦</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>

              {/* F-Block: Separate Lanthanides & Actinides Series */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold pl-9">
                  Elementos de Transición Interna (Bloque f)
                </span>

                {/* Lanthanide Row (Z=57 to 71) */}
                <div 
                  className="grid gap-1.5 font-mono"
                  style={{
                    gridTemplateColumns: '110px repeat(15, minmax(52px, 1fr))'
                  }}
                >
                  <div className="flex items-center justify-end pr-2 text-[10px] font-bold text-pink-400">
                    Lantánidos (4f)
                  </div>
                  {lanthanides.map((el) => {
                    const isMatch = matchingZSet.has(el.z);
                    const isInspecting = inspectingElement?.z === el.z;
                    const theme = getCategoryTheme(el.category);
                    const isoSummary = isotopesSummaryMap.get(el.z);

                    return (
                      <button
                        key={el.z}
                        onClick={() => setInspectingElement(el)}
                        className={`rounded border p-1 text-left flex flex-col justify-between transition-all group min-h-[64px] cursor-pointer ${
                          theme.bg
                        } ${theme.border} ${
                          !isMatch ? 'opacity-25 grayscale-[60%] hover:opacity-100 hover:grayscale-0' : 'opacity-100'
                        } ${
                          isInspecting ? 'ring-2 ring-cyan-400 shadow-lg scale-105 z-10' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between text-[9px] leading-none">
                          <span className="font-bold text-slate-400 group-hover:text-white">{el.z}</span>
                          {isoSummary && (
                            <span className="text-[7.5px] text-emerald-400 font-bold">
                              ●{isoSummary.stableCount}
                            </span>
                          )}
                        </div>
                        <div className="text-center my-0.5">
                          <span className="text-sm font-extrabold text-white block group-hover:scale-110 transition-transform">
                            {el.symbol}
                          </span>
                          <span className="text-[8px] font-sans text-slate-300 truncate block">
                            {el.name}
                          </span>
                        </div>
                        <div className="text-[8px] text-slate-400 text-center leading-none">
                          {el.atomicMass.toFixed(1)}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Actinide Row (Z=89 to 103) */}
                <div 
                  className="grid gap-1.5 font-mono"
                  style={{
                    gridTemplateColumns: '110px repeat(15, minmax(52px, 1fr))'
                  }}
                >
                  <div className="flex items-center justify-end pr-2 text-[10px] font-bold text-violet-400">
                    Actínidos (5f)
                  </div>
                  {actinides.map((el) => {
                    const isMatch = matchingZSet.has(el.z);
                    const isInspecting = inspectingElement?.z === el.z;
                    const theme = getCategoryTheme(el.category);
                    const isoSummary = isotopesSummaryMap.get(el.z);

                    return (
                      <button
                        key={el.z}
                        onClick={() => setInspectingElement(el)}
                        className={`rounded border p-1 text-left flex flex-col justify-between transition-all group min-h-[64px] cursor-pointer ${
                          theme.bg
                        } ${theme.border} ${
                          !isMatch ? 'opacity-25 grayscale-[60%] hover:opacity-100 hover:grayscale-0' : 'opacity-100'
                        } ${
                          isInspecting ? 'ring-2 ring-cyan-400 shadow-lg scale-105 z-10' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between text-[9px] leading-none">
                          <span className="font-bold text-slate-400 group-hover:text-white">{el.z}</span>
                          <span className="text-[7.5px] text-violet-400 font-bold">
                            ☢{isoSummary?.totalCount}
                          </span>
                        </div>
                        <div className="text-center my-0.5">
                          <span className="text-sm font-extrabold text-white block group-hover:scale-110 transition-transform">
                            {el.symbol}
                          </span>
                          <span className="text-[8px] font-sans text-slate-300 truncate block">
                            {el.name}
                          </span>
                        </div>
                        <div className="text-[8px] text-slate-400 text-center leading-none">
                          {el.atomicMass.toFixed(0)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CARDS GRID */}
      {viewMode === 'cards' && (
        <div className="bg-[#0b111a] border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-400">
            <span>Elementos encontrados: <strong className="text-cyan-400">{filteredElementsList.length}</strong></span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredElementsList.map((el) => {
              const theme = getCategoryTheme(el.category);
              const isoSummary = isotopesSummaryMap.get(el.z);

              return (
                <button
                  key={el.z}
                  onClick={() => setInspectingElement(el)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all group relative cursor-pointer ${
                    theme.bg
                  } ${theme.border}`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="font-bold text-slate-400">{el.z}</span>
                    <span className="text-[10px] text-slate-500">M: {el.atomicMass.toFixed(1)}</span>
                  </div>

                  <div className="my-2 text-center">
                    <span className="text-2xl font-black font-mono text-white block group-hover:scale-105 transition-transform">
                      {el.symbol}
                    </span>
                    <span className="text-xs font-medium text-slate-300 block">{el.name}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-1 py-0.2 rounded font-bold">
                      {isoSummary?.totalCount} isótopos
                    </span>
                    {isoSummary?.stableCount ? (
                      <span className="text-emerald-400 font-bold">● {isoSummary.stableCount} est.</span>
                    ) : (
                      <span className="text-rose-400 font-bold">☢ Rad.</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAILED ELEMENT & ISOTOPES MODAL (Matching User Screenshots) */}
      {inspectingElement && inspectingPhysics && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#080d14] border border-cyan-500/40 rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto custom-scrollbar flex flex-col justify-between">
            
            {/* Top Close Button */}
            <button
              onClick={() => setInspectingElement(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition z-20 cursor-pointer"
              title="Cerrar modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              {/* Header Tile + Particle Counters (Identical to Screenshot 1) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800/80">
                {/* Element Block Tile */}
                <div className="flex items-center gap-3.5">
                  <div className="w-20 h-20 rounded-xl bg-cyan-950/80 border-2 border-cyan-500/50 flex flex-col items-center justify-center font-mono shrink-0 shadow-lg shadow-cyan-500/10">
                    <span className="text-xs text-cyan-400 font-bold self-start pl-2">{inspectingElement.z}</span>
                    <span className="text-3xl font-black text-white leading-none">{inspectingElement.symbol}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{inspectingElement.atomicMass.toFixed(4)}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-black text-white font-mono tracking-tight">
                        {inspectingElement.name.toUpperCase()}
                      </h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${getCategoryTheme(inspectingElement.category).badge}`}>
                        {inspectingElement.categoryLabel}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                      <span>Bloque <strong className="text-cyan-300">{inspectingElement.block.toUpperCase()}</strong></span>
                      <span>•</span>
                      <span>Período <strong className="text-cyan-300">{inspectingElement.period}</strong></span>
                      <span>•</span>
                      <span>Grupo <strong className="text-cyan-300">{inspectingElement.group}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Particle Breakdown Pill Box (ELECTRONS | PROTONS | NEUTRONS) */}
                <div className="bg-[#0b121e] border border-cyan-500/30 rounded-xl p-2.5 flex items-center gap-3 sm:gap-4 font-mono text-center shadow-inner self-stretch sm:self-auto">
                  <div className="flex-1 sm:flex-none">
                    <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-bold block">Electrons</span>
                    <span className="text-lg font-black text-white">{inspectingPhysics.electrons}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-800" />
                  <div className="flex-1 sm:flex-none">
                    <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold block">Protons</span>
                    <span className="text-lg font-black text-white">{inspectingPhysics.protons}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-800" />
                  <div className="flex-1 sm:flex-none">
                    <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold block">Neutrons</span>
                    <span className="text-lg font-black text-emerald-300">
                      {activeIsotope ? activeIsotope.n : inspectingPhysics.neutrons}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tab Navigation Switcher */}
              <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2 text-xs font-mono">
                <button
                  onClick={() => setModalTab('isotopes')}
                  className={`px-3.5 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    modalTab === 'isotopes'
                      ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  <Atom className="w-4 h-4" />
                  <span>Isótopos Nucleares ({inspectingIsotopesList.length})</span>
                </button>

                <button
                  onClick={() => setModalTab('properties')}
                  className={`px-3.5 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    modalTab === 'properties'
                      ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Ficha Físico-Química</span>
                </button>

                <button
                  onClick={() => setModalTab('spectrum')}
                  className={`px-3.5 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    modalTab === 'spectrum'
                      ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  <Flame className="w-4 h-4 text-purple-400" />
                  <span>Espectro Visible & Tubo de Descarga</span>
                </button>
              </div>

              {/* TAB 1: ISÓTOPOS NUCLEARES */}
              {modalTab === 'isotopes' && (
                <div className="space-y-4 font-mono text-xs">
                  {/* Isotope Filter Row inside tab */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0d1522] border border-slate-800 rounded-xl p-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Filtrar:</span>
                      {[
                        { id: 'all', label: `Todos (${inspectingIsotopesList.length})` },
                        { id: 'stable', label: `Estables (${inspectingIsotopesList.filter(i => i.category === 'Estable' || i.halfLife.includes('Estable')).length})` },
                        { id: 'radioactive', label: `Radiactivos (${inspectingIsotopesList.filter(i => i.category !== 'Estable' && !i.halfLife.includes('Estable')).length})` },
                        { id: 'medical', label: 'Médicos / Teranóstica' },
                      ].map((flt) => (
                        <button
                          key={flt.id}
                          onClick={() => setIsotopeTabFilter(flt.id as any)}
                          className={`px-2 py-0.5 rounded text-[11px] transition cursor-pointer border ${
                            isotopeTabFilter === flt.id
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {flt.label}
                        </button>
                      ))}
                    </div>

                    {activeIsotope && (
                      <span className="text-[11px] text-cyan-400">
                        Isótopo Activo: <strong className="text-white">{activeIsotope.name}</strong>
                      </span>
                    )}
                  </div>

                  {/* Active Isotope Highlight Card */}
                  {activeIsotope && (
                    <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-purple-950/30 border border-cyan-500/40 rounded-xl p-3.5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl font-black text-white">{activeIsotope.symbol}</span>
                          <span className="text-sm font-bold text-cyan-300">{activeIsotope.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${getIsotopeCategoryBadge(activeIsotope.category)}`}>
                            {activeIsotope.category}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                          {activeIsotope.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-slate-400 font-mono">
                          <span>Masa: <strong className="text-white">{activeIsotope.atomicMassAmu.toFixed(4)} uma</strong></span>
                          <span>•</span>
                          <span>Vida Media: <strong className="text-amber-300">{activeIsotope.halfLife}</strong></span>
                          <span>•</span>
                          <span>Decaimiento: <strong className="text-cyan-300">{activeIsotope.decayMode}</strong></span>
                          <span>•</span>
                          <span>Abundancia: <strong className="text-emerald-300">{activeIsotope.abundance}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {onOpenIn3DBuilder && (
                          <button
                            onClick={() => {
                              onOpenIn3DBuilder(inspectingElement, activeIsotope);
                              setInspectingElement(null);
                            }}
                            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-lg transition shadow-md shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
                            title={`Construir ${activeIsotope.name} (Z=${activeIsotope.z}, N=${activeIsotope.n}) en 3D`}
                          >
                            <Atom className="w-4 h-4" />
                            <span>Construir Núcleo en 3D</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleCopyIsotope(activeIsotope)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition border border-slate-700 cursor-pointer"
                          title="Copiar detalles del isótopo"
                        >
                          {copiedIsoId === activeIsotope.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List / Grid of All Isotopes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                    {filteredIsotopesList.map((iso) => {
                      const isSelected = activeIsotope?.id === iso.id;
                      const badgeClass = getIsotopeCategoryBadge(iso.category);

                      return (
                        <div
                          key={iso.id}
                          onClick={() => setActiveIsotope(iso)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                            isSelected 
                              ? 'bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg' 
                              : 'bg-[#0b121e] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-base font-extrabold text-white flex items-center gap-1">
                                <span>{iso.symbol}</span>
                                <span className="text-xs font-semibold text-slate-300">({iso.massNumber})</span>
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded border font-bold uppercase ${badgeClass}`}>
                                {iso.category}
                              </span>
                            </div>

                            <div className="text-[11px] font-bold text-cyan-300 mb-1">
                              {iso.name}
                            </div>

                            <p className="text-[10px] text-slate-400 font-sans line-clamp-2 leading-relaxed mb-2">
                              {iso.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[10px]">
                            <div className="flex items-center justify-between text-slate-400">
                              <span>Neutrones (N):</span>
                              <strong className="text-emerald-300">{iso.n} n⁰</strong>
                            </div>
                            <div className="flex items-center justify-between text-slate-400">
                              <span>Vida Media:</span>
                              <strong className="text-amber-300 truncate max-w-[120px]">{iso.halfLife}</strong>
                            </div>
                            <div className="flex items-center justify-between text-slate-400">
                              <span>Abundancia:</span>
                              <strong className="text-white">{iso.abundance}</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: FICHA FÍSICO-QUÍMICA (Matching Screenshot 1) */}
              {modalTab === 'properties' && (
                <div className="space-y-4 font-mono text-xs">
                  {/* Mini Periodic Table Widget with S/P/D/F Block */}
                  <div className="bg-[#0b121e] border border-cyan-500/20 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {/* Mini Table Matrix */}
                      <div className="grid grid-cols-18 gap-0.5 bg-slate-950 p-2 rounded-lg border border-slate-800 w-[180px]">
                        {Array.from({ length: 18 * 4 }).map((_, idx) => {
                          const col = (idx % 18) + 1;
                          const row = Math.floor(idx / 18) + 1;
                          const isCurrent = inspectingElement.period <= 4 && inspectingElement.group === col;
                          return (
                            <div
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-xs ${
                                isCurrent ? 'bg-cyan-400 shadow-sm shadow-cyan-400' : 'bg-slate-800'
                              }`}
                            />
                          );
                        })}
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider">
                          {inspectingElement.block.toUpperCase()} BLOCK
                        </span>
                        <div className="flex items-center gap-4 text-xs font-bold text-cyan-300 mt-0.5">
                          <span>Group: <strong className="text-white">{inspectingElement.group}</strong></span>
                          <span>Period: <strong className="text-white">{inspectingElement.period}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 font-sans max-w-sm">
                      <strong className="text-white font-mono">Configuración: </strong>
                      <span className="text-cyan-300 font-mono">{inspectingElement.electronConfig}</span>
                    </div>
                  </div>

                  {/* Scientific Data Matrix matching Screenshot 1 */}
                  <div className="bg-[#070b12] border border-slate-800 rounded-xl divide-y divide-slate-800/80 text-xs">
                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">Origen del Elemento (Origin)</span>
                      <span className="text-slate-200 font-sans max-w-md text-right">{inspectingElement.cosmicOrigin}</span>
                    </div>

                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">Velocidad del Sonido (Speed of Sound)</span>
                      <span className="text-white font-mono">
                        {inspectingPhysics.speedOfSound} m/s | {inspectingPhysics.speedOfSoundFps} ft/s
                      </span>
                    </div>

                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">Abundancia en el Cuerpo (Abundance in Body)</span>
                      <span className="text-emerald-300 font-bold">{inspectingPhysics.abundanceBody}</span>
                    </div>

                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">Abundancia en la Corteza Terrestre</span>
                      <span className="text-slate-200 font-mono">{inspectingPhysics.abundanceCrust}</span>
                    </div>

                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">Peso Atómico Canónico (Atomic Weight)</span>
                      <span className="text-white font-mono">{inspectingElement.atomicMass.toFixed(4)} g/mol</span>
                    </div>

                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">Número Atómico (Atomic Number)</span>
                      <span className="text-white font-mono">{inspectingElement.z}</span>
                    </div>

                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">Densidad (Density)</span>
                      <span className="text-white font-mono">
                        {inspectingElement.density !== undefined ? `${inspectingElement.density} g/cm³` : 'N/D'}
                      </span>
                    </div>

                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">Electronegatividad (Electronegativity)</span>
                      <span className="text-white font-mono">
                        {inspectingElement.electronegativity ?? 'N/D'} (Escala Pauling)
                      </span>
                    </div>

                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">Valencia (Valency)</span>
                      <span className="text-white font-mono">{inspectingPhysics.valency}</span>
                    </div>

                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">Estados de Oxidación (Oxidation States)</span>
                      <span className="text-amber-300 font-mono">{inspectingElement.oxidationStates ?? '0'}</span>
                    </div>

                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">Punto de Fusión (Melting Point)</span>
                      <span className="text-white font-mono">
                        {inspectingPhysics.meltingK ? `${inspectingPhysics.meltingK} K / ${inspectingPhysics.meltingC} °C / ${inspectingPhysics.meltingF} °F` : 'N/D'}
                      </span>
                    </div>

                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">Punto de Ebullición (Boiling Point)</span>
                      <span className="text-white font-mono">
                        {inspectingPhysics.boilingK ? `${inspectingPhysics.boilingK} K / ${inspectingPhysics.boilingC} °C / ${inspectingPhysics.boilingF} °F` : 'N/D'}
                      </span>
                    </div>

                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">1ª Energía de Ionización</span>
                      <span className="text-white font-mono">
                        {inspectingElement.ionizationEnergy ? `${inspectingElement.ionizationEnergy} kJ/mol` : 'N/D'}
                      </span>
                    </div>
                  </div>

                  {/* Real World Applications */}
                  <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px] mb-1 uppercase">
                      <Compass className="w-3.5 h-3.5" /> Aplicaciones Tecnológicas & Vida Real
                    </span>
                    <p className="text-slate-200 text-xs font-sans leading-relaxed">
                      {inspectingElement.realWorldApp}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: ESPECTRO VISIBLE & TUBO DE DESCARGA (Matching Screenshot 2) */}
              {modalTab === 'spectrum' && (
                <div className="space-y-5 font-mono text-xs">
                  {/* Title Banner */}
                  <div className="text-center pb-2 border-b border-slate-800">
                    <span className="text-[11px] uppercase tracking-widest text-cyan-400 font-bold block mb-0.5">
                      COMBINED VISIBLE SPECTRUM
                    </span>
                    <h4 className="text-lg font-black text-white">
                      Emisión Óptica & Tubo de Descarga Espectral ({inspectingElement.name})
                    </h4>
                  </div>

                  {/* Gas Discharge Tube Visualization + Spectroscopy Bar */}
                  <div className="bg-[#04070d] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-center gap-8 relative overflow-hidden">
                    
                    {/* Glowing Plasma Tube Representation */}
                    <div className="flex flex-col items-center shrink-0">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                        Tubo de Descarga Gaseosa
                      </span>

                      {/* The Stylized Glass Tube */}
                      <div className="relative flex flex-col items-center">
                        {/* Top Metal Electrode */}
                        <div className="w-4 h-3 bg-slate-600 rounded-t-xs border border-slate-500" />
                        
                        {/* Upper Glass Bulb */}
                        <div className="w-12 h-14 bg-slate-900/80 rounded-t-2xl border border-slate-700/80 relative flex items-center justify-center shadow-inner">
                          <div 
                            className="w-4 h-8 rounded-full blur-xs opacity-75"
                            style={{ backgroundColor: inspectingPhysics.dischargeGlowColor }}
                          />
                        </div>

                        {/* Central Capillary Column (Intense glowing plasma discharge) */}
                        <div className="w-4 h-48 bg-slate-950 border-x border-slate-700/80 relative flex items-center justify-center">
                          {/* Outer glow aura */}
                          <div 
                            className="absolute inset-y-0 -inset-x-3 blur-md opacity-70 animate-pulse pointer-events-none"
                            style={{ backgroundColor: inspectingPhysics.dischargeGlowColor }}
                          />
                          {/* Plasma core beam */}
                          <div 
                            className="w-1.5 h-full rounded-full shadow-lg"
                            style={{ 
                              backgroundColor: inspectingPhysics.dischargeGlowColor,
                              boxShadow: `0 0 12px ${inspectingPhysics.dischargeGlowColor}`
                            }}
                          />
                        </div>

                        {/* Lower Glass Bulb */}
                        <div className="w-12 h-14 bg-slate-900/80 rounded-b-2xl border border-slate-700/80 relative flex items-center justify-center shadow-inner">
                          <div 
                            className="w-4 h-8 rounded-full blur-xs opacity-75"
                            style={{ backgroundColor: inspectingPhysics.dischargeGlowColor }}
                          />
                        </div>

                        {/* Bottom Metal Electrode */}
                        <div className="w-4 h-3 bg-slate-600 rounded-b-xs border border-slate-500" />
                      </div>

                      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span 
                          className="w-2.5 h-2.5 rounded-full border border-white/20"
                          style={{ backgroundColor: inspectingPhysics.dischargeGlowColor }}
                        />
                        <span>Color de Emisión Plasma</span>
                      </div>
                    </div>

                    {/* Spectral Lines Graph (350nm to 750nm) */}
                    <div className="flex-1 w-full max-w-lg space-y-4">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-cyan-400 font-bold">
                          <SlidersHorizontal className="w-3.5 h-3.5" /> Longitudes de Onda Visibles
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {spectrumTrimMin} nm — {spectrumTrimMax} nm
                        </span>
                      </div>

                      {/* Continuous Spectrum Bar with Overlay Lines */}
                      <div className="relative">
                        {/* Rainbow Base Bar */}
                        <div 
                          className="h-10 rounded-xl w-full relative overflow-hidden border border-slate-700 shadow-inner"
                          style={{
                            background: 'linear-gradient(to right, #4c1d95 0%, #3b82f6 20%, #06b6d4 40%, #10b981 55%, #eab308 70%, #f97316 85%, #dc2626 100%)'
                          }}
                        >
                          {/* Active Trim Mask */}
                          <div 
                            className="absolute top-0 bottom-0 bg-black/85 transition-all"
                            style={{ width: `${((spectrumTrimMin - 350) / 400) * 100}%`, left: 0 }}
                          />
                          <div 
                            className="absolute top-0 bottom-0 bg-black/85 transition-all"
                            style={{ width: `${((750 - spectrumTrimMax) / 400) * 100}%`, right: 0 }}
                          />

                          {/* Render Characteristic Spectral Lines */}
                          {inspectingPhysics.spectralLines.map((wl, idx) => {
                            const leftPercent = ((wl - 350) / 400) * 100;
                            const isWithinTrim = wl >= spectrumTrimMin && wl <= spectrumTrimMax;
                            if (leftPercent < 0 || leftPercent > 100) return null;

                            return (
                              <div
                                key={idx}
                                className={`absolute top-0 bottom-0 w-1 transition-opacity ${
                                  isWithinTrim ? 'opacity-100' : 'opacity-20'
                                }`}
                                style={{
                                  left: `${leftPercent}%`,
                                  backgroundColor: '#ffffff',
                                  boxShadow: isWithinTrim ? '0 0 8px #ffffff' : 'none'
                                }}
                                title={`Línea espectral: ${wl} nm`}
                              />
                            );
                          })}
                        </div>

                        {/* Wavelength Ticks */}
                        <div className="flex justify-between text-[9px] text-slate-500 mt-1.5 px-1">
                          <span>350 nm (UV)</span>
                          <span>450 nm</span>
                          <span>550 nm (Verde)</span>
                          <span>650 nm</span>
                          <span>750 nm (IR)</span>
                        </div>
                      </div>

                      {/* Trim Handles (Matching Screenshot "Drag Ends to Trim Wavelengths") */}
                      <div className="bg-[#090f1a] border border-slate-800 rounded-xl p-3 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Ajustar Rango Espectral (Drag Ends to Trim Wavelengths)
                        </span>

                        <div className="grid grid-cols-2 gap-4 text-[11px]">
                          <div>
                            <label className="text-slate-400 block mb-1">Corte Inferior: <strong className="text-cyan-300">{spectrumTrimMin} nm</strong></label>
                            <input 
                              type="range"
                              min={350}
                              max={spectrumTrimMax - 20}
                              value={spectrumTrimMin}
                              onChange={(e) => setSpectrumTrimMin(parseInt(e.target.value, 10))}
                              className="w-full accent-cyan-400 cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 block mb-1">Corte Superior: <strong className="text-rose-300">{spectrumTrimMax} nm</strong></label>
                            <input 
                              type="range"
                              min={spectrumTrimMin + 20}
                              max={750}
                              value={spectrumTrimMax}
                              onChange={(e) => setSpectrumTrimMax(parseInt(e.target.value, 10))}
                              className="w-full accent-rose-400 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      {/* List of Detected Emission Lines */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                          Líneas Espectrales Detectadas en este Rango ({filteredSpectralLines.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {filteredSpectralLines.map((wl, i) => (
                            <span 
                              key={i}
                              className="px-2 py-1 rounded bg-[#0b121e] border border-slate-700 text-[10px] font-mono text-white flex items-center gap-1.5"
                            >
                              <span 
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: wl < 440 ? '#8b5cf6' : wl < 490 ? '#38bdf8' : wl < 560 ? '#10b981' : wl < 590 ? '#eab308' : wl < 625 ? '#f97316' : '#ef4444'
                                }}
                              />
                              <span>{wl} nm</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Element Switcher & Action Bar (Matching Screenshot Navigation `< < >`) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-800">
              {/* Element Carousel Stepper */}
              <div className="flex items-center gap-1 bg-[#0b121e] border border-slate-800 rounded-xl p-1 font-mono text-xs">
                <button
                  onClick={handleJumpPrev}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
                  title="Retroceder 10 elementos"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handlePrevElement}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
                  title="Elemento anterior (Flecha Izquierda)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="px-3 py-1 text-center">
                  <span className="text-[11px] font-bold text-white block">
                    Z={inspectingElement.z} • {inspectingElement.symbol}
                  </span>
                  <span className="text-[9px] text-slate-400 block">
                    {inspectingElement.z} de 118
                  </span>
                </div>

                <button
                  onClick={handleNextElement}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
                  title="Siguiente elemento (Flecha Derecha)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleJumpNext}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
                  title="Avanzar 10 elementos"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {onOpenIn3DBuilder && (
                  <button
                    onClick={() => {
                      onOpenIn3DBuilder(inspectingElement, activeIsotope || undefined);
                      setInspectingElement(null);
                    }}
                    className="px-3.5 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 transition active:scale-95 shadow-sm cursor-pointer"
                    title={`Abrir ${inspectingElement.name} en el Constructor 3D`}
                  >
                    <Atom className="w-4 h-4 text-purple-400" />
                    <span>Construir en 3D (Z={inspectingElement.z})</span>
                  </button>
                )}

                {inspectingElement.isReagentInHub ? (
                  <button
                    onClick={() => {
                      handleTransferToHub(inspectingElement);
                      setInspectingElement(null);
                    }}
                    className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-mono text-xs font-bold rounded-lg shadow-md shadow-cyan-500/20 flex items-center gap-2 transition active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Añadir al Laboratorio ({inspectingElement.symbol})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-slate-500 italic hidden sm:inline">
                    Elemento de referencia teórica
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
