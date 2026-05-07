import { useEffect } from "react";

export function WindowFrame() {
  useEffect(() => {
    document.body.style.background = "#cce3d8";
    return () => { document.body.style.background = ""; };
  }, []);

  // inset box-shadow : reste à l'INTÉRIEUR de l'élément → zéro débordement hors viewport.
  // (L'approche "outward shadow" sur un fixed element échappe au clip du viewport sur Safari.)
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        borderRadius: 22,
        pointerEvents: "none",
        zIndex: 99990,
        boxShadow: [
          "inset 0 0 0 max(0.5vw, 4px) #cce3d8",
          "inset 0 0 0 calc(max(0.5vw, 4px) + 1px) rgba(80,160,130,0.22)",
        ].join(", "),
      }}
    />
  );
}
