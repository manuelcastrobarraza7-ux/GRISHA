import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Sun, Sparkles, Play, RotateCcw, ArrowRight, Zap, Info, Maximize2, Minimize2 } from 'lucide-react';

export const PPChainVisualizer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportWrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1); // 1: p+p, 2: Beta decay, 3: He-3 fusion, 4: He-4 synthesis
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Mesh[]>([]);

  const stepDetails = [
    {
      step: 1,
      title: 'Paso 1: Colisión Protón-Protón (p + p)',
      reaction: '¹H + ¹H ➔ ²H + e⁺ + ν_e + 0.42 MeV',
      desc: 'Dos protones colisionan a 15 millones de Kelvin. Debido a la fuerza débil, uno de los protones se convierte en neutrón, formando Deuterio (²H), un positrón (e⁺) y un neutrino electrónico (ν_e).',
      temp: '15 Millones de K',
      energy: '+0.42 MeV (kinetic + neutrino)'
    },
    {
      step: 2,
      title: 'Paso 2: Síntesis de Helio-3 (p + ²H)',
      reaction: '²H + ¹H ➔ ³He + γ + 5.49 MeV',
      desc: 'El núcleo de deuterio recién formado colisiona rápidamente con otro protón libre del plasma estelar, fusionándose en un isótopo de Helio-3 (³He) y emitiendo un fotón gamma (γ) de alta energía.',
      temp: '15 - 20 Millones de K',
      energy: '+5.49 MeV (Rayos Gamma)'
    },
    {
      step: 3,
      title: 'Paso 3: Fusión de Helio-4 (³He + ³He)',
      reaction: '³He + ³He ➔ ⁴He + 2¹H + 12.86 MeV',
      desc: 'Dos núcleos de Helio-3 chocan entre sí. Se fusionan en un núcleo sumamente estable de Helio-4 (⁴He) y liberan de vuelta dos protones libres que continúan la cadena.',
      temp: '15 - 25 Millones de K',
      energy: '+12.86 MeV (Energía estelar neta)'
    },
    {
      step: 4,
      title: 'Balance Energético Total del Proceso PP',
      reaction: '4¹H ➔ ⁴He + 2e⁺ + 2ν_e + 2γ (26.73 MeV)',
      desc: 'El balance neto convierte 4 protones en un núcleo de Helio-4 con un defecto de masa del 0.7%, irradiando 26.73 MeV por cada ciclo completo en el núcleo solar.',
      temp: 'Núcleo Solar Estable',
      energy: '26.73 MeV Totales'
    }
  ];

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080d14);
    scene.fog = new THREE.FogExp2(0x080d14, 0.035);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 2, 6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      particlesRef.current.forEach((p, idx) => {
        p.rotation.y += delta * (idx + 1) * 0.5;
        p.rotation.x += delta * 0.3;
      });

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
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      rendererRef.current = null;
      cameraRef.current = null;
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

  // Update particles based on current step
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Clear old particles
    particlesRef.current.forEach(p => scene.remove(p));
    particlesRef.current = [];

    const protonGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const neutronGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const redMat = new THREE.MeshPhysicalMaterial({ color: 0xef4444, roughness: 0.2, clearcoat: 1 });
    const blueMat = new THREE.MeshPhysicalMaterial({ color: 0x3b82f6, roughness: 0.2, clearcoat: 1 });
    const yellowMat = new THREE.MeshPhysicalMaterial({ color: 0xf59e0b, roughness: 0.2, emissive: 0xd97706, emissiveIntensity: 0.5 });

    if (currentStep === 1) {
      // Two colliding protons
      const p1 = new THREE.Mesh(protonGeo, redMat);
      p1.position.set(-1.2, 0, 0);
      const p2 = new THREE.Mesh(protonGeo, redMat);
      p2.position.set(1.2, 0, 0);
      scene.add(p1);
      scene.add(p2);
      particlesRef.current.push(p1, p2);
    } else if (currentStep === 2) {
      // Deuterium (1 proton + 1 neutron) + free proton approaching
      const p = new THREE.Mesh(protonGeo, redMat);
      p.position.set(-1.5, 0, 0);
      
      const deuteronGroup = new THREE.Group();
      const dp = new THREE.Mesh(protonGeo, redMat);
      dp.position.set(-0.3, 0, 0);
      const dn = new THREE.Mesh(neutronGeo, blueMat);
      dn.position.set(0.3, 0, 0);
      deuteronGroup.add(dp, dn);
      deuteronGroup.position.set(0.8, 0, 0);

      scene.add(p, deuteronGroup);
      particlesRef.current.push(p, dp, dn);
    } else if (currentStep === 3) {
      // Two He-3 nuclei approaching
      const he3_1 = new THREE.Group();
      const p1 = new THREE.Mesh(protonGeo, redMat);
      p1.position.set(-0.3, 0.3, 0);
      const p2 = new THREE.Mesh(protonGeo, redMat);
      p2.position.set(-0.3, -0.3, 0);
      const n1 = new THREE.Mesh(neutronGeo, blueMat);
      n1.position.set(0.3, 0, 0);
      he3_1.add(p1, p2, n1);
      he3_1.position.set(-1.5, 0, 0);

      const he3_2 = new THREE.Group();
      const p3 = new THREE.Mesh(protonGeo, redMat);
      p3.position.set(0.3, 0.3, 0);
      const p4 = new THREE.Mesh(protonGeo, redMat);
      p4.position.set(0.3, -0.3, 0);
      const n2 = new THREE.Mesh(neutronGeo, blueMat);
      n2.position.set(-0.3, 0, 0);
      he3_2.add(p3, p4, n2);
      he3_2.position.set(1.5, 0, 0);

      scene.add(he3_1, he3_2);
      particlesRef.current.push(p1, p2, n1, p3, p4, n2);
    } else {
      // Complete Alpha particle (He-4: 2p, 2n)
      const alphaGroup = new THREE.Group();
      const p1 = new THREE.Mesh(protonGeo, redMat);
      p1.position.set(-0.3, 0.3, 0);
      const p2 = new THREE.Mesh(protonGeo, redMat);
      p2.position.set(0.3, -0.3, 0);
      const n1 = new THREE.Mesh(neutronGeo, blueMat);
      n1.position.set(-0.3, -0.3, 0);
      const n2 = new THREE.Mesh(neutronGeo, blueMat);
      n2.position.set(0.3, 0.3, 0);
      alphaGroup.add(p1, p2, n1, n2);
      scene.add(alphaGroup);
      particlesRef.current.push(p1, p2, n1, n2);
    }
  }, [currentStep]);

  const activeInfo = stepDetails[currentStep - 1];

  return (
    <div className="bg-[#0b111a] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-5 my-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Sun className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block font-bold">
              Simulador Visual 3D — Cadena Protón-Protón (Proceso PP)
            </span>
            <h3 className="text-lg font-bold text-white">Dinámica de Fusión Nuclear en el Núcleo Solar</h3>
          </div>
        </div>

        {/* Step selector pills */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          {[1, 2, 3, 4].map(s => (
            <button
              key={s}
              onClick={() => setCurrentStep(s)}
              className={`px-3 py-1.5 rounded-lg transition font-bold ${
                currentStep === s
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              Paso {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: 3D Canvas on Left, Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left 7 Cols or Fullscreen: 3D Viewport */}
        <div 
          ref={viewportWrapperRef}
          className={`${
            isFullscreen
              ? 'fixed inset-0 z-50 w-screen h-screen bg-[#070b12] rounded-none border-none p-0 flex flex-col'
              : 'lg:col-span-7 h-[360px] bg-[#070b12] border border-slate-800 rounded-xl relative overflow-hidden shadow-inner'
          }`}
        >
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
          
          <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-[11px] text-amber-300 flex items-center gap-2 z-10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{activeInfo.title}</span>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className={`absolute top-3 right-3 rounded-lg px-2.5 py-1.5 font-mono text-[11px] flex items-center gap-1.5 transition cursor-pointer shadow-lg z-20 border font-bold ${
              isFullscreen
                ? 'bg-amber-400 text-black border-amber-300 shadow-amber-400/30'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-amber-300'
            }`}
            title={isFullscreen ? "Salir de Pantalla Completa (ESC / F)" : "Pantalla Completa 3D — Máximo Renderizado UHD (F)"}
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

          <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-[10px] text-slate-400 z-10">
            🔴 Protones (p⁺) • 🔵 Neutrones (n⁰)
          </div>

          {/* Floating HUD and Controls in Fullscreen */}
          {isFullscreen && (
            <>
              {/* Top Center HUD */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-max max-w-[90vw]">
                <div className="bg-black/85 backdrop-blur-md border border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.35)] px-4 py-1.5 rounded-full flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    FUSIÓN SOLAR 3D · MÁXIMO RENDERIZADO UHD
                  </span>
                  <span className="text-slate-600 hidden sm:inline">|</span>
                  <span className="text-white font-bold">{activeInfo.title}</span>
                  <span className="text-slate-600 hidden sm:inline">|</span>
                  <span className="text-cyan-300 font-semibold">{activeInfo.energy}</span>
                  <span className="text-slate-600 hidden sm:inline">|</span>
                  <span className="text-slate-300 hidden md:inline">Atajos: <kbd className="px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded border border-slate-700">ESC</kbd> o <kbd className="px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded border border-slate-700">F</kbd></span>
                </div>
              </div>

              {/* Bottom Floating Step Controller */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex flex-wrap items-center justify-center gap-2.5 bg-black/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700/80 shadow-2xl text-xs font-mono">
                {[1, 2, 3, 4].map(s => (
                  <button
                    key={s}
                    onClick={() => setCurrentStep(s)}
                    className={`px-3 py-1.5 rounded-xl transition font-bold cursor-pointer ${
                      currentStep === s
                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    Paso {s}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentStep(prev => (prev % 4) + 1)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold flex items-center gap-1.5 cursor-pointer shadow-lg ml-2"
                >
                  <span>Siguiente</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5 font-bold transition border border-slate-600 cursor-pointer ml-2"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Salir Pantalla Completa</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right 5 Cols: Scientific Breakdown */}
        <div className="lg:col-span-5 space-y-4 font-mono text-xs">
          <div className="bg-[#070b12] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-amber-400 font-bold">Ecuación Nuclear:</span>
              <span className="bg-amber-950/40 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/40 font-bold">
                {activeInfo.energy}
              </span>
            </div>

            <div className="text-sm font-extrabold text-white font-mono bg-slate-900 p-2.5 rounded border border-slate-800 text-center">
              {activeInfo.reaction}
            </div>

            <p className="text-slate-300 font-sans text-xs leading-relaxed">
              {activeInfo.desc}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-[9px] text-slate-400 block">Temperatura Núcleo</span>
                <span className="text-cyan-400 font-bold text-xs">{activeInfo.temp}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-[9px] text-slate-400 block">Emisión Notable</span>
                <span className="text-emerald-400 font-bold text-xs">Neutrinos & Rayos Gamma</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentStep(prev => (prev % 4) + 1)}
            className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold rounded-lg shadow-md shadow-amber-400/20 transition flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Siguiente Paso en Cadena PP</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
