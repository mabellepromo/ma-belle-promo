import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, ChevronLeft, ChevronRight, Download, Play, Pause, ZoomIn, Calendar, MapPin, Images } from "lucide-react";
import { useGaleries } from "../hooks/useGaleries";
import { useLocalAuth } from "../lib/LocalAuth";

export default function GalerieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useLocalAuth();
  const { galeries } = useGaleries();
  const galerie = galeries.find(g => g.id === id);

  // Redirection si galerie privée et non connecté
  useEffect(() => {
    if (galerie?.access === "membres" && !session) {
      navigate(`/login?redirect=/galeries/${id}`, { replace: true });
    }
  }, [galerie, session, navigate, id]);

  const [lightbox, setLightbox]     = useState(null); // index de la photo ouverte
  const [slideshow, setSlideshow]   = useState(false);
  const [loaded, setLoaded]         = useState({});

  const photos = galerie?.photos || [];

  const openLightbox  = (i) => { setLightbox(i); setSlideshow(false); };
  const closeLightbox = () => { setLightbox(null); setSlideshow(false); };
  const prev = useCallback(() => setLightbox(i => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setLightbox(i => (i + 1) % photos.length), [photos.length]);

  // Navigation clavier
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, prev, next]);

  // Diaporama automatique
  useEffect(() => {
    if (!slideshow || lightbox === null) return;
    const timer = setInterval(next, 3000);
    return () => clearInterval(timer);
  }, [slideshow, lightbox, next]);

  if (!galerie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Images className="w-12 h-12 opacity-20" />
        <p className="text-lg font-medium">Galerie introuvable</p>
        <Link to="/galeries" className="text-sm text-primary font-semibold hover:underline">← Retour aux galeries</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* En-tête galerie */}
      <div className="bg-foreground border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-14 md:py-18">
          <Link to="/galeries" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Toutes les galeries
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="eyebrow text-primary/70 mb-3">Galerie privée · Membres</p>
              <h1 className="font-heading text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
                {galerie.titre}
              </h1>
              {galerie.description && (
                <p className="text-white/50 text-sm leading-relaxed mb-5 max-w-xl">{galerie.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-white/50">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary/70" />{galerie.date}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary/70" />{galerie.lieu}</span>
                <span className="flex items-center gap-1.5"><Images className="w-4 h-4 text-primary/70" />{photos.length} photos</span>
              </div>
            </div>
            {photos.length > 1 && (
              <button
                onClick={() => { openLightbox(0); setSlideshow(true); }}
                className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-full hover:opacity-90 transition-opacity shadow-lg"
              >
                <Play className="w-4 h-4" /> Lancer le diaporama
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grille masonry */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        {photos.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Images className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Photos à venir</p>
            <p className="text-sm mt-1">Les photos de cet événement seront ajoutées prochainement.</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {photos.map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.45, delay: (i % 8) * 0.05 }}
                className="break-inside-avoid"
              >
                <button
                  onClick={() => openLightbox(i)}
                  className="group relative w-full block rounded-xl overflow-hidden bg-muted cursor-zoom-in"
                >
                  <img
                    src={src}
                    alt={`Photo ${i + 1}`}
                    loading="lazy"
                    onLoad={() => setLoaded(l => ({ ...l, [i]: true }))}
                    onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }}
                    className={`w-full h-auto object-cover transition-all duration-500 group-hover:scale-105 ${loaded[i] ? "opacity-100" : "opacity-0"}`}
                  />
                  {/* Overlay hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <ZoomIn className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-lg" />
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col"
            onClick={closeLightbox}
          >
            {/* Barre top */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
              <span className="text-white/50 text-sm font-medium">
                {lightbox + 1} / {photos.length}
              </span>
              <div className="flex items-center gap-3">
                {/* Diaporama toggle */}
                <button
                  onClick={() => setSlideshow(s => !s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${slideshow ? "bg-primary text-primary-foreground" : "bg-white/10 text-white hover:bg-white/20"}`}
                >
                  {slideshow ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Diaporama</>}
                </button>
                {/* Télécharger */}
                <a
                  href={photos[lightbox]}
                  download
                  onClick={e => e.stopPropagation()}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  title="Télécharger"
                >
                  <Download className="w-4 h-4 text-white" />
                </a>
                {/* Fermer */}
                <button
                  onClick={closeLightbox}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Image principale */}
            <div className="flex-1 flex items-center justify-center relative px-16" onClick={e => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={lightbox}
                  src={photos[lightbox]}
                  alt={`Photo ${lightbox + 1}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.25 }}
                  className="max-h-full max-w-full object-contain rounded-lg select-none"
                  draggable={false}
                  onError={(e) => { e.target.onerror = null; e.target.style.opacity = "0"; }}
                />
              </AnimatePresence>

              {/* Flèches */}
              {photos.length > 1 && (
                <>
                  <button onClick={prev}
                    className="absolute left-3 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors backdrop-blur-sm">
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button onClick={next}
                    className="absolute right-3 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors backdrop-blur-sm">
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </>
              )}
            </div>

            {/* Miniatures bas */}
            {photos.length > 1 && (
              <div className="flex-shrink-0 px-6 py-4 flex gap-2 overflow-x-auto justify-center" onClick={e => e.stopPropagation()}>
                {photos.map((src, i) => (
                  <button key={i} onClick={() => setLightbox(i)}
                    className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === lightbox ? "border-primary scale-110" : "border-transparent opacity-50 hover:opacity-80"}`}>
                    <img loading="lazy" src={src} alt="" className="w-full h-full object-cover object-top" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
