import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  Sparkles, 
  Zap, 
  BookOpen, 
  Target, 
  Check, 
  Copy, 
  Layers, 
  Clock, 
  Activity, 
  FileCode, 
  ArrowRight,
  ShieldAlert,
  Server,
  Wrench
} from 'lucide-react';

export type ChatResponseLevel = 'practico' | 'tactico' | 'implementario' | 'basic' | 'full' | 'precise';

interface GeminiArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLevel: ChatResponseLevel;
  onSelectLevel: (level: ChatResponseLevel) => void;
}

export const GEMINI_GENERATIONS_DATA = [
  {
    generation: 'Gemini 1.5',
    phase: 'Fase 1: Pionero en Contexto Extenso',
    status: 'Legacy / Archivado',
    statusColor: 'text-slate-400 bg-slate-800/80 border-slate-700',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash'],
    focus: 'Ventana de contexto ultra masiva (hasta 1M - 2M tokens). Primeros avances en comprensión multimodal unificada de audio, video y documentos extensos.',
    useCases: 'Documentación masiva, procesamiento de PDFs de cientos de páginas o videos extensos. (Legacy/Archivado en favor de generaciones 2.5 y 3.8).'
  },
  {
    generation: 'Gemini 3.5',
    phase: 'Fase 2: Eficiencia, Velocidad y Costos',
    status: 'Activo / Producción Rápida',
    statusColor: 'text-amber-300 bg-amber-950/40 border-amber-500/40',
    models: ['gemini-3.5-flash-lite', 'gemini-3.5-flash'],
    focus: 'Optimización radical de latencia de primer token (TTFT), costo por inferencia hiper reducido y rendimiento sostenido para aplicaciones de alto tráfico con 100% disponibilidad.',
    useCases: 'Tareas recurrentes de alta frecuencia, respuestas ultra rápidas con baja latencia y presupuestos ajustados.'
  },
  {
    generation: 'Gemini 3.8 / 3.5 Pro',
    phase: 'Fase 3: Razonamiento Avanzado y Flujos Agénticos',
    status: 'Flagship / Razonamiento',
    statusColor: 'text-cyan-300 bg-cyan-950/40 border-cyan-500/40',
    models: ['gemini-3.5-flash', 'gemini-3.8-flash'],
    focus: 'Capacidad de pensamiento explícito (Thinking Level), resolución matemática profunda, generación y validación de código con rigor analítico y orquestación multi-herramienta.',
    useCases: 'Programación compleja, ejecución de código, uso de herramientas (Agentic AI) y razonamiento científico paso a paso.'
  }
];

export const PRIMARY_CHAT_MODES: ('practico' | 'tactico' | 'implementario')[] = ['practico', 'tactico', 'implementario'];

export const RESPONSE_LEVELS_CONFIG: Record<ChatResponseLevel, {
  name: string;
  badge: string;
  model: string;
  modelFallback: string;
  generation: string;
  temperature: number;
  maxOutputTokens: number;
  objective: string;
  systemInstructionSnippet: string;
  icon: typeof Zap;
  color: string;
  borderColor: string;
  bgLight: string;
}> = {
  practico: {
    name: 'Modo Práctico',
    badge: 'Acción Inmediata & Fórmulas Directas',
    model: 'gemini-3.5-flash-lite',
    modelFallback: 'gemini-3.5-flash',
    generation: 'Gemini 3.5',
    temperature: 0.3,
    maxOutputTokens: 500,
    objective: 'Ideal para consultas del día a día donde el usuario quiere una solución rápida, una fórmula o un ejemplo funcional en segundos sin rodeos.',
    systemInstructionSnippet: 'MODO PRÁCTICO: Ve directo al grano. Proporciona ejemplos numéricos rápidos, fórmulas directas, pasos de laboratorio o fragmentos de código listos para usar, sin rodeos teóricos.',
    icon: Zap,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    bgLight: 'bg-amber-950/20'
  },
  tactico: {
    name: 'Modo Táctico',
    badge: 'Estratégico & Operativo',
    model: 'gemini-3.5-flash',
    modelFallback: 'gemini-3.5-flash-lite',
    generation: 'Gemini 3.5',
    temperature: 0.5,
    maxOutputTokens: 2048,
    objective: 'Ideal para estructurar cómo abordar un problema complejo de química, física o biociencias, evaluando riesgos y flujos operativos con tablas y listas.',
    systemInstructionSnippet: 'MODO TÁCTICO: Actúa con mentalidad operativa. Desglosa el problema analizando variables críticas, restricciones de seguridad, puntos de fallo y una estrategia estructurada en formato Markdown con tablas o listas.',
    icon: BookOpen,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/40 hover:border-cyan-400',
    bgLight: 'bg-cyan-950/20'
  },
  implementario: {
    name: 'Modo Implementario',
    badge: 'Ingeniería Pesada & Rigor Estricto',
    model: 'gemini-3.5-flash',
    modelFallback: 'gemini-3.5-flash-lite',
    generation: 'Gemini 3.5 / 3.8',
    temperature: 0.1,
    maxOutputTokens: 4096,
    objective: 'Ideal para cuando se necesita el máximo razonamiento lógico, cálculos exactos bajo normativas técnicas estrictas (como estándares ADR/NFPA) o desarrollo de código complejo.',
    systemInstructionSnippet: 'MODO IMPLEMENTARIO: Diseña con rigor de ingeniería y arquitectura de producción. Valida cada suposición, especifica normativas técnicas aplicables (como ADR/NFPA o modelos matemáticos exactos), maneja restricciones de contorno y ofrece código o soluciones íntegras y robustas.',
    icon: Wrench,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/40 hover:border-purple-400',
    bgLight: 'bg-purple-950/20'
  },
  // Backward compatibility aliases
  basic: {
    name: 'Modo Práctico (Básica)',
    badge: 'Acción Inmediata & Fórmulas Directas',
    model: 'gemini-3.5-flash-lite',
    modelFallback: 'gemini-3.5-flash',
    generation: 'Gemini 3.5',
    temperature: 0.3,
    maxOutputTokens: 500,
    objective: 'Ideal para consultas del día a día donde el usuario quiere una solución rápida, una fórmula o un ejemplo funcional en segundos.',
    systemInstructionSnippet: 'MODO PRÁCTICO: Ve directo al grano. Proporciona ejemplos numéricos rápidos y fórmulas directas.',
    icon: Zap,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    bgLight: 'bg-amber-950/20'
  },
  full: {
    name: 'Modo Táctico (Completa)',
    badge: 'Estratégico & Operativo',
    model: 'gemini-3.5-flash',
    modelFallback: 'gemini-3.5-flash-lite',
    generation: 'Gemini 3.5',
    temperature: 0.5,
    maxOutputTokens: 2048,
    objective: 'Ideal para estructurar cómo abordar un problema complejo de química o física, evaluando riesgos y flujos operativos.',
    systemInstructionSnippet: 'MODO TÁCTICO: Desglosa el problema analizando variables críticas y estrategia estructurada con tablas.',
    icon: BookOpen,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/40 hover:border-cyan-400',
    bgLight: 'bg-cyan-950/20'
  },
  precise: {
    name: 'Modo Implementario (Precisa)',
    badge: 'Ingeniería Pesada & Rigor Estricto',
    model: 'gemini-3.5-flash',
    modelFallback: 'gemini-3.5-flash-lite',
    generation: 'Gemini 3.5 / 3.8',
    temperature: 0.1,
    maxOutputTokens: 4096,
    objective: 'Ideal para cuando se necesita el máximo razonamiento lógico, cálculos exactos bajo normativas técnicas estrictas o desarrollo de código complejo.',
    systemInstructionSnippet: 'MODO IMPLEMENTARIO: Diseña con rigor de ingeniería y arquitectura de producción.',
    icon: Wrench,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/40 hover:border-purple-400',
    bgLight: 'bg-purple-950/20'
  }
};

const CODE_SAMPLE = `// backend/chatHandler.ts
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

interface ChatOptions {
  prompt: string;
  mode?: "practico" | "tactico" | "implementario";
  subject?: "quimica" | "fisica" | "biociencias";
}

export async function processChatMessage({ prompt, mode = "practico", subject = "quimica" }: ChatOptions) {
  let modelName = "gemini-3.8-flash";
  let genConfig = { temperature: 0.5, maxOutputTokens: 2048 };
  
  // 1. Contexto base de la cátedra (Química / Física Cuántica / Biociencias)
  let baseSubjectPrompt = "";
  if (subject === "quimica") {
    baseSubjectPrompt = "Eres un Catedrático y Consultor Senior en Química, experto en Fisicoquímica, equilibrios iónicos, síntesis molecular y normativas técnicas ADR/NFPA. ";
  } else if (subject === "fisica") {
    baseSubjectPrompt = "Eres un Investigador Senior en Física Cuántica, experto en la ecuación de Schrödinger, efecto túnel, astrofísica estelar y presión de degeneración. ";
  } else {
    baseSubjectPrompt = "Eres un Investigador Senior en Biociencias, Genómica y Bioinformática, experto en modelado estructural con AlphaFold DB (pLDDT), RCSB PDB, ClinVar, gnomAD y farmacología PubChem/ChEMBL. ";
  }

  // 2. Modos de Ejecución: Práctico, Táctico e Implementario
  let modePrompt = "";
  switch (mode) {
    case "practico":
      // Nivel 1: Enfoque dinámico, rápido y orientado a la acción inmediata
      modelName = "gemini-3.5-flash-lite";
      genConfig = { temperature: 0.3, maxOutputTokens: 500 };
      modePrompt = "MODO PRÁCTICO: Ve directo al grano. Proporciona ejemplos numéricos rápidos, fórmulas directas, pasos de laboratorio o fragmentos de código listos para usar, sin rodeos teóricos.";
      break;

    case "tactico":
      // Nivel 2: Enfoque analítico, estratégico y de resolución de problemas paso a paso
      modelName = "gemini-3.5-flash";
      genConfig = { temperature: 0.5, maxOutputTokens: 2048 };
      modePrompt = "MODO TÁCTICO: Actúa con mentalidad operativa. Desglosa el problema analizando variables críticas, restricciones de seguridad, puntos de fallo y una estrategia estructurada en formato Markdown con tablas o listas.";
      break;

    case "implementario":
    default:
      // Nivel 3: Enfoque de ingeniería pesada, código de producción y rigor estricto
      modelName = "gemini-3.5-flash";
      genConfig = { temperature: 0.1, maxOutputTokens: 4096 };
      modePrompt = "MODO IMPLEMENTARIO: Diseña con rigor de ingeniería y arquitectura de producción. Valida cada suposición, especifica normativas técnicas aplicables (como ADR/NFPA o modelos matemáticos exactos), maneja restricciones de contorno y ofrece código o soluciones íntegras y robustas.";
      break;
  }

  const systemPrompt = baseSubjectPrompt + modePrompt;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      systemInstruction: systemPrompt,
      temperature: genConfig.temperature,
      maxOutputTokens: genConfig.maxOutputTokens
    }
  });

  return response.text;
}`;

export const GeminiArchitectureModal: React.FC<GeminiArchitectureModalProps> = ({
  isOpen,
  onClose,
  activeLevel,
  onSelectLevel,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'levels' | 'code'>('levels');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CODE_SAMPLE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Normalize active level to match primary tabs
  const normalizedActive: 'practico' | 'tactico' | 'implementario' = 
    activeLevel === 'basic' ? 'practico' :
    activeLevel === 'full' ? 'tactico' :
    activeLevel === 'precise' ? 'implementario' :
    (activeLevel as any);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#070d17] border border-cyan-500/40 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden text-slate-100">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4 relative z-10 bg-[#09111e]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  Google AI Studio Architecture
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Práctico • Táctico • Implementario
                </span>
              </div>
              <h2 className="text-base font-bold text-white font-mono">
                Arquitectura de 3 Modos de Ejecución (Gemini 2.5 & 3.8 / 3.1 Pro)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 px-5 pt-2 bg-[#060a12] text-xs font-mono gap-2">
          <button
            onClick={() => setActiveTab('levels')}
            className={`px-3 py-2 border-b-2 font-bold transition flex items-center gap-2 ${
              activeTab === 'levels'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Los 3 Modos de Ejecución</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-2 border-b-2 font-bold transition flex items-center gap-2 ${
              activeTab === 'code'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Código Backend (\`backend/chatHandler.ts\`)</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-2 border-b-2 font-bold transition flex items-center gap-2 ${
              activeTab === 'matrix'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Matriz de Generaciones (1.5 / 2.5 / 3.8)</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === 'levels' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 leading-relaxed font-sans">
                ¿Qué cambia con estos tres nuevos modos? Selecciona el nivel de razonamiento y modelo idóneo para tus consultas científicas en Química, Física Cuántica o Biociencias.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PRIMARY_CHAT_MODES.map((lvlKey) => {
                  const cfg = RESPONSE_LEVELS_CONFIG[lvlKey];
                  const Icon = cfg.icon;
                  const isCurrent = normalizedActive === lvlKey;

                  return (
                    <div
                      key={lvlKey}
                      className={`rounded-2xl border p-4 transition-all flex flex-col justify-between relative overflow-hidden ${
                        isCurrent
                          ? `${cfg.borderColor} ${cfg.bgLight} shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/50`
                          : 'border-slate-800 bg-[#070c14] hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 ${cfg.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-white font-mono">{cfg.name}</h4>
                              <span className={`text-[10px] font-mono ${cfg.color}`}>{cfg.badge}</span>
                            </div>
                          </div>

                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 flex items-center gap-1 font-bold">
                              <Check className="w-3 h-3" /> Activo
                            </span>
                          )}
                        </div>

                        {/* Model Tag */}
                        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-[11px] space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Modelo API:</span>
                            <span className="text-cyan-300 font-bold">{cfg.model}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Generación:</span>
                            <span className="text-slate-200">{cfg.generation}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Temp / Max Tokens:</span>
                            <span className="text-amber-300">{cfg.temperature} / {cfg.maxOutputTokens} tok</span>
                          </div>
                        </div>

                        {/* Objective */}
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                            ¿Cuándo utilizarlo?
                          </span>
                          <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                            {cfg.objective}
                          </p>
                        </div>

                        {/* System Prompt Snippet */}
                        <div className="p-2 rounded-lg bg-[#040810] border border-slate-800/80 font-mono text-[10.5px]">
                          <span className="text-slate-500 block text-[9.5px] uppercase mb-0.5">Directiva:</span>
                          <span className="text-slate-300 italic">"{cfg.systemInstructionSnippet}"</span>
                        </div>
                      </div>

                      <div className="pt-4 mt-2 border-t border-slate-800/60">
                        <button
                          type="button"
                          onClick={() => onSelectLevel(lvlKey)}
                          className={`w-full py-2 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-2 ${
                            isCurrent
                              ? 'bg-cyan-500 text-black shadow-md'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-white'
                          }`}
                        >
                          {isCurrent ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Modo Seleccionado
                            </>
                          ) : (
                            <>
                              Activar {cfg.name} <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Summary Comparative Table */}
              <div className="p-4 rounded-xl bg-[#050810] border border-slate-800 font-sans space-y-2">
                <h4 className="font-mono text-xs font-bold text-cyan-300 uppercase tracking-wide">
                  Comparativa de Enfoque de los Tres Modos
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-300 pt-1">
                  <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20">
                    <strong className="text-amber-300 font-mono block mb-1">Práctico (2.5 Flash Lite):</strong>
                    Consultas del día a día, resolución rápida, fórmulas directas, pasos de laboratorio o fragmentos de código listos para usar en segundos.
                  </div>
                  <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20">
                    <strong className="text-cyan-300 font-mono block mb-1">Táctico (3.8 Flash):</strong>
                    Estructurar problemas complejos, matrices de riesgo ADR, análisis operativo y diagramación en Markdown con tablas comparativas.
                  </div>
                  <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/20">
                    <strong className="text-purple-300 font-mono block mb-1">Implementario (3.1 Pro):</strong>
                    Máximo razonamiento deductivo, modelos matemáticos exactos, cumplimiento estricto de normativas técnicas y código con arquitectura de producción.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-mono text-xs">
                  Módulo de ejecución backend oficial (\`backend/chatHandler.ts\`):
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 font-mono text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#040810] border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto leading-relaxed scrollbar-thin">
                <pre>{CODE_SAMPLE}</pre>
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-xs leading-relaxed font-sans">
                <strong>Servicio Server-Side Seguro:</strong> El handler utiliza el SDK moderno <code>@google/genai</code> en Node.js/Express sin exponer la clave <code>GEMINI_API_KEY</code> al cliente, con conmutación por cuotas y soporte multi-asignatura (Química, Física Cuántica y Biociencias).
              </div>
            </div>
          )}

          {activeTab === 'matrix' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 leading-relaxed font-sans">
                La evolución entre <strong>Gemini 1.5, 2.5 y 3.8</strong> refleja las tres fases clave en la arquitectura de los modelos multimodales de <strong>Google AI Studio</strong>: desde el avance inicial en contexto masivo hasta la máxima eficiencia de costos y el razonamiento agéntico avanzado.
              </div>

              {/* Evolution Matrix Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#050810]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                      <th className="p-3">Generación</th>
                      <th className="p-3">Enfoque Principal</th>
                      <th className="p-3">Modelos / API String</th>
                      <th className="p-3">Casos de Uso Recomendados</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {GEMINI_GENERATIONS_DATA.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition">
                        <td className="p-3 align-top">
                          <div className="font-bold text-white font-mono text-sm">{item.generation}</div>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono border ${item.statusColor}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 align-top font-medium text-slate-200">
                          <div className="font-bold text-cyan-300 font-mono mb-1">{item.phase}</div>
                          <p className="text-slate-400 text-[11px] leading-relaxed">{item.focus}</p>
                        </td>
                        <td className="p-3 align-top font-mono">
                          <div className="space-y-1">
                            {item.models.map((m, mIdx) => (
                              <div
                                key={mIdx}
                                className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10.5px] text-cyan-300 inline-block mr-1.5"
                              >
                                {m}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 align-top text-slate-300 text-[11px] leading-relaxed">
                          {item.useCases}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#060a12] flex items-center justify-between text-xs font-mono">
          <div className="text-slate-400 flex items-center gap-2">
            <span>Modo activo en el chat:</span>
            <span className="text-cyan-300 font-bold uppercase">{RESPONSE_LEVELS_CONFIG[normalizedActive].name} ({RESPONSE_LEVELS_CONFIG[normalizedActive].model})</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
