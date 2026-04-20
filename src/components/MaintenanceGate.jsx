import { useState } from "react";

// ── Mettre à false quand le site est prêt à être public ──
export const MAINTENANCE_MODE = true;
const ACCESS_CODE = "mbp2026";
const STORAGE_KEY = "mbp_access_granted";

export default function MaintenanceGate({ children }) {
  const [granted, setGranted] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === "1"
  );
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  if (!MAINTENANCE_MODE || granted) return children;

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
          <img src="/images/Logo/LogoRedesign1.png" alt="Ma Belle Promo"
            className="w-full h-full object-cover" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-white tracking-wide">Ma Belle Promo</h1>
        <p className="text-sm mt-1" style={{ color: "#6ee7b7" }}>
          Association FDD · Université de Lomé
        </p>
      </div>

      {/* Message */}
      <div className="text-center mb-8 max-w-sm">
        <p className="text-white/80 text-sm leading-relaxed">
          Notre nouveau site est en cours de finalisation.<br />
          Entrez le code d'accès pour le prévisualiser.
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
