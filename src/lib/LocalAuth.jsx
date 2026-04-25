/**
 * Authentification via Supabase Auth — FDD Ma Belle Promo
 * Nom de fichier conservé pour éviter de toucher les imports existants.
 * Exporte la même API que l'ancien système : { session, login, logout }
 * Le champ session.role est lu depuis user.user_metadata.role (Supabase).
 */
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";

const LocalAuthContext = createContext(null);

/** Transforme un objet session Supabase en forme compatible avec le reste du projet */
function mapSession(supabaseSession) {
  const u = supabaseSession.user;
  return {
    id: u.id,
    nom: u.user_metadata?.nom || u.email,
    email: u.email,
    role: u.user_metadata?.role || "invite",
    photo: u.user_metadata?.photo || "",
    loggedAt: u.last_sign_in_at,
  };
}

export function LocalAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Récupérer la session active au démarrage (persiste via cookie Supabase)
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s ? mapSession(s) : null);
      setReady(true);
    });

    // Écouter les changements : connexion, déconnexion, renouvellement de token
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ? mapSession(s) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  /** Retourne null si OK, message d'erreur (string) sinon */
  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return null;
  }

  async function logout() {
    // Vider le cache de données local (préférences cookies conservées)
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith("mbp_store_"))
        .forEach(k => localStorage.removeItem(k));
    } catch {}
    await supabase.auth.signOut();
  }

  // Évite un flash "Accès refusé" pendant que Supabase vérifie la session
  if (!ready) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <LocalAuthContext.Provider value={{ session, login, logout }}>
      {children}
    </LocalAuthContext.Provider>
  );
}

export function useLocalAuth() {
  const ctx = useContext(LocalAuthContext);
  if (!ctx) throw new Error("useLocalAuth must be used within LocalAuthProvider");
  return ctx;
}
