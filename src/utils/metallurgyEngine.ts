import { gameDatabase, MetalElement, NonMetalElement, FluxElement } from '../data/metallurgyDatabase';

export interface CalculatedAlloyResult {
  nombre: string;
  tipo: string;
  subtitulo?: string;
  calidad?: string;
  color: string;
  propiedad: string;
  alerta?: string;
  esPeligroso: boolean;
  densidadCalculada: number; // g/cm³
  puntoFusionEstimado: number; // °C
  rangoFusionSolidus: number; // °C
  rangoFusionLiquidus: number; // °C
  durezaEstimadaHV: number; // Vickers
  resistenciaTraccionMPa: number; // MPa
  fasePredominante: string;
  descripcionMetalurgica: string;
  metalesUtilizados: { metal: MetalElement; porcentaje: number }[];
  noMetalUtilizado?: NonMetalElement;
  fundenteUtilizado?: FluxElement;
  bonusFundente?: string;
  efectoNoMetal?: string;
  totalMetalesOcupados: number;
  esFormulaExacta: boolean;
  gradoNorma?: string; // e.g. ASTM B194, ISO 925, AISI 1045, AMS 4911
  aplicacionesRecomendadas: string[];
}

export function calcularAleacion(
  slotMetales: (string | null | undefined)[],
  slotNoMetal?: string | null,
  slotFundente?: string | null,
  customPercentages?: number[] // Optional 4-slot percentages, defaults to equal distribution
): CalculatedAlloyResult {
  // 1. Filter valid metal ids and eliminate duplicates or blanks
  const metalesLimpios = slotMetales.filter((id): id is string => Boolean(id && id.trim().length > 0));
  const metalesOrdenados = [...metalesLimpios].map(m => m.toLowerCase()).sort();
  const metalesUnicos = Array.from(new Set(metalesOrdenados));

  const totalSlotsOcupados = metalesLimpios.length;

  // Resolve DB objects
  const metalObjects: { metal: MetalElement; porcentaje: number }[] = [];
  const noMetalObj = gameDatabase.nonMetals.find(nm => nm.id === slotNoMetal);
  const fundenteObj = gameDatabase.fluxes.find(f => f.id === slotFundente);

  // Compute percentages for each slot
  const numElements = metalesLimpios.length;
  if (numElements === 0) {
    return {
      nombre: "Crisol Vacío",
      tipo: "Esperando Carga Metálica",
      subtitulo: "Introduce al menos un metal en las ranuras para iniciar la aleación",
      color: "#334155",
      propiedad: "Sin masa en el crisol",
      esPeligroso: false,
      densidadCalculada: 0,
      puntoFusionEstimado: 0,
      rangoFusionSolidus: 0,
      rangoFusionLiquidus: 0,
      durezaEstimadaHV: 0,
      resistenciaTraccionMPa: 0,
      fasePredominante: "N/A",
      descripcionMetalurgica: "El crisol está frío y vacío. Añade metales base en los 4 slots superiores para calcular el comportamiento termodinámico y metalográfico.",
      metalesUtilizados: [],
      noMetalUtilizado: noMetalObj,
      fundenteUtilizado: fundenteObj,
      totalMetalesOcupados: 0,
      esFormulaExacta: false,
      aplicacionesRecomendadas: []
    };
  }

  // Weight fraction distribution
  slotMetales.forEach((id, slotIdx) => {
    if (id && id.trim().length > 0) {
      const metalData = gameDatabase.metals.find(m => m.id === id.toLowerCase());
      if (metalData) {
        const pct = (customPercentages && customPercentages[slotIdx] !== undefined) 
          ? customPercentages[slotIdx] 
          : (100 / totalSlotsOcupados);
        metalObjects.push({ metal: metalData, porcentaje: pct });
      }
    }
  });

  // Calculate Average Density using Reciprocal Volumetric Law (Rule of Mixtures for density)
  // rho_avg = 100 / sum(wi / rho_i)
  let sumWeightOverDensity = 0;
  let weightedMeltingSum = 0;
  let minMelting = Infinity;
  let maxMelting = -Infinity;

  metalObjects.forEach(({ metal, porcentaje }) => {
    const frac = porcentaje / 100;
    sumWeightOverDensity += frac / (metal.density || 1);
    weightedMeltingSum += metal.melting * frac;
    if (metal.melting < minMelting) minMelting = metal.melting;
    if (metal.melting > maxMelting) maxMelting = metal.melting;
  });

  const densidadCalculada = sumWeightOverDensity > 0 
    ? Math.round((1 / sumWeightOverDensity) * 100) / 100 
    : 0;

  // Eutectic depression / melting range estimation
  const meltingDelta = maxMelting - minMelting;
  const puntoFusionEstimado = Math.round(weightedMeltingSum - (meltingDelta > 200 ? 35 : 10));
  const rangoFusionSolidus = Math.round(Math.min(minMelting, puntoFusionEstimado - 25));
  const rangoFusionLiquidus = Math.round(Math.max(puntoFusionEstimado + 15, weightedMeltingSum));

  // Base mechanical properties
  let durezaEstimada = 45; // baseline soft
  let resistenciaTraccion = 150; // MPa baseline
  let fasePredominante = "Solución sólida monofásica FCC";
  let colorAleacion = metalObjects[0]?.metal.colorHex || "#CBD5E1";

  // Check specific alloys & standard recipes:
  let resultadoFinal: Partial<CalculatedAlloyResult> = {};

  // 1. DETECCIÓN DE AMALGAMAS (Si incluye Mercurio 'hg')
  if (metalesUnicos.includes("hg")) {
    const alertaHg = "¡Peligro crítico! Alta toxicidad por vapores neurotóxicos de mercurio (Hg). Prohibido calentar en hornos abiertos; la inhalación de vapores a más de 350°C destruye el tejido pulmonar y el SNC.";
    
    if (metalesUnicos.includes("au")) {
      resultadoFinal = {
        nombre: "Amalgama de Oro (Au-Hg)",
        tipo: "Proceso Químico / Minero / Afinado",
        subtitulo: "Disolución intermetálica en frío del oro en mercurio líquido",
        calidad: "Disolución superficial reactiva",
        color: "#D4AF37",
        propiedad: "Formación de cristales intermetálicos AuHg2 y Au2Hg a temperatura ambiente.",
        alerta: alertaHg,
        esPeligroso: true,
        fasePredominante: "Compuestos intermetálicos AuHg₂ suspendidos en Hg líquido",
        durezaEstimadaHV: 25,
        resistenciaTraccionMPa: 60,
        esFormulaExacta: true,
        gradoNorma: "Histórico Minero Colonial",
        descripcionMetalurgica: "El mercurio humedece y disuelve las partículas microscópicas de oro sin necesidad de fundir el metal noble, formando una pasta grisácea-dorada. Su separación tradicional por quemado liberaba vapores letales de mercurio; la técnica moderna exige retortas herméticas con condensación criogénica o cianuración controlada.",
        aplicacionesRecomendadas: ["Recuperación pirometalúrgica en circuito cerrado", "Dorado al fuego histórico", "Estudio de aleaciones líquidas"]
      };
    } else if (metalesUnicos.includes("ag")) {
      resultadoFinal = {
        nombre: "Amalgama de Plata (Ag-Hg)",
        tipo: "Histórica / Dental / Odontológica",
        subtitulo: "Aleación de endurecimiento rápido a temperatura bucal",
        calidad: "Manipulación en frío obligatoria",
        color: "#B0BEC5",
        propiedad: "Fase gamma-1 (Ag2Hg3) con expansión controlada",
        alerta: "Requiere manipulación estricta en frío. Desprende micro-vapores de mercurio durante el fraguado inicial.",
        esPeligroso: true,
        fasePredominante: "Fase intermetálica γ1 (Ag₂Hg₃) y matriz residual",
        durezaEstimadaHV: 90,
        resistenciaTraccionMPa: 120,
        esFormulaExacta: true,
        gradoNorma: "ISO 24234 / Dental Amalgam Alloy",
        descripcionMetalurgica: "Aleación odontológica clásica compuesta por plata, estaño o cobre amalgamados con mercurio puro. Al triturarse en frío se inicia una reacción de disolución y cristalización rápida formando la matriz de Ag₂Hg₃ de gran resistencia a la compresión.",
        aplicacionesRecomendadas: ["Obturaciones dentales históricas", "Interconectores de baja temperatura", "Prácticas de laboratorio criogénico"]
      };
    } else {
      resultadoFinal = {
        nombre: `Amalgama Metálica de Mercurio (${metalesUnicos.join(" + ").toUpperCase()})`,
        tipo: "Aleación Líquida / Amalgama Tóxica",
        subtitulo: "Solución de metales disueltos en mercurio líquido",
        color: "#78909C",
        propiedad: "Comportamiento líquido o pastoso con alta tensión superficial",
        alerta: alertaHg,
        esPeligroso: true,
        fasePredominante: "Disolución líquida y cristales metaestables",
        durezaEstimadaHV: 15,
        resistenciaTraccionMPa: 40,
        esFormulaExacta: false,
        descripcionMetalurgica: "La presencia de mercurio altera la estructura de la red cristalina, provocando fragilización por metal líquido (LME - Liquid Metal Embrittlement) en los granos metálicos adyacentes.",
        aplicacionesRecomendadas: ["Química experimental de laboratorio", "Interruptores de inclinación herméticos"]
      };
    }
  }

  // 2. DETECCIÓN DE ALEACIONES PRECIOSAS Y JOYERÍA (si no es amalgama)
  else if (metalesUnicos.includes("pt")) {
    const extraPt = metalesUnicos.filter(m => m !== "pt");
    if (extraPt.includes("ir")) {
      resultadoFinal = {
        nombre: "Platino-Iridio (Pt90 / Ir10)",
        tipo: "Joyería Fina & Contactos Eléctricos de Precisión",
        subtitulo: "Aleación noble de platino endurecida con 10% de iridio",
        calidad: "ASTM B684 / Grado Platino Fino",
        color: "#E5E7EB",
        propiedad: "Rigidez estructural superior y resistencia extrema al desgaste",
        esPeligroso: false,
        fasePredominante: "Solución sólida sustitucional FCC (Pt-Ir)",
        durezaEstimadaHV: 165,
        resistenciaTraccionMPa: 380,
        esFormulaExacta: true,
        gradoNorma: "Pt90/Ir10 (90% Pt, 10% Ir)",
        descripcionMetalurgica: "El iridio incrementa notablemente la dureza del platino puro sin mermar su brillo noble ni su resistencia a la oxidación a altas temperaturas.",
        aplicacionesRecomendadas: ["Monturas de alta joyería para piedras preciosas", "Contactos eléctricos de conmutación pesada", "Crisoles y varillas de laboratorio químico"]
      };
    } else if (extraPt.includes("ru")) {
      resultadoFinal = {
        nombre: "Platino-Rutenio (Pt95 / Ru5)",
        tipo: "Joyería & Mecanizado de Alta Precisión",
        subtitulo: "Aleación de platino aleada con rutenio para grabado y maquinado",
        calidad: "Grado Joyería Premium",
        color: "#E5E7EB",
        propiedad: "Excelente maquinabilidad y dureza superior al platino con iridio",
        esPeligroso: false,
        fasePredominante: "Solución sólida FCC (Pt-Ru)",
        durezaEstimadaHV: 135,
        resistenciaTraccionMPa: 340,
        esFormulaExacta: true,
        gradoNorma: "Pt95/Ru5 (95% Pt, 5% Ru)",
        descripcionMetalurgica: "El rutenio es un endurecedor muy eficiente para el platino, manteniendo una ductilidad idónea para engastes complejos y acabado de espejo.",
        aplicacionesRecomendadas: ["Anillos de boda y sortijas de alta gama", "Instrumentos quirúrgicos de platino"]
      };
    } else if (extraPt.includes("co")) {
      resultadoFinal = {
        nombre: "Platino-Cobalto (Pt95 / Co5)",
        tipo: "Microfundición a la Cera Perdida",
        subtitulo: "Aleación de platino con menor viscosidad en estado líquido",
        calidad: "Grado Fundición Dental y Joyería",
        color: "#E2E8F0",
        propiedad: "Baja viscosidad en colada y propiedades magnéticas moderadas",
        esPeligroso: false,
        fasePredominante: "Solución sólida con dominios magnéticos",
        durezaEstimadaHV: 150,
        resistenciaTraccionMPa: 410,
        esFormulaExacta: true,
        gradoNorma: "Pt95/Co5 (95% Pt, 5% Co)",
        descripcionMetalurgica: "El cobalto reduce la tensión superficial del platino fundido, facilitando el llenado perfecto de moldes intrincados en microfundición por centrifugado.",
        aplicacionesRecomendadas: ["Piezas de joyería intrincadas por cera perdida", "Prótesis dentales coladas"]
      };
    } else if (extraPt.includes("rh")) {
      resultadoFinal = {
        nombre: "Platino-Rodio (Pt80 / Rh20)",
        tipo: "Termometría Industrial & Catálisis",
        subtitulo: "Aleación de alta temperatura para termocuplas y mallas catalíticas",
        calidad: "ASTM E230 / Tipo R y S",
        color: "#F3F4F6",
        propiedad: "Estabilidad termoeléctrica y resistencia a la oxidación a 1500°C",
        esPeligroso: false,
        fasePredominante: "Solución sólida continua isomorfa FCC",
        durezaEstimadaHV: 120,
        resistenciaTraccionMPa: 320,
        esFormulaExacta: true,
        gradoNorma: "Pt80/Rh20 (80% Pt, 20% Rh)",
        descripcionMetalurgica: "Resiste la oxidación atmosférica severa a temperaturas incandescentes, generando el par termoeléctrico estándar internacional para calibración de hornos.",
        aplicacionesRecomendadas: ["Termocuplas de alta temperatura Tipo R/S", "Mallas catalíticas para producción de ácido nítrico"]
      };
    } else if (extraPt.includes("w")) {
      resultadoFinal = {
        nombre: "Platino-Tungsteno (Pt92 / W8)",
        tipo: "Aeroespacial & Electrónica de Descarga",
        subtitulo: "Aleación resistente al desgaste eléctrico por chispa",
        calidad: "Grado Aeroespacial Especial",
        color: "#D1D5DB",
        propiedad: "Resistencia excepcional a la erosión por chispa eléctrica",
        esPeligroso: false,
        fasePredominante: "Matriz de platino con dispersión de tungsteno",
        durezaEstimadaHV: 190,
        resistenciaTraccionMPa: 490,
        esFormulaExacta: true,
        gradoNorma: "Pt92/W8 (92% Pt, 8% W)",
        descripcionMetalurgica: "El tungsteno confiere resistencia a la erosión por arcos eléctricos repetidos sin fundir los electrodos.",
        aplicacionesRecomendadas: ["Bujes y electrodos para motores de aviación", "Contactos de dispositivos de alta tensión"]
      };
    } else {
      resultadoFinal = {
        nombre: "Platino Fino Aleado",
        tipo: "Joyería & Laboratorio",
        subtitulo: "Aleación noble basada en Platino",
        color: "#E5E7EB",
        propiedad: "Alta densidad y resistencia a ácidos",
        esPeligroso: false,
        fasePredominante: "Solución sólida FCC noble",
        durezaEstimadaHV: 110,
        resistenciaTraccionMPa: 300,
        esFormulaExacta: false,
        gradoNorma: "Platino Ley 950",
        descripcionMetalurgica: "El platino es el metal noble por antonomasia, caracterizado por su elevado punto de fusión (1768°C) y gran resistencia a la corrosión química.",
        aplicacionesRecomendadas: ["Joyería fina y laboratorios de análisis"]
      };
    }
  } else if (metalesUnicos.includes("ag") && !metalesUnicos.includes("au") && !metalesUnicos.includes("pt")) {
    const extraAg = metalesUnicos.filter(m => m !== "ag");
    if (extraAg.includes("ge")) {
      resultadoFinal = {
        nombre: "Argentium Silver 935",
        tipo: "Joyería Moderna / Inoxidable al Empañamiento",
        subtitulo: "Aleación patentada de plata con germanio para resistencia al deslustre",
        calidad: "Argentium 935 Patentada",
        color: "#F1F5F9",
        propiedad: "Auto-pasivante contra sulfuros atmosféricos gracias al germanio",
        esPeligroso: false,
        fasePredominante: "Solución sólida Ag-Cu con óxidos protectores de germanio",
        durezaEstimadaHV: 85,
        resistenciaTraccionMPa: 325,
        esFormulaExacta: true,
        gradoNorma: "Argentium 935 (93.5% Ag, 5.3% Cu, 1.2% Ge)",
        descripcionMetalurgica: "La adición de germanio forma una capa microscópica transparente de óxido de germanio que impide el ataque del sulfuro de hidrógeno atmosférico, eliminando el clásico oscurecimiento (tarnish).",
        aplicacionesRecomendadas: ["Joyería de plata moderna de bajo mantenimiento", "Platería de alta gama"]
      };
    } else {
      const agObj = metalObjects.find(m => m.metal.id === 'ag');
      const agPct = agObj ? agObj.porcentaje : 92.5;
      if (agPct >= 95) {
        resultadoFinal = {
          nombre: "Plata Britannique / Britannia (Plata 958)",
          tipo: "Orfebrería Histórica & Platería Británica",
          subtitulo: "Ley tradicional británica de 95.84% de plata pura",
          calidad: "Norma Histórica Británica (1697)",
          color: "#F8FAFC",
          propiedad: "Mayor pureza y maleabilidad que la plata sterling con menor dureza",
          esPeligroso: false,
          fasePredominante: "Solución sólida rica en plata (α)",
          durezaEstimadaHV: 65,
          resistenciaTraccionMPa: 270,
          esFormulaExacta: true,
          gradoNorma: "Britannia Silver (95.84% Ag, 4.16% Cu)",
          descripcionMetalurgica: "Establecida por ley en Inglaterra en 1697 para evitar la fusión de moneda circulante en vajillas, ofrece un brillo superior y tono más blanco.",
          aplicacionesRecomendadas: ["Vajilla de plata fina tradicional", "Medallas conmemorativas de alta pureza"]
        };
      } else if (agPct <= 91) {
        resultadoFinal = {
          nombre: "Plata de Moneda (Coin Silver 900)",
          tipo: "Numismática & Acuñación Histórica",
          subtitulo: "Aleación estándar del 90% de plata y 10% de cobre para circulación",
          calidad: "Numismática Histórica (USA pre-1965)",
          color: "#CBD5E1",
          propiedad: "Gran resistencia al desgaste por fricción en el uso monetario",
          esPeligroso: false,
          fasePredominante: "Eutéctico Ag-Cu de alta dureza",
          durezaEstimadaHV: 95,
          resistenciaTraccionMPa: 350,
          esFormulaExacta: true,
          gradoNorma: "Coin Silver (90.0% Ag, 10.0% Cu)",
          descripcionMetalurgica: "Utilizada históricamente por cecas de todo el mundo para acuñar monedas de curso legal que soportasen el desgaste diario en transacciones comerciales.",
          aplicacionesRecomendadas: ["Acuñación de monedas de colección", "Medallística e incrustaciones decorativas"]
        };
      } else {
        resultadoFinal = {
          nombre: "Plata Esterlina / Sterling (Plata 925)",
          tipo: "Joyería / Alta Resistencia Mecánica",
          subtitulo: "Aleación noble endurecida por precipitación de cobre (92.5% Ag)",
          calidad: "ISO 925 / Sterling Silver Hallmarked",
          color: "#E2E8F0",
          propiedad: "Fase eutéctica Ag-Cu fina con alta reflectividad",
          esPeligroso: false,
          fasePredominante: "Solución sólida rica en Ag (α) + precipitados de Cu (β)",
          durezaEstimadaHV: 75,
          resistenciaTraccionMPa: 310,
          esFormulaExacta: true,
          gradoNorma: "ISO 925 (92.5% Ag, 7.5% Cu)",
          descripcionMetalurgica: "La plata pura es demasiado blanda. Con 92.5% de plata y 7.5% de cobre se logra la combinación perfecta de dureza, durabilidad y brillo especular.",
          aplicacionesRecomendadas: ["Orfebrería y platería fina", "Instrumentos musicales de viento (flautas)", "Contactos eléctricos"]
        };
      }
    }
  } else if (metalesUnicos.includes("au")) {
    const extraAu = metalesUnicos.filter(m => m !== "au");
    if (extraAu.includes("pd")) {
      resultadoFinal = {
        nombre: "Oro Blanco 18K con Paladio",
        tipo: "Joyería Fina Hipoalergénica",
        subtitulo: "Aleación áurea de 75% de oro blanqueada con paladio",
        calidad: "Oro 18K Hipoalergénico",
        color: "#E2E8F0",
        propiedad: "Tono gris claro natural sin requerir baño de rodio y 100% hipoalergénico",
        esPeligroso: false,
        fasePredominante: "Solución sólida FCC (Au-Pd)",
        durezaEstimadaHV: 145,
        resistenciaTraccionMPa: 420,
        esFormulaExacta: true,
        gradoNorma: "Oro Blanco 18K Paladio (75% Au, 10-15% Pd)",
        descripcionMetalurgica: "El paladio es un metal del grupo del platino que decolora el oro sin provocar las reacciones alérgicas cutáneas asociadas al níquel, logrando un tono gris platino muy elegante.",
        aplicacionesRecomendadas: ["Alianzas de boda de lujo", "Joyas para pieles sensibles", "Engastes de alta gama"]
      };
    } else if (extraAu.includes("ni")) {
      resultadoFinal = {
        nombre: "Oro Blanco 18K con Níquel",
        tipo: "Joyería Fina & Engaste de Diamantes",
        subtitulo: "Aleación 75% oro endurecida y blanqueada con níquel, cobre y zinc",
        calidad: "Oro Blanco Industrial 18K",
        color: "#F1F5F9",
        propiedad: "Rigidez estructural muy alta para sujeción segura de gemas",
        esPeligroso: false,
        fasePredominante: "Solución sólida FCC con endurecimiento por dispersión",
        durezaEstimadaHV: 185,
        resistenciaTraccionMPa: 530,
        esFormulaExacta: true,
        gradoNorma: "Oro Blanco 18K Níquel (75% Au, 10-13.5% Ni, 5-9% Cu, 3-5% Zn)",
        descripcionMetalurgica: "El níquel actúa como potente blanqueador y endurecedor. Requiere habitualmente un baño electrolítico superficial de rodio para conferir el acabado blanco brillante definitivo.",
        aplicacionesRecomendadas: ["Engastes de diamantes y solitarios", "Cajas de joyería fina"]
      };
    } else if (extraAu.includes("al")) {
      resultadoFinal = {
        nombre: "Oro Púrpura / Morado (Intermetálico AuAl₂)",
        tipo: "Bisutería Artística & Engastes Exóticos",
        subtitulo: "Compuesto intermetálico estequiométrico AuAl₂ de color morado",
        calidad: "Oro Intermetálico 79%",
        color: "#8B5CF6",
        propiedad: "Color púrpura brillante característico; alta fragilidad mecánica",
        esPeligroso: false,
        fasePredominante: "Fase intermetálica ordenada AuAl₂",
        durezaEstimadaHV: 230,
        resistenciaTraccionMPa: 180,
        esFormulaExacta: true,
        gradoNorma: "AuAl₂ (79% Au, 21% Al)",
        descripcionMetalurgica: "Es un compuesto intermetálico definido y no una solución sólida convencional. Al ser frágil, se emplea exclusivamente encapsulado en resinas o engastes sin tensión mecánica.",
        aplicacionesRecomendadas: ["Bisutería artística exclusiva", "Detalles decorativos en relojería de autor"]
      };
    } else if (extraAu.includes("ga")) {
      resultadoFinal = {
        nombre: "Oro Azul (Compuesto Intermetálico AuGa₂)",
        tipo: "Orfebrería de Vanguardia & Relojería",
        subtitulo: "Aleación de oro con galio de distintiva tonalidad azulada",
        calidad: "Oro Azul Intermetálico",
        color: "#3B82F6",
        propiedad: "Color azulado distintivo por formación de fase AuGa₂",
        esPeligroso: false,
        fasePredominante: "Fase intermetálica AuGa₂",
        durezaEstimadaHV: 190,
        resistenciaTraccionMPa: 220,
        esFormulaExacta: true,
        gradoNorma: "AuGa₂ (46% Au, 54% Ga)",
        descripcionMetalurgica: "El galio aleado con el oro en proporción estequiométrica genera un cambio en la absorción de luz superficial, resultando en un metal de tono azulado único.",
        aplicacionesRecomendadas: ["Esferas de relojería de alta gama", "Piezas de orfebrería experimental"]
      };
    } else {
      const auObj = metalObjects.find(m => m.metal.id === 'au');
      const auPct = auObj ? auObj.porcentaje : 75;
      if (auPct <= 65) {
        resultadoFinal = {
          nombre: "Oro Amarillo 14K (58.3% Au)",
          tipo: "Joyería Comercial & Alta Durabilidad",
          subtitulo: "Aleación 14/24 de oro fino con mayor proporción de cobre y plata",
          calidad: "Oro 585 (14 Quilates)",
          color: "#EAB308",
          propiedad: "Superior resistencia al rayado y al desgaste diario",
          esPeligroso: false,
          fasePredominante: "Solución sólida FCC equilibrada (Au-Cu-Ag)",
          durezaEstimadaHV: 135,
          resistenciaTraccionMPa: 410,
          esFormulaExacta: true,
          gradoNorma: "Oro 14K (58.3% Au, 29.0% Cu, 12.7% Ag)",
          descripcionMetalurgica: "Al reducir el contenido de oro al 58.3% e incrementar el cobre, se obtiene una aleación más económica y resistente al uso cotidiano, muy popular en joyería de consumo masivo.",
          aplicacionesRecomendadas: ["Anillos y cadenas de uso diario", "Joyería comercial de gran resistencia"]
        };
      } else if (metalesUnicos.includes("ag") && metalesUnicos.length === 1) {
        resultadoFinal = {
          nombre: "Oro Verde / Electrum (Oro 18K)",
          tipo: "Joyería Histórica & Orfebrería Artística",
          subtitulo: "Aleación binaria 75% oro y 25% plata de tonalidad verdosa",
          calidad: "Oro 18K 2N Verde",
          color: "#E6CA65",
          propiedad: "Tonalidad verdosa natural y gran ductilidad",
          esPeligroso: false,
          fasePredominante: "Solución sólida continua isomorfa FCC (Au-Ag)",
          durezaEstimadaHV: 95,
          resistenciaTraccionMPa: 310,
          esFormulaExacta: true,
          gradoNorma: "Oro Verde 18K (75% Au, 25% Ag)",
          descripcionMetalurgica: "La plata pura combinada con el oro en proporción 1:3 genera una coloración verdosa sutil, conocida históricamente en forma natural como electrum.",
          aplicacionesRecomendadas: ["Orfebrería artística con contrastes de color", "Joyería artesanal de diseño"]
        };
      } else {
        resultadoFinal = {
          nombre: "Oro Amarillo 18K (75.0% Au)",
          tipo: "Orfebrería Fina & Joyería Tradicional",
          subtitulo: "El estándar internacional de 18 quilates (750 milésimas)",
          calidad: "Oro 750 / 18K 3N Amarillo",
          color: "#F59E0B",
          propiedad: "Equilibrio perfecto entre pureza noble, color cálido y trabajabilidad",
          esPeligroso: false,
          fasePredominante: "Matriz monofásica FCC ternaria homogénea (Au-Ag-Cu)",
          durezaEstimadaHV: 140,
          resistenciaTraccionMPa: 420,
          esFormulaExacta: true,
          gradoNorma: "Oro 18K (75.0% Au, 12.5% Ag, 12.5% Cu)",
          descripcionMetalurgica: "Contiene exactamente 75% de oro fino complementado por partes iguales de plata y cobre para conferirle la resistencia mecánica necesaria para la joyería fina.",
          aplicacionesRecomendadas: ["Alta joyería y alianzas tradicionales", "Medallas de honor y orfebrería de culto"]
        };
      }
    }
  }

  // 3. DETECCIÓN DE ACEROS Y GRADOS INDUSTRIALES Y SUPERALEACIONES CERTIFICADAS
  else if (metalesUnicos.includes("fe") && slotNoMetal === "c") {
    const esPremium = Boolean(slotFundente);
    const extraAleantes = metalesUnicos.filter(m => m !== "fe");

    // Acero Inoxidable Marino AISI 316 (UNS S31600)
    if (extraAleantes.includes("cr") && extraAleantes.includes("ni") && extraAleantes.length >= 2) {
      resultadoFinal = {
        nombre: "Acero Inoxidable Marino (AISI 316 / UNS S31600)",
        tipo: "Ingeniería Química, Marina & Criogénica",
        subtitulo: "Matriz austenítica con adición de Molibdeno para máxima resistencia a cloruros",
        calidad: "ASTM A240 / Grado Marina Certificado",
        color: "#CBD5E1",
        propiedad: "Resistencia superior a picaduras ( pitting resistance equivalent PREN >= 25)",
        esPeligroso: false,
        fasePredominante: "Austenita γ (FCC) con precipitados estables",
        durezaEstimadaHV: 220,
        resistenciaTraccionMPa: 640,
        esFormulaExacta: true,
        gradoNorma: "UNS S31600 / AISI 316 (16Cr-10Ni-2Mo)",
        descripcionMetalurgica: "La incorporación de un 2-3% de Molibdeno al acero austenítico 18/8 proporciona una protección química excepcional contra la corrosión por agua de mar, sales deshelantes y ácidos sulfúricos diluidos.",
        aplicacionesRecomendadas: ["Equipamiento de plantas desalinizadoras", "Intercambiadores de calor marinos", "Implantes ortopédicos y quirúrgicos de fijación"]
      };
    }
    // Acero Inoxidable Austenítico AISI 304 (UNS S30400)
    else if (extraAleantes.includes("cr") && extraAleantes.includes("ni")) {
      resultadoFinal = {
        nombre: "Acero Inoxidable Austenítico (AISI 304 / UNS S30400)",
        tipo: "Ingeniería Alimentaria, Química & Arquitectónica",
        subtitulo: "Matriz austenítica estabilizada por níquel y pasivada por cromo",
        calidad: "ASTM A240 / Grado Alimentario",
        color: "#CBD5E1",
        propiedad: "Película pasivante auto-reparable de óxido de cromo (Cr2O3)",
        esPeligroso: false,
        fasePredominante: "Austenita γ (FCC) no magnética",
        durezaEstimadaHV: 210,
        resistenciaTraccionMPa: 620,
        esFormulaExacta: true,
        gradoNorma: "ASTM A240 / AISI 304 (18Cr-8Ni)",
        descripcionMetalurgica: "El cromo (18%) forma espontáneamente una barrera atómica invisible de Cr₂O₃, mientras que el níquel (8%) estabiliza la fase austenita hasta temperaturas criogénicas, otorgando ductilidad sobresaliente.",
        aplicacionesRecomendadas: ["Biorreactores e industrias lácteas", "Tanques de fermentación y arquitectura", "Instrumental quirúrgico esterilizable"]
      };
    }
    // Acero Inoxidable Martensítico AISI 420
    else if (extraAleantes.includes("cr") && !extraAleantes.includes("ni")) {
      resultadoFinal = {
        nombre: "Acero Inoxidable Martensítico (AISI 420)",
        tipo: "Cuchillería, Cirugía & Componentes de Desgaste",
        subtitulo: "Acero templable de alto contenido de cromo y carbono",
        calidad: "ASTM A276 / Grado Cuchillero",
        color: "#94A3B8",
        propiedad: "Templable térmicamente con alta dureza superficial",
        esPeligroso: false,
        fasePredominante: "Martensita revenida con carburos de cromo",
        durezaEstimadaHV: 480,
        resistenciaTraccionMPa: 1150,
        esFormulaExacta: true,
        gradoNorma: "AISI 420 (12-14% Cr, 0.15-0.40% C)",
        descripcionMetalurgica: "Al contener un mínimo de 12% de cromo, resiste la oxidación ambiental al tiempo que el carbono permite un temple por martensita que asegura un filo de corte duradero y alta resistencia mecánica.",
        aplicacionesRecomendadas: ["Hojas de bisturí y tijeras quirúrgicas", "Cuchillos de alta gama y moldes de inyección", "Ejes de bombas hidráulicas"]
      };
    }
    // Acero para Herramientas AISI D2
    else if (extraAleantes.includes("cr") && extraAleantes.length >= 2 && metalObjects.find(m => m.metal.id === 'fe')?.porcentaje! < 85) {
      resultadoFinal = {
        nombre: "Acero para Herramientas (AISI D2)",
        tipo: "Herramental Pesado & Troqueles de Corte",
        subtitulo: "Acero de alto carbono y alto cromo para trabajo en frío",
        calidad: "Grado Herramienta Industrial",
        color: "#64748B",
        propiedad: "Extremadamente resistente al desgaste abrasivo",
        esPeligroso: false,
        fasePredominante: "Carburos primarios M7C3 en matriz martensítica",
        durezaEstimadaHV: 720,
        resistenciaTraccionMPa: 1580,
        esFormulaExacta: true,
        gradoNorma: "AISI D2 / DIN 1.2379 (1.5C-12Cr-1Mo)",
        descripcionMetalurgica: "Contiene una altísima fracción volumétrica de carburos ricos en cromo que actúan como microescudos contra la abrasión severa en matrices de corte, cizallas y rodillos.",
        aplicacionesRecomendadas: ["Troqueles de embutido profundo", "Cuchillas circulares de corte industrial", "Rodillos formadores de chapa"]
      };
    }
    // Acero para Herramientas Rápido AISI M2
    else if (extraAleantes.includes("w")) {
      resultadoFinal = {
        nombre: "Acero para Herramientas Rápido (AISI M2 / Grado Wolframio-Molibdeno)",
        tipo: "Mecanizado Pesado & Corte a Alta Velocidad",
        subtitulo: "Carburos complejos de tungsteno y molibdeno en matriz templada",
        calidad: "AISI M2 / High Speed Steel (HSS)",
        color: "#475569",
        propiedad: "Dureza al rojo incandescente sin pérdida de temple a 600°C",
        esPeligroso: false,
        fasePredominante: "Carburos de alta temperatura M6C y MC en matriz martensítica",
        durezaEstimadaHV: 780,
        resistenciaTraccionMPa: 1650,
        esFormulaExacta: true,
        gradoNorma: "AISI M2 / DIN 1.3343 (6W-5Mo-4Cr-2V)",
        descripcionMetalurgica: "El tungsteno y el molibdeno otorgan una dureza en caliente excepcional (red hardness), impidiendo que la herramienta pierda filo por fricción a altas revoluciones de corte.",
        aplicacionesRecomendadas: ["Brocas helicoidales y machos de roscar", "Fresas de alta velocidad", "Cuchillas de torno para metales duros"]
      };
    }
    // Fundición Gris ASTM A48 Class 30
    else if (metalObjects.find(m => m.metal.id === 'fe')?.porcentaje! <= 94 && metalObjects.find(m => m.metal.id === 'fe')?.porcentaje! >= 90) {
      resultadoFinal = {
        nombre: "Fundición Gris (ASTM A48 Class 30)",
        tipo: "Siderurgia de Modeldeo & Amortiguación de Vibraciones",
        subtitulo: "Aleación Fe-C-Si con grafito laminar libre",
        calidad: "ASTM A48 / Clase 30",
        color: "#334155",
        propiedad: "Excelente amortiguación acústica y de vibraciones mecánicas",
        esPeligroso: false,
        fasePredominante: "Láminas de grafito en matriz perlítica-ferrítica",
        durezaEstimadaHV: 200,
        resistenciaTraccionMPa: 210,
        esFormulaExacta: true,
        gradoNorma: "ASTM A48 Class 30 (2.5-4.0% C, 1.0-3.0% Si)",
        descripcionMetalurgica: "Las láminas de grafito actúan como discontinuidades internas que absorben la energía vibratoria de forma sobresaliente, convirtiéndola en el material insustituible para bancadas de máquinas.",
        aplicacionesRecomendadas: ["Bloques de motor de combustión interna", "Bancadas de tornos y fresadoras", "Discos de freno automotrices"]
      };
    }
    // Acero al Carbono AISI 1020 o 1045
    else {
      const cObj = metalObjects.find(m => m.metal.id === 'fe');
      const isAISI1045 = cObj && cObj.porcentaje < 99.5; 
      resultadoFinal = {
        nombre: isAISI1045 ? "Acero al Carbono Estructural (AISI 1045)" : "Acero al Carbono Blando (AISI 1020)",
        tipo: "Siderurgia Estructural & Mecánica",
        subtitulo: isAISI1045 ? "Acero de medio carbono para templados y ejes" : "Acero al carbono de bajo límite elástico y gran soldabilidad",
        calidad: "AISI / SAE Grado Industrial",
        color: "#64748B",
        propiedad: "Endurecimiento por solución intersticial de carbono en red BCC de hierro",
        esPeligroso: false,
        fasePredominante: "Ferrita α y perlita laminar",
        durezaEstimadaHV: isAISI1045 ? 190 : 135,
        resistenciaTraccionMPa: isAISI1045 ? 580 : 420,
        esFormulaExacta: true,
        gradoNorma: isAISI1045 ? "AISI 1045 (0.43-0.50% C)" : "AISI 1020 (0.18-0.23% C)",
        descripcionMetalurgica: "El carbono disuelto en la red cristalina del hierro confiere resistencia mecánica moderada y excelente capacidad de conformado en frío y soldadura por arco.",
        aplicacionesRecomendadas: ["Ejes de transmisión y bielas mecánicas", "Estructuras de edificios y perfiles en U", "Pernos y tornillería de resistencia estándar"]
      };
    }
  }

  // 4. GRADO AEROESPACIAL: TITANIO Y ALUMINIO Y SUPERALEACIONES (Inconel, Monel, Nitinol)
  else if (metalesUnicos.includes("ni")) {
    const extraNi = metalesUnicos.filter(m => m !== "ni");
    if (extraNi.includes("ti") && metalesUnicos.length === 2) {
      resultadoFinal = {
        nombre: "Nitinol (Aleación Memoria de Forma Ni-Ti)",
        tipo: "Ingeniería Biomédica & Aeroespacial Inteligente",
        subtitulo: "Aleación equiatómica con efecto de memoria de forma y superelasticidad",
        calidad: "Grado Médico / Aeroespacial",
        color: "#78909C",
        propiedad: "Recuperación elástica de hasta el 8% de deformación por transformación martensítica termoelástica",
        esPeligroso: false,
        fasePredominante: "Austenita B2 / Martensita maclada",
        durezaEstimadaHV: 310,
        resistenciaTraccionMPa: 950,
        esFormulaExacta: true,
        gradoNorma: "ASTM F2063 / UNS N01515 (55Ni-45Ti)",
        descripcionMetalurgica: "Presenta una transformación de fase reversible inducida por temperatura o tensión mecánica, permitiendo doblar el material a baja temperatura y recuperar su forma original al calentarlo.",
        aplicacionesRecomendadas: ["Stents vasculares y ortodoncia", "Actuadores aeroespaciales de despliegue", "Monturas de gafas flexibles irrompibles"]
      };
    } else if (extraNi.includes("cr") && extraNi.includes("mo")) {
      resultadoFinal = {
        nombre: "Inconel 625 (Superaleación de Níquel-Cromo-Molibdeno)",
        tipo: "Aeroespacial, Nuclear & Ambientes Corrosivos Extremos",
        subtitulo: "Superaleación austenítica reforzada por solución sólida de molibdeno y niobio",
        calidad: "ASTM B443 / UNS N06625",
        color: "#94A3B8",
        propiedad: "Resistencia inalterable a la termofluencia (creep) y oxidación a 1000°C",
        esPeligroso: false,
        fasePredominante: "Matriz austenítica rica en Ni-Cr con carburos secundarios",
        durezaEstimadaHV: 290,
        resistenciaTraccionMPa: 930,
        esFormulaExacta: true,
        gradoNorma: "UNS N06625 / Inconel 625 (>=58Ni-22Cr-9Mo)",
        descripcionMetalurgica: "El níquel actúa como base de alta estabilidad térmica complementado por cromo y molibdeno, soportando entornos ácidos humeantes y gases de combustión supersónicos sin pérdida de resistencia.",
        aplicacionesRecomendadas: ["Sistemas de escape de motores cohete", "Toberas de turbinas de gas industriales", "Tuberías de extracción de gas agudo"]
      };
    } else if (extraNi.includes("cu")) {
      resultadoFinal = {
        nombre: "Monel 400 (Aleación de Níquel-Cobre)",
        tipo: "Ingeniería Naval, Química & Marina",
        subtitulo: "Solución sólida binaria de alta resistencia y resistencia al agua de mar",
        calidad: "ASTM B127 / UNS N04400",
        color: "#8492A6",
        propiedad: "Inmune al agrietamiento por corrosión bajo tensión en entornos marinos",
        esPeligroso: false,
        fasePredominante: "Solución sólida FCC continua (Ni-Cu)",
        durezaEstimadaHV: 180,
        resistenciaTraccionMPa: 550,
        esFormulaExacta: true,
        gradoNorma: "UNS N04400 / Monel 400 (>=63Ni-30Cu)",
        descripcionMetalurgica: "Combina la alta resistencia a la corrosión del níquel con la ductilidad y facilidad de conformado del cobre, soportando vapor sobrecalentado y ácidos fluorhídricos.",
        aplicacionesRecomendadas: ["Ejes de hélice y bombas marinas", "Válvulas y tuberías de plantas químicas", "Equipos de desalinización de agua"]
      };
    } else {
      resultadoFinal = {
        nombre: "Inconel 718 (Superaleación Aeroespacial)",
        tipo: "Motores de Aviación & Turbinas de Gas",
        subtitulo: "Superaleación de níquel endurecida por precipitación de fase gamma doble prima",
        calidad: "AMS 5662 / UNS N07718",
        color: "#64748B",
        propiedad: "Resistencia excepcional a la fatiga y tracción hasta 700°C",
        esPeligroso: false,
        fasePredominante: "Matriz FCC con precipitados coherentes de Ni₃(Nb,Ti,Al)",
        durezaEstimadaHV: 390,
        resistenciaTraccionMPa: 1350,
        esFormulaExacta: true,
        gradoNorma: "UNS N07718 / Inconel 718 (52Ni-19Cr-5Nb-3Mo)",
        descripcionMetalurgica: "Mediante un tratamiento térmico de envejecimiento se precipitan partículas nanométricas coherentes que bloquean las dislocaciones a temperaturas donde los aceros ordinarios fluyen plásticamente.",
        aplicacionesRecomendadas: ["Discos de turbina de aviación comercial", "Componentes de motores cohete", "Sujetadores estructurales de alta temperatura"]
      };
    }
  }

  // 5. GRADO AEROESPACIAL: TITANIO Y ALUMINIO
  else if (metalesUnicos.includes("ti") && metalesUnicos.includes("al")) {
    resultadoFinal = {
      nombre: "Titanio Grado 5 (Ti-6Al-4V / UNS R56400)",
      tipo: "Ingeniería Aeroespacial, Biomédica & Defensa",
      subtitulo: "Aleación bimodal alfa-beta de máxima relación resistencia-peso",
      calidad: "ASTM B265 / Grado 5 Aeroespacial",
      color: "#78879B",
      propiedad: "Inmunidad a la fatiga en ciclos mecánicos severos con densidad de 4.43 g/cm³",
      esPeligroso: false,
      fasePredominante: "Fase alfa (HCP) + fase beta (BCC)",
      durezaEstimadaHV: 340,
      resistenciaTraccionMPa: 980,
      esFormulaExacta: true,
      gradoNorma: "AMS 4911 / ASTM B265 Grado 5 (6Al-4V)",
      descripcionMetalurgica: "El aluminio estabiliza la fase alfa y el vanadio estabiliza la fase beta, logrando un equilibrio óptimo entre ligereza, resistencia a la tracción y resistencia a la corrosión biológica.",
      aplicacionesRecomendadas: ["Estructuras de fuselaje de aviones de combate", "Prótesis de cadera y rodilla", "Componentes de motores de altas prestaciones"]
    };
  }

  // 6. BRONCES Y LATONES Y ALEACIONES DE COBRE
  else if (metalesUnicos.includes("cu")) {
    const extraCu = metalesUnicos.filter(m => m !== "cu");
    if (extraCu.includes("zn") && extraCu.includes("ni")) {
      resultadoFinal = {
        nombre: "Alpaca / Plata Alemana (C75200)",
        tipo: "Orfebrería, Instrumentos Musicales & Cerrajería Fina",
        subtitulo: "Aleación ternaria de cobre, níquel y zinc de aspecto plateado",
        calidad: "ASTM B122 / UNS C75200",
        color: "#E2E8F0",
        propiedad: "Color blanco plateado inalterable y gran resistencia al deslustre",
        esPeligroso: false,
        fasePredominante: "Solución sólida monofásica alfa (FCC)",
        durezaEstimadaHV: 140,
        resistenciaTraccionMPa: 450,
        esFormulaExacta: true,
        gradoNorma: "UNS C75200 (65Cu-18Ni-17Zn)",
        descripcionMetalurgica: "A pesar de su denominación comercial 'plata alemana', no contiene plata real; el níquel blanquea el cobre y el zinc proporciona la maleabilidad necesaria para instrumentos de viento y vajilla.",
        aplicacionesRecomendadas: ["Llaves de instrumentos musicales (flautas y saxofones)", "Vajilla de alta gama y cubertería alpaca", "Elementos decorativos arquitectónicos"]
      };
    } else if (extraCu.includes("zn")) {
      const zObj = metalObjects.find(m => m.metal.id === 'zn');
      const isCartridge = zObj && zObj.porcentaje <= 32;
      resultadoFinal = {
        nombre: isCartridge ? "Latón Cartucho (C26000)" : "Latón Comercial de Fácil Mecanizado (C36000)",
        tipo: isCartridge ? "Embutición Profunda & Munición" : "Mecanizado en Torno Automático",
        subtitulo: isCartridge ? "70% Cobre - 30% Zinc de ductilidad excepcional" : "Latón con adición de plomo para viruta quebradiza",
        calidad: "ASTM B36 / UNS C26000 o C36000",
        color: "#EAB308",
        propiedad: isCartridge ? "Gran capacidad de deformación plástica sin agrietarse" : "Maquinabilidad excelente con viruta corta",
        esPeligroso: false,
        fasePredominante: "Solución sólida alfa (FCC)",
        durezaEstimadaHV: 110,
        resistenciaTraccionMPa: 380,
        esFormulaExacta: true,
        gradoNorma: isCartridge ? "UNS C26000 (70Cu-30Zn)" : "UNS C36000 (61.5Cu-35.5Zn-3Pb)",
        descripcionMetalurgica: "El zinc en solución sólida con el cobre otorga un color dorado brillante y una conformabilidad inigualable para cartuchería militar y componentes sanitarios.",
        aplicacionesRecomendadas: [isCartridge ? "Casquillos de munición militar y deportiva" : "Racores, válvulas y grifería sanitaria", "Radiadores de automoción y tornillería"]
      };
    } else if (extraCu.includes("al")) {
      resultadoFinal = {
        nombre: "Bronce al Aluminio (C95400)",
        tipo: "Ingeniería Naval, Maquinaria Pesada & Engranajes",
        subtitulo: "Aleación de cobre con alta resistencia mecánica y al agua de mar",
        calidad: "ASTM B505 / UNS C95400",
        color: "#C59B27",
        propiedad: "Resistencia al desgaste por fricción e impacto superior a muchos aceros",
        esPeligroso: false,
        fasePredominante: "Fase alfa + eutectoide gamma 2 en matriz rica en cobre",
        durezaEstimadaHV: 190,
        resistenciaTraccionMPa: 590,
        esFormulaExacta: true,
        gradoNorma: "UNS C95400 (83Cu-11Al-4Fe)",
        descripcionMetalurgica: "El aluminio confiere al cobre una resistencia a la tracción comparable al acero al carbono y una película superficial de alúmina que protege contra la corrosión marina.",
        aplicacionesRecomendadas: ["Hélices de barcos y bombas de achique", "Engranajes sinfín de alta carga", "Placas de desgaste para prensas industriales"]
      };
    } else if (extraCu.includes("ni")) {
      resultadoFinal = {
        nombre: "Cuproníquel (C71500 - 70/30)",
        tipo: "Ingeniería Naval & Tuberías de Agua Salada",
        subtitulo: "Solución sólida de cobre y níquel altamente resistente a la bioincrustación",
        calidad: "ASTM B111 / UNS C71500",
        color: "#94A3B8",
        propiedad: "Inmunidad al agrietamiento por tensión en presencia de agua marina",
        esPeligroso: false,
        fasePredominante: "Solución sólida isomorfa continua FCC",
        durezaEstimadaHV: 130,
        resistenciaTraccionMPa: 450,
        esFormulaExacta: true,
        gradoNorma: "UNS C71500 (70Cu-30Ni)",
        descripcionMetalurgica: "El níquel disuelto en el cobre previene la colonización de organismos marinos (biofouling) y la corrosión por velocidad de flujo en sistemas de refrigeración de buques.",
        aplicacionesRecomendadas: ["Condensadores de centrales termoeléctricas marinas", "Tuberías de conducción de agua de mar", "Monedas de baja denominación"]
      };
    } else {
      resultadoFinal = {
        nombre: "Bronce Fosforoso / al Estaño (C51000)",
        tipo: "Tribología, Resortes & Cojinetes",
        subtitulo: "Aleación de cobre y estaño desoxidada con fósforo",
        calidad: "ASTM B103 / UNS C51000",
        color: "#D97706",
        propiedad: "Alto límite elástico y resistencia a la fatiga por flexión repetida",
        esPeligroso: false,
        fasePredominante: "Fase alfa (Cu) con trazas de fosfuro de cobre",
        durezaEstimadaHV: 160,
        resistenciaTraccionMPa: 480,
        esFormulaExacta: true,
        gradoNorma: "UNS C51000 (94.8Cu-5.0Sn-0.2P)",
        descripcionMetalurgica: "El estaño endurece el cobre por solución sólida y el fósforo actúa como desoxidante y endurecedor de grano, proporcionando un resorte de excelente durabilidad.",
        aplicacionesRecomendadas: ["Resortes de contactos eléctricos y membranillas", "Bujes y cojinetes sin fricción", "Cuerdas de guitarras acústicas"]
      };
    }
  }

  // 7. ALEACIONES DE ALUMINIO LIVIANAS (AA 2024, 6061, 7075, 5083)
  else if (metalesUnicos.includes("al")) {
    const extraAl = metalesUnicos.filter(m => m !== "al");
    if (extraAl.includes("cu") && extraAl.includes("mg")) {
      resultadoFinal = {
        nombre: "Duraluminio (AA 2024-T3)",
        tipo: "Estructuras Aeronáuticas & Fuselajes",
        subtitulo: "Aleación ligera endurecible por envejecimiento térmico (precipitación Al-Cu)",
        calidad: "ASTM B209 / AA 2024",
        color: "#94A3B8",
        propiedad: "Relación resistencia-peso sobresaliente para estructuras sometidas a fatiga",
        esPeligroso: false,
        fasePredominante: "Matriz α-Al con precipitados nanométricos de Al₂Cu",
        durezaEstimadaHV: 120,
        resistenciaTraccionMPa: 470,
        esFormulaExacta: true,
        gradoNorma: "AA 2024 (4.4Cu-1.5Mg-0.6Mn)",
        descripcionMetalurgica: "El tratamiento de temple y envejecimiento natural precipita compuestos intermetálicos que bloquean las dislocaciones del aluminio puro, creando el material estándar para alas y fuselajes.",
        aplicacionesRecomendadas: ["Revestimientos y largueros de alas de aviones", "Estructuras de camiones cisterna", "Componentes sometidos a tracción estática"]
      };
    } else if (extraAl.includes("zn") && extraAl.includes("mg")) {
      resultadoFinal = {
        nombre: "Aluminio Aeroespacial (AA 7075-T6)",
        tipo: "Aeroespacial de Alto Rendimiento & Estructuras Militares",
        subtitulo: "Aleación de aluminio de ultra-alta resistencia con zinc y magnesio",
        calidad: "ASTM B221 / AA 7075",
        color: "#78909C",
        propiedad: "Resistencia mecánica comparable a muchos aceros estructurales con un tercio de su peso",
        esPeligroso: false,
        fasePredominante: "Matriz de aluminio con precipitados coherentes de MgZn₂",
        durezaEstimadaHV: 175,
        resistenciaTraccionMPa: 570,
        esFormulaExacta: true,
        gradoNorma: "AA 7075 (5.6Zn-2.5Mg-1.6Cu)",
        descripcionMetalurgica: "El zinc y el magnesio forman el sistema de endurecimiento por precipitación más potente del aluminio, logrando límites elásticos superiores a 500 MPa.",
        aplicacionesRecomendadas: ["Cuadernas de carga y componentes estructurales de misiles", "Engranajes de alta resistencia y chasis de competición", "Componentes de escalada y piñonería"]
      };
    } else if (extraAl.includes("mg") && !extraAl.includes("cu") && !extraAl.includes("zn")) {
      resultadoFinal = {
        nombre: "Aluminio Marítimo (AA 5083-H116)",
        tipo: "Construcción Naval, Criogenia & Tanques GNL",
        subtitulo: "Aleación de aluminio y magnesio no tratable térmicamente de gran soldabilidad",
        calidad: "ASTM B928 / AA 5083",
        color: "#CBD5E1",
        propiedad: "Resistencia sobresaliente a la corrosión marina y soldabilidad sin pérdida de propiedades",
        esPeligroso: false,
        fasePredominante: "Solución sólida de Mg en red FCC de Aluminio",
        durezaEstimadaHV: 95,
        resistenciaTraccionMPa: 315,
        esFormulaExacta: true,
        gradoNorma: "AA 5083 (4.4Mg-0.7Mn)",
        descripcionMetalurgica: "El magnesio en solución sólida endurece el aluminio sin requerir temple térmico, manteniendo una resistencia impecable a la corrosión galvánica en agua salada.",
        aplicacionesRecomendadas: ["Cascos de barcos patrulleros y yates", "Superestructuras de buques", "Tanques de almacenamiento criogénico de GNL"]
      };
    } else {
      resultadoFinal = {
        nombre: "Aluminio Estructural (AA 6061-T6)",
        tipo: "Ingeniería General, Perfiles Extruidos & Automoción",
        subtitulo: "Aleación de aluminio con magnesio y silicio de uso universal",
        calidad: "ASTM B221 / AA 6061",
        color: "#A0AEC0",
        propiedad: "Excelente resistencia a la corrosión, soldabilidad y maquinabilidad equilibrada",
        esPeligroso: false,
        fasePredominante: "Precipitados finos de siliciuro de magnesio (Mg₂Si)",
        durezaEstimadaHV: 105,
        resistenciaTraccionMPa: 310,
        esFormulaExacta: true,
        gradoNorma: "AA 6061 (1.0Mg-0.6Si-0.28Cu-0.2Cr)",
        descripcionMetalurgica: "La combinación de magnesio y silicio permite endurecer el material mediante la formación de Mg₂Si por tratamiento térmico, siendo la aleación más extruida del planeta.",
        aplicacionesRecomendadas: ["Perfiles estructurales y marcos arquitectónicos", "Cuadros de bicicletas de alta gama", "Puentes peatonales y tuberías de conducción"]
      };
    }
  }

  // 8. FÓRMULA POR DEFECTO / ALEACIÓN EXPERIMENTAL COMPLEJA
  else {
    const listaNombres = metalesOrdenados.map(id => {
      const el = gameDatabase.metals.find(m => m.id === id);
      return el ? el.symbol : id.toUpperCase();
    }).join(" - ");

    resultadoFinal = {
      nombre: `Aleación Compleja (${listaNombres})`,
      tipo: fundenteObj 
        ? "Aleación Premium (Modificada por Fundente)" 
        : "Aleación Experimental Multicomponente",
      subtitulo: "Solución sólida calculada dinámicamente según densidad y masa",
      calidad: fundenteObj ? "Pureza Mejorada por Fundente Activo" : "Aleación en Desarrollo",
      color: colorAleacion,
      propiedad: "Calculada dinámicamente por la regla de mezclas para densidad y temperatura de fusión",
      esPeligroso: false,
      fasePredominante: "Matriz polifásica multicomponente en solución sólida",
      durezaEstimadaHV: Math.round(durezaEstimada + (metalesUnicos.length * 28)),
      resistenciaTraccionMPa: Math.round(resistenciaTraccion + (metalesUnicos.length * 75)),
      esFormulaExacta: false,
      descripcionMetalurgica: `Fórmula multicomponente formulada con ${metalesLimpios.length} cargas metálicas. La combinación de metales produce una red cristalina híbrida cuya densidad volumétrica calculada es de ${densidadCalculada} g/cm³ y punto de fusión aproximado de ${puntoFusionEstimado} °C.`,
      aplicacionesRecomendadas: ["Investigación en nuevos materiales", "Prototipado rápido de aleaciones de alta entropía (HEA)"]
    };
  }

  // Apply Non-metal modifications
  let efectoNoMetal = undefined;
  if (noMetalObj) {
    efectoNoMetal = `${noMetalObj.name}: ${noMetalObj.role} (${noMetalObj.effectOnMatrix})`;
    if (noMetalObj.id === 'c') {
      resultadoFinal.durezaEstimadaHV = (resultadoFinal.durezaEstimadaHV || 100) + 70;
      resultadoFinal.resistenciaTraccionMPa = (resultadoFinal.resistenciaTraccionMPa || 300) + 140;
    } else if (noMetalObj.id === 'b') {
      resultadoFinal.durezaEstimadaHV = (resultadoFinal.durezaEstimadaHV || 100) + 95;
    } else if (noMetalObj.id === 'si') {
      resultadoFinal.puntoFusionEstimado = (resultadoFinal.puntoFusionEstimado || 1000) - 20;
    }
  }

  // Apply Flux modifications
  let bonusFundente = undefined;
  if (fundenteObj) {
    bonusFundente = `${fundenteObj.name} (${fundenteObj.formula}): ${fundenteObj.bonus} — ${fundenteObj.chemicalAction}`;
  }

  return {
    nombre: resultadoFinal.nombre || "Aleación No Determinada",
    tipo: resultadoFinal.tipo || "Aleación Experimental",
    subtitulo: resultadoFinal.subtitulo,
    calidad: resultadoFinal.calidad,
    color: resultadoFinal.color || colorAleacion,
    propiedad: resultadoFinal.propiedad || "Propiedades calculadas por mezcla",
    alerta: resultadoFinal.alerta,
    esPeligroso: Boolean(resultadoFinal.esPeligroso),
    densidadCalculada,
    puntoFusionEstimado,
    rangoFusionSolidus,
    rangoFusionLiquidus,
    durezaEstimadaHV: resultadoFinal.durezaEstimadaHV || 120,
    resistenciaTraccionMPa: resultadoFinal.resistenciaTraccionMPa || 350,
    fasePredominante: resultadoFinal.fasePredominante || fasePredominante,
    descripcionMetalurgica: resultadoFinal.descripcionMetalurgica || "",
    metalesUtilizados: metalObjects,
    noMetalUtilizado: noMetalObj,
    fundenteUtilizado: fundenteObj,
    bonusFundente,
    efectoNoMetal,
    totalMetalesOcupados: totalSlotsOcupados,
    esFormulaExacta: Boolean(resultadoFinal.esFormulaExacta),
    gradoNorma: resultadoFinal.gradoNorma,
    aplicacionesRecomendadas: resultadoFinal.aplicacionesRecomendadas || ["Prototipado experimental de laboratorio"]
  };
}
