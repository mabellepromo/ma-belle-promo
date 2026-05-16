import { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

export default function TiltCard({ children, className, style, intensity = 9 }) {
  const ref = useRef(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(
    useTransform(mouseY, [0, 1], [intensity, -intensity]),
    { stiffness: 350, damping: 30 }
  );
  const rotateY = useSpring(
    useTransform(mouseX, [0, 1], [-intensity, intensity]),
    { stiffness: 350, damping: 30 }
  );
  const glareOpacity = useMotionValue(0);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    mouseX.set(nx);
    mouseY.set(ny);
    glareOpacity.set(1);
    ref.current.style.setProperty("--gx", `${nx * 100}%`);
    ref.current.style.setProperty("--gy", `${ny * 100}%`);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
    glareOpacity.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", willChange: "transform", ...style }}
      className={className}
    >
      {/* Reflet lumineux qui suit la souris */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          pointerEvents: "none",
          zIndex: 10,
          opacity: glareOpacity,
          background: "radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,0.10) 0%, transparent 55%)",
        }}
      />
      {children}
    </motion.div>
  );
}
