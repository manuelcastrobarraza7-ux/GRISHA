import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Loader2, 
  User, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Volume1, 
  FlaskConical, 
  Atom, 
  Dna, 
  Mic, 
  MicOff, 
  Radio, 
  SlidersHorizontal,
  Landmark,
  BookOpen,
  Cpu,
  Wrench,
  Zap,
  ChevronDown,
  ChevronUp,
  Database,
  Sparkles,
  CheckCircle2,
  Settings2
} from 'lucide-react';
import { ChatMessageContent } from './ChatMessageContent';
import { createSpeechController, SpeechController } from '../utils/speechUtils';
import { HistoricalAnalysisModal } from './HistoricalAnalysisModal';
import { GeminiArchitectureModal, ChatResponseLevel, RESPONSE_LEVELS_CONFIG } from './GeminiArchitectureModal';
import { generateScientificFallback } from '../utils/scientificFallback';
import { ProfessorSearchBase } from './ProfessorSearchBase';

export interface Message {
  role: 'user' | 'model';
  content: string;
  mode?: ChatResponseLevel | string;
  modelUsed?: string;
  generation?: string;
  latencyMs?: number;
  config?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

export type ProfessorType = 'chemistry' | 'physics_astrophysics' | 'bioscience';

interface FeaturedScientist {
  name: string;
  field: string;
}

interface ProfessorConfig {
  type: ProfessorType;
  title: string;
  shortTitle: string;
  tagline: string;
  specialties: string[];
  storageKey: string;
  theme: {
    primary: string;
    border: string;
    glow: string;
    bgPanel: string;
    badge: string;
    userBubble: string;
    modelBubble: string;
    sendBtn: string;
    accentText: string;
    cardActiveGradient: string;
    cardBorder: string;
    bannerGradient: string;
  };
  welcome: string;
  suggestedQuestions: string[];
  featuredFigures: FeaturedScientist[];
  placeholderPractico: string;
  placeholderTactico: string;
  placeholderImplementario: string;
}

const PROFESSORS: Record<ProfessorType, ProfessorConfig> = {
  chemistry: {
    type: 'chemistry',
    title: 'Chat de Química & Síntesis Molecular',
    shortTitle: 'Química',
    tagline: 'Fisicoquímica, equilibrios iónicos, sales agronómicas (K₂SO₄, KNO₃), alúmina Al₂O₃ y normativas ADR/NFPA',
    specialties: [
      'Equilibrios iónicos & redox',
      'Sales libres de Cl⁻ (K₂SO₄, KNO₃)',
      'Matriz cristalina Al₂O₃ & gemas',
      'Logística ADR & rombo NFPA'
    ],
    storageKey: 'espiquumeyria_chemistry_professor_v10',
    theme: {
      primary: 'text-cyan-400',
      border: 'border-cyan-500/40 hover:border-cyan-500/70',
      glow: 'shadow-[0_0_25px_rgba(6,182,212,0.14)]',
      bgPanel: 'bg-gradient-to-b from-[#061421] via-[#050f18] to-[#040a10]',
      badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/50',
      userBubble: 'bg-cyan-950/90 text-cyan-50 border border-cyan-500/50 shadow-md',
      modelBubble: 'bg-[#050f18] text-slate-200 border border-cyan-900/60 shadow-lg',
      sendBtn: 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/30 font-bold',
      accentText: 'text-cyan-400',
      cardActiveGradient: 'bg-gradient-to-br from-[#071d2e] via-[#061421] to-[#030911] border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.2)]',
      cardBorder: 'border-cyan-500/40 hover:border-cyan-400',
      bannerGradient: 'from-cyan-950/40 via-[#071320] to-cyan-950/20'
    },
    welcome: `¡Saludos! Soy el **Profesor IA de Química & Síntesis Molecular**.
Investigamos equilibrios iónicos y redox, neutralizaciones exotérmicas, síntesis agronómica de fertilizantes libres de cloruro como \\(K_2SO_4\\) (sulfato de potasio) y \\(KNO_3\\) (nitrato de potasio), cristalización de alúmina \\(Al_2O_3\\) (rubíes y zafiros) y logística de transporte ADR con rombo NFPA 704.

Dispones de una **Base de Búsqueda Química propia** arriba para consultar fichas ADR, reactivos y balances al instante.`,
    suggestedQuestions: [
      '¿Por qué el K₂SO₄ y KNO₃ son superiores al KCl en suelos salinos tecnificados?',
      '¿Cómo los iones Cr³⁺ y el par Fe²⁺/Ti⁴⁺ en la red de Al₂O₃ forman rubíes y zafiros?',
      '¿Qué restricciones de túneles ADR (A-E) aplican a ácidos fuertes como HNO₃ (UN 2031)?',
      'Balance de entalpía y energía de Gibbs entre H₂SO₄ y KOH con cálculo estequiométrico.'
    ],
    featuredFigures: [
      { name: 'Marie Curie', field: 'Radiactividad & Radio' },
      { name: 'Antoine Lavoisier', field: 'Conservación de Masa' },
      { name: 'Dmitri Mendeléyev', field: 'Tabla Periódica' },
      { name: 'Fritz Haber', field: 'Síntesis de Amoníaco' }
    ],
    placeholderPractico: 'Pregunta rápida de Química (fórmulas, masas molares, balances)...',
    placeholderTactico: 'Consulta táctica y operativa (tablas de compatibilidad, riesgos ADR)...',
    placeholderImplementario: 'Problema de ingeniería estricto (entalpías exactas, normativas técnicas)...'
  },
  physics_astrophysics: {
    type: 'physics_astrophysics',
    title: 'Chat de Cuántica & Astrofísica',
    shortTitle: 'Cuántica & Astro',
    tagline: 'Mecánica cuántica (Schrödinger), efecto túnel Gamow, nucleosíntesis estelar (p-p, CNO) y límite de Chandrasekhar',
    specialties: [
      'Mecánica cuántica (Schrödinger & túnel)',
      'Fusión termonuclear (Cadena p-p, CNO)',
      'Objetos subestelares (Enanas marrones)',
      'Degeneración de Fermi & Chandrasekhar'
    ],
    storageKey: 'espiquumeyria_physics_professor_v10',
    theme: {
      primary: 'text-purple-400',
      border: 'border-purple-500/40 hover:border-purple-500/70',
      glow: 'shadow-[0_0_25px_rgba(168,85,247,0.14)]',
      bgPanel: 'bg-gradient-to-b from-[#110a24] via-[#0b0618] to-[#070310]',
      badge: 'bg-purple-500/15 text-purple-300 border-purple-500/50',
      userBubble: 'bg-purple-950/90 text-purple-50 border border-purple-500/50 shadow-md',
      modelBubble: 'bg-[#0c071c] text-slate-200 border border-purple-900/60 shadow-lg',
      sendBtn: 'bg-purple-500 hover:bg-purple-400 text-white shadow-purple-500/30 font-bold',
      accentText: 'text-purple-400',
      cardActiveGradient: 'bg-gradient-to-br from-[#1a0f38] via-[#120826] to-[#080312] border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.2)]',
      cardBorder: 'border-purple-500/40 hover:border-purple-400',
      bannerGradient: 'from-purple-950/40 via-[#100822] to-purple-950/20'
    },
    welcome: `¡Saludos! Soy el **Profesor IA de Cuántica & Astrofísica**.
Desde la mecánica cuántica ondulatoria (ecuación de Schrödinger, efecto túnel cuántico y factor de Gamow) hasta la astrofísica estelar de enanas marrones (>13 MJ) y remanentes compactos (límite de Chandrasekhar de 1.44 M☉).

Dispones de una **Base de Búsqueda Cuántica propia** arriba para consultar isótopos, reacciones estelares y constantes físicas al instante.`,
    suggestedQuestions: [
      'Explica la quema de deuterio en enanas marrones (>13 MJ) y la degeneración de electrones de Fermi.',
      '¿Cómo el efecto túnel cuántico (factor de Gamow) permite la fusión de protones en el núcleo solar?',
      'Diferencia entre entrelazamiento cuántico de estados de Bell y enlaces moleculares.',
      'Ecuación de Schrödinger independiente del tiempo para pozos cuánticos con cálculo de autovalores.'
    ],
    featuredFigures: [
      { name: 'Albert Einstein', field: 'Relatividad & Fotoeléctrico' },
      { name: 'Erwin Schrödinger', field: 'Mecánica Ondulatoria' },
      { name: 'Max Planck', field: 'Cuanto de Acción h' },
      { name: 'Subrahmanyan Chandrasekhar', field: 'Límite de Enanas Blancas' }
    ],
    placeholderPractico: 'Pregunta rápida de Física Cuántica (constantes, decaimientos, energía)...',
    placeholderTactico: 'Consulta táctica cuántica (ramas p-p, evolución estelar, tablas)...',
    placeholderImplementario: 'Problema matemático riguroso (ecuación de Schrödinger, límites relativistas)...'
  },
  bioscience: {
    type: 'bioscience',
    title: 'Chat de Biología & Moléculas Orgánicas',
    shortTitle: 'Biología & Orgánica',
    tagline: 'Bioquímica celular, biomoléculas de la vida, ADN/ARN, aminoácidos, enzimas, química orgánica y AlphaFold DB',
    specialties: [
      'Biomoléculas (ATP, ADN, glucosa)',
      'Aminoácidos & AlphaFold (pLDDT)',
      'Química orgánica & grupos funcionales',
      'Cinética enzimática & fármacos'
    ],
    storageKey: 'espiquumeyria_biology_professor_v10',
    theme: {
      primary: 'text-emerald-400',
      border: 'border-emerald-500/40 hover:border-emerald-500/70',
      glow: 'shadow-[0_0_25px_rgba(16,185,129,0.14)]',
      bgPanel: 'bg-gradient-to-b from-[#061c16] via-[#04120e] to-[#020a07]',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/50',
      userBubble: 'bg-emerald-950/90 text-emerald-50 border border-emerald-500/50 shadow-md',
      modelBubble: 'bg-[#04120e] text-slate-200 border border-emerald-900/60 shadow-lg',
      sendBtn: 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/30 font-bold',
      accentText: 'text-emerald-400',
      cardActiveGradient: 'bg-gradient-to-br from-[#082920] via-[#051a14] to-[#020b08] border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]',
      cardBorder: 'border-emerald-500/40 hover:border-emerald-400',
      bannerGradient: 'from-emerald-950/40 via-[#061712] to-emerald-950/20'
    },
    welcome: `¡Saludos! Soy el **Profesor IA de Biología & Moléculas Orgánicas**.
Investigamos la arquitectura molecular de los seres vivos: la respiración celular y síntesis de ATP, la doble hélice de ADN con reglas de apareamiento Watson-Crick, los 20 aminoácidos proteinogénicos, los enlaces peptídicos y grupos funcionales orgánicos, la cinética enzimática de Michaelis-Menten y el modelado macromolecular en AlphaFold DB con bandas de confianza pLDDT.

Dispones de una **Base de Búsqueda de Biología propia** arriba para consultar biomoléculas, proteínas y rutas metabólicas al instante.`,
    suggestedQuestions: [
      '¿Cómo el ATP almacena y transfiere energía libre (ΔG° = -30.5 kJ/mol) a través de sus enlaces fosfoanhídrido?',
      'Explica el carácter planar del enlace peptídico (-CO-NH-) y su impacto en el mapa de Ramachandran.',
      '¿Cómo interpretar las bandas pLDDT de AlphaFold en el oncogén supresor TP53 (P04637)?',
      'Apareamiento de bases en el ADN (A-T con 2 puentes de H vs G-C con 3) y estabilidad de melting.'
    ],
    featuredFigures: [
      { name: 'Rosalind Franklin', field: 'Difracción Rayos X ADN' },
      { name: 'Gregor Mendel', field: 'Leyes de Herencia' },
      { name: 'Jennifer Doudna', field: 'Edición Genética CRISPR' },
      { name: 'Linus Pauling', field: 'Estructuras de Proteínas' }
    ],
    placeholderPractico: 'Pregunta rápida de Biología (ATP, aminoácidos, fórmulas orgánicas)...',
    placeholderTactico: 'Consulta táctica bioquímica (vías metabólicas, kinetics de enzimas)...',
    placeholderImplementario: 'Problema molecular riguroso (conformación 3D, termodinámica biológica)...'
  }
};

function normalizeMode(mode?: string): 'practico' | 'tactico' | 'implementario' {
  const m = (mode || 'practico').toLowerCase();
  if (m === 'practico' || m === 'basic' || m === 'concise') return 'practico';
  if (m === 'tactico' || m === 'full' || m === 'detailed') return 'tactico';
  if (m === 'implementario' || m === 'precise' || m === 'creative') return 'implementario';
  return 'practico';
}

function getInitialMessages(type: ProfessorType): Message[] {
  try {
    const saved = localStorage.getItem(PROFESSORS[type].storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn(`Error loading history for ${type}:`, e);
  }
  return [{ role: 'model', content: PROFESSORS[type].welcome, mode: 'tactico' }];
}

/* ========================================================================= */
/* 1. COMPONENTE: CONFIGURACIÓN GENERAL COMPARTIDA (PLEGABLE / DESPLEGABLE) */
/* ========================================================================= */
interface GlobalConfigHeaderProps {
  chatMode: ChatResponseLevel;
  onChangeChatMode: (mode: ChatResponseLevel) => void;
  onOpenArchitectureModal: () => void;
  onOpenHistoricalModal: () => void;
  isVoiceActive: boolean;
  onToggleVoice: () => void;
}

const GlobalConfigHeader: React.FC<GlobalConfigHeaderProps> = ({
  chatMode,
  onChangeChatMode,
  onOpenArchitectureModal,
  onOpenHistoricalModal,
  isVoiceActive,
  onToggleVoice
}) => {
  const [isConfigFolded, setIsConfigFolded] = useState<boolean>(true); // Empieza plegado por defecto

  const activeNormalizedMode = normalizeMode(chatMode);
  const activeModeConfig = RESPONSE_LEVELS_CONFIG[activeNormalizedMode] || RESPONSE_LEVELS_CONFIG.practico;

  return (
    <div className="rounded-3xl border border-slate-700/80 bg-gradient-to-r from-[#0c1422] via-[#090d18] to-[#0c1422] p-4 shadow-xl transition-all duration-300">
      {/* Barra Resumida (Siempre visible) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Izquierda: Identidad y Modo Activo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0 shadow-md">
            <Settings2 className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm font-mono text-white tracking-wide flex items-center gap-2">
                Configuración General Compartida
              </h2>
              <span className={`text-[10.5px] font-mono px-2.5 py-0.5 rounded-full border font-bold flex items-center gap-1.5 ${
                activeNormalizedMode === 'practico'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : activeNormalizedMode === 'tactico'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/50'
              }`}>
                <span className={`w-2 h-2 rounded-full ${activeNormalizedMode === 'practico' ? 'bg-amber-400' : activeNormalizedMode === 'tactico' ? 'bg-cyan-400' : 'bg-purple-400'} animate-pulse`} />
                <span>{activeModeConfig.name} ({activeModeConfig.model})</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans line-clamp-1">
              Los 3 chats independientes (Química, Cuántica y Orgánicos) ejecutan sus respuestas bajo este mismo modo común.
            </p>
          </div>
        </div>

        {/* Derecha: Botones Rápidos y Plegar/Desplegar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Selector de modo rápido */}
          <div className="flex items-center bg-[#050810] border border-slate-700/80 rounded-xl p-1 gap-1">
            {((['practico', 'tactico', 'implementario'] as const)).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => onChangeChatMode(m)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 ${
                  activeNormalizedMode === m
                    ? m === 'practico'
                      ? 'bg-amber-400 text-black shadow-md'
                      : m === 'tactico'
                        ? 'bg-cyan-500 text-black shadow-md'
                        : 'bg-purple-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={RESPONSE_LEVELS_CONFIG[m].objective}
              >
                {m === 'practico' ? <Zap className="w-3 h-3" /> : m === 'tactico' ? <BookOpen className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                <span className="capitalize hidden md:inline">
                  {m === 'practico' ? '1. Práctico' : m === 'tactico' ? '2. Táctico' : '3. Implementario'}
                </span>
              </button>
            ))}
          </div>

          {/* Voz global */}
          <button
            type="button"
            onClick={onToggleVoice}
            className={`p-1.5 px-2.5 rounded-xl text-xs font-mono transition border flex items-center gap-1.5 ${
              isVoiceActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Activar o desactivar lectura fonética por voz"
          >
            {isVoiceActive ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isVoiceActive ? 'Voz ON' : 'Voz OFF'}</span>
          </button>

          {/* Botón Plegar / Desplegar la Configuración */}
          <button
            type="button"
            onClick={() => setIsConfigFolded(!isConfigFolded)}
            className="p-1.5 px-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-mono text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
            title={isConfigFolded ? 'Desplegar panel de configuración detallada' : 'Plegar panel de configuración'}
          >
            {isConfigFolded ? (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                <span>Desplegar Config</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Plegar Config</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Contenido Extendido de la Configuración (visible cuando está desplegado) */}
      {!isConfigFolded && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3.5 animate-in fade-in">
          {/* Ficha técnica detallada del modo */}
          <div className="p-3.5 rounded-2xl bg-[#050810]/90 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-500 block text-[10px] uppercase font-bold mb-0.5">Modelo & Generación</span>
              <span className="text-slate-200 font-semibold">{activeModeConfig.model} • {activeModeConfig.generation}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-500 block text-[10px] uppercase font-bold mb-0.5">Hiperparámetros de Inferencia</span>
              <span className="text-slate-200 font-semibold">Temperatura: {activeModeConfig.temperature} • Máx Tokens: {activeModeConfig.maxOutputTokens}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-500 block text-[10px] uppercase font-bold mb-0.5">Enfoque Metodológico</span>
              <span className="text-slate-200 font-semibold truncate block">{activeModeConfig.badge}</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {activeModeConfig.objective}
          </p>

          {/* Accesos rápidos a Modales Científicos */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={onOpenArchitectureModal}
                className="px-3 py-1.5 rounded-xl border border-cyan-500/50 bg-cyan-950/40 hover:bg-cyan-900/50 hover:border-cyan-400 text-cyan-300 font-mono text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Explorar Arquitectura Gemini (3 Generaciones)</span>
              </button>

              <button
                type="button"
                onClick={onOpenHistoricalModal}
                className="px-3 py-1.5 rounded-xl border border-amber-500/50 bg-amber-950/40 hover:bg-amber-900/50 hover:border-amber-400 text-amber-300 font-mono text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                <Landmark className="w-3.5 h-3.5 text-amber-400" />
                <span>Dossier de Personajes Históricos</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              Configuración sincronizada en los 3 chats
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ========================================================================= */
/* 2. COMPONENTE: CHAT INDEPENDIENTE PLEGABLE / DESPLEGABLE                  */
/* ========================================================================= */
interface IndependentChatProps {
  config: ProfessorConfig;
  messages: Message[];
  onSendMessage: (query: string, mode: ChatResponseLevel) => Promise<void>;
  onResetChat: () => void;
  isLoading: boolean;
  isVoiceActive: boolean;
  speechController: SpeechController;
  sharedChatMode: ChatResponseLevel;
}

const IndependentProfessorChat: React.FC<IndependentChatProps> = ({
  config,
  messages,
  onSendMessage,
  onResetChat,
  isLoading,
  isVoiceActive,
  speechController,
  sharedChatMode
}) => {
  const [isChatFolded, setIsChatFolded] = useState<boolean>(true); // Cada chat empieza plegado por defecto
  const [inputQuery, setInputQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [currentlyPlayingMessageIndex, setCurrentlyPlayingMessageIndex] = useState<number | null>(null);
  const [isPlayingAny, setIsPlayingAny] = useState(false);
  const [readingProgress, setReadingProgress] = useState<string>('');
  
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeNormalizedMode = normalizeMode(sharedChatMode);

  useEffect(() => {
    if (!isChatFolded) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isChatFolded]);

  const handlePlayMessage = (content: string, index: number) => {
    if (currentlyPlayingMessageIndex === index) {
      speechController.stop();
      setCurrentlyPlayingMessageIndex(null);
      setIsPlayingAny(false);
      setReadingProgress('');
      return;
    }

    setCurrentlyPlayingMessageIndex(index);
    setIsPlayingAny(true);
    setReadingProgress('Iniciando lectura...');

    speechController.speak(
      content,
      () => {
        setIsPlayingAny(true);
        setCurrentlyPlayingMessageIndex(index);
      },
      () => {
        setCurrentlyPlayingMessageIndex(null);
        setIsPlayingAny(false);
        setReadingProgress('');
      },
      (current, total) => {
        setReadingProgress(`Leyendo ${current} de ${total}`);
      }
    );
  };

  const handleStopAllSpeech = () => {
    speechController.stop();
    setCurrentlyPlayingMessageIndex(null);
    setIsPlayingAny(false);
    setReadingProgress('');
  };

  const handleSend = () => {
    const trimmed = inputQuery.trim();
    if (!trimmed || isLoading) return;
    setInputQuery('');
    handleStopAllSpeech();
    onSendMessage(trimmed, activeNormalizedMode);
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setInputQuery(transcript);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const isChemistry = config.type === 'chemistry';
  const isBioscience = config.type === 'bioscience';

  /* ----------------------------------------------------------------------- */
  /* CASO 1: CHAT PLEGADO                                                    */
  /* ----------------------------------------------------------------------- */
  if (isChatFolded) {
    return (
      <div className={`rounded-3xl border p-4 shadow-xl transition-all duration-300 ${config.theme.bgPanel} ${config.theme.border} ${config.theme.glow}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Icono, Título y Especialidad */}
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${config.theme.badge} shadow-md`}>
              {isBioscience ? (
                <Dna className="w-6 h-6 text-emerald-400" />
              ) : isChemistry ? (
                <FlaskConical className="w-6 h-6 text-cyan-400" />
              ) : (
                <Atom className="w-6 h-6 text-purple-400 animate-spin-slow" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm font-mono text-white tracking-wide">
                  {config.title}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-slate-700 bg-slate-900/90 text-slate-400">
                  {messages.length} msgs
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-sans line-clamp-1 max-w-xl">
                {config.tagline}
              </div>
            </div>
          </div>

          {/* Botón Plegar / Desplegar */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-[10.5px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
              <Database className="w-3 h-3 text-slate-400" />
              <span>Base Propia Indexada</span>
            </div>

            <button
              type="button"
              onClick={() => setIsChatFolded(false)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg ${config.theme.sendBtn}`}
              title={`Desplegar el chat de ${config.shortTitle}`}
            >
              <span>Desplegar Chat</span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------------------------- */
  /* CASO 2: CHAT DESPLEGADO                                                 */
  /* ----------------------------------------------------------------------- */
  return (
    <div className={`flex flex-col h-[740px] rounded-3xl border p-4 shadow-2xl transition-all duration-300 ${config.theme.bgPanel} ${config.theme.border} ${config.theme.glow}`}>
      {/* Cabecera del Chat Abierto */}
      <div className="border-b border-slate-800/80 pb-3 mb-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${config.theme.badge} shadow-md`}>
            {isBioscience ? (
              <Dna className="w-5 h-5 text-emerald-400" />
            ) : isChemistry ? (
              <FlaskConical className="w-5 h-5 text-cyan-400" />
            ) : (
              <Atom className="w-5 h-5 text-purple-400 animate-spin-slow" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm font-mono text-white tracking-wide">
                {config.title}
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${config.theme.badge}`}>
                Activo
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-sans line-clamp-1 max-w-md">
              {config.tagline}
            </div>
          </div>
        </div>

        {/* Controles de la cabecera: Audio, Reset y Botón Plegar */}
        <div className="flex items-center gap-2">
          {isPlayingAny && (
            <button
              type="button"
              onClick={handleStopAllSpeech}
              className="p-1.5 px-2.5 rounded-xl text-xs font-mono bg-emerald-500/25 text-emerald-300 border border-emerald-400 animate-pulse flex items-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Detener Voz</span>
            </button>
          )}

          <button
            type="button"
            onClick={onResetChat}
            className="p-1.5 px-2.5 rounded-xl text-slate-400 hover:text-red-400 bg-slate-900 border border-slate-800 transition flex items-center gap-1 text-xs font-mono"
            title="Reiniciar conversación de este chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>

          {/* Botón para Plegar este Chat */}
          <button
            type="button"
            onClick={() => setIsChatFolded(true)}
            className="p-1.5 px-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-mono text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            title={`Plegar el chat de ${config.shortTitle}`}
          >
            <ChevronUp className="w-4 h-4 text-slate-300" />
            <span>Plegar Chat</span>
          </button>
        </div>
      </div>

      {/* Base de Búsqueda Propia de este Chat */}
      <ProfessorSearchBase
        professorType={config.type}
        onSelectPrompt={(prompt) => {
          handleStopAllSpeech();
          onSendMessage(prompt, activeNormalizedMode);
        }}
        onInsertInInput={(text) => {
          setInputQuery(prev => prev ? `${prev} ${text}` : text);
        }}
      />

      {/* Temas rápidos de consulta */}
      <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono scrollbar-none">
        <span className="text-slate-500 text-[10px] uppercase font-bold shrink-0">Temas rápidos:</span>
        {config.suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              handleStopAllSpeech();
              onSendMessage(q, activeNormalizedMode);
            }}
            disabled={isLoading}
            className={`px-2.5 py-1 rounded-full text-[10.5px] border whitespace-nowrap transition text-left shrink-0 bg-slate-900/80 text-slate-300 border-slate-800 hover:text-white ${
              isBioscience ? 'hover:border-emerald-500/40 hover:bg-emerald-950/30' : isChemistry ? 'hover:border-cyan-500/40 hover:bg-cyan-950/30' : 'hover:border-purple-500/40 hover:bg-purple-950/30'
            }`}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Lectura de voz en progreso */}
      {isPlayingAny && readingProgress && (
        <div className="mb-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-[11px] font-mono text-emerald-300">
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Leyendo respuesta sin cortes...</span>
          </div>
          <button
            type="button"
            onClick={handleStopAllSpeech}
            className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/50 hover:bg-emerald-800/60 text-emerald-200 border border-emerald-600/40 transition"
          >
            Pausar
          </button>
        </div>
      )}

      {/* Lista de Mensajes con Scroll */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs scrollbar-thin">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          const isThisPlaying = currentlyPlayingMessageIndex === idx;

          return (
            <div
              key={idx}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${config.theme.badge}`}>
                  {isBioscience ? (
                    <Dna className="w-4 h-4 text-emerald-400" />
                  ) : isChemistry ? (
                    <FlaskConical className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Atom className="w-4 h-4 text-purple-400" />
                  )}
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed shadow-lg relative ${
                  isUser
                    ? `${config.theme.userBubble} rounded-tr-none font-medium whitespace-pre-wrap text-xs`
                    : `${config.theme.modelBubble} rounded-tl-none text-[11.5px]`
                } ${isThisPlaying ? 'ring-2 ring-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : ''}`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 mb-2 pb-1 border-b border-slate-800/60 text-[10px] font-mono text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${config.theme.accentText}`}>
                        {config.title}
                      </span>
                      {m.mode && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] border font-bold uppercase bg-slate-900 text-slate-300 border-slate-700">
                          Modo: {normalizeMode(m.mode)}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePlayMessage(m.content, idx)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 transition border ${
                        isThisPlaying
                          ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400 animate-pulse font-bold'
                          : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-emerald-300 hover:border-emerald-500/30'
                      }`}
                      title={isThisPlaying ? 'Detener lectura' : 'Escuchar por voz'}
                    >
                      {isThisPlaying ? (
                        <>
                          <Volume2 className="w-3 h-3 text-emerald-400" />
                          <span>Detener</span>
                        </>
                      ) : (
                        <>
                          <Volume1 className="w-3 h-3" />
                          <span>Leer</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
                
                {isUser ? m.content : <ChatMessageContent content={m.content} />}

                {/* Pie de metadatos del modelo */}
                {!isUser && (m.modelUsed || m.generation || m.latencyMs) && (
                  <div className="mt-2.5 pt-1.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[10px] font-mono gap-2 text-slate-400">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {m.modelUsed && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-300 border border-slate-800 font-bold">
                          {m.modelUsed}
                        </span>
                      )}
                      {m.config && (
                        <span className="text-slate-400">
                          T: {m.config.temperature} • max {m.config.maxOutputTokens} tok
                        </span>
                      )}
                    </div>
                    {m.latencyMs ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5" /> {m.latencyMs}ms
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800/90 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 items-center text-slate-400 text-xs font-mono">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${config.theme.badge}`}>
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <span className="italic text-[11px] animate-pulse">
              {config.shortTitle} está resolviendo con el motor científico...
            </span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Grabación de voz activa */}
      {isRecording && (
        <div className="p-2 mb-2 rounded-xl bg-red-950/40 border border-red-500/50 flex items-center justify-between text-xs font-mono text-red-300 animate-pulse">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-400 animate-ping" />
            <span>Escuchando tu voz para {config.shortTitle}...</span>
          </div>
          <span className="text-[10px] text-slate-400">Pulsa de nuevo para finalizar</span>
        </div>
      )}

      {/* Barra de Entrada */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleRecording}
          className={`p-2.5 rounded-xl transition border flex items-center justify-center ${
            isRecording
              ? 'bg-red-500/20 text-red-300 border-red-500 animate-bounce'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-emerald-400 hover:border-emerald-500/40'
          }`}
          title="Dictar pregunta con micrófono"
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder={
            activeNormalizedMode === 'practico'
              ? config.placeholderPractico
              : activeNormalizedMode === 'implementario'
                ? config.placeholderImplementario
                : config.placeholderTactico
          }
          disabled={isLoading}
          className="flex-1 bg-[#050910] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-slate-600 font-sans transition shadow-inner"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!inputQuery.trim() || isLoading}
          className={`p-2.5 px-4 rounded-xl transition font-medium shadow-md flex items-center gap-1.5 ${
            !inputQuery.trim() || isLoading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : config.theme.sendBtn
          }`}
          title="Enviar consulta"
        >
          <span className="text-xs font-mono">Enviar</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 3. COMPONENTE PRINCIPAL PROFESSOR CHAT                                    */
/* ========================================================================= */
export const ProfessorChat: React.FC = () => {
  // 1 sola configuración compartida en común para los 3 chats
  const [sharedChatMode, setSharedChatMode] = useState<ChatResponseLevel>('practico');
  const [isGlobalVoiceActive, setIsGlobalVoiceActive] = useState<boolean>(true);

  // Modales
  const [isHistoricalModalOpen, setIsHistoricalModalOpen] = useState<boolean>(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState<boolean>(false);
  const [targetHistoricalProf, setTargetHistoricalProf] = useState<ProfessorType>('chemistry');

  // Controladores de síntesis por voz independientes
  const chemSpeechRef = useRef<SpeechController>(createSpeechController());
  const physSpeechRef = useRef<SpeechController>(createSpeechController());
  const bioSpeechRef = useRef<SpeechController>(createSpeechController());

  // Mensajes y estados de carga de los 3 chats independientes
  const [chemMessages, setChemMessages] = useState<Message[]>(() => getInitialMessages('chemistry'));
  const [chemLoading, setChemLoading] = useState(false);

  const [physMessages, setPhysMessages] = useState<Message[]>(() => getInitialMessages('physics_astrophysics'));
  const [physLoading, setPhysLoading] = useState(false);

  const [bioMessages, setBioMessages] = useState<Message[]>(() => getInitialMessages('bioscience'));
  const [bioLoading, setBioLoading] = useState(false);

  // Persistencia local para cada uno de los 3 chats independientes
  useEffect(() => {
    try {
      localStorage.setItem(PROFESSORS.chemistry.storageKey, JSON.stringify(chemMessages));
    } catch (e) {
      console.warn('Error saving chemistry chat:', e);
    }
  }, [chemMessages]);

  useEffect(() => {
    try {
      localStorage.setItem(PROFESSORS.physics_astrophysics.storageKey, JSON.stringify(physMessages));
    } catch (e) {
      console.warn('Error saving physics chat:', e);
    }
  }, [physMessages]);

  useEffect(() => {
    try {
      localStorage.setItem(PROFESSORS.bioscience.storageKey, JSON.stringify(bioMessages));
    } catch (e) {
      console.warn('Error saving biology chat:', e);
    }
  }, [bioMessages]);

  useEffect(() => {
    return () => {
      chemSpeechRef.current.stop();
      physSpeechRef.current.stop();
      bioSpeechRef.current.stop();
    };
  }, []);

  // Envío genérico que conecta cada chat con su backend o fallback resiliente
  const handleSendToProfessor = async (type: ProfessorType, text: string, mode: ChatResponseLevel) => {
    if (!text.trim()) return;

    const currentMessages = type === 'chemistry' ? chemMessages : type === 'bioscience' ? bioMessages : physMessages;
    const setMessages = type === 'chemistry' ? setChemMessages : type === 'bioscience' ? setBioMessages : setPhysMessages;
    const setLoading = type === 'chemistry' ? setChemLoading : type === 'bioscience' ? setBioLoading : setPhysLoading;
    const speechController = type === 'chemistry' ? chemSpeechRef.current : type === 'bioscience' ? bioSpeechRef.current : physSpeechRef.current;

    const normalizedMode = normalizeMode(mode);
    const updated: Message[] = [...currentMessages, { role: 'user', content: text }];
    setMessages(updated);
    setLoading(true);

    let reply = '';
    let modelUsed = '';
    let generation = '';
    let latencyMs = 0;
    let returnedConfig: { temperature?: number; maxOutputTokens?: number } | undefined = undefined;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: updated,
          professorType: type,
          mode: normalizedMode,
          level: normalizedMode,
        }),
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        reply = data.reply || '';
        modelUsed = data.modelUsed || '';
        generation = data.generation || '';
        latencyMs = data.latencyMs || 0;
        returnedConfig = data.config;
      }
    } catch (err) {
      console.warn(`Aviso de red para ${type}, activando motor científico local resiliente:`, err);
    }

    if (!reply) {
      const fallback = generateScientificFallback(type, text, normalizedMode);
      reply = fallback.reply;
      modelUsed = fallback.modelUsed;
      generation = fallback.generation || 'Gemini 3.5 / 3.8';
    }

    setMessages((prev) => [
      ...prev,
      { 
        role: 'model', 
        content: reply, 
        mode: normalizedMode,
        modelUsed,
        generation,
        latencyMs,
        config: returnedConfig
      }
    ]);

    if (isGlobalVoiceActive && reply) {
      speechController.speak(reply);
    }

    setLoading(false);
  };

  const handleReset = (type: ProfessorType) => {
    if (type === 'chemistry') {
      chemSpeechRef.current.stop();
      const fresh: Message[] = [{ role: 'model', content: PROFESSORS.chemistry.welcome, mode: 'tactico' }];
      setChemMessages(fresh);
      try {
        localStorage.setItem(PROFESSORS.chemistry.storageKey, JSON.stringify(fresh));
      } catch (e) {
        console.warn('Error resetting chemistry chat:', e);
      }
    } else if (type === 'bioscience') {
      bioSpeechRef.current.stop();
      const fresh: Message[] = [{ role: 'model', content: PROFESSORS.bioscience.welcome, mode: 'tactico' }];
      setBioMessages(fresh);
      try {
        localStorage.setItem(PROFESSORS.bioscience.storageKey, JSON.stringify(fresh));
      } catch (e) {
        console.warn('Error resetting biology chat:', e);
      }
    } else {
      physSpeechRef.current.stop();
      const fresh: Message[] = [{ role: 'model', content: PROFESSORS.physics_astrophysics.welcome, mode: 'tactico' }];
      setPhysMessages(fresh);
      try {
        localStorage.setItem(PROFESSORS.physics_astrophysics.storageKey, JSON.stringify(fresh));
      } catch (e) {
        console.warn('Error resetting physics chat:', e);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1 SOLA CONFIGURACIÓN EN COMÚN (PLEGABLE / DESPLEGABLE)                     */}
      {/* ========================================================================= */}
      <GlobalConfigHeader
        chatMode={sharedChatMode}
        onChangeChatMode={setSharedChatMode}
        onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
        onOpenHistoricalModal={() => {
          setTargetHistoricalProf('chemistry');
          setIsHistoricalModalOpen(true);
        }}
        isVoiceActive={isGlobalVoiceActive}
        onToggleVoice={() => setIsGlobalVoiceActive(!isGlobalVoiceActive)}
      />

      {/* ========================================================================= */}
      {/* LOS 3 CHATS INDEPENDIENTES (CADA UNO SE PUEDE PLEGAR Y DESPLEGAR)         */}
      {/* ========================================================================= */}
      <div className="space-y-5">
        {/* CHAT 1: QUÍMICA & SÍNTESIS MOLECULAR */}
        <IndependentProfessorChat
          config={PROFESSORS.chemistry}
          messages={chemMessages}
          onSendMessage={(q, mode) => handleSendToProfessor('chemistry', q, mode)}
          onResetChat={() => handleReset('chemistry')}
          isLoading={chemLoading}
          isVoiceActive={isGlobalVoiceActive}
          speechController={chemSpeechRef.current}
          sharedChatMode={sharedChatMode}
        />

        {/* CHAT 2: CUÁNTICA & ASTROFÍSICA */}
        <IndependentProfessorChat
          config={PROFESSORS.physics_astrophysics}
          messages={physMessages}
          onSendMessage={(q, mode) => handleSendToProfessor('physics_astrophysics', q, mode)}
          onResetChat={() => handleReset('physics_astrophysics')}
          isLoading={physLoading}
          isVoiceActive={isGlobalVoiceActive}
          speechController={physSpeechRef.current}
          sharedChatMode={sharedChatMode}
        />

        {/* CHAT 3: BIOLOGÍA & MOLÉCULAS ORGÁNICAS */}
        <IndependentProfessorChat
          config={PROFESSORS.bioscience}
          messages={bioMessages}
          onSendMessage={(q, mode) => handleSendToProfessor('bioscience', q, mode)}
          onResetChat={() => handleReset('bioscience')}
          isLoading={bioLoading}
          isVoiceActive={isGlobalVoiceActive}
          speechController={bioSpeechRef.current}
          sharedChatMode={sharedChatMode}
        />
      </div>

      {/* ========================================================================= */}
      {/* MODALES COMPARTIDOS                                                       */}
      {/* ========================================================================= */}
      <HistoricalAnalysisModal
        isOpen={isHistoricalModalOpen}
        onClose={() => setIsHistoricalModalOpen(false)}
        activeProfessor={targetHistoricalProf}
        fullCalculations={normalizeMode(sharedChatMode) !== 'practico'}
        onSelectPrompt={(targetProf, prompt, fullCalc) => {
          handleSendToProfessor(targetProf, prompt, fullCalc ? 'implementario' : 'practico');
        }}
      />

      <GeminiArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
        activeLevel={sharedChatMode}
        onSelectLevel={(lvl) => {
          setSharedChatMode(lvl);
        }}
      />
    </div>
  );
};
