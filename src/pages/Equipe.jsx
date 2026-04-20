import { motion } from "framer-motion";
import PageHero from "../components/PageHero";
import { Mail, Phone, Linkedin } from "lucide-react";
import SEO from "../components/SEO";
import { useEquipe } from "../hooks/useEquipe";

const CARD_GRADIENTS = [
  "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",   // vert menthe
  "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",   // bleu lavande
  "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",   // or doux
  "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",   // violet poudré
  "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",   // ardoise perle
  "linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)",   // teal pastel
  "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)",   // rose poudré
  "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",   // bleu ciel doux
  "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",   // vert pomme
];

export default function Equipe() {
  const { equipe } = useEquipe();
  return (
    <div>
      <SEO title="Notre Équipe" description="Le bureau exécutif de Ma Belle Promo : présidente, secrétaires et membres élus de l'association des anciens diplômés FDD de Lomé." path="/association/equipe" />
      <PageHero title="Notre Équipe" subtitle="L'Association — Bureau exécutif" />

      <section className="relative py-20 max-w-6xl mx-auto px-6">
        {/* Logo tampon en filigrane */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <img
            src="/images/Logo/LogoRedesign1.png"
            alt=""
            aria-hidden="true"
            className="w-[520px] h-[520px] object-contain select-none"
            style={{
              opacity: 0.15,
              filter: "grayscale(100%) contrast(1.8)",
              transform: "rotate(-8deg)",
            }}
          />
        </div>
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
                  <h3 className="font-heading text-base font-bold text-foreground leading-tight">{membre.nom}</h3>
                  <p className="text-xs font-semibold mt-1 uppercase tracking-wide text-primary">{membre.role}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {membre.profession}
              </p>
              {(membre.email || membre.tel || membre.linkedin) && (
                <div className="mt-4 space-y-1.5 pt-4 border-t border-black/10">
                  {membre.email && (
                    <a href={`mailto:${membre.email}`}
                      className="flex items-center gap-2 text-xs text-primary hover:underline transition-colors">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{membre.email}</span>
                    </a>
                  )}
                  {membre.tel && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{membre.tel}</span>
                    </div>
                  )}
                  {membre.linkedin && (
                    <a href={membre.linkedin} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
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
