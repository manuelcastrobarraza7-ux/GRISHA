import React from 'react';
import { ChemicalReagent } from '../data/chemicals';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { ShieldAlert, BarChart3, AlertTriangle } from 'lucide-react';

interface WorkspaceRiskChartProps {
  selectedReagents: ChemicalReagent[];
}

export const WorkspaceRiskChart: React.FC<WorkspaceRiskChartProps> = ({ selectedReagents }) => {
  const validReagents = selectedReagents.filter(Boolean);

  if (validReagents.length === 0) {
    return (
      <div className="bg-[#0b111a] border border-slate-800 rounded-xl p-8 text-center space-y-3 font-mono">
        <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto" />
        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Workspace Vacío</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto font-sans">
          Selecciona reactivos químicos en el Catálogo o Laboratorio para visualizar su distribución de riesgos NFPA (Salud, Inflamabilidad, Reactividad) y códigos ADR en tiempo real.
        </p>
      </div>
    );
  }

  const chartData = validReagents.map(r => ({
    nombre: r.nombre.length > 16 ? r.nombre.substring(0, 16) + '...' : r.nombre,
    formula: r.formula,
    Salud: r.nfpa.health,
    Inflamabilidad: r.nfpa.flammability,
    Reactividad: r.nfpa.instability,
    tunnel: r.adrTunnelCode,
    clase: r.hazardClass,
  }));

  return (
    <div className="bg-[#080d14] border border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block font-bold">
              Análisis Recharts • Seguridad ADR & NFPA 704
            </span>
            <h3 className="text-sm font-bold text-white font-mono">
              Distribución de Riesgos del Workspace Actual ({validReagents.length} reactivos)
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#0b111a] px-3 py-1.5 rounded-lg border border-slate-800">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Escala NFPA: 0 (Mínimo) a 4 (Severo)</span>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="h-72 w-full bg-[#0b111a] border border-slate-800 rounded-xl p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: -10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis 
              dataKey="formula" 
              stroke="#64748b" 
              fontSize={11} 
              tick={{ fill: '#cbd5e1', fontFamily: 'monospace' }}
              interval={0}
              angle={-25}
              textAnchor="end"
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={11} 
              domain={[0, 4]} 
              ticks={[0, 1, 2, 3, 4]}
              tick={{ fill: '#64748b', fontFamily: 'monospace' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#080d14', 
                borderColor: '#06b6d4', 
                borderRadius: '0.5rem',
                fontFamily: 'monospace',
                fontSize: '11px',
                color: '#fff'
              }}
              formatter={(value: any, name: any, item: any) => [
                `${value} / 4`, 
                `${name} (${item.payload.nombre})`
              ]}
            />
            <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }} />
            <Bar dataKey="Salud" name="Salud (Azul)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Inflamabilidad" name="Inflamabilidad (Rojo)" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Reactividad" name="Reactividad (Amarillo)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary table of selected reagents tunnel codes & hazard classes */}
      <div className="space-y-2 font-mono">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
          Resumen Logístico ADR de Reactivos en Workspace:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {validReagents.map((r, idx) => (
            <div key={idx} className="bg-[#0b111a] border border-slate-800 rounded-lg p-3 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-400">{r.formula}</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                  ONU {r.unNumber}
                </span>
              </div>
              <p className="text-slate-300 font-sans text-[11px] truncate">{r.nombre}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span>Clase: {r.hazardClass}</span>
                <span className="text-amber-400 font-bold">Túnel ADR: {r.adrTunnelCode}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
