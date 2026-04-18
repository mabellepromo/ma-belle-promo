import { motion } from "framer-motion";
import PageHero from "../components/PageHero";
import { Mail, Phone, Linkedin } from "lucide-react";
import { useContent } from "../lib/localStore";
import { equipe as equipeStatic } from "../data/equipe";

export default function Equipe() {
  const equipe = useContent("equipe", equipeStatic);
  return (
    <div>
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
              className="group bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
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
                  <p className="text-xs font-semibold text-primary mt-1 uppercase tracking-wide">{membre.role}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {membre.profession}
              </p>
              {(membre.email || membre.tel || membre.linkedin) && (
                <div className="mt-4 space-y-1.5 border-t border-border pt-4">
                  {membre.email && (
                    <a href={`mailto:${membre.email}`}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
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
