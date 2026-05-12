import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText } from "lucide-react";

export default function AttestationDialog({ member, onConfirm, onCancel }) {
  const defaultDate = `${new Date().getFullYear()}-12-31`;
  const [validUntil, setValidUntil] = useState(defaultDate);

  return (
    <AnimatePresence>
      {member && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background border border-border rounded-2xl p-6 shadow-2xl w-full max-w-sm"
          >
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Générer une attestation</h3>
                <p className="text-muted-foreground text-sm mt-0.5">{member.nom}</p>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                Valide jusqu'au
              </label>
              <input
                type="date"
                value={validUntil}
                min={new Date().toISOString().slice(0, 10)}
                onChange={e => setValidUntil(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-muted transition-colors">
                Annuler
              </button>
              <button onClick={() => onConfirm(validUntil)}
                className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors">
                Générer
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
