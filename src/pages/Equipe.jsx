import { motion } from "framer-motion";
import PageHero from "../components/PageHero";
import { Linkedin } from "lucide-react";
import SEO from "../components/SEO";
import { useEquipe } from "../hooks/useEquipe";


export default function Equipe() {
  const { equipe } = useEquipe();
  return (
    <div>
      <SEO title="Notre Équipe" description="Le bureau exécutif de Ma Belle Promo : présidente, secrétaires et membres élus de l'association des anciens diplômés FDD de Lomé." path="/association/equipe" />
      <PageHero title="Notre Équipe" subtitle="L'Association — Bureau exécutif" />

      <section className="relative py-20 max-w-6xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center text-lg text-muted-foreground max-w-2xl mx-auto mb-16"
        >
          Le bureau exécutif de Ma Belle Promo est composé de membres élus lors de l'Assemblée Générale.
          Ils œuvrent bénévolement pour faire avancer la mission de l'association.
        </motion.p>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipe.map((membre, i) => (
            <motion.div
              key={membre.nom}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Trait d'accent en haut */}
              <div className="h-1 bg-gradient-to-r from-primary/60 via-accent/60 to-primary/20" />

              <div className="p-6">
                {/* Photo + nom + rôle */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-shrink-0 w-16 h-16 rounded-full overflow-hidden ring-2 ring-border group-hover:ring-primary/40 transition-all duration-300">
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
                    <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-primary/10 text-primary">
                      {membre.role}
                    </span>
                  </div>
                </div>

                {membre.linkedin && (
                  <div className="pt-4 border-t border-border">
                    <a href={membre.linkedin} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <Linkedin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">Profil LinkedIn</span>
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
