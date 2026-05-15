import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Lock, Eye, EyeOff, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function ResetPassword() {
  const [password, setPassword]   = useState("");
  const [confirm,  setConfirm]    = useState("");
  const [showPwd,  setShowPwd]    = useState(false);
  const [loading,  setLoading]    = useState(false);
  const [ready,    setReady]      = useState(false);
  const [linkError, setLinkError] = useState(/** @type {string|null} */(null));
  const navigate = useNavigate();

  useEffect(() => {
    // Détecter une erreur dans le hash (lien expiré, invalide…)
    const hash = window.location.hash;
    if (hash.includes("error=")) {
      const params = new URLSearchParams(hash.slice(1));
      const desc = params.get("error_description") || "Lien invalide ou expiré.";
      setLinkError(desc.replace(/\+/g, " "));
      return;
    }

    // Supabase traite le token du hash dès l'init, avant que useEffect s'exécute.
    // On vérifie donc la session existante en plus d'écouter les événements futurs.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    // PASSWORD_RECOVERY = mot de passe oublié ; SIGNED_IN = invitation première connexion
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(/** @type {React.FormEvent} */ e) {
    e.preventDefault();
    if (password !== confirm) { toast.error("Les mots de passe ne correspondent pas."); return; }
    if (password.length < 8)  { toast.error("Le mot de passe doit contenir au moins 8 caractères."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success("Mot de passe créé ! Redirection en cours…");
      setTimeout(() => navigate("/espace-membre"), 2500);
    }
    setLoading(false);
  }

  const bg = "linear-gradient(160deg, #042b14 0%, #063d1e 40%, #052918 70%, #031a0e 100%)";

  if (linkError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: bg }}>
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-900/40 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Lien expiré</h2>
          <p className="text-gray-400 text-sm mb-6">
            Ce lien d'activation n'est plus valide. Contactez l'administrateur pour recevoir un nouveau lien d'invitation.
          </p>
          <button onClick={() => navigate("/")}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bg }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50 text-sm">Vérification du lien…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: bg }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/Logo Redesign1.webp"
            alt="Ma Belle Promo"
            className="w-16 h-16 mx-auto mb-4 drop-shadow-lg"
          />
          <h1 className="text-2xl font-black text-white">Nouveau mot de passe</h1>
          <p className="text-emerald-400 text-sm mt-1 font-medium">Ma Belle Promo</p>
        </div>

        <div
          className="rounded-3xl border border-white/10 overflow-hidden"
          style={{ background: "rgba(5,20,10,0.75)", backdropFilter: "blur(20px)", boxShadow: "0 25px 80px rgba(0,0,0,0.5)" }}
        >
          <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-4">
            <p className="text-gray-400 text-sm mb-2">Choisissez un nouveau mot de passe sécurisé.</p>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Nouveau mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required minLength={8}
                  placeholder="8 caractères minimum"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white/8 transition-all"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  placeholder="Répétez le mot de passe"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white/8 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all"
              style={{
                background: loading ? "rgba(52,211,153,0.4)" : "linear-gradient(135deg,#10b981,#34d399)",
                color: "white",
                boxShadow: loading ? "none" : "0 8px 30px rgba(52,211,153,0.3)",
              }}
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <><Check className="w-4 h-4" /> Enregistrer le mot de passe</>}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">© 2018–2026 Ma Belle Promo · FDD Université de Lomé</p>
      </motion.div>
    </div>
  );
}
