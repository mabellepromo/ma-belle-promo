import { useState, useEffect } from "react";

// ── Contrôlé par la variable Vercel VITE_MAINTENANCE_MODE ──
// Pour désactiver : repasser à la ligne ci-dessous et redéployer
export const MAINTENANCE_MODE = true;
// export const MAINTENANCE_MODE = import.meta.env.VITE_MAINTENANCE_MODE === "true";
const ACCESS_CODE = "mbp2026";
const STORAGE_KEY = "mbp_access_granted";

// Chemins accessibles publiquement même en mode maintenance
const PUBLIC_PATHS = [
  "/activites/webinaires",
  "/webinaires/desinscrire/",
];
function isPublicPath(pathname) {
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p));
}

export default function MaintenanceGate({ children }) {
  const [granted, setGranted] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === "1"
  );
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [pathname, setPathname] = useState(() => window.location.pathname);

  // Suit les navigations React Router (history.pushState / replaceState)
  // pour bloquer les pages protégées même depuis une page autorisée
  useEffect(() => {
    const onNav = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onNav);
    const origPush    = history.pushState.bind(history);
    const origReplace = history.replaceState.bind(history);
    history.pushState    = (...args) => { origPush(...args);    onNav(); };
    history.replaceState = (...args) => { origReplace(...args); onNav(); };
    return () => {
      window.removeEventListener("popstate", onNav);
      history.pushState    = origPush;
      history.replaceState = origReplace;
    };
  }, []);

  if (!MAINTENANCE_MODE || granted || isPublicPath(pathname)) return children;

  function handleSubmit(e) {
    e.preventDefault();
    if (input.trim() === ACCESS_CODE) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setGranted(true);
    } else {
      setError(true);
      setInput("");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "linear-gradient(135deg, #0f2a1e 0%, #1a3a28 60%, #0f2a1e 100%)" }}>

      {/* Logo / nom */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 overflow-hidden border-2"
          style={{ borderColor: "rgba(52,211,153,0.4)" }}>
          <img src="/Logo Redesign1.webp" alt="Ma Belle Promo"
            className="w-full h-full object-cover" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-white tracking-wide">Ma Belle Promo (MBP)</h1>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: "#6ee7b7" }}>
          Association des anciens étudiants de la Faculté de Droit<br />
          de l'Université de Lomé · Promotion 1994–2000
        </p>
      </div>

      {/* Message */}
      <div className="text-center mb-8 max-w-sm">
        <p className="text-white/80 text-sm leading-relaxed">
          Notre nouveau site est en cours de construction.<br />
          Merci de revenir plus tard.
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-3">
        <input
          type="password"
          value={input}
          onChange={e => { setInput(e.target.value); setError(false); }}
          placeholder="Code d'accès"
          className="w-full px-4 py-3 rounded-xl text-sm text-center tracking-widest bg-white/10 text-white placeholder-white/40 border focus:outline-none focus:ring-2"
          style={{
            borderColor: error ? "#f87171" : "rgba(255,255,255,0.15)",
            "--tw-ring-color": "#34d399",
          }}
          autoFocus
        />
        {error && (
          <p className="text-xs text-center" style={{ color: "#f87171" }}>
            Code incorrect, réessayez.
          </p>
        )}
        <button
          type="submit"
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(90deg, #16a34a, #34d399)" }}>
          Accéder au site
        </button>
      </form>

      <p className="mt-10 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
        © {new Date().getFullYear()} Ma Belle Promo · Tous droits réservés
      </p>
    </div>
  );
}
