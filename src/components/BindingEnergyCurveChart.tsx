import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Flame, 
  Atom, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  Filter, 
  HelpCircle, 
  Layers, 
  Scale, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Maximize2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Scatter, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  ReferenceLine, 
  ReferenceArea 
} from 'recharts';

export interface NuclearBindingDataPoint {
  id: string;
  name: string;
  symbol: string;
  a: number; // Mass number A (X-axis)
  z: number; // Protons Z
  n: number; // Neutrons N
  bindingEnergyPerNucleon: number; // MeV/nucleon (Y-axis)
  totalBindingEnergy: number; // MeV
  isStable: boolean;
  halfLife: string;
  decayMode: string;
  category: 'stable' | 'unstable';
  astrophysicalOrigin: string;
  astrophysicalRole: string;
  isAlphaLadder?: boolean;
  isNotablePeak?: boolean;
}

// Comprehensive scientific dataset of binding energy per nucleon (B/A in MeV)
// Comparing both stable and unstable isotopes across light, intermediate, iron-peak, and heavy/fissile elements.
export const BINDING_ENERGY_DATASET: NuclearBindingDataPoint[] = [
  // A = 1
  {
    id: 'h1',
    name: 'Protio (¹H)',
    symbol: '¹H',
    a: 1,
    z: 1,
    n: 0,
    bindingEnergyPerNucleon: 0.000,
    totalBindingEnergy: 0.000,
    isStable: true,
    halfLife: 'Estable (> 10³⁴ años)',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Big Bang Primordial',
    astrophysicalRole: 'Combustible primario de la secuencia principal en todas las estrellas mediante la cadena p-p y el ciclo CNO.',
    isNotablePeak: true
  },
  // A = 2
  {
    id: 'h2',
    name: 'Deuterio (²H)',
    symbol: '²H',
    a: 2,
    z: 1,
    n: 1,
    bindingEnergyPerNucleon: 1.112,
    totalBindingEnergy: 2.224,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Big Bang Primordial',
    astrophysicalRole: 'Primer eslabón de fusión estelar tras la interacción débil (p + p → d + e⁺ + ν_e). Fusión a baja barrera Coulomb.',
    isNotablePeak: true
  },
  // A = 3
  {
    id: 'h3',
    name: 'Tritio (³H)',
    symbol: '³H',
    a: 3,
    z: 1,
    n: 2,
    bindingEnergyPerNucleon: 2.827,
    totalBindingEnergy: 8.481,
    isStable: false,
    halfLife: '12.32 años',
    decayMode: 'Beta menos (β⁻ → ³He)',
    category: 'unstable',
    astrophysicalOrigin: 'Espalación de rayos cósmicos / Fisión',
    astrophysicalRole: 'Isótopo inestable de hidrógeno. Decae a ³He liberando 18.6 keV de energía cinética.'
  },
  {
    id: 'he3',
    name: 'Helio-3 (³He)',
    symbol: '³He',
    a: 3,
    z: 2,
    n: 1,
    bindingEnergyPerNucleon: 2.573,
    totalBindingEnergy: 7.718,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Big Bang y Fusión Solar p-p',
    astrophysicalRole: 'Producto intermedio clave en la cadena p-p I (³He + ³He → ⁴He + 2p) y p-p II.'
  },
  // A = 4 (Extremely stable alpha particle)
  {
    id: 'he4',
    name: 'Helio-4 / Alfa (⁴He)',
    symbol: '⁴He',
    a: 4,
    z: 2,
    n: 2,
    bindingEnergyPerNucleon: 7.074,
    totalBindingEnergy: 28.296,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Big Bang Primordial y Fusión Estelar',
    astrophysicalRole: '¡Pico anómalo colosal! Doblemente mágico (Z=2, N=2). "Ceniza" de la quema de hidrógeno y combustible del proceso triple-alfa.',
    isAlphaLadder: true,
    isNotablePeak: true
  },
  {
    id: 'h4',
    name: 'Hidrógeno-4 (⁴H)',
    symbol: '⁴H',
    a: 4,
    z: 1,
    n: 3,
    bindingEnergyPerNucleon: 1.720,
    totalBindingEnergy: 6.880,
    isStable: false,
    halfLife: '1.4 × 10⁻²² s',
    decayMode: 'Emisión de neutrón',
    category: 'unstable',
    astrophysicalOrigin: 'Colisiones nucleares extremas',
    astrophysicalRole: 'Hiper-inestable con exceso neutrónico masivo. Demuestra el abismo frente al estable ⁴He.'
  },
  // A = 6
  {
    id: 'li6',
    name: 'Litio-6 (⁶Li)',
    symbol: '⁶Li',
    a: 6,
    z: 3,
    n: 3,
    bindingEnergyPerNucleon: 5.332,
    totalBindingEnergy: 31.992,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Espalación por rayos cósmicos',
    astrophysicalRole: 'Valle de baja energía entre ⁴He y ¹²C; destruido rápidamente en interiores estelares a T > 2 MK.'
  },
  {
    id: 'he6',
    name: 'Helio-6 (⁶He)',
    symbol: '⁶He',
    a: 6,
    z: 2,
    n: 4,
    bindingEnergyPerNucleon: 4.879,
    totalBindingEnergy: 29.274,
    isStable: false,
    halfLife: '806.7 ms',
    decayMode: 'Beta menos (β⁻ → ⁶Li)',
    category: 'unstable',
    astrophysicalOrigin: 'Reacciones neutrónicas en supernovas',
    astrophysicalRole: 'Núcleo halo con 2 neutrones desacoplados en la periferia.'
  },
  // A = 7
  {
    id: 'li7',
    name: 'Litio-7 (⁷Li)',
    symbol: '⁷Li',
    a: 7,
    z: 3,
    n: 4,
    bindingEnergyPerNucleon: 5.606,
    totalBindingEnergy: 39.242,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Big Bang Primordial y Gigantes AGB',
    astrophysicalRole: 'Elemento primordial sintétizado en los primeros minutos tras el Big Bang.'
  },
  {
    id: 'be7',
    name: 'Berilio-7 (⁷Be)',
    symbol: '⁷Be',
    a: 7,
    z: 4,
    n: 3,
    bindingEnergyPerNucleon: 5.372,
    totalBindingEnergy: 37.604,
    isStable: false,
    halfLife: '53.22 días',
    decayMode: 'Captura Electrónica (EC → ⁷Li)',
    category: 'unstable',
    astrophysicalOrigin: 'Rama p-p II en el Sol (³He + ⁴He → ⁷Be + γ)',
    astrophysicalRole: 'Intermedio crítico en el centro del Sol; emite neutrinos solares monocromáticos (0.86 MeV).'
  },
  // A = 8 (The Hoyle Bottleneck)
  {
    id: 'be8',
    name: 'Berilio-8 (⁸Be)',
    symbol: '⁸Be',
    a: 8,
    z: 4,
    n: 4,
    bindingEnergyPerNucleon: 7.062,
    totalBindingEnergy: 56.496,
    isStable: false,
    halfLife: '8.19 × 10⁻¹⁷ s',
    decayMode: 'Fisión espontánea en 2 partículas alfa (2 ⁴He)',
    category: 'unstable',
    astrophysicalOrigin: 'Quema de Helio en Gigantes Rojas',
    astrophysicalRole: '¡El célebre cuello de botella cósmico! Menos ligado que dos partículas alfa separadas (Q = -92 keV). Sin la resonancia de Hoyle a 7.65 MeV en ¹²C, el universo carecería de carbono.',
    isAlphaLadder: true,
    isNotablePeak: true
  },
  {
    id: 'b8',
    name: 'Boro-8 (⁸B)',
    symbol: '⁸B',
    a: 8,
    z: 5,
    n: 3,
    bindingEnergyPerNucleon: 4.717,
    totalBindingEnergy: 37.736,
    isStable: false,
    halfLife: '770 ms',
    decayMode: 'Beta más (β⁺ → ⁸Be* → 2α)',
    category: 'unstable',
    astrophysicalOrigin: 'Rama p-p III en el núcleo solar (⁷Be + p → ⁸B + γ)',
    astrophysicalRole: 'Fuente de los neutrinos solares de alta energía (hasta 14 MeV) detectados por Super-Kamiokande y SNO.'
  },
  // A = 9
  {
    id: 'be9',
    name: 'Berilio-9 (⁹Be)',
    symbol: '⁹Be',
    a: 9,
    z: 4,
    n: 5,
    bindingEnergyPerNucleon: 6.463,
    totalBindingEnergy: 58.167,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Espalación interestelar de rayos cósmicos',
    astrophysicalRole: 'Único isótopo estable de berilio. Ligado débilmente respecto a neutrones libres.'
  },
  // A = 10
  {
    id: 'b10',
    name: 'Boro-10 (¹⁰B)',
    symbol: '¹⁰B',
    a: 10,
    z: 5,
    n: 5,
    bindingEnergyPerNucleon: 6.475,
    totalBindingEnergy: 64.750,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Espalación cósmica',
    astrophysicalRole: 'Alta sección eficaz de captura neutrónica (absorbente térmico).'
  },
  {
    id: 'c10',
    name: 'Carbono-10 (¹⁰C)',
    symbol: '¹⁰C',
    a: 10,
    z: 6,
    n: 4,
    bindingEnergyPerNucleon: 6.040,
    totalBindingEnergy: 60.400,
    isStable: false,
    halfLife: '19.3 s',
    decayMode: 'Beta más (β⁺ → ¹⁰B)',
    category: 'unstable',
    astrophysicalOrigin: 'Reacciones de fragmentación',
    astrophysicalRole: 'Deficiencia neutrónica reduce marcadamente la energía de enlace frente a isobaras estables.'
  },
  // A = 11
  {
    id: 'b11',
    name: 'Boro-11 (¹¹B)',
    symbol: '¹¹B',
    a: 11,
    z: 5,
    n: 6,
    bindingEnergyPerNucleon: 6.928,
    totalBindingEnergy: 76.208,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Espalación cósmica y supernovas',
    astrophysicalRole: 'Isótopo más abundante de boro (80%).'
  },
  {
    id: 'c11',
    name: 'Carbono-11 (¹¹C)',
    symbol: '¹¹C',
    a: 11,
    z: 6,
    n: 5,
    bindingEnergyPerNucleon: 6.676,
    totalBindingEnergy: 73.436,
    isStable: false,
    halfLife: '20.36 min',
    decayMode: 'Beta más (β⁺ → ¹¹B)',
    category: 'unstable',
    astrophysicalOrigin: 'Emisor de positrones empleado en medicina PET',
    astrophysicalRole: 'Inestable por exceso de protones frente al pozo simétrico.'
  },
  // A = 12 (Carbon-12)
  {
    id: 'c12',
    name: 'Carbono-12 (¹²C)',
    symbol: '¹²C',
    a: 12,
    z: 6,
    n: 6,
    bindingEnergyPerNucleon: 7.680,
    totalBindingEnergy: 92.160,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Proceso Triple-Alfa en Gigantes Rojas',
    astrophysicalRole: 'Pilar absoluto de la química orgánica y catalizador del ciclo estelar CNO. Su formación depende del estado resonante de Hoyle.',
    isAlphaLadder: true,
    isNotablePeak: true
  },
  {
    id: 'b12',
    name: 'Boro-12 (¹²B)',
    symbol: '¹²B',
    a: 12,
    z: 5,
    n: 7,
    bindingEnergyPerNucleon: 6.626,
    totalBindingEnergy: 79.512,
    isStable: false,
    halfLife: '20.20 ms',
    decayMode: 'Beta menos (β⁻ → ¹²C)',
    category: 'unstable',
    astrophysicalOrigin: 'Captura neutrónica rápida',
    astrophysicalRole: 'Inestable con menor B/A que ¹²C; decae espontáneamente para alcanzar el núcleo simétrico.'
  },
  {
    id: 'n12',
    name: 'Nitrógeno-12 (¹²N)',
    symbol: '¹²N',
    a: 12,
    z: 7,
    n: 5,
    bindingEnergyPerNucleon: 6.169,
    totalBindingEnergy: 74.028,
    isStable: false,
    halfLife: '11.00 ms',
    decayMode: 'Beta más (β⁺ → ¹²C)',
    category: 'unstable',
    astrophysicalOrigin: 'Estrellas calientes de protones libres',
    astrophysicalRole: 'Asimetría protón-neutrón severa (Z=7 > N=5).'
  },
  // A = 13
  {
    id: 'c13',
    name: 'Carbono-13 (¹³C)',
    symbol: '¹³C',
    a: 13,
    z: 6,
    n: 7,
    bindingEnergyPerNucleon: 7.470,
    totalBindingEnergy: 97.110,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Ciclo CNO Estelar',
    astrophysicalRole: 'Fuente de neutrones para el proceso s mediante ¹³C(α, n)¹⁶O en gigantes asintóticas (AGB).'
  },
  {
    id: 'n13',
    name: 'Nitrógeno-13 (¹³N)',
    symbol: '¹³N',
    a: 13,
    z: 7,
    n: 6,
    bindingEnergyPerNucleon: 7.239,
    totalBindingEnergy: 94.107,
    isStable: false,
    halfLife: '9.96 min',
    decayMode: 'Beta más (β⁺ → ¹³C)',
    category: 'unstable',
    astrophysicalOrigin: 'Ciclo CNO Estelar (¹²C + p → ¹³N + γ)',
    astrophysicalRole: 'Paso número 2 del ciclo catalítico CNO en estrellas de más de 1.3 masas solares.'
  },
  // A = 14
  {
    id: 'n14',
    name: 'Nitrógeno-14 (¹⁴N)',
    symbol: '¹⁴N',
    a: 14,
    z: 7,
    n: 7,
    bindingEnergyPerNucleon: 7.476,
    totalBindingEnergy: 104.664,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Ciclo CNO Estelar',
    astrophysicalRole: 'Punto de estrangulamiento ("bottleneck") del ciclo CNO: la reacción ¹⁴N(p, γ)¹⁵O es la más lenta, acumulando nitrógeno.'
  },
  {
    id: 'c14',
    name: 'Carbono-14 (¹⁴C)',
    symbol: '¹⁴C',
    a: 14,
    z: 6,
    n: 8,
    bindingEnergyPerNucleon: 7.520,
    totalBindingEnergy: 105.280,
    isStable: false,
    halfLife: '5,730 años',
    decayMode: 'Beta menos (β⁻ → ¹⁴N)',
    category: 'unstable',
    astrophysicalOrigin: 'Rayos cósmicos sobre ¹⁴N atmosférico (¹⁴N + n → ¹⁴C + p)',
    astrophysicalRole: 'Reloj de radiodatación geológica y arqueológica. Decae por emisión beta de baja energía.'
  },
  // A = 15
  {
    id: 'n15',
    name: 'Nitrógeno-15 (¹⁵N)',
    symbol: '¹⁵N',
    a: 15,
    z: 7,
    n: 8,
    bindingEnergyPerNucleon: 7.699,
    totalBindingEnergy: 115.485,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Ciclo CNO y Supernovas',
    astrophysicalRole: 'Isótopo de cierre del ciclo CNO-I (¹⁵N + p → ¹²C + ⁴He).'
  },
  {
    id: 'o15',
    name: 'Oxígeno-15 (¹⁵O)',
    symbol: '¹⁵O',
    a: 15,
    z: 8,
    n: 7,
    bindingEnergyPerNucleon: 7.464,
    totalBindingEnergy: 111.960,
    isStable: false,
    halfLife: '122.2 s',
    decayMode: 'Beta más (β⁺ → ¹⁵N)',
    category: 'unstable',
    astrophysicalOrigin: 'Ciclo CNO en estrellas masivas',
    astrophysicalRole: 'Emisor de positrones y neutrinos del ciclo CNO en el interior estelar.'
  },
  // A = 16 (Oxygen-16 - Doubly magic)
  {
    id: 'o16',
    name: 'Oxígeno-16 (¹⁶O)',
    symbol: '¹⁶O',
    a: 16,
    z: 8,
    n: 8,
    bindingEnergyPerNucleon: 7.976,
    totalBindingEnergy: 127.616,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Captura alfa en Gigantes Rojas (¹²C + α → ¹⁶O)',
    astrophysicalRole: '¡Núcleo doblemente mágico (Z=8, N=8)! Tercer elemento más abundante del universo observable y base de la vida.',
    isAlphaLadder: true,
    isNotablePeak: true
  },
  {
    id: 'n16',
    name: 'Nitrógeno-16 (¹⁶N)',
    symbol: '¹⁶N',
    a: 16,
    z: 7,
    n: 9,
    bindingEnergyPerNucleon: 7.375,
    totalBindingEnergy: 118.000,
    isStable: false,
    halfLife: '7.13 s',
    decayMode: 'Beta menos (β⁻ → ¹⁶O*) con rayos γ de 6.13 MeV',
    category: 'unstable',
    astrophysicalOrigin: 'Activación neutrónica en reactores nucleares',
    astrophysicalRole: 'Inestable con exceso neutrónico; emite radiación gamma sumamente penetrante.'
  },
  // A = 20 (Neon-20)
  {
    id: 'ne20',
    name: 'Neón-20 (²⁰Ne)',
    symbol: '²⁰Ne',
    a: 20,
    z: 10,
    n: 10,
    bindingEnergyPerNucleon: 8.032,
    totalBindingEnergy: 160.640,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Quema de Carbono estelar (¹²C + ¹²C → ²⁰Ne + α)',
    astrophysicalRole: 'Eslabón alfa clave en la evolución de estrellas masivas (> 8 masas solares).',
    isAlphaLadder: true
  },
  {
    id: 'f20',
    name: 'Flúor-20 (²⁰F)',
    symbol: '²⁰F',
    a: 20,
    z: 9,
    n: 11,
    bindingEnergyPerNucleon: 7.721,
    totalBindingEnergy: 154.420,
    isStable: false,
    halfLife: '11.16 s',
    decayMode: 'Beta menos (β⁻ → ²⁰Ne)',
    category: 'unstable',
    astrophysicalOrigin: 'Captura neutrónica',
    astrophysicalRole: 'Decae rápidamente hacia la configuración simétrica de neón-20.'
  },
  // A = 24 (Magnesium-24)
  {
    id: 'mg24',
    name: 'Magnesio-24 (²⁴Mg)',
    symbol: '²⁴Mg',
    a: 24,
    z: 12,
    n: 12,
    bindingEnergyPerNucleon: 8.261,
    totalBindingEnergy: 198.264,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Quema de Carbono y Neón',
    astrophysicalRole: 'Producto mayoritario de la fusión carbono-carbono y fotodesintegración de neón.',
    isAlphaLadder: true
  },
  {
    id: 'na24',
    name: 'Sodio-24 (²⁴Na)',
    symbol: '²⁴Na',
    a: 24,
    z: 11,
    n: 13,
    bindingEnergyPerNucleon: 8.053,
    totalBindingEnergy: 193.272,
    isStable: false,
    halfLife: '14.96 horas',
    decayMode: 'Beta menos (β⁻ → ²⁴Mg)',
    category: 'unstable',
    astrophysicalOrigin: 'Activación neutrónica en supernovas',
    astrophysicalRole: 'Isótopo inestable de sodio que decae a magnesio-24 con emisión gamma intensa.'
  },
  // A = 28 (Silicon-28)
  {
    id: 'si28',
    name: 'Silicio-28 (²⁸Si)',
    symbol: '²⁸Si',
    a: 28,
    z: 14,
    n: 14,
    bindingEnergyPerNucleon: 8.448,
    totalBindingEnergy: 236.544,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Quema de Oxígeno (¹⁶O + ¹⁶O → ²⁸Si + α)',
    astrophysicalRole: 'Combustible de la fase final de quema de silicio antes del colapso del núcleo estelar.',
    isAlphaLadder: true,
    isNotablePeak: true
  },
  {
    id: 'al28',
    name: 'Aluminio-28 (²⁸Al)',
    symbol: '²⁸Al',
    a: 28,
    z: 13,
    n: 15,
    bindingEnergyPerNucleon: 8.243,
    totalBindingEnergy: 230.804,
    isStable: false,
    halfLife: '2.24 min',
    decayMode: 'Beta menos (β⁻ → ²⁸Si)',
    category: 'unstable',
    astrophysicalOrigin: 'Captura neutrónica en choques estelares',
    astrophysicalRole: 'Menor enlace por nucleón; busca la estabilidad de ²⁸Si.'
  },
  // A = 32 (Sulfur-32)
  {
    id: 's32',
    name: 'Azufre-32 (³²S)',
    symbol: '³²S',
    a: 32,
    z: 16,
    n: 16,
    bindingEnergyPerNucleon: 8.493,
    totalBindingEnergy: 271.776,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Quema de Silicio estelar',
    astrophysicalRole: 'Eslabón alfa producido por ²⁸Si + ⁴He.',
    isAlphaLadder: true
  },
  {
    id: 'p32',
    name: 'Fósforo-32 (³²P)',
    symbol: '³²P',
    a: 32,
    z: 15,
    n: 17,
    bindingEnergyPerNucleon: 8.396,
    totalBindingEnergy: 268.672,
    isStable: false,
    halfLife: '14.26 días',
    decayMode: 'Beta menos (β⁻ → ³²S)',
    category: 'unstable',
    astrophysicalOrigin: 'Rayos cósmicos y reactores',
    astrophysicalRole: 'Trazador radiobiológico en biología molecular y metabolismo del ADN.'
  },
  // A = 36 (Argon-36)
  {
    id: 'ar36',
    name: 'Argón-36 (³⁶Ar)',
    symbol: '³⁶Ar',
    a: 36,
    z: 18,
    n: 18,
    bindingEnergyPerNucleon: 8.522,
    totalBindingEnergy: 306.792,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Quema de Silicio (³²S + α)',
    astrophysicalRole: 'Isótopo de gas noble primordial en el medio interestelar.',
    isAlphaLadder: true
  },
  {
    id: 'cl36',
    name: 'Cloro-36 (³⁶Cl)',
    symbol: '³⁶Cl',
    a: 36,
    z: 17,
    n: 19,
    bindingEnergyPerNucleon: 8.455,
    totalBindingEnergy: 304.380,
    isStable: false,
    halfLife: '301,000 años',
    decayMode: 'Beta menos / Captura electrónica',
    category: 'unstable',
    astrophysicalOrigin: 'Espalación en meteoritos y atmósferas',
    astrophysicalRole: 'Cronómetro isotópico para datar aguas subterráneas antiguas.'
  },
  // A = 40 (Calcium-40 - Doubly magic)
  {
    id: 'ca40',
    name: 'Calcio-40 (⁴⁰Ca)',
    symbol: '⁴⁰Ca',
    a: 40,
    z: 20,
    n: 20,
    bindingEnergyPerNucleon: 8.551,
    totalBindingEnergy: 342.040,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Quema de Silicio estelar',
    astrophysicalRole: '¡Núcleo doblemente mágico (Z=20, N=20)! Último nucleido estable con igual número de protones y neutrones.',
    isAlphaLadder: true,
    isNotablePeak: true
  },
  {
    id: 'k40',
    name: 'Potasio-40 (⁴⁰K)',
    symbol: '⁴⁰K',
    a: 40,
    z: 19,
    n: 21,
    bindingEnergyPerNucleon: 8.538,
    totalBindingEnergy: 341.520,
    isStable: false,
    halfLife: '1.248 × 10⁹ años',
    decayMode: 'Beta menos (89.3%) y Captura Electrónica (10.7%)',
    category: 'unstable',
    astrophysicalOrigin: 'Supernovas antes de la formación del Sistema Solar',
    astrophysicalRole: 'Isótopo radiactivo primordial responsable del calor geotérmico terrestre y del argón-40 atmosférico.'
  },
  // A = 52 (Chromium-52)
  {
    id: 'cr52',
    name: 'Cromo-52 (⁵²Cr)',
    symbol: '⁵²Cr',
    a: 52,
    z: 24,
    n: 28,
    bindingEnergyPerNucleon: 8.776,
    totalBindingEnergy: 456.352,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Proceso de equilibrio nuclear estelar (NSE)',
    astrophysicalRole: 'Aproximación a la cúspide de estabilidad; número mágico neutrónico N=28.'
  },
  // A = 56 (THE IRON PEAK: FE-56 vs NI-56)
  {
    id: 'fe56',
    name: 'Hierro-56 (⁵⁶Fe)',
    symbol: '⁵⁶Fe',
    a: 56,
    z: 26,
    n: 30,
    bindingEnergyPerNucleon: 8.790,
    totalBindingEnergy: 492.240,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Máxima estabilidad natural)',
    category: 'stable',
    astrophysicalOrigin: 'Desintegración radiactiva de ⁵⁶Ni sintetizado en Supernovas Tipo Ia y colapso de núcleo',
    astrophysicalRole: '¡PICO DE LA NUCLEOSÍNTESIS ESTELAR! La fusión más allá de ⁵⁶Fe es endotérmica (consume energía). Cuando el núcleo estelar se convierte en hierro, la estrella ya no puede generar presión térmica de radiación y colapsa cataclísmicamente.',
    isNotablePeak: true
  },
  {
    id: 'ni56',
    name: 'Níquel-56 (⁵⁶Ni)',
    symbol: '⁵⁶Ni',
    a: 56,
    z: 28,
    n: 28,
    bindingEnergyPerNucleon: 8.643,
    totalBindingEnergy: 484.008,
    isStable: false,
    halfLife: '6.075 días',
    decayMode: 'Captura electrónica (EC → ⁵⁶Co → ⁵⁶Fe)',
    category: 'unstable',
    astrophysicalOrigin: 'Onda de choque termonuclear de Supernovas Tipo Ia',
    astrophysicalRole: '¡El motor lumínico de las supernovas! Aunque doblemente mágico (Z=28, N=28), la repulsión de Coulomb entre sus 28 protones lo hace energéticamente inferior a ⁵⁶Fe por 8.23 MeV. Su decaimiento radiactivo ilumina las supernovas durante meses.',
    isAlphaLadder: true,
    isNotablePeak: true
  },
  {
    id: 'co56',
    name: 'Cobalto-56 (⁵⁶Co)',
    symbol: '⁵⁶Co',
    a: 56,
    z: 27,
    n: 29,
    bindingEnergyPerNucleon: 8.695,
    totalBindingEnergy: 486.920,
    isStable: false,
    halfLife: '77.24 días',
    decayMode: 'Beta más / Captura electrónica (→ ⁵⁶Fe)',
    category: 'unstable',
    astrophysicalOrigin: 'Desintegración de ⁵⁶Ni en supernovas',
    astrophysicalRole: 'Segundo paso del motor radiactivo de curva de luz de supernovas.'
  },
  // A = 58
  {
    id: 'fe58',
    name: 'Hierro-58 (⁵⁸Fe)',
    symbol: '⁵⁸Fe',
    a: 58,
    z: 26,
    n: 32,
    bindingEnergyPerNucleon: 8.792,
    totalBindingEnergy: 509.936,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Proceso s en estrellas masivas',
    astrophysicalRole: 'Uno de los tres núcleos con mayor energía de enlace por nucleón del cosmos.'
  },
  {
    id: 'ni58',
    name: 'Níquel-58 (⁵⁸Ni)',
    symbol: '⁵⁸Ni',
    a: 58,
    z: 28,
    n: 30,
    bindingEnergyPerNucleon: 8.732,
    totalBindingEnergy: 506.456,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Equilibrio nuclear estelar (NSE)',
    astrophysicalRole: 'Isótopo más abundante de níquel en la Tierra (68%).'
  },
  // A = 60
  {
    id: 'ni60',
    name: 'Níquel-60 (⁶⁰Ni)',
    symbol: '⁶⁰Ni',
    a: 60,
    z: 28,
    n: 32,
    bindingEnergyPerNucleon: 8.781,
    totalBindingEnergy: 526.860,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Desintegración de ⁶⁰Fe / Proceso s',
    astrophysicalRole: 'Núcleo altamente estable producto del decaimiento de ⁶⁰Fe interestelar.'
  },
  {
    id: 'co60',
    name: 'Cobalto-60 (⁶⁰Co)',
    symbol: '⁶⁰Co',
    a: 60,
    z: 27,
    n: 33,
    bindingEnergyPerNucleon: 8.718,
    totalBindingEnergy: 523.080,
    isStable: false,
    halfLife: '5.27 años',
    decayMode: 'Beta menos (β⁻ → ⁶⁰Ni) con rayos gamma de 1.17 y 1.33 MeV',
    category: 'unstable',
    astrophysicalOrigin: 'Activación neutrónica',
    astrophysicalRole: 'Fuente industrial de radiación gamma y radioterapia oncológica.'
  },
  // A = 62 (ABSOLUTE RECORD HOLDER OF BINDING ENERGY PER NUCLEON)
  {
    id: 'ni62',
    name: 'Níquel-62 (⁶²Ni)',
    symbol: '⁶²Ni',
    a: 62,
    z: 28,
    n: 34,
    bindingEnergyPerNucleon: 8.795,
    totalBindingEnergy: 545.290,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Máximo Absoluto B/A)',
    category: 'stable',
    astrophysicalOrigin: 'Captura neutrónica lenta (proceso s)',
    astrophysicalRole: '¡EL NÚCLEO MÁS FUERTEMENTE LIGADO DE LA NATURALEZA! Ostenta el récord absoluto de energía de enlace por nucleón (8.7946 MeV/nucleón). Es menos abundante que ⁵⁶Fe debido a barreras fotonucleares en supernovas.',
    isNotablePeak: true
  },
  {
    id: 'cu62',
    name: 'Cobre-62 (⁶²Cu)',
    symbol: '⁶²Cu',
    a: 62,
    z: 29,
    n: 33,
    bindingEnergyPerNucleon: 8.705,
    totalBindingEnergy: 539.710,
    isStable: false,
    halfLife: '9.67 min',
    decayMode: 'Beta más (β⁺ → ⁶²Ni)',
    category: 'unstable',
    astrophysicalOrigin: 'Reacciones de captura protónica',
    astrophysicalRole: 'Demuestra cómo la asimetría de espín e isospín aleja al núcleo de la cima del níquel-62.'
  },
  // A = 70
  {
    id: 'ge70',
    name: 'Germanio-70 (⁷⁰Ge)',
    symbol: '⁷⁰Ge',
    a: 70,
    z: 32,
    n: 38,
    bindingEnergyPerNucleon: 8.665,
    totalBindingEnergy: 606.550,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Proceso s en estrellas gigantes',
    astrophysicalRole: 'Inicio del descenso suave de la energía de enlace por nucleón debido a la repulsión electrostática acumulada.'
  },
  // A = 80
  {
    id: 'se80',
    name: 'Selenio-80 (⁸⁰Se)',
    symbol: '⁸⁰Se',
    a: 80,
    z: 34,
    n: 46,
    bindingEnergyPerNucleon: 8.645,
    totalBindingEnergy: 691.600,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Proceso s y r',
    astrophysicalRole: 'Núcleo intermedio de la nucleosíntesis por neutrones.'
  },
  {
    id: 'br80',
    name: 'Bromo-80 (⁸⁰Br)',
    symbol: '⁸⁰Br',
    a: 80,
    z: 35,
    n: 45,
    bindingEnergyPerNucleon: 8.572,
    totalBindingEnergy: 685.760,
    isStable: false,
    halfLife: '17.68 min',
    decayMode: 'Beta menos / Beta más',
    category: 'unstable',
    astrophysicalOrigin: 'Activación neutrónica',
    astrophysicalRole: 'Núcleo impar-impar con menor energía de ligadura.'
  },
  // A = 88 & 90 (Strontium & Zirconium)
  {
    id: 'sr88',
    name: 'Estroncio-88 (⁸⁸Sr)',
    symbol: '⁸⁸Sr',
    a: 88,
    z: 38,
    n: 50,
    bindingEnergyPerNucleon: 8.630,
    totalBindingEnergy: 759.440,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Proceso s en estrellas AGB (N=50 mágico)',
    astrophysicalRole: 'Capa neutrónica cerrada (N=50) que crea un pico local en las curvas de abundancia estelar.'
  },
  {
    id: 'zr90',
    name: 'Circonio-90 (⁹⁰Zr)',
    symbol: '⁹⁰Zr',
    a: 90,
    z: 40,
    n: 50,
    bindingEnergyPerNucleon: 8.660,
    totalBindingEnergy: 779.400,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Proceso s / Subcapa mágica Z=40, N=50',
    astrophysicalRole: 'Material estructural nuclear de baja captura neutrónica (Zircaloy).'
  },
  {
    id: 'sr90',
    name: 'Estroncio-90 (⁹⁰Sr)',
    symbol: '⁹⁰Sr',
    a: 90,
    z: 38,
    n: 52,
    bindingEnergyPerNucleon: 8.540,
    totalBindingEnergy: 768.600,
    isStable: false,
    halfLife: '28.9 años',
    decayMode: 'Beta menos (β⁻ → ⁹⁰Y → ⁹⁰Zr)',
    category: 'unstable',
    astrophysicalOrigin: 'Fragmento mayoritario de fisión nuclear de ²³⁵U',
    astrophysicalRole: 'Peligroso radioisótopo emisor beta que mimetiza el calcio óseo en seres vivos.'
  },
  // A = 100
  {
    id: 'mo100',
    name: 'Molibdeno-100 (¹⁰⁰Mo)',
    symbol: '¹⁰⁰Mo',
    a: 100,
    z: 42,
    n: 58,
    bindingEnergyPerNucleon: 8.560,
    totalBindingEnergy: 856.000,
    isStable: true,
    halfLife: 'Estable (7.1 × 10¹⁸ años doble beta)',
    decayMode: 'Doble beta 2νββ',
    category: 'stable',
    astrophysicalOrigin: 'Procesos s y r',
    astrophysicalRole: 'Utilizado en física de neutrinos para investigar decaimiento doble beta sin neutrinos.'
  },
  {
    id: 'tc100',
    name: 'Tecnecio-100 (¹⁰⁰Tc)',
    symbol: '¹⁰⁰Tc',
    a: 100,
    z: 43,
    n: 57,
    bindingEnergyPerNucleon: 8.480,
    totalBindingEnergy: 848.000,
    isStable: false,
    halfLife: '15.8 s',
    decayMode: 'Beta menos (β⁻ → ¹⁰⁰Ru)',
    category: 'unstable',
    astrophysicalOrigin: 'Intermedio de reacciones nucleares',
    astrophysicalRole: 'El tecnecio no posee ningún isótopo estable en toda la tabla periódica.'
  },
  // A = 107 (Silver)
  {
    id: 'ag107',
    name: 'Plata-107 (¹⁰⁷Ag)',
    symbol: '¹⁰⁷Ag',
    a: 107,
    z: 47,
    n: 60,
    bindingEnergyPerNucleon: 8.530,
    totalBindingEnergy: 912.710,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Proceso r en fusiones de estrellas de neutrones',
    astrophysicalRole: 'Metal noble forjado por capturas neutrónicas colosales.'
  },
  // A = 120 (Tin - Magic Z=50)
  {
    id: 'sn120',
    name: 'Estaño-120 (¹²⁰Sn)',
    symbol: '¹²⁰Sn',
    a: 120,
    z: 50,
    n: 70,
    bindingEnergyPerNucleon: 8.505,
    totalBindingEnergy: 1020.600,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Proceso s y r (Z=50 mágico)',
    astrophysicalRole: 'El estaño posee el récord de 10 isótopos estables gracias a su número mágico de protones Z=50.',
    isNotablePeak: true
  },
  {
    id: 'in120',
    name: 'Indio-120 (¹²⁰In)',
    symbol: '¹²⁰In',
    a: 120,
    z: 49,
    n: 71,
    bindingEnergyPerNucleon: 8.420,
    totalBindingEnergy: 1010.400,
    isStable: false,
    halfLife: '3.08 s',
    decayMode: 'Beta menos (β⁻ → ¹²⁰Sn)',
    category: 'unstable',
    astrophysicalOrigin: 'Fragmento de fisión',
    astrophysicalRole: 'Menor energía de enlace que la capa cerrada de estaño.'
  },
  // A = 131 (Iodine vs Xenon)
  {
    id: 'xe131',
    name: 'Xenón-131 (¹³¹Xe)',
    symbol: '¹³¹Xe',
    a: 131,
    z: 54,
    n: 77,
    bindingEnergyPerNucleon: 8.425,
    totalBindingEnergy: 1103.675,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Procesos s y r',
    astrophysicalRole: 'Gas noble pesado estable.'
  },
  {
    id: 'i131',
    name: 'Yodo-131 (¹³¹I)',
    symbol: '¹³¹I',
    a: 131,
    z: 53,
    n: 78,
    bindingEnergyPerNucleon: 8.380,
    totalBindingEnergy: 1097.780,
    isStable: false,
    halfLife: '8.02 días',
    decayMode: 'Beta menos (β⁻ → ¹³¹Xe*) con rayos gamma',
    category: 'unstable',
    astrophysicalOrigin: 'Fisión inducida de uranio y plutonio',
    astrophysicalRole: 'Famoso radioisótopo de tiroides; terapéutico en microdosis pero residuo crítico en accidentes.'
  },
  // A = 137 (Cesium vs Barium)
  {
    id: 'ba137',
    name: 'Bario-137 (¹³⁷Ba)',
    symbol: '¹³⁷Ba',
    a: 137,
    z: 56,
    n: 81,
    bindingEnergyPerNucleon: 8.385,
    totalBindingEnergy: 1148.745,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Proceso s en estrellas AGB',
    astrophysicalRole: 'Producto final del decaimiento del cesio-137.'
  },
  {
    id: 'cs137',
    name: 'Cesio-137 (¹³⁷Cs)',
    symbol: '¹³⁷Cs',
    a: 137,
    z: 55,
    n: 82,
    bindingEnergyPerNucleon: 8.350,
    totalBindingEnergy: 1143.950,
    isStable: false,
    halfLife: '30.08 años',
    decayMode: 'Beta menos (β⁻ → ¹³⁷Ba* → ¹³⁷Ba + γ de 662 keV)',
    category: 'unstable',
    astrophysicalOrigin: 'Fisión térmica de combustible nuclear',
    astrophysicalRole: 'Principal emisor de radiación a mediano plazo en residuos de fisión.'
  },
  // A = 141 (Barium-141 Fission Fragment)
  {
    id: 'ba141',
    name: 'Bario-141 (¹⁴¹Ba)',
    symbol: '¹⁴¹Ba',
    a: 141,
    z: 56,
    n: 85,
    bindingEnergyPerNucleon: 8.240,
    totalBindingEnergy: 1161.840,
    isStable: false,
    halfLife: '18.27 min',
    decayMode: 'Beta menos sucesivo hacia ¹⁴¹Pr',
    category: 'unstable',
    astrophysicalOrigin: 'Fragmento asimétrico típico de fisión de ²³⁵U',
    astrophysicalRole: 'Identificado históricamente por Otto Hahn y Fritz Strassmann en 1938 como prueba de la fisión nuclear.'
  },
  {
    id: 'pr141',
    name: 'Praseodimio-141 (¹⁴¹Pr)',
    symbol: '¹⁴¹Pr',
    a: 141,
    z: 59,
    n: 82,
    bindingEnergyPerNucleon: 8.310,
    totalBindingEnergy: 1171.710,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Proceso r y s (N=82 mágico)',
    astrophysicalRole: 'Tierra rara estable con número mágico de neutrones N=82.'
  },
  // A = 180 (Tantalum meta-state)
  {
    id: 'hf180',
    name: 'Hafnio-180 (¹⁸⁰Hf)',
    symbol: '¹⁸⁰Hf',
    a: 180,
    z: 72,
    n: 108,
    bindingEnergyPerNucleon: 8.040,
    totalBindingEnergy: 1447.200,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Proceso s y r',
    astrophysicalRole: 'Elemento refractario denso.'
  },
  {
    id: 'ta180m',
    name: 'Tántalo-180m (¹⁸⁰ᵐTa)',
    symbol: '¹⁸⁰ᵐTa',
    a: 180,
    z: 73,
    n: 107,
    bindingEnergyPerNucleon: 8.020,
    totalBindingEnergy: 1443.600,
    isStable: false,
    halfLife: '> 1.2 × 10¹⁵ años (Cuasi-estable)',
    decayMode: 'Isómero nuclear metaestable',
    category: 'unstable',
    astrophysicalOrigin: 'Foto-desintegración en supernovas',
    astrophysicalRole: 'Único isómero nuclear primordial de la naturaleza.'
  },
  // A = 197 (Gold)
  {
    id: 'au197',
    name: 'Oro-197 (¹⁹⁷Au)',
    symbol: '¹⁹⁷Au',
    a: 197,
    z: 79,
    n: 118,
    bindingEnergyPerNucleon: 7.916,
    totalBindingEnergy: 1559.452,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Fusiones de Estrellas de Neutrones (Kilonovas)',
    astrophysicalRole: '¡Metal precioso cósmico! No puede fabricarse en estrellas ordinarias; requiere el flujo extremo de neutrones de una kilonova.',
    isNotablePeak: true
  },
  {
    id: 'hg197',
    name: 'Mercurio-197 (¹⁹⁷Hg)',
    symbol: '¹⁹⁷Hg',
    a: 197,
    z: 80,
    n: 117,
    bindingEnergyPerNucleon: 7.892,
    totalBindingEnergy: 1554.724,
    isStable: false,
    halfLife: '64.14 horas',
    decayMode: 'Captura electrónica (EC → ¹⁹⁷Au)',
    category: 'unstable',
    astrophysicalOrigin: 'Activación con protones',
    astrophysicalRole: 'Transmutación nuclear inducida que desemboca en oro estable.'
  },
  // A = 208 (Lead-208 - Doubly Magic Peak)
  {
    id: 'pb208',
    name: 'Plomo-208 (²⁰⁸Pb)',
    symbol: '²⁰⁸Pb',
    a: 208,
    z: 82,
    n: 126,
    bindingEnergyPerNucleon: 7.867,
    totalBindingEnergy: 1636.336,
    isStable: true,
    halfLife: 'Estable',
    decayMode: 'Ninguno',
    category: 'stable',
    astrophysicalOrigin: 'Punto final de las cadenas radiactivas naturales de torio y uranio',
    astrophysicalRole: '¡EL NÚCLEO ESTABLE MÁS PESADO DEL UNIVERSO! Doblemente mágico (Z=82, N=126) con forma esférica perfecta y extrema resistencia a la fisión.',
    isNotablePeak: true
  },
  {
    id: 'bi208',
    name: 'Bismuto-208 (²⁰⁸Bi)',
    symbol: '²⁰⁸Bi',
    a: 208,
    z: 83,
    n: 125,
    bindingEnergyPerNucleon: 7.845,
    totalBindingEnergy: 1631.760,
    isStable: false,
    halfLife: '3.68 × 10⁵ años',
    decayMode: 'Captura electrónica (EC → ²⁰⁸Pb)',
    category: 'unstable',
    astrophysicalOrigin: 'Activación de protones sobre plomo',
    astrophysicalRole: 'Decae hacia el núcleo doblemente mágico de plomo-208.'
  },
  {
    id: 'tl208',
    name: 'Talio-208 (²⁰⁸Tl)',
    symbol: '²⁰⁸Tl',
    a: 208,
    z: 81,
    n: 127,
    bindingEnergyPerNucleon: 7.820,
    totalBindingEnergy: 1626.560,
    isStable: false,
    halfLife: '3.05 min',
    decayMode: 'Beta menos (β⁻ → ²⁰⁸Pb) con rayo γ de 2.614 MeV',
    category: 'unstable',
    astrophysicalOrigin: 'Cadena radiactiva del Torio-232',
    astrophysicalRole: 'Emite el rayo gamma de más alta energía del decaimiento radiactivo natural terrestre.'
  },
  // A = 210 (Polonium)
  {
    id: 'po210',
    name: 'Polonio-210 (²¹⁰Po)',
    symbol: '²¹⁰Po',
    a: 210,
    z: 84,
    n: 126,
    bindingEnergyPerNucleon: 7.834,
    totalBindingEnergy: 1645.140,
    isStable: false,
    halfLife: '138.38 días',
    decayMode: 'Alfa puro (α → ²⁰⁶Pb) con 5.3 MeV',
    category: 'unstable',
    astrophysicalOrigin: 'Cadena del Uranio-238 / Síntesis en reactores',
    astrophysicalRole: 'Generador termoeléctrico de radioisótopos (RTG); emisor alfa letal en dosis ínfimas.'
  },
  // A = 226 (Radium)
  {
    id: 'ra226',
    name: 'Radio-226 (²²⁶Ra)',
    symbol: '²²⁶Ra',
    a: 226,
    z: 88,
    n: 138,
    bindingEnergyPerNucleon: 7.662,
    totalBindingEnergy: 1731.612,
    isStable: false,
    halfLife: '1,600 años',
    decayMode: 'Alfa (α → ²²²Rn)',
    category: 'unstable',
    astrophysicalOrigin: 'Cadena primordial del Uranio-238',
    astrophysicalRole: 'Aislado por Marie y Pierre Curie; decae al gas radón-222.'
  },
  // A = 232 (Thorium)
  {
    id: 'th232',
    name: 'Torio-232 (²³²Th)',
    symbol: '²³²Th',
    a: 232,
    z: 90,
    n: 142,
    bindingEnergyPerNucleon: 7.615,
    totalBindingEnergy: 1766.680,
    isStable: false,
    halfLife: '1.405 × 10¹⁰ años',
    decayMode: 'Alfa (α → ²²⁸Ra)',
    category: 'unstable',
    astrophysicalOrigin: 'Proceso r en fusiones de estrellas de neutrones',
    astrophysicalRole: 'Material fértil para reactores de sales fundidas (MSR); transmuta a ²³³U fisionable.',
    isNotablePeak: true
  },
  // A = 235 (Uranium-235 - Thermal Fissile)
  {
    id: 'u235',
    name: 'Uranio-235 (²³⁵U)',
    symbol: '²³⁵U',
    a: 235,
    z: 92,
    n: 143,
    bindingEnergyPerNucleon: 7.591,
    totalBindingEnergy: 1783.885,
    isStable: false,
    halfLife: '7.04 × 10⁸ años',
    decayMode: 'Alfa / Fisión nuclear inducida por neutrones lentos',
    category: 'unstable',
    astrophysicalOrigin: 'Proceso r colosal en Kilonovas',
    astrophysicalRole: '¡COMBUSTIBLE DE FISIÓN NUCLEAR! Al fisionarse en dos fragmentos como ¹⁴¹Ba (8.24 MeV) + ⁹²Kr (8.51 MeV), el B/A salta de 7.59 a ~8.45 MeV/nucleón, liberando ~200 MeV netos por núcleo.',
    isNotablePeak: true
  },
  // A = 238 (Uranium-238 - Primordial)
  {
    id: 'u238',
    name: 'Uranio-238 (²³⁸U)',
    symbol: '²³⁸U',
    a: 238,
    z: 92,
    n: 146,
    bindingEnergyPerNucleon: 7.570,
    totalBindingEnergy: 1801.660,
    isStable: false,
    halfLife: '4.468 × 10⁹ años',
    decayMode: 'Alfa (α → ²³⁴Th)',
    category: 'unstable',
    astrophysicalOrigin: 'Proceso r en Kilonovas / Supernovas',
    astrophysicalRole: 'Isótopo de uranio más abundante en la corteza terrestre (99.27%). Fértil para regenerar ²³⁹Pu.',
    isNotablePeak: true
  },
  // A = 239 (Plutonium-239)
  {
    id: 'pu239',
    name: 'Plutonio-239 (²³⁹Pu)',
    symbol: '²³⁹Pu',
    a: 239,
    z: 94,
    n: 145,
    bindingEnergyPerNucleon: 7.560,
    totalBindingEnergy: 1806.840,
    isStable: false,
    halfLife: '24,110 años',
    decayMode: 'Alfa / Fisión inducida',
    category: 'unstable',
    astrophysicalOrigin: 'Producido artificialmente por captura neutrónica en ²³⁸U',
    astrophysicalRole: 'Material fisionable para armas nucleares y reactores regeneradores rápidos.'
  },
  // A = 241 (Americium)
  {
    id: 'am241',
    name: 'Americio-241 (²⁴¹Am)',
    symbol: '²⁴¹Am',
    a: 241,
    z: 95,
    n: 146,
    bindingEnergyPerNucleon: 7.540,
    totalBindingEnergy: 1817.140,
    isStable: false,
    halfLife: '432.2 años',
    decayMode: 'Alfa (α → ²³⁷Np) con radiación γ de 59.5 keV',
    category: 'unstable',
    astrophysicalOrigin: 'Subproducto de captura neutrónica continua en plutonio',
    astrophysicalRole: 'Fuente de ionización para detectores de humo domésticos.'
  }
];

// Liquid Drop Model (Semi-Empirical Mass Formula of Bethe-Weizsäcker)
// B(A)/A theoretical curve calculation
export function calculateLiquidDropBindingPerNucleon(a: number): number {
  if (a <= 1) return 0;
  // Optimal Z approximation for stable line: Z = A / (2 + 0.015 * A^(2/3))
  const z = a / (2 + 0.015 * Math.pow(a, 2 / 3));
  const n = a - z;

  // Coefficients in MeV:
  const av = 15.8;   // Volume term
  const as = 18.3;   // Surface term
  const ac = 0.714;  // Coulomb repulsion term
  const aa = 23.2;   // Asymmetry term

  const volume = av * a;
  const surface = as * Math.pow(a, 2 / 3);
  const coulomb = ac * (z * (z - 1)) / Math.pow(a, 1 / 3);
  const asymmetry = aa * Math.pow(a - 2 * z, 2) / a;

  const totalB = Math.max(0, volume - surface - coulomb - asymmetry);
  return Number((totalB / a).toFixed(3));
}

// Generate continuous theoretical curve points
export const THEORETICAL_CURVE_POINTS = [
  2, 3, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 50, 56, 62, 70, 80, 90, 100, 120, 140, 160, 180, 200, 208, 220, 235, 238, 242
].map(a => ({
  a,
  theoreticalCurve: calculateLiquidDropBindingPerNucleon(a)
}));

export const BindingEnergyCurveChart: React.FC = () => {
  const [filterMode, setFilterMode] = useState<'all' | 'stable' | 'unstable' | 'fusion' | 'fission' | 'alpha'>('all');
  const [zoomRange, setZoomRange] = useState<'all' | 'light' | 'iron' | 'heavy'>('all');
  const [showTheoreticalLine, setShowTheoreticalLine] = useState<boolean>(true);
  const [selectedIsotope, setSelectedIsotope] = useState<NuclearBindingDataPoint>(
    BINDING_ENERGY_DATASET.find(iso => iso.id === 'fe56') || BINDING_ENERGY_DATASET[0]
  );
  const [comparisonIsotope, setComparisonIsotope] = useState<NuclearBindingDataPoint>(
    BINDING_ENERGY_DATASET.find(iso => iso.id === 'ni56') || BINDING_ENERGY_DATASET[1]
  );

  // Filtered dataset based on mode and zoom range
  const filteredData = useMemo(() => {
    let list = [...BINDING_ENERGY_DATASET];

    // Category filter
    if (filterMode === 'stable') {
      list = list.filter(item => item.isStable);
    } else if (filterMode === 'unstable') {
      list = list.filter(item => !item.isStable);
    } else if (filterMode === 'fusion') {
      list = list.filter(item => item.a <= 56);
    } else if (filterMode === 'fission') {
      list = list.filter(item => item.a >= 56);
    } else if (filterMode === 'alpha') {
      list = list.filter(item => item.isAlphaLadder);
    }

    // Zoom range filter
    if (zoomRange === 'light') {
      list = list.filter(item => item.a <= 25);
    } else if (zoomRange === 'iron') {
      list = list.filter(item => item.a >= 40 && item.a <= 75);
    } else if (zoomRange === 'heavy') {
      list = list.filter(item => item.a >= 100);
    }

    // Sort by mass number A
    return list.sort((a, b) => a.a - b.a);
  }, [filterMode, zoomRange]);

  // Separate points for chart series
  const stablePoints = useMemo(() => filteredData.filter(d => d.isStable), [filteredData]);
  const unstablePoints = useMemo(() => filteredData.filter(d => !d.isStable), [filteredData]);

  // Theoretical line points filtered to zoom range
  const currentTheoreticalPoints = useMemo(() => {
    let points = [...THEORETICAL_CURVE_POINTS];
    if (zoomRange === 'light') {
      points = points.filter(p => p.a <= 25);
    } else if (zoomRange === 'iron') {
      points = points.filter(p => p.a >= 40 && p.a <= 75);
    } else if (zoomRange === 'heavy') {
      points = points.filter(p => p.a >= 100);
    }
    return points;
  }, [zoomRange]);

  // Domain computation
  const xDomain = useMemo<[number, number]>(() => {
    if (zoomRange === 'light') return [0, 26];
    if (zoomRange === 'iron') return [38, 76];
    if (zoomRange === 'heavy') return [95, 245];
    return [0, 245];
  }, [zoomRange]);

  const yDomain = useMemo<[number, number]>(() => {
    if (zoomRange === 'iron') return [8.4, 9.0];
    if (zoomRange === 'heavy') return [7.3, 8.8];
    return [0, 9.3];
  }, [zoomRange]);

  // Comparison stats
  const comparisonStats = useMemo(() => {
    if (!selectedIsotope || !comparisonIsotope) return null;
    const diffPerNucleon = selectedIsotope.bindingEnergyPerNucleon - comparisonIsotope.bindingEnergyPerNucleon;
    const diffTotal = selectedIsotope.totalBindingEnergy - comparisonIsotope.totalBindingEnergy;
    const isIsobar = selectedIsotope.a === comparisonIsotope.a;
    return {
      diffPerNucleon: Math.abs(diffPerNucleon).toFixed(3),
      diffTotal: Math.abs(diffTotal).toFixed(2),
      isHigher: diffPerNucleon >= 0,
      isIsobar
    };
  }, [selectedIsotope, comparisonIsotope]);

  return (
    <div className="space-y-6">
      {/* Header and Context Card */}
      <div className="bg-[#0b111a] border border-cyan-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-300">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  Nuclear Astrophysics & Thermonuclear Curve
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Recharts Engine
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white">
                Curva de Energía de Enlace por Nucleón (B/A) vs Número Másico (A)
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl text-xs font-mono">
            <span className="text-slate-400 px-2">Cúspide de Estabilidad:</span>
            <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/40 font-bold">
              ⁵⁶Fe (8.790 MeV) / ⁶²Ni (8.795 MeV)
            </span>
          </div>
        </div>

        {/* Fundamental Astrophysical Principle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 font-sans text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold font-mono uppercase text-[11px]">
              <Flame className="w-4 h-4 text-cyan-400" /> 1. Región de Fusión Exotérmica (A &lt; 56)
            </div>
            <p>
              Desde el hidrógeno (¹H) hasta el hierro-56 (⁵⁶Fe), la energía de enlace por nucleón <strong>aumenta drásticamente</strong>. Al fusionar núcleos más ligeros en elementos más pesados, la masa en reposo del producto es menor que la de los reactivos; ese defecto de masa se libera como colosal radiación lumínica y térmica (<span className="font-mono text-cyan-300">E = Δm · c²</span>), energizando las estrellas.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold font-mono uppercase text-[11px]">
              <ShieldAlert className="w-4 h-4 text-rose-400" /> 2. Región de Fisión Exotérmica &amp; Supernovas (A &gt; 56)
            </div>
            <p>
              A partir del pico del hierro-56 y níquel-62, la repulsión electrostática coulombiana entre protones debilita el enlace promedio por nucleón. La fusión se vuelve <strong>endotérmica</strong> (absorbe energía, provocando el colapso estelar en Supernova). En cambio, dividir núcleos pesados e inestables como el uranio-235 (²³⁵U) libera energía hacia la cima del hierro.
            </p>
          </div>
        </div>
      </div>

      {/* Control Toolbars */}
      <div className="bg-[#0b111a] border border-cyan-500/20 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Filter Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 text-[11px] flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filtro:
            </span>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterMode === 'all'
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              Todos ({BINDING_ENERGY_DATASET.length})
            </button>
            <button
              onClick={() => setFilterMode('stable')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                filterMode === 'stable'
                  ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Solo Estables
            </button>
            <button
              onClick={() => setFilterMode('unstable')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                filterMode === 'unstable'
                  ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Solo Inestables / Radiactivos
            </button>
            <button
              onClick={() => setFilterMode('fusion')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterMode === 'fusion'
                  ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              Fusión Estelar (A ≤ 56)
            </button>
            <button
              onClick={() => setFilterMode('fission')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterMode === 'fission'
                  ? 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              Fisión &amp; Pesados (A ≥ 56)
            </button>
            <button
              onClick={() => setFilterMode('alpha')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterMode === 'alpha'
                  ? 'bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              Cadena Alfa (⁴He, ¹²C, ¹⁶O, ²⁸Si...)
            </button>
          </div>

          {/* Zoom Window Controls */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] flex items-center gap-1 mr-1">
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" /> Zoom:
            </span>
            <button
              onClick={() => setZoomRange('all')}
              className={`px-2.5 py-1 rounded text-[11px] transition ${
                zoomRange === 'all'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Completo (A 1-240)
            </button>
            <button
              onClick={() => setZoomRange('light')}
              className={`px-2.5 py-1 rounded text-[11px] transition ${
                zoomRange === 'light'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Ligeros (A ≤ 25)
            </button>
            <button
              onClick={() => setZoomRange('iron')}
              className={`px-2.5 py-1 rounded text-[11px] transition ${
                zoomRange === 'iron'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Pico ⁵⁶Fe/⁶²Ni
            </button>
            <button
              onClick={() => setZoomRange('heavy')}
              className={`px-2.5 py-1 rounded text-[11px] transition ${
                zoomRange === 'heavy'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Pesados / Fisión
            </button>
          </div>
        </div>

        {/* Liquid Drop Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono text-slate-400">
          <label className="flex items-center gap-2 cursor-pointer hover:text-slate-200">
            <input
              type="checkbox"
              checked={showTheoreticalLine}
              onChange={(e) => setShowTheoreticalLine(e.target.checked)}
              className="accent-cyan-400 rounded cursor-pointer"
            />
            <span>Superponer curva teórica del modelo de gota líquida (Fórmula semiempírica de Bethe-Weizsäcker)</span>
          </label>
          <span className="text-[11px] text-slate-500">
            Mostrando {filteredData.length} isótopos ({stablePoints.length} estables, {unstablePoints.length} inestables)
          </span>
        </div>
      </div>

      {/* Main Recharts Interactive Chart */}
      <div className="bg-[#070b12] border border-cyan-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono text-emerald-300 font-bold">Verde: Isótopos Estables</span>
            <span className="text-slate-600 font-mono">|</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-xs font-mono text-rose-300 font-bold">Rojo / Rosa: Isótopos Inestables (Radiactivos)</span>
            {showTheoreticalLine && (
              <>
                <span className="text-slate-600 font-mono">|</span>
                <span className="w-4 h-0.5 bg-cyan-400 inline-block" />
                <span className="text-xs font-mono text-cyan-300">Azul: Modelo Gota Líquida</span>
              </>
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Haz clic en cualquier punto para inspeccionarlo en detalle
          </span>
        </div>

        {/* Chart Viewport */}
        <div className="h-[460px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length > 0) {
                  const clicked = e.activePayload[0].payload as NuclearBindingDataPoint;
                  if (clicked && clicked.id) {
                    setSelectedIsotope(clicked);
                  }
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#172554" opacity={0.4} />

              <XAxis
                dataKey="a"
                type="number"
                domain={xDomain}
                stroke="#64748b"
                fontSize={11}
                tickCount={12}
                label={{ 
                  value: 'Número Másico A (Protones + Neutrones)', 
                  position: 'bottom', 
                  offset: 20, 
                  fill: '#94a3b8', 
                  fontSize: 12,
                  fontFamily: 'monospace'
                }}
              />

              <YAxis
                dataKey="bindingEnergyPerNucleon"
                domain={yDomain}
                stroke="#64748b"
                fontSize={11}
                unit=" MeV"
                label={{ 
                  value: 'Energía de Enlace por Nucleón B/A (MeV/nucleón)', 
                  angle: -90, 
                  position: 'insideLeft', 
                  offset: 0, 
                  fill: '#94a3b8', 
                  fontSize: 11,
                  fontFamily: 'monospace'
                }}
              />

              {/* Reference line at Iron-56 Peak (A=56) */}
              <ReferenceLine
                x={56}
                stroke="#06b6d4"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: 'Pico ⁵⁶Fe / ⁶²Ni (8.79 MeV)',
                  position: 'top',
                  fill: '#22d3ee',
                  fontSize: 11,
                  fontFamily: 'monospace',
                  fontWeight: 'bold'
                }}
              />

              {/* Visual areas for Fusion and Fission regimes if full zoom */}
              {zoomRange === 'all' && (
                <>
                  <ReferenceArea
                    x1={0}
                    x2={56}
                    fill="#06b6d4"
                    fillOpacity={0.03}
                    label={{
                      value: '← ZONA DE FUSIÓN (Exotérmica)',
                      position: 'insideTopLeft',
                      fill: '#38bdf8',
                      fontSize: 11,
                      fontFamily: 'monospace'
                    }}
                  />
                  <ReferenceArea
                    x1={56}
                    x2={245}
                    fill="#ec4899"
                    fillOpacity={0.03}
                    label={{
                      value: 'ZONA DE FISIÓN (Exotérmica) →',
                      position: 'insideTopRight',
                      fill: '#f472b6',
                      fontSize: 11,
                      fontFamily: 'monospace'
                    }}
                  />
                </>
              )}

              {/* Tooltip */}
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length > 0) {
                    const data = payload[0].payload as NuclearBindingDataPoint;
                    if (!data || !data.symbol) return null;
                    return (
                      <div className="bg-[#0b111a]/95 border border-cyan-500/40 rounded-xl p-4 shadow-2xl backdrop-blur-md max-w-sm text-xs font-mono space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-base font-bold text-white flex items-center gap-1.5">
                            <Atom className="w-4 h-4 text-cyan-400" />
                            {data.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              data.isStable
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            {data.isStable ? 'Estable' : 'Inestable (Radiactivo)'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Número másico A:</span>
                            <span className="text-white font-bold">{data.a}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Protones Z / Neutrones N:</span>
                            <span className="text-white font-bold">Z={data.z}, N={data.n}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">B/A por nucleón:</span>
                            <span className="text-cyan-300 font-extrabold text-sm">{data.bindingEnergyPerNucleon} MeV</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Enlace nuclear total B:</span>
                            <span className="text-amber-300 font-bold">{data.totalBindingEnergy.toFixed(1)} MeV</span>
                          </div>
                        </div>

                        {!data.isStable && (
                          <div className="p-2 rounded bg-rose-950/30 border border-rose-500/30 text-[10px] space-y-0.5">
                            <div className="text-rose-300"><strong>Vida media:</strong> {data.halfLife}</div>
                            <div className="text-slate-300"><strong>Modo decaimiento:</strong> {data.decayMode}</div>
                          </div>
                        )}

                        <div className="pt-1 text-[10px] text-slate-300 font-sans border-t border-slate-800/80 leading-tight">
                          <span className="text-cyan-400 font-mono block mb-0.5">Rol Astrofísico:</span>
                          {data.astrophysicalRole}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Theoretical Curve Line */}
              {showTheoreticalLine && (
                <Line
                  data={currentTheoreticalPoints}
                  type="monotone"
                  dataKey="theoreticalCurve"
                  name="Modelo Gota Líquida (Teórico)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  strokeDasharray="2 2"
                  dot={false}
                  isAnimationActive={false}
                />
              )}

              {/* Stable Isotopes Scatter */}
              <Scatter
                data={stablePoints}
                name="Isótopos Estables"
                fill="#10b981"
                shape={(props: any) => {
                  const { cx, cy, payload } = props;
                  const isSelected = selectedIsotope?.id === payload.id;
                  const isComp = comparisonIsotope?.id === payload.id;
                  const isPeak = payload.isNotablePeak;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected || isComp ? 7 : isPeak ? 5 : 3.5}
                      fill={isSelected ? '#38bdf8' : isComp ? '#f59e0b' : '#10b981'}
                      stroke={isSelected ? '#ffffff' : isComp ? '#ffffff' : '#059669'}
                      strokeWidth={isSelected || isComp ? 2.5 : 1}
                      className="cursor-pointer transition-all hover:scale-150"
                      onClick={() => setSelectedIsotope(payload)}
                    />
                  );
                }}
              />

              {/* Unstable Isotopes Scatter */}
              <Scatter
                data={unstablePoints}
                name="Isótopos Inestables (Radiactivos)"
                fill="#f43f5e"
                shape={(props: any) => {
                  const { cx, cy, payload } = props;
                  const isSelected = selectedIsotope?.id === payload.id;
                  const isComp = comparisonIsotope?.id === payload.id;
                  const isPeak = payload.isNotablePeak;
                  return (
                    <polygon
                      points={`${cx},${cy - 5} ${cx + 4.5},${cy + 4} ${cx - 4.5},${cy + 4}`}
                      fill={isSelected ? '#38bdf8' : isComp ? '#f59e0b' : '#f43f5e'}
                      stroke={isSelected ? '#ffffff' : isComp ? '#ffffff' : '#be123c'}
                      strokeWidth={isSelected || isComp ? 2 : 1}
                      className="cursor-pointer transition-all hover:scale-150"
                      onClick={() => setSelectedIsotope(payload)}
                    />
                  );
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend description bar */}
        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <span>● <strong>Círculo verde:</strong> Isótopo estable</span>
            <span>▲ <strong>Triángulo rojo:</strong> Isótopo radiactivo / inestable</span>
            <span className="text-cyan-400">● <strong>Azul resplandeciente:</strong> Isótopo seleccionado</span>
            <span className="text-amber-400">● <strong>Ámbar:</strong> Isótopo comparado</span>
          </div>
          <span>Unidad: 1 MeV = 1.602 × 10⁻¹³ Julios</span>
        </div>
      </div>

      {/* Two-Column Deep Inspection and Comparative Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Selected Isotope Detailed Dossier */}
        <div className="lg:col-span-6 bg-[#0b111a] border border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Atom className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block font-bold">
                  Ficha de Estabilidad Nuclear
                </span>
                <h4 className="text-base font-extrabold text-white">
                  {selectedIsotope.name} ({selectedIsotope.symbol})
                </h4>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
                selectedIsotope.isStable
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}
            >
              {selectedIsotope.isStable ? 'Estable (En Valle)' : 'Inestable (Radiactivo)'}
            </span>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
            <div className="bg-[#070b12] p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Número Másico A</span>
              <span className="text-white font-bold text-base">{selectedIsotope.a}</span>
              <span className="text-[9px] text-slate-400 block">Z={selectedIsotope.z} + N={selectedIsotope.n}</span>
            </div>
            <div className="bg-[#070b12] p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">B/A por nucleón</span>
              <span className="text-cyan-400 font-extrabold text-base">
                {selectedIsotope.bindingEnergyPerNucleon}
              </span>
              <span className="text-[9px] text-slate-400 block">MeV / nucleón</span>
            </div>
            <div className="bg-[#070b12] p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Enlace Total B</span>
              <span className="text-amber-400 font-bold text-base">
                {selectedIsotope.totalBindingEnergy.toFixed(1)}
              </span>
              <span className="text-[9px] text-slate-400 block">MeV</span>
            </div>
            <div className="bg-[#070b12] p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Defecto de Masa Δm</span>
              <span className="text-emerald-400 font-bold text-base">
                {(selectedIsotope.totalBindingEnergy / 931.494).toFixed(3)}
              </span>
              <span className="text-[9px] text-slate-400 block">u (uma)</span>
            </div>
          </div>

          {/* Decay details if unstable */}
          {!selectedIsotope.isStable && (
            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs font-mono space-y-1">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" /> Cinética de Desintegración Radiactiva
              </div>
              <div className="text-slate-300">
                <strong className="text-slate-400">Vida Media (t₁/₂):</strong> {selectedIsotope.halfLife}
              </div>
              <div className="text-slate-300">
                <strong className="text-slate-400">Modo de decaimiento:</strong> {selectedIsotope.decayMode}
              </div>
            </div>
          )}

          {/* Astrophysical context */}
          <div className="space-y-2 text-xs font-sans text-slate-300">
            <div>
              <span className="text-[11px] font-mono text-cyan-400 font-bold block">
                Origen Cósmico &amp; Nucleosíntesis:
              </span>
              <p className="bg-[#070b12] p-2.5 rounded-xl border border-slate-800 mt-1">
                {selectedIsotope.astrophysicalOrigin}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-mono text-cyan-400 font-bold block">
                Función Termonuclear / Aplicación:
              </span>
              <p className="bg-[#070b12] p-2.5 rounded-xl border border-slate-800 mt-1 leading-relaxed">
                {selectedIsotope.astrophysicalRole}
              </p>
            </div>
          </div>

          {/* Quick Select Buttons */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-2 font-bold">
              Isótopos emblemáticos para inspeccionar:
            </span>
            <div className="flex flex-wrap gap-1.5 font-mono text-xs">
              {['he4', 'c12', 'o16', 'fe56', 'ni56', 'ni62', 'pb208', 'u235', 'u238'].map((id) => {
                const item = BINDING_ENERGY_DATASET.find(iso => iso.id === id);
                if (!item) return null;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedIsotope(item)}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      selectedIsotope.id === id
                        ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/25'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {item.symbol}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Isotope Analyzer (Pairwise Comparison) */}
        <div className="lg:col-span-6 bg-[#0b111a] border border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block font-bold">
                  Comparador Diferencial de Isótopos
                </span>
                <h4 className="text-base font-extrabold text-white">
                  {selectedIsotope.symbol} vs {comparisonIsotope.symbol}
                </h4>
              </div>
            </div>

            <select
              value={comparisonIsotope.id}
              onChange={(e) => {
                const target = BINDING_ENERGY_DATASET.find(iso => iso.id === e.target.value);
                if (target) setComparisonIsotope(target);
              }}
              className="bg-slate-900 text-amber-300 border border-amber-500/40 rounded-lg px-2.5 py-1 font-mono text-xs cursor-pointer focus:outline-none"
            >
              {BINDING_ENERGY_DATASET.map(iso => (
                <option key={iso.id} value={iso.id}>
                  {iso.symbol} — {iso.name} ({iso.isStable ? 'Estable' : 'Inestable'})
                </option>
              ))}
            </select>
          </div>

          {/* Preset Comparison Pairs */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
              Comparativas Clave de Astrofísica &amp; Reactores:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => {
                  const fe = BINDING_ENERGY_DATASET.find(iso => iso.id === 'fe56');
                  const ni = BINDING_ENERGY_DATASET.find(iso => iso.id === 'ni56');
                  if (fe && ni) {
                    setSelectedIsotope(fe);
                    setComparisonIsotope(ni);
                  }
                }}
                className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left transition"
              >
                <div className="text-cyan-400 font-bold">⁵⁶Fe vs ⁵⁶Ni (Supernova)</div>
                <div className="text-[10px] text-slate-400 font-sans leading-tight">
                  Isobaras A=56: El ⁵⁶Fe es 8.23 MeV más ligado que ⁵⁶Ni.
                </div>
              </button>

              <button
                onClick={() => {
                  const he4 = BINDING_ENERGY_DATASET.find(iso => iso.id === 'he4');
                  const be8 = BINDING_ENERGY_DATASET.find(iso => iso.id === 'be8');
                  if (he4 && be8) {
                    setSelectedIsotope(he4);
                    setComparisonIsotope(be8);
                  }
                }}
                className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left transition"
              >
                <div className="text-cyan-400 font-bold">⁴He vs ⁸Be (Cuello Hoyle)</div>
                <div className="text-[10px] text-slate-400 font-sans leading-tight">
                  ⁸Be decae a 2 partículas alfa en 10⁻¹⁶ segundos.
                </div>
              </button>

              <button
                onClick={() => {
                  const he3 = BINDING_ENERGY_DATASET.find(iso => iso.id === 'he3');
                  const h3 = BINDING_ENERGY_DATASET.find(iso => iso.id === 'h3');
                  if (he3 && h3) {
                    setSelectedIsotope(he3);
                    setComparisonIsotope(h3);
                  }
                }}
                className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left transition"
              >
                <div className="text-cyan-400 font-bold">³He (Estable) vs ³H (Tritio)</div>
                <div className="text-[10px] text-slate-400 font-sans leading-tight">
                  Tritio decae beta a helio-3 en 12.3 años.
                </div>
              </button>

              <button
                onClick={() => {
                  const u235 = BINDING_ENERGY_DATASET.find(iso => iso.id === 'u235');
                  const ba141 = BINDING_ENERGY_DATASET.find(iso => iso.id === 'ba141');
                  if (u235 && ba141) {
                    setSelectedIsotope(u235);
                    setComparisonIsotope(ba141);
                  }
                }}
                className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left transition"
              >
                <div className="text-cyan-400 font-bold">²³⁵U vs ¹⁴¹Ba (Fisión)</div>
                <div className="text-[10px] text-slate-400 font-sans leading-tight">
                  Salto de 7.59 a 8.24 MeV/nucleón en la fisión nuclear.
                </div>
              </button>
            </div>
          </div>

          {/* Differential Metrics Box */}
          {comparisonStats && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#070b12] to-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Diferencia en B/A por nucleón:</span>
                <span className="text-cyan-400 font-extrabold text-sm">
                  Δ(B/A) = {comparisonStats.diffPerNucleon} MeV
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Diferencia en Enlace Total B:</span>
                <span className="text-amber-400 font-bold text-sm">
                  ΔB = {comparisonStats.diffTotal} MeV
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Relación Nuclear:</span>
                <span className="text-emerald-400 font-bold">
                  {comparisonStats.isIsobar ? 'Par de Isobaras (Mismo A)' : `ΔA = ${Math.abs(selectedIsotope.a - comparisonIsotope.a)} nucleones`}
                </span>
              </div>
            </div>
          )}

          {/* Visual Bar Comparison */}
          <div className="space-y-3 font-mono text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-cyan-300 font-bold">
                  {selectedIsotope.symbol} ({selectedIsotope.isStable ? 'Estable' : 'Inestable'}):
                </span>
                <span className="text-white font-bold">{selectedIsotope.bindingEnergyPerNucleon} MeV/nucleón</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(selectedIsotope.bindingEnergyPerNucleon / 9.0) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-amber-300 font-bold">
                  {comparisonIsotope.symbol} ({comparisonIsotope.isStable ? 'Estable' : 'Inestable'}):
                </span>
                <span className="text-white font-bold">{comparisonIsotope.bindingEnergyPerNucleon} MeV/nucleón</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(comparisonIsotope.bindingEnergyPerNucleon / 9.0) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Scientific Verdict Explanation */}
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 font-sans text-xs text-slate-300 leading-relaxed">
            <strong className="text-cyan-400 font-mono block mb-1">
              Conclusión Físico-Nuclear:
            </strong>
            {selectedIsotope.bindingEnergyPerNucleon >= comparisonIsotope.bindingEnergyPerNucleon ? (
              <span>
                <strong>{selectedIsotope.symbol}</strong> posee mayor energía de ligadura por nucleón ({selectedIsotope.bindingEnergyPerNucleon} MeV) que <strong>{comparisonIsotope.symbol}</strong> ({comparisonIsotope.bindingEnergyPerNucleon} MeV). Por el segundo principio de la termodinámica nuclear, cualquier reacción que transforme {comparisonIsotope.symbol} en {selectedIsotope.symbol} será <strong>exotérmica</strong>, liberando {comparisonStats?.diffPerNucleon} MeV por cada nucleón involucrado.
              </span>
            ) : (
              <span>
                <strong>{comparisonIsotope.symbol}</strong> es más estable y fuertemente ligado ({comparisonIsotope.bindingEnergyPerNucleon} MeV) que <strong>{selectedIsotope.symbol}</strong> ({selectedIsotope.bindingEnergyPerNucleon} MeV). La transmutación espontánea o decaimiento radiactivo ocurre preferentemente hacia {comparisonIsotope.symbol}.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
