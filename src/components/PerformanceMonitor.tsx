import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Gauge, 
  Zap, 
  Settings, 
  ShieldAlert, 
  Cpu, 
  RefreshCw, 
  X, 
  Sliders, 
  Check, 
  Volume2, 
  VolumeX, 
  Eye, 
  Cloud, 
  Sun, 
  Layers, 
  Monitor, 
  Sparkles,
  ZapOff
} from 'lucide-react';

export interface MinecraftPerformanceSettings {
  renderDistance: number; // 2 to 16
  maxFramerate: 'unlimited' | '120' | '60' | '30';
  graphicsQuality: 'fast' | 'fancy';
  smoothLighting: boolean;
  cloudsAndSky: boolean;
  entityAnimations: boolean;
  viewBobbing: boolean;
  pauseOnLostFocus: boolean;
  physicsTickRate: 'high' | 'normal' | 'low';
  profile: 'performance' | 'balanced' | 'quality';
  particleDensity: number;
  soundEnabled: boolean;
  highContrast: boolean;
}

interface PerformanceMonitorProps {
  onSettingsChange?: (settings: MinecraftPerformanceSettings) => void;
}

const SETTINGS_STORAGE_KEY = 'espiquumeyria_minecraft_perf_settings_v1';

const DEFAULT_SETTINGS: MinecraftPerformanceSettings = {
  renderDistance: 8,
  maxFramerate: '60',
  graphicsQuality: 'fancy',
  smoothLighting: true,
  cloudsAndSky: true,
  entityAnimations: true,
  viewBobbing: true,
  pauseOnLostFocus: true,
  physicsTickRate: 'normal',
  profile: 'balanced',
  particleDensity: 70,
  soundEnabled: true,
  highContrast: false,
};

export function PerformanceMonitor({ onSettingsChange }: PerformanceMonitorProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);
  const [frameTime, setFrameTime] = useState<number>(16.6);
  const [lagScore, setLagScore] = useState<number>(0);
  const [history, setHistory] = useState<number[]>(Array(20).fill(60));
  const [isPausedInBackground, setIsPausedInBackground] = useState<boolean>(false);

  // Load settings from localStorage or defaults
  const [settings, setSettings] = useState<MinecraftPerformanceSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SETTINGS;
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const lastFrameTimestampRef = useRef(performance.now());

  // Save to localStorage and notify parent whenever settings change
  const updateSettings = (partial: Partial<MinecraftPerformanceSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...partial };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      if (onSettingsChange) {
        onSettingsChange(updated);
      }
      return updated;
    });
  };

  // FPS & Performance measurement loop with Max Framerate limiter & Pause on Lost Focus
  useEffect(() => {
    let animationFrameId: number;

    const handleVisibilityChange = () => {
      if (settings.pauseOnLostFocus) {
        if (document.hidden) {
          setIsPausedInBackground(true);
        } else {
          setIsPausedInBackground(false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const measureFPS = (currentTime: number) => {
      if (!isPausedInBackground) {
        frameCountRef.current++;
        const deltaFrame = currentTime - lastFrameTimestampRef.current;
        lastFrameTimestampRef.current = currentTime;

        const currentLag = Math.max(0, deltaFrame - 16.6);
        setLagScore(prev => Math.round((prev * 0.9) + (currentLag * 0.1)));
        setFrameTime(parseFloat(deltaFrame.toFixed(1)));

        if (currentTime - lastTimeRef.current >= 300) {
          const elapsed = currentTime - lastTimeRef.current;
          const calculatedFps = Math.round((frameCountRef.current * 1000) / elapsed);
          let limit = 120;
          if (settings.maxFramerate === '60') limit = 60;
          if (settings.maxFramerate === '30') limit = 30;
          if (settings.maxFramerate === '120') limit = 120;

          const clampedFps = Math.min(limit, Math.max(5, calculatedFps));
          setFps(clampedFps);
          setHistory(prev => [...prev.slice(1), clampedFps]);

          frameCountRef.current = 0;
          lastTimeRef.current = currentTime;
        }
      }

      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);
    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [settings.maxFramerate, settings.pauseOnLostFocus, isPausedInBackground]);

  // Apply Quick Profiles
  const applyProfile = (profileName: 'performance' | 'balanced' | 'quality') => {
    if (profileName === 'performance') {
      updateSettings({
        profile: 'performance',
        renderDistance: 4,
        maxFramerate: '30',
        graphicsQuality: 'fast',
        smoothLighting: false,
        cloudsAndSky: false,
        entityAnimations: false,
        viewBobbing: false,
        physicsTickRate: 'low',
        particleDensity: 20,
      });
    } else if (profileName === 'balanced') {
      updateSettings({
        profile: 'balanced',
        renderDistance: 8,
        maxFramerate: '60',
        graphicsQuality: 'fancy',
        smoothLighting: true,
        cloudsAndSky: true,
        entityAnimations: true,
        viewBobbing: true,
        physicsTickRate: 'normal',
        particleDensity: 70,
      });
    } else {
      updateSettings({
        profile: 'quality',
        renderDistance: 16,
        maxFramerate: 'unlimited',
        graphicsQuality: 'fancy',
        smoothLighting: true,
        cloudsAndSky: true,
        entityAnimations: true,
        viewBobbing: true,
        physicsTickRate: 'high',
        particleDensity: 100,
      });
    }
  };

  const getFpsColor = (val: number) => {
    if (val >= 50) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (val >= 30) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  const getLagColor = (lag: number) => {
    if (lag < 5) return 'text-emerald-400';
    if (lag < 20) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-medium flex items-center gap-2 transition hover:scale-105 shadow-sm ${getFpsColor(fps)}`}
          title="Sistema Minecraft de Ajustes de Rendimiento y Gráficos"
        >
          <div className="flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-bold">{fps} FPS</span>
          </div>
          <span className="text-slate-500">|</span>
          <span className={`${getLagColor(lagScore)} text-[11px]`}>
            {isPausedInBackground ? 'En Pausa (Foco)' : lagScore < 2 ? 'Sin lag' : `${lagScore}ms lag`}
          </span>
          <Settings className="w-3.5 h-3.5 text-slate-400 hover:text-white transition ml-0.5" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b111a] border border-cyan-500/40 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#080d14]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                    Ajustes de Rendimiento & Gráficos (Estilo Minecraft Engine)
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Optimización avanzada de FPS, render distance, físicas y procesos en segundo plano
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto font-mono text-xs">
              
              {/* Telemetry Stats Bar */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#080d14] border border-slate-800 rounded-xl p-3 text-center">
                  <span className="text-[10px] uppercase text-slate-400 block mb-1">Fotogramas (FPS)</span>
                  <span className={`text-2xl font-extrabold ${fps >= 50 ? 'text-emerald-400' : fps >= 30 ? 'text-amber-400' : 'text-red-400'}`}>
                    {fps}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Tope: {settings.maxFramerate}</span>
                </div>

                <div className="bg-[#080d14] border border-slate-800 rounded-xl p-3 text-center">
                  <span className="text-[10px] uppercase text-slate-400 block mb-1">Tiempo de Frame</span>
                  <span className="text-2xl font-extrabold text-cyan-400">
                    {frameTime} <span className="text-xs text-slate-400">ms</span>
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Ideal: &lt;16.6ms</span>
                </div>

                <div className="bg-[#080d14] border border-slate-800 rounded-xl p-3 text-center">
                  <span className="text-[10px] uppercase text-slate-400 block mb-1">Latencia / Jank</span>
                  <span className={`text-2xl font-extrabold ${lagScore < 5 ? 'text-emerald-400' : lagScore < 20 ? 'text-amber-400' : 'text-red-400'}`}>
                    {lagScore} <span className="text-xs text-slate-400">ms</span>
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {isPausedInBackground ? 'Pausado (Segundo Plano)' : lagScore < 5 ? 'Óptimo' : 'Retardo'}
                  </span>
                </div>
              </div>

              {/* Presets Quick Profiles */}
              <div className="space-y-3">
                <h4 className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" /> Perfiles Rápidos (Presets)
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => applyProfile('performance')}
                    className={`p-3 rounded-xl border text-left transition ${
                      settings.profile === 'performance'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/10'
                        : 'bg-[#080d14] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold uppercase text-[11px]">Rendimiento Máx</span>
                      {settings.profile === 'performance' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <p className="text-[10px] font-sans text-slate-400 leading-tight">
                      Potato Mode. FPS 30, sin nubes ni animaciones.
                    </p>
                  </button>

                  <button
                    onClick={() => applyProfile('balanced')}
                    className={`p-3 rounded-xl border text-left transition ${
                      settings.profile === 'balanced'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/10'
                        : 'bg-[#080d14] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold uppercase text-[11px]">Equilibrado</span>
                      {settings.profile === 'balanced' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <p className="text-[10px] font-sans text-slate-400 leading-tight">
                      Estándar 60 FPS con calidad moderada.
                    </p>
                  </button>

                  <button
                    onClick={() => applyProfile('quality')}
                    className={`p-3 rounded-xl border text-left transition ${
                      settings.profile === 'quality'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/10'
                        : 'bg-[#080d14] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold uppercase text-[11px]">Calidad Suprema</span>
                      {settings.profile === 'quality' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <p className="text-[10px] font-sans text-slate-400 leading-tight">
                      FPS ilimitados, efectos y nubes completas.
                    </p>
                  </button>
                </div>
              </div>

              {/* Section 1: Gráficos y Renderizado */}
              <div className="bg-[#080d14] border border-slate-800 rounded-xl p-4 space-y-4">
                <h4 className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5" /> 1. Gráficos y Renderizado (Visuales)
                </h4>

                {/* Render Distance */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Distancia de Renderizado (Render Distance)</span>
                    <span className="text-cyan-400 font-bold">{settings.renderDistance} Chunks / Elementos</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="16"
                    step="2"
                    value={settings.renderDistance}
                    onChange={(e) => updateSettings({ renderDistance: Number(e.target.value), profile: 'balanced' })}
                    className="accent-cyan-400 cursor-pointer w-full"
                  />
                  <p className="text-[10px] text-slate-500 font-sans">
                    Controla cuántos elementos y celdas de simulación se procesan a la redonda. Reducir ahorra CPU y memoria.
                  </p>
                </div>

                {/* Max Framerate */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-300 block">Límite de FPS (Max Framerate)</span>
                    <span className="text-[10px] text-slate-500">Evita sobrecalentamiento de GPU</span>
                  </div>
                  <select
                    value={settings.maxFramerate}
                    onChange={(e) => updateSettings({ maxFramerate: e.target.value as any, profile: 'balanced' })}
                    className="bg-[#0b111a] border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-400"
                  >
                    <option value="30">30 FPS (Ahorro Máx)</option>
                    <option value="60">60 FPS (Estándar)</option>
                    <option value="120">120 FPS (Fluido)</option>
                    <option value="unlimited">Ilimitados (Max GPU)</option>
                  </select>
                </div>

                {/* Graphics Quality: Fast vs Fancy */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-300 block">Calidad de Gráficos (Graphics)</span>
                    <span className="text-[10px] text-slate-500">Rápido (Fast) vs Fabuloso/Detallado (Fancy)</span>
                  </div>
                  <button
                    onClick={() => updateSettings({ graphicsQuality: settings.graphicsQuality === 'fast' ? 'fancy' : 'fast', profile: 'balanced' })}
                    className={`px-3 py-1 rounded-lg border font-bold text-xs transition ${
                      settings.graphicsQuality === 'fancy'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {settings.graphicsQuality === 'fancy' ? 'Fabuloso (Fancy)' : 'Rápido (Fast)'}
                  </button>
                </div>

                {/* Smooth Lighting */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-300 block">Iluminación Suave (Smooth Lighting)</span>
                    <span className="text-[10px] text-slate-500">Cálculos de luz ambiental compleja</span>
                  </div>
                  <button
                    onClick={() => updateSettings({ smoothLighting: !settings.smoothLighting })}
                    className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                      settings.smoothLighting ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.smoothLighting ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Clouds and Sky */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-300 block">Nubes y Cielos (Clouds / Sky)</span>
                    <span className="text-[10px] text-slate-500">Elementos atmosféricos estéticos</span>
                  </div>
                  <button
                    onClick={() => updateSettings({ cloudsAndSky: !settings.cloudsAndSky })}
                    className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                      settings.cloudsAndSky ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.cloudsAndSky ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Section 2: Animaciones y Efectos */}
              <div className="bg-[#080d14] border border-slate-800 rounded-xl p-4 space-y-4">
                <h4 className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> 2. Animaciones y Efectos (Carga Gráfica)
                </h4>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-300 block">Animaciones de Entidades & Elementos</span>
                    <span className="text-[10px] text-slate-500">Movimiento de texturas, agua y partículas</span>
                  </div>
                  <button
                    onClick={() => updateSettings({ entityAnimations: !settings.entityAnimations })}
                    className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                      settings.entityAnimations ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.entityAnimations ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-300 block">Movimiento de Visión (View Bobbing)</span>
                    <span className="text-[10px] text-slate-500">Efecto de balanceo de cámara al caminar</span>
                  </div>
                  <button
                    onClick={() => updateSettings({ viewBobbing: !settings.viewBobbing })}
                    className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                      settings.viewBobbing ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.viewBobbing ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-300 block">Densidad de Partículas 3D</span>
                    <span className="text-[10px] text-slate-500">{settings.particleDensity}% activas en simulaciones</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="10"
                    value={settings.particleDensity}
                    onChange={(e) => updateSettings({ particleDensity: Number(e.target.value) })}
                    className="accent-cyan-400 cursor-pointer w-32"
                  />
                </div>
              </div>

              {/* Section 3: Procesos y Rendimiento en Segundo Plano */}
              <div className="bg-[#080d14] border border-slate-800 rounded-xl p-4 space-y-4">
                <h4 className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" /> 3. Procesos y Rendimiento en Segundo Plano
                </h4>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-300 block">Pausar al Perder Foco (Pause on Lost Focus)</span>
                    <span className="text-[10px] text-slate-500">Suspende bucles y renderizado al minimizar ventana</span>
                  </div>
                  <button
                    onClick={() => updateSettings({ pauseOnLostFocus: !settings.pauseOnLostFocus })}
                    className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                      settings.pauseOnLostFocus ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.pauseOnLostFocus ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-300 block">Gestión de Físicas & Entidades (Tick Rate)</span>
                    <span className="text-[10px] text-slate-500">Frecuencia de actualización de cálculos</span>
                  </div>
                  <select
                    value={settings.physicsTickRate}
                    onChange={(e) => updateSettings({ physicsTickRate: e.target.value as any })}
                    className="bg-[#0b111a] border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-400"
                  >
                    <option value="low">Bajo (Ahorro de Batería)</option>
                    <option value="normal">Normal (Estándar)</option>
                    <option value="high">Alto (Precisión Máxima)</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-800 bg-[#080d14] flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">
                Cambios aplicados instantáneamente en tiempo real & guardados en localStorage
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-lg transition"
              >
                Guardar y Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
