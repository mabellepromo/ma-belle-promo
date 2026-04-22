import { motion } from "framer-motion";
import PageHero from "../components/PageHero";
import { HandHeart, Building2, Globe } from "lucide-react";
import SEO from "../components/SEO";

const niveaux = [
  { label: "Partenaire Platine", color: "bg-slate-100 border-slate-300", badge: "💎", desc: "Soutien annuel ≥ 500 000 FCFA" },
  { label: "Partenaire Or", color: "bg-amber-50 border-amber-200", badge: "🥇", desc: "Soutien annuel ≥ 200 000 FCFA" },
  { label: "Partenaire Argent", color: "bg-gray-50 border-gray-200", badge: "🥈", desc: "Soutien annuel ≥ 100 000 FCFA" },
  { label: "Partenaire Bronze", color: "bg-orange-50 border-orange-200", badge: "🥉", desc: "Soutien annuel ≥ 50 000 FCFA" },
];

const avantages = [
  { icon: Globe, titre: "Visibilité", desc: "Logo sur tous nos supports de communication, site web et réseaux sociaux." },
  { icon: Building2, titre: "Réseau", desc: "Accès au réseau exclusif des diplômés juristes de la FDD." },
  { icon: HandHeart, titre: "Impact", desc: "Association directe à des actions concrètes au bénéfice des étudiants." },
];

export default function Sponsors() {
  return (
    <div>
      <SEO title="Nos Sponsors" description="Les partenaires et mécènes de Ma Belle Promo. Rejoignez-nous pour soutenir nos actions solidaires au Togo." path="/association/sponsors" />
      <PageHero title="Nos Sponsors" subtitle="L'Association — Partenaires & Mécènes" />

      <section className="py-20 max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ma Belle Promo remercie chaleureusement tous ses partenaires et sponsors qui rendent 
            possible la réalisation de nos projets et actions au bénéfice des étudiants de la FDD.
          </p>
        </motion.div>

        {/* Espace sponsors vide */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {[1,2,3,4,5,6,7,8].map((n) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: n * 0.05 }}
              className="h-24 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground/40 text-sm font-medium hover:border-primary/30 hover:text-primary/40 transition-colors"
            >
              Partenaire
            </motion.div>
          ))}
        </div>

        {/* Niveaux de partenariat */}
        <div className="mb-16">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground text-center mb-10">
            Niveaux de Partenariat
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {niveaux.map((n, i) => (
              <motion.div
                key={n.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`border-2 rounded-2xl p-6 text-center ${n.color}`}
              >
                <div className="text-4xl mb-3">{n.badge}</div>
                <h3 className="font-heading font-bold text-foreground mb-1">{n.label}</h3>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Avantages */}
        <div className="mb-16">
          <h2 className="font-heading text-2xl font-bold text-foreground text-center mb-8">Pourquoi nous soutenir ?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {avantages.map((a, i) => (
              <motion.div
                key={a.titre}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-7 text-center hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <a.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2">{a.titre}</h3>
                <p className="text-sm text-muted-foreground">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center p-8 bg-primary text-primary-foreground rounded-2xl"
        >
          <h3 className="font-heading text-2xl font-bold mb-3">Devenez partenaire</h3>
          <p className="text-primary-foreground/80 mb-5">
            Vous souhaitez soutenir les actions de Ma Belle Promo ? Contactez-nous pour discuter d'un partenariat.
          </p>
          <a
            href="mailto:contact@mabellepromo.org?subject=Partenariat"
            className="inline-block px-7 py-3 bg-white text-foreground rounded-full text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            Proposer un partenariat
          </a>
        </motion.div>
      </section>
    </div>
  );
}