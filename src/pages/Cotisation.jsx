import { motion } from "framer-motion";
import PageHero from "../components/PageHero";
import { CreditCard, Phone, Building, CheckCircle2 } from "lucide-react";
import SEO from "../components/SEO";
import { Link } from "react-router-dom";

const tarifs = [
  { type: "Membre actif résidant au Togo", montant: "30 000 FCFA", periode: "par an", detail: "Cotisation annuelle pour les membres résidant au Togo." },
  { type: "Membre actif de la diaspora", montant: "50 €", periode: "par an", detail: "Pour les membres résidant hors du Togo, à l'étranger." },
  { type: "Membre bienfaiteur", montant: "Libre", periode: "contribution", detail: "Pour toute personne souhaitant soutenir l'association sans être diplômée de la FDD." },
];

const autresModalites = [
  { icon: Phone, titre: "Mobile Money", detail: "TMoney : 90 05 36 06 / 90 03 63 43\nFlooz : 96 02 00 00 / 99 41 91 92", color: "bg-orange-50 border-orange-200" },
  { icon: CreditCard, titre: "En personne", detail: "Règlement possible directement au siège : 12 BP 335 Baguida, Togo", color: "bg-green-50 border-green-200" },
];

const rib = [
  { label: "Titulaire", value: "ASSOCIATION MA BELLE PROMO MBP" },
  { label: "Banque", value: "ECOBANK Togo" },
  { label: "IBAN", value: "TG53 TG05 5017 1014 1766 3880 0153", mono: true },
  { label: "Swift / BIC", value: "ECOCTGTGXXX", mono: true },
  { label: "N° de compte", value: "141766388001", mono: true },
  { label: "Référence", value: "COTISATION MBP — [Votre nom] — [Année]" },
];

const inclus = [
  "Accès complet au réseau des membres de Ma Belle Promo",
  "Participation aux assemblées générales et aux votes",
  "Invitation aux événements, conférences et galas de l'association",
  "Accès aux ressources et documents partagés par les membres",
  "Éligibilité aux programmes de soutien et de mentorat",
  "Newsletter et communications exclusives aux membres",
];

export default function Cotisation() {
  return (
    <div>
      <SEO title="Cotisation" description="Grille tarifaire et modalités de paiement de la cotisation annuelle à Ma Belle Promo. Mobile Money, virement bancaire ou en personne." path="/implications/cotisation" />
      <PageHero title="Cotisation" subtitle="Implications — Contribuer à la mission" />

      <section className="py-20 max-w-5xl mx-auto px-6">
        {/* Tarifs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <h2 className="font-heading text-2xl font-bold text-foreground text-center mb-10">Grille tarifaire</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {tarifs.map((t, i) => (
              <motion.div
                key={t.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="bg-card border-2 border-border rounded-2xl p-4 sm:p-7 text-center hover:border-primary/30 hover:shadow-lg transition-all"
              >
                <div className="font-heading text-3xl font-bold text-primary mb-1">{t.montant}</div>
                <div className="text-xs text-muted-foreground mb-4">{t.periode}</div>
                <h3 className="font-heading text-base font-semibold text-foreground mb-3">{t.type}</h3>
                <p className="text-sm text-muted-foreground">{t.detail}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Modalités de paiement */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-16">
          <h2 className="font-heading text-2xl font-bold text-foreground text-center mb-10">Modalités de paiement</h2>

          {/* Virement bancaire — carte pleine largeur */}
          <div className="border-2 border-blue-200 bg-blue-50 rounded-2xl overflow-hidden mb-6">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-blue-200">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <Building className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-heading font-bold text-foreground text-lg">Virement bancaire</h3>
            </div>
            <div className="divide-y divide-blue-100">
              {rib.map(({ label, value, mono }) => (
                <div key={label} className="flex items-baseline gap-4 px-6 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 w-32 flex-shrink-0">{label}</span>
                  <span className={`text-sm font-semibold text-foreground ${mono ? "font-mono tracking-wide" : ""}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Money + En personne */}
          <div className="grid md:grid-cols-2 gap-6">
            {autresModalites.map((m) => (
              <div key={m.titre} className={`border-2 rounded-2xl p-6 ${m.color}`}>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <m.icon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="font-heading font-bold text-foreground mb-2">{m.titre}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{m.detail}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Ce qui est inclus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-primary/5 border border-primary/10 rounded-2xl p-5 sm:p-8"
        >
          <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Ce qui est inclus dans votre adhésion</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {inclus.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-primary/10">
            <p className="text-sm text-muted-foreground">
              Pour toute question relative à la cotisation, contactez notre trésorier à l'adresse :
              <Link to="/informations/contacts" className="text-primary font-medium hover:underline ml-1">
                notre formulaire de contact
              </Link>
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}