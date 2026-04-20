import { motion } from "framer-motion";
import PageHero from "../components/PageHero";
import { Mail, Phone, Linkedin } from "lucide-react";
import SEO from "../components/SEO";
import { useEquipe } from "../hooks/useEquipe";

const ARABESQUE = `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><g fill='none' stroke='%23000000' stroke-width='1.5' opacity='1'><path d='M50 10 C58 25 58 38 50 50 C42 38 42 25 50 10Z'/><path d='M90 50 C75 58 62 58 50 50 C62 42 75 42 90 50Z'/><path d='M50 90 C42 75 42 62 50 50 C58 62 58 75 50 90Z'/><path d='M10 50 C25 42 38 42 50 50 C38 58 25 58 10 50Z'/><path d='M50 10 C60 18 68 28 70 40'/><path d='M90 50 C82 60 72 68 60 70'/><path d='M50 90 C40 82 32 72 30 60'/><path d='M10 50 C18 40 28 32 40 30'/><path d='M0 0 C12 6 18 18 12 30 C6 18 6 6 0 0Z'/><path d='M100 0 C94 6 94 18 88 30 C82 18 88 6 100 0Z'/><path d='M0 100 C6 94 18 88 30 88 C18 94 6 94 0 100Z'/><path d='M100 100 C88 94 82 88 70 88 C82 82 94 88 100 100Z'/><circle cx='50' cy='50' r='4'/><circle cx='50' cy='10' r='2.5'/><circle cx='90' cy='50' r='2.5'/><circle cx='50' cy='90' r='2.5'/><circle cx='10' cy='50' r='2.5'/><path d='M30 30 Q50 20 70 30 Q80 50 70 70 Q50 80 30 70 Q20 50 30 30Z'/></g></svg>`;

const ARABESQUE_BG = `url("data:image/svg+xml,${ARABESQUE}")`;

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
              className="group relative rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              style={{ background: CARD_GRADIENTS[i % CARD_GRADIENTS.length], border: "1px solid rgba(0,0,0,0.08)" }}
            >
              {/* Arabesque filigrane */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: ARABESQUE_BG, backgroundSize: "100px 100px", opacity: 0.18 }} />

              <div className="relative z-10 flex items-start gap-4">
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
              <p className="relative z-10 mt-4 text-sm leading-relaxed text-muted-foreground">
                {membre.profession}
              </p>
              {(membre.email || membre.tel || membre.linkedin) && (
                <div className="relative z-10 mt-4 space-y-1.5 pt-4 border-t border-black/10">
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
