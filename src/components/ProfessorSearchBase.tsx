import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  FlaskConical, 
  Atom, 
  Dna, 
  Send, 
  Copy, 
  Check, 
  Filter, 
  BookOpen, 
  Info,
  ArrowRight,
  Database
} from 'lucide-react';
import { 
  getProfessorSearchBase, 
  ProfessorSearchItem, 
  SearchItemCategory 
} from '../data/professorKnowledgeBases';

interface ProfessorSearchBaseProps {
  professorType: 'chemistry' | 'physics_astrophysics' | 'bioscience';
  onSelectPrompt: (prompt: string) => void;
  onInsertInInput?: (text: string) => void;
}

export const ProfessorSearchBase: React.FC<ProfessorSearchBaseProps> = ({
  professorType,
  onSelectPrompt,
  onInsertInInput
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const searchBase = useMemo(() => getProfessorSearchBase(professorType), [professorType]);

  const filteredItems = useMemo(() => {
    return searchBase.items.filter(item => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCat) return false;

      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSub = item.subtitle.toLowerCase().includes(q);
      const matchFormula = item.formulaOrSymbol.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchKeywords = item.keywords.some(k => k.toLowerCase().includes(q));

      return matchTitle || matchSub || matchFormula || matchDesc || matchKeywords;
    });
  }, [searchBase, selectedCategory, searchTerm]);

  const handleCopyPrompt = (item: ProfessorSearchItem) => {
    navigator.clipboard.writeText(item.suggestedPrompt);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isChemistry = professorType === 'chemistry';
  const isBioscience = professorType === 'bioscience';

  const themeColors = useMemo(() => {
    if (isChemistry) {
      return {
        accent: 'text-cyan-400',
        border: 'border-cyan-500/30',
        bgPill: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/20',
        activePill: 'bg-cyan-500 text-black border-cyan-400 font-bold',
        cardBorder: 'border-cyan-900/50 hover:border-cyan-500/40',
        cardBg: 'bg-[#071320]/60 hover:bg-[#071829]/80',
        askBtn: 'bg-cyan-500 hover:bg-cyan-400 text-black font-semibold',
        iconBg: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40'
      };
    }
    if (isBioscience) {
      return {
        accent: 'text-emerald-400',
        border: 'border-emerald-500/30',
        bgPill: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/20',
        activePill: 'bg-emerald-500 text-black border-emerald-400 font-bold',
        cardBorder: 'border-emerald-900/50 hover:border-emerald-500/40',
        cardBg: 'bg-[#061814]/60 hover:bg-[#08221b]/80',
        askBtn: 'bg-emerald-500 hover:bg-emerald-400 text-black font-semibold',
        iconBg: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
      };
    }
    // Quantum & Astrophysics
    return {
      accent: 'text-purple-400',
      border: 'border-purple-500/30',
      bgPill: 'bg-purple-500/10 text-purple-300 border-purple-500/40 hover:bg-purple-500/20',
      activePill: 'bg-purple-500 text-white border-purple-400 font-bold',
      cardBorder: 'border-purple-900/50 hover:border-purple-500/40',
      cardBg: 'bg-[#100a20]/60 hover:bg-[#160d2b]/80',
      askBtn: 'bg-purple-500 hover:bg-purple-400 text-white font-semibold',
      iconBg: 'bg-purple-950/70 text-purple-300 border-purple-500/40'
    };
  }, [isChemistry, isBioscience]);

  return (
    <div className={`mb-3 rounded-2xl border transition-all duration-300 overflow-hidden ${themeColors.border} bg-[#060a12]/90 shadow-lg backdrop-blur-sm`}>
      {/* Search Base Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-2.5 flex items-center justify-between cursor-pointer select-none bg-slate-950/80 hover:bg-slate-900/70 transition border-b border-slate-800/80"
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${themeColors.iconBg}`}>
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold font-mono tracking-wide ${themeColors.accent}`}>
                {searchBase.title}
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full border border-slate-700 bg-slate-900 text-slate-400 font-mono">
                {filteredItems.length} entradas indexadas
              </span>
            </div>
            <div className="text-[10.5px] text-slate-400 font-sans hidden sm:block">
              {searchBase.subtitle}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 hidden md:inline">
            {isExpanded ? 'Ocultar Base' : 'Abrir Base de Búsqueda'}
          </span>
          <button 
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-white"
            aria-label="Alternar panel"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Body */}
      {isExpanded && (
        <div className="p-3.5 space-y-3">
          {/* Live Search & Filter Row */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            {/* Input with icon */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchBase.searchPlaceholder}
                className="w-full bg-[#05080e] border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-slate-600 font-sans transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-mono px-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Total Results Counter */}
            <div className="shrink-0 text-[11px] font-mono text-slate-400 self-center">
              Coincidencias: <strong className={themeColors.accent}>{filteredItems.length}</strong>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-mono">
            {searchBase.categories.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition text-xs ${
                    isSelected ? themeColors.activePill : themeColors.bgPill
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredItems.length === 0 ? (
              <div className="col-span-full py-6 text-center text-slate-500 text-xs font-mono bg-slate-950/40 rounded-xl border border-slate-900">
                No se encontraron resultados para "{searchTerm}" en esta base de conocimiento.
              </div>
            ) : (
              filteredItems.map(item => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between gap-2 ${themeColors.cardBg} ${themeColors.cardBorder} shadow-sm group`}
                >
                  <div>
                    {/* Header: Title, Formula & Badge */}
                    <div className="flex items-start justify-between gap-1.5 mb-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-100 font-mono group-hover:text-white transition">
                            {item.title}
                          </h4>
                          <span className="font-mono text-xs font-bold text-cyan-300 bg-slate-900/90 px-1.5 py-0.2 rounded border border-slate-800">
                            {item.formulaOrSymbol}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans line-clamp-1">
                          {item.subtitle}
                        </div>
                      </div>

                      {item.badgeText && (
                        <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${item.badgeColor || 'border-slate-700 text-slate-300 bg-slate-900'}`}>
                          {item.badgeText}
                        </span>
                      )}
                    </div>

                    {/* Description preview */}
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed font-sans mb-2">
                      {item.description}
                    </p>

                    {/* Mini Technical Specs */}
                    <div className="grid grid-cols-2 gap-1 bg-[#040810]/80 p-2 rounded-lg border border-slate-800/80 text-[10px] font-mono text-slate-300">
                      {Object.entries(item.technicalSpecs).map(([key, val]) => (
                        <div key={key} className="truncate">
                          <span className="text-slate-500 font-normal mr-1">{key}:</span>
                          <span className="font-semibold text-slate-200">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
                    <div className="flex items-center gap-1.5">
                      {onInsertInInput && (
                        <button
                          type="button"
                          onClick={() => onInsertInInput(`${item.title} (${item.formulaOrSymbol})`)}
                          className="px-2 py-1 rounded-lg text-[10.5px] font-mono border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-500 transition"
                          title="Insertar en la barra de consulta del chat"
                        >
                          Insertar
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(item)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white border border-slate-800 bg-slate-900 transition"
                        title="Copiar prompt científico al portapapeles"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectPrompt(item.suggestedPrompt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition flex items-center gap-1 shadow-sm ${themeColors.askBtn}`}
                      title="Enviar de inmediato esta consulta al profesor"
                    >
                      <span>Consultar al Profesor</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
