import { useState, useCallback, useRef } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";

/**
 * Usage:
 *   const { confirm, ConfirmEl } = useConfirm();
 *   // In component JSX: {ConfirmEl}
 *   // In handler: if (!await confirm("Titre", "Message", "Libellé bouton")) return;
 */
export function useConfirm() {
  const [state, setState] = useState({ open: false, title: "", message: "", confirmLabel: "Supprimer" });
  const resolveRef = useRef(null);

  const confirm = useCallback((title, message = "", confirmLabel = "Supprimer") => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ open: true, title, message, confirmLabel });
    });
  }, []);

  function handleConfirm() {
    setState(s => ({ ...s, open: false }));
    resolveRef.current?.(true);
  }

  function handleCancel() {
    setState(s => ({ ...s, open: false }));
    resolveRef.current?.(false);
  }

  const ConfirmEl = (
    <ConfirmDialog
      open={state.open}
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, ConfirmEl };
}
