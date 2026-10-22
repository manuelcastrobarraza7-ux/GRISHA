import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { 
  Atom, 
  RotateCcw, 
  Share2, 
  ArrowRight, 
  CheckCircle2, 
  Trophy, 
  Sparkles, 
  HelpCircle, 
  X, 
  BookOpen, 
  Layers,
  ChevronRight,
  Zap,
  Flame,
  Check,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Scissors,
  ZoomIn,
  Copy,
  Info,
  Sliders,
  Maximize2,
  Minimize2,
  ShieldAlert,
  ShieldCheck,
  Radio,
  LayoutGrid,
  Grid3X3,
  Grid2X2,
  ArrowUp,
  Compass,
  SlidersHorizontal,
  Scale,
  RefreshCw,
  Lock,
  Radar
} from 'lucide-react';
import quantumAtomVisual from '../assets/images/quantum_atom_cloud_1792413105688.jpg';
import { PERIODIC_ELEMENTS } from '../data/periodicTable';
import { ValleyOfStabilityChart } from './ValleyOfStabilityChart';
import { StabilityRadarD3 } from './StabilityRadarD3';
import { EquationMath } from './ChemicalLatex';
import { 
  getStabilityVerdict, 
  getElectronLimits, 
  evaluateBetaDecayConditions,
  evaluateAutomaticDecayStep,
  evaluateDecayChannels,
  KNOWN_GAMMA_ISOMERS,
  ElectronLimitInfo,
  BetaDecayCheck,
  AutoDecayStep,
  GammaIsomer,
  DecayChannelsReport
} from '../data/valleyOfStability';
import { ATOM_MISSIONS, AtomMission } from '../data/atomMissions';
import { addDiscoveredToLibrary, isItemInLibrary, getDiscoveredLibrary, DiscoveredNucleus } from '../utils/libraryManager';

interface NucleusBuilder3DProps {
  initialZ?: number;
  initialN?: number;
  initialDimensionMode?: '3D' | '2D';
  onOpenElementDetails?: (z: number) => void;
  onNavigateHome?: () => void;
  onLaunchPhysicsEngine?: (z: number, n?: number) => void;
  onStateChange?: (state: { z: number; n: number; e: number; mode: '3D' | '2D' }) => void;
}

interface Nucleon2D {
  id: number;
  x: number;
  y: number;
  isProton: boolean;
  bufferedByNeutrons: boolean;
  coulombRepulsionVal: number;
}

/**
 * Computes physically realistic 2D nucleon positions.
 * Universal Physical Law: Protons have identical positive charge (+1e) and
 * cannot occupy the same position. Coulomb repulsion pushes protons apart (F ~ 1/r^2).
 * Neutrons (neutral charge, 0) interleave directly BETWEEN protons, providing
 * the strong nuclear force attraction that balances Coulomb repulsion and acts
 * as a physical dielectric/spatial buffer.
 */
function compute2DNucleonPositions(numProtons: number, numNeutrons: number): Nucleon2D[] {
  const total = numProtons + numNeutrons;
  if (total <= 0) return [];

  // Special case: Single nucleon (e.g. 1H proton or single neutron)
  if (total === 1) {
    return [{
      id: 0,
      x: 0,
      y: 0,
      isProton: numProtons === 1,
      bufferedByNeutrons: true,
      coulombRepulsionVal: 0
    }];
  }

  // Extreme Coulomb instability case: Multiple protons with ZERO neutrons (e.g. He-2 / diproton)
  // Without neutrons to sit in between, Coulomb repulsion forces protons apart into an expanded unbound state!
  if (numProtons >= 2 && numNeutrons === 0) {
    const radius = 60 + numProtons * 10;
    return Array.from({ length: numProtons }, (_, i) => {
      const angle = (2 * Math.PI * i) / numProtons;
      return {
        id: i,
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        isProton: true,
        bufferedByNeutrons: false,
        coulombRepulsionVal: 99.9 // High Coulomb repulsion, no buffer
      };
    });
  }

  // General case: Protons and Neutrons.
  // 1. Establish an alternating equilibrium lattice where protons are kept separated
  // and neutrons are stationed in the interstitial gaps between them.
  const spacing = total > 50 ? 18 : (total > 25 ? 24 : 30);
  const rawPositions: { x: number; y: number }[] = [];
  
  // Center position (if total is odd or low)
  rawPositions.push({ x: 0, y: 0 });
  let placed = 1;
  let ring = 1;
  while (placed < total) {
    const ringCap = Math.round(6 * ring);
    const inThisRing = Math.min(total - placed, ringCap);
    const ringRadius = ring * spacing;
    for (let j = 0; j < inThisRing; j++) {
      const angle = (2 * Math.PI * j) / inThisRing + (ring % 2 === 1 ? 0 : Math.PI / inThisRing);
      rawPositions.push({
        x: ringRadius * Math.cos(angle),
        y: ringRadius * Math.sin(angle)
      });
    }
    placed += inThisRing;
    ring++;
  }

  // Assign protons and neutrons:
  // Protons must be assigned to positions that maximize mutual distance (Coulomb minimization),
  // leaving the intermediate positions for neutrons!
  const isProtonArr = new Array(total).fill(false);

  if (numProtons >= total) {
    isProtonArr.fill(true);
  } else if (numProtons > 0) {
    // If only 1 proton: place in center or outermost depending on total
    if (numProtons === 1) {
      isProtonArr[0] = true;
    } else {
      // Pick first proton at index 1 if neutrons exist, keeping center buffered
      const startIdx = (numNeutrons >= 1) ? 1 : 0;
      isProtonArr[startIdx] = true;
      const protonIndices: number[] = [startIdx];

      // Greedily pick subsequent proton locations that maximize distance from all existing protons
      while (protonIndices.length < numProtons) {
        let bestIdx = -1;
        let minCoulombSum = Infinity;

        for (let i = 0; i < total; i++) {
          if (isProtonArr[i]) continue;
          let coulombSum = 0;
          for (const pIdx of protonIndices) {
            const dx = rawPositions[i].x - rawPositions[pIdx].x;
            const dy = rawPositions[i].y - rawPositions[pIdx].y;
            const distSq = dx * dx + dy * dy + 1;
            coulombSum += 1.0 / distSq;
          }
          if (coulombSum < minCoulombSum) {
            minCoulombSum = coulombSum;
            bestIdx = i;
          }
        }

        if (bestIdx !== -1) {
          isProtonArr[bestIdx] = true;
          protonIndices.push(bestIdx);
        } else {
          break;
        }
      }

      // Simulated annealing / swap passes to ensure global Coulomb minimization
      for (let iter = 0; iter < 15; iter++) {
        let swapped = false;
        for (let p = 0; p < total; p++) {
          if (!isProtonArr[p]) continue;
          for (let n = 0; n < total; n++) {
            if (isProtonArr[n]) continue;
            let curE = 0;
            let swapE = 0;
            for (let other = 0; other < total; other++) {
              if (other === p || other === n || !isProtonArr[other]) continue;
              const dCur = (rawPositions[p].x - rawPositions[other].x) ** 2 + (rawPositions[p].y - rawPositions[other].y) ** 2 + 1;
              const dSwap = (rawPositions[n].x - rawPositions[other].x) ** 2 + (rawPositions[n].y - rawPositions[other].y) ** 2 + 1;
              curE += 1.0 / dCur;
              swapE += 1.0 / dSwap;
            }
            if (swapE < curE - 0.005) {
              isProtonArr[p] = false;
              isProtonArr[n] = true;
              swapped = true;
              break;
            }
          }
          if (swapped) break;
        }
        if (!swapped) break;
      }
    }
  }

  // Physics force relaxation:
  // Protons repel each other (Coulomb repulsion pushes protons apart).
  // Neutrons are pulled directly into the intermediate gaps by Strong Nuclear Force!
  const pos = rawPositions.map(p => ({ x: p.x, y: p.y }));
  const kCoulomb = 1800;
  const kStrong = 0.12;
  const targetDist = spacing;
  const minHardCore = spacing * 0.75;

  for (let step = 0; step < 40; step++) {
    for (let i = 0; i < total; i++) {
      let fx = 0;
      let fy = 0;

      for (let j = 0; j < total; j++) {
        if (i === j) continue;
        const dx = pos[i].x - pos[j].x;
        const dy = pos[i].y - pos[j].y;
        const dist = Math.hypot(dx, dy) || 0.001;
        const nx = dx / dist;
        const ny = dy / dist;

        // Hard-core nucleon volume exclusion (Pauli repulsion)
        if (dist < minHardCore) {
          const push = (minHardCore - dist) * 0.4;
          fx += nx * push;
          fy += ny * push;
        }

        // Coulomb repulsion between protons
        if (isProtonArr[i] && isProtonArr[j]) {
          const fC = kCoulomb / (dist * dist + 10);
          fx += nx * fC;
          fy += ny * fC;
        }

        // Strong Nuclear Force attraction between adjacent nucleons
        if (dist < targetDist * 1.8) {
          const delta = dist - targetDist;
          // Especially attractive between proton-neutron pairs (mediating buffer)
          const multiplier = (isProtonArr[i] !== isProtonArr[j]) ? 1.4 : 0.8;
          const fS = -kStrong * delta * multiplier;
          fx += nx * fS;
          fy += ny * fS;
        }
      }

      // Gentle centering spring
      fx -= pos[i].x * 0.015;
      fy -= pos[i].y * 0.015;

      pos[i].x += fx * 0.12;
      pos[i].y += fy * 0.12;
    }
  }

  // Assess buffering quality for each proton
  return pos.map((p, idx) => {
    const isP = isProtonArr[idx];
    let minDistToProton = Infinity;
    let minDistToNeutron = Infinity;
    let localCoulomb = 0;

    if (isP) {
      for (let j = 0; j < total; j++) {
        if (idx === j) continue;
        const dist = Math.hypot(p.x - pos[j].x, p.y - pos[j].y);
        if (isProtonArr[j]) {
          if (dist < minDistToProton) minDistToProton = dist;
          localCoulomb += 100 / (dist * dist + 1);
        } else {
          if (dist < minDistToNeutron) minDistToNeutron = dist;
        }
      }
    }

    const buffered = !isP || (minDistToNeutron <= minDistToProton * 1.15) || (numNeutrons === 0 && numProtons === 1);

    return {
      id: idx,
      x: Math.round(p.x * 10) / 10,
      y: Math.round(p.y * 10) / 10,
      isProton: isP,
      bufferedByNeutrons: buffered,
      coulombRepulsionVal: Math.round(localCoulomb * 10) / 10
    };
  });
}

export const NucleusBuilder3D: React.FC<NucleusBuilder3DProps> = ({
  initialZ = 7, // Nitrogen default as in screenshot
  initialN = 7,
  initialDimensionMode = '3D',
  onOpenElementDetails,
  onNavigateHome,
  onLaunchPhysicsEngine,
  onStateChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportWrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // Nucleus core state (protons and neutrons)
  const [atomicNumberZ, setAtomicNumberZ] = useState<number>(initialZ);
  const [neutronsN, setNeutronsN] = useState<number>(initialN);
  const [dimensionMode, setDimensionMode] = useState<'3D' | '2D'>(initialDimensionMode === '2D' ? '2D' : '3D');
  const dimensionModeRef = useRef<'3D' | '2D'>(dimensionMode);
  dimensionModeRef.current = dimensionMode;

  // Sync prop changes if deep-link URL changes externally
  useEffect(() => {
    if (initialZ !== undefined) setAtomicNumberZ(initialZ);
  }, [initialZ]);

  useEffect(() => {
    if (initialN !== undefined) setNeutronsN(initialN);
  }, [initialN]);

  useEffect(() => {
    if (initialDimensionMode) setDimensionMode(initialDimensionMode === '2D' ? '2D' : '3D');
  }, [initialDimensionMode]);

  // Beta Decay settings & state (Siempre inicia en OFF apagado)
  const [autoBetaDecayEnabled, setAutoBetaDecayEnabled] = useState<boolean>(false);
  const [betaThresholdX, setBetaThresholdX] = useState<number>(2); // X nucleons excess threshold
  const [decayCountdown, setDecayCountdown] = useState<number | null>(null);
  const [betaDecayNotification, setBetaDecayNotification] = useState<{
    type: 'beta_minus' | 'beta_plus';
    title: string;
    desc: string;
    equation: string;
    fromSymbol: string;
    toSymbol: string;
    fromZ: number;
    toZ: number;
    massA: number;
  } | null>(null);

  // Unified Nuclear Reaction Notification (Beta, Alpha Fission, Nuclear Fusion, Gamma, Proton & Neutron Emission)
  const [nuclearReactionNotification, setNuclearReactionNotification] = useState<{
    type: 'beta_minus' | 'beta_plus' | 'alpha_fission' | 'nuclear_fusion' | 'gamma_decay' | 'proton_emission' | 'neutron_emission';
    title: string;
    badge: string;
    badgeColor: string;
    desc: string;
    equation: string;
    energyMev?: string;
    details?: string[];
  } | null>(null);

  // Estado de isómero nuclear metaestable (m) para transiciones gamma puras (ΔZ = 0, ΔN = 0)
  const [isMetastableState, setIsMetastableState] = useState<boolean>(false);

  // Nuclear Reactions Tool Tab State
  const [reactionTab, setReactionTab] = useState<'alpha' | 'fusion'>('alpha');
  const [selectedProjectile, setSelectedProjectile] = useState<'p' | 'n' | 'd' | 'alpha' | 'c12'>('d');

  // Notify parent of state changes to keep URL synchronized
  useEffect(() => {
    onStateChange?.({
      z: atomicNumberZ,
      n: neutronsN,
      e: atomicNumberZ,
      mode: dimensionMode,
    });
  }, [atomicNumberZ, neutronsN, dimensionMode, onStateChange]);
  const [showNuclearForces, setShowNuclearForces] = useState<boolean>(true);
  const [showCoulombVectors, setShowCoulombVectors] = useState<boolean>(true);
  const [activeNucleonHover, setActiveNucleonHover] = useState<{
    id: number;
    type: 'proton' | 'neutron';
    charge: string;
    description: string;
  } | null>(null);

  // Quantum vs Bohr visual model state
  const [visualizationModel, setVisualizationModel] = useState<'quantum' | 'bohr'>('quantum');
  const [scaleMode, setScaleMode] = useState<'quantum_scale' | 'nucleus_zoom'>('quantum_scale');
  const [selectedOrbitalFilter, setSelectedOrbitalFilter] = useState<string>('all');
  const [probabilityCutaway, setProbabilityCutaway] = useState<boolean>(false);
  const [probabilityThreshold, setProbabilityThreshold] = useState<number>(90); // 90% boundary isosurface
  const [showPrinciplesGuide, setShowPrinciplesGuide] = useState<boolean>(false);
  const [showImagePreviewModal, setShowImagePreviewModal] = useState<boolean>(false);
  const [copiedPromptLang, setCopiedPromptLang] = useState<'es' | 'en' | null>(null);

  // Challenge / Mission Mode state
  const [isChallengeMode, setIsChallengeMode] = useState<boolean>(false);
  const [currentMissionIndex, setCurrentMissionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [missionCompletedToast, setMissionCompletedToast] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showLibraryModal, setShowLibraryModal] = useState<boolean>(false);
  const [libraryItems, setLibraryItems] = useState<DiscoveredNucleus[]>(() => getDiscoveredLibrary());

  // Estado de Organización en Cuadrícula Modular & Mini-HUD Flotante
  const [gridColumns, setGridColumns] = useState<'3' | '2'>('3');
  const [gridCategory, setGridCategory] = useState<'all' | 'transitions' | 'stability' | 'controls'>('all');
  const [isScrolledPastViewer, setIsScrolledPastViewer] = useState<boolean>(false);

  // Detector de scroll para mostrar el Mini-HUD flotante cuando el visor 3D sale de pantalla
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsScrolledPastViewer(scrollY > 520);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen to library updates
  useEffect(() => {
    const handleLibUpdate = (e: any) => {
      setLibraryItems(e.detail || getDiscoveredLibrary());
    };
    window.addEventListener('espiquumeyria_library_updated', handleLibUpdate);
    return () => window.removeEventListener('espiquumeyria_library_updated', handleLibUpdate);
  }, []);

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const nucleusGroupRef = useRef<THREE.Group | null>(null);
  const electronsGroupRef = useRef<THREE.Group | null>(null);
  const quantumCloudsGroupRef = useRef<THREE.Group | null>(null);
  const decayEffectsGroupRef = useRef<THREE.Group | null>(null);
  const electronMeshesRef = useRef<{ mesh: THREE.Mesh; angle: number; speed: number; radius: number }[]>([]);
  const glowTextureRef = useRef<THREE.Texture | null>(null);
  const activeDecayEffectsRef = useRef<{
    particleMesh: THREE.Object3D;
    shockwaveMesh: THREE.Mesh;
    velocity: THREE.Vector3;
    life: number;
    maxLife: number;
  }[]>([]);

  // Current Element metadata (Supports Z=0 Free Neutron)
  const currentElement = useMemo(() => {
    if (atomicNumberZ === 0) {
      return {
        z: 0,
        symbol: 'n',
        name: 'Neutrón Libre (¹n)',
        categoryLabel: 'Barión libre · Nucleón neutro',
        electronConfig: 'Sin electrones ligados (Z=0)'
      };
    }
    return PERIODIC_ELEMENTS.find(e => e.z === atomicNumberZ) || {
      z: atomicNumberZ,
      symbol: `E${atomicNumberZ}`,
      name: `Elemento-${atomicNumberZ}`,
      categoryLabel: 'Elemento sintético',
      electronConfig: ''
    };
  }, [atomicNumberZ]);

  // Mass number, total nucleons & net charge
  const massNumberA = atomicNumberZ + neutronsN;
  const totalNucleons = massNumberA;
  const netCharge = atomicNumberZ;

  // Estimated Coulomb Repulsion Energy (Bethe-Weizsäcker formula: Ec = ac * Z*(Z-1) / A^(1/3))
  const coulombEnergyMev = useMemo(() => {
    if (atomicNumberZ <= 1 || massNumberA <= 1) return '0.00';
    const ac = 0.71; // MeV constant in Bethe-Weizsäcker formula
    const ec = (ac * atomicNumberZ * (atomicNumberZ - 1)) / Math.max(1, Math.cbrt(massNumberA));
    return ec.toFixed(2);
  }, [atomicNumberZ, massNumberA]);

  // Precomputed 2D nucleons layout with physical Coulomb relaxation & intermediate neutron buffering
  const nucleons2D = useMemo(() => {
    return compute2DNucleonPositions(atomicNumberZ, neutronsN);
  }, [atomicNumberZ, neutronsN]);

  // Auto-detect if current isotope matches a known gamma isomer in nuclear medicine / physics
  useEffect(() => {
    const isKnownIsomer = KNOWN_GAMMA_ISOMERS.some(iso => iso.z === atomicNumberZ && iso.n === neutronsN);
    setIsMetastableState(isKnownIsomer);
  }, [atomicNumberZ, neutronsN]);

  // Evaluador de factibilidad de decaimiento automático nuclear (Alfa, Beta-, Beta+, Gamma pura)
  const autoDecayStep: AutoDecayStep = useMemo(() => {
    return evaluateAutomaticDecayStep(atomicNumberZ, neutronsN, isMetastableState);
  }, [atomicNumberZ, neutronsN, isMetastableState]);

  // Evaluador integral de canales de decaimiento (Alfa, Beta-, Beta+, Gamma pura) de estricta fidelidad física
  const decayChannels: DecayChannelsReport = useMemo(() => {
    return evaluateDecayChannels(atomicNumberZ, neutronsN, isMetastableState);
  }, [atomicNumberZ, neutronsN, isMetastableState]);

  // Beta Decay Conditions evaluation (rich in neutrons vs rich in protons)
  const betaCheck: BetaDecayCheck = useMemo(() => {
    return evaluateBetaDecayConditions(atomicNumberZ, neutronsN, betaThresholdX);
  }, [atomicNumberZ, neutronsN, betaThresholdX]);

  // Audio synthesizer for Nuclear Reactions (Beta, Alpha Fission, Nuclear Fusion, Gamma, Proton & Neutron Emission)
  const playNuclearAudio = (type: 'beta_minus' | 'beta_plus' | 'alpha' | 'fusion' | 'gamma' | 'proton' | 'neutron') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      if (type === 'gamma') {
        // High-frequency crystal electromagnetic resonance chime (pure photon emission)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1400, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(2600, ctx.currentTime + 0.12);
        osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.45);
        gain1.gain.setValueAtTime(0.18, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.48);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.5);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(840, ctx.currentTime);
        osc2.frequency.linearRampToValueAtTime(1680, ctx.currentTime + 0.2);
        gain2.gain.setValueAtTime(0.1, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.42);
      } else if (type === 'alpha') {
        // Deep low-frequency nuclear rupture + high-velocity alpha ejection whistle
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(160, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 0.38);
        gain1.gain.setValueAtTime(0.24, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.42);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.43);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(650, ctx.currentTime + 0.04);
        osc2.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.28);
        gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.04);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime + 0.04);
        osc2.stop(ctx.currentTime + 0.33);
      } else if (type === 'fusion') {
        // Relativistic implosion compression + high-energy thermonuclear blast
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(90, ctx.currentTime);
        osc1.frequency.linearRampToValueAtTime(560, ctx.currentTime + 0.16);
        osc1.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.52);
        gain1.gain.setValueAtTime(0.08, ctx.currentTime);
        gain1.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.16);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.56);
      } else if (type === 'proton') {
        // High punchy proton ejection pop + resonance
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.26);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.29);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'neutron') {
        // Deep uncharged neutron emission thump
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(240, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(65, ctx.currentTime + 0.32);
        gain.gain.setValueAtTime(0.22, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.36);
      } else if (type === 'beta_minus') {
        // High rising frequency sweep (electron emission chirp)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(360, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1020, ctx.currentTime + 0.22);
        gain.gain.setValueAtTime(0.14, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        // Higher shimmering sine sweep (positron emission chime)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(780, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.22);
        gain.gain.setValueAtTime(0.14, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Audio fallback silent
    }
  };

  // 3D Reaction Particle Spawn function (Beta, Alpha cluster, Thermonuclear Fusion, Gamma, Proton & Neutron)
  const spawn3DDecayParticle = useCallback((type: 'beta_minus' | 'beta_plus' | 'alpha' | 'fusion' | 'gamma' | 'proton' | 'neutron') => {
    if (!sceneRef.current || !decayEffectsGroupRef.current) return;
    const group = decayEffectsGroupRef.current;

    // Cap active decay/fusion particle count to prevent lag spikes
    if (activeDecayEffectsRef.current.length > 15) {
      const oldest = activeDecayEffectsRef.current.shift();
      if (oldest) {
        group.remove(oldest.particleMesh);
        group.remove(oldest.shockwaveMesh);
      }
    }

    if (type === 'gamma') {
      // Pure electromagnetic gamma photon wave packet (transverse electromagnetic pulse, ΔZ=0, ΔN=0)
      const gammaGroup = new THREE.Group();

      // High-energy central photon core
      const coreGeo = new THREE.SphereGeometry(0.16, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1.0
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);

      // Violet/electric magenta electromagnetic wave shell
      const auraGeo = new THREE.SphereGeometry(0.3, 16, 16);
      const auraMat = new THREE.MeshBasicMaterial({
        color: 0xc084fc,
        transparent: true,
        opacity: 0.85
      });
      const auraMesh = new THREE.Mesh(auraGeo, auraMat);
      gammaGroup.add(coreMesh, auraMesh);

      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.2) * 2,
        (Math.random() - 0.5) * 2
      ).normalize();
      const velocity = dir.multiplyScalar(9.0); // Relativistic speed of light velocity

      // Transverse electromagnetic ring shockwave
      const ringGeo = new THREE.RingGeometry(0.28, 0.55, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xa855f7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
      });
      const shockwaveMesh = new THREE.Mesh(ringGeo, ringMat);
      shockwaveMesh.lookAt(dir);

      group.add(gammaGroup);
      group.add(shockwaveMesh);

      activeDecayEffectsRef.current.push({
        particleMesh: gammaGroup,
        shockwaveMesh,
        velocity,
        life: 0,
        maxLife: 0.85
      });
    } else if (type === 'alpha') {
      // Alpha particle (4He): 2 protons (red) + 2 neutrons (blue) bound quad-cluster
      const alphaGroup = new THREE.Group();
      const nucGeo = new THREE.SphereGeometry(0.13, 14, 14);
      const pMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const nMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });

      // 4 tightly packed nucleons
      const p1 = new THREE.Mesh(nucGeo, pMat); p1.position.set(0.08, 0.08, 0);
      const p2 = new THREE.Mesh(nucGeo, pMat); p2.position.set(-0.08, -0.08, 0);
      const n1 = new THREE.Mesh(nucGeo, nMat); n1.position.set(-0.08, 0.08, 0);
      const n2 = new THREE.Mesh(nucGeo, nMat); n2.position.set(0.08, -0.08, 0);

      // Golden ionization glow shell
      const glowGeo = new THREE.SphereGeometry(0.24, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.55
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);

      alphaGroup.add(p1, p2, n1, n2, glowMesh);

      // Random outward ejection direction
      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.2) * 2,
        (Math.random() - 0.5) * 2
      ).normalize();
      const velocity = dir.multiplyScalar(6.5);

      // Golden expanding plasma shockwave ring
      const ringGeo = new THREE.RingGeometry(0.25, 0.45, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
      });
      const shockwaveMesh = new THREE.Mesh(ringGeo, ringMat);
      shockwaveMesh.lookAt(dir);

      group.add(alphaGroup);
      group.add(shockwaveMesh);

      activeDecayEffectsRef.current.push({
        particleMesh: alphaGroup,
        shockwaveMesh,
        velocity,
        life: 0,
        maxLife: 1.1
      });
    } else if (type === 'fusion') {
      // Thermonuclear flash & incoming particle collapse
      const fusionGeo = new THREE.SphereGeometry(0.28, 18, 18);
      const fusionMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 1.0
      });
      const fusionMesh = new THREE.Mesh(fusionGeo, fusionMat);
      fusionMesh.position.set(3.5, 2.5, 2.5);

      const targetPos = new THREE.Vector3(0, 0, 0);
      const dir = targetPos.clone().sub(fusionMesh.position).normalize();
      const velocity = dir.multiplyScalar(5.5);

      // Bright expanding thermonuclear ring
      const ringGeo = new THREE.RingGeometry(0.3, 0.65, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1.0
      });
      const shockwaveMesh = new THREE.Mesh(ringGeo, ringMat);
      shockwaveMesh.position.set(0, 0, 0);

      group.add(fusionMesh);
      group.add(shockwaveMesh);

      activeDecayEffectsRef.current.push({
        particleMesh: fusionMesh,
        shockwaveMesh,
        velocity,
        life: 0,
        maxLife: 0.95
      });
    } else if (type === 'proton') {
      // Free Proton emission (Red nucleon with intense ruby shockwave)
      const partGeo = new THREE.SphereGeometry(0.16, 16, 16);
      const partMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const particleMesh = new THREE.Mesh(partGeo, partMat);

      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.2) * 2,
        (Math.random() - 0.5) * 2
      ).normalize();
      const velocity = dir.multiplyScalar(7.2);

      const ringGeo = new THREE.RingGeometry(0.22, 0.42, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf87171,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
      });
      const shockwaveMesh = new THREE.Mesh(ringGeo, ringMat);
      shockwaveMesh.lookAt(dir);

      group.add(particleMesh);
      group.add(shockwaveMesh);

      activeDecayEffectsRef.current.push({
        particleMesh,
        shockwaveMesh,
        velocity,
        life: 0,
        maxLife: 0.85
      });
    } else if (type === 'neutron') {
      // Free Neutron emission (Blue nucleon with cobalt shockwave)
      const partGeo = new THREE.SphereGeometry(0.16, 16, 16);
      const partMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
      const particleMesh = new THREE.Mesh(partGeo, partMat);

      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.2) * 2,
        (Math.random() - 0.5) * 2
      ).normalize();
      const velocity = dir.multiplyScalar(6.8);

      const ringGeo = new THREE.RingGeometry(0.22, 0.42, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
      });
      const shockwaveMesh = new THREE.Mesh(ringGeo, ringMat);
      shockwaveMesh.lookAt(dir);

      group.add(particleMesh);
      group.add(shockwaveMesh);

      activeDecayEffectsRef.current.push({
        particleMesh,
        shockwaveMesh,
        velocity,
        life: 0,
        maxLife: 0.85
      });
    } else {
      // Beta minus or Beta plus
      const isMinus = type === 'beta_minus';
      const color = isMinus ? 0x22d3ee : 0xf43f5e; // Cyan for beta-, Magenta for beta+

      const partGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const partMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 1.0
      });
      const particleMesh = new THREE.Mesh(partGeo, partMat);

      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.2) * 2,
        (Math.random() - 0.5) * 2
      ).normalize();
      const velocity = dir.multiplyScalar(7.5);

      const ringGeo = new THREE.RingGeometry(0.2, 0.35, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      });
      const shockwaveMesh = new THREE.Mesh(ringGeo, ringMat);
      shockwaveMesh.lookAt(dir);

      group.add(particleMesh);
      group.add(shockwaveMesh);

      activeDecayEffectsRef.current.push({
        particleMesh,
        shockwaveMesh,
        velocity,
        life: 0,
        maxLife: 0.8
      });
    }
  }, []);

  // Execution of Beta Decay (Z changes: +1 for Beta-, -1 for Beta+)
  const triggerBetaDecay = useCallback((type: 'beta_minus' | 'beta_plus') => {
    if (type === 'beta_minus') {
      if (atomicNumberZ >= 118 || neutronsN <= 0) return;
      const fromZ = atomicNumberZ;
      const fromN = neutronsN;
      const toZ = atomicNumberZ + 1;
      const toN = neutronsN - 1;

      const fromElem = fromZ === 0 ? 'n' : (PERIODIC_ELEMENTS.find(e => e.z === fromZ)?.symbol || `E${fromZ}`);
      const toElem = PERIODIC_ELEMENTS.find(e => e.z === toZ)?.symbol || `E${toZ}`;
      const toName = PERIODIC_ELEMENTS.find(e => e.z === toZ)?.name || `Elemento ${toZ}`;
      const massA = fromZ + fromN;

      setAtomicNumberZ(toZ);
      setNeutronsN(toN);

      spawn3DDecayParticle('beta_minus');
      playNuclearAudio('beta_minus');

      const notifData = {
        type: 'beta_minus' as const,
        title: '¡Desintegración Beta Menos (β⁻) Activada!',
        badge: 'DECAIMIENTO β⁻ (+1p, -1n)',
        badgeColor: 'bg-amber-400 text-black',
        desc: `Exceso de neutrones detectado. Un neutrón se transformó en protón (n → p + e⁻ + ν̄ₑ). El número atómico Z aumentó de ${fromZ} (${fromElem}) a ${toZ} (${toElem} · ${toName}).`,
        equation: `^{${massA}}_{${fromZ}}\\text{${fromElem}} \\xrightarrow{\\beta^-} {}^{${massA}}_{${toZ}}\\text{${toElem}} + e^- + \\bar{\\nu}_e`,
        fromSymbol: fromElem,
        toSymbol: toElem,
        fromZ,
        toZ,
        massA,
        details: [
          'Transmutación por interacción nuclear débil mediada por bosón W⁻.',
          'Emisión: 1 electrón (radiación β⁻) + 1 antineutrino electrónico.',
          'El número másico A se conserva constante.'
        ]
      };

      setBetaDecayNotification(notifData);
      setNuclearReactionNotification(notifData);
    } else {
      if (atomicNumberZ <= 1) return;
      const fromZ = atomicNumberZ;
      const fromN = neutronsN;
      const toZ = atomicNumberZ - 1;
      const toN = neutronsN + 1;

      const fromElem = PERIODIC_ELEMENTS.find(e => e.z === fromZ)?.symbol || `E${fromZ}`;
      const toElem = toZ === 0 ? 'n' : (PERIODIC_ELEMENTS.find(e => e.z === toZ)?.symbol || `E${toZ}`);
      const toName = toZ === 0 ? 'Neutrón' : (PERIODIC_ELEMENTS.find(e => e.z === toZ)?.name || `Elemento ${toZ}`);
      const massA = fromZ + fromN;

      setAtomicNumberZ(toZ);
      setNeutronsN(toN);

      spawn3DDecayParticle('beta_plus');
      playNuclearAudio('beta_plus');

      const notifData = {
        type: 'beta_plus' as const,
        title: '¡Desintegración Beta Más (β⁺) Activada!',
        badge: 'DECAIMIENTO β⁺ (-1p, +1n)',
        badgeColor: 'bg-blue-400 text-black',
        desc: `Exceso de protones detectado. Un protón se transformó en neutrón (p → n + e⁺ + νₑ). El número atómico Z disminuyó de ${fromZ} (${fromElem}) a ${toZ} (${toElem} · ${toName}).`,
        equation: `^{${massA}}_{${fromZ}}\\text{${fromElem}} \\xrightarrow{\\beta^+} {}^{${massA}}_{${toZ}}\\text{${toElem}} + e^+ + \\nu_e`,
        fromSymbol: fromElem,
        toSymbol: toElem,
        fromZ,
        toZ,
        massA,
        details: [
          'Transmutación por interacción débil mediada por bosón W⁺.',
          'Emisión: 1 positrón (antimateria e⁺) + 1 neutrino electrónico.',
          'Aniquilación posterior con e⁻ libre emite dos fotones gamma de 511 keV.'
        ]
      };

      setBetaDecayNotification(notifData);
      setNuclearReactionNotification(notifData);
    }
  }, [atomicNumberZ, neutronsN, spawn3DDecayParticle]);

  // Execution of Alpha Fission / Decay (-2 Protons, -2 Neutrons)
  const triggerAlphaFission = useCallback(() => {
    if (atomicNumberZ < 2 || neutronsN < 2) return;

    const fromZ = atomicNumberZ;
    const fromN = neutronsN;
    const fromA = fromZ + fromN;
    const toZ = fromZ - 2;
    const toN = fromN - 2;
    const toA = fromA - 4;

    const fromElem = fromZ === 0 ? 'n' : (PERIODIC_ELEMENTS.find(e => e.z === fromZ)?.symbol || `E${fromZ}`);
    const toElem = toZ === 0 ? 'n' : (PERIODIC_ELEMENTS.find(e => e.z === toZ)?.symbol || `E${toZ}`);
    const toName = toZ === 0 ? 'Neutrón' : (PERIODIC_ELEMENTS.find(e => e.z === toZ)?.name || `Elemento ${toZ}`);

    // Realistic calculation of Q_alpha via nuclear liquid drop model
    const calcBE = (A: number, Z: number) => {
      if (A <= 0 || Z < 0) return 0;
      if (A === 4 && Z === 2) return 28.3; // Helium-4 binding energy (extremely stable cluster)
      if (A === 1) return 0;
      const av = 15.67, as = 17.23, ac = 0.714, aa = 23.2;
      return av * A - as * Math.pow(A, 2/3) - ac * (Z * (Z - 1)) / Math.cbrt(A) - aa * Math.pow(A - 2 * Z, 2) / A;
    };
    const beParent = calcBE(fromA, fromZ);
    const beDaughter = calcBE(toA, toZ);
    const beAlpha = 28.3;
    let qAlpha = beDaughter + beAlpha - beParent;
    if (qAlpha <= 0 || isNaN(qAlpha)) {
      qAlpha = fromZ >= 80 ? (4.2 + (fromZ - 80) * 0.14) : 2.8;
    }
    const qStr = qAlpha.toFixed(2);
    const eAlphaKinetic = (qAlpha * (toA / fromA)).toFixed(2);
    const eRecoil = (qAlpha * (4 / fromA)).toFixed(2);

    setAtomicNumberZ(toZ);
    setNeutronsN(toN);

    spawn3DDecayParticle('alpha');
    playNuclearAudio('alpha');

    setNuclearReactionNotification({
      type: 'alpha_fission',
      title: '¡Fisión / Desintegración Alfa (α) Ejecutada!',
      badge: 'EMISIÓN α (-2p, -2n)',
      badgeColor: 'bg-amber-400 text-black',
      desc: `El núcleo expulsó violentamente un cúmulo ligado de 2 protones y 2 neutrones (partícula alfa ⁴₂He²⁺). Z se redujo de ${fromZ} (${fromElem}) a ${toZ} (${toElem} · ${toName}).`,
      equation: `^{${fromA}}_{${fromZ}}\\text{${fromElem}} \\xrightarrow{\\alpha} {}^{${toA}}_{${toZ}}\\text{${toElem}} + {}^{4}_{2}\\alpha + ${qStr}\\text{ MeV}`,
      energyMev: qStr,
      details: [
        `Energía cinética de la partícula α: ${eAlphaKinetic} MeV (~15,000 km/s)`,
        `Energía de retroceso del núcleo hijo: ${eRecoil} MeV`,
        `Mecanismo cuántico: Efecto túnel de Gamow a través de la barrera de Coulomb.`
      ]
    });
  }, [atomicNumberZ, neutronsN, spawn3DDecayParticle]);

  // Execution of Alpha Capture (+2 Protons, +2 Neutrons)
  const triggerAlphaCapture = useCallback(() => {
    if (atomicNumberZ + 2 > 118) return;

    const fromZ = atomicNumberZ;
    const fromN = neutronsN;
    const fromA = fromZ + fromN;
    const toZ = fromZ + 2;
    const toN = fromN + 2;
    const toA = fromA + 4;

    const fromElem = fromZ === 0 ? 'n' : (PERIODIC_ELEMENTS.find(e => e.z === fromZ)?.symbol || `E${fromZ}`);
    const toElem = toZ === 0 ? 'n' : (PERIODIC_ELEMENTS.find(e => e.z === toZ)?.symbol || `E${toZ}`);
    const toName = toZ === 0 ? 'Neutrón' : (PERIODIC_ELEMENTS.find(e => e.z === toZ)?.name || `Elemento ${toZ}`);

    setAtomicNumberZ(toZ);
    setNeutronsN(toN);

    spawn3DDecayParticle('fusion');
    playNuclearAudio('fusion');

    setNuclearReactionNotification({
      type: 'nuclear_fusion',
      title: '¡Captura Alfa (α) Ejecutada!',
      badge: 'CAPTURA α (+2p, +2n)',
      badgeColor: 'bg-cyan-400 text-black',
      desc: `El núcleo absorbió una partícula alfa incidente (⁴₂He²⁺). Z aumentó de ${fromZ} (${fromElem}) a ${toZ} (${toElem} · ${toName}).`,
      equation: `^{${fromA}}_{${fromZ}}\\text{${fromElem}} + {}^{4}_{2}\\alpha \\to {}^{${toA}}_{${toZ}}\\text{${toElem}} + Q`,
      energyMev: '5.85',
      details: [
        'Absorción de racimo ligado de 2 protones y 2 neutrones.',
        `Número atómico Z incrementado en +2 (Carga ${toZ}+)`,
        `Masa total incrementada en +4 nucleones (A=${toA})`
      ]
    });
  }, [atomicNumberZ, neutronsN, spawn3DDecayParticle]);


  // Execution of Pure Gamma Isomeric Decay (IT: ΔZ=0, ΔN=0)
  const triggerGammaDecay = useCallback(() => {
    const fromZ = atomicNumberZ;
    const fromN = neutronsN;
    const fromA = fromZ + fromN;
    const elemSymbol = fromZ === 0 ? 'n' : (PERIODIC_ELEMENTS.find(e => e.z === fromZ)?.symbol || `E${fromZ}`);

    const gammaIsomer = KNOWN_GAMMA_ISOMERS.find(iso => iso.z === fromZ && iso.n === fromN);
    const energyKeV = gammaIsomer?.energyKeV ?? 140.5;

    setIsMetastableState(false);

    spawn3DDecayParticle('gamma');
    playNuclearAudio('gamma');

    const notifData = {
      type: 'gamma_decay' as const,
      title: '¡Emisión Gamma (γ) Pura Ejecutada!',
      badge: 'TRANSICIÓN ISOMÉRICA γ (ΔZ=0, ΔN=0)',
      badgeColor: 'bg-purple-400 text-black',
      desc: `Desexcitación nuclear electromagnética pura: el isómero metaestable liberó un fotón gamma monoenergético (${energyKeV} keV) pasando al estado fundamental sin alterar protones (${fromZ}) ni neutrones (${fromN}).`,
      equation: `^{${fromA}\\text{m}}_{${fromZ}}\\text{${elemSymbol}} \\xrightarrow{\\gamma} {}^{${fromA}}_{${fromZ}}\\text{${elemSymbol}} + \\gamma (${energyKeV}\\text{ keV})`,
      energyMev: (energyKeV / 1000).toFixed(3),
      details: [
        `Radiación emitida: Fotón gamma cuántico de alta frecuencia (E = ${energyKeV} keV).`,
        `Conservación estricta de nucleones: ΔZ = 0, ΔN = 0, ΔA = 0 (Identidad elemental intacta).`,
        `Transición isomérica pura (IT): salto cuántico radiativo entre estado metaestable y fundamental.`
      ]
    };

    setNuclearReactionNotification(notifData);
  }, [atomicNumberZ, neutronsN, spawn3DDecayParticle]);

  // Execution of Proton Emission (-1 Proton, ΔN=0)
  const triggerProtonEmission = useCallback(() => {
    if (atomicNumberZ <= 0) return;
    const fromZ = atomicNumberZ;
    const fromN = neutronsN;
    const fromA = fromZ + fromN;
    const toZ = fromZ - 1;
    const toN = fromN;
    const toA = fromA - 1;

    const fromElem = fromZ === 0 ? 'n' : (PERIODIC_ELEMENTS.find(e => e.z === fromZ)?.symbol || `E${fromZ}`);
    const toElem = toZ === 0 ? 'n' : (PERIODIC_ELEMENTS.find(e => e.z === toZ)?.symbol || `E${toZ}`);
    const toName = toZ === 0 ? 'Neutrón' : (PERIODIC_ELEMENTS.find(e => e.z === toZ)?.name || `Elemento ${toZ}`);

    setAtomicNumberZ(toZ);

    spawn3DDecayParticle('proton');
    playNuclearAudio('proton');

    setNuclearReactionNotification({
      type: 'proton_emission',
      title: '¡Emisión de Protón (p) Ejecutada!',
      badge: 'EMISIÓN PROTÓN (-1p)',
      badgeColor: 'bg-red-400 text-black',
      desc: `El núcleo superó la línea de goteo de protones y expulsó directamente un protón libre (¹₁p). Z disminuyó de ${fromZ} (${fromElem}) a ${toZ} (${toElem} · ${toName}).`,
      equation: `^{${fromA}}_{${fromZ}}\\text{${fromElem}} \\xrightarrow{p} {}^{${toA}}_{${toZ}}\\text{${toElem}} + {}^{1}_{1}\\text{p}`,
      energyMev: decayChannels.protonEmission.qValueStr,
      details: [
        'Transmutación por decaimiento de protón espontáneo (Línea de Goteo / Proton Drip-Line).',
        `Disminución del número atómico Z: ${fromZ} ➔ ${toZ}.`,
        'El número de neutrones permanece inalterado (ΔN = 0).'
      ]
    });
  }, [atomicNumberZ, neutronsN, decayChannels, spawn3DDecayParticle]);

  // Execution of Neutron Emission (ΔZ=0, -1 Neutron)
  const triggerNeutronEmission = useCallback(() => {
    if (neutronsN <= 0) return;
    const fromZ = atomicNumberZ;
    const fromN = neutronsN;
    const fromA = fromZ + fromN;
    const toZ = fromZ;
    const toN = fromN - 1;
    const toA = fromA - 1;

    const fromElem = fromZ === 0 ? 'n' : (PERIODIC_ELEMENTS.find(e => e.z === fromZ)?.symbol || `E${fromZ}`);

    setNeutronsN(toN);

    spawn3DDecayParticle('neutron');
    playNuclearAudio('neutron');

    setNuclearReactionNotification({
      type: 'neutron_emission',
      title: '¡Emisión de Neutrón (n) Ejecutada!',
      badge: 'EMISIÓN NEUTRÓN (-1n)',
      badgeColor: 'bg-blue-400 text-black',
      desc: `El núcleo superó la línea de goteo de neutrones y expulsó directamente un neutrón libre (¹₀n). N disminuyó de ${fromN} a ${toN}.`,
      equation: `^{${fromA}}_{${fromZ}}\\text{${fromElem}} \\xrightarrow{n} {}^{${toA}}_{${fromZ}}\\text{${fromElem}} + {}^{1}_{0}\\text{n}`,
      energyMev: decayChannels.neutronEmission.qValueStr,
      details: [
        'Transmutación por decaimiento de neutrón espontáneo (Línea de Goteo / Neutron Drip-Line).',
        `Disminución del número de neutrones: ${fromN} ➔ ${toN}.`,
        'El número atómico Z permanece inalterado (ΔZ = 0).'
      ]
    });
  }, [atomicNumberZ, neutronsN, decayChannels, spawn3DDecayParticle]);

  // Ejecutor unificado del siguiente escalón de transición radiactiva
  const triggerNextDecayStep = useCallback(() => {
    if (autoDecayStep.isStable || autoDecayStep.decayType === 'none') return;
    if (autoDecayStep.decayType === 'alpha') {
      triggerAlphaFission();
    } else if (autoDecayStep.decayType === 'beta_minus') {
      triggerBetaDecay('beta_minus');
    } else if (autoDecayStep.decayType === 'beta_plus') {
      triggerBetaDecay('beta_plus');
    } else if (autoDecayStep.decayType === 'gamma') {
      triggerGammaDecay();
    } else if (autoDecayStep.decayType === 'proton') {
      triggerProtonEmission();
    } else if (autoDecayStep.decayType === 'neutron') {
      triggerNeutronEmission();
    }
  }, [autoDecayStep, triggerAlphaFission, triggerBetaDecay, triggerGammaDecay, triggerProtonEmission, triggerNeutronEmission]);

  // Execution of Nuclear Fusion (D-T, p-p, Triple-Alpha, or custom collision projectile)
  const triggerNuclearFusion = useCallback((
    mode: 'dt' | 'pp' | 'triple_alpha' | 'custom_projectile',
    projectileDelta?: { p: number; n: number; name: string; symbol: string }
  ) => {
    let targetZ = atomicNumberZ;
    let targetN = neutronsN;
    let title = '';
    let equation = '';
    let desc = '';
    let qEnergy = '17.59';
    let details: string[] = [];

    if (mode === 'dt') {
      targetZ = 2;
      targetN = 2; // Helium-4 formed + 1 neutron released
      title = '¡Fusión Termonuclear D-T (Deuterio + Tritio)!';
      equation = '^{2}_{1}\\text{H} + {}^{3}_{1}\\text{H} \\to {}^{4}_{2}\\text{He} + {}^{1}_{0}\\text{n} + 17.59\\text{ MeV}';
      desc = 'La reacción estrella de reactores de fusión terrestres (Tokamaks como ITER). Los núcleos vencieron la barrera de Coulomb, liberando Helio-4 y un neutrón de alta energía.';
      qEnergy = '17.59';
      details = [
        'Partícula α (⁴He): 3.52 MeV de energía cinética (autocalentamiento del plasma)',
        'Neutrón libre (¹n): 14.07 MeV de energía cinética liberada',
        'Temperatura de ignición: ~100-150 millones de °C'
      ];
    } else if (mode === 'pp') {
      targetZ = 1;
      targetN = 1; // Deuterio
      title = '¡Fusión Solar Protón-Protón (Ciclo p-p)!';
      equation = '^{1}_{1}\\text{p} + {}^{1}_{1}\\text{p} \\to {}^{2}_{1}\\text{H} + e^+ + \\nu_e + 0.42\\text{ MeV}';
      desc = 'El motor que hace brillar al Sol: dos protones colisionan y uno de ellos transmuta en neutrón mediante interacción débil, sintetizando Deuterio.';
      qEnergy = '0.42';
      details = [
        'Subproductos: 1 positrón (e⁺) + 1 neutrino solar (νₑ)',
        'Aniquilación e⁺ + e⁻ añade +1.02 MeV en rayos gamma energéticos',
        'Tiempo medio de fusión de un protón en el núcleo solar: ~10⁹ años'
      ];
    } else if (mode === 'triple_alpha') {
      targetZ = 6;
      targetN = 6; // Carbono-12
      title = '¡Proceso Triple Alfa (3α ➔ ¹²C)!';
      equation = '3 \\times {}^{4}_{2}\\alpha \\to {}^{12}_{6}\\text{C} + 7.27\\text{ MeV}';
      desc = 'En núcleos de estrellas gigantes rojas, tres partículas alfa se fusionan a través del estado de resonancia de Hoyle, originando el Carbono indispensable para la vida.';
      qEnergy = '7.27';
      details = [
        'Intermedio resonante: Berilio-8 (t½ ≈ 10⁻¹⁶ s)',
        'Predicción teórica fundamental: Estado de Fred Hoyle (1953)',
        'Forja cósmica de los elementos orgánicos del universo'
      ];
    } else if (mode === 'custom_projectile' && projectileDelta) {
      const addP = projectileDelta.p;
      const addN = projectileDelta.n;
      if (targetZ + addP > 118) return;

      const fromZ = targetZ;
      const fromN = targetN;
      const fromA = fromZ + fromN;
      targetZ = fromZ + addP;
      targetN = fromN + addN;
      const toA = targetZ + targetN;

      const fromElem = fromZ === 0 ? 'n' : (PERIODIC_ELEMENTS.find(e => e.z === fromZ)?.symbol || `E${fromZ}`);
      const toElem = targetZ === 0 ? 'n' : (PERIODIC_ELEMENTS.find(e => e.z === targetZ)?.symbol || `E${targetZ}`);
      const toName = targetZ === 0 ? 'Neutrón' : (PERIODIC_ELEMENTS.find(e => e.z === targetZ)?.name || `Elemento ${targetZ}`);

      const qEst = (Math.max(1, addP + addN) * 4.2 + (targetZ <= 26 ? 3.5 : -1.2)).toFixed(2);
      qEnergy = qEst;
      title = `¡Colisión y Fusión con ${projectileDelta.name}!`;
      equation = `^{${fromA}}_{${fromZ}}\\text{${fromElem}} + {}^{${addP + addN}}_{${addP}}\\text{${projectileDelta.symbol}} \\to {}^{${toA}}_{${targetZ}}\\text{${toElem}} + Q`;
      desc = `Colisión nuclear: el núcleo absorbió el proyectil incidente (${addP}p, ${addN}n), sintetizando un nuevo núcleo de ${toElem} (${toName}).`;
      details = [
        `Número atómico Z incrementado en +${addP} (Carga ${targetZ}+)`,
        `Masa total incrementada en +${addP + addN} nucleones (A=${toA})`,
        `Energía neta estimada de reacción: Q ≈ ${qEst} MeV`
      ];
    }

    setAtomicNumberZ(targetZ);
    setNeutronsN(targetN);

    spawn3DDecayParticle('fusion');
    playNuclearAudio('fusion');

    setNuclearReactionNotification({
      type: 'nuclear_fusion',
      title,
      badge: 'FUSIÓN NUCLEAR 💥',
      badgeColor: 'bg-emerald-400 text-black',
      desc,
      equation,
      energyMev: qEnergy,
      details
    });
  }, [atomicNumberZ, neutronsN, spawn3DDecayParticle]);

  // Lógica de Transición Automática:
  // Evalúa si el isótopo armado es inestable y si su desintegración por alfa o beta (o gamma en isómeros)
  // es energéticamente factible. Si es así, realiza el salto automático al siguiente escalón correspondiente.
  // No fuerza ningún decaimiento si las condiciones no lo respaldan (isótopos estables en el fondo del valle).
  useEffect(() => {
    if (!autoBetaDecayEnabled) {
      setDecayCountdown(null);
      return;
    }

    if (autoDecayStep.isStable || autoDecayStep.decayType === 'none') {
      // No forzar ningún decaimiento si las condiciones no lo respaldan
      setDecayCountdown(null);
      return;
    }

    setDecayCountdown(1);
    const timer = setTimeout(() => {
      triggerNextDecayStep();
      setDecayCountdown(null);
    }, 1100);

    return () => clearTimeout(timer);
  }, [autoBetaDecayEnabled, autoDecayStep, triggerNextDecayStep]);

  // Auto-dismiss nuclear reaction toast after 6s
  useEffect(() => {
    if (!nuclearReactionNotification) return;
    const timer = setTimeout(() => {
      setNuclearReactionNotification(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [nuclearReactionNotification]);

  // Auto-dismiss beta decay toast after 5s
  useEffect(() => {
    if (!betaDecayNotification) return;
    const timer = setTimeout(() => {
      setBetaDecayNotification(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [betaDecayNotification]);

  // Nuclear charge label (Z*e)
  const chargeLabel = useMemo(() => {
    if (atomicNumberZ === 0) return 'NEUTRÓN LIBRE (0)';
    return `NÚCLEO +${atomicNumberZ}e`;
  }, [atomicNumberZ]);

  // Charge pill color
  const chargeColorClass = useMemo(() => {
    if (atomicNumberZ === 0) return 'text-amber-400 bg-amber-950/40 border-amber-500/40';
    return 'text-red-400 bg-red-950/40 border-red-500/40';
  }, [atomicNumberZ]);

  // Stability analysis from valley of stability
  const stability = useMemo(() => getStabilityVerdict(atomicNumberZ, neutronsN), [atomicNumberZ, neutronsN]);

  // Electronic Configuration calculation: points to 3D Physics Engine
  const electronConfigFormatted = useMemo(() => {
    return {
      formula: currentElement.electronConfig || `[Corteza Z=${atomicNumberZ}]`,
      description: 'Simulación de electrones y capas disponible en el Motor Físico 3D'
    };
  }, [atomicNumberZ, currentElement]);

  // Reset camera view in 3D
  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 3, 8);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  // Reset neutrons to optimal stability
  const handleResetNeutronsAndCharge = () => {
    setNeutronsN(stability.optimalN);
  };

  // Keyboard shortcuts handler: [P] protón, [N] neutrón (Shift to remove)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key.toLowerCase();
      const isShift = e.shiftKey;

      if (key === 'p') {
        e.preventDefault();
        setAtomicNumberZ(prev => isShift ? Math.max(neutronsN >= 1 ? 0 : 1, prev - 1) : Math.min(118, prev + 1));
      } else if (key === 'n') {
        e.preventDefault();
        setNeutronsN(prev => isShift ? Math.max(atomicNumberZ >= 1 ? 0 : 1, prev - 1) : Math.min(180, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [atomicNumberZ, neutronsN]);

  // Quick Preset Handlers
  const handleLoadPreset = (z: number, n: number, _e?: number) => {
    setAtomicNumberZ(z);
    setNeutronsN(n);
  };

  // Mission validation: Pure nuclear isotope matching
  const currentMission: AtomMission = ATOM_MISSIONS[currentMissionIndex] || ATOM_MISSIONS[0];
  const isCurrentMissionPassed = useMemo(() => {
    return (
      atomicNumberZ === currentMission.targetZ &&
      neutronsN === currentMission.targetN
    );
  }, [atomicNumberZ, neutronsN, currentMission]);

  // Handle mission completion and library update
  const handleCompleteCurrentMission = useCallback(() => {
    if (!isCurrentMissionPassed) return;

    // Add / Unlock into the library
    const { added } = addDiscoveredToLibrary({
      z: currentMission.targetZ,
      n: currentMission.targetN,
      electrons: currentMission.targetZ,
      symbol: currentElement.symbol,
      name: currentMission.rewardName,
      massNumber: currentMission.targetZ + currentMission.targetN,
      charge: 0,
      chargeLabel: 'NÚCLEO ESTABLE',
      electronConfig: electronConfigFormatted.formula,
      stability: stability.status,
      missionSource: currentMission.title
    });

    setScore(prev => prev + 100);
    setStreak(prev => prev + 1);

    const toastMsg = added
      ? `¡Desafío superado! Se ha registrado y desbloqueado "${currentMission.rewardName}" en tu Biblioteca Científica.`
      : `¡Desafío completado con éxito! "${currentMission.rewardName}" ya está disponible en tu Biblioteca.`;

    setMissionCompletedToast(toastMsg);

    // Auto-advance mission after a brief delay if not last
    setTimeout(() => {
      if (currentMissionIndex < ATOM_MISSIONS.length - 1) {
        setCurrentMissionIndex(prev => prev + 1);
      }
      setMissionCompletedToast(null);
    }, 3500);
  }, [isCurrentMissionPassed, currentMission, currentElement, chargeLabel, electronConfigFormatted, stability, currentMissionIndex]);

  // Check mission on atom update
  useEffect(() => {
    if (isChallengeMode && isCurrentMissionPassed) {
      handleCompleteCurrentMission();
    }
  }, [isChallengeMode, isCurrentMissionPassed, handleCompleteCurrentMission]);

  // Three.js scene setup
  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    // Deep black cosmic void background for precision quantum simulation
    scene.background = new THREE.Color(0x020408);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3, 9);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 30;
    controls.minDistance = 1.2;
    controlsRef.current = controls;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Create procedural soft Gaussian particle texture for quantum probability clouds (zero 404s)
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      gradient.addColorStop(0.18, 'rgba(255, 255, 255, 0.85)');
      gradient.addColorStop(0.45, 'rgba(255, 255, 255, 0.28)');
      gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.04)');
      gradient.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const glowTex = new THREE.CanvasTexture(canvas);
    glowTex.colorSpace = THREE.SRGBColorSpace;
    glowTextureRef.current = glowTex;

    // Lighting rig (Key warm light + cool diffuse rim + quantum ambient)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(6, 10, 6);
    scene.add(keyLight);

    const blueFill = new THREE.DirectionalLight(0x0284c7, 1.4);
    blueFill.position.set(-6, -4, -6);
    scene.add(blueFill);

    const violetRim = new THREE.DirectionalLight(0xa855f7, 0.8);
    violetRim.position.set(0, 6, -8);
    scene.add(violetRim);

    // Three.js Hierarchy Groups
    const nucleusGroup = new THREE.Group();
    scene.add(nucleusGroup);
    nucleusGroupRef.current = nucleusGroup;

    const quantumCloudsGroup = new THREE.Group();
    scene.add(quantumCloudsGroup);
    quantumCloudsGroupRef.current = quantumCloudsGroup;

    const electronsGroup = new THREE.Group();
    scene.add(electronsGroup);
    electronsGroupRef.current = electronsGroup;

    const decayEffectsGroup = new THREE.Group();
    scene.add(decayEffectsGroup);
    decayEffectsGroupRef.current = decayEffectsGroup;

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (dimensionModeRef.current !== '3D') {
        // Microservice GPU / SPU Optimization: Suspend Three.js WebGL draw calls when 2D mode is active
        return;
      }
      const delta = clock.getDelta();

      // Gentle nucleus rotation (protons & neutrons in 3D)
      if (nucleusGroupRef.current) {
        nucleusGroupRef.current.rotation.y += delta * 0.2;
        nucleusGroupRef.current.rotation.x += delta * 0.1;
      }

      // Update active Beta decay particle effects & shockwaves
      if (activeDecayEffectsRef.current.length > 0) {
        for (let i = activeDecayEffectsRef.current.length - 1; i >= 0; i--) {
          const fx = activeDecayEffectsRef.current[i];
          fx.life += delta;
          const progress = fx.life / fx.maxLife;

          if (progress >= 1.0) {
            decayEffectsGroup.remove(fx.particleMesh);
            decayEffectsGroup.remove(fx.shockwaveMesh);
            if ('geometry' in fx.particleMesh && (fx.particleMesh as THREE.Mesh).geometry) {
              (fx.particleMesh as THREE.Mesh).geometry.dispose();
            }
            if (fx.shockwaveMesh.geometry) {
              fx.shockwaveMesh.geometry.dispose();
            }
            activeDecayEffectsRef.current.splice(i, 1);
          } else {
            fx.particleMesh.position.addScaledVector(fx.velocity, delta);
            const scale = 1 + progress * 8.0;
            fx.shockwaveMesh.scale.set(scale, scale, scale);
            if ('material' in fx.particleMesh && (fx.particleMesh as THREE.Mesh).material) {
              ((fx.particleMesh as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - progress);
            } else if (fx.particleMesh.children) {
              fx.particleMesh.children.forEach(c => {
                if ('material' in c && (c as THREE.Mesh).material) {
                  ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - progress);
                }
              });
            }
            if (fx.shockwaveMesh.material) {
              (fx.shockwaveMesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (1 - progress) * 0.85);
            }
          }
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;
      if (w <= 0 || h <= 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (glowTex) glowTex.dispose();
      renderer.dispose();
      rendererRef.current = null;
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Recálculo dinámico de dimensiones de renderizado para máxima resolución UHD en pantalla completa
  const updateRenderDimensions = useCallback(() => {
    if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
    const w = containerRef.current.clientWidth || window.innerWidth;
    const h = containerRef.current.clientHeight || window.innerHeight;
    if (w <= 0 || h <= 0) return;
    cameraRef.current.aspect = w / h;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(w, h);
    rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
  }, []);

  // Alternador de Pantalla Completa 3D (Fullscreen API con fallback a CSS fijo 100vw/100vh)
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

  // Escucha de eventos de pantalla completa y atajos de teclado (ESC y tecla F)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFs = Boolean(document.fullscreenElement);
      if (!isNativeFs && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        setIsFullscreen(false);
      } else if ((e.key === 'f' || e.key === 'F') && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        toggleFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, toggleFullscreen]);

  // Actualización inmediata al alternar pantalla completa
  useEffect(() => {
    const timer1 = setTimeout(() => updateRenderDimensions(), 25);
    const timer2 = setTimeout(() => updateRenderDimensions(), 120);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isFullscreen, updateRenderDimensions]);

  // Update 3D Nucleons & Electrons / Quantum Probability Clouds when parameters change
  useEffect(() => {
    if (!nucleusGroupRef.current || !electronsGroupRef.current || !quantumCloudsGroupRef.current) return;
    const nucGroup = nucleusGroupRef.current;
    const elecGroup = electronsGroupRef.current;
    const qCloudsGroup = quantumCloudsGroupRef.current;

    // Dispose old children safely to prevent memory leaks
    const clearGroup = (grp: THREE.Group) => {
      while (grp.children.length > 0) {
        const obj = grp.children[0];
        grp.remove(obj);
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
        if ((obj as THREE.Points).geometry) (obj as THREE.Points).geometry.dispose();
        if ((obj as THREE.Mesh).material) {
          const mat = (obj as THREE.Mesh).material;
          if (Array.isArray(mat)) mat.forEach(m => m.dispose());
          else mat.dispose();
        }
      }
    };

    clearGroup(nucGroup);
    clearGroup(elecGroup);
    clearGroup(qCloudsGroup);
    electronMeshesRef.current = [];

    const totalNucleons = atomicNumberZ + neutronsN;
    if (totalNucleons > 0) {
      // Red Proton Material with glossy PBR finish
      const protonMat = new THREE.MeshPhysicalMaterial({
        color: 0xef4444, // Red
        roughness: 0.15,
        metalness: 0.12,
        clearcoat: 1.0,
        emissive: 0x991b1b,
        emissiveIntensity: 0.5
      });

      // Blue Neutron Material
      const neutronMat = new THREE.MeshPhysicalMaterial({
        color: 0x3b82f6, // Blue
        roughness: 0.15,
        metalness: 0.12,
        clearcoat: 1.0,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.5
      });

      // Scale Nucleus: in 'quantum_scale', the nucleus is realistically tiny compared to the electron cloud volume
      const isQuantumScale = scaleMode === 'quantum_scale';
      const nucleonRadius = isQuantumScale ? 0.065 : 0.26;
      const radiusScale = isQuantumScale 
        ? (Math.cbrt(totalNucleons) * 0.08 + 0.06) 
        : (Math.cbrt(totalNucleons) * 0.38 + 0.22);

      const sphereGeo = new THREE.SphereGeometry(nucleonRadius, 20, 20);

      // Physical 3D Nucleon Equilibrium (Coulomb Repulsion Law + Strong Force Buffering):
      // Universal physical laws: Protons carry +1e charge and repel each other (Fc ~ 1/r^2).
      // They cannot occupy the same site or bunch together without physical spacing.
      // Neutrons (0 charge) interleave in between the protons to act as spatial dielectric buffers
      // and provide the Strong Nuclear Force holding the nucleus together.
      const rawPositions: { x: number; y: number; z: number }[] = [];
      const isProtonArr = new Array(totalNucleons).fill(false);

      if (totalNucleons === 1) {
        rawPositions.push({ x: 0, y: 0, z: 0 });
        isProtonArr[0] = atomicNumberZ === 1;
      } else if (atomicNumberZ >= 2 && neutronsN === 0) {
        // Pure Coulomb Repulsion Instability: Without any intermediate neutrons,
        // Coulomb repulsion dominates and pushes protons outward into an expanded unstable ring!
        const repelRadius = radiusScale * 2.3;
        for (let i = 0; i < totalNucleons; i++) {
          const phi = Math.acos(1 - 2 * (i + 0.5) / totalNucleons);
          const theta = Math.PI * (1 + Math.sqrt(5)) * i;
          rawPositions.push({
            x: repelRadius * Math.sin(phi) * Math.cos(theta),
            y: repelRadius * Math.sin(phi) * Math.sin(theta),
            z: repelRadius * Math.cos(phi)
          });
          isProtonArr[i] = true;
        }
      } else {
        // Standard case: Protons and Neutrons
        for (let i = 0; i < totalNucleons; i++) {
          const phi = Math.acos(1 - 2 * (i + 0.5) / totalNucleons);
          const theta = Math.PI * (1 + Math.sqrt(5)) * i;
          const r = (i === 0 && totalNucleons > 1) ? 0 : radiusScale * Math.cbrt((i + 1) / totalNucleons);
          rawPositions.push({
            x: r * Math.sin(phi) * Math.cos(theta),
            y: r * Math.sin(phi) * Math.sin(theta),
            z: r * Math.cos(phi)
          });
        }

        // Assign proton positions that maximize mutual distance (Coulomb minimization)
        // leaving the intermediate buffer positions for neutrons
        if (atomicNumberZ >= totalNucleons) {
          isProtonArr.fill(true);
        } else if (atomicNumberZ > 0) {
          // If neutrons exist, start proton at index 1 so center is a buffer neutron
          const startIdx = (neutronsN >= 1) ? 1 : 0;
          isProtonArr[startIdx] = true;
          const protonIndices: number[] = [startIdx];

          while (protonIndices.length < atomicNumberZ) {
            let bestIdx = -1;
            let minCoulombEnergy = Infinity;

            for (let i = 0; i < totalNucleons; i++) {
              if (isProtonArr[i]) continue;
              let energy = 0;
              for (const pIdx of protonIndices) {
                const dx = rawPositions[i].x - rawPositions[pIdx].x;
                const dy = rawPositions[i].y - rawPositions[pIdx].y;
                const dz = rawPositions[i].z - rawPositions[pIdx].z;
                const distSq = dx * dx + dy * dy + dz * dz + 0.001;
                energy += 1.0 / distSq;
              }
              if (energy < minCoulombEnergy) {
                minCoulombEnergy = energy;
                bestIdx = i;
              }
            }

            if (bestIdx !== -1) {
              isProtonArr[bestIdx] = true;
              protonIndices.push(bestIdx);
            } else {
              break;
            }
          }

          // Swap passes to ensure global Coulomb minimization
          for (let iter = 0; iter < 15; iter++) {
            let swapped = false;
            for (let p = 0; p < totalNucleons; p++) {
              if (!isProtonArr[p]) continue;
              for (let n = 0; n < totalNucleons; n++) {
                if (isProtonArr[n]) continue;
                let curE = 0;
                let swapE = 0;
                for (let other = 0; other < totalNucleons; other++) {
                  if (other === p || other === n || !isProtonArr[other]) continue;
                  const dCur = Math.hypot(rawPositions[p].x - rawPositions[other].x, rawPositions[p].y - rawPositions[other].y, rawPositions[p].z - rawPositions[other].z) ** 2 + 0.001;
                  const dSwap = Math.hypot(rawPositions[n].x - rawPositions[other].x, rawPositions[n].y - rawPositions[other].y, rawPositions[n].z - rawPositions[other].z) ** 2 + 0.001;
                  curE += 1.0 / dCur;
                  swapE += 1.0 / dSwap;
                }
                if (swapE < curE - 0.005) {
                  isProtonArr[p] = false;
                  isProtonArr[n] = true;
                  swapped = true;
                  break;
                }
              }
              if (swapped) break;
            }
            if (!swapped) break;
          }
        }

        // 3D Force Relaxation:
        // Protons repel each other via Coulomb repulsion (F ~ 1/r^2).
        // Neutrons are pulled directly into the gaps between protons by Strong Force!
        const kC3D = nucleonRadius * 0.18;
        const kS3D = 0.16;
        const targetDist3D = nucleonRadius * 2.15;
        const hardCore3D = nucleonRadius * 1.8;

        for (let step = 0; step < 30; step++) {
          for (let i = 0; i < totalNucleons; i++) {
            let fx = 0, fy = 0, fz = 0;
            for (let j = 0; j < totalNucleons; j++) {
              if (i === j) continue;
              const dx = rawPositions[i].x - rawPositions[j].x;
              const dy = rawPositions[i].y - rawPositions[j].y;
              const dz = rawPositions[i].z - rawPositions[j].z;
              const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001;
              const nx = dx / dist, ny = dy / dist, nz = dz / dist;

              // Hard-core exclusion (Pauli principle)
              if (dist < hardCore3D) {
                const push = (hardCore3D - dist) * 0.45;
                fx += nx * push; fy += ny * push; fz += nz * push;
              }

              // Coulomb repulsion between protons
              if (isProtonArr[i] && isProtonArr[j]) {
                const fC = kC3D / (dist * dist + 0.01);
                fx += nx * fC; fy += ny * fC; fz += nz * fC;
              }

              // Strong Nuclear Force attraction between adjacent nucleons
              if (dist < targetDist3D * 1.8) {
                const delta = dist - targetDist3D;
                // Stronger attraction between proton-neutron pairs (buffering role)
                const multiplier = (isProtonArr[i] !== isProtonArr[j]) ? 1.5 : 0.8;
                const fS = -kS3D * delta * multiplier;
                fx += nx * fS; fy += ny * fS; fz += nz * fS;
              }
            }

            // Centering spring
            fx -= rawPositions[i].x * 0.03;
            fy -= rawPositions[i].y * 0.03;
            fz -= rawPositions[i].z * 0.03;

            rawPositions[i].x += fx * 0.08;
            rawPositions[i].y += fy * 0.08;
            rawPositions[i].z += fz * 0.08;
          }
        }
      }

      // Add nucleon meshes to group
      for (let i = 0; i < totalNucleons; i++) {
        const mesh = new THREE.Mesh(sphereGeo, isProtonArr[i] ? protonMat : neutronMat);
        mesh.position.set(rawPositions[i].x, rawPositions[i].y, rawPositions[i].z);
        nucGroup.add(mesh);
      }

      // Add 3D Coulomb Repulsion vectors/lines between nearby protons
      if (showCoulombVectors && atomicNumberZ > 1) {
        const coulombMat = new THREE.LineBasicMaterial({
          color: 0xf87171,
          transparent: true,
          opacity: 0.65
        });

        const maxRepelDist = nucleonRadius * (isQuantumScale ? 5.2 : 3.8);
        const repelPoints: number[] = [];

        for (let i = 0; i < totalNucleons; i++) {
          if (!isProtonArr[i]) continue;
          for (let j = i + 1; j < totalNucleons; j++) {
            if (!isProtonArr[j]) continue;
            const dx = rawPositions[i].x - rawPositions[j].x;
            const dy = rawPositions[i].y - rawPositions[j].y;
            const dz = rawPositions[i].z - rawPositions[j].z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist < maxRepelDist) {
              repelPoints.push(rawPositions[i].x, rawPositions[i].y, rawPositions[i].z);
              repelPoints.push(rawPositions[j].x, rawPositions[j].y, rawPositions[j].z);
            }
          }
        }

        if (repelPoints.length > 0) {
          const repelGeo = new THREE.BufferGeometry();
          repelGeo.setAttribute('position', new THREE.Float32BufferAttribute(repelPoints, 3));
          const repelLines = new THREE.LineSegments(repelGeo, coulombMat);
          nucGroup.add(repelLines);
        }
      }

      // Add Strong Force / Gluon mesonic binding bonds between neighboring nucleons (especially proton-neutron buffer bonds)
      if (showNuclearForces && totalNucleons > 1) {
        const bondMat = new THREE.LineBasicMaterial({
          color: 0x22d3ee,
          transparent: true,
          opacity: 0.42,
          blending: THREE.AdditiveBlending
        });

        const maxBondDist = nucleonRadius * (isQuantumScale ? 3.8 : 2.8);
        const linePoints: number[] = [];

        for (let i = 0; i < totalNucleons; i++) {
          for (let j = i + 1; j < totalNucleons; j++) {
            const isPN = isProtonArr[i] !== isProtonArr[j];
            const dx = rawPositions[i].x - rawPositions[j].x;
            const dy = rawPositions[i].y - rawPositions[j].y;
            const dz = rawPositions[i].z - rawPositions[j].z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist < maxBondDist && (isPN || neutronsN === 0)) {
              linePoints.push(rawPositions[i].x, rawPositions[i].y, rawPositions[i].z);
              linePoints.push(rawPositions[j].x, rawPositions[j].y, rawPositions[j].z);
            }
          }
        }

        if (linePoints.length > 0) {
          const bondLinesGeo = new THREE.BufferGeometry();
          bondLinesGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePoints, 3));
          const bondLines = new THREE.LineSegments(bondLinesGeo, bondMat);
          nucGroup.add(bondLines);
        }
      }
    }

    // In 3D mode, the Three.js viewport exclusively models the nuclear core (protons and neutrons).
    // All 3D electron representations have been removed to optimize GPU performance and avoid NaN bounding errors.
    // The electrons are represented exclusively in 2D mode.
  }, [atomicNumberZ, neutronsN, scaleMode, showNuclearForces, showCoulombVectors]);

  // Share handler
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-8 animate-in fade-in">
      
      {/* ========================================================================= */}
      {/* 1. BREADCRUMBS & MAIN TITLE HEADER (IMAGE 1)                              */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
          {onNavigateHome ? (
            <button 
              onClick={onNavigateHome}
              className="hover:text-cyan-400 transition"
            >
              INICIO
            </button>
          ) : (
            <span>INICIO</span>
          )}
          <span>/</span>
          <span className="text-cyan-400 font-bold">CONSTRUCTOR DE ÁTOMOS</span>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">
            — ENTORNO DE PRUEBAS • SIMULACIÓN EN DIRECTO
          </span>
          <h1 className="text-3xl font-extrabold text-white font-sans tracking-tight">
            Construye un átomo
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed font-sans">
            Añade un protón y cambias el elemento. Añade un neutrón y cambias el isótopo. Añade un electrón y creas un ion. Los electrones están limitados cuánticamente a los estados físicamente posibles, y el exceso de nucleones desencadena transmutación beta espontánea.
          </p>

          {/* Layered Nuclear Shell Model Info Card */}
          <div className="w-full bg-gradient-to-r from-cyan-950/40 via-[#0b111a] to-indigo-950/40 border border-cyan-500/30 rounded-xl p-4 font-mono text-xs space-y-2 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span>⚛️</span> Modelo de Apilamiento por Capas del Núcleo & Isóbaros
              </span>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                R = 1.2 · ∛A fm (A = Z + N = cte)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-slate-300 font-sans">
              <div className="bg-[#080d14]/80 border border-slate-800 rounded-lg p-2.5">
                <span className="font-bold text-purple-400 block mb-0.5 font-mono">🟣 Capa Central (r &lt; 0.6R)</span>
                Neutrones exclusivos (empaquetamiento compacto, sin protones).
              </div>
              <div className="bg-[#080d14]/80 border border-slate-800 rounded-lg p-2.5">
                <span className="font-bold text-amber-400 block mb-0.5 font-mono">🟡 Capa Intermedia (0.6R - 0.85R)</span>
                Neutrones con amortiguamiento de protones (25%).
              </div>
              <div className="bg-[#080d14]/80 border border-slate-800 rounded-lg p-2.5">
                <span className="font-bold text-red-400 block mb-0.5 font-mono">🔴 Capa Superficial (0.85R - R)</span>
                Protones en Esfera de Fibonacci con separación máxima.
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Hint Pill */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl select-none">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold border border-slate-700">P</span>
            <span>protón</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold border border-slate-700 ml-1">N</span>
            <span>neutrón</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold border border-slate-700 ml-1">E</span>
            <span>electrón</span>
            <span className="text-slate-500 hidden sm:inline ml-2">• Mayús para restar</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN 3D BUILDER VIEWPORT & RIGHT CONTROLS SIDEBAR                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 3D Canvas Container (8 Cols or Pantalla Completa Fixed) */}
        <div 
          ref={viewportWrapperRef}
          className={`${
            isFullscreen
              ? 'fixed inset-0 z-50 w-screen h-screen bg-[#020408] rounded-none border-none shadow-none flex flex-col p-0'
              : 'lg:col-span-7 bg-[#020408] border border-slate-800 rounded-2xl min-h-[580px] h-[580px] relative overflow-hidden shadow-2xl flex flex-col'
          }`}
        >
          
          {/* Top Canvas Controls Bar: 3D/2D Switcher, Model Switcher & Force Toggles */}
          <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            {/* Left Zone: 3D vs 2D View Switcher & Model / Scale Toggle */}
            <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto bg-black/80 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-xl text-[11px] font-mono">
              {/* Dimension Switcher (3D / 2D / Lanzador a Instancia Aislada) */}
              <div className="flex items-center bg-cyan-950/70 p-0.5 rounded-lg border border-cyan-500/50 mr-1 shadow-inner">
                <button
                  onClick={() => setDimensionMode('3D')}
                  className={`px-3 py-1 rounded-md transition font-bold flex items-center gap-1.5 text-xs ${
                    dimensionMode === '3D'
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-sm font-extrabold'
                      : 'text-cyan-300 hover:text-white'
                  }`}
                  title="Visión 3D Espacial interactiva: nubes de probabilidad, giro tridimensional y partículas"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Visión 3D</span>
                </button>
                <button
                  onClick={() => setDimensionMode('2D')}
                  className={`px-3 py-1 rounded-md transition font-bold flex items-center gap-1.5 text-xs ${
                    dimensionMode === '2D'
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-sm font-extrabold'
                      : 'text-cyan-300 hover:text-white'
                  }`}
                  title="Visión 2D: Corte nuclear transversal con repulsión de Coulomb y amortiguamiento por neutrones"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Visión 2D</span>
                </button>
                <button
                  onClick={() => {
                    if (onLaunchPhysicsEngine) {
                      onLaunchPhysicsEngine(atomicNumberZ);
                    } else {
                      window.location.hash = `/physics-engine?z=${atomicNumberZ}&preset=bohr`;
                    }
                  }}
                  className="px-2.5 py-1 rounded-md transition font-bold flex items-center gap-1.5 text-xs text-amber-300 hover:text-white hover:bg-amber-500/20"
                  title="Abrir en Instancia Aislada de Motor Físico (Z = current) para evitar duplicación de WebGL y sobrecarga de GPU"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Motor Físico Aislado</span>
                  <ArrowRight className="w-3 h-3 text-amber-400" />
                </button>
              </div>

              {/* Force Toggles (Available in both 3D & 2D) */}
              <div className="flex items-center gap-1 text-[10.5px]">
                <button
                  onClick={() => setShowCoulombVectors(prev => !prev)}
                  className={`px-2 py-0.5 rounded-lg transition flex items-center gap-1 border ${
                    showCoulombVectors
                      ? 'bg-red-500/25 text-red-200 border-red-500/60 font-bold'
                      : 'text-slate-400 border-transparent hover:bg-slate-800/60'
                  }`}
                  title="Mostrar líneas/vectores de repulsión electrostática de Coulomb entre protones (+)"
                >
                  <ArrowUpRight className="w-3 h-3 text-red-400" />
                  <span>Coulomb (Fe)</span>
                </button>

                <button
                  onClick={() => setShowNuclearForces(prev => !prev)}
                  className={`px-2 py-0.5 rounded-lg transition flex items-center gap-1 border ${
                    showNuclearForces
                      ? 'bg-cyan-500/25 text-cyan-200 border-cyan-500/60 font-bold'
                      : 'text-slate-400 border-transparent hover:bg-slate-800/60'
                  }`}
                  title="Mostrar enlaces de atracción nuclear fuerte mediada por neutrones amortiguadores (Fs)"
                >
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>Fuerza Fuerte (Fs)</span>
                </button>
              </div>

              {dimensionMode === '3D' && (
                <>
                  <div className="w-[1px] h-4 bg-slate-700/80 mx-0.5" />

                  <button
                    onClick={() => setVisualizationModel('quantum')}
                    className={`px-2 py-0.5 rounded-lg transition flex items-center gap-1 ${
                      visualizationModel === 'quantum'
                        ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                    title="Nubes de probabilidad cuántica |ψ|²"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Nubes |ψ|²</span>
                  </button>

                  <button
                    onClick={() => setVisualizationModel('bohr')}
                    className={`px-2 py-0.5 rounded-lg transition flex items-center gap-1 ${
                      visualizationModel === 'bohr'
                        ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                    title="Modelo planetario de Bohr (1913)"
                  >
                    <Atom className="w-3 h-3 text-amber-400" />
                    <span>Bohr</span>
                  </button>

                  <div className="w-[1px] h-4 bg-slate-700/80 mx-0.5" />

                  <button
                    onClick={() => setScaleMode(prev => prev === 'quantum_scale' ? 'nucleus_zoom' : 'quantum_scale')}
                    className={`px-2 py-0.5 rounded-lg transition flex items-center gap-1 ${
                      scaleMode === 'quantum_scale'
                        ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 font-bold'
                        : 'text-slate-300 bg-slate-800/60 border border-slate-700 font-semibold'
                    }`}
                    title="Alternar escala cuántica real vs zoom nuclear"
                  >
                    {scaleMode === 'quantum_scale' ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>Escala Real</span>
                      </>
                    ) : (
                      <>
                        <ZoomIn className="w-3 h-3 text-amber-400" />
                        <span>Zoom Núcleo</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Right Zone: Cutaway, 5 Principles Guide & Reset */}
            <div className="flex items-center gap-1.5 pointer-events-auto bg-black/80 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-xl text-[11px] font-mono">
              {dimensionMode === '3D' && visualizationModel === 'quantum' && (
                <button
                  onClick={() => setProbabilityCutaway(prev => !prev)}
                  className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 border ${
                    probabilityCutaway
                      ? 'bg-purple-500/25 text-purple-300 border-purple-400 font-bold shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                      : 'text-slate-400 hover:text-white bg-transparent border-transparent hover:bg-slate-800/60'
                  }`}
                  title="Corte transversal en cuadrante para inspeccionar la densidad interna y los nodos radiales"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Corte 50%</span>
                </button>
              )}

              <button
                onClick={() => setShowPrinciplesGuide(true)}
                className="px-2.5 py-1 rounded-lg text-amber-300 hover:text-white hover:bg-amber-950/40 border border-amber-500/30 transition flex items-center gap-1.5"
                title="Ver los 5 principios reales de visualización cuántica y prompts para IA"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">5 Principios</span>
              </button>

              {dimensionMode === '3D' && (
                <>
                  <button
                    onClick={handleResetCamera}
                    className="px-2 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                    title="Restablecer posición de la cámara"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 font-bold cursor-pointer ${
                      isFullscreen
                        ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                        : 'text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border-cyan-500/40'
                    }`}
                    title={isFullscreen ? "Salir de Pantalla Completa (ESC / F)" : "Pantalla Completa 3D — Máximo Renderizado UHD (F)"}
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Restaurar</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Pantalla Completa</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Historical Bohr Warning Pill when Bohr model is selected */}
          {dimensionMode === '3D' && visualizationModel === 'bohr' && (
            <div className="absolute top-16 left-3 right-3 z-10 px-3 py-2 rounded-xl bg-amber-950/80 border border-amber-500/50 backdrop-blur-md text-[11px] font-mono text-amber-200 flex items-center gap-2 shadow-lg">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="leading-tight">
                <strong>Aviso didáctico:</strong> El modelo de Bohr (1913) muestra órbitas planetarias inexactas que violan la incertidumbre de Heisenberg. Cambia a <button onClick={() => setVisualizationModel('quantum')} className="text-white underline font-bold hover:text-cyan-300">Nubes |ψ|²</button> para ver nubes de probabilidad continuas.
              </div>
            </div>
          )}

          {/* Nuclear Stability Band Validator Floating Banner */}
          {(stability.status.includes('Inestable') || stability.status.includes('Radiactivo') || stability.status.includes('Exceso')) && (
            <div className="absolute top-28 left-4 right-4 z-15 p-3 rounded-xl bg-red-950/90 border border-red-500/60 backdrop-blur-md shadow-2xl text-xs font-mono text-red-200 flex items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <strong className="text-white">Validador de Banda de Estabilidad:</strong> Isótopo fuera del Valle de Estabilidad ({stability.status}). N óptimo: {stability.optimalN} (actual: {neutronsN}).
                </div>
              </div>
              {evaluateBetaDecayConditions(atomicNumberZ, neutronsN).canDecayBetaMinus && (
                <button
                  onClick={() => triggerBetaDecay('beta_minus')}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-400 text-black font-bold rounded-lg text-[11px] whitespace-nowrap shadow cursor-pointer"
                >
                  Estabilizar (β⁻)
                </button>
              )}
            </div>
          )}

          {/* Floating Beta Decay Toast Notification */}
          {betaDecayNotification && (
            <div className="absolute top-24 left-4 right-4 z-20 p-3.5 rounded-xl bg-gradient-to-r from-amber-950/95 via-[#070c18]/95 to-cyan-950/95 border border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.3)] backdrop-blur-md animate-in slide-in-from-top-4 duration-300 flex items-start justify-between gap-3 text-xs font-mono">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                  <Zap className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <span>{betaDecayNotification.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                      betaDecayNotification.type === 'beta_minus' 
                        ? 'bg-amber-400 text-black' 
                        : 'bg-blue-400 text-black'
                    }`}>
                      {betaDecayNotification.type === 'beta_minus' ? 'Z AUMENTÓ (+1)' : 'Z DISMINUYÓ (-1)'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-300 font-sans mt-0.5 leading-relaxed">
                    {betaDecayNotification.desc}
                  </p>
                  <div className="mt-1 text-[11px] text-cyan-300 font-mono">
                    Ecuación nuclear: {betaDecayNotification.equation}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setBetaDecayNotification(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Floating Nuclear Reaction Toast Notification (Beta, Alpha, Gamma, Fusion) */}
          {nuclearReactionNotification && (
            <div className="absolute top-24 left-4 right-4 z-20 p-3.5 rounded-xl bg-gradient-to-r from-purple-950/95 via-[#070c18]/95 to-cyan-950/95 border border-purple-500/60 shadow-[0_0_25px_rgba(168,85,247,0.35)] backdrop-blur-md animate-in slide-in-from-top-4 duration-300 flex items-start justify-between gap-3 text-xs font-mono">
              <div className="flex items-start gap-2.5">
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                  nuclearReactionNotification.type === 'gamma_decay' ? 'bg-purple-500/20 text-purple-400' :
                  nuclearReactionNotification.type === 'alpha_fission' ? 'bg-amber-500/20 text-amber-400' :
                  nuclearReactionNotification.type === 'nuclear_fusion' ? 'bg-cyan-500/20 text-cyan-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  <Zap className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <span>{nuclearReactionNotification.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold ${nuclearReactionNotification.badgeColor}`}>
                      {nuclearReactionNotification.badge}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-300 font-sans mt-0.5 leading-relaxed">
                    {nuclearReactionNotification.desc}
                  </p>
                  <div className="mt-1 text-[11px] text-cyan-300 font-mono">
                    <EquationMath equation={nuclearReactionNotification.equation} />
                  </div>
                </div>
              </div>
              <button
                onClick={() => setNuclearReactionNotification(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {/* VIEWPORT BODY: 3D THREE.JS CANVAS VS 2D COULOMB NUCLEAR CROSS-SECTION     */}
          {/* ========================================================================= */}
          <div 
            ref={containerRef} 
            className={`w-full h-full cursor-grab active:cursor-grabbing ${dimensionMode === '3D' ? 'block' : 'hidden'}`} 
          />

          {/* HUD FLOTANTE Y CONTROLES INMERSIVOS EN PANTALLA COMPLETA 3D */}
          {isFullscreen && (
            <>
              {/* Banner Superior Central de Estado UHD */}
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-max max-w-[90vw]">
                <div className="bg-black/85 backdrop-blur-md border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.4)] px-4 py-1.5 rounded-full flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    PANTALLA COMPLETA 3D · MÁXIMO RENDERIZADO UHD
                  </span>
                  <span className="text-slate-600 hidden sm:inline">|</span>
                  <span className="text-white font-bold">{currentElement.symbol}-{massNumberA} ({currentElement.name})</span>
                  <span className="text-slate-600 hidden sm:inline">|</span>
                  <span className="text-amber-300 font-semibold">Z={atomicNumberZ} N={neutronsN} (A={massNumberA})</span>
                  <span className="text-slate-600 hidden sm:inline">|</span>
                  <span className="text-slate-300 hidden md:inline">Atajos: <kbd className="px-1.5 py-0.5 bg-slate-800 text-cyan-300 rounded border border-slate-700">ESC</kbd> o <kbd className="px-1.5 py-0.5 bg-slate-800 text-cyan-300 rounded border border-slate-700">F</kbd></span>
                </div>
              </div>

              {/* BARRA FLOTANTE INMERSIVA EN PANTALLA COMPLETA CON CONTROLADORES Y DECAIMIENTOS FÍSICOS */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 w-max max-w-[96vw]">
                {/* Micro-banner de Diagnóstico de Canales de Decaimiento del Isótopo Actual */}
                <div className="bg-black/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-slate-700/80 shadow-lg flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono">
                  <span className="text-slate-400 font-bold hidden sm:inline">Canales Físicos para {massNumberA}{currentElement.symbol}:</span>
                  
                  {/* Badge Alfa */}
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border flex items-center gap-1 ${
                    decayChannels.alpha.canDecay 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)] animate-pulse' 
                      : 'bg-slate-900/60 text-slate-500 border-slate-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${decayChannels.alpha.canDecay ? 'bg-amber-400' : 'bg-slate-600'}`} />
                    <span>Alfa (α): {decayChannels.alpha.canDecay ? 'HABILITADO' : 'BLOQUEADO'}</span>
                  </span>

                  {/* Badge Beta */}
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border flex items-center gap-1 ${
                    decayChannels.betaMinus.canDecay 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.3)] animate-pulse' 
                      : (decayChannels.betaPlus.canDecay 
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-[0_0_8px_rgba(244,63,94,0.3)] animate-pulse'
                          : 'bg-slate-900/60 text-slate-500 border-slate-800')
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${decayChannels.betaMinus.canDecay ? 'bg-cyan-400' : (decayChannels.betaPlus.canDecay ? 'bg-rose-400' : 'bg-slate-600')}`} />
                    <span>Beta (β): {decayChannels.betaMinus.canDecay ? 'β⁻ ACTIVO' : (decayChannels.betaPlus.canDecay ? 'β⁺ ACTIVO' : 'BLOQUEADO')}</span>
                  </span>

                  {/* Badge Gamma */}
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border flex items-center gap-1 ${
                    decayChannels.gamma.canDecay 
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/60 shadow-[0_0_8px_rgba(168,85,247,0.3)] animate-pulse' 
                      : 'bg-slate-900/60 text-slate-500 border-slate-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${decayChannels.gamma.canDecay ? 'bg-purple-400' : 'bg-slate-600'}`} />
                    <span>Gamma (γ): {decayChannels.gamma.canDecay ? (isMetastableState ? 'ISÓMERO (*m)' : 'EXCITADO') : 'FUNDAMENTAL'}</span>
                  </span>

                  {/* Badge Protón (p) */}
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border flex items-center gap-1 ${
                    decayChannels.protonEmission.canDecay 
                      ? 'bg-red-500/20 text-red-300 border-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.3)] animate-pulse' 
                      : 'bg-slate-900/60 text-slate-500 border-slate-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${decayChannels.protonEmission.canDecay ? 'bg-red-400' : 'bg-slate-600'}`} />
                    <span>Protón (p): {decayChannels.protonEmission.canDecay ? 'HABILITADO' : 'BLOQUEADO'}</span>
                  </span>

                  {/* Badge Neutrón (n) */}
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border flex items-center gap-1 ${
                    decayChannels.neutronEmission.canDecay 
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/60 shadow-[0_0_8px_rgba(59,130,246,0.3)] animate-pulse' 
                      : 'bg-slate-900/60 text-slate-500 border-slate-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${decayChannels.neutronEmission.canDecay ? 'bg-blue-400' : 'bg-slate-600'}`} />
                    <span>Neutrón (n): {decayChannels.neutronEmission.canDecay ? 'HABILITADO' : 'BLOQUEADO'}</span>
                  </span>

                  {/* Badge Automático */}
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border flex items-center gap-1 ${
                    autoBetaDecayEnabled
                      ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.35)] animate-pulse'
                      : 'bg-slate-900/60 text-slate-500 border-slate-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${autoBetaDecayEnabled ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                    <span>Modo Auto: {autoBetaDecayEnabled ? 'ENCENDIDO' : 'APAGADO (OFF)'}</span>
                  </span>
                </div>

                {/* Deck Principal de Botones Flotantes */}
                <div className="bg-[#050812]/92 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700/80 shadow-[0_0_35px_rgba(0,0,0,0.8)] flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
                  
                  {/* Modificador de Protones (Z) */}
                  <div className="flex items-center gap-1.5 bg-red-950/50 px-2.5 py-1 rounded-xl border border-red-500/40 shadow-inner">
                    <span className="text-red-400 font-bold">Protones (Z):</span>
                    <button 
                      onClick={() => setAtomicNumberZ(prev => Math.max(0, prev - 1))}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-sm cursor-pointer transition active:scale-95"
                      title="-1 Protón"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-red-300 font-extrabold text-sm">{atomicNumberZ}</span>
                    <button 
                      onClick={() => setAtomicNumberZ(prev => Math.min(118, prev + 1))}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-sm cursor-pointer transition active:scale-95"
                      title="+1 Protón"
                    >
                      +
                    </button>
                  </div>

                  {/* Modificador de Neutrones (N) */}
                  <div className="flex items-center gap-1.5 bg-blue-950/50 px-2.5 py-1 rounded-xl border border-blue-500/40 shadow-inner">
                    <span className="text-blue-400 font-bold">Neutrones (N):</span>
                    <button 
                      onClick={() => setNeutronsN(prev => Math.max(0, prev - 1))}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-sm cursor-pointer transition active:scale-95"
                      title="-1 Neutrón"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-blue-300 font-extrabold text-sm">{neutronsN}</span>
                    <button 
                      onClick={() => setNeutronsN(prev => Math.min(180, prev + 1))}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-sm cursor-pointer transition active:scale-95"
                      title="+1 Neutrón"
                    >
                      +
                    </button>
                  </div>

                  {/* Separador de Bloque */}
                  <div className="h-6 w-px bg-slate-700/80 mx-0.5 hidden sm:block" />

                  {/* ========================================================= */}
                  {/* BOTÓN AUTOMÁTICO (INICIA SIEMPRE EN OFF APAGADO)          */}
                  {/* ========================================================= */}
                  <button
                    onClick={() => setAutoBetaDecayEnabled(prev => !prev)}
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition text-xs select-none cursor-pointer active:scale-95 ${
                      autoBetaDecayEnabled
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black border-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.6)] animate-pulse'
                        : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                    title={autoBetaDecayEnabled ? "Modo Automático: ENCENDIDO (ON). Pulsa para apagar (OFF)" : "Modo Automático: APAGADO (OFF). Pulsa para activar saltos radiactivos continuos"}
                  >
                    <span className={`w-2 h-2 rounded-full ${autoBetaDecayEnabled ? 'bg-black animate-ping' : 'bg-slate-500'}`} />
                    <span>Auto: {autoBetaDecayEnabled ? 'ON' : 'OFF'}</span>
                    {decayCountdown !== null && autoBetaDecayEnabled && (
                      <span className="w-4 h-4 rounded-full bg-black/30 text-black text-[10px] flex items-center justify-center font-extrabold animate-bounce">
                        {decayCountdown}s
                      </span>
                    )}
                  </button>

                  {/* Separador de Bloque */}
                  <div className="h-6 w-px bg-slate-700/80 mx-0.5 hidden sm:block" />

                  {/* ========================================================= */}
                  {/* BOTÓN 1: DECAER ALFA (α) - SOLO HABILITADO SI FACTIBLE     */}
                  {/* ========================================================= */}
                  <button
                    onClick={() => {
                      if (decayChannels.alpha.canDecay) {
                        triggerAlphaFission();
                      }
                    }}
                    disabled={!decayChannels.alpha.canDecay}
                    title={decayChannels.alpha.reason}
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition text-xs select-none ${
                      decayChannels.alpha.canDecay
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black border-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.55)] cursor-pointer active:scale-95'
                        : 'bg-slate-900/50 text-slate-500 border-slate-800/80 cursor-not-allowed opacity-45'
                    }`}
                  >
                    <Zap className={`w-3.5 h-3.5 ${decayChannels.alpha.canDecay ? 'fill-black text-black' : 'text-slate-600'}`} />
                    <span>Decaer Alfa (α)</span>
                    <span className={`text-[10px] font-mono px-1 rounded ${
                      decayChannels.alpha.canDecay ? 'bg-black/25 text-black font-extrabold' : 'text-slate-600'
                    }`}>
                      -2p -2n
                    </span>
                  </button>

                  {/* ========================================================= */}
                  {/* BOTÓN 1B: CAPTURA ALFA (α) +2p, +2n                       */}
                  {/* ========================================================= */}
                  <button
                    onClick={() => triggerAlphaCapture()}
                    disabled={atomicNumberZ + 2 > 118}
                    title="Captura / Absorción Alfa (+2p, +2n): el núcleo fusiona una partícula alfa incidente aumentando Z en +2 y N en +2"
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition text-xs select-none ${
                      atomicNumberZ + 2 <= 118
                        ? 'bg-teal-950/60 hover:bg-teal-900/70 text-teal-200 border-teal-500/60 shadow-[0_0_12px_rgba(20,184,166,0.35)] cursor-pointer active:scale-95'
                        : 'bg-slate-900/50 text-slate-500 border-slate-800/80 cursor-not-allowed opacity-45'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-teal-400" />
                    <span>Captura Alfa (α)</span>
                    <span className={`text-[10px] font-mono px-1 rounded ${
                      atomicNumberZ + 2 <= 118 ? 'bg-black/25 text-teal-300 font-extrabold' : 'text-slate-600'
                    }`}>
                      +2p +2n
                    </span>
                  </button>

                  {/* ========================================================= */}
                  {/* BOTÓN 2: DECAER BETA MENOS (β⁻)                           */}
                  {/* ========================================================= */}
                  <button
                    onClick={() => {
                      if (decayChannels.betaMinus.canDecay) {
                        triggerBetaDecay('beta_minus');
                      }
                    }}
                    disabled={!decayChannels.betaMinus.canDecay}
                    title={decayChannels.betaMinus.reason}
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition text-xs select-none ${
                      decayChannels.betaMinus.canDecay
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black border-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.55)] cursor-pointer active:scale-95'
                        : 'bg-slate-900/50 text-slate-500 border-slate-800/80 cursor-not-allowed opacity-45'
                    }`}
                  >
                    <Zap className={`w-3.5 h-3.5 ${decayChannels.betaMinus.canDecay ? 'fill-black text-black' : 'text-slate-600'}`} />
                    <span>Decaer Beta (β⁻)</span>
                    <span className={`text-[10px] font-mono px-1 rounded ${
                      decayChannels.betaMinus.canDecay ? 'bg-black/25 text-black font-extrabold' : 'text-slate-600'
                    }`}>
                      +1p -1n
                    </span>
                  </button>

                  {/* ========================================================= */}
                  {/* BOTÓN 3: DECAER BETA MÁS (β⁺)                             */}
                  {/* ========================================================= */}
                  <button
                    onClick={() => {
                      if (decayChannels.betaPlus.canDecay) {
                        triggerBetaDecay('beta_plus');
                      }
                    }}
                    disabled={!decayChannels.betaPlus.canDecay}
                    title={decayChannels.betaPlus.reason}
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition text-xs select-none ${
                      decayChannels.betaPlus.canDecay
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-black border-rose-300 shadow-[0_0_16px_rgba(244,63,94,0.55)] cursor-pointer active:scale-95'
                        : 'bg-slate-900/50 text-slate-500 border-slate-800/80 cursor-not-allowed opacity-45'
                    }`}
                  >
                    <Zap className={`w-3.5 h-3.5 ${decayChannels.betaPlus.canDecay ? 'fill-black text-black' : 'text-slate-600'}`} />
                    <span>Decaer Beta (β⁺)</span>
                    <span className={`text-[10px] font-mono px-1 rounded ${
                      decayChannels.betaPlus.canDecay ? 'bg-black/25 text-black font-extrabold' : 'text-slate-600'
                    }`}>
                      -1p +1n
                    </span>
                  </button>

                  {/* ========================================================= */}
                  {/* BOTÓN 4 & 5: DECAER GAMMA (γ) & TOGGLE EXCITAR (*m)       */}
                  {/* ========================================================= */}
                  <div className="flex items-center gap-1 bg-purple-950/40 p-0.5 rounded-xl border border-purple-500/40">
                    <button
                      onClick={() => {
                        if (decayChannels.gamma.canDecay) {
                          triggerGammaDecay();
                        }
                      }}
                      disabled={!decayChannels.gamma.canDecay}
                      title={decayChannels.gamma.reason}
                      className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 font-bold transition text-xs select-none ${
                        decayChannels.gamma.canDecay
                          ? 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white border-purple-300 shadow-[0_0_16px_rgba(168,85,247,0.6)] cursor-pointer active:scale-95'
                          : 'bg-slate-900/50 text-slate-500 border-slate-800/80 cursor-not-allowed opacity-45'
                      }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${decayChannels.gamma.canDecay ? 'text-white animate-spin' : 'text-slate-600'}`} />
                      <span>Gamma (γ)</span>
                      <span className={`text-[10px] font-mono px-1 rounded ${
                        decayChannels.gamma.canDecay ? 'bg-black/30 text-purple-200' : 'text-slate-600'
                      }`}>
                        IT
                      </span>
                    </button>

                    <button
                      onClick={() => setIsMetastableState(prev => !prev)}
                      className={`px-2 py-1.5 rounded-lg border text-xs font-mono transition flex items-center gap-1 cursor-pointer select-none ${
                        isMetastableState
                          ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)] font-bold'
                          : 'bg-slate-900 hover:bg-slate-800 text-purple-300 border-purple-800/60'
                      }`}
                      title={isMetastableState ? "Núcleo metaestable activo (*m). Pulsa para volver al estado fundamental" : "Excitar núcleo a estado cuántico metaestable (*m) para probar emisión gamma (IT)"}
                    >
                      <span>{isMetastableState ? '★ m' : 'Excitar (*m)'}</span>
                    </button>
                  </div>

                  {/* ========================================================= */}
                  {/* BOTÓN 6: EMISIÓN DE PROTÓN (p)                             */}
                  {/* ========================================================= */}
                  <button
                    onClick={() => {
                      if (decayChannels.protonEmission.canDecay) {
                        triggerProtonEmission();
                      }
                    }}
                    disabled={!decayChannels.protonEmission.canDecay}
                    title={decayChannels.protonEmission.reason}
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition text-xs select-none ${
                      decayChannels.protonEmission.canDecay
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white border-red-300 shadow-[0_0_16px_rgba(239,68,68,0.6)] cursor-pointer active:scale-95'
                        : 'bg-slate-900/50 text-slate-500 border-slate-800/80 cursor-not-allowed opacity-45'
                    }`}
                  >
                    <Zap className={`w-3.5 h-3.5 ${decayChannels.protonEmission.canDecay ? 'fill-white text-white' : 'text-slate-600'}`} />
                    <span>Emitir Protón (p)</span>
                    <span className={`text-[10px] font-mono px-1 rounded ${
                      decayChannels.protonEmission.canDecay ? 'bg-black/30 text-red-200 font-extrabold' : 'text-slate-600'
                    }`}>
                      -1p
                    </span>
                  </button>

                  {/* ========================================================= */}
                  {/* BOTÓN 7: EMISIÓN DE NEUTRÓN (n)                            */}
                  {/* ========================================================= */}
                  <button
                    onClick={() => {
                      if (decayChannels.neutronEmission.canDecay) {
                        triggerNeutronEmission();
                      }
                    }}
                    disabled={!decayChannels.neutronEmission.canDecay}
                    title={decayChannels.neutronEmission.reason}
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition text-xs select-none ${
                      decayChannels.neutronEmission.canDecay
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-300 shadow-[0_0_16px_rgba(59,130,246,0.6)] cursor-pointer active:scale-95'
                        : 'bg-slate-900/50 text-slate-500 border-slate-800/80 cursor-not-allowed opacity-45'
                    }`}
                  >
                    <Zap className={`w-3.5 h-3.5 ${decayChannels.neutronEmission.canDecay ? 'fill-white text-white' : 'text-slate-600'}`} />
                    <span>Emitir Neutrón (n)</span>
                    <span className={`text-[10px] font-mono px-1 rounded ${
                      decayChannels.neutronEmission.canDecay ? 'bg-black/30 text-blue-200 font-extrabold' : 'text-slate-600'
                    }`}>
                      -1n
                    </span>
                  </button>

                  {/* Separador de Bloque */}
                  <div className="h-6 w-px bg-slate-700/80 mx-0.5 hidden md:block" />

                  {/* Presets didácticos para prueba inmediata */}
                  <div className="hidden xl:flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
                    <span className="text-slate-500 font-bold mr-1">Probar:</span>
                    <button
                      onClick={() => { setAtomicNumberZ(6); setNeutronsN(6); setIsMetastableState(false); }}
                      className={`px-1.5 py-0.5 rounded transition ${atomicNumberZ === 6 && neutronsN === 6 ? 'bg-cyan-500 text-black font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
                      title="C-12: Estable (Todos los canales bloqueados)"
                    >
                      C-12
                    </button>
                    <button
                      onClick={() => { setAtomicNumberZ(6); setNeutronsN(8); setIsMetastableState(false); }}
                      className={`px-1.5 py-0.5 rounded transition ${atomicNumberZ === 6 && neutronsN === 8 ? 'bg-cyan-500 text-black font-bold' : 'hover:bg-slate-800 text-cyan-300'}`}
                      title="C-14: Radiactivo Beta- (Decae a N-14)"
                    >
                      C-14
                    </button>
                    <button
                      onClick={() => { setAtomicNumberZ(6); setNeutronsN(5); setIsMetastableState(false); }}
                      className={`px-1.5 py-0.5 rounded transition ${atomicNumberZ === 6 && neutronsN === 5 ? 'bg-rose-500 text-black font-bold' : 'hover:bg-slate-800 text-rose-300'}`}
                      title="C-11: Radiactivo Beta+ (Decae a B-11)"
                    >
                      C-11
                    </button>
                    <button
                      onClick={() => { setAtomicNumberZ(92); setNeutronsN(146); setIsMetastableState(false); }}
                      className={`px-1.5 py-0.5 rounded transition ${atomicNumberZ === 92 && neutronsN === 146 ? 'bg-amber-500 text-black font-bold' : 'hover:bg-slate-800 text-amber-300'}`}
                      title="U-238: Radiactivo Alfa (Decae a Th-234)"
                    >
                      U-238
                    </button>
                    <button
                      onClick={() => { setAtomicNumberZ(43); setNeutronsN(56); setIsMetastableState(true); }}
                      className={`px-1.5 py-0.5 rounded transition ${atomicNumberZ === 43 && neutronsN === 56 ? 'bg-purple-500 text-white font-bold' : 'hover:bg-slate-800 text-purple-300'}`}
                      title="Tecnecio-99m: Isómero Gamma (140.5 keV)"
                    >
                      Tc-99m
                    </button>
                    <button
                      onClick={() => { setAtomicNumberZ(3); setNeutronsN(2); setIsMetastableState(false); }}
                      className={`px-1.5 py-0.5 rounded transition ${atomicNumberZ === 3 && neutronsN === 2 ? 'bg-red-500 text-white font-bold' : 'hover:bg-slate-800 text-red-300'}`}
                      title="Litio-5 (⁵Li): Emisión de Protón instantánea hacia Helio-4"
                    >
                      Li-5 (p)
                    </button>
                    <button
                      onClick={() => { setAtomicNumberZ(2); setNeutronsN(3); setIsMetastableState(false); }}
                      className={`px-1.5 py-0.5 rounded transition ${atomicNumberZ === 2 && neutronsN === 3 ? 'bg-blue-500 text-white font-bold' : 'hover:bg-slate-800 text-blue-300'}`}
                      title="Helio-5 (⁵He): Emisión de Neutrón espontánea hacia Helio-4"
                    >
                      He-5 (n)
                    </button>
                  </div>

                  {/* Botón Salir de Pantalla Completa */}
                  <button
                    onClick={toggleFullscreen}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5 font-bold transition border border-slate-600 cursor-pointer ml-1 active:scale-95"
                    title="Salir del modo pantalla completa (ESC / F)"
                  >
                    <Minimize2 className="w-4 h-4 text-cyan-400" />
                    <span className="hidden sm:inline">Salir</span>
                  </button>
                </div>
              </div>
            </>
          )}


          {dimensionMode === '2D' && (
            <div className="w-full h-full relative bg-[#02050c] flex flex-col justify-between overflow-hidden p-2 select-none">
              
              {/* Interactive 2D SVG Cross-Section */}
              <div className="w-full h-full flex items-center justify-center pt-8">
                <svg
                  viewBox="0 0 640 500"
                  className="w-full h-full max-h-[500px]"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.8))' }}
                >
                  <defs>
                    {/* Glowing gradients */}
                    <radialGradient id="protonGrad2D" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#fca5a5" />
                      <stop offset="45%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#991b1b" />
                    </radialGradient>

                    <radialGradient id="neutronGrad2D" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#93c5fd" />
                      <stop offset="45%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1e3a8a" />
                    </radialGradient>

                    <radialGradient id="cloud1sGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                      <stop offset="70%" stopColor="#0284c7" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                    </radialGradient>

                    {/* Arrow marker for Coulomb repulsion vectors */}
                    <marker
                      id="coulombArrow"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="5"
                      markerHeight="5"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f87171" />
                    </marker>
                  </defs>

                  {/* Grid Lines */}
                  <g opacity="0.15">
                    <line x1="320" y1="20" x2="320" y2="480" stroke="#38bdf8" strokeDasharray="3 3" />
                    <line x1="40" y1="250" x2="600" y2="250" stroke="#38bdf8" strokeDasharray="3 3" />
                    <circle cx="320" cy="250" r="130" stroke="#38bdf8" fill="none" strokeDasharray="2 4" />
                    <circle cx="320" cy="250" r="195" stroke="#38bdf8" fill="none" strokeDasharray="2 4" />
                    <circle cx="320" cy="250" r="240" stroke="#38bdf8" fill="none" strokeDasharray="2 4" />
                  </g>

                  {/* Nuclear Perimeter Ring */}
                  <g opacity="0.35">
                    <circle cx="320" cy="250" r={Math.min(180, Math.max(45, Math.cbrt(totalNucleons) * 38))} fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
                  </g>

                  {/* Warning banner inside SVG if protons exist without neutrons (pure Coulomb repulsion) */}
                  {atomicNumberZ >= 2 && neutronsN === 0 && (
                    <g transform="translate(320, 250)">
                      <rect x="-140" y="-36" width="280" height="72" rx="14" fill="#450a0a" fillOpacity="0.88" stroke="#ef4444" strokeWidth="1.5" />
                      <text y="-14" fill="#fca5a5" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                        ⚡ ¡REPULSIÓN COULÓMBICA SIN AMORTIGUAR!
                      </text>
                      <text y="7" fill="#fecaca" fontSize="9.5" fontFamily="sans-serif" textAnchor="middle">
                        Los protones no pueden cohabitar sin neutrones intermediarios.
                      </text>
                      <text y="24" fill="#f87171" fontSize="9" fontFamily="monospace" textAnchor="middle">
                        F = k·q₁·q₂/r² los separa forzosamente (Núcleo no ligado)
                      </text>
                    </g>
                  )}

                  {/* Strong Nuclear Force Bonds between neighboring nucleons (cyan dashed lines) */}
                  {showNuclearForces && (
                    <g opacity="0.65">
                      {nucleons2D.map((nuc1, i, arr) => {
                        return arr.slice(i + 1).map((nuc2) => {
                          const dx = nuc1.x - nuc2.x;
                          const dy = nuc1.y - nuc2.y;
                          const dist = Math.hypot(dx, dy);
                          // Connect adjacent nucleons, prioritizing proton-neutron buffering bonds
                          const maxDist = totalNucleons > 40 ? 28 : 36;
                          if (dist <= maxDist) {
                            return (
                              <line
                                key={`bond-${nuc1.id}-${nuc2.id}`}
                                x1={320 + nuc1.x}
                                y1={250 + nuc1.y}
                                x2={320 + nuc2.x}
                                y2={250 + nuc2.y}
                                stroke="#22d3ee"
                                strokeWidth={nuc1.isProton !== nuc2.isProton ? "2" : "1.2"}
                                strokeDasharray={nuc1.isProton !== nuc2.isProton ? "4 2" : "2 2"}
                              />
                            );
                          }
                          return null;
                        });
                      })}
                    </g>
                  )}

                  {/* Coulomb Repulsion Vectors between protons (red dashed vector arrows pushing away) */}
                  {showCoulombVectors && atomicNumberZ > 1 && (
                    <g opacity="0.85">
                      {nucleons2D.map((nuc1, i, arr) => {
                        if (!nuc1.isProton) return null;
                        return arr.slice(i + 1).map((nuc2) => {
                          if (!nuc2.isProton) return null;
                          const dx = nuc2.x - nuc1.x;
                          const dy = nuc2.y - nuc1.y;
                          const dist = Math.hypot(dx, dy);
                          // Show repulsion vectors between protons within range
                          const maxRepelDist = neutronsN === 0 ? 180 : 75;
                          if (dist < maxRepelDist) {
                            return (
                              <g key={`repel-${nuc1.id}-${nuc2.id}`}>
                                <line
                                  x1={320 + nuc1.x}
                                  y1={250 + nuc1.y}
                                  x2={320 + nuc2.x}
                                  y2={250 + nuc2.y}
                                  stroke="#f87171"
                                  strokeWidth="1.4"
                                  strokeDasharray="3 3"
                                  markerEnd="url(#coulombArrow)"
                                  markerStart="url(#coulombArrow)"
                                />
                              </g>
                            );
                          }
                          return null;
                        });
                      })}
                    </g>
                  )}

                  {/* Interleaved Nucleons (Protons & Neutrons) */}
                  <g>
                    {nucleons2D.map((nuc) => {
                      const r = totalNucleons > 40 ? 7.5 : (totalNucleons > 20 ? 9.5 : 12);
                      const isP = nuc.isProton;
                      const isBuffered = nuc.bufferedByNeutrons;

                      return (
                        <g
                          key={`nuc2d-${nuc.id}`}
                          transform={`translate(${320 + nuc.x}, ${250 + nuc.y})`}
                          className="cursor-pointer transition-transform hover:scale-125"
                          onMouseEnter={() => {
                            setActiveNucleonHover({
                              id: nuc.id,
                              type: isP ? 'proton' : 'neutron',
                              charge: isP ? '+1e (Positiva)' : '0 (Neutra)',
                              description: isP 
                                ? isBuffered
                                  ? 'Protón p⁺: Carga +1e. Amortiguado por neutrones intermediarios que absorben la repulsión de Coulomb y aportan Fuerza Fuerte.'
                                  : 'Protón p⁺: ¡Alerta de repulsión! No tiene neutrón amortiguador adyacente; experimenta repulsión coulómbica no apantallada.'
                                : 'Neutrón n⁰: Carga 0. Actúa como dieléctrico y amortiguador espacial entre protones, aportando enlace nuclear fuerte.'
                            });
                          }}
                          onMouseLeave={() => setActiveNucleonHover(null)}
                        >
                          <circle
                            r={r}
                            fill={isP ? 'url(#protonGrad2D)' : 'url(#neutronGrad2D)'}
                            stroke={isP ? (isBuffered ? '#fca5a5' : '#f59e0b') : '#93c5fd'}
                            strokeWidth={isP && !isBuffered ? "2" : "1"}
                            filter={isP ? 'drop-shadow(0 0 5px rgba(239,68,68,0.75))' : 'drop-shadow(0 0 5px rgba(59,130,246,0.75))'}
                          />
                          <text
                            y="3.5"
                            fill="#ffffff"
                            fontSize={r * 0.9}
                            fontWeight="bold"
                            textAnchor="middle"
                            fontFamily="monospace"
                          >
                            {isP ? '+' : '0'}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                </svg>
              </div>

              {/* Bottom 2D Scientific HUD Bar: Coulomb Repulsion Law & Equilibrium */}
              <div className="absolute bottom-2 left-2 right-2 flex flex-wrap items-center justify-between gap-2 bg-black/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 text-[11px] font-mono shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-red-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                    <span>Protón (+)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
                    <span>Neutrón (0) amortiguador</span>
                  </div>
                  {atomicNumberZ > 1 && (
                    <div className="hidden md:flex items-center gap-1 text-slate-400 border-l border-slate-700 pl-2">
                      <span>Repulsión Coulombiana estimada:</span>
                      <strong className="text-amber-300">{coulombEnergyMev} MeV</strong>
                    </div>
                  )}
                  <div className="hidden lg:flex items-center gap-1 text-[10px] text-cyan-400 border-l border-slate-700 pl-2">
                    <span>Proyección Perspectiva 3D→2D (Regla 8):</span>
                    <code className="text-slate-200 bg-slate-900/90 px-1 py-0.5 rounded border border-slate-800">X_s = \frac&#123;x \cdot d&#125;&#123;z + d&#125; + X_c</code>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400">
                  {activeNucleonHover ? (
                    <span className="text-cyan-300 font-bold animate-in fade-in">
                      {activeNucleonHover.type === 'proton' ? '🔴 ' : '🔵 '}
                      {activeNucleonHover.description}
                    </span>
                  ) : (
                    <span>Protones separados por repulsión de Coulomb con neutrones intercalados</span>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Barra Inferior del Visor 3D: Estado del Núcleo y Puente al Motor Físico 3D */}
          {dimensionMode === '3D' && (
            <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              {/* Identificador del Isótopo y Núcleo */}
              <div className="pointer-events-auto bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono flex items-center gap-2 select-none shadow-md">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">NÚCLEO</span>
                <span className="text-base font-extrabold text-white">
                  <sup className="text-[10px] text-slate-400 mr-0.5">{massNumberA}</sup>
                  {currentElement.symbol}
                </span>
                <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-2">
                  Z={atomicNumberZ} p⁺ · N={neutronsN} n⁰
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  stability.status.includes('Estable') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {stability.status.split('(')[0].trim()}
                </span>
              </div>

              {/* Botón Central: Acceso directo a la simulación 3D de Electrones en el Motor Físico */}
              <div className="pointer-events-auto">
                <button
                  onClick={() => {
                    if (onLaunchPhysicsEngine) {
                      onLaunchPhysicsEngine(atomicNumberZ, neutronsN);
                    } else {
                      window.location.hash = `#/physics-engine?preset=bohr&z=${atomicNumberZ}&n=${neutronsN}`;
                    }
                  }}
                  className="px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-black font-bold text-xs font-mono transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer active:scale-95"
                  title="Abrir la dinámica de corteza cuántica (Aufbau, de Broglie, orbitales 3D e ionización) en el Motor Físico 3D"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Simular Electrones en Motor Físico 3D</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Hint de Navegación 3D */}
              <div className="pointer-events-auto bg-black/60 px-2.5 py-1 rounded-xl text-[10px] font-mono text-slate-500 select-none hidden md:block">
                Girar: arrastrar · Zoom: rueda
              </div>
            </div>
          )}

        </div>

        {/* Right Controls & Primary Nucleus Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Element Identity Card */}
          <div className="p-4 rounded-2xl bg-[#070d18] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-lg font-bold font-mono shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                  {currentElement.symbol}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-sans leading-tight">
                    {currentElement.name}
                  </h2>
                  <div className="mt-1">
                    <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${chargeColorClass}`}>
                      {chargeLabel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">
                  N.º MÁSICO
                </span>
                <span className="text-xl font-bold font-mono text-white">
                  {massNumberA}
                </span>
              </div>
            </div>

            {/* Particle Stepper & Slider Controls (Z, N, X) */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              {/* Protones (Z) Slider & Stepper */}
              <div className="p-2.5 rounded-xl bg-[#040810] border border-slate-800/80 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                    <span>Protones (Z)</span>
                    {[2, 8, 20, 28, 50, 82, 126].includes(atomicNumberZ) && (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] px-1.5 py-0.5 rounded font-bold animate-pulse">
                        ✨ Mágico Z
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAtomicNumberZ(prev => Math.max(neutronsN >= 1 ? 0 : 1, prev - 1))}
                      disabled={atomicNumberZ <= (neutronsN >= 1 ? 0 : 1)}
                      className="w-6 h-6 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center font-bold"
                      title="−1 Z"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-bold text-sm text-red-400">{atomicNumberZ}</span>
                    <button
                      onClick={() => setAtomicNumberZ(prev => Math.min(118, prev + 1))}
                      className="w-6 h-6 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center font-bold"
                      title="+1 Z"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="118"
                  value={atomicNumberZ}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setAtomicNumberZ(val);
                  }}
                  className="w-full accent-red-500 cursor-pointer bg-slate-900 h-1.5 rounded-lg"
                  title="Deslizador de Protones (Z)"
                />
                {/* Magic Numbers Bar Z */}
                <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-800/60 text-[10px]">
                  <span className="text-amber-400 font-bold shrink-0">Núm. Mágicos Z:</span>
                  <div className="flex flex-wrap gap-1">
                    {[2, 8, 20, 28, 50, 82, 126].filter(m => m <= 118).map(mag => (
                      <button
                        key={mag}
                        onClick={() => {
                          setAtomicNumberZ(mag);
                        }}
                        className={`px-1.5 py-0.5 rounded font-mono transition border ${
                          atomicNumberZ === mag
                            ? 'bg-amber-400 text-black font-bold border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                            : 'bg-slate-900 text-amber-300 border-slate-800 hover:border-amber-500/50'
                        }`}
                        title={`Saltar a número mágico Z=${mag}`}
                      >
                        {mag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Neutrones (N) Slider & Stepper */}
              <div className="p-2.5 rounded-xl bg-[#040810] border border-slate-800/80 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
                    <span>Neutrones (N)</span>
                    {[2, 8, 20, 28, 50, 82, 126].includes(neutronsN) && (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] px-1.5 py-0.5 rounded font-bold animate-pulse">
                        ✨ Mágico N
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setNeutronsN(prev => Math.max(atomicNumberZ >= 1 ? 0 : 1, prev - 1))}
                      disabled={neutronsN <= (atomicNumberZ >= 1 ? 0 : 1)}
                      className="w-6 h-6 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center font-bold"
                      title="−1 N"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-bold text-sm text-blue-400">{neutronsN}</span>
                    <button
                      onClick={() => setNeutronsN(prev => Math.min(180, prev + 1))}
                      className="w-6 h-6 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center font-bold"
                      title="+1 N"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  value={neutronsN}
                  onChange={(e) => setNeutronsN(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer bg-slate-900 h-1.5 rounded-lg"
                  title="Deslizador de Neutrones (N)"
                />
                {/* Magic Numbers Bar N */}
                <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-800/60 text-[10px]">
                  <span className="text-amber-400 font-bold shrink-0">Núm. Mágicos N:</span>
                  <div className="flex flex-wrap gap-1">
                    {[2, 8, 20, 28, 50, 82, 126].map(mag => (
                      <button
                        key={mag}
                        onClick={() => setNeutronsN(mag)}
                        className={`px-1.5 py-0.5 rounded font-mono transition border ${
                          neutronsN === mag
                            ? 'bg-amber-400 text-black font-bold border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                            : 'bg-slate-900 text-amber-300 border-slate-800 hover:border-amber-500/50'
                        }`}
                        title={`Saltar a número mágico N=${mag}`}
                      >
                        {mag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Número Másico X (Z + N) Slider */}
              <div className="p-2.5 rounded-xl bg-[#040810] border border-cyan-500/30 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-300 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                    <span>Masa Total (X = Z + N)</span>
                  </div>
                  <span className="font-bold text-sm text-cyan-300">X = {massNumberA}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="298"
                  value={massNumberA}
                  onChange={(e) => {
                    const targetX = Number(e.target.value);
                    const newN = Math.max(0, Math.min(180, targetX - atomicNumberZ));
                    setNeutronsN(newN);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer bg-slate-900 h-1.5 rounded-lg"
                  title="Deslizador de Número Másico X (Z + N)"
                />
                <div className="text-[10px] text-slate-400 text-right">
                  Z={atomicNumberZ} + N={neutronsN} = X ({massNumberA})
                </div>
              </div>

              {/* Electrones Trasladados al Motor Físico 3D */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-[#040810] border border-cyan-500/40 text-xs font-mono space-y-2.5 shadow-lg">
                <div className="flex items-center justify-between border-b border-cyan-800/40 pb-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>Corteza Electrónica Cuántica</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9.5px] bg-cyan-900/60 text-cyan-200 border border-cyan-600/40 font-bold">
                    Motor Físico 3D
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  Toda la simulación de la corteza (orbitales de Bohr, principio de Aufbau, ondas de de Broglie, ionización y cambio de isótopos de la tabla periódica) se ejecuta en tiempo real en el <strong>Motor Físico 3D</strong>.
                </p>

                <button
                  onClick={() => {
                    if (onLaunchPhysicsEngine) {
                      onLaunchPhysicsEngine(atomicNumberZ, neutronsN);
                    } else {
                      window.location.hash = `/physics-engine?z=${atomicNumberZ}&n=${neutronsN}&preset=bohr`;
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer transition"
                >
                  <Atom className="w-4 h-4" />
                  <span>Simular Corteza en Motor Físico 3D ({currentElement.symbol}-{massNumberA}) →</span>
                </button>
              </div>

              {/* Reset Neutrons & Charge Button */}
              <button
                onClick={handleResetNeutronsAndCharge}
                className="w-full py-2 px-3 rounded-xl bg-cyan-950/30 hover:bg-cyan-950/60 text-cyan-300 border border-cyan-800/50 hover:border-cyan-500/60 text-xs font-mono font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer neutrones y carga</span>
              </button>

              {/* Quick Action Buttons: Open Element in Periodic Table & Share */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                {onOpenElementDetails && (
                  <button
                    onClick={() => onOpenElementDetails(atomicNumberZ)}
                    className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 group cursor-pointer"
                  >
                    <span className="truncate">Abrir {currentElement.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className="py-2 px-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800/80 text-slate-300 hover:text-white text-xs font-mono transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Compartir</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN CUADRÍCULA: PROPIEDADES NUCLEARES, TRANSICIONES, GAMMA & RADAR    */}
      {/* ========================================================================= */}
      <div id="cuadricula-nuclear" className="space-y-4 pt-4 border-t border-slate-800/80">
        
        {/* Header de la Cuadrícula con Filtros por Categoría y Selector de Columnas */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#070d18] border border-cyan-500/30 p-3.5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 font-mono">
                  Organización en Cuadrícula Modular
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
                  8 Módulos Visibles
                </span>
              </div>
              <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
                <span>Centro de Diagnóstico, Radar D3 y Control Nuclear</span>
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {/* Categorías de Filtro */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setGridCategory('all')}
                className={`px-2.5 py-1 rounded-lg transition font-bold text-[11px] cursor-pointer ${
                  gridCategory === 'all'
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos (8)
              </button>
              <button
                onClick={() => setGridCategory('transitions')}
                className={`px-2.5 py-1 rounded-lg transition font-bold text-[11px] cursor-pointer ${
                  gridCategory === 'transitions'
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Transiciones (3)
              </button>
              <button
                onClick={() => setGridCategory('stability')}
                className={`px-2.5 py-1 rounded-lg transition font-bold text-[11px] cursor-pointer ${
                  gridCategory === 'stability'
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Estabilidad (3)
              </button>
              <button
                onClick={() => setGridCategory('controls')}
                className={`px-2.5 py-1 rounded-lg transition font-bold text-[11px] cursor-pointer ${
                  gridCategory === 'controls'
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Controles (2)
              </button>
            </div>

            {/* Selector de 2 o 3 Columnas */}
            <div className="hidden sm:flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setGridColumns('3')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  gridColumns === '3' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50' : 'text-slate-500 hover:text-white'
                }`}
                title="Mostrar en 3 Columnas"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridColumns('2')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  gridColumns === '2' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50' : 'text-slate-500 hover:text-white'
                }`}
                title="Mostrar en 2 Columnas"
              >
                <Grid2X2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenedor Cuadrícula Responsiva de Tarjetas Modulares */}
        <div className={`grid gap-5 items-stretch ${
          gridColumns === '2' 
            ? 'grid-cols-1 md:grid-cols-2' 
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          
          {/* Cuadrícula 1: LÓGICA DE TRANSICIÓN AUTOMÁTICA & ESCALÓN RADIACTIVO */}
          {(gridCategory === 'all' || gridCategory === 'transitions') && (
            <div className="p-4 rounded-2xl bg-[#070d18] border border-cyan-500/40 shadow-xl space-y-3 text-xs relative overflow-hidden flex flex-col justify-between hover:border-cyan-400 transition">
              <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                        Transición Automática
                      </span>
                      <span className="text-[11px] font-mono text-slate-300 font-semibold">
                        Salto Cuántico de Escalón
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setAutoBetaDecayEnabled(prev => !prev)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border transition flex items-center gap-1.5 shadow-sm cursor-pointer ${
                      autoBetaDecayEnabled 
                        ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                    title="Activa o pausa el salto cuántico automático al siguiente escalón radiactivo"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${autoBetaDecayEnabled ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`} />
                    <span>{autoBetaDecayEnabled ? 'ACTIVA' : 'PAUSADA'}</span>
                  </button>
                </div>

                {/* Diagnostic Box */}
                <div className={`p-3 rounded-xl border space-y-2 font-mono ${
                  autoDecayStep.isStable
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : autoDecayStep.decayType === 'gamma'
                    ? 'bg-purple-950/30 border-purple-500/50 text-purple-200'
                    : autoDecayStep.decayType === 'alpha'
                    ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                    : 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200'
                }`}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Estado de Estabilidad:</span>
                    <span className="font-bold flex items-center gap-1">
                      {autoDecayStep.isStable ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">ISÓTOPO ESTABLE</span>
                        </>
                      ) : (
                        <>
                          <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                          <span className="text-amber-300 uppercase">Inestable ({autoDecayStep.decayType.replace('_', ' ')})</span>
                        </>
                      )}
                    </span>
                  </div>

                  {autoDecayStep.isStable ? (
                    <div className="text-[11px] text-slate-300 font-sans leading-relaxed pt-1 border-t border-emerald-500/20">
                      ✨ <strong className="text-emerald-300">Equilibrio Cuántico:</strong> El isótopo se encuentra en el fondo del Valle de Estabilidad.
                    </div>
                  ) : (
                    <div className="space-y-1.5 pt-1 border-t border-slate-800 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Siguiente Escalón:</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          {autoDecayStep.decayType.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-300 font-sans leading-snug">
                        {autoDecayStep.reason}
                      </p>
                      <div className="text-[11px] text-cyan-300 bg-black/40 p-1.5 rounded border border-slate-800/80">
                        <EquationMath equation={autoDecayStep.equation} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Manual Immediate Transition Trigger */}
              {!autoDecayStep.isStable ? (
                <button
                  onClick={() => triggerNextDecayStep()}
                  className="w-full mt-3 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-200 border border-cyan-500/60 font-mono font-bold text-[11px] transition shadow flex items-center justify-between cursor-pointer active:scale-95"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-cyan-400 fill-current" />
                    <span>Saltar al Siguiente Escalón</span>
                  </div>
                  <span className="text-[10px] text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                    {autoDecayStep.decayType === 'alpha' && `Z=${atomicNumberZ}➔${atomicNumberZ - 2}`}
                    {autoDecayStep.decayType === 'beta_minus' && `Z=${atomicNumberZ}➔${atomicNumberZ + 1}`}
                    {autoDecayStep.decayType === 'beta_plus' && `Z=${atomicNumberZ}➔${atomicNumberZ - 1}`}
                    {autoDecayStep.decayType === 'gamma' && `Z=${atomicNumberZ}`}
                    {autoDecayStep.decayType === 'proton' && `Z=${atomicNumberZ}➔${atomicNumberZ - 1} (-1p)`}
                    {autoDecayStep.decayType === 'neutron' && `N=${neutronsN}➔${neutronsN - 1} (-1n)`}
                  </span>
                </button>
              ) : (
                <div className="mt-2 text-center text-[10.5px] text-emerald-400 font-mono">
                  ✓ No requiere transiciones (Núcleo en reposo)
                </div>
              )}
            </div>
          )}

          {/* Cuadrícula 2: RADAR DE ESTABILIDAD NUCLEAR D3.JS */}
          {(gridCategory === 'all' || gridCategory === 'stability') && (
            <div className="p-4 rounded-2xl bg-[#070d18] border border-slate-800 shadow-xl space-y-3 text-xs flex flex-col justify-between hover:border-cyan-500/40 transition">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                  Radar de Estabilidad (D3.js)
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Z={atomicNumberZ} / N={neutronsN}
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center min-h-[220px]">
                <StabilityRadarD3 atomicNumberZ={atomicNumberZ} neutronsN={neutronsN} />
              </div>

              <div className="text-[10.5px] text-slate-400 font-sans border-t border-slate-800/80 pt-2 text-center">
                Balance orbital entre repulsión Coulomb (+) y confinamiento fuerte (0).
              </div>
            </div>
          )}

          {/* Cuadrícula 3: EMISIÓN GAMMA INDEPENDIENTE */}
          {(gridCategory === 'all' || gridCategory === 'transitions') && (
            <div className="p-4 rounded-2xl bg-[#070d18] border border-purple-500/40 shadow-xl space-y-3.5 text-xs relative overflow-hidden flex flex-col justify-between hover:border-purple-400 transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs">
                    <Radio className="w-4 h-4 text-purple-400" />
                    <span>Emisión Gamma Independiente (γ)</span>
                  </div>
                  <button
                    onClick={() => setIsMetastableState(prev => !prev)}
                    className={`px-2 py-0.5 rounded text-[9.5px] font-mono border transition cursor-pointer ${
                      isMetastableState 
                        ? 'bg-purple-500/25 text-purple-200 border-purple-400 font-bold' 
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    Metaestable (m): {isMetastableState ? 'ACTIVO' : 'NO'}
                  </button>
                </div>

                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  Transición electromagnética pura (<span className="text-purple-300 font-mono">ΔZ = 0, ΔN = 0</span>). Solo ocurre en estados metaestables excitados o isómeros reconocidos (ej. <strong className="text-purple-300 font-mono">⁹⁹ᵐTc, ¹³⁷ᵐBa, ⁶⁰ᵐCo</strong>).
                </p>

                <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-[10.5px] font-mono text-slate-300 space-y-1">
                  <div className="text-purple-300 font-bold">Fotón Gamma Monoenergético:</div>
                  <div className="text-slate-400">
                    Energía cuántica de desexcitación: <strong className="text-white">{KNOWN_GAMMA_ISOMERS.find(iso => iso.z === atomicNumberZ && iso.n === neutronsN)?.energyKeV ?? 140.5} keV</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => triggerGammaDecay()}
                disabled={!isMetastableState && !KNOWN_GAMMA_ISOMERS.some(iso => iso.z === atomicNumberZ && iso.n === neutronsN)}
                className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between transition text-[11px] font-mono ${
                  isMetastableState || KNOWN_GAMMA_ISOMERS.some(iso => iso.z === atomicNumberZ && iso.n === neutronsN)
                    ? 'bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.3)] font-bold cursor-pointer'
                    : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
                  <span>Emitir Fotón Gamma (γ)</span>
                </div>
                <span className="text-[10px] text-purple-300 font-bold">
                  {KNOWN_GAMMA_ISOMERS.find(iso => iso.z === atomicNumberZ && iso.n === neutronsN)?.energyKeV ?? 140.5} keV
                </span>
              </button>
            </div>
          )}

          {/* Cuadrícula 4: CADENAS RADIACTIVAS DE REFERENCIA (PRESETS NATURALES) */}
          {(gridCategory === 'all' || gridCategory === 'controls') && (
            <div className="p-4 rounded-2xl bg-[#070d18] border border-amber-500/30 shadow-xl space-y-3 text-xs flex flex-col justify-between hover:border-amber-400 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                    Cadenas Radiactivas de Referencia
                  </span>
                  <span className="text-[9.5px] font-mono text-slate-500">Presets Naturales</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                  <button
                    onClick={() => {
                      setAtomicNumberZ(92);
                      setNeutronsN(146);
                      setAutoBetaDecayEnabled(true);
                    }}
                    className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-200 transition text-left cursor-pointer"
                  >
                    <span className="text-amber-400 font-bold block">☢️ Cadena U-238</span>
                    <span className="text-[9px] text-slate-400">²³⁸₉₂U ➔ ... ➔ ²⁰⁶₈₂Pb</span>
                  </button>

                  <button
                    onClick={() => {
                      setAtomicNumberZ(90);
                      setNeutronsN(142);
                      setAutoBetaDecayEnabled(true);
                    }}
                    className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-200 transition text-left cursor-pointer"
                  >
                    <span className="text-amber-400 font-bold block">☢️ Cadena Th-232</span>
                    <span className="text-[9px] text-slate-400">²³²₉₀Th ➔ ... ➔ ²⁰⁸₈₂Pb</span>
                  </button>

                  <button
                    onClick={() => {
                      setAtomicNumberZ(43);
                      setNeutronsN(56);
                      setIsMetastableState(true);
                    }}
                    className="p-2 rounded-lg bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/30 text-purple-200 transition text-left cursor-pointer"
                  >
                    <span className="text-purple-300 font-bold block">⚡ Isómero ⁹⁹ᵐTc</span>
                    <span className="text-[9px] text-slate-400">Gamma pura 140.5 keV</span>
                  </button>

                  <button
                    onClick={() => {
                      setAtomicNumberZ(26);
                      setNeutronsN(30);
                    }}
                    className="p-2 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-200 transition text-left cursor-pointer"
                  >
                    <span className="text-emerald-300 font-bold block">🛡️ Estable ⁵⁶Fe</span>
                    <span className="text-[9px] text-slate-400">Máxima ligadura</span>
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-mono border-t border-slate-800/80 pt-2 flex items-center justify-between">
                <span>Transmutación en cascada</span>
                <span className="text-amber-300">Desintegración α y β</span>
              </div>
            </div>
          )}

          {/* Cuadrícula 5: CONTROLES MANUALES POR PARTÍCULA */}
          {(gridCategory === 'all' || gridCategory === 'controls') && (
            <div className="p-4 rounded-2xl bg-[#070d18] border border-cyan-500/30 shadow-xl space-y-3 text-xs flex flex-col justify-between hover:border-cyan-400 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                    Controles Manuales por Partícula
                  </span>
                  <span className="text-[9.5px] font-mono text-slate-500">Paso Cuántico</span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <button
                    onClick={() => triggerAlphaFission()}
                    disabled={!decayChannels.alpha.canDecay}
                    title={decayChannels.alpha.reason}
                    className={`py-2 px-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                      decayChannels.alpha.canDecay
                        ? 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-200 border-amber-500/50 font-bold active:scale-95 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span>Emitir Alfa (α)</span>
                    <span className="text-[9.5px] text-amber-300">-2p,-2n</span>
                  </button>

                  <button
                    onClick={() => triggerAlphaCapture()}
                    disabled={atomicNumberZ + 2 > 118}
                    className={`py-2 px-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                      atomicNumberZ + 2 <= 118
                        ? 'bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 border-cyan-500/50 font-bold active:scale-95'
                        : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    <span>Captura Alfa (α)</span>
                    <span className="text-[9.5px] text-cyan-300">+2p,+2n</span>
                  </button>

                  <button
                    onClick={() => triggerBetaDecay('beta_minus')}
                    disabled={!decayChannels.betaMinus.canDecay}
                    title={decayChannels.betaMinus.reason}
                    className={`py-2 px-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                      decayChannels.betaMinus.canDecay
                        ? 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-200 border-amber-500/50 font-bold active:scale-95 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span>Beta Menos (β⁻)</span>
                    <span className="text-[9.5px] text-amber-300">+1p,-1n</span>
                  </button>

                  <button
                    onClick={() => triggerBetaDecay('beta_plus')}
                    disabled={!decayChannels.betaPlus.canDecay}
                    title={decayChannels.betaPlus.reason}
                    className={`py-2 px-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                      decayChannels.betaPlus.canDecay
                        ? 'bg-blue-950/40 hover:bg-blue-900/50 text-blue-200 border-blue-500/50 font-bold active:scale-95 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                        : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span>Beta Más (β⁺)</span>
                    <span className="text-[9.5px] text-blue-300">-1p,+1n</span>
                  </button>

                  {/* Gamma Transición Isomérica */}
                  <button
                    onClick={() => triggerGammaDecay()}
                    disabled={!decayChannels.gamma.canDecay}
                    title={decayChannels.gamma.reason}
                    className={`col-span-2 py-2 px-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                      decayChannels.gamma.canDecay
                        ? 'bg-purple-950/50 hover:bg-purple-900/60 text-purple-200 border-purple-500/60 font-bold active:scale-95 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                        : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Emisión Gamma (γ) Transición Isomérica</span>
                    </span>
                    <span className="text-[9.5px] text-purple-300">IT (ΔZ=0, ΔN=0)</span>
                  </button>

                  {/* Emisión de Protón (p) */}
                  <button
                    onClick={() => triggerProtonEmission()}
                    disabled={!decayChannels.protonEmission.canDecay}
                    title={decayChannels.protonEmission.reason}
                    className={`py-2 px-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                      decayChannels.protonEmission.canDecay
                        ? 'bg-red-950/40 hover:bg-red-900/50 text-red-200 border-red-500/50 font-bold active:scale-95 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                        : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span>Emitir Protón (p)</span>
                    <span className="text-[9.5px] text-red-300">-1p</span>
                  </button>

                  {/* Emisión de Neutrón (n) */}
                  <button
                    onClick={() => triggerNeutronEmission()}
                    disabled={!decayChannels.neutronEmission.canDecay}
                    title={decayChannels.neutronEmission.reason}
                    className={`py-2 px-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                      decayChannels.neutronEmission.canDecay
                        ? 'bg-blue-950/40 hover:bg-blue-900/50 text-blue-200 border-blue-500/50 font-bold active:scale-95 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                        : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span>Emitir Neutrón (n)</span>
                    <span className="text-[9.5px] text-blue-300">-1n</span>
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-mono border-t border-slate-800/80 pt-2 flex items-center justify-between">
                <span>Atajos: P (protón), N (neutrón), E (electrón)</span>
              </div>
            </div>
          )}

          {/* Cuadrícula 6: ESTABILIDAD NUCLEAR & VALLE DE ESTABILIDAD */}
          {(gridCategory === 'all' || gridCategory === 'stability') && (
            <div className="p-4 rounded-2xl bg-[#070d18] border border-emerald-500/30 shadow-xl space-y-3 text-xs flex flex-col justify-between hover:border-emerald-400 transition">
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                  Diagnóstico del Valle de Estabilidad
                </span>

                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${stability.dotColor} animate-pulse`} />
                  <span className="font-bold text-sm text-white font-sans">
                    {stability.status}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed font-sans text-[11.5px]">
                  {stability.description}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#040810] border border-slate-800 text-[11px] font-mono text-slate-400">
                El N más estable para Z={atomicNumberZ} es <strong className="text-cyan-300">{stability.optimalN}</strong>; tu núcleo cuenta con <strong className="text-white">{neutronsN}</strong> neutrones.
              </div>
            </div>
          )}

          {/* Cuadrícula 7: DINÁMICA DE ELECTRONES Y CORTEZA CUÁNTICA EN MOTOR FÍSICO 3D */}
          {(gridCategory === 'all' || gridCategory === 'controls') && (
            <div className="p-4 rounded-2xl bg-[#070d18] border border-cyan-500/40 shadow-xl space-y-3 text-xs flex flex-col justify-between hover:border-cyan-400 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                      Corteza Electrónica Cuántica
                    </span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-mono">
                    Motor Físico 3D
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#040810] border border-cyan-500/20 font-mono text-cyan-300 font-bold text-xs tracking-wider">
                  {currentElement.electronConfig || `[Corteza Z=${atomicNumberZ}]`}
                </div>

                <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                  Toda la física de la corteza (orbitales cuánticos 3D, principio de Aufbau, ondas de de Broglie, ionización y cambio de isótopos de la tabla periódica) se simula en el <strong>Motor Físico 3D</strong>.
                </p>

                <button
                  onClick={() => {
                    if (onLaunchPhysicsEngine) {
                      onLaunchPhysicsEngine(atomicNumberZ, neutronsN);
                    } else {
                      window.location.hash = `#/physics-engine?preset=bohr&z=${atomicNumberZ}&n=${neutronsN}`;
                    }
                  }}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 font-bold font-mono text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  <Atom className="w-4 h-4 text-cyan-400" />
                  <span>Simular {currentElement.symbol} en Motor Físico 3D</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-[#040810] border border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Estado Cuántico:</span>
                <span className="text-cyan-400 font-bold">Ver en Simulador</span>
              </div>
            </div>
          )}

          {/* Cuadrícula 8: BALANCE DE FUERZAS FUNDAMENTALES (COULOMB vs FUERZA FUERTE) */}
          {(gridCategory === 'all' || gridCategory === 'stability') && (
            <div className="p-4 rounded-2xl bg-[#070d18] border border-red-500/30 shadow-xl space-y-3 text-xs flex flex-col justify-between hover:border-red-400 transition">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold block">
                    Balance de Fuerzas Fundamentales
                  </span>
                  <span className="text-[9.5px] font-mono text-slate-500">Fe vs Fs</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono">
                  <div className="p-2 rounded-xl bg-red-950/20 border border-red-500/30">
                    <span className="text-red-400 font-bold block">Coulomb (Fe)</span>
                    <span className="text-[9.5px] text-slate-300">Repulsión p⁺ ↔ p⁺</span>
                    <div className="text-xs font-bold text-red-300 mt-1">
                      {atomicNumberZ > 1 ? `${(atomicNumberZ * (atomicNumberZ - 1) / 2)} pares (+)` : '0 pares (Z≤1)'}
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
                    <span className="text-cyan-400 font-bold block">Fuerza Fuerte (Fs)</span>
                    <span className="text-[9.5px] text-slate-300">Amortiguador n⁰</span>
                    <div className="text-xs font-bold text-cyan-300 mt-1">
                      N/Z: {(neutronsN / Math.max(1, atomicNumberZ)).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="text-[10.5px] text-slate-300 font-sans leading-snug">
                  Radio nuclear estimado: <strong className="text-cyan-300 font-mono">R ≈ {(1.2 * Math.cbrt(Math.max(1, massNumberA))).toFixed(2)} fm</strong>. Los neutrones actúan como espaciadores dieléctricos que impiden la divergencia infinita de repulsión electrostática.
                </div>
              </div>

              <div className="p-2 rounded-xl bg-[#040810] border border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Relación N/Z Óptima: {atomicNumberZ <= 20 ? '≈ 1.0' : '≈ 1.5'}</span>
                <span className={neutronsN >= atomicNumberZ ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {neutronsN >= atomicNumberZ ? 'Amortiguado' : 'Déficit N'}
                </span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Mini-HUD Flotante cuando el usuario se desplaza por la cuadrícula */}
      {isScrolledPastViewer && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#070d18]/95 backdrop-blur-md border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.35)] px-4 py-2 rounded-2xl flex items-center gap-3 text-xs font-mono animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              {currentElement.symbol}
            </div>
            <div>
              <div className="text-white font-bold flex items-center gap-2 leading-none">
                <span>{massNumberA}{currentElement.symbol} ({currentElement.name})</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${chargeColorClass}`}>{chargeLabel}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                <span>Z={atomicNumberZ}</span>
                <span>•</span>
                <span>N={neutronsN}</span>
                <span>•</span>
                <span>A={massNumberA}</span>
                <span>•</span>
                <span className={stability.status.includes('Estable') ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {stability.status}
                </span>
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 mx-1" />

          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            title="Volver arriba al Visor 3D"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Visor 3D</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SECCIÓN "IR A" (QUICK PRESETS) & "MODO DESAFÍO"                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* IR A (Presets) - 7 Cols */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#070d18] border border-slate-800 space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">
            IR A
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-left font-mono">
            {/* 1H Hidrógeno */}
            <button
              onClick={() => handleLoadPreset(1, 0, 1)}
              className="p-2.5 rounded-xl bg-[#040810] border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition group"
            >
              <div className="text-xs font-bold text-white group-hover:text-cyan-300">¹H</div>
              <div className="text-[10px] text-slate-400">Hidrógeno</div>
            </button>

            {/* α Partícula alfa */}
            <button
              onClick={() => handleLoadPreset(2, 2, 0)}
              className="p-2.5 rounded-xl bg-[#040810] border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition group"
            >
              <div className="text-xs font-bold text-white group-hover:text-cyan-300">α</div>
              <div className="text-[10px] text-slate-400">Partícula alfa</div>
            </button>

            {/* 14C Radiocarbono */}
            <button
              onClick={() => handleLoadPreset(6, 8, 6)}
              className="p-2.5 rounded-xl bg-[#040810] border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition group"
            >
              <div className="text-xs font-bold text-white group-hover:text-cyan-300">¹⁴C</div>
              <div className="text-[10px] text-slate-400">Radiocarbono</div>
            </button>

            {/* O2- Ion óxido */}
            <button
              onClick={() => handleLoadPreset(8, 8, 10)}
              className="p-2.5 rounded-xl bg-[#040810] border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition group"
            >
              <div className="text-xs font-bold text-white group-hover:text-cyan-300">O²⁻</div>
              <div className="text-[10px] text-slate-400">Ion óxido</div>
            </button>

            {/* 20Ne Neón */}
            <button
              onClick={() => handleLoadPreset(10, 10, 10)}
              className="p-2.5 rounded-xl bg-[#040810] border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition group"
            >
              <div className="text-xs font-bold text-white group-hover:text-cyan-300">²⁰Ne</div>
              <div className="text-[10px] text-slate-400">Neón (Z=10, N=10)</div>
            </button>

            {/* Na+ Ion sodio */}
            <button
              onClick={() => handleLoadPreset(11, 12, 10)}
              className="p-2.5 rounded-xl bg-[#040810] border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition group"
            >
              <div className="text-xs font-bold text-white group-hover:text-cyan-300">Na⁺</div>
              <div className="text-[10px] text-slate-400">Ion sodio</div>
            </button>

            {/* 56Fe Más ligado */}
            <button
              onClick={() => handleLoadPreset(26, 30, 26)}
              className="p-2.5 rounded-xl bg-[#040810] border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition group"
            >
              <div className="text-xs font-bold text-white group-hover:text-cyan-300">⁵⁶Fe</div>
              <div className="text-[10px] text-slate-400">Más ligado</div>
            </button>

            {/* 197Au Oro */}
            <button
              onClick={() => handleLoadPreset(79, 118, 79)}
              className="p-2.5 rounded-xl bg-[#040810] border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition group"
            >
              <div className="text-xs font-bold text-white group-hover:text-cyan-300">¹⁹⁷Au</div>
              <div className="text-[10px] text-slate-400">Oro</div>
            </button>

            {/* 235U Fisible */}
            <button
              onClick={() => handleLoadPreset(92, 143, 92)}
              className="p-2.5 rounded-xl bg-[#040810] border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition group"
            >
              <div className="text-xs font-bold text-white group-hover:text-cyan-300">²³⁵U</div>
              <div className="text-[10px] text-slate-400">Fisible</div>
            </button>

            {/* 294Og Más pesado */}
            <button
              onClick={() => handleLoadPreset(118, 176, 118)}
              className="p-2.5 rounded-xl bg-[#040810] border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition group"
            >
              <div className="text-xs font-bold text-white group-hover:text-cyan-300">²⁹⁴Og</div>
              <div className="text-[10px] text-slate-400">Más pesado</div>
            </button>
          </div>
        </div>

        {/* MODO DESAFÍO - 5 Cols */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#070d18] border border-slate-800 flex flex-col justify-between relative overflow-hidden">
          
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                MODO DESAFÍO
              </span>
              <div className="flex items-center gap-3 text-cyan-400">
                <span>PUNTUACIÓN <strong className="text-white">{score}</strong></span>
                <span>RACHA <strong className="text-white">{streak}</strong></span>
              </div>
            </div>

            {!isChallengeMode ? (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white font-sans">
                  El modo desafío está desactivado.
                </h3>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Actívalo para resolver doce rompecabezas de construcción de nucleidos que desbloquean especímenes en la Biblioteca Científica.
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => setIsChallengeMode(true)}
                    className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold text-xs transition shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95"
                  >
                    Comenzar desafíos
                  </button>
                  <button
                    onClick={() => {
                      setCurrentMissionIndex((prev) => (prev + 1) % ATOM_MISSIONS.length);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-mono text-xs border border-slate-800 transition"
                  >
                    Omitir
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                    Misión {currentMission.id} de 12
                  </span>
                  <button
                    onClick={() => setIsChallengeMode(false)}
                    className="text-[10px] text-slate-400 hover:text-white underline font-mono"
                  >
                    Desactivar desafíos
                  </button>
                </div>

                <h3 className="text-sm font-bold text-white font-sans">
                  {currentMission.title}
                </h3>
                <p className="text-xs text-cyan-200 font-sans leading-relaxed">
                  {currentMission.targetDescription}
                </p>

                {/* Progress Checklist */}
                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-1">
                  <div className={`p-2 rounded-lg border text-center ${
                    atomicNumberZ === currentMission.targetZ 
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                    <div>Protones</div>
                    <div className="font-bold text-xs mt-0.5">{atomicNumberZ} / {currentMission.targetZ}</div>
                  </div>

                  <div className={`p-2 rounded-lg border text-center ${
                    neutronsN === currentMission.targetN 
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                    <div>Neutrones</div>
                    <div className="font-bold text-xs mt-0.5">{neutronsN} / {currentMission.targetN}</div>
                  </div>

                  <div className={`p-2 rounded-lg border text-center ${
                    massNumberA === (currentMission.targetZ + currentMission.targetN)
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                    <div>N.º Másico A</div>
                    <div className="font-bold text-xs mt-0.5">{massNumberA} / {currentMission.targetZ + currentMission.targetN}</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-sans italic">
                  Pista: {currentMission.hint}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentMissionIndex(prev => (prev + 1) % ATOM_MISSIONS.length)}
                    className="text-[11px] font-mono text-slate-400 hover:text-white underline"
                  >
                    Saltar a siguiente misión
                  </button>

                  <button
                    onClick={() => setShowLibraryModal(true)}
                    className="text-[11px] font-mono text-amber-300 hover:text-white flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ver Biblioteca ({libraryItems.length})</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Toast Notification when mission is passed and library is updated */}
          {missionCompletedToast && (
            <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-emerald-950/90 to-cyan-950/90 border border-emerald-500/50 text-xs font-mono text-emerald-200 flex items-center gap-2.5 animate-in slide-in-from-bottom duration-300">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
              <span>{missionCompletedToast}</span>
            </div>
          )}

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. SECCIÓN "QUÉ ESTÁS OBSERVANDO"                                         */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-4 border-t border-slate-800/80">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block mb-1">
            — QUÉ ESTÁS OBSERVANDO
          </span>
          <h2 className="text-2xl font-bold text-white font-sans tracking-tight">
            Tres partículas, y todo lo que deciden
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Protones */}
          <div className="p-5 rounded-2xl bg-[#070d18] border border-slate-800 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500" />
            </div>

            <h3 className="text-sm font-bold text-white font-sans">
              Los protones deciden <em className="italic font-normal">qué</em> es
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              El número de protones — el número atómico, Z — <strong className="text-white">es</strong> el elemento. Seis protones son carbono, y nada más puede ser carbono. Cambia Z y transmutas el elemento.
            </p>
          </div>

          {/* Card 2: Neutrones */}
          <div className="p-5 rounded-2xl bg-[#070d18] border border-slate-800 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.2)]">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-500" />
            </div>

            <h3 className="text-sm font-bold text-white font-sans">
              Los neutrones deciden cuánto dura
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Aportan masa y fuerza fuerte sin añadir repulsión. Si hay desequilibrio de neutrones o protones, la inestabilidad provoca la <strong className="text-white">desintegración beta</strong> buscando el valle de estabilidad.
            </p>
          </div>

          {/* Card 3: Ley Universal de Repulsión de Coulomb & Amortiguador Neutrónico */}
          <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>

            <h3 className="text-sm font-bold text-white font-sans">
              Repulsión de Coulomb y espacio nuclear
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Por ley universal (<span className="font-mono text-cyan-300">F = k·q₁·q₂/r²</span>), dos protones (+1e) en el mismo punto se repelen con fuerza infinita. Requieren espacio físico y <strong className="text-cyan-300">neutrones intermedios</strong> que amortiguan la carga y los mantienen ligados.
            </p>
          </div>

          {/* Card 4: Electrones */}
          <div className="p-5 rounded-2xl bg-[#070d18] border border-slate-800 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <span className="w-3.5 h-3.5 rounded-full bg-cyan-400" />
            </div>

            <h3 className="text-sm font-bold text-white font-sans">
              Los electrones deciden cómo interactúa
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              La química es gobernada por la nube electrónica. Los electrones están limitados cuánticamente por las subcapas (1s, 2s, 2p, 3s) y la afinidad electrónica de cada núcleo.
            </p>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. SECCIÓN "LOS 5 PRINCIPIOS REALES DE LA VISUALIZACIÓN CUÁNTICA"         */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-6 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">
              — GUÍA TÉCNICA DE PRECISIÓN • FÍSICA & QUÍMICA CUÁNTICA
            </span>
            <h2 className="text-2xl font-bold text-white font-sans tracking-tight flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>Los 5 Principios Reales de la Visualización Cuántica</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Cómo eliminar las simplificaciones inexactas (como las órbitas planetarias de Bohr) y estructurar prompts técnicos y simulaciones que reflejen fielmente la función de onda cuadrática <span className="font-mono text-cyan-300">|ψ|²</span>, la geometría real de orbitales (s, p, d) y la escala nuclear fidedigna.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPrinciplesGuide(true)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold transition flex items-center gap-1.5 shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Abrir Manual Completo</span>
            </button>
          </div>
        </div>

        {/* 5 Principles Grid + Generated Asset Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Scientific Image Card (5 Cols) */}
          <div className="lg:col-span-5 bg-[#03060d] border border-cyan-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative group">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  Simulación Cuántica de Referencia
                </span>
                <span className="text-[10px] font-mono text-slate-500">|ψ|²</span>
              </div>

              <div 
                onClick={() => setShowImagePreviewModal(true)}
                className="relative rounded-xl overflow-hidden border border-slate-800 cursor-pointer group/img"
              >
                <img 
                  src={quantumAtomVisual} 
                  alt="Simulación científica de precisión del átomo con nubes cuánticas de probabilidad |ψ|²"
                  className="w-full h-52 object-cover object-center group-hover/img:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover/img:opacity-50 transition-opacity" />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-mono text-white">
                  <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur">Orbitales 1s, 2s & 2p (x, y, z)</span>
                  <span className="p-1 rounded bg-black/60 text-cyan-300 hover:text-white"><Maximize2 className="w-3.5 h-3.5" /></span>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-300 font-sans leading-relaxed">
                Observe cómo el núcleo es un punto denso y compacto en el centro, envuelto orgánicamente por la nube esférica (1s, 2s) y los lóbulos en mancuerna orientados en los ejes X, Y y Z (2p).
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-slate-400">Prompts de Precisión Técnica</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const promptEn = "Generate a scientifically accurate scientific visualization of the atom. Replace all discrete, Bohr-model-style planetary orbits and point-like electrons with volumetric, translucent quantum probability clouds. The visual density of these clouds must represent |ψ|², showing where electrons are most likely to be found. Include layered s-orbitals and lobe-shaped p-orbitals, overlapping organically around the central nucleus. The nucleus should be a dense, small cluster of protons and neutrons (spheres), but significantly smaller relative to the electron cloud than in image_0.png. Use a black void background with soft, diffused depth-of-field effects for the orbitals. The aesthetic should be precision scientific simulation, not a cartoon.";
                    navigator.clipboard.writeText(promptEn);
                    setCopiedPromptLang('en');
                    setTimeout(() => setCopiedPromptLang(null), 2500);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 hover:text-white transition flex items-center gap-1"
                >
                  <Copy className="w-3 h-3 text-cyan-400" />
                  <span>{copiedPromptLang === 'en' ? '¡Copiado!' : 'Prompt EN'}</span>
                </button>

                <button
                  onClick={() => {
                    const promptEs = "Genera una visualización científica y científicamente precisa del átomo. Reemplaza todas las órbitas planetarias discretas del estilo del modelo de Bohr y los electrones puntuales por nubes de probabilidad cuántica volumétricas y translúcidas. La densidad visual de estas nubes debe representar |ψ|², mostrando dónde es más probable encontrar los electrones. Incluye orbitales s en capas y orbitales p con forma de lóbulos, superponiéndose orgánicamente alrededor del núcleo central. El núcleo debe ser un cúmulo denso y pequeño de protones y neutrones (esferas), pero significativamente más pequeño en relación con la nube de electrones. Usa un fondo de vacío negro con efectos de profundidad de campo suaves y difusos para los orbitales. La estética debe ser de simulación científica de precisión, no una caricatura.";
                    navigator.clipboard.writeText(promptEs);
                    setCopiedPromptLang('es');
                    setTimeout(() => setCopiedPromptLang(null), 2500);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-200 hover:text-white transition flex items-center gap-1"
                >
                  <Copy className="w-3 h-3 text-cyan-400" />
                  <span>{copiedPromptLang === 'es' ? '¡Copiado!' : 'Prompt ES'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* The 5 Principles List (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Principle 1 */}
            <div className="p-3.5 rounded-xl bg-[#070d18] border border-slate-800/80 hover:border-cyan-500/40 transition">
              <div className="flex items-center gap-2 font-mono text-xs text-cyan-300 font-bold mb-1">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-[11px]">1</span>
                <span>Reemplazar "Órbitas" por "Nubes de Probabilidad" u "Orbitales"</span>
              </div>
              <p className="text-[11.5px] text-slate-300 font-sans leading-relaxed pl-7">
                Prohibir círculos, elipses finos o anillos planetarios. Los electrones no siguen trayectorias deterministas newtonianas; están descritos por el principio de incertidumbre de Heisenberg (Δx · Δp ≥ ℏ/2). Términos obligatorios: <em className="text-white">"Probability clouds"</em>, <em className="text-white">"Atomic orbitals"</em>, <em className="text-white">"Electron density volumes"</em>.
              </p>
            </div>

            {/* Principle 2 */}
            <div className="p-3.5 rounded-xl bg-[#070d18] border border-slate-800/80 hover:border-teal-500/40 transition">
              <div className="flex items-center gap-2 font-mono text-xs text-teal-300 font-bold mb-1">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-[11px]">2</span>
                <span>Definir la Textura y Translucidez (|ψ|²)</span>
              </div>
              <p className="text-[11.5px] text-slate-300 font-sans leading-relaxed pl-7">
                Los electrones no son esferas sólidas puntuales. El brillo y la densidad luminosa representan la probabilidad volumétrica |ψ|². Términos clave: <em className="text-white">"Volumetric translucency"</em>, <em className="text-white">"Diffused gas luminescence"</em>, <em className="text-white">"Brightness represents probability density"</em>, <em className="text-white">"No sharp edges"</em>.
              </p>
            </div>

            {/* Principle 3 */}
            <div className="p-3.5 rounded-xl bg-[#070d18] border border-slate-800/80 hover:border-purple-500/40 transition">
              <div className="flex items-center gap-2 font-mono text-xs text-purple-300 font-bold mb-1">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-[11px]">3</span>
                <span>Especificar la Forma de los Orbitales (s, p, d)</span>
              </div>
              <p className="text-[11.5px] text-slate-300 font-sans leading-relaxed pl-7">
                Un átomo real no es una sola esfera difusa. Combina orbitales esféricos con nodos radiales (s) y lóbulos perpendiculares en mancuerna (2pₓ, 2pᵧ, 2p_z) que se interpenetran orgánicamente alrededor del núcleo: <em className="text-white">"Overlapping s and lobe-shaped dumbbell p-orbitals"</em>.
              </p>
            </div>

            {/* Principle 4 */}
            <div className="p-3.5 rounded-xl bg-[#070d18] border border-slate-800/80 hover:border-amber-500/40 transition">
              <div className="flex items-center gap-2 font-mono text-xs text-amber-300 font-bold mb-1">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-[11px]">4</span>
                <span>Corregir la Escala Relativa Núcleo-Nube</span>
              </div>
              <p className="text-[11.5px] text-slate-300 font-sans leading-relaxed pl-7">
                En los diagramas de primaria el núcleo ocupa el 50% del volumen. En la física real, el radio del núcleo (~10⁻¹⁵ m) es miles de veces menor que el radio atómico (~10⁻¹⁰ m). El núcleo debe ser un cúmulo denso, compacto y mucho más pequeño en relación con el volumen total de la nube.
              </p>
            </div>

            {/* Principle 5 */}
            <div className="p-3.5 rounded-xl bg-[#070d18] border border-slate-800/80 hover:border-rose-500/40 transition">
              <div className="flex items-center gap-2 font-mono text-xs text-rose-300 font-bold mb-1">
                <span className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 text-[11px]">5</span>
                <span>Definir la Estética: Simulación de Vacío Cuántico vs Caricatura</span>
              </div>
              <p className="text-[11.5px] text-slate-300 font-sans leading-relaxed pl-7">
                Guiar a la IA lejos de la estética de cómic escolar. Términos clave: <em className="text-white">"Precision scientific simulation"</em>, <em className="text-white">"Black void background"</em>, <em className="text-white">"Volumetric wave-function data rendering"</em>, <em className="text-white">"Soft chromatic depth of field"</em>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. SECCIÓN "EL VEREDICTO DE ESTABILIDAD" & EL VALLE DE ESTABILIDAD         */}
      {/* ========================================================================= */}
      <div className="pt-4 border-t border-slate-800/80">
        <ValleyOfStabilityChart
          currentZ={atomicNumberZ}
          currentN={neutronsN}
          elementSymbol={currentElement.symbol}
        />
      </div>

      {/* ========================================================================= */}
      {/* 7. MODAL DETALLADO DE LOS 5 PRINCIPIOS CUÁNTICOS                          */}
      {/* ========================================================================= */}
      {showPrinciplesGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-4xl bg-[#070c14] border border-cyan-500/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">
                    Manual de Visualización Científica Cuántica Fidedigna
                  </h3>
                  <p className="text-xs text-slate-400">
                    Directrices para eliminar simplificaciones obsoletas y formular prompts para IAs generativas
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPrinciplesGuide(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin text-xs font-sans text-slate-200">
              {/* Comparison table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
                  <h4 className="font-mono font-bold text-rose-300 text-sm mb-2 flex items-center gap-1.5">
                    <X className="w-4 h-4 text-rose-400" />
                    <span>Inexactitudes Tradicionales (Modelo Bohr / Caricatura)</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-300 text-[11.5px] list-disc list-inside">
                    <li>Órbitas elípticas o circulares fijas (anillos coplanares).</li>
                    <li>Electrones como esferas sólidas girando en carriles fijos.</li>
                    <li>Núcleo gigante que ocupa hasta el 50% de la escena.</li>
                    <li>Fondo claro o plano sin atmósfera de vacío cuántico.</li>
                    <li>Omisión de los números cuánticos secundarios y magnéticos (l, mₗ).</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
                  <h4 className="font-mono font-bold text-cyan-300 text-sm mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Precisión Científica Real (Mecánica Cuántica)</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-300 text-[11.5px] list-disc list-inside">
                    <li>Nubes de densidad de probabilidad continua proporcional a |ψ|².</li>
                    <li>Superposición de orbitales s (esféricos con nodos) y p (lóbulos dumbbell en X, Y, Z).</li>
                    <li>Núcleo compacto, denso y miles de veces menor que la nube.</li>
                    <li>Profundidad de campo suave y luminiscencia en vacío negro cósmico.</li>
                    <li>Cumplimiento estricto del Principio de Exclusión de Pauli y regla de Hund.</li>
                  </ul>
                </div>
              </div>

              {/* Prompts section */}
              <div className="p-4 rounded-xl bg-[#040810] border border-slate-800 space-y-3">
                <h4 className="font-mono font-bold text-white text-sm flex items-center justify-between">
                  <span>Comandos Estructurados para Generación en IA</span>
                  <span className="text-[10px] text-cyan-400 font-normal">Listo para copiar y ejecutar</span>
                </h4>

                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-black/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="font-bold text-cyan-300">Versión en Inglés (Recomendada para Midjourney / Imagen / Flux / Stable Diffusion)</span>
                      <button
                        onClick={() => {
                          const promptEn = "Generate a scientifically accurate scientific visualization of the atom. Replace all discrete, Bohr-model-style planetary orbits and point-like electrons with volumetric, translucent quantum probability clouds. The visual density of these clouds must represent |ψ|², showing where electrons are most likely to be found. Include layered s-orbitals and lobe-shaped p-orbitals, overlapping organically around the central nucleus. The nucleus should be a dense, small cluster of protons and neutrons (spheres), but significantly smaller relative to the electron cloud than in image_0.png. Use a black void background with soft, diffused depth-of-field effects for the orbitals. The aesthetic should be precision scientific simulation, not a cartoon.";
                          navigator.clipboard.writeText(promptEn);
                          setCopiedPromptLang('en');
                          setTimeout(() => setCopiedPromptLang(null), 2500);
                        }}
                        className="px-2 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[10px] transition flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedPromptLang === 'en' ? '¡Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] font-mono text-slate-300 leading-relaxed italic bg-slate-950 p-2 rounded">
                      "Generate a scientifically accurate scientific visualization of the atom. Replace all discrete, Bohr-model-style planetary orbits and point-like electrons with volumetric, translucent quantum probability clouds. The visual density of these clouds must represent |ψ|², showing where electrons are most likely to be found. Include layered s-orbitals and lobe-shaped p-orbitals, overlapping organically around the central nucleus. The nucleus should be a dense, small cluster of protons and neutrons (spheres), but significantly smaller relative to the electron cloud than in image_0.png. Use a black void background with soft, diffused depth-of-field effects for the orbitals. The aesthetic should be precision scientific simulation, not a cartoon."
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-black/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="font-bold text-amber-300">Versión en Español</span>
                      <button
                        onClick={() => {
                          const promptEs = "Genera una visualización científica y científicamente precisa del átomo. Reemplaza todas las órbitas planetarias discretas del estilo del modelo de Bohr y los electrones puntuales por nubes de probabilidad cuántica volumétricas y translúcidas. La densidad visual de estas nubes debe representar |ψ|², mostrando dónde es más probable encontrar los electrones. Incluye orbitales s en capas y orbitales p con forma de lóbulos, superponiéndose orgánicamente alrededor del núcleo central. El núcleo debe ser un cúmulo denso y pequeño de protones y neutrones (esferas), pero significativamente más pequeño en relación con la nube de electrones. Usa un fondo de vacío negro con efectos de profundidad de campo suaves y difusos para los orbitales. La estética debe ser de simulación científica de precisión, no una caricatura.";
                          navigator.clipboard.writeText(promptEs);
                          setCopiedPromptLang('es');
                          setTimeout(() => setCopiedPromptLang(null), 2500);
                        }}
                        className="px-2 py-0.5 rounded bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-[10px] transition flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedPromptLang === 'es' ? '¡Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] font-mono text-slate-300 leading-relaxed italic bg-slate-950 p-2 rounded">
                      "Genera una visualización científica y científicamente precisa del átomo. Reemplaza todas las órbitas planetarias discretas del estilo del modelo de Bohr y los electrones puntuales por nubes de probabilidad cuántica volumétricas y translúcidas. La densidad visual de estas nubes debe representar |ψ|², mostrando dónde es más probable encontrar los electrones. Incluye orbitales s en capas y orbitales p con forma de lóbulos, superponiéndose orgánicamente alrededor del núcleo central. El núcleo debe ser un cúmulo denso y pequeño de protones y neutrones (esferas), pero significativamente más pequeño en relación con la nube de electrones. Usa un fondo de vacío negro con efectos de profundidad de campo suaves y difusos para los orbitales. La estética debe ser de simulación científica de precisión, no una caricatura."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowPrinciplesGuide(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-semibold"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL LIGHTBOX PARA LA IMAGEN CIENTÍFICA DE ALTA RESOLUCIÓN            */}
      {/* ========================================================================= */}
      {showImagePreviewModal && (
        <div 
          onClick={() => setShowImagePreviewModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in cursor-zoom-out"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl w-full bg-[#050912] border border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl relative"
          >
            <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Visualización Científica Cuántica de Precisión • Nubes de Densidad |ψ|²</span>
              </div>
              <button
                onClick={() => setShowImagePreviewModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img 
              src={quantumAtomVisual} 
              alt="Simulación científica del átomo con nubes cuánticas de probabilidad"
              className="w-full h-auto max-h-[75vh] object-contain bg-black"
            />
            <div className="p-3 bg-[#080d16] border-t border-slate-800 text-[11px] font-mono text-slate-300 flex items-center justify-between">
              <span>Orbitales s esféricos concéntricos, orbitales p lobulares (px, py, pz) & núcleo a escala real</span>
              <span className="text-cyan-400">Generado con los 5 Principios Reales</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL DE BIBLIOTECA CIENTÍFICA ACTUALIZADA                             */}
      {/* ========================================================================= */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#070c14] border border-amber-500/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(245,158,11,0.2)] space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    Biblioteca de Nucleidos Descubiertos en el Constructor 3D
                  </h3>
                  <p className="text-xs text-slate-400">
                    {libraryItems.length} nucleidos registrados en tu base de datos científica
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowLibraryModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {libraryItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold flex items-center justify-center text-sm">
                      {item.symbol}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs font-mono">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-sans">
                        Z={item.z} • N={item.n} • e⁻={item.electrons} • N.º Másico: {item.massNumber}
                      </p>
                      {item.missionSource && (
                        <span className="text-[10px] text-amber-400/80 font-mono block mt-0.5">
                          🏆 {item.missionSource}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-slate-800 text-slate-300 border-slate-700">
                      {item.chargeLabel}
                    </span>
                    <button
                      onClick={() => {
                        handleLoadPreset(item.z, item.n, item.electrons);
                        setShowLibraryModal(false);
                      }}
                      className="block text-[11px] font-mono text-cyan-400 hover:underline mt-1.5"
                    >
                      Cargar en 3D ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowLibraryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-semibold"
              >
                Cerrar Biblioteca
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
