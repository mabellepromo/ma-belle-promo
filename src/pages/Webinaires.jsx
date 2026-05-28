import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Users, Video, ChevronRight, X, Clock, Tag, Loader2 } from "lucide-react";
import { useWebinars } from "@/hooks/useWebinars";
import WebinarRegistrationForm from "@/components/WebinarRegistrationForm";

const EVENT_TYPE_LABEL = {
  webinaire: "Webinaire",
  atelier:   "Atelier",
  reunion:   "Réunion",
};

const EVENT_TYPE_COLOR = {
  webinaire: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  atelier:   "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  reunion:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

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

function fmtDateShort(iso) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lome",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function fmtTime(iso) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lome",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

function daysUntil(iso) {
  if (!iso) return null;
  const diff = Math.ceil((new Date(iso) - new Date()) / 86400000);
  if (diff < 0) return null;
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Demain";
  return `Dans ${diff} jours`;
}

export default function Webinaires() {
  const { events, loading } = useWebinars({ adminMode: false });
  const [selected, setSelected] = useState(null);
  const [registered, setRegistered] = useState(new Set());

  const upcoming = events.filter(e => e.status === "open" && new Date(e.date_time) > new Date());
  const past     = events.filter(e => e.status === "closed" || new Date(e.date_time) <= new Date());

  function openEvent(evt) {
    setSelected(evt);
    setTimeout(() => {
      document.getElementById("webinar-form-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function onSuccess() {
    if (selected) setRegistered(s => new Set([...s, selected.id]));
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0a3d28] to-[#14532d] py-16 px-6">
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm text-emerald-200 mb-4 font-medium">
            <Video className="w-4 h-4" /> Événements en ligne
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            Webinaires &amp; Ateliers MBP
          </h1>
          <p className="text-emerald-200 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Rejoignez nos conférences, formations et échanges en ligne ouverts à tous les membres
            et amis de la Faculté de Droit de Lomé.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* Chargement */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        )}

        {/* Événements à venir */}
        {!loading && (
          <>
            <section>
              <h2 className="font-heading text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> À venir
              </h2>

              {upcoming.length === 0 ? (
                <div className="rounded-2xl border border-border bg-muted/30 p-10 text-center">
                  <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">Aucun webinaire prévu pour le moment.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Revenez bientôt ou suivez nos actualités pour être informé(e).
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {upcoming.map(evt => (
                    <EventCard
                      key={evt.id}
                      event={evt}
                      isSelected={selected?.id === evt.id}
                      isRegistered={registered.has(evt.id)}
                      onClick={() => selected?.id === evt.id ? setSelected(null) : openEvent(evt)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Zone formulaire */}
            <AnimatePresence>
              {selected && !registered.has(selected.id) && (
                <motion.section
                  id="webinar-form-section"
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-heading text-base font-bold text-foreground">
                      Inscription — {selected.title}
                    </h3>
                    <button
                      onClick={() => setSelected(null)}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <WebinarRegistrationForm event={selected} onSuccess={onSuccess} />
                </motion.section>
              )}
            </AnimatePresence>

            {/* Événements passés */}
            {past.length > 0 && (
              <section>
                <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Événements passés</span>
                </h2>
                <div className="grid gap-3">
                  {past.slice(0, 5).map(evt => (
                    <div key={evt.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/20 opacity-70">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Video className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{evt.title}</p>
                        {evt.date_time && (
                          <p className="text-xs text-muted-foreground mt-0.5 capitalize">{fmtDateShort(evt.date_time)}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">Terminé</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, isSelected, isRegistered, onClick }) {
  const countdown = daysUntil(event.date_time);

  return (
    <motion.div
      layout
      className={`rounded-2xl border bg-card shadow-sm overflow-hidden transition-all cursor-pointer group ${
        isSelected
          ? "border-primary shadow-md"
          : "border-border hover:border-primary/40 hover:shadow-md"
      }`}
      onClick={onClick}
    >
      <div className="h-1 w-full bg-primary" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${EVENT_TYPE_COLOR[event.event_type] || EVENT_TYPE_COLOR.webinaire}`}>
                {EVENT_TYPE_LABEL[event.event_type] || event.event_type}
              </span>
              {countdown && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {countdown}
                </span>
              )}
              {isRegistered && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  ✓ Inscrit(e)
                </span>
              )}
            </div>

            <h3 className="font-heading text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
              {event.title}
            </h3>

            {event.description && (
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                {event.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
              {event.date_time && (
                <span className="flex items-center gap-1 capitalize">
                  <Calendar className="w-3.5 h-3.5" />
                  {fmtDateShort(event.date_time)} — {fmtTime(event.date_time)}
                </span>
              )}
              {event.max_participants && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  Max. {event.max_participants} places
                </span>
              )}
              {event.zoom_link && (
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <Video className="w-3.5 h-3.5" /> En ligne (Zoom)
                </span>
              )}
            </div>
          </div>

          <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
            isSelected
              ? "bg-primary text-primary-foreground border-primary rotate-90"
              : "border-border text-muted-foreground group-hover:border-primary group-hover:text-primary"
          }`}>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {!isRegistered && (
          <div className={`mt-4 pt-3 border-t border-border flex items-center justify-between transition-all ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
            <span className="text-xs text-muted-foreground">Cliquez pour voir le formulaire d'inscription</span>
            <span className="text-xs font-semibold text-primary">S'inscrire →</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
