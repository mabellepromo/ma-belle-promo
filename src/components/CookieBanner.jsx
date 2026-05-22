import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "mbp_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = (value) => {
    localStorage.setItem(STORAGE_KEY, value);
    setHiding(true);
    setTimeout(() => setVisible(false), 350);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-[45]"
      style={{
        transition: "opacity 0.35s ease-out",
        opacity: hiding ? 0 : 1,
      }}
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Cookie className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground mb-1">Ce site utilise des cookies</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Uniquement des cookies techniques nécessaires à la connexion et au bon fonctionnement du site. Aucun cookie publicitaire ou de tracking.{" "}
              <Link to="/confidentialite" className="text-primary hover:underline font-medium">
                En savoir plus
              </Link>
            </p>
          </div>
          <button
            onClick={() => dismiss("declined")}
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => dismiss("declined")}
            className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={() => dismiss("accepted")}
            className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
