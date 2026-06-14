import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Users, Video, ChevronRight, X, Clock, Tag,
  Loader2, FileText, Download, User, MapPin
} from "lucide-react";
import { useWebinars } from "@/hooks/useWebinars";
import WebinarRegistrationForm from "@/components/WebinarRegistrationForm";

const EVENT_TYPE_LABEL = { webinaire: "Webinaire", atelier: "Atelier", reunion: "Réunion" };
const EVENT_TYPE_COLOR = {
  webinaire: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  atelier:   "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  reunion:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

const FORMAT_LABEL = { en_ligne: "En ligne", presentiel: "Présentiel", hybride: "Hybride" };
const FORMAT_COLOR = {
  en_ligne:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  presentiel: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  hybride:    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
};
const PLATEFORME_LABEL = {
  zoom: "Zoom", meet: "Google Meet", teams: "Microsoft Teams",
  facebook: "Facebook Live", youtube: "YouTube Live", autre: "Lien de diffusion",
};
const PLATEFORME_COLOR = {
  zoom:     "text-blue-600 dark:text-blue-400",
  meet:     "text-green-600 dark:text-green-400",
  teams:    "text-indigo-600 dark:text-indigo-400",
  facebook: "text-blue-800 dark:text-blue-300",
  youtube:  "text-red-600 dark:text-red-400",
  autre:    "text-muted-foreground",
};

function fmtDate(iso) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lome",
    }).format(new Date(iso));
  } catch { return iso; }
}

function fmtDateShort(iso) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lome",
    }).format(new Date(iso));
  } catch { return iso; }
}

function fmtTime(iso) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lome",
    }).format(new Date(iso));
  } catch { return null; }
}

function daysUntil(iso) {
  if (!iso) return null;
  const diff = Math.ceil((new Date(iso) - new Date()) / 86400000);
  if (diff < 0)  return null;
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Demain";
  return `Dans ${diff} jours`;
}

// ── Rendu HTML de la description (issu du RichEditor Tiptap) ─────────────────
function DescriptionHtml({ html }) {
  if (!html || html === "<p></p>") return null;
  return (
    <div
      className="
        [&_h2]:font-heading [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-4 [&_h2]:mb-1.5 [&_h2]:border-b [&_h2]:border-border [&_h2]:pb-1
        [&_h3]:font-heading [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-3 [&_h3]:mb-1
        [&_p]:text-sm [&_p]:text-foreground/80 [&_p]:leading-relaxed [&_p]:my-1.5
        [&_strong]:text-foreground [&_strong]:font-semibold
        [&_em]:italic [&_em]:text-foreground/70
        [&_u]:underline
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ul]:space-y-0.5
        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_ol]:space-y-0.5
        [&_li]:text-sm [&_li]:text-foreground/80 [&_li]:leading-relaxed
        [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2
      "
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ── Bloc intervenants ──────────────────────────────────────────────────────────
function IntervenantsBlock({ intervenants }) {
  if (!Array.isArray(intervenants) || intervenants.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Intervenants
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {intervenants.map((iv, i) => (
          <div key={i} className="flex flex-col items-center text-center p-4 rounded-2xl bg-muted/30 border border-border gap-3">
            {/* Photo */}
            {iv.photo
              ? <img src={iv.photo} alt={iv.nom}
                  className="w-20 h-20 rounded-full object-cover object-top border-2 border-border shadow-sm flex-shrink-0" />
              : <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-border flex items-center justify-center flex-shrink-0">
                  <User className="w-9 h-9 text-primary/40" />
                </div>}

            {/* Infos */}
            <div className="space-y-1 w-full">
              <p className="text-sm font-bold text-foreground leading-snug">{iv.nom}</p>
              {iv.profession && (
                <p className="text-xs text-muted-foreground leading-relaxed">{iv.profession}</p>
              )}
              {iv.role && (
                <span className="inline-block mt-1 text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {iv.role}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bloc documents ─────────────────────────────────────────────────────────────
function DocumentsBlock({ documents }) {
  if (!Array.isArray(documents) || documents.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Documents & fiches
      </p>
      <div className="flex flex-wrap gap-2">
        {documents.map((doc, i) => (
          doc.url && (
            <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/30 hover:bg-muted hover:border-primary/30 text-xs font-medium text-foreground transition-colors">
              {doc.url.match(/\.(jpg|jpeg|png|webp|gif)$/i)
                ? <img src={doc.url} alt="" className="w-4 h-4 object-cover rounded" />
                : <FileText className="w-3.5 h-3.5 text-primary" />}
              {doc.nom || "Document"}
              <Download className="w-3 h-3 text-muted-foreground ml-0.5" />
            </a>
          )
        ))}
      </div>
    </div>
  );
}

// ── Carte événement (résumé) ───────────────────────────────────────────────────
function EventCard({ event, isSelected, isRegistered, onClick }) {
  const countdown     = daysUntil(event.date_time);
  const intervenants  = Array.isArray(event.intervenants) ? event.intervenants : [];
  const hasAffiche    = !!event.affiche;

  return (
    <motion.div layout
      className={`rounded-2xl border bg-card shadow-sm overflow-hidden transition-all cursor-pointer group ${
        isSelected ? "border-primary shadow-md" : "border-border hover:border-primary/40 hover:shadow-md"
      }`}
      onClick={onClick}
    >
      {/* Affiche banner */}
      {hasAffiche && (
        <div className="relative h-40 overflow-hidden">
          <img src={event.affiche} alt={event.title}
            className="w-full h-full object-cover"
            onError={e => { e.currentTarget.parentElement.style.display = "none"; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {countdown && (
            <span className="absolute bottom-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow">
              {countdown}
            </span>
          )}
        </div>
      )}

      <div className={`h-1 w-full bg-primary ${hasAffiche ? "hidden" : ""}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${EVENT_TYPE_COLOR[event.event_type] || EVENT_TYPE_COLOR.webinaire}`}>
                {EVENT_TYPE_LABEL[event.event_type] || event.event_type}
              </span>
              {!hasAffiche && countdown && (
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

            {event.description && event.description !== "<p></p>" && (
              <div className="mt-1.5 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                <DescriptionHtml html={event.description} />
              </div>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
              {event.date_time && (
                <span className="flex items-center gap-1 capitalize">
                  <Calendar className="w-3.5 h-3.5" />
                  {fmtDateShort(event.date_time)} — {fmtTime(event.date_time)}
                </span>
              )}
              {event.format && event.format !== "en_ligne" && (
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${FORMAT_COLOR[event.format]}`}>
                  {FORMAT_LABEL[event.format]}
                </span>
              )}
              {event.lieu && (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <MapPin className="w-3.5 h-3.5" /> {event.lieu}
                </span>
              )}
              {event.zoom_link && (
                <span className={`flex items-center gap-1 font-medium ${PLATEFORME_COLOR[event.plateforme] || "text-blue-600 dark:text-blue-400"}`}>
                  <Video className="w-3.5 h-3.5" />
                  {PLATEFORME_LABEL[event.plateforme] || "En ligne"}
                </span>
              )}
              {event.max_participants && (
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Max. {event.max_participants} places
                </span>
              )}
              {intervenants.length > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {intervenants.length} intervenant{intervenants.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Avatars intervenants (aperçu sur la carte) */}
            {intervenants.length > 0 && (
              <div className="flex items-center mt-3">
                {intervenants.slice(0, 5).map((iv, i) => (
                  iv.photo
                    ? <img key={i} src={iv.photo} alt={iv.nom}
                        className="w-8 h-8 rounded-full object-cover object-top border-2 border-card -ml-2 first:ml-0 shadow-sm"
                        title={`${iv.nom}${iv.role ? ` · ${iv.role}` : ""}`} />
                    : <div key={i} title={iv.nom}
                        className="w-8 h-8 rounded-full bg-primary/10 border-2 border-card -ml-2 first:ml-0 flex items-center justify-center shadow-sm">
                        <User className="w-4 h-4 text-primary/50" />
                      </div>
                ))}
                {intervenants.length > 5 && (
                  <span className="w-8 h-8 rounded-full bg-muted border-2 border-card -ml-2 flex items-center justify-center text-[10px] font-bold text-muted-foreground shadow-sm">
                    +{intervenants.length - 5}
                  </span>
                )}
                <span className="ml-2.5 text-xs text-muted-foreground">
                  {intervenants.length} intervenant{intervenants.length > 1 ? "s" : ""}
                </span>
              </div>
            )}
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
            <span className="text-xs text-muted-foreground">Cliquez pour voir le détail et vous inscrire</span>
            <span className="text-xs font-semibold text-primary">S'inscrire →</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────
export default function Webinaires() {
  const { events, loading } = useWebinars({ adminMode: false });
  const [selected, setSelected]   = useState(null);
  const [registered, setRegistered] = useState(new Set());

  const upcoming = events.filter(e => e.status === "open" && new Date(e.date_time) > new Date());
  const past     = events.filter(e => e.status === "closed" || new Date(e.date_time) <= new Date());

  function openEvent(evt) {
    setSelected(evt);
    setTimeout(() => {
      document.getElementById("webinar-detail-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
            <Video className="w-4 h-4" /> Événements
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

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        )}

        {!loading && (
          <>
            {/* Événements à venir */}
            <section>
              <h2 className="font-heading text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> À venir
              </h2>

              {upcoming.length === 0 ? (
                <div className="rounded-2xl border border-border bg-muted/30 p-10 text-center">
                  <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">Aucun webinaire prévu pour le moment.</p>
                  <p className="text-xs text-muted-foreground mt-1">Revenez bientôt ou suivez nos actualités.</p>
                </div>
              ) : (
                <div className="grid gap-5">
                  {upcoming.map(evt => (
                    <EventCard key={evt.id} event={evt}
                      isSelected={selected?.id === evt.id}
                      isRegistered={registered.has(evt.id)}
                      onClick={() => selected?.id === evt.id ? setSelected(null) : openEvent(evt)} />
                  ))}
                </div>
              )}
            </section>

            {/* Détail + formulaire */}
            <AnimatePresence>
              {selected && (
                <motion.section id="webinar-detail-section" key="detail"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
                  className="rounded-2xl border border-primary/30 bg-card shadow-md overflow-hidden"
                >
                  {/* En-tête affiche */}
                  {selected.affiche && (
                    <div className="relative h-52 overflow-hidden">
                      <img src={selected.affiche} alt={selected.title}
                        className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-5 right-12">
                        <p className="text-white font-heading text-xl font-bold leading-snug drop-shadow">
                          {selected.title}
                        </p>
                        {selected.date_time && (
                          <p className="text-white/80 text-sm mt-1 capitalize">
                            {fmtDate(selected.date_time)}
                          </p>
                        )}
                      </div>
                      <button onClick={() => setSelected(null)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="p-6 space-y-6">
                    {/* Titre si pas d'affiche */}
                    {!selected.affiche && (
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-heading text-lg font-bold text-foreground">{selected.title}</h3>
                          {selected.date_time && (
                            <p className="text-sm text-muted-foreground mt-0.5 capitalize">{fmtDate(selected.date_time)}</p>
                          )}
                        </div>
                        <button onClick={() => setSelected(null)}
                          className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Description complète */}
                    {selected.description && selected.description !== "<p></p>" && (
                      <DescriptionHtml html={selected.description} />
                    )}

                    {/* Infos pratiques : format, lieu, plateforme */}
                    {(selected.lieu || selected.zoom_link || selected.format) && (
                      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2.5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Informations pratiques
                        </p>
                        {selected.format && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${FORMAT_COLOR[selected.format] || ""}`}>
                              {FORMAT_LABEL[selected.format] || selected.format}
                            </span>
                          </div>
                        )}
                        {selected.lieu && (
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span className="text-foreground">{selected.lieu}</span>
                          </div>
                        )}
                        {selected.zoom_link && (
                          <div className="flex items-center gap-2 text-sm">
                            <Video className={`w-4 h-4 flex-shrink-0 ${PLATEFORME_COLOR[selected.plateforme] || "text-blue-500"}`} />
                            <a href={selected.zoom_link} target="_blank" rel="noopener noreferrer"
                              className={`font-semibold hover:underline ${PLATEFORME_COLOR[selected.plateforme] || "text-blue-600 dark:text-blue-400"}`}>
                              Rejoindre sur {PLATEFORME_LABEL[selected.plateforme] || "la plateforme"}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Intervenants */}
                    <IntervenantsBlock intervenants={selected.intervenants} />

                    {/* Documents */}
                    <DocumentsBlock documents={selected.documents} />

                    {/* Séparateur */}
                    <div className="border-t border-border pt-5">
                      <h4 className="font-heading text-base font-bold text-foreground mb-4">
                        {registered.has(selected.id) ? "Vous êtes inscrit(e) ✓" : "Inscription"}
                      </h4>
                      <WebinarRegistrationForm event={selected} onSuccess={onSuccess} />
                    </div>
                  </div>
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
                      {evt.affiche
                        ? <img src={evt.affiche} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        : <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Video className="w-5 h-5 text-muted-foreground" />
                          </div>}
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
