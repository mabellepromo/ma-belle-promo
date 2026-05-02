import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowDown, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";

const stats = [
  { value: "2018", label: "Fondée en" },
  { value: "45+", label: "Membres actifs" },
  { value: "10+", label: "Projets réalisés" },
  { value: "8 ans", label: "D'engagement" },
];

/* ══ BULLE D'EAU ══ */
/** @param {{ children: import("react").ReactNode }} props */
function WaterBubble({ children }) {
  const D = 280;
  const shouldReduce = useReducedMotion();
  return (
    <div style={{ position: "relative", width: D, height: D, overflow: "hidden", borderRadius: "50%" }}>
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          animate={shouldReduce ? {} : { scale: [0.85, 2.2], opacity: [0.45, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: i * 1.8, ease: "easeOut" }}
          style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "1.5px solid rgba(144,255,180,0.30)",
          }}
        />
      ))}
      <motion.div
        animate={shouldReduce ? {} : { scale: [1, 1.015, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: `radial-gradient(ellipse at 38% 32%,
            rgba(255,255,255,0.28) 0%,
            rgba(180,255,220,0.12) 30%,
            rgba(0,120,60,0.10) 60%,
            rgba(0,40,20,0.22) 100%)`,
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1.5px solid rgba(255,255,255,0.20)",
          boxShadow: [
            "inset 0 6px 50px rgba(255,255,255,0.10)",
            "inset 0 -8px 40px rgba(0,80,40,0.25)",
            "0 25px 70px rgba(0,0,0,0.35)",
          ].join(", "),
        }}
      />
      {/* reflet */}
      <div style={{
        position: "absolute", top: "12%", left: "17%", width: "42%", height: "26%",
        background: "radial-gradient(ellipse at 40% 40%, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0.18) 40%, transparent 70%)",
        borderRadius: "50%", filter: "blur(5px)", transform: "rotate(-25deg)",
      }} />
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", zIndex: 10,
      }}>
        {children}
      </div>
    </div>
  );
}

export default function HeroSection() {
  const ref = useRef(null);
  const shouldReduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(150deg, var(--brand-dark) 0%, var(--brand-dark-light) 40%, var(--brand-dark-mid) 70%, hsl(150,28%,6%) 100%)" }}
    >
      {/* Image fond subtile */}
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <img
          src="/images/conference.jpg"
          alt=""
          fetchPriority="high"
          className="w-full h-full object-cover scale-110"
          style={{ opacity: 0.07, mixBlendMode: "luminosity" }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(150deg, hsla(150,30%,7%,0.88) 0%, hsla(150,32%,12%,0.70) 50%, hsla(150,28%,6%,0.90) 100%)",
        }} />
      </motion.div>

      {/* Lumières ambiantes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={shouldReduce ? {} : { x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.25, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", top: "10%", left: "5%",
            width: 600, height: 600, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(52,211,153,0.10) 0%, transparent 65%)",
          }}
        />
        <motion.div
          animate={shouldReduce ? {} : { x: [0, -30, 0], y: [0, 50, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          style={{
            position: "absolute", bottom: "10%", right: "10%",
            width: 450, height: 450, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 65%)",
          }}
        />
      </div>

      {/* Grille déco */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(52,211,153,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.03) 1px, transparent 1px)",
        backgroundSize: "70px 70px",
      }} />

      {/* ══ CONTENU ══ */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 pt-28 pb-16 max-w-7xl mx-auto w-full"
      >
        {/* ── Grille responsive : 1 col mobile / 2 col md / 3 col lg ── */}
        <div className="grid md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_340px] gap-8 md:gap-10 lg:gap-14 items-center">

          {/* ── COL 1 : Bulle + titre ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.34, 1.56, 0.64, 1] }}
            className="flex flex-col items-center gap-6"
          >
            {/* Badge centré sur la bulle */}
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-center"
                style={{ color: "#6ee7b7", background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.28)" }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 align-middle" style={{ boxShadow: "0 0 6px #34d399" }} />
                Association des Diplômés FDD · Lomé, Togo
              </span>
            </motion.div>

            <WaterBubble>
              <motion.img
                src="/Logo Redesign1.webp"
                alt="Ma Belle Promo"
                fetchPriority="high"
                initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                style={{
                  width: 64, height: 64, marginBottom: 12,
                  filter: "drop-shadow(0 0 20px rgba(100,255,180,0.40)) drop-shadow(0 4px 10px rgba(0,0,0,0.4))",
                }}
              />
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                style={{ textAlign: "center", padding: "0 22px" }}
              >
                <div style={{
                  fontSize: 24, fontWeight: 900, color: "rgba(255,255,255,0.95)",
                  lineHeight: 1.1, letterSpacing: "-0.02em", textShadow: "0 2px 16px rgba(0,0,0,0.4)",
                }}>
                  Ma Belle
                  <br />
                  <span style={{
                    background: "linear-gradient(90deg, #fbbf24, #fef3c7, #f59e0b)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>Promo</span>
                </div>
                <div style={{
                  fontSize: 8, color: "rgba(255,255,255,0.40)",
                  letterSpacing: "0.22em", textTransform: "uppercase", marginTop: 8,
                }}>
                  FDD · Lomé · 1994–2000
                </div>
              </motion.div>
            </WaterBubble>

            {/* Stats sous la bulle */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.1 }}
              className="grid grid-cols-2 gap-2 w-full"
            >
              {stats.map((s, i) => (
                <div key={i} className="text-center rounded-xl py-2.5 px-2"
                  style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.12)" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "white", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: "rgba(110,231,183,0.55)", marginTop: 4, letterSpacing: "0.10em", textTransform: "uppercase" }}>{s.label}</div>
                </div>
              ))}
            </motion.div>

            {/* ── Présidente compacte — sous les stats, cachée sur lg ── */}
            <div className="lg:hidden w-full flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
                style={{ border: "2px solid rgba(52,211,153,0.50)", boxShadow: "0 0 12px rgba(52,211,153,0.20)" }}>
                <img src="/images/membres/fabienne.webp" alt="Fabienne SENAYA-ATAYI"
                  className="w-full h-full object-cover object-top" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-heading text-sm font-bold leading-tight truncate">Fabienne SENAYA-ATAYI</p>
                <p className="text-xs mt-0.5" style={{ color: "#6ee7b7" }}>Présidente · Ma Belle Promo</p>
              </div>
            </div>
          </motion.div>

          {/* ── COL 2 : Titre + message + CTAs ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="font-heading leading-none mb-1 text-center md:text-left"
              style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", fontWeight: 900, color: "rgba(255,255,255,0.95)", letterSpacing: "-0.04em" }}>
              L'excellence juridique partagée,
            </h1>
            <h1 className="font-heading leading-none mb-6 text-center md:text-left"
              style={{
                fontSize: "clamp(2.2rem, 5vw, 4rem)", fontWeight: 900, letterSpacing: "-0.04em",
                background: "linear-gradient(90deg, #34d399, #6ee7b7, #fbbf24)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
              au service de l'avenir
            </h1>

            {/* Citation présidente */}
            <div className="relative mb-8 pl-5"
              style={{ borderLeft: "2px solid rgba(52,211,153,0.45)" }}>
              <span className="block text-4xl font-serif leading-none mb-2" style={{ color: "#6ee7b7", opacity: 0.6 }}>"</span>
              <blockquote className="font-heading text-lg md:text-xl leading-relaxed font-semibold mb-4"
                style={{ color: "rgba(255,255,255,0.88)" }}>
                Chaque membre de Ma Belle Promo porte la conviction que le droit et la solidarité sont les piliers d'une société plus juste et ambitieuse.
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-6 h-px" style={{ background: "#34d399" }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: "#6ee7b7" }}>Fabienne SENAYA-ATAYI</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Présidente de Ma Belle Promo</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <button
                onClick={() => document.querySelector("#mission")?.scrollIntoView({ behavior: "smooth" })}
                className="group flex items-center gap-2 justify-center font-bold text-sm rounded-full transition-all"
                style={{
                  padding: "14px 28px",
                  background: "linear-gradient(135deg, rgba(52,211,153,0.30), rgba(52,211,153,0.18))",
                  border: "1.5px solid rgba(52,211,153,0.55)",
                  color: "#6ee7b7",
                  boxShadow: "0 4px 20px rgba(52,211,153,0.15)",
                }}
              >
                Notre mission <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <Link to="/implications/soutenir"
                className="flex items-center gap-2 justify-center font-bold text-sm rounded-full transition-all"
                style={{
                  padding: "14px 28px",
                  background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                  color: "#000",
                  boxShadow: "0 4px 20px rgba(251,191,36,0.40)",
                }}>
                Nous soutenir
              </Link>
            </div>

          </motion.div>

          {/* ── COL 3 : Photo présidente ── */}
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.94 }} animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.34, 1.1, 0.64, 1] }}
            className="relative hidden lg:flex flex-col items-center"
          >
            {/* Cadres décalés */}
            <div className="absolute top-8 right-3 left-3 bottom-0 rounded-3xl"
              style={{ background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.18)" }} />
            <div className="absolute -top-1 right-0 left-6 bottom-4 rounded-3xl"
              style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.15)" }} />

            {/* Photo */}
            <div className="relative z-10 w-full rounded-3xl overflow-hidden"
              style={{ aspectRatio: "3/4", boxShadow: "0 24px 60px rgba(0,0,0,0.40), 0 0 0 1.5px rgba(255,255,255,0.10)" }}>
              <img
                src="/images/membres/fabienne.webp"
                alt="Fabienne SENAYA-ATAYI — Présidente"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute bottom-0 left-0 right-0 h-1/3"
                style={{ background: "linear-gradient(to top, hsla(150,30%,7%,0.82) 0%, transparent 100%)" }} />
              <div className="absolute bottom-4 left-4 right-4 rounded-xl px-4 py-3"
                style={{ background: "rgba(0,0,0,0.22)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <p className="text-white font-heading text-sm font-bold leading-tight">Fabienne SENAYA-ATAYI</p>
                <p className="text-xs mt-0.5" style={{ color: "#6ee7b7" }}>Présidente · Ma Belle Promo</p>
              </div>
            </div>

            {/* Carte flottante */}
            <motion.div
              animate={{ y: [0, -7, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-3 -right-4 z-20 rounded-2xl px-3 py-2.5 flex items-center gap-2.5"
              style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
              <span className="text-lg">🏛️</span>
              <div>
                <p className="text-xs font-bold text-white">Ma Belle Promo</p>
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>Fondée en 2018</p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </motion.div>

      {/* ── Fondu bas vers bg-background ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-20"
        style={{ background: "linear-gradient(to bottom, transparent 0%, hsl(var(--background)) 100%)" }}
      />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:block"
        style={{ color: "rgba(52,211,153,0.35)" }}
      >
        <motion.div animate={{ y: [0, 9, 0] }} transition={{ duration: 2.2, repeat: Infinity }}>
          <ArrowDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}
