import { motion } from "framer-motion";
import PageHero from "../components/PageHero";
import { Download, Eye, Lock, Scale, Target, BookOpen, BarChart3, FileText, FolderOpen } from "lucide-react";
import { useDocuments } from "../hooks/useDocuments";
import { useLocalAuth } from "../lib/LocalAuth";
import { Link } from "react-router-dom";

const CATEGORIES = {
  "Gouvernance": {
    Icon: Scale,
    iconBg: "bg-blue-100",
    color: "text-blue-600",
    accent: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700",
  },
  "Stratégie": {
    Icon: Target,
    iconBg: "bg-green-100",
    color: "text-green-600",
    accent: "bg-green-500",
    badge: "bg-green-100 text-green-700",
  },
  "Rapport": {
    Icon: BookOpen,
    iconBg: "bg-purple-100",
    color: "text-purple-600",
    accent: "bg-purple-500",
    badge: "bg-purple-100 text-purple-700",
  },
  "Finance": {
    Icon: BarChart3,
    iconBg: "bg-amber-100",
    color: "text-amber-600",
    accent: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },
};

const FALLBACK_CAT = {
  Icon: FileText,
  iconBg: "bg-muted",
  color: "text-muted-foreground",
  accent: "bg-muted-foreground",
  badge: "bg-gray-100 text-gray-700",
};

export default function Documents() {
  const { documents } = useDocuments();
  const { session } = useLocalAuth();
  const isMember = !!session;

  const grouped = documents.reduce((acc, doc) => {
    const cat = doc.categorie || "Autre";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {});

  return (
    <div>
      <PageHero title="Documents" subtitle="Informations — Ressources officielles" />

      <section className="py-20 max-w-5xl mx-auto px-6">

        {/* Barre de stats */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-3 mb-10"
        >
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3">
            <FolderOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{documents.length} documents</span>
          </div>
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{Object.keys(grouped).length} catégories</span>
          </div>
        </motion.div>

        {/* Bannière accès membres */}
        {!isMember && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-start gap-3"
          >
            <Lock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Certains documents sont réservés aux membres de l'association. Pour y accéder,{" "}
              <a href="/login" className="text-primary font-medium hover:underline">connectez-vous</a>{" "}
              ou contactez-nous via{" "}
              <Link to="/informations/contacts" className="text-primary font-medium hover:underline">notre formulaire de contact</Link>.
            </p>
          </motion.div>
        )}

        {/* Sections par catégorie */}
        {Object.entries(grouped).map(([categorie, docs], sectionIndex) => {
          const { Icon, iconBg, color, accent, badge } = CATEGORIES[categorie] || FALLBACK_CAT;

          return (
            <motion.div
              key={categorie}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="mb-12"
            >
              {/* En-tête de section */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h2 className="font-heading font-bold text-lg text-foreground">{categorie}</h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {docs.length} document{docs.length > 1 ? "s" : ""}
                </span>
                <div className="flex-1 h-px bg-border ml-1" />
              </div>

              {/* Grille de cartes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {docs.map((doc, i) => {
                  const accessible = doc.url && (doc.acces === "public" || (doc.acces === "members" && isMember));

                  return (
                    <motion.div
                      key={doc.titre}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: sectionIndex * 0.1 + i * 0.06 }}
                      className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all flex flex-col"
                    >
                      {/* Bande colorée en haut */}
                      <div className={`h-1 ${accent} flex-shrink-0`} />

                      <div className="p-5 flex flex-col flex-1">

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${badge}`}>
                            {categorie}
                          </span>
                          {doc.acces === "members" ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                              <Lock className="w-2.5 h-2.5" /> Membres
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                              Public
                            </span>
                          )}
                        </div>

                        {/* Titre */}
                        <h3 className="font-heading font-bold text-foreground text-sm leading-snug mb-2">
                          {doc.titre}
                        </h3>

                        {/* Méta */}
                        <p className="text-xs text-muted-foreground mb-3">
                          {doc.type} · {doc.taille} · {doc.date}
                        </p>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">
                          {doc.desc}
                        </p>

                        {/* Boutons d'action */}
                        <div className="flex gap-2 pt-3 border-t border-border">
                          {accessible ? (
                            <>
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" /> Aperçu
                              </a>
                              <a
                                href={doc.url}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" /> Télécharger
                              </a>
                            </>
                          ) : (
                            <div className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground bg-muted rounded-lg cursor-not-allowed select-none">
                              <Lock className="w-3.5 h-3.5" />
                              {!doc.url ? "Bientôt disponible" : "Réservé aux membres"}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </section>
    </div>
  );
}
