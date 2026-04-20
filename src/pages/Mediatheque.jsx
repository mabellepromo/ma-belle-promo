import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import { Play, ExternalLink, Images } from "lucide-react";
import { useMediaVideos } from "../hooks/useMediaVideos";
import { useGaleries } from "../hooks/useGaleries";
import { useLocalAuth } from "../lib/LocalAuth";

export default function Mediatheque() {
  const { session } = useLocalAuth();
  const { videos } = useMediaVideos();
  const { galeries } = useGaleries();
  return (
    <div>
      <PageHero title="Médiathèque" subtitle="Informations — Photos & Vidéos" />

      <section className="py-20 max-w-6xl mx-auto px-6">
        {/* Vidéos */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-8">Vidéos</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
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

        {/* Galeries */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-8">Galeries photos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galeries.map((g, i) => {
              const to = g.access === "membres" && !session
                ? `/login?redirect=/galeries/${g.id}`
                : `/galeries/${g.id}`;
              return (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                >
                  <Link to={to} className="relative block overflow-hidden rounded-xl aspect-video group">
                    {g.cover ? (
                      <img
                        src={g.cover}
                        alt={g.titre}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Images className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors" />
                    <span className="absolute inset-x-0 bottom-0 p-3 text-xs text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity truncate">
                      {g.titre}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>
    </div>
  );
}