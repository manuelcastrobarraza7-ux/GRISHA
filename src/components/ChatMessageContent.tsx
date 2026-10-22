import React from 'react';
import katex from 'katex';
import { Landmark, Award, BookOpen, Scale, Sparkles } from 'lucide-react';

interface ChatMessageContentProps {
  content: string;
}

export const ChatMessageContent: React.FC<ChatMessageContentProps> = ({ content }) => {
  if (!content) return null;

  // Extract historical banner if present
  let processedContent = content;
  let historicalTag: string | null = null;
  const histMatch = processedContent.match(/^\[ANÁLISIS DE PERSONAJE HISTÓRICO:?\s*([^\]]+)\]/i);
  if (histMatch) {
    historicalTag = histMatch[1].trim();
    processedContent = processedContent.replace(histMatch[0], '').trim();
  }

  const renderFormattedInline = (text: string) => {
    // Process **bold** and *italic*
    const parts = text.split(/(\*\*.*?\*\*|\*[^\*]+?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-white font-mono">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-slate-300">{part.slice(1, -1)}</em>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const renderLineWithKaTeX = (text: string, lineKey: string | number) => {
    // Matches $$...$$ | \[...\] | $...$ | \(...\)
    const regex = /(\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]|\$([^\$\n]+?)\$|\\\(([\s\S]*?)\\\))/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const textChunk = text.substring(lastIndex, match.index);
        elements.push(
          <span key={`text-${lineKey}-${lastIndex}`}>
            {renderFormattedInline(textChunk)}
          </span>
        );
      }

      const blockMath = match[2] || match[3];
      const inlineMath = match[4] || match[5];
      const isBlock = Boolean(match[2] || match[3]);
      const mathExpr = blockMath || inlineMath;

      if (mathExpr) {
        try {
          const html = katex.renderToString(mathExpr.trim(), {
            displayMode: isBlock,
            throwOnError: false,
          });
          if (isBlock) {
            elements.push(
              <div
                key={`math-${lineKey}-${match.index}`}
                className="my-2.5 overflow-x-auto py-2 px-3 bg-[#0a1019] rounded-lg border border-slate-800 text-center shadow-inner"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } else {
            elements.push(
              <span
                key={`math-${lineKey}-${match.index}`}
                className="inline-block mx-0.5 align-baseline"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          }
        } catch {
          elements.push(<span key={`math-err-${lineKey}-${match.index}`}>{match[0]}</span>);
        }
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      const remaining = text.substring(lastIndex);
      elements.push(
        <span key={`text-${lineKey}-${lastIndex}`}>
          {renderFormattedInline(remaining)}
        </span>
      );
    }

    return elements;
  };

  // Split lines and render headers, lists, paragraphs
  const renderBlocks = (raw: string) => {
    const lines = raw.split('\n');
    const result: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Heading 3
      if (trimmed.startsWith('### ')) {
        result.push(
          <h3 key={idx} className="font-bold text-sm text-cyan-200 font-mono mt-3 mb-1 border-b border-slate-800/80 pb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>{renderLineWithKaTeX(trimmed.replace(/^###\s+/, ''), `h3-${idx}`)}</span>
          </h3>
        );
        return;
      }

      // Heading 4
      if (trimmed.startsWith('#### ')) {
        result.push(
          <h4 key={idx} className="font-semibold text-xs text-amber-300 font-mono mt-2 mb-0.5 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-amber-400" />
            <span>{renderLineWithKaTeX(trimmed.replace(/^####\s+/, ''), `h4-${idx}`)}</span>
          </h4>
        );
        return;
      }

      // Unordered list item
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        result.push(
          <div key={idx} className="flex items-start gap-2 ml-2 my-0.5">
            <span className="text-cyan-400 mt-1 shrink-0 text-[10px]">•</span>
            <div className="flex-1">
              {renderLineWithKaTeX(trimmed.replace(/^[-*]\s+/, ''), `li-${idx}`)}
            </div>
          </div>
        );
        return;
      }

      // Empty line
      if (!trimmed) {
        result.push(<div key={idx} className="h-1.5" />);
        return;
      }

      // Standard paragraph / block
      result.push(
        <div key={idx} className="leading-relaxed">
          {renderLineWithKaTeX(line, `block-${idx}`)}
        </div>
      );
    });

    return result;
  };

  return (
    <div className="space-y-2 text-slate-200 text-xs leading-relaxed font-sans">
      {/* Historical Tag Header Badge if active */}
      {historicalTag && (
        <div className="mb-2 p-2 rounded-lg bg-gradient-to-r from-[#0c1626] to-[#120f26] border border-cyan-500/40 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2 text-cyan-300 font-mono text-[11px] font-bold">
            <Landmark className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Análisis de Personaje Histórico: <span className="text-white underline decoration-cyan-400/50">{historicalTag}</span></span>
          </div>
          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
            Dossier Científico
          </span>
        </div>
      )}

      {renderBlocks(processedContent)}
    </div>
  );
};
