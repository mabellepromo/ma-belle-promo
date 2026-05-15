import { motion, useScroll, useTransform, useReducedMotion, useInView } from "framer-motion";
import { ArrowDown, ChevronRight, Scale } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";

const MotionLink = motion(Link);

const thisYear = new Date().getFullYear();
const stats = [
  { from: 2016, to: 2018, suffix: "", label: "Fondée en" },
  { from: 0, to: 6, suffix: "+", label: "Pays représentés" },
  { from: 20, to: thisYear - 1994, suffix: " ans", label: "Ans de fraternité" },
  { from: 0, to: thisYear - 2018, suffix: " ans", label: "D'engagement" },
];

function useCountUp(from, to, duration, trigger, shouldReduce) {
  const [count, setCount] = useState(from);
  useEffect(() => {
    if (!trigger) return;
    if (shouldReduce) { setCount(to); return; }
    let startTime = null;
    let raf;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(from + (to - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [trigger, from, to, duration, shouldReduce]);
  return count;
}

function StatCard({ from, to, suffix, label }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const shouldReduce = useReducedMotion();
  const count = useCountUp(from, to, 1.8, inView, shouldReduce);
  return (
    <div ref={ref} className="text-center rounded-xl py-2.5 px-2"
      style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.12)" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: "white", lineHeight: 1 }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: 9, color: "rgba(110,231,183,0.55)", marginTop: 4, letterSpacing: "0.10em", textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
  );
}

/* ══ BULLE D'EAU ══ */
/** @param {{ children: import("react").ReactNode }} props */
function WaterBubble({ children }) {
  const D = 280;
  const shouldReduce = useReducedMotion();
  return (
    <div style={{ position: "relative", width: D, height: D }}>

      {/* Anneaux d'ondulation — CSS pur, fluide et fin */}
      {!shouldReduce && (
        <>
          <style>{`
            @keyframes bubble-ripple {
              0%   { transform: scale(1);    opacity: 0.55; }
              100% { transform: scale(1.65); opacity: 0;    }
            }
            .bubble-ripple {
              position: absolute; inset: 0;
              border-radius: 50%;
              border: 1px solid rgba(144,255,180,0.65);
              pointer-events: none;
              animation: bubble-ripple 3.5s ease-out infinite;
            }
          `}</style>
          <span className="bubble-ripple" style={{ animationDelay: "0s" }} />
          <span className="bubble-ripple" style={{ animationDelay: "1.75s" }} />
        </>
      )}

      {/* Bulle intérieure — overflow:hidden pour le clip circulaire */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden" }}>
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
            backdropFilter: shouldReduce ? "none" : "blur(14px)",
            WebkitBackdropFilter: shouldReduce ? "none" : "blur(14px)",
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
    </div>
  );
}

export default function HeroSection() {
  const ref = useRef(null);
  const shouldReduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const hoverTap = shouldReduce ? {} : {
    whileHover: { scale: 1.04 },
    whileTap: { scale: 0.96 },
  };
  const springTransition = { type: "spring", stiffness: 400, damping: 20 };

  return (
    <section
      ref={ref}
      id="hero"
      className="relative flex-1 flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(150deg, var(--brand-dark) 0%, var(--brand-dark-light) 40%, var(--brand-dark-mid) 70%, hsl(150,28%,6%) 100%)" }}
    >
      {/* Image fond subtile */}
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <img
          src="/images/conference.jpg"
          alt=""
          fetchPriority="high"
          decoding="async"
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
        {/* ── Bandeau identification — pleine largeur sous le menu ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="flex items-center gap-3 md:gap-5 mb-8 w-full"
        >
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(251,191,36,0.40))" }} />
          <p className="text-center shrink-0" style={{
            fontSize: "clamp(7.5px, 1.1vw, 10px)", fontWeight: 700,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.58)", lineHeight: 1.7,
          }}>
            Association des anciens Diplômés de la Faculté de Droit de l'Université de Lomé
            <span style={{ color: "#fbbf24", marginLeft: 8 }}>· Promotion 1994 – 2000</span>
          </p>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(251,191,36,0.40))" }} />
        </motion.div>

        {/* ── Grille responsive : 1 col mobile / 2 col md / 3 col lg ── */}
        <div className="grid md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_340px] gap-8 md:gap-10 lg:gap-14 items-center">

          {/* ── COL 1 : Bulle + titre ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.34, 1.56, 0.64, 1] }}
            className="flex flex-col items-center gap-6"
          >
            <WaterBubble>
              <motion.img
                src="/Logo Redesign1.webp"
                alt="Ma Belle Promo"
                fetchPriority="high"
                width={64}
                height={64}
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

            {/* Stats — compteurs animés au scroll */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.1 }}
              className="grid grid-cols-2 gap-2 w-full"
            >
              {stats.map((s, i) => (
                <StatCard key={i} from={s.from} to={s.to} suffix={s.suffix} label={s.label} />
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
          <div>
            {/* Titre principal — un seul h1 sémantique, deux lignes animées */}
            <h1
              className="font-heading leading-none mb-6 text-center md:text-left"
              style={{ fontSize: "clamp(1.1rem, 2.8vw, 2rem)", fontWeight: 900, letterSpacing: "-0.03em" }}
            >
              <motion.span
                className="block mb-1"
                style={{ color: "rgba(255,255,255,0.95)" }}
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              >
                L'excellence juridique partagée,
              </motion.span>
              <motion.span
                className="block"
                style={{
                  background: "linear-gradient(90deg, #34d399, #6ee7b7, #fbbf24)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.38, ease: "easeOut" }}
              >
                au service de l'avenir
              </motion.span>
            </h1>

            {/* Citation présidente */}
            <motion.div
              className="relative mb-8 pl-5"
              style={{ borderLeft: "2px solid rgba(52,211,153,0.45)" }}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.58, ease: "easeOut" }}
            >
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
            </motion.div>

            {/* CTAs — Axe 3 : micro-interactions spring */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.74 }}
            >
              <MotionLink
                to="/association/qui-sommes-nous"
                {...hoverTap}
                transition={springTransition}
                className="group flex items-center gap-2 justify-center font-bold text-base rounded-full"
                style={{
                  padding: "14px 28px",
                  background: "linear-gradient(135deg, rgba(52,211,153,0.30), rgba(52,211,153,0.18))",
                  border: "1.5px solid rgba(52,211,153,0.55)",
                  color: "#6ee7b7",
                  boxShadow: "0 4px 20px rgba(52,211,153,0.15)",
                }}
              >
                Notre mission <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </MotionLink>
              <MotionLink
                to="/implications/soutenir"
                {...hoverTap}
                transition={springTransition}
                className="flex items-center gap-2 justify-center font-semibold text-sm rounded-full"
                style={{
                  padding: "14px 28px",
                  color: "rgba(251,191,36,0.80)",
                  border: "1.5px solid rgba(251,191,36,0.30)",
                }}
              >
                Nous soutenir
              </MotionLink>
            </motion.div>
          </div>

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
                fetchPriority="high"
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
              animate={shouldReduce ? {} : { y: [0, -7, 0] }}
              transition={shouldReduce ? {} : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-3 -right-4 z-20 rounded-2xl px-3 py-2.5 flex items-center gap-2.5"
              style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
              <Scale className="w-5 h-5 text-emerald-300" />
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
