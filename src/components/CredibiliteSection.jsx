import { motion } from "framer-motion";
import { UserPlus, HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";

export default function CredibiliteSection() {
  return (
    <section className="py-10" style={{ background: "var(--brand-dark-mid)" }}>
      <div className="max-w-3xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-xl p-5 border flex items-center gap-4"
            style={{ background: "rgba(52,211,153,0.10)", borderColor: "rgba(52,211,153,0.30)" }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(52,211,153,0.20)" }}>
              <UserPlus className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-bold text-white text-base">Devenir membre</h3>
              <p className="text-white/50 text-xs mt-0.5">Anciens de la FDD de Lomé</p>
            </div>
            <Link
              to="/implications/adhesion"
              className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-opacity hover:opacity-80"
              style={{ background: "rgba(52,211,153,0.25)", color: "#6ee7b7", border: "1px solid rgba(52,211,153,0.40)" }}
            >
              Adhérer
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-xl p-5 border flex items-center gap-4"
            style={{ background: "rgba(251,191,36,0.09)", borderColor: "rgba(251,191,36,0.30)" }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(251,191,36,0.18)" }}>
              <HeartHandshake className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-bold text-white text-base">Nous soutenir</h3>
              <p className="text-white/50 text-xs mt-0.5">Actions sociales au Togo</p>
            </div>
            <Link
              to="/implications/soutenir"
              className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-opacity hover:opacity-80"
              style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#000" }}
            >
              Donner
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
