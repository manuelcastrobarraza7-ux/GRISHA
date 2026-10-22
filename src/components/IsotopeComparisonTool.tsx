import React, { useState, useMemo } from 'react';
import { Atom, Scale, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface IsotopeData {
  id: string;
  name: string;
  symbol: string;
  massNumber: number;
  atomicNumber: number;
  halfLifeYears: number; // in years (log scale representation)
  halfLifeDisplay: string;
  decayMode: string;
  cosmicOrigin: string;
  intermediates: string[];
}

const ISOTOPE_DATABASE: IsotopeData[] = [
  // Hydrogen
  { id: 'h1', name: 'Protio', symbol: '¹H', massNumber: 1, atomicNumber: 1, halfLifeYears: Infinity, halfLifeDisplay: 'Estable (Primordial)', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Big Bang Primordial', intermediates: ['Protones libres'] },
  { id: 'h2', name: 'Deuterio', symbol: '²H', massNumber: 2, atomicNumber: 1, halfLifeYears: Infinity, halfLifeDisplay: 'Estable (Primordial)', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Big Bang Primordial', intermediates: ['Protones + Neutrones'] },
  { id: 'h3', name: 'Tritio', symbol: '³H', massNumber: 3, atomicNumber: 1, halfLifeYears: 12.32, halfLifeDisplay: '12.32 años', decayMode: 'Beta menos (β⁻ ➔ ³He)', cosmicOrigin: 'Rayos cósmicos / Fisión nuclear', intermediates: ['³He', 'Electrón', 'Antineutrino'] },

  // Helium
  { id: 'he3', name: 'Helio-3', symbol: '³He', massNumber: 3, atomicNumber: 2, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Big Bang y Fusión Solar p-p', intermediates: ['Deuterio + Protón'] },
  { id: 'he4', name: 'Helio-4', symbol: '⁴He', massNumber: 4, atomicNumber: 2, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Big Bang y Fusión Estelar', intermediates: ['Partículas alfa (Núcleos ⁴He)'] },

  // Lithium & Beryllium
  { id: 'li6', name: 'Litio-6', symbol: '⁶Li', massNumber: 6, atomicNumber: 3, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Spallation cósmica / Big Bang', intermediates: ['Fusión alfa + deuterio'] },
  { id: 'li7', name: 'Litio-7', symbol: '⁷Li', massNumber: 7, atomicNumber: 3, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Big Bang Primordial', intermediates: ['Berilio-7 (captura electrónica)'] },
  { id: 'be9', name: 'Berilio-9', symbol: '⁹Be', massNumber: 9, atomicNumber: 4, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Spallation de rayos cósmicos', intermediates: ['Fragmentación C, N, O'] },

  // Boron & Carbon
  { id: 'b10', name: 'Boro-10', symbol: '¹⁰B', massNumber: 10, atomicNumber: 5, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Spallation cósmica / Reactores', intermediates: ['Absorción neutrónica'] },
  { id: 'b11', name: 'Boro-11', symbol: '¹¹B', massNumber: 11, atomicNumber: 5, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Spallation cósmica', intermediates: ['Fragmentación estelar'] },
  { id: 'c12', name: 'Carbono-12', symbol: '¹²C', massNumber: 12, atomicNumber: 6, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Proceso Triple-Alfa (Gigantes Rojas)', intermediates: ['⁸Be', 'Resonancia de Hoyle'] },
  { id: 'c13', name: 'Carbono-13', symbol: '¹³C', massNumber: 13, atomicNumber: 6, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Ciclo CNO Estelar', intermediates: ['¹²C + Protón'] },
  { id: 'c14', name: 'Carbono-14', symbol: '¹⁴C', massNumber: 14, atomicNumber: 6, halfLifeYears: 5730, halfLifeDisplay: '5,730 años', decayMode: 'Beta menos (β⁻ ➔ ¹⁴N)', cosmicOrigin: 'Interacción rayos cósmicos con ¹⁴N atmosférico', intermediates: ['¹⁴N', 'Electrón', 'Antineutrino'] },

  // Nitrogen & Oxygen
  { id: 'n14', name: 'Nitrógeno-14', symbol: '¹⁴N', massNumber: 14, atomicNumber: 7, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Ciclo CNO Estelar', intermediates: ['¹³C', '¹⁵N'] },
  { id: 'n15', name: 'Nitrógeno-15', symbol: '¹⁵N', massNumber: 15, atomicNumber: 7, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Ciclo CNO Estelar', intermediates: ['¹⁴N + Protón'] },
  { id: 'o16', name: 'Oxígeno-16', symbol: '¹⁶O', massNumber: 16, atomicNumber: 8, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Quema de Carbono estelar', intermediates: ['¹²C + ⁴He'] },
  { id: 'o18', name: 'Oxígeno-18', symbol: '¹⁸O', massNumber: 18, atomicNumber: 8, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Evolución de estrellas masivas', intermediates: ['¹⁴N + ⁴He'] },

  // Fluorine & Neon
  { id: 'f19', name: 'Flúor-19', symbol: '¹⁹F', massNumber: 19, atomicNumber: 9, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Nucleosíntesis en estrellas AGB', intermediates: ['¹⁸O + Protón'] },
  { id: 'ne20', name: 'Neón-20', symbol: '²⁰Ne', massNumber: 20, atomicNumber: 10, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Quema de Carbono estelar', intermediates: ['¹⁶O + ⁴He'] },
  { id: 'ne22', name: 'Neón-22', symbol: '²²Ne', massNumber: 22, atomicNumber: 10, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Quema de Carbono / Alfa-captura', intermediates: ['¹⁸O + ⁴He'] },

  // Sodium, Magnesium, Aluminum, Silicon
  { id: 'na23', name: 'Sodio-23', symbol: '²³Na', massNumber: 23, atomicNumber: 11, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Quema de Carbono estelar', intermediates: ['²⁰Ne + ⁴He'] },
  { id: 'mg24', name: 'Magnesio-24', symbol: '²⁴Mg', massNumber: 24, atomicNumber: 12, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Quema de Neón / Carbono', intermediates: ['²⁰Ne + ⁴He'] },
  { id: 'al27', name: 'Aluminio-27', symbol: '²⁷Al', massNumber: 27, atomicNumber: 13, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Quema de Carbono y Neón', intermediates: ['²⁶Mg + Protón'] },
  { id: 'si28', name: 'Silicio-28', symbol: '²⁸Si', massNumber: 28, atomicNumber: 14, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Quema de Silicio estelar', intermediates: ['²⁴Mg + ⁴He'] },

  // Phosphorus, Sulfur, Chlorine, Argon
  { id: 'p31', name: 'Fósforo-31', symbol: '³¹P', massNumber: 31, atomicNumber: 15, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Quema de Silicio y Carbono', intermediates: ['²⁸Si + Tritón'] },
  { id: 's32', name: 'Azufre-32', symbol: '³²S', massNumber: 32, atomicNumber: 16, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Quema de Silicio estelar', intermediates: ['²⁸Si + ⁴He'] },
  { id: 'cl35', name: 'Cloro-35', symbol: '³⁵Cl', massNumber: 35, atomicNumber: 17, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Quema de Silicio estelar', intermediates: ['³²S + Trío de nucleones'] },

  // Potassium, Calcium, Titanium, Chromium
  { id: 'k39', name: 'Potasio-39', symbol: '³⁹K', massNumber: 39, atomicNumber: 19, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Quema explosiva de Silicio', intermediates: ['³⁸Ar + Protón'] },
  { id: 'k40', name: 'Potasio-40', symbol: '⁴⁰K', massNumber: 40, atomicNumber: 19, halfLifeYears: 1250000000, halfLifeDisplay: '1,250 millones de años', decayMode: 'Beta menos / Captura electrónica (β⁻ / EC)', cosmicOrigin: 'Primordial / Producción estelar', intermediates: ['⁴⁰Ca o ⁴⁰Ar'] },
  { id: 'ca40', name: 'Calcio-40', symbol: '⁴⁰Ca', massNumber: 40, atomicNumber: 20, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Quema de Silicio', intermediates: ['³⁶Ar + ⁴He'] },

  // Iron, Cobalt, Nickel, Copper, Zinc
  { id: 'fe56', name: 'Hierro-56', symbol: '⁵⁶Fe', massNumber: 56, atomicNumber: 26, halfLifeYears: Infinity, halfLifeDisplay: 'Estable (Pico del Hierro)', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Desintegración de ⁵⁶Ni en Supernovas', intermediates: ['⁵⁶Ni ➔ ⁵⁶Co ➔ ⁵⁶Fe'] },
  { id: 'co59', name: 'Cobalto-59', symbol: '⁵⁹Co', massNumber: 59, atomicNumber: 27, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Supernovas tipo Ia / Procesos estelares', intermediates: ['⁵⁸Fe + Neutrón'] },
  { id: 'ni58', name: 'Níquel-58', symbol: '⁵⁸Ni', massNumber: 58, atomicNumber: 28, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Nucleosíntesis explosiva de supernovas', intermediates: ['⁵⁴Fe + ⁴He'] },
  { id: 'cu63', name: 'Cobre-63', symbol: '⁶³Cu', massNumber: 63, atomicNumber: 29, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Proceso s (estrellas AGB) y Supernovas', intermediates: ['Captura neutrónica lenta'] },
  { id: 'zn64', name: 'Zinc-64', symbol: '⁶⁴Zn', massNumber: 64, atomicNumber: 30, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Supernovas y quema avanzada', intermediates: ['⁶⁰Ni + ⁴He'] },

  // Silver, Iodine, Platinum, Gold, Mercury, Lead, Thorium, Uranium
  { id: 'ag107', name: 'Plata-107', symbol: '¹⁰⁷Ag', massNumber: 107, atomicNumber: 47, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Proceso s y Proceso r', intermediates: ['Captura neutrónica en estrellas gigantes'] },
  { id: 'i127', name: 'Yodo-127', symbol: '¹²⁷I', massNumber: 127, atomicNumber: 53, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Proceso s (estrellas AGB)', intermediates: ['Teluro-127 (beta decay)'] },
  { id: 'i131', name: 'Yodo-131', symbol: '¹³¹I', massNumber: 131, atomicNumber: 53, halfLifeYears: 0.022, halfLifeDisplay: '8.02 días', decayMode: 'Beta menos (β⁻ ➔ ¹³¹Xe)', cosmicOrigin: 'Fisión nuclear / Supernovas', intermediates: ['Teluro-131', 'Xenon-131'] },
  { id: 'pt195', name: 'Platino-195', symbol: '¹⁹⁵Pt', massNumber: 195, atomicNumber: 78, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Proceso r (Supernovas / Kilonovas)', intermediates: ['Captura rápida de neutrones'] },
  { id: 'au197', name: 'Oro-197', symbol: '¹⁹⁷Au', massNumber: 197, atomicNumber: 79, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Proceso r (Colisión de estrellas de neutrones / Supernovas)', intermediates: ['Captura rápida de neutrones (r-process)'] },
  { id: 'hg202', name: 'Mercurio-202', symbol: '²⁰²Hg', massNumber: 202, atomicNumber: 80, halfLifeYears: Infinity, halfLifeDisplay: 'Estable', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Proceso s y Proceso r', intermediates: ['Oro-202 beta decay'] },
  { id: 'pb208', name: 'Plomo-208', symbol: '²⁰⁸Pb', massNumber: 208, atomicNumber: 82, halfLifeYears: Infinity, halfLifeDisplay: 'Estable (Núcleo Doblemente Mágico)', decayMode: 'Ninguno (Estable)', cosmicOrigin: 'Fin de cadenas de decaimiento radiactivo', intermediates: ['Decaimiento alfa/beta sucesivo de Uranio/Torio'] },
  { id: 'th232', name: 'Torio-232', symbol: '²³²Th', massNumber: 232, atomicNumber: 90, halfLifeYears: 14000000000, halfLifeDisplay: '14,000 millones de años', decayMode: 'Alfa (α ➔ ²²⁸Ra)', cosmicOrigin: 'Proceso r (Supernovas primordiales)', intermediates: ['Radio-228', 'Radón-220', 'Plomo-208'] },
  { id: 'u235', name: 'Uranio-235', symbol: '²³⁵U', massNumber: 235, atomicNumber: 92, halfLifeYears: 704000000, halfLifeDisplay: '704 millones de años', decayMode: 'Alfa (α ➔ ²³¹Th)', cosmicOrigin: 'Proceso r (Supernovas / Kilonovas)', intermediates: ['Torio-231', 'Radio-223', 'Plomo-207'] },
  { id: 'u238', name: 'Uranio-238', symbol: '²³⁸U', massNumber: 238, atomicNumber: 92, halfLifeYears: 4468000000, halfLifeDisplay: '4,468 millones de años', decayMode: 'Alfa (α ➔ ²³⁴Th)', cosmicOrigin: 'Proceso r (Supernovas / Kilonovas)', intermediates: ['Torio-234', 'Radio-226', 'Radón-222', 'Plomo-206'] },
];

export const IsotopeComparisonTool: React.FC = () => {
  const [iso1Id, setIso1Id] = useState<string>('c14');
  const [iso2Id, setIso2Id] = useState<string>('u238');

  const iso1 = useMemo(() => ISOTOPE_DATABASE.find(i => i.id === iso1Id) || ISOTOPE_DATABASE[12], [iso1Id]);
  const iso2 = useMemo(() => ISOTOPE_DATABASE.find(i => i.id === iso2Id) || ISOTOPE_DATABASE[ISOTOPE_DATABASE.length - 1], [iso2Id]);

  // Chart data for half-life comparison (Log representation or normalized years)
  const chartData = useMemo(() => {
    return [
      {
        name: `${iso1.symbol} (${iso1.name})`,
        vidaMediaLog: iso1.halfLifeYears === Infinity ? 12 : Math.log10(Math.max(0.0001, iso1.halfLifeYears)),
        vidaMediaReal: iso1.halfLifeDisplay,
        masa: iso1.massNumber,
      },
      {
        name: `${iso2.symbol} (${iso2.name})`,
        vidaMediaLog: iso2.halfLifeYears === Infinity ? 12 : Math.log10(Math.max(0.0001, iso2.halfLifeYears)),
        vidaMediaReal: iso2.halfLifeDisplay,
        masa: iso2.massNumber,
      },
    ];
  }, [iso1, iso2]);

  return (
    <div className="bg-[#0b111a] border border-cyan-500/30 rounded-2xl p-5 shadow-2xl space-y-5 my-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Atom className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block font-bold">
              Espectroscopía & Cinética Nuclear
            </span>
            <h3 className="text-base font-bold text-white">Herramienta Comparativa de Isótopos de la Tabla Periódica</h3>
          </div>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        <div className="bg-[#070b12] border border-slate-800 rounded-xl p-3.5 space-y-2">
          <label className="text-cyan-400 font-bold block">Seleccionar Isótopo A:</label>
          <select
            value={iso1Id}
            onChange={(e) => setIso1Id(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-cyan-500 focus:outline-none"
          >
            {ISOTOPE_DATABASE.map((item) => (
              <option key={item.id} value={item.id}>
                {item.symbol} - {item.name} (Z={item.atomicNumber}, A={item.massNumber})
              </option>
            ))}
          </select>
          <div className="text-slate-300 font-sans text-xs space-y-1 pt-1">
            <div><strong>Vida Media:</strong> {iso1.halfLifeDisplay}</div>
            <div><strong>Modo de Decaimiento:</strong> {iso1.decayMode}</div>
            <div><strong>Origen Cósmico:</strong> {iso1.cosmicOrigin}</div>
            <div><strong>Intermedios de Formación:</strong> <span className="text-cyan-300 font-mono">{iso1.intermediates.join(' ➔ ')}</span></div>
          </div>
        </div>

        <div className="bg-[#070b12] border border-slate-800 rounded-xl p-3.5 space-y-2">
          <label className="text-amber-400 font-bold block">Seleccionar Isótopo B:</label>
          <select
            value={iso2Id}
            onChange={(e) => setIso2Id(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
          >
            {ISOTOPE_DATABASE.map((item) => (
              <option key={item.id} value={item.id}>
                {item.symbol} - {item.name} (Z={item.atomicNumber}, A={item.massNumber})
              </option>
            ))}
          </select>
          <div className="text-slate-300 font-sans text-xs space-y-1 pt-1">
            <div><strong>Vida Media:</strong> {iso2.halfLifeDisplay}</div>
            <div><strong>Modo de Decaimiento:</strong> {iso2.decayMode}</div>
            <div><strong>Origen Cósmico:</strong> {iso2.cosmicOrigin}</div>
            <div><strong>Intermedios de Formación:</strong> <span className="text-amber-300 font-mono">{iso2.intermediates.join(' ➔ ')}</span></div>
          </div>
        </div>
      </div>

      {/* Recharts Half-Life Comparison Chart */}
      <div className="bg-[#070b12] border border-slate-800 rounded-xl p-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block font-bold mb-3">
          Comparativa de Vida Media (Log₁₀ de Años) & Masa Atómica
        </span>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} label={{ value: 'Log₁₀(Años de Vida Media)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#0b111a] border border-cyan-500/40 p-2.5 rounded-lg shadow-xl font-mono text-xs text-slate-200">
                        <span className="text-cyan-400 font-bold block mb-1">{data.name}</span>
                        <div>Vida Media Real: <span className="text-emerald-300 font-bold">{data.vidaMediaReal}</span></div>
                        <div>Masa Atómica: <span className="text-amber-300 font-bold">{data.masa} u</span></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="vidaMediaLog" name="Log₁₀(Vida Media en Años)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
