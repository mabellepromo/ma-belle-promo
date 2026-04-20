import { motion } from "framer-motion";
import PageHero from "../components/PageHero";
import { GraduationCap, Users, Mic, BookOpen, ArrowRight } from "lucide-react";
import SEO from "../components/SEO";
import { Link } from "react-router-dom";
import { useProgrammes } from "../hooks/useProgrammes";

/* Icon/color mapping by numero (not serializable to localStorage) */
const PROG_META = {
  1: { Icon: GraduationCap, color: "bg-primary/10 text-primary" },
  2: { Icon: Users,         color: "bg-amber-500/10 text-amber-600" },
  3: { Icon: Mic,           color: "bg-green-500/10 text-green-600" },
};

export default function Programmes() {
  const { programmes } = useProgrammes();
  return (
    <div>
      <SEO title="Nos Programmes" description="Les programmes d'actions de Ma Belle Promo : éducation, solidarité, santé publique et développement communautaire au Togo." path="/activites/programmes" />
      <PageHero title="Nos Programmes" subtitle="Activités — Ce que nous mettons en place" />

      <section className="py-20 max-w-5xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-lg text-muted-foreground max-w-2xl mx-auto mb-16"
        >
          Ma Belle Promo déploie plusieurs programmes visant à accompagner les étudiants,
          développer le réseautage et partager l'expertise de ses membres avec la communauté.
        </motion.p>

        <div className="space-y-8">
          {programmes.map((prog, i) => {
            const meta = PROG_META[prog.numero] || { Icon: BookOpen, color: "bg-gray-100 text-gray-700" };
            const { Icon, color } = meta;
            return (
            <motion.div
              key={prog.id || prog.titre}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                <div className="flex-shrink-0">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="text-xs font-bold text-muted-foreground">#{prog.numero}</span>
                    <h3 className="font-heading text-xl font-bold text-foreground">{prog.titre}</h3>
                    <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${color} border border-current/20`}>
                      {prog.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{prog.description}</p>
                  {prog.lien && (
                    prog.lien.startsWith("http") ? (
                      <a
                        href={prog.lien}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all"
                      >
                        En savoir plus <ArrowRight className="w-4 h-4" />
                      </a>
                    ) : (
                      <Link
                        to={prog.lien}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all"
                      >
                        En savoir plus <ArrowRight className="w-4 h-4" />
                      </Link>
                    )
                  )}
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center p-8 bg-primary/5 border border-primary/20 rounded-2xl"
        >
          <h3 className="font-heading text-xl font-bold text-foreground mb-3">
            Vous souhaitez contribuer ?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Rejoignez Ma Belle Promo en tant que bénévole ou soutenez nos programmes par un don.
            Votre expertise et votre générosité font la différence.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/implications/adhesion"
              className="px-6 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
            >
              Devenir adhérent
            </Link>
            <Link
              to="/don"
              className="px-6 py-3 border border-border text-sm font-semibold rounded-full hover:bg-muted transition-colors text-foreground"
            >
              Faire un don
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
