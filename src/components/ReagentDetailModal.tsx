import React, { useMemo } from 'react';
import { ChemicalReagent } from '../data/chemicals';
import { SafetyCard } from './SafetyCard';
import { ChemicalText } from './ChemicalLatex';
import { X, Plus, Check, Boxes, Sparkles } from 'lucide-react';

interface ReagentDetailModalProps {
  reagent: ChemicalReagent | null;
  onClose: () => void;
  onAddToSequence: (reagent: ChemicalReagent) => void;
  isAlreadySelected: boolean;
  onNavigateToMolecularViewer?: (moleculeId: string) => void;
}

export const ReagentDetailModal: React.FC<ReagentDetailModalProps> = ({
  reagent,
  onClose,
  onAddToSequence,
  isAlreadySelected,
  onNavigateToMolecularViewer,
}) => {
  if (!reagent) return null;

  // Match reagent with known 2D/3D molecular visualizer models
  const matchedMoleculeId = useMemo(() => {
    const rId = reagent.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    const rFormula = reagent.formula.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (rId.includes('caio32') || rFormula.includes('caio32')) return 'ca_io3_2';
    if (rId.includes('srio32') || rFormula.includes('srio32')) return 'sr_io3_2';
    if (rId.includes('baio32') || rFormula.includes('baio32')) return 'ba_io3_2';
    if (rId.includes('kio3') || rFormula.includes('kio3')) return 'kio3';
    if (rId.includes('nacl') || rFormula.includes('nacl')) return 'nacl';
    if (rId.includes('cacl2') || rFormula.includes('cacl2')) return 'cacl2';
    if (rId.includes('cuso4') || rFormula.includes('cuso4')) return 'cuso4';
    if (rId.includes('kno3') || rFormula.includes('kno3')) return 'kno3';
    if (rId.includes('caf2') || rFormula.includes('caf2')) return 'caf2';
    if (rId.includes('kcl') || rFormula.includes('kcl')) return 'kcl_flux';
    if (rId.includes('na2b4o7') || rFormula.includes('na2b4o7') || rId.includes('borax')) return 'borax_flux';
    if (rId.includes('na3alf6') || rFormula.includes('na3alf6') || rId.includes('cryolite')) return 'cryolite';
    if (rId.includes('cao') || rFormula.includes('cao')) return 'cao_flux';
    if (rId.includes('sio2') || rFormula.includes('sio2')) return 'sio2_flux';
    if (rId.includes('na2co3') || rFormula.includes('na2co3')) return 'na2co3_flux';
    if (rId.includes('zncl2') || rFormula.includes('zncl2')) return 'zncl2_flux';
    return null;
  }, [reagent]);

  const handleOpenMolecularViewer = () => {
    if (!matchedMoleculeId) return;
    onClose();
    if (onNavigateToMolecularViewer) {
      onNavigateToMolecularViewer(matchedMoleculeId);
    } else {
      window.location.hash = `/molecular-viewer?id=${matchedMoleculeId}&view=3d`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080d14]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b111a] border border-cyan-500/30 rounded-2xl max-w-2xl w-full p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-slate-800 pb-3 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <ChemicalText formula={reagent.formula} name={reagent.nombre} className="text-xl font-bold text-cyan-400" />
            <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {reagent.categoria}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {reagent.molarMass ? `${reagent.molarMass} g/mol` : ''}
            </span>
            {matchedMoleculeId && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Modelo 2D/3D Disponible</span>
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-white mt-1">{reagent.nombre}</h2>
        </div>

        {/* Context description */}
        <div className="bg-[#070b12] border border-slate-800 rounded-lg p-3 text-xs leading-relaxed text-slate-300 mb-4 space-y-1.5">
          <p className="font-semibold text-slate-200">{reagent.contexto.general}</p>
          {reagent.contexto.agricultura && (
            <p className="text-emerald-300">
              <strong className="text-emerald-400">Agricultura:</strong> {reagent.contexto.agricultura}
            </p>
          )}
          {reagent.contexto.mineralogia && (
            <p className="text-purple-300">
              <strong className="text-purple-400">Mineralogía:</strong> {reagent.contexto.mineralogia}
            </p>
          )}
          {reagent.contexto.industria && (
            <p className="text-blue-300">
              <strong className="text-blue-400">Industria:</strong> {reagent.contexto.industria}
            </p>
          )}
        </div>

        {/* Safety & Logistics Card */}
        <SafetyCard
          productName={`${reagent.nombre} (${reagent.formula})`}
          hazardClass={reagent.hazardClass}
          unNumber={reagent.unNumber}
          kemlerCode={reagent.kemlerCode}
          adrTunnelCode={reagent.adrTunnelCode}
          tunnelReason={reagent.tunnelDescription}
          nfpa={reagent.nfpa}
          ppe={reagent.ppe}
          storage={reagent.storage.conditions}
          stability={`Incompatibles: ${reagent.storage.incompatibles.join(', ')}`}
          className="mb-4"
        />

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div>
            {matchedMoleculeId && (
              <button
                type="button"
                onClick={handleOpenMolecularViewer}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-mono font-bold transition shadow-md hover:shadow-cyan-500/20 cursor-pointer active:scale-95"
                title="Abrir en el Visualizador Molecular 2D y 3D"
              >
                <Boxes className="w-4 h-4 text-cyan-400" />
                <span>Explorar Estructura 2D/3D</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono transition cursor-pointer"
            >
              Cerrar
            </button>

            <button
              onClick={() => {
                onAddToSequence(reagent);
                onClose();
              }}
              className={`px-4 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                isAlreadySelected
                  ? 'bg-slate-800 text-slate-400 hover:text-white'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-md'
              }`}
            >
              {isAlreadySelected ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Añadir de nuevo a la cadena</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar a la Secuencia</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
