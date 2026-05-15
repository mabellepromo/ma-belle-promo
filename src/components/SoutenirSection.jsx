import { motion } from "framer-motion";
import { HandHeart, Banknote, Phone, Mail, MapPin, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const supportMethods = [
  {
    icon: MapPin,
    title: "En personne",
    desc: "Rendez-vous directement à notre siège. Nous vous accueillerons avec joie.",
    detail: "Ma Belle Promo — 12 BP 335 Baguida, Togo",
  },
  {
    icon: Globe,
    title: "Sur Internet",
    desc: "Faites votre don en ligne en toute sécurité via notre plateforme de paiement.",
    detail: "Cliquez sur le bouton ci-dessous",
    action: true,
  },
  {
    icon: Phone,
    title: "Par téléphone",
    desc: "Envoyez vos contributions par mobile money.",
    detail: "TMoney : 90 05 36 06 / 90 03 63 43 • Flooz : 96 02 00 00 / 99 41 91 92",
  },
  {
    icon: Mail,
    title: "Par mail",
    desc: "Contactez-nous par email pour voir ensemble comment vous pouvez aider.",
    detail: "contact@mabellepromo.org",
  },
];

export default function SoutenirSection() {
  return (
    <section id="soutenir" className="py-24 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top part */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="eyebrow text-accent">Votre implication</span>
            <h2 className="mt-3 font-heading text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Votre soutien est un <span className="text-primary">accélérateur</span> de projets
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-muted-foreground text-lg leading-relaxed"
          >
            Quel que soit le montant de votre don, sachez que votre contribution aura un impact 
            sur la vie d'autrui à travers les programmes que Ma Belle Promo met en place.
          </motion.p>
        </div>

        {/* Two big cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card group hover:shadow-lg transition-all"
          >
            <div className="relative h-56 overflow-hidden">
              <img
                loading="lazy"
                src="/images/benevoles.jpg"
                alt="Bénévoles aidant les étudiants"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
            </div>
            <div className="p-5 sm:p-8 -mt-12 relative">
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-4">
                <HandHeart className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-3">Bénévolat</h3>
              <p className="text-muted-foreground leading-relaxed">
                Vous pouvez faire une réelle différence en partageant vos connaissances, 
                votre expertise et vos expériences avec les étudiants actuels. Ma Belle Promo 
                créera les conditions de votre épanouissement dans cet engagement.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card group hover:shadow-lg transition-all"
          >
            <div className="relative h-56 overflow-hidden">
              <img
                loading="lazy"
                src="/images/dons.jpg"
                alt="Dons et générosité"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
            </div>
            <div className="p-5 sm:p-8 -mt-12 relative">
              <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-4">
                <Banknote className="w-7 h-7 text-accent-foreground" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-3">Dons</h3>
              <p className="text-muted-foreground leading-relaxed">
                Tout le monde a la possibilité de faire la différence avec des actions simples. 
                Vos dons, additionnés à ceux des adhérents, nous aident à toucher nos objectifs du doigt 
                et à changer des vies concrètement.
              </p>
            </div>
          </motion.div>
        </div>

        {/* How to support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Comment nous soutenir</h3>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {supportMethods.map((method, i) => (
            <motion.div
              key={method.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <method.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-heading text-lg font-semibold text-foreground mb-2">{method.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">{method.desc}</p>
              <p className="text-xs text-foreground/70 font-medium">{method.detail}</p>
              {method.action && (
                <Link
                  to="/don"
                  className="mt-4 inline-block px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-full hover:opacity-90 transition-opacity"
                >
                  Donner maintenant
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}