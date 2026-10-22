import React, { useState } from 'react';
import { 
  Landmark, 
  Search, 
  X, 
  BookOpen, 
  Award, 
  Sparkles, 
  Send, 
  Atom, 
  FlaskConical, 
  Scale, 
  History, 
  UserCheck, 
  ChevronRight,
  ArrowRight,
  Calculator,
  Zap,
  Globe2
} from 'lucide-react';
import { HISTORICAL_FIGURES, HistoricalFigure } from '../data/historicalFigures';
import { ProfessorType } from './ProfessorChat';

interface HistoricalAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfessor: ProfessorType;
  onSelectPrompt: (professor: ProfessorType, prompt: string, fullCalculations: boolean) => void;
  fullCalculations: boolean;
}

export const HistoricalAnalysisModal: React.FC<HistoricalAnalysisModalProps> = ({
  isOpen,
  onClose,
  activeProfessor,
  onSelectPrompt,
  fullCalculations
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'chemistry' | 'physics' | 'astrophysics'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFigure, setSelectedFigure] = useState<HistoricalFigure>(HISTORICAL_FIGURES[0]);
  const [targetProfessor, setTargetProfessor] = useState<ProfessorType>(activeProfessor);
  const [useCalculations, setUseCalculations] = useState<boolean>(fullCalculations);

  // Custom historical character state
  const [customName, setCustomName] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');

  if (!isOpen) return null;

  const filteredFigures = HISTORICAL_FIGURES.filter(fig => {
    const matchesCat = selectedCategory === 'all' || fig.category === selectedCategory;
    const matchesSearch = 
      fig.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fig.keyAchievement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fig.nationality.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleLaunchAnalysis = (promptText: string) => {
    onSelectPrompt(targetProfessor, promptText, useCalculations);
    onClose();
  };

  const handleLaunchCustom = () => {
    if (!customName.trim()) return;
    const angleText = customQuestion.trim()
      ? customQuestion.trim()
      : 'vida, contexto histórico de su era, aportes clave a la ciencia, experimentos cruciales, fórmulas asociadas y su impacto en la sociedad actual.';
    const prompt = `[ANÁLISIS DE PERSONAJE HISTÓRICO: ${customName.trim()}] Realiza un análisis exhaustivo y riguroso de este personaje histórico: ${angleText}`;
    onSelectPrompt(targetProfessor, prompt, useCalculations);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[88vh] bg-[#070b13] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#09111c] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono tracking-wide">
                  Sistema de Análisis de Personajes Históricos
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 font-semibold">
                  Cátedra Histórica
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Explora las mentes que revolucionaron la química, la física cuántica y el cosmos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Professor Destination Selector */}
            <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <span className="text-[10px] text-slate-400 px-1.5 uppercase font-bold">Consultar a:</span>
              <button
                type="button"
                onClick={() => setTargetProfessor('chemistry')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 text-[11px] ${
                  targetProfessor === 'chemistry'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FlaskConical className="w-3 h-3 text-cyan-400" />
                <span>Prof. Química</span>
              </button>
              <button
                type="button"
                onClick={() => setTargetProfessor('physics_astrophysics')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 text-[11px] ${
                  targetProfessor === 'physics_astrophysics'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Atom className="w-3 h-3 text-purple-400" />
                <span>Prof. Física</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition border border-transparent hover:border-slate-700"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Header: Search & Category Filters */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-[#060a12] flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs font-mono">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg border transition ${
                selectedCategory === 'all'
                  ? 'bg-slate-800 text-white border-slate-600 font-bold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Todos ({HISTORICAL_FIGURES.length})
            </button>
            <button
              onClick={() => setSelectedCategory('chemistry')}
              className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                selectedCategory === 'chemistry'
                  ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500/60 font-bold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-cyan-300'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
              <span>Química & Materia</span>
            </button>
            <button
              onClick={() => setSelectedCategory('physics')}
              className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                selectedCategory === 'physics'
                  ? 'bg-purple-950/70 text-purple-300 border-purple-500/60 font-bold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-purple-300'
              }`}
            >
              <Atom className="w-3.5 h-3.5 text-purple-400" />
              <span>Física Cuántica</span>
            </button>
            <button
              onClick={() => setSelectedCategory('astrophysics')}
              className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                selectedCategory === 'astrophysics'
                  ? 'bg-indigo-950/70 text-indigo-300 border-indigo-500/60 font-bold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-indigo-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Astrofísica & Cosmos</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar científico o descubrimiento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#040810] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Modal Main Content: Left List & Right Details */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Left Column: Character Library & Custom Input */}
          <div className="md:col-span-5 border-r border-slate-800/80 flex flex-col overflow-hidden bg-[#050811]">
            <div className="p-3 border-b border-slate-800/60 bg-[#070d18] text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>PERSONAJES DESTACADOS ({filteredFigures.length})</span>
              <span className="text-[10px] text-cyan-400">Selecciona para ver dossier</span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
              {filteredFigures.map((fig) => {
                const isSelected = selectedFigure.id === fig.id;
                const isChem = fig.category === 'chemistry';
                const isPhys = fig.category === 'physics';

                return (
                  <div
                    key={fig.id}
                    onClick={() => setSelectedFigure(fig)}
                    className={`p-3 rounded-xl border cursor-pointer transition text-left relative ${
                      isSelected
                        ? isChem
                          ? 'bg-gradient-to-r from-cyan-950/60 to-[#071626] border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                          : isPhys
                            ? 'bg-gradient-to-r from-purple-950/60 to-[#140b29] border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                            : 'bg-gradient-to-r from-indigo-950/60 to-[#0c122e] border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 text-xs font-bold ${
                          isChem 
                            ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' 
                            : isPhys
                              ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                              : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                        }`}>
                          {fig.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white font-mono">
                            {fig.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-sans">
                            {fig.birthDeath} • {fig.nationality}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded border ${
                        isChem
                          ? 'bg-cyan-950/80 text-cyan-400 border-cyan-800/60'
                          : isPhys
                            ? 'bg-purple-950/80 text-purple-400 border-purple-800/60'
                            : 'bg-indigo-950/80 text-indigo-400 border-indigo-800/60'
                      }`}>
                        {fig.category === 'chemistry' ? 'Química' : fig.category === 'physics' ? 'Cuántica' : 'Astrofísica'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 mt-2 line-clamp-1 font-sans">
                      {fig.title}
                    </p>
                  </div>
                );
              })}

              {filteredFigures.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No se encontraron personajes con ese término.
                </div>
              )}
            </div>

            {/* Custom Historical Figure Entry Box */}
            <div className="p-3 border-t border-slate-800/80 bg-[#080d19]">
              <div className="flex items-center gap-2 mb-2 text-xs font-mono text-cyan-300 font-bold">
                <History className="w-3.5 h-3.5" />
                <span>¿Analizar otro personaje histórico libre?</span>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Ej: Nikola Tesla, Arquímedes, Michael Faraday..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[#050912] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enfoque (opcional: inventos, dilemas...)"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    className="flex-1 bg-[#050912] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleLaunchCustom}
                    disabled={!customName.trim()}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 shrink-0 ${
                      !customName.trim()
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20'
                    }`}
                  >
                    <span>Analizar</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: In-depth Character Dossier & Actions */}
          <div className="md:col-span-7 flex flex-col overflow-y-auto p-5 bg-[#060a14] space-y-4">
            
            {/* Character Hero Header */}
            <div className="p-4 rounded-xl border border-slate-800 bg-gradient-to-br from-[#0c1322] to-[#070b14] relative overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedFigure.nationality} • {selectedFigure.birthDeath}
                  </span>
                  <h3 className="text-xl font-bold text-white font-mono mt-1.5">
                    {selectedFigure.name}
                  </h3>
                  <p className="text-xs text-cyan-300 font-mono font-semibold">
                    {selectedFigure.title}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-mono text-slate-400">Destino de análisis:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setTargetProfessor('chemistry')}
                      className={`px-2 py-1 rounded text-[11px] font-mono border transition ${
                        targetProfessor === 'chemistry'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Química
                    </button>
                    <button
                      onClick={() => setTargetProfessor('physics_astrophysics')}
                      className={`px-2 py-1 rounded text-[11px] font-mono border transition ${
                        targetProfessor === 'physics_astrophysics'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-400 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Física/Astro
                    </button>
                  </div>
                </div>
              </div>

              {/* Calculation Mode Toggle for this analysis */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 text-[11px]">Profundidad analítica:</span>
                <button
                  onClick={() => setUseCalculations(!useCalculations)}
                  className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 ${
                    useCalculations
                      ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {useCalculations ? (
                    <>
                      <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Cálculo Completo & Ecuaciones (ON)</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>IA Básica Superficial (OFF)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Dossier Blocks */}
            <div className="space-y-3">
              {/* Logro Cumbre */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center gap-2 mb-1.5 text-xs font-mono font-bold text-amber-300">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Logro Científico Cumbre</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {selectedFigure.keyAchievement}
                </p>
                {selectedFigure.famousFormula && (
                  <div className="mt-2 p-2 rounded-lg bg-[#040810] border border-slate-800 text-center font-mono text-cyan-300 text-xs">
                    <span className="text-[10px] text-slate-500 block mb-0.5">Expresión representativa / Ley:</span>
                    <span className="font-bold text-sm tracking-wider text-cyan-200">
                      ${selectedFigure.famousFormula}$
                    </span>
                  </div>
                )}
              </div>

              {/* Contexto Histórico & Época */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center gap-2 mb-1.5 text-xs font-mono font-bold text-cyan-300">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Contexto Histórico & Época</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {selectedFigure.historicContext}
                </p>
              </div>

              {/* Dilema Ético o Debate Histórico */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center gap-2 mb-1.5 text-xs font-mono font-bold text-purple-300">
                  <Scale className="w-4 h-4 text-purple-400" />
                  <span>Dilema Ético & Controversia Histórica</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {selectedFigure.ethicalDilemmaOrDebate}
                </p>
              </div>
            </div>

            {/* Quick Analysis Actions to Send to Chat */}
            <div className="pt-2">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                <span>Lanzar Análisis Directo al Chat:</span>
              </h4>

              <div className="grid grid-cols-1 gap-2">
                {selectedFigure.quickQuestions.map((qq, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleLaunchAnalysis(qq.prompt)}
                    className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition flex items-center justify-between group"
                  >
                    <div className="pr-3">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>{qq.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans line-clamp-1 mt-0.5">
                        {qq.prompt}
                      </p>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition shrink-0" />
                  </button>
                ))}

                {/* Additional Dynamic Analysis Angles */}
                <button
                  type="button"
                  onClick={() => handleLaunchAnalysis(
                    `[ANÁLISIS DE PERSONAJE HISTÓRICO: ${selectedFigure.name} - RUPTURA DE PARADIGMA] Explica con qué teorías previas rompió ${selectedFigure.name}, qué dogmas científicos refutó y cómo cambió para siempre nuestra comprensión del universo.`
                  )}
                  className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 text-left transition flex items-center justify-between group"
                >
                  <div className="pr-3">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-purple-300 group-hover:text-purple-200">
                      <Globe2 className="w-3 h-3 text-purple-400" />
                      <span>Ruptura de Paradigma & Cambio Epistemológico</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans line-clamp-1 mt-0.5">
                      Qué sostenía la ciencia antes de {selectedFigure.name} y cómo cambió la cosmovisión científica.
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleLaunchAnalysis(
                    `[ANÁLISIS DE PERSONAJE HISTÓRICO: ${selectedFigure.name} - DILEMA ÉTICO Y DEBATE CON LA CIENCIA ACTUAL] Analiza las controversias y dilemas éticos que enfrentó ${selectedFigure.name}. ¿Qué opinaría este científico si viera el estado de la ciencia, la IA y la tecnología moderna en el siglo XXI?`
                  )}
                  className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-left transition flex items-center justify-between group"
                >
                  <div className="pr-3">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-300 group-hover:text-emerald-200">
                      <Scale className="w-3 h-3 text-emerald-400" />
                      <span>Dilema Ético & "¿Qué opinaría en el Siglo XXI?"</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans line-clamp-1 mt-0.5">
                      Debate moral, desafíos de su era y su juicio hipotético frente a la ciencia contemporánea.
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition shrink-0" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
