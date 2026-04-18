import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Eye, X, ArrowRight } from "lucide-react";

/* ── Lightbox ── */
function Lightbox({ photos, idx, onClose }) {
  const [current, setCurrent] = useState(idx);

  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + photos.length) % photos.length),
    [photos.length]
  );
  const next = useCallback(
    () => setCurrent((i) => (i + 1) % photos.length),
    [photos.length]
  );

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,15,10,0.92)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <img
        src={photos[current]}
        alt={`Photo ${current + 1}`}
        className="max-w-full max-h-[88vh] rounded-2xl object-contain select-none shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center text-white"
        style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
      >
        <X className="w-5 h-5" />
      </button>

      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white"
            style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)" }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white"
            style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)" }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <div className="flex gap-2 flex-wrap justify-center max-w-sm">
          {photos.map((p, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`w-10 h-7 rounded-md overflow-hidden transition-all ${
                i === current ? "ring-2 ring-white scale-110" : "opacity-50 hover:opacity-80"
              }`}
            >
              <img src={p} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
        <span className="text-white/40 text-xs">
          {current + 1} / {photos.length}
        </span>
      </div>
    </div>
  );
}

/* ── Cellule photo ── */
function Cell({ photo, index, total, onOpen, className = "" }) {
  return (
    <button
      onClick={() => onOpen(index)}
      className={`group relative overflow-hidden rounded-xl bg-muted ${className}`}
    >
      <img
        src={photo}
        alt={`Photo ${index + 1}`}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
          <Eye className="w-4 h-4 text-gray-800" />
        </div>
      </div>
      <span className="absolute bottom-2 right-2 text-[9px] text-white/60 opacity-0 group-hover:opacity-100 transition-opacity font-mono bg-black/30 px-1.5 py-0.5 rounded">
        {index + 1}/{total}
      </span>
    </button>
  );
}

/* ── Galerie bento ── */
export default function PhotoGallery({
  photos = [],
  accentColor = "#16a34a",
  label = "Galerie photos",
}) {
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const closeLightbox = useCallback(() => setLightboxIdx(null), []);

  if (!Array.isArray(photos) || photos.length === 0) return null;

  const n = photos.length;
  const open = (i) => setLightboxIdx(i);

  return (
    <div className="mt-12">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-6 rounded-full" style={{ background: accentColor }} />
          <h2 className="font-heading text-lg font-bold text-foreground">{label}</h2>
          <span
            className="px-2 py-0.5 text-xs font-bold rounded-full"
            style={{ background: accentColor + "18", color: accentColor }}
          >
            {n} photo{n > 1 ? "s" : ""}
          </span>
        </div>
        <button
          onClick={() => setLightboxIdx(0)}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" /> Voir tout
        </button>
      </div>

      {/* Layout 1 photo */}
      {n === 1 && (
        <Cell photo={photos[0]} index={0} total={n} onOpen={open} className="w-full aspect-[16/7]" />
      )}

      {/* Layout 2 photos */}
      {n === 2 && (
        <div className="grid grid-cols-2 gap-2 h-64">
          <Cell photo={photos[0]} index={0} total={n} onOpen={open} className="h-full" />
          <Cell photo={photos[1]} index={1} total={n} onOpen={open} className="h-full" />
        </div>
      )}

      {/* Layout 3 photos */}
      {n === 3 && (
        <div className="grid grid-cols-3 gap-2 h-64">
          <Cell photo={photos[0]} index={0} total={n} onOpen={open} className="col-span-2 h-full" />
          <div className="flex flex-col gap-2">
            <Cell photo={photos[1]} index={1} total={n} onOpen={open} className="flex-1" />
            <Cell photo={photos[2]} index={2} total={n} onOpen={open} className="flex-1" />
          </div>
        </div>
      )}

      {/* Layout 4 photos */}
      {n === 4 && (
        <div className="grid grid-cols-3 gap-2 h-64">
          <Cell photo={photos[0]} index={0} total={n} onOpen={open} className="col-span-2 h-full" />
          <div className="flex flex-col gap-2">
            <Cell photo={photos[1]} index={1} total={n} onOpen={open} className="flex-1" />
            <Cell photo={photos[2]} index={2} total={n} onOpen={open} className="flex-1" />
            <Cell photo={photos[3]} index={3} total={n} onOpen={open} className="flex-1" />
          </div>
        </div>
      )}

      {/* Layout 5 photos */}
      {n === 5 && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 h-56">
            <Cell photo={photos[0]} index={0} total={n} onOpen={open} className="h-full" />
            <Cell photo={photos[1]} index={1} total={n} onOpen={open} className="h-full" />
          </div>
          <div className="grid grid-cols-3 gap-2 h-40">
            <Cell photo={photos[2]} index={2} total={n} onOpen={open} className="h-full" />
            <Cell photo={photos[3]} index={3} total={n} onOpen={open} className="h-full" />
            <Cell photo={photos[4]} index={4} total={n} onOpen={open} className="h-full" />
          </div>
        </div>
      )}

      {/* Layout 6+ photos */}
      {n >= 6 && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2 h-64">
            <Cell photo={photos[0]} index={0} total={n} onOpen={open} className="col-span-2 h-full" />
            <div className="flex flex-col gap-2">
              <Cell photo={photos[1]} index={1} total={n} onOpen={open} className="flex-1" />
              <Cell photo={photos[2]} index={2} total={n} onOpen={open} className="flex-1" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {photos.slice(3).map((p, i) => (
              <Cell key={i} photo={p} index={i + 3} total={n} onOpen={open} className="aspect-square" />
            ))}
          </div>
        </div>
      )}

      {lightboxIdx !== null && (
        <Lightbox photos={photos} idx={lightboxIdx} onClose={closeLightbox} />
      )}
    </div>
  );
}
