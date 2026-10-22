/**
 * Unified Integrated Mathematical Physics Engine for 3D Particles and Atoms
 * 
 * Implements the 8 foundational physical rules:
 * 1. Fundamental Constants (m_e, q_e, epsilon_0, h, g)
 * 2. Particle Kinematic State (r_i, v_i, a_i, m_i, q_i)
 * 3. General Law of Motion (Newton's 2nd Law: a_i = sum(F_i) / m_i)
 * 4. Force Modeling (Gravity, Medium Drag, Lorentz Force, Coulomb Interaction)
 * 5. Quantum and Orbital Dynamics (Bohr orbital equilibrium, de Broglie wavelength)
 * 6. Numerical Integration (Verlet Method)
 * 7. Boundary Collisions (y = 0 with restitution e and tangential damping mu_t)
 * 8. 3D to 2D Graphic Perspective Projection (Xs = x*d/(z+d) + Xc, Ys = y*d/(z+d) + Yc)
 */

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export const VectorMath = {
  zero: (): Vector3D => ({ x: 0, y: 0, z: 0 }),
  clone: (v: Vector3D): Vector3D => ({ x: v.x, y: v.y, z: v.z }),
  add: (a: Vector3D, b: Vector3D): Vector3D => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }),
  sub: (a: Vector3D, b: Vector3D): Vector3D => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }),
  scale: (v: Vector3D, s: number): Vector3D => ({ x: v.x * s, y: v.y * s, z: v.z * s }),
  dot: (a: Vector3D, b: Vector3D): number => a.x * b.x + a.y * b.y + a.z * b.z,
  cross: (a: Vector3D, b: Vector3D): Vector3D => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  }),
  magnitudeSq: (v: Vector3D): number => v.x * v.x + v.y * v.y + v.z * v.z,
  magnitude: (v: Vector3D): number => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z),
  normalize: (v: Vector3D): Vector3D => {
    const mag = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    return mag > 1e-12 ? { x: v.x / mag, y: v.y / mag, z: v.z / mag } : { x: 0, y: 0, z: 0 };
  },
  distance: (a: Vector3D, b: Vector3D): number => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },
};

/**
 * 1. Constantes Físicas Fundamentales (Unidades SI)
 */
export const PHYSICAL_CONSTANTS = {
  /** Masa del electrón (m_e) [kg] */
  M_E: 9.1093837e-31,
  /** Masa del protón (m_p) [kg] */
  M_P: 1.6726219e-27,
  /** Masa de la partícula alfa (m_alpha) [kg] */
  M_ALPHA: 6.6446572e-27,
  /** Carga elemental del electrón (q_e) [C] */
  Q_E: -1.6021766e-19,
  /** Magnitud de la carga elemental e [C] */
  E_CHARGE: 1.6021766e-19,
  /** Permitividad eléctrica del vacío (epsilon_0) [F/m] */
  EPSILON_0: 8.854e-12,
  /** Constante de Coulomb k_e = 1 / (4 * pi * epsilon_0) [N*m^2/C^2] */
  K_COULOMB: 1 / (4 * Math.PI * 8.854e-12), // ~ 8.98755179e9
  /** Constante de Planck (h) [J*s] */
  H_PLANCK: 6.626e-34,
  /** Constante reducida de Planck (hbar = h / (2 * pi)) [J*s] */
  H_BAR: 6.626e-34 / (2 * Math.PI), // ~ 1.0545718e-34
  /** Radio de Bohr estándar para hidrógeno (a_0) [m] */
  BOHR_RADIUS_A0: 5.291772109e-11,
  /** Gravedad estándar (g) [m/s^2] */
  G_VECTOR: { x: 0, y: -9.81, z: 0 } as Vector3D,
};

/**
 * 2. Estado Cinemático de la Partícula
 */
export interface ParticleKinematicState {
  id: string;
  name: string;
  type: 'electron' | 'proton' | 'neutron' | 'alpha' | 'ion' | 'test';
  
  // Vectores cinemáticos en espacio tridimensional
  r: Vector3D;      // Posición actual r = (x, y, z) [m ó unidades de simulación]
  rPrev: Vector3D;  // Posición anterior r(t - dt) requerida por el método de Verlet
  v: Vector3D;      // Velocidad v = (vx, vy, vz) [m/s]
  a: Vector3D;      // Aceleración a = (ax, ay, az) [m/s^2]
  
  // Propiedades intrínsecas
  mass: number;     // Masa m_i [kg]
  charge: number;   // Carga q_i [C]
  
  // Parámetros cuánticos y auxiliares
  principalQuantumN?: number; // Número cuántico principal n (1, 2, 3...)
  deBroglieWavelength?: number; // Longitud de onda de de Broglie lambda = h / (m * v) [m]
  orbitalBohrRadius?: number;   // Radio orbital r [m]
  kineticEnergyJ?: number;      // Energía cinética E_k = 0.5 * m * v^2 [J]
  kineticEnergyEv?: number;     // Energía cinética [eV]
  
  // Atributos de visualización gráfica
  displayRadius: number;
  color: string;
  fixed?: boolean; // Para partículas inmóviles como núcleo central masivo
  trail: Vector3D[]; // Historial de trayectoria para renderizado de estela
}

/**
 * Configuración global del entorno de simulación física
 */
export interface PhysicsEnvironmentConfig {
  // Factores de escala para puente entre escala microscópica SI y visualización
  // En visualización 3D interactiva: 1 unidad gráfica = 1 Angstrom = 1e-10 m (o escala ajustada)
  lengthScale: number; // m por unidad gráfica
  timeScale: number;   // factor de aceleración temporal
  
  // Campos electromagnéticos externos
  electricField: Vector3D; // E = (Ex, Ey, Ez) [V/m]
  magneticField: Vector3D; // B = (Bx, By, Bz) [Tesla]
  
  // Gravedad mecánica
  enableGravity: boolean;
  gravityVector: Vector3D; // g = (0, -9.81, 0) m/s^2
  gravityScale: number;    // Multiplicador didáctico (para evidenciar efectos a escala atómica)
  gravityGConstant?: number; // Magnitud de aceleración gravitatoria g [m/s^2] (default: 9.81)
  
  // Fricción o arrastre del medio
  gammaDrag: number;       // Coeficiente de amortiguamiento gamma [kg/s]
  
  // Ley de Coulomb y fuerza electrostática
  enableCoulomb: boolean;
  coulombScale: number;    // Multiplicador de la fuerza electrostática (k_e / k_e0), p.ej. 0.0x a 5.0x
  coulombSoftening: number; // Factor de suavizado epsilon para evitar singularidades dividiendo por cero
  
  // Colisiones con plano horizontal y = 0
  enableFloorCollision: boolean;
  floorY: number;          // Coordenada del plano de contorno y = 0
  restitutionE: number;    // Coeficiente de restitución e (0 = inelástico, 1 = elástico)
  tangentialDampingMu: number; // Coeficiente de fricción / amortiguamiento tangencial mu_t
  
  // Contorno lateral (caja de confinamiento opcional)
  enableBoxBoundary: boolean;
  boxHalfWidth: number;    // Límite en X y Z [-L, +L]
  boxHeight: number;       // Límite en Y [floorY, floorY + H]
  
  // Proyección gráfica 3D a 2D
  focalDistanceD: number;  // Distancia focal d para perspectiva
  screenCenterX: number;   // X_c
  screenCenterY: number;   // Y_c
}

export const DEFAULT_PHYSICS_CONFIG: PhysicsEnvironmentConfig = {
  lengthScale: 1e-10, // 1 unidad gráfica = 0.1 nm (1 Å)
  timeScale: 1.0,
  electricField: { x: 0, y: 0, z: 0 },
  magneticField: { x: 0, y: 0, z: 0 },
  enableGravity: false,
  gravityVector: { x: 0, y: -9.81, z: 0 },
  gravityScale: 1.0,
  gravityGConstant: 9.81,
  gammaDrag: 0.0,
  enableCoulomb: true,
  coulombScale: 1.0,
  coulombSoftening: 0.45,
  enableFloorCollision: true,
  floorY: -2.5,
  restitutionE: 0.82,
  tangentialDampingMu: 0.15,
  enableBoxBoundary: false,
  boxHalfWidth: 5.0,
  boxHeight: 6.0,
  focalDistanceD: 10.0,
  screenCenterX: 320,
  screenCenterY: 240,
};

/**
 * 4. Modelado de Fuerzas Físicas
 */
export const ForceModels = {
  /**
   * 4.A Gravedad: F_g = m_i * g * scale
   */
  computeGravity: (p: ParticleKinematicState, g: Vector3D, scale: number = 1.0, customG?: number): Vector3D => {
    const effectiveG = customG !== undefined && customG >= 0
      ? { x: g.x, y: -Math.abs(customG), z: g.z }
      : g;
    return VectorMath.scale(effectiveG, p.mass * scale);
  },

  /**
   * 4.B Fricción o Arrastre del Medio: F_drag = -gamma * v_i
   */
  computeDrag: (p: ParticleKinematicState, gamma: number): Vector3D => {
    return {
      x: -gamma * p.v.x,
      y: -gamma * p.v.y,
      z: -gamma * p.v.z,
    };
  },

  /**
   * 4.C Fuerza de Lorentz: F_L = q_i * (E + v_i x B)
   * Para cargas en campos eléctricos y magnéticos
   */
  computeLorentz: (p: ParticleKinematicState, E: Vector3D, B: Vector3D): Vector3D => {
    // v x B = (vy*Bz - vz*By, vz*Bx - vx*Bz, vx*By - vy*Bx)
    const vCrossB = VectorMath.cross(p.v, B);
    // E + v x B
    const netElectromagneticField = VectorMath.add(E, vCrossB);
    // F_L = q * (E + v x B)
    return VectorMath.scale(netElectromagneticField, p.charge);
  },

  /**
   * 4.D Interacción Electrostática / Ley de Coulomb:
   * F_{C, ij} = 1 / (4 * pi * epsilon_0) * (q_i * q_j) / ||r_j - r_i||^3 * (r_i - r_j) * coulombScale
   * Con factor de suavizado epsilon para regularización numérica sin singularidades:
   * r_eff = sqrt(||r_j - r_i||^2 + epsilon^2)
   */
  computeCoulombPair: (
    pi: ParticleKinematicState,
    pj: ParticleKinematicState,
    softening: number = 0.45,
    coulombScale: number = 1.0
  ): Vector3D => {
    const dx = pi.r.x - pj.r.x;
    const dy = pi.r.y - pj.r.y;
    const dz = pi.r.z - pj.r.z;
    const effSoft = Math.max(0.4, softening);
    const distSq = dx * dx + dy * dy + dz * dz + effSoft * effSoft;
    const dist = Math.sqrt(distSq);
    const distCube = dist * distSq;

    // Constante k_e = 1 / (4 * pi * epsilon_0) escalada por coulombScale
    const scale = Number.isFinite(coulombScale) ? Math.max(0, coulombScale) : 1.0;
    const ke = PHYSICAL_CONSTANTS.K_COULOMB * scale;

    const rawScalar = (ke * pi.charge * pj.charge) / distCube;
    const scalar = Number.isFinite(rawScalar) ? rawScalar : 0;
    return {
      x: scalar * dx,
      y: scalar * dy,
      z: scalar * dz,
    };
  },
};

/**
 * 5. Dinámica Cuántica y Orbital (Específico para Electrones)
 */
export const QuantumOrbitalDynamics = {
  /**
   * Condición de equilibrio orbital de Bohr para núcleo de número atómico Z a radio r:
   * m_e * v^2 / r = 1 / (4 * pi * epsilon_0) * (Z * e^2) / r^2
   * Despejando velocidad orbital:
   * v = sqrt( (Z * e^2) / (4 * pi * epsilon_0 * m_e * r) )
   */
  computeBohrOrbitalVelocity: (
    atomicNumberZ: number,
    radiusMeters: number,
    electronMass: number = PHYSICAL_CONSTANTS.M_E,
    elementaryCharge: number = PHYSICAL_CONSTANTS.E_CHARGE,
    epsilon0: number = PHYSICAL_CONSTANTS.EPSILON_0
  ): number => {
    if (radiusMeters <= 1e-15 || atomicNumberZ <= 0) return 0;
    const ke = 1 / (4 * Math.PI * epsilon0);
    const numerator = ke * atomicNumberZ * (elementaryCharge * elementaryCharge);
    const denominator = electronMass * radiusMeters;
    return Math.sqrt(Math.max(0, numerator / denominator));
  },

  /**
   * Radio de la órbita n según cuantización del momento angular L = n * hbar:
   * r_n = (4 * pi * epsilon_0 * hbar^2 * n^2) / (m_e * Z * e^2) = a_0 * (n^2 / Z)
   */
  computeBohrRadiusN: (
    atomicNumberZ: number,
    n: number,
    a0: number = PHYSICAL_CONSTANTS.BOHR_RADIUS_A0
  ): number => {
    if (atomicNumberZ <= 0 || n <= 0) return a0;
    return a0 * (n * n / atomicNumberZ);
  },

  /**
   * Longitud de onda de de Broglie (Comportamiento ondulatorio del electrón):
   * lambda = h / p = h / (m_e * v)
   */
  computeDeBroglieWavelength: (
    velocityMetersPerSec: number,
    mass: number = PHYSICAL_CONSTANTS.M_E,
    h: number = PHYSICAL_CONSTANTS.H_PLANCK
  ): number => {
    const momentum = mass * Math.abs(velocityMetersPerSec);
    if (momentum < 1e-35) return Infinity;
    return h / momentum;
  },

  /**
   * Verificación de la condición cuántica de resonancia orbital de onda estacionaria:
   * 2 * pi * r = n * lambda
   */
  checkOrbitalResonance: (
    radiusMeters: number,
    wavelengthMeters: number,
    n: number
  ): { circumference: number; standingWaveRatio: number; matchesResonance: boolean } => {
    const circumference = 2 * Math.PI * radiusMeters;
    const expected = n * wavelengthMeters;
    const ratio = circumference / (wavelengthMeters || 1e-15);
    const error = Math.abs(ratio - n) / n;
    return {
      circumference,
      standingWaveRatio: ratio,
      matchesResonance: error < 0.05, // margen del 5%
    };
  },
};

/**
 * 6. Integración Numérica (Método de Verlet) y 7. Colisiones con Límites
 */
export const NumericalIntegrator = {
  /**
   * Ejecuta un paso de integración temporal mediante el Método de Verlet:
   * r(t + dt) = 2 * r(t) - r(t - dt) + a(t) * dt^2
   * 
   * Y aplica colisiones con contorno según la regla 7:
   * Si y_i <= 0 => y_i = 0, v_y' = -e * v_y, v_{x,z}' = (1 - mu_t) * v_{x,z}
   */
  stepVerlet: (
    particles: ParticleKinematicState[],
    dt: number,
    config: PhysicsEnvironmentConfig
  ): void => {
    if (dt <= 0) return;
    const dtSq = dt * dt;
    const n = particles.length;

    // 1. Calcular aceleraciones a_i = sum(F_i) / m_i (Segunda Ley de Newton)
    for (let i = 0; i < n; i++) {
      const p = particles[i];
      if (p.fixed) {
        p.a = VectorMath.zero();
        p.v = VectorMath.zero();
        continue;
      }

      let totalForce = VectorMath.zero();

      // 4.A Gravedad
      if (config.enableGravity) {
        const fg = ForceModels.computeGravity(p, config.gravityVector, config.gravityScale, config.gravityGConstant);
        totalForce = VectorMath.add(totalForce, fg);
      }

      // 4.B Fricción o arrastre del medio
      if (config.gammaDrag > 0) {
        const fdrag = ForceModels.computeDrag(p, config.gammaDrag);
        totalForce = VectorMath.add(totalForce, fdrag);
      }

      // 4.C Fuerza de Lorentz
      const fl = ForceModels.computeLorentz(p, config.electricField, config.magneticField);
      totalForce = VectorMath.add(totalForce, fl);

      // 4.D Interacción Electrostática / Ley de Coulomb con las demás partículas
      if (config.enableCoulomb) {
        const cScale = config.coulombScale !== undefined ? config.coulombScale : 1.0;
        for (let j = 0; j < n; j++) {
          if (i === j) continue;
          const fc = ForceModels.computeCoulombPair(p, particles[j], config.coulombSoftening, cScale);
          totalForce = VectorMath.add(totalForce, fc);
        }
      }

      // 3. Ley de Movimiento General: a_i = sum(F_i) / m_i
      const rawAcc = VectorMath.scale(totalForce, 1 / p.mass);

      // Estabilidad numérica N-body / Verlet: Limitar aceleración máxima para evitar singularidades
      const aMag = VectorMath.magnitude(rawAcc);
      const MAX_ACCELERATION = 90.0; // m/s^2 en espacio de simulación normalizado
      if (Number.isFinite(aMag) && aMag > MAX_ACCELERATION) {
        p.a = VectorMath.scale(rawAcc, MAX_ACCELERATION / aMag);
      } else if (Number.isFinite(rawAcc.x) && Number.isFinite(rawAcc.y) && Number.isFinite(rawAcc.z)) {
        p.a = rawAcc;
      } else {
        p.a = VectorMath.zero();
      }
    }

    // 2. Actualizar posiciones con Método de Verlet y resolver colisiones con límites
    for (let i = 0; i < n; i++) {
      const p = particles[i];
      if (p.fixed) continue;

      // Verlet: r_next = 2 * r - rPrev + a * dt^2
      let nextX = 2 * p.r.x - p.rPrev.x + p.a.x * dtSq;
      let nextY = 2 * p.r.y - p.rPrev.y + p.a.y * dtSq;
      let nextZ = 2 * p.r.z - p.rPrev.z + p.a.z * dtSq;

      // Salvaguarda absoluta contra NaN e Infinity por desbordamiento numérico
      if (
        !Number.isFinite(nextX) || !Number.isFinite(nextY) || !Number.isFinite(nextZ) ||
        Math.abs(nextX) > 150 || Math.abs(nextY) > 150 || Math.abs(nextZ) > 150
      ) {
        nextX = Number.isFinite(p.r.x) ? Math.max(-10, Math.min(10, p.r.x)) : (Math.random() - 0.5) * 4;
        nextY = Number.isFinite(p.r.y) ? Math.max(config.floorY + 0.2, Math.min(10, p.r.y)) : 1.5;
        nextZ = Number.isFinite(p.r.z) ? Math.max(-10, Math.min(10, p.r.z)) : 0;
        p.rPrev = { x: nextX, y: nextY, z: nextZ };
        p.v = VectorMath.zero();
        p.a = VectorMath.zero();
      }

      // Estimación de velocidad instantánea actual: v = (next - rPrev) / (2 * dt)
      let vx = (nextX - p.rPrev.x) / (2 * dt);
      let vy = (nextY - p.rPrev.y) / (2 * dt);
      let vz = (nextZ - p.rPrev.z) / (2 * dt);

      // Limitar velocidad máxima para consistencia temporal
      const vMag = Math.hypot(vx, vy, vz);
      const MAX_VELOCITY = 25.0;
      if (Number.isFinite(vMag) && vMag > MAX_VELOCITY) {
        const vScale = MAX_VELOCITY / vMag;
        vx *= vScale;
        vy *= vScale;
        vz *= vScale;
      }

      // 7. Colisiones con Límites (Planos de Contorno)
      // Plano horizontal en y = floorY (por defecto 0 ó floorY configurado):
      if (config.enableFloorCollision && nextY <= config.floorY) {
        // Detección: Si y_i <= 0 => y_i = 0
        nextY = config.floorY;

        // Rebote elástico/inelástico con coeficiente de restitución e:
        // v_y' = -e * v_y
        if (vy < 0) {
          vy = -config.restitutionE * vy;
        }

        // Amortiguamiento tangencial:
        // v_x' = (1 - mu_t) * v_x
        // v_z' = (1 - mu_t) * v_z
        const tangFactor = Math.max(0, 1 - config.tangentialDampingMu);
        vx = vx * tangFactor;
        vz = vz * tangFactor;

        // Ajustar rPrev para mantener consistencia física en Verlet tras el rebote
        p.rPrev.x = nextX - vx * dt;
        p.rPrev.y = nextY - vy * dt;
        p.rPrev.z = nextZ - vz * dt;
      }

      // Contorno lateral (caja de confinamiento opcional)
      if (config.enableBoxBoundary) {
        const halfW = config.boxHalfWidth;
        const topY = config.floorY + config.boxHeight;

        if (nextX <= -halfW) {
          nextX = -halfW;
          vx = -config.restitutionE * vx;
          p.rPrev.x = nextX - vx * dt;
        } else if (nextX >= halfW) {
          nextX = halfW;
          vx = -config.restitutionE * vx;
          p.rPrev.x = nextX - vx * dt;
        }

        if (nextZ <= -halfW) {
          nextZ = -halfW;
          vz = -config.restitutionE * vz;
          p.rPrev.z = nextZ - vz * dt;
        } else if (nextZ >= halfW) {
          nextZ = halfW;
          vz = -config.restitutionE * vz;
          p.rPrev.z = nextZ - vz * dt;
        }

        if (nextY >= topY) {
          nextY = topY;
          vy = -config.restitutionE * vy;
          p.rPrev.y = nextY - vy * dt;
        }
      }

      // Avanzar estado Verlet: rPrev = r, r = next
      p.rPrev.x = p.r.x;
      p.rPrev.y = p.r.y;
      p.rPrev.z = p.r.z;

      p.r.x = nextX;
      p.r.y = nextY;
      p.r.z = nextZ;

      p.v.x = vx;
      p.v.y = vy;
      p.v.z = vz;

      // Actualizar observables cuánticos y cinemáticos
      const speed = VectorMath.magnitude(p.v);
      p.kineticEnergyJ = 0.5 * p.mass * speed * speed;
      p.kineticEnergyEv = p.kineticEnergyJ / PHYSICAL_CONSTANTS.E_CHARGE;
      p.deBroglieWavelength = QuantumOrbitalDynamics.computeDeBroglieWavelength(speed, p.mass);

      // Registrar punto en estela (únicamente valores finitos y acotados)
      if (
        Number.isFinite(p.r.x) && Number.isFinite(p.r.y) && Number.isFinite(p.r.z) &&
        Math.abs(p.r.x) < 50 && Math.abs(p.r.y) < 50 && Math.abs(p.r.z) < 50
      ) {
        if (p.trail.length > 60) p.trail.shift();
        p.trail.push({ x: p.r.x, y: p.r.y, z: p.r.z });
      }
    }
  },
};

/**
 * 8. Proyección Gráfica 3D a 2D (Renderizado en Pantalla)
 * Transforma coordenadas espaciales (x, y, z) a coordenadas planas de pantalla (X_s, Y_s)
 * mediante perspectiva con distancia focal d y origen central (X_c, Y_c):
 * 
 * X_s = (x * d) / (z + d) + X_c
 * Y_s = (y * d) / (z + d) + Y_c
 */
export interface ProjectedPoint2D {
  Xs: number;
  Ys: number;
  visible: boolean;
  depthScale: number;
  rawDepth: number;
}

export function project3DTo2D(
  point: Vector3D,
  focalDistanceD: number,
  screenCenterX: number,
  screenCenterY: number,
  scaleFactor: number = 40.0
): ProjectedPoint2D {
  // Evitar división por cero o proyección detrás del punto focal
  const effectiveZ = point.z * scaleFactor;
  const denominator = effectiveZ + focalDistanceD;

  if (denominator <= 0.05) {
    return {
      Xs: screenCenterX,
      Ys: screenCenterY,
      visible: false,
      depthScale: 0,
      rawDepth: denominator,
    };
  }

  const factor = focalDistanceD / denominator;
  // Invertir Y porque en coordenadas de pantalla SVG/Canvas el eje Y va hacia abajo
  const Xs = (point.x * scaleFactor * focalDistanceD) / denominator + screenCenterX;
  const Ys = (-point.y * scaleFactor * focalDistanceD) / denominator + screenCenterY;

  return {
    Xs,
    Ys,
    visible: true,
    depthScale: factor,
    rawDepth: denominator,
  };
}

/**
 * Creador de partículas preconfiguradas con datos de la física fundamental
 */
export function createPhysicalParticle(
  type: 'electron' | 'proton' | 'neutron' | 'alpha' | 'ion' | 'test',
  initialR: Vector3D,
  initialV: Vector3D,
  customName?: string
): ParticleKinematicState {
  let mass = PHYSICAL_CONSTANTS.M_E;
  let charge = PHYSICAL_CONSTANTS.Q_E;
  let displayRadius = 0.14;
  let color = '#22d3ee';
  let name = customName || 'Electrón e⁻';

  if (type === 'proton') {
    mass = PHYSICAL_CONSTANTS.M_P;
    charge = PHYSICAL_CONSTANTS.E_CHARGE;
    displayRadius = 0.22;
    color = '#ef4444';
    name = customName || 'Protón p⁺';
  } else if (type === 'neutron') {
    mass = PHYSICAL_CONSTANTS.M_P;
    charge = 0;
    displayRadius = 0.22;
    color = '#3b82f6';
    name = customName || 'Neutrón n⁰';
  } else if (type === 'alpha') {
    mass = PHYSICAL_CONSTANTS.M_ALPHA;
    charge = 2 * PHYSICAL_CONSTANTS.E_CHARGE;
    displayRadius = 0.32;
    color = '#fbbf24';
    name = customName || 'Partícula Alfa ⁴He²⁺';
  } else if (type === 'test') {
    mass = PHYSICAL_CONSTANTS.M_E;
    charge = -PHYSICAL_CONSTANTS.E_CHARGE;
    displayRadius = 0.16;
    color = '#a855f7';
    name = customName || 'Carga de Prueba q';
  }

  const dtInit = 0.016;
  // Inicialización de rPrev consistente con v inicial: rPrev = r - v * dt
  const rPrev: Vector3D = {
    x: initialR.x - initialV.x * dtInit,
    y: initialR.y - initialV.y * dtInit,
    z: initialR.z - initialV.z * dtInit,
  };

  const speed = VectorMath.magnitude(initialV);

  return {
    id: `part_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    type,
    r: { ...initialR },
    rPrev,
    v: { ...initialV },
    a: VectorMath.zero(),
    mass,
    charge,
    displayRadius,
    color,
    trail: [{ ...initialR }],
    kineticEnergyJ: 0.5 * mass * speed * speed,
    kineticEnergyEv: (0.5 * mass * speed * speed) / PHYSICAL_CONSTANTS.E_CHARGE,
    deBroglieWavelength: QuantumOrbitalDynamics.computeDeBroglieWavelength(speed, mass),
  };
}

export const QUANTUM_SHELL_COLORS = [
  '#22d3ee', // K (n=1) - Cyan
  '#38bdf8', // L (n=2) - Sky
  '#818cf8', // M (n=3) - Indigo
  '#c084fc', // N (n=4) - Purple
  '#f472b6', // O (n=5) - Pink
  '#fb7185', // P (n=6) - Rose
  '#fbbf24', // Q (n=7) - Amber
];

/**
 * Genera un sistema atómico físico 3D completo compuesto por:
 * 1. Núcleo central masivo (Z protones + N neutrones) de carga +Z*e
 * 2. Corteza electrónica multiesférica distribuida en niveles cuánticos n=1, 2, 3...
 */
export function generateAtomParticleSystem(
  z: number,
  n: number,
  electronCount: number,
  elementSymbol: string = 'X',
  elementName: string = 'Átomo'
): ParticleKinematicState[] {
  const particles: ParticleKinematicState[] = [];
  const massNumber = Math.max(1, z + n);

  // 1. Núcleo central fijo con masa nuclear M = Z*m_p + N*m_n y carga neta +Z*e
  const nuclearRadius = Math.min(0.65, Math.max(0.24, Math.cbrt(massNumber) * 0.08 + 0.16));
  const nucleusMass = (z * PHYSICAL_CONSTANTS.M_P) + (n * PHYSICAL_CONSTANTS.M_P);
  const nucleusCharge = z * PHYSICAL_CONSTANTS.E_CHARGE;

  const nucleusParticle: ParticleKinematicState = {
    id: `nucleus_${z}_${n}`,
    name: `Núcleo ${elementName}-${massNumber} (${elementSymbol})`,
    type: 'proton',
    r: { x: 0, y: 0, z: 0 },
    rPrev: { x: 0, y: 0, z: 0 },
    v: { x: 0, y: 0, z: 0 },
    a: { x: 0, y: 0, z: 0 },
    mass: nucleusMass,
    charge: nucleusCharge,
    displayRadius: nuclearRadius,
    color: '#ef4444',
    fixed: true,
    trail: [{ x: 0, y: 0, z: 0 }]
  };
  particles.push(nucleusParticle);

  if (electronCount <= 0) {
    return particles;
  }

  // 2. Distribución cuántica de electrones en capas cuánticas principales (Bohr & Aufbau)
  // Capacidades de capa: K(2), L(8), M(18), N(32), O(32)...
  const shellCaps = [2, 8, 18, 32, 32, 18, 8];
  let remainingElectrons = electronCount;

  let currentN = 1;
  let electronGlobalIndex = 0;

  while (remainingElectrons > 0 && currentN <= 7) {
    const maxInShell = shellCaps[currentN - 1] || 32;
    const countInThisShell = Math.min(remainingElectrons, maxInShell);

    // Radio de la órbita n (cuantización espacial semi-clásica)
    // En simulación normalizada: espaciamiento visual diferenciado por capas
    const shellRadius = 1.35 + (currentN - 1) * 0.85;
    
    // Velocidad orbital tangencial v = sqrt(Z_eff * e^2 / (4*pi*eps0 * m_e * r))
    // Aplicando apantallamiento nuclear aproximado Z_eff
    const zEff = Math.max(1, z - (currentN > 1 ? 2 : 0) - (currentN > 2 ? 8 : 0));
    const baseOrbitalSpeed = Math.sqrt(zEff / shellRadius) * 2.2;

    for (let k = 0; k < countInThisShell; k++) {
      electronGlobalIndex++;
      
      // Para crear una nube cuántica 3D no plana, inclinamos la órbita de cada electrón en el espacio
      // Ángulo azimutal de posición inicial en su plano orbital
      const theta = (k / countInThisShell) * 2 * Math.PI;
      // Inclinación espacial 3D de la órbita (reparto esférico de momentos angulares)
      const inclination = ((k * 1.6180339887) % 1) * Math.PI - Math.PI / 2;
      const phiNode = ((k * 0.6180339887) % 1) * 2 * Math.PI;

      // Coordenadas locales en el plano orbital:
      const xOrb = shellRadius * Math.cos(theta);
      const zOrb = shellRadius * Math.sin(theta);

      // Velocidad local tangencial perpendicular al radio vector (dx/dt = -v*sin, dz/dt = v*cos)
      const vxOrb = -baseOrbitalSpeed * Math.sin(theta);
      const vzOrb = baseOrbitalSpeed * Math.cos(theta);

      // Rotación 3D por la inclinación (alrededor de X) y nodo ascendente (alrededor de Y)
      const cosInc = Math.cos(inclination);
      const sinInc = Math.sin(inclination);
      const cosNode = Math.cos(phiNode);
      const sinNode = Math.sin(phiNode);

      // Rotación combinada
      const xRot1 = xOrb;
      const yRot1 = -zOrb * sinInc;
      const zRot1 = zOrb * cosInc;

      const posX = xRot1 * cosNode - zRot1 * sinNode;
      const posY = yRot1;
      const posZ = xRot1 * sinNode + zRot1 * cosNode;

      const vxRot1 = vxOrb;
      const vyRot1 = -vzOrb * sinInc;
      const vzRot1 = vzOrb * cosInc;

      const velX = vxRot1 * cosNode - vzRot1 * sinNode;
      const velY = vyRot1;
      const velZ = vxRot1 * sinNode + vzRot1 * cosNode;

      const shellNames = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
      const shellName = shellNames[currentN - 1] || `n=${currentN}`;
      const color = QUANTUM_SHELL_COLORS[(currentN - 1) % QUANTUM_SHELL_COLORS.length];

      const electron = createPhysicalParticle(
        'electron',
        { x: posX, y: posY, z: posZ },
        { x: velX, y: velY, z: velZ },
        `Electrón e⁻ (${shellName}, #${k + 1})`
      );
      electron.principalQuantumN = currentN;
      electron.color = color;
      electron.orbitalBohrRadius = shellRadius;
      electron.displayRadius = 0.12;

      particles.push(electron);
    }

    remainingElectrons -= countInThisShell;
    currentN++;
  }

  return particles;
}
