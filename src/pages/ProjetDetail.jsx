import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import SEO from "../components/SEO";
import { Calendar, ArrowLeft, ChevronRight, Play, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import PhotoGallery from "../components/PhotoGallery";
import ShareButtons from "../components/ShareButtons";
import DOMPurify from "dompurify";

const catColors = {
  "Solidarité":    "bg-rose-100 text-rose-700 ring-rose-200",
  "Éducation":     "bg-blue-100 text-blue-700 ring-blue-200",
  "Santé publique":"bg-secondary text-primary ring",
};

const catAccent = {
  "Solidarité":    "#f43f5e",
  "Éducation":     "#3b82f6",
  "Santé publique":"#22c55e",
};

export default function ProjetDetail() {
  const { id } = useParams();
  const [projet, setProjet] = useState(null);
  const [autres, setAutres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [{ data: proj }, { data: aut }] = await Promise.all([
        supabase.from("projets").select("*").eq("id", id).single(),
        supabase.from("projets").select("id,titre,date,categorie,image").neq("id", id).limit(3),
      ]);
      setProjet(proj ?? null);
      setAutres(aut ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  const galleryPhotos = projet?.photos?.length > 0 ? projet.photos : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background animate-pulse">
        <div className="bg-foreground border-b border-white/10">
          <div className="h-1 w-full bg-white/10" />
          <div className="max-w-5xl mx-auto px-6 pt-32 pb-12 md:pb-16">
            <div className="grid md:grid-cols-[1fr_380px] gap-10 md:gap-14 items-center">
              <div className="space-y-5">
                <div className="h-3 w-20 bg-white/20 rounded" />
                <div className="h-5 w-24 bg-white/20 rounded-full" />
                <div className="h-8 w-full bg-white/20 rounded" />
                <div className="h-8 w-4/5 bg-white/20 rounded" />
                <div className="h-3 w-full bg-white/15 rounded" />
                <div className="h-3 w-5/6 bg-white/15 rounded" />
              </div>
              <div className="rounded-2xl bg-white/10 aspect-[4/3]" />
            </div>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-3">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
          <div className="h-4 bg-muted rounded w-4/5" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!projet) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-3">Projet introuvable</h2>
          <Link to="/activites/projets" className="text-primary hover:underline text-sm">← Retour aux réalisations</Link>
        </div>
      </div>
    );
  }

  const accent = catAccent[projet.categorie] || "#16a34a";

  const videoList = Array.isArray(projet.videos) && projet.videos.length > 0
    ? projet.videos
    : projet.youtube ? [projet.youtube] : [];

  const getYoutubeId = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
        return u.searchParams.get("v") || u.pathname.replace(/^\//, "").split("/").pop() || null;
      }
    } catch {}
    return null;
  };

  const getVimeoEmbed = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("vimeo.com")) {
        const id = u.pathname.replace(/^\//, "").split("/")[0];
        return id ? `https://player.vimeo.com/video/${id}` : null;
      }
    } catch {}
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={projet.titre}
        description={projet.extrait || projet.description || `${projet.titre} — Ma Belle Promo`}
        image={projet.image}
        path={`/activites/projets/${id}`}
      />

      {/* ── Header ── */}
      <div className="bg-foreground border-b border-white/10">
        {/* Barre accent couleur catégorie tout en haut */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />

        <div className="max-w-5xl mx-auto px-6 pt-32 pb-12 md:pb-16">
          <div className="grid md:grid-cols-[1fr_380px] gap-10 md:gap-14 items-center">

            {/* ── Colonne gauche : meta + titre ── */}
            <div>
              {/* Fil d'Ariane */}
              <Link
                to="/activites/projets"
                className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors mb-7"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Nos Réalisations
              </Link>

              {/* Catégorie + date */}
              <div className="flex flex-wrap items-center gap-2.5 mb-5">
                <span
                  className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full"
                  style={{ background: accent + "30", color: accent, border: `1px solid ${accent}50` }}
                >
                  {projet.categorie}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/50">
                  <Calendar className="w-3.5 h-3.5" /> {projet.date}
                </span>
              </div>

              {/* Trait décoratif + titre */}
              <div className="flex gap-4 items-start mb-5">
                <div className="w-1 flex-shrink-0 mt-2 rounded-full self-stretch" style={{ background: `linear-gradient(to bottom, ${accent}, transparent)`, minHeight: 60 }} />
                <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  {projet.titre}
                </h1>
              </div>

              {/* Extrait sous le titre */}
              {(projet.extrait || projet.description) && (
                <p className="text-sm md:text-base text-white/60 leading-relaxed max-w-lg mb-5">
                  {projet.extrait || projet.description}
                </p>
              )}

              <ShareButtons title={projet.titre} description={projet.extrait || projet.description} dark />
            </div>

            {/* ── Colonne droite : image dans un cadre ── */}
            <div className="relative">
              {/* Rectangle décalé décoratif */}
              <div
                className="absolute -bottom-3 -right-3 w-full h-full rounded-2xl"
                style={{ background: accent + "25", border: `1px solid ${accent}30` }}
              />
              {/* Image principale */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
                <img
                  src={projet.image}
                  alt={projet.titre}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: projet.photo_position || "top" }}
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Corps ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

        {/* Extrait ou description courte */}
        {(projet.extrait || projet.description) && (
          <p
            className="text-base md:text-lg font-medium leading-relaxed italic mb-10 pl-5"
            style={{ color: "var(--foreground)", opacity: 0.8, borderLeft: `3px solid ${accent}` }}
          >
            {projet.extrait || projet.description}
          </p>
        )}

        {/* Contenu détaillé */}
        {projet.contenu && projet.contenu.trim() && projet.contenu.trim() !== "<p><br></p>" && (
          <article className="prose prose-slate max-w-none
            prose-headings:font-heading prose-headings:text-foreground
            prose-h1:text-xl prose-h1:mt-8 prose-h1:mb-3
            prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
            prose-h3:text-lg prose-h3:mt-6
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
            prose-li:text-muted-foreground
            prose-strong:text-foreground prose-strong:font-normal
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-blockquote:not-italic prose-blockquote:font-medium
            [&_p]:text-justify [&_li]:text-justify">
            {projet.contenu.trim().startsWith("<")
              ? <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(projet.contenu) }} />
              : <ReactMarkdown>{projet.contenu}</ReactMarkdown>
            }
          </article>
        )}

        {/* Vidéos */}
        {videoList.length > 0 && (
          <div className="mt-12 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full" style={{ background: accent }} />
              <h2 className="font-heading text-lg font-bold text-foreground">
                {videoList.length > 1 ? "Vidéos" : "Vidéo"}
              </h2>
            </div>
            {videoList.map((url, i) => {
              const ytId = getYoutubeId(url);
              if (ytId) {
                return (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="group relative block w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={`https://i.ytimg.com/vi/${ytId}/sddefault.jpg`}
                      alt={`Vidéo ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`; }}
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <Play className="w-7 h-7 text-foreground ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                      <span className="px-4 py-2 bg-black/70 text-white text-sm font-semibold rounded-full flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" /> Voir sur YouTube
                      </span>
                    </div>
                  </a>
                );
              }
              const vimeoUrl = getVimeoEmbed(url);
              if (vimeoUrl) {
                return (
                  <div key={i} className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                    <iframe src={vimeoUrl} title={`Vidéo ${i + 1}`}
                      allow="autoplay; fullscreen; picture-in-picture" allowFullScreen
                      className="absolute inset-0 w-full h-full" />
                  </div>
                );
              }
              return (
                <video key={i} controls className="w-full rounded-2xl shadow-lg" src={url}>
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              );
            })}
          </div>
        )}

        {/* Galerie */}
        <PhotoGallery photos={galleryPhotos} accentColor={accent} label="Galerie photos" />

        {/* Autres projets */}
        {autres.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Autres réalisations</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {autres.map((p) => (
                <Link
                  key={p.id}
                  to={`/activites/projets/${p.id}`}
                  className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="h-32 overflow-hidden flex-shrink-0">
                    <img loading="lazy" src={p.image} alt={p.titre}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className={`self-start px-2 py-0.5 text-xs font-semibold rounded-full mb-2 ${catColors[p.categorie] || "bg-secondary text-secondary-foreground"}`}>
                      {p.categorie}
                    </span>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug flex-1">
                      {p.titre}
                    </h3>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">{p.date}</span>
                      <ChevronRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
