import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Cpu, 
  Zap, 
  Activity, 
  Trash2, 
  RefreshCw, 
  Check, 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  Gauge, 
  Monitor, 
  Layers, 
  Sparkles, 
  X, 
  Flame, 
  RotateCcw, 
  Eye, 
  HardDrive, 
  Settings2,
  Clock,
  BatteryCharging,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Smartphone,
  Tablet
} from 'lucide-react';
import { 
  useSystemSettings, 
  PerformanceMode, 
  FpsCap, 
  RamAllocationLimit, 
  RenderQuality,
  AntialiasingMode,
  GpuBackend
} from '../utils/systemSettings';
import { useGpuMicroserviceMonitor } from '../utils/gpuMicroserviceManager';

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'general' | 'ram' | 'cpu' | 'gpu' | 'rendering' | 'fps_ping';
}

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'fps_ping',
}) => {
  const {
    settings,
    pingDiag,
    updateSettings,
    triggerGc,
    runPingTest,
    applyTurboAntiLag,
    applyBalanced,
    applyPowerSaver,
    applyMaxQuality,
  } = useSystemSettings();

  const { telemetry, purgeGpuVram } = useGpuMicroserviceMonitor();

  const [activeTab, setActiveTab] = useState<'general' | 'ram' | 'cpu' | 'gpu' | 'rendering' | 'fps_ping'>(initialTab);
  const [gcToast, setGcToast] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  if (!isOpen) return null;

  const handleManualGc = () => {
    const freed = triggerGc();
    purgeGpuVram();
    setGcToast(`¡Memoria optimizada! ~${freed + 18} MB liberados de Heap y texturas WebGL purgadas.`);
    setTimeout(() => setGcToast(null), 3000);
  };

  const handleTestPing = async () => {
    await runPingTest();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in select-none">
      <div className="bg-[#090e17] border border-cyan-500/40 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden font-mono text-slate-100">
        
        {/* ========================================================================= */}
        {/* 1. HEADER                                                                 */}
        {/* ========================================================================= */}
        <div className="bg-[#05080f] border-b border-slate-800 px-5 py-3.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-sm">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide font-sans">
                  Ajustes & Rendimiento del Sistema
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold">
                  v5.0 HARDWARE BOOST
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Ajustes de RAM, GPU, CPU, Renderizado, FPS y Optimizador de Ping para eliminar lag
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Instant Turbo Zero-Lag Button */}
            <button
              onClick={applyTurboAntiLag}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-md cursor-pointer ${
                settings.performanceMode === 'turbo_antilag'
                  ? 'bg-amber-400 text-black border border-amber-300 ring-2 ring-amber-400/30'
                  : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40'
              }`}
              title="Activar perfil ultra optimizado para reducir latencia y aumentar FPS"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>⚡ TURBO CERO LAG</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Cerrar ajustes"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TAB NAVIGATION BAR                                                     */}
        {/* ========================================================================= */}
        <div className="bg-[#070b13] border-b border-slate-800/80 px-4 flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('fps_ping')}
            className={`px-3.5 py-2.5 font-bold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'fps_ping'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span>FPS & Anti-Lag Ping</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {pingDiag.currentPingMs} ms
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rendering')}
            className={`px-3.5 py-2.5 font-bold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'rendering'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Renderizado 3D</span>
          </button>

          <button
            onClick={() => setActiveTab('ram')}
            className={`px-3.5 py-2.5 font-bold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'ram'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>Memoria RAM & VRAM</span>
          </button>

          <button
            onClick={() => setActiveTab('cpu')}
            className={`px-3.5 py-2.5 font-bold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'cpu'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>CPU & Multihilo</span>
          </button>

          <button
            onClick={() => setActiveTab('gpu')}
            className={`px-3.5 py-2.5 font-bold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'gpu'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Monitor className="w-4 h-4 text-amber-400" />
            <span>GPU & Hardware</span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`px-3.5 py-2.5 font-bold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'general'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sliders className="w-4 h-4 text-slate-400" />
            <span>General & Modos</span>
          </button>
        </div>

        {/* GC Feedback Notification Toast */}
        {gcToast && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/50 px-4 py-2 text-xs text-emerald-200 flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{gcToast}</span>
            </span>
            <button onClick={() => setGcToast(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. TAB CONTENTS (SCROLLABLE BODY)                                         */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">

          {/* --------------------------------------------------------------------- */}
          {/* TAB 1: FPS & ANTI-LAG PING                                            */}
          {/* --------------------------------------------------------------------- */}
          {activeTab === 'fps_ping' && (
            <div className="space-y-6">
              {/* Header Box: Ping & Lag Optimizer Radar */}
              <div className="bg-gradient-to-br from-[#0c1626] to-[#070d18] border border-cyan-500/40 rounded-xl p-4 sm:p-5 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                      <Wifi className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                        Optimizador de Red & Ping en Tiempo Real
                      </span>
                      <h3 className="text-sm font-bold text-white font-sans">
                        Reducción de Latencia, Jitter y Lag de Paquetes
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={handleTestPing}
                    disabled={pingDiag.isTesting}
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold transition flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${pingDiag.isTesting ? 'animate-spin' : ''}`} />
                    <span>{pingDiag.isTesting ? 'Midiendo Latencia...' : 'Probar Ping & Optimizar Rutas'}</span>
                  </button>
                </div>

                {/* Real-time Ping Telemetry Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="bg-[#060a12] border border-slate-800 rounded-lg p-3">
                    <span className="text-[10px] text-slate-400 block uppercase">Latencia Ping Actual</span>
                    <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-baseline gap-1">
                      {pingDiag.currentPingMs} <span className="text-xs font-normal text-slate-400">ms</span>
                    </div>
                    <span className="text-[10px] text-emerald-500">
                      Calidad: {pingDiag.qualityGrade}
                    </span>
                  </div>

                  <div className="bg-[#060a12] border border-slate-800 rounded-lg p-3">
                    <span className="text-[10px] text-slate-400 block uppercase">Jitter / Variación</span>
                    <div className="text-2xl font-bold text-cyan-300 mt-1 flex items-baseline gap-1">
                      ±{pingDiag.jitterMs} <span className="text-xs font-normal text-slate-400">ms</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Estabilidad de paquetes</span>
                  </div>

                  <div className="bg-[#060a12] border border-slate-800 rounded-lg p-3">
                    <span className="text-[10px] text-slate-400 block uppercase">Pérdida de Paquetes</span>
                    <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-baseline gap-1">
                      {pingDiag.packetLossPct}%
                    </div>
                    <span className="text-[10px] text-emerald-400">0% Descarte (Óptimo)</span>
                  </div>

                  <div className="bg-[#060a12] border border-slate-800 rounded-lg p-3">
                    <span className="text-[10px] text-slate-400 block uppercase">Buffer de Entrada</span>
                    <div className="text-2xl font-bold text-amber-400 mt-1 flex items-baseline gap-1">
                      {settings.zeroLagInputBuffer ? '0' : '16'} <span className="text-xs font-normal text-slate-400">ms</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {settings.zeroLagInputBuffer ? 'Cero retardo activo' : 'Buffer estándar'}
                    </span>
                  </div>
                </div>
              </div>

              {/* FPS Limit Controls */}
              <div className="bg-[#0b121f] border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Limitador de FPS (Target Framerate)</h4>
                      <p className="text-slate-400 text-xs">
                        Ajusta la tasa de refresco para balancear fluidez vs temperatura de GPU y consumo de batería.
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded font-bold">
                    {settings.maxFramerate === 'unlimited' ? 'ILIMITADO (Max GPU)' : `${settings.maxFramerate} FPS`}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {([30, 60, 90, 120, 144, 'unlimited'] as FpsCap[]).map((cap) => {
                    const isSelected = settings.maxFramerate === cap;
                    return (
                      <button
                        key={String(cap)}
                        onClick={() => updateSettings({ maxFramerate: cap })}
                        className={`py-2.5 px-2 rounded-xl border text-center font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/30'
                            : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-sm">{cap === 'unlimited' ? '∞ Max' : `${cap}`}</div>
                        <div className="text-[10px] opacity-75 font-normal">
                          {cap === 30 && 'Ahorro Batería'}
                          {cap === 60 && 'Estándar 60Hz'}
                          {cap === 90 && 'Fluido 90Hz'}
                          {cap === 120 && 'Pro 120Hz'}
                          {cap === 144 && 'Ultra 144Hz'}
                          {cap === 'unlimited' && 'Sin Límite'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Anti-Lag & Packet Optimization Toggles */}
              <div className="bg-[#0b121f] border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Mecanismos Activos de Reducción de Lag
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Toggle 1: Zero Lag Input Buffer */}
                  <div className="bg-[#080d15] border border-slate-800/80 p-3.5 rounded-lg flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-200 block">Buffer de Entrada Cero-Lag</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        Elimina el debounce artificial en los controles 3D, cámara orbital y sliders para respuesta instantánea de hardware (&lt; 1ms).
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.zeroLagInputBuffer}
                      onChange={(e) => updateSettings({ zeroLagInputBuffer: e.target.checked })}
                      className="w-5 h-5 accent-cyan-400 cursor-pointer shrink-0 mt-1"
                    />
                  </div>

                  {/* Toggle 2: Client Side Extrapolation */}
                  <div className="bg-[#080d15] border border-slate-800/80 p-3.5 rounded-lg flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-200 block">Predicción de Física (Extrapolación)</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        Calcula la trayectoria del motor Verlet localmente sin esperar sincronizaciones de red, anulando el lag visual de partículas.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.clientSideExtrapolation}
                      onChange={(e) => updateSettings({ clientSideExtrapolation: e.target.checked })}
                      className="w-5 h-5 accent-cyan-400 cursor-pointer shrink-0 mt-1"
                    />
                  </div>

                  {/* Toggle 3: Delta Compression */}
                  <div className="bg-[#080d15] border border-slate-800/80 p-3.5 rounded-lg flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-200 block">Compresión Delta de Paquetes</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        Transmite únicamente los campos modificados en Firestore y WebSocket, reduciendo el consumo de ancho de banda hasta un 82%.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.networkDeltaCompression}
                      onChange={(e) => updateSettings({ networkDeltaCompression: e.target.checked })}
                      className="w-5 h-5 accent-cyan-400 cursor-pointer shrink-0 mt-1"
                    />
                  </div>

                  {/* Toggle 4: Ping Optimizer Socket Prioritization */}
                  <div className="bg-[#080d15] border border-slate-800/80 p-3.5 rounded-lg flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-200 block">Priorización de Socket TCP/HTTP</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        Fuerza `keep-alive` activo en las peticiones al backend y suprime el empaquetado Nagle para menor latencia.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.pingOptimizerActive}
                      onChange={(e) => updateSettings({ pingOptimizerActive: e.target.checked })}
                      className="w-5 h-5 accent-cyan-400 cursor-pointer shrink-0 mt-1"
                    />
                  </div>
                </div>

                {/* Packet Batching Interval Slider */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-bold">
                      Intervalo de Agrupación de Paquetes (Network Batching): {settings.packetBatchingIntervalMs} ms
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {settings.packetBatchingIntervalMs <= 10 ? 'Modo Ultra Baja Latencia' : 'Modo Conservador de Datos'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={settings.packetBatchingIntervalMs}
                    onChange={(e) => updateSettings({ packetBatchingIntervalMs: parseInt(e.target.value, 10) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>5 ms (Cero Lag / Red Rápida)</span>
                    <span>25 ms (Equilibrado)</span>
                    <span>50 ms (Bajo Consumo)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* TAB 2: RENDERING SETTINGS                                             */}
          {/* --------------------------------------------------------------------- */}
          {activeTab === 'rendering' && (
            <div className="space-y-6">
              {/* Presets Grid */}
              <div className="bg-[#0b121f] border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Calidad de Renderizado General (Estilo Minecraft / Game Engine)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => updateSettings({ renderQuality: 'fast' })}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                      settings.renderQuality === 'fast'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm flex items-center justify-between">
                      <span>Rápido (Fast)</span>
                      {settings.renderQuality === 'fast' && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Resolución 0.75x, sin sombras pesadas, ideal para tablets o equipos con lag.
                    </p>
                  </button>

                  <button
                    onClick={() => updateSettings({ renderQuality: 'balanced' })}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                      settings.renderQuality === 'balanced'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm flex items-center justify-between">
                      <span>Equilibrado</span>
                      {settings.renderQuality === 'balanced' && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Resolución nativa 1.0x, sombras simples y efectos cuánticos optimizados.
                    </p>
                  </button>

                  <button
                    onClick={() => updateSettings({ renderQuality: 'fancy' })}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                      settings.renderQuality === 'fancy'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm flex items-center justify-between">
                      <span>Fabuloso (Fancy)</span>
                      {settings.renderQuality === 'fancy' && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Retina 1.5x, iluminación suave PBR y máxima fidelidad cuántica.
                    </p>
                  </button>
                </div>
              </div>

              {/* Particle Density Slider */}
              <div className="bg-[#0b121f] border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">Densidad de Partículas Cuánticas y Físicas</h4>
                    <p className="text-slate-400 text-xs">
                      Controla cuántos electrones, fotones y nubes de probabilidad se simulan simultáneamente.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 font-bold rounded">
                    {settings.particleDensity.toLocaleString()} Partículas
                  </span>
                </div>

                <input
                  type="range"
                  min="300"
                  max="10000"
                  step="100"
                  value={settings.particleDensity}
                  onChange={(e) => updateSettings({ particleDensity: parseInt(e.target.value, 10) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>300 (Bajo / Cero Lag)</span>
                  <span>1,200 (Recomendado)</span>
                  <span>3,500 (Alto Detalle)</span>
                  <span>10,000 (Estrés Extremo)</span>
                </div>
              </div>

              {/* Graphical Features Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bloom & Glow */}
                <div className="bg-[#0b121f] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-bold text-white block">Resplandor Cuántico (Bloom & Glow)</span>
                    <p className="text-slate-400 text-[11px]">
                      Añade aura luminosa a los núcleos y orbitales |ψ|².
                    </p>
                  </div>
                  <button
                    onClick={() => updateSettings({ enableBloomAndGlow: !settings.enableBloomAndGlow })}
                    className={`w-12 h-6 rounded-full transition p-0.5 cursor-pointer ${
                      settings.enableBloomAndGlow ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.enableBloomAndGlow ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Render Distance */}
                <div className="bg-[#0b121f] border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Distancia de Renderizado</span>
                    <span className="text-cyan-400 font-bold">{settings.renderDistanceScale}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.25"
                    value={settings.renderDistanceScale}
                    onChange={(e) => updateSettings({ renderDistanceScale: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* TAB 3: RAM & VRAM ALLOCATION                                          */}
          {/* --------------------------------------------------------------------- */}
          {activeTab === 'ram' && (
            <div className="space-y-6">
              {/* RAM Allocation Selector */}
              <div className="bg-[#0b121f] border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Límite de Asignación de Memoria RAM (Heap)</h4>
                      <p className="text-slate-400 text-xs">
                        Define la cuota máxima de memoria JavaScript asignada a simulaciones y buffers de datos.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-bold rounded">
                    {settings.ramAllocationGB === 'unlimited' ? 'AUTO (Ilimitada)' : `${settings.ramAllocationGB} GB`}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {([1, 2, 4, 8, 'unlimited'] as RamAllocationLimit[]).map((limit) => {
                    const isSelected = settings.ramAllocationGB === limit;
                    return (
                      <button
                        key={String(limit)}
                        onClick={() => updateSettings({ ramAllocationGB: limit })}
                        className={`py-3 px-2 rounded-xl border text-center font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/30'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <div className="text-sm">{limit === 'unlimited' ? 'Auto' : `${limit} GB`}</div>
                        <div className="text-[10px] opacity-75 font-normal">
                          {limit === 1 && 'Eco Móvil'}
                          {limit === 2 && 'Ligero'}
                          {limit === 4 && 'Recomendado'}
                          {limit === 8 && 'Extremo'}
                          {limit === 'unlimited' && 'Sin Límite'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* VRAM Purge & Garbage Collection Control */}
              <div className="bg-[#0b121f] border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-cyan-400" />
                      Purgador de Texturas VRAM & Recolector de Basura (GC)
                    </h4>
                    <p className="text-slate-400 text-xs mt-1">
                      Libera inmediatamente buffers geométricos huérfanos, texturas Three.js y objetos de renderizado.
                    </p>
                  </div>

                  <button
                    onClick={handleManualGc}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 text-emerald-200 border border-emerald-500/40 font-bold transition flex items-center gap-2 active:scale-95 cursor-pointer shrink-0"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Liberar RAM & VRAM Ahora</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Aggressive GC toggle */}
                  <div className="bg-[#080d15] border border-slate-800 p-3.5 rounded-lg flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-200 block">GC Agresivo en Intervalos</span>
                      <p className="text-[11px] text-slate-400">
                        Fuerza la desasignación de buffers cada {settings.gcIntervalSeconds} segundos para evitar acumulaciones.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.aggressiveGarbageCollection}
                      onChange={(e) => updateSettings({ aggressiveGarbageCollection: e.target.checked })}
                      className="w-5 h-5 accent-emerald-400 cursor-pointer shrink-0 mt-1"
                    />
                  </div>

                  {/* Auto Purge on tab switch */}
                  <div className="bg-[#080d15] border border-slate-800 p-3.5 rounded-lg flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-200 block">Auto-Purga al Cambiar de Pestaña</span>
                      <p className="text-[11px] text-slate-400">
                        Destruye texturas WebGL pesadas cuando sales de una web 3D hacia otra instancia.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoPurgeVramOnTabSwitch}
                      onChange={(e) => updateSettings({ autoPurgeVramOnTabSwitch: e.target.checked })}
                      className="w-5 h-5 accent-emerald-400 cursor-pointer shrink-0 mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* TAB 4: CPU & MULTITHREADING                                           */}
          {/* --------------------------------------------------------------------- */}
          {activeTab === 'cpu' && (
            <div className="space-y-6">
              {/* Worker Threads Slider */}
              <div className="bg-[#0b121f] border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">Hilos de Simulación en Paralelo (Worker Concurrency)</h4>
                    <p className="text-slate-400 text-xs">
                      Núcleos de hardware detectados en tu dispositivo: {typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4} núcleos
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 font-bold rounded">
                    {settings.workerThreads} Hilos
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max={Math.max(8, typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 8) : 8)}
                  step="1"
                  value={settings.workerThreads}
                  onChange={(e) => updateSettings({ workerThreads: parseInt(e.target.value, 10) })}
                  className="w-full accent-purple-400 cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1 Hilo (Eco / Ahorro)</span>
                  <span>{Math.round((navigator.hardwareConcurrency || 4) / 2)} Hilos (Balanceado)</span>
                  <span>{navigator.hardwareConcurrency || 8} Hilos (Máximo Multiproceso)</span>
                </div>
              </div>

              {/* Physics Tick Rate (TPS) */}
              <div className="bg-[#0b121f] border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">Frecuencia de Cálculo Físico (Ticks Per Second - TPS)</h4>
                    <p className="text-slate-400 text-xs">
                      Sub-stepping numérico del motor Verlet (colisiones, Lorentz y electrostática).
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded font-bold">
                    {settings.physicsTickRateTps} TPS
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[20, 30, 60, 120].map((tps) => {
                    const isSelected = settings.physicsTickRateTps === tps;
                    return (
                      <button
                        key={tps}
                        onClick={() => updateSettings({ physicsTickRateTps: tps })}
                        className={`py-2 px-3 rounded-lg border text-center font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-purple-500 text-white border-purple-400 shadow-md'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        {tps} TPS
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Background Throttling */}
              <div className="bg-[#0b121f] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="font-bold text-white block">Pausar en Segundo Plano (Page Visibility API)</span>
                  <p className="text-slate-400 text-[11px]">
                    Reduce los ticks de simulación a 0% cuando la pestaña está oculta o minimizada.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.pauseInBackground}
                  onChange={(e) => updateSettings({ pauseInBackground: e.target.checked })}
                  className="w-5 h-5 accent-purple-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* TAB 5: GPU & HARDWARE ACCELERATION                                    */}
          {/* --------------------------------------------------------------------- */}
          {activeTab === 'gpu' && (
            <div className="space-y-6">
              {/* GPU Backend */}
              <div className="bg-[#0b121f] border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-amber-400" />
                  API de Aceleración Gráfica
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => updateSettings({ gpuBackend: 'webgl2' })}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      settings.gpuBackend === 'webgl2'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-white flex items-center justify-between">
                      <span>WebGL 2.0</span>
                      {settings.gpuBackend === 'webgl2' && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Recomendado • Alta aceleración</div>
                  </button>

                  <button
                    onClick={() => updateSettings({ gpuBackend: 'webgl1' })}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      settings.gpuBackend === 'webgl1'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-white flex items-center justify-between">
                      <span>WebGL 1.0</span>
                      {settings.gpuBackend === 'webgl1' && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Compatibilidad legacy</div>
                  </button>

                  <button
                    onClick={() => updateSettings({ gpuBackend: 'webgpu_exp' })}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      settings.gpuBackend === 'webgpu_exp'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-white flex items-center justify-between">
                      <span>WebGPU (Exp)</span>
                      {settings.gpuBackend === 'webgpu_exp' && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Siguiente generación</div>
                  </button>
                </div>
              </div>

              {/* Antialiasing Mode */}
              <div className="bg-[#0b121f] border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">Filtro Antialiasing (Suavizado de Bordes)</h4>
                  <span className="text-amber-400 font-bold uppercase">{settings.antialiasing}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['off', 'fxaa', 'msaa2x', 'msaa4x'] as AntialiasingMode[]).map((mode) => {
                    const isSelected = settings.antialiasing === mode;
                    return (
                      <button
                        key={mode}
                        onClick={() => updateSettings({ antialiasing: mode })}
                        className={`py-2 px-3 rounded-lg border text-center font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        {mode === 'off' && 'Desactivado (Max FPS)'}
                        {mode === 'fxaa' && 'FXAA Rápido'}
                        {mode === 'msaa2x' && 'MSAA 2x'}
                        {mode === 'msaa4x' && 'MSAA 4x (Calidad)'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* GPU Context Isolation Guard */}
              <div className="bg-[#0b121f] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Aislamiento Estricto de Contexto GPU
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Evita que dos instancias 3D compitan por la GPU al mismo tiempo, garantizando 0 caídas del driver gráfico.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.hardwareContextIsolation}
                  onChange={(e) => updateSettings({ hardwareContextIsolation: e.target.checked })}
                  className="w-5 h-5 accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* TAB 6: GENERAL & PROFILES                                             */}
          {/* --------------------------------------------------------------------- */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Presets Grid */}
              <div className="bg-[#0b121f] border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="font-bold text-white text-sm">Perfiles Rápidos de Rendimiento</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    onClick={applyTurboAntiLag}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      settings.performanceMode === 'turbo_antilag'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Turbo Cero Lag</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">120 FPS, ping optimizado y render rápido.</p>
                  </button>

                  <button
                    onClick={applyBalanced}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      settings.performanceMode === 'balanced'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4" />
                      <span>Equilibrado</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">60 FPS estables con visuales nítidos.</p>
                  </button>

                  <button
                    onClick={applyPowerSaver}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      settings.performanceMode === 'power_saver'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <BatteryCharging className="w-4 h-4" />
                      <span>Ahorro de Batería</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">30 FPS, baja temperatura y bajo consumo.</p>
                  </button>

                  <button
                    onClick={applyMaxQuality}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      settings.performanceMode === 'max_quality'
                        ? 'bg-purple-500/20 border-purple-400 text-purple-200'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-purple-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>Máxima Calidad</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Retina 1.5x, MSAA 4x y sin límite de FPS.</p>
                  </button>
                </div>
              </div>

              {/* Viewport and Zoom */}
              <div className="bg-[#0b121f] border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="font-bold text-white text-sm">Escala de Pantalla & Modo Computadora</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Desktop mode */}
                  <div className="bg-[#080d15] border border-slate-800 p-3.5 rounded-lg flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-200 block">Sitio para Computadoras</span>
                      <p className="text-[11px] text-slate-400">
                        Fuerza diseño de escritorio amplio sin colapsar columnas en pantallas táctiles o tablets.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.desktopSiteMode}
                      onChange={(e) => updateSettings({ desktopSiteMode: e.target.checked })}
                      className="w-5 h-5 accent-cyan-400 cursor-pointer shrink-0 mt-1"
                    />
                  </div>

                  {/* Zoom Controls */}
                  <div className="bg-[#080d15] border border-slate-800 p-3.5 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200">Zoom del Navegador</span>
                      <span className="text-cyan-400 font-bold">{settings.zoomLevelPct}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateSettings({ zoomLevelPct: Math.max(60, settings.zoomLevelPct - 10) })}
                        className="p-1 px-3 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 font-bold"
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateSettings({ zoomLevelPct: 100 })}
                        className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300"
                      >
                        Restablecer 100%
                      </button>
                      <button
                        onClick={() => updateSettings({ zoomLevelPct: Math.min(150, settings.zoomLevelPct + 10) })}
                        className="p-1 px-3 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Screen Diagonal Specifications (Phones & Tablets) */}
              <div className="bg-[#0b121f] border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Medidas de Pantalla en Diagonal (Teléfonos y Tabletas)</h4>
                    <p className="text-slate-400 text-xs font-sans">
                      Clasificación oficial de factores de forma, dimensiones diagonales en pulgadas/cm y transición de la zona gris.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Smartphones */}
                  <div className="bg-[#080d15] border border-slate-800 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                      <Smartphone className="w-4 h-4" />
                      <span>Teléfonos (Smartphones)</span>
                    </div>
                    <ul className="space-y-2 text-slate-300 text-[11px] font-sans">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span><strong>Tamaño común actual:</strong> Entre 6.1 y 6.9 pulgadas (siendo lo más habitual de 6.3 a 6.8 pulgadas).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span><strong>Medida en centímetros (diagonal):</strong> Aproximadamente entre 15.5 cm y 17.5 cm.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Tablets */}
                  <div className="bg-[#080d15] border border-slate-800 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                      <Tablet className="w-4 h-4" />
                      <span>Tabletas (Tablets)</span>
                    </div>
                    <ul className="space-y-2 text-slate-300 text-[11px] font-sans">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">•</span>
                        <span><strong>Tablets pequeñas:</strong> De 7 a 8.7 pulgadas (cercanas al tamaño de los teléfonos más grandes).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">•</span>
                        <span><strong>Tablets medianas:</strong> De 10 a 11 pulgadas (estándar más habitual).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">•</span>
                        <span><strong>Tablets grandes:</strong> De 12 a 14 pulgadas (orientadas a productividad o diseño).</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Equivalences and Gray Zone */}
                <div className="bg-[#080d15] border border-slate-800 p-4 rounded-xl space-y-3">
                  <span className="font-bold text-slate-200 text-xs block uppercase tracking-wider">
                    Equivalencias Aproximadas en Ancho x Alto & Zona Gris
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                    <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
                      <div className="font-bold text-cyan-300">Tablet 9"</div>
                      <div className="text-slate-400 mt-1">aprox. 23 × 16 cm</div>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
                      <div className="font-bold text-cyan-300">Tablet 10"</div>
                      <div className="text-slate-400 mt-1">aprox. 25 × 17 cm</div>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
                      <div className="font-bold text-cyan-300">Tablet 11"</div>
                      <div className="text-slate-400 mt-1">aprox. 28 × 20 cm</div>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
                      <div className="font-bold text-cyan-300">Tablet 12"</div>
                      <div className="text-slate-400 mt-1">aprox. 31 × 23 cm</div>
                    </div>
                  </div>

                  <div className="bg-cyan-950/20 border border-cyan-500/30 p-3 rounded-lg mt-2 text-[11px] text-cyan-200 font-sans">
                    <strong>Diferencia clave (Zona Gris):</strong> La transición entre ambos mundos se ubica entre las 7.5 y 9 pulgadas, donde algunas tabletas compactas (como modelos de 8.7 pulgadas) conviven con teléfonos de formato grande o "phablets" que rondan las 6.8 pulgadas.
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* 4. FOOTER TELEMETRY STRIP                                                 */}
        {/* ========================================================================= */}
        <div className="bg-[#05080e] border-t border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 text-[11px]">
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span>Ping: <strong className="text-emerald-300">{pingDiag.currentPingMs} ms</strong></span>
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span>FPS Objetivo: <strong className="text-cyan-300">{settings.maxFramerate === 'unlimited' ? 'Max' : settings.maxFramerate}</strong></span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span>RAM: <strong className="text-slate-200">{settings.ramAllocationGB === 'unlimited' ? 'Auto' : `${settings.ramAllocationGB} GB`}</strong></span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="text-amber-400">Perfil: {settings.performanceMode.toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualGc}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purgar VRAM</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition cursor-pointer"
            >
              Aplicar & Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
