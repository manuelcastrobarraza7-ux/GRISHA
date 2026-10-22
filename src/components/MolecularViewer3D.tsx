import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { MoleculeData, MoleculeAtom, MoleculeBond } from '../data/molecularDatabase';
import { 
  RotateCw, 
  RotateCcw, 
  Eye, 
  Layers, 
  Sparkles, 
  Activity, 
  Maximize2, 
  Minimize2, 
  Compass, 
  Info, 
  Check, 
  Sliders, 
  ChevronUp, 
  ChevronDown,
  Volume2,
  VolumeX,
  Gauge,
  Flame,
  Zap,
  Box
} from 'lucide-react';

export type RenderMode3D = 'ball_stick' | 'spacefill' | 'wireframe';

interface MolecularViewer3DProps {
  molecule: MoleculeData;
  initialRenderMode?: RenderMode3D;
  onSelectAtom?: (atom: MoleculeAtom | null) => void;
}

export const MolecularViewer3D: React.FC<MolecularViewer3DProps> = ({
  molecule,
  initialRenderMode = 'ball_stick',
  onSelectAtom,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // UI state
  const [renderMode, setRenderMode] = useState<RenderMode3D>(initialRenderMode);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [autoRotateSpeed, setAutoRotateSpeed] = useState<number>(1.2);
  const [thermalVibration, setThermalVibration] = useState<boolean>(false);
  const [vibrationIntensity, setVibrationIntensity] = useState<number>(0.08);
  const [explosionFactor, setExplosionFactor] = useState<number>(1.0); // 1.0 = normal, 2.0 = exploded
  const [showElectrostaticAura, setShowElectrostaticAura] = useState<boolean>(true);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hoveredAtom, setHoveredAtom] = useState<MoleculeAtom | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Toggle fullscreen mode (with HTML5 API + CSS fallback)
  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    if (!isFullscreen) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Sync fullscreen state with document and keyboard shortcuts
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
      if ((e.key === 'f' || e.key === 'F') && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
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

  // Trigger resize on fullscreen toggle so Three.js camera adapts instantly
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 80);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // Measurement mode (click 2 atoms for distance, 3 for angle)
  const [measurementMode, setMeasurementMode] = useState<boolean>(false);
  const [measuredAtoms, setMeasuredAtoms] = useState<MoleculeAtom[]>([]);
  const [measurementResult, setMeasurementResult] = useState<string | null>(null);

  // Scene references for React loop isolation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const moleculeGroupRef = useRef<THREE.Group | null>(null);
  const atomMeshesRef = useRef<{ atom: MoleculeAtom; mesh: THREE.Mesh; haloMesh?: THREE.Mesh; basePos: THREE.Vector3 }[]>([]);
  const bondMeshesRef = useRef<{ bond: MoleculeBond; mesh: THREE.Object3D; fromAtomId: string; toAtomId: string }[]>([]);
  const measurementLineRef = useRef<THREE.Line | null>(null);

  // Software WebGL probe
  const isSoftwareGl = useMemo(() => {
    if (typeof document === 'undefined') return true;
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  }, []);

  // Center of mass / centroid of molecule
  const centroid = useMemo(() => {
    if (molecule.atoms.length === 0) return new THREE.Vector3(0, 0, 0);
    let x = 0, y = 0, z = 0;
    molecule.atoms.forEach(a => {
      x += a.x3d;
      y += a.y3d;
      z += a.z3d;
    });
    return new THREE.Vector3(x / molecule.atoms.length, y / molecule.atoms.length, z / molecule.atoms.length);
  }, [molecule]);

  /* ========================================================================= */
  /* THREE.JS SCENE INITIALIZATION (RUNS ONCE ON MOUNT)                        */
  /* ========================================================================= */
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070c14);
    scene.fog = new THREE.FogExp2(0x070c14, 0.035);
    sceneRef.current = scene;

    // 2. Camera setup
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 9);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // 4. Studio Environment map (RoomEnvironment PMREM)
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch (e) {
      console.warn('RoomEnvironment fallback', e);
    }

    // 5. Studio Lighting Rig (3-point warm key + cool fill + rim)
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.2);
    keyLight.position.set(6, 10, 8);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.shadow && !isSoftwareGl) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x1e293b, 1.4);
    hemiLight.position.set(0, 15, 0);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    rimLight.position.set(-8, -4, -6);
    scene.add(rimLight);

    // 6. Ground soft contact shadow disc
    const shadowGeo = new THREE.PlaneGeometry(16, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -3.2;
    scene.add(shadowPlane);

    // 7. Subtle orientation grid on the floor
    const grid = new THREE.GridHelper(14, 20, 0x0284c7, 0x1e293b);
    grid.position.y = -3.19;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.25;
    scene.add(grid);

    // 8. OrbitControls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 24;
    controls.minDistance = 2;
    controlsRef.current = controls;

    // 9. Root Molecule Group
    const molGroup = new THREE.Group();
    scene.add(molGroup);
    moleculeGroupRef.current = molGroup;

    // 10. Animation Loop (Paced for software WebGL)
    let animationFrameId = 0;
    let clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          animationFrameId = window.setTimeout(poll, 6);
        } else {
          gl.deleteSync(sync);
          animationFrameId = window.setTimeout(cb, 60);
        }
      };
      animationFrameId = window.setTimeout(poll, 6);
    }

    const animate = () => {
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Auto rotation
      if (molGroup && autoRotate) {
        molGroup.rotation.y += delta * 0.35 * autoRotateSpeed;
      }

      // Thermal vibration harmonic oscillation
      if (thermalVibration && atomMeshesRef.current.length > 0) {
        atomMeshesRef.current.forEach(({ mesh, basePos }, i) => {
          const freq = 6.0 + (i % 3) * 1.5;
          const amp = vibrationIntensity * 0.5;
          const dx = Math.sin(elapsedTime * freq + i * 1.1) * amp;
          const dy = Math.cos(elapsedTime * freq * 1.2 + i * 0.9) * amp;
          const dz = Math.sin(elapsedTime * freq * 0.8 + i * 1.5) * amp;
          mesh.position.set(basePos.x + dx, basePos.y + dy, basePos.z + dz);
        });
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(animate);
      } else {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();

    // 11. Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isSoftwareGl]);

  /* ========================================================================= */
  /* REBUILD 3D MOLECULE GEOMETRY WHEN MOLECULE OR RENDER MODE CHANGES        */
  /* ========================================================================= */
  useEffect(() => {
    const molGroup = moleculeGroupRef.current;
    if (!molGroup) return;

    // Clear previous children
    while (molGroup.children.length > 0) {
      const obj = molGroup.children[0];
      molGroup.remove(obj);
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
      if ((obj as THREE.Mesh).material) {
        const mat = (obj as THREE.Mesh).material;
        if (Array.isArray(mat)) mat.forEach(m => m.dispose());
        else (mat as THREE.Material).dispose();
      }
    }

    atomMeshesRef.current = [];
    bondMeshesRef.current = [];

    // Scale factor for 3D coordinates so the molecule fills the camera view nicely
    const scale = 1.0;
    const cent = centroid;

    // Map to lookup computed positions
    const atomPosMap = new Map<string, THREE.Vector3>();

    // 1. BUILD ATOMS
    molecule.atoms.forEach((atom) => {
      // Base centered position with optional explosion separation
      const origPos = new THREE.Vector3(
        (atom.x3d - cent.x) * scale,
        (atom.y3d - cent.y) * scale,
        (atom.z3d - cent.z) * scale
      );

      // Radial displacement for explosion factor
      const direction = origPos.clone().normalize();
      const distance = origPos.length();
      const finalPos = direction.multiplyScalar(distance * explosionFactor);
      atomPosMap.set(atom.id, finalPos);

      // Determine radius based on render mode
      let radius = 0.38;
      if (renderMode === 'spacefill') {
        // Real van der Waals relative radius in Angstroms (~1.2 Å to ~2.2 Å) scaled down for scene
        radius = (atom.radiusVdw / 100) * 0.58;
      } else if (renderMode === 'ball_stick') {
        radius = atom.symbol === 'H' ? 0.22 : 0.38;
        if (atom.symbol === 'Na' || atom.symbol === 'K' || atom.symbol === 'Ca' || atom.symbol === 'Cu') {
          radius = 0.48; // Metals
        }
      } else {
        // Wireframe / stick centroid marker
        radius = 0.12;
      }

      // Sphere geometry
      const sphereGeo = new THREE.SphereGeometry(radius, renderMode === 'spacefill' ? 32 : 24, renderMode === 'spacefill' ? 24 : 18);
      
      // PBR Material with metallic luster and specular highlight
      const sphereMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(atom.color),
        roughness: atom.symbol === 'C' ? 0.45 : 0.25,
        metalness: atom.symbol === 'Na' || atom.symbol === 'Ca' || atom.symbol === 'Cu' ? 0.55 : 0.15,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
      });

      const atomMesh = new THREE.Mesh(sphereGeo, sphereMat);
      atomMesh.position.copy(finalPos);
      atomMesh.castShadow = !isSoftwareGl;
      atomMesh.receiveShadow = !isSoftwareGl;
      atomMesh.userData = { atomId: atom.id, atomData: atom };

      molGroup.add(atomMesh);

      // Electrostatic partial charge halo / aura
      let haloMesh: THREE.Mesh | undefined = undefined;
      if (showElectrostaticAura && atom.partialCharge && atom.partialCharge !== '0') {
        const auraColor = atom.partialCharge.includes('+') ? 0x60a5fa : 0xf87171;
        const auraGeo = new THREE.SphereGeometry(radius * 1.35, 16, 12);
        const auraMat = new THREE.MeshBasicMaterial({
          color: auraColor,
          transparent: true,
          opacity: 0.22,
          depthWrite: false,
          wireframe: renderMode === 'wireframe',
        });
        haloMesh = new THREE.Mesh(auraGeo, auraMat);
        atomMesh.add(haloMesh);
      }

      atomMeshesRef.current.push({
        atom,
        mesh: atomMesh,
        haloMesh,
        basePos: finalPos.clone(),
      });
    });

    // 2. BUILD BONDS (CYLINDERS & PARALLEL TUBES)
    molecule.bonds.forEach((bond) => {
      const posA = atomPosMap.get(bond.from);
      const posB = atomPosMap.get(bond.to);
      if (!posA || !posB) return;

      const bondGroup = new THREE.Group();

      const midPoint = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);
      const distance = posA.distanceTo(posB);
      const direction = new THREE.Vector3().subVectors(posB, posA).normalize();

      // Quaternion rotation from Y-up cylinder to vector direction
      const orientation = new THREE.Quaternion();
      orientation.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

      const bondRadius = renderMode === 'wireframe' ? 0.03 : 0.08;

      if (bond.order === 'ionic') {
        // Striped / dashed ionic electrostatic cylinder
        const cylinderGeo = new THREE.CylinderGeometry(bondRadius * 0.9, bondRadius * 0.9, distance * 0.9, 12);
        const cylinderMat = new THREE.MeshStandardMaterial({
          color: 0xa855f7,
          roughness: 0.4,
          metalness: 0.3,
          wireframe: true,
        });
        const mesh = new THREE.Mesh(cylinderGeo, cylinderMat);
        mesh.position.copy(midPoint);
        mesh.quaternion.copy(orientation);
        bondGroup.add(mesh);
      } else if (bond.order === 2 && renderMode !== 'spacefill') {
        // Double bond: two parallel cylinders
        const offsetDist = 0.09;
        const up = new THREE.Vector3(0, 1, 0);
        const perp = new THREE.Vector3().crossVectors(direction, up).normalize();
        if (perp.length() === 0) perp.set(1, 0, 0);

        const cylGeo = new THREE.CylinderGeometry(bondRadius * 0.8, bondRadius * 0.8, distance * 0.85, 12);
        const cylMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.3,
          metalness: 0.2,
        });

        const m1 = new THREE.Mesh(cylGeo, cylMat);
        m1.position.copy(midPoint).add(perp.clone().multiplyScalar(offsetDist));
        m1.quaternion.copy(orientation);
        bondGroup.add(m1);

        const m2 = new THREE.Mesh(cylGeo, cylMat);
        m2.position.copy(midPoint).add(perp.clone().multiplyScalar(-offsetDist));
        m2.quaternion.copy(orientation);
        bondGroup.add(m2);
      } else if (bond.order === 'aromatic' && renderMode !== 'spacefill') {
        // Aromatic bond: main solid cylinder + dashed parallel line
        const cylGeo = new THREE.CylinderGeometry(bondRadius, bondRadius, distance * 0.88, 12);
        const cylMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.3,
          metalness: 0.2,
        });
        const m1 = new THREE.Mesh(cylGeo, cylMat);
        m1.position.copy(midPoint);
        m1.quaternion.copy(orientation);
        bondGroup.add(m1);
      } else if (renderMode !== 'spacefill') {
        // Single covalent bond cylinder
        const cylGeo = new THREE.CylinderGeometry(bondRadius, bondRadius, distance * 0.88, 12);
        const cylMat = new THREE.MeshStandardMaterial({
          color: 0x64748b,
          roughness: 0.35,
          metalness: 0.15,
        });
        const m = new THREE.Mesh(cylGeo, cylMat);
        m.position.copy(midPoint);
        m.quaternion.copy(orientation);
        bondGroup.add(m);
      }

      molGroup.add(bondGroup);
      bondMeshesRef.current.push({
        bond,
        mesh: bondGroup,
        fromAtomId: bond.from,
        toAtomId: bond.to,
      });
    });

  }, [molecule, renderMode, explosionFactor, showElectrostaticAura, centroid, isSoftwareGl]);

  /* ========================================================================= */
  /* RAYCASTING INTERACTION: HOVER TOOLTIP & MEASUREMENT TOOL                   */
  /* ========================================================================= */
  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    const camera = cameraRef.current;
    if (!container || !camera || !moleculeGroupRef.current) return;

    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const atomMeshes = atomMeshesRef.current.map(a => a.mesh);
    const intersects = raycaster.intersectObjects(atomMeshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const atomData = hitMesh.userData?.atomData as MoleculeAtom | undefined;

      if (atomData) {
        if (measurementMode) {
          // Measurement mode logic (distance or angle)
          setMeasuredAtoms(prev => {
            const next = [...prev, atomData];
            if (next.length === 2) {
              const p1 = new THREE.Vector3(next[0].x3d, next[0].y3d, next[0].z3d);
              const p2 = new THREE.Vector3(next[1].x3d, next[1].y3d, next[1].z3d);
              const distAng = p1.distanceTo(p2);
              const distPm = Math.round(distAng * 100);
              setMeasurementResult(`Distancia entre ${next[0].name} y ${next[1].name}: ${distPm} pm (${distAng.toFixed(2)} Å)`);
            } else if (next.length === 3) {
              // Calculate angle θ between (P1-P2) and (P3-P2)
              const vA = new THREE.Vector3(next[0].x3d - next[1].x3d, next[0].y3d - next[1].y3d, next[0].z3d - next[1].z3d).normalize();
              const vB = new THREE.Vector3(next[2].x3d - next[1].x3d, next[2].y3d - next[1].y3d, next[2].z3d - next[1].z3d).normalize();
              const angleRad = vA.angleTo(vB);
              const angleDeg = (angleRad * 180) / Math.PI;
              setMeasurementResult(`Ángulo de enlace ∠(${next[0].symbol}-${next[1].symbol}-${next[2].symbol}): ${angleDeg.toFixed(1)}°`);
            } else if (next.length > 3) {
              setMeasurementResult(null);
              return [atomData];
            }
            return next;
          });
        }

        if (onSelectAtom) onSelectAtom(atomData);
      }
    }
  }, [measurementMode, onSelectAtom]);

  // Pointer move for hover tooltips
  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    const camera = cameraRef.current;
    if (!container || !camera || !moleculeGroupRef.current) return;

    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const atomMeshes = atomMeshesRef.current.map(a => a.mesh);
    const intersects = raycaster.intersectObjects(atomMeshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const atomData = hitMesh.userData?.atomData as MoleculeAtom | undefined;
      setHoveredAtom(atomData || null);
    } else {
      setHoveredAtom(null);
    }
  }, []);

  // Camera Presets
  const setCameraPreset = (preset: 'iso' | 'front' | 'top' | 'side') => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    controls.reset();
    switch (preset) {
      case 'front':
        camera.position.set(0, 0, 9);
        break;
      case 'top':
        camera.position.set(0, 9, 0.001);
        break;
      case 'side':
        camera.position.set(9, 0, 0);
        break;
      case 'iso':
      default:
        camera.position.set(5, 5, 7);
        break;
    }
    camera.lookAt(0, 0, 0);
    controls.update();
  };

  const handleResetCamera = () => {
    setCameraPreset('iso');
    if (moleculeGroupRef.current) {
      moleculeGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={
        isFullscreen
          ? "fixed inset-0 z-[100] w-screen h-screen bg-[#070c14] overflow-hidden select-none flex flex-col"
          : "relative w-full h-[540px] md:h-[620px] bg-[#070c14] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl font-sans select-none"
      }
    >
      
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Left Minimal Spec Badge */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-1">
        <div className="flex items-center gap-2 bg-[#09101b]/90 border border-cyan-500/30 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-none">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span className="text-xs font-mono font-bold text-white tracking-wide">
            {molecule.name} ({molecule.formula})
          </span>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded">
            {renderMode === 'ball_stick' ? 'Bolas & Varillas' : renderMode === 'spacefill' ? 'van der Waals 100%' : 'Esqueleto Stick'}
          </span>
          {isFullscreen && (
            <span className="text-[10px] font-mono text-amber-300 bg-amber-950/70 border border-amber-500/40 px-1.5 py-0.5 rounded">
              Pantalla Completa Activa (Esc para salir)
            </span>
          )}
        </div>
        <div className="text-[10px] font-mono text-slate-400 pl-1">
          Geometría: <span className="text-slate-200 font-semibold">{molecule.geometry}</span>
        </div>
      </div>

      {/* Top Right Quick Camera Pills & Fullscreen Toggle */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
        <div className="bg-[#0b1320] border border-slate-700/80 rounded-xl p-1 flex items-center gap-1 shadow-lg">
          <button
            onClick={() => setCameraPreset('front')}
            className="px-2 py-1 text-[10px] font-mono rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Vista Frontal (Ejes XY)"
          >
            Frente
          </button>
          <button
            onClick={() => setCameraPreset('top')}
            className="px-2 py-1 text-[10px] font-mono rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Vista Superior (Ejes XZ)"
          >
            Cenital
          </button>
          <button
            onClick={() => setCameraPreset('side')}
            className="px-2 py-1 text-[10px] font-mono rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Vista Lateral (Ejes YZ)"
          >
            Lateral
          </button>
          <button
            onClick={handleResetCamera}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 transition cursor-pointer"
            title="Restablecer Cámara Isométrica"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-0.5" />

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className={`p-1.5 rounded transition cursor-pointer flex items-center gap-1 ${
              isFullscreen
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-800'
            }`}
            title={isFullscreen ? 'Salir de Pantalla Completa (Esc o F)' : 'Pantalla Completa Inmersiva (F)'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="text-[10px] font-mono font-bold pr-0.5 hidden sm:inline">
              {isFullscreen ? 'Salir' : 'Pantalla Completa'}
            </span>
          </button>
        </div>
      </div>

      {/* Hovered Atom Tooltip (Top Center) */}
      {hoveredAtom && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-[#0d1624] border border-cyan-400/60 rounded-xl px-4 py-2 shadow-2xl text-xs font-mono flex items-center gap-3 animate-in fade-in">
          <span
            className="w-3.5 h-3.5 rounded-full ring-2 ring-white/50"
            style={{ backgroundColor: hoveredAtom.color }}
          />
          <div>
            <span className="font-bold text-white text-sm">{hoveredAtom.name}</span>
            <span className="text-cyan-300 ml-2">[{hoveredAtom.symbol}]</span>
            <span className="text-slate-400 ml-2 text-[11px]">
              Coord: ({hoveredAtom.x3d.toFixed(1)}, {hoveredAtom.y3d.toFixed(1)}, {hoveredAtom.z3d.toFixed(1)}) Å
            </span>
          </div>
          {hoveredAtom.role && (
            <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
              {hoveredAtom.role}
            </span>
          )}
        </div>
      )}

      {/* Measurement Mode Alert Banner */}
      {measurementMode && (
        <div className="absolute top-16 right-4 z-20 bg-[#0f172a] border border-amber-500/50 rounded-xl p-3 shadow-2xl max-w-sm text-xs font-mono space-y-1.5 animate-in fade-in">
          <div className="flex items-center justify-between text-amber-300 font-bold">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-400" /> Medidor de Enlaces y Ángulos
            </span>
            <button
              onClick={() => {
                setMeasurementMode(false);
                setMeasuredAtoms([]);
                setMeasurementResult(null);
              }}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-300 text-[11px] font-sans">
            Haz clic en <strong>2 átomos</strong> para medir la distancia internuclear (pm), o en <strong>3 átomos</strong> para calcular el ángulo de enlace (°).
          </p>
          <div className="text-[10px] text-cyan-300">
            Átomos seleccionados: {measuredAtoms.map(a => a.symbol).join(' → ') || 'Ninguno'}
          </div>
          {measurementResult && (
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-200 font-bold text-xs mt-1">
              {measurementResult}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* UNIFIED COLLAPSIBLE BOTTOM DOCK (FOLLOWS THREEJS SKILL ARCHITECTURE)      */}
      {/* ========================================================================= */}
      <div 
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-4xl transition-all duration-300"
        style={{
          transform: isZenMode ? 'translate(-50%, calc(100% - 32px))' : 'translate(-50%, 0)',
        }}
      >
        {/* Toggle Collapse Pill */}
        <div className="flex justify-center mb-1">
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className="px-3 py-1 rounded-t-lg bg-[#0e1625] border-t border-x border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold flex items-center gap-1 shadow-md hover:bg-slate-800 transition cursor-pointer"
          >
            {isZenMode ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Mostrar Controles 3D</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Modo Cine / Ocultar Dock</span>
              </>
            )}
          </button>
        </div>

        {/* Main Dock Container */}
        <div className="bg-[#0b121e] border border-cyan-500/40 rounded-2xl p-3 md:p-4 shadow-2xl space-y-3">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Left 4 Cols: Render Modes (Ball&Stick, SpaceFill, Wireframe) */}
            <div className="md:col-span-4 flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold mr-1">
                Modo:
              </span>
              <button
                onClick={() => setRenderMode('ball_stick')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                  renderMode === 'ball_stick'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Modelo atómico clásico de bolas y varillas"
              >
                Bolas & Varillas
              </button>
              <button
                onClick={() => setRenderMode('spacefill')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                  renderMode === 'spacefill'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Modelo de esferas de van der Waals (empaquetamiento y volumen real)"
              >
                Space-Filling
              </button>
              <button
                onClick={() => setRenderMode('wireframe')}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                  renderMode === 'wireframe'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/60 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Esqueleto de alambre minimalista"
              >
                Stick
              </button>
            </div>

            {/* Middle 4 Cols: Thermal Vibration & Separation Slider */}
            <div className="md:col-span-5 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Vibración Térmica
                </span>
                <button
                  onClick={() => setThermalVibration(!thermalVibration)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    thermalVibration ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {thermalVibration ? 'ACTIVADA' : 'APAGADA'}
                </button>
              </div>

              {/* Exploded View Slider */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-[10px] text-slate-400 shrink-0">Separación / Red:</span>
                <input
                  type="range"
                  min="1.0"
                  max="2.2"
                  step="0.05"
                  value={explosionFactor}
                  onChange={(e) => setExplosionFactor(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-cyan-300 min-w-[28px] text-right">
                  {explosionFactor.toFixed(1)}x
                </span>
              </div>
            </div>

            {/* Right 3 Cols: Auto-rotate & Measurement Buttons */}
            <div className="md:col-span-3 flex items-center justify-end gap-2">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`p-2 rounded-xl border text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                  autoRotate
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Alternar rotación automática"
              >
                <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                <span>Giro</span>
              </button>

              <button
                onClick={() => {
                  setMeasurementMode(!measurementMode);
                  setMeasuredAtoms([]);
                  setMeasurementResult(null);
                }}
                className={`p-2 rounded-xl border text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                  measurementMode
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Herramienta para medir distancias y ángulos de enlace"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Medir</span>
              </button>

              <button
                onClick={() => setShowElectrostaticAura(!showElectrostaticAura)}
                className={`p-2 rounded-xl border text-xs font-mono transition cursor-pointer ${
                  showElectrostaticAura
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
                title="Mostrar u ocultar halos de potencial electrostático δ+ / δ-"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
