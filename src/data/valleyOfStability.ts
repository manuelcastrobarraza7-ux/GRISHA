// Known stable isotope bands and reference points for the Valley of Stability (Z vs N)
export interface ValleyPoint {
  z: number;
  n: number;
  symbol: string;
  isStable: boolean;
}

// Representative stable isotopes curve points across Z = 1 to 92
export const VALLEY_STABLE_POINTS: { z: number; minN: number; maxN: number; optimalN: number; symbol: string }[] = [
  { z: 1, minN: 0, maxN: 1, optimalN: 0, symbol: 'H' },
  { z: 2, minN: 1, maxN: 2, optimalN: 2, symbol: 'He' },
  { z: 3, minN: 3, maxN: 4, optimalN: 4, symbol: 'Li' },
  { z: 4, minN: 5, maxN: 5, optimalN: 5, symbol: 'Be' },
  { z: 5, minN: 5, maxN: 6, optimalN: 6, symbol: 'B' },
  { z: 6, minN: 6, maxN: 7, optimalN: 6, symbol: 'C' },
  { z: 7, minN: 7, maxN: 8, optimalN: 7, symbol: 'N' },
  { z: 8, minN: 8, maxN: 10, optimalN: 8, symbol: 'O' },
  { z: 9, minN: 10, maxN: 10, optimalN: 10, symbol: 'F' },
  { z: 10, minN: 10, maxN: 12, optimalN: 10, symbol: 'Ne' },
  { z: 11, minN: 12, maxN: 12, optimalN: 12, symbol: 'Na' },
  { z: 12, minN: 12, maxN: 14, optimalN: 12, symbol: 'Mg' },
  { z: 13, minN: 14, maxN: 14, optimalN: 14, symbol: 'Al' },
  { z: 14, minN: 14, maxN: 16, optimalN: 14, symbol: 'Si' },
  { z: 15, minN: 16, maxN: 16, optimalN: 16, symbol: 'P' },
  { z: 16, minN: 16, maxN: 20, optimalN: 16, symbol: 'S' },
  { z: 17, minN: 18, maxN: 20, optimalN: 18, symbol: 'Cl' },
  { z: 18, minN: 18, maxN: 22, optimalN: 22, symbol: 'Ar' },
  { z: 19, minN: 20, maxN: 22, optimalN: 20, symbol: 'K' },
  { z: 20, minN: 20, maxN: 28, optimalN: 20, symbol: 'Ca' },
  { z: 21, minN: 24, maxN: 24, optimalN: 24, symbol: 'Sc' },
  { z: 22, minN: 24, maxN: 28, optimalN: 26, symbol: 'Ti' },
  { z: 23, minN: 28, maxN: 28, optimalN: 28, symbol: 'V' },
  { z: 24, minN: 26, maxN: 30, optimalN: 28, symbol: 'Cr' },
  { z: 25, minN: 30, maxN: 30, optimalN: 30, symbol: 'Mn' },
  { z: 26, minN: 28, maxN: 32, optimalN: 30, symbol: 'Fe' },
  { z: 27, minN: 32, maxN: 32, optimalN: 32, symbol: 'Co' },
  { z: 28, minN: 30, maxN: 36, optimalN: 30, symbol: 'Ni' },
  { z: 29, minN: 34, maxN: 36, optimalN: 34, symbol: 'Cu' },
  { z: 30, minN: 34, maxN: 40, optimalN: 34, symbol: 'Zn' },
  { z: 31, minN: 38, maxN: 40, optimalN: 38, symbol: 'Ga' },
  { z: 32, minN: 38, maxN: 44, optimalN: 42, symbol: 'Ge' },
  { z: 33, minN: 42, maxN: 42, optimalN: 42, symbol: 'As' },
  { z: 34, minN: 40, maxN: 48, optimalN: 46, symbol: 'Se' },
  { z: 35, minN: 44, maxN: 46, optimalN: 44, symbol: 'Br' },
  { z: 36, minN: 42, maxN: 50, optimalN: 48, symbol: 'Kr' },
  { z: 37, minN: 48, maxN: 50, optimalN: 48, symbol: 'Rb' },
  { z: 38, minN: 46, maxN: 50, optimalN: 50, symbol: 'Sr' },
  { z: 39, minN: 50, maxN: 50, optimalN: 50, symbol: 'Y' },
  { z: 40, minN: 50, maxN: 56, optimalN: 50, symbol: 'Zr' },
  { z: 41, minN: 52, maxN: 52, optimalN: 52, symbol: 'Nb' },
  { z: 42, minN: 50, maxN: 58, optimalN: 56, symbol: 'Mo' },
  { z: 43, minN: 54, maxN: 56, optimalN: 55, symbol: 'Tc' }, // Radioactivo
  { z: 44, minN: 52, maxN: 60, optimalN: 58, symbol: 'Ru' },
  { z: 45, minN: 58, maxN: 58, optimalN: 58, symbol: 'Rh' },
  { z: 46, minN: 56, maxN: 64, optimalN: 60, symbol: 'Pd' },
  { z: 47, minN: 60, maxN: 62, optimalN: 60, symbol: 'Ag' },
  { z: 48, minN: 58, maxN: 68, optimalN: 66, symbol: 'Cd' },
  { z: 49, minN: 64, maxN: 66, optimalN: 66, symbol: 'In' },
  { z: 50, minN: 62, maxN: 74, optimalN: 70, symbol: 'Sn' }, // 10 isótopos estables!
  { z: 51, minN: 70, maxN: 72, optimalN: 70, symbol: 'Sb' },
  { z: 52, minN: 68, maxN: 78, optimalN: 78, symbol: 'Te' },
  { z: 53, minN: 74, maxN: 74, optimalN: 74, symbol: 'I' },
  { z: 54, minN: 70, maxN: 82, optimalN: 78, symbol: 'Xe' },
  { z: 55, minN: 78, maxN: 78, optimalN: 78, symbol: 'Cs' },
  { z: 56, minN: 74, maxN: 82, optimalN: 82, symbol: 'Ba' },
  { z: 57, minN: 81, maxN: 82, optimalN: 82, symbol: 'La' },
  { z: 58, minN: 78, maxN: 84, optimalN: 82, symbol: 'Ce' },
  { z: 59, minN: 82, maxN: 82, optimalN: 82, symbol: 'Pr' },
  { z: 60, minN: 82, maxN: 90, optimalN: 82, symbol: 'Nd' },
  { z: 62, minN: 82, maxN: 92, optimalN: 90, symbol: 'Sm' },
  { z: 63, minN: 88, maxN: 90, optimalN: 90, symbol: 'Eu' },
  { z: 64, minN: 88, maxN: 96, optimalN: 94, symbol: 'Gd' },
  { z: 65, minN: 94, maxN: 94, optimalN: 94, symbol: 'Tb' },
  { z: 66, minN: 90, maxN: 98, optimalN: 96, symbol: 'Dy' },
  { z: 67, minN: 98, maxN: 98, optimalN: 98, symbol: 'Ho' },
  { z: 68, minN: 94, maxN: 102, optimalN: 98, symbol: 'Er' },
  { z: 69, minN: 100, maxN: 100, optimalN: 100, symbol: 'Tm' },
  { z: 70, minN: 98, maxN: 106, optimalN: 104, symbol: 'Yb' },
  { z: 71, minN: 104, maxN: 104, optimalN: 104, symbol: 'Lu' },
  { z: 72, minN: 102, maxN: 108, optimalN: 108, symbol: 'Hf' },
  { z: 73, minN: 107, maxN: 108, optimalN: 108, symbol: 'Ta' },
  { z: 74, minN: 106, maxN: 112, optimalN: 110, symbol: 'W' },
  { z: 75, minN: 110, maxN: 112, optimalN: 112, symbol: 'Re' },
  { z: 76, minN: 108, maxN: 116, optimalN: 116, symbol: 'Os' },
  { z: 77, minN: 114, maxN: 116, optimalN: 116, symbol: 'Ir' },
  { z: 78, minN: 114, maxN: 120, optimalN: 117, symbol: 'Pt' },
  { z: 79, minN: 118, maxN: 118, optimalN: 118, symbol: 'Au' },
  { z: 80, minN: 116, maxN: 124, optimalN: 122, symbol: 'Hg' },
  { z: 81, minN: 122, maxN: 124, optimalN: 124, symbol: 'Tl' },
  { z: 82, minN: 122, maxN: 126, optimalN: 126, symbol: 'Pb' }, // Fin del valle estable
  { z: 83, minN: 126, maxN: 126, optimalN: 126, symbol: 'Bi' }, // Quasi-estable (t1/2 > 10^19 años)
  { z: 88, minN: 138, maxN: 138, optimalN: 138, symbol: 'Ra' }, // Radiactivo
  { z: 90, minN: 142, maxN: 142, optimalN: 142, symbol: 'Th' }, // Primordial
  { z: 92, minN: 143, maxN: 146, optimalN: 146, symbol: 'U' },  // U-235, U-238
  { z: 118, minN: 176, maxN: 176, optimalN: 176, symbol: 'Og' }
];

export function getStabilityVerdict(z: number, n: number): {
  status: 'Estable' | 'Radiactivo β⁻' | 'Radiactivo β⁺' | 'Inestable';
  statusColor: string;
  dotColor: string;
  optimalN: number;
  minN: number;
  maxN: number;
  description: string;
} {
  if (z === 0) {
    if (n === 1) {
      return {
        status: 'Radiactivo β⁻',
        statusColor: 'text-amber-400 bg-amber-950/40 border-amber-500/40',
        dotColor: 'bg-amber-400',
        optimalN: 0,
        minN: 0,
        maxN: 0,
        description: 'Neutrón libre (¹n): Fuera de un núcleo atómico ligado, el neutrón es inestable. Sufre desintegración beta menos espontánea (t½ ≈ 879 s / 14.7 min) transmutando en protón, electrón y antineutrino (n → p + e⁻ + ν̄ₑ).'
      };
    }
    return {
      status: 'Inestable',
      statusColor: 'text-red-400 bg-red-950/40 border-red-500/40',
      dotColor: 'bg-red-400',
      optimalN: 0,
      minN: 0,
      maxN: 0,
      description: 'Cúmulo de neutrones puros sin protones: Inestable y no ligado por ausencia de potencial fuerte suficiente.'
    };
  }

  const match = VALLEY_STABLE_POINTS.find(p => p.z === z);
  const optimalN = match ? match.optimalN : Math.round(z <= 20 ? z : z * (1.1 + 0.005 * z));
  const minN = match ? match.minN : Math.max(0, optimalN - 1);
  const maxN = match ? match.maxN : optimalN + 1;

  if (z > 83) {
    return {
      status: 'Inestable',
      statusColor: 'text-red-400 bg-red-950/40 border-red-500/40',
      dotColor: 'bg-red-400',
      optimalN,
      minN,
      maxN,
      description: 'Más allá del bismuto (Z=83), ningún nucleido es estable de forma permanente; todos sufren desintegración alfa o fisión espontánea.'
    };
  }

  if (n >= minN && n <= maxN) {
    return {
      status: 'Estable',
      statusColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40',
      dotColor: 'bg-emerald-400',
      optimalN,
      minN,
      maxN,
      description: 'Los datos nucleares evaluados clasifican este nucleido como estable en el fondo del valle de estabilidad.'
    };
  } else if (n > maxN) {
    return {
      status: 'Radiactivo β⁻',
      statusColor: 'text-amber-400 bg-amber-950/40 border-amber-500/40',
      dotColor: 'bg-amber-400',
      optimalN,
      minN,
      maxN,
      description: 'Nucleido rico en neutrones (por encima de la banda). Se desintegra mediante emisión beta menos (β⁻), convirtiendo un neutrón en protón.'
    };
  } else {
    return {
      status: 'Radiactivo β⁺',
      statusColor: 'text-blue-400 bg-blue-950/40 border-blue-500/40',
      dotColor: 'bg-blue-400',
      optimalN,
      minN,
      maxN,
      description: 'Nucleido rico en protones (por debajo de la banda). Se desintegra mediante emisión beta más (β⁺) o captura electrónica (K).'
    };
  }
}

// =========================================================================
// ELECTRON CAPACITY & ION LIMITS PER ATOM (PHYSICAL & QUANTUM BOUNDARIES)
// =========================================================================

export interface ElectronLimitInfo {
  minElectrons: number;
  maxElectrons: number;
  maxAnionCharge: number;
  maxCationCharge: number;
  reason: string;
}

export function getElectronLimits(z: number): ElectronLimitInfo {
  if (z <= 0) {
    return {
      minElectrons: 0,
      maxElectrons: 0,
      maxAnionCharge: 0,
      maxCationCharge: 0,
      reason: 'Un neutrón libre tiene carga neta neutra (0) y no posee carga nuclear positiva para ligar electrones.'
    };
  }

  // Bare nucleus is always possible in plasma / accelerators (e.g. H+, He2+, Fe26+)
  const minElectrons = 0;
  const maxCationCharge = z;

  // Noble gases: He(2), Ne(10), Ar(18), Kr(36), Xe(54), Rn(86), Og(118)
  const nobleGasZ = [2, 10, 18, 36, 54, 86, 118];
  const isNoble = nobleGasZ.includes(z);

  let maxElectrons = z;
  let reason = '';

  if (z === 1) {
    // Hydrogen: H- (hydride, 2 e-, 1s2) is the maximum bound anion. H2- has no bound state.
    maxElectrons = 2;
    reason = 'Máximo 2 electrones (H⁻, hidruro 1s²). El orbital 1s solo aloja 2 electrones por Principio de Exclusión de Pauli.';
  } else if (z === 2) {
    // Helium: noble gas with closed shell
    maxElectrons = 2;
    reason = 'Máximo 2 electrones (He). Gas noble con capa K completa (1s²); no forma aniones estables.';
  } else if (z === 3) {
    // Lithium: Li- (alkalide 1s2 2s2)
    maxElectrons = 4;
    reason = 'Máximo 4 electrones (Li⁻ alcaluro). La capa 2s se completa con 2 electrones.';
  } else if (z === 4) {
    // Beryllium
    maxElectrons = 5;
    reason = 'Máximo 5 electrones (Be⁻). Limitado por afinidad electrónica y repulsión coulómbica.';
  } else if (z === 5) {
    // Boron
    maxElectrons = 8;
    reason = 'Máximo 8 electrones (capa de valencia L parcial).';
  } else if (z >= 6 && z <= 9) {
    // C(6), N(7), O(8), F(9): All complete octet at 10 electrons (Ne core)
    maxElectrons = 10;
    if (z === 6) reason = 'Máximo 10 electrones (C⁴⁻, carburo con octeto completo 2s² 2p⁶).';
    else if (z === 7) reason = 'Máximo 10 electrones (N³⁻, nitruro con octeto completo 2s² 2p⁶).';
    else if (z === 8) reason = 'Máximo 10 electrones (O²⁻, óxido con octeto completo 2s² 2p⁶).';
    else reason = 'Máximo 10 electrones (F⁻, fluoruro con octeto completo 2s² 2p⁶).';
  } else if (z === 10) {
    // Neon
    maxElectrons = 10;
    reason = 'Máximo 10 electrones (Ne). Capa L completa; afinidad electrónica nula.';
  } else if (z >= 11 && z <= 13) {
    // Na, Mg, Al
    maxElectrons = z + 1;
    reason = `Máximo ${maxElectrons} electrones. Metales electropositivos: forman cationes fácilmente pero su anión está limitado a ${z + 1} e⁻.`;
  } else if (z >= 14 && z <= 17) {
    // Si, P, S, Cl: complete Ar octet at 18 electrons
    maxElectrons = 18;
    if (z === 14) reason = 'Máximo 18 electrones (Si⁴⁻, siliciuro con octeto Ar).';
    else if (z === 15) reason = 'Máximo 18 electrones (P³⁻, fosfuro con octeto Ar).';
    else if (z === 16) reason = 'Máximo 18 electrones (S²⁻, sulfuro con octeto Ar).';
    else reason = 'Máximo 18 electrones (Cl⁻, cloruro con octeto Ar).';
  } else if (isNoble) {
    maxElectrons = z;
    reason = `Máximo ${z} electrones. Gas noble con capas cerradas; afinidad electrónica desfavorable.`;
  } else {
    // General heavier elements: Find next noble gas or allow at most Z + 3
    const nextNoble = nobleGasZ.find(nz => nz > z) || 118;
    maxElectrons = Math.min(118, Math.min(nextNoble, z + 3));
    reason = `Máximo ${maxElectrons} electrones (capa de valencia limitada por repulsión interelectrónica y configuración electrónica de gas noble).`;
  }

  const maxAnionCharge = Math.max(0, maxElectrons - z);

  return {
    minElectrons,
    maxElectrons,
    maxAnionCharge,
    maxCationCharge,
    reason
  };
}

// =========================================================================
// BETA DECAY CALCULATION & SPONTANEOUS TRANSMUTATION
// =========================================================================

export interface BetaDecayCheck {
  canDecayBetaMinus: boolean;
  canDecayBetaPlus: boolean;
  excessNeutrons: number;
  excessProtons: number;
  targetZ_Minus: number;
  targetN_Minus: number;
  targetZ_Plus: number;
  targetN_Plus: number;
  equationMinus: string;
  equationPlus: string;
}

export function evaluateBetaDecayConditions(
  z: number, 
  n: number, 
  thresholdX: number = 2
): BetaDecayCheck {
  if (z <= 0) {
    const canDecay = n >= 1;
    return {
      canDecayBetaMinus: canDecay,
      canDecayBetaPlus: false,
      excessNeutrons: n,
      excessProtons: 0,
      targetZ_Minus: 1,
      targetN_Minus: Math.max(0, n - 1),
      targetZ_Plus: 0,
      targetN_Plus: n,
      equationMinus: `^{${n}}_{0}\\text{n} \\xrightarrow{\\beta^-} {}^{${n}}_{1}\\text{H} + e^- + \\bar{\\nu}_e`,
      equationPlus: ''
    };
  }

  const match = VALLEY_STABLE_POINTS.find(p => p.z === z);
  const optimalN = match ? match.optimalN : Math.round(z <= 20 ? z : z * (1.1 + 0.005 * z));
  const minN = match ? match.minN : Math.max(0, optimalN - 1);
  const maxN = match ? match.maxN : optimalN + 1;

  const excessNeutrons = Math.max(0, n - maxN);
  const excessProtons = Math.max(0, minN - n);

  // Beta minus occurs when excess neutrons >= thresholdX, neutron -> proton (Z increases, N decreases)
  const canDecayBetaMinus = excessNeutrons >= thresholdX && z < 118 && n > 0;

  // Beta plus occurs when excess protons >= thresholdX, proton -> neutron (Z decreases, N increases)
  const canDecayBetaPlus = excessProtons >= thresholdX && z > 1;

  const symbolCurr = match?.symbol || `E${z}`;
  const massA = z + n;

  return {
    canDecayBetaMinus,
    canDecayBetaPlus,
    excessNeutrons,
    excessProtons,
    targetZ_Minus: z + 1,
    targetN_Minus: n - 1,
    targetZ_Plus: z - 1,
    targetN_Plus: n + 1,
    equationMinus: `^{${massA}}_{${z}}\\text{${symbolCurr}} \\xrightarrow{\\beta^-} {}^{${massA}}_{${z+1}}\\text{${VALLEY_STABLE_POINTS.find(p => p.z === z+1)?.symbol || 'E'}} + e^- + \\bar{\\nu}_e`,
    equationPlus: `^{${massA}}_{${z}}\\text{${symbolCurr}} \\xrightarrow{\\beta^+} {}^{${massA}}_{${z-1}}\\text{${VALLEY_STABLE_POINTS.find(p => p.z === z-1)?.symbol || 'E'}} + e^+ + \\nu_e`
  };
}

// =========================================================================
// ISÓMEROS NUCLEARES METAESTABLES & EMISIÓN GAMMA PURA (IT)
// =========================================================================

export interface GammaIsomer {
  z: number;
  n: number;
  massA: number;
  symbol: string;
  name: string;
  isomericState: string; // e.g. "99mTc"
  energyKeV: number;
  halfLife: string;
  description: string;
}

export const KNOWN_GAMMA_ISOMERS: GammaIsomer[] = [
  {
    z: 43,
    n: 56,
    massA: 99,
    symbol: 'Tc',
    name: 'Tecnecio-99m',
    isomericState: '^{99\\text{m}}_{43}\\text{Tc}',
    energyKeV: 140.5,
    halfLife: '6.01 h',
    description: 'El radioisótopo gamma por excelencia en medicina nuclear (gammagrafías SPECT). Decae exclusivamente mediante transición isomérica (IT) emitiendo un fotón gamma monoenergético de 140.5 keV sin alterar Z ni N.'
  },
  {
    z: 56,
    n: 81,
    massA: 137,
    symbol: 'Ba',
    name: 'Bario-137m',
    isomericState: '^{137\\text{m}}_{56}\\text{Ba}',
    energyKeV: 661.7,
    halfLife: '2.55 min',
    description: 'Estado metaestable resultante del decaimiento beta de Cs-137. Se desexcita puramente por emisión de un fotón gamma de 661.7 keV alcanzando el estado fundamental de Ba-137.'
  },
  {
    z: 27,
    n: 33,
    massA: 60,
    symbol: 'Co',
    name: 'Cobalto-60m',
    isomericState: '^{60\\text{m}}_{27}\\text{Co}',
    energyKeV: 58.6,
    halfLife: '10.5 min',
    description: 'Isómero nuclear metaestable de cobalto que experimenta transición isomérica pura (IT) emitiendo fotón gamma hacia el estado fundamental de Cobalto-60.'
  },
  {
    z: 36,
    n: 47,
    massA: 83,
    symbol: 'Kr',
    name: 'Kriptón-83m',
    isomericState: '^{83\\text{m}}_{36}\\text{Kr}',
    energyKeV: 41.5,
    halfLife: '1.83 h',
    description: 'Isómero de gas noble utilizado en calibración de detectores de materia oscura y resonancia magnética pulmonar; emite rayos gamma de baja energía.'
  },
  {
    z: 49,
    n: 64,
    massA: 113,
    symbol: 'In',
    name: 'Indio-113m',
    isomericState: '^{113\\text{m}}_{49}\\text{In}',
    energyKeV: 391.7,
    halfLife: '99.5 min',
    description: 'Hijo del generador Sn-113/In-113m en radiodiagnóstico; emite fotones gamma de 391.7 keV en su desexcitación isomérica.'
  },
  {
    z: 82,
    n: 125,
    massA: 207,
    symbol: 'Pb',
    name: 'Plomo-207m',
    isomericState: '^{207\\text{m}}_{82}\\text{Pb}',
    energyKeV: 1063.6,
    halfLife: '0.80 s',
    description: 'Estado metaestable de alta energía del plomo; su desexcitación libera un potente fotón gamma de más de 1 MeV.'
  },
  {
    z: 47,
    n: 63,
    massA: 110,
    symbol: 'Ag',
    name: 'Plata-110m',
    isomericState: '^{110\\text{m}}_{47}\\text{Ag}',
    energyKeV: 657.8,
    halfLife: '249.8 d',
    description: 'Isómero nuclear de plata de largo período producido por captura neutrónica; decae mediante cascada gamma hacia Ag-110.'
  }
];

// =========================================================================
// LÓGICA DE TRANSICIÓN AUTOMÁTICA Y FACTIBILIDAD ENERGÉTICA DECAY
// =========================================================================

export interface AutoDecayStep {
  isStable: boolean;
  decayType: 'none' | 'alpha' | 'beta_minus' | 'beta_plus' | 'gamma' | 'proton' | 'neutron';
  targetZ: number;
  targetN: number;
  energyMev?: number;
  qValueStr?: string;
  reason: string;
  equation: string;
  isomericState?: GammaIsomer;
}

/**
 * Evalúa si un isótopo es inestable y si su desintegración alfa, beta o gamma es energéticamente factible.
 * Realiza el cálculo del siguiente escalón de transición sin forzar decaimiento si las condiciones no lo respaldan.
 * La emisión gamma tiene lógica propia independiente y se aplica exclusivamente a isótopos metaestables/gamma.
 */
export function evaluateAutomaticDecayStep(
  z: number,
  n: number,
  isMetastable: boolean = false
): AutoDecayStep {
  // 1. LÓGICA DE EMISIÓN GAMMA INDEPENDIENTE
  // Solo se aplica si el isótopo es un isómero gamma específico o si se activa el estado metaestable
  const gammaIsomer = KNOWN_GAMMA_ISOMERS.find(iso => iso.z === z && iso.n === n);
  if (isMetastable || gammaIsomer) {
    const isomer = gammaIsomer || {
      z,
      n,
      massA: z + n,
      symbol: VALLEY_STABLE_POINTS.find(p => p.z === z)?.symbol || `E${z}`,
      name: `Isómero E${z}-${z + n}m`,
      isomericState: `^{${z + n}\\text{m}}_{${z}}\\text{${VALLEY_STABLE_POINTS.find(p => p.z === z)?.symbol || 'E'}}`,
      energyKeV: 140.5,
      halfLife: 'Estado metaestable excitado',
      description: 'Desexcitación nuclear isomérica pura mediante fotón gamma sin alteración de protones ni neutrones (ΔZ = 0, ΔN = 0).'
    };

    const sym = isomer.symbol;
    const a = z + n;
    return {
      isStable: false,
      decayType: 'gamma',
      targetZ: z, // El número atómico Z no cambia
      targetN: n, // El número de neutrones N no cambia
      energyMev: isomer.energyKeV / 1000,
      qValueStr: `${(isomer.energyKeV / 1000).toFixed(3)} MeV (${isomer.energyKeV} keV)`,
      reason: `Isómero metaestable específico (${isomer.name}). Desexcitación por emisión gamma pura (IT): transición electromagnética sin alteración de nucleones (ΔZ = 0, ΔN = 0).`,
      equation: `^{${a}\\text{m}}_{${z}}\\text{${sym}} \\xrightarrow{\\gamma} {}^{${a}}_{${z}}\\text{${sym}} + \\gamma (${isomer.energyKeV}\\text{ keV})`,
      isomericState: isomer
    };
  }

  // 2. CASO ESPECIAL: Neutrón libre (Z = 0)
  if (z === 0) {
    if (n >= 2) {
      return {
        isStable: false,
        decayType: 'neutron',
        targetZ: 0,
        targetN: n - 1,
        energyMev: 0.50,
        qValueStr: '0.50 MeV',
        reason: 'Cúmulo de neutrones libres no ligados (dineutrón/polineutrón). La ausencia de protones impide el confinamiento por fuerza fuerte y expulsa un neutrón libre de inmediato.',
        equation: `^{${n}}_{0}\\text{n} \\xrightarrow{n} {}^{${n - 1}}_{0}\\text{n} + {}^{1}_{0}\\text{n}`
      };
    }
    if (n === 1) {
      return {
        isStable: false,
        decayType: 'beta_minus',
        targetZ: 1,
        targetN: 0,
        energyMev: 0.782,
        qValueStr: '0.78 MeV',
        reason: 'El neutrón libre no ligado es inestable (t½ ≈ 879 s). Decae espontáneamente mediante interacción débil (β⁻) transformándose en protón (¹H), electrón y antineutrino.',
        equation: `^{1}_{0}\\text{n} \\xrightarrow{\\beta^-} {}^{1}_{1}\\text{H} + e^- + \\bar{\\nu}_e`
      };
    }
    return {
      isStable: true,
      decayType: 'none',
      targetZ: 0,
      targetN: 0,
      reason: 'Sin nucleones presentes.',
      equation: ''
    };
  }

  // 3. CASO ESPECIAL: Berilio-8 (⁸Be, Z=4, N=4) -> escisión alfa casi instantánea
  if (z === 4 && n === 4) {
    return {
      isStable: false,
      decayType: 'alpha',
      targetZ: 2,
      targetN: 2,
      energyMev: 0.092,
      qValueStr: '0.092 MeV',
      reason: 'El núcleo de Berilio-8 (⁸Be) es extremadamente inestable por tensión cuántica y decae en 10⁻¹⁶ s en dos partículas alfa ligadas (⁴He).',
      equation: '^{8}_{4}\\text{Be} \\xrightarrow{\\alpha} {}^{4}_{2}\\alpha + {}^{4}_{2}\\text{He} + 0.092\\text{ MeV}'
    };
  }

  // 3b. CASOS ESPECIALES DE RESONANCIAS POR EMISIÓN DE PROTÓN (Línea de Goteo Protónica)
  // ej. Helio-2 (diprotón Z=2, N=0), Litio-5 (⁵Li, Z=3, N=2), Boro-9 (⁹B, Z=5, N=4)
  if (z >= 2 && n === 0) {
    return {
      isStable: false,
      decayType: 'proton',
      targetZ: z - 1,
      targetN: 0,
      energyMev: 1.40,
      qValueStr: '1.40 MeV',
      reason: `Cúmulo de protones puros sin neutrones de amortiguamiento cuántico (ej. diprotón ²He). La repulsión coulombiana desintegra el núcleo expulsando un protón espontáneamente.`,
      equation: `^{${z}}_{${z}}\\text{E} \\xrightarrow{p} {}^{${z - 1}}_{${z - 1}}\\text{E} + {}^{1}_{1}\\text{p}`
    };
  }
  if (z === 3 && n === 2) {
    // Litio-5 (5Li -> 4He + p)
    return {
      isStable: false,
      decayType: 'proton',
      targetZ: 2,
      targetN: 2,
      energyMev: 1.96,
      qValueStr: '1.96 MeV',
      reason: 'El Litio-5 (⁵Li) es un estado cuántico resonante no ligado (t½ ≈ 10⁻²¹ s); expulsa instantáneamente un protón libre decayendo al núcleo mágico extremadamente ligado ⁴He.',
      equation: '^{5}_{3}\\text{Li} \\xrightarrow{p} {}^{4}_{2}\\text{He} + {}^{1}_{1}\\text{p} + 1.96\\text{ MeV}'
    };
  }
  if (z === 5 && n === 4) {
    // Boro-9 (9B -> 8Be + p)
    return {
      isStable: false,
      decayType: 'proton',
      targetZ: 4,
      targetN: 4,
      energyMev: 0.19,
      qValueStr: '0.19 MeV',
      reason: 'El Boro-9 (⁹B) carece de estado fundamental ligado y expulsa un protón espontáneamente hacia Berilio-8.',
      equation: '^{9}_{5}\\text{B} \\xrightarrow{p} {}^{8}_{4}\\text{Be} + {}^{1}_{1}\\text{p} + 0.19\\text{ MeV}'
    };
  }

  // 3c. CASOS ESPECIALES DE RESONANCIAS POR EMISIÓN DE NEUTRÓN (Línea de Goteo Neutrónica)
  // ej. Helio-5 (⁵He, Z=2, N=3), Hidrógeno-4/5 (⁴H, Z=1, N=3), Berilio-13 (¹³Be, Z=4, N=9)
  if (z === 2 && n === 3) {
    // Helio-5 (5He -> 4He + n)
    return {
      isStable: false,
      decayType: 'neutron',
      targetZ: 2,
      targetN: 2,
      energyMev: 0.89,
      qValueStr: '0.89 MeV',
      reason: 'El Helio-5 (⁵He) no tiene estado ligado (t½ ≈ 7×10⁻²² s) y expulsa de inmediato un neutrón libre para formar Helio-4 (partícula alfa).',
      equation: '^{5}_{2}\\text{He} \\xrightarrow{n} {}^{4}_{2}\\text{He} + {}^{1}_{0}\\text{n} + 0.89\\text{ MeV}'
    };
  }
  if (z === 1 && n >= 3) {
    return {
      isStable: false,
      decayType: 'neutron',
      targetZ: 1,
      targetN: n - 1,
      energyMev: 1.60,
      qValueStr: '1.60 MeV',
      reason: `Isótopo de hidrógeno superpesado (A=${1+n}) situado más allá de la línea de goteo de neutrones; decae de inmediato emitiendo un neutrón.`,
      equation: `^{${1+n}}_{1}\\text{H} \\xrightarrow{n} {}^{${n}}_{1}\\text{H} + {}^{1}_{0}\\text{n}`
    };
  }
  if (z === 4 && n >= 9) {
    return {
      isStable: false,
      decayType: 'neutron',
      targetZ: 4,
      targetN: n - 1,
      energyMev: 0.51,
      qValueStr: '0.51 MeV',
      reason: 'El Berilio-13 (¹³Be) no posee estado ligado y decae instantáneamente por emisión de neutrón hacia Berilio-12.',
      equation: `^{${4+n}}_{4}\\text{Be} \\xrightarrow{n} {}^{${3+n}}_{4}\\text{Be} + {}^{1}_{0}\\text{n}`
    };
  }

  const match = VALLEY_STABLE_POINTS.find(p => p.z === z);
  const optimalN = match ? match.optimalN : Math.round(z <= 20 ? z : z * (1.1 + 0.005 * z));
  const minN = match ? match.minN : Math.max(0, optimalN - 1);
  const maxN = match ? match.maxN : optimalN + 1;
  const currSym = match?.symbol || `E${z}`;
  const massA = z + n;

  // 4. FACTIBILIDAD ENERGÉTICA DE DESINTEGRACIÓN ALFA (α)
  // Ocurre predominantemente en elementos pesados (Z >= 84 e.g. Po, Rn, Ra, Th, U, Pu) o A >= 210,
  // donde la repulsión coulombiana vence la fuerza fuerte y Q_alpha > 0.
  const calcBE = (A: number, Z: number) => {
    if (A <= 0 || Z < 0) return 0;
    if (A === 4 && Z === 2) return 28.3;
    if (A === 1) return 0;
    const av = 15.67, as = 17.23, ac = 0.714, aa = 23.2;
    return av * A - as * Math.pow(A, 2/3) - ac * (Z * (Z - 1)) / Math.cbrt(A) - aa * Math.pow(A - 2 * Z, 2) / A;
  };
  const qAlphaCalc = calcBE(massA - 4, z - 2) + 28.3 - calcBE(massA, z);
  const isAlphaHeavy = (z >= 84 && z <= 118) || (z === 83 && n <= 126) || (z >= 82 && massA >= 210);
  const isAlphaEnergeticallyFeasible = (qAlphaCalc > 0 && isAlphaHeavy) || (z >= 84 && z <= 118);

  const excessN = n - maxN;
  const excessP = minN - n;

  // En la región de actínidos y transuránicos (Z >= 84), la emisión alfa es el canal primario a menos que haya un exceso extremo de neutrones
  if (isAlphaEnergeticallyFeasible && (excessN <= 3 || z >= 90)) {
    const targetZ = Math.max(0, z - 2);
    const targetN = Math.max(0, n - 2);
    const dSym = VALLEY_STABLE_POINTS.find(p => p.z === targetZ)?.symbol || `E${targetZ}`;
    const qAlphaVal = qAlphaCalc > 0 ? qAlphaCalc.toFixed(2) : (4.3 + (z - 84) * 0.15).toFixed(2);

    return {
      isStable: false,
      decayType: 'alpha',
      targetZ,
      targetN,
      energyMev: parseFloat(qAlphaVal),
      qValueStr: `${qAlphaVal} MeV`,
      reason: `Isótopo pesado inestable (Z=${z}, A=${massA}). La desintegración alfa es energéticamente factible (Q_α = ${qAlphaVal} MeV > 0). El núcleo expulsa una partícula alfa ⁴₂He²⁺ por efecto túnel de Gamow.`,
      equation: `^{${massA}}_{${z}}\\text{${currSym}} \\xrightarrow{\\alpha} {}^{${massA - 4}}_{${targetZ}}\\text{${dSym}} + {}^{4}_{2}\\alpha + ${qAlphaVal}\\text{ MeV}`
    };
  }

  // 5. FACTIBILIDAD ENERGÉTICA DE DESINTEGRACIÓN BETA MENOS (β⁻)
  // Núcleo rico en neutrones: N > N_max
  if (excessN > 0 && z < 118 && n > 0) {
    const targetZ = z + 1;
    const targetN = n - 1;
    const dSym = VALLEY_STABLE_POINTS.find(p => p.z === targetZ)?.symbol || `E${targetZ}`;
    const qBetaVal = (0.5 + Math.min(6, excessN * 0.75)).toFixed(2);
    return {
      isStable: false,
      decayType: 'beta_minus',
      targetZ,
      targetN,
      energyMev: parseFloat(qBetaVal),
      qValueStr: `${qBetaVal} MeV`,
      reason: `Isótopo rico en neutrones (N=${n} > N_max=${maxN}). La desintegración beta menos (β⁻) es energéticamente factible: un neutrón transmuta en protón (n → p + e⁻ + ν̄ₑ).`,
      equation: `^{${massA}}_{${z}}\\text{${currSym}} \\xrightarrow{\\beta^-} {}^{${massA}}_{${targetZ}}\\text{${dSym}} + e^- + \\bar{\\nu}_e`
    };
  }

  // 6. FACTIBILIDAD ENERGÉTICA DE DESINTEGRACIÓN BETA MÁS (β⁺) / CAPTURA ELECTRÓNICA
  // Núcleo rico en protones: N < N_min
  if (excessP > 0 && z > 1) {
    const targetZ = z - 1;
    const targetN = n + 1;
    const dSym = targetZ === 0 ? 'n' : (VALLEY_STABLE_POINTS.find(p => p.z === targetZ)?.symbol || `E${targetZ}`);
    const qBetaPlusVal = (0.6 + Math.min(5, excessP * 0.65)).toFixed(2);
    return {
      isStable: false,
      decayType: 'beta_plus',
      targetZ,
      targetN,
      energyMev: parseFloat(qBetaPlusVal),
      qValueStr: `${qBetaPlusVal} MeV`,
      reason: `Isótopo rico en protones (N=${n} < N_min=${minN}). La desintegración beta más (β⁺) / captura K es energéticamente factible: un protón transmuta en neutrón (p → n + e⁺ + νₑ).`,
      equation: `^{${massA}}_{${z}}\\text{${currSym}} \\xrightarrow{\\beta^+} {}^{${massA}}_{${targetZ}}\\text{${dSym}} + e^+ + \\nu_e`
    };
  }

  // 7. ELEMENTOS SIN ISÓTOPOS ESTABLES (Tecnecio Z=43, Prometio Z=61)
  if (z === 43) {
    if (n >= 56) {
      return {
        isStable: false,
        decayType: 'beta_minus',
        targetZ: 44,
        targetN: n - 1,
        energyMev: 0.294,
        qValueStr: '0.29 MeV',
        reason: 'El Tecnecio (Z=43) carece de isótopos estables en la naturaleza. Este isótopo decae por emisión beta menos hacia Rutenio-99.',
        equation: `^{${massA}}_{43}\\text{Tc} \\xrightarrow{\\beta^-} {}^{${massA}}_{44}\\text{Ru} + e^- + \\bar{\\nu}_e`
      };
    } else {
      return {
        isStable: false,
        decayType: 'beta_plus',
        targetZ: 42,
        targetN: n + 1,
        energyMev: 0.85,
        qValueStr: '0.85 MeV',
        reason: 'El Tecnecio no posee isótopos estables. Decae por captura electrónica hacia Molibdeno.',
        equation: `^{${massA}}_{43}\\text{Tc} \\xrightarrow{\\beta^+} {}^{${massA}}_{42}\\text{Mo} + e^+ + \\nu_e`
      };
    }
  }

  // 8. ISÓTOPO ESTABLE EN EL VALLE DE ESTABILIDAD
  // "No fuerces ningún decaimiento si las condiciones no lo respaldan."
  return {
    isStable: true,
    decayType: 'none',
    targetZ: z,
    targetN: n,
    reason: `Isótopo estable situado en el fondo del Valle de Estabilidad nuclear. Las condiciones energéticas no respaldan ningún decaimiento espontáneo; el núcleo permanece en equilibrio cuántico.`,
    equation: `^{${massA}}_{${z}}\\text{${currSym}} \\quad [\\text{Estado Fundamental Estable}]`
  };
}

// =========================================================================
// EVALUACIÓN INTEGRAL DE CANALES DE DECAIMIENTO (ALFA, BETA-, BETA+, GAMMA)
// Permite habilitar o deshabilitar cada botón de forma físicamente fidedigna.
// =========================================================================

export interface DecayChannelDetail {
  canDecay: boolean;
  reason: string;
  targetZ: number;
  targetN: number;
  targetA: number;
  targetSymbol: string;
  targetName?: string;
  qValueStr: string;
  equation: string;
}

export interface DecayChannelsReport {
  isStable: boolean;
  alpha: DecayChannelDetail;
  betaMinus: DecayChannelDetail;
  betaPlus: DecayChannelDetail;
  gamma: DecayChannelDetail & {
    isMetastable: boolean;
    energyKeV: number;
    isomerName?: string;
  };
  protonEmission: DecayChannelDetail;
  neutronEmission: DecayChannelDetail;
}

export function evaluateDecayChannels(
  z: number,
  n: number,
  isMetastable: boolean = false
): DecayChannelsReport {
  const match = VALLEY_STABLE_POINTS.find(p => p.z === z);
  const optimalN = match ? match.optimalN : Math.round(z <= 20 ? z : z * (1.1 + 0.005 * z));
  const minN = match ? match.minN : Math.max(0, optimalN - 1);
  const maxN = match ? match.maxN : optimalN + 1;
  const massA = z + n;
  const currSym = match?.symbol || (z === 0 ? 'n' : `E${z}`);

  // 1. EVALUAR CANAL ALFA (α)
  let alphaCan = false;
  let alphaReason = '';
  let alphaTargetZ = Math.max(0, z - 2);
  let alphaTargetN = Math.max(0, n - 2);
  let alphaTargetA = Math.max(0, massA - 4);
  let alphaTargetSym = VALLEY_STABLE_POINTS.find(p => p.z === alphaTargetZ)?.symbol || (alphaTargetZ === 0 ? 'n' : `E${alphaTargetZ}`);
  let alphaQ = '0.00 MeV';
  let alphaEq = '';

  if (z < 2 || n < 2) {
    alphaCan = false;
    alphaReason = 'Imposible: Se requieren al menos 2 protones y 2 neutrones para formar una partícula alfa (⁴₂He²⁺).';
  } else if (z === 4 && n === 4) {
    // Be-8
    alphaCan = true;
    alphaTargetZ = 2;
    alphaTargetN = 2;
    alphaTargetA = 4;
    alphaTargetSym = 'He';
    alphaQ = '0.092 MeV';
    alphaReason = 'El Berilio-8 (⁸Be) es un estado cuántico altamente inestable (t½ ≈ 10⁻¹⁶ s) que sufre escisión alfa instantánea en dos núcleos de Helio-4 (⁴₂He).';
    alphaEq = '^{8}_{4}\\text{Be} \\xrightarrow{\\alpha} 2\\,{}^{4}_{2}\\alpha + 0.092\\text{ MeV}';
  } else {
    // Bethe-Weizsäcker binding energy calculation
    const calcBE = (A: number, Z: number) => {
      if (A <= 0 || Z < 0) return 0;
      if (A === 4 && Z === 2) return 28.3;
      if (A === 1) return 0;
      const av = 15.67, as = 17.23, ac = 0.714, aa = 23.2;
      return av * A - as * Math.pow(A, 2/3) - ac * (Z * (Z - 1)) / Math.cbrt(A) - aa * Math.pow(A - 2 * Z, 2) / A;
    };
    const qAlphaCalc = calcBE(massA - 4, z - 2) + 28.3 - calcBE(massA, z);
    const isTransBismuth = z >= 84;
    const isBismuth = z === 83;
    const isHeavyAlpha = z >= 60 && massA >= 142 && qAlphaCalc > 0 && (n < minN || n > maxN + 3 || z >= 78);

    if (isTransBismuth || isBismuth || isHeavyAlpha) {
      alphaCan = true;
      const qVal = qAlphaCalc > 0 ? qAlphaCalc.toFixed(2) : (4.3 + (z - 84) * 0.15).toFixed(2);
      alphaQ = `${qVal} MeV`;
      alphaReason = `Isótopo pesado con canal alfa abierto (Q_α = ${qVal} MeV > 0). El núcleo supera la barrera de Coulomb mediante efecto túnel de Gamow y expulsa ⁴₂He²⁺.`;
      alphaEq = `^{${massA}}_{${z}}\\text{${currSym}} \\xrightarrow{\\alpha} {}^{${alphaTargetA}}_{${alphaTargetZ}}\\text{${alphaTargetSym}} + {}^{4}_{2}\\alpha + ${alphaQ}`;
    } else {
      alphaCan = false;
      alphaReason = massA < 140
        ? `Bloqueado: Q_α < 0 en núcleos ligeros y medios. La barrera coulómbica y la energía de enlace impiden la emisión alfa espontánea.`
        : `Bloqueado: El balance energético nuclear Q_α no respalda emisión alfa espontánea en este estado.`;
    }
  }

  const alphaDetail: DecayChannelDetail = {
    canDecay: alphaCan,
    reason: alphaReason,
    targetZ: alphaTargetZ,
    targetN: alphaTargetN,
    targetA: alphaTargetA,
    targetSymbol: alphaTargetSym,
    targetName: VALLEY_STABLE_POINTS.find(p => p.z === alphaTargetZ)?.symbol,
    qValueStr: alphaQ,
    equation: alphaEq || `^{${massA}}_{${z}}\\text{${currSym}} \\xrightarrow{\\alpha} {}^{${alphaTargetA}}_{${alphaTargetZ}}\\text{${alphaTargetSym}} + {}^{4}_{2}\\alpha`
  };

  // 2. EVALUAR CANAL BETA MENOS (β⁻)
  let betaMinusCan = false;
  let betaMinusReason = '';
  let betaMinusTargetZ = z + 1;
  let betaMinusTargetN = Math.max(0, n - 1);
  let betaMinusTargetSym = VALLEY_STABLE_POINTS.find(p => p.z === betaMinusTargetZ)?.symbol || `E${betaMinusTargetZ}`;
  let betaMinusQ = '0.00 MeV';

  if (z === 0 && n >= 1) {
    betaMinusCan = true;
    betaMinusTargetZ = 1;
    betaMinusTargetN = n - 1;
    betaMinusTargetSym = 'H';
    betaMinusQ = '0.78 MeV';
    betaMinusReason = 'El neutrón libre transmuta por interacción débil (t½ ≈ 879 s): un quark d se convierte en u emitiendo un bosón W⁻ (n → p + e⁻ + ν̄ₑ).';
  } else if ((n > maxN && z < 118 && n > 0) || (z === 43 && n >= 56) || (z === 61)) {
    betaMinusCan = true;
    const excess = Math.max(1, n - maxN);
    const qBeta = (0.5 + Math.min(6, excess * 0.75)).toFixed(2);
    betaMinusQ = `${qBeta} MeV`;
    betaMinusReason = `Exceso de neutrones sobre el Valle de Estabilidad (N=${n} > N_max=${maxN}). Transmutación débil espontánea de neutrón a protón (n → p + e⁻ + ν̄ₑ).`;
  } else {
    betaMinusCan = false;
    betaMinusReason = `Bloqueado: No hay exceso de neutrones (N=${n} ≤ N_max=${maxN}). Las condiciones cuánticas no permiten emisión β⁻.`;
  }

  const betaMinusDetail: DecayChannelDetail = {
    canDecay: betaMinusCan,
    reason: betaMinusReason,
    targetZ: betaMinusTargetZ,
    targetN: betaMinusTargetN,
    targetA: massA,
    targetSymbol: betaMinusTargetSym,
    qValueStr: betaMinusQ,
    equation: `^{${massA}}_{${z}}\\text{${currSym}} \\xrightarrow{\\beta^-} {}^{${massA}}_{${betaMinusTargetZ}}\\text{${betaMinusTargetSym}} + e^- + \\bar{\\nu}_e`
  };

  // 3. EVALUAR CANAL BETA MÁS (β⁺) / CAPTURA ELECTRÓNICA
  let betaPlusCan = false;
  let betaPlusReason = '';
  let betaPlusTargetZ = Math.max(0, z - 1);
  let betaPlusTargetN = n + 1;
  let betaPlusTargetSym = betaPlusTargetZ === 0 ? 'n' : (VALLEY_STABLE_POINTS.find(p => p.z === betaPlusTargetZ)?.symbol || `E${betaPlusTargetZ}`);
  let betaPlusQ = '0.00 MeV';

  if ((n < minN && z > 1) || (z === 43 && n < 56)) {
    betaPlusCan = true;
    const excess = Math.max(1, minN - n);
    const qVal = (0.6 + Math.min(5, excess * 0.65)).toFixed(2);
    betaPlusQ = `${qVal} MeV`;
    betaPlusReason = `Déficit de neutrones / exceso de protones (N=${n} < N_min=${minN}). Transmutación débil de protón a neutrón emitiendo un positrón (p → n + e⁺ + νₑ).`;
  } else {
    betaPlusCan = false;
    betaPlusReason = z <= 1 
      ? 'Bloqueado: Z ≤ 1 no puede experimentar decaimiento beta más.'
      : `Bloqueado: No hay déficit de neutrones (N=${n} ≥ N_min=${minN}). El núcleo no emite positrones.`;
  }

  const betaPlusDetail: DecayChannelDetail = {
    canDecay: betaPlusCan,
    reason: betaPlusReason,
    targetZ: betaPlusTargetZ,
    targetN: betaPlusTargetN,
    targetA: massA,
    targetSymbol: betaPlusTargetSym,
    qValueStr: betaPlusQ,
    equation: `^{${massA}}_{${z}}\\text{${currSym}} \\xrightarrow{\\beta^+} {}^{${massA}}_{${betaPlusTargetZ}}\\text{${betaPlusTargetSym}} + e^+ + \\nu_e`
  };

  // 4. EVALUAR CANAL GAMMA (γ)
  const knownIsomer = KNOWN_GAMMA_ISOMERS.find(iso => iso.z === z && iso.n === n);
  const isGammaActive = isMetastable || !!knownIsomer;
  const energyKeV = knownIsomer?.energyKeV ?? 140.5;
  const isomerName = knownIsomer?.name || (isMetastable ? `Isómero ${currSym}-${massA}m` : undefined);

  const gammaReason = isGammaActive
    ? (knownIsomer 
        ? `Isómero metaestable activo: ${knownIsomer.name} (${knownIsomer.halfLife}). Desexcitación puramente electromagnética por fotón gamma (IT, ΔZ=0, ΔN=0).`
        : `Estado cuántico excitado metaestable (*m) activo. Desexcitación radiativa gamma directa hacia el estado fundamental (ΔZ=0, ΔN=0).`)
    : `Bloqueado: El núcleo está en su estado fundamental. La emisión gamma pura requiere un estado metaestable (*m) o isómero (ej. Tc-99m, Ba-137m). Pulsa 'Excitar (*m)' para activarlo.`;

  const gammaDetail = {
    canDecay: isGammaActive,
    reason: gammaReason,
    targetZ: z,
    targetN: n,
    targetA: massA,
    targetSymbol: currSym,
    qValueStr: `${energyKeV} keV`,
    isMetastable: isGammaActive,
    energyKeV,
    isomerName,
    equation: `^{${massA}\\text{m}}_{${z}}\\text{${currSym}} \\xrightarrow{\\gamma} {}^{${massA}}_{${z}}\\text{${currSym}} + \\gamma (${energyKeV}\\text{ keV})`
  };

  // 5. EVALUAR CANAL EMISIÓN DE PROTÓN (p / Decaimiento de Protón)
  let protonCan = false;
  let protonReason = '';
  let protonTargetZ = Math.max(0, z - 1);
  let protonTargetN = n;
  let protonTargetA = Math.max(0, massA - 1);
  let protonTargetSym = protonTargetZ === 0 ? 'n' : (VALLEY_STABLE_POINTS.find(p => p.z === protonTargetZ)?.symbol || `E${protonTargetZ}`);
  let protonQ = '0.00 MeV';

  if (z <= 0) {
    protonCan = false;
    protonReason = 'Imposible: El núcleo no contiene protones para emitir.';
  } else if (z >= 2 && n === 0) {
    // Diproton or multi-proton unbound cluster
    protonCan = true;
    protonQ = '1.40 MeV';
    protonReason = 'Cúmulo de protones puros sin neutrones de amortiguamiento (ej. Helio-2 / diprotón). La repulsión de Coulomb es infinita y expulsa un protón espontáneamente.';
  } else if (z === 3 && n === 2) {
    // Litio-5 (5Li -> 4He + p)
    protonCan = true;
    protonQ = '1.96 MeV';
    protonReason = 'El Litio-5 (⁵Li) es una resonancia nuclear no ligada (t½ ≈ 10⁻²¹ s) que sufre emisión de protón instantánea transmutando en Helio-4.';
  } else if (z === 5 && n === 4) {
    // Boro-9 (9B -> 8Be + p)
    protonCan = true;
    protonQ = '0.19 MeV';
    protonReason = 'El Boro-9 (⁹B) no posee estado ligado y decae instantáneamente por emisión de protón hacia Berilio-8.';
  } else {
    // Cálculo de energía de separación protónica Sp = B(A, Z) - B(A-1, Z-1)
    const calcBE = (A: number, Z: number) => {
      if (A <= 0 || Z < 0) return 0;
      if (A === 4 && Z === 2) return 28.3;
      if (A === 1) return 0;
      const av = 15.67, as = 17.23, ac = 0.714, aa = 23.2;
      return av * A - as * Math.pow(A, 2/3) - ac * (Z * (Z - 1)) / Math.cbrt(A) - aa * Math.pow(A - 2 * Z, 2) / A;
    };
    const sProton = calcBE(massA, z) - calcBE(massA - 1, z - 1);
    const isBeyondProtonDrip = sProton <= 0 || (n <= minN - 3 && z >= 4);

    if (isBeyondProtonDrip) {
      protonCan = true;
      const qVal = Math.max(0.25, -sProton).toFixed(2);
      protonQ = `${qVal} MeV`;
      protonReason = `Isótopo situado más allá de la línea de goteo de protones (S_p = ${(-sProton).toFixed(2)} MeV < 0). El protón supera el pozo cuántico y es expulsado espontáneamente.`;
    } else {
      protonCan = false;
      protonReason = `Bloqueado: La energía de separación protónica es positiva (S_p = ${sProton.toFixed(2)} MeV > 0). El protón está firmemente ligado por la fuerza nuclear fuerte.`;
    }
  }

  const protonEmissionDetail: DecayChannelDetail = {
    canDecay: protonCan,
    reason: protonReason,
    targetZ: protonTargetZ,
    targetN: protonTargetN,
    targetA: protonTargetA,
    targetSymbol: protonTargetSym,
    qValueStr: protonQ,
    equation: `^{${massA}}_{${z}}\\text{${currSym}} \\xrightarrow{p} {}^{${protonTargetA}}_{${protonTargetZ}}\\text{${protonTargetSym}} + {}^{1}_{1}\\text{p}`
  };

  // 6. EVALUAR CANAL EMISIÓN DE NEUTRÓN (n / Decaimiento de Neutrón)
  let neutronCan = false;
  let neutronReason = '';
  let neutronTargetZ = z;
  let neutronTargetN = Math.max(0, n - 1);
  let neutronTargetA = Math.max(0, massA - 1);
  let neutronTargetSym = currSym;
  let neutronQ = '0.00 MeV';

  if (n <= 0) {
    neutronCan = false;
    neutronReason = 'Imposible: El núcleo no contiene neutrones para emitir.';
  } else if (z === 0 && n >= 2) {
    // Pure multi-neutron cluster (dineutron, tetraneutron)
    neutronCan = true;
    neutronQ = '0.50 MeV';
    neutronReason = 'Cúmulo de neutrones puros sin ligadura nuclear fuerte estable. Expulsa un neutrón libre inmediatamente.';
  } else if (z === 2 && n === 3) {
    // Helio-5 (5He -> 4He + n)
    neutronCan = true;
    neutronQ = '0.89 MeV';
    neutronReason = 'El Helio-5 (⁵He) es un resonador cuántico no ligado (t½ ≈ 7×10⁻²² s) que expulsa espontáneamente un neutrón pasando al núcleo alfa ⁴He.';
  } else if (z === 1 && n >= 3) {
    // Hidrógeno-4, 5 (4H -> 3H + n)
    neutronCan = true;
    neutronQ = '1.60 MeV';
    neutronReason = 'Isótopo de hidrógeno superpesado más allá de la línea de goteo de neutrones; decae por emisión de neutrón.';
  } else if (z === 4 && n >= 9) {
    // Berilio-13 (13Be -> 12Be + n)
    neutronCan = true;
    neutronQ = '0.51 MeV';
    neutronReason = 'El Berilio-13 no posee estado ligado y expulsa un neutrón hacia Berilio-12.';
  } else {
    // Cálculo de energía de separación neutrónica Sn = B(A, Z) - B(A-1, Z)
    const calcBE = (A: number, Z: number) => {
      if (A <= 0 || Z < 0) return 0;
      if (A === 4 && Z === 2) return 28.3;
      if (A === 1) return 0;
      const av = 15.67, as = 17.23, ac = 0.714, aa = 23.2;
      return av * A - as * Math.pow(A, 2/3) - ac * (Z * (Z - 1)) / Math.cbrt(A) - aa * Math.pow(A - 2 * Z, 2) / A;
    };
    const sNeutron = calcBE(massA, z) - calcBE(massA - 1, z);
    const isBeyondNeutronDrip = sNeutron <= 0 || (n >= maxN + 5 && z >= 1);

    if (isBeyondNeutronDrip) {
      neutronCan = true;
      const qVal = Math.max(0.2, -sNeutron).toFixed(2);
      neutronQ = `${qVal} MeV`;
      neutronReason = `Isótopo situado más allá de la línea de goteo de neutrones (S_n = ${(-sNeutron).toFixed(2)} MeV < 0). El neutrón carece de estado ligado en el pozo nuclear y es emitido espontáneamente.`;
    } else {
      neutronCan = false;
      neutronReason = `Bloqueado: La energía de separación neutrónica es positiva (S_n = ${sNeutron.toFixed(2)} MeV > 0). El neutrón está cuánticamente ligado en el pozo de potencial.`;
    }
  }

  const neutronEmissionDetail: DecayChannelDetail = {
    canDecay: neutronCan,
    reason: neutronReason,
    targetZ: neutronTargetZ,
    targetN: neutronTargetN,
    targetA: neutronTargetA,
    targetSymbol: neutronTargetSym,
    qValueStr: neutronQ,
    equation: `^{${massA}}_{${z}}\\text{${currSym}} \\xrightarrow{n} {}^{${neutronTargetA}}_{${neutronTargetZ}}\\text{${neutronTargetSym}} + {}^{1}_{0}\\text{n}`
  };

  const isStable = !alphaCan && !betaMinusCan && !betaPlusCan && !protonCan && !neutronCan && (!isMetastable && !knownIsomer);

  return {
    isStable,
    alpha: alphaDetail,
    betaMinus: betaMinusDetail,
    betaPlus: betaPlusDetail,
    gamma: gammaDetail,
    protonEmission: protonEmissionDetail,
    neutronEmission: neutronEmissionDetail
  };
}


