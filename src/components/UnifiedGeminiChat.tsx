import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Send, 
  Loader2, 
  Volume2, 
  VolumeX, 
  FlaskConical, 
  Atom, 
  Mic, 
  MicOff, 
  Plus, 
  Menu, 
  X, 
  Download, 
  FileText, 
  Code, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  Compass,
  Settings2,
  ChevronDown,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChatMessageContent } from './ChatMessageContent';
import { createSpeechController, SpeechController } from '../utils/speechUtils';
import { generateScientificFallback } from '../utils/scientificFallback';
import { GeminiArchitectureModal, ChatResponseLevel } from './GeminiArchitectureModal';
import { checkHasActiveGoogleDriveSession } from '../utils/driveSession';

export type ScienceDomain = 'organica' | 'inorganica' | 'cuantica' | 'laboratorio';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  mode?: string;
  modelUsed?: string;
  latencyMs?: number;
}

export interface ChatThread {
  id: string;
  title: string;
  domain: ScienceDomain;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

interface DomainConfig {
  id: ScienceDomain;
  badgeLabel: string;
  optionLabel: string;
  icon: string;
  professorType: 'chemistry' | 'bioscience' | 'physics_astrophysics';
  description: string;
  virtualDomain: string;
  welcomePrompt: string;
  suggestions: {
    title: string;
    description: string;
    prompt: string;
  }[];
}

const DOMAIN_CONFIGS: Record<ScienceDomain, DomainConfig> = {
  organica: {
    id: 'organica',
    badgeLabel: 'Química Orgánica',
    optionLabel: '🧪 Química Orgánica',
    icon: '🧪',
    professorType: 'bioscience',
    virtualDomain: 'organica.gemini.sci',
    description: 'Explora mecanismos bio-moleculares, rutas de síntesis orgánica, catálisis enzimática y dinámica conformacional.',
    welcomePrompt: 'Especializada en bioquímica celular, biomoléculas esenciales (ATP, nucleótidos ADN/ARN, glucosa, triglicéridos y fosfolípidos), los 20 aminoácidos estándar, enlaces peptídicos por condensación, puentes de hidrógeno Watson-Crick y predicciones estructurales de AlphaFold DB (pLDDT).',
    suggestions: [
      {
        title: 'Hidrólisis de ATP',
        description: 'Termodinámica de alta energía',
        prompt: '¿Por qué la hidrólisis del ATP a ADP libera tanta energía libre de Gibbs (\\Delta G^{\\circ\\prime} = -30.5\\text{ kJ/mol})?'
      },
      {
        title: 'Doble Hélice de ADN',
        description: 'Apareamiento Watson-Crick',
        prompt: 'Estructura de la doble hélice de ADN: puentes de hidrógeno A-T (2 enlaces) y G-C (3 enlaces) y estabilidad térmica.'
      },
      {
        title: 'Enlace Peptídico',
        description: 'Síntesis por condensación',
        prompt: '¿Cómo se forma un enlace peptídico por condensación entre alanina y glicina? Explica su carácter de doble enlace parcial.'
      },
      {
        title: 'AlphaFold DB & pLDDT',
        description: 'Plegamiento y confianza 3D',
        prompt: 'Explicación de las bandas de confianza pLDDT de AlphaFold (>90 muy alto vs <50 región intrínsecamente desordenada).'
      }
    ]
  },
  inorganica: {
    id: 'inorganica',
    badgeLabel: 'Química Inorgánica',
    optionLabel: '⚛️ Química Inorgánica',
    icon: '⚛️',
    professorType: 'chemistry',
    virtualDomain: 'inorganica.gemini.sci',
    description: 'Fisicoquímica inorgánica, equilibrios iónicos, sales agronómicas (K₂SO₄, KNO₃), alúmina Al₂O₃ y normativas de transporte ADR/NFPA.',
    welcomePrompt: 'Especializada en fisicoquímica inorgánica, equilibrios iónicos y ácido-base, balances de entalpía y energía de Gibbs en neutralizaciones exotérmicas, síntesis de fertilizantes libres de cloruro como K₂SO₄ y KNO₃, cristalización de corindón/alúmina Al₂O₃ y códigos de seguridad ADR (túneles A–E).',
    suggestions: [
      {
        title: 'Fertirrigación K₂SO₄ y KNO₃',
        description: 'Nutrición vegetal sin cloruros',
        prompt: '¿Por qué el \\(K_2SO_4\\) y \\(KNO_3\\) aventajan al KCl en fertirrigación intensiva y suelos de alta conductividad eléctrica?'
      },
      {
        title: 'Génesis de Rubíes y Zafiros',
        description: 'Campo ligando en Al₂O₃',
        prompt: '¿Cómo los iones Cr³⁺ y el par Fe²⁺/Ti⁴⁺ en la red cristalina del corindón (\\(Al_2O_3\\)) originan los colores de rubíes y zafiros?'
      },
      {
        title: 'Restricciones de Túneles ADR',
        description: 'Seguridad en transporte químico',
        prompt: '¿Qué restricciones de túneles ADR (categorías B a E) aplican al transporte de ácido nítrico concentrado HNO₃ (UN 2031)?'
      },
      {
        title: 'Termodinámica de Neutralización',
        description: 'Entalpía ΔH y Gibbs ΔG',
        prompt: 'Balance de entalpía y energía de Gibbs en la neutralización exotérmica de H₂SO₄ con KOH.'
      }
    ]
  },
  cuantica: {
    id: 'cuantica',
    badgeLabel: 'Astrofísica & Cuántica',
    optionLabel: '🌌 Astrofísica & Cuántica',
    icon: '🌌',
    professorType: 'physics_astrophysics',
    virtualDomain: 'cuantica.gemini.space',
    description: 'Mecánica cuántica ondulatoria, densidad de probabilidad |ψ|², efecto túnel cuántico, nucleosíntesis estelar y colapso gravitatorio.',
    welcomePrompt: 'Especializada en física cuántica y astrofísica nuclear: ecuación de Schrödinger, densidad radial |ψ|² de orbitales atómicos, superación de la barrera de Coulomb por efecto túnel de Gamow, cadenas p-p solares, proceso triple alfa de Fred Hoyle y límite de Chandrasekhar.',
    suggestions: [
      {
        title: 'Ecuación de Schrödinger & |ψ|²',
        description: 'Densidad radial en orbitales',
        prompt: 'Ecuación de Schrödinger independiente del tiempo y cálculo de la densidad de probabilidad |\\psi|^2 en orbitales 1s y 2p.'
      },
      {
        title: 'Efecto Túnel Cuántico Solar',
        description: 'Factor de Gamow en fusión nuclear',
        prompt: '¿Cómo el efecto túnel cuántico (factor de Gamow) permite superar la barrera de Coulomb y activar la fusión solar a solo 15 millones K?'
      },
      {
        title: 'Cadena Protón-Protón vs CNO',
        description: 'Nucleosíntesis estelar en el Sol',
        prompt: 'Ciclo protón-protón solar (ramas p-p I, II, III) vs proceso triple-alfa de Fred Hoyle en gigantes rojas.'
      },
      {
        title: 'Límite de Chandrasekhar',
        description: 'Degeneración de Fermi (~1.44 M☉)',
        prompt: 'Derivación física del límite de Chandrasekhar (~1.44 M_\\odot) mediante presión de degeneración relativista de electrones.'
      }
    ]
  },
  laboratorio: {
    id: 'laboratorio',
    badgeLabel: 'Laboratorio & Ensayos',
    optionLabel: '🔬 Laboratorio & Ensayos',
    icon: '🔬',
    professorType: 'chemistry',
    virtualDomain: 'laboratorio.gemini.sci',
    description: 'Simulación de reactivos, cálculo estequiométrico, balanceo redox, diluciones y prevención de riesgos NFPA.',
    welcomePrompt: 'Especializada en prácticas de laboratorio, diluciones seriadas molares, balanceo de reacciones redox mediante ión-electrón, cálculo de reactivo limitante, constantes Kps de precipitación y matriz de incompatibilidad química NFPA 704.',
    suggestions: [
      {
        title: 'Preparación de Buffer Ácido',
        description: 'Henderson-Hasselbalch pH 4.75',
        prompt: '¿Cómo preparar una solución amortiguadora de ácido acético y acetato de sodio a pH 4.75 con cálculo molar exacto?'
      },
      {
        title: 'Matriz de Incompatibilidad ADR',
        description: 'Segregación en almacenamiento',
        prompt: 'Matriz estricta de incompatibilidad: ¿por qué los ácidos no deben almacenarse junto a comburentes ni metales alcalinos?'
      },
      {
        title: 'Balanceo Redox Ión-Electrón',
        description: 'KMnO₄ + H₂O₂ en medio ácido',
        prompt: 'Balanceo paso a paso por el método ión-electrón de la reacción entre permanganato de potasio y peróxido de hidrógeno en H₂SO₄.'
      },
      {
        title: 'Reactivo Limitante en Precipitación',
        description: 'Rendimiento estequiométrico',
        prompt: 'Cálculo estequiométrico de reactivo limitante y masa de precipitado BaSO₄ al mezclar 50 mL de BaCl₂ 0.2M con 75 mL de Na₂SO₄ 0.15M.'
      }
    ]
  }
};

const STORAGE_THREADS_KEY = 'espiqumeyria_gemini_threads_v2';
const STORAGE_ACTIVE_THREAD_ID = 'espiqumeyria_active_thread_id_v2';

interface UnifiedGeminiChatProps {
  initialDomain?: ScienceDomain;
  onNavigateToInstance?: (path: string) => void;
}

export const UnifiedGeminiChat: React.FC<UnifiedGeminiChatProps> = ({ 
  initialDomain = 'organica',
  onNavigateToInstance
}) => {
  const navigate = useNavigate();

  // Active domain state
  const [currentDomain, setCurrentDomain] = useState<ScienceDomain>(initialDomain);
  
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  
  // Threads list and active thread
  const [threads, setThreads] = useState<ChatThread[]>(() => {
    const hasDriveSession = checkHasActiveGoogleDriveSession();
    if (hasDriveSession) {
      try {
        const saved = localStorage.getItem(STORAGE_THREADS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse saved chat threads:', e);
      }
    }
    // Estado 0 predeterminado: 1 hilo nuevo completamente limpio con 0 mensajes
    const initId = 'thread_' + Date.now();
    return [{
      id: initId,
      title: DOMAIN_CONFIGS[initialDomain]?.badgeLabel || 'Química Orgánica',
      domain: initialDomain,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: []
    }];
  });

  const [activeThreadId, setActiveThreadId] = useState<string>(() => {
    const hasDriveSession = checkHasActiveGoogleDriveSession();
    if (hasDriveSession) {
      try {
        const savedId = localStorage.getItem(STORAGE_ACTIVE_THREAD_ID);
        if (savedId) return savedId;
      } catch {}
    }
    return threads[0]?.id || 'thread_default';
  });

  // Current active thread
  const activeThread = useMemo(() => {
    const found = threads.find(t => t.id === activeThreadId);
    if (found) return found;
    return threads[0] || {
      id: 'thread_fallback',
      title: 'Nueva Conversación',
      domain: currentDomain,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: []
    };
  }, [threads, activeThreadId, currentDomain]);

  // Synchronize currentDomain with active thread domain
  useEffect(() => {
    if (activeThread && activeThread.domain !== currentDomain) {
      setCurrentDomain(activeThread.domain);
    }
  }, [activeThread?.id]);

  // Save threads to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_THREADS_KEY, JSON.stringify(threads));
      localStorage.setItem(STORAGE_ACTIVE_THREAD_ID, activeThreadId);
    } catch (e) {
      console.warn('Failed to save threads to localStorage:', e);
    }
  }, [threads, activeThreadId]);

  // Input & message flow state
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [useSearch, setUseSearch] = useState<boolean>(true);
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let chosenMime = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          chosenMime = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          chosenMime = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          chosenMime = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          chosenMime = 'audio/ogg';
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, chosenMime ? { mimeType: chosenMime } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: chosenMime || 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64String = (reader.result as string).split(',')[1];
          if (!base64String) return;
          setIsLoading(true);
          try {
            const res = await fetch('/api/chat/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64String, mimeType: chosenMime || 'audio/webm' })
            });
            if (res.ok) {
              const data = await res.json();
              if (data.transcript) {
                setInputText(data.transcript);
                handleSendMessage(data.transcript);
              }
            } else {
              alert('Error al transcribir el audio con gemini-3.5-transcribe.');
            }
          } catch (err) {
            console.error('Transcription request error:', err);
          } finally {
            setIsLoading(false);
          }
        };

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
    } catch (e) {
      console.error('Microphone access error:', e);
      toggleVoiceDictation();
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
  };

  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState<boolean>(false);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState<boolean>(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [showFormulaHelper, setShowFormulaHelper] = useState<boolean>(false);
  
  // Model settings
  const [responseLevel, setResponseLevel] = useState<ChatResponseLevel>('practico');

  // Audio Speech synthesis
  const [activeAudioMessageId, setActiveAudioMessageId] = useState<string | null>(null);
  const speechCtrlRef = useRef<SpeechController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    speechCtrlRef.current = createSpeechController();
    return () => {
      speechCtrlRef.current?.stop();
    };
  }, []);

  // Reconfiguración de flujo de inicio (Estado 0 predeterminado):
  // Si no detecta una sesión activa de Google Drive, forzar el inicio en estado 0,
  // manteniendo el historial, el panel lateral y todos los módulos secundarios completamente cerrados.
  useEffect(() => {
    const hasDriveSession = checkHasActiveGoogleDriveSession();
    if (!hasDriveSession) {
      setIsSidebarOpen(false);
      setIsConfigModalOpen(false);
      setIsNavDropdownOpen(false);
      setIsExportDropdownOpen(false);
      setShowFormulaHelper(false);
    }
  }, []);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeThread?.messages, isLoading]);

  // Domain change handler
  const handleDomainChange = (newDomain: ScienceDomain) => {
    setCurrentDomain(newDomain);
    
    // Update active thread's domain if it has no messages, or create/switch
    if (activeThread.messages.length === 0) {
      setThreads(prev => prev.map(t => {
        if (t.id === activeThread.id) {
          return {
            ...t,
            domain: newDomain,
            title: DOMAIN_CONFIGS[newDomain].badgeLabel
          };
        }
        return t;
      }));
    } else {
      // Find an existing thread in that domain or start a new thread
      const existingInDomain = threads.find(t => t.domain === newDomain);
      if (existingInDomain) {
        setActiveThreadId(existingInDomain.id);
      } else {
        handleNewChat(newDomain);
      }
    }
  };

  // Start new chat thread
  const handleNewChat = (domainToUse?: ScienceDomain) => {
    const domain = domainToUse || currentDomain;
    const newThreadId = 'thread_' + Date.now();
    const newThread: ChatThread = {
      id: newThreadId,
      title: `${DOMAIN_CONFIGS[domain].badgeLabel}`,
      domain,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: []
    };

    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newThreadId);
    setCurrentDomain(domain);
    setInputText('');
    setIsSidebarOpen(false);
  };

  // Delete a chat thread
  const handleDeleteThread = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    if (threads.length <= 1) {
      // Don't leave zero threads, just reset current
      handleNewChat(currentDomain);
      return;
    }
    const remaining = threads.filter(t => t.id !== threadId);
    setThreads(remaining);
    if (activeThreadId === threadId) {
      setActiveThreadId(remaining[0].id);
      setCurrentDomain(remaining[0].domain);
    }
  };

  // Clear messages from active thread (Vaciar conversación actual sin reiniciar contexto científico)
  const handleClearCurrentThread = () => {
    // Purga inmediata de registros temporales de la sesión
    try {
      sessionStorage.removeItem(`chat_session_${activeThread.id}`);
      sessionStorage.removeItem('espiqumeyria_active_session');
    } catch (err) {
      console.warn('Session purge warning:', err);
    }

    // Vaciar vista de mensajes del hilo activo en el DOM sin alterar dominio ni parámetros científicos
    setThreads(prev => {
      const updated = prev.map(t => {
        if (t.id === activeThread.id) {
          return {
            ...t,
            updatedAt: Date.now(),
            messages: []
          };
        }
        return t;
      });
      try {
        localStorage.setItem(STORAGE_THREADS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage sync warning:', e);
      }
      return updated;
    });

    setInputText('');
    setShowFormulaHelper(false);
  };

  // Clear all conversation history (Borrar todo el historial y purgar persistencia)
  const handleClearAllHistory = () => {
    // Purga inmediata de datos persistentes (localStorage y sessionStorage)
    try {
      localStorage.removeItem(STORAGE_THREADS_KEY);
      localStorage.removeItem(STORAGE_ACTIVE_THREAD_ID);
      sessionStorage.clear();
    } catch (err) {
      console.warn('Error purging storage:', err);
    }

    // Reset a Estado 0 manteniendo intacto el contexto y parámetros científicos activos
    const newThreadId = 'thread_' + Date.now();
    const freshThread: ChatThread = {
      id: newThreadId,
      title: DOMAIN_CONFIGS[currentDomain]?.badgeLabel || 'Química Orgánica',
      domain: currentDomain,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: []
    };

    setThreads([freshThread]);
    setActiveThreadId(newThreadId);
    setIsSidebarOpen(false);
    setInputText('');
    setShowFormulaHelper(false);
  };

  // Web Speech Dictation
  const toggleVoiceDictation = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta Web Speech Recognition API.');
      return;
    }

    if (isVoiceListening) {
      recognitionRef.current?.stop();
      setIsVoiceListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsVoiceListening(true);
      recognition.onend = () => setIsVoiceListening(false);
      recognition.onerror = () => setIsVoiceListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsVoiceListening(false);
    }
  };

  // Send message
  const handleSendMessage = async (textOverride?: string) => {
    const query = (textOverride || inputText).trim();
    if (!query || isLoading) return;

    setInputText('');
    setShowFormulaHelper(false);

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: query,
      timestamp: Date.now()
    };

    // Update active thread title if this is the first message
    const domainCfg = DOMAIN_CONFIGS[currentDomain];
    const newTitle = activeThread.messages.length === 0 
      ? query.slice(0, 36) + (query.length > 36 ? '...' : '') 
      : activeThread.title;

    const updatedMessages = [...activeThread.messages, userMessage];

    // Optimistically update thread
    setThreads(prev => prev.map(t => {
      if (t.id === activeThread.id) {
        return {
          ...t,
          title: newTitle,
          domain: currentDomain,
          updatedAt: Date.now(),
          messages: updatedMessages
        };
      }
      return t;
    }));

    setIsLoading(true);

    try {
      // Build conversation payload for backend
      const apiMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const startTime = performance.now();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          professorType: domainCfg.professorType,
          mode: responseLevel,
          level: responseLevel,
          domain: currentDomain,
          useSearch
        })
      });

      let modelReplyText = '';
      let modelUsed = 'Gemini 3.5 Flash';
      let latencyMs = Math.round(performance.now() - startTime);

      if (res.ok) {
        const data = await res.json();
        modelReplyText = data.text || data.reply || '';
        if (data.modelUsed) modelUsed = data.modelUsed;
        if (data.latencyMs) latencyMs = data.latencyMs;
      } else {
        // Fallback to offline scientific logic
        console.warn('Backend API unavailable, using offline scientific engine');
        const fallback = generateScientificFallback(domainCfg.professorType, query, responseLevel);
        modelReplyText = fallback.reply;
        modelUsed = fallback.modelUsed;
      }

      if (!modelReplyText) {
        const fallback = generateScientificFallback(domainCfg.professorType, query, responseLevel);
        modelReplyText = fallback.reply;
      }

      const modelMessage: ChatMessage = {
        id: 'msg_model_' + Date.now(),
        role: 'model',
        content: modelReplyText,
        timestamp: Date.now(),
        mode: responseLevel,
        modelUsed,
        latencyMs
      };

      setThreads(prev => prev.map(t => {
        if (t.id === activeThread.id) {
          return {
            ...t,
            updatedAt: Date.now(),
            messages: [...updatedMessages, modelMessage]
          };
        }
        return t;
      }));

    } catch (err: any) {
      console.warn('Error during chat request:', err);
      const fallback = generateScientificFallback(domainCfg.professorType, query, responseLevel);
      const modelMessage: ChatMessage = {
        id: 'msg_model_' + Date.now(),
        role: 'model',
        content: fallback.reply,
        timestamp: Date.now(),
        mode: responseLevel,
        modelUsed: `${fallback.modelUsed} (Resiliencia Offline)`
      };

      setThreads(prev => prev.map(t => {
        if (t.id === activeThread.id) {
          return {
            ...t,
            updatedAt: Date.now(),
            messages: [...updatedMessages, modelMessage]
          };
        }
        return t;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Audio Playback
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (activeAudioMessageId === msgId) {
      speechCtrlRef.current?.stop();
      setActiveAudioMessageId(null);
    } else {
      speechCtrlRef.current?.stop();
      setActiveAudioMessageId(msgId);
      speechCtrlRef.current?.speak(text);
    }
  };

  // Copy to clipboard
  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export Chat (Markdown / JSON)
  const handleExportMarkdown = () => {
    const domainCfg = DOMAIN_CONFIGS[currentDomain];
    const dateStr = new Date().toISOString().slice(0, 10);
    let md = `# Historial de Conversación Científica - Espiqumeyria AI\n`;
    md += `**Dominio**: ${domainCfg.badgeLabel} (${domainCfg.virtualDomain})\n`;
    md += `**Fecha de exportación**: ${new Date().toLocaleString('es-ES')}\n`;
    md += `**Modo de razonamiento**: ${responseLevel}\n`;
    md += `**Total de mensajes**: ${activeThread.messages.length}\n\n`;
    md += `---\n\n`;

    activeThread.messages.forEach((msg, idx) => {
      const speaker = msg.role === 'user' ? '👤 Usuario' : '✦ Espiqumeyria AI (Gemini Science)';
      const time = new Date(msg.timestamp).toLocaleTimeString('es-ES');
      md += `### ${idx + 1}. ${speaker} [${time}]\n\n`;
      md += `${msg.content}\n\n`;
      if (msg.modelUsed) {
        md += `*Modelo: ${msg.modelUsed}${msg.latencyMs ? ` | Latencia: ${msg.latencyMs}ms` : ''}*\n\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-${currentDomain}-${dateStr}.md`;
    link.click();
    URL.revokeObjectURL(url);
    setIsExportDropdownOpen(false);
  };

  const handleExportJson = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const exportData = {
      app: 'Espiqumeyria AI - Gemini Science',
      version: '2.5',
      exportDate: new Date().toISOString(),
      thread: activeThread,
      domainConfig: DOMAIN_CONFIGS[currentDomain]
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-${currentDomain}-${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setIsExportDropdownOpen(false);
  };

  const activeDomainCfg = DOMAIN_CONFIGS[currentDomain];

  // Quick scientific formula shortcuts
  const FORMULA_SNIPPETS = [
    { label: 'ATP ➔ ADP', snippet: 'ATP + H2O -> ADP + Pi + H+ (Delta G = -30.5 kJ/mol)' },
    { label: 'ADN A-T / G-C', snippet: 'A=T (2 puentes de H), G≡C (3 puentes de H)' },
    { label: 'Alúmina Al₂O₃', snippet: 'Al2O3 corindón dopado con Cr3+ (rubí) o Fe2+/Ti4+ (zafiro)' },
    { label: 'Fertilizante K₂SO₄', snippet: 'K2SO4 sulfato de potasio libre de cloruros' },
    { label: 'Schrödinger', snippet: 'i\\hbar \\frac{\\partial \\psi}{\\partial t} = \\hat{H}\\psi' },
    { label: 'Efecto Túnel', snippet: 'Factor de Gamow P \\approx e^{-2\\pi \\eta} en fusión estelar' },
    { label: 'Túnel ADR E', snippet: 'Restricción ADR Categoría E: Prohibición total de mercancías peligrosas' },
    { label: 'Buffer pH', snippet: 'pH = pKa + \\log([A^-]/[HA])' },
  ];

  return (
    <div 
      id="chatWorkspaceContainer"
      className="gemini-bg text-slate-200 h-full w-full flex-1 overflow-hidden flex flex-col antialiased relative select-text"
    >
      
      {/* Main App Layout */}
      <div className="flex h-full w-full relative overflow-hidden flex-1 min-h-0">

        {/* Mobile Sidebar Backdrop */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity duration-300" 
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-slate-950/95 md:bg-slate-950/50 backdrop-blur-xl border-r border-slate-800/60 flex flex-col transition-transform duration-300 shrink-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          
          {/* Brand & Mobile Close */}
          <div className="p-4 flex items-center justify-between border-b border-slate-800/40">
            <div className="flex items-center gap-2">
              <span className="sparkle-gradient text-xl font-bold">✦</span>
              <span className="font-semibold text-slate-100 tracking-wide text-sm uppercase">Espiqumeyria AI</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg"
              title="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="px-4 py-3">
            <button 
              onClick={() => handleNewChat()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-full glass-panel hover:bg-slate-800/80 transition-all text-sm font-medium text-slate-200 group border border-slate-700/50 shadow-md cursor-pointer"
            >
              <Plus className="w-5 h-5 text-sky-400 group-hover:rotate-90 transition-transform duration-300" />
              <span>Nuevo Chat</span>
            </button>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 min-h-0">
            <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>Historial</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                  {threads.length}
                </span>
              </span>
              {threads.length > 0 && (
                <button
                  id="btnClearAllHistory"
                  type="button"
                  onClick={handleClearAllHistory}
                  className="text-[10px] font-mono text-rose-400/80 hover:text-rose-300 hover:underline flex items-center gap-1 p-1 rounded hover:bg-rose-950/40 transition cursor-pointer"
                  title="Borrar todo el historial de conversaciones y purgar almacenamiento"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Borrar todo</span>
                </button>
              )}
            </div>

            <div className="space-y-1">
              {threads.map((thread) => {
                const isActive = thread.id === activeThread.id;
                const domCfg = DOMAIN_CONFIGS[thread.domain] || activeDomainCfg;
                return (
                  <div 
                    key={thread.id}
                    onClick={() => {
                      setActiveThreadId(thread.id);
                      setCurrentDomain(thread.domain);
                      setIsSidebarOpen(false);
                    }}
                    className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-sky-500/15 border border-sky-500/30 text-white font-medium shadow-sm' 
                        : 'text-slate-300 hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <span className="shrink-0 text-sm">{domCfg.icon}</span>
                      <div className="truncate flex flex-col text-left">
                        <span className="truncate">{thread.title || 'Conversación'}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(thread.updatedAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteThread(e, thread.id)}
                      className="opacity-70 sm:opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition shrink-0 cursor-pointer"
                      title="Eliminar este hilo del historial"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-slate-800/60 flex items-center justify-between glass-panel mt-auto shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                AG
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-200 leading-tight">amateur_grisha</span>
                <span className="text-xs text-sky-400 font-mono">Premium Science</span>
              </div>
            </div>

            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition"
              title="Configuración de IA Gemini"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Main Content Area (Single Chat Workspace) */}
        <main className="flex-1 flex flex-col h-full min-h-0 relative overflow-hidden min-w-0">
          
          {/* Top Navigation & Domain Selector */}
          <header className="h-14 md:h-16 px-4 md:px-8 flex items-center justify-between z-10 border-b border-slate-800/40 shrink-0 bg-slate-950/30 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg glass-panel cursor-pointer"
                title="Abrir historial"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Domain Selector Dropdown (Exact user specification) */}
              <div className="relative inline-block text-left">
                <select 
                  id="domainSelector" 
                  value={currentDomain}
                  onChange={(e) => handleDomainChange(e.target.value as ScienceDomain)}
                  className="appearance-none glass-pill text-slate-100 font-medium text-sm rounded-full px-4 py-2 pr-9 cursor-pointer hover:border-sky-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/40 shadow-md"
                >
                  <option value="organica" className="bg-slate-900 text-slate-200">🧪 Química Orgánica</option>
                  <option value="inorganica" className="bg-slate-900 text-slate-200">⚛️ Química Inorgánica</option>
                  <option value="cuantica" className="bg-slate-900 text-slate-200">🌌 Astrofísica & Cuántica</option>
                  <option value="laboratorio" className="bg-slate-900 text-slate-200">🔬 Laboratorio & Ensayos</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {/* Navigation button to other labs */}
              <div className="relative">
                <button
                  onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)}
                  className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-300 px-3 py-1.5 rounded-full glass-panel hover:bg-slate-800/60 transition cursor-pointer"
                  title="Navegación científica orgánica"
                >
                  <Compass className="w-3.5 h-3.5 text-sky-400" />
                  <span>Laboratorios</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {isNavDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 glass-pill rounded-xl shadow-2xl border border-slate-700/80 p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400">Mundos Científicos</div>
                    <button
                      onClick={() => { setIsNavDropdownOpen(false); navigate('/workspace'); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 text-slate-200 flex items-center gap-2"
                    >
                      <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Laboratorio Químico</span>
                    </button>
                    <button
                      onClick={() => { setIsNavDropdownOpen(false); navigate('/atom-builder'); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 text-slate-200 flex items-center gap-2"
                    >
                      <Atom className="w-3.5 h-3.5 text-purple-400" />
                      <span>Constructor Atómico 3D</span>
                    </button>
                    <button
                      onClick={() => { setIsNavDropdownOpen(false); navigate('/physics-engine'); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 text-slate-200 flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Motor Físico 3D</span>
                    </button>
                    <button
                      onClick={() => { setIsNavDropdownOpen(false); navigate('/molecular-viewer'); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 text-slate-200 flex items-center gap-2"
                    >
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Visualizador Molecular 3D</span>
                    </button>
                    <button
                      onClick={() => { setIsNavDropdownOpen(false); navigate('/periodic-table'); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 text-slate-200 flex items-center gap-2"
                    >
                      <Atom className="w-3.5 h-3.5 text-blue-400" />
                      <span>Tabla Periódica 118Z</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Header Right Actions: Export Button + Domain Badge Indicator */}
            <div className="flex items-center gap-2.5">
              
              {/* Export Chat Dropdown (Markdown / JSON as requested in prompts 6, 7, 8) */}
              <div className="relative">
                <button
                  onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                  disabled={activeThread.messages.length === 0}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-full glass-panel hover:bg-slate-800/70 border border-slate-700/60 transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  title="Exportar conversación en Markdown o JSON"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Exportar Chat</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isExportDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 glass-pill rounded-xl shadow-2xl border border-slate-700/80 p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase">Formato de Exportación</div>
                    <button
                      onClick={handleExportMarkdown}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-sky-500/20 text-slate-200 flex items-center gap-2.5 transition"
                    >
                      <FileText className="w-4 h-4 text-sky-400" />
                      <div>
                        <div className="font-semibold">Markdown (.md)</div>
                        <div className="text-[10px] text-slate-400">Texto formateado con LaTeX</div>
                      </div>
                    </button>
                    <button
                      onClick={handleExportJson}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-sky-500/20 text-slate-200 flex items-center gap-2.5 transition"
                    >
                      <Code className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-semibold">JSON (.json)</div>
                        <div className="text-[10px] text-slate-400">Datos estructurados y metadatos</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Botón para borrar el historial de la conversación actual */}
              <button
                id="btnClearCurrentChat"
                type="button"
                onClick={handleClearCurrentThread}
                disabled={activeThread.messages.length === 0}
                className="flex items-center gap-1.5 text-xs font-medium text-rose-300 hover:text-rose-100 px-3 py-1.5 rounded-full glass-panel hover:bg-rose-950/60 border border-rose-500/40 transition cursor-pointer shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Borrar historial de la conversación actual"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Borrar Historial</span>
              </button>

              {/* Domain Badge Indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono bg-sky-950/40 border border-sky-800/40 text-sky-300 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
                <span id="activeDomainBadge">{activeDomainCfg.badgeLabel}</span>
              </div>
            </div>
          </header>

          {/* Scrollable Chat Body: ONLY this element scrolls */}
          <div 
            id="chatBody" 
            data-scroll-area="chatScrollArea"
            className="flex-1 overflow-y-auto px-4 md:px-8 py-6 flex flex-col items-center min-h-0 w-full"
          >
            
            {/* Welcome Screen (Shown when active thread is empty) */}
            {activeThread.messages.length === 0 ? (
              <div id="welcomeContainer" className="my-auto flex flex-col items-center text-center max-w-xl px-4 py-8 animate-in fade-in duration-500">
                <div className="sparkle-gradient text-6xl md:text-7xl mb-6 animate-pulse-slow">✦</div>
                <h1 className="text-2xl md:text-4xl font-light text-slate-100 tracking-tight mb-3">
                  El escenario es tuyo, <span className="font-normal text-sky-300">amateur_grisha</span>
                </h1>
                <p className="text-sm md:text-base text-slate-400 max-w-md mx-auto mb-8 font-light" id="domainDescription">
                  {activeDomainCfg.description}
                </p>

                {/* Quick Suggestion Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full" id="suggestionCards">
                  {activeDomainCfg.suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="text-left p-3.5 rounded-2xl glass-panel hover:bg-slate-800/80 transition-all border border-slate-700/50 hover:border-sky-500/40 group flex flex-col justify-between cursor-pointer"
                    >
                      <div className="font-medium text-sm text-slate-200 group-hover:text-sky-300 transition-colors">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {item.description}
                      </div>
                      <div className="mt-3 flex items-center text-[11px] text-sky-400 font-mono gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Consultar</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Messages Container (Visible when there are messages) */
              <div id="messagesContainer" className="w-full max-w-3xl space-y-6 pb-6 animate-in fade-in">
                {activeThread.messages.map((message) => {
                  const isUser = message.role === 'user';
                  const isAudioActive = activeAudioMessageId === message.id;

                  if (isUser) {
                    return (
                      <div key={message.id} className="flex justify-end animate-in slide-in-from-bottom-2">
                        <div className="max-w-[85%] sm:max-w-[75%] rounded-3xl rounded-tr-md bg-sky-600/90 text-white px-5 py-3.5 shadow-lg border border-sky-400/30 text-sm md:text-base leading-relaxed">
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <div className="mt-1 text-[10px] text-sky-200/70 text-right font-mono">
                            {new Date(message.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={message.id} className="flex items-start gap-3 animate-in slide-in-from-bottom-2">
                      {/* AI Sparkle Avatar */}
                      <div className="w-8 h-8 rounded-full glass-panel flex items-center justify-center shrink-0 border border-sky-500/30 shadow-md">
                        <span className="sparkle-gradient font-bold text-sm">✦</span>
                      </div>

                      {/* AI Message Bubble */}
                      <div className="flex-1 max-w-[90%] sm:max-w-[85%] rounded-3xl rounded-tl-md glass-panel p-5 border border-slate-700/60 shadow-xl space-y-3">
                        <div className="text-sm md:text-base text-slate-100 leading-relaxed overflow-x-auto">
                          <ChatMessageContent content={message.content} />
                        </div>

                        {/* Footer bar with speech, copy, and latency */}
                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            {/* Audio TTS toggle */}
                            <button
                              onClick={() => handleToggleSpeak(message.id, message.content)}
                              className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                                isAudioActive 
                                  ? 'bg-sky-500 text-slate-950 font-bold' 
                                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                              title={isAudioActive ? 'Pausar locución' : 'Escuchar respuesta por voz'}
                            >
                              {isAudioActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                              <span className="text-[11px] font-mono hidden sm:inline">
                                {isAudioActive ? 'Detener' : 'Voz'}
                              </span>
                            </button>

                            {/* Copy button */}
                            <button
                              onClick={() => handleCopyText(message.id, message.content)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5"
                              title="Copiar texto"
                            >
                              {copiedId === message.id ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span className="text-[11px] text-emerald-400 font-mono">Copiado</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  <span className="text-[11px] font-mono hidden sm:inline">Copiar</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                            {message.modelUsed && <span>{message.modelUsed}</span>}
                            {message.latencyMs && <span>· {message.latencyMs}ms</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex items-start gap-3 animate-in fade-in">
                    <div className="w-8 h-8 rounded-full glass-panel flex items-center justify-center shrink-0 border border-sky-500/30">
                      <span className="sparkle-gradient font-bold text-sm animate-spin">✦</span>
                    </div>
                    <div className="glass-panel rounded-2xl px-5 py-4 border border-slate-700/60 flex items-center gap-3">
                      <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
                      <span className="text-xs font-mono text-slate-300">
                        Espiqumeyria AI procesando deducción científica...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

          </div>

          {/* Quick formula snippet pills (collapsible) */}
          {showFormulaHelper && (
            <div className="max-w-4xl mx-auto w-full px-4 md:px-8 pb-2 animate-in fade-in slide-in-from-bottom-2">
              <div className="glass-panel p-2.5 rounded-2xl border border-slate-700/60 shadow-xl flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] font-mono text-slate-400 px-2 uppercase">Inserción Rápida:</span>
                {FORMULA_SNIPPETS.map((snip, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputText(prev => prev ? `${prev} ${snip.snippet}` : snip.snippet);
                    }}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-slate-700/50 transition cursor-pointer"
                  >
                    {snip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Floating Prompt Bar (Gemini Style Capsule) - Stays strictly fixed at bottom */}
          <div className="w-full shrink-0 px-4 md:px-8 pb-4 pt-2 max-w-4xl mx-auto">
            <div className="glass-pill rounded-3xl p-2 pl-4 flex items-center gap-2 border border-slate-700/60 shadow-2xl transition-all focus-within:border-sky-500/70 focus-within:ring-2 focus-within:ring-sky-500/20">
              
              {/* Plus button to show scientific formula snippets */}
              <button 
                type="button"
                onClick={() => setShowFormulaHelper(!showFormulaHelper)}
                title="Atajos de fórmulas y reactivos" 
                className={`p-2 transition-colors rounded-full hover:bg-slate-800/50 cursor-pointer ${
                  showFormulaHelper ? 'text-sky-400 bg-slate-800/80' : 'text-slate-400 hover:text-sky-300'
                }`}
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Google Search Grounding Toggle */}
              <button
                type="button"
                onClick={() => setUseSearch(!useSearch)}
                title={useSearch ? "Google Search Grounding activo" : "Activar Google Search Grounding"}
                className={`px-2.5 py-1 rounded-full text-xs font-mono flex items-center gap-1 transition cursor-pointer ${
                  useSearch 
                    ? 'bg-sky-500/20 border border-sky-500/40 text-sky-300' 
                    : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🔍</span>
                <span className="hidden sm:inline">Search</span>
              </button>

              {/* Primary User Input with Protected DOM ID references */}
              <input 
                type="text" 
                id="userInput" 
                data-alt-id="chatInput"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Pregúntale a Gemini sobre ciencia (o graba audio)..." 
                className="flex-1 bg-transparent border-0 text-slate-100 placeholder-slate-400 text-sm md:text-base focus:outline-none focus:ring-0 py-2.5"
                autoComplete="off"
                disabled={isLoading}
              />

              {/* Gemini 3.5 Transcribe Audio Recording Button */}
              <button 
                type="button"
                id="transcribeAudioBtn" 
                onClick={isRecordingAudio ? stopAudioRecording : startAudioRecording}
                title={isRecordingAudio ? "Detener grabación y transcribir con Gemini 3.5 Transcribe" : "Grabar audio y transcribir con Gemini 3.5 Transcribe"} 
                className={`p-2 transition-colors rounded-full hover:bg-slate-800/50 cursor-pointer flex items-center gap-1 ${
                  isRecordingAudio ? 'text-red-400 animate-pulse bg-red-950/50' : 'text-slate-400 hover:text-sky-300'
                }`}
              >
                <Mic className="w-5 h-5" />
                {isRecordingAudio && <span className="text-[10px] font-mono pr-1 text-red-300">Grabando...</span>}
              </button>

              {/* Web Speech Dictation fallback button */}
              <button 
                type="button"
                id="voiceBtn" 
                onClick={toggleVoiceDictation}
                title={isVoiceListening ? 'Detener dictado web' : 'Dictado web por voz'} 
                className={`p-2 transition-colors rounded-full hover:bg-slate-800/50 cursor-pointer hidden sm:flex ${
                  isVoiceListening ? 'text-amber-400 animate-pulse bg-amber-950/40' : 'text-slate-400 hover:text-sky-300'
                }`}
              >
                {isVoiceListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 opacity-70" />}
              </button>

              {/* Send Button */}
              <button 
                type="button"
                id="sendBtn" 
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isLoading}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 p-2.5 rounded-full transition-all flex items-center justify-center font-bold disabled:opacity-40 disabled:hover:bg-sky-500 cursor-pointer shadow-md"
                title="Enviar consulta"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between px-3 mt-2 text-[11px] text-slate-500 font-light">
              <span>Gemini puede cometer errores. Verifica la información científica crucial.</span>
              <span className="font-mono">Espiqumeyria v2.5</span>
            </div>
          </div>

        </main>
      </div>

      {/* Architecture / Gemini Settings Modal */}
      {isConfigModalOpen && (
        <GeminiArchitectureModal
          isOpen={isConfigModalOpen}
          activeLevel={responseLevel}
          onSelectLevel={(level) => {
            setResponseLevel(level);
            setIsConfigModalOpen(false);
          }}
          onClose={() => setIsConfigModalOpen(false)}
        />
      )}

    </div>
  );
};
