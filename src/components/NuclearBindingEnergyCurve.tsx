import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Atom, 
  ShieldCheck, 
  ShieldAlert, 
  Flame, 
  TrendingUp, 
  Info, 
  Filter, 
  HelpCircle, 
  ArrowRight, 
  ChevronRight,
  Sliders,
  Sparkles,
  Layers
} from 'lucide-react';
import { 
  ComposedChart, 
  Line, 
  Scatter, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  ReferenceLine, 
  ReferenceArea,
  Legend
} from 'recharts';

export interface BindingEnergyIsotope {
  id: string;
  symbol: string;
  name: string;
  element: string;
  z: number;
  n: number;
  a: number; // Mass number
  bindingEnergyPerNucleon: number; // MeV / nucleon
  isStable: boolean;
  decayMode?: string;
  halfLife?: string;
  stellarRole: string;
  zone: 'fusion' | 'peak' | 'fission';
  stellarTag?: 'bigbang' | 'pp' | 'cno' | 'triplealpha' | 'silicon' | 'r-process' | 's-process';
}

export const NUCLEAR_BINDING_DATA: BindingEnergyIsotope[] = [
  // Very light elements (Big Bang & p-p chain)
  {
    id: 'h1',
    symbol: '¹H',
    name: 'Protio',
    element: 'Hidrógeno',
    z: 1,
    n: 0,
    a: 1,
    bindingEnergyPerNucleon: 0.000,
    isStable: true,
    stellarRole: 'Combustible primigenio del Big Bang y de las estrellas de la secuencia principal.',
    zone: 'fusion',
    stellarTag: 'bigbang'
  },
  {
    id: 'h2',
    symbol: '²H',
    name: 'Deuterio',
    element: 'Hidrógeno',
    z: 1,
    n: 1,
    a: 2,
    bindingEnergyPerNucleon: 1.112,
    isStable: true,
    stellarRole: 'Primer paso clave en la cadena protón-protón estelar; sintetizado en el Big Bang.',
    zone: 'fusion',
    stellarTag: 'pp'
  },
  {
    id: 'h3',
    symbol: '³H',
    name: 'Tritio',
    element: 'Hidrógeno',
    z: 1,
    n: 2,
    a: 3,
    bindingEnergyPerNucleon: 2.827,
    isStable: false,
    decayMode: 'Beta menos (β⁻ ➔ ³He)',
    halfLife: '12.32 años',
    stellarRole: 'Intermedio de reacciones termonucleares de alta energía; decae hacia ³He.',
    zone: 'fusion',
    stellarTag: 'pp'
  },
  {
    id: 'he3',
    symbol: '³He',
    name: 'Helio-3',
    element: 'Helio',
    z: 2,
    n: 1,
    a: 3,
    bindingEnergyPerNucleon: 2.573,
    isStable: true,
    stellarRole: 'Producto intermedio de la rama p-p I solar (³He + ³He ➔ ⁴He + 2p).',
    zone: 'fusion',
    stellarTag: 'pp'
  },
  {
    id: 'he4',
    symbol: '⁴He',
    name: 'Helio-4 (Alfa)',
    element: 'Helio',
    z: 2,
    n: 2,
    a: 4,
    bindingEnergyPerNucleon: 7.074,
    isStable: true,
    stellarRole: 'Pico de ultraestabilidad cuántica (núcleo doblemente mágico Z=2, N=2). Ceniza de la secuencia principal.',
    zone: 'fusion',
    stellarTag: 'pp'
  },
  {
    id: 'he5',
    symbol: '⁵He',
    name: 'Helio-5',
    element: 'Helio',
    z: 2,
    n: 3,
    a: 5,
    bindingEnergyPerNucleon: 5.480,
    isStable: false,
    decayMode: 'Emisión de neutrón (instantáneo)',
    halfLife: '7 × 10⁻²² s',
    stellarRole: 'Inestable; la inexistencia de núcleos estables con A=5 crea el gran cuello de botella primordial.',
    zone: 'fusion'
  },
  {
    id: 'li6',
    symbol: '⁶Li',
    name: 'Litio-6',
    element: 'Litio',
    z: 3,
    n: 3,
    a: 6,
    bindingEnergyPerNucleon: 5.332,
    isStable: true,
    stellarRole: 'Sintetizado en spallation de rayos cósmicos y trazas del Big Bang.',
    zone: 'fusion',
    stellarTag: 'bigbang'
  },
  {
    id: 'li7',
    symbol: '⁷Li',
    name: 'Litio-7',
    element: 'Litio',
    z: 3,
    n: 4,
    a: 7,
    bindingEnergyPerNucleon: 5.606,
    isStable: true,
    stellarRole: 'Test de diagnóstico para delimitar enanas marrones frente a estrellas de baja masa.',
    zone: 'fusion',
    stellarTag: 'bigbang'
  },
  {
    id: 'be8',
    symbol: '⁸Be',
    name: 'Berilio-8',
    element: 'Berilio',
    z: 4,
    n: 4,
    a: 8,
    bindingEnergyPerNucleon: 7.062,
    isStable: false,
    decayMode: 'Fisión en 2 partículas alfa (2 ⁴He)',
    halfLife: '8.19 × 10⁻¹⁷ s',
    stellarRole: 'Cuello de botella cuántico; solo se salva mediante la resonancia de Hoyle en el proceso Triple-Alfa.',
    zone: 'fusion',
    stellarTag: 'triplealpha'
  },
  {
    id: 'be9',
    symbol: '⁹Be',
    name: 'Berilio-9',
    element: 'Berilio',
    z: 4,
    n: 5,
    a: 9,
    bindingEnergyPerNucleon: 6.463,
    isStable: true,
    stellarRole: 'Único isótopo estable de berilio; producido por fragmentación espalativa.',
    zone: 'fusion'
  },
  {
    id: 'b10',
    symbol: '¹⁰B',
    name: 'Boro-10',
    element: 'Boro',
    z: 5,
    n: 5,
    a: 10,
    bindingEnergyPerNucleon: 6.475,
    isStable: true,
    stellarRole: 'Absorbedor masivo de neutrones en astrofísica estelar y reactores nucleares.',
    zone: 'fusion'
  },
  {
    id: 'b11',
    symbol: '¹¹B',
    name: 'Boro-11',
    element: 'Boro',
    z: 5,
    n: 6,
    a: 11,
    bindingEnergyPerNucleon: 6.928,
    isStable: true,
    stellarRole: 'Isótopo dominante del boro en el cosmos.',
    zone: 'fusion'
  },
  {
    id: 'c11',
    symbol: '¹¹C',
    name: 'Carbono-11',
    element: 'Carbono',
    z: 6,
    n: 5,
    a: 11,
    bindingEnergyPerNucleon: 6.676,
    isStable: false,
    decayMode: 'Beta más (β⁺ ➔ ¹¹B)',
    halfLife: '20.36 min',
    stellarRole: 'Intermedio de alta energía en entornos estelares ricos en protones.',
    zone: 'fusion'
  },
  {
    id: 'c12',
    symbol: '¹²C',
    name: 'Carbono-12',
    element: 'Carbono',
    z: 6,
    n: 6,
    a: 12,
    bindingEnergyPerNucleon: 7.680,
    isStable: true,
    stellarRole: 'Pilar de la química cósmica y de la vida; producido por el proceso Triple-Alfa en gigantes rojas.',
    zone: 'fusion',
    stellarTag: 'triplealpha'
  },
  {
    id: 'c13',
    symbol: '¹³C',
    name: 'Carbono-13',
    element: 'Carbono',
    z: 6,
    n: 7,
    a: 13,
    bindingEnergyPerNucleon: 7.470,
    isStable: true,
    stellarRole: 'Intermedio catalítico del Ciclo CNO y fuente neutrónica clave (¹³C(α,n)¹⁶O) para el proceso s.',
    zone: 'fusion',
    stellarTag: 'cno'
  },
  {
    id: 'c14',
    symbol: '¹⁴C',
    name: 'Carbono-14',
    element: 'Carbono',
    z: 6,
    n: 8,
    a: 14,
    bindingEnergyPerNucleon: 7.520,
    isStable: false,
    decayMode: 'Beta menos (β⁻ ➔ ¹⁴N)',
    halfLife: '5,730 años',
    stellarRole: 'Isótopo cosmogénico inestable; decae con menor energía de enlace que ¹⁴N.',
    zone: 'fusion'
  },
  {
    id: 'n14',
    symbol: '¹⁴N',
    name: 'Nitrógeno-14',
    element: 'Nitrógeno',
    z: 7,
    n: 7,
    a: 14,
    bindingEnergyPerNucleon: 7.476,
    isStable: true,
    stellarRole: 'Cuello de botella más lento del Ciclo CNO estelar, acumulándose como el isótopo más abundante de nitrógeno.',
    zone: 'fusion',
    stellarTag: 'cno'
  },
  {
    id: 'n15',
    symbol: '¹⁵N',
    name: 'Nitrógeno-15',
    element: 'Nitrógeno',
    z: 7,
    n: 8,
    a: 15,
    bindingEnergyPerNucleon: 7.699,
    isStable: true,
    stellarRole: 'Cierre de ciclo CNO-I por reacción ¹⁵N(p,α)¹²C.',
    zone: 'fusion',
    stellarTag: 'cno'
  },
  {
    id: 'o16',
    symbol: '¹⁶O',
    name: 'Oxígeno-16',
    element: 'Oxígeno',
    z: 8,
    n: 8,
    a: 16,
    bindingEnergyPerNucleon: 7.976,
    isStable: true,
    stellarRole: 'Núcleo doblemente mágico (Z=8, N=8). El tercer elemento más abundante del cosmos.',
    zone: 'fusion',
    stellarTag: 'triplealpha'
  },
  {
    id: 'o18',
    symbol: '¹⁸O',
    name: 'Oxígeno-18',
    element: 'Oxígeno',
    z: 8,
    n: 10,
    a: 18,
    bindingEnergyPerNucleon: 7.767,
    isStable: true,
    stellarRole: 'Subproducto de estrellas ricas en nitrógeno durante la quema de helio.',
    zone: 'fusion'
  },
  {
    id: 'f19',
    symbol: '¹⁹F',
    name: 'Flúor-19',
    element: 'Flúor',
    z: 9,
    n: 10,
    a: 19,
    bindingEnergyPerNucleon: 7.779,
    isStable: true,
    stellarRole: 'Sintetizado en estrellas de la rama asintótica gigante (AGB) por neutrinos.',
    zone: 'fusion'
  },
  {
    id: 'ne20',
    symbol: '²⁰Ne',
    name: 'Neón-20',
    element: 'Neón',
    z: 10,
    n: 10,
    a: 20,
    bindingEnergyPerNucleon: 8.032,
    isStable: true,
    stellarRole: 'Producido en la quema de carbono en núcleos de estrellas masivas.',
    zone: 'fusion',
    stellarTag: 'silicon'
  },
  {
    id: 'na22',
    symbol: '²²Na',
    name: 'Sodio-22',
    element: 'Sodio',
    z: 11,
    n: 11,
    a: 22,
    bindingEnergyPerNucleon: 7.915,
    isStable: false,
    decayMode: 'Beta más / Captura (β⁺ ➔ ²²Ne)',
    halfLife: '2.60 años',
    stellarRole: 'Emisor de líneas gamma cósmicas de 1.275 MeV observado por telescopios espaciales en supernovas.',
    zone: 'fusion'
  },
  {
    id: 'na23',
    symbol: '²³Na',
    name: 'Sodio-23',
    element: 'Sodio',
    z: 11,
    n: 12,
    a: 23,
    bindingEnergyPerNucleon: 8.111,
    isStable: true,
    stellarRole: 'Único isótopo primordial estable de sodio.',
    zone: 'fusion'
  },
  {
    id: 'mg24',
    symbol: '²⁴Mg',
    name: 'Magnesio-24',
    element: 'Magnesio',
    z: 12,
    n: 12,
    a: 24,
    bindingEnergyPerNucleon: 8.261,
    isStable: true,
    stellarRole: 'Elemento alfa fundamental producido por la quema de carbono (¹²C + ¹²C ➔ ²⁴Mg + γ).',
    zone: 'fusion',
    stellarTag: 'silicon'
  },
  {
    id: 'al26',
    symbol: '²⁶Al',
    name: 'Aluminio-26',
    element: 'Aluminio',
    z: 13,
    n: 13,
    a: 26,
    bindingEnergyPerNucleon: 8.150,
    isStable: false,
    decayMode: 'Beta más (β⁺ ➔ ²⁶Mg)',
    halfLife: '7.17 × 10⁵ años',
    stellarRole: 'Calentador radiogénico primario de los planetesimales en el sistema solar temprano; firma de supernovas.',
    zone: 'fusion'
  },
  {
    id: 'al27',
    symbol: '²⁷Al',
    name: 'Aluminio-27',
    element: 'Aluminio',
    z: 13,
    n: 14,
    a: 27,
    bindingEnergyPerNucleon: 8.332,
    isStable: true,
    stellarRole: 'Elemento formador de la matriz cristalina de alúmina (Al₂O₃) en polvos interestelares.',
    zone: 'fusion'
  },
  {
    id: 'si28',
    symbol: '²⁸Si',
    name: 'Silicio-28',
    element: 'Silicio',
    z: 14,
    n: 14,
    a: 28,
    bindingEnergyPerNucleon: 8.448,
    isStable: true,
    stellarRole: 'Inicio de la fase terminal de quema de silicio a temperaturas de 3,000 millones de Kelvin.',
    zone: 'fusion',
    stellarTag: 'silicon'
  },
  {
    id: 'p31',
    symbol: '³¹P',
    name: 'Fósforo-31',
    element: 'Fósforo',
    z: 15,
    n: 16,
    a: 31,
    bindingEnergyPerNucleon: 8.483,
    isStable: true,
    stellarRole: 'Elemento clave para el ADN y metabolismo celular, sintetizado en supernovas masivas.',
    zone: 'fusion'
  },
  {
    id: 's32',
    symbol: '³²S',
    name: 'Azufre-32',
    element: 'Azufre',
    z: 16,
    n: 16,
    a: 32,
    bindingEnergyPerNucleon: 8.493,
    isStable: true,
    stellarRole: 'Captura de partículas alfa sucesivas durante la quema avanzada de silicio.',
    zone: 'fusion'
  },
  {
    id: 'cl35',
    symbol: '³⁵Cl',
    name: 'Cloro-35',
    element: 'Cloro',
    z: 17,
    n: 18,
    a: 35,
    bindingEnergyPerNucleon: 8.520,
    isStable: true,
    stellarRole: 'Isótopo dominante del cloro en gases interestelares.',
    zone: 'fusion'
  },
  {
    id: 'cl36',
    symbol: '³⁶Cl',
    name: 'Cloro-36',
    element: 'Cloro',
    z: 17,
    n: 19,
    a: 36,
    bindingEnergyPerNucleon: 8.514,
    isStable: false,
    decayMode: 'Beta menos (β⁻ ➔ ³⁶Ar)',
    halfLife: '3.01 × 10⁵ años',
    stellarRole: 'Radionucleido cosmogénico producido por colisiones de rayos cósmicos.',
    zone: 'fusion'
  },
  {
    id: 'ar40',
    symbol: '⁴⁰Ar',
    name: 'Argón-40',
    element: 'Argón',
    z: 18,
    n: 22,
    a: 40,
    bindingEnergyPerNucleon: 8.595,
    isStable: true,
    stellarRole: 'Hijo radiogénico de la desintegración del ⁴⁰K en minerales rocosos.',
    zone: 'fusion'
  },
  {
    id: 'k40',
    symbol: '⁴⁰K',
    name: 'Potasio-40',
    element: 'Potasio',
    z: 19,
    n: 21,
    a: 40,
    bindingEnergyPerNucleon: 8.538,
    isStable: false,
    decayMode: 'Beta menos / Captura (β⁻ / EC)',
    halfLife: '1.25 × 10⁹ años',
    stellarRole: 'Principal fuente de calor geotérmico interno de la Tierra; núcleo impar-impar inestable.',
    zone: 'fusion'
  },
  {
    id: 'ca40',
    symbol: '⁴⁰Ca',
    name: 'Calcio-40',
    element: 'Calcio',
    z: 20,
    n: 20,
    a: 40,
    bindingEnergyPerNucleon: 8.551,
    isStable: true,
    stellarRole: 'Núcleo doblemente mágico estable (Z=20, N=20).',
    zone: 'fusion'
  },
  {
    id: 'ti48',
    symbol: '⁴⁸Ti',
    name: 'Titanio-48',
    element: 'Titanio',
    z: 22,
    n: 26,
    a: 48,
    bindingEnergyPerNucleon: 8.723,
    isStable: true,
    stellarRole: 'Producto terminal de la quema foto-desintegrativa en colapso nuclear.',
    zone: 'fusion'
  },
  {
    id: 'cr52',
    symbol: '⁵²Cr',
    name: 'Cromo-52',
    element: 'Cromo',
    z: 24,
    n: 28,
    a: 52,
    bindingEnergyPerNucleon: 8.776,
    isStable: true,
    stellarRole: 'Núcleo con capa de neutrones cerrada (N=28).',
    zone: 'fusion'
  },

  // PEAK OF STABILITY (Peak of Iron & Nickel Group)
  {
    id: 'fe54',
    symbol: '⁵⁴Fe',
    name: 'Hierro-54',
    element: 'Hierro',
    z: 26,
    n: 28,
    a: 54,
    bindingEnergyPerNucleon: 8.736,
    isStable: true,
    stellarRole: 'Aproximación a la cima termodinámica de nucleosíntesis estelar.',
    zone: 'peak',
    stellarTag: 'silicon'
  },
  {
    id: 'fe56',
    symbol: '⁵⁶Fe',
    name: 'Hierro-56',
    element: 'Hierro',
    z: 26,
    n: 30,
    a: 56,
    bindingEnergyPerNucleon: 8.790,
    isStable: true,
    stellarRole: 'Pico emblemático de la nucleosíntesis estelar. El final energético de la fusión estelar (Q=0).',
    zone: 'peak',
    stellarTag: 'silicon'
  },
  {
    id: 'ni56',
    symbol: '⁵⁶Ni',
    name: 'Níquel-56',
    element: 'Níquel',
    z: 28,
    n: 28,
    a: 56,
    bindingEnergyPerNucleon: 8.643,
    isStable: false,
    decayMode: 'Captura electrónica (EC ➔ ⁵⁶Co ➔ ⁵⁶Fe)',
    halfLife: '6.075 días',
    stellarRole: 'Sintetizado masivamente en supernovas tipo Ia y colapso de núcleo. Su decaimiento alimenta la luz de la supernova.',
    zone: 'peak',
    stellarTag: 'silicon'
  },
  {
    id: 'co56',
    symbol: '⁵⁶Co',
    name: 'Cobalto-56',
    element: 'Cobalto',
    z: 27,
    n: 29,
    a: 56,
    bindingEnergyPerNucleon: 8.695,
    isStable: false,
    decayMode: 'Beta más / Captura (β⁺ ➔ ⁵⁶Fe)',
    halfLife: '77.24 días',
    stellarRole: 'Determina la curva de enfriamiento y luminosidad post-explosión de supernovas.',
    zone: 'peak'
  },
  {
    id: 'fe58',
    symbol: '⁵⁸Fe',
    name: 'Hierro-58',
    element: 'Hierro',
    z: 26,
    n: 32,
    a: 58,
    bindingEnergyPerNucleon: 8.792,
    isStable: true,
    stellarRole: 'Uno de los núcleos más fuertemente ligados de la naturaleza.',
    zone: 'peak'
  },
  {
    id: 'co60',
    symbol: '⁶⁰Co',
    name: 'Cobalto-60',
    element: 'Cobalto',
    z: 27,
    n: 33,
    a: 60,
    bindingEnergyPerNucleon: 8.747,
    isStable: false,
    decayMode: 'Beta menos (β⁻ ➔ ⁶⁰Ni + 2γ)',
    halfLife: '5.27 años',
    stellarRole: 'Radionucleido emisor gamma energético utilizado en terapia oncológica e irradiación.',
    zone: 'peak'
  },
  {
    id: 'ni60',
    symbol: '⁶⁰Ni',
    name: 'Níquel-60',
    element: 'Níquel',
    z: 28,
    n: 32,
    a: 60,
    bindingEnergyPerNucleon: 8.781,
    isStable: true,
    stellarRole: 'Isótopo de gran estabilidad nuclear hijo del decaimiento de ⁶⁰Fe estelar.',
    zone: 'peak'
  },
  {
    id: 'ni62',
    symbol: '⁶²Ni',
    name: 'Níquel-62',
    element: 'Níquel',
    z: 28,
    n: 34,
    a: 62,
    bindingEnergyPerNucleon: 8.7946,
    isStable: true,
    stellarRole: '¡RÉCORD ABSOLUTO DEL UNIVERSO! Máxima energía de enlace por nucleón (8.7946 MeV), superando levemente a ⁵⁶Fe.',
    zone: 'peak',
    stellarTag: 'silicon'
  },
  {
    id: 'cu63',
    symbol: '⁶³Cu',
    name: 'Cobre-63',
    element: 'Cobre',
    z: 29,
    n: 34,
    a: 63,
    bindingEnergyPerNucleon: 8.752,
    isStable: true,
    stellarRole: 'Primer elemento más allá del pico; su síntesis requiere aporte neto de energía (proceso s).',
    zone: 'fission',
    stellarTag: 's-process'
  },
  {
    id: 'zn64',
    symbol: '⁶⁴Zn',
    name: 'Zinc-64',
    element: 'Zinc',
    z: 30,
    n: 34,
    a: 64,
    bindingEnergyPerNucleon: 8.736,
    isStable: true,
    stellarRole: 'Sintetizado por captura neutrónica en estrellas AGB masivas.',
    zone: 'fission'
  },
  {
    id: 'ge70',
    symbol: '⁷⁰Ge',
    name: 'Germanio-70',
    element: 'Germanio',
    z: 32,
    n: 38,
    a: 70,
    bindingEnergyPerNucleon: 8.705,
    isStable: true,
    stellarRole: 'Producido enteramente por proceso s estelar.',
    zone: 'fission'
  },

  // Heavy Elements (s-process & r-process zone where B/A drops)
  {
    id: 'kr84',
    symbol: '⁸⁴Kr',
    name: 'Kriptón-84',
    element: 'Kriptón',
    z: 36,
    n: 48,
    a: 84,
    bindingEnergyPerNucleon: 8.718,
    isStable: true,
    stellarRole: 'Gas noble producto de la quema de estrellas gigantes rojas.',
    zone: 'fission'
  },
  {
    id: 'sr88',
    symbol: '⁸⁸Sr',
    name: 'Estroncio-88',
    element: 'Estroncio',
    z: 38,
    n: 50,
    a: 88,
    bindingEnergyPerNucleon: 8.732,
    isStable: true,
    stellarRole: 'Capa neutrónica cerrada (N=50); pico de abundancia en proceso s.',
    zone: 'fission',
    stellarTag: 's-process'
  },
  {
    id: 'sr90',
    symbol: '⁹⁰Sr',
    name: 'Estroncio-90',
    element: 'Estroncio',
    z: 38,
    n: 52,
    a: 90,
    bindingEnergyPerNucleon: 8.696,
    isStable: false,
    decayMode: 'Beta menos (β⁻ ➔ ⁹⁰Y ➔ ⁹⁰Zr)',
    halfLife: '28.8 años',
    stellarRole: 'Peligroso producto de fisión nuclear acumulativo en el tejido óseo.',
    zone: 'fission'
  },
  {
    id: 'ag107',
    symbol: '¹⁰⁷Ag',
    name: 'Plata-107',
    element: 'Plata',
    z: 47,
    n: 60,
    a: 107,
    bindingEnergyPerNucleon: 8.554,
    isStable: true,
    stellarRole: 'Metal noble generado mediante captura neutrónica lenta y rápida.',
    zone: 'fission',
    stellarTag: 'r-process'
  },
  {
    id: 'sn120',
    symbol: '¹²⁰Sn',
    name: 'Estaño-120',
    element: 'Estaño',
    z: 50,
    n: 70,
    a: 120,
    bindingEnergyPerNucleon: 8.504,
    isStable: true,
    stellarRole: 'Núcleo con protones mágicos (Z=50); posee 10 isótopos estables en el valle.',
    zone: 'fission'
  },
  {
    id: 'i127',
    symbol: '¹²⁷I',
    name: 'Yodo-127',
    element: 'Yodo',
    z: 53,
    n: 74,
    a: 127,
    bindingEnergyPerNucleon: 8.445,
    isStable: true,
    stellarRole: 'Único isótopo estable de yodo, esencial para la glándula tiroides.',
    zone: 'fission'
  },
  {
    id: 'i131',
    symbol: '¹³¹I',
    name: 'Yodo-131',
    element: 'Yodo',
    z: 53,
    n: 78,
    a: 131,
    bindingEnergyPerNucleon: 8.420,
    isStable: false,
    decayMode: 'Beta menos (β⁻ ➔ ¹³¹Xe)',
    halfLife: '8.02 días',
    stellarRole: 'Fisión de reactores y supernovas; trazador de accidentes radiológicos.',
    zone: 'fission'
  },
  {
    id: 'cs137',
    symbol: '¹³⁷Cs',
    name: 'Cesio-137',
    element: 'Cesio',
    z: 55,
    n: 82,
    a: 137,
    bindingEnergyPerNucleon: 8.384,
    isStable: false,
    decayMode: 'Beta menos (β⁻ ➔ ¹³⁷mBa ➔ ¹³⁷Ba)',
    halfLife: '30.17 años',
    stellarRole: 'Fragmento de fisión típico con menor B/A que los núcleos estables de su masa.',
    zone: 'fission'
  },
  {
    id: 'ba138',
    symbol: '¹³⁸Ba',
    name: 'Bario-138',
    element: 'Bario',
    z: 56,
    n: 82,
    a: 138,
    bindingEnergyPerNucleon: 8.394,
    isStable: true,
    stellarRole: 'Núcleo con neutrones mágicos (N=82); pico de abundancia cósmica s-process.',
    zone: 'fission',
    stellarTag: 's-process'
  },
  {
    id: 'au197',
    symbol: '¹⁹⁷Au',
    name: 'Oro-197',
    element: 'Oro',
    z: 79,
    n: 118,
    a: 197,
    bindingEnergyPerNucleon: 7.915,
    isStable: true,
    stellarRole: 'Sintetizado casi exclusivamente en colisiones extremas de estrellas de neutrones (kilonovas).',
    zone: 'fission',
    stellarTag: 'r-process'
  },
  {
    id: 'pb208',
    symbol: '²⁰⁸Pb',
    name: 'Plomo-208',
    element: 'Plomo',
    z: 82,
    n: 126,
    a: 208,
    bindingEnergyPerNucleon: 7.867,
    isStable: true,
    stellarRole: 'Núcleo doblemente mágico hiperestable (Z=82, N=126). Fin de todas las cadenas de desintegración radiactiva.',
    zone: 'fission',
    stellarTag: 's-process'
  },
  {
    id: 'po210',
    symbol: '²¹⁰Po',
    name: 'Polonio-210',
    element: 'Polonio',
    z: 84,
    n: 126,
    a: 210,
    bindingEnergyPerNucleon: 7.834,
    isStable: false,
    decayMode: 'Alfa (α ➔ ²⁰⁶Pb)',
    halfLife: '138.38 días',
    stellarRole: 'Emisor alfa puro de extrema radiotoxicidad descubierto por Marie Curie.',
    zone: 'fission'
  },
  {
    id: 'ra226',
    symbol: '²²⁶Ra',
    name: 'Radio-226',
    element: 'Radio',
    z: 88,
    n: 138,
    a: 226,
    bindingEnergyPerNucleon: 7.662,
    isStable: false,
    decayMode: 'Alfa (α ➔ ²²²Rn)',
    halfLife: '1,600 años',
    stellarRole: 'Histórico radioisótopo aislado de la pechblenda; unidad histórica del Curie (Ci).',
    zone: 'fission'
  },
  {
    id: 'th232',
    symbol: '²³²Th',
    name: 'Torio-232',
    element: 'Torio',
    z: 90,
    n: 142,
    a: 232,
    bindingEnergyPerNucleon: 7.615,
    isStable: false,
    decayMode: 'Alfa (α ➔ ²²⁸Ra)',
    halfLife: '14,050 millones de años',
    stellarRole: 'Radionucleido primordial fértil para el ciclo del combustible nuclear de torio.',
    zone: 'fission',
    stellarTag: 'r-process'
  },
  {
    id: 'u235',
    symbol: '²³⁵U',
    name: 'Uranio-235',
    element: 'Uranio',
    z: 92,
    n: 143,
    a: 235,
    bindingEnergyPerNucleon: 7.591,
    isStable: false,
    decayMode: 'Alfa / Fisión inducida (α ➔ ²³¹Th)',
    halfLife: '704 millones de años',
    stellarRole: 'Único nucleido fisible primordial encontrado en la naturaleza; combustible de reactores nucleares.',
    zone: 'fission',
    stellarTag: 'r-process'
  },
  {
    id: 'u238',
    symbol: '²³⁸U',
    name: 'Uranio-238',
    element: 'Uranio',
    z: 92,
    n: 146,
    a: 238,
    bindingEnergyPerNucleon: 7.570,
    isStable: false,
    decayMode: 'Alfa (α ➔ ²³⁴Th)',
    halfLife: '4,468 millones de años',
    stellarRole: 'El elemento primordial más pesado; su fisión libera ~200 MeV porque sube en la curva B/A.',
    zone: 'fission',
    stellarTag: 'r-process'
  },
  {
    id: 'pu239',
    symbol: '²³⁹Pu',
    name: 'Plutonio-239',
    element: 'Plutonio',
    z: 94,
    n: 145,
    a: 239,
    bindingEnergyPerNucleon: 7.560,
    isStable: false,
    decayMode: 'Alfa (α ➔ ²³⁵U)',
    halfLife: '24,110 años',
    stellarRole: 'Fisionable sintético generado en reactores mediante captura neutrónica en ²³⁸U.',
    zone: 'fission'
  }
];

// Generate an empirical smooth reference line across A = 1 to 240
// based on the Liquid Drop Model (Bethe-Weizsäcker) fit for optimal stable nuclei
function generateLiquidDropLine(): { a: number; curve: number }[] {
  const points: { a: number; curve: number }[] = [];
  // Sample key points along A
  const sampleAs = [
    1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 28, 32, 40, 48, 52, 56, 58, 62, 64, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 208, 220, 230, 238, 240
  ];

  for (const a of sampleAs) {
    if (a === 1) {
      points.push({ a: 1, curve: 0 });
      continue;
    }
    // Optimal Z for given A in valley of stability
    const zOpt = a / (2 + 0.015 * Math.pow(a, 2 / 3));
    // Semi-empirical mass formula parameters (MeV)
    const av = 15.67;
    const as = 17.23;
    const ac = 0.714;
    const aa = 23.28;
    const ap = 12.0;

    const b = av * a 
      - as * Math.pow(a, 2 / 3) 
      - ac * (zOpt * (zOpt - 1)) / Math.pow(a, 1 / 3) 
      - aa * Math.pow(a - 2 * zOpt, 2) / a 
      + (a % 2 === 0 ? ap / Math.sqrt(a) : 0);

    const bPerA = Math.max(0, b / a);
    points.push({ a, curve: Number(bPerA.toFixed(3)) });
  }

  return points;
}

const THEORETICAL_CURVE = generateLiquidDropLine();

export const NuclearBindingEnergyCurve: React.FC = () => {
  const [filterMode, setFilterMode] = useState<'all' | 'stable' | 'unstable' | 'stellar'>('all');
  const [selectedIsoId, setSelectedIsoId] = useState<string>('fe56');
  const [secondaryIsoId, setSecondaryIsoId] = useState<string>('ni56');
  const [rangeFilter, setRangeFilter] = useState<'all' | 'light' | 'iron' | 'heavy'>('all');

  // Filtered isotope list for chart
  const filteredIsotopes = useMemo(() => {
    return NUCLEAR_BINDING_DATA.filter((iso) => {
      // Filter by stability/stellar
      if (filterMode === 'stable' && !iso.isStable) return false;
      if (filterMode === 'unstable' && iso.isStable) return false;
      if (filterMode === 'stellar' && !iso.stellarTag) return false;

      // Filter by A range
      if (rangeFilter === 'light' && iso.a > 30) return false;
      if (rangeFilter === 'iron' && (iso.a < 30 || iso.a > 90)) return false;
      if (rangeFilter === 'heavy' && iso.a < 90) return false;

      return true;
    });
  }, [filterMode, rangeFilter]);

  // Merge theoretical curve with scatter data for composed chart
  const combinedChartData = useMemo(() => {
    // Collect all unique A numbers
    const dataMap: Record<number, any> = {};

    THEORETICAL_CURVE.forEach(p => {
      // Respect range filter
      if (rangeFilter === 'light' && p.a > 30) return;
      if (rangeFilter === 'iron' && (p.a < 30 || p.a > 90)) return;
      if (rangeFilter === 'heavy' && p.a < 90) return;

      dataMap[p.a] = {
        a: p.a,
        theoreticalCurve: p.curve,
        stablePoint: null,
        unstablePoint: null,
        isotopeData: null
      };
    });

    filteredIsotopes.forEach(iso => {
      if (!dataMap[iso.a]) {
        dataMap[iso.a] = {
          a: iso.a,
          theoreticalCurve: null,
          stablePoint: null,
          unstablePoint: null,
          isotopeData: iso
        };
      }

      if (iso.isStable) {
        dataMap[iso.a].stablePoint = iso.bindingEnergyPerNucleon;
      } else {
        dataMap[iso.a].unstablePoint = iso.bindingEnergyPerNucleon;
      }
      dataMap[iso.a].isotopeData = iso;
    });

    return Object.values(dataMap).sort((a, b) => a.a - b.a);
  }, [filteredIsotopes, rangeFilter]);

  const selectedIso = useMemo(() => {
    return NUCLEAR_BINDING_DATA.find(i => i.id === selectedIsoId) || NUCLEAR_BINDING_DATA[29]; // default Fe-56
  }, [selectedIsoId]);

  const secondaryIso = useMemo(() => {
    return NUCLEAR_BINDING_DATA.find(i => i.id === secondaryIsoId) || NUCLEAR_BINDING_DATA[30]; // default Ni-56
  }, [secondaryIsoId]);

  const totalBindingEnergyMeV = (selectedIso.bindingEnergyPerNucleon * selectedIso.a).toFixed(2);
  const secondaryTotalBindingEnergyMeV = (secondaryIso.bindingEnergyPerNucleon * secondaryIso.a).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-[#070d17] border border-cyan-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  Nuclear Physics & Stellar Genesis
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Curva B/A vs A
                </span>
              </div>
              <h3 className="text-lg font-bold text-white font-mono">
                Curva de Energía de Enlace por Nucleón (B/A) & Valle de Estabilidad
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Pico Máximo Cósmico:</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold">
              ⁶²Ni (8.795 MeV) & ⁵⁶Fe (8.790 MeV)
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed max-w-4xl">
          La curva de energía de enlace por nucleón $B/A$ gobierna el destino energético de todas las estrellas del cosmos:
          a la izquierda del hierro ($A &lt; 56$), la <strong>fusión nuclear libera energía</strong> ($Q &gt; 0$);
          a la derecha ($A &gt; 56$), la fusión se vuelve endotérmica y solo la <strong>fisión nuclear o la captura neutrónica rápida</strong> (supernovas y kilonovas) pueden operar.
        </p>

        {/* Filter Toolbar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Stability filter */}
          <div className="flex items-center gap-1.5 bg-[#050810] border border-slate-800 p-1 rounded-xl">
            <span className="text-slate-500 text-[10px] uppercase font-bold px-2">Filtro:</span>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg transition font-bold ${
                filterMode === 'all'
                  ? 'bg-cyan-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({NUCLEAR_BINDING_DATA.length})
            </button>
            <button
              onClick={() => setFilterMode('stable')}
              className={`px-2.5 py-1 rounded-lg transition font-bold flex items-center gap-1 ${
                filterMode === 'stable'
                  ? 'bg-emerald-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Estables
            </button>
            <button
              onClick={() => setFilterMode('unstable')}
              className={`px-2.5 py-1 rounded-lg transition font-bold flex items-center gap-1 ${
                filterMode === 'unstable'
                  ? 'bg-red-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Inestables
            </button>
            <button
              onClick={() => setFilterMode('stellar')}
              className={`px-2.5 py-1 rounded-lg transition font-bold flex items-center gap-1 ${
                filterMode === 'stellar'
                  ? 'bg-amber-400 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Quema Estelar
            </button>
          </div>

          {/* Mass Number A range filter */}
          <div className="flex items-center gap-1.5 bg-[#050810] border border-slate-800 p-1 rounded-xl">
            <span className="text-slate-500 text-[10px] uppercase font-bold px-2">Rango A:</span>
            <button
              onClick={() => setRangeFilter('all')}
              className={`px-2 py-1 rounded-lg transition ${
                rangeFilter === 'all' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todo (1-240)
            </button>
            <button
              onClick={() => setRangeFilter('light')}
              className={`px-2 py-1 rounded-lg transition ${
                rangeFilter === 'light' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="A <= 30 (Fusión p-p, CNO, Helio)"
            >
              Ligeros (A≤30)
            </button>
            <button
              onClick={() => setRangeFilter('iron')}
              className={`px-2 py-1 rounded-lg transition ${
                rangeFilter === 'iron' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="A = 30-90 (Pico del Hierro y Níquel)"
            >
              Pico Fe-Ni (30-90)
            </button>
            <button
              onClick={() => setRangeFilter('heavy')}
              className={`px-2 py-1 rounded-lg transition ${
                rangeFilter === 'heavy' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="A > 90 (Fisión y proceso r)"
            >
              Pesados (A≥90)
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Recharts Curve Viewport */}
      <div className="bg-[#070b12] border border-slate-800 rounded-2xl p-5 shadow-2xl relative">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-bold flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
              Isótopos Estables (Valle)
            </span>
            <span className="text-red-400 font-bold flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
              Isótopos Inestables (Radiactivos)
            </span>
            <span className="text-cyan-600/70 hidden sm:inline flex items-center gap-1">
              <span className="w-3 h-0.5 bg-cyan-500/50 inline-block" />
              Línea Teórica (Gota Líquida Weizsäcker)
            </span>
          </div>

          <div className="text-slate-400 text-[11px]">
            Haz clic en cualquier punto para inspeccionarlo
          </div>
        </div>

        {/* Recharts Composed Curve */}
        <div className="h-[420px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={combinedChartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  const item = e.activePayload[0].payload.isotopeData;
                  if (item) {
                    setSelectedIsoId(item.id);
                  }
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />

              <XAxis 
                dataKey="a" 
                stroke="#64748b" 
                fontSize={11}
                label={{ 
                  value: 'Número Másico A (Total de Nucleones = Z + N)', 
                  position: 'insideBottom', 
                  offset: -15, 
                  fill: '#94a3b8', 
                  fontSize: 11,
                  fontFamily: 'monospace'
                }} 
              />
              
              <YAxis 
                stroke="#64748b" 
                fontSize={11}
                domain={[0, 9.2]}
                ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 8.79, 9]}
                label={{ 
                  value: 'Energía de Enlace B/A (MeV / nucleón)', 
                  angle: -90, 
                  position: 'insideLeft', 
                  fill: '#94a3b8', 
                  fontSize: 11,
                  fontFamily: 'monospace'
                }} 
              />

              {/* Reference line at Iron/Nickel peak */}
              <ReferenceLine 
                x={56} 
                stroke="#10b981" 
                strokeDasharray="4 4" 
                label={{ 
                  value: '⁵⁶Fe (8.790 MeV)', 
                  position: 'top', 
                  fill: '#34d399', 
                  fontSize: 10, 
                  fontFamily: 'monospace' 
                }} 
              />

              <ReferenceLine 
                x={62} 
                stroke="#06b6d4" 
                strokeDasharray="2 2" 
                label={{ 
                  value: '⁶²Ni (8.795 MeV)', 
                  position: 'insideTopRight', 
                  fill: '#22d3ee', 
                  fontSize: 10, 
                  fontFamily: 'monospace' 
                }} 
              />

              {/* Shaded zone: Exothermic fusion region */}
              {rangeFilter === 'all' && (
                <>
                  <ReferenceArea 
                    x1={1} 
                    x2={56} 
                    y1={0} 
                    y2={9.2} 
                    fill="#06b6d4" 
                    fillOpacity={0.04} 
                  />
                  <ReferenceArea 
                    x1={56} 
                    x2={240} 
                    y1={0} 
                    y2={9.2} 
                    fill="#f59e0b" 
                    fillOpacity={0.03} 
                  />
                </>
              )}

              {/* Liquid Drop Model continuous line */}
              <Line
                type="monotone"
                dataKey="theoreticalCurve"
                name="Modelo Gota Líquida"
                stroke="#0284c7"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="5 5"
                isAnimationActive={false}
              />

              {/* Stable Isotopes Scatter Points */}
              <Scatter
                dataKey="stablePoint"
                name="Isótopos Estables"
                fill="#06b6d4"
                stroke="#22d3ee"
                strokeWidth={1.5}
                shape="circle"
                r={4}
              />

              {/* Unstable/Radioactive Isotopes Scatter Points */}
              <Scatter
                dataKey="unstablePoint"
                name="Isótopos Inestables / Radiactivos"
                fill="#ef4444"
                stroke="#f87171"
                strokeWidth={1.5}
                shape="diamond"
                r={5}
              />

              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const iso: BindingEnergyIsotope | null = data.isotopeData;
                    if (!iso) {
                      return (
                        <div className="bg-[#0b111a] border border-slate-700 p-2.5 rounded-lg text-xs font-mono">
                          <span className="text-slate-400">Número másico A: {data.a}</span>
                          <span className="block text-cyan-300">Curva teórica: {data.theoreticalCurve} MeV</span>
                        </div>
                      );
                    }

                    return (
                      <div className="bg-[#0b111a] border border-cyan-500/60 p-3 rounded-xl shadow-2xl text-xs font-mono max-w-xs space-y-1.5 z-50">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                          <span className="font-bold text-sm text-white">{iso.symbol} ({iso.name})</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            iso.isStable
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : 'bg-red-950 text-red-300 border border-red-500/40'
                          }`}>
                            {iso.isStable ? 'Estable' : 'Inestable'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 text-[11px]">
                          <span className="text-slate-400">Nucleones (A):</span>
                          <span className="text-slate-200 font-bold">{iso.a} (Z={iso.z}, N={iso.n})</span>

                          <span className="text-slate-400">B/A por nucleón:</span>
                          <span className="text-cyan-300 font-bold">{iso.bindingEnergyPerNucleon.toFixed(3)} MeV</span>

                          <span className="text-slate-400">B Total (A×B/A):</span>
                          <span className="text-amber-300">{(iso.bindingEnergyPerNucleon * iso.a).toFixed(1)} MeV</span>
                        </div>

                        {!iso.isStable && iso.decayMode && (
                          <div className="text-[10.5px] text-red-300 border-t border-slate-800/80 pt-1">
                            <span className="text-slate-400">Decaimiento:</span> {iso.decayMode}
                            {iso.halfLife && <span className="block text-slate-400">Vida media: {iso.halfLife}</span>}
                          </div>
                        )}

                        <p className="text-[10px] text-slate-300 font-sans border-t border-slate-800/80 pt-1 leading-tight">
                          {iso.stellarRole}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Legend Explanation & Key Takeaways */}
        <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] font-mono">
          <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
            <span className="text-cyan-400 font-bold block mb-1">1. Fusión Exotérmica (A &lt; 56):</span>
            <p className="text-slate-300 font-sans text-[11px] leading-tight">
              Los núcleos ligeros ascienden la pendiente. Al fusionarse (ej: 4 ¹H ➔ ⁴He), el incremento brusco de B/A libera energía masiva ($Q = \Delta B$).
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
            <span className="text-emerald-400 font-bold block mb-1">2. Pico del Hierro & Níquel (A = 56-62):</span>
            <p className="text-slate-300 font-sans text-[11px] leading-tight">
              El <strong>⁶²Ni (8.795 MeV)</strong> y el <strong>⁵⁶Fe (8.790 MeV)</strong> alcanzan la cima. Aquí la fusión ya no libera energía, provocando el colapso gravitatorio de supernovas.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30">
            <span className="text-amber-400 font-bold block mb-1">3. Fisión & Proceso r (A &gt; 56):</span>
            <p className="text-slate-300 font-sans text-[11px] leading-tight">
              La repulsión culombiana ($Z^2/A^{1/3}$) reduce la estabilidad. Dividir núcleos pesados (²³⁵U ➔ fragmentos) sube en la curva y libera ~200 MeV.
            </p>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparative Analyzer */}
      <div className="bg-[#0b111a] border border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-4 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-cyan-400 block font-bold">
                Módulo Analítico de Comparación
              </span>
              <h4 className="text-sm font-bold text-white">
                Contraste Cuantitativo: Isótopo Primario vs. Isótopo Secundario
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Presets pedagógicos:</span>
            <button
              onClick={() => { setSelectedIsoId('fe56'); setSecondaryIsoId('ni56'); }}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] border border-slate-700"
            >
              ⁵⁶Fe vs. ⁵⁶Ni
            </button>
            <button
              onClick={() => { setSelectedIsoId('c12'); setSecondaryIsoId('c14'); }}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] border border-slate-700"
            >
              ¹²C vs. ¹⁴C
            </button>
            <button
              onClick={() => { setSelectedIsoId('he4'); setSecondaryIsoId('h3'); }}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] border border-slate-700"
            >
              ⁴He vs. ³H
            </button>
            <button
              onClick={() => { setSelectedIsoId('u235'); setSecondaryIsoId('pb208'); }}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] border border-slate-700"
            >
              ²³⁵U vs. ²⁰⁸Pb
            </button>
          </div>
        </div>

        {/* Dual Card Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Card: Selected Isotope */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            selectedIso.isStable
              ? 'bg-[#06121e] border-cyan-500/40'
              : 'bg-[#18090d] border-red-500/40'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <label className="text-[10px] uppercase text-slate-400 font-bold">Isótopo 1 (Primario):</label>
              <select
                value={selectedIsoId}
                onChange={(e) => setSelectedIsoId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500"
              >
                {NUCLEAR_BINDING_DATA.map(iso => (
                  <option key={iso.id} value={iso.id}>
                    {iso.symbol} - {iso.name} ({iso.isStable ? 'Estable' : 'Radiactivo'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <span className="text-2xl font-bold font-mono text-white block">
                  {selectedIso.symbol}
                </span>
                <span className="text-xs text-slate-400 block">{selectedIso.name} ({selectedIso.element})</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                selectedIso.isStable
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                  : 'bg-red-950 text-red-300 border-red-500/40'
              }`}>
                {selectedIso.isStable ? 'Estable' : 'Inestable / Radiactivo'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 block">Protones (Z):</span>
                <span className="font-bold text-slate-200">{selectedIso.z}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Neutrones (N):</span>
                <span className="font-bold text-slate-200">{selectedIso.n}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Energía Enlace B/A:</span>
                <span className="font-bold text-cyan-400 text-sm">{selectedIso.bindingEnergyPerNucleon.toFixed(3)} MeV/n</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Energía Total B:</span>
                <span className="font-bold text-amber-300">{totalBindingEnergyMeV} MeV</span>
              </div>
            </div>

            {!selectedIso.isStable && (
              <div className="p-2 rounded bg-red-950/30 border border-red-800/40 text-[11px] text-red-200 space-y-0.5">
                <div><strong>Decaimiento:</strong> {selectedIso.decayMode}</div>
                <div><strong>Vida Media:</strong> {selectedIso.halfLife}</div>
              </div>
            )}

            <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
              {selectedIso.stellarRole}
            </p>
          </div>

          {/* Right Card: Secondary Isotope */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            secondaryIso.isStable
              ? 'bg-[#06121e] border-cyan-500/40'
              : 'bg-[#18090d] border-red-500/40'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <label className="text-[10px] uppercase text-slate-400 font-bold">Isótopo 2 (Comparativo):</label>
              <select
                value={secondaryIsoId}
                onChange={(e) => setSecondaryIsoId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500"
              >
                {NUCLEAR_BINDING_DATA.map(iso => (
                  <option key={iso.id} value={iso.id}>
                    {iso.symbol} - {iso.name} ({iso.isStable ? 'Estable' : 'Radiactivo'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <span className="text-2xl font-bold font-mono text-white block">
                  {secondaryIso.symbol}
                </span>
                <span className="text-xs text-slate-400 block">{secondaryIso.name} ({secondaryIso.element})</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                secondaryIso.isStable
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                  : 'bg-red-950 text-red-300 border-red-500/40'
              }`}>
                {secondaryIso.isStable ? 'Estable' : 'Inestable / Radiactivo'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 block">Protones (Z):</span>
                <span className="font-bold text-slate-200">{secondaryIso.z}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Neutrones (N):</span>
                <span className="font-bold text-slate-200">{secondaryIso.n}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Energía Enlace B/A:</span>
                <span className="font-bold text-cyan-400 text-sm">{secondaryIso.bindingEnergyPerNucleon.toFixed(3)} MeV/n</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Energía Total B:</span>
                <span className="font-bold text-amber-300">{secondaryTotalBindingEnergyMeV} MeV</span>
              </div>
            </div>

            {!secondaryIso.isStable && (
              <div className="p-2 rounded bg-red-950/30 border border-red-800/40 text-[11px] text-red-200 space-y-0.5">
                <div><strong>Decaimiento:</strong> {secondaryIso.decayMode}</div>
                <div><strong>Vida Media:</strong> {secondaryIso.halfLife}</div>
              </div>
            )}

            <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
              {secondaryIso.stellarRole}
            </p>
          </div>
        </div>

        {/* Delta Summary Comparison Bar */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">
              Diferencia de Energía de Enlace por Nucleón: 
              <strong className="text-cyan-300 ml-1.5 font-mono text-sm">
                Δ(B/A) = {Math.abs(selectedIso.bindingEnergyPerNucleon - secondaryIso.bindingEnergyPerNucleon).toFixed(3)} MeV/nucleón
              </strong>
            </span>
          </div>

          <div className="text-slate-400 text-[11px] font-sans">
            {selectedIso.bindingEnergyPerNucleon > secondaryIso.bindingEnergyPerNucleon ? (
              <span>
                <strong>{selectedIso.symbol}</strong> es más estable y fuertemente ligado que <strong>{secondaryIso.symbol}</strong>.
              </span>
            ) : selectedIso.bindingEnergyPerNucleon < secondaryIso.bindingEnergyPerNucleon ? (
              <span>
                <strong>{secondaryIso.symbol}</strong> es más estable y fuertemente ligado que <strong>{selectedIso.symbol}</strong>.
              </span>
            ) : (
              <span>Ambos isótopos poseen exactamente la misma energía de enlace por nucleón.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
