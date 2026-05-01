import { motion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function DonnezSection() {
  return (
    <section className="py-0">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden"
      >
        {/* Background image with overlay */}
        <div className="relative h-64 md:h-72 flex items-center justify-center">
          <img
            loading="lazy"
            src="/images/conference.jpg"
            alt="Notre détermination"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />

          <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="eyebrow text-amber-300 mb-3"
            >
              Notre détermination à votre service
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-heading text-3xl md:text-4xl font-bold text-white mb-6"
            >
              Donnez aujourd'hui
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-white/70 mb-8 text-base max-w-xl mx-auto"
            >
              Quel que soit le montant de votre don, votre contribution aura un impact sur la vie d'autrui
              à travers les programmes que Ma Belle Promo met en place.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/don"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold rounded-full hover:from-amber-300 hover:to-amber-400 transition-all text-sm tracking-wide shadow-xl shadow-amber-500/30"
              >
                <Heart className="w-4 h-4" /> Faire un don
              </Link>
              <Link
                to="/implications/soutenir"
                className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all text-sm"
              >
                En savoir plus <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
