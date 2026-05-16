import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen() {
  const [visible, setVisible] = useState(() => !sessionStorage.getItem("mbp_splash"));

  useEffect(() => {
    if (!visible) return;
    sessionStorage.setItem("mbp_splash", "1");
    const t = setTimeout(() => setVisible(false), 1900);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center select-none"
          style={{ background: "linear-gradient(150deg, #061208 0%, #0c1f14 50%, #051810 100%)" }}
        >
          {/* Halo derrière le logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(52,211,153,0.18) 0%, transparent 70%)" }}
          />

          {/* Logo */}
          <motion.img
            src="/Logo Redesign1.webp"
            alt="Ma Belle Promo"
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-20 h-20 rounded-full mb-6"
            style={{ boxShadow: "0 0 50px rgba(52,211,153,0.35), 0 8px 32px rgba(0,0,0,0.6)" }}
          />

          {/* Nom */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center relative"
          >
            <div className="font-heading text-2xl font-black tracking-tight text-white mb-1">
              Ma Belle Promo
            </div>
            <div className="text-[10px] tracking-[0.32em] uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
              FDD · MBP · Togo
            </div>
          </motion.div>

          {/* Ligne dorée */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{
              height: 1,
              width: 72,
              marginTop: 22,
              background: "linear-gradient(to right, transparent, #fbbf24, transparent)",
              transformOrigin: "center",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
