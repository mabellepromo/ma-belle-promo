import { Component } from "react";
import { AlertCircle } from "lucide-react";

const CHUNK_ERROR_PATTERNS = [
  "dynamically imported module",
  "Failed to fetch dynamically",
  "Importing a module script failed",
  "Loading chunk",
  "Loading CSS chunk",
];

function isChunkError(error) {
  const msg = error?.message || String(error);
  return CHUNK_ERROR_PATTERNS.some(p => msg.includes(p));
}

export default class ErrorBoundary extends Component {
  state = { error: null, info: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error("[ErrorBoundary]", error, info?.componentStack);

    // Rechargement automatique sur erreur de chunk obsolète (après déploiement)
    // sessionStorage évite la boucle infinie si le rechargement échoue aussi
    if (isChunkError(error) && !sessionStorage.getItem("_chunkReload")) {
      sessionStorage.setItem("_chunkReload", "1");
      window.location.reload();
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 p-4 sm:p-8 text-center">
          <AlertCircle className="w-12 h-12 text-destructive opacity-80" />
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Cette page n'a pas pu se charger
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Une erreur est survenue. Rafraîchissez la page ou retournez à l'accueil.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { sessionStorage.removeItem("_chunkReload"); window.location.reload(); }}
              className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Rafraîchir
            </button>
            <a
              href="/"
              className="px-5 py-2 rounded-full border border-border text-sm font-semibold hover:bg-accent transition-colors"
            >
              Accueil
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
