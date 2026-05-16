import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CursorGlow() {
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  const dotX  = useSpring(mouseX, { stiffness: 1200, damping: 40 });
  const dotY  = useSpring(mouseY, { stiffness: 1200, damping: 40 });
  const ringX = useSpring(mouseX, { stiffness: 150, damping: 22 });
  const ringY = useSpring(mouseY, { stiffness: 150, damping: 22 });

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setActive(true);
    document.documentElement.style.cursor = "none";

    const onMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const onEnter = (e) => {
      if (e.target.closest("a, button, [role='button'], input, select, textarea")) {
        setHovered(true);
      }
    };
    const onLeave = (e) => {
      if (e.target.closest("a, button, [role='button'], input, select, textarea")) {
        setHovered(false);
      }
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
      document.documentElement.style.cursor = "";
    };
  }, []);

  if (!active) return null;

  return (
    <>
      {/* Point central — suit immédiatement */}
      <motion.div
        style={{
          position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 9999,
          x: dotX, y: dotY,
          translateX: "-50%", translateY: "-50%",
          width: hovered ? 8 : 5,
          height: hovered ? 8 : 5,
          borderRadius: "50%",
          background: hovered ? "#fbbf24" : "#34d399",
          transition: "width 0.2s, height 0.2s, background 0.2s",
          mixBlendMode: "screen",
        }}
      />
      {/* Anneau — suit avec retard */}
      <motion.div
        style={{
          position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 9998,
          x: ringX, y: ringY,
          translateX: "-50%", translateY: "-50%",
          width: hovered ? 44 : 28,
          height: hovered ? 44 : 28,
          borderRadius: "50%",
          border: hovered ? "1.5px solid rgba(251,191,36,0.60)" : "1.5px solid rgba(52,211,153,0.40)",
          transition: "width 0.25s ease, height 0.25s ease, border-color 0.2s",
          backdropFilter: "none",
        }}
      />
    </>
  );
}
