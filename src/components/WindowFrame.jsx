/**
 * WindowFrame — cadre arrondi permanent (95% de l'écran)
 *
 * Overlay fixed avec box-shadow géant qui masque les 5% de bordure.
 * pointer-events: none → aucun clic bloqué, fixed elements préservés.
 */
import { useEffect } from "react";

export function WindowFrame() {
  useEffect(() => {
    document.body.style.background = "#cce3d8";
    return () => { document.body.style.background = ""; };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top:    "1.6vh",
        left:   "1.4vw",
        right:  "1.4vw",
        bottom: "1.6vh",
        borderRadius: 22,
        pointerEvents: "none",
        zIndex: 99990,
        boxShadow: `
          0 0 0 200vmax #cce3d8,
          0 0 0 1px rgba(80,160,130,0.25),
          0 16px 40px rgba(30,100,70,0.15)
        `,
      }}
    />
  );
}
