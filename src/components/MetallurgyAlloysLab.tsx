import React, { useState, useMemo, useEffect } from 'react';
import { 
  Flame, 
  ShieldAlert, 
  Sparkles, 
  BookOpen, 
  Layers, 
  RotateCcw, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  Thermometer, 
  Gauge, 
  Sliders, 
  Search, 
  X, 
  ArrowRight, 
  Copy, 
  Check, 
  Download, 
  Atom, 
  Zap, 
  Activity, 
  Crown, 
  Droplet, 
  FlaskConical, 
  Compass, 
  Share2,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Shield,
  History,
  Clock,
  Trash2,
  Wrench,
  Plus,
  Star
} from 'lucide-react';
import { gameDatabase, MetalElement, NonMetalElement, FluxElement } from '../data/metallurgyDatabase';
import { calcularAleacion, CalculatedAlloyResult } from '../utils/metallurgyEngine';
import { CollapsibleSection } from './CollapsibleSection';

export interface HistoricalAlloy {
  id: string;
  signature: string;
  timestamp: string;
  fullDate: string;
  nombre: string;
  tipo: string;
  color: string;
  densidadCalculada: number;
  puntoFusionEstimado: number;
  rangoFusionSolidus: number;
  rangoFusionLiquidus: number;
  durezaEstimadaHV: number;
  resistenciaTraccionMPa: number;
  metalSlots: (string | null)[];
  nonMetalSlot: string | null;
  fluxSlot: string | null;
  metalesSimbolos: string[];
  noMetalNombre?: string;
  fundenteNombre?: string;
  esPeligroso: boolean;
  alerta?: string;
  fasePredominante: string;
}

interface MetallurgyAlloysLabProps {
  onNavigateHome?: () => void;
  onOpenPeriodicTable?: (symbol: string) => void;
  onOpenAtomBuilder?: (z: number) => void;
}

export const MetallurgyAlloysLab: React.FC<MetallurgyAlloysLabProps> = ({
  onNavigateHome,
  onOpenPeriodicTable,
  onOpenAtomBuilder
}) => {
  // Slots state: 4 metal slots, 1 non-metal, 1 flux
  const [metalSlots, setMetalSlots] = useState<(string | null)[]>(['au', 'cu', null, null]);
  const [nonMetalSlot, setNonMetalSlot] = useState<string | null>(null);
  const [fluxSlot, setFluxSlot] = useState<string | null>('borax');

  // Custom mass / percentage distribution (defaults to equal)
  const [metalWeights, setMetalWeights] = useState<number[]>([50, 50, 0, 0]);

  // Furnace / Crucible simulation state
  const [crucibleTemp, setCrucibleTemp] = useState<number>(1150); // °C
  const [isBurnerActive, setIsBurnerActive] = useState<boolean>(true);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [libraryFilter, setLibraryFilter] = useState<string>('all');
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [inspectingMetal, setInspectingMetal] = useState<MetalElement | null>(null);

  // Safety Dismissable Alert Modal for Mercury
  const [showMercuryDismissModal, setShowMercuryDismissModal] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  // Active slot selection target for Library clicks
  const [activeTargetSlot, setActiveTargetSlot] = useState<number>(0);

  // Historial de la sesión: guarda las últimas 5 fórmulas calculadas con persistencia en sessionStorage
  const [history, setHistory] = useState<HistoricalAlloy[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = sessionStorage.getItem('espiquumeyria_metallurgy_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.slice(0, 5);
      }
    } catch (e) {
      console.warn('Error reading metallurgy session history', e);
    }
    return [];
  });
  const [historyToast, setHistoryToast] = useState<string | null>(null);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState<boolean>(true);

  // Modal selector de metales en carrusel (estilo Screenshot 2)
  const [isMetalModalOpen, setIsMetalModalOpen] = useState<boolean>(false);
  const [modalSlotIndex, setModalSlotIndex] = useState<number>(0);
  const [modalCarouselIndex, setModalCarouselIndex] = useState<number>(0);

  // Modales selectores para Aditivos (No Metales y Fundente)
  const [isNonMetalModalOpen, setIsNonMetalModalOpen] = useState<boolean>(false);
  const [isFluxModalOpen, setIsFluxModalOpen] = useState<boolean>(false);

  // Synchronize or initialize weights when occupied metal slots change count
  useEffect(() => {
    const occupiedIndices = metalSlots.map((m, idx) => m ? idx : -1).filter(idx => idx !== -1);
    const count = occupiedIndices.length;
    if (count === 0) {
      setMetalWeights([0, 0, 0, 0]);
    } else {
      const currentOccupiedSum = occupiedIndices.reduce((sum, idx) => sum + (metalWeights[idx] || 0), 0);
      if (currentOccupiedSum <= 0 || currentOccupiedSum > 100) {
        const equalShare = Math.floor(100 / count);
        const newWeights = [0, 0, 0, 0];
        occupiedIndices.forEach((idx, i) => {
          if (i === count - 1) {
            const sumPrev = newWeights.reduce((a, b) => a + b, 0);
            newWeights[idx] = 100 - sumPrev;
          } else {
            newWeights[idx] = equalShare;
          }
        });
        setMetalWeights(newWeights);
      }
    }
  }, [metalSlots]);

  const handleWeightChange = (slotIdx: number, newWeight: number) => {
    const updatedWeights = [...metalWeights];
    updatedWeights[slotIdx] = Math.max(0, Math.min(100, newWeight));
    
    const activeIndices = metalSlots.map((m, idx) => m ? idx : -1).filter(idx => idx !== -1);
    if (activeIndices.length > 1) {
      const otherIndices = activeIndices.filter(idx => idx !== slotIdx);
      const remainingWeight = Math.max(0, 100 - updatedWeights[slotIdx]);
      const currentOtherSum = otherIndices.reduce((sum, idx) => sum + metalWeights[idx], 0);
      
      if (currentOtherSum > 0) {
        otherIndices.forEach(idx => {
          const proportion = metalWeights[idx] / currentOtherSum;
          updatedWeights[idx] = Math.round(proportion * remainingWeight);
        });
      } else {
        const equalShare = Math.round(remainingWeight / otherIndices.length);
        otherIndices.forEach(idx => {
          updatedWeights[idx] = equalShare;
        });
      }
      
      const totalSum = activeIndices.reduce((sum, idx) => sum + updatedWeights[idx], 0);
      if (totalSum !== 100 && otherIndices.length > 0) {
        updatedWeights[otherIndices[0]] += (100 - totalSum);
      }
    } else {
      updatedWeights[slotIdx] = 100;
    }
    
    setMetalWeights(updatedWeights);
  };

  const handleDistributeEqually = () => {
    const activeIndices = metalSlots.map((m, idx) => m ? idx : -1).filter(idx => idx !== -1);
    const count = activeIndices.length;
    if (count === 0) return;
    const equalShare = Math.floor(100 / count);
    const newWeights = [0, 0, 0, 0];
    activeIndices.forEach((idx, i) => {
      if (i === count - 1) {
        const sumPrev = newWeights.reduce((a, b) => a + b, 0);
        newWeights[idx] = 100 - sumPrev;
      } else {
        newWeights[idx] = equalShare;
      }
    });
    setMetalWeights(newWeights);
  };

  // Calculate dynamic alloy result
  const alloyResult: CalculatedAlloyResult = useMemo(() => {
    return calcularAleacion(metalSlots, nonMetalSlot, fluxSlot, metalWeights);
  }, [metalSlots, nonMetalSlot, fluxSlot, metalWeights]);

  // Detect presence of Mercury (Hg)
  const hasMercury = useMemo(() => {
    return metalSlots.some(m => m === 'hg');
  }, [metalSlots]);

  // When Mercury is inserted, auto-highlight safety modal once
  useEffect(() => {
    if (hasMercury) {
      setShowMercuryDismissModal(true);
    }
  }, [hasMercury]);

  // Calculate dynamic progress bar percentage: 25% per metal slot occupied
  const occupiedMetalCount = useMemo(() => {
    return metalSlots.filter(Boolean).length;
  }, [metalSlots]);
  const progressPct = occupiedMetalCount * 25;
  const isPremiumActive = Boolean(fluxSlot);

  // Registrar automáticamente en el historial de sesión (últimas 5 fórmulas)
  useEffect(() => {
    if (occupiedMetalCount === 0 || !alloyResult.nombre || alloyResult.nombre === 'Crisol Vacío') {
      return;
    }

    const signature = `${[...metalSlots].filter(Boolean).sort().join(',')}|${nonMetalSlot || ''}|${fluxSlot || ''}`;

    setHistory(prev => {
      if (prev.length > 0 && prev[0].signature === signature) {
        return prev;
      }

      const newEntry: HistoricalAlloy = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        signature,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        fullDate: new Date().toLocaleDateString(),
        nombre: alloyResult.nombre,
        tipo: alloyResult.tipo,
        color: alloyResult.color || '#CBD5E1',
        densidadCalculada: alloyResult.densidadCalculada,
        puntoFusionEstimado: alloyResult.puntoFusionEstimado,
        rangoFusionSolidus: alloyResult.rangoFusionSolidus,
        rangoFusionLiquidus: alloyResult.rangoFusionLiquidus,
        durezaEstimadaHV: alloyResult.durezaEstimadaHV,
        resistenciaTraccionMPa: alloyResult.resistenciaTraccionMPa,
        metalSlots: [...metalSlots],
        nonMetalSlot,
        fluxSlot,
        metalesSimbolos: alloyResult.metalesUtilizados.map(m => m.metal.symbol),
        noMetalNombre: alloyResult.noMetalUtilizado?.name,
        fundenteNombre: alloyResult.fundenteUtilizado?.name,
        esPeligroso: alloyResult.esPeligroso,
        alerta: alloyResult.alerta,
        fasePredominante: alloyResult.fasePredominante,
      };

      const updated = [newEntry, ...prev.filter(p => p.signature !== signature)].slice(0, 5);
      try {
        sessionStorage.setItem('espiquumeyria_metallurgy_history', JSON.stringify(updated));
      } catch (err) {
        console.warn('Error saving metallurgy history to sessionStorage', err);
      }
      return updated;
    });
  }, [metalSlots, nonMetalSlot, fluxSlot, alloyResult.nombre, occupiedMetalCount]);

  // Cargar fórmula desde el historial al crisol
  const handleRestoreFromHistory = (item: HistoricalAlloy) => {
    setMetalSlots([...item.metalSlots]);
    setNonMetalSlot(item.nonMetalSlot);
    setFluxSlot(item.fluxSlot);
    if (item.puntoFusionEstimado > 0) {
      setCrucibleTemp(item.puntoFusionEstimado + 60);
      setIsBurnerActive(true);
    }
    setHistoryToast(`Fórmula restaurada en el crisol: ${item.nombre}`);
    setTimeout(() => setHistoryToast(null), 2500);
  };

  // Limpiar historial de sesión
  const handleClearHistory = () => {
    setHistory([]);
    try {
      sessionStorage.removeItem('espiquumeyria_metallurgy_history');
    } catch (e) {}
    setHistoryToast('Historial de la sesión vaciado');
    setTimeout(() => setHistoryToast(null), 2000);
  };

  // Physical state in the crucible based on temperature vs melting point
  const cruciblePhase = useMemo(() => {
    if (occupiedMetalCount === 0) return 'Vacío';
    if (crucibleTemp < alloyResult.rangoFusionSolidus) return 'Sólido (Fase Cristalina)';
    if (crucibleTemp < alloyResult.rangoFusionLiquidus) return 'Pastoso / Bifásico (Líquido + Sólido)';
    return 'Líquido Homogéneo Fundido (Colada Lista)';
  }, [crucibleTemp, alloyResult, occupiedMetalCount]);

  // Slot change handlers
  const handleSetMetalSlot = (slotIndex: number, metalId: string | null) => {
    const next = [...metalSlots];
    next[slotIndex] = metalId;
    setMetalSlots(next);
  };

  const handleOpenMetalModal = (slotIndex: number) => {
    setModalSlotIndex(slotIndex);
    const existingMetalId = metalSlots[slotIndex];
    if (existingMetalId) {
      const idx = gameDatabase.metals.findIndex(m => m.id === existingMetalId);
      setModalCarouselIndex(idx >= 0 ? idx : 0);
    } else {
      setModalCarouselIndex(0);
    }
    setIsMetalModalOpen(true);
  };

  const handleConfirmModalMetal = () => {
    const selectedMetal = gameDatabase.metals[modalCarouselIndex];
    if (selectedMetal) {
      handleSetMetalSlot(modalSlotIndex, selectedMetal.id);
    }
    setIsMetalModalOpen(false);
  };

  const handleClearSlots = () => {
    setMetalSlots([null, null, null, null]);
    setNonMetalSlot(null);
    setFluxSlot(null);
    setCrucibleTemp(25);
    setIsBurnerActive(false);
  };

  // Quick Presets
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'sterling':
        setMetalSlots(['ag', 'cu', null, null]);
        setNonMetalSlot(null);
        setFluxSlot('borax');
        setCrucibleTemp(1000);
        setIsBurnerActive(true);
        break;
      case 'rose_gold':
        setMetalSlots(['au', 'cu', null, null]);
        setNonMetalSlot(null);
        setFluxSlot('borax');
        setCrucibleTemp(1100);
        setIsBurnerActive(true);
        break;
      case 'tri_gold':
        setMetalSlots(['au', 'ag', 'cu', null]);
        setNonMetalSlot(null);
        setFluxSlot('borax');
        setCrucibleTemp(1080);
        setIsBurnerActive(true);
        break;
      case 'carbon_steel':
        setMetalSlots(['fe', null, null, null]);
        setNonMetalSlot('c');
        setFluxSlot('borax');
        setCrucibleTemp(1580);
        setIsBurnerActive(true);
        break;
      case 'stainless_steel':
        setMetalSlots(['fe', 'ni', 'cr', null]);
        setNonMetalSlot('c');
        setFluxSlot('kno3');
        setCrucibleTemp(1520);
        setIsBurnerActive(true);
        break;
      case 'aerospace_ti':
        setMetalSlots(['ti', 'al', null, null]);
        setNonMetalSlot(null);
        setFluxSlot('caf2');
        setCrucibleTemp(1700);
        setIsBurnerActive(true);
        break;
      case 'amalgam_au':
        setMetalSlots(['au', 'hg', null, null]);
        setNonMetalSlot(null);
        setFluxSlot(null);
        setCrucibleTemp(25);
        setIsBurnerActive(false);
        break;
      case 'tungsten_heavy':
        setMetalSlots(['w', 'ni', 'fe', null]);
        setNonMetalSlot(null);
        setFluxSlot('caf2');
        setCrucibleTemp(1550);
        setIsBurnerActive(true);
        break;
      case 'phosphor_bronze':
        setMetalSlots(['cu', 'sn', null, null]);
        setNonMetalSlot('p');
        setFluxSlot('borax');
        setCrucibleTemp(1050);
        setIsBurnerActive(true);
        break;
      case 'white_gold_pd':
        setMetalSlots(['au', 'pd', null, null]);
        setNonMetalSlot(null);
        setFluxSlot('borax');
        setCrucibleTemp(1200);
        setIsBurnerActive(true);
        break;
      case 'inox_316':
        setMetalSlots(['fe', 'cr', 'ni', null]);
        setNonMetalSlot('c');
        setFluxSlot('caf2');
        setCrucibleTemp(1550);
        setIsBurnerActive(true);
        break;
      case 'hss_m2':
        setMetalSlots(['fe', 'w', 'cr', null]);
        setNonMetalSlot('c');
        setFluxSlot('caf2');
        setCrucibleTemp(1600);
        setIsBurnerActive(true);
        break;
      case 'platinum_iridium':
        setMetalSlots(['pt', 'ir', null, null]);
        setNonMetalSlot(null);
        setFluxSlot('cryolite');
        setCrucibleTemp(1900);
        setIsBurnerActive(true);
        break;
      case 'argentium':
        setMetalSlots(['ag', 'cu', null, null]);
        setNonMetalSlot('ge');
        setFluxSlot('borax');
        setCrucibleTemp(1020);
        setIsBurnerActive(true);
        break;
      case 'inconel_625':
        setMetalSlots(['ni', 'cr', null, null]);
        setNonMetalSlot(null);
        setFluxSlot('caf2');
        setCrucibleTemp(1450);
        setIsBurnerActive(true);
        break;
      case 'aluminum_bronze':
        setMetalSlots(['cu', 'al', null, null]);
        setNonMetalSlot(null);
        setFluxSlot('borax');
        setCrucibleTemp(1080);
        setIsBurnerActive(true);
        break;
      case 'purple_gold':
        setMetalSlots(['au', 'al', null, null]);
        setNonMetalSlot(null);
        setFluxSlot(null);
        setCrucibleTemp(1100);
        setIsBurnerActive(true);
        break;
      default:
        break;
    }
  };

  // Add metal from library to next available slot
  const handleAddFromLibrary = (metal: MetalElement) => {
    const emptyIndex = metalSlots.findIndex(s => s === null);
    if (emptyIndex !== -1) {
      handleSetMetalSlot(emptyIndex, metal.id);
    } else {
      handleSetMetalSlot(activeTargetSlot, metal.id);
    }
    setInspectingMetal(metal);
  };

  // Copy full metallurgical report
  const handleCopyReport = () => {
    const report = `=====================================================
HOJA DE ESPECIFICACIÓN METALÚRGICA - ALEACIONES METÁLICAS
=====================================================
Aleación: ${alloyResult.nombre}
Tipo / Clasificación: ${alloyResult.tipo}
Norma / Grado Estimado: ${alloyResult.gradoNorma || 'Experimental'}

COMPOSICIÓN:
${alloyResult.metalesUtilizados.map(m => ` • ${m.metal.name} (${m.metal.symbol}): ${Math.round(m.porcentaje)}% en masa`).join('\n')}
${alloyResult.noMetalUtilizado ? ` • No Metal: ${alloyResult.noMetalUtilizado.name} (${alloyResult.noMetalUtilizado.role})` : ' • Sin no-metal endurecedor'}
${alloyResult.fundenteUtilizado ? ` • Fundente Activo: ${alloyResult.fundenteUtilizado.name} (${alloyResult.fundenteUtilizado.formula})` : ' • Sin fundente'}

PROPIEDADES FÍSICO-QUÍMICAS CALCULADAS:
 • Densidad Volumétrica Promedio: ${alloyResult.densidadCalculada} g/cm³
 • Punto de Fusión Estimado: ${alloyResult.puntoFusionEstimado} °C (${alloyResult.puntoFusionEstimado + 273.15} K)
 • Intervalo de Fusión: Solidus ${alloyResult.rangoFusionSolidus} °C — Liquidus ${alloyResult.rangoFusionLiquidus} °C
 • Dureza Estimada: ~${alloyResult.durezaEstimadaHV} HV (Vickers)
 • Resistencia a la Tracción: ~${alloyResult.resistenciaTraccionMPa} MPa
 • Fase Predominante: ${alloyResult.fasePredominante}

NOTAS METALÚRGICAS:
${alloyResult.descripcionMetalurgica}

${alloyResult.alerta ? `ALERTA DE SEGURIDAD:\n${alloyResult.alerta}\n` : ''}
Generado por Espiquumeyria - Plataforma de Metalurgia Educativa
=====================================================`;

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(report).then(() => {
        setCopiedReport(true);
        setTimeout(() => setCopiedReport(false), 2200);
      });
    }
  };

  // Text-to-speech narration
  const handleToggleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const textToRead = `${alloyResult.nombre}. ${alloyResult.tipo}. Densidad calculada: ${alloyResult.densidadCalculada} gramos por centímetro cúbico. Punto de fusión estimado: ${alloyResult.puntoFusionEstimado} grados Celsius. ${alloyResult.descripcionMetalurgica}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Filter library metals
  const filteredLibraryMetals = useMemo(() => {
    return gameDatabase.metals.filter(m => {
      if (libraryFilter !== 'all' && m.category.toLowerCase() !== libraryFilter.toLowerCase()) {
        return false;
      }
      if (librarySearch.trim()) {
        const q = librarySearch.toLowerCase();
        return m.name.toLowerCase().includes(q) || 
               m.symbol.toLowerCase().includes(q) || 
               m.category.toLowerCase().includes(q) ||
               m.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [libraryFilter, librarySearch]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Top Banner / Header Bar */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#120d0a] via-[#1a120c] to-[#0d131f] p-4 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                WEB 08 · Metalurgia Educativa
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                Leyes de Hume-Rothery & Crisol Dinámico
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Aleaciones Metálicas & Horno de Fundición</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Laboratorio interactivo de pirometalurgia y ciencias de materiales. Combina metales refractarios, preciosos, base, endurecedores de red y fundentes activos con cálculo dinámico de densidad y termodinámica de fases.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsLibraryOpen(prev => !prev)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-medium text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer hover:border-amber-400"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>{isLibraryOpen ? 'Ocultar Biblioteca' : 'Ver Biblioteca de Metales'}</span>
            </button>

            <button
              onClick={handleToggleSpeak}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                isSpeaking 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500 animate-pulse' 
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Narrar dictamen metalúrgico"
            >
              {isSpeaking ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span className="hidden sm:inline">{isSpeaking ? 'Pausar Voz' : 'Escuchar Cátedra'}</span>
            </button>

            <button
              onClick={handleCopyReport}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copiar informe técnico completo al portapapeles"
            >
              {copiedReport ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
              <span>{copiedReport ? '¡Copiado!' : 'Exportar Ficha'}</span>
            </button>

            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow"
              title="Generar Ficha Técnica en PDF Simulado"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Informe PDF Normado</span>
            </button>

            <button
              onClick={handleClearSlots}
              className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-xs flex items-center gap-1 transition-all cursor-pointer"
              title="Vaciar crisol"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Vaciar Crisol</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PROGRESS BAR DINÁMICA: "TOTAL 0% - 100%" CON EFECTO FUNDENTE ACTIVO     */}
        {/* ========================================================================= */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">CARGA DEL CRISOL (4 RANURAS):</span>
              <span className="text-amber-400 font-bold text-sm tracking-wide">
                TOTAL {progressPct}%
              </span>
              <span className="text-slate-500 hidden sm:inline">
                ({occupiedMetalCount} de 4 slots ocupados · +25% por ranura)
              </span>
            </div>

            {isPremiumActive && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.35)] animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                ¡Aleación Premium Activada! ({alloyResult.fundenteUtilizado?.name})
              </span>
            )}
          </div>

          {/* Glowing bar */}
          <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
            <div 
              className={`h-full rounded-full transition-all duration-500 ease-out relative ${
                isPremiumActive
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.8)]'
                  : 'bg-gradient-to-r from-amber-600 to-amber-400'
              }`}
              style={{ width: `${Math.max(progressPct, 4)}%` }}
            >
              {/* Internal heat shimmer animation */}
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ALERTA CRÍTICA DE SEGURIDAD PARA EL MERCURIO (Hg)                        */}
      {/* ========================================================================= */}
      {hasMercury && (
        <div className="rounded-2xl border-2 border-red-500 bg-red-950/40 p-4 sm:p-5 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/60 text-red-400 shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base sm:text-lg font-bold text-red-200 flex items-center gap-2">
                  <span>¡ALERTA DE SEGURIDAD METALÚRGICA: MERCURIO DETECTADO (Hg)!</span>
                  <span className="px-2 py-0.5 text-xs font-mono bg-red-900/60 text-red-300 border border-red-700 rounded">
                    ADR Clase 8 / 6.1 Tóxico
                  </span>
                </h3>
              </div>
              <p className="text-sm text-red-100 leading-relaxed font-sans">
                <strong>Alta toxicidad por vapores de mercurio:</strong> El mercurio elemental ebulle a <span className="font-mono font-bold text-amber-300">356.7 °C</span> y genera vapores neurotóxicos invisibles acumulativos que atacan el sistema nervioso central, causando hidrargirismo permanente. Las amalgamas se forman por disolución interfacial en frío a 20 °C; <span className="underline decoration-red-400 font-semibold">está terminantemente prohibido encender el crisol térmico por encima de 40 °C</span> sin campana extractora certificada con filtro de carbón activado sulfurado.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-red-200">
                <span className="px-2 py-1 rounded bg-black/40 border border-red-500/40">
                  NFPA 704: Salud 3 · Inflamabilidad 0 · Reactividad 0 · Específico: Tóxico
                </span>
                <span className="px-2 py-1 rounded bg-black/40 border border-red-500/40">
                  P.Fusión: -38.8 °C (Líquido) · Densidad: 13.53 g/cm³
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOTONERA DE RECETAS RÁPIDAS (PRESETS PEDAGÓGICOS)                         */}
      {/* ========================================================================= */}
      <div className="bg-[#0b111d] rounded-2xl border border-slate-800 p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-2 text-xs font-mono text-slate-400">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>RECETAS METALÚRGICAS RÁPIDAS (1-CLIC):</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
          <button
            onClick={() => applyPreset('sterling')}
            className="p-2 text-left rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 transition-all cursor-pointer group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 flex items-center justify-between">
              <span>Plata Sterling</span>
              <span className="text-[10px] text-slate-500">925</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Ag + Cu + Bórax</div>
          </button>

          <button
            onClick={() => applyPreset('rose_gold')}
            className="p-2 text-left rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 transition-all cursor-pointer group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 flex items-center justify-between">
              <span>Oro Rosado</span>
              <span className="text-[10px] text-rose-400">18K</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Au + Cu</div>
          </button>

          <button
            onClick={() => applyPreset('tri_gold')}
            className="p-2 text-left rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 transition-all cursor-pointer group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 flex items-center justify-between">
              <span>Oro Amarillo</span>
              <span className="text-[10px] text-amber-300">18K</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Au + Ag + Cu</div>
          </button>

          <button
            onClick={() => applyPreset('white_gold_pd')}
            className="p-2 text-left rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 transition-all cursor-pointer group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 flex items-center justify-between">
              <span>Oro Blanco Pd</span>
              <span className="text-[10px] text-slate-300">Hipo</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Au + Pd</div>
          </button>

          <button
            onClick={() => applyPreset('argentium')}
            className="p-2 text-left rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 transition-all cursor-pointer group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 flex items-center justify-between">
              <span>Argentium</span>
              <span className="text-[10px] text-cyan-300">935</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Ag + Cu + Ge</div>
          </button>

          <button
            onClick={() => applyPreset('platinum_iridium')}
            className="p-2 text-left rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 transition-all cursor-pointer group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 flex items-center justify-between">
              <span>Platino-Iridio</span>
              <span className="text-[10px] text-slate-300">Pt90</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Pt + Ir</div>
          </button>

          <button
            onClick={() => applyPreset('carbon_steel')}
            className="p-2 text-left rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 transition-all cursor-pointer group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 flex items-center justify-between">
              <span>Acero 1045</span>
              <span className="text-[10px] text-cyan-400">AISI</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Fe + C + Bórax</div>
          </button>

          <button
            onClick={() => applyPreset('inox_316')}
            className="p-2 text-left rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 transition-all cursor-pointer group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 flex items-center justify-between">
              <span>Inox 316 Marino</span>
              <span className="text-[10px] text-blue-400">Inox</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Fe + Cr + Ni + C</div>
          </button>

          <button
            onClick={() => applyPreset('hss_m2')}
            className="p-2 text-left rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 transition-all cursor-pointer group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 flex items-center justify-between">
              <span>Acero Rápido M2</span>
              <span className="text-[10px] text-slate-400">HSS</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Fe + W + Cr + C</div>
          </button>

          <button
            onClick={() => applyPreset('inconel_625')}
            className="p-2 text-left rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 transition-all cursor-pointer group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 flex items-center justify-between">
              <span>Inconel 625</span>
              <span className="text-[10px] text-purple-400">Super</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Ni + Cr (Extremo)</div>
          </button>

          <button
            onClick={() => applyPreset('aerospace_ti')}
            className="p-2 text-left rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 transition-all cursor-pointer group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 flex items-center justify-between">
              <span>Titanio Grado 5</span>
              <span className="text-[10px] text-purple-400">Aero</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Ti + Al + CaF₂</div>
          </button>

          <button
            onClick={() => applyPreset('aluminum_bronze')}
            className="p-2 text-left rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 transition-all cursor-pointer group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 flex items-center justify-between">
              <span>Bronce Aluminio</span>
              <span className="text-[10px] text-amber-400">C95400</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Cu + Al + Bórax</div>
          </button>

          <button
            onClick={() => applyPreset('purple_gold')}
            className="p-2 text-left rounded-xl bg-purple-950/30 hover:bg-purple-900/40 border border-purple-800/40 hover:border-purple-600 transition-all cursor-pointer group"
          >
            <div className="text-xs font-bold text-purple-200 group-hover:text-purple-100 flex items-center justify-between">
              <span>Oro Púrpura</span>
              <span className="text-[10px] text-purple-400">AuAl₂</span>
            </div>
            <div className="text-[10px] text-purple-300 font-mono mt-0.5">Au + Al (Morado)</div>
          </button>

          <button
            onClick={() => applyPreset('amalgam_au')}
            className="p-2 text-left rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-800/40 hover:border-red-600 transition-all cursor-pointer group"
          >
            <div className="text-xs font-bold text-red-200 group-hover:text-red-100 flex items-center justify-between">
              <span>Amalgama Oro</span>
              <span className="text-[10px] text-red-400">Alerta Hg</span>
            </div>
            <div className="text-[10px] text-red-300 font-mono mt-0.5">Au + Hg (Frío)</div>
          </button>
        </div>
      </div>

      {/* Toast de notificación del historial */}
      {historyToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0d1624] border border-amber-500/60 text-amber-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5 font-mono text-xs">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{historyToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HISTORIAL DE ALEACIONES DE LA SESIÓN (ÚLTIMAS 5 FÓRMULAS)                */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-slate-800 bg-[#0a0f19] p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Historial de Fórmulas Calculadas
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 text-amber-300 border border-slate-700">
                  {history.length} / 5 en Sesión
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Guarda automáticamente las últimas 5 aleaciones calculadas durante tu sesión de trabajo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-red-950/40 text-slate-400 hover:text-red-300 border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Vaciar el historial de la sesión"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar Historial</span>
              </button>
            )}
            <button
              onClick={() => setIsHistoryExpanded(prev => !prev)}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
            >
              {isHistoryExpanded ? 'Minimizar' : 'Desplegar'}
            </button>
          </div>
        </div>

        {isHistoryExpanded && (
          <div>
            {history.length === 0 ? (
              <div className="py-6 px-4 text-center rounded-xl bg-slate-900/30 border border-dashed border-slate-800">
                <Clock className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-sans">
                  Aún no has forjado aleaciones en esta sesión.
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Combina metales en las ranuras del crisol para registrar automáticamente hasta 5 fórmulas históricas.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
                {history.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-900/70 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-2 group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span className="font-bold text-amber-400/90">#{idx + 1} {idx === 0 ? '(Última)' : ''}</span>
                        <span>{item.timestamp}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1 truncate group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate">{item.nombre}</span>
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 block truncate">
                        {item.tipo}
                      </span>

                      {/* Chemical composition pills */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.metalesSimbolos.map((sym, sIdx) => (
                          <span key={sIdx} className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
                            {sym}
                          </span>
                        ))}
                        {item.noMetalNombre && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-950/60 text-purple-300 border border-purple-800">
                            +{item.noMetalNombre.split(' ')[0]}
                          </span>
                        )}
                        {item.fundenteNombre && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-800">
                            ★{item.fundenteNombre.split(' ')[0]}
                          </span>
                        )}
                      </div>

                      {/* Key stats */}
                      <div className="grid grid-cols-2 gap-1 mt-2 text-[10px] font-mono text-slate-400 bg-black/30 p-1.5 rounded-lg border border-slate-800/80">
                        <div>
                          <span className="text-slate-500 block text-[9px]">DENSIDAD:</span>
                          <span className="text-cyan-300 font-semibold">{item.densidadCalculada} g/cm³</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">P. FUSIÓN:</span>
                          <span className="text-amber-300 font-semibold">{item.puntoFusionEstimado} °C</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRestoreFromHistory(item)}
                      className="w-full mt-2 py-1.5 px-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Cargar esta fórmula en el crisol"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Cargar en Crisol</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN LAB WORKBENCH                                             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 Cols): The Crucible, 4 Metal Slots, 1 Non-Metal, 1 Flux */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Crucible and Temperature Unit */}
          <div className="rounded-2xl border border-slate-800 bg-[#0a0f19] p-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Flame className={`w-5 h-5 ${isBurnerActive ? 'text-orange-500 animate-bounce' : 'text-slate-500'}`} />
                <h2 className="text-base font-bold text-white tracking-wide">
                  Crisol Termodinámico de Fusión
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className={`px-2 py-0.5 rounded-full border ${
                  cruciblePhase.startsWith('Líquido') 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : cruciblePhase.startsWith('Pastoso') 
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/40' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  Estado: {cruciblePhase}
                </span>
              </div>
            </div>

            {/* Crucible Graphical Simulation */}
            <div className="relative w-full h-48 sm:h-56 rounded-xl bg-gradient-to-b from-[#06090e] to-[#111723] border border-slate-800/90 overflow-hidden flex flex-col items-center justify-center p-4">
              
              {/* Thermal Glow background when burner is on */}
              {isBurnerActive && (
                <div 
                  className="absolute inset-0 pointer-events-none transition-opacity duration-700"
                  style={{
                    background: `radial-gradient(circle at 50% 60%, rgba(245, 158, 11, ${Math.min(crucibleTemp / 2000, 0.45)}), rgba(234, 88, 12, 0.1) 40%, transparent 70%)`
                  }}
                />
              )}

              {/* Physical Crucible Graphic (SVG) */}
              <div className="relative w-64 sm:w-72 h-36 flex items-center justify-center">
                <svg viewBox="0 0 200 120" className="w-full h-full drop-shadow-2xl">
                  <defs>
                    <linearGradient id="crucibleBody" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#334155" />
                      <stop offset="60%" stopColor="#1e293b" />
                      <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                    <radialGradient id="moltenMetalGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={alloyResult.color || '#F59E0B'} stopOpacity="1" />
                      <stop offset="70%" stopColor={isBurnerActive && crucibleTemp > 800 ? '#FF4500' : '#475569'} stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#1e293b" stopOpacity="0.6" />
                    </radialGradient>
                  </defs>

                  {/* Crucible base / Stand */}
                  <path d="M 50 110 L 150 110 L 140 118 L 60 118 Z" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                  
                  {/* Outer Crucible ceramic hull */}
                  <path d="M 25 25 Q 30 105 100 108 Q 170 105 175 25 Z" fill="url(#crucibleBody)" stroke="#64748b" strokeWidth="2.5" />
                  
                  {/* Crucible Lip */}
                  <ellipse cx="100" cy="25" rx="75" ry="12" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                  
                  {/* Molten Metal pool inside crucible */}
                  {occupiedMetalCount > 0 ? (
                    <>
                      <ellipse cx="100" cy="30" rx="66" ry="10" fill="url(#moltenMetalGlow)" />
                      {/* Active convection ripples when liquid */}
                      {crucibleTemp >= alloyResult.rangoFusionLiquidus && isBurnerActive && (
                        <ellipse cx="100" cy="30" rx="45" ry="6" fill="none" stroke="#FFF" strokeWidth="1.2" opacity="0.6" className="animate-ping" />
                      )}
                    </>
                  ) : (
                    <ellipse cx="100" cy="30" rx="66" ry="10" fill="#0f172a" opacity="0.8" />
                  )}

                  {/* Heat flames below crucible if burner on */}
                  {isBurnerActive && crucibleTemp > 100 && (
                    <g className="animate-pulse">
                      <polygon points="90,118 100,105 110,118" fill="#F59E0B" opacity="0.8" />
                      <polygon points="75,118 85,108 95,118" fill="#EF4444" opacity="0.7" />
                      <polygon points="105,118 115,108 125,118" fill="#EF4444" opacity="0.7" />
                    </g>
                  )}
                </svg>

                {/* Crucible Overlay Text */}
                <div className="absolute bottom-2 text-center pointer-events-none">
                  <div className="text-xs font-mono font-bold text-amber-300 drop-shadow">
                    {occupiedMetalCount > 0 ? `${alloyResult.nombre}` : 'Crisol Vacío'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-300">
                    {crucibleTemp} °C ({crucibleTemp + 273} K)
                  </div>
                </div>
              </div>

              {/* Temperature slider & burner controls */}
              <div className="w-full mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/40 p-2.5 rounded-lg border border-slate-800">
                <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                  <Thermometer className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                      <span>TEMPERATURA DEL HORNO:</span>
                      <span className="text-amber-400 font-bold">{crucibleTemp} °C</span>
                    </div>
                    <input 
                      type="range"
                      min={20}
                      max={3500}
                      step={10}
                      value={crucibleTemp}
                      onChange={(e) => {
                        setCrucibleTemp(parseInt(e.target.value, 10));
                        if (!isBurnerActive) setIsBurnerActive(true);
                      }}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (alloyResult.puntoFusionEstimado > 0) {
                        setCrucibleTemp(alloyResult.puntoFusionEstimado + 60);
                        setIsBurnerActive(true);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono transition-all cursor-pointer whitespace-nowrap"
                    title="Ajustar la temperatura automáticamente 60°C por encima del punto de fusión"
                  >
                    Alcanzar Fusión ({alloyResult.puntoFusionEstimado + 60} °C)
                  </button>

                  <button
                    onClick={() => setIsBurnerActive(prev => !prev)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                      isBurnerActive 
                        ? 'bg-orange-500 text-black font-bold hover:bg-orange-400' 
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {isBurnerActive ? 'Quemador ON' : 'Quemador OFF'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECCIÓN METALES (2x2 GRID - SCREENSHOT 1)                                 */}
          {/* ========================================================================= */}
          <div className="rounded-2xl border border-slate-800 bg-[#0b111d] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
                <Wrench className="w-4 h-4 text-slate-400" />
                <span className="tracking-wider">METALES & PROPORCIONES (%)</span>
              </div>
              <div className="flex items-center gap-3">
                {occupiedMetalCount > 1 && (
                  <button
                    onClick={handleDistributeEqually}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-mono transition cursor-pointer"
                    title="Repartir porcentaje equitativamente entre los metales activos"
                  >
                    Equilibrar Equitativamente
                  </button>
                )}
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-mono font-bold text-slate-400">TOTAL</span>
                  <div className="w-28 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-300 rounded-full transition-all duration-300" 
                      style={{ width: `${progressPct}%` }} 
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-200">{progressPct}%</span>
                </div>
              </div>
            </div>

            {/* 2x2 Grid of 4 Metal Slots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[0, 1, 2, 3].map((slotIdx) => {
                const metalId = metalSlots[slotIdx];
                const metalData = gameDatabase.metals.find(m => m.id === metalId);

                if (!metalData) {
                  return (
                    <div 
                      key={slotIdx}
                      onClick={() => handleOpenMetalModal(slotIdx)}
                      className="border-2 border-dashed border-slate-700/80 hover:border-cyan-400/80 bg-slate-900/30 hover:bg-slate-900/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[140px] group select-none shadow-sm"
                    >
                      <Plus className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 group-hover:scale-110 transition-all mb-1" />
                      <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200">Añadir metal</span>
                      <span className="text-[10px] font-mono text-slate-600 mt-0.5">Ranura #{slotIdx + 1}</span>
                    </div>
                  );
                }

                return (
                  <div 
                    key={slotIdx}
                    className={`rounded-2xl border p-4 flex flex-col justify-between transition-all relative min-h-[140px] ${
                      metalData.id === 'hg'
                        ? 'border-red-500/70 bg-red-950/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                        : 'border-slate-700/80 bg-slate-900/90 hover:border-amber-400/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-lg shadow-md shrink-0 cursor-pointer"
                          style={{ 
                            backgroundColor: metalData.colorHex + '25', 
                            color: metalData.colorHex,
                            border: `1.5px solid ${metalData.colorHex}66`
                          }}
                          onClick={() => handleOpenMetalModal(slotIdx)}
                          title="Clic para cambiar metal"
                        >
                          {metalData.symbol}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{metalData.name}</h4>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              metalData.id === 'hg' ? 'bg-red-900/80 text-red-200' : 'bg-slate-800 text-amber-300'
                            }`}>
                              {metalData.category}
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>ρ: {metalData.density} g/cm³</span>
                            <span>•</span>
                            <span>Tm: {metalData.melting} °C</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenMetalModal(slotIdx)}
                          className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 text-xs font-mono transition"
                          title="Cambiar este metal"
                        >
                          Cambiar
                        </button>
                        <button
                          onClick={() => handleSetMetalSlot(slotIdx, null)}
                          className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition"
                          title="Remover este metal del crisol"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Porcentaje de Aleación y Slider */}
                    <div className="pt-2.5 border-t border-slate-800/80 mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">PROPORCIÓN MÁSICA:</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={metalWeights[slotIdx]}
                            onChange={(e) => handleWeightChange(slotIdx, parseInt(e.target.value || '0', 10))}
                            className="w-12 bg-black/60 border border-slate-700 rounded px-1 text-right text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-400"
                          />
                          <span className="text-amber-400 font-bold">%</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={metalWeights[slotIdx]}
                        onChange={(e) => handleWeightChange(slotIdx, parseInt(e.target.value, 10))}
                        className="w-full accent-amber-500 cursor-pointer h-1 bg-slate-700 rounded-lg"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1.5 border-t border-slate-800/40 mt-1.5">
                      <span>Ranura #{slotIdx + 1}</span>
                      <span>Z={metalData.atomicNumber}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECCIÓN ADITIVOS (NO METALES & FUNDENTE ACTIVO - SCREENSHOT 1)             */}
          {/* ========================================================================= */}
          <div className="rounded-2xl border border-slate-800 bg-[#0b111d] p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
                <FlaskConical className="w-4 h-4 text-cyan-400" />
                <span className="tracking-wider">ADITIVOS</span>
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                <span>Añade fundente y obtén aleación premium</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* NO METALES */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-purple-400">
                  <div className="flex items-center gap-1.5">
                    <Atom className="w-4 h-4" />
                    <span>NO METALES</span>
                  </div>
                  {nonMetalSlot && (
                    <button 
                      onClick={() => setNonMetalSlot(null)} 
                      className="text-[10px] text-slate-400 hover:text-red-400 cursor-pointer"
                    >
                      Quitar
                    </button>
                  )}
                </div>

                {nonMetalSlot ? (
                  <div className="p-4 rounded-2xl border border-purple-500/50 bg-purple-950/20 flex items-center justify-between min-h-[110px]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-purple-200">
                          {alloyResult.noMetalUtilizado?.name}
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] font-mono bg-purple-900/60 text-purple-300 rounded border border-purple-700">
                          {alloyResult.noMetalUtilizado?.symbol}
                        </span>
                      </div>
                      <div className="text-xs text-purple-300/80 leading-snug">
                        {alloyResult.noMetalUtilizado?.role}
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsNonMetalModalOpen(true)} 
                      className="px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer shrink-0 ml-2"
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => setIsNonMetalModalOpen(true)} 
                    className="border-2 border-dashed border-slate-700/80 hover:border-purple-400/80 bg-slate-900/30 hover:bg-slate-900/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[110px] group select-none shadow-sm"
                  >
                    <Plus className="w-5 h-5 text-slate-500 group-hover:text-purple-400 mb-1 transition-all" />
                    <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200">No metal</span>
                  </div>
                )}
              </div>

              {/* FUNDENTE ACTIVO */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4" />
                    <span>FUNDENTE ACTIVO</span>
                  </div>
                  {fluxSlot && (
                    <button 
                      onClick={() => setFluxSlot(null)} 
                      className="text-[10px] text-slate-400 hover:text-red-400 cursor-pointer"
                    >
                      Quitar
                    </button>
                  )}
                </div>

                {fluxSlot ? (
                  <div className="p-4 rounded-2xl border border-amber-500/50 bg-amber-950/20 flex items-center justify-between min-h-[110px]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-amber-200">
                          {alloyResult.fundenteUtilizado?.name}
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] font-mono bg-amber-900/60 text-amber-300 rounded border border-amber-700">
                          {alloyResult.fundenteUtilizado?.formula}
                        </span>
                      </div>
                      <div className="text-xs text-amber-300/80 leading-snug">
                        {alloyResult.fundenteUtilizado?.bonus}
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsFluxModalOpen(true)} 
                      className="px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer shrink-0 ml-2"
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => setIsFluxModalOpen(true)} 
                    className="border-2 border-dashed border-slate-700/80 hover:border-amber-400/80 bg-slate-900/30 hover:bg-slate-900/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[110px] group select-none shadow-sm"
                  >
                    <Plus className="w-5 h-5 text-slate-500 group-hover:text-amber-400 mb-1 transition-all" />
                    <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200">Fundente</span>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Right Column (5 Cols): Dynamic Alloy Result Analysis & Properties */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Result Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#0a0f19] p-5 shadow-2xl relative overflow-hidden">
            
            {/* Ambient background glow based on alloy color */}
            <div 
              className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: alloyResult.color || '#F59E0B' }}
            />

            <div className="relative z-10 space-y-4">
              
              {/* Classification Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-slate-800 text-slate-200 border border-slate-700">
                  {alloyResult.tipo}
                </span>
                {alloyResult.esFormulaExacta && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Fórmula Estándar
                  </span>
                )}
                {alloyResult.calidad && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {alloyResult.calidad}
                  </span>
                )}
              </div>

              {/* Title & Subtitle */}
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span 
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow"
                    style={{ backgroundColor: alloyResult.color || '#CBD5E1' }}
                  />
                  <span>{alloyResult.nombre}</span>
                </h3>
                {alloyResult.subtitulo && (
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    {alloyResult.subtitulo}
                  </p>
                )}
              </div>

              {/* Key Calculated Properties Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                
                {/* Densidad Promedio Calculada */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                    <span>DENSIDAD (ρ)</span>
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="mt-1">
                    <span className="text-xl font-bold font-mono text-cyan-300">
                      {alloyResult.densidadCalculada}
                    </span>
                    <span className="text-xs text-slate-400 font-mono ml-1">g/cm³</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Regla recíproca volumétrica
                  </span>
                </div>

                {/* Punto de Fusión Estimado */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                    <span>P. FUSIÓN (Tm)</span>
                    <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="mt-1">
                    <span className="text-xl font-bold font-mono text-amber-300">
                      {alloyResult.puntoFusionEstimado}
                    </span>
                    <span className="text-xs text-slate-400 font-mono ml-1">°C</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {alloyResult.puntoFusionEstimado + 273} K (estimado)
                  </span>
                </div>

                {/* Dureza Estimada Vickers */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                    <span>DUREZA VICKERS</span>
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="mt-1">
                    <span className="text-xl font-bold font-mono text-purple-300">
                      ~{alloyResult.durezaEstimadaHV}
                    </span>
                    <span className="text-xs text-slate-400 font-mono ml-1">HV</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Resistencia a la indentación
                  </span>
                </div>

                {/* Resistencia a la Tracción */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                    <span>TRACCIÓN (Rm)</span>
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="mt-1">
                    <span className="text-xl font-bold font-mono text-emerald-300">
                      ~{alloyResult.resistenciaTraccionMPa}
                    </span>
                    <span className="text-xs text-slate-400 font-mono ml-1">MPa</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Límite elástico y de rotura
                  </span>
                </div>

              </div>

              {/* Rango de Fusión Solidus-Liquidus */}
              {alloyResult.rangoFusionSolidus > 0 && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs font-mono space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">INTERVALO BIFÁSICO SOLIDUS - LIQUIDUS:</span>
                    <span className="text-amber-400 font-bold">
                      {alloyResult.rangoFusionSolidus}°C — {alloyResult.rangoFusionLiquidus}°C
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 via-amber-500 to-red-500" />
                  </div>
                </div>
              )}

              {/* Visualizador de Composición Porcentual con Barras de Progreso */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">
                    Composición Porcentual (Barras de Progreso):
                  </span>
                  <span className="text-amber-400 font-mono">
                    Total: {alloyResult.metalesUtilizados.reduce((acc, m) => acc + m.porcentaje, 0).toFixed(0)}%
                  </span>
                </div>
                <div className="space-y-2 pt-1">
                  {alloyResult.metalesUtilizados.map(({ metal, porcentaje }, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-200 flex items-center gap-1.5">
                          <span 
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: metal.colorHex }}
                          />
                          {metal.name} ({metal.symbol})
                        </span>
                        <span className="text-amber-300 font-bold">{porcentaje.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.max(porcentaje, 2)}%`,
                            backgroundColor: metal.colorHex || '#38BDF8'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {alloyResult.noMetalUtilizado && (
                    <div className="space-y-1 pt-1 border-t border-slate-800">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-purple-300 flex items-center gap-1.5">
                          <Atom className="w-3 h-3 text-purple-400" />
                          No Metal: {alloyResult.noMetalUtilizado.name} ({alloyResult.noMetalUtilizado.symbol})
                        </span>
                        <span className="text-purple-300 font-bold">Aditivo</span>
                      </div>
                    </div>
                  )}
                  {alloyResult.fundenteUtilizado && (
                    <div className="space-y-1 pt-0.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-amber-300 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          Fundente: {alloyResult.fundenteUtilizado.name}
                        </span>
                        <span className="text-amber-300 font-bold">Activo</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Microestructura / Fase Predominante */}
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1">
                <span className="font-mono text-slate-400 uppercase text-[10px]">
                  Fase Metalográfica & Red Cristalina:
                </span>
                <p className="font-sans font-medium text-slate-200">
                  {alloyResult.fasePredominante}
                </p>
              </div>

              {/* Fundente & No metal applied badges */}
              {(alloyResult.bonusFundente || alloyResult.efectoNoMetal) && (
                <div className="space-y-1.5 text-xs font-mono">
                  {alloyResult.bonusFundente && (
                    <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-500/30 text-amber-200 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="font-sans text-[11px] leading-relaxed">
                        <strong>Efecto del Fundente:</strong> {alloyResult.bonusFundente}
                      </span>
                    </div>
                  )}
                  {alloyResult.efectoNoMetal && (
                    <div className="p-2 rounded-lg bg-purple-950/20 border border-purple-500/30 text-purple-200 flex items-start gap-2">
                      <Atom className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span className="font-sans text-[11px] leading-relaxed">
                        <strong>Modificador Intersticial:</strong> {alloyResult.efectoNoMetal}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Detailed Metallurgical Description */}
              <div className="text-xs text-slate-300 leading-relaxed font-sans bg-black/30 p-3 rounded-xl border border-slate-800/80">
                <p>{alloyResult.descripcionMetalurgica}</p>
              </div>

              {/* Recommended Applications */}
              {alloyResult.aplicacionesRecomendadas && alloyResult.aplicacionesRecomendadas.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">
                    Aplicaciones Industriales & Históricas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {alloyResult.aplicacionesRecomendadas.map((app, i) => (
                      <span 
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-slate-800/90 text-slate-300 border border-slate-700/80"
                      >
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Quick Atomic Links */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-[#090d16] text-xs space-y-2">
            <span className="font-mono text-slate-400 uppercase text-[10px]">
              Vínculos Cuánticos en Espiquumeyria:
            </span>
            <div className="flex flex-wrap gap-2">
              {alloyResult.metalesUtilizados.map(({ metal }) => (
                <button
                  key={metal.id}
                  onClick={() => onOpenAtomBuilder?.(metal.atomicNumber)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer font-mono text-xs transition-colors"
                >
                  <Atom className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Átomo {metal.symbol} (Z={metal.atomicNumber})</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* BIBLIOTECA DESPLEGABLE LATERAL / MODAL: "VER BIBLIOTECA"                   */}
      {/* ========================================================================= */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-2xl h-[92vh] rounded-2xl border border-slate-700 bg-[#0b101b] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#0e1524]">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Biblioteca Metalúrgica & Fichas Técnicas
                  </h3>
                  <p className="text-xs text-slate-400">
                    Fichas técnicas con densidad (g/cm³), punto de fusión (°C) y red cristalina
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLibraryOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-3 sm:p-4 border-b border-slate-800/80 bg-[#080d16] space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar metal por nombre, símbolo o propiedad..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
                {['all', 'Precioso', 'Aeroespacial', 'Industrial', 'Base', 'Refractario', 'Ligero', 'Líquido/Tóxico'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setLibraryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      libraryFilter === cat
                        ? 'bg-amber-500 text-black font-bold'
                        : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {cat === 'all' ? 'Todos' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Metal List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>SELECCIONA UN METAL PARA CARGAR EN LA RANURA #{activeTargetSlot + 1}:</span>
                <span className="text-amber-400">{filteredLibraryMetals.length} metales disponibles</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredLibraryMetals.map((metal) => {
                  const isAlreadyInSlots = metalSlots.includes(metal.id);

                  return (
                    <div 
                      key={metal.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                        metal.id === 'hg'
                          ? 'border-red-500/50 bg-red-950/20 hover:border-red-400'
                          : 'border-slate-800 bg-slate-900/60 hover:border-amber-500/50 hover:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-sm shadow"
                              style={{ 
                                backgroundColor: metal.colorHex + '33', 
                                color: metal.colorHex,
                                border: `1px solid ${metal.colorHex}66`
                              }}
                            >
                              {metal.symbol}
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                                <span>{metal.name}</span>
                                {metal.hazardLevel === 'danger' && (
                                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                                )}
                              </h4>
                              <span className="text-[10px] font-mono text-slate-400">
                                Z={metal.atomicNumber} · M={metal.atomicMass} u
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                            {metal.category}
                          </span>
                        </div>

                        {/* Physical Properties Badges */}
                        <div className="grid grid-cols-2 gap-2 my-2.5 text-[11px] font-mono">
                          <div className="p-1.5 rounded bg-black/40 border border-slate-800">
                            <span className="text-slate-500 block text-[9px]">DENSIDAD:</span>
                            <span className="text-cyan-300 font-bold">{metal.density} g/cm³</span>
                          </div>
                          <div className="p-1.5 rounded bg-black/40 border border-slate-800">
                            <span className="text-slate-500 block text-[9px]">P. FUSIÓN:</span>
                            <span className="text-amber-300 font-bold">{metal.melting} °C</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-2">
                          {metal.description}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-slate-500 truncate">
                          Red: {metal.crystalLattice.split(' ')[0]}
                        </span>
                        <button
                          onClick={() => handleAddFromLibrary(metal)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/50 text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>{isAlreadyInSlots ? '+ Agregar otra dosis' : 'Cargar en Crisol'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer with quick tip */}
            <div className="p-3 bg-[#080d16] border-t border-slate-800 text-xs font-mono text-slate-500 flex items-center justify-between">
              <span>Espiquumeyria Metallurgical Database · 12 Metales Principales</span>
              <button
                onClick={() => setIsLibraryOpen(false)}
                className="text-amber-400 hover:underline cursor-pointer"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SELECCIONAR METAL (ESTILO SCREENSHOT 2)                            */}
      {/* ========================================================================= */}
      {isMetalModalOpen && (() => {
        const activeModalMetal = gameDatabase.metals[modalCarouselIndex] || gameDatabase.metals[0];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-[#0f1524] border border-slate-700/80 p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="flex items-center justify-between relative">
                <h3 className="text-lg font-bold text-white w-full text-center">
                  Seleccionar metal
                </h3>
                <button
                  onClick={() => setIsMetalModalOpen(false)}
                  className="absolute right-0 top-0 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Ingot Carousel with Left/Right Arrows */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setModalCarouselIndex(prev => (prev > 0 ? prev - 1 : gameDatabase.metals.length - 1))}
                  className="p-2 rounded-full text-indigo-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Metal anterior"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>

                {/* 3D Metal Ingot Graphic */}
                <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-950 border border-indigo-500/30 flex items-center justify-center p-3 shadow-inner relative overflow-hidden group">
                  {/* Sheen effect */}
                  <div 
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 40% 30%, ${activeModalMetal.colorHex}, transparent 70%)` }}
                  />

                  <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-xl">
                    <defs>
                      <linearGradient id="modalIngotGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                        <stop offset="25%" stopColor={activeModalMetal.colorHex} />
                        <stop offset="65%" stopColor="#334155" />
                        <stop offset="100%" stopColor="#0F172A" />
                      </linearGradient>
                      <linearGradient id="modalIngotTop" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={activeModalMetal.colorHex} />
                        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.75" />
                      </linearGradient>
                    </defs>
                    <polygon points="25,18 75,18 88,40 12,40" fill="url(#modalIngotTop)" opacity="0.95" />
                    <polygon points="12,40 88,40 82,68 18,68" fill="url(#modalIngotGradient)" />
                    <polygon points="88,40 82,68 94,48 94,24" fill="#334155" opacity="0.7" />
                    <polygon points="12,40 18,68 8,48 8,24" fill="#1E293B" opacity="0.8" />
                  </svg>
                </div>

                <button
                  onClick={() => setModalCarouselIndex(prev => (prev < gameDatabase.metals.length - 1 ? prev + 1 : 0))}
                  className="p-2 rounded-full text-indigo-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Metal siguiente"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </div>

              {/* Badges: Symbol, Rarity/Category, Count/Atomic */}
              <div className="flex items-center justify-center gap-2 pt-1 font-mono text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 font-bold">
                  {activeModalMetal.symbol}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-700 font-medium">
                  {activeModalMetal.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  Z={activeModalMetal.atomicNumber}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-white tracking-wide">
                  {activeModalMetal.name}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed px-2 line-clamp-3">
                  {activeModalMetal.description}
                </p>
                <div className="flex items-center justify-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
                  <span>ρ: {activeModalMetal.density} g/cm³</span>
                  <span>•</span>
                  <span>Tm: {activeModalMetal.melting} °C</span>
                </div>
              </div>

              {/* Carousel Indicator Dots */}
              <div className="flex items-center justify-center gap-1.5 py-1">
                {gameDatabase.metals.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setModalCarouselIndex(i)}
                    className={`rounded-full transition-all cursor-pointer ${
                      i === modalCarouselIndex 
                        ? 'w-4 h-1.5 bg-indigo-400' 
                        : 'w-1.5 h-1.5 bg-slate-700 hover:bg-slate-500'
                    }`}
                    title={`Ver ${gameDatabase.metals[i].name}`}
                  />
                ))}
              </div>

              {/* Big Action Button */}
              <button
                onClick={handleConfirmModalMetal}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-500/25 transition-all cursor-pointer active:scale-[0.98]"
              >
                Seleccionar
              </button>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: SELECCIONAR NO METAL                                               */}
      {/* ========================================================================= */}
      {isNonMetalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0f1524] border border-slate-700/80 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Atom className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Seleccionar No Metal Endurecedor</h3>
              </div>
              <button onClick={() => setIsNonMetalModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Los elementos no metálicos se disuelven en los intersticios de la matriz cristalina, anclando los planos de dislocación y aumentando notablemente la dureza.
            </p>

            <div className="grid grid-cols-1 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {gameDatabase.nonMetals.map((nm) => (
                <div
                  key={nm.id}
                  onClick={() => {
                    setNonMetalSlot(nm.id);
                    setIsNonMetalModalOpen(false);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    nonMetalSlot === nm.id
                      ? 'border-purple-500 bg-purple-950/40 text-purple-100 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-900'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{nm.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-900/70 text-purple-200 border border-purple-700">{nm.symbol}</span>
                      <span className="text-[10px] font-mono text-slate-500">Z={nm.atomicNumber}</span>
                    </div>
                    <div className="text-xs text-slate-400">{nm.role}</div>
                  </div>
                  <button className="px-3 py-1 rounded-lg bg-purple-600/20 text-purple-300 text-xs font-mono border border-purple-500/40 hover:bg-purple-600 hover:text-white transition">
                    Elegir
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setNonMetalSlot(null);
                  setIsNonMetalModalOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-red-400 text-xs font-mono transition"
              >
                Dejar Sin No Metal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SELECCIONAR FUNDENTE ACTIVO                                        */}
      {/* ========================================================================= */}
      {isFluxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0f1524] border border-slate-700/80 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Seleccionar Fundente Activo</h3>
              </div>
              <button onClick={() => setIsFluxModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              El fundente químico disuelve los óxidos y escorias flotantes en el baño metálico líquido, activando el grado de pureza <strong className="text-amber-300">Aleación Premium</strong>.
            </p>

            <div className="grid grid-cols-1 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {gameDatabase.fluxes.map((f) => (
                <div
                  key={f.id}
                  onClick={() => {
                    setFluxSlot(f.id);
                    setIsFluxModalOpen(false);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    fluxSlot === f.id
                      ? 'border-amber-500 bg-amber-950/40 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-900'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{f.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-900/70 text-amber-200 border border-amber-700">{f.formula}</span>
                    </div>
                    <div className="text-xs text-slate-400">{f.bonus}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {['borax', 'caf2', 'kno3', 'nacl_kcl', 'cryolite', 'cao_flux', 'sio2_flux', 'na2co3_flux', 'zncl2_flux'].includes(f.id) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const molId = f.id === 'borax' ? 'borax_flux' : f.id === 'nacl_kcl' ? 'kcl_flux' : f.id;
                          window.location.hash = `/molecular-viewer?id=${molId}&view=3d`;
                        }}
                        className="px-2 py-1 rounded-lg bg-cyan-950/80 text-cyan-300 text-xs font-mono border border-cyan-700/60 hover:bg-cyan-600 hover:text-white transition cursor-pointer"
                        title="Ver estructura atómica y red cristalina 2D/3D del fundente"
                      >
                        🔬 2D/3D
                      </button>
                    )}
                    <button className="px-3 py-1 rounded-lg bg-amber-600/20 text-amber-300 text-xs font-mono border border-amber-500/40 hover:bg-amber-600 hover:text-white transition cursor-pointer">
                      Elegir
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setFluxSlot(null);
                  setIsFluxModalOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-red-400 text-xs font-mono transition"
              >
                Dejar Sin Fundente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INFORME PDF SIMULADO / FICHA TÉCNICA NORMATIVA                    */}
      {/* ========================================================================= */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-6 animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[92vh] rounded-3xl bg-[#0f172a] border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-slate-100">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-[#131c2e] to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                    ESPIQUUMEYRIA AI · CERTIFICADO DE MATERIALES
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    Ficha Técnica y Normativa (Informe PDF Simulado)
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>Imprimir / Descargar PDF</span>
                </button>
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Simulated PDF Document Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 bg-[#0a0f19] font-sans">
              
              {/* Document Header Banner */}
              <div className="border-b-2 border-slate-700 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="text-xs font-mono text-slate-400">ESPECIFICACIÓN ESTÁNDAR DE INGENIERÍA</div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                    {alloyResult.nombre}
                  </h1>
                  <div className="text-sm font-mono text-amber-400 mt-0.5">
                    Grado / Norma: {alloyResult.gradoNorma || alloyResult.tipo}
                  </div>
                </div>
                <div className="text-right font-mono text-xs text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div>FECHA: {new Date().toLocaleDateString()}</div>
                  <div>CÓDIGO: ESP-MET-{Math.abs(alloyResult.nombre.split('').reduce((acc,c)=>acc+c.charCodeAt(0),0))}</div>
                  <div className="text-emerald-400 font-bold mt-1">ESTADO: CERTIFICADO</div>
                </div>
              </div>

              {/* Composition Breakdown with Progress Bars */}
              <div className="space-y-3">
                <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider border-l-2 border-amber-500 pl-2">
                  1. Composición Química Típica (% en peso)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                  {alloyResult.metalesUtilizados.map(({ metal, porcentaje }, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-200 font-medium">
                          {metal.name} ({metal.symbol})
                        </span>
                        <span className="text-amber-400 font-bold">{porcentaje.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
                        <div 
                          className="h-full rounded-full"
                          style={{ width: `${Math.max(porcentaje, 2)}%`, backgroundColor: metal.colorHex }}
                        />
                      </div>
                    </div>
                  ))}
                  {alloyResult.noMetalUtilizado && (
                    <div className="p-2 rounded-xl bg-purple-950/30 border border-purple-800/60 text-xs font-mono text-purple-200 flex justify-between items-center">
                      <span>No Metal: {alloyResult.noMetalUtilizado.name} ({alloyResult.noMetalUtilizado.symbol})</span>
                      <span className="font-bold">Endurecedor</span>
                    </div>
                  )}
                  {alloyResult.fundenteUtilizado && (
                    <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-800/60 text-xs font-mono text-amber-200 flex justify-between items-center">
                      <span>Fundente Activo: {alloyResult.fundenteUtilizado.name}</span>
                      <span className="font-bold">{alloyResult.fundenteUtilizado.formula}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Physical & Mechanical Properties Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider border-l-2 border-cyan-500 pl-2">
                  2. Propiedades Físico-Químicas & Mecánicas
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400">DENSIDAD (ρ)</div>
                    <div className="text-lg font-bold font-mono text-cyan-300 mt-1">{alloyResult.densidadCalculada} g/cm³</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400">PUNTO DE FUSIÓN</div>
                    <div className="text-lg font-bold font-mono text-amber-300 mt-1">{alloyResult.puntoFusionEstimado} °C</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400">DUREZA VICKERS</div>
                    <div className="text-lg font-bold font-mono text-purple-300 mt-1">~{alloyResult.durezaEstimadaHV} HV</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400">TRACCIÓN (Rm)</div>
                    <div className="text-lg font-bold font-mono text-emerald-300 mt-1">~{alloyResult.resistenciaTraccionMPa} MPa</div>
                  </div>
                </div>
              </div>

              {/* Metallurgical Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider border-l-2 border-purple-500 pl-2">
                  3. Dictamen Metalúrgico y Fase Predominante
                </h3>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
                  <p><strong>Fase Metalográfica:</strong> {alloyResult.fasePredominante}</p>
                  <p>{alloyResult.descripcionMetalurgica}</p>
                </div>
              </div>

              {/* Recommended Applications */}
              <div className="space-y-2">
                <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider border-l-2 border-emerald-500 pl-2">
                  4. Aplicaciones Industriales Recomendadas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {alloyResult.aplicacionesRecomendadas.map((app, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg text-xs font-mono bg-slate-900 text-slate-200 border border-slate-700">
                      • {app}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="pt-6 border-t border-slate-800 flex justify-between items-center text-xs font-mono text-slate-500">
                <div>Espiquumeyria AI - Plataforma de Simulación Científica</div>
                <div className="text-amber-400/80 font-bold">DOCUMENTO CERTIFICADO POR ORDEN DE ALEACIÓN</div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
