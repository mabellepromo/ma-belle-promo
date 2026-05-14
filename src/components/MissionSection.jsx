import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const LINE_GRADIENT =
  "linear-gradient(90deg, transparent, #6ee7b7 8%, #fbbf24 28%, #34d399 50%, #a78bfa 72%, #34d399 90%, transparent)";

const MILESTONES = [
  {
    year: "1994",
    label: "L'Entrée",
    desc: "Nous intégrons la Faculté de Droit de l'Université de Lomé. Une promotion se noue sur les bancs d'un même amphithéâtre.",
    color: "#6ee7b7",
    glowBg: "rgba(110,231,183,0.07)",
    border: "rgba(110,231,183,0.22)",
    top: true,
  },
  {
    year: "2000",
    label: "L'Envol",
    desc: "Diplômés, nous partons aux quatre coins du Togo et du monde. Les liens tissés sur les bancs de la FDD, eux, restent intacts.",
    color: "#fbbf24",
    glowBg: "rgba(251,191,36,0.07)",
    border: "rgba(251,191,36,0.25)",
    top: false,
  },
  {
    year: "2018",
    label: "La Fondation",
    desc: "1er décembre — L'AGC officialise ce qui était déjà une famille. Ma Belle Promo est officiellement née.",
    color: "#34d399",
    glowBg: "rgba(52,211,153,0.10)",
    border: "rgba(52,211,153,0.38)",
    top: true,
    featured: true,
  },
  {
    year: "2019",
    label: "La Reconnaissance",
    desc: "03 octobre — L'État togolais reconnaît officiellement l'association.",
    badge: "Récépissé N°0920/MATDCL-SG-DLPAP-DOCA",
    color: "#a78bfa",
    glowBg: "rgba(167,139,250,0.08)",
    border: "rgba(167,139,250,0.30)",
    top: false,
  },
  {
    year: "Aujourd'hui",
    label: "Le Réseau",
    desc: "45+ membres actifs dans plusieurs pays. Un réseau vivant au service de ses membres et de sa communauté.",
    color: "#34d399",
    glowBg: "rgba(52,211,153,0.10)",
    border: "rgba(52,211,153,0.30)",
    top: true,
    pulse: true,
  },
];

const PULSE_CSS = `
  @keyframes mbp-dot-pulse {
    0%   { box-shadow: 0 0 0 0px  rgba(52,211,153,0.85); }
    70%  { box-shadow: 0 0 0 14px rgba(52,211,153,0);    }
    100% { box-shadow: 0 0 0 0px  rgba(52,211,153,0);    }
  }
  .mbp-pulse { animation: mbp-dot-pulse 2.2s ease-out infinite; }
`;

/* ── Carte milestone ───────────────────────────────────────── */
function TimelineCard({ m, i, from, shouldReduce }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const yDir = from === "top" ? -28 : 28;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: shouldReduce ? 0 : yDir }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] }}
      className="h-full rounded-2xl p-4 relative overflow-hidden"
      style={{ background: m.glowBg, border: `1px solid ${m.border}` }}
    >
      {m.featured && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: "inset 0 0 28px rgba(52,211,153,0.12)" }}
        />
      )}
      <p className="font-heading text-sm font-bold mb-1.5" style={{ color: m.color }}>
        {m.label}
      </p>
      <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.48)" }}>
        {m.desc}
      </p>
      {m.badge && (
        <div
          className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
          style={{
            background: "rgba(167,139,250,0.12)",
            color: "#c4b5fd",
            border: "1px solid rgba(167,139,250,0.28)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-violet-400" />
          {m.badge}
        </div>
      )}
    </motion.div>
  );
}

/* ── Point sur la ligne ─────────────────────────────────────── */
function TimelineDot({ m, i, inView, shouldReduce }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <motion.div
        className={m.pulse ? "mbp-pulse" : ""}
        initial={{ scale: shouldReduce ? 1 : 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ type: "spring", stiffness: 260, damping: 14, delay: i * 0.13 + 0.2 }}
        style={{
          width: m.featured ? 20 : 12,
          height: m.featured ? 20 : 12,
          borderRadius: "50%",
          background: m.color,
          boxShadow: `0 0 ${m.featured ? "20px" : "8px"} ${m.color}`,
          flexShrink: 0,
        }}
      />
      <motion.p
        className="text-[9px] font-black tracking-wider whitespace-nowrap text-center"
        style={{ color: m.color }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: i * 0.13 + 0.38, duration: 0.4 }}
      >
        {m.year}
      </motion.p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function MissionSection() {
  const lineRef = useRef(null);
  const lineInView = useInView(lineRef, { once: true, margin: "-80px" });
  const shouldReduce = useReducedMotion();

  return (
    <section
      id="mission"
      className="relative overflow-hidden py-12 md:py-16"
      style={{
        background:
          "linear-gradient(160deg, hsl(150,30%,7%) 0%, hsl(150,28%,10%) 50%, hsl(150,30%,7%) 100%)",
      }}
    >
      <style>{PULSE_CSS}</style>

      {/* Grille déco */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(52,211,153,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.022) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Lueurs ambiantes */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* ── En-tête ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10 md:mb-14"
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.22em] uppercase mb-6"
            style={{
              color: "#6ee7b7",
              background: "rgba(52,211,153,0.10)",
              border: "1px solid rgba(52,211,153,0.22)",
            }}
          >
            Notre histoire
          </span>
          <h2
            className="font-heading font-black leading-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "rgba(255,255,255,0.95)" }}
          >
            Une promotion,{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #34d399, #6ee7b7, #fbbf24)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              trente ans de liens
            </span>
          </h2>
          <p
            className="mt-4 text-sm max-w-sm mx-auto leading-relaxed"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            De la Faculté de Droit de Lomé à une association reconnue — le chemin de Ma Belle Promo.
          </p>
        </motion.div>

        {/* ══ DESKTOP ══════════════════════════════════════════ */}
        <div ref={lineRef} className="hidden md:block">

          {/* Rangée cartes hautes */}
          <div className="grid grid-cols-5 gap-3">
            {MILESTONES.map((m, i) => (
              <div key={m.year} style={{ minHeight: 150 }} className="flex flex-col justify-end">
                {m.top && <TimelineCard m={m} i={i} from="top" shouldReduce={shouldReduce} />}
              </div>
            ))}
          </div>

          {/* Ligne + points */}
          <div className="relative h-12 flex items-center">
            {/* Track statique */}
            <div
              className="absolute left-0 right-0 h-px"
              style={{ top: "50%", background: "rgba(255,255,255,0.05)" }}
            />
            {/* Ligne animée */}
            <div className="absolute left-0 right-0 overflow-hidden" style={{ top: "50%", height: 1 }}>
              <motion.div
                className="h-full w-full origin-left"
                style={{ background: LINE_GRADIENT }}
                initial={{ scaleX: 0 }}
                animate={lineInView ? { scaleX: 1 } : {}}
                transition={{ duration: 1.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              />
            </div>
            {/* Points + années */}
            <div className="absolute inset-0 grid grid-cols-5">
              {MILESTONES.map((m, i) => (
                <TimelineDot key={m.year} m={m} i={i} inView={lineInView} shouldReduce={shouldReduce} />
              ))}
            </div>
          </div>

          {/* Rangée cartes basses */}
          <div className="grid grid-cols-5 gap-3">
            {MILESTONES.map((m, i) => (
              <div key={m.year} style={{ minHeight: 150 }}>
                {!m.top && <TimelineCard m={m} i={i} from="bottom" shouldReduce={shouldReduce} />}
              </div>
            ))}
          </div>
        </div>

        {/* ══ MOBILE ═══════════════════════════════════════════ */}
        <div className="md:hidden relative pl-10">
          {/* Ligne verticale */}
          <div
            className="absolute left-3 top-2 bottom-2 w-px"
            style={{ background: LINE_GRADIENT.replace("90deg", "180deg") }}
          />

          <div className="space-y-5">
            {MILESTONES.map((m, i) => (
              <motion.div
                key={m.year}
                className="relative"
                initial={{ opacity: 0, x: shouldReduce ? 0 : 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                {/* Point */}
                <div
                  className={`absolute -left-10 top-4 -translate-x-1/2${m.pulse ? " mbp-pulse" : ""}`}
                  style={{
                    width: m.featured ? 16 : 10,
                    height: m.featured ? 16 : 10,
                    borderRadius: "50%",
                    background: m.color,
                    boxShadow: `0 0 10px ${m.color}`,
                    zIndex: 10,
                  }}
                />
                <div
                  className="rounded-2xl p-4"
                  style={{ background: m.glowBg, border: `1px solid ${m.border}` }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-black tracking-wider" style={{ color: m.color }}>
                      {m.year}
                    </span>
                    <span className="text-white/20 text-xs">—</span>
                    <span className="font-heading text-sm font-bold" style={{ color: m.color }}>
                      {m.label}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.50)" }}>
                    {m.desc}
                  </p>
                  {m.badge && (
                    <div
                      className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                      style={{
                        background: "rgba(167,139,250,0.12)",
                        color: "#c4b5fd",
                        border: "1px solid rgba(167,139,250,0.25)",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-violet-400" />
                      {m.badge}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mt-8 md:mt-10"
        >
          <Link
            to="/association/qui-sommes-nous"
            className="group inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold transition-all hover:bg-white/5"
            style={{
              color: "#6ee7b7",
              background: "rgba(52,211,153,0.08)",
              border: "1px solid rgba(52,211,153,0.22)",
            }}
          >
            Valeurs &amp; Mission
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
