import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { MoleculeData, MoleculeAtom, MoleculeBond } from '../data/molecularDatabase';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye, 
  Info, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  Zap,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface MolecularViewer2DProps {
  molecule: MoleculeData;
  onSelectAtom?: (atom: MoleculeAtom) => void;
  selectedAtomId?: string | null;
}

export const MolecularViewer2D: React.FC<MolecularViewer2DProps> = ({
  molecule,
  onSelectAtom,
  selectedAtomId: externalSelectedAtomId,
}) => {
  const [internalSelectedAtomId, setInternalSelectedAtomId] = useState<string | null>(null);
  const selectedAtomId = externalSelectedAtomId ?? internalSelectedAtomId;

  const [selectedBondIndex, setSelectedBondIndex] = useState<number | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showHydrogens, setShowHydrogens] = useState<boolean>(true);
  const [showLonePairs, setShowLonePairs] = useState<boolean>(true);
  const [showFormalCharges, setShowFormalCharges] = useState<boolean>(true);
  const [showBondLengths, setShowBondLengths] = useState<boolean>(false);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Toggle fullscreen mode (with HTML5 API + CSS fallback)
  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    if (!isFullscreen) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Sync fullscreen state with document and keyboard shortcuts
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
      if ((e.key === 'f' || e.key === 'F') && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        toggleFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, toggleFullscreen]);

  // Current pedagogical step
  const currentStep = molecule.stepByStepAnalysis[activeStepIndex] || molecule.stepByStepAnalysis[0];

  // Filtered atoms and bonds based on Hydrogen visibility toggle
  const visibleAtoms = useMemo(() => {
    if (showHydrogens) return molecule.atoms;
    return molecule.atoms.filter(a => a.symbol !== 'H');
  }, [molecule, showHydrogens]);

  const visibleAtomIdSet = useMemo(() => new Set(visibleAtoms.map(a => a.id)), [visibleAtoms]);

  const visibleBonds = useMemo(() => {
    return molecule.bonds.filter(b => visibleAtomIdSet.has(b.from) && visibleAtomIdSet.has(b.to));
  }, [molecule, visibleAtomIdSet]);

  // Selected atom lookup
  const selectedAtom = useMemo(() => {
    return molecule.atoms.find(a => a.id === selectedAtomId) || null;
  }, [molecule, selectedAtomId]);

  // Selected bond lookup
  const selectedBond = useMemo(() => {
    if (selectedBondIndex === null || !molecule.bonds[selectedBondIndex]) return null;
    return molecule.bonds[selectedBondIndex];
  }, [molecule, selectedBondIndex]);

  // Map of atom IDs to atoms for quick coordinates lookup
  const atomMap = useMemo(() => {
    const map = new Map<string, MoleculeAtom>();
    molecule.atoms.forEach(a => map.set(a.id, a));
    return map;
  }, [molecule]);

  // Calculate SVG bounding box to center content nicely
  const bounds = useMemo(() => {
    if (molecule.atoms.length === 0) return { minX: 0, maxX: 600, minY: 0, maxY: 400 };
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    molecule.atoms.forEach(a => {
      minX = Math.min(minX, a.x2d);
      maxX = Math.max(maxX, a.x2d);
      minY = Math.min(minY, a.y2d);
      maxY = Math.max(maxY, a.y2d);
    });
    // Add padding
    return {
      minX: Math.max(0, minX - 60),
      maxX: maxX + 60,
      minY: Math.max(0, minY - 60),
      maxY: maxY + 60,
    };
  }, [molecule]);

  const viewBoxWidth = Math.max(500, bounds.maxX - bounds.minX);
  const viewBoxHeight = Math.max(340, bounds.maxY - bounds.minY);

  const handleAtomClick = (atom: MoleculeAtom) => {
    if (selectedAtomId === atom.id) {
      setInternalSelectedAtomId(null);
    } else {
      setInternalSelectedAtomId(atom.id);
      setSelectedBondIndex(null);
      if (onSelectAtom) onSelectAtom(atom);
    }
  };

  const handleBondClick = (index: number) => {
    if (selectedBondIndex === index) {
      setSelectedBondIndex(null);
    } else {
      setSelectedBondIndex(index);
      setInternalSelectedAtomId(null);
    }
  };

  const handleNextStep = () => {
    setActiveStepIndex(prev => (prev + 1) % molecule.stepByStepAnalysis.length);
  };

  const handlePrevStep = () => {
    setActiveStepIndex(prev => (prev - 1 + molecule.stepByStepAnalysis.length) % molecule.stepByStepAnalysis.length);
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setInternalSelectedAtomId(null);
    setSelectedBondIndex(null);
  };

  return (
    <div 
      ref={containerRef}
      className={
        isFullscreen
          ? "fixed inset-0 z-[100] w-screen h-screen bg-[#080d15] overflow-hidden flex flex-col font-sans select-none"
          : "flex flex-col h-full bg-[#080d15] rounded-2xl border border-slate-800 overflow-hidden shadow-xl font-sans"
      }
    >
      
      {/* 2D Canvas Controls Header */}
      <div className="bg-[#0b1320] border-b border-slate-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
            Vista 2D: Diagrama Esquemático & Conectividad de Enlaces
          </span>
          <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
            {visibleAtoms.length} átomos · {visibleBonds.length} enlaces
          </span>
          {isFullscreen && (
            <span className="text-[10px] font-mono text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded">
              Pantalla Completa Activa (Esc para salir)
            </span>
          )}
        </div>

        {/* View toggles */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setShowHydrogens(!showHydrogens)}
            className={`px-2 py-1 rounded border text-[11px] transition cursor-pointer ${
              showHydrogens
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Alternar visibilidad de átomos de hidrógeno (-H)"
          >
            H ({showHydrogens ? 'Visible' : 'Oculto'})
          </button>

          <button
            onClick={() => setShowLonePairs(!showLonePairs)}
            className={`px-2 py-1 rounded border text-[11px] transition cursor-pointer ${
              showLonePairs
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Alternar pares solitarios de electrones (••)"
          >
            Pares ••
          </button>

          <button
            onClick={() => setShowFormalCharges(!showFormalCharges)}
            className={`px-2 py-1 rounded border text-[11px] transition cursor-pointer ${
              showFormalCharges
                ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Alternar insignias de carga formal (+/-)"
          >
            Cargas ±
          </button>

          <button
            onClick={() => setShowBondLengths(!showBondLengths)}
            className={`px-2 py-1 rounded border text-[11px] transition cursor-pointer ${
              showBondLengths
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Mostrar longitudes de enlace en picómetros (pm)"
          >
            pm
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Zoom controls */}
          <button
            onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.15))}
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="Acercar zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-slate-400 min-w-[28px] text-center font-mono">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.15))}
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="Alejar zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 transition cursor-pointer"
            title="Restablecer vista centrada"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className={`p-1.5 rounded transition cursor-pointer flex items-center gap-1 ${
              isFullscreen
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300'
            }`}
            title={isFullscreen ? 'Salir de Pantalla Completa (Esc o F)' : 'Pantalla Completa 2D (F)'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="text-[10px] font-mono hidden sm:inline font-bold">
              {isFullscreen ? 'Salir' : 'Pantalla Completa'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Schematic Diagram Area */}
      <div className="relative flex-1 min-h-[380px] bg-[#070b12] flex items-center justify-center overflow-hidden">
        
        {/* Subtle coordinate grid pattern */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* SVG Schematic Canvas */}
        <svg
          viewBox={`${bounds.minX} ${bounds.minY} ${viewBoxWidth} ${viewBoxHeight}`}
          className={`w-full h-full select-none cursor-default ${
            isFullscreen ? 'max-h-[70vh] md:max-h-[75vh]' : 'max-h-[460px]'
          }`}
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
          }}
        >
          <defs>
            {/* Glow filter for step-by-step active highlighted elements */}
            <filter id="stepHighlight" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Ionic field gradient */}
            <linearGradient id="ionicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* 1. RENDER BONDS (LINES & ARCS) */}
          <g className="bonds-group">
            {visibleBonds.map((bond, idx) => {
              const atomA = atomMap.get(bond.from);
              const atomB = atomMap.get(bond.to);
              if (!atomA || !atomB) return null;

              const isHighlighted = currentStep.activeBondIndices.includes(idx);
              const isSelected = selectedBondIndex === idx;
              const isConnectedToSelectedAtom = selectedAtomId === bond.from || selectedAtomId === bond.to;

              const dx = atomB.x2d - atomA.x2d;
              const dy = atomB.y2d - atomA.y2d;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist === 0) return null;

              // Unit perpendicular vector for double/triple parallel lines
              const perpX = -dy / dist;
              const perpY = dx / dist;
              const offset = 4;

              // Ionic bond rendering (dashed field with pulse)
              if (bond.order === 'ionic') {
                return (
                  <g 
                    key={`bond-${idx}`} 
                    className="cursor-pointer"
                    onClick={() => handleBondClick(idx)}
                  >
                    <line
                      x1={atomA.x2d}
                      y1={atomA.y2d}
                      x2={atomB.x2d}
                      y2={atomB.y2d}
                      stroke={isSelected ? '#facc15' : isHighlighted ? '#38bdf8' : '#818cf8'}
                      strokeWidth={isSelected ? 3.5 : isHighlighted ? 3 : 2}
                      strokeDasharray="5,4"
                      strokeOpacity={isSelected ? 1 : isConnectedToSelectedAtom ? 0.9 : 0.65}
                    />
                    {showBondLengths && bond.lengthPm && (
                      <text
                        x={(atomA.x2d + atomB.x2d) / 2 + perpX * 9}
                        y={(atomA.y2d + atomB.y2d) / 2 + perpY * 9}
                        fill="#38bdf8"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="pointer-events-none select-none bg-black/60"
                      >
                        {bond.lengthPm} pm
                      </text>
                    )}
                  </g>
                );
              }

              // Aromatic bond rendering (one solid line + one parallel dashed line)
              if (bond.order === 'aromatic') {
                return (
                  <g 
                    key={`bond-${idx}`} 
                    className="cursor-pointer"
                    onClick={() => handleBondClick(idx)}
                  >
                    {/* Primary solid line */}
                    <line
                      x1={atomA.x2d + perpX * (offset / 2)}
                      y1={atomA.y2d + perpY * (offset / 2)}
                      x2={atomB.x2d + perpX * (offset / 2)}
                      y2={atomB.y2d + perpY * (offset / 2)}
                      stroke={isSelected ? '#facc15' : isHighlighted ? '#38bdf8' : '#64748b'}
                      strokeWidth={isSelected ? 3 : 2}
                    />
                    {/* Secondary dashed resonance line */}
                    <line
                      x1={atomA.x2d - perpX * (offset / 2)}
                      y1={atomA.y2d - perpY * (offset / 2)}
                      x2={atomB.x2d - perpX * (offset / 2)}
                      y2={atomB.y2d - perpY * (offset / 2)}
                      stroke={isSelected ? '#facc15' : isHighlighted ? '#38bdf8' : '#94a3b8'}
                      strokeWidth={1.5}
                      strokeDasharray="4,3"
                    />
                  </g>
                );
              }

              // Double covalent bond
              if (bond.order === 2) {
                return (
                  <g 
                    key={`bond-${idx}`} 
                    className="cursor-pointer"
                    onClick={() => handleBondClick(idx)}
                  >
                    <line
                      x1={atomA.x2d + perpX * offset}
                      y1={atomA.y2d + perpY * offset}
                      x2={atomB.x2d + perpX * offset}
                      y2={atomB.y2d + perpY * offset}
                      stroke={isSelected ? '#facc15' : isHighlighted ? '#38bdf8' : '#cbd5e1'}
                      strokeWidth={isSelected ? 3 : 2.2}
                    />
                    <line
                      x1={atomA.x2d - perpX * offset}
                      y1={atomA.y2d - perpY * offset}
                      x2={atomB.x2d - perpX * offset}
                      y2={atomB.y2d - perpY * offset}
                      stroke={isSelected ? '#facc15' : isHighlighted ? '#38bdf8' : '#cbd5e1'}
                      strokeWidth={isSelected ? 3 : 2.2}
                    />
                  </g>
                );
              }

              // Triple covalent bond
              if (bond.order === 3) {
                return (
                  <g 
                    key={`bond-${idx}`} 
                    className="cursor-pointer"
                    onClick={() => handleBondClick(idx)}
                  >
                    <line
                      x1={atomA.x2d}
                      y1={atomA.y2d}
                      x2={atomB.x2d}
                      y2={atomB.y2d}
                      stroke={isSelected ? '#facc15' : isHighlighted ? '#38bdf8' : '#cbd5e1'}
                      strokeWidth={2}
                    />
                    <line
                      x1={atomA.x2d + perpX * (offset * 1.5)}
                      y1={atomA.y2d + perpY * (offset * 1.5)}
                      x2={atomB.x2d + perpX * (offset * 1.5)}
                      y2={atomB.y2d + perpY * (offset * 1.5)}
                      stroke={isSelected ? '#facc15' : isHighlighted ? '#38bdf8' : '#cbd5e1'}
                      strokeWidth={2}
                    />
                    <line
                      x1={atomA.x2d - perpX * (offset * 1.5)}
                      y1={atomA.y2d - perpY * (offset * 1.5)}
                      x2={atomB.x2d - perpX * (offset * 1.5)}
                      y2={atomB.y2d - perpY * (offset * 1.5)}
                      stroke={isSelected ? '#facc15' : isHighlighted ? '#38bdf8' : '#cbd5e1'}
                      strokeWidth={2}
                    />
                  </g>
                );
              }

              // Single covalent bond (standard)
              return (
                <g 
                  key={`bond-${idx}`} 
                  className="cursor-pointer"
                  onClick={() => handleBondClick(idx)}
                >
                  <line
                    x1={atomA.x2d}
                    y1={atomA.y2d}
                    x2={atomB.x2d}
                    y2={atomB.y2d}
                    stroke={isSelected ? '#facc15' : isHighlighted ? '#38bdf8' : isConnectedToSelectedAtom ? '#94a3b8' : '#475569'}
                    strokeWidth={isSelected ? 3.5 : isHighlighted ? 3 : 2}
                  />
                  {showBondLengths && bond.lengthPm && (
                    <text
                      x={(atomA.x2d + atomB.x2d) / 2 + perpX * 8}
                      y={(atomA.y2d + atomB.y2d) / 2 + perpY * 8}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="pointer-events-none select-none"
                    >
                      {bond.lengthPm} pm
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* 2. RENDER ATOMS (CIRCLES + LABELS + BADGES) */}
          <g className="atoms-group">
            {visibleAtoms.map((atom) => {
              const isSelected = selectedAtomId === atom.id;
              const isHighlighted = currentStep.activeAtomIds.includes(atom.id);
              const radius = atom.symbol === 'H' ? 12 : 18;

              return (
                <g
                  key={atom.id}
                  transform={`translate(${atom.x2d}, ${atom.y2d})`}
                  className="cursor-pointer group"
                  onClick={() => handleAtomClick(atom)}
                >
                  {/* Step Highlight Halo */}
                  {isHighlighted && (
                    <circle
                      r={radius + 8}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      strokeDasharray="4,3"
                      className="animate-spin"
                      style={{ animationDuration: '10s' }}
                    />
                  )}

                  {/* Selection Indicator Ring */}
                  {isSelected && (
                    <circle
                      r={radius + 5}
                      fill="none"
                      stroke="#facc15"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Main Atom Disc */}
                  <circle
                    r={radius}
                    fill={atom.symbol === 'C' ? '#1e293b' : atom.color}
                    fillOpacity={atom.symbol === 'C' ? 0.95 : 0.88}
                    stroke={isSelected ? '#facc15' : isHighlighted ? '#38bdf8' : '#0f172a'}
                    strokeWidth={isSelected ? 2.5 : 2}
                    className="transition-transform group-hover:scale-110"
                  />

                  {/* Chemical Element Symbol */}
                  <text
                    x="0"
                    y="0"
                    fill={atom.symbol === 'H' ? '#0f172a' : '#ffffff'}
                    fontSize={atom.symbol === 'H' ? '11' : '13'}
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="pointer-events-none select-none"
                  >
                    {atom.symbol}
                  </text>

                  {/* Formal Charge Badge (+ / -) */}
                  {showFormalCharges && atom.formalCharge && atom.formalCharge !== 0 && (
                    <g transform="translate(13, -13)">
                      <circle
                        r="7"
                        fill={atom.formalCharge > 0 ? '#3b82f6' : '#ef4444'}
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                      <text
                        x="0"
                        y="0"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {atom.formalCharge > 0 ? `+${atom.formalCharge === 1 ? '' : atom.formalCharge}` : atom.formalCharge === -1 ? '−' : `${atom.formalCharge}`}
                      </text>
                    </g>
                  )}

                  {/* Lone Pairs Indicator (Dots) */}
                  {showLonePairs && atom.lonePairs && atom.lonePairs > 0 && (
                    <g transform="translate(0, -18)">
                      {atom.lonePairs === 1 && (
                        <>
                          <circle cx="-3" cy="-3" r="1.5" fill="#facc15" />
                          <circle cx="3" cy="-3" r="1.5" fill="#facc15" />
                        </>
                      )}
                      {atom.lonePairs === 2 && (
                        <>
                          <circle cx="-5" cy="-3" r="1.5" fill="#facc15" />
                          <circle cx="-1" cy="-3" r="1.5" fill="#facc15" />
                          <circle cx="1" cy="-3" r="1.5" fill="#facc15" />
                          <circle cx="5" cy="-3" r="1.5" fill="#facc15" />
                        </>
                      )}
                    </g>
                  )}

                  {/* Partial Charge Label (δ+ / δ-) */}
                  {atom.partialCharge && (
                    <text
                      x="0"
                      y={radius + 10}
                      fill={atom.partialCharge.includes('+') ? '#60a5fa' : '#f87171'}
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="pointer-events-none select-none font-semibold"
                    >
                      {atom.partialCharge}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Quick Inspector Card (Bottom Left inside canvas) */}
        {(selectedAtom || selectedBond) && (
          <div className="absolute bottom-3 left-3 bg-[#0d1624]/95 border border-cyan-500/40 rounded-xl p-3 shadow-2xl max-w-xs text-xs space-y-1.5 animate-in fade-in">
            {selectedAtom && (
              <>
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-1">
                  <span className="font-bold text-cyan-300 font-mono flex items-center gap-1.5">
                    <span 
                      className="w-3 h-3 rounded-full inline-block" 
                      style={{ backgroundColor: selectedAtom.color }} 
                    />
                    {selectedAtom.name} ({selectedAtom.symbol})
                  </span>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                    {selectedAtom.hybridization || 'sp³'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 grid grid-cols-2 gap-x-2 gap-y-1 font-mono">
                  <div>Electronegatividad: <span className="text-white font-bold">{selectedAtom.electronegativity ?? 'N/A'}</span></div>
                  <div>Radio VDW: <span className="text-white font-bold">{selectedAtom.radiusVdw} pm</span></div>
                  <div>Carga Formal: <span className="text-amber-300 font-bold">{selectedAtom.formalCharge ?? 0}</span></div>
                  <div>Pares Solitarios: <span className="text-amber-300 font-bold">{selectedAtom.lonePairs ?? 0}</span></div>
                </div>
                {selectedAtom.role && (
                  <p className="text-[10px] text-cyan-200/90 italic pt-1 border-t border-slate-800">
                    Rol: {selectedAtom.role}
                  </p>
                )}
              </>
            )}

            {selectedBond && !selectedAtom && (
              <>
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-1">
                  <span className="font-bold text-amber-300 font-mono">
                    Enlace {selectedBond.order === 'ionic' ? 'Iónico' : selectedBond.order === 'aromatic' ? 'Aromático (1.5)' : `Orden ${selectedBond.order}`}
                  </span>
                  {selectedBond.lengthPm && (
                    <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">
                      {selectedBond.lengthPm} pm
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-200 leading-relaxed">
                  {selectedBond.description}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Step-by-Step Bond Analysis Educational Footer */}
      <div className="bg-[#0b121e] border-t border-slate-800/90 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300">
              PASO {currentStep.stepNumber} DE {molecule.stepByStepAnalysis.length}
            </span>
            <h4 className="text-sm font-bold text-white tracking-wide">
              {currentStep.title}
            </h4>
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevStep}
              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Paso anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {molecule.stepByStepAnalysis.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStepIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition cursor-pointer ${
                    activeStepIndex === i ? 'bg-cyan-400 scale-125' : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                  title={`Ir al paso ${s.stepNumber}: ${s.title}`}
                />
              ))}
            </div>
            <button
              onClick={handleNextStep}
              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Siguiente paso"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-[#070b12] border border-slate-800/80 rounded-xl p-3 space-y-1.5">
          <div className="text-xs font-mono text-cyan-400 font-semibold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{currentStep.subtitle}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {currentStep.explanation}
          </p>
          <div className="text-[11px] font-mono text-emerald-400 pt-1 border-t border-slate-800/80 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Principio Químico: {currentStep.chemicalPrinciple}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
