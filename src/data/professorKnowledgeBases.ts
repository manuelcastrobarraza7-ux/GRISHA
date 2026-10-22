export type SearchItemCategory = 
  // Química
  | 'acidos_bases' 
  | 'sales_agronomicas' 
  | 'adr_seguridad' 
  | 'minerales_aluminia'
  | 'reacciones_redox'
  // Cuántica & Astrofísica
  | 'isotopos_nucleares'
  | 'fusion_estelar'
  | 'ecuaciones_cuanticas'
  | 'constantes_limites'
  | 'particulas_modelo'
  // Biología & Moléculas Orgánicas
  | 'biomoleculas_vida'
  | 'aminoacidos_proteinas'
  | 'glucidos_lipidos'
  | 'acidos_nucleicos'
  | 'grupos_funcionales'
  | 'enzimas_alphafold';

export interface ProfessorSearchItem {
  id: string;
  title: string;
  subtitle: string;
  formulaOrSymbol: string;
  category: SearchItemCategory;
  categoryLabel: string;
  keywords: string[];
  description: string;
  technicalSpecs: { [key: string]: string | number };
  badgeText?: string;
  badgeColor?: string;
  suggestedPrompt: string;
}

/* ========================================================================= */
/* 1. BASE DE BÚSQUEDA DE QUÍMICA & SÍNTESIS MOLECULAR                       */
/* ========================================================================= */
export const CHEMISTRY_SEARCH_CATEGORIES = [
  { id: 'all', label: 'Toda la Base de Química' },
  { id: 'acidos_bases', label: 'Ácidos & Bases Fuertes' },
  { id: 'sales_agronomicas', label: 'Sales Agronómicas (K₂SO₄, KNO₃)' },
  { id: 'adr_seguridad', label: 'Peligro ADR / Rombo NFPA' },
  { id: 'minerales_aluminia', label: 'Minerales & Alúmina (Al₂O₃)' },
  { id: 'reacciones_redox', label: 'Reacciones & Balances' },
] as const;

export const CHEMISTRY_SEARCH_ITEMS: ProfessorSearchItem[] = [
  {
    id: 'chem-k2so4',
    title: 'Sulfato de Potasio',
    subtitle: 'Fertilizante técnico libre de cloruros (SOP)',
    formulaOrSymbol: 'K₂SO₄',
    category: 'sales_agronomicas',
    categoryLabel: 'Sales Agronómicas',
    keywords: ['k2so4', 'sulfato', 'potasio', 'fertilizante', 'cloro', 'agronomia', 'sop'],
    description: 'Sal potásica premium fundamental en fertirrigación para cultivos sensibles al cloro (tabaco, frutales, vid). Proporciona 50% K₂O y 18% azufre elemental.',
    technicalSpecs: {
      'Masa Molar': '174.26 g/mol',
      'Solubilidad': '111 g/L (20 °C)',
      'NFPA 704': 'Salud 1, Inflam 0, Inestab 0',
      'ADR ONU': 'Mercancía no peligrosa (Exento)'
    },
    badgeText: 'Libre de Cl⁻',
    badgeColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40',
    suggestedPrompt: 'Explica con detalle el mecanismo de síntesis del sulfato de potasio K₂SO₄ a partir de KOH y H₂SO₄, indicando por qué aventaja al KCl en suelos salinos y su solubilidad en fertirrigación.'
  },
  {
    id: 'chem-kno3',
    title: 'Nitrato de Potasio',
    subtitle: 'Sal comburente y macronutriente binario (N-K)',
    formulaOrSymbol: 'KNO₃',
    category: 'sales_agronomicas',
    categoryLabel: 'Sales Agronómicas',
    keywords: ['kno3', 'nitrato', 'potasio', 'salitre', 'comburente', 'fertilizante'],
    description: 'Aporta nitrógeno nítrico de asimilación instantánea y potasio libre de cloruro. Comburente clasificado ADR con alto potencial redox.',
    technicalSpecs: {
      'Masa Molar': '101.10 g/mol',
      'Clase ADR': 'Clase 5.1 (Comburentes)',
      'Nº ONU': 'UN 1486 (Grupo III)',
      'Código Túnel': '(E) Prohibido en túnel E'
    },
    badgeText: 'ADR Clase 5.1',
    badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-950/40',
    suggestedPrompt: 'Detalla las restricciones logísticas de transporte ADR para el nitrato de potasio KNO₃ (UN 1486, Clase 5.1), su reactividad con materias orgánicas y su balance en hidroponía.'
  },
  {
    id: 'chem-h2so4',
    title: 'Ácido Sulfúrico Concentrado',
    subtitle: 'Ácido diprótico fuerte y deshidratante industrial',
    formulaOrSymbol: 'H₂SO₄',
    category: 'acidos_bases',
    categoryLabel: 'Ácidos & Bases',
    keywords: ['h2so4', 'acido', 'sulfurico', 'corrosivo', 'diprotico', 'deshidratante'],
    description: 'Reactivo clave en neutralizaciones, síntesis de sales y catálisis ácida. Reacción violenta exotérmica en contacto con agua (W con barra).',
    technicalSpecs: {
      'Masa Molar': '98.08 g/mol',
      'Densidad': '1.84 g/cm³ (>96%)',
      'Rombo NFPA': 'Salud 3, Inflam 0, Inestab 2, W',
      'ADR ONU': 'UN 1830, Clase 8, Túnel (E)'
    },
    badgeText: 'NFPA W Peligro Agua',
    badgeColor: 'border-red-500/40 text-red-300 bg-red-950/40',
    suggestedPrompt: 'Calcula la entalpía de neutralización del ácido sulfúrico H₂SO₄ con hidróxido de potasio KOH y detalla el protocolo de seguridad obligatorio según rombo NFPA y ADR.'
  },
  {
    id: 'chem-al2o3',
    title: 'Alúmina / Corindón',
    subtitle: 'Óxido de aluminio y red cristalina de gemas preciosas',
    formulaOrSymbol: 'Al₂O₃',
    category: 'minerales_aluminia',
    categoryLabel: 'Minerales & Alúmina',
    keywords: ['al2o3', 'alumina', 'corindon', 'rubi', 'zafiro', 'cromo', 'titanio'],
    description: 'Matriz cristalina trigonal de altísima dureza (Mohs 9). Dopada con Cr³⁺ produce rubíes rojos; dopada con transferencia de carga Fe²⁺-Ti⁴⁺ produce zafiros azules.',
    technicalSpecs: {
      'Masa Molar': '101.96 g/mol',
      'Punto Fusión': '2072 °C',
      'Dureza Mohs': '9.0 (Corindón)',
      'Estructura': 'Red trigonal compacta'
    },
    badgeText: 'Gemas Cr³⁺ / Fe-Ti',
    badgeColor: 'border-cyan-400/40 text-cyan-300 bg-cyan-950/40',
    suggestedPrompt: 'Explica la teoría de campo ligando en la red de alúmina Al₂O₃: cómo la distorsión octaédrica y los iones Cr³⁺ dan el color rojo al rubí, mientras Fe²⁺/Ti⁴⁺ originan el zafiro azul.'
  },
  {
    id: 'chem-koh',
    title: 'Hidróxido de Potasio',
    subtitle: 'Base fuerte altamente higroscópica (Potasa cáustica)',
    formulaOrSymbol: 'KOH',
    category: 'acidos_bases',
    categoryLabel: 'Ácidos & Bases',
    keywords: ['koh', 'hidroxido', 'potasio', 'potasa', 'base fuerte', 'alcalino'],
    description: 'Precursor fundamental para la síntesis de sales potásicas de alta pureza agronómica. Provoca quemaduras químicas profundas.',
    technicalSpecs: {
      'Masa Molar': '56.11 g/mol',
      'pH (0.1M)': '~13.5',
      'Rombo NFPA': 'Salud 3, Inflam 0, Inestab 1',
      'ADR ONU': 'UN 1813 (Sólido), Clase 8, Túnel (E)'
    },
    badgeText: 'Base Fuerte Cáustica',
    badgeColor: 'border-blue-500/40 text-blue-300 bg-blue-950/40',
    suggestedPrompt: '¿Cómo se neutraliza de forma controlada el hidróxido de potasio KOH con ácido nítrico HNO₃ para obtener nitrato de potasio KNO₃ de grado fertirrigación?'
  },
  {
    id: 'chem-redox-neutralization',
    title: 'Mecanismo de Neutralización Ácido-Base',
    subtitle: 'Cinética y balance de entalpía exotérmica',
    formulaOrSymbol: 'H⁺ + OH⁻ → H₂O',
    category: 'reacciones_redox',
    categoryLabel: 'Reacciones & Balances',
    keywords: ['neutralizacion', 'entalpia', 'gibbs', 'acido', 'base', 'exotermica'],
    description: 'La reacción iónica neta fundamental en disolución acuosa con ΔH° = -57.3 kJ/mol de agua formada. Genera aumento térmico que requiere disipación en reactores.',
    technicalSpecs: {
      'ΔH° Reacción': '-57.3 kJ/mol',
      'ΔG° (298 K)': '-79.9 kJ/mol',
      'Especie Formada': 'H₂O neutra',
      'Cinética': 'Controlada por difusión (~10¹¹ M⁻¹s⁻¹)'
    },
    badgeText: 'ΔH° = -57.3 kJ/mol',
    badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40',
    suggestedPrompt: 'Deduzca el balance de calor y la variación de energía libre de Gibbs para la neutralización de 1 mol de H₂SO₄ con 2 moles de KOH en 500 mL de agua.'
  }
];

/* ========================================================================= */
/* 2. BASE DE BÚSQUEDA DE CUÁNTICA & ASTROFÍSICA                             */
/* ========================================================================= */
export const QUANTUM_SEARCH_CATEGORIES = [
  { id: 'all', label: 'Toda la Base Cuántica' },
  { id: 'isotopos_nucleares', label: 'Isótopos & Decaimiento Nuclear' },
  { id: 'fusion_estelar', label: 'Fusión Estelar & Nucleosíntesis' },
  { id: 'ecuaciones_cuanticas', label: 'Ecuaciones Fundamentales' },
  { id: 'constantes_limites', label: 'Constantes & Límites Cósmicos' },
  { id: 'particulas_modelo', label: 'Partículas del Modelo Estándar' },
] as const;

export const QUANTUM_SEARCH_ITEMS: ProfessorSearchItem[] = [
  {
    id: 'quant-schrodinger',
    title: 'Ecuación de Schrödinger',
    subtitle: 'Ecuación fundamental de la mecánica ondulatoria no relativista',
    formulaOrSymbol: 'iℏ ∂ψ/∂t = Ĥψ',
    category: 'ecuaciones_cuanticas',
    categoryLabel: 'Ecuaciones Fundamentales',
    keywords: ['schrodinger', 'ecuacion', 'onda', 'cuantica', 'hamiltoniano', 'psi'],
    description: 'Describe la evolución temporal y los estados estacionarios de sistemas mecánicos cuánticos. Determina densidades de probabilidad |ψ|² de partículas en potenciales.',
    technicalSpecs: {
      'Operador': 'Ĥ = -(ℏ²/2m)∇² + V(r)',
      'Interpretación': 'Probabilidad de Born |ψ|²',
      'Conservación': 'Unitaridad de probabilidad',
      'Aplicación': 'Átomo de hidrógeno y pozos cuánticos'
    },
    badgeText: 'Mecánica Cuántica',
    badgeColor: 'border-purple-500/40 text-purple-300 bg-purple-950/40',
    suggestedPrompt: 'Resuelve la ecuación de Schrödinger independiente del tiempo para un pozo de potencial infinito 1D y demuestra por qué la energía está cuantizada en n².'
  },
  {
    id: 'quant-tunnel-gamow',
    title: 'Efecto Túnel Cuántico & Factor de Gamow',
    subtitle: 'Superación probabilística de la barrera de Coulomb nuclear',
    formulaOrSymbol: 'P ∝ exp(-2πη)',
    category: 'ecuaciones_cuanticas',
    categoryLabel: 'Ecuaciones Fundamentales',
    keywords: ['efecto tunel', 'gamow', 'coulomb', 'fusion', 'barrera', 'probabilidad'],
    description: 'Permite que dos protones cargados positivamente se fusionen en el núcleo estelar a temperaturas de solo 15 millones de Kelvin, muy por debajo del límite clásico.',
    technicalSpecs: {
      'Parámetro η': 'Z₁Z₂e² / (4πε₀ ℏv)',
      'Ventana de Gamow': 'E₀ = (b k T / 2)^(2/3)',
      'Resultado Solar': 'Fusión p-p sostenida',
      'Tiempo Medio Protón': '~9 mil millones de años'
    },
    badgeText: 'Fusión Solar',
    badgeColor: 'border-indigo-500/40 text-indigo-300 bg-indigo-950/40',
    suggestedPrompt: 'Explica cómo el efecto túnel cuántico y el factor de penetración de Gamow hacen posible la vida al permitir que el Sol queme hidrógeno lentamente.'
  },
  {
    id: 'quant-pp-chain',
    title: 'Cadena Protón-Protón (p-p I, II, III)',
    subtitle: 'Principal motor termonuclear en estrellas de tipo solar',
    formulaOrSymbol: '4 ¹H → ⁴He + 2e⁺ + 2νₑ + 26.7 MeV',
    category: 'fusion_estelar',
    categoryLabel: 'Fusión Estelar',
    keywords: ['pp', 'cadena', 'proton', 'helio', 'fusion', 'sol', 'neutrinos'],
    description: 'Secuencia termonuclear dominante en estrellas de masa ≤ 1.3 M☉. Convierte 4 protones en un núcleo de helio-4, liberando 26.73 MeV por cada núcleo sintetizado.',
    technicalSpecs: {
      'Ramas': 'p-p I (85%), p-p II (15%), p-p III (0.02%)',
      'Paso Lento': 'p + p → d + e⁺ + νₑ (interacción débil)',
      'Energía Neta': '26.73 MeV liberados',
      'Temperatura Óptima': '10 - 20 MK'
    },
    badgeText: '26.73 MeV liberados',
    badgeColor: 'border-amber-400/40 text-amber-300 bg-amber-950/40',
    suggestedPrompt: 'Desglosa las 3 ramas de la cadena protón-protón (p-p I, II y III) en el núcleo solar y explica por qué la emisión de neutrinos varía en cada rama.'
  },
  {
    id: 'quant-chandrasekhar',
    title: 'Límite de Chandrasekhar',
    subtitle: 'Masa máxima para la estabilidad de una enana blanca',
    formulaOrSymbol: 'M_Ch ≈ 1.44 M_☉',
    category: 'constantes_limites',
    categoryLabel: 'Constantes & Límites',
    keywords: ['chandrasekhar', 'enana blanca', 'degeneracion', 'fermi', 'supernova'],
    description: 'Límite físico impuesto por la presión de degeneración de electrones ultra-relativistas. Al superarse (ej. acreción binaria), la estrella colapsa a estrella de neutrones o supernova Ia.',
    technicalSpecs: {
      'Valor Teórico': '~1.44 masas solares (2.86 × 10³⁰ kg)',
      'Presión Degenerada': 'P ∝ ρ^(4/3) (relativista)',
      'Descubridor': 'Subrahmanyan Chandrasekhar (1930)',
      'Consecuencia': 'Supernova Tipo Ia'
    },
    badgeText: 'Masa Máxima 1.44 M☉',
    badgeColor: 'border-purple-400/40 text-purple-300 bg-purple-950/40',
    suggestedPrompt: 'Deriva conceptually por qué la transición de electrones no relativistas (P ∝ ρ^5/3) a ultra-relativistas (P ∝ ρ^4/3) genera el colapso gravitatorio en el Límite de Chandrasekhar.'
  },
  {
    id: 'quant-fe56-peak',
    title: 'Hierro-56 & Pico de Energía de Enlace',
    subtitle: 'El límite termodinámico de la nucleosíntesis por fusión',
    formulaOrSymbol: '⁵⁶Fe / ⁵⁶Ni',
    category: 'isotopos_nucleares',
    categoryLabel: 'Isótopos & Decaimiento',
    keywords: ['hierro 56', 'enlace', 'nucleosintesis', 'supernova', 'fe56', 'niquel'],
    description: 'Posee una de las mayores energías de enlace por nucleón (~8.79 MeV/A). Más allá del hierro y níquel, la fusión se vuelve endotérmica, provocando el colapso del núcleo estelar.',
    technicalSpecs: {
      'Energía de Enlace': '8.79 MeV por nucleón',
      'Número Atómico Z': '26 protones',
      'Neutrones N': '30 neutrones',
      'Colapso Núcleo': 'Supernova de colapso gravitatorio'
    },
    badgeText: 'Pico de Estabilidad',
    badgeColor: 'border-cyan-400/40 text-cyan-300 bg-cyan-950/40',
    suggestedPrompt: '¿Por qué la curva de energía de enlace nuclear alcanza su cúspide en el hierro-56 y níquel-62 y cómo esto desencadena una supernova por colapso de núcleo?'
  },
  {
    id: 'quant-higgs-boson',
    title: 'Bosón de Higgs & Mecanismo Brout-Englert-Higgs',
    subtitle: 'Generación de masa para partículas fundamentales',
    formulaOrSymbol: 'm_H ≈ 125.1 GeV/c²',
    category: 'particulas_modelo',
    categoryLabel: 'Modelo Estándar',
    keywords: ['higgs', 'boson', 'masa', 'modelo estandar', 'lhc', 'vacio'],
    description: 'Excitación cuántica del campo de Higgs con valor de expectación de vacío no nulo (v ≈ 246 GeV). Otorga masa a los bosones electrodébiles W/Z y a los fermiones vía acoplamiento Yukawa.',
    technicalSpecs: {
      'Masa': '125.10 ± 0.14 GeV/c²',
      'Espín': '0 (Bosón escalar)',
      'Carga Eléctrica': '0',
      'Descubrimiento': 'CERN LHC (2012)'
    },
    badgeText: 'Campo de Higgs',
    badgeColor: 'border-purple-300/40 text-purple-200 bg-purple-950/40',
    suggestedPrompt: 'Explica el mecanismo de ruptura espontánea de simetría electrodébil SU(2)_L x U(1)_Y y cómo el bosón de Higgs dota de masa a las partículas elementales.'
  }
];

/* ========================================================================= */
/* 3. BASE DE BÚSQUEDA DE BIOLOGÍA & MOLÉCULAS ORGÁNICAS                     */
/* ========================================================================= */
export const BIOLOGY_SEARCH_CATEGORIES = [
  { id: 'all', label: 'Toda la Base de Biología & Orgánica' },
  { id: 'biomoleculas_vida', label: 'Biomoléculas & Polímeros de la Vida' },
  { id: 'aminoacidos_proteinas', label: 'Aminoácidos & AlphaFold (Proteínas)' },
  { id: 'glucidos_lipidos', label: 'Glúcidos & Lípidos' },
  { id: 'acidos_nucleicos', label: 'Ácidos Nucleicos (ADN / ARN)' },
  { id: 'grupos_funcionales', label: 'Grupos Funcionales Orgánicos' },
  { id: 'enzimas_alphafold', label: 'Enzimas & Cinética Bioquímica' },
] as const;

export const BIOLOGY_SEARCH_ITEMS: ProfessorSearchItem[] = [
  {
    id: 'bio-atp',
    title: 'Adenosín Trifosfato (ATP)',
    subtitle: 'La moneda energética universal de la célula biológica',
    formulaOrSymbol: 'C₁₀H₁₆N₅O₁₃P₃',
    category: 'biomoleculas_vida',
    categoryLabel: 'Biomoléculas de la Vida',
    keywords: ['atp', 'adenosin', 'trifosfato', 'energia', 'mitocondria', 'hidrolisis'],
    description: 'Molécula orgánica transportadora de energía química. La hidrólisis de sus enlaces fosfoanhídrido libera ΔG° = -30.5 kJ/mol para impulsar el transporte celular, anabolismo y contracción muscular.',
    technicalSpecs: {
      'Masa Molar': '507.18 g/mol',
      'Enlaces Críticos': '2 fosfoanhídrido de alta energía',
      'ΔG° Hidrólisis': '-30.5 kJ/mol (-7.3 kcal/mol)',
      'Síntesis Celular': 'ATP Sintasa por gradiente quimiosmótico'
    },
    badgeText: 'Energía Celular',
    badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40',
    suggestedPrompt: 'Analiza la termodinámica de la hidrólisis del ATP a ADP y Pi, explicando por qué los enlaces fosfoanhídrido concentran tanta energía libre y cómo acoplan reacciones endergónicas.'
  },
  {
    id: 'bio-dna-helix',
    title: 'ADN & Apareamiento de Bases Watson-Crick',
    subtitle: 'Ácido Desoxirribonucleico y código genético',
    formulaOrSymbol: 'A=T (2H) | G≡C (3H)',
    category: 'acidos_nucleicos',
    categoryLabel: 'Ácidos Nucleicos',
    keywords: ['adn', 'dna', 'adenina', 'timina', 'guanina', 'citosina', 'helice', 'genoma'],
    description: 'Polímero de desoxirribonucleótidos en doble hélice antiparalela (5\' a 3\'). El apareamiento específico mediante puentes de hidrógeno (2 entre A-T y 3 entre G-C) garantiza la fidelidad de replicación.',
    technicalSpecs: {
      'Estructura': 'Doble hélice B (diámetro 20 Å)',
      'Paso de Rosca': '34 Å por vuelta (10.5 pb)',
      'Puentes de H': 'A-T: 2 enlaces | G-C: 3 enlaces',
      'Estabilidad': 'Apilamiento aromático de bases π-π'
    },
    badgeText: 'Doble Hélice B',
    badgeColor: 'border-emerald-400/40 text-emerald-300 bg-emerald-950/40',
    suggestedPrompt: 'Explica las fuerzas físico-químicas que estabilizan la doble hélice de ADN: puentes de hidrógeno específicos, apilamiento de bases π-π y apantallamiento electrostático de fosfatos con Mg²⁺.'
  },
  {
    id: 'bio-glucose',
    title: 'D-Glucosa & Glucólisis',
    subtitle: 'Monosacárido aldosa hexagonal fundamental para la vida',
    formulaOrSymbol: 'C₆H₁₂O₆',
    category: 'glucidos_lipidos',
    categoryLabel: 'Glúcidos & Lípidos',
    keywords: ['glucosa', 'azucar', 'carbohidrato', 'glucolisis', 'aldosa', 'piruvato'],
    description: 'Principal combustible metabólico celular. En solución forma un hemiacetal cíclico (piranosa con anómeros α y β). Entra en la glucólisis citosólica para generar 2 piruvato y ATP neto.',
    technicalSpecs: {
      'Masa Molar': '180.16 g/mol',
      'Configuración': 'Aldohexosa cíclica (β-D-glucopiranosa)',
      'Rendimiento Glucólisis': '2 ATP + 2 NADH por molécula',
      'Solubilidad': '910 g/L en agua a 25 °C'
    },
    badgeText: 'Combustible Celular',
    badgeColor: 'border-lime-500/40 text-lime-300 bg-lime-950/40',
    suggestedPrompt: 'Describe los 10 pasos enzimáticos de la vía de la glucólisis desde la fosforilación de glucosa por hexoquinasa hasta la síntesis de piruvato por piruvato quinasa.'
  },
  {
    id: 'bio-alphafold-tp53',
    title: 'Oncogén Supresor TP53 (P04637)',
    subtitle: 'Guardián del genoma modelado en AlphaFold DB con pLDDT',
    formulaOrSymbol: 'P04637 (AlphaFold)',
    category: 'aminoacidos_proteinas',
    categoryLabel: 'Aminoácidos & Proteínas',
    keywords: ['tp53', 'p53', 'alphafold', 'plddt', 'cancer', 'oncogen', 'uniprot'],
    description: 'Factor de transcripción que induce arresto celular o apoptosis ante daño en el ADN. Su estructura muestra un dominio central de unión al ADN rígido (pLDDT > 90) y extremos flexibles desordenados (pLDDT < 50).',
    technicalSpecs: {
      'UniProt ID': 'P04637',
      'Dominio Core DNA': 'Residuos 102-292 (pLDDT > 90)',
      'Hotspots Mutacionales': 'R175, G245, R248, R249, R273, R282',
      'Ion Catalítico': 'Coordinación con Zn²⁺ tetraédrico'
    },
    badgeText: 'AlphaFold pLDDT > 90',
    badgeColor: 'border-emerald-300/40 text-emerald-200 bg-emerald-950/40',
    suggestedPrompt: '¿Cómo correlacionan las bandas de confianza pLDDT de AlphaFold DB en la proteína TP53 (P04637) con sus sitios activos de unión a ADN y las mutaciones reportadas en ClinVar?'
  },
  {
    id: 'bio-peptide-bond',
    title: 'Enlace Peptídico & Grupos Funcionales',
    subtitle: 'Amida planar con carácter parcial de doble enlace',
    formulaOrSymbol: '-CO-NH- (Amida)',
    category: 'grupos_funcionales',
    categoryLabel: 'Grupos Funcionales Orgánicos',
    keywords: ['enlace peptidico', 'amida', 'aminoacidos', 'proteina', 'quimica organica'],
    description: 'Formado por reacción de condensación entre el grupo carboxilo (-COOH) y el grupo amino (-NH₂) con pérdida de agua. Su resonancia confiere planaridad y rigidez al esqueleto peptídico.',
    technicalSpecs: {
      'Hibridación N': 'sp² por resonancia con carbonilo',
      'Longitud C-N': '1.33 Å (intermedio entre simple y doble)',
      'Ángulos de Torsión': 'Phi (φ), Psi (ψ) y Omega (ω ≈ 180° trans)',
      'Diagrama': 'Permitidos en gráfico de Ramachandran'
    },
    badgeText: 'Carácter Parcial Doble Enlace',
    badgeColor: 'border-rose-500/40 text-rose-300 bg-rose-950/40',
    suggestedPrompt: 'Explica el carácter parcial de doble enlace del enlace peptídico (-CO-NH-), sus implicaciones en la planaridad de la cadena y cómo limita los ángulos phi y psi en el gráfico de Ramachandran.'
  },
  {
    id: 'bio-cysteine-disulfide',
    title: 'Cisteína & Puentes Disulfuro (-S-S-)',
    subtitle: 'Aminoácido tiólico clave en el plegamiento terciario',
    formulaOrSymbol: 'HS-CH₂-CH(NH₂)-COOH',
    category: 'aminoacidos_proteinas',
    categoryLabel: 'Aminoácidos & Proteínas',
    keywords: ['cisteina', 'disulfuro', 'tiol', 'plegamiento', 'insulina', 'redox'],
    description: 'Único aminoácido proteinogénico con grupo sulfhidrilo (-SH) libre capaz de oxidarse para formar enlaces covalentes disulfuro inter o intracatenarios, estabilizando proteínas como la insulina y anticuerpos.',
    technicalSpecs: {
      'Masa Molar': '121.16 g/mol',
      'pK_a Cadena Lateral': '8.37 (grupo tiol -SH)',
      'Reacción': '2 Cys-SH + [O] → Cys-S-S-Cys + H₂O',
      'Función': 'Estabilización covalente de conformaciones 3D'
    },
    badgeText: 'Enlace Covalente -S-S-',
    badgeColor: 'border-amber-400/40 text-amber-300 bg-amber-950/40',
    suggestedPrompt: 'Analiza el papel de los puentes disulfuro de cisteína en la estabilidad conformacional de la insulina y cómo agentes reductores como DTT o beta-mercaptoetanol desnaturalizan las proteínas.'
  }
];

export function getProfessorSearchBase(type: 'chemistry' | 'physics_astrophysics' | 'bioscience') {
  if (type === 'chemistry') {
    return {
      title: 'Base de Búsqueda Química & Síntesis',
      subtitle: 'Reactivos, Fichas de Seguridad ADR/NFPA, Sales y Balances',
      categories: CHEMISTRY_SEARCH_CATEGORIES,
      items: CHEMISTRY_SEARCH_ITEMS,
      accentColor: 'cyan',
      themeBadge: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/50',
      searchPlaceholder: 'Buscar reactivo, fórmula (H₂SO₄, KNO₃), código ADR o mineral...'
    };
  }
  if (type === 'physics_astrophysics') {
    return {
      title: 'Base de Búsqueda Cuántica & Astrofísica',
      subtitle: 'Isótopos, Reacciones Estelares, Ecuaciones y Partículas Fundamentales',
      categories: QUANTUM_SEARCH_CATEGORIES,
      items: QUANTUM_SEARCH_ITEMS,
      accentColor: 'purple',
      themeBadge: 'border-purple-500/40 text-purple-300 bg-purple-950/50',
      searchPlaceholder: 'Buscar isótopo (¹⁴C, ⁵⁶Fe), efecto túnel, ecuación o constante...'
    };
  }
  // Bioscience / Organic Molecules
  return {
    title: 'Base de Búsqueda de Biología & Moléculas Orgánicas',
    subtitle: 'Biomoléculas, Proteínas AlphaFold, ADN/ARN, Glúcidos y Grupos Orgánicos',
    categories: BIOLOGY_SEARCH_CATEGORIES,
    items: BIOLOGY_SEARCH_ITEMS,
    accentColor: 'emerald',
    themeBadge: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/50',
    searchPlaceholder: 'Buscar biomolécula (ATP, Glucosa, TP53), enlace peptídico, lípido...'
  };
}
