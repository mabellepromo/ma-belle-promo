import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Lock, Images, ArrowRight, Calendar, MapPin } from "lucide-react";
import SEO from "../components/SEO";
import { useGaleries } from "../hooks/useGaleries";
import { useLocalAuth } from "../lib/LocalAuth";

export default function Galeries() {
  const { session } = useLocalAuth();
  const { galeries } = useGaleries();
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Galeries photos" description="Les galeries photos des événements et activités de Ma Belle Promo, association des anciens diplômés de la FDD de Lomé." path="/galeries" />

      {/* En-tête */}
      <div className="bg-foreground border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-2 mb-2">
              <p className="eyebrow text-primary/70">Ma Belle Promo</p>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-[10px] font-bold">
                <Lock className="w-3 h-3" /> Membres uniquement
              </span>
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
              Galeries photos
            </h1>
            <p className="text-white/50 text-sm max-w-xl">
              Vos souvenirs en images — retrouvailles, galas, conférences et moments partagés, réservés aux membres de l'association.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Grille */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        {galeries.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Images className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Aucune galerie pour le moment</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galeries.map((g, i) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link
                  to={g.access === "membres" && !session ? `/login?redirect=/galeries/${g.id}` : `/galeries/${g.id}`}
                  className="group block rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 bg-card"
                >

                  {/* Image de couverture — ratio 4/3 cohérent */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {g.cover ? (
                      <img loading="lazy" src={g.cover} alt={g.titre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Images className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Compteur photos */}
                    {g.photos.length > 0 && (
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold">
                        {g.photos.length} photos
                      </div>
                    )}

                    {/* Badge accès */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold">
                      <Lock className="w-3 h-3" /> Membres
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-5">
                    <h2 className="font-heading text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                      {g.titre}
                    </h2>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" />{g.date}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" />{g.lieu}</span>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">{g.description}</p>
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-primary">
                      Voir la galerie <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
