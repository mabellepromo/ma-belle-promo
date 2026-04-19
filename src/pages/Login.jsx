import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLocalAuth } from "../lib/LocalAuth";
import { supabase } from "../lib/supabase";
import { Mail, Lock, Eye, EyeOff, AlertCircle, LogIn, Shield, ArrowLeft, Send } from "lucide-react";

export default function Login() {
  const { login } = useLocalAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [forgot,   setForgot]   = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const ERRORS_FR = {
    "Invalid login credentials":   "Email ou mot de passe incorrect.",
    "Email not confirmed":          "Veuillez confirmer votre email avant de vous connecter.",
    "Too many requests":            "Trop de tentatives. Réessayez dans quelques minutes.",
    "User not found":               "Aucun compte trouvé avec cet email.",
  };
  function frErr(msg) {
    for (const [en, fr] of Object.entries(ERRORS_FR)) {
      if (msg?.includes(en)) return fr;
    }
    return msg;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const err = await login(email, password);
    if (err) {
      setError(frErr(err));
      setLoading(false);
      return;
    }
    const redirect = searchParams.get("redirect") || "/";
    navigate(redirect, { replace: true });
  }

  async function handleReset(e) {
    e.preventDefault();
    if (!email) { setError("Veuillez saisir votre adresse email."); return; }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (err) { setError(frErr(err.message)); return; }
    setResetSent(true);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(160deg, #042b14 0%, #063d1e 40%, #052918 70%, #031a0e 100%)",
      }}
    >
      {/* Lumières ambiantes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", top: "10%", left: "5%",
            width: 600, height: 600, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 65%)",
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          style={{
            position: "absolute", bottom: "10%", right: "5%",
            width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 65%)",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo + titre */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <img
            src="https://media.base44.com/images/public/69da5bf6442b31e7eee54888/42e641694_LogoRedesign1.png"
            alt="Ma Belle Promo"
            className="w-20 h-20 mx-auto mb-4 drop-shadow-lg"
          />
          <h1 className="text-3xl font-black text-white">Ma Belle Promo</h1>
          <p className="text-emerald-400 text-sm mt-1 font-medium tracking-wide">
            FDD · Université de Lomé · 1994–2000
          </p>
        </motion.div>

        {/* Carte de connexion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-3xl border border-white/10 overflow-hidden"
          style={{
            background: "rgba(5, 20, 10, 0.75)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(52,211,153,0.08)",
          }}
        >
          <div className="p-8">
            {forgot ? (
              resetSent ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h2 className="text-lg font-bold text-white mb-2">Email envoyé !</h2>
                  <p className="text-gray-400 text-sm mb-6">Vérifiez votre boîte mail et cliquez sur le lien de réinitialisation.</p>
                  <button onClick={() => { setForgot(false); setResetSent(false); }} className="text-emerald-400 text-sm hover:underline flex items-center gap-1.5 mx-auto">
                    <ArrowLeft className="w-3.5 h-3.5" /> Retour à la connexion
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={() => { setForgot(false); setError(""); }} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-xs mb-5 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Retour
                  </button>
                  <h2 className="text-xl font-bold text-white mb-1">Mot de passe oublié</h2>
                  <p className="text-gray-400 text-sm mb-6">Saisissez votre email pour recevoir un lien de réinitialisation.</p>
                  <form onSubmit={handleReset} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">Adresse email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="votre@email.com" required
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white/8 transition-all" />
                      </div>
                    </div>
                    <AnimatePresence>
                      {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
                          <AlertCircle className="w-4 h-4 shrink-0" />{error}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all"
                      style={{ background: loading ? "rgba(52,211,153,0.4)" : "linear-gradient(135deg,#10b981,#34d399)", color: "white", boxShadow: loading ? "none" : "0 8px 30px rgba(52,211,153,0.3)" }}>
                      {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Envoyer le lien</>}
                    </motion.button>
                  </form>
                </>
              )
            ) : (
              <>
            <h2 className="text-xl font-bold text-white mb-1">Connexion</h2>
            <p className="text-gray-400 text-sm mb-6">Accédez à votre espace membre</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="votre@email.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white/8 transition-all"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white/8 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Message d'erreur */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bouton connexion */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: loading
                    ? "rgba(52,211,153,0.4)"
                    : "linear-gradient(135deg, #10b981, #34d399)",
                  color: "white",
                  boxShadow: loading ? "none" : "0 8px 30px rgba(52,211,153,0.3)",
                }}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <><LogIn className="w-4 h-4" /> Se connecter</>
                )}
              </motion.button>

              {/* Lien mot de passe oublié */}
              <button type="button" onClick={() => { setForgot(true); setError(""); }}
                className="w-full text-center text-xs text-gray-500 hover:text-emerald-400 transition-colors mt-1">
                Mot de passe oublié ?
              </button>
            </form>
            </>
            )}
          </div>

        </motion.div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © 2018–2024 Ma Belle Promo · FDD Université de Lomé
        </p>
      </div>
    </div>
  );
}
