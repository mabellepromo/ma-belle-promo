import { motion } from "framer-motion";
import { X, Printer, Check } from "lucide-react";
import CharteContent from "./CharteContent";
import { genererCharteBenevolat } from "@/lib/documentGenerators";

// Modale plein écran (mobile) / centrée (desktop) affichant la charte.
// onAccept (optionnel) : si fourni, affiche le bouton « J'accepte ».
export default function CharterModal({ onClose, onAccept }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-stretch sm:items-center justify-center bg-black/60 sm:p-6"
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-background w-full sm:max-w-3xl sm:rounded-2xl flex flex-col max-h-screen sm:max-h-[88vh] overflow-hidden shadow-2xl">

        {/* En-tête collant */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <h2 className="font-heading text-lg font-bold text-foreground">Charte de bénévolat</h2>
          <button onClick={onClose} aria-label="Fermer"
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Corps défilant */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <CharteContent showSommaire={false} />
        </div>

        {/* Pied collant */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border flex-shrink-0 flex-wrap">
          <button onClick={onClose}
            className="px-4 h-10 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
            Fermer
          </button>
          <button onClick={() => genererCharteBenevolat()}
            className="inline-flex items-center gap-1.5 px-4 h-10 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
            <Printer className="w-4 h-4" /> Imprimer / PDF
          </button>
          {onAccept && (
            <button onClick={onAccept}
              className="inline-flex items-center gap-1.5 px-5 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
              <Check className="w-4 h-4" /> J'accepte
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
