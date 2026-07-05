// Section « Historique des emails » — journal central de TOUS les emails
// envoyés par l'application (dashboard, site public, automatisations).
// Lecture seule sur la table email_logs (alimentée côté serveur uniquement) :
// on peut consulter le contenu archivé (overlay openDoc) et supprimer une ligne.

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Mail, Search, Eye, Trash2, RefreshCw, TestTube } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { openDoc } from "../../lib/documentGenerators";
import ConfirmDialog from "../../components/ConfirmDialog";
import { SectionHeader, EmptyState, SectionLoader } from "./shared.jsx";

// Libellés lisibles des sources techniques (repli : la valeur brute)
const SOURCE_LABELS = {
  "courrier":                 "Courrier",
  "circulaire":               "Circulaire",
  "envoi-masse":              "Email de masse",
  "event-invitation":         "Invitation événement",
  "webinaire-billet":         "Billet webinaire",
  "rappel-webinaire":         "Rappel webinaire",
  "relance-cotisation":       "Relance cotisation",
  "invitation-sondage":       "Invitation sondage",
  "reponse-message":          "Réponse message",
  "formulaire-contact":       "Formulaire contact",
  "newsletter-confirmation":  "Newsletter (confirmation)",
  "alerte-admin":             "Alerte admin",
  "webinaire-confirmation":   "Confirmation webinaire",
  "affectation-benevole":     "Affectation bénévole",
  "boutique-commande":        "Commande boutique",
  "automatisation":           "Automatisation",
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function HistoriqueEmailsSection() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  async function loadLogs() {
    setLoading(true);
    const { data, error } = await supabase
      .from("email_logs")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(300);
    if (error) toast.error("Erreur chargement historique : " + error.message);
    else setLogs(data || []);
    setLoading(false);
  }

  useEffect(() => { loadLogs(); }, []);

  // Sources présentes dans les données (pour le filtre déroulant)
  const sources = useMemo(
    () => [...new Set(logs.map(l => l.source).filter(Boolean))].sort(),
    [logs]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter(l => {
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
      if (!q) return true;
      const hay = [l.subject, l.sent_by, ...(l.recipients || []), ...(l.cc || [])]
        .join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [logs, search, sourceFilter]);

  function viewContent(log) {
    if (!log.html_content) { toast.info("Contenu non archivé pour cet envoi."); return; }
    openDoc(log.html_content, `email-${log.id}.html`);
  }

  async function handleDelete() {
    const { error } = await supabase.from("email_logs").delete().eq("id", deleteConfirm.id);
    if (error) toast.error("Erreur suppression : " + error.message);
    else {
      setLogs(prev => prev.filter(l => l.id !== deleteConfirm.id));
      toast.success("Ligne supprimée.");
    }
    setDeleteConfirm(null);
  }

  return (
    <div className="max-w-5xl">
      <SectionHeader
        title="Historique des emails"
        subtitle={`${logs.length} envoi${logs.length !== 1 ? "s" : ""} journalisé${logs.length !== 1 ? "s" : ""} — tous canaux confondus`}
      >
        <button onClick={loadLogs} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Actualiser
        </button>
      </SectionHeader>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher (objet, destinataire, expéditeur)…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40">
          <option value="all">Toutes les sources</option>
          {sources.map(s => (
            <option key={s} value={s}>{SOURCE_LABELS[s] || s}</option>
          ))}
        </select>
      </div>

      {loading && <SectionLoader />}

      {!loading && filtered.length === 0 && (
        <EmptyState icon={Mail} title="Aucun email journalisé"
          hint="Les envois apparaîtront ici automatiquement (courriers, circulaires, automatisations…)." />
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map(log => {
            const recipients = log.recipients?.length
              ? log.recipients.join(", ")
              : `${log.recipient_count ?? "?"} destinataire(s)`;
            const isError = log.status === "error";
            return (
              <div key={log.id}
                className="group bg-background border border-border rounded-2xl px-4 py-3 hover:border-primary/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isError ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-foreground truncate">{log.subject}</p>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground flex-shrink-0">
                        {SOURCE_LABELS[log.source] || log.source || "—"}
                      </span>
                      {isError && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 flex-shrink-0">Erreur</span>
                      )}
                      {log.test_redirect && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 flex-shrink-0">
                          <TestTube className="w-2.5 h-2.5" /> Test
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate" title={recipients}>
                      À : {recipients}
                      {log.cc?.length ? ` · Cc : ${log.cc.join(", ")}` : ""}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                      {formatDate(log.sent_at)}
                      {log.sent_by ? ` · par ${log.sent_by}` : ""}
                      {log.recipient_count > 1 ? ` · ${log.recipient_count} destinataires` : ""}
                    </p>
                    {isError && log.error_message && (
                      <p className="text-[11px] text-red-400 mt-1 line-clamp-2">{log.error_message}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {log.html_content && (
                      <button onClick={() => viewContent(log)} title="Voir le contenu envoyé"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => setDeleteConfirm(log)} title="Supprimer cette ligne"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Supprimer cette trace ?"
        message={deleteConfirm ? `L'entrée « ${deleteConfirm.subject} » sera définitivement supprimée du journal.` : ""}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
