import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function PageHero({ title, subtitle }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yGrid   = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const yHalo1  = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const yHalo2  = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const yContent = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const opacity  = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <div ref={ref} className="relative pt-28 pb-10 text-center overflow-hidden bg-foreground">
      {/* Grille de points — parallaxe lente */}
      <motion.div style={{ y: yGrid }} className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </motion.div>

      {/* Halos lumineux — parallaxe rapide */}
      <motion.div style={{ y: yHalo1 }} className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <motion.div style={{ y: yHalo2 }} className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

      {/* Contenu — descend et s'efface au scroll */}
      <motion.div style={{ y: yContent, opacity }} className="relative z-10 max-w-3xl mx-auto px-6">
        {subtitle && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm max-w-full">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse flex-shrink-0" />
            <span className="eyebrow text-white/80 truncate">{subtitle}</span>
          </div>
        )}

        <h1 className="font-heading text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight">
          {title}
        </h1>

        <div className="flex items-center justify-center gap-3 mt-5">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-accent/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent/60" />
        </div>
      </motion.div>

      {/* Fondu vers la section suivante */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-background pointer-events-none" />
    </div>
  );
}
