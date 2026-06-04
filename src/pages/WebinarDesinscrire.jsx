import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, Loader2, Calendar, AlertCircle } from "lucide-react";
import { getRegistrationByToken, unregisterByToken } from "@/hooks/useWebinars";

function fmtDate(iso) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lome",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function WebinarDesinscrire() {
  const { token } = useParams();

  const [registration, setRegistration] = useState(null);
  const [loadState, setLoadState]       = useState("loading"); // loading | found | not_found | already_done
  const [confirming, setConfirming]     = useState(false);
  const [done, setDone]                 = useState(false);

  useEffect(() => {
    if (!token) { setLoadState("not_found"); return; }
    getRegistrationByToken(token).then(data => {
      if (!data) {
        setLoadState("not_found");
        return;
      }
      setRegistration(data);
      if (data.status !== "registered") {
        setLoadState("already_done");
      } else {
        setLoadState("found");
      }
    });
  }, [token]);

  async function handleConfirm() {
    setConfirming(true);
    try {
      await unregisterByToken(token);
      setDone(true);
    } catch (err) {
      alert("Erreur lors de la désinscription : " + err.message);
    } finally {
      setConfirming(false);
    }
  }

  const event = registration?.webinar_events;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo / En-tête */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-xs font-black text-primary tracking-tight">MBP</span>
          </div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Ma Belle Promo — FDD Lomé
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-primary" />
          <div className="p-6">

            {/* Chargement */}
            {loadState === "loading" && (
              <div className="text-center py-8">
                <Loader2 className="w-7 h-7 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground mt-3">Vérification du lien…</p>
              </div>
            )}

            {/* Lien invalide */}
            {loadState === "not_found" && (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <h2 className="font-heading text-lg font-bold text-foreground mb-2">Lien invalide</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ce lien de désinscription est introuvable ou a expiré.
                  Si vous souhaitez vous désinscrire, écrivez-nous à{" "}
                  <a href="mailto:contact@mabellepromo.org" className="text-primary underline">
                    contact@mabellepromo.org
                  </a>.
                </p>
              </div>
            )}

            {/* Déjà désinscrit */}
            {loadState === "already_done" && registration && (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-muted-foreground" />
                </div>
                <h2 className="font-heading text-lg font-bold text-foreground mb-2">Déjà désinscrit(e)</h2>
                <p className="text-sm text-muted-foreground">
                  <strong>{registration.nom_complet}</strong>, vous avez déjà été désinscrit(e) de cet événement.
                </p>
                {event?.title && (
                  <p className="text-xs text-muted-foreground mt-2">Événement : {event.title}</p>
                )}
              </div>
            )}

            {/* Confirmation demandée */}
            {loadState === "found" && !done && registration && (
              <>
                <div className="mb-6">
                  <h2 className="font-heading text-lg font-bold text-foreground mb-1">Se désinscrire</h2>
                  <p className="text-sm text-muted-foreground">
                    Vous êtes sur le point de vous désinscrire de l'événement suivant.
                  </p>
                </div>

                {/* Détails inscription */}
                <div className="rounded-xl bg-muted/30 border border-border p-4 mb-6 space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Participant</p>
                    <p className="text-sm font-semibold text-foreground">{registration.nom_complet}</p>
                    <p className="text-xs text-muted-foreground">{registration.email}</p>
                  </div>
                  {event && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">Événement</p>
                      <p className="text-sm font-semibold text-foreground">{event.title}</p>
                      {event.date_time && (
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {fmtDate(event.date_time)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Link
                    to="/activites/webinaires"
                    className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    Annuler
                  </Link>
                  <button
                    onClick={handleConfirm}
                    disabled={confirming}
                    className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
                  >
                    {confirming
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> En cours…</>
                      : <><X className="w-3.5 h-3.5" /> Confirmer la désinscription</>}
                  </button>
                </div>
              </>
            )}

            {/* Succès désinscription */}
            {done && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="font-heading text-lg font-bold text-foreground mb-2">Désinscription confirmée</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Vous avez bien été désinscrit(e). Nous espérons vous retrouver lors d'un prochain événement.
                </p>
                <Link
                  to="/activites/webinaires"
                  className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-primary hover:underline"
                >
                  Voir les prochains webinaires →
                </Link>
              </motion.div>
            )}

          </div>
        </div>
      </motion.div>
    </div>
  );
}
