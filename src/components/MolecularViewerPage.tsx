import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  MOLECULAR_DATABASE, 
  MoleculeData, 
  MoleculeCategory, 
  ELEMENT_CPK 
} from '../data/molecularDatabase';
import { MolecularViewer2D } from './MolecularViewer2D';
import { MolecularViewer3D, RenderMode3D } from './MolecularViewer3D';
import { 
  Boxes, 
  Atom, 
  FlaskConical, 
  Sparkles, 
  Eye, 
  Compass, 
  Share2, 
  ExternalLink, 
  Search, 
  Check, 
  Copy, 
  Info, 
  Layers, 
  Bot, 
  ArrowRight,
  Flame,
  Zap,
  Globe,
  SplitSquareVertical,
  Activity,
  Maximize2,
  Minimize2
} from 'lucide-react';

export const MolecularViewerPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Query parameters: ?id=ethane&view=3d&category=all
  const moleculeIdFromQuery = searchParams.get('id') || 'nacl';
  const viewModeFromQuery = (searchParams.get('view') as '2d' | '3d' | 'split') || '3d';
  const categoryFromQuery = (searchParams.get('category') as MoleculeCategory | 'all') || 'all';

  // Active state
  const [selectedMoleculeId, setSelectedMoleculeId] = useState<string>(moleculeIdFromQuery);
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'split'>(viewModeFromQuery);
  const [selectedCategory, setSelectedCategory] = useState<MoleculeCategory | 'all'>(categoryFromQuery);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);

  // Sync state with URL query parameters
  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (selectedMoleculeId !== 'nacl') nextParams.set('id', selectedMoleculeId);
    if (viewMode !== '3d') nextParams.set('view', viewMode);
    if (selectedCategory !== 'all') nextParams.set('category', selectedCategory);

    const currStr = searchParams.toString();
    const nextStr = nextParams.toString();
    if (currStr !== nextStr) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [selectedMoleculeId, viewMode, selectedCategory, searchParams, setSearchParams]);

  // Active molecule
  const activeMolecule = useMemo(() => {
    return MOLECULAR_DATABASE.find(m => m.id === selectedMoleculeId) || MOLECULAR_DATABASE[0];
  }, [selectedMoleculeId]);

  // Filtered molecules for the catalog list
  const filteredMolecules = useMemo(() => {
    return MOLECULAR_DATABASE.filter(m => {
      if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = m.name.toLowerCase().includes(q);
        const matchFormula = m.formula.toLowerCase().includes(q);
        const matchIupac = m.iupacName.toLowerCase().includes(q);
        const matchDesc = m.description.toLowerCase().includes(q);
        return matchName || matchFormula || matchIupac || matchDesc;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const [isPageFullscreen, setIsPageFullscreen] = useState<boolean>(false);

  // Keyboard shortcut for fullscreen
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPageFullscreen) {
        setIsPageFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPageFullscreen]);

  const categoriesList: { id: MoleculeCategory | 'all'; label: string; icon: string }[] = [
    { id: 'all', label: 'Todas las Moléculas', icon: '🧬' },
    { id: 'iodates', label: 'Yodatos (Ca, Sr, Ba, K)', icon: '⚛️' },
    { id: 'metallurgy_fluxes', label: 'Fundentes Metalúrgicos', icon: '🔥' },
    { id: 'salts', label: 'Sales Iónicas & Redes', icon: '🧂' },
    { id: 'alcohols', label: 'Alcoholes & Polioles', icon: '🧪' },
    { id: 'hydrocarbons', label: 'Etano, Butano & Benceno', icon: '⚡' },
    { id: 'complex_organics', label: 'Glucosa & Aspirina', icon: '💊' },
    { id: 'triglycerides', label: 'Lípidos & Triglicéridos', icon: '🛢️' },
  ];

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2000);
    });
  };

  const togglePageFullscreen = () => {
    setIsPageFullscreen(prev => !prev);
    // Also trigger HTML5 fullscreen API if supported
    const container = document.querySelector('[class*="cursor-grab"]') || document.querySelector('svg');
    const parent = container?.parentElement as HTMLElement | null;
    if (parent && !isPageFullscreen && parent.requestFullscreen) {
      parent.requestFullscreen().catch(() => {});
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans animate-in fade-in">
      
      {/* ========================================================================= */}
      {/* 1. HERO HEADER BANNER: VISUALIZADOR MOLECULAR 2D & 3D                     */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1626] via-[#09101d] to-[#060a12] border border-cyan-800/40 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
              <Boxes className="w-3.5 h-3.5 text-cyan-400" />
              <span>WEB 09 · VISUALIZADOR MOLECULAR MULTIDIMENSIONAL</span>
            </div>

            {/* Quick Actions: Fullscreen & Share */}
            <div className="flex items-center gap-2">
              <button
                onClick={togglePageFullscreen}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-xs font-mono text-amber-300 hover:text-white transition cursor-pointer shadow-md"
                title="Maximizar visualizador molecular a Pantalla Completa (F o Esc)"
              >
                {isPageFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-amber-400" /> : <Maximize2 className="w-3.5 h-3.5 text-amber-400" />}
                <span>{isPageFullscreen ? 'Salir de Pantalla Completa' : 'Pantalla Completa'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-mono text-slate-300 hover:text-white transition cursor-pointer"
                title="Copiar enlace profundo de esta molécula y vista"
              >
                {copiedShareLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{copiedShareLink ? '¡Enlace Copiado!' : 'Compartir Vista'}</span>
              </button>
            </div>
          </div>

          <div className="max-w-3xl space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Visualizador Molecular <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">2D y 3D</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Explora cómo la química cobra vida con una interfaz totalmente renovada. Descubre la estructura exacta de <strong>sales iónicas</strong>, <strong>alcoholes</strong> y <strong>compuestos orgánicos complejos</strong> como el etano, butano o triglicéridos a través de dos modalidades complementarias:
            </p>
          </div>

          {/* Highlights of the two requested modalities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-[#09101b]/80 border border-cyan-500/30 flex items-start gap-3 shadow-md">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase">
                  Vista 2D (Esquemática)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Ideal para analizar la conexión plana de los átomos, pares de electrones solitarios, cargas formales y <strong>diagramas de enlace paso a paso</strong> con fundamentación teórica.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#09101b]/80 border border-blue-500/30 flex items-start gap-3 shadow-md">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-mono font-bold text-blue-300 uppercase">
                  Vista 3D (Espacial)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Un modelo tridimensional interactivo para rotar, acercar y observar la <strong>geometría real</strong> de las moléculas (Bolas & Varillas, esferas van der Waals y vibración térmica).
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CATEGORY TABS & SEARCH BAR                                             */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categoriesList.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold shadow-md'
                  : 'bg-[#090f19] border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Quick Molecule Selector Chips */}
        <div className="bg-[#090e18] border border-slate-800/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-inner">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono uppercase font-bold text-slate-500">
              Moléculas Disponibles:
            </span>
            {filteredMolecules.map(mol => {
              const isCurrent = mol.id === activeMolecule.id;
              return (
                <button
                  key={mol.id}
                  onClick={() => setSelectedMoleculeId(mol.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer flex items-center gap-1.5 border ${
                    isCurrent
                      ? 'bg-cyan-500 text-black font-bold border-cyan-300 shadow-md scale-105'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="font-bold">{mol.name.split(' ')[0]}</span>
                  <span className={`text-[10px] ${isCurrent ? 'text-black/70' : 'text-cyan-400'}`}>
                    ({mol.formula})
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode Switcher: 2D vs 3D vs Split */}
          <div className="flex items-center gap-1 bg-[#060a12] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === '2d'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Vista 2D (Esquemática)</span>
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === '3d'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Vista 3D (Espacial)</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1 hidden lg:flex ${
                viewMode === 'split'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Ver simultáneamente Vista 2D y 3D en pantalla dividida"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Dual</span>
            </button>

            <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

            <button
              onClick={togglePageFullscreen}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 text-amber-300 hover:text-amber-200 hover:bg-amber-500/15"
              title="Maximizar a Pantalla Completa (F o Esc)"
            >
              {isPageFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-amber-400" /> : <Maximize2 className="w-3.5 h-3.5 text-amber-400" />}
              <span className="hidden sm:inline">{isPageFullscreen ? 'Salir' : 'Pantalla Completa'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN INTERACTIVE VIEWER WORKSPACE (2D / 3D / DUAL)                     */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {viewMode === '2d' && (
          <div className="w-full">
            <MolecularViewer2D key={`2d-${activeMolecule.id}`} molecule={activeMolecule} />
          </div>
        )}

        {viewMode === '3d' && (
          <div className="w-full">
            <MolecularViewer3D key={`3d-${activeMolecule.id}`} molecule={activeMolecule} />
          </div>
        )}

        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div>
              <MolecularViewer2D key={`split-2d-${activeMolecule.id}`} molecule={activeMolecule} />
            </div>
            <div>
              <MolecularViewer3D key={`split-3d-${activeMolecule.id}`} molecule={activeMolecule} />
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Overlay Mode */}
      {isPageFullscreen && (
        <div className="fixed inset-0 z-[100] bg-[#070b12]/95 backdrop-blur-md p-3 sm:p-5 flex flex-col gap-3 animate-in fade-in">
          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-mono">{activeMolecule.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-xs font-mono font-bold border border-cyan-800">
                  {activeMolecule.formula}
                </span>
                <span className="text-xs text-slate-400 font-mono hidden md:inline">
                  • {activeMolecule.geometry}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('2d')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === '2d'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>2D</span>
              </button>
              <button
                onClick={() => setViewMode('3d')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === '3d'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>3D</span>
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1 hidden lg:flex ${
                  viewMode === 'split'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span>Dual</span>
              </button>

              <button
                onClick={() => setIsPageFullscreen(false)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black border border-amber-500/50 text-xs font-mono font-bold transition cursor-pointer shadow-md"
              >
                <Minimize2 className="w-4 h-4" />
                <span>Salir de Pantalla Completa (Esc)</span>
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 relative rounded-2xl overflow-hidden border border-slate-800">
            {viewMode === '2d' && (
              <div className="h-full overflow-y-auto">
                <MolecularViewer2D key={`fs-2d-${activeMolecule.id}`} molecule={activeMolecule} />
              </div>
            )}
            {viewMode === '3d' && (
              <div className="h-full">
                <MolecularViewer3D key={`fs-3d-${activeMolecule.id}`} molecule={activeMolecule} />
              </div>
            )}
            {viewMode === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full p-2 overflow-y-auto">
                <MolecularViewer2D key={`fs-split-2d-${activeMolecule.id}`} molecule={activeMolecule} />
                <MolecularViewer3D key={`fs-split-3d-${activeMolecule.id}`} molecule={activeMolecule} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. COMPREHENSIVE MOLECULE DATA & THEORETICAL DOSSIER                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Description, Properties and Conformational Notes */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#090f19] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block mb-1">
                  {activeMolecule.categoryLabel}
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {activeMolecule.name}
                </h2>
                <div className="text-xs font-mono text-slate-400 mt-0.5">
                  IUPAC: <span className="text-slate-200">{activeMolecule.iupacName}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black font-mono text-cyan-300 block">
                  {activeMolecule.formula}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Masa Molar: <strong className="text-white">{activeMolecule.molarMass} g/mol</strong>
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {activeMolecule.description}
            </p>

            {/* Rotational / Conformational Highlight Card */}
            {activeMolecule.rotationalOrConformationalNote && (
              <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-1">
                <div className="text-xs font-mono font-bold text-blue-300 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>Análisis Conformacional & Dinámica Espacial:</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {activeMolecule.rotationalOrConformationalNote}
                </p>
              </div>
            )}

            {/* Industrial & Biological Role */}
            <div className="p-3.5 rounded-xl bg-[#060a12] border border-slate-800 space-y-1">
              <div className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Relevancia Biológica e Industrial:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {activeMolecule.biologicalOrIndustrialRole}
              </p>
            </div>

          </div>
        </div>

        {/* Right 4 Cols: Physicochemical Properties & Navigation Links */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#090f19] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 font-mono text-xs">
            <h3 className="font-bold text-white uppercase tracking-wider text-xs border-b border-slate-800 pb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" /> Parámetros Físico-Químicos
            </h3>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Estado Físico:</span>
                <span className="font-bold text-white capitalize">{activeMolecule.state}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Geometría:</span>
                <span className="font-bold text-cyan-300 text-right max-w-[170px] truncate" title={activeMolecule.geometry}>
                  {activeMolecule.geometry}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Momento Dipolar:</span>
                <span className="font-bold text-amber-300">{activeMolecule.dipoleMomentD} D</span>
              </div>

              {activeMolecule.meltingPoint && (
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Punto de Fusión:</span>
                  <span className="font-bold text-white">{activeMolecule.meltingPoint}</span>
                </div>
              )}

              {activeMolecule.boilingPoint && (
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Punto de Ebullición:</span>
                  <span className="font-bold text-white">{activeMolecule.boilingPoint}</span>
                </div>
              )}

              <div className="pt-1">
                <span className="text-slate-400 block mb-1">Solubilidad en Agua:</span>
                <span className="text-slate-200 text-[11px] font-sans leading-snug block bg-[#060b13] p-2 rounded-lg border border-slate-800">
                  {activeMolecule.solubilityInWater}
                </span>
              </div>
            </div>

            {/* Quick Cross-linking Action Buttons */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                onClick={() => navigate(`/periodic-table?search=${encodeURIComponent(activeMolecule.formula)}`)}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-200 hover:text-white transition flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Atom className="w-3.5 h-3.5 text-cyan-400" /> Explorar en Tabla Periódica
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => navigate(`/workspace?reagents=${activeMolecule.id.toUpperCase()}`)}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-200 hover:text-white transition flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FlaskConical className="w-3.5 h-3.5 text-amber-400" /> Llevar al Laboratorio
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => navigate('/professor')}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-200 hover:text-white transition flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Bot className="w-3.5 h-3.5 text-purple-400" /> Consultar al Profesor IA
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
