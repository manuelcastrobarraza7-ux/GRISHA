import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  HashRouter, 
  Routes, 
  Route, 
  Navigate, 
  useLocation, 
  useNavigate, 
  useSearchParams, 
  useParams 
} from 'react-router-dom';
import { CHEMICAL_DATABASE, ChemicalReagent } from './data/chemicals';
import { PERIODIC_ELEMENTS } from './data/periodicTable';
import { ChemicalCatalog } from './components/ChemicalCatalog';
import { ReactionWorkspace } from './components/ReactionWorkspace';
import { UnifiedGeminiChat } from './components/UnifiedGeminiChat';
import { ChemicalGame } from './components/ChemicalGame';
import { ReagentDetailModal } from './components/ReagentDetailModal';
import { PeriodicTableSection } from './components/PeriodicTableSection';
import { StellarNucleosynthesis } from './components/StellarNucleosynthesis';
import { NucleusBuilder3D } from './components/NucleusBuilder3D';
import { auth, signInWithGoogle, signInAsGuest, logoutUser, saveReactionToFirestore, fetchSavedReactions } from './utils/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  FlaskConical, 
  Truck, 
  AlertOctagon,
  Atom,
  Sun,
  Zap
} from 'lucide-react';
import { CollapsibleSection } from './components/CollapsibleSection';
import { WorkspaceRiskChart } from './components/WorkspaceRiskChart';
import { UnifiedPhysicsEngineSimulator } from './components/UnifiedPhysicsEngineSimulator';
import { MetallurgyAlloysLab } from './components/MetallurgyAlloysLab';
import { ShareDeepLinkModal } from './components/ShareDeepLinkModal';
import { InstancesHubPage } from './components/InstancesHubPage';
import { WebBrowserChrome } from './components/WebBrowserChrome';
import { MolecularViewerPage } from './components/MolecularViewerPage';

// Helper to resolve an element symbol or atomic number Z
function resolveElementOrZ(param?: string): { z: number; symbol?: string; name?: string } {
  if (!param) return { z: 7, symbol: 'N', name: 'Nitrógeno' };
  
  const num = parseInt(param, 10);
  if (!isNaN(num) && num >= 0 && num <= 118) {
    const found = PERIODIC_ELEMENTS.find(e => e.z === num);
    return { z: num, symbol: found?.symbol, name: found?.name };
  }
  
  const foundBySymbol = PERIODIC_ELEMENTS.find(
    e => e.symbol.toLowerCase() === param.toLowerCase() || e.name.toLowerCase() === param.toLowerCase()
  );
  if (foundBySymbol) {
    return { z: foundBySymbol.z, symbol: foundBySymbol.symbol, name: foundBySymbol.name };
  }
  
  return { z: 7, symbol: 'N', name: 'Nitrógeno' };
}

/* ========================================================================= */
/* 1. ROUTE WRAPPER: WORKSPACE (LABORATORIO & FICHAS)                        */
/* ========================================================================= */
interface WorkspaceRouteProps {
  selectedReagents: ChemicalReagent[];
  onSelectReagent: (reagent: ChemicalReagent) => void;
  onRemoveReagent: (index: number) => void;
  onClearWorkspace: () => void;
  onLoadPreset: (reagentIds: string[]) => void;
  onOpenDetails: (reagent: ChemicalReagent) => void;
  savedReactionsList: any[];
  currentUser: FirebaseUser | null;
  onSaveWorkspace: () => void;
  isSavingReaction: boolean;
}

const WorkspaceRoute: React.FC<WorkspaceRouteProps> = ({
  selectedReagents,
  onSelectReagent,
  onRemoveReagent,
  onClearWorkspace,
  onLoadPreset,
  onOpenDetails,
  savedReactionsList,
  currentUser,
  onSaveWorkspace,
  isSavingReaction,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle deep-link query parameters: ?reagents=H2SO4,KOH or ?preset=neutralization_strong or ?inspect=H2SO4
  useEffect(() => {
    const reagentsParam = searchParams.get('reagents');
    if (reagentsParam) {
      const ids = reagentsParam.split(',').map(s => s.trim());
      onLoadPreset(ids);
    }

    const inspectParam = searchParams.get('inspect');
    if (inspectParam) {
      const match = CHEMICAL_DATABASE.find(
        c => c.id.toLowerCase() === inspectParam.toLowerCase() || c.formula.toLowerCase() === inspectParam.toLowerCase()
      );
      if (match) {
        onOpenDetails(match);
      }
    }
  }, [searchParams]);

  const selectedIds = selectedReagents.filter(Boolean).map(r => r.id);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 Cols: Chemical Catalog */}
        <div className="lg:col-span-5 h-full">
          <CollapsibleSection title="Catálogo de Reactivos" subtitle="Buscador y familias químicas" icon={<FlaskConical />}>
            <ChemicalCatalog
              onSelectReagent={onSelectReagent}
              selectedIds={selectedIds}
              onOpenDetails={onOpenDetails}
            />
          </CollapsibleSection>
        </div>

        {/* Right 7 Cols: Workspace & Reaction Analyzer */}
        <div className="lg:col-span-7">
          <CollapsibleSection title="Workspace y Simulador de Reacciones" subtitle="Balanceo estequiométrico y fichas NFPA/ADR" icon={<Atom />}>
            <ReactionWorkspace
              selectedReagents={selectedReagents}
              onRemoveReagent={onRemoveReagent}
              onClearWorkspace={onClearWorkspace}
              onLoadPreset={onLoadPreset}
            />
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 2. ROUTE WRAPPER: ATOM BUILDER 3D                                         */
/* ========================================================================= */
const AtomBuilderRoute: React.FC = () => {
  const { elementOrZ } = useParams<{ elementOrZ?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const resolved = useMemo(() => resolveElementOrZ(elementOrZ || searchParams.get('z') || undefined), [elementOrZ, searchParams]);
  
  const zFromQuery = searchParams.get('z') ? parseInt(searchParams.get('z')!, 10) : resolved.z;
  const nFromQuery = searchParams.get('n') ? parseInt(searchParams.get('n')!, 10) : zFromQuery;
  const electronsFromQuery = searchParams.get('electrons') ? parseInt(searchParams.get('electrons')!, 10) : zFromQuery;
  const modeFromQuery = (searchParams.get('mode') as '3D' | '2D') || '3D';

  const handleStateChange = useCallback((state: { z: number; n: number; e: number; mode: '3D' | '2D' }) => {
    // Keep URL query parameters in sync silently
    const nextParams = new URLSearchParams();
    nextParams.set('z', String(state.z));
    nextParams.set('n', String(state.n));
    if (state.e !== state.z) nextParams.set('electrons', String(state.e));
    if (state.mode !== '3D') nextParams.set('mode', state.mode);
    
    // Only update if changed to avoid unnecessary re-renders
    const currentSearch = searchParams.toString();
    const nextSearch = nextParams.toString();
    if (currentSearch !== nextSearch) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in">
      <CollapsibleSection 
        title="Constructor 3D de Núcleos Atómicos" 
        subtitle="Modelo de nucleones Three.js, bandas de estabilidad nuclear, canales de decaimiento y enlace al motor físico 3D para la corteza cuántica" 
        icon={<Atom />}
      >
        <NucleusBuilder3D
          initialZ={zFromQuery}
          initialN={nFromQuery}
          initialDimensionMode={modeFromQuery}
          onNavigateHome={() => navigate('/')}
          onOpenElementDetails={(z) => navigate(`/periodic-table/${z}`)}
          onLaunchPhysicsEngine={(z, n) => navigate(`/physics-engine?z=${z}&n=${n ?? z}&preset=bohr`)}
          onStateChange={handleStateChange}
        />
      </CollapsibleSection>
    </div>
  );
};

/* ========================================================================= */
/* 3. ROUTE WRAPPER: UNIFIED PHYSICS ENGINE 3D (VERLET & LORENTZ)            */
/* ========================================================================= */
const PhysicsEngineRoute: React.FC = () => {
  const { preset } = useParams<{ preset?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activePreset = useMemo(() => {
    const validPresets = ['bohr', 'lorentz', 'bounce', 'coulomb', 'thomson'];
    if (preset && validPresets.includes(preset)) return preset as any;
    const queryPreset = searchParams.get('preset');
    if (queryPreset && validPresets.includes(queryPreset)) return queryPreset as any;
    return 'bohr';
  }, [preset, searchParams]);

  const initialZ = searchParams.get('z') ? parseInt(searchParams.get('z')!, 10) : 1;
  const initialN = searchParams.get('n') ? parseInt(searchParams.get('n')!, 10) : undefined;
  const initialElectrons = searchParams.get('electrons') || searchParams.get('e') 
    ? parseInt(searchParams.get('electrons') || searchParams.get('e')!, 10) 
    : undefined;

  const handlePresetChange = (newPreset: string) => {
    navigate(`/physics-engine/${newPreset}`, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in">
      <CollapsibleSection 
        title="Motor Físico Cuántico 3D (Bohr, Verlet & Lorentz)" 
        subtitle="Dinámica orbital cuántica de electrones, corteza Aufbau, cambio de isótopos de la tabla periódica y proyección 2D" 
        icon={<Zap />}
      >
        <UnifiedPhysicsEngineSimulator 
          key={`sim-${activePreset}-${initialZ}-${initialN ?? 'def'}-${initialElectrons ?? 'def'}`}
          initialPreset={activePreset} 
          initialZ={initialZ}
          initialN={initialN}
          initialElectrons={initialElectrons}
          onPresetChange={handlePresetChange}
          onClose={() => navigate('/atom-builder')}
        />
      </CollapsibleSection>
    </div>
  );
};

/* ========================================================================= */
/* 4. ROUTE WRAPPER: STELLAR ASTROPHYSICS & NUCLEOSYNTHESIS                  */
/* ========================================================================= */
const AstrophysicsRoute: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in">
      <CollapsibleSection 
        title="Nucleosíntesis Estelar & Astrofísica" 
        subtitle="Evolución termonuclear estelar, resonancia de Hoyle y fusión nuclear" 
        icon={<Sun />}
      >
        <StellarNucleosynthesis />
      </CollapsibleSection>
    </div>
  );
};

/* ========================================================================= */
/* 5. ROUTE WRAPPER: PERIODIC TABLE                                          */
/* ========================================================================= */
interface PeriodicTableRouteProps {
  onSelectReagent: (reagent: ChemicalReagent) => void;
}

const PeriodicTableRoute: React.FC<PeriodicTableRouteProps> = ({ onSelectReagent }) => {
  const { symbolOrZ } = useParams<{ symbolOrZ?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialElement = symbolOrZ || searchParams.get('element') || undefined;

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in">
      <CollapsibleSection 
        title="Tabla Periódica Interactiva" 
        subtitle="Propiedades físico-químicas, configuración electrónica y origen astrofísico" 
        icon={<Atom />}
      >
        <PeriodicTableSection
          initialElementSymbol={initialElement}
          onAddReagentToWorkspace={(reagent) => onSelectReagent(reagent)}
          onNavigateToWorkspace={() => navigate('/workspace')}
          onOpenIn3DBuilder={(element, isotope) => {
            if (isotope) {
              navigate(`/atom-builder/${element.z}?n=${isotope.n}&a=${isotope.massNumber}`);
            } else {
              navigate(`/atom-builder/${element.z}`);
            }
          }}
        />
      </CollapsibleSection>
    </div>
  );
};

/**
 * Contenedor seguro para el renderizado dinámico de Markdown en ProfessorChat.
 * Asegura aislamiento de bloque a nivel de raíz para garantizar que elementos de bloque
 * (como <div> generados por KaTeX para fórmulas display $$...$$ o bloques de código)
 * nunca queden atrapados dentro de etiquetas <span> o <p> existentes, previniendo
 * errores de hidratación HTML en el cliente.
 */
export const SafeChatMarkdownContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div 
      className={`w-full h-full flex flex-col flex-1 min-h-0 overflow-hidden isolate ${className}`}
      style={{ display: 'flex', width: '100%', height: '100%' }}
    >
      {children}
    </div>
  );
};

/* ========================================================================= */
/* 6. ROUTE WRAPPERS: ESPICUMEYRIA AI (GEMINI SCIENCE) SINGLE UNIFIED CHAT   */
/* ========================================================================= */
const UnifiedChatRoute: React.FC = () => {
  return (
    <SafeChatMarkdownContainer>
      <UnifiedGeminiChat initialDomain="organica" />
    </SafeChatMarkdownContainer>
  );
};

const WebChatInorganicaRoute: React.FC = () => {
  return (
    <SafeChatMarkdownContainer>
      <UnifiedGeminiChat initialDomain="inorganica" />
    </SafeChatMarkdownContainer>
  );
};

const WebChatOrganicaRoute: React.FC = () => {
  return (
    <SafeChatMarkdownContainer>
      <UnifiedGeminiChat initialDomain="organica" />
    </SafeChatMarkdownContainer>
  );
};

const WebChatCuanticaAstroRoute: React.FC = () => {
  return (
    <SafeChatMarkdownContainer>
      <UnifiedGeminiChat initialDomain="cuantica" />
    </SafeChatMarkdownContainer>
  );
};

/* ========================================================================= */
/* 7. ROUTE WRAPPER: ADR REGULATIONS & RISK MATRIX                           */
/* ========================================================================= */
interface RegulationsRouteProps {
  selectedReagents: ChemicalReagent[];
}

const RegulationsRoute: React.FC<RegulationsRouteProps> = ({ selectedReagents }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <WorkspaceRiskChart selectedReagents={selectedReagents} />
      <CollapsibleSection title="Manual Técnico de Transporte ADR" subtitle="Acuerdo europeo y códigos de túneles" icon={<Truck />}>
        <div className="space-y-6">
          {/* Tunnel Categories Table */}
          <div className="bg-[#080d14] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-400" /> Clasificación Oficial de Túneles ADR (A hasta E)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs font-mono">
              <div className="bg-[#0b111a] border border-slate-800 rounded-lg p-3">
                <span className="text-sm font-bold text-emerald-400 block mb-1">CATEGORÍA A</span>
                <span className="text-[10px] uppercase text-slate-400 block mb-1">Sin Restricción</span>
                <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                  Ninguna restricción para el transporte de mercancías peligrosas. Tránsito libre.
                </p>
              </div>

              <div className="bg-[#0b111a] border border-slate-800 rounded-lg p-3">
                <span className="text-sm font-bold text-cyan-400 block mb-1">CATEGORÍA B</span>
                <span className="text-[10px] uppercase text-slate-400 block mb-1">Explosión Muy Grave</span>
                <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                  Restricción para mercancías susceptibles de provocar una explosión muy grave en el túnel.
                </p>
              </div>

              <div className="bg-[#0b111a] border border-slate-800 rounded-lg p-3">
                <span className="text-sm font-bold text-blue-400 block mb-1">CATEGORÍA C</span>
                <span className="text-[10px] uppercase text-slate-400 block mb-1">Explosión o Fuga Tóxica</span>
                <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                  Restricción para materias susceptibles de provocar una explosión muy grave o emisión masiva de gas tóxico.
                </p>
              </div>

              <div className="bg-[#0b111a] border border-slate-800 rounded-lg p-3">
                <span className="text-sm font-bold text-amber-400 block mb-1">CATEGORÍA D</span>
                <span className="text-[10px] uppercase text-slate-400 block mb-1">Incendio Severo / Fuga</span>
                <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                  Restricción para explosiones, fugas tóxicas o incendios graves en cisternas de materias inflamables o corrosivas.
                </p>
              </div>

              <div className="bg-[#0b111a] border border-red-500/40 rounded-lg p-3">
                <span className="text-sm font-bold text-red-400 block mb-1">CATEGORÍA E</span>
                <span className="text-[10px] uppercase text-slate-400 block mb-1">Máxima Restricción</span>
                <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                  Restricción para <strong>TODAS</strong> las mercancías peligrosas que requieran señalización naranja ADR.
                </p>
              </div>
            </div>
          </div>

          {/* Segregation Matrix */}
          <div className="bg-[#080d14] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Matriz de Incompatibilidad & Segregación Espiquumeyria
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Para el almacenamiento y transporte conjunto en el mismo vehículo o nave, aplican las reglas estrictas de segregación:
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-500/30 flex items-start gap-2 text-slate-200">
                <span className="text-red-400 font-bold shrink-0">ÁCIDOS vs BASES:</span>
                <span className="font-sans">
                  Incompatibilidad absoluta. Su mezcla inadvertida en una balsa de contención genera una violenta reacción exotérmica con proyección de vapores cáusticos y sobrepresión.
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 flex items-start gap-2 text-slate-200">
                <span className="text-amber-400 font-bold shrink-0">COMBURENTES (KNO₃, HNO₃) vs ORGÁNICOS (Azúcar, Madera):</span>
                <span className="font-sans">
                  Separación mínima de 3 metros o muro cortafuegos RF-120. Los agentes oxidantes ceden oxígeno acelerando catastróficamente cualquier conato de incendio.
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-500/30 flex items-start gap-2 text-slate-200">
                <span className="text-blue-400 font-bold shrink-0">METALES REACTIVOS (Na, K, Li, Al polvo) vs AGUA:</span>
                <span className="font-sans">
                  Extintores de agua prohibidos taxativamente. Desprenden gas hidrógeno inflamable ($H_2$) que estalla al contacto con chispas. Utilizar extintor Clase D (polvo seco de cloruro sódico o grafito).
                </span>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};

/* ========================================================================= */
/* 8. ROUTE WRAPPER: ALEACIONES METÁLICAS & METALURGIA EDUCATIVA            */
/* ========================================================================= */
const MetallurgyRoute: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in">
      <MetallurgyAlloysLab
        onNavigateHome={() => navigate('/')}
        onOpenPeriodicTable={(symbol) => navigate(`/periodic-table?search=${encodeURIComponent(symbol)}`)}
        onOpenAtomBuilder={(z) => navigate(`/atom-builder?z=${z}`)}
      />
    </div>
  );
};

/* ========================================================================= */
/* 9. ROUTE WRAPPER: VISUALIZADOR MOLECULAR 2D Y 3D                          */
/* ========================================================================= */
const MolecularViewerRoute: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in">
      <MolecularViewerPage />
    </div>
  );
};

/* ========================================================================= */
/* MAIN APPLICATION CONTENT & NAVIGATION WITH HASHROUTER                     */
/* ========================================================================= */
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  // Authentication & Firestore state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [savedReactionsList, setSavedReactionsList] = useState<any[]>([]);
  const [isSavingReaction, setIsSavingReaction] = useState<boolean>(false);

  // Modals & Share
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [inspectingReagent, setInspectingReagent] = useState<ChemicalReagent | null>(null);
  const [showGameModal, setShowGameModal] = useState<boolean>(false);

  // Reagents state
  const [selectedReagents, setSelectedReagents] = useState<ChemicalReagent[]>(() => {
    return [
      CHEMICAL_DATABASE.find(c => c.id === 'H2SO4'),
      CHEMICAL_DATABASE.find(c => c.id === 'KNO3'),
      CHEMICAL_DATABASE.find(c => c.id === 'KOH'),
    ].filter((c): c is ChemicalReagent => Boolean(c));
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setCurrentUser(u);
      if (u) {
        try {
          const reactions = await fetchSavedReactions(u.uid);
          setSavedReactionsList(reactions);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSavedReactionsList([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.warn('Aviso de inicio de sesión:', err?.message || err);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.warn('Aviso de cierre de sesión:', err);
    }
  };

  const handleSaveCurrentWorkspace = async () => {
    let user = currentUser;
    if (!user) {
      user = await signInAsGuest();
      if (!user) {
        alert('Inicia sesión para guardar reacciones en Firestore.');
        return;
      }
    }
    setIsSavingReaction(true);
    try {
      const reactionId = 'rxn_' + Date.now();
      const title = selectedReagents.map(r => r.nombre).join(' + ') || 'Mezcla vacía';
      const equation = selectedReagents.map(r => r.formula).join(' + ');
      const reagents = selectedReagents.map(r => r.id).join(',');
      await saveReactionToFirestore(user.uid, { id: reactionId, title, equation, reagents });
      const updated = await fetchSavedReactions(user.uid);
      setSavedReactionsList(updated);
      alert('¡Reacción guardada en Firestore con éxito!');
    } catch (err) {
      console.error(err);
      alert('Error al guardar en Firestore.');
    } finally {
      setIsSavingReaction(false);
    }
  };

  const handleSelectReagent = (reagent: ChemicalReagent) => {
    if (!reagent) return;
    setSelectedReagents(prev => [...prev.filter(Boolean), reagent]);
  };

  const handleRemoveReagent = (index: number) => {
    setSelectedReagents(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearWorkspace = () => {
    setSelectedReagents([]);
  };

  const handleLoadPreset = (reagentIds: string[]) => {
    const matched = reagentIds
      .map(id => CHEMICAL_DATABASE.find(c => c.id === id))
      .filter((c): c is ChemicalReagent => Boolean(c));
    setSelectedReagents(matched);
  };

  const selectedIds = selectedReagents.filter(Boolean).map(r => r.id);

  // Metadata for current world sharing
  const worldInfo = useMemo(() => {
    const path = location.pathname;
    if (path === '/' || path === '/hub') {
      return {
        title: 'Portal de Instancias Aisladas y Microservicios',
        desc: 'Centro de operaciones científico modular con 11 instancias independientes y aislamiento estricto de GPU / SPU.',
      };
    }
    if (path.startsWith('/molecular-viewer') || path.startsWith('/moleculas')) {
      return {
        title: 'Visualizador Molecular 2D y 3D',
        desc: 'Estructura exacta de sales iónicas, alcoholes alifáticos y compuestos orgánicos complejos.',
      };
    }
    if (path.startsWith('/metallurgy') || path.startsWith('/aleaciones')) {
      return {
        title: 'Aleaciones Metálicas & Metalurgia Educativa',
        desc: 'Crisol interactivo de fundición con cálculo dinámico de densidad promedio y aceros especiales.',
      };
    }
    if (path.startsWith('/atom-builder')) {
      return {
        title: 'Constructor 3D de Átomos',
        desc: 'Visualización tridimensional de núcleos, nubes |ψ|² cuánticas y bandas de estabilidad.',
      };
    }
    if (path.startsWith('/physics-engine')) {
      return {
        title: 'Motor Físico Unificado 3D (Verlet & Lorentz)',
        desc: 'Simulación con leyes físicas: dinámica de Bohr, colisiones y proyección 2D.',
      };
    }
    if (path.startsWith('/astrophysics')) {
      return {
        title: 'Nucleosíntesis Estelar & Astrofísica',
        desc: 'Evolución termonuclear de estrellas, cadena protón-protón y formación cósmica de elementos.',
      };
    }
    if (path.startsWith('/periodic')) {
      return {
        title: 'Tabla Periódica Interactiva',
        desc: '118 elementos químicos con propiedades moleculares y vínculos directos al constructor 3D.',
      };
    }
    if (path.startsWith('/chat') || path.startsWith('/professor')) {
      return {
        title: 'Espiqumeyria AI - Gemini Science',
        desc: 'Espacio de chat unificado para Química Orgánica, Inorgánica, Astrofísica & Cuántica y Laboratorio.',
      };
    }
    if (path.startsWith('/regulations')) {
      return {
        title: 'Normativa ADR y Seguridad Química',
        desc: 'Directrices europeas para transporte de sustancias peligrosas y códigos de túneles.',
      };
    }
    return {
      title: 'Laboratorio & Fichas de Reactivos',
      desc: 'Simulador estequiométrico, balanceo de reacciones químicas y prevención de riesgos NFPA.',
    };
  }, [location.pathname]);

  const fullCurrentUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}#${location.pathname}${location.search}`
    : '';

  const isChat = location.pathname.startsWith('/chat') || location.pathname.startsWith('/professor');

  return (
    <WebBrowserChrome
      onOpenGameModal={() => setShowGameModal(true)}
      onOpenShareModal={() => setIsShareModalOpen(true)}
      currentUser={currentUser}
      onLogin={handleGoogleLogin}
      onLogout={handleLogout}
    >
      {/* Main Dynamic Viewport Managed by Routes */}
      <div className={`flex-1 w-full min-h-0 ${isChat ? 'h-full p-0 flex flex-col overflow-hidden' : 'p-3 sm:p-4 lg:p-6'}`}>
        <Routes>
          <Route 
            path="/" 
            element={
              <InstancesHubPage
                selectedReagents={selectedReagents}
                onOpenGameModal={() => setShowGameModal(true)}
                onSaveWorkspace={handleSaveCurrentWorkspace}
                isSavingReaction={isSavingReaction}
                currentUser={currentUser}
              />
            } 
          />
          <Route 
            path="/hub" 
            element={
              <InstancesHubPage
                selectedReagents={selectedReagents}
                onOpenGameModal={() => setShowGameModal(true)}
                onSaveWorkspace={handleSaveCurrentWorkspace}
                isSavingReaction={isSavingReaction}
                currentUser={currentUser}
              />
            } 
          />
          <Route 
            path="/workspace" 
            element={
              <WorkspaceRoute
                selectedReagents={selectedReagents}
                onSelectReagent={handleSelectReagent}
                onRemoveReagent={handleRemoveReagent}
                onClearWorkspace={handleClearWorkspace}
                onLoadPreset={handleLoadPreset}
                onOpenDetails={(r) => setInspectingReagent(r)}
                savedReactionsList={savedReactionsList}
                currentUser={currentUser}
                onSaveWorkspace={handleSaveCurrentWorkspace}
                isSavingReaction={isSavingReaction}
              />
            } 
          />

          <Route path="/atom-builder" element={<AtomBuilderRoute />} />
          <Route path="/atom-builder/:elementOrZ" element={<AtomBuilderRoute />} />
          <Route path="/physics-engine" element={<PhysicsEngineRoute />} />
          <Route path="/physics-engine/:preset" element={<PhysicsEngineRoute />} />
          <Route path="/astrophysics" element={<AstrophysicsRoute />} />
          <Route path="/periodic-table" element={<PeriodicTableRoute onSelectReagent={handleSelectReagent} />} />
          <Route path="/periodic-table/:symbolOrZ" element={<PeriodicTableRoute onSelectReagent={handleSelectReagent} />} />
          <Route path="/chat" element={<UnifiedChatRoute />} />
          <Route path="/chat-inorganica" element={<WebChatInorganicaRoute />} />
          <Route path="/chat-organica" element={<WebChatOrganicaRoute />} />
          <Route path="/chat-cuantica-astrofisica" element={<WebChatCuanticaAstroRoute />} />
          <Route path="/professor" element={<Navigate to="/chat" replace />} />
          <Route path="/chat-quimica" element={<Navigate to="/chat" replace />} />
          <Route path="/chat-biologia" element={<Navigate to="/chat" replace />} />
          <Route path="/regulations" element={<RegulationsRoute selectedReagents={selectedReagents} />} />
          <Route path="/metallurgy" element={<MetallurgyRoute />} />
          <Route path="/aleaciones" element={<MetallurgyRoute />} />
          <Route path="/molecular-viewer" element={<MolecularViewerRoute />} />
          <Route path="/molecular-viewer/:moleculeId" element={<MolecularViewerRoute />} />
          <Route path="/moleculas" element={<MolecularViewerRoute />} />
          <Route path="/moleculas/:moleculeId" element={<MolecularViewerRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Reagent Detail Modal */}
      {inspectingReagent && (
        <ReagentDetailModal
          reagent={inspectingReagent}
          onClose={() => setInspectingReagent(null)}
          onAddToSequence={handleSelectReagent}
          isAlreadySelected={selectedIds.includes(inspectingReagent.id)}
          onNavigateToMolecularViewer={(moleculeId) => navigate(`/molecular-viewer?id=${moleculeId}&view=3d`)}
        />
      )}

      {/* Emergency Protocol Game Modal */}
      {showGameModal && (
        <ChemicalGame onClose={() => setShowGameModal(false)} />
      )}

      {/* Share Deep Link Modal */}
      {isShareModalOpen && (
        <ShareDeepLinkModal
          currentUrl={fullCurrentUrl}
          worldTitle={worldInfo.title}
          worldPath={`#${location.pathname}${location.search}`}
          worldDescription={worldInfo.desc}
          onClose={() => setIsShareModalOpen(false)}
          onNavigateTo={(path) => navigate(path)}
        />
      )}

      {/* Quiet Technical Browser Footer (Hidden on Chat to keep AI chat 100% full screen) */}
      {!isChat && (
        <footer className="border-t border-slate-800/80 bg-[#060a12] py-3 mt-auto text-xs font-mono text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Espiquumeyria Quantum Browser</span>
              <span aria-hidden="true">·</span>
              <span>Portal de Instancias & Microservicios</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">Aislamiento GPU/SPU Activo</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
              >
                Compartir este mundo
              </button>
              <span>•</span>
              <span>{CHEMICAL_DATABASE.length} Reactivos • 118 Elementos</span>
            </div>
          </div>
        </footer>
      )}
    </WebBrowserChrome>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
