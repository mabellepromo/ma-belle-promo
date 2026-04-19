import { motion } from "framer-motion";
import PageHero from "../components/PageHero";
import { HandHeart, Banknote, Phone, Mail, MapPin, Globe } from "lucide-react";

const supportMethods = [
  {
    icon: MapPin,
    titre: "En personne",
    desc: "Rendez-vous directement à notre siège. Nous vous accueillerons avec joie.",
    detail: "Ma Belle Promo — 12 BP 335 Baguida, Togo",
  },
  {
    icon: Globe,
    titre: "Sur Internet",
    desc: "Faites votre don en ligne en toute sécurité.",
    detail: "Contactez-nous par email pour la procédure en ligne",
    action: true,
  },
  {
    icon: Phone,
    titre: "Par téléphone",
    desc: "Envoyez vos contributions par mobile money.",
    detail: "TMoney : 90 05 36 06 / 90 03 63 43\nFlooz : 96 02 00 00 / 99 41 91 92",
  },
  {
    icon: Mail,
    titre: "Par mail",
    desc: "Contactez-nous pour voir ensemble comment vous pouvez aider.",
    detail: "mabellepromo@gmail.com",
  },
];

export default function NousSoutenir() {
  return (
    <div>
      <PageHero title="Nous Soutenir" subtitle="Implications — Votre engagement" />

      <section className="py-20 max-w-5xl mx-auto px-6">
        {/* Header text */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
            Votre soutien est un accélérateur de projets
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Quel que soit le montant de votre don, sachez que votre contribution aura un impact 
            sur la vie d'autrui à travers les programmes que Ma Belle Promo met en place.
          </p>
        </motion.div>

        {/* Bénévolat + Dons */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all group">
            <div className="h-48 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1760784879929-eb7ea4ee6958?w=500&h=300&fit=crop" alt="Bénévolat" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-7">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
                <HandHeart className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-3">Bénévolat</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Vous pouvez vous impliquer avec la Faculté de Droit et ses étudiants de plusieurs façons 
                positives. Partagez vos connaissances, votre expertise et vos expériences. Ma Belle Promo 
                créera les conditions de votre épanouissement dans cet engagement.
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all group">
            <div className="h-48 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=500&h=300&fit=crop" alt="Don" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-7">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4">
                <Banknote className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-3">Dons</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Tout le monde a la possibilité de faire la différence avec des actions simples. 
                Vos dons, additionnés à ceux des adhérents, nous aident à toucher nos objectifs du doigt 
                et à changer des vies concrètement.
              </p>
              <a href="/don" className="mt-4 inline-block text-sm text-primary font-medium hover:underline">
                Faire un don maintenant →
              </a>
            </div>
          </motion.div>
        </div>

        {/* Comment nous soutenir */}
        <h2 className="font-heading text-2xl font-bold text-foreground text-center mb-8">Comment nous soutenir</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {supportMethods.map((m, i) => (
            <motion.div
              key={m.titre}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <m.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-heading font-semibold text-foreground mb-2">{m.titre}</h4>
              <p className="text-xs text-muted-foreground mb-2">{m.desc}</p>
              <p className="text-xs text-foreground/70 font-medium whitespace-pre-line">{m.detail}</p>
              {m.action && (
                <a href="mailto:mabellepromo@gmail.com?subject=Don" className="mt-4 inline-block px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-full hover:opacity-90 transition-opacity">
                  Donner maintenant
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}