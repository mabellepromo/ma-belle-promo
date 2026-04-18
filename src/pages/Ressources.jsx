import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useLocalAuth } from "../lib/LocalAuth";
import { useContent } from "../lib/localStore";
import { ressources as ressourcesStatic } from "../data/ressources.js";
import {
  FileText, Download, Search, Lock, Tag, BookOpen, X, Plus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import PageHero from "../components/PageHero";

const CATEGORIES = ["Toutes", "Modèle de contrat", "Fiche de synthèse", "Guide pratique", "Jurisprudence", "Législation", "Formulaire", "Autre"];
const DOMAINES   = ["Tous", "Droit des affaires", "Droit public", "Droit pénal", "Droit international", "Droit social", "Fiscalité", "Notariat", "Magistrature", "Général", "Autre"];

const CAT_COLORS = {
  "Modèle de contrat": "bg-blue-100 text-blue-700",
  "Fiche de synthèse": "bg-teal-100 text-teal-700",
  "Guide pratique":    "bg-green-100 text-green-700",
  "Jurisprudence":     "bg-purple-100 text-purple-700",
  "Législation":       "bg-orange-100 text-orange-700",
  "Formulaire":        "bg-amber-100 text-amber-700",
  "Autre":             "bg-gray-100 text-gray-700",
};

const FILE_ICONS = { PDF: "📄", DOCX: "📝", DOC: "📝", XLSX: "📊", PPTX: "📑" };

export default function Ressources() {
  const { session } = useLocalAuth();
  const ressources = useContent("ressources", ressourcesStatic);
  const [search,    setSearch]    = useState("");
  const [categorie, setCategorie] = useState("Toutes");
  const [domaine,   setDomaine]   = useState("Tous");

  const filtered = useMemo(() => {
    return ressources.filter((d) => {
      const s = search.toLowerCase();
      const matchSearch = !search || d.titre?.toLowerCase().includes(s) || d.description?.toLowerCase().includes(s);
      const matchCat    = categorie === "Toutes" || d.categorie === categorie;
      const matchDom    = domaine === "Tous" || d.domaine === domaine;
      return matchSearch && matchCat && matchDom;
    });
  }, [ressources, search, categorie, domaine]);

  const resetFilters = () => { setSearch(""); setCategorie("Toutes"); setDomaine("Tous"); };
  const hasFilters = search || categorie !== "Toutes" || domaine !== "Tous";

  return (
    <div>
      <PageHero title="Ressources Juridiques" subtitle="Bibliothèque — Documents & Modèles" />

      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Documents", value: ressources.length, icon: FileText },
            { label: "Modèles de contrat", value: ressources.filter(d => d.categorie === "Modèle de contrat").length, icon: BookOpen },
            { label: "Fiches de synthèse", value: ressources.filter(d => d.categorie === "Fiche de synthèse").length, icon: Tag },
            { label: "Téléchargements", value: ressources.reduce((s, d) => s + (d.telechargements || 0), 0), icon: Download },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
              <Icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
              <div className="font-heading text-2xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-muted/40 border border-border rounded-2xl p-4 mb-8">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm bg-background"
              />
            </div>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={categorie}
              onChange={(e) => setCategorie(e.target.value)}
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <div className="flex gap-2">
              <select
                className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={domaine}
                onChange={(e) => setDomaine(e.target.value)}
              >
                {DOMAINES.map((d) => <option key={d}>{d}</option>)}
              </select>
              {hasFilters && (
                <button
                  onClick={resetFilters}
                  className="h-9 w-9 flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            <FileText className="w-14 h-14 mx-auto mb-5 opacity-20" />
            <p className="font-heading text-2xl font-bold text-foreground/40 mb-2">Bibliothèque vide</p>
            <p className="text-sm max-w-sm mx-auto">
              {hasFilters
                ? "Aucun document ne correspond à vos critères."
                : "Les ressources juridiques seront disponibles ici prochainement."
              }
            </p>
            {hasFilters && (
              <button onClick={resetFilters} className="mt-4 text-sm text-primary hover:underline">
                Réinitialiser les filtres
              </button>
            )}
            {!hasFilters && session?.role === "admin" && (
              <p className="mt-4 text-xs text-muted-foreground/60 bg-muted/40 border border-dashed border-border rounded-xl px-4 py-3 max-w-sm mx-auto">
                En tant qu'administrateur, ajoutez des documents dans le fichier<br />
                <code className="text-primary font-mono text-xs">src/data/ressources.js</code>
              </p>
            )}
          </div>
        )}

        {/* Documents grid */}
        {filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:border-primary/20 transition-all flex flex-col"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                    {FILE_ICONS[doc.file_type] || "📄"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                      {doc.titre}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{doc.file_type || "DOC"}</span>
                      {doc.file_size && <span className="text-xs text-muted-foreground">· {doc.file_size}</span>}
                    </div>
                  </div>
                </div>

                {doc.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">{doc.description}</p>
                )}

                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CAT_COLORS[doc.categorie] || "bg-gray-100 text-gray-700"}`}>
                    {doc.categorie}
                  </span>
                  {doc.domaine && doc.domaine !== "Général" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{doc.domaine}</span>
                  )}
                  {doc.acces === "membres" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Membres
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end mt-auto pt-3 border-t border-border">
                  {doc.file_url ? (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" /> Télécharger
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">Lien non disponible</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </section>
    </div>
  );
}
