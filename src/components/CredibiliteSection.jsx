import { motion, useReducedMotion } from "framer-motion";
import { UserPlus, HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";

const MotionLink = motion(Link);

const Spiral = ({ color = "#2d7a52", flip = false }) => (
  <svg
    viewBox="0 0 140 140"
    fill="none"
    style={{ transform: flip ? "scaleX(-1)" : "none" }}
    className="w-full h-full"
  >
    <path
      d="M70 70 C73 62 80 59 86 64 C94 71 90 86 76 89 C59 93 48 78 54 63 C60 46 80 38 95 47 C112 57 110 80 97 92 C80 106 56 102 44 84 C30 64 40 36 62 27 C86 16 116 32 118 58 C120 86 100 110 74 112"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      fill="none"
      opacity="0.55"
    />
    <path
      d="M70 70 C68 65 71 60 76 62 C82 65 81 73 75 75 C68 77 63 71 66 65 C69 58 78 56 84 60"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      fill="none"
      opacity="0.35"
    />
    <circle cx="70" cy="70" r="3" fill={color} opacity="0.4" />
  </svg>
);

export default function CredibiliteSection() {
  const shouldReduce = useReducedMotion();

  const cardHover = shouldReduce ? {} : { whileHover: { y: -4 } };
  const btnHover = shouldReduce ? {} : { whileHover: { scale: 1.06 }, whileTap: { scale: 0.94 } };
  const springTransition = { type: "spring", stiffness: 380, damping: 22 };

  return (
    <section className="relative py-10 overflow-hidden" style={{ background: "var(--brand-dark-mid)" }}>

      {/* Spirale gauche */}
      <motion.div
        initial={{ opacity: 0, x: -30, rotate: -20 }}
        whileInView={{ opacity: 1, x: 0, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 w-32 h-32 pointer-events-none"
        style={{ marginLeft: "-1rem" }}
      >
        <Spiral color="#2d7a52" flip={false} />
      </motion.div>

      {/* Spirale droite */}
      <motion.div
        initial={{ opacity: 0, x: 30, rotate: 20 }}
        whileInView={{ opacity: 1, x: 0, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-32 h-32 pointer-events-none"
        style={{ marginRight: "-1rem" }}
      >
        <Spiral color="#fbbf24" flip={true} />
      </motion.div>

      <div className="relative z-10 max-w-3xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 gap-4">

          {/* Carte Devenir membre */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            {...cardHover}
            transition={{
              opacity: { duration: 0.5 },
              x: { duration: 0.5 },
              y: springTransition,
            }}
            className="rounded-xl p-5 border flex items-center gap-4"
            style={{ background: "rgba(45,122,82,0.10)", borderColor: "rgba(45,122,82,0.30)" }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(45,122,82,0.20)" }}>
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-bold text-white text-base">Devenir membre</h3>
              <p className="text-white/50 text-xs mt-0.5 leading-relaxed">Rejoignez un réseau actif de juristes présents dans 6&nbsp;pays.</p>
              <ul className="mt-2 flex flex-col gap-0.5">
                {["Accès à l'annuaire", "Webinaires & conférences", "Mentorat Passerelles"].map(b => (
                  <li key={b} className="flex items-center gap-1 text-[10px]" style={{ color: "rgba(125,184,154,0.65)" }}>
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "rgba(45,122,82,0.50)" }} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <MotionLink
              to="/implications/adhesion"
              {...btnHover}
              transition={springTransition}
              className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold"
              style={{ background: "rgba(45,122,82,0.25)", color: "#7db89a", border: "1px solid rgba(45,122,82,0.40)" }}
            >
              Adhérer
            </MotionLink>
          </motion.div>

          {/* Carte Nous soutenir */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            {...cardHover}
            transition={{
              opacity: { duration: 0.5, delay: 0.1 },
              x: { duration: 0.5, delay: 0.1 },
              y: springTransition,
            }}
            className="rounded-xl p-5 border flex items-center gap-4"
            style={{ background: "rgba(251,191,36,0.09)", borderColor: "rgba(251,191,36,0.30)" }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(251,191,36,0.18)" }}>
              <HeartHandshake className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-bold text-white text-base">Nous soutenir</h3>
              <p className="text-white/50 text-xs mt-0.5 leading-relaxed">Soutenez nos étudiants et nos initiatives au Togo.</p>
            </div>
            <MotionLink
              to="/implications/soutenir"
              {...btnHover}
              transition={springTransition}
              className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold"
              style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#000" }}
            >
              Donner
            </MotionLink>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
