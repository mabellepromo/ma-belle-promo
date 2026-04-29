import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import SEO from "../components/SEO";
import { Calendar, ArrowLeft, Clock, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import PhotoGallery from "../components/PhotoGallery";
import DOMPurify from "dompurify";

const catColors = {
  "Webinaire":   "bg-blue-100 text-blue-700 ring-blue-200",
  "Événement":   "bg-purple-100 text-purple-700 ring-purple-200",
  "Conférence":  "bg-teal-100 text-teal-700 ring-teal-200",
  "Gala":        "bg-amber-100 text-amber-700 ring-amber-200",
  "Solidarité":  "bg-red-100 text-red-700 ring-red-200",
};

function readingTime(content) {
  if (!content) return 1;
  const text = content.replace(/<[^>]+>/g, "");
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
}

export default function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [autres, setAutres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [{ data: art }, { data: aut }] = await Promise.all([
        supabase.from("articles").select("*").eq("id", id).single(),
        supabase.from("articles").select("id,titre,date,categorie,image").neq("id", id).limit(3),
      ]);
      setArticle(art ?? null);
      setAutres(aut ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  const galleryPhotos = article?.photos?.length > 0 ? article.photos : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background animate-pulse">
        <div className="bg-foreground border-b border-white/10">
          <div className="max-w-5xl mx-auto px-6 pt-32 pb-12 md:pb-16">
            <div className="grid md:grid-cols-[1fr_380px] gap-8 md:gap-10 items-center">
              <div className="bg-white/10 rounded-2xl px-7 py-8 space-y-4">
                <div className="h-3 w-24 bg-white/20 rounded" />
                <div className="h-5 w-20 bg-white/20 rounded-full" />
                <div className="h-7 w-full bg-white/20 rounded" />
                <div className="h-7 w-3/4 bg-white/20 rounded" />
                <div className="h-3 w-full bg-white/15 rounded mt-2" />
                <div className="h-3 w-5/6 bg-white/15 rounded" />
              </div>
              <div className="rounded-2xl bg-white/10 aspect-video" />
            </div>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-3">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
          <div className="h-4 bg-muted rounded w-4/5" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="mt-8 h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
          <div className="h-4 bg-muted rounded w-full" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-3">Article introuvable</h2>
          <Link to="/informations/actualites" className="text-primary hover:underline text-sm">← Retour aux actualités</Link>
        </div>
      </div>
    );
  }

  const mins = readingTime(article.contenu);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={article.titre}
        description={article.extrait || `${article.titre} — Ma Belle Promo`}
        image={article.image}
        path={`/actualites/${id}`}
        article
      />

      {/* ── Hero : cohérent avec les autres en-têtes de pages ── */}
      <div className="bg-foreground border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 pt-32 pb-12 md:pb-16">
          <div className="grid md:grid-cols-[1fr_380px] gap-8 md:gap-10 items-center">

            {/* ── Bloc titre avec effet pages feuilletées ── */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-emerald-700/40 translate-x-3 translate-y-3" />
              <div className="absolute inset-0 rounded-2xl bg-emerald-600/30 translate-x-1.5 translate-y-1.5" />
              <div className="relative bg-white/95 rounded-2xl border border-white/20 px-7 py-8 shadow-2xl">
                <Link
                  to="/informations/actualites"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Retour aux actualités
                </Link>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ring-1 ${catColors[article.categorie] || "bg-gray-100 text-gray-700 ring-gray-200"}`}>
                    {article.categorie}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" /> {mins} min de lecture
                  </span>
                </div>

                <h1 className="font-heading text-2xl md:text-4xl font-bold text-foreground leading-tight mb-4">
                  {article.titre}
                </h1>

                {article.extrait && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-2">
                    {article.extrait}
                  </p>
                )}

                <div className="flex items-center gap-1.5 text-sm text-muted-foreground pt-4 border-t border-border/40">
                  <Calendar className="w-4 h-4" /> {article.date}
                </div>
              </div>
            </div>

            {/* ── Image droite ── */}
            <div className="rounded-2xl overflow-hidden shadow-2xl aspect-video w-full bg-muted" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
              <img
                src={article.image}
                alt={article.titre}
                className="w-full h-full object-cover"
                style={{ objectPosition: article.photo_position || "top" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Corps de l'article ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Chapeau / extrait */}
        {article.extrait && (
          <p className="text-base md:text-lg text-foreground/80 font-medium leading-relaxed border-l-[3px] border-primary pl-5 mb-10 italic">
            {article.extrait}
          </p>
        )}

        {/* Contenu */}
        <article className="prose prose-slate max-w-none
          prose-headings:font-heading prose-headings:text-foreground
          prose-h1:text-xl prose-h1:mt-8 prose-h1:mb-3
          prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
          prose-h3:text-lg prose-h3:mt-6
          prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
          prose-li:text-muted-foreground
          prose-strong:text-foreground
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-blockquote:not-italic prose-blockquote:font-medium
          [&_p]:text-justify [&_li]:text-justify">
          {article.contenu?.trim().startsWith("<")
            ? <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.contenu) }} />
            : <ReactMarkdown>{article.contenu}</ReactMarkdown>
          }
        </article>

        {/* Vidéos — YouTube, Vimeo ou fichier direct (multi) */}
        {(() => {
          const videoList = Array.isArray(article.videos) && article.videos.length > 0
            ? article.videos
            : article.youtube ? [article.youtube] : [];
          if (videoList.length === 0) return null;

          const toEmbed = (url) => {
            try {
              const u = new URL(url);
              if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
                const id = u.searchParams.get("v") || u.pathname.replace(/^\//, "").split("/").pop();
                return id ? `https://www.youtube.com/embed/${id}` : null;
              }
              if (u.hostname.includes("vimeo.com")) {
                const id = u.pathname.replace(/^\//, "").split("/")[0];
                return id ? `https://player.vimeo.com/video/${id}` : null;
              }
            } catch {}
            return null;
          };

          return (
            <div className="mt-12 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="font-heading text-lg font-bold text-foreground">
                  {videoList.length > 1 ? "Vidéos" : "Vidéo"}
                </h2>
              </div>
              {videoList.map((url, i) => {
                const embedUrl = toEmbed(url);
                return embedUrl ? (
                  <div key={i} className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                    <iframe src={embedUrl} title={`Vidéo ${i + 1}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" />
                  </div>
                ) : (
                  <video key={i} controls className="w-full rounded-2xl shadow-lg" src={url}>
                    Votre navigateur ne supporte pas la lecture vidéo.
                  </video>
                );
              })}
            </div>
          );
        })()}

        {/* Galerie photos */}
        <PhotoGallery photos={galleryPhotos} />

        {/* Autres articles */}
        {autres.length > 0 && (
          <div className="mt-16">
            {/* Séparateur décoratif */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Lire aussi</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {autres.map((a) => (
                <Link
                  key={a.id}
                  to={`/actualites/${a.id}`}
                  className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="h-36 overflow-hidden flex-shrink-0">
                    <img
                      src={a.image}
                      alt={a.titre}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className={`self-start px-2 py-0.5 text-xs font-semibold rounded-full mb-2 ${catColors[a.categorie] || "bg-gray-100 text-gray-700"}`}>
                      {a.categorie}
                    </span>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug flex-1">
                      {a.titre}
                    </h3>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">{a.date}</span>
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
