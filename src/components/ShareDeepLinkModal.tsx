import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  X, 
  ExternalLink, 
  Sparkles, 
  Globe, 
  Link2,
  Atom,
  Zap,
  FlaskConical,
  Sun,
  Truck,
  Bot
} from 'lucide-react';

interface ShareDeepLinkModalProps {
  currentUrl: string;
  worldTitle: string;
  worldPath: string;
  worldDescription?: string;
  onClose: () => void;
  onNavigateTo: (path: string) => void;
}

export const ShareDeepLinkModal: React.FC<ShareDeepLinkModalProps> = ({
  currentUrl,
  worldTitle,
  worldPath,
  worldDescription,
  onClose,
  onNavigateTo,
}) => {
  const [copiedCurrent, setCopiedCurrent] = useState(false);
  const [copiedPresetIndex, setCopiedPresetIndex] = useState<number | null>(null);

  const handleCopyCurrent = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopiedCurrent(true);
      setTimeout(() => setCopiedCurrent(false), 2500);
    });
  };

  const PRESET_DEEP_LINKS = [
    {
      title: 'Constructor 3D: Carbono-12',
      path: '/atom-builder/6',
      icon: <Atom className="w-3.5 h-3.5 text-cyan-400" />,
      desc: 'Z=6, N=6, átomo fundamental orgánico',
    },
    {
      title: 'Constructor 3D: Uranio-235 Fisionable',
      path: '/atom-builder?z=92&n=143',
      icon: <Atom className="w-3.5 h-3.5 text-red-400" />,
      desc: 'Isótopo fisionable clave para energía nuclear',
    },
    {
      title: 'Motor Físico: Fuerza de Lorentz & Ciclotrón',
      path: '/physics-engine/lorentz',
      icon: <Zap className="w-3.5 h-3.5 text-purple-400" />,
      desc: 'Partículas en campos E y B cruzados perpendiculares',
    },
    {
      title: 'Motor Físico: Átomo Cuántico de Bohr',
      path: '/physics-engine/bohr?z=2',
      icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
      desc: 'Velocidad orbital v(r) y longitud de de Broglie',
    },
    {
      title: 'Laboratorio: Neutralización HCl + NaOH',
      path: '/workspace?reagents=HCl,NaOH',
      icon: <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />,
      desc: 'Reacción fuertemente exotérmica ácido-base',
    },
    {
      title: 'Tabla Periódica: Oro (Au, Z=79)',
      path: '/periodic-table/Au',
      icon: <Globe className="w-3.5 h-3.5 text-amber-300" />,
      desc: 'Metal de transición con origen en kilonovas',
    },
    {
      title: 'Astrofísica: Cadena Protón-Protón Solar',
      path: '/astrophysics?chapter=ppchain',
      icon: <Sun className="w-3.5 h-3.5 text-orange-400" />,
      desc: 'Fusión de hidrógeno en núcleos estelares solares',
    },
    {
      title: 'Profesor IA: Cátedra de Física Cuántica',
      path: '/professor?prof=physics_astrophysics',
      icon: <Bot className="w-3.5 h-3.5 text-cyan-400" />,
      desc: 'Consultas sobre Schrödinger, fermiones y astrofísica',
    },
    {
      title: 'Normativa ADR: Túneles Categoría E',
      path: '/regulations?tunnel=E',
      icon: <Truck className="w-3.5 h-3.5 text-rose-400" />,
      desc: 'Máxima restricción para materias peligrosas',
    },
  ];

  const handleCopyPreset = (path: string, index: number) => {
    const full = `${window.location.origin}${window.location.pathname}#${path}`;
    navigator.clipboard.writeText(full).then(() => {
      setCopiedPresetIndex(index);
      setTimeout(() => setCopiedPresetIndex(null), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#070c16] border border-cyan-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl font-mono text-xs">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0a1120]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Compartir Enlace Profundo (Deep Link)</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40">
                  HashRouter
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Cada sección o mundo del simulador cuenta con su propia URL única y estado compartible.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          
          {/* Current World URL Box */}
          <div className="space-y-2 bg-[#040811] p-4 rounded-xl border border-cyan-500/30 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" />
                URL del Mundo Actual: {worldTitle}
              </span>
              <span className="text-slate-500 text-[10px]">{worldPath}</span>
            </div>

            {worldDescription && (
              <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                {worldDescription}
              </p>
            )}

            {/* Input field + copy button */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full bg-[#0a111e] border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono text-xs select-all focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleCopyCurrent}
                className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap shadow-md ${
                  copiedCurrent
                    ? 'bg-emerald-500 text-black shadow-emerald-500/30'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/25 active:scale-95'
                }`}
              >
                {copiedCurrent ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar URL</span>
                  </>
                )}
              </button>
            </div>

            {copiedCurrent && (
              <div className="text-emerald-400 text-[11px] font-sans flex items-center gap-1.5 pt-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Enlace copiado al portapapeles. ¡Cualquiera que lo abra entrará exactamente en este estado!</span>
              </div>
            )}
          </div>

          {/* Quick Deep Link Catalog */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Estados Destacados y Simulaciones Listas para Compartir
              </span>
              <span className="text-[10px] text-slate-500">Haz clic para ir o copiar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {PRESET_DEEP_LINKS.map((preset, index) => (
                <div
                  key={preset.path}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-white font-bold text-[11px]">
                      {preset.icon}
                      <span className="truncate">{preset.title}</span>
                    </div>
                    <p className="text-slate-400 text-[10px] font-sans mt-0.5 leading-snug">
                      {preset.desc}
                    </p>
                    <div className="text-cyan-400 text-[9.5px] font-mono mt-1 opacity-80 truncate">
                      #{preset.path}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-800/50">
                    <button
                      onClick={() => handleCopyPreset(preset.path, index)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] flex items-center gap-1 transition"
                      title="Copiar URL"
                    >
                      {copiedPresetIndex === index ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        onNavigateTo(preset.path);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-bold flex items-center gap-1 transition border border-cyan-500/30"
                    >
                      <span>Abrir</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0a1120] flex items-center justify-between text-slate-400 text-[11px]">
          <span>Enrutador SPA con soporte para parámetros `?z=`, `?preset=`, `?reagents=`</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
