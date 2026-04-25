import { motion } from "framer-motion";
import { UserPlus, HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";

const Spiral = ({ color = "#34d399", flip = false }) => (
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
  return (
    <section className="relative py-16 overflow-hidden" style={{ background: "var(--brand-dark-mid)" }}>

      {/* Spirale gauche */}
      <motion.div
        initial={{ opacity: 0, x: -30, rotate: -20 }}
        whileInView={{ opacity: 1, x: 0, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 w-40 h-40 pointer-events-none"
        style={{ marginLeft: "-1.5rem" }}
      >
        <Spiral color="#34d399" flip={false} />
      </motion.div>

      {/* Spirale droite */}
      <motion.div
        initial={{ opacity: 0, x: 30, rotate: 20 }}
        whileInView={{ opacity: 1, x: 0, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-40 h-40 pointer-events-none"
        style={{ marginRight: "-1.5rem" }}
      >
        <Spiral color="#fbbf24" flip={true} />
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">

        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-10"
        >
          <p className="eyebrow text-primary/70 mb-3">Rejoignez-nous</p>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">Faites partie de l'aventure</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">

          {/* Carte Devenir membre */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-7 border flex flex-col gap-5"
            style={{ background: "rgba(52,211,153,0.10)", borderColor: "rgba(52,211,153,0.30)" }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(52,211,153,0.20)" }}>
              <UserPlus className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-white text-lg mb-2">Devenir membre</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Ancien diplômé de la FDD de Lomé ? Rejoignez le réseau des anciens et participez à nos activités communes.
              </p>
            </div>
            <Link
              to="/implications/adhesion"
              className="self-start px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:opacity-90"
              style={{ background: "rgba(52,211,153,0.25)", color: "#6ee7b7", border: "1px solid rgba(52,211,153,0.40)" }}
            >
              Adhérer →
            </Link>
          </motion.div>

          {/* Carte Nous soutenir */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl p-7 border flex flex-col gap-5"
            style={{ background: "rgba(251,191,36,0.09)", borderColor: "rgba(251,191,36,0.30)" }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(251,191,36,0.18)" }}>
              <HeartHandshake className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-white text-lg mb-2">Nous soutenir</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Contribuez aux actions solidaires de Ma Belle Promo au Togo : éducation, aide aux personnes vulnérables, mentorat.
              </p>
            </div>
            <Link
              to="/implications/soutenir"
              className="self-start px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#000" }}
            >
              Faire un don →
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
