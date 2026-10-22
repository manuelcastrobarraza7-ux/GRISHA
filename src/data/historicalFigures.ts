export interface HistoricalFigure {
  id: string;
  name: string;
  birthDeath: string;
  nationality: string;
  category: 'chemistry' | 'physics' | 'astrophysics';
  title: string;
  avatarIcon: string; // e.g. 'Atom', 'FlaskConical', 'Sparkles', 'Trophy', etc.
  keyAchievement: string;
  famousFormula?: string;
  historicContext: string;
  ethicalDilemmaOrDebate: string;
  quickQuestions: {
    label: string;
    prompt: string;
  }[];
}

export const HISTORICAL_FIGURES: HistoricalFigure[] = [
  // --- QUÍMICA ---
  {
    id: 'lavoisier',
    name: 'Antoine Lavoisier',
    birthDeath: '1743 – 1794',
    nationality: 'Francés',
    category: 'chemistry',
    title: 'Padre de la Química Moderna',
    avatarIcon: 'FlaskConical',
    keyAchievement: 'Ley de conservación de la materia y derrocamiento definitivo de la teoría del flogisto.',
    famousFormula: '\\sum m_{\\text{reactivos}} = \\sum m_{\\text{productos}}',
    historicContext: 'Revolución científica del siglo XVIII en vísperas de la Revolución Francesa. Transformó la alquimia cualitativa en una ciencia cuantitativa rigurosa mediante balanzas de ultraprecisión.',
    ethicalDilemmaOrDebate: 'Su rol como recaudador fiscal en la Ferme Générale durante el Reino del Terror condujo a su trágica ejecución en la guillotina ("La república no necesita sabios").',
    quickQuestions: [
      {
        label: 'Análisis Integral',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Antoine Lavoisier] Realiza un análisis exhaustivo de Antoine Lavoisier: su biografía, experimentos con mercurio y oxígeno, la ley de conservación de la masa y cómo refutó la teoría del flogisto.'
      },
      {
        label: 'Experimento Clave y Ecuaciones',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Antoine Lavoisier] Detalla el experimento del calcinado de mercurio en campana cerrada de 12 días, el balance de masas estequiométrico y las fórmulas químicas cuantitativas que formuló.'
      },
      {
        label: 'Contexto y Juicio Histórico',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Antoine Lavoisier] Analiza el contexto sociopolítico del siglo XVIII que culminó en el juicio a Lavoisier y el impacto de su legado para la química moderna.'
      }
    ]
  },
  {
    id: 'curie',
    name: 'Marie Skłodowska-Curie',
    birthDeath: '1867 – 1934',
    nationality: 'Polaca-Francesa',
    category: 'chemistry',
    title: 'Pionera de la Radiactividad & Doble Nobel',
    avatarIcon: 'Sparkles',
    keyAchievement: 'Descubrimiento del polonio y del radio, acuñación del término radiactividad y primera persona con dos premios Nobel en ciencias distintas.',
    famousFormula: 'A = \\lambda N = \\frac{\\ln 2}{t_{1/2}} N',
    historicContext: 'Finales del siglo XIX y principios del XX. Trabajo en un precario cobertizo sin ventilación en París, procesando toneladas de pechblenda para aislar trazas milimétricas de sales de radio.',
    ethicalDilemmaOrDebate: 'Se negó a patentar el proceso de aislamiento del radio para que la comunidad científica y médica pudiera utilizarlo libremente, sufriendo luego los efectos letales de la radiación por falta de protección.',
    quickQuestions: [
      {
        label: 'Análisis Integral',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Marie Curie] Realiza un análisis biográfico y científico completo de Marie Curie: aislamiento del polonio y radio, técnicas de electrometría con cuarzo piezoeléctrico y su doble premio Nobel.'
      },
      {
        label: 'Procesamiento de Pechblenda & Fórmulas',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Marie Curie] Explica el proceso de separación química fraccionada de pechblenda con cloruro de bario y radio, la ley de desintegración radiactiva y la actividad específica del radio-226.'
      },
      {
        label: 'Impacto Bélico & Petites Curies',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Marie Curie] Analiza su labor en la Primera Guerra Mundial con las unidades radiológicas móviles ("Petites Curies") y el dilema histórico de la radioprotección.'
      }
    ]
  },
  {
    id: 'mendeleev',
    name: 'Dmitri Mendeléyev',
    birthDeath: '1834 – 1907',
    nationality: 'Ruso',
    category: 'chemistry',
    title: 'Arquitecto de la Tabla Periódica',
    avatarIcon: 'FlaskConical',
    keyAchievement: 'Organización de los elementos según masa atómica y periodicidad química, dejando huecos proféticos para elementos por descubrir.',
    famousFormula: 'R_2O, RO, R_2O_3, RO_2, R_2O_5 \\text{ (Óxidos Periódicos)}',
    historicContext: 'Siberia y San Petersburgo en el siglo XIX. Buscaba redactar un libro de texto comprensible para sus alumnos universitarios ("Principios de Química") y organizó las cartas con elementos químicos.',
    ethicalDilemmaOrDebate: 'Dejó huecos vacíos y corrigió masas atómicas aceptadas en su época confiando más en la ley periódica que en las mediciones empíricas de sus contemporáneos, lo que generó escepticismo inicial hasta el hallazgo del galio y germanio.',
    quickQuestions: [
      {
        label: 'Análisis de la Tabla Periódica',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Dmitri Mendeléyev] Analiza la concepción de la Tabla Periódica de Mendeléyev de 1869: cómo ordenó los 63 elementos conocidos y predijo el eka-aluminio (galio) y eka-silicio (germanio).'
      },
      {
        label: 'Predicciones Cuantitativas',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Dmitri Mendeléyev] Muestra la comparativa numérica exacta entre las propiedades que Mendeléyev predijo para el eka-silicio en 1871 y los valores reales medidos por Winkler al descubrir el germanio en 1886.'
      }
    ]
  },
  {
    id: 'haber',
    name: 'Fritz Haber',
    birthDeath: '1868 – 1934',
    nationality: 'Alemán',
    category: 'chemistry',
    title: 'Creador del Amoníaco & Dilema de la Guerra Química',
    avatarIcon: 'FlaskConical',
    keyAchievement: 'Síntesis catalítica directa de amoníaco a partir de N₂ y H₂ (Proceso Haber-Bosch), base de los fertilizantes nitrogenados que alimentan al mundo.',
    famousFormula: 'N_2(g) + 3H_2(g) \\rightleftharpoons 2NH_3(g) \\quad (\\Delta H = -92.4\\,\\text{kJ/mol})',
    historicContext: 'Imperio Alemán pre y durante la Primera Guerra Mundial. Resolver la escasez de salitre chileno permitió la subsistencia agrícola pero también la producción de explosivos militares.',
    ethicalDilemmaOrDebate: 'El arquetipo del científico atrapado por el nacionalismo: diseñó el primer ataque masivo con gas de cloro en Ypres (1915), provocando el suicidio de su esposa, la química Clara Immerwahr.',
    quickQuestions: [
      {
        label: 'Dilema Ético & Proceso Haber',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Fritz Haber] Analiza la dualidad moral de Fritz Haber: el proceso Haber-Bosch como salvador de la agricultura mundial frente a su dirección del programa de armas químicas en la Primera Guerra Mundial.'
      },
      {
        label: 'Termodinámica de la Síntesis de Amoníaco',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Fritz Haber] Detalla el equilibrio termodinámico de Le Chatelier para la síntesis de Haber-Bosch a 200 atm y 450 °C, constantes de equilibrio Kp y balances estequiométricos con catalizador de hierro.'
      }
    ]
  },
  {
    id: 'franklin',
    name: 'Rosalind Franklin',
    birthDeath: '1920 – 1958',
    nationality: 'Británica',
    category: 'chemistry',
    title: 'Pionera de la Difracción de Rayos X',
    avatarIcon: 'Sparkles',
    keyAchievement: 'Fotografía 51 de difracción de rayos X, evidencia experimental decisiva de la estructura en doble hélice helicoidal del ADN.',
    famousFormula: '2d \\sin \\theta = n \\lambda \\quad (\\text{Ley de Bragg})',
    historicContext: 'King\'s College de Londres en la década de 1950. Rigor absoluto en el estudio de formas A y B hidratadas del ADN y estructura del virus del mosaico del tabaco.',
    ethicalDilemmaOrDebate: 'La Fotografía 51 fue mostrada a Watson y Crick sin su consentimiento ni conocimiento previo por Maurice Wilkins; falleció a los 37 años sin recibir el reconocimiento ni el Nobel póstumo.',
    quickQuestions: [
      {
        label: 'Análisis de la Fotografía 51',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Rosalind Franklin] Analiza el aporte científico crucial de Rosalind Franklin: la técnica de difracción de rayos X, la obtención de la Fotografía 51 y cómo reveló las dimensiones del paso helicoidal del ADN.'
      }
    ]
  },

  // --- FÍSICA CUÁNTICA ---
  {
    id: 'einstein',
    name: 'Albert Einstein',
    birthDeath: '1879 – 1955',
    nationality: 'Alemán-Suizo-Estadounidense',
    category: 'physics',
    title: 'Titán de la Relatividad & Cuanto de Luz',
    avatarIcon: 'Atom',
    keyAchievement: 'Teorías de la Relatividad Especial y General, explicación del efecto fotoeléctrico (cuantización fotónica) y movimiento browniano (confirmación atómica).',
    famousFormula: 'E = mc^2 \\quad \\& \\quad K_{\\max} = h\\nu - \\Phi',
    historicContext: 'Año milagroso (Annus Mirabilis 1905) como empleado de la oficina de patentes de Berna, hasta el desarrollo de la relatividad general en Berlín en 1915 en plena Primera Guerra Mundial.',
    ethicalDilemmaOrDebate: 'Pacifista convencido que firmó la carta Einstein-Szilárd alertando a Roosevelt sobre el peligro de una bomba nazi, lamentando posteriormente la proliferación armamentística nuclear.',
    quickQuestions: [
      {
        label: 'Efecto Fotoeléctrico & Nobel',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Albert Einstein] Analiza el artículo de Einstein de 1905 sobre el efecto fotoeléctrico: por qué la teoría ondulatoria clásica fallaba, la hipótesis del cuanto de luz y la formulación matemática con potencial de frenado.'
      },
      {
        label: 'Relatividad Especial & General',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Albert Einstein] Compara los postulados de la relatividad especial (invarianza de c, contracción de Lorentz) con la relatividad general (principio de equivalencia, curvatura del tensor métrico de Einstein).'
      },
      {
        label: 'Debates con Niels Bohr',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Albert Einstein] Analiza los históricos debates entre Einstein y Bohr (paradoja EPR, "Dios no juega a los dados", variables ocultas) y su impacto en la interpretación cuántica moderna.'
      }
    ]
  },
  {
    id: 'schrodinger',
    name: 'Erwin Schrödinger',
    birthDeath: '1887 – 1961',
    nationality: 'Austriaco',
    category: 'physics',
    title: 'Padre de la Mecánica Ondulatoria',
    avatarIcon: 'Atom',
    keyAchievement: 'Ecuación diferencial de onda que rige la evolución del estado cuántico de partículas y paradoja del gato de Schrödinger.',
    famousFormula: 'i\\hbar \\frac{\\partial}{\\partial t} \\Psi = \\hat{H} \\Psi',
    historicContext: 'Década de 1920 en Zúrich. Inspirado por la dualidad onda-corpúsculo de De Broglie, formuló un tratamiento continuo mecano-ondulatorio alternativo a la mecánica matricial de Heisenberg.',
    ethicalDilemmaOrDebate: 'Su famosa paradoja del gato en 1935 fue ideada como una crítica para evidenciar lo absurda que le parecía la interpretación de Copenhague al trasladar la superposición cuántica a objetos macroscópicos.',
    quickQuestions: [
      {
        label: 'Ecuación de Onda & Deducción',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Erwin Schrödinger] Desarrolla la formulación de la ecuación de Schrödinger dependiente e independiente del tiempo, el operador Hamiltoniano y el significado de la función de onda y su densidad de probabilidad.'
      },
      {
        label: 'La Paradoja del Gato',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Erwin Schrödinger] Explica con rigor físico la paradoja del gato de Schrödinger: superposición de estados, colapso de la función de onda, decoherencia cuántica y la interpretación de muchos mundos de Everett.'
      }
    ]
  },
  {
    id: 'planck',
    name: 'Max Planck',
    birthDeath: '1858 – 1947',
    nationality: 'Alemán',
    category: 'physics',
    title: 'Iniciador de la Era Cuántica',
    avatarIcon: 'Atom',
    keyAchievement: 'Postulado cuántico de energía ($E = h\\nu$) y resolución de la catástrofe ultravioleta en la radiación de cuerpo negro.',
    famousFormula: 'u(\\nu, T) = \\frac{8\\pi h \\nu^3}{c^3} \\frac{1}{e^{h\\nu / k_B T} - 1}',
    historicContext: 'Berlín en el año 1900. La física clásica creía que la ciencia teórica estaba casi completa; la radiación del cuerpo negro según Rayleigh-Jeans divergía hacia energía infinita.',
    ethicalDilemmaOrDebate: 'Hombre conservador que consideró su propia hipótesis cuántica como un "artificio matemático desesperado" durante años antes de aceptar que la naturaleza era verdaderamente discontinua.',
    quickQuestions: [
      {
        label: 'Catástrofe Ultravioleta & Cuantización',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Max Planck] Explica cómo Max Planck dedujo la ley de radiación del cuerpo negro en 1900, resolviendo la catástrofe ultravioleta y definiendo la constante h.'
      }
    ]
  },
  {
    id: 'feynman',
    name: 'Richard Feynman',
    birthDeath: '1918 – 1988',
    nationality: 'Estadounidense',
    category: 'physics',
    title: 'Maestro de la QED & Diagramas Cuánticos',
    avatarIcon: 'Atom',
    keyAchievement: 'Electrodinámica Cuántica (QED), formulación de integrales de camino, diagramas de Feynman y visión precursora de la nanotecnología.',
    famousFormula: '\\mathcal{L}_{\\text{QED}} = \\bar{\\psi}(i\\gamma^\\mu D_\\mu - m)\\psi - \\frac{1}{4}F_{\\mu\\nu}F^{\\mu\\nu}',
    historicContext: 'Comenzó como joven prodigio en Los Álamos (Proyecto Manhattan), luego profesor en Cornell y Caltech, y miembro clave de la comisión investigadora del transbordador espacial Challenger.',
    ethicalDilemmaOrDebate: 'Reflexionó profundamente sobre el remordimiento posterior al festejo de la prueba Trinity y promovió el pensamiento crítico libre de dogmatismo.',
    quickQuestions: [
      {
        label: 'Diagramas de Feynman & QED',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Richard Feynman] Explica la formulación de Feynman de la electrodinámica cuántica (QED), cómo los diagramas de Feynman representan amplitudes de dispersión y la renormalización.'
      },
      {
        label: 'Feynman y el Accidente del Challenger',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Richard Feynman] Narra cómo Feynman demostró en vivo con un vaso de agua helada y una junta tórica (O-ring) la causa física del desastre del Challenger en 1986.'
      }
    ]
  },
  {
    id: 'bohr',
    name: 'Niels Bohr',
    birthDeath: '1885 – 1962',
    nationality: 'Danés',
    category: 'physics',
    title: 'Líder de la Escuela de Copenhague',
    avatarIcon: 'Atom',
    keyAchievement: 'Modelo atómico cuántico con cuantización del momento angular ($L = n\\hbar$) y principios de complementariedad y correspondencia.',
    famousFormula: 'r_n = \\frac{4\\pi \\varepsilon_0 \\hbar^2}{m_e e^2} n^2 = n^2 a_0',
    historicContext: 'Instituto de Física Teórica de Copenhague en los años 1920-1930, el epicentro mundial de la revolución cuántica que congregó a Heisenberg, Pauli y Dirac.',
    ethicalDilemmaOrDebate: 'El misterioso encuentro de 1941 en Copenhague ocupada con su antiguo pupilo Werner Heisenberg sobre el posible desarrollo de la bomba atómica alemana.',
    quickQuestions: [
      {
        label: 'Modelo Atómico de Bohr',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Niels Bohr] Deriva el modelo atómico de Bohr para el hidrógeno: cuantización del momento angular, cálculo del radio de Bohr a_0 y las líneas espectrales de Rydberg.'
      }
    ]
  },

  // --- ASTROFÍSICA & GRAVITACIÓN ---
  {
    id: 'galileo',
    name: 'Galileo Galilei',
    birthDeath: '1564 – 1642',
    nationality: 'Italiano',
    category: 'astrophysics',
    title: 'Padre de la Ciencia Observacional Moderna',
    avatarIcon: 'Sparkles',
    keyAchievement: 'Uso del telescopio astronómico (lunas de Júpiter, fases de Venus, manchas solares), cinemática de caída libre y consolidación del método científico.',
    famousFormula: 'd = \\frac{1}{2} g t^2 \\quad (\\text{Caída libre uniforme})',
    historicContext: 'Renacimiento italiano tardío. Desafió la cosmovisión aristotélico-ptolomeica geocéntrica respaldada por la Iglesia Católica mediante datos empíricos irrefutables.',
    ethicalDilemmaOrDebate: 'El célebre juicio inquisitorial de 1633 donde fue obligado a abjurar formalmente del heliocentrismo copernicano y condenado a arresto domiciliario perpetuo ("Eppur si muove").',
    quickQuestions: [
      {
        label: 'Descubrimientos Telescópicos & Heliocentrismo',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Galileo Galilei] Analiza los descubrimientos telescópicos de Galileo de 1609-1610 (Sidereus Nuncius): las cuatro lunas galileanas de Júpiter, las fases de Venus y por qué destruyeron el geocentrismo.'
      },
      {
        label: 'El Juicio de 1633 y el Método Científico',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Galileo Galilei] Analiza el juicio de la Inquisición a Galileo en 1633 tras la publicación del Diálogo sobre los dos máximos sistemas del mundo y el nacimiento del método empírico moderno.'
      }
    ]
  },
  {
    id: 'chandrasekhar',
    name: 'Subrahmanyan Chandrasekhar',
    birthDeath: '1910 – 1995',
    nationality: 'Indio-Estadounidense',
    category: 'astrophysics',
    title: 'Teórico del Colapso Estelar',
    avatarIcon: 'Atom',
    keyAchievement: 'Descubrimiento del límite de masa máxima para enanas blancas (~1.44 masas solares), abriendo las puertas a estrellas de neutrones y agujeros negros.',
    famousFormula: 'M_{\\text{Ch}} \\approx \\frac{\\omega_3^0}{4\\pi} \\left( \\frac{hc}{G} \\right)^{3/2} \\left( \\frac{1}{\\mu_e m_u} \\right)^2 \\approx 1.44\\,M_\\odot',
    historicContext: 'Calculó el límite a los 19 años durante su travesía en barco desde la India hacia Inglaterra (Cambridge) en 1930, combinando relatividad especial y mecánica cuántica de Fermi.',
    ethicalDilemmaOrDebate: 'Fue ridiculizado públicamente por Sir Arthur Eddington ante la Real Sociedad Astronómica en 1935 por afirmar que las estrellas podían colapsar infinitamente, retrasando la aceptación de los agujeros negros por décadas.',
    quickQuestions: [
      {
        label: 'Derivación del Límite de Chandrasekhar',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Subrahmanyan Chandrasekhar] Detalla la deducción física del Límite de Chandrasekhar (~1.44 M☉): el balance entre la presión de degeneración electrónica ultra-relativista y la gravedad estelar.'
      },
      {
        label: 'La Controversia con Arthur Eddington',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Subrahmanyan Chandrasekhar] Narra la controversia histórica entre Chandrasekhar y Eddington en Cambridge en 1935 y el impacto del prejuicio institucional en el avance de la astrofísica.'
      }
    ]
  },
  {
    id: 'payne',
    name: 'Cecilia Payne-Gaposchkin',
    birthDeath: '1900 – 1979',
    nationality: 'Británica-Estadounidense',
    category: 'astrophysics',
    title: 'Descubridora de la Composición Estelar',
    avatarIcon: 'Sparkles',
    keyAchievement: 'Demostró que el hidrógeno y el helio son los componentes abrumadoramente mayoritarios de las estrellas y del universo visible.',
    famousFormula: '\\frac{N_{j+1}}{N_j} = \\frac{2 k_B T u_{j+1}}{P_e u_j} \\left(\\frac{2\\pi m_e k_B T}{h^2}\\right)^{3/2} e^{-\\chi_j / k_B T} \\quad (\\text{Saha})',
    historicContext: 'Observatorio de Harvard en 1925. Aplicó la ecuación de ionización de Meghnad Saha al análisis de espectros estelares, concluyendo que el Sol contenía un millón de veces más hidrógeno que la Tierra.',
    ethicalDilemmaOrDebate: 'Henry Norris Russell la persuadió de no publicar esa conclusión en su tesis doctoral por considerarla "claramente imposible"; cuatro años después, Russell llegó al mismo resultado y se le atribuyó el mérito inicial.',
    quickQuestions: [
      {
        label: 'La Composición Química del Universo',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Cecilia Payne-Gaposchkin] Analiza la revolucionaria tesis doctoral de Cecilia Payne de 1925: cómo utilizó la ecuación de Saha para demostrar que el universo está compuesto principalmente de hidrógeno y helio.'
      }
    ]
  },
  {
    id: 'oppenheimer',
    name: 'J. Robert Oppenheimer',
    birthDeath: '1904 – 1967',
    nationality: 'Estadounidense',
    category: 'astrophysics',
    title: 'Físico Teórico & Director de Los Álamos',
    avatarIcon: 'Atom',
    keyAchievement: 'Aproximación de Born-Oppenheimer, predicción del límite gravitatorio estelar Tolman-Oppenheimer-Volkoff (TOV) y dirección científica del Proyecto Manhattan.',
    famousFormula: '\\frac{dP}{dr} = -\\frac{G m \\rho}{r^2} \\left( 1 + \\frac{P}{\\rho c^2} \\right) \\left( 1 + \\frac{4\\pi r^3 P}{m c^2} \\right) \\left( 1 - \\frac{2Gm}{rc^2} \\right)^{-1}',
    historicContext: 'Física teórica de Berkeley y Caltech en los años 30 (colapso gravitatorio de estrellas) hasta el laboratorio secreto de Los Álamos durante la Segunda Guerra Mundial.',
    ethicalDilemmaOrDebate: 'La prueba Trinity y las bombas de Hiroshima y Nagasaki; su oposición posterior a la bomba de hidrógeno y su posterior revocación de seguridad en las audiencias de la era McCarthy en 1954.',
    quickQuestions: [
      {
        label: 'Límite TOV & Agujeros Negros',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: J. Robert Oppenheimer] Explica el aporte de Oppenheimer a la astrofísica teórica en 1939: el límite Tolman-Oppenheimer-Volkoff para estrellas de neutrones y el artículo pionero sobre colapso continuo gravitatorio.'
      },
      {
        label: 'Proyecto Manhattan & Dilemas Morales',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: J. Robert Oppenheimer] Analiza el rol de Oppenheimer como director de Los Álamos, su célebre invocación del Bhagavad Gita tras la prueba Trinity y las audiencias de seguridad de 1954.'
      }
    ]
  },
  {
    id: 'newton',
    name: 'Isaac Newton',
    birthDeath: '1643 – 1727',
    nationality: 'Inglés',
    category: 'astrophysics',
    title: 'Arquitecto de la Mecánica Clásica',
    avatarIcon: 'Sparkles',
    keyAchievement: 'Leyes del movimiento, ley de gravitación universal, desarrollo del cálculo infinitesimal y descomposición de la luz blanca mediante prismas.',
    famousFormula: 'F = G \\frac{m_1 m_2}{r^2} \\quad \\& \\quad \\mathbf{F} = \\frac{d\\mathbf{p}}{dt}',
    historicContext: 'Cambridge y Woolsthorpe durante la gran peste de 1665 (su "annus mirabilis"). Publicación de los *Philosophiae Naturalis Principia Mathematica* en 1687.',
    ethicalDilemmaOrDebate: 'Feroz disputa de prioridad intelectual con Gottfried Wilhelm Leibniz sobre la invención del cálculo infinitesimal y disputas ópticas con Robert Hooke.',
    quickQuestions: [
      {
        label: 'Gravitación Universal & Principia',
        prompt: '[ANÁLISIS DE PERSONAJE HISTÓRICO: Isaac Newton] Desarrolla la derivación de la ley de gravitación universal de Newton: cómo unificó la caída de la manzana en la Tierra con la órbita de la Luna y las leyes de Kepler.'
      }
    ]
  }
];
