import { useState, useEffect } from 'react';

export type GpuTier = 'none' | 'light_2d' | 'heavy_webgl' | 'compute_sim';

export interface MicroserviceInstance {
  id: string;
  number: string;
  title: string;
  shortName: string;
  serviceCategory: string;
  route: string;
  domainName: string;
  virtualUrl: string;
  badgeTag: string;
  description: string;
  gpuTier: GpuTier;
  spuAllocationPct: number;
  cpuLoadEstPct: number;
  memoryEstMB: number;
  activeFeatures: string[];
  isolatedFrom: string[];
}

export const REGISTERED_INSTANCES: MicroserviceInstance[] = [
  {
    id: 'workspace',
    number: 'WEB 01',
    title: 'Laboratorio Químico & Logística ADR',
    shortName: 'Laboratorio',
    serviceCategory: 'Sitio Web Químico & Fichas',
    route: '/workspace',
    domainName: 'laboratorio.quimica.net',
    virtualUrl: 'espiquumeyria://laboratorio.quimica.net',
    badgeTag: '.NET / STOICH',
    description: 'Simulador termodinámico de mezclas, cálculo estequiométrico de reactivos limitantes, fichas NFPA 704 y compatibilidad de transporte ADR.',
    gpuTier: 'none',
    spuAllocationPct: 0,
    cpuLoadEstPct: 8,
    memoryEstMB: 18,
    activeFeatures: ['Catálogo de 15+ reactivos', 'Cálculo de entalpía ΔH', 'Calculadora de diluciones', 'Sincronización Firestore/Drive'],
    isolatedFrom: ['Contexto WebGL Three.js', 'Bucle numérico Verlet'],
  },
  {
    id: 'atom-builder',
    number: 'WEB 02',
    title: 'Constructor Atómico Cuántico 3D',
    shortName: 'Constructor 3D',
    serviceCategory: 'Sitio Web Cuántico & Densidad |ψ|²',
    route: '/atom-builder',
    domainName: 'cuantica-3d.atom.io',
    virtualUrl: 'espiquumeyria://cuantica-3d.atom.io',
    badgeTag: '.IO / QUANTUM',
    description: 'Visualizador cuántico de nubes de probabilidad orbitales (1s, 2s, 2p), transmutación nuclear por desintegración beta, y corte transversal 2D con amortiguamiento de Coulomb.',
    gpuTier: 'heavy_webgl',
    spuAllocationPct: 65,
    cpuLoadEstPct: 15,
    memoryEstMB: 48,
    activeFeatures: ['Nubes |ψ|² procedurales', 'Validador del Valle de Estabilidad', 'Corte 2D con repulsión Coulomb', 'Biblioteca de descubrimientos'],
    isolatedFrom: ['Simulador Verlet incrustado (ELIMINADO para evitar colisión de WebGL)', 'Subrutinas de logística química'],
  },
  {
    id: 'physics-engine',
    number: 'WEB 03',
    title: 'Motor Físico Unificado 3D (Verlet & Lorentz)',
    shortName: 'Motor Físico 3D',
    serviceCategory: 'Sitio Web Dinámico SI & Colisiones',
    route: '/physics-engine',
    domainName: 'motor-fisico.verlet.engine',
    virtualUrl: 'espiquumeyria://motor-fisico.verlet.engine',
    badgeTag: '.ENGINE / SI',
    description: 'Simulación de 8 leyes físicas fundamentales: integración de Verlet con constantes SI, fuerza de Lorentz electromagnética, dinámica orbital de Bohr y proyección perspectiva 2D.',
    gpuTier: 'heavy_webgl',
    spuAllocationPct: 70,
    cpuLoadEstPct: 22,
    memoryEstMB: 54,
    activeFeatures: ['Sub-stepping de Verlet', 'Campos E y B cruzados (Thomson)', 'Colisión con rebote y amortiguamiento', 'Proyección analítica 2D'],
    isolatedFrom: ['Contexto 3D del Constructor Atómico', 'Sistemas de bases de datos'],
  },
  {
    id: 'astrophysics',
    number: 'WEB 04',
    title: 'Nucleosíntesis Estelar & Astrofísica',
    shortName: 'Astrofísica',
    serviceCategory: 'Sitio Web Termonuclear & Abundancia',
    route: '/astrophysics',
    domainName: 'astrofisica.estelar.space',
    virtualUrl: 'espiquumeyria://astrofisica.estelar.space',
    badgeTag: '.SPACE / ASTR',
    description: 'Evolución termonuclear de secuencias estelares, ciclo protón-protón solar, proceso triple-alfa de Fred Hoyle, fisión alfa y abundancia cósmica.',
    gpuTier: 'light_2d',
    spuAllocationPct: 12,
    cpuLoadEstPct: 10,
    memoryEstMB: 24,
    activeFeatures: ['Visualizador dinámico p-p chain', 'Simulador de temperatura del núcleo', 'Gráficas Recharts de abundancia', 'Herramienta de fisión alfa'],
    isolatedFrom: ['Motores Three.js pesados', 'Módulos de transporte terrestre'],
  },
  {
    id: 'periodic-table',
    number: 'WEB 05',
    title: 'Tabla Periódica Interactiva',
    shortName: 'Tabla Periódica',
    serviceCategory: 'Sitio Web Espectral & Estructura Atómica',
    route: '/periodic-table',
    domainName: 'tablaperiodica.elementos.sci',
    virtualUrl: 'espiquumeyria://tablaperiodica.elementos.sci',
    badgeTag: '.SCI / 118Z',
    description: '118 elementos químicos completos con propiedades termodinámicas, configuración electrónica, radios de van der Waals y enlace directo a mundos cuánticos.',
    gpuTier: 'none',
    spuAllocationPct: 0,
    cpuLoadEstPct: 6,
    memoryEstMB: 16,
    activeFeatures: ['Matriz periódica 18 columnas', 'Filtrado por familias y bloques s,p,d,f', 'Inspección orbital completa', 'Buscador instantáneo Z'],
    isolatedFrom: ['Procesos de renderizado 3D continuo', 'Cálculos de colisiones'],
  },
  {
    id: 'chat',
    number: 'WEB 06',
    title: 'Espiqumeyria AI - Gemini Science',
    shortName: 'Espiqumeyria AI',
    serviceCategory: 'Sitio Web Inteligencia Científica Gemini',
    route: '/chat',
    domainName: 'gemini.espiqumeyria.sci',
    virtualUrl: 'espiquumeyria://gemini.espiqumeyria.sci',
    badgeTag: '.AI / GEMINI',
    description: 'Espacio de chat unificado con selector de dominios: Química Orgánica, Química Inorgánica, Astrofísica & Cuántica y Laboratorio con historial de hilos y exportación.',
    gpuTier: 'none',
    spuAllocationPct: 0,
    cpuLoadEstPct: 10,
    memoryEstMB: 20,
    activeFeatures: ['Selector de dominios en tiempo real', 'Historial de hilos persistente', 'Exportación en Markdown y JSON', 'Síntesis de voz y KaTeX'],
    isolatedFrom: ['Tuberías WebGL Three.js pesadas', 'Simulador Verlet continuo'],
  },
  {
    id: 'regulations',
    number: 'WEB 09',
    title: 'Normativa ADR y Matriz de Riesgo',
    shortName: 'Normativa ADR',
    serviceCategory: 'Sitio Web de Seguridad & Segregación',
    route: '/regulations',
    domainName: 'normativa-adr.seguridad.gov',
    virtualUrl: 'espiquumeyria://normativa-adr.seguridad.gov',
    badgeTag: '.GOV / ADR8.6',
    description: 'Manual técnico de transporte europeo de materias peligrosas, clasificación oficial de túneles A-E, matriz estricta de incompatibilidad y evaluación de riesgo.',
    gpuTier: 'none',
    spuAllocationPct: 0,
    cpuLoadEstPct: 4,
    memoryEstMB: 14,
    activeFeatures: ['Clasificación de túneles A hasta E', 'Matriz de incompatibilidad química', 'Radar de riesgo por reactivo', 'Reglas de embalaje y cisterna'],
    isolatedFrom: ['Motores gráficos 3D', 'Servicios de física de partículas'],
  },
  {
    id: 'metallurgy',
    number: 'WEB 10',
    title: 'Aleaciones Metálicas & Metalurgia Educativa',
    shortName: 'Aleaciones Metálica',
    serviceCategory: 'Sitio Web Metalúrgico & Termodinámica de Fases',
    route: '/metallurgy',
    domainName: 'metalurgia.aleaciones.tech',
    virtualUrl: 'espiquumeyria://metalurgia.aleaciones.tech',
    badgeTag: '.TECH / METALLURGY',
    description: 'Crisol interactivo de fundición con cálculo dinámico de densidad promedio, punto de fusión, detección de amalgamas, aceros especiales con fundente activo y biblioteca de metales.',
    gpuTier: 'light_2d',
    spuAllocationPct: 15,
    cpuLoadEstPct: 8,
    memoryEstMB: 22,
    activeFeatures: ['Crisol termodinámico dinámico', 'Regla de mezclas para densidad (ρ)', 'Detección de amalgamas y aceros', 'Alerta toxicológica para mercurio (Hg)', 'Biblioteca técnica desplegable'],
    isolatedFrom: ['Simulador Verlet incrustado', 'Módulos de física estelar'],
  },
  {
    id: 'molecular-viewer',
    number: 'WEB 11',
    title: 'Visualizador Molecular 2D y 3D',
    shortName: 'Moléculas 2D/3D',
    serviceCategory: 'Sitio Web Estructura Química & Enlace Espacial',
    route: '/molecular-viewer',
    domainName: 'moleculas.quimica-3d.sci',
    virtualUrl: 'espiquumeyria://moleculas.quimica-3d.sci',
    badgeTag: '.SCI / MOL-3D',
    description: 'Estructura exacta de sales iónicas (NaCl red FCC), alcoholes (metanol, etanol, glicerol) y orgánicos complejos (etano, butano, triglicéridos) en modalidad 2D esquemática y 3D espacial.',
    gpuTier: 'heavy_webgl',
    spuAllocationPct: 60,
    cpuLoadEstPct: 14,
    memoryEstMB: 40,
    activeFeatures: ['Vista 2D diagramas de enlace paso a paso', 'Modelo 3D Three.js PBR rotatorio', 'Sales iónicas y coordinación (NaCl, CaCl₂, CuSO₄)', 'Alcoholes y polioles (metanol, etanol, glicerol)', 'Orgánicos (etano, butano, benceno, glucosa)', 'Triglicéridos completos (glicerol + 3 colas éster)', 'Modos Ball-and-Stick / Space-Filling / Dipolos'],
    isolatedFrom: ['Simulador Verlet de partículas libres', 'Módulos de transporte ADR'],
  },
];

class GpuMicroserviceCoordinator {
  private activeInstanceId: string = 'hub';
  private strictGpuIsolation: boolean = true;
  private ultraSpuSaving: boolean = false;
  private listeners: Set<() => void> = new Set();
  private vramPurgeCount: number = 0;
  private openTabs: string[] = ['hub', 'workspace', 'atom-builder'];

  constructor() {
    // Listen to hash changes to keep active instance updated
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', () => {
        this.updateFromHash();
      });
      this.updateFromHash();
    }
  }

  private updateFromHash() {
    const hash = window.location.hash.replace('#', '') || '/';
    const cleanPath = hash.split('?')[0];

    let newId = 'hub';
    if (cleanPath === '/' || cleanPath === '/hub') {
      newId = 'hub';
    } else if (cleanPath.startsWith('/workspace')) {
      newId = 'workspace';
    } else if (cleanPath.startsWith('/atom-builder')) {
      newId = 'atom-builder';
    } else if (cleanPath.startsWith('/physics-engine')) {
      newId = 'physics-engine';
    } else if (cleanPath.startsWith('/astrophysics')) {
      newId = 'astrophysics';
    } else if (cleanPath.startsWith('/periodic-table')) {
      newId = 'periodic-table';
    } else if (cleanPath.startsWith('/professor')) {
      newId = 'professor';
    } else if (cleanPath.startsWith('/regulations')) {
      newId = 'regulations';
    } else if (cleanPath.startsWith('/metallurgy') || cleanPath.startsWith('/aleaciones')) {
      newId = 'metallurgy';
    } else if (cleanPath.startsWith('/molecular-viewer') || cleanPath.startsWith('/moleculas')) {
      newId = 'molecular-viewer';
    }

    if (!this.openTabs.includes(newId)) {
      this.openTabs.push(newId);
    }
    this.setActiveInstance(newId);
  }

  public getOpenTabs(): string[] {
    return [...this.openTabs];
  }

  public openTab(id: string) {
    if (!this.openTabs.includes(id)) {
      this.openTabs.push(id);
    }
    this.setActiveInstance(id);
  }

  public closeTab(id: string): string {
    if (id === 'hub') return 'hub';
    const index = this.openTabs.indexOf(id);
    if (index !== -1) {
      this.openTabs.splice(index, 1);
    }
    this.purgeGpuVram();
    let nextId = this.activeInstanceId;
    if (this.activeInstanceId === id) {
      nextId = this.openTabs[Math.max(0, index - 1)] || 'hub';
      this.setActiveInstance(nextId);
    } else {
      this.notify();
    }
    return nextId;
  }

  public getActiveInstanceId(): string {
    return this.activeInstanceId;
  }

  public setActiveInstance(id: string) {
    if (this.activeInstanceId === id) return;
    this.activeInstanceId = id;
    this.notify();
  }

  public isStrictIsolation(): boolean {
    return this.strictGpuIsolation;
  }

  public setStrictIsolation(val: boolean) {
    this.strictGpuIsolation = val;
    this.notify();
  }

  public isUltraSpuSaving(): boolean {
    return this.ultraSpuSaving;
  }

  public setUltraSpuSaving(val: boolean) {
    this.ultraSpuSaving = val;
    this.notify();
  }

  public getVramPurgeCount(): number {
    return this.vramPurgeCount;
  }

  public purgeGpuVram() {
    this.vramPurgeCount++;
    // Broadcast custom event so active WebGL renderers can trigger garbage collection
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('espiquumeyria_purge_vram', { detail: { timestamp: Date.now() } }));
    }
    this.notify();
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  public getTelemetry() {
    const active = REGISTERED_INSTANCES.find(i => i.id === this.activeInstanceId);
    const activeGpuTier = active?.gpuTier || 'none';
    const is3DActive = activeGpuTier === 'heavy_webgl';

    return {
      activeInstanceId: this.activeInstanceId,
      activeInstanceTitle: active?.title || 'Portal de Instancias Aisladas (Navegador Principal)',
      activeVirtualUrl: active?.virtualUrl || 'espiquumeyria://navegador.portal.home',
      activeDomain: active?.domainName || 'navegador.portal.home',
      activeGpuTier,
      activeWebGlContexts: is3DActive ? 1 : 0,
      maxAllowedWebGlContexts: 1, // Enforce strict 1-context maximum to prevent GPU crash
      spuAllocatedPct: this.ultraSpuSaving ? Math.round((active?.spuAllocationPct || 0) * 0.6) : (active?.spuAllocationPct || 0),
      memoryEstMB: active?.memoryEstMB || 12,
      strictIsolation: this.strictGpuIsolation,
      ultraSpuSaving: this.ultraSpuSaving,
      vramPurgeCount: this.vramPurgeCount,
      openTabsCount: this.openTabs.length,
      duplicateInstancesEliminated: 1,
    };
  }
}

export const gpuCoordinator = new GpuMicroserviceCoordinator();

export function useGpuMicroserviceMonitor() {
  const [telemetry, setTelemetry] = useState(() => gpuCoordinator.getTelemetry());
  const [openTabs, setOpenTabs] = useState<string[]>(() => gpuCoordinator.getOpenTabs());

  useEffect(() => {
    const unsub = gpuCoordinator.subscribe(() => {
      setTelemetry(gpuCoordinator.getTelemetry());
      setOpenTabs(gpuCoordinator.getOpenTabs());
    });
    return unsub;
  }, []);

  return {
    telemetry,
    openTabs,
    openTab: (id: string) => gpuCoordinator.openTab(id),
    closeTab: (id: string) => gpuCoordinator.closeTab(id),
    purgeGpuVram: () => gpuCoordinator.purgeGpuVram(),
    toggleStrictIsolation: () => gpuCoordinator.setStrictIsolation(!telemetry.strictIsolation),
    toggleUltraSpuSaving: () => gpuCoordinator.setUltraSpuSaving(!telemetry.ultraSpuSaving),
  };
}
