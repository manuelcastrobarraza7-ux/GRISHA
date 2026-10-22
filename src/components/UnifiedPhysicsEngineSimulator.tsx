import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { InlineMath, BlockMath } from 'react-katex';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Zap, 
  Atom, 
  Layers, 
  Info, 
  Sparkles, 
  ArrowRight, 
  Maximize2, 
  Minimize2, 
  Monitor,
  Search,
  X,
  ChevronDown,
  Activity,
  ShieldAlert,
  Flame,
  Check
} from 'lucide-react';
import { 
  PHYSICAL_CONSTANTS, 
  ParticleKinematicState, 
  PhysicsEnvironmentConfig, 
  DEFAULT_PHYSICS_CONFIG, 
  NumericalIntegrator, 
  QuantumOrbitalDynamics, 
  project3DTo2D, 
  VectorMath, 
  createPhysicalParticle,
  Vector3D,
  generateAtomParticleSystem,
  QUANTUM_SHELL_COLORS
} from '../physics/unifiedParticlePhysics';
import { PERIODIC_ELEMENTS, ELEMENT_CATEGORIES, PeriodicElement } from '../data/periodicTable';
import { 
  getIsotopesForElement, 
  NOTABLE_ISOTOPES, 
  IsotopeDefinition, 
  getAufbauConfiguration, 
  superscriptNumber 
} from '../data/isotopesData';
import { getStabilityVerdict, VALLEY_STABLE_POINTS } from '../data/valleyOfStability';
import { useSystemSettings } from '../utils/systemSettings';

interface UnifiedPhysicsEngineSimulatorProps {
  initialPreset?: 'bohr' | 'lorentz' | 'bounce' | 'coulomb' | 'thomson';
  initialZ?: number;
  initialN?: number;
  initialElectrons?: number;
  onClose?: () => void;
  onPresetChange?: (preset: string) => void;
}

export const UnifiedPhysicsEngineSimulator: React.FC<UnifiedPhysicsEngineSimulatorProps> = ({
  initialPreset = 'bohr',
  initialZ = 1,
  initialN,
  initialElectrons,
  onClose,
  onPresetChange,
}) => {
  const { settings } = useSystemSettings();

  // Helper to determine optimal initial neutrons
  const defaultN = useMemo(() => {
    if (initialN !== undefined) return initialN;
    const vp = VALLEY_STABLE_POINTS.find(p => p.z === initialZ);
    return vp ? vp.optimalN : Math.round(initialZ * (initialZ > 20 ? 1.4 : 1.0));
  }, [initialZ, initialN]);

  // Estado del nucleido e isótopo seleccionado
  const [atomicZ, setAtomicZ] = useState<number>(initialZ);
  const [neutronsN, setNeutronsN] = useState<number>(defaultN);
  const [electronsE, setElectronsE] = useState<number>(initialElectrons !== undefined ? initialElectrons : initialZ);
  const [selectedIsotopeId, setSelectedIsotopeId] = useState<string | null>(null);

  // Modal / selector de isótopos de la tabla periódica
  const [isIsotopeModalOpen, setIsIsotopeModalOpen] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Configuración de la simulación
  const [config, setConfig] = useState<PhysicsEnvironmentConfig>(() => ({
    ...DEFAULT_PHYSICS_CONFIG,
    enableFloorCollision: true,
    floorY: -2.0,
    restitutionE: 0.85,
    tangentialDampingMu: 0.12,
    focalDistanceD: 8.0,
    enableGravity: true,
    gravityScale: 1.0,
    gravityGConstant: 9.81,
    enableCoulomb: true,
    coulombScale: 1.0,
  }));

  // Ref dinámico de configuración para propagación instantánea a 60/120 FPS sin reconstruir Three.js
  const configRef = useRef<PhysicsEnvironmentConfig>(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Modificación reactiva en tiempo real de la constante gravitatoria (G / g)
  const handleGravityScaleChange = useCallback((scale: number) => {
    const clamped = Math.max(0, Math.min(10, scale));
    setConfig(prev => ({
      ...prev,
      gravityScale: clamped,
      enableGravity: clamped > 0,
      enableFloorCollision: clamped > 0 ? true : prev.enableFloorCollision,
    }));
  }, []);

  const handleGravityGChange = useCallback((gVal: number) => {
    const clamped = Math.max(0, Math.min(100, gVal));
    setConfig(prev => ({
      ...prev,
      gravityGConstant: clamped,
      enableGravity: clamped > 0,
    }));
  }, []);

  const handleToggleGravity = useCallback((enable?: boolean) => {
    setConfig(prev => {
      const nextEnable = enable !== undefined ? enable : !prev.enableGravity;
      return {
        ...prev,
        enableGravity: nextEnable,
        gravityScale: nextEnable && prev.gravityScale === 0 ? 1.0 : prev.gravityScale,
        enableFloorCollision: nextEnable ? true : prev.enableFloorCollision,
      };
    });
  }, []);

  // Modificación reactiva en tiempo real de la fuerza electrostática (Constante de Coulomb ke)
  const handleCoulombScaleChange = useCallback((scale: number) => {
    const clamped = Math.max(0, Math.min(10, scale));
    setConfig(prev => ({
      ...prev,
      coulombScale: clamped,
      enableCoulomb: clamped > 0,
    }));
  }, []);

  const handleToggleCoulomb = useCallback((enable?: boolean) => {
    setConfig(prev => {
      const nextEnable = enable !== undefined ? enable : !prev.enableCoulomb;
      return {
        ...prev,
        enableCoulomb: nextEnable,
        coulombScale: nextEnable && prev.coulombScale === 0 ? 1.0 : prev.coulombScale,
      };
    });
  }, []);

  const handleResetForces = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      enableGravity: true,
      gravityScale: 1.0,
      gravityGConstant: 9.81,
      enableCoulomb: true,
      coulombScale: 1.0,
      coulombSoftening: 0.45,
    }));
  }, []);

  // Métricas y diagnóstico dinámico de fuerzas físicas en tiempo real
  const liveForceMetrics = useMemo(() => {
    const gEff = config.enableGravity ? config.gravityScale * (config.gravityGConstant ?? 9.81) : 0;
    const keEff = config.enableCoulomb ? config.coulombScale * 8.988 : 0;

    let behaviorNote = 'Órbitas Bohr Cuánticas Estables (Equilibrio Coulomb / Centrípeta)';
    let behaviorColor = 'text-cyan-300';
    let behaviorBorder = 'border-cyan-500/40 bg-cyan-950/40';

    if (!config.enableCoulomb || config.coulombScale <= 0.05) {
      behaviorNote = '⚠️ Fuga Inercial: Sin atracción electrostática central, los electrones escapan tangencialmente (1ª Ley de Newton).';
      behaviorColor = 'text-rose-400';
      behaviorBorder = 'border-rose-500/50 bg-rose-950/40';
    } else if (config.coulombScale >= 2.5) {
      behaviorNote = '🧲 Hiperatracción Coulombiana: La fuerza electrostática comprime los orbitales atómicos hacia el núcleo.';
      behaviorColor = 'text-purple-300';
      behaviorBorder = 'border-purple-500/50 bg-purple-950/40';
    } else if (config.enableGravity && config.gravityScale >= 2.5) {
      behaviorNote = '🪐 Dominancia Gravitatoria Intensa: Fuerte deflexión vertical hacia el plano inferior y rebotes.';
      behaviorColor = 'text-amber-300';
      behaviorBorder = 'border-amber-500/50 bg-amber-950/40';
    } else if (!config.enableGravity || config.gravityScale === 0) {
      behaviorNote = '🌌 Microgravedad Pura (g=0): Movimiento atómico ideal gobernado exclusivamente por electrodinámica cuántica.';
      behaviorColor = 'text-emerald-300';
      behaviorBorder = 'border-emerald-500/50 bg-emerald-950/40';
    }

    return {
      gEff,
      keEff,
      behaviorNote,
      behaviorColor,
      behaviorBorder
    };
  }, [config.enableGravity, config.gravityScale, config.gravityGConstant, config.enableCoulomb, config.coulombScale]);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'simulation' | 'equations' | 'telemetry'>('simulation');
  const [timeStepDt, setTimeStepDt] = useState<number>(0.016);
  const [simSpeed, setSimSpeed] = useState<number>(1.0);
  const [selectedParticleId, setSelectedParticleId] = useState<string | null>(null);
  const [projectionMode, setProjectionMode] = useState<'split' | '3d_only' | '2d_only'>('split');
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showTrails, setShowTrails] = useState<boolean>(true);
  const [showStandingWave, setShowStandingWave] = useState<boolean>(true);
  const [showQuantumClouds, setShowQuantumClouds] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<string>(initialPreset);

  // Lista de partículas activas en el motor
  const [particles, setParticles] = useState<ParticleKinematicState[]>([]);
  const particlesRef = useRef<ParticleKinematicState[]>([]);
  particlesRef.current = particles;

  // Refs para WebGL Three.js y Pantalla Completa
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const viewportWrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const particleMeshesRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const trailLinesRef = useRef<Map<string, THREE.Line>>(new Map());
  const vectorArrowsRef = useRef<THREE.Group | null>(null);
  const floorMeshRef = useRef<THREE.Mesh | null>(null);
  const deBroglieRingsRef = useRef<THREE.Group | null>(null);
  const quantumCloudPointsRef = useRef<THREE.Points | null>(null);

  // Ref para Canvas 2D de Proyección Perspectiva (Regla 8)
  const projectionCanvasRef = useRef<HTMLCanvasElement>(null);

  // Elemento actual de la tabla periódica
  const currentElement: PeriodicElement = useMemo(() => {
    return PERIODIC_ELEMENTS.find(e => e.z === atomicZ) || {
      z: atomicZ,
      symbol: `E${atomicZ}`,
      name: `Elemento ${atomicZ}`,
      atomicMass: atomicZ + neutronsN,
      period: 1,
      group: 1,
      block: 's',
      category: 'reactive_nonmetal',
      categoryLabel: 'Elemento Químico',
      state: 'sólido',
      electronConfig: '',
      yearDiscovered: '—',
      cosmicOrigin: 'Evolución nuclear estelar',
      realWorldApp: 'Investigación en física atómica'
    };
  }, [atomicZ, neutronsN]);

  // Lista de isótopos del elemento actual
  const currentElementIsotopes: IsotopeDefinition[] = useMemo(() => {
    return getIsotopesForElement(atomicZ);
  }, [atomicZ]);

  // Diagnóstico de estabilidad nuclear
  const stabilityVerdict = useMemo(() => {
    return getStabilityVerdict(atomicZ, neutronsN);
  }, [atomicZ, neutronsN]);

  // Configuración electrónica según el Principio de Aufbau
  const aufbau = useMemo(() => {
    return getAufbauConfiguration(electronsE);
  }, [electronsE]);

  // Carga neta del ion
  const netCharge = atomicZ - electronsE;

  // Carga e inicialización de presets físicos
  const loadPreset = useCallback((
    presetName: string, 
    customZ: number = atomicZ, 
    customN: number = neutronsN, 
    customE: number = electronsE
  ) => {
    setActivePreset(presetName);
    onPresetChange?.(presetName);
    let newParticles: ParticleKinematicState[] = [];
    let newConfig: Partial<PhysicsEnvironmentConfig> = {};

    if (presetName === 'bohr') {
      // Dinámica Cuántica y Orbital Completa:
      // Núcleo de masa M = Z*m_p + N*m_n y corteza cuántica multinivel con electrones en órbitas 3D
      newParticles = generateAtomParticleSystem(
        customZ, 
        customN, 
        customE, 
        currentElement.symbol, 
        currentElement.name
      );

      newConfig = {
        enableGravity: false,
        gravityScale: 0.0,
        gammaDrag: 0.0,
        enableFloorCollision: false,
        enableCoulomb: true,
        coulombScale: 1.0,
        coulombSoftening: 0.5,
        electricField: { x: 0, y: 0, z: 0 },
        magneticField: { x: 0, y: 0, z: 0 },
      };

    } else if (presetName === 'lorentz') {
      // Fuerza de Lorentz: Campo magnético B vertical + campo eléctrico E horizontal
      const p1 = createPhysicalParticle(
        'electron',
        { x: -2.5, y: 0.5, z: 0 },
        { x: 3.2, y: 0, z: 0 },
        'Electrón en B (Ciclotrónico)'
      );
      p1.color = '#22d3ee';

      const p2 = createPhysicalParticle(
        'proton',
        { x: -2.5, y: -0.5, z: 0 },
        { x: 3.2, y: 0, z: 0 },
        'Protón en B'
      );
      p2.color = '#ef4444';

      newParticles = [p1, p2];
      newConfig = {
        enableGravity: false,
        gravityScale: 0.0,
        enableCoulomb: false,
        coulombScale: 0.0,
        gammaDrag: 0.02,
        enableFloorCollision: false,
        electricField: { x: 0, y: 0.2, z: 0 },
        magneticField: { x: 0, y: 1.5, z: 0 },
      };

    } else if (presetName === 'bounce') {
      // Colisiones con Límites: Plano horizontal en y = 0
      const p1 = createPhysicalParticle(
        'electron',
        { x: -1.8, y: 3.2, z: 0.4 },
        { x: 1.8, y: 0.5, z: 0.2 },
        'Electrón (Rebote inelástico)'
      );
      p1.color = '#38bdf8';

      const p2 = createPhysicalParticle(
        'alpha',
        { x: 1.2, y: 4.0, z: -0.5 },
        { x: -1.4, y: 1.0, z: 0.6 },
        'Partícula Alfa (Rebote)'
      );
      p2.color = '#fbbf24';

      const p3 = createPhysicalParticle(
        'test',
        { x: 0, y: 2.5, z: 0 },
        { x: 0.5, y: -0.2, z: 1.5 },
        'Carga Test (Rebote)'
      );
      p3.color = '#a855f7';

      newParticles = [p1, p2, p3];
      newConfig = {
        enableGravity: true,
        gravityScale: 1.0,
        enableCoulomb: true,
        coulombScale: 0.4,
        enableFloorCollision: true,
        floorY: -1.8,
        restitutionE: 0.82,
        tangentialDampingMu: 0.15,
        electricField: { x: 0, y: 0, z: 0 },
        magneticField: { x: 0, y: 0, z: 0 },
      };

    } else if (presetName === 'coulomb') {
      // Interacción electrostática entre electrones y protón central
      const p1 = createPhysicalParticle(
        'electron',
        { x: -1.5, y: 0.2, z: 0 },
        { x: 2.0, y: 0, z: 0 },
        'Electrón A (-e)'
      );
      const p2 = createPhysicalParticle(
        'electron',
        { x: 1.5, y: -0.2, z: 0 },
        { x: -2.0, y: 0, z: 0 },
        'Electrón B (-e)'
      );
      const p3 = createPhysicalParticle(
        'proton',
        { x: 0, y: 2.2, z: 0 },
        { x: 0, y: -0.5, z: 0 },
        'Protón Central (+e)'
      );

      newParticles = [p1, p2, p3];
      newConfig = {
        enableGravity: false,
        gravityScale: 0.0,
        enableFloorCollision: false,
        gammaDrag: 0.01,
        enableCoulomb: true,
        coulombScale: 1.0,
        coulombSoftening: 0.45,
        electricField: { x: 0, y: 0, z: 0 },
        magneticField: { x: 0, y: 0, z: 0 },
      };

    } else if (presetName === 'thomson') {
      // Experimento de J.J. Thomson: Deflexión de haz de electrones con campo E cruzado con B
      newParticles = Array.from({ length: 4 }).map((_, i) => {
        const offsetZ = (i - 1.5) * 0.4;
        const e = createPhysicalParticle(
          'electron',
          { x: -3.5, y: 0, z: offsetZ },
          { x: 4.5, y: 0, z: 0 },
          `Haz de Electrones ${i + 1}`
        );
        e.color = '#22d3ee';
        return e;
      });

      newConfig = {
        enableGravity: false,
        gravityScale: 0.0,
        enableCoulomb: false,
        coulombScale: 0.0,
        enableFloorCollision: false,
        gammaDrag: 0.0,
        electricField: { x: 0, y: 1.2, z: 0 },
        magneticField: { x: 0, y: 0, z: 0.8 },
      };
    }

    setParticles(newParticles);
    setConfig(prev => ({ ...prev, ...newConfig }));
    if (newParticles.length > 0) {
      setSelectedParticleId(newParticles[0].id);
    }
  }, [atomicZ, neutronsN, electronsE, currentElement, onPresetChange]);

  // Manejo de cambio de isótopo
  const handleSelectIsotope = useCallback((iso: IsotopeDefinition) => {
    setAtomicZ(iso.z);
    setNeutronsN(iso.n);
    setElectronsE(iso.z); // Restaurar a átomo neutro para el isótopo seleccionado
    setSelectedIsotopeId(iso.id);
    setIsIsotopeModalOpen(false);

    if (activePreset === 'bohr') {
      loadPreset('bohr', iso.z, iso.n, iso.z);
    }
  }, [activePreset, loadPreset]);

  // Selección de elemento desde la tabla periódica
  const handleSelectElement = useCallback((elem: PeriodicElement) => {
    const vp = VALLEY_STABLE_POINTS.find(p => p.z === elem.z);
    const optN = vp ? vp.optimalN : Math.round(elem.z * (elem.z > 20 ? 1.4 : 1.0));
    setAtomicZ(elem.z);
    setNeutronsN(optN);
    setElectronsE(elem.z);
    setSelectedIsotopeId(null);
    setIsIsotopeModalOpen(false);

    if (activePreset === 'bohr') {
      loadPreset('bohr', elem.z, optN, elem.z);
    }
  }, [activePreset, loadPreset]);

  // Actualización cuando cambian Z, N o e⁻ directamente en controles
  const handleUpdateProtons = (newZ: number) => {
    const clampedZ = Math.max(1, Math.min(118, newZ));
    setAtomicZ(clampedZ);
    // Ajustar neutrones al óptimo si se desvía drásticamente
    const vp = VALLEY_STABLE_POINTS.find(p => p.z === clampedZ);
    const optN = vp ? vp.optimalN : Math.round(clampedZ * (clampedZ > 20 ? 1.4 : 1.0));
    setNeutronsN(optN);
    setElectronsE(clampedZ);
    if (activePreset === 'bohr') {
      loadPreset('bohr', clampedZ, optN, clampedZ);
    }
  };

  const handleUpdateNeutrons = (newN: number) => {
    const clampedN = Math.max(0, Math.min(180, newN));
    setNeutronsN(clampedN);
    if (activePreset === 'bohr') {
      loadPreset('bohr', atomicZ, clampedN, electronsE);
    }
  };

  const handleUpdateElectrons = (newE: number) => {
    const clampedE = Math.max(0, Math.min(125, newE));
    setElectronsE(clampedE);
    if (activePreset === 'bohr') {
      loadPreset('bohr', atomicZ, neutronsN, clampedE);
    }
  };

  // Carga inicial del preset
  useEffect(() => {
    loadPreset(initialPreset, atomicZ, neutronsN, electronsE);
  }, []);

  // Three.js Scene Setup
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const container = canvasContainerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 9.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x06b6d4, 1.2);
    rimLight.position.set(-5, -3, -5);
    scene.add(rimLight);

    // Ejes de referencia en el espacio
    const axesHelper = new THREE.AxesHelper(1.8);
    scene.add(axesHelper);

    // Grupos de vectores y ondas cuánticas
    const vectorGroup = new THREE.Group();
    scene.add(vectorGroup);
    vectorArrowsRef.current = vectorGroup;

    const waveGroup = new THREE.Group();
    scene.add(waveGroup);
    deBroglieRingsRef.current = waveGroup;

    // Plano de piso horizontal en y = floorY (Regla 7)
    const floorGeo = new THREE.PlaneGeometry(16, 16, 32, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = config.floorY;
    scene.add(floorMesh);
    floorMeshRef.current = floorMesh;

    // Nube cuántica de probabilidad |ψ|² (Partículas difusas)
    const cloudCount = 1200;
    const cloudGeo = new THREE.BufferGeometry();
    const cloudPos = new Float32Array(cloudCount * 3);
    const cloudColors = new Float32Array(cloudCount * 3);

    for (let i = 0; i < cloudCount; i++) {
      // Distribución cuántica radial exponencial (decae con r)
      const u = Math.random();
      const r = -Math.log(1 - u) * 1.5 + 0.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      cloudPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      cloudPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      cloudPos[i * 3 + 2] = r * Math.cos(phi);

      cloudColors[i * 3] = 0.15;
      cloudColors[i * 3 + 1] = 0.85;
      cloudColors[i * 3 + 2] = 0.95;
    }

    cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudPos, 3));
    cloudGeo.setAttribute('color', new THREE.BufferAttribute(cloudColors, 3));

    const cloudMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });

    const cloudPoints = new THREE.Points(cloudGeo, cloudMat);
    scene.add(cloudPoints);
    quantumCloudPointsRef.current = cloudPoints;

    // Loop de renderizado y física
    let animationFrameId: number;
    let lastTime = performance.now();
    let lastRenderTime = 0;

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      // Respetar pausa en segundo plano
      if (settings.pauseInBackground && typeof document !== 'undefined' && document.hidden) {
        return;
      }

      // Respetar límite de FPS
      const fpsCap = settings.maxFramerate;
      if (fpsCap !== 'unlimited') {
        const minFrameIntervalMs = 1000 / fpsCap;
        if (currentTime - lastRenderTime < minFrameIntervalMs - 1.5) {
          return;
        }
      }
      lastRenderTime = currentTime;

      const deltaSec = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Actualizar posición del plano de piso si cambia dinámicamente
      if (floorMeshRef.current) {
        floorMeshRef.current.position.y = configRef.current.floorY;
        floorMeshRef.current.visible = configRef.current.enableFloorCollision;
      }

      // Rotación suave de la nube de probabilidad cuántica
      if (quantumCloudPointsRef.current) {
        quantumCloudPointsRef.current.visible = showQuantumClouds && activePreset === 'bohr' && electronsE > 0;
        quantumCloudPointsRef.current.rotation.y += 0.003;
        quantumCloudPointsRef.current.rotation.x += 0.001;
      }

      // Paso físico de integración Verlet (reacciona en tiempo real a cambios de constantes G y Coulomb)
      if (isPlaying) {
        const effectiveDt = (timeStepDt * simSpeed);
        const subSteps = settings.physicsTickRateTps >= 120 ? 4 : settings.physicsTickRateTps <= 30 ? 1 : 2;
        const subDt = effectiveDt / subSteps;
        for (let s = 0; s < subSteps; s++) {
          NumericalIntegrator.stepVerlet(particlesRef.current, subDt, configRef.current);
        }
      }

      // Sincronizar visualización Three.js
      syncThreeMeshes(scene, particlesRef.current);

      // Renderizar proyección 2D analítica
      render2DProjectionCanvas();

      controls.update();
      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!canvasContainerRef.current) return;
      const w = canvasContainerRef.current.clientWidth || window.innerWidth;
      const h = canvasContainerRef.current.clientHeight || window.innerHeight;
      if (w <= 0 || h <= 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      rendererRef.current = null;
      if (container && renderer.domElement) {
        container.innerHTML = '';
      }
    };
  }, [isPlaying, timeStepDt, simSpeed, settings.maxFramerate, settings.pauseInBackground, settings.renderQuality, settings.physicsTickRateTps, showQuantumClouds, activePreset, electronsE]);

  // Recálculo dinámico en pantalla completa
  const updateRenderDimensions = useCallback(() => {
    if (!canvasContainerRef.current || !rendererRef.current || !cameraRef.current) return;
    const w = canvasContainerRef.current.clientWidth || window.innerWidth;
    const h = canvasContainerRef.current.clientHeight || window.innerHeight;
    if (w <= 0 || h <= 0) return;
    cameraRef.current.aspect = w / h;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(w, h);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => {
      const next = !prev;
      if (next) {
        if (viewportWrapperRef.current?.requestFullscreen) {
          viewportWrapperRef.current.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFs = Boolean(document.fullscreenElement);
      if (!isNativeFs && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen]);

  useEffect(() => {
    const timer = setTimeout(() => updateRenderDimensions(), 50);
    return () => clearTimeout(timer);
  }, [isFullscreen, updateRenderDimensions]);

  // Sincronizador de mallas Three.js para partículas, estelas y vectores
  const syncThreeMeshes = (scene: THREE.Scene, currentParticles: ParticleKinematicState[]) => {
    const activeIds = new Set(currentParticles.map(p => p.id));

    // Eliminar mallas que ya no existan
    for (const [id, mesh] of particleMeshesRef.current.entries()) {
      if (!activeIds.has(id)) {
        scene.remove(mesh);
        particleMeshesRef.current.delete(id);
      }
    }
    for (const [id, line] of trailLinesRef.current.entries()) {
      if (!activeIds.has(id)) {
        scene.remove(line);
        trailLinesRef.current.delete(id);
      }
    }

    // Actualizar o crear mallas para cada partícula
    currentParticles.forEach(p => {
      let mesh = particleMeshesRef.current.get(p.id);
      if (!mesh) {
        const group = new THREE.Group();
        const sphereGeo = new THREE.SphereGeometry(p.displayRadius, 24, 24);
        const sphereMat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(p.color),
          emissive: new THREE.Color(p.color),
          emissiveIntensity: p.type === 'electron' ? 0.75 : 0.45,
          roughness: 0.15,
          metalness: 0.1,
          clearcoat: 1.0,
        });
        const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
        group.add(sphereMesh);

        // Glow halo para electrones
        const glowGeo = new THREE.SphereGeometry(p.displayRadius * 1.6, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(p.color),
          transparent: true,
          opacity: p.type === 'electron' ? 0.35 : 0.2,
          side: THREE.BackSide,
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        group.add(glowMesh);

        scene.add(group);
        particleMeshesRef.current.set(p.id, group);
        mesh = group;
      }

      if (Number.isFinite(p.r.x) && Number.isFinite(p.r.y) && Number.isFinite(p.r.z)) {
        mesh.position.set(p.r.x, p.r.y, p.r.z);
      }

      // Actualizar estela
      if (showTrails && p.trail.length >= 2) {
        let line = trailLinesRef.current.get(p.id);
        const validPoints = p.trail
          .filter(t => t && Number.isFinite(t.x) && Number.isFinite(t.y) && Number.isFinite(t.z))
          .map(t => new THREE.Vector3(t.x, t.y, t.z));

        if (validPoints.length >= 2) {
          const lineGeo = new THREE.BufferGeometry().setFromPoints(validPoints);

          if (!line) {
            const lineMat = new THREE.LineBasicMaterial({
              color: new THREE.Color(p.color),
              transparent: true,
              opacity: p.type === 'electron' ? 0.6 : 0.4,
            });
            line = new THREE.Line(lineGeo, lineMat);
            scene.add(line);
            trailLinesRef.current.set(p.id, line);
          } else {
            line.geometry.dispose();
            line.geometry = lineGeo;
          }
        }
      }
    });

    // Actualizar flechas vectoriales de velocidad y aceleración
    if (vectorArrowsRef.current) {
      const vGroup = vectorArrowsRef.current;
      while (vGroup.children.length > 0) {
        vGroup.remove(vGroup.children[0]);
      }

      if (showVectors) {
        currentParticles.forEach(p => {
          if (p.fixed) return;
          if (!Number.isFinite(p.r.x) || !Number.isFinite(p.r.y) || !Number.isFinite(p.r.z)) return;
          const origin = new THREE.Vector3(p.r.x, p.r.y, p.r.z);

          // Vector de velocidad v (verde-cyan)
          const vLen = VectorMath.magnitude(p.v);
          if (Number.isFinite(vLen) && vLen > 0.05) {
            const vx = p.v.x / vLen;
            const vy = p.v.y / vLen;
            const vz = p.v.z / vLen;
            if (Number.isFinite(vx) && Number.isFinite(vy) && Number.isFinite(vz)) {
              const vDir = new THREE.Vector3(vx, vy, vz);
              const arrowV = new THREE.ArrowHelper(vDir, origin, Math.min(vLen * 0.4, 1.8), 0x22d3ee, 0.15, 0.1);
              vGroup.add(arrowV);
            }
          }

          // Vector de aceleración a (magenta/rojo)
          const aLen = VectorMath.magnitude(p.a);
          if (Number.isFinite(aLen) && aLen > 0.05) {
            const ax = p.a.x / aLen;
            const ay = p.a.y / aLen;
            const az = p.a.z / aLen;
            if (Number.isFinite(ax) && Number.isFinite(ay) && Number.isFinite(az)) {
              const aDir = new THREE.Vector3(ax, ay, az);
              const arrowA = new THREE.ArrowHelper(aDir, origin, Math.min(aLen * 0.15, 1.4), 0xf43f5e, 0.14, 0.09);
              vGroup.add(arrowA);
            }
          }
        });
      }
    }

    // Actualizar ondas resonantes de de Broglie para cada nivel cuántico activo n
    if (deBroglieRingsRef.current) {
      const wGroup = deBroglieRingsRef.current;
      while (wGroup.children.length > 0) {
        wGroup.remove(wGroup.children[0]);
      }

      if (showStandingWave && activePreset === 'bohr') {
        // Encontrar capas n activas
        const activeShells = new Set<number>();
        currentParticles.forEach(p => {
          if (p.principalQuantumN && p.principalQuantumN > 0) {
            activeShells.add(p.principalQuantumN);
          }
        });

        activeShells.forEach(nVal => {
          const rBase = 1.35 + (nVal - 1) * 0.85;
          const segments = 144;
          const points: THREE.Vector3[] = [];
          const waveAmp = 0.07 * (1 / Math.sqrt(nVal));

          for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * 2 * Math.PI;
            // Modulación de onda estacionaria: 2*pi*r = n*lambda
            const rEff = rBase + waveAmp * Math.sin(nVal * 2 * theta);
            points.push(new THREE.Vector3(rEff * Math.cos(theta), 0, rEff * Math.sin(theta)));
          }

          const ringGeo = new THREE.BufferGeometry().setFromPoints(points);
          const shellColor = QUANTUM_SHELL_COLORS[(nVal - 1) % QUANTUM_SHELL_COLORS.length];
          const ringMat = new THREE.LineBasicMaterial({
            color: new THREE.Color(shellColor),
            transparent: true,
            opacity: 0.6,
          });
          const waveLine = new THREE.Line(ringGeo, ringMat);
          wGroup.add(waveLine);
        });
      }
    }
  };

  // Renderizado del Canvas 2D de Proyección Perspectiva (Regla 8)
  const render2DProjectionCanvas = () => {
    const canvas = projectionCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#050a14';
    ctx.fillRect(0, 0, width, height);

    const Xc = width / 2;
    const Yc = height / 2;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(0, Yc);
    ctx.lineTo(width, Yc);
    ctx.moveTo(Xc, 0);
    ctx.lineTo(Xc, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Suelo proyectado
    const floorP1 = project3DTo2D({ x: -4, y: config.floorY, z: -4 }, config.focalDistanceD, Xc, Yc);
    const floorP2 = project3DTo2D({ x: 4, y: config.floorY, z: -4 }, config.focalDistanceD, Xc, Yc);
    const floorP3 = project3DTo2D({ x: 4, y: config.floorY, z: 4 }, config.focalDistanceD, Xc, Yc);
    const floorP4 = project3DTo2D({ x: -4, y: config.floorY, z: 4 }, config.focalDistanceD, Xc, Yc);

    if (config.enableFloorCollision && floorP1.visible && floorP2.visible && floorP3.visible && floorP4.visible) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(floorP1.Xs, floorP1.Ys);
      ctx.lineTo(floorP2.Xs, floorP2.Ys);
      ctx.lineTo(floorP3.Xs, floorP3.Ys);
      ctx.lineTo(floorP4.Xs, floorP4.Ys);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Dibujar estelas proyectadas
    particlesRef.current.forEach(p => {
      if (p.trail.length > 2) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        let started = false;

        p.trail.forEach(pt => {
          const proj = project3DTo2D(pt, config.focalDistanceD, Xc, Yc);
          if (proj.visible) {
            if (!started) {
              ctx.moveTo(proj.Xs, proj.Ys);
              started = true;
            } else {
              ctx.lineTo(proj.Xs, proj.Ys);
            }
          }
        });
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }
    });

    // Proyectar cada partícula según Regla 8
    particlesRef.current.forEach(p => {
      const proj = project3DTo2D(p.r, config.focalDistanceD, Xc, Yc);
      if (!proj.visible) return;

      const radius = Math.max(3, p.displayRadius * 35 * proj.depthScale);

      // Glow halo
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.arc(proj.Xs, proj.Ys, radius * 2.0, 0, Math.PI * 2);
      ctx.fill();

      // Esfera principal
      ctx.globalAlpha = 1.0;
      ctx.beginPath();
      ctx.arc(proj.Xs, proj.Ys, radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Vector de velocidad proyectado en 2D
      if (showVectors && !p.fixed) {
        const vNext: Vector3D = {
          x: p.r.x + p.v.x * 0.15,
          y: p.r.y + p.v.y * 0.15,
          z: p.r.z + p.v.z * 0.15
        };
        const projV = project3DTo2D(vNext, config.focalDistanceD, Xc, Yc);
        if (projV.visible) {
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(proj.Xs, proj.Ys);
          ctx.lineTo(projV.Xs, projV.Ys);
          ctx.stroke();
        }
      }

      ctx.fillStyle = '#f8fafc';
      ctx.font = '9px monospace';
      ctx.fillText(`${p.name}`, proj.Xs + radius + 4, proj.Ys - 4);
    });

    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px monospace';
    ctx.fillText(`PROYECCIÓN PERSPECTIVA 2D (d = ${config.focalDistanceD.toFixed(1)})`, 10, 16);
  };

  // Partícula actualmente seleccionada para telemetría
  const selectedParticle = useMemo(() => {
    return particles.find(p => p.id === selectedParticleId) || particles[0] || null;
  }, [particles, selectedParticleId]);

  const particleObservables = useMemo(() => {
    if (!selectedParticle) return null;
    const speed = VectorMath.magnitude(selectedParticle.v);
    const accel = VectorMath.magnitude(selectedParticle.a);
    const keJ = 0.5 * selectedParticle.mass * speed * speed;
    const keEv = keJ / PHYSICAL_CONSTANTS.E_CHARGE;
    const lambda = QuantumOrbitalDynamics.computeDeBroglieWavelength(speed, selectedParticle.mass);

    return {
      speed,
      accel,
      keJ,
      keEv,
      lambda,
      deBroglieNm: isFinite(lambda) ? (lambda * 1e9).toFixed(4) : '∞',
      speedKmS: (speed * 1e-3).toFixed(2),
    };
  }, [selectedParticle]);

  // Filtrado de elementos para el modal de la tabla periódica
  const filteredElements = useMemo(() => {
    const q = searchFilter.toLowerCase().trim();
    return PERIODIC_ELEMENTS.filter(e => {
      const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
      const matchesSearch = !q || 
        e.name.toLowerCase().includes(q) || 
        e.symbol.toLowerCase().includes(q) || 
        String(e.z).includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchFilter, selectedCategory]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 text-slate-100 font-sans animate-in fade-in">
      
      {/* 1. Header Principal & Selector de Presets Físicos */}
      <div className="bg-[#0b121e] border border-cyan-500/30 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Atom className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold font-mono tracking-wide text-white uppercase">
                Motor Físico Cuántico 3D · Corteza Electrónica & Isótopos
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                Bohr · de Broglie · Verlet
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Simulación de orbitales atómicos, principio de Aufbau, ondas de de Broglie, ionización y cambio dinámico de isótopos de la tabla periódica.
            </p>
          </div>
        </div>

        {/* Preset Selector Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => loadPreset('bohr', atomicZ, neutronsN, electronsE)}
            className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
              activePreset === 'bohr'
                ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 font-bold shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <span>⚛️</span>
            <span>Bohr & Electrones Cuánticos</span>
          </button>

          <button
            onClick={() => loadPreset('lorentz')}
            className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
              activePreset === 'lorentz'
                ? 'bg-purple-500/20 text-purple-200 border-purple-400 font-bold shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <span>🌀</span>
            <span>Fuerza de Lorentz (E×B)</span>
          </button>

          <button
            onClick={() => loadPreset('bounce')}
            className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
              activePreset === 'bounce'
                ? 'bg-amber-500/20 text-amber-200 border-amber-400 font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <span>🏀</span>
            <span>Rebote y Límites (y=0)</span>
          </button>

          <button
            onClick={() => loadPreset('coulomb')}
            className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
              activePreset === 'coulomb'
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400 font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <span>⚡</span>
            <span>Ley de Coulomb</span>
          </button>

          <button
            onClick={() => loadPreset('thomson')}
            className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
              activePreset === 'thomson'
                ? 'bg-rose-500/20 text-rose-200 border-rose-400 font-bold shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <span>🎯</span>
            <span>Haz de Thomson</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800 cursor-pointer"
              title="Volver al Constructor Nuclear"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. BARRA DE CONTROL DE ISÓTOPOS DE LA TABLA PERIÓDICA */}
      <div className="bg-[#080d15] border border-cyan-500/30 rounded-2xl p-3.5 space-y-3 font-mono text-xs shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Isótopo en Simulación:
            </span>
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-xl border border-slate-700/80">
              <span className="text-base font-extrabold text-cyan-300">
                {superscriptNumber(atomicZ + neutronsN)}{currentElement.symbol}
              </span>
              <span className="text-white font-bold text-sm">
                {currentElement.name}-{atomicZ + neutronsN}
              </span>
              <span className="text-slate-400 text-[11px]">
                (Z={atomicZ}, N={neutronsN})
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${stabilityVerdict.statusColor}`}>
                {stabilityVerdict.status}
              </span>
            </div>
          </div>

          {/* Botón para abrir el Navegador de la Tabla Periódica Completa */}
          <button
            onClick={() => setIsIsotopeModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer transition"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Cambiar Isótopo de la Tabla Periódica (1 - 118)</span>
          </button>
        </div>

        {/* Isótopos representativos disponibles del elemento actual para cambio rápido */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-slate-400 uppercase">Isótopos de {currentElement.name}:</span>
          {currentElementIsotopes.map(iso => {
            const isSelected = atomicZ === iso.z && neutronsN === iso.n;
            return (
              <button
                key={iso.id}
                onClick={() => handleSelectIsotope(iso)}
                className={`px-2.5 py-1 rounded-lg border text-xs transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
                title={`${iso.name}: ${iso.halfLife} • ${iso.decayMode}`}
              >
                <span className="font-bold text-white">{iso.symbol}</span>
                <span className="text-[10px] text-slate-400">N={iso.n}</span>
                {iso.category === 'Estable' ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Estable" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title={iso.decayMode} />
                )}
              </button>
            );
          })}
        </div>

        {/* Micro-controles directos de Protones (Z), Neutrones (N) y Electrones (e⁻) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 border-t border-slate-800/60">
          
          {/* Protones Z */}
          <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              Protones (Z): <strong className="text-white text-sm">{atomicZ}</strong>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleUpdateProtons(atomicZ - 1)}
                disabled={atomicZ <= 1}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold disabled:opacity-30 cursor-pointer flex items-center justify-center"
              >
                −
              </button>
              <button
                onClick={() => handleUpdateProtons(atomicZ + 1)}
                disabled={atomicZ >= 118}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold disabled:opacity-30 cursor-pointer flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Neutrones N */}
          <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Neutrones (N): <strong className="text-white text-sm">{neutronsN}</strong>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleUpdateNeutrons(neutronsN - 1)}
                disabled={neutronsN <= 0}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold disabled:opacity-30 cursor-pointer flex items-center justify-center"
              >
                −
              </button>
              <button
                onClick={() => handleUpdateNeutrons(neutronsN + 1)}
                disabled={neutronsN >= 180}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold disabled:opacity-30 cursor-pointer flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Electrones e⁻ & Ionización */}
          <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
              Electrones (e⁻): <strong className="text-cyan-300 text-sm">{electronsE}</strong>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleUpdateElectrons(electronsE - 1)}
                disabled={electronsE <= 0}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold disabled:opacity-30 cursor-pointer flex items-center justify-center"
                title="Ionizar (−1 e⁻, aumentar carga positiva)"
              >
                −
              </button>
              <button
                onClick={() => handleUpdateElectrons(electronsE + 1)}
                disabled={electronsE >= 120}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold disabled:opacity-30 cursor-pointer flex items-center justify-center"
                title="Reducir (+1 e⁻, agregar electrón a la corteza)"
              >
                +
              </button>
              <button
                onClick={() => handleUpdateElectrons(atomicZ)}
                className="ml-1 px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold hover:bg-cyan-900 cursor-pointer"
                title="Restablecer átomo neutro (e⁻ = Z)"
              >
                Neutro
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 3. BARRA DE CONTROL DE SIMULACIÓN Y TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d15] border border-slate-800/80 px-4 py-2.5 rounded-xl text-xs font-mono">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'simulation'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Simulador 3D / 2D</span>
          </button>

          <button
            onClick={() => setActiveTab('equations')}
            className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'equations'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/50 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>8 Leyes Físicas Matemáticas</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'telemetry'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Telemetría Cinemática de Partícula</span>
          </button>
        </div>

        {/* Controles de reproducción */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 animate-pulse'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pausar' : 'Reanudar'}</span>
          </button>

          <button
            onClick={() => loadPreset(activePreset, atomicZ, neutronsN, electronsE)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
            title="Reiniciar partículas a condición inicial"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-slate-800" />

          {/* Toggle Proyección 3D / 2D / Dividida y Pantalla Completa */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => setProjectionMode('split')}
                className={`px-2 py-0.5 rounded cursor-pointer ${projectionMode === 'split' ? 'bg-cyan-500/30 text-cyan-200 font-bold' : 'text-slate-400'}`}
                title="Vista Dual: Three.js 3D + Pantalla de Proyección Perspectiva 2D (Regla 8)"
              >
                Dual (3D+2D)
              </button>
              <button
                onClick={() => setProjectionMode('3d_only')}
                className={`px-2 py-0.5 rounded cursor-pointer ${projectionMode === '3d_only' ? 'bg-cyan-500/30 text-cyan-200 font-bold' : 'text-slate-400'}`}
              >
                Solo 3D
              </button>
              <button
                onClick={() => setProjectionMode('2d_only')}
                className={`px-2 py-0.5 rounded cursor-pointer ${projectionMode === '2d_only' ? 'bg-cyan-500/30 text-cyan-200 font-bold' : 'text-slate-400'}`}
              >
                Solo 2D
              </button>
            </div>

            <button
              onClick={toggleFullscreen}
              className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 font-bold text-xs cursor-pointer ${
                isFullscreen
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                  : 'text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border-cyan-500/40'
              }`}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Restaurar</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Pantalla Completa</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. CONTENIDO PRINCIPAL: SIMULADOR 3D / 2D */}
      {activeTab === 'simulation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Columna Izquierda: Viewport 3D y/o Canvas Proyección 2D */}
          <div className={`${projectionMode === 'split' ? 'lg:col-span-8' : 'lg:col-span-9'} space-y-3`}>
            
            <div 
              ref={viewportWrapperRef}
              className={`${
                isFullscreen
                  ? 'fixed inset-0 z-50 w-screen h-screen bg-[#030610] rounded-none border-none p-3 shadow-none grid grid-cols-1 md:grid-cols-12 gap-3'
                  : 'grid grid-cols-1 md:grid-cols-12 gap-3 bg-[#030610] border border-slate-800 rounded-2xl p-2 h-[560px] relative overflow-hidden shadow-2xl'
              }`}
            >
              
              {/* Contenedor Three.js 3D */}
              {(projectionMode === 'split' || projectionMode === '3d_only') && (
                <div 
                  ref={canvasContainerRef} 
                  className={`w-full h-full relative ${projectionMode === 'split' ? 'md:col-span-7' : 'md:col-span-12'}`}
                />
              )}

              {/* Canvas Proyección 2D (Regla 8: Xs = x*d/(z+d) + Xc) */}
              {(projectionMode === 'split' || projectionMode === '2d_only') && (
                <div className={`w-full h-full relative flex flex-col ${projectionMode === 'split' ? 'md:col-span-5 border-l border-slate-800/80 pl-2' : 'md:col-span-12'}`}>
                  <canvas 
                    ref={projectionCanvasRef} 
                    width={400} 
                    height={540} 
                    className="w-full h-full rounded-xl object-contain bg-[#050a14]"
                  />
                  <div className="absolute bottom-3 left-4 right-4 bg-black/80 backdrop-blur-md p-2 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center justify-between">
                    <span>Focal d = {config.focalDistanceD.toFixed(1)}</span>
                    <input 
                      type="range" 
                      min="2.0" 
                      max="20.0" 
                      step="0.5" 
                      value={config.focalDistanceD} 
                      onChange={(e) => setConfig(prev => ({ ...prev, focalDistanceD: parseFloat(e.target.value) }))}
                      className="w-24 accent-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* HUD Superior flotante sobre la vista 3D */}
              <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-none text-xs font-mono">
                <div className="pointer-events-auto bg-black/75 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-800 text-[11px] text-cyan-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Partículas: <strong>{particles.length}</strong> ({electronsE} e⁻)</span>
                  <span className="border-l border-slate-700 pl-2">Verlet dt = {timeStepDt.toFixed(3)}s</span>
                </div>

                <div className="pointer-events-auto bg-black/75 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-800 text-[10px] flex items-center gap-2">
                  <button 
                    onClick={() => setShowVectors(!showVectors)}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${showVectors ? 'text-cyan-300 font-bold bg-cyan-950/40' : 'text-slate-500'}`}
                  >
                    Vectores v/a
                  </button>
                  <button 
                    onClick={() => setShowTrails(!showTrails)}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${showTrails ? 'text-cyan-300 font-bold bg-cyan-950/40' : 'text-slate-500'}`}
                  >
                    Estelas
                  </button>
                  <button 
                    onClick={() => setShowStandingWave(!showStandingWave)}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${showStandingWave ? 'text-cyan-300 font-bold bg-cyan-950/40' : 'text-slate-500'}`}
                  >
                    Onda λ_dB
                  </button>
                  <button 
                    onClick={() => setShowQuantumClouds(!showQuantumClouds)}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${showQuantumClouds ? 'text-purple-300 font-bold bg-purple-950/40' : 'text-slate-500'}`}
                  >
                    Nube |ψ|²
                  </button>
                </div>
              </div>

              {/* HUD en Pantalla Completa */}
              {isFullscreen && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 bg-black/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700/80 shadow-2xl text-xs font-mono">
                  <button
                    onClick={() => setIsPlaying(prev => !prev)}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/30 transition"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
                    <span>{isPlaying ? 'Pausar' : 'Reanudar'}</span>
                  </button>

                  <button
                    onClick={() => loadPreset(activePreset, atomicZ, neutronsN, electronsE)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reiniciar</span>
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5 font-bold transition border border-slate-600 cursor-pointer ml-2"
                  >
                    <Minimize2 className="w-4 h-4 text-cyan-400" />
                    <span>Salir Pantalla Completa</span>
                  </button>
                </div>
              )}

            </div>

            {/* Ficha Resumen de la Partícula Seleccionada */}
            {selectedParticle && particleObservables && (
              <div className="bg-[#0b121e] border border-slate-800 rounded-xl p-3 text-xs font-mono flex flex-wrap items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-4 h-4 rounded-full border border-white/60 shadow-sm"
                    style={{ backgroundColor: selectedParticle.color }}
                  />
                  <div>
                    <span className="font-bold text-white text-sm">{selectedParticle.name}</span>
                    <span className="text-slate-400 text-[10.5px] ml-2">
                      q = {(selectedParticle.charge / PHYSICAL_CONSTANTS.E_CHARGE).toFixed(1)}e · m = {(selectedParticle.mass / PHYSICAL_CONSTANTS.M_E).toFixed(1)} m_e
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Posición r(t)</span>
                    <span className="text-cyan-300">
                      ({selectedParticle.r.x.toFixed(2)}, {selectedParticle.r.y.toFixed(2)}, {selectedParticle.r.z.toFixed(2)})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Velocidad |v|</span>
                    <span className="text-emerald-300">{particleObservables.speedKmS} km/s</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Longitud de Broglie (λ)</span>
                    <span className="text-purple-300">{particleObservables.deBroglieNm} nm</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Energía Cinética (Ek)</span>
                    <span className="text-amber-300">{particleObservables.keEv.toFixed(2)} eV</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Columna Derecha: Panel de Corteza Cuántica, Principio de Aufbau e Ionización */}
          <div className={`${projectionMode === 'split' ? 'lg:col-span-4' : 'lg:col-span-3'} space-y-3`}>
            
            <div className="bg-[#090f1a] border border-cyan-500/30 rounded-2xl p-4 space-y-4 shadow-xl text-xs font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" /> Corteza Electrónica Cuántica
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  netCharge === 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                  netCharge > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                }`}>
                  {netCharge === 0 ? 'Neutro (0)' : netCharge > 0 ? `Catión +${netCharge}` : `Anión ${netCharge}`}
                </span>
              </div>

              {/* Configuración Electrónica Aufbau */}
              <div className="space-y-1.5 bg-[#040810] p-3 rounded-xl border border-cyan-500/20">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Configuración Electrónica (Aufbau):
                </span>
                <div className="font-mono text-cyan-300 font-bold text-xs tracking-wider break-words">
                  {aufbau.formula}
                </div>
                <div className="text-[10.5px] text-slate-400 flex justify-between pt-1 border-t border-slate-800">
                  <span>Electrones de valencia: <strong className="text-white">{aufbau.valenceElectrons}</strong></span>
                  <span>Carga neta: <strong className={netCharge === 0 ? 'text-emerald-400' : 'text-amber-400'}>{netCharge >= 0 ? `+${netCharge}` : netCharge}e</strong></span>
                </div>
              </div>

              {/* Capas Cuánticas Bohr K, L, M, N (2n²) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-bold">Capas de Bohr ({aufbau.shells.length} niveles activos)</span>
                  <span className="text-cyan-400">{electronsE} e⁻ totales</span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {aufbau.shells.map(sh => {
                    const pct = Math.min(100, (sh.count / sh.cap) * 100);
                    const isFull = sh.count >= sh.cap;
                    const shellColor = QUANTUM_SHELL_COLORS[(sh.n - 1) % QUANTUM_SHELL_COLORS.length];

                    return (
                      <div key={`sh-${sh.name}`} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[10.5px]">
                          <span className="font-bold flex items-center gap-1.5" style={{ color: shellColor }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: shellColor }} />
                            <span>Capa {sh.name} (n={sh.n})</span>
                            {isFull && <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded">Llena</span>}
                          </span>
                          <span className="text-white font-mono">{sh.count} / {sh.cap} e⁻</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-300"
                            style={{ width: `${pct}%`, backgroundColor: shellColor }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Control de Ionización Rápida */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Control de Ionización / Estado Redox:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleUpdateElectrons(atomicZ)}
                    className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 text-cyan-200 border border-cyan-800/60 text-[10.5px] font-bold text-center cursor-pointer transition"
                  >
                    Neutro (e⁻={atomicZ})
                  </button>
                  <button
                    onClick={() => handleUpdateElectrons(0)}
                    className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-[10.5px] font-bold text-center cursor-pointer transition"
                    title="Arrancar todos los electrones para dejar el núcleo desnudo en estado de plasma"
                  >
                    Desnudar (0 e⁻)
                  </button>
                  <button
                    onClick={() => handleUpdateElectrons(electronsE - 1)}
                    disabled={electronsE <= 0}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[10.5px] font-bold text-center disabled:opacity-30 cursor-pointer transition"
                  >
                    + Ionizar (−1 e⁻)
                  </button>
                  <button
                    onClick={() => handleUpdateElectrons(electronsE + 1)}
                    disabled={electronsE >= 120}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[10.5px] font-bold text-center disabled:opacity-30 cursor-pointer transition"
                  >
                    − Reducir (+1 e⁻)
                  </button>
                </div>
              </div>

              {/* Lista de Partículas para Inspección */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">
                  Partículas en Simulación ({particles.length}):
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {particles.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedParticleId(p.id)}
                      className={`w-full text-left p-1.5 rounded-lg border transition text-[11px] flex items-center justify-between cursor-pointer ${
                        selectedParticleId === p.id
                          ? 'bg-cyan-950/60 text-cyan-200 border-cyan-400 font-bold'
                          : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="truncate">{p.name}</span>
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        q: {(p.charge / PHYSICAL_CONSTANTS.E_CHARGE).toFixed(0)}e
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* 5. TAB DE ESPECIFICACIÓN MATEMÁTICA INTEGRADA: 8 LEYES EN LATEX */}
      {activeTab === 'equations' && (
        <div className="space-y-4">
          <div className="bg-[#090f1a] border border-cyan-500/40 rounded-2xl p-5 shadow-2xl space-y-6 text-slate-200 font-mono">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Especificación Matemática Unificada del Motor Físico (8 Leyes)
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Electrodinámica cuántica semi-clásica de Bohr, resonancia de de Broglie, principio de Aufbau y algoritmo simpléctico de Verlet.
                </p>
              </div>
              <span className="text-xs bg-cyan-950/80 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/40">
                SI Units / Symplectic Verlet
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 1. Constantes Físicas Fundamentales */}
              <div className="bg-[#060a12] border border-slate-800 rounded-xl p-4 space-y-2">
                <span className="text-cyan-400 font-bold text-xs uppercase block border-b border-slate-800/80 pb-1">
                  1. Constantes Físicas Fundamentales
                </span>
                <div className="text-[11.5px] space-y-1 text-slate-300">
                  <BlockMath math="m_e = 9.1093837 \times 10^{-31} \text{ kg}, \quad m_p = 1.6726 \times 10^{-27} \text{ kg}" />
                  <BlockMath math="q_e = -1.6021766 \times 10^{-19} \text{ C}, \quad \varepsilon_0 = 8.854 \times 10^{-12} \text{ F/m}" />
                  <BlockMath math="k_e = \frac{1}{4\pi\varepsilon_0} \approx 8.988 \times 10^9 \text{ N}\cdot\text{m}^2/\text{C}^2" />
                  <BlockMath math="h = 6.626 \times 10^{-34} \text{ J}\cdot\text{s}, \quad \hbar = \frac{h}{2\pi} \approx 1.055 \times 10^{-34} \text{ J}\cdot\text{s}" />
                </div>
              </div>

              {/* 2. Estado Cinemático de la Partícula */}
              <div className="bg-[#060a12] border border-slate-800 rounded-xl p-4 space-y-2">
                <span className="text-cyan-400 font-bold text-xs uppercase block border-b border-slate-800/80 pb-1">
                  2. Estado Cinemático de la Partícula
                </span>
                <p className="text-[11px] text-slate-400 font-sans">
                  Cada partícula en el espacio 3D posee posición, velocidad, aceleración, masa y carga eléctrica:
                </p>
                <div className="text-[11.5px] space-y-1 text-slate-300">
                  <BlockMath math="\mathbf{r}_i = (x_i, y_i, z_i), \quad \mathbf{v}_i = (v_{xi}, v_{yi}, v_{zi})" />
                  <BlockMath math="\mathbf{a}_i = (a_{xi}, a_{yi}, a_{zi}), \quad m_i > 0, \quad q_i \in \mathbb{R}" />
                </div>
              </div>

              {/* 3. Ley de Movimiento General */}
              <div className="bg-[#060a12] border border-slate-800 rounded-xl p-4 space-y-2">
                <span className="text-cyan-400 font-bold text-xs uppercase block border-b border-slate-800/80 pb-1">
                  3. Ley de Movimiento General (2ª Ley de Newton)
                </span>
                <div className="text-[12px] text-slate-300">
                  <BlockMath math="\mathbf{a}_i = \frac{\sum \mathbf{F}_i}{m_i} = \frac{\mathbf{F}_{g, i} + \mathbf{F}_{\text{drag}, i} + \mathbf{F}_{L, i} + \sum_{j \neq i} \mathbf{F}_{C, ij}}{m_i}" />
                </div>
              </div>

              {/* 4. Modelado de Fuerzas Físicas */}
              <div className="bg-[#060a12] border border-slate-800 rounded-xl p-4 space-y-2">
                <span className="text-cyan-400 font-bold text-xs uppercase block border-b border-slate-800/80 pb-1">
                  4. Modelado de Fuerzas Físicas
                </span>
                <div className="text-[11px] space-y-1 text-slate-300">
                  <BlockMath math="\mathbf{F}_g = m_i \mathbf{g}, \quad \mathbf{F}_{\text{drag}} = -\gamma \mathbf{v}_i" />
                  <BlockMath math="\mathbf{F}_L = q_i (\mathbf{E} + \mathbf{v}_i \times \mathbf{B})" />
                  <BlockMath math="\mathbf{F}_{C, ij} = \frac{1}{4\pi\varepsilon_0} \frac{q_i q_j}{||\mathbf{r}_j - \mathbf{r}_i||^3} (\mathbf{r}_i - \mathbf{r}_j)" />
                </div>
              </div>

              {/* 5. Dinámica Cuántica y Ondulatoria de de Broglie */}
              <div className="bg-[#060a12] border border-slate-800 rounded-xl p-4 space-y-2">
                <span className="text-purple-400 font-bold text-xs uppercase block border-b border-slate-800/80 pb-1">
                  5. Dinámica Cuántica y Ondulatoria de de Broglie
                </span>
                <p className="text-[11px] text-slate-400 font-sans">
                  Equilibrio centrípeto con la atracción coulómbica nuclear y condición de resonancia estacionaria:
                </p>
                <div className="text-[11.5px] space-y-1 text-slate-300">
                  <BlockMath math="\frac{m_e v^2}{r} = \frac{1}{4\pi\varepsilon_0} \frac{Z_{\text{eff}} e^2}{r^2} \implies v = \sqrt{\frac{Z_{\text{eff}} e^2}{4\pi\varepsilon_0 m_e r}}" />
                  <BlockMath math="\lambda = \frac{h}{p} = \frac{h}{m_e v} \implies 2\pi r = n \lambda \quad (n = 1, 2, 3...)" />
                </div>
              </div>

              {/* 6. Integración Numérica (Verlet) */}
              <div className="bg-[#060a12] border border-slate-800 rounded-xl p-4 space-y-2">
                <span className="text-purple-400 font-bold text-xs uppercase block border-b border-slate-800/80 pb-1">
                  6. Integración Numérica (Método de Verlet)
                </span>
                <div className="text-[11.5px] space-y-1 text-slate-300">
                  <BlockMath math="\mathbf{r}(t + \Delta t) = 2\mathbf{r}(t) - \mathbf{r}(t - \Delta t) + \mathbf{a}(t) \Delta t^2" />
                  <BlockMath math="\mathbf{v}(t) \approx \frac{\mathbf{r}(t + \Delta t) - \mathbf{r}(t - \Delta t)}{2\Delta t}" />
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 6. TAB DE TELEMETRÍA DETALLADA */}
      {activeTab === 'telemetry' && selectedParticle && particleObservables && (
        <div className="bg-[#090f1a] border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedParticle.color }} />
              Telemetría en Tiempo Real: {selectedParticle.name}
            </h3>
            <span className="text-cyan-400">ID: {selectedParticle.id}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase block mb-1">Vectores Cinemáticos (SI)</span>
              <div className="space-y-1 text-slate-200 text-[11px]">
                <div><strong>r:</strong> [{selectedParticle.r.x.toFixed(4)}, {selectedParticle.r.y.toFixed(4)}, {selectedParticle.r.z.toFixed(4)}] m</div>
                <div><strong>v:</strong> [{selectedParticle.v.x.toFixed(4)}, {selectedParticle.v.y.toFixed(4)}, {selectedParticle.v.z.toFixed(4)}] m/s</div>
                <div><strong>a:</strong> [{selectedParticle.a.x.toFixed(4)}, {selectedParticle.a.y.toFixed(4)}, {selectedParticle.a.z.toFixed(4)}] m/s²</div>
              </div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase block mb-1">Propiedades Intrínsecas</span>
              <div className="space-y-1 text-slate-200 text-[11px]">
                <div><strong>Masa (m):</strong> {selectedParticle.mass.toExponential(4)} kg</div>
                <div><strong>Carga (q):</strong> {selectedParticle.charge.toExponential(4)} C</div>
                <div><strong>Nivel Cuántico n:</strong> {selectedParticle.principalQuantumN ?? 'Núcleo'}</div>
              </div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase block mb-1">Dinámica Cuántica & Energía</span>
              <div className="space-y-1 text-slate-200 text-[11px]">
                <div><strong>Energía Cinética:</strong> {particleObservables.keEv.toFixed(3)} eV</div>
                <div><strong>Longitud de Broglie:</strong> {particleObservables.deBroglieNm} nm</div>
                <div><strong>Velocidad escalar:</strong> {particleObservables.speedKmS} km/s</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL DE NAVEGACIÓN Y SELECCIÓN DE ISÓTOPOS DE LA TABLA PERIÓDICA */}
      {isIsotopeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#070d18] border border-cyan-500/50 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans">
            
            {/* Header del Modal */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#050a14]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Atom className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white font-mono uppercase tracking-wide">
                    Tabla Periódica · Selector de Isótopos Cuánticos
                  </h3>
                  <p className="text-xs text-slate-400">
                    Selecciona cualquier elemento químico (1 al 118) o un isótopo específico para cargar en el motor físico 3D.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsIsotopeModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Buscador y Filtros por Categoría */}
            <div className="p-4 border-b border-slate-800 space-y-3 bg-[#0a101d]">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, símbolo químico o número atómico Z (ej. Uranio, C, 92)..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-[#050a14] border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Chips de Categoría */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono scrollbar-none">
                {ELEMENT_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 font-bold'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Elementos e Isótopos */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {filteredElements.map(el => {
                  const isCurrent = el.z === atomicZ;
                  const isotopes = getIsotopesForElement(el.z);

                  return (
                    <div
                      key={`modal-el-${el.z}`}
                      className={`p-3 rounded-xl border transition flex flex-col justify-between gap-2 ${
                        isCurrent
                          ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                          : 'bg-[#0a1220]/80 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-extrabold text-cyan-400 font-mono">
                              {el.symbol}
                            </span>
                            <span className="font-bold text-white text-xs">
                              {el.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Z = {el.z} • {el.categoryLabel}
                          </span>
                        </div>
                        <button
                          onClick={() => handleSelectElement(el)}
                          className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold cursor-pointer transition font-mono"
                        >
                          Cargar Z={el.z}
                        </button>
                      </div>

                      {/* Chips de Isótopos del Elemento */}
                      <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-800/60 font-mono">
                        {isotopes.slice(0, 4).map(iso => (
                          <button
                            key={iso.id}
                            onClick={() => handleSelectIsotope(iso)}
                            className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[9.5px] text-slate-300 hover:text-white cursor-pointer transition flex items-center gap-1"
                            title={`${iso.name}: ${iso.halfLife}`}
                          >
                            <span>{iso.symbol}</span>
                            {iso.category === 'Estable' ? (
                              <span className="w-1 h-1 rounded-full bg-emerald-400" />
                            ) : (
                              <span className="w-1 h-1 rounded-full bg-amber-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredElements.length === 0 && (
                <div className="text-center py-12 text-slate-500 font-mono text-xs">
                  No se encontraron elementos químicos que coincidan con la búsqueda.
                </div>
              )}
            </div>

            {/* Footer con Atajo Rápido a Isótopos Notables */}
            <div className="p-3 bg-[#050a14] border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="text-[10px] text-slate-400">Atajos a Isótopos Notables:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { label: '¹H Protio', z: 1, n: 0 },
                  { label: '²H Deuterio', z: 1, n: 1 },
                  { label: '⁴He Alfa', z: 2, n: 2 },
                  { label: '¹²C Carbono', z: 6, n: 6 },
                  { label: '¹⁴C Radiocarbono', z: 6, n: 8 },
                  { label: '⁵⁶Fe Hierro', z: 26, n: 30 },
                  { label: '²³⁵U Fisionable', z: 92, n: 143 },
                  { label: '²³⁸U Primordial', z: 92, n: 146 },
                ].map(iso => (
                  <button
                    key={iso.label}
                    onClick={() => {
                      const found = NOTABLE_ISOTOPES.find(i => i.z === iso.z && i.n === iso.n);
                      if (found) handleSelectIsotope(found);
                      else {
                        setAtomicZ(iso.z);
                        setNeutronsN(iso.n);
                        setElectronsE(iso.z);
                        setIsIsotopeModalOpen(false);
                        if (activePreset === 'bohr') loadPreset('bohr', iso.z, iso.n, iso.z);
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-[10px] font-bold cursor-pointer transition"
                  >
                    {iso.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
