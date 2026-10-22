import React, { useMemo } from 'react';
import { VALLEY_STABLE_POINTS, getStabilityVerdict } from '../data/valleyOfStability';

interface ValleyOfStabilityChartProps {
  currentZ: number;
  currentN: number;
  elementSymbol: string;
}

export const ValleyOfStabilityChart: React.FC<ValleyOfStabilityChartProps> = ({
  currentZ,
  currentN,
  elementSymbol
}) => {
  // Chart dimensions in SVG viewBox coordinates
  const svgWidth = 640;
  const svgHeight = 440;
  const margin = { top: 30, right: 30, bottom: 40, left: 50 };

  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  // Domain: Z = 0 to 120, N = 0 to 180
  const maxZ = 120;
  const maxN = 180;

  const getX = (z: number) => margin.left + (z / maxZ) * plotWidth;
  const getY = (n: number) => margin.top + plotHeight - (n / maxN) * plotHeight;

  // Generate valley curve points
  const valleyCurvePath = useMemo(() => {
    let d = '';
    VALLEY_STABLE_POINTS.forEach((pt, idx) => {
      const x = getX(pt.z);
      const y = getY(pt.optimalN);
      if (idx === 0) {
        d += `M ${x} ${y}`;
      } else {
        d += ` L ${x} ${y}`;
      }
    });
    return d;
  }, []);

  const verdict = useMemo(() => getStabilityVerdict(currentZ, currentN), [currentZ, currentN]);

  // Current atom position on chart (clamped to graph bounds)
  const markerX = getX(Math.min(maxZ, Math.max(0, currentZ)));
  const markerY = getY(Math.min(maxN, Math.max(0, currentN)));

  // Grid tick values
  const zTicks = [0, 30, 60, 90, 120];
  const nTicks = [0, 45, 90, 135, 180];

  return (
    <div className="bg-[#070c14] border border-slate-800/90 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left text column */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-1">
              — EL VEREDICTO DE ESTABILIDAD
            </span>
            <h3 className="text-xl font-bold text-white tracking-wide font-sans">
              El valle de estabilidad
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Representa cada nucleido conocido con los protones en un eje y los neutrones en el otro, y los estables forman una banda curva estrecha: el <strong className="text-white font-semibold">valle de estabilidad</strong>. Los elementos ligeros se encuentran cerca de <span className="font-mono text-cyan-300">N = Z</span>. A medida que aumenta Z, los protones se repelen con más fuerza y el núcleo necesita proporcionalmente más neutrones para mantenerse unido, por lo que la banda se curva hacia arriba, hacia <span className="font-mono text-cyan-300">N ≈ 1.5 Z</span>.
          </p>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Si queda por encima de la banda, el nucleido es rico en neutrones: un neutrón se convierte en un protón y emite un electrón (<strong className="text-amber-400 font-semibold">desintegración β⁻</strong>). Si queda por debajo, es rico en protones, por lo que un protón se convierte en un neutrón y emite un positrón (<strong className="text-blue-400 font-semibold">desintegración β⁺</strong>). Después del bismuto (Z = 83), el valle simplemente se acaba: ninguna disposición de neutrones puede mantener unidos tantos protones indefinidamente.
          </p>

          {/* Current Live Evaluation Pill */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">TU CONSTRUCCIÓN:</span>
              <span className="font-bold text-white text-sm">
                Z={currentZ} ({elementSymbol}), N={currentN}
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${verdict.statusColor}`}>
              {verdict.status}
            </span>
          </div>
        </div>

        {/* Right chart column */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="w-full relative bg-[#040810] border border-slate-800/80 rounded-xl p-3 shadow-inner">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto select-none overflow-visible"
            >
              {/* Grid Lines */}
              {zTicks.map(z => {
                const x = getX(z);
                return (
                  <g key={`ztick-${z}`}>
                    <line
                      x1={x}
                      y1={margin.top}
                      x2={x}
                      y2={margin.top + plotHeight}
                      stroke="#1e293b"
                      strokeWidth="1"
                      strokeDasharray={z === 0 ? undefined : '3 3'}
                    />
                    <text
                      x={x}
                      y={margin.top + plotHeight + 18}
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {z}
                    </text>
                  </g>
                );
              })}

              {nTicks.map(n => {
                const y = getY(n);
                return (
                  <g key={`ntick-${n}`}>
                    <line
                      x1={margin.left}
                      y1={y}
                      x2={margin.left + plotWidth}
                      y2={y}
                      stroke="#1e293b"
                      strokeWidth="1"
                      strokeDasharray={n === 0 ? undefined : '3 3'}
                    />
                    <text
                      x={margin.left - 10}
                      y={y + 3}
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {n}
                    </text>
                  </g>
                );
              })}

              {/* Diagonal Line N = Z */}
              <line
                x1={getX(0)}
                y1={getY(0)}
                x2={getX(maxZ)}
                y2={getY(maxZ)}
                stroke="#475569"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text
                x={getX(80) + 10}
                y={getY(80) + 12}
                fill="#64748b"
                fontSize="9"
                fontFamily="monospace"
              >
                N = Z
              </text>

              {/* Valley of Stability Glow and Path */}
              <path
                d={valleyCurvePath}
                fill="none"
                stroke="rgba(6,182,212,0.2)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={valleyCurvePath}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Stable & Representative Nucleide Points */}
              {VALLEY_STABLE_POINTS.map((pt, i) => (
                <circle
                  key={`stable-pt-${i}`}
                  cx={getX(pt.z)}
                  cy={getY(pt.optimalN)}
                  r="2.5"
                  fill="#38bdf8"
                />
              ))}

              {/* Bismuth end marker (Z=83) */}
              <line
                x1={getX(83)}
                y1={getY(126) - 15}
                x2={getX(83)}
                y2={getY(126) + 15}
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <text
                x={getX(83) + 4}
                y={getY(126) - 8}
                fill="#f43f5e"
                fontSize="8.5"
                fontFamily="monospace"
              >
                Fin valle (Bi-83)
              </text>

              {/* CURRENT CONSTRUCTED ATOM RETICLE / CROSSHAIR */}
              <g className="transition-all duration-300">
                {/* Horizontal Guide */}
                <line
                  x1={margin.left}
                  y1={markerY}
                  x2={margin.left + plotWidth}
                  y2={markerY}
                  stroke="#38bdf8"
                  strokeWidth="0.8"
                  strokeDasharray="2 2"
                  opacity="0.4"
                />
                {/* Vertical Guide */}
                <line
                  x1={markerX}
                  y1={margin.top}
                  x2={markerX}
                  y2={margin.top + plotHeight}
                  stroke="#38bdf8"
                  strokeWidth="0.8"
                  strokeDasharray="2 2"
                  opacity="0.4"
                />

                {/* Pulsing Target Ring */}
                <circle
                  cx={markerX}
                  cy={markerY}
                  r="9"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  className="animate-ping opacity-75 origin-center"
                />
                <circle
                  cx={markerX}
                  cy={markerY}
                  r="7"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <circle
                  cx={markerX}
                  cy={markerY}
                  r="3.5"
                  fill="#ef4444"
                />

                {/* Beta Decay Transmutation Vector Arrow */}
                {verdict.status === 'Radiactivo β⁻' && currentZ < 118 && currentN > 0 && (
                  <g className="animate-pulse">
                    <line
                      x1={markerX}
                      y1={markerY}
                      x2={getX(currentZ + 4)}
                      y2={getY(currentN - 4)}
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray="2 2"
                    />
                    <polygon
                      points={`${getX(currentZ + 4)},${getY(currentN - 4)} ${getX(currentZ + 4) - 4},${getY(currentN - 4) - 5} ${getX(currentZ + 4) - 5},${getY(currentN - 4) + 3}`}
                      fill="#f59e0b"
                    />
                    <text
                      x={getX(currentZ + 5)}
                      y={getY(currentN - 3)}
                      fill="#f59e0b"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      β⁻ (Z+1)
                    </text>
                  </g>
                )}

                {verdict.status === 'Radiactivo β⁺' && currentZ > 1 && (
                  <g className="animate-pulse">
                    <line
                      x1={markerX}
                      y1={markerY}
                      x2={getX(currentZ - 4)}
                      y2={getY(currentN + 4)}
                      stroke="#60a5fa"
                      strokeWidth="2"
                      strokeDasharray="2 2"
                    />
                    <polygon
                      points={`${getX(currentZ - 4)},${getY(currentN + 4)} ${getX(currentZ - 4) + 4},${getY(currentN + 4) + 5} ${getX(currentZ - 4) + 5},${getY(currentN + 4) - 3}`}
                      fill="#60a5fa"
                    />
                    <text
                      x={getX(currentZ - 18)}
                      y={getY(currentN + 5)}
                      fill="#60a5fa"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      β⁺ (Z-1)
                    </text>
                  </g>
                )}

                {/* Floating Tooltip Label */}
                <rect
                  x={Math.min(svgWidth - 110, Math.max(margin.left, markerX - 35))}
                  y={Math.max(margin.top + 5, markerY - 26)}
                  width="70"
                  height="18"
                  rx="4"
                  fill="#030712"
                  stroke="#38bdf8"
                  strokeWidth="1"
                />
                <text
                  x={Math.min(svgWidth - 110, Math.max(margin.left, markerX - 35)) + 35}
                  y={Math.max(margin.top + 5, markerY - 26) + 12}
                  fill="#ffffff"
                  fontSize="9.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {elementSymbol} (Z:{currentZ}, N:{currentN})
                </text>
              </g>
            </svg>

            {/* Bottom Caption matching screenshot */}
            <p className="text-[11px] font-mono text-slate-400 text-center mt-3">
              Neutrones (vertical) frente a protones (horizontal) · <span className="text-cyan-300 font-semibold">tu construcción está marcada</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
