import { motion } from "framer-motion";
import { ArrowRight, Search, Tag } from "lucide-react";
import { useState, useMemo } from "react";
import SEO from "../components/SEO";
import { Link } from "react-router-dom";
import { useProjets } from "../hooks/useProjets";

const catLight = {
  "Solidarité":    "bg-rose-100 text-rose-700",
  "Éducation":     "bg-blue-100 text-blue-700",
  "Santé publique":"bg-green-100 text-green-700",
};
const catAccent = {
  "Solidarité":    "#f43f5e",
  "Éducation":     "#3b82f6",
  "Santé publique":"#22c55e",
};

/* ── Carte projet (image en haut, texte sur fond carte en bas) ── */
function OverlayCard({ projet, size = "normal", index = 0 }) {
  const accent   = catAccent[projet.categorie] ?? "#16a34a";
  const light    = catLight[projet.categorie]  ?? "bg-gray-100 text-gray-700";
  const imgClass = size === "large" ? "h-64 md:h-80"
                 : size === "tall"  ? "h-44 md:h-48"
                 :                    "h-44";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.55, delay: index * 0.07 }}
      className="h-full"
    >
      <Link
        to={`/activites/projets/${projet.id}`}
        className="group flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300"
      >
        {/* Image */}
        <div className={`relative ${imgClass} overflow-hidden flex-shrink-0`}>
          <img
            src={projet.image}
            alt={projet.titre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          {/* Trait couleur catégorie */}
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: accent }} />
        </div>

        {/* Texte sur fond propre */}
        <div className="p-4 md:p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${light}`}>{projet.categorie}</span>
            <span className="text-[10px] text-muted-foreground">{projet.date}</span>
          </div>
          <h3 className={`font-heading font-bold text-foreground group-hover:text-primary transition-colors leading-tight flex-1 ${size === "large" ? "text-xl md:text-2xl" : "text-sm md:text-base"}`}>
            {projet.titre}
          </h3>
          {size === "large" && projet.extrait && (
            <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
              {projet.extrait || projet.description}
            </p>
          )}
          <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-primary group-hover:gap-2 transition-all">
            Voir le projet <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Carte liste compacte (horizontale) ── */
function ListCard({ projet, index }) {
  const light  = catLight[projet.categorie]  ?? "bg-gray-100 text-gray-700";
  const accent = catAccent[projet.categorie] ?? "#16a34a";
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={`/activites/projets/${projet.id}`}
        className="group flex items-center gap-4 py-4 border-b border-border/50 hover:border-primary/20 transition-colors"
      >
        {/* Miniature */}
        <div className="w-16 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-muted relative">
          <img loading="lazy" src={projet.image} alt={projet.titre}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: accent }} />
        </div>
        {/* Texte */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${light}`}>{projet.categorie}</span>
            <span className="text-[10px] text-muted-foreground">{projet.date}</span>
          </div>
          <h3 className="font-heading text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug">
            {projet.titre}
          </h3>
        </div>
        <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
      </Link>
    </motion.div>
  );
}

/* ── Page principale ── */
export default function Projets() {
  const { projets } = useProjets();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Tous");

  const allCats = useMemo(() =>
    ["Tous", ...Object.keys(catLight).filter(c => projets.some(p => p.categorie === c))],
    [projets]
  );

  const filtered = useMemo(() => projets.filter(p => {
    const matchCat = cat === "Tous" || p.categorie === cat;
    const matchSearch = !search ||
      p.titre.toLowerCase().includes(search.toLowerCase()) ||
      (p.extrait || p.description || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [projets, search, cat]);

  /* Découpage bento */
  const hero    = filtered[0];
  const side    = filtered.slice(1, 3);
  const second  = filtered.slice(3, 6);
  const rest    = filtered.slice(6);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Nos Réalisations" description="Les projets et réalisations de Ma Belle Promo au Togo : solidarité, éducation, santé et développement communautaire." path="/activites/projets" />

      {/* ── En-tête ── */}
      <div className="bg-foreground border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="eyebrow text-primary/70 mb-2">Ma Belle Promo</p>
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
              Nos Réalisations
            </h1>
            <p className="text-white/50 text-sm max-w-xl">
              Actions concrètes au service des étudiants et des populations vulnérables — solidarité, éducation, santé depuis 2018.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Filtres + recherche ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10 items-start sm:items-center">
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un projet…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 pl-9 pr-4 rounded-xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors w-full sm:w-60 shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allCats.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  cat === c ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}>
                {c}
                <span className="ml-1 opacity-40 text-[10px]">
                  {c === "Tous" ? projets.length : projets.filter(p => p.categorie === c).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Vide ── */}
        {filtered.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            <Tag className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium mb-1">Aucun résultat</p>
            <p className="text-sm">Essayez un autre mot-clé ou une autre catégorie.</p>
          </div>
        )}

        {/* ── BENTO ROW 1 : grand + 2 petits ── */}
        {filtered.length > 0 && (
          <div className="space-y-4">

            {/* Rangée 1 */}
            {hero && (
              <div className="grid md:grid-cols-[1fr_340px] gap-4">
                <OverlayCard projet={hero} size="large" index={0} />
                <div className="flex flex-col gap-4">
                  {side.map((p, i) => <OverlayCard key={p.id} projet={p} size="tall" index={i + 1} />)}
                </div>
              </div>
            )}

            {/* Rangée 2 : 3 cartes égales */}
            {second.length > 0 && (
              <div className={`grid gap-4 ${second.length === 1 ? "" : second.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
                {second.map((p, i) => <OverlayCard key={p.id} projet={p} size="normal" index={i + 3} />)}
              </div>
            )}

            {/* Rangée 3+ : liste compacte */}
            {rest.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="eyebrow text-muted-foreground/60">
                    {rest.length} autre{rest.length > 1 ? "s" : ""} réalisation{rest.length > 1 ? "s" : ""}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="bg-card border border-border rounded-2xl px-6 py-2">
                  {rest.map((p, i) => <ListCard key={p.id} projet={p} index={i} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CTA ── */}
        {filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="mt-16 text-center"
          >
            <p className="text-muted-foreground mb-6 text-sm">Vous souhaitez soutenir nos prochaines actions ?</p>
            <Link to="/implications/soutenir"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-full hover:opacity-90 transition-opacity">
              Nous soutenir <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
