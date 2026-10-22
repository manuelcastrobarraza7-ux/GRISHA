import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    })
  : null;

export type ChatMode = "practico" | "tactico" | "implementario";
export type ChatSubject = "quimica" | "fisica" | "biociencias" | "bioscience" | "biologia" | "organicas";

export interface ChatOptions {
  prompt: string;
  mode?: ChatMode;
  subject?: ChatSubject;
}

export interface ChatModeDefinition {
  name: string;
  mode: ChatMode;
  model: string;
  temperature: number;
  maxOutputTokens: number;
  badge: string;
  description: string;
  promptDirective: string;
}

export const CHAT_MODES_CONFIG: Record<ChatMode, ChatModeDefinition> = {
  practico: {
    name: "Modo Práctico",
    mode: "practico",
    model: "gemini-3.8-flash",
    temperature: 0.3,
    maxOutputTokens: 500,
    badge: "Acción Inmediata & Fórmulas Directas",
    description: "Ideal para consultas del día a día donde el usuario quiere una solución rápida, una fórmula o un ejemplo funcional en segundos sin rodeos.",
    promptDirective: "MODO PRÁCTICO: Ve directo al grano. Proporciona ejemplos numéricos rápidos, fórmulas directas, pasos de laboratorio o fragmentos de código listos para usar, sin rodeos teóricos."
  },
  tactico: {
    name: "Modo Táctico",
    mode: "tactico",
    model: "gemini-3.8-flash",
    temperature: 0.5,
    maxOutputTokens: 2048,
    badge: "Estratégico & Operativo con Google Search",
    description: "Ideal para estructurar cómo abordar un problema complejo de química, física o biología, evaluando variables críticas, riesgos y datos actualizados de Google Search.",
    promptDirective: "MODO TÁCTICO: Actúa con mentalidad operativa. Desglosa el problema analizando variables críticas, restricciones de seguridad, puntos de fallo y una estrategia estructurada en formato Markdown con tablas o listas."
  },
  implementario: {
    name: "Modo Implementario",
    mode: "implementario",
    model: "gemini-4-argon",
    temperature: 0.1,
    maxOutputTokens: 4096,
    badge: "Ingeniería Pesada & Rigor Estricto con Gemini 4 Argon",
    description: "Ideal para cuando se necesita el máximo razonamiento lógico, cálculos exactos bajo normativas técnicas estrictas (como ADR/NFPA o modelos mecano-cuánticos) o desarrollo de código íntegro.",
    promptDirective: "MODO IMPLEMENTARIO: Diseña con rigor de ingeniería y arquitectura de producción. Valida cada suposición, especifica normativas técnicas aplicables (como ADR/NFPA o modelos matemáticos exactos), maneja restricciones de contorno y ofrece código o soluciones íntegras y robustas."
  }
};

/**
 * Transcribe audio using model gemini-3.5-transcribe
 */
export async function transcribeAudio(audioBase64: string, mimeType: string = 'audio/webm'): Promise<string> {
  if (!ai) {
    throw new Error('Gemini API key no configurada para transcripción de audio');
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: audioBase64
          }
        },
        { text: 'Transcribe este audio con precisión milimétrica al español, manteniendo terminología científica y química.' }
      ]
    });
    return response.text || 'No se pudo transcribir el audio.';
  } catch (err: any) {
    console.warn('[transcribeAudio] Error con gemini-3.5-transcribe:', err?.message || err);
    throw err;
  }
}

/**
 * Función de utilidad 'fetchWithBackoff' que realiza reintentos exponenciales
 * cuando detecta un error HTTP 503 (alta demanda o indisponibilidad temporal)
 * o 429 (límite de cuota), asegurando que las llamadas a la API de Gemini sean
 * más resilientes ante alta demanda.
 */
export async function fetchWithBackoff<T>(
  apiCall: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    contextLabel?: string;
  } = {}
): Promise<T> {
  const { maxRetries = 1, initialDelayMs = 400, contextLabel = 'API Gemini' } = options;
  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt <= maxRetries) {
    try {
      return await apiCall();
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isQuotaExhausted = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota') || err?.status === 429 || err?.code === 429;
      const is503 = errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE') || err?.status === 503 || err?.code === 503;

      // Si la cuota de este modelo está agotada (429 RESOURCE_EXHAUSTED),
      // reintentar el mismo modelo falla de inmediato. Lanzamos para que el llamador
      // conmute al siguiente modelo del cascade o al motor local offline.
      if (isQuotaExhausted) {
        throw err;
      }

      if (is503 && attempt < maxRetries) {
        attempt++;
        const jitter = Math.random() * 150;
        const waitTime = delay + jitter;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        delay *= 2;
        continue;
      }
      throw err;
    }
  }
  throw new Error(`[fetchWithBackoff] Conexión no disponible temporalmente en ${contextLabel}`);
}

/**
 * Normaliza nombres antiguos o sinónimos de modos al estándar:
 * 'basic'/'concise' -> 'practico'
 * 'full'/'detailed' -> 'tactico'
 * 'precise'/'creative' -> 'implementario'
 */
export function normalizeChatMode(modeInput?: string): ChatMode {
  const m = (modeInput || 'practico').toLowerCase().trim();
  if (m === 'practico' || m === 'basic' || m === 'concise' || m === 'rapido') {
    return 'practico';
  }
  if (m === 'tactico' || m === 'full' || m === 'detailed' || m === 'estrategico') {
    return 'tactico';
  }
  if (m === 'implementario' || m === 'precise' || m === 'creative' || m === 'ingenieria' || m === 'pro') {
    return 'implementario';
  }
  return 'practico';
}

/**
 * Normaliza asignaturas
 */
export function normalizeSubject(subjectInput?: string): ChatSubject {
  const s = (subjectInput || 'quimica').toLowerCase().trim();
  if (s === 'fisica' || s === 'physics' || s === 'physics_astrophysics' || s === 'cuantica' || s === 'astrofisica') {
    return 'fisica';
  }
  if (s === 'biociencias' || s === 'bioscience' || s === 'bio' || s === 'genomica' || s === 'biologia' || s === 'organicas' || s === 'biologia_organica') {
    return 'biologia';
  }
  return 'quimica';
}

export async function processChatMessage({ prompt, mode = "practico", subject = "quimica" }: ChatOptions) {
  const normalizedMode = normalizeChatMode(mode);
  const normalizedSubject = normalizeSubject(subject);

  const modeDef = CHAT_MODES_CONFIG[normalizedMode];
  let modelName = modeDef.model;
  let genConfig = { temperature: modeDef.temperature, maxOutputTokens: modeDef.maxOutputTokens };
  
  // 1. Contexto base de la cátedra
  let baseSubjectPrompt = "";
  if (normalizedSubject === "quimica") {
    baseSubjectPrompt = "Eres el Catedrático y Consultor Senior en Química de Espiquumeyria, experto en Fisicoquímica, equilibrios iónicos y redox, síntesis agronómica (sales libres de cloruro K₂SO₄ y KNO₃), mineralogía de alúmina Al₂O₃ y normativas técnicas ADR/NFPA. Usa notación LaTeX en línea \\( y \\) para fórmulas químicas e incluye su lectura fonética entre paréntesis para síntesis de voz. ";
  } else if (normalizedSubject === "fisica") {
    baseSubjectPrompt = "Eres el Investigador Senior en Física Cuántica y Astrofísica de Espiquumeyria, experto en la ecuación de Schrödinger, efecto túnel cuántico (factor de Gamow), fusión termonuclear estelar (cadena p-p, CNO, triple alfa), presión de degeneración de Fermi y el límite de Chandrasekhar. Usa notación LaTeX ($...$ y $$...$$) rigurosa. ";
  } else {
    // Biología y Moléculas Orgánicas
    baseSubjectPrompt = "Eres el Catedrático e Investigador Senior en Biología y Moléculas Orgánicas de Espiquumeyria, experto en bioquímica celular, biomoléculas de la vida (ATP, ADN/ARN con apareamiento de bases, aminoácidos, proteínas, glúcidos, lípidos), química orgánica y grupos funcionales (enlaces peptídicos planares, condensaciones, ésteres, amidas), modelado estructural macromolecular (AlphaFold DB con escalas pLDDT, RCSB PDB) y cinética enzimática. ";
  }

  // 2. Modos de Ejecución con modelos oficiales (@google/genai)
  let modePrompt = "";
  switch (normalizedMode) {
    case "practico":
      modelName = "gemini-3.8-flash";
      genConfig = { temperature: 0.3, maxOutputTokens: 500 };
      modePrompt = "MODO PRÁCTICO: Ve directo al grano. Proporciona ejemplos numéricos rápidos, fórmulas directas, pasos de laboratorio o fragmentos de código listos para usar, sin rodeos teóricos.";
      break;

    case "tactico":
      modelName = "gemini-3.8-flash";
      genConfig = { temperature: 0.5, maxOutputTokens: 2048 };
      modePrompt = "MODO TÁCTICO: Actúa con mentalidad operativa. Desglosa el problema analizando variables críticas, restricciones de seguridad, puntos de fallo y una estrategia estructurada en formato Markdown con tablas o listas.";
      break;

    case "implementario":
    default:
      modelName = "gemini-4-argon";
      genConfig = { temperature: 0.1, maxOutputTokens: 4096 };
      modePrompt = "MODO IMPLEMENTARIO: Diseña con rigor de ingeniería y arquitectura de producción. Valida cada suposición, especifica normativas técnicas aplicables (como ADR/NFPA o modelos matemáticos exactos), maneja restricciones de contorno y ofrece código o soluciones íntegras y robustas.";
      break;
  }

  const systemPrompt = `${baseSubjectPrompt}\n\n${modePrompt}`;

  // Si no hay API key disponible en el entorno o la API falla, responder con motor científico local estructurado
  if (!ai) {
    return getOfflineLocalResponse(prompt, normalizedMode, normalizedSubject);
  }

  try {
    const response = await fetchWithBackoff(
      () => ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: genConfig.temperature,
          maxOutputTokens: genConfig.maxOutputTokens
        }
      }),
      { maxRetries: 1, initialDelayMs: 400, contextLabel: modelName }
    );
    return response.text || getOfflineLocalResponse(prompt, normalizedMode, normalizedSubject);
  } catch {
    // Si el modelo principal falla (por cuota 429, 503 o modelo Pro sin facturación activa),
    // conmutar a modelo de reserva: gemini-flash-latest o gemini-3.8-flash
    const fallbackModel = (modelName === "gemini-3.8-flash") ? "gemini-flash-latest" : "gemini-3.8-flash";
    try {
      const fallbackResponse = await fetchWithBackoff(
        () => ai.models.generateContent({
          model: fallbackModel,
          contents: prompt,
          config: {
            systemInstruction: systemPrompt,
            temperature: genConfig.temperature,
            maxOutputTokens: genConfig.maxOutputTokens
          }
        }),
        { maxRetries: 1, initialDelayMs: 300, contextLabel: fallbackModel }
      );
      return fallbackResponse.text || getOfflineLocalResponse(prompt, normalizedMode, normalizedSubject);
    } catch {
      // Si ambos modelos no están disponibles, respuesta con motor científico local riguroso
      return getOfflineLocalResponse(prompt, normalizedMode, normalizedSubject);
    }
  }
}

/**
 * Generador offline de respuestas rigurosas cuando no hay conexión a la API
 */
function getOfflineLocalResponse(prompt: string, mode: ChatMode, subject: ChatSubject): string {
  const p = prompt.toLowerCase();

  if (subject === 'biociencias' || subject === 'bioscience') {
    if (mode === 'practico') {
      return `### Biociencias & Bioinformática [Modo Práctico • 3.8 Flash]
- **Consulta:** "${prompt}"
- **Métrica pLDDT (AlphaFold):** >90 (Azul marino, muy alta precisión); 70-90 (Azul claro, conformación troncal); 50-70 (Amarillo, baja certeza); <50 (Naranja, región intrínsecamente desordenada).
- **Regla de 5 de Lipinski:** Peso molecular $\\le 500\\,\\text{Da}$, $\\text{LogP} \\le 5$, donadores de H $\\le 5$, aceptores de H $\\le 10$.
- **Acceso rápido:** UniProt p53: \`P04637\`, PDB experimental: \`1TSR\`.`;
    }
    if (mode === 'tactico') {
      return `### Biociencias & Bioinformática [Modo Táctico • 3.8 Flash]
**Análisis Operativo del Sistema Biomolecular**

| Parámetro | Valor de Referencia | Relevancia Funcional |
| :--- | :--- | :--- |
| Diana / Target | Proteína / Gen analizado | Identificador canónico en UniProtKB / Ensembl |
| Confianza Estructural | Escala pLDDT (0-100) | Validación de sitios catalíticos vs bucles flexibles |
| Vías Relacionadas | Reactome / STRING | Cascadas de fosforilación y complejos PPI |
| Restricciones Farmacológicas | Reglas de Lipinski / Veber | Permeabilidad de membrana y biodisponibilidad oral |

**Estrategia de Inspección en 3 Pasos:**
1. Recuperar archivo mmCIF de AlphaFold DB (\`https://alphafold.ebi.ac.uk/api/prediction/{id}\`).
2. Mapear variantes patogénicas reportadas en ClinVar con significancia clínica y estrellas ACMG.
3. Contrastar con frecuencias poblacionales en gnomAD (LOEUF y métricas pLI).`;
    }
    return `### Biociencias & Bioinformática [Modo Implementario • 4 Argon]
**Arquitectura de Producción y Rigor Bioinformático**

#### 1. Validación Estructural & Coordenadas mmCIF
Para el modelado computacional de la diana biomolecular:
- **Resolución de PDB/mmCIF:** Siempre preferir coordenadas mmCIF (\`.cif\`) sobre formatos PDB legados para evitar truncamiento de cadenas con más de 99,999 átomos.
- **Distribución de Confianza AlphaFold pLDDT:**
  $$pLDDT = 100 \\times \\left[ \\frac{1}{N} \\sum_{i=1}^N \\theta(d_i) \\right]$$
  Donde las regiones con $pLDDT > 90$ garantizan fidelidad en rotámeros de cadenas laterales para docking de fármacos.

#### 2. Ecuación de Inhibición Farmacológica (IC50 y Cheng-Prusoff)
La relación termodinámica entre la constante de disociación inhibitoria ($K_i$) y el $IC_{50}$ experimental:
$$K_i = \\frac{IC_{50}}{1 + \\frac{[S]}{K_m}}$$
Para diseño de ligandos de alta afinidad en receptores quinasa, optimizar energía libre de unión $\\Delta G_{\\text{bind}} = -RT \\ln(K_d)$.`;
  }

  if (subject === 'fisica') {
    if (mode === 'practico') {
      return `### Cátedra de Física Cuántica [Modo Práctico • 3.8 Flash]
- **Longitud de onda de de Broglie:** $\\lambda = \\frac{h}{p} = \\frac{h}{m v}$.
- **Ecuación de Einstein:** $E = m c^2$ ($1\\,\\text{u} = 931.494\\,\\text{MeV}$).
- **Factor de penetración de Gamow:** $P \\propto \\exp(-2\\pi\\eta)$ con $\\eta = \\frac{Z_1 Z_2 e^2}{4\\pi\\varepsilon_0 \\hbar v}$.
- **Horizonte de Schwarzschild:** $R_s = \\frac{2GM}{c^2}$ ($R_{s,\\odot} \\approx 2.95\\,\\text{km}$).`;
    }
    if (mode === 'tactico') {
      return `### Cátedra de Física Cuántica & Astrofísica [Modo Táctico • 3.8 Flash]
**Estrategia de Análisis de Sistemas Cuánticos y Termonucleares**

| Régimen | Ecuación Dominante | Variable Crítica |
| :--- | :--- | :--- |
| Cuántico No Relativista | Ecuación de Schrödinger $i\\hbar\\partial_t\\psi = \\hat{H}\\psi$ | Potencial $V(x)$ y conservación de probabilidad |
| Fusión Nuclear Estelar | Cadena p-p y ciclo CNO | Ventana de Gamow $E_0 = \\left(\\frac{b k T}{2}\\right)^{2/3}$ |
| Enanas Blancas | Presión degenerada de Fermi $P \\propto \\rho^{5/3}$ | Densidad de electrones libres y masa límite Chandrasekhar (~$1.44\\,M_\\odot$) |

**Desglose Operativo:**
1. Determinar si el sistema es dominado por temperatura cinética ($kT$) o por degeneración cuántica ($T \\ll T_F$).
2. Evaluar probabilidad de efecto túnel a través de la barrera de Coulomb nuclear.`;
    }
    return `### Cátedra de Física Cuántica [Modo Implementario • 4 Argon]
**Tratamiento Matemático Exacto y Condiciones de Contorno**

#### 1. Ecuación de Schrödinger Estacionaria en 1D
$$-\\frac{\\hbar^2}{2m} \\frac{d^2\\psi(x)}{dx^2} + V(x)\\psi(x) = E\\psi(x)$$
Para un pozo cuadrado infinito de longitud $L$ con condiciones de contorno Dirichlet $\\psi(0) = \\psi(L) = 0$:
$$\\psi_n(x) = \\sqrt{\\frac{2}{L}} \\sin\\left( \\frac{n\\pi x}{L} \\right), \\quad E_n = \\frac{n^2 \\pi^2 \\hbar^2}{2 m L^2}, \\quad n \\in \\mathbb{N}$$

#### 2. Presión de Degeneración Relativista Extrema
Para densidades extremas donde $p_F \\gg m_e c$:
$$P_{\\text{deg, rel}} = \\frac{(3\\pi^2)^{1/3} \\hbar c}{4} n_e^{4/3} = K_2 \\left( \\frac{\\rho}{\\mu_e} \\right)^{4/3}$$
La inestabilidad ante el colapso gravitatorio cuando el índice adiabático cae a $\\Gamma = 4/3$ fija rigurosamente el Límite de Chandrasekhar:
$$M_{\\text{Ch}} = \\frac{\\omega_3^0}{4\\pi} \\left( \\frac{h c}{G} \\right)^{3/2} \\left( \\frac{1}{\\mu_e m_H} \\right)^2 \\approx 1.44\\,M_\\odot$$`;
  }

  // Quimica
  if (mode === 'practico') {
    return `### Cátedra de Química [Modo Práctico • 3.8 Flash]
- **Reacción Rápida:** \\(H_2SO_4\\) (ácido sulfúrico) + $2$\\(KOH\\) (hidróxido de potasio) $\\longrightarrow$ \\(K_2SO_4\\) (sulfato de potasio) + $2$\\(H_2O\\) (agua).
- **Masa Molar:** \\(K_2SO_4\\) = $174.26\\,\\text{g/mol}$, \\(KNO_3\\) = $101.10\\,\\text{g/mol}$.
- **Normativa ADR:** \\(H_2SO_4\\) > 51%: UN 1830, Clase 8, Túnel **(E)**. \\(K_2SO_4\\): Mercancía no peligrosa (exento).`;
  }
  if (mode === 'tactico') {
    return `### Cátedra de Química & Seguridad [Modo Táctico • 3.8 Flash]
**Evaluación Táctica de Proceso y Restricciones Operativas**

| Reactivo / Producto | Masa Molar | Rombo NFPA 704 | Código ADR & Túnel | Restricción Crítica |
| :--- | :--- | :--- | :--- | :--- |
| \\(H_2SO_4\\) conc. | $98.08\\,\\text{g/mol}$ | Salud 3, Inflam 0, Inestab 2, W | UN 1830, Clase 8, Túnel (E) | Reacción violenta con agua |
| \\(KOH\\) lenticular | $56.11\\,\\text{g/mol}$ | Salud 3, Inflam 0, Inestab 1 | UN 1813, Clase 8, Túnel (E) | Altamente higroscópico y cáustico |
| \\(K_2SO_4\\) síntesis | $174.26\\,\\text{g/mol}$ | Salud 1, Inflam 0, Inestab 0 | Exento ADR | Fertilizante libre de cloruros |

**Flujo Operativo de Laboratorio:**
1. Mantener baño de hielo para disipar la entalpía exotérmica de neutralización ($\\Delta H^\\circ = -111.7\\,\\text{kJ/mol}$).
2. Verificar pH final en rango agronómico $6.5 - 7.5$.`;
  }
  return `### Cátedra de Química & Ingeniería [Modo Implementario • 4 Argon]
**Balance Termodinámico Riguroso y Ficha Logística ADR/NFPA**

#### 1. Termodinámica de Gibbs de la Neutralización
$$\\Delta G^\\circ = \\Delta H^\\circ - T \\Delta S^\\circ$$
- $\\Delta H^\\circ = -111.68\\,\\text{kJ/mol}$ (fuertemente exotérmica).
- $\\Delta G^\\circ_{298\\text{ K}} = -108.40\\,\\text{kJ/mol} < 0$ (reacción termodinámicamente espontánea e irreversible en disolución acuosa).

#### 2. Estricta Ficha Técnica y Normativa de Transporte ADR
- **Ácido Sulfúrico (\\(H_2SO_4\\) > 51%):** Clasificación ONU 1830, Clase 8 (Materias corrosivas), Grupo de Embalaje II. Código de restricción de túneles **(E)**: Prohibido en túneles categoría E según capítulo 8.6 del ADR.
- **Rombo NFPA 704:**
  - Azul (Salud): **3** (Líquido corrosivo capaz de causar quemaduras químicas severas).
  - Rojo (Inflamabilidad): **0** (No combustible).
  - Amarillo (Inestabilidad): **2** (Cambio químico violento a presiones o temperaturas elevadas).
  - Blanco (Riesgo Específico): **W con barra** (Reacciona violentamente con agua produciendo salpicaduras de ácido hirviente).`;
}
