import { motion } from "framer-motion";
import PageHero from "../components/PageHero";
import { FileText, Calendar, Download } from "lucide-react";
import SEO from "../components/SEO";
import { useCommuniques } from "../hooks/useCommuniques";

const typeColors = {
  "Communiqué de presse": "bg-blue-100 text-blue-700",
  "Communiqué": "bg-teal-100 text-teal-700",
  "Invitation": "bg-purple-100 text-purple-700",
  "Rapport AG": "bg-amber-100 text-amber-700",
  "Déclaration": "bg-red-100 text-red-700",
};

export default function Communiques() {
  const { communiques } = useCommuniques();
  return (
    <div>
      <SEO title="Communiqués" description="Les communiqués officiels de Ma Belle Promo, association des anciens diplômés de la Faculté de Droit du Développement de Lomé." path="/informations/communiques" />
      <PageHero title="Communiqués" subtitle="Informations — Communications officielles" />

      <section className="py-20 max-w-4xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-muted-foreground text-lg mb-12 max-w-xl mx-auto"
        >
          Retrouvez ici l'ensemble des communications officielles de Ma Belle Promo : 
          communiqués de presse, invitations, déclarations et rapports d'assemblées.
        </motion.p>

        <div className="space-y-5">
          {communiques.map((c, i) => (
            <motion.div
              key={c.titre}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.09 }}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-md hover:border-primary/20 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${typeColors[c.type] || "bg-gray-100 text-gray-700"}`}>
                      {c.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />{c.date}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {c.titre}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.resume}</p>
                </div>
                <button className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors flex-shrink-0" title="Télécharger">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}