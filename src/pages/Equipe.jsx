import { motion } from "framer-motion";
import PageHero from "../components/PageHero";
import { Mail, Phone, Linkedin } from "lucide-react";
import SEO from "../components/SEO";
import { useEquipe } from "../hooks/useEquipe";

const CARD_GRADIENTS = [
  "linear-gradient(135deg, #064e3b 0%, #065f46 60%, #0f766e 100%)",   // vert foncé
  "linear-gradient(135deg, #1e3a5f 0%, #1e40af 60%, #2563eb 100%)",   // bleu nuit
  "linear-gradient(135deg, #78350f 0%, #92400e 60%, #b45309 100%)",   // or brun
  "linear-gradient(135deg, #3b1a6b 0%, #5b21b6 60%, #7c3aed 100%)",   // violet
  "linear-gradient(135deg, #1c1917 0%, #292524 60%, #3c3836 100%)",   // ardoise sombre
  "linear-gradient(135deg, #134e4a 0%, #0f766e 60%, #0d9488 100%)",   // teal
  "linear-gradient(135deg, #7f1d1d 0%, #991b1b 60%, #b91c1c 100%)",   // bordeaux
  "linear-gradient(135deg, #0c4a6e 0%, #0369a1 60%, #0284c7 100%)",   // bleu ciel
  "linear-gradient(135deg, #1a2e05 0%, #365314 60%, #4d7c0f 100%)",   // vert olive
];

export default function Equipe() {
  const { equipe } = useEquipe();
  return (
    <div>
      <SEO title="Notre Équipe" description="Le bureau exécutif de Ma Belle Promo : présidente, secrétaires et membres élus de l'association des anciens diplômés FDD de Lomé." path="/association/equipe" />
      <PageHero title="Notre Équipe" subtitle="L'Association — Bureau exécutif" />

      <section className="py-20 max-w-6xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-lg text-muted-foreground max-w-2xl mx-auto mb-16"
        >
          Le bureau exécutif de Ma Belle Promo est composé de membres élus lors de l'Assemblée Générale.
          Ils œuvrent bénévolement pour faire avancer la mission de l'association.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {equipe.map((membre, i) => (
            <motion.div
              key={membre.nom}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
              style={{ background: CARD_GRADIENTS[i % CARD_GRADIENTS.length], border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-muted border border-border">
                  <img
                    src={membre.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(membre.nom)}&background=064e3b&color=6ee7b7&size=200`}
                    alt={membre.nom}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(membre.nom)}&background=064e3b&color=6ee7b7&size=200`;
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-base font-bold text-white leading-tight">{membre.nom}</h3>
                  <p className="text-xs font-semibold mt-1 uppercase tracking-wide" style={{ color: "#6ee7b7" }}>{membre.role}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                {membre.profession}
              </p>
              {(membre.email || membre.tel || membre.linkedin) && (
                <div className="mt-4 space-y-1.5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                  {membre.email && (
                    <a href={`mailto:${membre.email}`}
                      className="flex items-center gap-2 text-xs hover:underline transition-colors"
                      style={{ color: "#6ee7b7" }}>
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{membre.email}</span>
                    </a>
                  )}
                  {membre.tel && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{membre.tel}</span>
                    </div>
                  )}
                  {membre.linkedin && (
                    <a href={membre.linkedin} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-xs transition-colors"
                      style={{ color: "rgba(255,255,255,0.65)" }}>
                      <Linkedin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">LinkedIn</span>
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
