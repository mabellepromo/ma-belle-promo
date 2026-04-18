import { motion } from "framer-motion";
import PageHero from "../components/PageHero";
import { Play, ExternalLink } from "lucide-react";
import { useContent } from "../lib/localStore";
import { mediaVideos as videosStatic, mediaPhotos as photosStatic } from "../data/mediatheque";

export default function Mediatheque() {
  const videos = useContent("mediaVideos", videosStatic);
  const photos = useContent("mediaPhotos", photosStatic);
  return (
    <div>
      <PageHero title="Médiathèque" subtitle="Informations — Photos & Vidéos" />

      <section className="py-20 max-w-6xl mx-auto px-6">
        {/* Vidéos */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-8">Vidéos</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {videos.map((v, i) => (
              <motion.div
                key={v.titre}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="relative">
                  <img
                    src={`https://i.ytimg.com/vi/${v.videoId}/sddefault.jpg`}
                    alt={v.titre}
                    className="w-full h-44 object-cover"
                  />
                  <a
                    href={`https://www.youtube.com/watch?v=${v.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors"
                  >
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-foreground ml-1" />
                    </div>
                  </a>
                  <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold bg-white/90 rounded-full">{v.type}</span>
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 text-xs bg-black/70 text-white rounded">{v.duree}</span>
                </div>
                <div className="p-5">
                  <p className="text-xs text-muted-foreground mb-2">{v.date}</p>
                  <h3 className="font-heading text-sm font-bold text-foreground line-clamp-2">{v.titre}</h3>
                  <a
                    href={`https://www.youtube.com/watch?v=${v.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-1.5 text-xs text-primary font-medium"
                  >
                    Voir sur YouTube <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Photos */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-8">Galerie photos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="relative overflow-hidden rounded-xl aspect-video group cursor-pointer"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                  <span className="p-3 text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {photo.alt}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}