import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import QRCode from "qrcode";
import {
  QrCode, Users, Download, X, Loader2, MapPin, Calendar,
  CheckCircle, Trash2, Plus, RefreshCw
} from "lucide-react";
import { inp, Field } from "./shared";

const CHECKIN_URL = (id) => `${window.location.origin}/checkin/${id}`;

export default function CheckinSection() {
  const [events, setEvents]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [presenceCounts, setPresenceCounts] = useState({});
  const [qr, setQr]                   = useState(null);   // { eventId, titre, dataUrl }
  const [panel, setPanel]             = useState(null);   // { eventId, titre, list }
  const [panelLoading, setPanelLoading] = useState(false);
  const [manuelForm, setManuelForm]   = useState(null);   // { eventId, nom, email }
  const [savingManuel, setSavingManuel] = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: evts }, { data: counts }] = await Promise.all([
      supabase.from("evenements").select("id, titre, date, heures, lieu, statut, image").order("date", { ascending: false }),
      supabase.from("evenement_presences").select("evenement_id"),
    ]);
    setEvents(evts || []);
    const c = {};
    (counts || []).forEach(r => { c[r.evenement_id] = (c[r.evenement_id] || 0) + 1; });
    setPresenceCounts(c);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function generateQR(evt) {
    const url = CHECKIN_URL(evt.id);
    const dataUrl = await QRCode.toDataURL(url, {
      width: 320, margin: 2,
      color: { dark: "#0a3d28", light: "#ffffff" },
    });
    setQr({ eventId: evt.id, titre: evt.titre, dataUrl, url });
  }

  function downloadQR() {
    if (!qr) return;
    const a = document.createElement("a");
    a.href = qr.dataUrl;
    a.download = `qr-checkin-${qr.titre.toLowerCase().replace(/\s+/g, "-").slice(0, 30)}.png`;
    a.click();
  }

  async function showPresences(evt) {
    if (panel?.eventId === evt.id) { setPanel(null); return; }
    setPanelLoading(true);
    setPanel({ eventId: evt.id, titre: evt.titre, list: [] });
    const { data } = await supabase
      .from("evenement_presences")
      .select("id, nom, email, checked_in_at, methode, membre_id")
      .eq("evenement_id", evt.id)
      .order("checked_in_at", { ascending: true });
    setPanel({ eventId: evt.id, titre: evt.titre, list: data || [] });
    setPanelLoading(false);
  }

  async function deletePresence(presenceId, eventId) {
    const { error } = await supabase.from("evenement_presences").delete().eq("id", presenceId);
    if (error) { toast.error("Erreur : " + error.message); return; }
    toast.success("Présence supprimée.");
    setPresenceCounts(c => ({ ...c, [eventId]: Math.max(0, (c[eventId] || 1) - 1) }));
    setPanel(p => p ? { ...p, list: p.list.filter(x => x.id !== presenceId) } : null);
  }

  async function handleManuelSave() {
    if (!manuelForm.nom.trim()) { toast.error("Nom obligatoire."); return; }
    setSavingManuel(true);
    let membre_id = null;
    if (manuelForm.email.trim()) {
      const { data: m } = await supabase.from("members").select("id").eq("email", manuelForm.email.trim()).maybeSingle();
      if (m) membre_id = m.id;
    }
    const { error } = await supabase.from("evenement_presences").insert({
      evenement_id: manuelForm.eventId,
      nom:          manuelForm.nom.trim(),
      email:        manuelForm.email.trim() || null,
      membre_id,
      methode:      "manuel",
    });
    setSavingManuel(false);
    if (error) { toast.error("Erreur : " + error.message); return; }
    toast.success("Présence ajoutée manuellement.");
    setPresenceCounts(c => ({ ...c, [manuelForm.eventId]: (c[manuelForm.eventId] || 0) + 1 }));
    if (panel?.eventId === manuelForm.eventId) {
      showPresences({ id: manuelForm.eventId, titre: panel.titre });
    }
    setManuelForm(null);
  }

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground leading-tight">Check-in QR Code</h2>
          <div className="mt-1 h-px w-12" style={{ background: "linear-gradient(to right, #e3c46a, transparent)" }} />
          <p className="text-xs text-muted-foreground mt-0.5">Générez un QR code par événement — les participants scannent pour s'enregistrer</p>
        </div>
        <button onClick={load} className="w-9 h-9 rounded-xl border border-border hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Overlay QR */}
      {qr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={e => { if (e.target === e.currentTarget) setQr(null); }}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <p className="font-semibold text-foreground text-sm">QR Code — Check-in</p>
              <button onClick={() => setQr(null)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
              <p className="text-sm font-semibold text-foreground text-center">{qr.titre}</p>
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <img src={qr.dataUrl} alt="QR Code" className="w-64 h-64" />
              </div>
              <p className="text-xs text-muted-foreground text-center break-all">{qr.url}</p>
              <div className="flex gap-2 w-full">
                <button onClick={downloadQR}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                  <Download className="w-4 h-4" /> Télécharger PNG
                </button>
                <button onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                  Imprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire ajout manuel */}
      {manuelForm && (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="font-semibold text-foreground text-sm">Ajout manuel de présence</p>
            <button onClick={() => setManuelForm(null)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 grid md:grid-cols-2 gap-4">
            <Field label="Nom complet *">
              <input className={inp} value={manuelForm.nom}
                onChange={e => setManuelForm(p => ({ ...p, nom: e.target.value }))} placeholder="Nom et prénom" />
            </Field>
            <Field label="Email (optionnel)">
              <input className={inp} type="email" value={manuelForm.email}
                onChange={e => setManuelForm(p => ({ ...p, email: e.target.value }))} placeholder="email@exemple.com" />
            </Field>
          </div>
          <div className="flex justify-end gap-2 px-5 pb-5">
            <button onClick={() => setManuelForm(null)} className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-muted">Annuler</button>
            <button onClick={handleManuelSave} disabled={savingManuel}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-50">
              {savingManuel && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Ajouter
            </button>
          </div>
        </div>
      )}

      {/* Liste événements */}
      {loading ? (
        <div className="flex items-center gap-3 py-10 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /> Chargement…</div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl text-muted-foreground">
          <QrCode className="w-10 h-10 mx-auto mb-3 opacity-25" />
          <p className="font-medium">Aucun événement trouvé.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(evt => {
            const nb = presenceCounts[evt.id] || 0;
            const isActive = evt.statut === "À venir" || evt.statut === "En cours";
            return (
              <div key={evt.id} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-start gap-4 p-4">
                  {/* Image miniature */}
                  {evt.image ? (
                    <img src={evt.image} alt={evt.titre} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" onError={e => e.currentTarget.style.display = "none"} />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-primary/50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-foreground text-sm leading-snug">{evt.titre}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                        evt.statut === "À venir"  ? "bg-emerald-500/15 text-emerald-400" :
                        evt.statut === "En cours" ? "bg-blue-500/15 text-blue-400" :
                        "bg-muted/60 text-muted-foreground"
                      }`}>{evt.statut}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      {evt.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{evt.date}{evt.heures ? ` · ${evt.heures}` : ""}</span>}
                      {evt.lieu && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{evt.lieu}</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 px-4 pb-3 pt-1 border-t border-border/60 flex-wrap">
                  {isActive && (
                    <button onClick={() => generateQR(evt)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      <QrCode className="w-3.5 h-3.5" /> QR Code
                    </button>
                  )}
                  <button onClick={() => showPresences(evt)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                      panel?.eventId === evt.id ? "bg-emerald-500/15 text-emerald-400" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}>
                    <Users className="w-3.5 h-3.5" />
                    {nb} présence{nb !== 1 ? "s" : ""}
                  </button>
                  <button onClick={() => { setManuelForm({ eventId: evt.id, nom: "", email: "" }); }}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-auto">
                    <Plus className="w-3.5 h-3.5" /> Ajout manuel
                  </button>
                </div>

                {/* Panneau présences */}
                {panel?.eventId === evt.id && (
                  <div className="border-t border-border bg-muted/10">
                    {panelLoading ? (
                      <div className="flex items-center gap-2 p-4 text-muted-foreground text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
                      </div>
                    ) : panel.list.length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground text-center">Aucune présence enregistrée.</p>
                    ) : (
                      <div className="divide-y divide-border/60">
                        {panel.list.map(p => (
                          <div key={p.id} className="px-4 py-2.5 flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-medium text-foreground">{p.nom}</p>
                                {p.membre_id && (
                                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">membre</span>
                                )}
                                {p.methode === "manuel" && (
                                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">manuel</span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {p.email || "—"} · {new Date(p.checked_in_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                            <button onClick={() => deletePresence(p.id, evt.id)}
                              className="w-6 h-6 rounded-lg hover:bg-red-500/15 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <div className="px-4 py-2 bg-muted/10 text-xs text-muted-foreground font-medium">
                          Total : {panel.list.length} présence{panel.list.length !== 1 ? "s" : ""} enregistrée{panel.list.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
