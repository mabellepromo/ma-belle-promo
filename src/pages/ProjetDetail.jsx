import { useParams, Link } from "react-router-dom";
import { useContent } from "../lib/localStore";
import { projets as projetsStatic } from "../data/projets";
import { Calendar, ArrowLeft, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import PhotoGallery from "../components/PhotoGallery";
import DOMPurify from "dompurify";

const catColors = {
  "Solidarité":    "bg-rose-100 text-rose-700 ring-rose-200",
  "Éducation":     "bg-blue-100 text-blue-700 ring-blue-200",
  "Santé publique":"bg-green-100 text-green-700 ring-green-200",
};

const catAccent = {
  "Solidarité":    "#f43f5e",
  "Éducation":     "#3b82f6",
  "Santé publique":"#22c55e",
};

export default function ProjetDetail() {
  const { id } = useParams();
  const allProjets = useContent("projets", projetsStatic);
  const projet = allProjets.find((p) => String(p.id) === String(id));
  const staticProjet = projetsStatic.find((p) => String(p.id) === String(id));

  const galleryPhotos = projet?.photos?.length > 0
    ? projet.photos
    : (staticProjet?.photos || []);


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
  const autres = allProjets.filter((p) => String(p.id) !== String(id)).slice(0, 3);

  const videoList = Array.isArray(projet.videos) && projet.videos.length > 0
    ? projet.videos
    : projet.youtube ? [projet.youtube] : [];

  const toEmbed = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
        const vid = u.searchParams.get("v") || u.pathname.replace(/^\//, "").split("/").pop();
        return vid ? `https://www.youtube.com/embed/${vid}` : null;
      }
      if (u.hostname.includes("vimeo.com")) {
        const vid = u.pathname.replace(/^\//, "").split("/")[0];
        return vid ? `https://player.vimeo.com/video/${vid}` : null;
      }
    } catch {}
    return null;
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header split élégant ── */}
      <div className="border-b border-border" style={{ background: "linear-gradient(135deg, #f8faf8 0%, #ffffff 60%, #fefdf5 100%)" }}>
        {/* Barre accent couleur catégorie tout en haut */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />

        <div className="max-w-5xl mx-auto px-6 py-10 md:py-14">
          <div className="grid md:grid-cols-[1fr_380px] gap-10 md:gap-14 items-center">

            {/* ── Colonne gauche : meta + titre ── */}
            <div>
              {/* Fil d'Ariane */}
              <Link
                to="/activites/projets"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-7"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Nos Réalisations
              </Link>

              {/* Catégorie + date */}
              <div className="flex flex-wrap items-center gap-2.5 mb-5">
                <span
                  className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ring-1"
                  style={{ background: accent + "18", color: accent, ringColor: accent + "40" }}
                >
                  {projet.categorie}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" /> {projet.date}
                </span>
              </div>

              {/* Trait décoratif + titre */}
              <div className="flex gap-4 items-start mb-5">
                <div className="w-1 flex-shrink-0 mt-2 rounded-full self-stretch" style={{ background: `linear-gradient(to bottom, ${accent}, transparent)`, minHeight: 60 }} />
                <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  {projet.titre}
                </h1>
              </div>

              {/* Extrait sous le titre */}
              {(projet.extrait || projet.description) && (
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-lg">
                  {projet.extrait || projet.description}
                </p>
              )}
            </div>

            {/* ── Colonne droite : image dans un cadre ── */}
            <div className="relative">
              {/* Rectangle décalé décoratif */}
              <div
                className="absolute -bottom-3 -right-3 w-full h-full rounded-2xl"
                style={{ background: accent + "18", border: `1px solid ${accent}28` }}
              />
              {/* Image principale */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
                <img
                  src={projet.image}
                  alt={projet.titre}
                  className="w-full h-full object-cover"
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
            prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
            prose-li:text-muted-foreground
            prose-strong:text-foreground
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
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
              const embedUrl = toEmbed(url);
              return embedUrl ? (
                <div key={i} className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                  <iframe src={embedUrl} title={`Vidéo ${i + 1}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen className="absolute inset-0 w-full h-full" />
                </div>
              ) : (
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
            <div className="grid sm:grid-cols-3 gap-5">
              {autres.map((p) => (
                <Link
                  key={p.id}
                  to={`/activites/projets/${p.id}`}
                  className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="h-32 overflow-hidden flex-shrink-0">
                    <img loading="lazy" src={p.image} alt={p.titre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className={`self-start px-2 py-0.5 text-xs font-semibold rounded-full mb-2 ${catColors[p.categorie] || "bg-gray-100 text-gray-700"}`}>
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
