import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Heart } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";


/* ═══════════════════════════════════════════════════════════════
   BULLE / SPHÈRE D'EAU CENTRALE
   Technique : cercle parfait + couches de reflets glassmorphism
   ═══════════════════════════════════════════════════════════════ */
/** @param {{ children: import("react").ReactNode }} props */
function WaterBubble({ children }) {
  const D = 320; // diamètre

  return (
    <div style={{ position: "relative", width: D, height: D }}>

      {/* ── Anneaux de ripple qui s'expandent ── */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: [0.85, 2.4], opacity: [0.5, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: i * 0.85, ease: "easeOut" }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "1.5px solid rgba(144,255,180,0.35)",
          }}
        />
      ))}

      {/* ── Ombre portée sous la bulle ── */}
      <motion.div
        animate={{ scaleX: [1, 1.08, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: -22,
          left: "50%",
          transform: "translateX(-50%)",
          width: D * 0.75,
          height: 28,
          background: "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)",
          filter: "blur(12px)",
          borderRadius: "50%",
        }}
      />

      {/* ── Corps de la bulle (sphère principale) ── */}
      <motion.div
        animate={{ scale: [1, 1.015, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `
            radial-gradient(ellipse at 38% 32%,
              rgba(255,255,255,0.28) 0%,
              rgba(180,255,220,0.12) 30%,
              rgba(0,120,60,0.10) 60%,
              rgba(0,40,20,0.22) 100%
            )
          `,
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1.5px solid rgba(255,255,255,0.22)",
          boxShadow: [
            "inset 0 6px 50px rgba(255,255,255,0.12)",
            "inset 0 -8px 40px rgba(0,80,40,0.25)",
            "0 0 0 1px rgba(255,255,255,0.07)",
            "0 25px 80px rgba(0,0,0,0.45)",
          ].join(", "),
        }}
      />

      {/* ── Reflet principal (glare haut-gauche — clé d'une sphère réaliste) ── */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "17%",
          width: "42%",
          height: "28%",
          background:
            "radial-gradient(ellipse at 40% 40%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.2) 40%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(6px)",
          transform: "rotate(-25deg)",
        }}
      />

      {/* ── Reflet secondaire (petit, haut-droit) ── */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          right: "18%",
          width: "16%",
          height: "10%",
          background:
            "radial-gradient(ellipse, rgba(255,255,255,0.40) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(3px)",
          transform: "rotate(-15deg)",
        }}
      />

      {/* ── Reflet bas (environnement réfléchi) ── */}
      <div
        style={{
          position: "absolute",
          bottom: "14%",
          left: "30%",
          width: "40%",
          height: "14%",
          background:
            "radial-gradient(ellipse, rgba(100,255,160,0.18) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(8px)",
        }}
      />

      {/* ── Contenu centré dans la bulle ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STATS
   ═══════════════════════════════════════════════════════════════ */
const stats = [
  { value: "2018", label: "Fondée en" },
  { value: "40+", label: "Membres actifs" },
  { value: "15+", label: "Projets réalisés" },
  { value: "6 ans", label: "D'actions" },
];

/* ═══════════════════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════════════════ */
export default function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #042b14 0%, #063d1e 40%, #052918 70%, #031a0e 100%)",
      }}
    >
      {/* ── Image de fond avec parallax ── */}
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=700&h=400&fit=crop"
          alt=""
          className="w-full h-full object-cover scale-110"
          style={{ opacity: 0.12, mixBlendMode: "luminosity" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(4,43,20,0.94) 0%, rgba(6,61,30,0.80) 50%, rgba(3,26,14,0.95) 100%)",
          }}
        />
      </motion.div>

      {/* ── Lumières ambiantes vertes ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "15%",
            left: "10%",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 65%)",
          }}
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 60, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          style={{
            position: "absolute",
            bottom: "20%",
            right: "15%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 65%)",
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          style={{
            position: "absolute",
            top: "55%",
            left: "55%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── Grille décorative ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(52,211,153,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.04) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
        }}
      />


      {/* ══ CONTENU PRINCIPAL ══ */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-28 pb-16"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-10 flex items-center gap-2.5 px-6 py-2.5 text-xs font-bold tracking-widest uppercase"
          style={{
            color: "#6ee7b7",
            background: "rgba(52,211,153,0.10)",
            border: "1px solid rgba(52,211,153,0.30)",
            borderRadius: 999,
            backdropFilter: "blur(8px)",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#34d399",
              display: "inline-block",
              boxShadow: "0 0 10px #34d399",
            }}
          />
          Association des Diplômés FDD · Lomé, Togo
        </motion.div>

        {/* ══ BULLE D'EAU ══ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <WaterBubble>
            {/* Logo */}
            <motion.img
              src="https://media.base44.com/images/public/69da5bf6442b31e7eee54888/42e641694_LogoRedesign1.png"
              alt="Ma Belle Promo"
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
              style={{
                width: 72,
                height: 72,
                marginBottom: 14,
                filter: "drop-shadow(0 0 24px rgba(100,255,180,0.4)) drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
              }}
            />

            {/* Titre dans la bulle */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              style={{ textAlign: "center", padding: "0 24px" }}
            >
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: "rgba(255,255,255,0.95)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  textShadow: "0 2px 20px rgba(0,0,0,0.4)",
                }}
              >
                Ma Belle
                <br />
                <span
                  style={{
                    background: "linear-gradient(90deg, #fbbf24, #fef3c7, #f59e0b)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Promo
                </span>
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "rgba(255,255,255,0.45)",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  marginTop: 8,
                }}
              >
                FDD · Lomé · 1994–2000
              </div>
            </motion.div>
          </WaterBubble>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-10 text-center text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          style={{ color: "rgba(255,255,255,0.72)" }}
        >
          Les membres de notre association sont des{" "}
          <span style={{ color: "#6ee7b7", fontWeight: 700 }}>leaders engagés</span> pour
          changer la vie des personnes destinataires de nos actions.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.95 }}
          className="mt-3 text-center text-sm max-w-xl mx-auto leading-relaxed"
          style={{ color: "rgba(255,255,255,0.40)" }}
        >
          Notre travail avec nos donateurs et nos partenaires vise à faire de nos jeunes,
          des leaders d'une société plus juste mais ambitieuse.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => document.querySelector("#mission")?.scrollIntoView({ behavior: "smooth" })}
            className="group flex items-center gap-2 justify-center font-bold text-sm tracking-wide rounded-full transition-all"
            style={{
              padding: "14px 32px",
              background: "rgba(52,211,153,0.12)",
              border: "1.5px solid rgba(52,211,153,0.35)",
              color: "#6ee7b7",
              backdropFilter: "blur(10px)",
            }}
          >
            Rejoignez notre combat
            <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </button>

          <Link
            to="/implications/soutenir"
            className="flex items-center gap-2 justify-center font-semibold text-sm tracking-wide rounded-full transition-all"
            style={{
              padding: "14px 32px",
              background: "rgba(255,255,255,0.06)",
              border: "1.5px solid rgba(255,255,255,0.14)",
              color: "rgba(255,255,255,0.70)",
            }}
          >
            Soutenez nos causes
          </Link>

          <Link
            to="/don"
            className="flex items-center gap-2 justify-center font-bold text-sm tracking-wide rounded-full transition-all"
            style={{
              padding: "14px 32px",
              background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
              color: "#000",
              boxShadow: "0 8px 30px rgba(251,191,36,0.35)",
            }}
          >
            <Heart className="w-4 h-4" /> Faire un don
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.3 }}
          className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl"
        >
          {stats.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.06, borderColor: "rgba(52,211,153,0.4)" }}
              className="text-center rounded-2xl"
              style={{
                padding: "18px 12px",
                background: "rgba(52,211,153,0.05)",
                border: "1px solid rgba(52,211,153,0.12)",
                backdropFilter: "blur(8px)",
                cursor: "default",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(110,231,183,0.6)",
                  marginTop: 6,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {s.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
        style={{ color: "rgba(52,211,153,0.35)" }}
      >
        <motion.div animate={{ y: [0, 9, 0] }} transition={{ duration: 2.2, repeat: Infinity }}>
          <ArrowDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}
