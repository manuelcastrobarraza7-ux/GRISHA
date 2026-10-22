/**
 * Audio Speech Utility for Espiquumeyria Professors
 * Converts LaTeX formulas, mathematical notation and scientific markdown
 * into natural spoken Spanish and manages sequential chunk playback so
 * long responses are read COMPLETELY without cutting off.
 */

export function prepareTextForSpeech(text: string): string {
  if (!text) return '';

  let clean = text;

  // 1. Remove LaTeX display math environments
  clean = clean.replace(/\$\$\begin\{aligned\}[\s\S]*?\end\{aligned\}\$\$/g, (match) => {
    return match
      .replace(/\$\$\begin\{aligned\}|\end\{aligned\}\$\$/g, '')
      .replace(/&=/g, ' es igual a ')
      .replace(/&/g, ' ')
      .replace(/\\\\/g, '. ');
  });

  // 2. Remove block math $$ ... $$ and \[ ... \]
  clean = clean.replace(/\$\$([\s\S]*?)\$\$/g, ' $1 ');
  clean = clean.replace(/\\\[([\s\S]*?)\\\]/g, ' $1 ');

  // 3. Clean inline math \( ... \) and $ ... $
  clean = clean.replace(/\\\(([\s\S]*?)\\\)/g, ' $1 ');
  clean = clean.replace(/\$([^\$\n]+?)\$/g, ' $1 ');

  // 4. Translate common chemical and mathematical symbols to natural spoken Spanish
  clean = clean.replace(/\\rightarrow|\\to/g, ' reacciona para dar ');
  clean = clean.replace(/\\leftarrow/g, ' proviene de ');
  clean = clean.replace(/\\rightleftharpoons/g, ' en equilibrio reversible con ');
  clean = clean.replace(/\\Delta G/g, ' variación de energía libre de Gibbs ');
  clean = clean.replace(/\\Delta H/g, ' entalpía de reacción ');
  clean = clean.replace(/\\Delta S/g, ' variación de entropía ');
  clean = clean.replace(/\\Delta/g, ' variación ');
  clean = clean.replace(/\\hbar/g, ' constante reducida de Planck ');
  clean = clean.replace(/\\partial/g, ' derivada parcial ');
  clean = clean.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 sobre $2');
  clean = clean.replace(/\\sqrt\{([^}]+)\}/g, ' raíz cuadrada de $1 ');
  clean = clean.replace(/\\times/g, ' multiplicado por ');
  clean = clean.replace(/\\cdot/g, ' por ');
  clean = clean.replace(/\\pm/g, ' más o menos ');
  clean = clean.replace(/\\text\{([^}]+)\}/g, ' $1 ');
  clean = clean.replace(/\\mathrm\{([^}]+)\}/g, ' $1 ');
  clean = clean.replace(/\\mathbf\{([^}]+)\}/g, ' $1 ');
  clean = clean.replace(/\\hat\{([^}]+)\}/g, ' operador $1 ');
  clean = clean.replace(/\\langle/g, ' estado ket ');
  clean = clean.replace(/\\rangle/g, ' ');
  clean = clean.replace(/\\Psi/g, ' función de onda Psi ');
  clean = clean.replace(/\\psi/g, ' psi ');
  clean = clean.replace(/\\alpha/g, ' partícula alfa ');
  clean = clean.replace(/\\beta/g, ' radiación beta ');
  clean = clean.replace(/\\gamma/g, ' radiación gamma ');
  clean = clean.replace(/\\lambda/g, ' longitud de onda lambda ');
  clean = clean.replace(/\\rho/g, ' densidad rho ');
  clean = clean.replace(/\\propto/g, ' directamente proporcional a ');
  clean = clean.replace(/\\sim/g, ' aproximadamente ');
  clean = clean.replace(/\\approx/g, ' aproximadamente igual a ');
  clean = clean.replace(/\\leq/g, ' menor o igual que ');
  clean = clean.replace(/\\geq/g, ' mayor o igual que ');
  clean = clean.replace(/\\neq/g, ' distinto de ');
  clean = clean.replace(/\\infty/g, ' infinito ');
  clean = clean.replace(/\\quad/g, ', ');
  clean = clean.replace(/\\qquad/g, ', ');
  clean = clean.replace(/M_\\odot|M_☉/g, ' masas solares ');
  clean = clean.replace(/M_J/g, ' masas de Júpiter ');

  // 5. Clean chemical subscripts and superscripts formatted with braces: e.g. K_{2}SO_{4} -> K2SO4
  clean = clean.replace(/_\{([^}]+)\}/g, '$1');
  clean = clean.replace(/\^\{([^}]+)\}/g, ' $1');
  clean = clean.replace(/_([0-9a-zA-Z])/g, '$1');
  clean = clean.replace(/\^([0-9a-zA-Z])/g, ' $1');

  // 6. Remove markdown formatting elements
  clean = clean.replace(/#{1,6}\s*/g, ''); // headings
  clean = clean.replace(/\*\*([^*]+)\*\*/g, '$1'); // bold
  clean = clean.replace(/\*([^*]+)\*/g, '$1'); // italic
  clean = clean.replace(/__([^_]+)__/g, '$1');
  clean = clean.replace(/_([^_]+)_/g, '$1');
  clean = clean.replace(/`([^`]+)`/g, '$1'); // inline code
  clean = clean.replace(/```[\s\S]*?```/g, ''); // code blocks
  clean = clean.replace(/^\s*[-*+]\s+/gm, '. '); // bullet lists
  clean = clean.replace(/^\s*\d+\.\s+/gm, '. '); // numbered lists
  clean = clean.replace(/---+/g, ' '); // dividers
  clean = clean.replace(/\|/g, ' '); // tables

  // 7. Strip leftover backslashes and special brackets
  clean = clean.replace(/[\\]/g, ' ');

  // 8. Normalize spacing and punctuation for clean prosody
  clean = clean.replace(/\s+/g, ' ').trim();
  clean = clean.replace(/\.\s*\./g, '.');

  return clean;
}

/**
 * Splits text into sentence chunks under 140 chars to prevent browser SpeechSynthesis timeouts.
 */
export function splitTextIntoChunks(text: string, maxChunkLen = 140): string[] {
  if (!text) return [];

  // Match sentences ending with punctuation or newline
  const rawSentences = text.match(/[^.!?\n;:]+[.!?\n;:]*/g) || [text];
  const chunks: string[] = [];

  for (const sentence of rawSentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (trimmed.length <= maxChunkLen) {
      chunks.push(trimmed);
    } else {
      // Split on comma or whitespace if sentence exceeds maxChunkLen
      const parts = trimmed.split(/,\s*/);
      let currentPart = '';
      for (const p of parts) {
        if ((currentPart + ', ' + p).length <= maxChunkLen) {
          currentPart = currentPart ? currentPart + ', ' + p : p;
        } else {
          if (currentPart) chunks.push(currentPart);
          currentPart = p;
        }
      }
      if (currentPart) chunks.push(currentPart);
    }
  }

  return chunks.length > 0 ? chunks : [text];
}

export interface SpeechController {
  speak: (
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    onChunkProgress?: (current: number, total: number) => void
  ) => void;
  stop: () => void;
  isPlaying: () => boolean;
}

/**
 * Creates an independent Speech Controller that speaks full multi-paragraph texts without cutting off.
 */
export function createSpeechController(): SpeechController {
  let isCancelled = false;
  let currentlyPlaying = false;

  const stop = () => {
    isCancelled = true;
    currentlyPlaying = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const speak = (
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    onChunkProgress?: (current: number, total: number) => void
  ) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Cancel any active speech
    stop();
    isCancelled = false;

    const cleanedText = prepareTextForSpeech(text);
    if (!cleanedText) {
      onEnd?.();
      return;
    }

    const chunks = splitTextIntoChunks(cleanedText);
    if (chunks.length === 0) {
      onEnd?.();
      return;
    }

    currentlyPlaying = true;
    onStart?.();

    let currentIndex = 0;

    // Pick Spanish voice
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es') || v.lang.includes('ES'));

    const speakChunk = () => {
      if (isCancelled || currentIndex >= chunks.length) {
        currentlyPlaying = false;
        onEnd?.();
        return;
      }

      onChunkProgress?.(currentIndex + 1, chunks.length);

      const chunkText = chunks[currentIndex];
      const utterance = new SpeechSynthesisUtterance(chunkText);
      utterance.lang = 'es-ES';
      utterance.rate = 1.02;
      utterance.pitch = 1.0;
      if (esVoice) utterance.voice = esVoice;

      utterance.onend = () => {
        if (!isCancelled) {
          currentIndex++;
          speakChunk();
        }
      };

      utterance.onerror = (e) => {
        if (e.error !== 'canceled' && !isCancelled) {
          currentIndex++;
          speakChunk();
        } else {
          currentlyPlaying = false;
          onEnd?.();
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    speakChunk();
  };

  const isPlaying = () => currentlyPlaying;

  return { speak, stop, isPlaying };
}

// Global shared speech player for convenience
export const globalSpeechController = createSpeechController();
