import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { VALLEY_STABLE_POINTS } from '../data/valleyOfStability';
import { Radar, Activity, ShieldCheck, AlertTriangle, Zap } from 'lucide-react';

interface StabilityRadarD3Props {
  atomicNumberZ: number;
  neutronsN: number;
}

export const StabilityRadarD3: React.FC<StabilityRadarD3Props> = ({ atomicNumberZ, neutronsN }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Determine decay type / stability verdict
  const match = VALLEY_STABLE_POINTS.find(p => p.z === atomicNumberZ);
  const optimalN = match ? match.optimalN : Math.round(atomicNumberZ <= 20 ? atomicNumberZ : atomicNumberZ * (1.1 + 0.005 * atomicNumberZ));
  const minN = match ? match.minN : Math.max(0, optimalN - 2);
  const maxN = match ? match.maxN : optimalN + 2;

  let decayType = 'Estable';
  let badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  let description = 'El isótopo se encuentra dentro de la Banda de Estabilidad.';

  if (atomicNumberZ > 83) {
    decayType = 'Emisor Alfa (α) / Fisión';
    badgeColor = 'bg-purple-500/20 text-purple-400 border-purple-500/40';
    description = 'Núcleo superpesado con repulsión culombiana excesiva; tiende a desintegrarse emitiendo partículas alfa.';
  } else if (neutronsN > maxN) {
    decayType = 'Emisor Beta Menos (β⁻)';
    badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    description = `Exceso de neutrones (N = ${neutronsN} vs óptimo ~${optimalN}). Un neutrón se convierte en protón (n → p + e⁻).`;
  } else if (neutronsN < minN && atomicNumberZ > 0) {
    decayType = 'Emisor Beta Más (β⁺) / Captura';
    badgeColor = 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    description = `Déficit de neutrones (N = ${neutronsN} vs óptimo ~${optimalN}). Un protón se convierte en neutrón (p → n + e⁺).`;
  }

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 340;
    const height = 240;
    const margin = { top: 20, right: 20, bottom: 35, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous SVG contents
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const maxZ = Math.max(50, atomicNumberZ + 10);
    const maxN = Math.max(60, neutronsN + 15);

    const xScale = d3.scaleLinear()
      .domain([0, maxZ])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, maxN])
      .range([innerHeight, 0]);

    // Grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickSize(-innerHeight).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '2,2');

    svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-innerWidth).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '2,2');

    // Axes
    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .selectAll('text, path, line')
      .attr('stroke', '#64748b')
      .attr('fill', '#64748b')
      .style('font-size', '9px')
      .style('font-family', 'monospace');

    svg.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll('text, path, line')
      .attr('stroke', '#64748b')
      .attr('fill', '#64748b')
      .style('font-size', '9px')
      .style('font-family', 'monospace');

    // Axis Labels
    svg.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 30})`)
      .style('text-anchor', 'middle')
      .style('fill', '#94a3b8')
      .style('font-size', '10px')
      .style('font-family', 'monospace')
      .text('Protones (Z)');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -30)
      .attr('x', -innerHeight / 2)
      .style('text-anchor', 'middle')
      .style('fill', '#94a3b8')
      .style('font-size', '10px')
      .style('font-family', 'monospace')
      .text('Neutrones (N)');

    // N = Z reference line
    svg.append('line')
      .attr('x1', xScale(0))
      .attr('y1', yScale(0))
      .attr('x2', xScale(Math.min(maxZ, maxN)))
      .attr('y2', yScale(Math.min(maxZ, maxN)))
      .attr('stroke', '#334155')
      .attr('stroke-dasharray', '4,4')
      .attr('stroke-width', 1);

    // Valley of Stability Band Curve (Area between minN and maxN)
    const areaGenerator = d3.area<any>()
      .x(d => xScale(d.z))
      .y0(d => yScale(d.minN))
      .y1(d => yScale(d.maxN))
      .curve(d3.curveCatmullRom);

    svg.append('path')
      .datum(VALLEY_STABLE_POINTS)
      .attr('fill', 'rgba(6, 182, 212, 0.15)')
      .attr('d', areaGenerator);

    const lineGenerator = d3.line<any>()
      .x(d => xScale(d.z))
      .y(d => yScale(d.optimalN))
      .curve(d3.curveCatmullRom);

    svg.append('path')
      .datum(VALLEY_STABLE_POINTS)
      .attr('fill', 'none')
      .attr('stroke', '#06b6d4')
      .attr('stroke-width', 2)
      .attr('d', lineGenerator);

    // Current Isotope Radar Marker (Pulsing D3 circle)
    const pulseCircle = svg.append('circle')
      .attr('cx', xScale(atomicNumberZ))
      .attr('cy', yScale(neutronsN))
      .attr('r', 8)
      .attr('fill', decayType === 'Estable' ? '#10b981' : decayType.includes('Alfa') ? '#a855f7' : '#f59e0b')
      .attr('opacity', 0.6);

    const repeatPulse = () => {
      pulseCircle
        .attr('r', 8)
        .attr('opacity', 0.6)
        .transition()
        .duration(1500)
        .attr('r', 20)
        .attr('opacity', 0)
        .on('end', repeatPulse);
    };
    repeatPulse();

    svg.append('circle')
      .attr('cx', xScale(atomicNumberZ))
      .attr('cy', yScale(neutronsN))
      .attr('r', 5.5)
      .attr('fill', decayType === 'Estable' ? '#10b981' : decayType.includes('Alfa') ? '#a855f7' : '#ef4444')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5);

    // Label on radar marker
    svg.append('text')
      .attr('x', xScale(atomicNumberZ) + 8)
      .attr('y', yScale(neutronsN) - 6)
      .style('fill', '#ffffff')
      .style('font-size', '10px')
      .style('font-family', 'monospace')
      .style('font-weight', 'bold')
      .text(`Z=${atomicNumberZ}, N=${neutronsN}`);

  }, [atomicNumberZ, neutronsN]);

  return (
    <div className="bg-[#070d18] border border-cyan-500/40 rounded-2xl p-4 shadow-xl space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Radar className="w-4 h-4 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Radar de Estabilidad (D3.js)
          </span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${badgeColor}`}>
          {decayType}
        </span>
      </div>

      {/* D3 SVG Chart Container */}
      <div className="bg-[#040810] border border-slate-800 rounded-xl p-2 flex justify-center overflow-hidden">
        <svg ref={svgRef} className="overflow-visible" />
      </div>

      <div className="space-y-1 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Relación N/Z actual:</span>
          <strong className="text-cyan-300 font-mono">{(neutronsN / Math.max(1, atomicNumberZ)).toFixed(2)}</strong>
        </div>
        <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
