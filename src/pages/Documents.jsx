import { motion } from "framer-motion";
import PageHero from "../components/PageHero";
import { FileText, Download, Eye, Lock } from "lucide-react";
import { useDocuments } from "../hooks/useDocuments";

const catColors = {
  "Gouvernance": "bg-blue-100 text-blue-700",
  "Stratégie": "bg-green-100 text-green-700",
  "Rapport": "bg-purple-100 text-purple-700",
  "Finance": "bg-amber-100 text-amber-700",
};

const typeIcons = { "PDF": "📄", "Excel": "📊", "Word": "📝" };

export default function Documents() {
  const { documents } = useDocuments();
  return (
    <div>
      <PageHero title="Documents" subtitle="Informations — Ressources officielles" />

      <section className="py-20 max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-start gap-3">
          <Lock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Certains documents sont réservés aux membres de l'association. Pour y accéder, 
            contactez-nous à <a href="mailto:mabellepromo@gmail.com" className="text-primary font-medium hover:underline">mabellepromo@gmail.com</a>.
          </p>
        </motion.div>

        <div className="space-y-4">
          {documents.map((doc, i) => (
            <motion.div
              key={doc.titre}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {typeIcons[doc.type] || "📄"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-heading font-bold text-foreground text-sm">{doc.titre}</h3>
                    {doc.acces === "members" && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                        <Lock className="w-2.5 h-2.5" /> Membres
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${catColors[doc.categorie] || "bg-gray-100 text-gray-700"}`}>{doc.categorie}</span>
                    <span className="text-xs text-muted-foreground">{doc.type} • {doc.taille} • {doc.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{doc.desc}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {doc.acces === "public" ? (
                    <>
                      <button className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors" title="Aperçu">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors text-primary" title="Télécharger">
                        <Download className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-muted-foreground cursor-not-allowed" title="Membres uniquement">
                      <Lock className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}