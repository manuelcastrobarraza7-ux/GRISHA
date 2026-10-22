import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

interface ChemicalTextProps {
  formula: string;
  name?: string;
  className?: string;
}

export function toLatexFormula(formula: string): string {
  if (!formula) return '';
  const normal = formula
    .replace(/₀/g, '0')
    .replace(/₁/g, '1')
    .replace(/₂/g, '2')
    .replace(/₃/g, '3')
    .replace(/₄/g, '4')
    .replace(/₅/g, '5')
    .replace(/₆/g, '6')
    .replace(/₇/g, '7')
    .replace(/₈/g, '8')
    .replace(/₉/g, '9')
    .replace(/⁺/g, '^+')
    .replace(/⁻/g, '^-');

  return normal
    .replace(/([A-Za-z\)])(\d+)/g, '$1_{$2}')
    .replace(/\(([A-Za-z]+)\)(\d+)/g, '($1)_{$2}');
}

export function toLatexEquation(eq: string): string {
  if (!eq) return '';
  let latex = eq
    .replace(/→/g, '\\rightarrow')
    .replace(/->/g, '\\rightarrow')
    .replace(/⇌/g, '\\rightleftharpoons');

  return latex.replace(/\b([A-Z][a-z]?\d*([A-Z][a-z]?\d*)*|\([A-Z][a-z]?\d*\)\d*)\b/g, (match) => {
    return toLatexFormula(match);
  });
}

export const ChemicalText: React.FC<ChemicalTextProps> = ({ formula, className = '' }) => {
  const latexStr = toLatexFormula(formula);
  return (
    <span className={`inline-flex items-center ${className}`}>
      <span className="font-mono">
        <InlineMath math={latexStr} />
      </span>
    </span>
  );
};

interface EquationMathProps {
  equation: string;
  block?: boolean;
  className?: string;
}

export const EquationMath: React.FC<EquationMathProps> = ({ equation, block = false, className = '' }) => {
  const latexEq = toLatexEquation(equation);
  if (block) {
    return (
      <div className={`overflow-x-auto py-1 font-mono ${className}`}>
        <BlockMath math={latexEq} />
      </div>
    );
  }
  return (
    <span className={`font-mono ${className}`}>
      <InlineMath math={latexEq} />
    </span>
  );
};
