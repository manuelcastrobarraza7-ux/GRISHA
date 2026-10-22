import React, { useState, useEffect } from 'react';
import { Sliders, Monitor, Sparkles, Gauge, Cpu, Check, Eye } from 'lucide-react';

interface MinecraftLabSettingsPanelProps {
  onSettingsChange?: (settings: {
    graphicsQuality: 'fast' | 'fancy';
    particleAnimations: boolean;
    maxFramerate: number | 'unlimited';
    pauseInBackground: boolean;
    isBackgroundPaused: boolean;
  }) => void;
}

export const MinecraftLabSettingsPanel: React.FC<MinecraftLabSettingsPanelProps> = ({ onSettingsChange }) => {
  const [graphicsQuality, setGraphicsQuality] = useState<'fast' | 'fancy'>('fancy');
  const [particleAnimations, setParticleAnimations] = useState<boolean>(true);
  const [maxFramerate, setMaxFramerate] = useState<number | 'unlimited'>(60);
  const [pauseInBackground, setPauseInBackground] = useState<boolean>(true);
  const [isBackgroundPaused, setIsBackgroundPaused] = useState<boolean>(false);

  // Page Visibility API detection
  useEffect(() => {
    if (!pauseInBackground) {
      setIsBackgroundPaused(false);
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBackgroundPaused(true);
      } else {
        setIsBackgroundPaused(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pauseInBackground]);

  // Notify parent or trigger effects in real time
  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange({
        graphicsQuality,
        particleAnimations,
        maxFramerate,
        pauseInBackground,
        isBackgroundPaused,
      });
    }
  }, [graphicsQuality, particleAnimations, maxFramerate, pauseInBackground, isBackgroundPaused, onSettingsChange]);

  return (
    <div className="bg-[#080d14] border border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-4 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-cyan-400 block font-bold">
              Minecraft Engine • Configuración de Gráficos & Rendimiento
            </span>
            <h3 className="text-sm font-bold text-white">
              Panel de Control Gráfico de Laboratorio
            </h3>
          </div>
        </div>

        {isBackgroundPaused && (
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/40 text-amber-400 px-3 py-1 rounded-lg text-xs animate-pulse">
            <Cpu className="w-3.5 h-3.5" />
            <span>Pausado en segundo plano (Ahorrando CPU)</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* 1. Calidad Gráfica: Rápido / Fabuloso */}
        <div className="bg-[#0b111a] border border-slate-800 rounded-xl p-3.5 space-y-2">
          <span className="text-slate-400 font-bold block flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-cyan-400" /> Calidad Gráfica
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setGraphicsQuality('fast')}
              className={`py-2 px-3 rounded-lg border font-bold transition flex items-center justify-center gap-1 ${
                graphicsQuality === 'fast'
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              <span>Rápido (Fast)</span>
            </button>
            <button
              onClick={() => setGraphicsQuality('fancy')}
              className={`py-2 px-3 rounded-lg border font-bold transition flex items-center justify-center gap-1 ${
                graphicsQuality === 'fancy'
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              <span>Fabuloso (Fancy)</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-500 font-sans leading-tight">
            {graphicsQuality === 'fast' ? 'Desactiva transparencias y sombreados pesados.' : 'Renderizado completo con efectos visuales avanzados.'}
          </p>
        </div>

        {/* 2. Animaciones de Partículas */}
        <div className="bg-[#0b111a] border border-slate-800 rounded-xl p-3.5 space-y-2">
          <span className="text-slate-400 font-bold block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Animaciones de Partículas
          </span>
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-300">
              {particleAnimations ? 'Activadas (Fluid)' : 'Desactivadas'}
            </span>
            <button
              onClick={() => setParticleAnimations(!particleAnimations)}
              className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                particleAnimations ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                particleAnimations ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
          <p className="text-[10px] text-slate-500 font-sans leading-tight">
            Controla las partículas de reacciones y nubes en el laboratorio.
          </p>
        </div>

        {/* 3. Limitador de FPS */}
        <div className="bg-[#0b111a] border border-slate-800 rounded-xl p-3.5 space-y-2">
          <span className="text-slate-400 font-bold block flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" /> Limitador de FPS
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {[30, 60, 'unlimited'].map((limit) => (
              <button
                key={String(limit)}
                onClick={() => setMaxFramerate(limit as any)}
                className={`py-2 px-1 text-center rounded-lg border font-bold transition ${
                  maxFramerate === limit
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
              >
                {limit === 'unlimited' ? 'Max' : `${limit}`}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 font-sans leading-tight">
            {maxFramerate === 'unlimited' ? 'FPS ilimitados (máximo rendimiento GPU).' : `Tope fijo a ${maxFramerate} FPS.`}
          </p>
        </div>

        {/* 4. Pausar Procesos en Segundo Plano */}
        <div className="bg-[#0b111a] border border-slate-800 rounded-xl p-3.5 space-y-2">
          <span className="text-slate-400 font-bold block flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Pausa Segundo Plano
          </span>
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-300">
              {pauseInBackground ? 'Activo (visibilitychange)' : 'Inactivo'}
            </span>
            <button
              onClick={() => setPauseInBackground(!pauseInBackground)}
              className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                pauseInBackground ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                pauseInBackground ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
          <p className="text-[10px] text-slate-500 font-sans leading-tight">
            Reduce ticks al minimizar o cambiar de pestaña para ahorrar batería.
          </p>
        </div>
      </div>
    </div>
  );
};
