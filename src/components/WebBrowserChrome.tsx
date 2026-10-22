import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Home, 
  Lock, 
  Search, 
  Plus, 
  X, 
  Cpu, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  Gamepad2, 
  Layers, 
  Zap, 
  Atom, 
  FlaskConical, 
  Sun, 
  Bot, 
  Truck, 
  Boxes,
  Dna,
  ExternalLink,
  ChevronDown,
  Trash2,
  Info,
  MoreVertical,
  Settings,
  Download,
  History,
  Star,
  BookOpen,
  Monitor,
  HelpCircle,
  FolderPlus,
  Languages,
  FileText,
  Sliders,
  CheckSquare,
  Square,
  ZoomIn,
  ZoomOut,
  Shield,
  Wifi,
  Eye,
  Radio,
  FileCode,
  CheckCircle2,
  LayoutGrid,
  Flame
} from 'lucide-react';
import { 
  REGISTERED_INSTANCES, 
  MicroserviceInstance, 
  useGpuMicroserviceMonitor 
} from '../utils/gpuMicroserviceManager';
import { useSystemSettings } from '../utils/systemSettings';
import { SystemSettingsModal } from './SystemSettingsModal';

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  route: string;
  iconType: string;
  canClose: boolean;
}

interface WebBrowserChromeProps {
  children: React.ReactNode;
  onOpenGameModal: () => void;
  onOpenShareModal: () => void;
  currentUser: any;
  onLogin: () => void;
  onLogout: () => void;
}

export const WebBrowserChrome: React.FC<WebBrowserChromeProps> = ({
  children,
  onOpenGameModal,
  onOpenShareModal,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { telemetry, purgeGpuVram, toggleStrictIsolation, toggleUltraSpuSaving } = useGpuMicroserviceMonitor();
  const { settings, pingDiag, updateSettings, triggerGc, runPingTest, applyTurboAntiLag } = useSystemSettings();

  // Tabs state
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'portal',
      title: 'Portal de Instancias',
      url: 'web://portal.espiquumeyria.internal',
      route: '/',
      iconType: 'home',
      canClose: false,
    },
    {
      id: 'workspace',
      title: 'Laboratorio Químico',
      url: 'web://laboratorio.quimica.net',
      route: '/workspace',
      iconType: 'flask',
      canClose: true,
    },
    {
      id: 'atom-builder',
      title: 'Constructor 3D',
      url: 'web://cuantica-3d.atom.io',
      route: '/atom-builder',
      iconType: 'atom',
      canClose: true,
    },
    {
      id: 'physics-engine',
      title: 'Motor Físico 3D',
      url: 'web://motor-fisico.verlet.engine',
      route: '/physics-engine',
      iconType: 'zap',
      canClose: true,
    },
    {
      id: 'molecular-viewer',
      title: 'Moléculas 2D/3D',
      url: 'web://moleculas.quimica-3d.sci',
      route: '/molecular-viewer',
      iconType: 'molecular-viewer',
      canClose: true,
    },
  ]);

  const [activeTabId, setActiveTabId] = useState<string>('portal');
  const [omniboxInput, setOmniboxInput] = useState<string>('web://portal.espiquumeyria.internal');
  const [isOmniboxDropdownOpen, setIsOmniboxDropdownOpen] = useState<boolean>(false);
  const [isTaskManagerOpen, setIsTaskManagerOpen] = useState<boolean>(false);
  const [isCopiedUrl, setIsCopiedUrl] = useState<boolean>(false);
  const [isReloading, setIsReloading] = useState<boolean>(false);

  // Chrome 3-Dots Menu & Modals State (matching user screenshots)
  const [isChromeMenuOpen, setIsChromeMenuOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [settingsModalTab, setSettingsModalTab] = useState<'general' | 'ram' | 'cpu' | 'gpu' | 'rendering' | 'fps_ping'>('fps_ping');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isSiteControlsOpen, setIsSiteControlsOpen] = useState<boolean>(false);
  const [isDownloadsModalOpen, setIsDownloadsModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isInPageSearchOpen, setIsInPageSearchOpen] = useState<boolean>(false);
  const [inPageSearchQuery, setInPageSearchQuery] = useState<string>('');
  const [isIncognitoMode, setIsIncognitoMode] = useState<boolean>(false);
  const [isTabGridModalOpen, setIsTabGridModalOpen] = useState<boolean>(false);
  const [quickNotification, setQuickNotification] = useState<string | null>(null);

  const omniboxRef = useRef<HTMLDivElement>(null);
  const chromeMenuRef = useRef<HTMLDivElement>(null);

  // Sync active route with tabs and omnibox URL
  useEffect(() => {
    const path = location.pathname;
    let matchingInst = REGISTERED_INSTANCES.find(inst => path.startsWith(inst.route) && inst.route !== '/');
    
    if (path === '/' || path === '/hub') {
      setActiveTabId('portal');
      setOmniboxInput('web://portal.espiquumeyria.internal');
    } else if (matchingInst) {
      setActiveTabId(matchingInst.id);
      setOmniboxInput(matchingInst.virtualUrl + (location.search || ''));
      
      // Auto-add tab if not already present
      setTabs(prev => {
        if (!prev.some(t => t.id === matchingInst!.id)) {
          return [
            ...prev,
            {
              id: matchingInst!.id,
              title: matchingInst!.shortName,
              url: matchingInst!.virtualUrl,
              route: matchingInst!.route,
              iconType: matchingInst!.id,
              canClose: true,
            }
          ];
        }
        return prev;
      });
    }
  }, [location.pathname, location.search]);

  // Click outside listener for omnibox and 3-dots Chrome menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (omniboxRef.current && !omniboxRef.current.contains(e.target as Node)) {
        setIsOmniboxDropdownOpen(false);
      }
      if (chromeMenuRef.current && !chromeMenuRef.current.contains(e.target as Node)) {
        setIsChromeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setQuickNotification(msg);
    setTimeout(() => setQuickNotification(null), 3000);
  };

  const handleSelectTab = (tab: BrowserTab) => {
    setActiveTabId(tab.id);
    navigate(tab.route);
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (tabId === 'portal') return;

    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      const nextTab = newTabs[newTabs.length - 1] || newTabs[0];
      setActiveTabId(nextTab.id);
      navigate(nextTab.route);
    }
  };

  const handleOpenNewTab = () => {
    navigate('/');
    setActiveTabId('portal');
  };

  const handleReload = () => {
    setIsReloading(true);
    setTimeout(() => {
      setIsReloading(false);
    }, 600);
  };

  const handleOmniboxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOmniboxDropdownOpen(false);

    const val = omniboxInput.toLowerCase().trim();
    const found = REGISTERED_INSTANCES.find(inst => 
      val.includes(inst.id) || 
      val.includes(inst.shortName.toLowerCase()) || 
      val.includes(inst.domainName.toLowerCase()) ||
      val.includes(inst.route.replace('/', ''))
    );

    if (found) {
      navigate(found.route);
    } else if (val.includes('portal') || val.includes('home') || val === 'web://') {
      navigate('/');
    } else {
      navigate(`/periodic-table?search=${encodeURIComponent(val)}`);
    }
  };

  const handleCopyUrl = () => {
    const full = window.location.href;
    navigator.clipboard.writeText(full).then(() => {
      setIsCopiedUrl(true);
      setTimeout(() => setIsCopiedUrl(false), 2000);
    });
  };

  // 3-Dots Menu Handlers matching user screenshots
  const handleOpenSettings = (tab: 'general' | 'ram' | 'cpu' | 'gpu' | 'rendering' | 'fps_ping' = 'fps_ping') => {
    setIsChromeMenuOpen(false);
    setSettingsModalTab(tab);
    setIsSettingsModalOpen(true);
  };

  const handleClearBrowsingData = () => {
    setIsChromeMenuOpen(false);
    const freed = triggerGc();
    purgeGpuVram();
    showToast(`🧹 Caché y datos de navegación purgados (~${freed + 20} MB liberados de RAM).`);
  };

  const handleToggleDesktopSite = () => {
    const next = !settings.desktopSiteMode;
    updateSettings({ desktopSiteMode: next });
    showToast(next ? '💻 Modo Sitio para computadoras activado' : '📱 Modo Adaptable restaurado');
  };

  const handleZoomChange = (delta: number) => {
    const next = Math.min(150, Math.max(50, settings.zoomLevelPct + delta));
    updateSettings({ zoomLevelPct: next });
  };

  const handleDownloadPage = () => {
    setIsChromeMenuOpen(false);
    try {
      const activeObj = REGISTERED_INSTANCES.find(i => location.pathname.startsWith(i.route)) || {
        title: 'Espiquumeyria Browser Workspace',
        virtualUrl: 'web://espiquumeyria.internal',
      };
      const exportData = {
        app: 'Espiquumeyria Browser & Scientific Hub',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        virtualUrl: activeObj.virtualUrl,
        telemetry: {
          pingMs: pingDiag.currentPingMs,
          fpsCap: settings.maxFramerate,
          ramAllocation: settings.ramAllocationGB,
        },
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `espiquumeyria-page-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('📥 Página y estado del workspace descargados con éxito.');
    } catch (e) {
      showToast('Error al exportar página');
    }
  };

  const handleTranslate = () => {
    setIsChromeMenuOpen(false);
    showToast('🌐 Traducción técnica activa: Nomenclatura IUPAC en Español e Inglés');
  };

  const handleToggleReaderMode = () => {
    setIsChromeMenuOpen(false);
    const next = !settings.readerModeActive;
    updateSettings({ readerModeActive: next });
    showToast(next ? '📖 Modo de lectura activado' : 'Modo de lectura desactivado');
  };

  const getTabIcon = (iconType: string) => {
    switch (iconType) {
      case 'home':
      case 'portal':
        return <Home className="w-3.5 h-3.5 text-cyan-400" />;
      case 'flask':
      case 'workspace':
        return <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />;
      case 'atom':
      case 'atom-builder':
        return <Atom className="w-3.5 h-3.5 text-cyan-400" />;
      case 'zap':
      case 'physics-engine':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'astrophysics':
        return <Sun className="w-3.5 h-3.5 text-amber-300" />;
      case 'periodic-table':
        return <Atom className="w-3.5 h-3.5 text-blue-400" />;
      case 'chat':
        return <span className="sparkle-gradient font-bold text-xs">✦</span>;
      case 'chat-inorganica':
        return <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />;
      case 'chat-organica':
        return <Dna className="w-3.5 h-3.5 text-emerald-400" />;
      case 'chat-cuantica-astrofisica':
        return <Atom className="w-3.5 h-3.5 text-purple-400" />;
      case 'professor':
        return <Bot className="w-3.5 h-3.5 text-purple-400" />;
      case 'regulations':
        return <Truck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'metallurgy':
      case 'flame':
        return <Flame className="w-3.5 h-3.5 text-amber-500" />;
      case 'molecular-viewer':
      case 'molecules':
        return <Boxes className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Boxes className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const activeWeb = REGISTERED_INSTANCES.find(inst => location.pathname.startsWith(inst.route) && inst.route !== '/');
  const isAtPortal = location.pathname === '/' || location.pathname === '/hub';
  const isChat = location.pathname.startsWith('/chat') || location.pathname.startsWith('/professor');

  return (
    <div className={`${isChat ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen'} bg-[#070c14] text-slate-100 flex flex-col font-sans select-none ${
      settings.desktopSiteMode ? 'min-w-[1080px]' : ''
    }`}>
      
      {/* Toast Notification */}
      {quickNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0d1624] border border-cyan-500/50 text-cyan-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5 font-mono text-xs">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{quickNotification}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. NAVEGADOR WEB PRINCIPAL: TÍTULO DE VENTANA & SISTEMA DE PESTAÑAS      */}
      {/* ========================================================================= */}
      <header className="bg-[#05080e] border-b border-slate-800/90 pt-1.5 px-2 select-none sticky top-0 z-50">
        
        {/* Top Window Strip (OS Title bar) */}
        <div className="flex items-center justify-between pb-1.5 px-2 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block hover:opacity-100 cursor-pointer" title="Cerrar navegador" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block hover:opacity-100 cursor-pointer" title="Minimizar instancias" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block hover:opacity-100 cursor-pointer" title="Pantalla completa" />
            </div>

            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <span className="text-cyan-400 font-extrabold tracking-wider">ESPIQUUMEYRIA BROWSER</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400 font-normal">Navegador Web Cuántico & Ajustes de Hardware</span>
            </span>

            {isIncognitoMode && (
              <span className="bg-purple-950/80 border border-purple-500/40 text-purple-300 px-2 py-0.2 rounded-full text-[10px] font-bold">
                🕵 MODO INCÓGNITO
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Live Ping Chip */}
            <button
              onClick={() => handleOpenSettings('fps_ping')}
              className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 transition cursor-pointer"
              title="Ping en tiempo real (Clic para optimizar)"
            >
              <Wifi className="w-3 h-3" />
              <span>Ping: {pingDiag.currentPingMs} ms</span>
            </button>

            <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              <ShieldCheck className="w-3 h-3" /> Microservicios Aislados
            </span>
          </div>
        </div>

        {/* Tabs Bar (Pestañas del Navegador Web) */}
        <div className="flex items-end gap-1 overflow-x-auto scrollbar-none pt-1">
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => handleSelectTab(tab)}
                className={`group flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-t-lg transition border-t border-x cursor-pointer max-w-[210px] shrink-0 ${
                  isActive
                    ? 'bg-[#0d1522] border-slate-700/80 text-cyan-300 font-semibold shadow-md'
                    : 'bg-[#070b12] border-transparent text-slate-400 hover:bg-[#0a1019] hover:text-slate-200'
                }`}
                title={`${tab.title} (${tab.url})`}
              >
                {getTabIcon(tab.iconType)}
                <span className="truncate flex-1 text-[11px]">{tab.title}</span>
                {tab.canClose && (
                  <button
                    onClick={(e) => handleCloseTab(e, tab.id)}
                    className="opacity-40 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded transition"
                    title="Cerrar pestaña"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* New Tab Button */}
          <button
            onClick={handleOpenNewTab}
            className="p-1.5 mb-0.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 rounded-md transition cursor-pointer"
            title="Abrir nueva pestaña en el Portal de Instancias"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. BARRA DE CONTROL DEL NAVEGADOR (NAVBAR & OMNIBOX URL)                   */}
        {/* ========================================================================= */}
        <div className="bg-[#0d1522] border-t border-slate-800/80 px-3 py-2 flex items-center justify-between gap-2.5 shadow-sm">
          
          {/* Navigation Controls: Back, Forward, Reload, Home */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              title="Atrás"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(1)}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              title="Adelante"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleReload}
              className={`p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer ${
                isReloading ? 'animate-spin text-cyan-400' : ''
              }`}
              title="Recargar esta web"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/')}
              className={`p-1.5 rounded hover:bg-slate-800 transition cursor-pointer ${
                isAtPortal ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-white'
              }`}
              title="Ir al Portal de Instancias (Página Principal del Navegador)"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>

          {/* Omnibox / Barra de Direcciones URL */}
          <div ref={omniboxRef} className="flex-1 max-w-3xl relative">
            <form onSubmit={handleOmniboxSubmit} className="relative flex items-center">
              <div className="absolute left-3 flex items-center gap-1.5 text-cyan-400 pointer-events-none">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] uppercase font-mono font-bold bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20 text-emerald-300">
                  SECURE
                </span>
              </div>

              <input
                type="text"
                value={omniboxInput}
                onChange={(e) => setOmniboxInput(e.target.value)}
                onFocus={() => setIsOmniboxDropdownOpen(true)}
                className="w-full bg-[#070b12] border border-slate-700/80 hover:border-slate-600 focus:border-cyan-500 text-slate-200 text-xs font-mono pl-24 pr-24 py-1.5 rounded-lg outline-none transition shadow-inner"
                placeholder="Escribe la URL de una web científica o busca reactivos..."
              />

              <div className="absolute right-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="p-1 text-slate-400 hover:text-cyan-300 transition cursor-pointer"
                  title="Copiar URL al portapapeles"
                >
                  {isCopiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="submit"
                  className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded hover:bg-cyan-500/30 transition cursor-pointer"
                >
                  IR
                </button>
              </div>
            </form>

            {/* Omnibox Autocomplete Dropdown */}
            {isOmniboxDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#090f19] border border-slate-700 rounded-lg shadow-2xl p-2 z-50 animate-in fade-in max-h-80 overflow-y-auto">
                <div className="text-[10px] font-mono uppercase text-slate-400 px-2 py-1 font-semibold flex items-center justify-between">
                  <span>Webs Científicas que habitan el Navegador (7 Instancias)</span>
                  <span className="text-cyan-400 text-[9px]">Aislamiento de Microservicios</span>
                </div>

                <div className="grid grid-cols-1 gap-1 mt-1">
                  <button
                    onClick={() => {
                      navigate('/');
                      setIsOmniboxDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-cyan-950/40 border border-transparent hover:border-cyan-500/30 flex items-center justify-between transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div className="text-xs font-semibold text-slate-200">Portal de Instancias (Navegador Principal)</div>
                        <div className="text-[10px] font-mono text-cyan-400">web://portal.espiquumeyria.internal</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">HOME HUB</span>
                  </button>

                  {REGISTERED_INSTANCES.map((inst) => (
                    <button
                      key={inst.id}
                      onClick={() => {
                        navigate(inst.route);
                        setIsOmniboxDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-800/60 border border-transparent hover:border-slate-700 flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {getTabIcon(inst.id)}
                        <div>
                          <div className="text-xs font-semibold text-slate-200">{inst.title}</div>
                          <div className="text-[10px] font-mono text-slate-400">{inst.virtualUrl}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {inst.badgeTag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Browser System Controls: Task Manager, Direct Settings, Share, 3-Dots */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Task Manager Chip */}
            <button
              onClick={() => setIsTaskManagerOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#070b12] border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-[11px] font-mono transition cursor-pointer"
              title="Administrador de Tareas y Microservicios del Navegador (GPU/SPU)"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">SPU: {telemetry.spuAllocatedPct}%</span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className={telemetry.activeWebGlContexts > 0 ? "text-amber-400 font-bold" : "text-emerald-400"}>
                {telemetry.activeWebGlContexts > 0 ? '1 WebGL 3D' : 'GPU Reposo'}
              </span>
            </button>

            {/* Direct Settings Shortcut Button */}
            <button
              onClick={() => handleOpenSettings('fps_ping')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition cursor-pointer"
              title="Abrir Sistema de Ajustes (RAM, GPU, CPU, Render, FPS y Ping)"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Ajustes</span>
            </button>

            {/* Share Deep Link */}
            <button
              onClick={onOpenShareModal}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Compartir enlace profundo de esta web"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Emergency Drill Game */}
            <button
              onClick={onOpenGameModal}
              className="px-2.5 py-1 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer"
              title="Simulacro de Emergencia Química"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Simulacro</span>
            </button>

            {/* User Session */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-[#070b12] border border-slate-700 px-2 py-1 rounded-lg text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-300 text-[11px] max-w-[80px] truncate hidden md:inline">
                  {currentUser.displayName || currentUser.email}
                </span>
                <button
                  onClick={onLogout}
                  className="text-slate-500 hover:text-rose-400 ml-1 transition"
                  title="Cerrar sesión"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="px-2 py-1 text-xs font-mono text-slate-300 hover:text-white bg-slate-800 border border-slate-700 rounded-lg transition cursor-pointer"
              >
                Login
              </button>
            )}

            {/* Android Chrome Style Tab Count & Grid Button [ 3 ] */}
            <button
              onClick={() => setIsTabGridModalOpen(true)}
              className="w-7 h-7 rounded-lg border border-slate-700/80 hover:border-cyan-400 bg-[#070b12] hover:bg-slate-800 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center transition cursor-pointer shadow-inner active:scale-95"
              title="Abrir cuadrícula de pestañas abiertas"
            >
              {tabs.length}
            </button>

            {/* =================================================================== */}
            {/* 3-DOTS MORE OPTIONS BUTTON & MENU (MATCHING USER SCREENSHOTS)       */}
            {/* =================================================================== */}
            <div className="relative" ref={chromeMenuRef}>
              <button
                onClick={() => setIsChromeMenuOpen(!isChromeMenuOpen)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isChromeMenuOpen
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Personaliza y controla el navegador (Ajustes y Opciones)"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* POPUP MENU AS IN SCREENSHOTS */}
              {isChromeMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-[#161d28] border border-slate-700/90 rounded-2xl shadow-2xl py-2 z-50 text-slate-200 text-xs font-sans animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto">
                  
                  {/* Top Section (from Screenshot 2) */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleOpenNewTab();
                        setIsChromeMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 hover:bg-slate-800/80 flex items-center gap-3 transition text-left cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-slate-400" />
                      <span>Nueva pestaña</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsChromeMenuOpen(false);
                        setIsTabGridModalOpen(true);
                      }}
                      className="w-full px-4 py-2 hover:bg-slate-800/80 flex items-center gap-3 transition text-left cursor-pointer text-cyan-300"
                    >
                      <LayoutGrid className="w-4 h-4 text-cyan-400" />
                      <span>Cuadrícula de pestañas ({tabs.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsChromeMenuOpen(false);
                        showToast('🗂️ Pestaña agrupada en Espiquumeyria Space');
                      }}
                      className="w-full px-4 py-2 hover:bg-slate-800/80 flex items-center gap-3 transition text-left cursor-pointer"
                    >
                      <FolderPlus className="w-4 h-4 text-slate-400" />
                      <span>Agregar pestaña a un grupo nuevo</span>
                    </button>

                    <button
                      onClick={() => {
                        window.open(window.location.href, '_blank');
                        setIsChromeMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 hover:bg-slate-800/80 flex items-center gap-3 transition text-left cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                      <span>Nueva ventana</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsIncognitoMode(!isIncognitoMode);
                        setIsChromeMenuOpen(false);
                        showToast(!isIncognitoMode ? '🕵 Navegación de incógnito activada' : 'Modo incógnito desactivado');
                      }}
                      className="w-full px-4 py-2 hover:bg-slate-800/80 flex items-center gap-3 transition text-left cursor-pointer text-purple-300"
                    >
                      <Shield className="w-4 h-4 text-purple-400" />
                      <span>{isIncognitoMode ? 'Salir de modo incógnito' : 'Nueva ventana de Incógnito'}</span>
                    </button>
                  </div>

                  <div className="h-px bg-slate-800 my-1" />

                  {/* History, Cache, Site controls */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsChromeMenuOpen(false);
                        setIsHistoryModalOpen(true);
                      }}
                      className="w-full px-4 py-2 hover:bg-slate-800/80 flex items-center gap-3 transition text-left cursor-pointer"
                    >
                      <History className="w-4 h-4 text-slate-400" />
                      <span>Historial</span>
                    </button>

                    <button
                      onClick={handleClearBrowsingData}
                      className="w-full px-4 py-2 hover:bg-slate-800/80 flex items-center gap-3 transition text-left cursor-pointer text-rose-300"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                      <span>Borrar datos de navegación</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsChromeMenuOpen(false);
                        setIsSiteControlsOpen(true);
                      }}
                      className="w-full px-4 py-2 hover:bg-slate-800/80 flex items-center gap-3 transition text-left cursor-pointer"
                    >
                      <Sliders className="w-4 h-4 text-slate-400" />
                      <span>Controles de sitios</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsChromeMenuOpen(false);
                        setIsDownloadsModalOpen(true);
                      }}
                      className="w-full px-4 py-2 hover:bg-slate-800/80 flex items-center gap-3 transition text-left cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-slate-400" />
                      <span>Descargas</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsChromeMenuOpen(false);
                        showToast('⭐ Pestaña agregada a Favoritos Cuánticos');
                      }}
                      className="w-full px-4 py-2 hover:bg-slate-800/80 flex items-center gap-3 transition text-left cursor-pointer"
                    >
                      <Star className="w-4 h-4 text-amber-400" />
                      <span>Favoritos</span>
                    </button>
                  </div>

                  <div className="h-px bg-slate-800 my-1" />

                  {/* Bottom Section (from Screenshot 1): Zoom, Compartir, Descargar, etc. */}
                  <div className="py-1">
                    
                    {/* Zoom row from Screenshot 1 */}
                    <div className="px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-slate-300">
                        <Search className="w-4 h-4 text-slate-400" />
                        <span>Zoom</span>
                      </div>
                      <div className="flex items-center gap-2 bg-[#090e17] px-2 py-0.5 rounded-lg border border-slate-700">
                        <button
                          onClick={() => handleZoomChange(-10)}
                          className="text-slate-300 hover:text-white px-1 text-sm font-bold cursor-pointer"
                          title="Reducir zoom"
                        >
                          −
                        </button>
                        <span className="text-xs font-mono font-bold text-cyan-300 min-w-[36px] text-center">
                          {settings.zoomLevelPct}%
                        </span>
                        <button
                          onClick={() => handleZoomChange(10)}
                          className="text-slate-300 hover:text-white px-1 text-sm font-bold cursor-pointer"
                          title="Aumentar zoom"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsChromeMenuOpen(false);
                        onOpenShareModal();
                      }}
                      className="w-full px-4 py-2 hover:bg-slate-800/80 flex items-center gap-3 transition text-left cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-slate-400" />
                      <span>Compartir...</span>
                    </button>

                    <button
                      onClick={handleDownloadPage}
                      className="w-full px-4 py-2 hover:bg-slate-800/80 flex items-center gap-3 transition text-left cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-slate-400" />
                      <span>Descargar página</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsChromeMenuOpen(false);
                        setIsInPageSearchOpen(true);
                      }}
                      className="w-full px-4 py-2 hover:bg-slate-800/80 flex items-center gap-3 transition text-left cursor-pointer"
                    >
                      <Search className="w-4 h-4 text-slate-400" />
                      <span>Buscar en la página</span>
                    </button>

                    <button
                      onClick={handleTranslate}
                      className="w-full px-4 py-2 hover:bg-slate-800/80 flex items-center gap-3 transition text-left cursor-pointer"
                    >
                      <Languages className="w-4 h-4 text-slate-400" />
                      <span>Traducir...</span>
                    </button>

                    <button
                      onClick={handleToggleReaderMode}
                      className="w-full px-4 py-2 hover:bg-slate-800/80 flex items-center gap-3 transition text-left cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      <span>{settings.readerModeActive ? 'Ocultar Modo de lectura' : 'Mostrar el Modo de lectura'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsChromeMenuOpen(false);
                        showToast('📱 Acceso directo creado en pantalla');
                      }}
                      className="w-full px-4 py-2 hover:bg-slate-800/80 flex items-center gap-3 transition text-left cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-slate-400" />
                      <span>Instalar y crear acceso directo</span>
                    </button>

                    {/* Sitio para computadoras with checkbox */}
                    <button
                      onClick={handleToggleDesktopSite}
                      className="w-full px-4 py-2 hover:bg-slate-800/80 flex items-center justify-between transition text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Monitor className="w-4 h-4 text-slate-400" />
                        <span>Sitio para computadoras</span>
                      </div>
                      {settings.desktopSiteMode ? (
                        <CheckSquare className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  </div>

                  <div className="h-px bg-slate-800 my-1" />

                  {/* Configuración (Settings) & Ayuda */}
                  <div className="py-1">
                    <button
                      onClick={() => handleOpenSettings('fps_ping')}
                      className="w-full px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 font-semibold flex items-center justify-between transition text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="w-4 h-4 text-cyan-400" />
                        <span>Configuración (Ajustes)</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                        RAM • GPU • FPS
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setIsChromeMenuOpen(false);
                        setIsHelpModalOpen(true);
                      }}
                      className="w-full px-4 py-2 hover:bg-slate-800/80 flex items-center gap-3 transition text-left cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      <span>Ayuda y comentarios</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. BARRA DE MARCADORES (BOOKMARKS BAR: LAS WEBS QUE HABITAN EL NAVEGADOR)  */}
        {/* ========================================================================= */}
        <div className="bg-[#090e17] border-t border-slate-800/60 px-3 py-1 flex items-center justify-between text-xs font-mono text-slate-400 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              ⭐ Webs:
            </span>

            {/* Portal Bookmark */}
            <button
              onClick={() => navigate('/')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition text-[11px] font-medium cursor-pointer ${
                isAtPortal ? 'bg-cyan-500/25 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm' : 'hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span>Portal Principal</span>
            </button>

            <span className="text-slate-700">|</span>

            {/* Grupo 1: Chat de IA Científica Unificado (Espiqumeyria AI) */}
            <div className="flex items-center gap-1 bg-[#050810]/70 p-0.5 rounded-lg border border-slate-800/80">
              <button
                onClick={() => navigate('/chat')}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded transition text-[11px] whitespace-nowrap cursor-pointer ${
                  location.pathname.startsWith('/chat')
                    ? 'bg-sky-500/30 text-sky-200 font-bold border border-sky-500/50 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="sparkle-gradient font-bold text-xs">✦</span>
                <span className="text-sky-300 font-semibold">Espiqumeyria AI</span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Gemini
                </span>
              </button>
            </div>

            <span className="text-slate-700">|</span>

            {/* Grupo 2: Laboratorios y Herramientas */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold px-1 hidden md:inline">
                🔬 Labs:
              </span>
              {REGISTERED_INSTANCES.filter(inst => inst.id !== 'chat' && !inst.id.startsWith('chat-')).map((inst) => {
                const isActive = location.pathname.startsWith(inst.route);
                return (
                  <button
                    key={inst.id}
                    onClick={() => navigate(inst.route)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded transition text-[11px] whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                        : 'hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {getTabIcon(inst.id)}
                    <span>{inst.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden 2xl:flex items-center gap-2 text-[10px] text-slate-500">
            <span>Aislamiento de GPU/SPU: Activo</span>
            <span>•</span>
            <span className="text-cyan-400">FPS: {settings.maxFramerate}</span>
            <span>•</span>
            <span className="text-emerald-400">Ping: {pingDiag.currentPingMs}ms</span>
          </div>
        </div>

        {/* In-Page Quick Search Bar */}
        {isInPageSearchOpen && (
          <div className="bg-[#0b121f] border-t border-cyan-500/40 px-4 py-2 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-cyan-400" />
              <input
                type="text"
                autoFocus
                value={inPageSearchQuery}
                onChange={(e) => setInPageSearchQuery(e.target.value)}
                placeholder="Buscar texto en la página..."
                className="w-full bg-[#070b12] border border-slate-700 px-3 py-1 rounded text-slate-200 text-xs outline-none focus:border-cyan-400"
              />
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>{inPageSearchQuery ? 'Resultados activos' : 'Escribe para filtrar'}</span>
              <button
                onClick={() => setIsInPageSearchOpen(false)}
                className="p-1 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 4. SANDBOX BREADCRUMB / SITIO WEB ACTIVO                                   */}
      {/* ========================================================================= */}
      {!isAtPortal && activeWeb && (
        <div className="bg-[#0b121e]/90 border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-xs font-mono shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30 transition cursor-pointer"
            >
              <Home className="w-3 h-3" />
              <span>← Portal Navegador</span>
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">Web en Ejecución:</span>
            <span className="text-slate-200 font-semibold flex items-center gap-1.5">
              {getTabIcon(activeWeb.id)}
              {activeWeb.title}
            </span>
            <span className="text-[10px] text-cyan-400 font-normal">({activeWeb.virtualUrl})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenSettings('gpu')}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 transition cursor-pointer"
              title="Ajustar GPU para este proceso"
            >
              Proceso GPU: {activeWeb.gpuTier}
            </button>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/30 text-cyan-300">
              Sandbox Activo
            </span>
          </div>
        </div>
      )}

      <main className={`flex-1 flex flex-col min-h-0 ${isChat ? 'h-full overflow-hidden' : ''} ${settings.readerModeActive ? 'max-w-4xl mx-auto py-8 text-base leading-relaxed' : ''}`}>
        {children}
      </main>

      {/* ========================================================================= */}
      {/* 6. MODAL: SISTEMA DE AJUSTES (RAM, CPU, GPU, RENDER, FPS, PING ANTI-LAG)   */}
      {/* ========================================================================= */}
      <SystemSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        initialTab={settingsModalTab}
      />

      {/* ========================================================================= */}
      {/* 7. MODAL: HISTORIAL DE NAVEGACIÓN                                         */}
      {/* ========================================================================= */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1522] border border-cyan-500/40 rounded-xl max-w-lg w-full p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                Historial de Navegación del Navegador
              </h3>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {REGISTERED_INSTANCES.map((inst, i) => (
                <div key={inst.id} className="p-2.5 rounded-lg bg-[#070b12] border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200">{inst.title}</div>
                    <div className="text-[10px] text-cyan-400">{inst.virtualUrl}</div>
                  </div>
                  <button
                    onClick={() => {
                      navigate(inst.route);
                      setIsHistoryModalOpen(false);
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-cyan-500 hover:text-black rounded text-[11px] font-bold transition"
                  >
                    Abrir
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <button
                onClick={handleClearBrowsingData}
                className="text-rose-400 hover:underline text-[11px]"
              >
                Borrar historial completo
              </button>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-3 py-1 bg-slate-800 rounded text-slate-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: CONTROLES DE SITIOS & PERMISOS                                  */}
      {/* ========================================================================= */}
      {isSiteControlsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1522] border border-cyan-500/40 rounded-xl max-w-md w-full p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Controles de Sitios y Permisos de Hardware
              </h3>
              <button onClick={() => setIsSiteControlsOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#070b12] border border-slate-800">
                <span>Aceleración WebGL 3D por Hardware</span>
                <span className="text-emerald-400 font-bold">PERMITIDO</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#070b12] border border-slate-800">
                <span>Síntesis de Voz del Profesor IA</span>
                <span className="text-cyan-400 font-bold">ACTIVO</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#070b12] border border-slate-800">
                <span>Almacenamiento Local de Ajustes</span>
                <span className="text-emerald-400 font-bold">SINCRONIZADO</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#070b12] border border-slate-800">
                <span>Buffer Anti-Lag de Red</span>
                <span className="text-amber-400 font-bold">OPTIMIZADO</span>
              </div>
            </div>
            <button
              onClick={() => setIsSiteControlsOpen(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. MODAL: CENTRO DE DESCARGAS                                            */}
      {/* ========================================================================= */}
      {isDownloadsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1522] border border-cyan-500/40 rounded-xl max-w-md w-full p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Download className="w-4 h-4 text-cyan-400" />
                Descargas y Exportación Científica
              </h3>
              <button onClick={() => setIsDownloadsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-slate-400">
              Exporta los estados del laboratorio, matrices de riesgo ADR y reportes estequiométricos:
            </p>
            <div className="space-y-2">
              <button
                onClick={handleDownloadPage}
                className="w-full p-2.5 rounded-lg bg-[#070b12] hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-left"
              >
                <span>Descargar Estado Actual (.json)</span>
                <Download className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
            <button
              onClick={() => setIsDownloadsModalOpen(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. MODAL: AYUDA Y DIAGNÓSTICO                                            */}
      {/* ========================================================================= */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1522] border border-cyan-500/40 rounded-xl max-w-lg w-full p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                Ayuda del Navegador & Sistema de Ajustes
              </h3>
              <button onClick={() => setIsHelpModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 text-slate-300">
              <p>
                <strong>¿Cómo mejorar los FPS y el Ping?</strong><br />
                Haz clic en el botón de 3 puntos `⋮` o en "⚙️ Ajustes" en la barra de navegación. En la pestaña <strong>FPS & Anti-Lag Ping</strong>, pulsa <strong>⚡ TURBO CERO LAG</strong> para activar instantáneamente la configuración recomendada para eliminar el retardo.
              </p>
              <p>
                <strong>Ajustes de RAM y Memoria:</strong><br />
                Si notas ralentización, pulsa <strong>Purgar VRAM</strong> para liberar las texturas 3D del motor cuántico.
              </p>
            </div>
            <button
              onClick={() => {
                setIsHelpModalOpen(false);
                handleOpenSettings('fps_ping');
              }}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg font-bold"
            >
              Abrir Ajustes Ahora
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. TASK MANAGER MODAL (GPU/SPU)                                          */}
      {/* ========================================================================= */}
      {isTaskManagerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a101b] border border-cyan-500/40 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#05080e] border-b border-slate-800 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
                    Administrador de Tareas del Navegador Web
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30 font-normal">
                      v5.0 HARDWARE METRICS
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Control de microservicios, optimización GPU/SPU y eliminación de redundancias
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTaskManagerOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto font-mono text-xs">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-[#0d1624] border border-slate-800 p-3 rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">SPU Allocada</div>
                  <div className="text-lg font-bold text-cyan-400 mt-1">{telemetry.spuAllocatedPct}%</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Asignación dinámica</div>
                </div>

                <div className="bg-[#0d1624] border border-slate-800 p-3 rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Contextos WebGL</div>
                  <div className="text-lg font-bold text-amber-400 mt-1">
                    {telemetry.activeWebGlContexts} Activo <span className="text-xs font-normal text-slate-400">(Máx 1)</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Sin colisiones de GPU</div>
                </div>

                <div className="bg-[#0d1624] border border-slate-800 p-3 rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">FPS & Ping</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">
                    {settings.maxFramerate} FPS <span className="text-xs font-normal text-slate-400">/ {pingDiag.currentPingMs}ms</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Optimizador activo</div>
                </div>

                <div className="bg-[#0d1624] border border-slate-800 p-3 rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">VRAM Purge</div>
                  <button
                    onClick={() => {
                      purgeGpuVram();
                      triggerGc();
                      showToast('VRAM purgada con éxito');
                    }}
                    className="mt-1 w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded py-1 px-2 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Purgar Memoria
                  </button>
                  <div className="text-[9px] text-slate-500 mt-0.5 text-center">Libera texturas WebGL</div>
                </div>
              </div>

              {/* Table of Web Microservice Processes */}
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <div className="bg-[#080d15] px-3 py-2 text-[11px] text-slate-400 uppercase font-bold border-b border-slate-800 flex items-center justify-between">
                  <span>Procesos Web Científicos Aislados</span>
                  <span>Consumo GPU / SPU</span>
                </div>
                <div className="divide-y divide-slate-800/80">
                  {REGISTERED_INSTANCES.map((inst) => {
                    const isRunning = location.pathname.startsWith(inst.route);
                    return (
                      <div key={inst.id} className="p-3 bg-[#0a101b] hover:bg-[#0c1422] transition flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-md ${
                            inst.gpuTier === 'heavy_webgl' ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'
                          }`}>
                            {getTabIcon(inst.id)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-200 flex items-center gap-2">
                              {inst.title}
                              <span className="text-[10px] text-slate-500 font-normal">({inst.virtualUrl})</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {inst.serviceCategory} • {inst.activeFeatures.join(' • ')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              isRunning
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {isRunning ? '🟢 ACTIVO EN PANTALLA' : '⚪ EN REPOSO'}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {inst.gpuTier === 'heavy_webgl' ? 'WebGL 3D (60 FPS)' : 'DOM / Canvas 2D'}
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              navigate(inst.route);
                              setIsTaskManagerOpen(false);
                            }}
                            className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-cyan-500 hover:text-black rounded text-slate-200 font-bold transition cursor-pointer"
                          >
                            Ir a Web
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-[#05080e] border-t border-slate-800 px-5 py-3 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsTaskManagerOpen(false);
                  handleOpenSettings('fps_ping');
                }}
                className="px-4 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono rounded-lg transition"
              >
                Abrir Ajustes Avanzados
              </button>

              <button
                onClick={() => setIsTaskManagerOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg transition"
              >
                Cerrar Administrador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CUADRÍCULA DE PESTAÑAS (TAB GRID VIEW - CHROME ANDROID STYLE)             */}
      {/* ========================================================================= */}
      {isTabGridModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-4xl bg-[#090f19] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 bg-[#060a12] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                    <span>Cuadrícula de Pestañas</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
                      {tabs.length} abiertas
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Vista previa y cambio rápido de instancias científicas del navegador
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenNewTab();
                    setIsTabGridModalOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono transition flex items-center gap-1.5 cursor-pointer shadow active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva Pestaña</span>
                </button>
                <button
                  onClick={() => setIsTabGridModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Grid of Tabs */}
            <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {tabs.map((tab) => {
                const isActive = activeTabId === tab.id;
                return (
                  <div
                    key={tab.id}
                    onClick={() => {
                      handleSelectTab(tab);
                      setIsTabGridModalOpen(false);
                    }}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between group relative ${
                      isActive
                        ? 'bg-[#0e1726] border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                        : 'bg-[#070b12] border-slate-800 hover:border-slate-700 hover:bg-[#0a101a]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 truncate">
                          <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                            {getTabIcon(tab.iconType)}
                          </div>
                          <div className="truncate">
                            <h4 className="text-xs font-bold text-white truncate max-w-[160px]">
                              {tab.title}
                            </h4>
                            <span className="text-[10px] font-mono text-cyan-400 block truncate max-w-[160px]">
                              {tab.url}
                            </span>
                          </div>
                        </div>

                        {tab.canClose && (
                          <button
                            onClick={(e) => {
                              handleCloseTab(e, tab.id);
                            }}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
                            title="Cerrar pestaña"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="h-20 rounded-lg bg-[#04070d] border border-slate-800/80 p-2.5 flex flex-col justify-center items-center text-center">
                        <span className="text-[11px] text-slate-400 font-mono">
                          {tab.id === 'portal' && '🌐 Portal de instancias y catálogo'}
                          {tab.id === 'atom-builder' && '⚛️ Constructor 3D y nubes |ψ|²'}
                          {tab.id === 'physics-engine' && '⚡ Motor dinámico Verlet y Lorentz'}
                          {tab.id === 'astrophysics' && '⭐ Fusión estelar y ciclo CNO'}
                          {tab.id === 'periodic-table' && '🧪 Tabla periódica 118 elementos'}
                          {tab.id === 'professor' && '🎓 Tutoría del Profesor IA'}
                          {tab.id === 'regulations' && '🛡️ Normativas ADR y seguridad NFPA'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                      <span className={isActive ? 'text-cyan-300 font-bold flex items-center gap-1' : 'text-slate-500'}>
                        {isActive ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                            <span>Activa</span>
                          </>
                        ) : (
                          'Segundo plano'
                        )}
                      </span>
                      <span className="text-slate-400 group-hover:text-cyan-300 transition font-bold">
                        Abrir ➔
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
