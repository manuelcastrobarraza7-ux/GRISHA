export interface DiscoveredNucleus {
  id: string;
  z: number;
  n: number;
  electrons: number;
  symbol: string;
  name: string;
  massNumber: number;
  charge: number;
  chargeLabel: string;
  electronConfig: string;
  stability: 'Estable' | 'Radiactivo β⁻' | 'Radiactivo β⁺' | 'Inestable';
  unlockedAt: string;
  missionSource?: string;
}

const STORAGE_KEY = 'espiquumeyria_discovered_library_v1';

export function getDiscoveredLibrary(): DiscoveredNucleus[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error loading discovered library:', e);
  }

  // Initial seeds if empty
  const defaultSeeds: DiscoveredNucleus[] = [
    {
      id: 'nucleo-1-0-1',
      z: 1,
      n: 0,
      electrons: 1,
      symbol: 'H',
      name: 'Hidrógeno-1 (Protio)',
      massNumber: 1,
      charge: 0,
      chargeLabel: 'NEUTRO',
      electronConfig: '1s¹',
      stability: 'Estable',
      unlockedAt: new Date().toISOString(),
      missionSource: 'Misión Inicial de Bienvenida'
    },
    {
      id: 'nucleo-2-2-0',
      z: 2,
      n: 2,
      electrons: 0,
      symbol: 'He',
      name: 'Helio-4 (Partícula Alfa)',
      massNumber: 4,
      charge: 2,
      chargeLabel: 'CATIÓN 2+',
      electronConfig: 'sin electrones',
      stability: 'Estable',
      unlockedAt: new Date().toISOString(),
      missionSource: 'Misión Inicial de Partículas Alfa'
    }
  ];
  saveDiscoveredLibrary(defaultSeeds);
  return defaultSeeds;
}

export function saveDiscoveredLibrary(items: DiscoveredNucleus[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('espiquumeyria_library_updated', { detail: items }));
  } catch (e) {
    console.warn('Error saving discovered library:', e);
  }
}

export function addDiscoveredToLibrary(item: Omit<DiscoveredNucleus, 'id' | 'unlockedAt'>): { added: boolean; item: DiscoveredNucleus } {
  const current = getDiscoveredLibrary();
  const id = `nucleo-${item.z}-${item.n}-${item.electrons}`;
  
  const existingIndex = current.findIndex(c => c.id === id);
  const fullItem: DiscoveredNucleus = {
    ...item,
    id,
    unlockedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    // Update existing
    current[existingIndex] = {
      ...current[existingIndex],
      ...item
    };
    saveDiscoveredLibrary(current);
    return { added: false, item: current[existingIndex] };
  } else {
    // Add new
    const updated = [fullItem, ...current];
    saveDiscoveredLibrary(updated);
    return { added: true, item: fullItem };
  }
}

export function isItemInLibrary(z: number, n: number, electrons: number): boolean {
  const current = getDiscoveredLibrary();
  const id = `nucleo-${z}-${n}-${electrons}`;
  return current.some(c => c.id === id);
}
