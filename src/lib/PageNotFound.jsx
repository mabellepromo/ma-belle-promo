import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { useLocalAuth } from '@/lib/LocalAuth';
import { useLocation } from 'react-router-dom';

export default function PageNotFound() {
  const location = useLocation();
  const { session } = useLocalAuth();
  const isAdmin = session?.role === 'admin';

  return (
    <div className="min-h-screen bg-foreground flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">

      {/* Filigrane 404 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span
          className="font-heading font-black text-white leading-none"
          style={{ fontSize: "clamp(10rem, 38vw, 26rem)", opacity: 0.035 }}
        >
          404
        </span>
      </div>

      {/* Halos */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/8 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-lg"
      >
        <img
          src="/Logo Redesign1.webp"
          alt=""
          aria-hidden="true"
          className="w-16 h-16 mx-auto mb-8 opacity-50"
        />

        <p className="eyebrow text-primary/70 mb-4">Ma Belle Promo · Erreur 404</p>

        <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
          Page introuvable
        </h1>

        <p className="text-white/50 leading-relaxed mb-10 max-w-sm mx-auto">
          L'URL a comparu, invoqué un vice de forme, et disparu.
          {location.pathname !== '/' && (
            <span className="block mt-1 text-white/30 text-sm font-mono">
              {location.pathname}
            </span>
          )}
        </p>

        {isAdmin && (
          <div className="mb-8 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm max-w-sm mx-auto">
            Cette page n'a pas encore été implémentée.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-full hover:opacity-90 transition-opacity"
          >
            <Home className="w-4 h-4" /> Retour à l'accueil
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white/70 text-sm font-semibold rounded-full hover:border-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Page précédente
          </button>
        </div>
      </motion.div>
    </div>
  );
}
