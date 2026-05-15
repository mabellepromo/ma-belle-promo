import { motion, AnimatePresence } from "framer-motion";
import PageHero from "../components/PageHero";
import { FileText, Calendar, Download, Search, Tag } from "lucide-react";
import SEO from "../components/SEO";
import { useCommuniques } from "../hooks/useCommuniques";
import { useState, useMemo } from "react";

/** @type {Record<string, string>} */
const typeColors = {
  "Communiqué de presse": "bg-blue-100 text-blue-700",
  "Communiqué":           "bg-teal-100 text-teal-700",
  "Invitation":           "bg-purple-100 text-purple-700",
  "Rapport AG":           "bg-amber-100 text-amber-700",
  "Déclaration":          "bg-red-100 text-red-700",
};

/** @param {string | number} date */
function extractYear(date) {
  const m = String(date).match(/\d{4}/);
  return m ? m[0] : "—";
}

/** @param {{ titre: string, date: string, type: string, resume: string, url: string, contenu?: string }} c */
function telecharger(c) {
  if (c.url) {
    window.open(c.url, "_blank");
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<title>${c.titre}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@400;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Lato', Arial, sans-serif; font-size: 13px; color: #1a1a1a; background: #fff; }
  .page { max-width: 720px; margin: 0 auto; padding: 60px 60px 80px; }
  .header { display: flex; align-items: center; gap: 16px; border-bottom: 3px solid #0a2218; padding-bottom: 20px; margin-bottom: 32px; }
  .logo-circle { width: 52px; height: 52px; background: #0a2218; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .logo-circle span { color: #d4a840; font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: 18px; }
  .org { font-family: 'Cormorant Garamond', serif; }
  .org-name { font-size: 18px; font-weight: 700; color: #0a2218; line-height: 1.2; }
  .org-sub { font-size: 11px; color: #666; letter-spacing: 0.5px; text-transform: uppercase; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.3px; margin-bottom: 16px; background: #e8f5e9; color: #0a2218; }
  h1 { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 700; color: #0a2218; line-height: 1.35; margin-bottom: 8px; }
  .date { font-size: 12px; color: #888; margin-bottom: 32px; }
  .divider { height: 1px; background: #e0e0e0; margin: 24px 0; }
  pre { font-family: 'Lato', Arial, sans-serif; font-size: 13px; line-height: 1.75; white-space: pre-wrap; word-break: break-word; color: #222; }
  .footer { margin-top: 60px; padding-top: 16px; border-top: 1px solid #ccc; font-size: 11px; color: #999; text-align: center; }
  @media print {
    body { font-size: 12px; }
    .page { padding: 40px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo-circle"><span>MBP</span></div>
    <div class="org">
      <div class="org-name">Ma Belle Promo</div>
      <div class="org-sub">FDD · Université de Lomé · Promotion 1994–2000</div>
    </div>
  </div>
  <div class="badge">${c.type}</div>
  <h1>${c.titre}</h1>
  <div class="date">${c.date}</div>
  <div class="divider"></div>
  <pre>${c.contenu || c.resume}</pre>
  <div class="footer">www.mabellepromo.org · contact@mabellepromo.org</div>
</div>
<script>window.onload = () => window.print();<\/script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${c.titre.replace(/[^a-zA-Z0-9À-ÿ\s\-]/g, "").trim()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Communiques() {
  const { communiques } = useCommuniques();
  const [search, setSearch]   = useState("");
  const [type, setType]       = useState("Tous");
  const [year, setYear]       = useState("Toutes");

  const allTypes = useMemo(() => {
    const types = [...new Set(communiques.map(c => c.type))];
    return ["Tous", ...types];
  }, [communiques]);

  const allYears = useMemo(() => {
    const years = [...new Set(communiques.map(c => extractYear(c.date)))].sort((a, b) => Number(b) - Number(a));
    return ["Toutes", ...years];
  }, [communiques]);

  const filtered = useMemo(() => communiques.filter(c => {
    const matchType   = type === "Tous"    || c.type === type;
    const matchYear   = year === "Toutes"  || extractYear(c.date) === year;
    const q           = search.toLowerCase();
    const matchSearch = !q || c.titre.toLowerCase().includes(q) || c.resume.toLowerCase().includes(q);
    return matchType && matchYear && matchSearch;
  }), [communiques, search, type, year]);

  const isFiltering = search || type !== "Tous" || year !== "Toutes";

  function resetFilters() {
    setSearch("");
    setType("Tous");
    setYear("Toutes");
  }

  return (
    <div>
      <SEO title="Communiqués" description="Les communiqués officiels de Ma Belle Promo, association des anciens diplômés de la Faculté de Droit de Lomé." path="/informations/communiques" />
      <PageHero title="Communiqués" subtitle="Informations — Communications officielles" />

      <section className="py-20 max-w-4xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-muted-foreground text-lg mb-10 max-w-xl mx-auto"
        >
          Retrouvez ici l'ensemble des communications officielles de Ma Belle Promo :
          communiqués de presse, invitations, déclarations et rapports d'assemblées.
        </motion.p>

        {/* Barre de recherche + filtres */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-4 mb-8 space-y-3"
        >
          {/* Recherche texte */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un communiqué…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Filtres type + année */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Pills par type */}
            <div className="flex flex-wrap gap-1.5 flex-1">
              {allTypes.map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    type === t
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {t}
                  {t !== "Tous" && (
                    <span className="ml-1 opacity-40 text-[10px]">
                      {communiques.filter(c => c.type === t).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Sélecteur d'année */}
            <select
              value={year}
              onChange={e => setYear(e.target.value)}
              className="h-8 px-3 rounded-xl border border-border bg-background text-xs text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
            >
              {allYears.map(y => (
                <option key={y} value={y}>{y === "Toutes" ? "Toutes les années" : y}</option>
              ))}
            </select>
          </div>

          {/* Réinitialiser */}
          {isFiltering && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground">
                {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
              </span>
              <button
                onClick={resetFilters}
                className="text-xs text-primary hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </motion.div>

        {/* État vide */}
        <AnimatePresence>
          {filtered.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 text-muted-foreground"
            >
              <Tag className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-lg font-medium mb-1">Aucun résultat</p>
              <p className="text-sm">Essayez un autre mot-clé, type ou année.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Liste des communiqués */}
        <div className="space-y-5">
          {filtered.map((c, i) => (
            <motion.div
              key={c.titre}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-md hover:border-primary/20 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${typeColors[c.type] || "bg-secondary text-secondary-foreground"}`}>
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
                <button
                  onClick={() => telecharger(c)}
                  className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors flex-shrink-0"
                  title="Télécharger"
                >
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
