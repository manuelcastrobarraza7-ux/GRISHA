export interface AtomMission {
  id: number;
  title: string;
  targetDescription: string;
  targetZ: number;
  targetN: number;
  targetElectrons: number;
  hint: string;
  rewardName: string;
  formula: string;
  category: 'elementos' | 'sales' | 'acidos' | 'indicadores';
}

export const ATOM_MISSIONS: AtomMission[] = [
  {
    id: 1,
    title: 'Desafío 1: El Átomo Primordial (Hidrógeno Neutro)',
    targetDescription: 'Construye un átomo neutro de Hidrógeno-1 (Protio): 1 protón, 0 neutrones y 1 electrón.',
    targetZ: 1,
    targetN: 0,
    targetElectrons: 1,
    hint: 'El protio es el único nucleido estable sin neutrones en su núcleo.',
    rewardName: 'Hidrógeno Primordial (H)',
    formula: 'H2',
    category: 'elementos'
  },
  {
    id: 2,
    title: 'Desafío 2: La Partícula Alfa (Catión Helio-4)',
    targetDescription: 'Construye una partícula alfa ionizada (He²⁺): 2 protones, 2 neutrones y 0 electrones.',
    targetZ: 2,
    targetN: 2,
    targetElectrons: 0,
    hint: 'La partícula alfa es un núcleo desnudo de helio despojado de sus dos electrones.',
    rewardName: 'Partícula Alfa Nuclear (He²⁺)',
    formula: 'He',
    category: 'elementos'
  },
  {
    id: 3,
    title: 'Desafío 3: El Metal Más Ligero (Litio-7 Neutro)',
    targetDescription: 'Construye un átomo neutro de Litio-7: 3 protones, 4 neutrones y 3 electrones.',
    targetZ: 3,
    targetN: 4,
    targetElectrons: 3,
    hint: 'El litio-7 representa más del 92% del litio natural del cosmos.',
    rewardName: 'Litio Metálico (Li)',
    formula: 'Li',
    category: 'elementos'
  },
  {
    id: 4,
    title: 'Desafío 4: El Cronómetro Cósmico (Carbono-14)',
    targetDescription: 'Construye el isótopo radiactivo Carbono-14 neutro: 6 protones, 8 neutrones y 6 electrones.',
    targetZ: 6,
    targetN: 8,
    targetElectrons: 6,
    hint: 'El exceso de 2 neutrones respecto al C-12 lo hace desintegrarse por beta menos con semivida de 5.730 años.',
    rewardName: 'Radiocarbono C-14',
    formula: 'C-14',
    category: 'elementos'
  },
  {
    id: 5,
    title: 'Desafío 5: El Anión Óxido (O²⁻ con Capa Completa)',
    targetDescription: 'Crea el anión óxido con octeto completo: 8 protones, 8 neutrones y 10 electrones.',
    targetZ: 8,
    targetN: 8,
    targetElectrons: 10,
    hint: 'Al ganar 2 electrones, el oxígeno completa su capa L con 8 electrones, adquiriendo carga neta 2-.',
    rewardName: 'Ion Óxido Agronómico (O²⁻)',
    formula: 'O2-',
    category: 'sales'
  },
  {
    id: 6,
    title: 'Desafío 6: El Catión Sodio (Na⁺ Isótopo 23)',
    targetDescription: 'Construye el ion sodio fisiológico: 11 protones, 12 neutrones y 10 electrones.',
    targetZ: 11,
    targetN: 12,
    targetElectrons: 10,
    hint: 'El sodio pierde su único electrón 3s para alcanzar la estabilidad isoelectrónica con el neón.',
    rewardName: 'Catión Sodio de Solución (Na⁺)',
    formula: 'Na+',
    category: 'sales'
  },
  {
    id: 7,
    title: 'Desafío 7: La Matriz de Alúmina (Aluminio-27 Neutro)',
    targetDescription: 'Construye un átomo neutro de Aluminio-27: 13 protones, 14 neutrones y 13 electrones.',
    targetZ: 13,
    targetN: 14,
    targetElectrons: 13,
    hint: 'Es el único isótopo estable del aluminio, base de las piedras preciosas en redes de Al₂O₃.',
    rewardName: 'Aluminio Cristalino (Al)',
    formula: 'Al',
    category: 'elementos'
  },
  {
    id: 8,
    title: 'Desafío 8: El Fósforo Energético (Fósforo-31 Neutro)',
    targetDescription: 'Construye un átomo de Fósforo-31: 15 protones, 16 neutrones y 15 electrones.',
    targetZ: 15,
    targetN: 16,
    targetElectrons: 15,
    hint: 'Componente indispensable del ATP y de los fertilizantes fosfatados tecnificados.',
    rewardName: 'Fósforo Agronómico (P)',
    formula: 'P',
    category: 'elementos'
  },
  {
    id: 9,
    title: 'Desafío 9: El Rey de la Estabilidad (Hierro-56)',
    targetDescription: 'Construye el nucleido más fuertemente ligado: 26 protones, 30 neutrones y 26 electrones.',
    targetZ: 26,
    targetN: 30,
    targetElectrons: 26,
    hint: 'El hierro-56 se encuentra en el pico de la energía de enlace por nucleón (~8.8 MeV); ni fusiona ni fisiona con facilidad.',
    rewardName: 'Hierro Estelar (Fe-56)',
    formula: 'Fe',
    category: 'elementos'
  },
  {
    id: 10,
    title: 'Desafío 10: El Gas Noble Criptón-84',
    targetDescription: 'Construye Criptón-84 neutro: 36 protones, 48 neutrones y 36 electrones.',
    targetZ: 36,
    targetN: 48,
    targetElectrons: 36,
    hint: 'Gas noble de alta densidad usado en láseres y alumbrado científico.',
    rewardName: 'Criptón Purificado (Kr)',
    formula: 'Kr',
    category: 'elementos'
  },
  {
    id: 11,
    title: 'Desafío 11: El Metal Noble Cósmico (Oro-197)',
    targetDescription: 'Construye un átomo neutro de Oro-197: 79 protones, 118 neutrones y 79 electrones.',
    targetZ: 79,
    targetN: 118,
    targetElectrons: 79,
    hint: 'Sintetizado exclusivamente en colisiones de estrellas de neutrones mediante proceso r.',
    rewardName: 'Oro Estelar Colisional (Au-197)',
    formula: 'Au',
    category: 'elementos'
  },
  {
    id: 12,
    title: 'Desafío 12: El Núcleo Fisible (Uranio-235)',
    targetDescription: 'Construye el isótopo fisionable Uranio-235: 92 protones, 143 neutrones y 92 electrones.',
    targetZ: 92,
    targetN: 143,
    targetElectrons: 92,
    hint: 'Nucleido pesado capaz de sostener una reacción en cadena por absorción de neutrones térmicos.',
    rewardName: 'Uranio Fisible (U-235)',
    formula: 'U-235',
    category: 'elementos'
  }
];
