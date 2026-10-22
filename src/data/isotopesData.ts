import { PERIODIC_ELEMENTS, PeriodicElement } from './periodicTable';
import { VALLEY_STABLE_POINTS, getStabilityVerdict } from './valleyOfStability';

export interface IsotopeDefinition {
  id: string;
  z: number;
  n: number;
  symbol: string;           // e.g. "¹⁴C"
  elementSymbol: string;    // e.g. "C"
  name: string;             // e.g. "Carbono-14"
  elementName: string;      // e.g. "Carbono"
  massNumber: number;       // A = Z + N
  atomicMassAmu: number;
  halfLife: string;
  decayMode: string;
  abundance: string;
  description: string;
  category: 'Estable' | 'Radiactivo β⁻' | 'Radiactivo β⁺' | 'Radiactivo α' | 'Fisionable' | 'Primordial';
}

/**
 * Catálogo detallado de isótopos clave y conocidos de la física y química
 */
export const NOTABLE_ISOTOPES: IsotopeDefinition[] = [
  // Hidrógeno (Z=1)
  {
    id: 'h-1',
    z: 1,
    n: 0,
    symbol: '¹H',
    elementSymbol: 'H',
    name: 'Protio (¹H)',
    elementName: 'Hidrógeno',
    massNumber: 1,
    atomicMassAmu: 1.0078,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '99.988%',
    description: 'Único nucleido estable sin neutrones. Constituye la gran mayoría de la materia visible universal.',
    category: 'Estable'
  },
  {
    id: 'h-2',
    z: 1,
    n: 1,
    symbol: '²H',
    elementSymbol: 'H',
    name: 'Deuterio (²H / D)',
    elementName: 'Hidrógeno',
    massNumber: 2,
    atomicMassAmu: 2.0141,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '0.0115%',
    description: 'Isótopo pesado del hidrógeno. Forma agua pesada (D₂O), esencial como moderador en reactores CANDU.',
    category: 'Estable'
  },
  {
    id: 'h-3',
    z: 1,
    n: 2,
    symbol: '³H',
    elementSymbol: 'H',
    name: 'Tritio (³H / T)',
    elementName: 'Hidrógeno',
    massNumber: 3,
    atomicMassAmu: 3.0160,
    halfLife: '12.32 años',
    decayMode: 'Beta menos (β⁻ ➔ ³He)',
    abundance: 'Trazas cosmogénicas',
    description: 'Combustible clave para reactores de fusión nuclear magnética (ITER) e inercial (NIF).',
    category: 'Radiactivo β⁻'
  },

  // Helio (Z=2)
  {
    id: 'he-3',
    z: 2,
    n: 1,
    symbol: '³He',
    elementSymbol: 'He',
    name: 'Helio-3 (³He)',
    elementName: 'Helio',
    massNumber: 3,
    atomicMassAmu: 3.0160,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '0.000137%',
    description: 'Gas ultra raro en la Tierra, abundante en el regolito lunar. Combustible para fusión aneutrónica.',
    category: 'Estable'
  },
  {
    id: 'he-4',
    z: 2,
    n: 2,
    symbol: '⁴He',
    elementSymbol: 'He',
    name: 'Helio-4 (Partícula Alfa)',
    elementName: 'Helio',
    massNumber: 4,
    atomicMassAmu: 4.0026,
    halfLife: 'Estable (Doble Mágico)',
    decayMode: 'Ninguno (Estable)',
    abundance: '99.9998%',
    description: 'Núcleo extraordinariamente estable con 2 protones y 2 neutrones (núcleo doblemente mágico). Empleado en enfriamiento criogénico.',
    category: 'Estable'
  },

  // Litio (Z=3)
  {
    id: 'li-6',
    z: 3,
    n: 3,
    symbol: '⁶Li',
    elementSymbol: 'Li',
    name: 'Litio-6 (⁶Li)',
    elementName: 'Litio',
    massNumber: 6,
    atomicMassAmu: 6.0151,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '7.59%',
    description: 'Secreción neutrónica para reproducir tritio en mantos fértiles de reactores de fusión.',
    category: 'Estable'
  },
  {
    id: 'li-7',
    z: 3,
    n: 4,
    symbol: '⁷Li',
    elementSymbol: 'Li',
    name: 'Litio-7 (⁷Li)',
    elementName: 'Litio',
    massNumber: 7,
    atomicMassAmu: 7.0160,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '92.41%',
    description: 'Isótopo dominante primordial; producido en el Big Bang y en colisiones con rayos cósmicos.',
    category: 'Estable'
  },

  // Berilio (Z=4)
  {
    id: 'be-9',
    z: 4,
    n: 5,
    symbol: '⁹Be',
    elementSymbol: 'Be',
    name: 'Berilio-9 (⁹Be)',
    elementName: 'Berilio',
    massNumber: 9,
    atomicMassAmu: 9.0122,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '100%',
    description: 'Único isótopo estable del berilio; reflector y multiplicador de neutrones (n, 2n).',
    category: 'Estable'
  },
  {
    id: 'be-10',
    z: 4,
    n: 6,
    symbol: '¹⁰Be',
    elementSymbol: 'Be',
    name: 'Berilio-10 (¹⁰Be)',
    elementName: 'Berilio',
    massNumber: 10,
    atomicMassAmu: 10.0135,
    halfLife: '1.39 millones de años',
    decayMode: 'Beta menos (β⁻ ➔ ¹⁰B)',
    abundance: 'Traza cosmogénica',
    description: 'Radionúclido cosmogénico utilizado en geocronología para datar testigos de hielo polar y erosión de suelos.',
    category: 'Radiactivo β⁻'
  },

  // Boro (Z=5)
  {
    id: 'b-10',
    z: 5,
    n: 5,
    symbol: '¹⁰B',
    elementSymbol: 'B',
    name: 'Boro-10 (¹⁰B)',
    elementName: 'Boro',
    massNumber: 10,
    atomicMassAmu: 10.0129,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '19.9%',
    description: 'Extrema sección eficaz de captura para neutrones térmicos (3837 barns); barras de parada de emergencia en reactores nucleares.',
    category: 'Estable'
  },
  {
    id: 'b-11',
    z: 5,
    n: 6,
    symbol: '¹¹B',
    elementSymbol: 'B',
    name: 'Boro-11 (¹¹B)',
    elementName: 'Boro',
    massNumber: 11,
    atomicMassAmu: 11.0093,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '80.1%',
    description: 'Componente mayoritario de vidrios borosilicatados resistentes al choque térmico.',
    category: 'Estable'
  },

  // Carbono (Z=6)
  {
    id: 'c-12',
    z: 6,
    n: 6,
    symbol: '¹²C',
    elementSymbol: 'C',
    name: 'Carbono-12 (¹²C)',
    elementName: 'Carbono',
    massNumber: 12,
    atomicMassAmu: 12.0000,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '98.93%',
    description: 'Estándar universal de masa atómica (1 uma = 1/12 de la masa del ¹²C en reposo). Base de la bioquímica orgánica.',
    category: 'Estable'
  },
  {
    id: 'c-13',
    z: 6,
    n: 7,
    symbol: '¹³C',
    elementSymbol: 'C',
    name: 'Carbono-13 (¹³C)',
    elementName: 'Carbono',
    massNumber: 13,
    atomicMassAmu: 13.0034,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '1.07%',
    description: 'Posee espín nuclear I = 1/2, haciéndolo la herramienta reina en espectroscopía de resonancia magnética nuclear (RMN).',
    category: 'Estable'
  },
  {
    id: 'c-14',
    z: 6,
    n: 8,
    symbol: '¹⁴C',
    elementSymbol: 'C',
    name: 'Carbono-14 (Radiocarbono)',
    elementName: 'Carbono',
    massNumber: 14,
    atomicMassAmu: 14.0032,
    halfLife: '5,730 años',
    decayMode: 'Beta menos (β⁻ ➔ ¹⁴N)',
    abundance: '1 ppt (cosmogénico)',
    description: 'Producido por neutrones cósmicos sobre ¹⁴N en la alta atmósfera. El reloj radioquímico arqueológico de la civilización.',
    category: 'Radiactivo β⁻'
  },

  // Nitrógeno (Z=7)
  {
    id: 'n-14',
    z: 7,
    n: 7,
    symbol: '¹⁴N',
    elementSymbol: 'N',
    name: 'Nitrógeno-14 (¹⁴N)',
    elementName: 'Nitrógeno',
    massNumber: 14,
    atomicMassAmu: 14.0031,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '99.636%',
    description: 'Gas dominante de la atmósfera terrestre (~78%).',
    category: 'Estable'
  },
  {
    id: 'n-15',
    z: 7,
    n: 8,
    symbol: '¹⁵N',
    elementSymbol: 'N',
    name: 'Nitrógeno-15 (¹⁵N)',
    elementName: 'Nitrógeno',
    massNumber: 15,
    atomicMassAmu: 15.0001,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '0.364%',
    description: 'Trazador isotópico no radiactivo para estudios metabólicos y agrícolas del ciclo del nitrógeno.',
    category: 'Estable'
  },

  // Oxígeno (Z=8)
  {
    id: 'o-16',
    z: 8,
    n: 8,
    symbol: '¹⁶O',
    elementSymbol: 'O',
    name: 'Oxígeno-16 (¹⁶O)',
    elementName: 'Oxígeno',
    massNumber: 16,
    atomicMassAmu: 15.9949,
    halfLife: 'Estable (Doble Mágico)',
    decayMode: 'Ninguno (Estable)',
    abundance: '99.757%',
    description: 'Núcleo doblemente mágico (Z=8, N=8) con extraordinaria estabilidad. Sintetizado por proceso triple-alfa en supernovas.',
    category: 'Estable'
  },
  {
    id: 'o-17',
    z: 8,
    n: 9,
    symbol: '¹⁷O',
    elementSymbol: 'O',
    name: 'Oxígeno-17 (¹⁷O)',
    elementName: 'Oxígeno',
    massNumber: 17,
    atomicMassAmu: 16.9991,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '0.038%',
    description: 'Único isótopo estable del oxígeno con espín nuclear no nulo (I=5/2), aprovechado en RMN.',
    category: 'Estable'
  },
  {
    id: 'o-18',
    z: 8,
    n: 10,
    symbol: '¹⁸O',
    elementSymbol: 'O',
    name: 'Oxígeno-18 (¹⁸O)',
    elementName: 'Oxígeno',
    massNumber: 18,
    atomicMassAmu: 17.9992,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '0.205%',
    description: 'Termómetro paleoclimático (proporción δ¹⁸O en hielo polar y fósiles marinos) y precursor del Flúor-18 médico en ciclotrones.',
    category: 'Estable'
  },

  // Flúor (Z=9)
  {
    id: 'f-18',
    z: 9,
    n: 9,
    symbol: '¹⁸F',
    elementSymbol: 'F',
    name: 'Flúor-18 (¹⁸F)',
    elementName: 'Flúor',
    massNumber: 18,
    atomicMassAmu: 18.0009,
    halfLife: '109.8 minutos',
    decayMode: 'Beta más / Positrón (β⁺ ➔ ¹⁸O)',
    abundance: 'Sintético (Ciclotrón)',
    description: 'Radiotrazador clave en tomografía por emisión de positrones (PET) en forma de Fluorodesoxiglucosa ([¹⁸F]FDG) para oncología.',
    category: 'Radiactivo β⁺'
  },
  {
    id: 'f-19',
    z: 9,
    n: 10,
    symbol: '¹⁹F',
    elementSymbol: 'F',
    name: 'Flúor-19 (¹⁹F)',
    elementName: 'Flúor',
    massNumber: 19,
    atomicMassAmu: 18.9984,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '100%',
    description: 'Elemento monoisotópico natural.',
    category: 'Estable'
  },

  // Sodio (Z=11)
  {
    id: 'na-23',
    z: 11,
    n: 12,
    symbol: '²³Na',
    elementSymbol: 'Na',
    name: 'Sodio-23 (²³Na)',
    elementName: 'Sodio',
    massNumber: 23,
    atomicMassAmu: 22.9898,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '100%',
    description: 'Único isótopo estable del sodio. Esencial en la bomba Na+/K+ de neuronas y miocitos.',
    category: 'Estable'
  },
  {
    id: 'na-24',
    z: 11,
    n: 13,
    symbol: '²⁴Na',
    elementSymbol: 'Na',
    name: 'Sodio-24 (²⁴Na)',
    elementName: 'Sodio',
    massNumber: 24,
    atomicMassAmu: 23.9910,
    halfLife: '14.96 horas',
    decayMode: 'Beta menos (β⁻ ➔ ²⁴Mg)',
    abundance: 'Sintético (Activación)',
    description: 'Emisor gamma de alta energía utilizado en radiodiagnóstico circulatorio y detección de fugas en tuberías industriales.',
    category: 'Radiactivo β⁻'
  },

  // Magnesio (Z=12)
  {
    id: 'mg-24',
    z: 12,
    n: 12,
    symbol: '²⁴Mg',
    elementSymbol: 'Mg',
    name: 'Magnesio-24 (²⁴Mg)',
    elementName: 'Magnesio',
    massNumber: 24,
    atomicMassAmu: 23.9850,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '78.99%',
    description: 'Sintetizado en supernovas por combustión de carbono. Ion central de la clorofila vegetal.',
    category: 'Estable'
  },

  // Fósforo (Z=15)
  {
    id: 'p-31',
    z: 15,
    n: 16,
    symbol: '³¹P',
    elementSymbol: 'P',
    name: 'Fósforo-31 (³¹P)',
    elementName: 'Fósforo',
    massNumber: 31,
    atomicMassAmu: 30.9738,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '100%',
    description: 'Único isótopo natural; espinazo del ADN, ARN y moneda energética ATP.',
    category: 'Estable'
  },
  {
    id: 'p-32',
    z: 15,
    n: 17,
    symbol: '³²P',
    elementSymbol: 'P',
    name: 'Fósforo-32 (³²P)',
    elementName: 'Fósforo',
    massNumber: 32,
    atomicMassAmu: 31.9739,
    halfLife: '14.29 días',
    decayMode: 'Beta menos puro (β⁻ ➔ ³²S)',
    abundance: 'Sintético',
    description: 'Emisor beta puro de 1.71 MeV empleado históricamente para marcar nucleótidos y en terapia de policitemia vera.',
    category: 'Radiactivo β⁻'
  },

  // Cloro (Z=17)
  {
    id: 'cl-35',
    z: 17,
    n: 18,
    symbol: '³⁵Cl',
    elementSymbol: 'Cl',
    name: 'Cloro-35 (³⁵Cl)',
    elementName: 'Cloro',
    massNumber: 35,
    atomicMassAmu: 34.9689,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '75.76%',
    description: 'Isótopo dominante del cloro presente en la sal común marina (NaCl).',
    category: 'Estable'
  },
  {
    id: 'cl-37',
    z: 17,
    n: 20,
    symbol: '³⁷Cl',
    elementSymbol: 'Cl',
    name: 'Cloro-37 (³⁷Cl)',
    elementName: 'Cloro',
    massNumber: 37,
    atomicMassAmu: 36.9659,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '24.24%',
    description: 'Empleo pionero por Raymond Davis Jr. en la mina Homestake para la detección de neutrinos solares (³⁷Cl + ν ➔ ³⁷Ar + e⁻).',
    category: 'Estable'
  },

  // Potasio (Z=19)
  {
    id: 'k-39',
    z: 19,
    n: 20,
    symbol: '³⁹K',
    elementSymbol: 'K',
    name: 'Potasio-39 (³⁹K)',
    elementName: 'Potasio',
    massNumber: 39,
    atomicMassAmu: 38.9637,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '93.26%',
    description: 'Nutriente vegetal y electrolito celular indispensable.',
    category: 'Estable'
  },
  {
    id: 'k-40',
    z: 19,
    n: 21,
    symbol: '⁴⁰K',
    elementSymbol: 'K',
    name: 'Potasio-40 (⁴⁰K Primordial)',
    elementName: 'Potasio',
    massNumber: 40,
    atomicMassAmu: 39.9640,
    halfLife: '1,248 millones de años',
    decayMode: 'Beta menos (89%) / Captura electrónica (11%)',
    abundance: '0.012% (Natural)',
    description: 'Mayor fuente de radiactividad natural del cuerpo humano (desintegraciones constantes en plátanos y tejido muscular). Base de datación K-Ar.',
    category: 'Primordial'
  },

  // Calcio (Z=20)
  {
    id: 'ca-40',
    z: 20,
    n: 20,
    symbol: '⁴⁰Ca',
    elementSymbol: 'Ca',
    name: 'Calcio-40 (⁴⁰Ca)',
    elementName: 'Calcio',
    massNumber: 40,
    atomicMassAmu: 39.9626,
    halfLife: 'Estable (Doble Mágico)',
    decayMode: 'Ninguno (Estable)',
    abundance: '96.94%',
    description: 'Núcleo doblemente mágico (Z=20, N=20). Principal componente mineral de huesos, dientes y carbonato de calcio.',
    category: 'Estable'
  },

  // Hierro (Z=26)
  {
    id: 'fe-56',
    z: 26,
    n: 30,
    symbol: '⁵⁶Fe',
    elementSymbol: 'Fe',
    name: 'Hierro-56 (Pico Nuclear)',
    elementName: 'Hierro',
    massNumber: 56,
    atomicMassAmu: 55.9349,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '91.75%',
    description: 'Cúspide de la energía de enlace por nucleón (~8.79 MeV/nucleón). Punto final de la fusión estelar antes del colapso de supernovas.',
    category: 'Estable'
  },
  {
    id: 'fe-54',
    z: 26,
    n: 28,
    symbol: '⁵⁴Fe',
    elementSymbol: 'Fe',
    name: 'Hierro-54 (⁵⁴Fe)',
    elementName: 'Hierro',
    massNumber: 54,
    atomicMassAmu: 53.9396,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '5.85%',
    description: 'Posee número mágico de neutrones (N=28).',
    category: 'Estable'
  },

  // Cobalto (Z=27)
  {
    id: 'co-59',
    z: 27,
    n: 32,
    symbol: '⁵⁹Co',
    elementSymbol: 'Co',
    name: 'Cobalto-59 (⁵⁹Co)',
    elementName: 'Cobalto',
    massNumber: 59,
    atomicMassAmu: 58.9332,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '100%',
    description: 'Elemento monoisotópico natural.',
    category: 'Estable'
  },
  {
    id: 'co-60',
    z: 27,
    n: 33,
    symbol: '⁶⁰Co',
    elementSymbol: 'Co',
    name: 'Cobalto-60 (⁶⁰Co)',
    elementName: 'Cobalto',
    massNumber: 60,
    atomicMassAmu: 59.9338,
    halfLife: '5.27 años',
    decayMode: 'Beta menos y Gamma (β⁻ / 2γ de 1.17 y 1.33 MeV)',
    abundance: 'Sintético (Reactor)',
    description: 'Fuente gamma intensiva para radioterapia oncológica externa (bomba de cobalto), radiografía industrial y esterilización de instrumental quirúrgico.',
    category: 'Radiactivo β⁻'
  },

  // Cobre (Z=29)
  {
    id: 'cu-63',
    z: 29,
    n: 34,
    symbol: '⁶³Cu',
    elementSymbol: 'Cu',
    name: 'Cobre-63 (⁶³Cu)',
    elementName: 'Cobre',
    massNumber: 63,
    atomicMassAmu: 62.9296,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '69.15%',
    description: 'Conductor por excelencia de la infraestructura eléctrica.',
    category: 'Estable'
  },

  // Tecnecio (Z=43)
  {
    id: 'tc-99m',
    z: 43,
    n: 56,
    symbol: '⁹⁹ᵐTc',
    elementSymbol: 'Tc',
    name: 'Tecnecio-99m (Isómero Nuclear)',
    elementName: 'Tecnecio',
    massNumber: 99,
    atomicMassAmu: 98.9063,
    halfLife: '6.01 horas',
    decayMode: 'Transición Isomérica Gamma (γ 140 keV ➔ ⁹⁹Tc)',
    abundance: 'Generador ⁹⁹Mo/⁹⁹ᵐTc',
    description: 'El radioisótopo más utilizado en el mundo en medicina nuclear (>80% de gammagrafías cardíacas, óseas y cerebrales).',
    category: 'Radiactivo β⁻'
  },

  // Yodo (Z=53)
  {
    id: 'i-127',
    z: 53,
    n: 74,
    symbol: '¹²⁷I',
    elementSymbol: 'I',
    name: 'Yodo-127 (¹²⁷I)',
    elementName: 'Yodo',
    massNumber: 127,
    atomicMassAmu: 126.9045,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '100%',
    description: 'Único isótopo estable del yodo; sal yodada para prevención del bocio tiroideo.',
    category: 'Estable'
  },
  {
    id: 'i-131',
    z: 53,
    n: 78,
    symbol: '¹³¹I',
    elementSymbol: 'I',
    name: 'Yodo-131 (¹³¹I)',
    elementName: 'Yodo',
    massNumber: 131,
    atomicMassAmu: 130.9061,
    halfLife: '8.02 días',
    decayMode: 'Beta menos y Gamma (β⁻ / γ ➔ ¹³¹Xe)',
    abundance: 'Producto de fisión',
    description: 'Terapia radioisotópica dirigida para cáncer tiroideo e hipertiroidismo grave.',
    category: 'Radiactivo β⁻'
  },

  // Cesio (Z=55)
  {
    id: 'cs-133',
    z: 55,
    n: 78,
    symbol: '¹³³Cs',
    elementSymbol: 'Cs',
    name: 'Cesio-133 (Patrón de Tiempo SI)',
    elementName: 'Cesio',
    massNumber: 133,
    atomicMassAmu: 132.9055,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '100%',
    description: 'Base de la definición del segundo en el SI (9,192,631,770 oscilaciones de la transición hiperfina del estado fundamental).',
    category: 'Estable'
  },
  {
    id: 'cs-137',
    z: 55,
    n: 82,
    symbol: '¹³⁷Cs',
    elementSymbol: 'Cs',
    name: 'Cesio-137 (¹³⁷Cs)',
    elementName: 'Cesio',
    massNumber: 137,
    atomicMassAmu: 136.9071,
    halfLife: '30.17 años',
    decayMode: 'Beta menos (β⁻ ➔ ¹³⁷ᵐBa ➔ ¹³⁷Ba)',
    abundance: 'Producto de fisión nuclear',
    description: 'Emisor gamma característico tras incidentes radiológicos y marcador de ensayos nucleares del siglo XX.',
    category: 'Radiactivo β⁻'
  },

  // Oro (Z=79)
  {
    id: 'au-197',
    z: 79,
    n: 118,
    symbol: '¹⁹⁷Au',
    elementSymbol: 'Au',
    name: 'Oro-197 (¹⁹⁷Au)',
    elementName: 'Oro',
    massNumber: 197,
    atomicMassAmu: 196.9666,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '100%',
    description: 'Único isótopo estable del oro; sintetizado cósmicamente por proceso r durante fusiones de estrellas de neutrones (kilonovas).',
    category: 'Estable'
  },

  // Plomo (Z=82)
  {
    id: 'pb-208',
    z: 82,
    n: 126,
    symbol: '²⁰⁸Pb',
    elementSymbol: 'Pb',
    name: 'Plomo-208 (Doble Mágico)',
    elementName: 'Plomo',
    massNumber: 208,
    atomicMassAmu: 207.9767,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '52.4%',
    description: 'El núcleo doblemente mágico más pesado conocido (Z=82, N=126). Límite final del valle de estabilidad natural.',
    category: 'Estable'
  },

  // Torio (Z=90)
  {
    id: 'th-232',
    z: 90,
    n: 142,
    symbol: '²³²Th',
    elementSymbol: 'Th',
    name: 'Torio-232 (Fértil)',
    elementName: 'Torio',
    massNumber: 232,
    atomicMassAmu: 232.0381,
    halfLife: '14,050 millones de años',
    decayMode: 'Alfa (α ➔ ²²⁸Ra)',
    abundance: '100% (Primordial)',
    description: 'Material fértil primordial 3 veces más abundante que el uranio; base del ciclo de combustible nuclear de torio (²³²Th + n ➔ ²³³U).',
    category: 'Primordial'
  },

  // Uranio (Z=92)
  {
    id: 'u-235',
    z: 92,
    n: 143,
    symbol: '²³⁵U',
    elementSymbol: 'U',
    name: 'Uranio-235 (Fisionable)',
    elementName: 'Uranio',
    massNumber: 235,
    atomicMassAmu: 235.0439,
    halfLife: '703.8 millones de años',
    decayMode: 'Alfa y Fisión Espontánea',
    abundance: '0.720%',
    description: 'Único nucleido natural directamente fisionable por neutrones térmicos lentos. Combustible de centrales nucleares comerciales.',
    category: 'Fisionable'
  },
  {
    id: 'u-238',
    z: 92,
    n: 146,
    symbol: '²³⁸U',
    elementSymbol: 'U',
    name: 'Uranio-238 (Primordial)',
    elementName: 'Uranio',
    massNumber: 238,
    atomicMassAmu: 238.0508,
    halfLife: '4,468 millones de años',
    decayMode: 'Alfa (α ➔ ²³⁴Th)',
    abundance: '99.274%',
    description: 'Isótopo primordial con vida media comparable a la edad de la Tierra. Material fértil que transmuta en ²³⁹Pu fisionable en reactores reproductores.',
    category: 'Primordial'
  },

  // Plutonio (Z=94)
  {
    id: 'pu-238',
    z: 94,
    n: 144,
    symbol: '²³⁸Pu',
    elementSymbol: 'Pu',
    name: 'Plutonio-238 (Fuente RTG)',
    elementName: 'Plutonio',
    massNumber: 238,
    atomicMassAmu: 238.0496,
    halfLife: '87.7 años',
    decayMode: 'Alfa de alta potencia térmica (α ➔ ²³⁴U)',
    abundance: 'Sintético',
    description: 'Generador termoeléctrico de radioisótopos (RTG) que suministra calor y electricidad ininterrumpida a sondas espaciales (Voyager 1/2, Curiosity, Perseverance).',
    category: 'Radiactivo α'
  },
  {
    id: 'pu-239',
    z: 94,
    n: 145,
    symbol: '²³⁹Pu',
    elementSymbol: 'Pu',
    name: 'Plutonio-239 (Fisionable)',
    elementName: 'Plutonio',
    massNumber: 239,
    atomicMassAmu: 239.0522,
    halfLife: '24,110 años',
    decayMode: 'Alfa y Fisión Inducida',
    abundance: 'Sintético (Reactor)',
    description: 'Isótopo fisionable producido artificialmente por captura neutrónica sobre ²³⁸U.',
    category: 'Fisionable'
  },

  // Aluminio (Z=13)
  {
    id: 'al-26',
    z: 13,
    n: 13,
    symbol: '²⁶Al',
    elementSymbol: 'Al',
    name: 'Aluminio-26 (Radionúclido Cósmico)',
    elementName: 'Aluminio',
    massNumber: 26,
    atomicMassAmu: 25.9868,
    halfLife: '717,000 años',
    decayMode: 'Beta más / Captura electrónica (β⁺ ➔ ²⁶Mg)',
    abundance: 'Traza cosmogénica',
    description: 'Sintetizado en supernovas. Su decaimiento radioactivo fue la principal fuente de calor que fundió y diferenció los primeros asteroides y planetesimales del sistema solar.',
    category: 'Radiactivo β⁺'
  },
  {
    id: 'al-27',
    z: 13,
    n: 14,
    symbol: '²⁷Al',
    elementSymbol: 'Al',
    name: 'Aluminio-27 (¹⁰⁰% Estable)',
    elementName: 'Aluminio',
    massNumber: 27,
    atomicMassAmu: 26.9815,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '100%',
    description: 'Único isótopo natural estable del aluminio. Tercer elemento más abundante de la corteza terrestre.',
    category: 'Estable'
  },

  // Silicio (Z=14)
  {
    id: 'si-28',
    z: 14,
    n: 14,
    symbol: '²⁸Si',
    elementSymbol: 'Si',
    name: 'Silicio-28 (²⁸Si)',
    elementName: 'Silicio',
    massNumber: 28,
    atomicMassAmu: 27.9769,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '92.23%',
    description: 'Isótopo dominante en silicatos, cuarzo y chips semiconductores monocristalinos.',
    category: 'Estable'
  },
  {
    id: 'si-29',
    z: 14,
    n: 15,
    symbol: '²⁹Si',
    elementSymbol: 'Si',
    name: 'Silicio-29 (RMN Espín 1/2)',
    elementName: 'Silicio',
    massNumber: 29,
    atomicMassAmu: 28.9765,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '4.68%',
    description: 'Posee espín nuclear no nulo I = 1/2, fundamental para caracterizar cerámicas, zeolitas y polímeros de silicona por RMN.',
    category: 'Estable'
  },
  {
    id: 'si-30',
    z: 14,
    n: 16,
    symbol: '³⁰Si',
    elementSymbol: 'Si',
    name: 'Silicio-30 (³⁰Si)',
    elementName: 'Silicio',
    massNumber: 30,
    atomicMassAmu: 29.9738,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '3.09%',
    description: 'Utilizado en transmutación por neutrones para dopar obleas semiconductoras con fósforo ultra-homogéneo.',
    category: 'Estable'
  },

  // Azufre (Z=16)
  {
    id: 's-32',
    z: 16,
    n: 16,
    symbol: '³²S',
    elementSymbol: 'S',
    name: 'Azufre-32 (³²S)',
    elementName: 'Azufre',
    massNumber: 32,
    atomicMassAmu: 31.9721,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '94.99%',
    description: 'Isótopo alfa producido en nucleosíntesis masiva estelar.',
    category: 'Estable'
  },
  {
    id: 's-33',
    z: 16,
    n: 17,
    symbol: '³³S',
    elementSymbol: 'S',
    name: 'Azufre-33 (³³S)',
    elementName: 'Azufre',
    massNumber: 33,
    atomicMassAmu: 32.9715,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '0.75%',
    description: 'Espín I=3/2 para espectroscopía de resonancia magnética.',
    category: 'Estable'
  },
  {
    id: 's-34',
    z: 16,
    n: 18,
    symbol: '³⁴S',
    elementSymbol: 'S',
    name: 'Azufre-34 (³⁴S)',
    elementName: 'Azufre',
    massNumber: 34,
    atomicMassAmu: 33.9679,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '4.25%',
    description: 'Fraccionamiento isotópico δ³⁴S utilizado en geoquímica para rastrear la oxigenación de los océanos primitivos.',
    category: 'Estable'
  },
  {
    id: 's-35',
    z: 16,
    n: 19,
    symbol: '³⁵S',
    elementSymbol: 'S',
    name: 'Azufre-35 (³⁵S)',
    elementName: 'Azufre',
    massNumber: 35,
    atomicMassAmu: 34.9690,
    halfLife: '87.5 días',
    decayMode: 'Beta menos puro (β⁻ ➔ ³⁵Cl)',
    abundance: 'Sintético / Cosmogénico',
    description: 'Emisor beta de baja energía (167 keV) clave en el histórico experimento de Hershey y Chase (1952) que demostró que el ADN es el material genético.',
    category: 'Radiactivo β⁻'
  },

  // Argón (Z=18)
  {
    id: 'ar-36',
    z: 18,
    n: 18,
    symbol: '³⁶Ar',
    elementSymbol: 'Ar',
    name: 'Argón-36 (³⁶Ar)',
    elementName: 'Argón',
    massNumber: 36,
    atomicMassAmu: 35.9675,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '0.334%',
    description: 'Isótopo primordial sintetizado en supernovas.',
    category: 'Estable'
  },
  {
    id: 'ar-40',
    z: 18,
    n: 22,
    symbol: '⁴⁰Ar',
    elementSymbol: 'Ar',
    name: 'Argón-40 (⁴⁰Ar Radiogénico)',
    elementName: 'Argón',
    massNumber: 40,
    atomicMassAmu: 39.9624,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '99.60%',
    description: 'Constituye casi el 1% de la atmósfera terrestre; originado enteramente por la desintegración radiactiva del Potasio-40 en el interior del manto terrestre.',
    category: 'Estable'
  },

  // Titanio (Z=22)
  {
    id: 'ti-48',
    z: 22,
    n: 26,
    symbol: '⁴⁸Ti',
    elementSymbol: 'Ti',
    name: 'Titanio-48 (⁴⁸Ti)',
    elementName: 'Titanio',
    massNumber: 48,
    atomicMassAmu: 47.9479,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '73.72%',
    description: 'Isótopo más abundante del titanio, con gran tenacidad y bioinercia en implantes óseos.',
    category: 'Estable'
  },
  {
    id: 'ti-44',
    z: 22,
    n: 22,
    symbol: '⁴⁴Ti',
    elementSymbol: 'Ti',
    name: 'Titanio-44 (Remanente de Supernova)',
    elementName: 'Titanio',
    massNumber: 44,
    atomicMassAmu: 43.9597,
    halfLife: '60 años',
    decayMode: 'Captura Electrónica (CE ➔ ⁴⁴Sc ➔ ⁴⁴Ca)',
    abundance: 'Traza astrofísica',
    description: 'Marcador cósmico clave detectado por observatorios espaciales de rayos gamma en remanentes como Casiopea A.',
    category: 'Radiactivo β⁺'
  },

  // Cromo (Z=24)
  {
    id: 'cr-52',
    z: 24,
    n: 28,
    symbol: '⁵²Cr',
    elementSymbol: 'Cr',
    name: 'Cromo-52 (Número Mágico N=28)',
    elementName: 'Cromo',
    massNumber: 52,
    atomicMassAmu: 51.9405,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '83.79%',
    description: 'Posee capa neutrónica cerrada con 28 neutrones (número mágico). Resistencia a la corrosión en aceros inoxidables.',
    category: 'Estable'
  },
  {
    id: 'cr-51',
    z: 24,
    n: 27,
    symbol: '⁵¹Cr',
    elementSymbol: 'Cr',
    name: 'Cromo-51 (Médico)',
    elementName: 'Cromo',
    massNumber: 51,
    atomicMassAmu: 50.9448,
    halfLife: '27.7 días',
    decayMode: 'Captura Electrónica y Gamma (320 keV)',
    abundance: 'Sintético (Reactor)',
    description: 'Radioisótopo utilizado en hematología para medir el volumen eritrocitario y supervivencia de glóbulos rojos.',
    category: 'Radiactivo β⁺'
  },

  // Níquel (Z=28)
  {
    id: 'ni-58',
    z: 28,
    n: 30,
    symbol: '⁵⁸Ni',
    elementSymbol: 'Ni',
    name: 'Níquel-58 (Z=28 Mágico)',
    elementName: 'Níquel',
    massNumber: 58,
    atomicMassAmu: 57.9353,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '68.08%',
    description: 'El isótopo de níquel más abundante en la naturaleza.',
    category: 'Estable'
  },
  {
    id: 'ni-62',
    z: 28,
    n: 34,
    symbol: '⁶²Ni',
    elementSymbol: 'Ni',
    name: 'Níquel-62 (Máxima Energía de Enlace)',
    elementName: 'Níquel',
    massNumber: 62,
    atomicMassAmu: 61.9283,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '3.63%',
    description: 'El núcleo más fuertemente ligado de todo el universo físico (8.7946 MeV por nucleón), superando incluso al Hierro-56.',
    category: 'Estable'
  },

  // Zinc (Z=30)
  {
    id: 'zn-64',
    z: 30,
    n: 34,
    symbol: '⁶⁴Zn',
    elementSymbol: 'Zn',
    name: 'Zinc-64 (⁶⁴Zn)',
    elementName: 'Zinc',
    massNumber: 64,
    atomicMassAmu: 63.9291,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '49.17%',
    description: 'Isótopo mayoritario empleado en galvanoplastia protectora.',
    category: 'Estable'
  },
  {
    id: 'zn-65',
    z: 30,
    n: 35,
    symbol: '⁶⁵Zn',
    elementSymbol: 'Zn',
    name: 'Zinc-65 (Trazador)',
    elementName: 'Zinc',
    massNumber: 65,
    atomicMassAmu: 64.9292,
    halfLife: '244.26 días',
    decayMode: 'Captura Electrónica y Positrón (γ 1.115 MeV)',
    abundance: 'Sintético (Activación)',
    description: 'Trazador radioisotópico para estudiar la absorción y homeostasis de zinc en biología y corrosión de reactores.',
    category: 'Radiactivo β⁺'
  },

  // Galio (Z=31)
  {
    id: 'ga-68',
    z: 31,
    n: 37,
    symbol: '⁶⁸Ga',
    elementSymbol: 'Ga',
    name: 'Galio-68 (PET Oncológico)',
    elementName: 'Galio',
    massNumber: 68,
    atomicMassAmu: 67.9280,
    halfLife: '67.7 minutos',
    decayMode: 'Beta más / Positrón (β⁺ ➔ ⁶⁸Zn)',
    abundance: 'Generador ⁶⁸Ge/⁶⁸Ga',
    description: 'Pilar de la teranóstica nuclear moderna; unido a péptidos DOTATOC/DOTATATE para diagnóstico por PET de tumores neuroendocrinos y antígeno prostático específico (PSMA).',
    category: 'Radiactivo β⁺'
  },
  {
    id: 'ga-69',
    z: 31,
    n: 38,
    symbol: '⁶⁹Ga',
    elementSymbol: 'Ga',
    name: 'Galio-69 (⁶⁹Ga)',
    elementName: 'Galio',
    massNumber: 69,
    atomicMassAmu: 68.9256,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '60.11%',
    description: 'Isótopo dominante en chips optoelectrónicos y diodos semiconductores.',
    category: 'Estable'
  },

  // Plata (Z=47)
  {
    id: 'ag-107',
    z: 47,
    n: 60,
    symbol: '¹⁰⁷Ag',
    elementSymbol: 'Ag',
    name: 'Plata-107 (¹⁰⁷Ag)',
    elementName: 'Plata',
    massNumber: 107,
    atomicMassAmu: 106.9051,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '51.84%',
    description: 'Isótopo mayoritario de la plata nativa con la más alta conductividad eléctrica y térmica.',
    category: 'Estable'
  },
  {
    id: 'ag-109',
    z: 47,
    n: 62,
    symbol: '¹⁰⁹Ag',
    elementSymbol: 'Ag',
    name: 'Plata-109 (¹⁰⁹Ag)',
    elementName: 'Plata',
    massNumber: 109,
    atomicMassAmu: 108.9048,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '48.16%',
    description: 'Isótopo primordial estable con espín I = 1/2.',
    category: 'Estable'
  },

  // Estaño (Z=50 - Mayor número de isótopos estables: 10)
  {
    id: 'sn-120',
    z: 50,
    n: 70,
    symbol: '¹²⁰Sn',
    elementSymbol: 'Sn',
    name: 'Estaño-120 (Z=50 Mágico)',
    elementName: 'Estaño',
    massNumber: 120,
    atomicMassAmu: 119.9022,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '32.58%',
    description: 'El más abundante de los 10 isótopos estables del estaño (número mágico de protones Z=50).',
    category: 'Estable'
  },
  {
    id: 'sn-118',
    z: 50,
    n: 68,
    symbol: '¹¹⁸Sn',
    elementSymbol: 'Sn',
    name: 'Estaño-118 (¹¹⁸Sn)',
    elementName: 'Estaño',
    massNumber: 118,
    atomicMassAmu: 117.9016,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '24.22%',
    description: 'Empleado en aleaciones de bronce y soldaduras eutécticas sin plomo.',
    category: 'Estable'
  },

  // Xenón (Z=54)
  {
    id: 'xe-129',
    z: 54,
    n: 75,
    symbol: '¹²⁹Xe',
    elementSymbol: 'Xe',
    name: 'Xenón-129 (Hiperpolarizado)',
    elementName: 'Xenón',
    massNumber: 129,
    atomicMassAmu: 128.9048,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '26.40%',
    description: 'Gas noble hiperpolarizable mediante bombeo óptico láser para resonancia magnética funcional de la ventilación pulmonar.',
    category: 'Estable'
  },
  {
    id: 'xe-133',
    z: 54,
    n: 79,
    symbol: '¹³³Xe',
    elementSymbol: 'Xe',
    name: 'Xenón-133 (Inhalación SPECT)',
    elementName: 'Xenón',
    massNumber: 133,
    atomicMassAmu: 132.9059,
    halfLife: '5.24 días',
    decayMode: 'Beta menos y Gamma (81 keV)',
    abundance: 'Producto de fisión',
    description: 'Radioisótopo inhalado para gammagrafías de ventilación pulmonar y perfusión respiratoria.',
    category: 'Radiactivo β⁻'
  },

  // Bario (Z=56)
  {
    id: 'ba-138',
    z: 56,
    n: 82,
    symbol: '¹³⁸Ba',
    elementSymbol: 'Ba',
    name: 'Bario-138 (N=82 Mágico)',
    elementName: 'Bario',
    massNumber: 138,
    atomicMassAmu: 137.9052,
    halfLife: 'Estable',
    decayMode: 'Ninguno (Estable)',
    abundance: '71.70%',
    description: 'Posee 82 neutrones (número mágico), confiriéndole altísima estabilidad. Contraste radiológico en sulfato de bario.',
    category: 'Estable'
  },

  // Lutecio (Z=71)
  {
    id: 'lu-177',
    z: 71,
    n: 106,
    symbol: '¹⁷⁷Lu',
    elementSymbol: 'Lu',
    name: 'Lutecio-177 (Revolución Teranóstica)',
    elementName: 'Lutecio',
    massNumber: 177,
    atomicMassAmu: 176.9438,
    halfLife: '6.64 días',
    decayMode: 'Beta menos y Gamma (β⁻ 498 keV / γ 208 keV)',
    abundance: 'Sintético (Reactor nuclear)',
    description: 'El radiofármaco teranóstico más avanzado en oncología médica ([¹⁷⁷Lu]Lu-PSMA-617) para el tratamiento dirigido de cáncer de próstata metastásico resistente a castración.',
    category: 'Radiactivo β⁻'
  },

  // Radio (Z=88)
  {
    id: 'ra-223',
    z: 88,
    n: 135,
    symbol: '²²³Ra',
    elementSymbol: 'Ra',
    name: 'Radio-223 (Xofigo / Terapia Alfa)',
    elementName: 'Radio',
    massNumber: 223,
    atomicMassAmu: 223.0185,
    halfLife: '11.43 días',
    decayMode: 'Alfa dirigido (α de 5.7 MeV)',
    abundance: 'Serie del Actinio (Natural)',
    description: 'Primer radiofármaco emisor alfa aprobado en el mundo (cloruro de radio-223 / Xofigo) para destruir micrometástasis óseas protegiendo la médula ósea sana vecina.',
    category: 'Radiactivo α'
  },
  {
    id: 'ra-226',
    z: 88,
    n: 138,
    symbol: '²²⁶Ra',
    elementSymbol: 'Ra',
    name: 'Radio-226 (Histórico Curie)',
    elementName: 'Radio',
    massNumber: 226,
    atomicMassAmu: 226.0254,
    halfLife: '1,600 años',
    decayMode: 'Alfa (α ➔ ²²²Rn)',
    abundance: 'Traza en pechblenda',
    description: 'Descubierto en 1898 por Marie y Pierre Curie; acuñó el término radiactividad y definió la unidad histórica Curio (Ci).',
    category: 'Radiactivo α'
  },

  // Actinio (Z=89)
  {
    id: 'ac-225',
    z: 89,
    n: 136,
    symbol: '²²⁵Ac',
    elementSymbol: 'Ac',
    name: 'Actinio-225 (TAT Alfa de Precisión)',
    elementName: 'Actinio',
    massNumber: 225,
    atomicMassAmu: 225.0232,
    halfLife: '9.92 días',
    decayMode: 'Emisión en cascada de 4 partículas Alfa',
    abundance: 'Generador ²²⁹Th',
    description: 'Generador de partículas alfa de transferencia lineal de energía (LET) extrema, capaz de destruir células cancerosas individuales con roturas de doble cadena de ADN irreversibles.',
    category: 'Radiactivo α'
  },

  // Americio (Z=95)
  {
    id: 'am-241',
    z: 95,
    n: 146,
    symbol: '²⁴¹Am',
    elementSymbol: 'Am',
    name: 'Americio-241 (Detector de Humo)',
    elementName: 'Americio',
    massNumber: 241,
    atomicMassAmu: 241.0568,
    halfLife: '432.2 años',
    decayMode: 'Alfa y Gamma suave (5.48 MeV α / 59.5 keV γ)',
    abundance: 'Sintético (Subproducto reactor)',
    description: 'Ioniza el aire dentro de la cámara de millones de detectores de humo instalados en hogares de todo el mundo; salva miles de vidas anualmente.',
    category: 'Radiactivo α'
  },

  // Californio (Z=98)
  {
    id: 'cf-252',
    z: 98,
    n: 154,
    symbol: '²⁵²Cf',
    elementSymbol: 'Cf',
    name: 'Californio-252 (Emisor de Neutrones)',
    elementName: 'Californio',
    massNumber: 252,
    atomicMassAmu: 252.0816,
    halfLife: '2.645 años',
    decayMode: 'Alfa (96.9%) y Fisión Espontánea (3.1%)',
    abundance: 'Sintético (HFIR Oak Ridge)',
    description: 'Fuente de neutrones compacta extraordinaria (emite 2.3 millones de neutrones por segundo por microgramo). Utilizado para arrancar reactores nucleares y escanear equipajes en busca de explosivos.',
    category: 'Fisionable'
  },

  // Oganesón (Z=118)
  {
    id: 'og-294',
    z: 118,
    n: 176,
    symbol: '²⁹⁴Og',
    elementSymbol: 'Og',
    name: 'Oganesón-294 (Frontera de la Materia)',
    elementName: 'Oganesón',
    massNumber: 294,
    atomicMassAmu: 294.214,
    halfLife: '0.69 milisegundos',
    decayMode: 'Alfa (α ➔ ²⁹⁰Lv)',
    abundance: 'Sintético (Unos pocos átomos sintetizados)',
    description: 'El átomo más masivo jamás detectado por la humanidad. Producido por colisión de iones de Calcio-48 sobre un blanco de Californio-249.',
    category: 'Radiactivo α'
  }
];

export interface IsotopesSummary {
  totalCount: number;
  stableCount: number;
  radioactiveCount: number;
  hasMedicalUse: boolean;
  isMonoisotopic: boolean;
  stableSymbols: string[];
  dominantIsotope: IsotopeDefinition;
}

/**
 * Obtiene o sintetiza la lista de isótopos representativos para un elemento dado de la tabla periódica
 */
export function getIsotopesForElement(z: number): IsotopeDefinition[] {
  const element = PERIODIC_ELEMENTS.find(e => e.z === z) || {
    z,
    symbol: `E${z}`,
    name: `Elemento-${z}`,
    atomicMass: z * 2
  };

  // Buscar si existen isótopos específicos registrados en la base de datos notable
  const existing = NOTABLE_ISOTOPES.filter(i => i.z === z);
  if (existing.length > 0) {
    // Ordenar por número másico A ascendente
    return [...existing].sort((a, b) => a.massNumber - b.massNumber);
  }

  // Si no hay registrados explícitamente, generar los isótopos principales basados en el valle de estabilidad
  const valleyPoint = VALLEY_STABLE_POINTS.find(p => p.z === z);
  const optimalN = valleyPoint ? valleyPoint.optimalN : Math.round(z * (z > 20 ? 1.4 : 1.0));
  const minN = valleyPoint ? valleyPoint.minN : Math.max(0, optimalN - 3);
  const maxN = valleyPoint ? valleyPoint.maxN : optimalN + 3;

  const generated: IsotopeDefinition[] = [];

  for (let n = Math.max(0, minN - 1); n <= maxN + 1; n++) {
    const a = z + n;
    const verdict = getStabilityVerdict(z, n);
    const isOptimal = n === optimalN;
    const isStable = z <= 82 && verdict.status === 'Estable';

    generated.push({
      id: `${element.symbol.toLowerCase()}-${a}`,
      z,
      n,
      symbol: `${superscriptNumber(a)}${element.symbol}`,
      elementSymbol: element.symbol,
      name: `${element.name}-${a}`,
      elementName: element.name,
      massNumber: a,
      atomicMassAmu: Math.round((a + (n % 2 === 0 ? -0.005 : 0.005)) * 10000) / 10000,
      halfLife: isStable ? 'Estable' : z > 92 ? `${Math.round(200 / (1 + (z - 92) * 2))} días` : 'Radiactivo',
      decayMode: isStable ? 'Ninguno (Estable)' : verdict.status || (z > 82 ? 'Alfa (α)' : 'Beta menos (β⁻)'),
      abundance: isOptimal && isStable ? 'Mayoritaria (~70-95%)' : isStable ? 'Secundaria (~5-30%)' : 'Traza o sintético',
      description: verdict.description || `Isótopo representativo con Z=${z} y N=${n} (A=${a}). ${verdict.status}.`,
      category: isStable ? 'Estable' : verdict.status === 'Radiactivo β⁻' ? 'Radiactivo β⁻' : verdict.status === 'Radiactivo β⁺' ? 'Radiactivo β⁺' : 'Radiactivo α'
    });
  }

  return generated.sort((a, b) => a.massNumber - b.massNumber);
}

/**
 * Resumen isotópico para filtros en la tabla periódica
 */
export function getIsotopesSummary(z: number): IsotopesSummary {
  const isotopes = getIsotopesForElement(z);
  const stable = isotopes.filter(i => i.category === 'Estable' || i.halfLife.includes('Estable'));
  const radioactive = isotopes.filter(i => i.category !== 'Estable' && !i.halfLife.includes('Estable'));
  
  const dominant = isotopes.find(i => i.abundance.includes('%') && parseFloat(i.abundance) > 50) 
    || isotopes[0];

  const hasMedicalUse = isotopes.some(i => 
    i.description.toLowerCase().includes('médic') || 
    i.description.toLowerCase().includes('pet') || 
    i.description.toLowerCase().includes('cáncer') ||
    i.description.toLowerCase().includes('terapia')
  );

  return {
    totalCount: isotopes.length,
    stableCount: stable.length,
    radioactiveCount: radioactive.length,
    hasMedicalUse,
    isMonoisotopic: stable.length === 1,
    stableSymbols: stable.map(s => s.symbol),
    dominantIsotope: dominant
  };
}

/**
 * Convierte un número entero a caracteres superíndice Unicode
 */
export function superscriptNumber(num: number): string {
  const map: { [key: string]: string } = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻'
  };
  return String(num).split('').map(ch => map[ch] || ch).join('');
}

/**
 * Cálculo del Principio de Aufbau para la configuración electrónica de cualquier número de electrones
 */
export function getAufbauConfiguration(electronCount: number) {
  if (electronCount <= 0) {
    return {
      formula: '— sin electrones (núcleo desnudo) —',
      shortFormula: '[Núcleo desnudo]',
      valenceElectrons: 0,
      shells: [],
      subshells: []
    };
  }

  // Orden de llenado Aufbau (Madelung rule n + l)
  const subshellOrder = [
    { name: '1s', n: 1, cap: 2 },
    { name: '2s', n: 2, cap: 2 },
    { name: '2p', n: 2, cap: 6 },
    { name: '3s', n: 3, cap: 2 },
    { name: '3p', n: 3, cap: 6 },
    { name: '4s', n: 4, cap: 2 },
    { name: '3d', n: 3, cap: 10 },
    { name: '4p', n: 4, cap: 6 },
    { name: '5s', n: 5, cap: 2 },
    { name: '4d', n: 4, cap: 10 },
    { name: '5p', n: 5, cap: 6 },
    { name: '6s', n: 6, cap: 2 },
    { name: '4f', n: 4, cap: 14 },
    { name: '5d', n: 5, cap: 10 },
    { name: '6p', n: 6, cap: 6 },
    { name: '7s', n: 7, cap: 2 },
    { name: '5f', n: 5, cap: 14 },
    { name: '6d', n: 6, cap: 10 },
    { name: '7p', n: 7, cap: 6 }
  ];

  let remaining = electronCount;
  const filledSubshells: { name: string; n: number; count: number }[] = [];
  const shellCountMap: { [n: number]: number } = {};

  for (const sub of subshellOrder) {
    if (remaining <= 0) break;
    const count = Math.min(remaining, sub.cap);
    filledSubshells.push({ name: sub.name, n: sub.n, count });
    shellCountMap[sub.n] = (shellCountMap[sub.n] || 0) + count;
    remaining -= count;
  }

  const formulaParts = filledSubshells.map(
    s => `${s.name}${superscriptNumber(s.count)}`
  );

  const shellNames = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
  const shellCapacities = [2, 8, 18, 32, 50, 72, 98];
  const shells = shellNames.map((name, idx) => {
    const n = idx + 1;
    const count = shellCountMap[n] || 0;
    return {
      name,
      n,
      count,
      cap: shellCapacities[idx]
    };
  }).filter(s => s.count > 0);

  // Electrones de valencia: electrones en la capa cuántica principal más alta n_max
  const maxN = Math.max(...filledSubshells.map(s => s.n));
  const valenceElectrons = shellCountMap[maxN] || 0;

  return {
    formula: formulaParts.join(' '),
    shortFormula: formulaParts.slice(-4).join(' ') || formulaParts.join(' '),
    valenceElectrons,
    shells,
    subshells: filledSubshells
  };
}
