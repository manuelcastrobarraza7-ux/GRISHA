import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FlaskConical, 
  Atom, 
  Zap, 
  Sun, 
  Bot, 
  Truck, 
  Dna,
  Cpu, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  Gauge, 
  Gamepad2, 
  FolderSync, 
  Play,
  Sliders,
  Check,
  Server,
  Lock,
  Boxes,
  Search,
  Globe,
  ExternalLink,
  Compass,
  CornerDownRight,
  Database,
  Cloud,
  Shield,
  FileText,
  Wifi,
  HardDrive,
  Settings2,
  Trash2,
  Flame
} from 'lucide-react';
import { 
  REGISTERED_INSTANCES, 
  MicroserviceInstance, 
  useGpuMicroserviceMonitor 
} from '../utils/gpuMicroserviceManager';
import { ChemicalReagent } from '../data/chemicals';
import { GoogleDriveSync } from './GoogleDriveSync';
import { MinecraftLabSettingsPanel } from './MinecraftLabSettingsPanel';
import { useSystemSettings, FpsCap, RamAllocationLimit } from '../utils/systemSettings';
import { SystemSettingsModal } from './SystemSettingsModal';

interface InstancesHubPageProps {
  selectedReagents: ChemicalReagent[];
  onOpenGameModal: () => void;
  onSaveWorkspace?: () => void;
  isSavingReaction?: boolean;
  currentUser?: any;
}

export const InstancesHubPage: React.FC<InstancesHubPageProps> = ({
  selectedReagents,
  onOpenGameModal,
  onSaveWorkspace,
  isSavingReaction = false,
  currentUser,
}) => {
  const navigate = useNavigate();
  const { telemetry, purgeGpuVram, toggleStrictIsolation, toggleUltraSpuSaving } = useGpuMicroserviceMonitor();
  const {
    settings,
    pingDiag,
    updateSettings,
    triggerGc,
    runPingTest,
    applyTurboAntiLag,
    applyBalanced,
    applyPowerSaver,
  } = useSystemSettings();
  const [purgeSuccessToast, setPurgeSuccessToast] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | '3d' | 'science' | 'logistics'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [settingsModalTab, setSettingsModalTab] = useState<'general' | 'ram' | 'cpu' | 'gpu' | 'rendering' | 'fps_ping'>('fps_ping');

  const handlePurge = () => {
    purgeGpuVram();
    setPurgeSuccessToast(true);
    setTimeout(() => setPurgeSuccessToast(false), 2400);
  };

  // Scroll to browser settings if URL has #ajustes or #ajustes-navegador
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash.includes('ajustes')) {
        setTimeout(() => {
          const el = document.getElementById('ajustes-navegador');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 120);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const filteredInstances = useMemo(() => {
    return REGISTERED_INSTANCES.filter(inst => {
      // Category filter
      if (selectedFilter === '3d' && inst.gpuTier !== 'heavy_webgl') return false;
      if (selectedFilter === 'science' && !(inst.id === 'workspace' || inst.id === 'astrophysics' || inst.id === 'periodic-table' || inst.id === 'metallurgy' || inst.id === 'molecular-viewer' || inst.id === 'chat' || inst.id.startsWith('chat-'))) return false;
      if (selectedFilter === 'logistics' && !(inst.id === 'regulations' || inst.id === 'workspace' || inst.id === 'chat' || inst.id.startsWith('chat-'))) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = inst.title.toLowerCase().includes(q);
        const matchDesc = inst.description.toLowerCase().includes(q);
        const matchUrl = inst.virtualUrl.toLowerCase().includes(q);
        const matchTag = inst.badgeTag.toLowerCase().includes(q);
        const matchFeat = inst.activeFeatures.some(f => f.toLowerCase().includes(q));
        return matchTitle || matchDesc || matchUrl || matchTag || matchFeat;
      }
      return true;
    });
  }, [selectedFilter, searchQuery]);

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'heavy_webgl':
        return {
          label: 'Aceleración GPU 3D (WebGL)',
          badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
        };
      case 'light_2d':
        return {
          label: 'Aceleración Gráfica 2D (SVG)',
          badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
        };
      default:
        return {
          label: 'Cero GPU (DOM / Memoria Pura)',
          badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
        };
    }
  };

  const getInstanceIcon = (id: string) => {
    switch (id) {
      case 'workspace':
        return <FlaskConical className="w-5 h-5 text-cyan-400" />;
      case 'atom-builder':
        return <Atom className="w-5 h-5 text-cyan-400" />;
      case 'physics-engine':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'astrophysics':
        return <Sun className="w-5 h-5 text-amber-300" />;
      case 'periodic-table':
        return <Atom className="w-5 h-5 text-blue-400" />;
      case 'chat':
        return <span className="sparkle-gradient font-bold text-lg">✦</span>;
      case 'chat-inorganica':
        return <FlaskConical className="w-5 h-5 text-cyan-400" />;
      case 'chat-organica':
        return <Dna className="w-5 h-5 text-emerald-400" />;
      case 'chat-cuantica-astrofisica':
        return <Atom className="w-5 h-5 text-purple-400" />;
      case 'professor':
        return <Bot className="w-5 h-5 text-purple-400" />;
      case 'regulations':
        return <Truck className="w-5 h-5 text-emerald-400" />;
      case 'metallurgy':
        return <Flame className="w-5 h-5 text-amber-500" />;
      case 'molecular-viewer':
        return <Boxes className="w-5 h-5 text-cyan-400" />;
      default:
        return <Boxes className="w-5 h-5 text-slate-400" />;
    }
  };

  const getQuickLinks = (id: string) => {
    switch (id) {
      case 'chat':
        return [
          { label: '🧪 Orgánica (ATP, ADN, AlphaFold)', path: '/chat' },
          { label: '⚛️ Inorgánica (K₂SO₄, KNO₃, ADR)', path: '/chat' },
          { label: '🌌 Cuántica & Astrofísica', path: '/chat' },
          { label: '🔬 Laboratorio & Ensayos', path: '/chat' },
        ];
      case 'chat-inorganica':
        return [
          { label: 'K₂SO₄ & KNO₃ libres de Cloro', path: '/chat-inorganica' },
          { label: 'Ácido Sulfúrico (H₂SO₄) ADR', path: '/chat-inorganica' },
          { label: 'Alúmina Al₂O₃ & Gemas', path: '/chat-inorganica' },
        ];
      case 'chat-organica':
        return [
          { label: 'ATP & Energía Celular', path: '/chat-organica' },
          { label: 'Doble Hélice ADN (Watson-Crick)', path: '/chat-organica' },
          { label: 'AlphaFold TP53 (pLDDT > 90)', path: '/chat-organica' },
        ];
      case 'chat-cuantica-astrofisica':
        return [
          { label: 'Ecuación de Schrödinger', path: '/chat-cuantica-astrofisica' },
          { label: 'Efecto Túnel & Gamow', path: '/chat-cuantica-astrofisica' },
          { label: 'Límite Chandrasekhar (1.44 M☉)', path: '/chat-cuantica-astrofisica' },
        ];
      case 'molecular-viewer':
        return [
          { label: 'Yodato de Calcio (Lautarita)', path: '/molecular-viewer?id=ca_io3_2&view=3d' },
          { label: 'Fundentes Metalúrgicos', path: '/molecular-viewer?category=metallurgy_fluxes' },
          { label: 'Etano & Butano', path: '/molecular-viewer?id=ethane&view=3d' },
          { label: 'Triglicéridos', path: '/molecular-viewer?id=triglyceride&view=3d' },
          { label: 'Sales Iónicas (NaCl)', path: '/molecular-viewer?id=nacl&view=3d' },
          { label: 'Alcoholes (Etanol)', path: '/molecular-viewer?id=ethanol&view=2d' },
        ];
      case 'metallurgy':
        return [
          { label: 'Fundentes & Afinado', path: '/metallurgy' },
          { label: 'Plata Sterling (925)', path: '/metallurgy' },
          { label: 'Oro Rosado', path: '/metallurgy' },
          { label: 'Acero al Carbono', path: '/metallurgy' },
          { label: 'Titanio Grado 5', path: '/metallurgy' },
        ];
      case 'atom-builder':
        return [
          { label: 'Carbono-12', path: '/atom-builder/C?z=6&n=6' },
          { label: 'Oxígeno-16', path: '/atom-builder/O?z=8&n=8' },
          { label: 'Uranio-235', path: '/atom-builder/U?z=92&n=143' },
        ];
      case 'physics-engine':
        return [
          { label: 'Átomo Bohr', path: '/physics-engine/bohr' },
          { label: 'Fuerza Lorentz', path: '/physics-engine/lorentz' },
          { label: 'Colisión Thomson', path: '/physics-engine/thomson' },
        ];
      case 'workspace':
        return [
          { label: 'Mezcla Ácido-Base', path: '/workspace' },
          { label: 'Fichas NFPA', path: '/workspace' },
        ];
      case 'periodic-table':
        return [
          { label: 'Metales Alcalinos', path: '/periodic-table?search=alcalino' },
          { label: 'Gases Nobles', path: '/periodic-table?search=noble' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in pb-12 font-sans px-4 sm:px-6">
      
      {/* ========================================================================= */}
      {/* 1. HERO BANNER: NAVEGADOR PRINCIPAL & PORTAL DE WEBS AISLADAS            */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1524] via-[#09101b] to-[#05080e] border border-cyan-800/40 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>NAVEGADOR WEB CIENTÍFICO · PORTAL DE INSTANCIAS</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                {REGISTERED_INSTANCES.length} Webs Aisladas en Sandboxes Independientes
              </span>
            </div>
          </div>

          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Navegador Científico
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              El portal de instancias es el <strong>navegador web principal</strong> donde puedes acceder a las webs científicas independientes que lo habitan. Cada web opera con <strong>aislamiento estricto por microservicios</strong>, optimizando el uso de GPU y memoria SPU sin instancias duplicadas ni sobrecarga de hardware.
            </p>
          </div>

          {/* Browser Portal Omnisearch */}
          <div className="relative max-w-2xl">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-cyan-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en las webs científicas (átomos, reacciones, física, URLs web://)..."
                className="w-full bg-[#070b13]/90 border border-slate-700/80 focus:border-cyan-400 text-slate-100 placeholder-slate-500 text-xs md:text-sm font-mono pl-11 pr-24 py-3 rounded-2xl outline-none shadow-inner transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 px-2 py-1 text-[11px] font-mono text-slate-400 hover:text-white bg-slate-800 rounded-md transition"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Hardware & Microservice Telemetry Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-[#0b1320]/80 border border-slate-800 rounded-2xl p-3.5 font-mono shadow-md">
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Webs que la habitan</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-cyan-400">{REGISTERED_INSTANCES.length}</span>
                <span className="text-xs text-slate-400">Instancias</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">Navegación por pestañas</span>
            </div>

            <div className="bg-[#0b1320]/80 border border-slate-800 rounded-2xl p-3.5 font-mono shadow-md">
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Contextos WebGL</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-emerald-400">{telemetry.activeWebGlContexts}</span>
                <span className="text-xs text-slate-400">/ 1 máx</span>
              </div>
              <span className="text-[10px] text-emerald-400/90 block mt-1">0 conflicto de GPU</span>
            </div>

            <div className="bg-[#0b1320]/80 border border-slate-800 rounded-2xl p-3.5 font-mono shadow-md">
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Carga SPU Asignada</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-amber-400">{telemetry.spuAllocatedPct}%</span>
                <span className="text-xs text-slate-400">Shader Unit</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">Reposo inteligente</span>
            </div>

            <div className="bg-[#0b1320]/80 border border-slate-800 rounded-2xl p-3.5 font-mono shadow-md">
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Instancias Repetidas</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-emerald-400">0</span>
                <span className="text-xs text-slate-400">duplicadas</span>
              </div>
              <span className="text-[10px] text-emerald-400/90 block mt-1">Motor físico desacoplado</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. INSTANCE GOVERNOR & HARDWARE ISOLATION CONSOLE                         */}
      {/* ========================================================================= */}
      <section className="bg-[#080d15] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                Coordinador de Microservicios & Optimización GPU / SPU
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Aislamiento estricto entre pestañas: las webs inactivas suspenden su bucle 3D para liberar recursos del procesador y GPU.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Purge VRAM Button */}
            <button
              onClick={handlePurge}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-medium flex items-center gap-2 transition active:scale-95 shadow-sm cursor-pointer"
              title="Libera búferes de geometría y texturas de la GPU"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Purgar VRAM ({telemetry.vramPurgeCount})</span>
            </button>

            {/* Strict Isolation Toggle */}
            <button
              onClick={toggleStrictIsolation}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-medium flex items-center gap-2 transition active:scale-95 cursor-pointer ${
                telemetry.strictIsolation
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
              title="Garantiza que nunca coexistan dos mallas 3D activas en la memoria"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Aislamiento Estricto: {telemetry.strictIsolation ? 'ON' : 'OFF'}</span>
            </button>

            {/* Ultra SPU Saving Toggle */}
            <button
              onClick={toggleUltraSpuSaving}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-medium flex items-center gap-2 transition active:scale-95 cursor-pointer ${
                telemetry.ultraSpuSaving
                  ? 'bg-amber-950/40 text-amber-300 border-amber-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
              title="Reduce el pixel ratio a 1x y desactiva post-procesado para ahorrar batería y SPU"
            >
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span>Ahorro SPU: {telemetry.ultraSpuSaving ? 'ACTIVADO' : 'ESTÁNDAR'}</span>
            </button>
          </div>
        </div>

        {/* Audit Notice: Duplicate elimination */}
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs font-mono flex items-start gap-2.5 text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-emerald-200">Resolución de Instancias Repetidas Aplicada:</strong> Se auditó la arquitectura del portal y se eliminó la instancia incrustada del <em>Motor Físico de Verlet</em> que existía indebidamente dentro del <em>Constructor Atómico 3D</em>. Ahora cada subsistema habita exclusivamente en su propia web (`web://motor-fisico.verlet.engine`), garantizando que ninguna instancia esté dentro de otra que no le corresponde y optimizando al 100% el uso de GPU.
          </div>
        </div>

        {purgeSuccessToast && (
          <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/60 text-xs font-mono text-cyan-200 flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-cyan-400" />
            <span>Memoria VRAM de la GPU purgada con éxito. Se enviaron señales de recolección de texturas a todos los microservicios.</span>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION FILTERS & WEBS DIRECTORY GRID                                  */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-xl font-bold text-white font-sans flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span>Directorio de Webs Científicas que Habitan el Navegador</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Accede a cualquiera de las 7 webs independientes. Cada una corre en su propio sandbox desacoplado.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#0b121e] p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas ({REGISTERED_INSTANCES.length})
            </button>
            <button
              onClick={() => setSelectedFilter('3d')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                selectedFilter === '3d'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Motores 3D (2)
            </button>
            <button
              onClick={() => setSelectedFilter('science')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                selectedFilter === 'science'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Química & Física (3)
            </button>
            <button
              onClick={() => setSelectedFilter('logistics')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                selectedFilter === 'logistics'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Seguridad & ADR (2)
            </button>
          </div>
        </div>

        {/* 7 Segmented Web Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstances.map((inst) => {
            const tier = getTierBadge(inst.gpuTier);
            const isCurrentlyActive = telemetry.activeInstanceId === inst.id;
            const quickLinks = getQuickLinks(inst.id);

            return (
              <div
                key={inst.id}
                className={`group relative flex flex-col justify-between bg-[#080d16] hover:bg-[#0b121e] border rounded-2xl p-5 shadow-xl transition-all duration-300 hover:shadow-cyan-900/10 hover:-translate-y-1 ${
                  isCurrentlyActive
                    ? 'border-cyan-500/60 ring-1 ring-cyan-500/30'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Bar inside Card: Number + Web URL badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
                      {inst.number}
                    </span>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${tier.badgeClass}`}>
                      {tier.label}
                    </span>
                  </div>

                  {/* Header & Icon */}
                  <div className="flex items-start gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0 group-hover:scale-105 transition">
                      {getInstanceIcon(inst.id)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-sans group-hover:text-cyan-300 transition leading-snug">
                        {inst.title}
                      </h3>
                      <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 mt-0.5">
                        <Lock className="w-2.5 h-2.5 text-emerald-400" />
                        <span>{inst.virtualUrl}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed font-sans mb-3 line-clamp-3">
                    {inst.description}
                  </p>

                  {/* Quick Jump Links inside the Web */}
                  {quickLinks.length > 0 && (
                    <div className="mb-3 pt-2 border-t border-slate-800/60">
                      <span className="text-[10px] font-mono uppercase text-slate-500 block font-semibold mb-1.5">
                        Accesos Rápidos a esta Web:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {quickLinks.map((ql, idx) => (
                          <button
                            key={idx}
                            onClick={() => navigate(ql.path)}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer flex items-center gap-1"
                          >
                            <CornerDownRight className="w-2.5 h-2.5 text-cyan-400" />
                            <span>{ql.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Features List */}
                  <div className="space-y-1.5 mb-4 border-t border-slate-800/60 pt-2.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">
                      Capacidades & Aislamiento
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {inst.activeFeatures.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                          <span className="w-1 h-1 rounded-full bg-cyan-400" />
                          <span className="truncate">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Actions & Launch Button */}
                <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Carga SPU: <strong className="text-slate-300">{inst.spuAllocationPct}%</strong></span>
                    <span>Memoria: <strong className="text-slate-300">~{inst.memoryEstMB} MB</strong></span>
                  </div>

                  <button
                    onClick={() => navigate(inst.route)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-200 border border-cyan-500/40 text-xs font-mono font-bold flex items-center justify-center gap-2 transition active:scale-95 shadow cursor-pointer group-hover:border-cyan-400"
                  >
                    <span>Acceder a esta Web en el Navegador</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CENTRO DE AJUSTES DEL SISTEMA: RAM, GPU, CPU, RENDER, FPS & PING       */}
      {/* ========================================================================= */}
      <section id="ajustes-navegador" className="bg-[#080d16] border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5 font-mono">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Settings2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 block">
                Control de Rendimiento Cuántico & Hardware
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white font-sans">
                Sistema de Ajustes de RAM, GPU, CPU, Renderizado, FPS y Anti-Lag Ping
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={applyTurboAntiLag}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-md"
              title="Activar perfil ultra optimizado para reducir latencia y subir FPS"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>⚡ TURBO CERO LAG</span>
            </button>

            <button
              onClick={() => {
                setSettingsModalTab('fps_ping');
                setIsSettingsModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Abrir Todos los Ajustes</span>
            </button>
          </div>
        </div>

        {/* Live Grid of Adjustments */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Card 1: FPS & Anti-Lag */}
          <div className="bg-[#0b121f] border border-slate-800/90 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-cyan-400" />
                Límite de FPS & Ping
              </span>
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <Wifi className="w-3 h-3" /> {pingDiag.currentPingMs} ms
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {([30, 60, 120] as FpsCap[]).map((cap) => (
                <button
                  key={String(cap)}
                  onClick={() => updateSettings({ maxFramerate: cap })}
                  className={`py-1.5 px-2 rounded-lg border text-center font-bold transition cursor-pointer ${
                    settings.maxFramerate === cap
                      ? 'bg-cyan-500 text-black border-cyan-400 shadow-sm'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {cap} FPS
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <span>Buffer Anti-Lag:</span>
              <span className={settings.zeroLagInputBuffer ? "text-cyan-400 font-bold" : "text-slate-500"}>
                {settings.zeroLagInputBuffer ? 'CERO RETARDO (<1ms)' : 'Estándar'}
              </span>
            </div>
          </div>

          {/* Card 2: Render Quality & Particles */}
          <div className="bg-[#0b121f] border border-slate-800/90 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Calidad de Render 3D
              </span>
              <span className="text-[11px] text-cyan-400 uppercase font-bold">
                {settings.renderQuality}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateSettings({ renderQuality: 'fast' })}
                className={`py-1.5 px-2 rounded-lg border text-center font-bold transition cursor-pointer ${
                  settings.renderQuality === 'fast'
                    ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
              >
                Rápido (Fast)
              </button>
              <button
                onClick={() => updateSettings({ renderQuality: 'balanced' })}
                className={`py-1.5 px-2 rounded-lg border text-center font-bold transition cursor-pointer ${
                  settings.renderQuality === 'balanced'
                    ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
              >
                Equilibrado
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <span>Partículas:</span>
              <span className="text-slate-200 font-bold">
                {settings.particleDensity.toLocaleString()} partículas
              </span>
            </div>
          </div>

          {/* Card 3: RAM & GPU Health */}
          <div className="bg-[#0b121f] border border-slate-800/90 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                RAM & GPU
              </span>
              <span className="text-[11px] text-emerald-400 font-bold">
                {settings.ramAllocationGB === 'unlimited' ? 'Auto GB' : `${settings.ramAllocationGB} GB`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const freed = triggerGc();
                  purgeGpuVram();
                  setPurgeSuccessToast(true);
                  setTimeout(() => setPurgeSuccessToast(false), 2400);
                }}
                className="flex-1 py-1.5 px-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Purgar VRAM</span>
              </button>
              <button
                onClick={() => {
                  setSettingsModalTab('ram');
                  setIsSettingsModalOpen(true);
                }}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
              >
                Configurar
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <span>Hilos CPU:</span>
              <span className="text-purple-300 font-bold">{settings.workerThreads} Hilos Activos</span>
            </div>
          </div>

        </div>
      </section>

      {/* System Settings Modal */}
      <SystemSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        initialTab={settingsModalTab}
      />

      {/* ========================================================================= */}
      {/* 5. FAST COMMAND & SIMULATION DECK                                         */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-r from-[#070d18] via-[#091222] to-[#070d18] border border-cyan-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
            <span>Simulacro de Emergencia & Protocolos de Fuga</span>
          </div>
          <h3 className="text-xl font-bold text-white font-sans">
            ¿Listo para poner a prueba tu conocimiento de seguridad química?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Ejecuta el protocolo de emergencia interactivo con cronómetro: contención de derrames, selección de extintores y toma de decisiones críticas bajo normativa ADR.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onOpenGameModal}
            className="px-5 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Iniciar Simulacro de Emergencia</span>
          </button>

          <button
            onClick={() => navigate('/workspace')}
            className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono text-xs font-medium transition active:scale-95 cursor-pointer"
          >
            Ir al Laboratorio ({selectedReagents.length} reactivos)
          </button>
        </div>
      </section>

    </div>
  );
};
