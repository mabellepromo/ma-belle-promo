import { useState } from "react";
import { motion } from "framer-motion";
import PageHero from "../components/PageHero";
import { HandHeart, Banknote, Phone, Mail, MapPin, Globe } from "lucide-react";
import SEO from "../components/SEO";
import { Link } from "react-router-dom";
import PaymentModal from "../components/PaymentModal";

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
    detail: <Link to="/informations/contacts" className="text-primary font-semibold hover:underline">Formulaire de contact</Link>,
  },
];

export default function NousSoutenir() {
  const [donModal, setDonModal] = useState(false);

  return (
    <div>
      <SEO title="Nous Soutenir" description="Soutenez les actions solidaires de Ma Belle Promo au Togo. Faites un don et contribuez au développement de notre communauté." path="/implications/soutenir" />
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
              <img loading="lazy" src="/images/benevoles.jpg" alt="Bénévolat" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }} />
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
              <img loading="lazy" src="/images/dons.jpg" alt="Don" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }} />
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
              <button onClick={() => setDonModal(true)} className="mt-4 inline-block text-sm text-primary font-medium hover:underline">
                Faire un don maintenant →
              </button>
            </div>
          </motion.div>
        </div>

        {/* Comment nous soutenir */}
        <div className="text-center mb-8">
          <p className="eyebrow text-accent mb-2">Toutes les façons d'aider</p>
          <h2 className="font-heading text-2xl font-bold text-foreground">Comment nous soutenir</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {supportMethods.map((m, i) => (
            <motion.div
              key={m.titre}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <m.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-heading font-bold text-foreground mb-1">{m.titre}</h4>
                <p className="text-xs text-muted-foreground mb-1.5 leading-relaxed">{m.desc}</p>
                <p className="text-xs text-foreground/70 font-medium whitespace-pre-line">{m.detail}</p>
                {m.action && (
                  <button onClick={() => setDonModal(true)} className="mt-3 inline-block px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full hover:opacity-90 transition-opacity">
                    Donner maintenant
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <PaymentModal
        open={donModal}
        onClose={() => setDonModal(false)}
        type="don"
      />
    </div>
  );
}