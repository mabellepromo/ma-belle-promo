import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  UserPlus, Loader2, Check, X, Trash2, Mail, Phone,
  ExternalLink, ChevronDown, ChevronUp, UserCheck, Target, Printer,
} from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";
import { genererFicheCandidature } from "@/lib/documentGenerators";
import {
  PROFILE_TYPES, COUNTRIES, EXPERTISE_DOMAINS, LANGUAGES,
  PROJECT_INTERESTS, MISSION_TYPES, ENGAGEMENT_LEVELS, MODALITIES,
  EMPLOYMENT_SECTORS, UNIVERSITIES, STUDY_YEARS, TIMEZONES,
  REFERRAL_SOURCES, NEWSLETTER_FREQUENCIES, APPLICATION_STATUSES,
  labelOf, labelsOf,
} from "@/lib/benevolatConstants";

const statutCfg = (v) => APPLICATION_STATUSES.find((s) => s.value === v) || APPLICATION_STATUSES[0];

// Détail d'un consentement (pastille oui/non).
function ConsentBadge({ ok, children }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${
      ok ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground"
    }`}>
      {ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} {children}
    </span>
  );
}

function Line({ label, value }) {
  if (!value || value === "—") return null;
  return (
    <div className="flex gap-2 text-xs">
      <span className="text-muted-foreground min-w-[140px] flex-shrink-0">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

export default function CandidaturesSection({ embedded = false }) {
  const [items, setItems]       = useState([]);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("nouvelle");
  const [openId, setOpenId]     = useState(null);
  const [notes, setNotes]       = useState({});      // brouillons de notes par id
  const [busy, setBusy]         = useState(null);    // id en cours d'action
  const { confirm, ConfirmEl } = useConfirm();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [cRes, mRes] = await Promise.all([
      supabase.from("candidatures_benevoles").select("*").order("created_at", { ascending: false }),
      supabase.from("missions_benevoles").select("id, titre").order("titre"),
    ]);
    if (cRes.error) toast.error("Erreur chargement : " + cRes.error.message);
    else setItems(cRes.data || []);
    setMissions(mRes.data || []);
    setLoading(false);
  }

  // Matérialise les missions souhaitées par le candidat en affectations (statut « Pressenti »).
  async function createInterestAssignments(c) {
    const ids = Array.isArray(c.mission_interets) ? c.mission_interets : [];
    if (ids.length === 0) return;
    setBusy(c.id);
    const { data: { user } } = await supabase.auth.getUser();
    const rows = ids.map((mid) => ({
      mission_id: mid,
      volunteer_source: "CANDIDATE",
      candidature_id: c.id,
      assigned_role: "Bénévole",
      assignment_status: "CANDIDATE",
      assigned_date: new Date().toISOString().slice(0, 10),
      created_by: user?.id || null,
    }));
    const { error } = await supabase
      .from("affectations_benevoles")
      .upsert(rows, { onConflict: "mission_id,candidature_id", ignoreDuplicates: true });
    if (error) toast.error("Erreur : " + error.message);
    else toast.success("Affectations créées — voir l'onglet « Affectations » pour préciser le rôle.");
    setBusy(null);
  }

  async function setStatut(item, statut) {
    setBusy(item.id);
    const { error } = await supabase
      .from("candidatures_benevoles")
      .update({ statut })
      .eq("id", item.id);
    if (error) toast.error("Erreur : " + error.message);
    else { toast.success("Statut mis à jour : " + statutCfg(statut).label); load(); }
    setBusy(null);
  }

  async function saveNotes(item) {
    setBusy(item.id);
    const { error } = await supabase
      .from("candidatures_benevoles")
      .update({ notes_internes: notes[item.id] ?? item.notes_internes ?? "" })
      .eq("id", item.id);
    if (error) toast.error("Erreur : " + error.message);
    else toast.success("Notes enregistrées.");
    setBusy(null);
  }

  // Convertit la candidature en fiche bénévole active (table `benevoles`).
  async function convertToBenevole(item) {
    if (item.benevole_id) { toast.info("Déjà converti en bénévole."); return; }
    if (!await confirm("Convertir en bénévole actif ?", "Une fiche sera créée dans l'onglet « Bénévoles » et la candidature passera en « Acceptée ».")) return;
    setBusy(item.id);
    const competences = [
      labelsOf(EXPERTISE_DOMAINS, item.expertise_domains),
      item.skills_description,
    ].filter(Boolean).join(" — ");
    const { data: ben, error: insErr } = await supabase
      .from("benevoles")
      .insert({
        nom: item.full_name,
        email: item.email,
        telephone: item.phone,
        competences,
        disponibilite: labelOf(ENGAGEMENT_LEVELS, item.engagement_level),
        statut: "actif",
        date_engagement: item.start_date,
        notes: `Issu d'une candidature en ligne (${labelOf(PROJECT_INTERESTS, item.project_interest)}).`,
        charter_version: item.charter_version || null,
        charter_accepted_at: item.charter_accepted_at || null,
      })
      .select("id")
      .single();
    if (insErr) { toast.error("Erreur création bénévole : " + insErr.message); setBusy(null); return; }

    const { error: updErr } = await supabase
      .from("candidatures_benevoles")
      .update({ statut: "acceptee", benevole_id: ben.id })
      .eq("id", item.id);
    if (updErr) toast.error("Bénévole créé, mais mise à jour de la candidature échouée : " + updErr.message);
    else toast.success("Bénévole créé et candidature acceptée.");
    setBusy(null);
    load();
  }

  async function remove(item) {
    if (!await confirm("Supprimer cette candidature ?", "Cette action est irréversible.")) return;
    const { error } = await supabase.from("candidatures_benevoles").delete().eq("id", item.id);
    if (error) toast.error("Erreur : " + error.message);
    else { toast.success("Candidature supprimée."); load(); }
  }

  const counts = APPLICATION_STATUSES.reduce((acc, s) => {
    acc[s.value] = items.filter((i) => i.statut === s.value).length;
    return acc;
  }, {});
  const filtered = filter === "all" ? items : items.filter((i) => i.statut === filter);

  return (
    <div className="space-y-6">
      {ConfirmEl}

      {!embedded && (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-foreground text-lg">Candidatures bénévoles</h2>
            <p className="text-xs text-muted-foreground">Candidatures reçues via le formulaire public — à examiner sous 7 jours ouvrés</p>
          </div>
        </div>
      )}

      {/* Filtres par statut */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {[{ value: "all", label: "Toutes" }, ...APPLICATION_STATUSES].map((s) => (
          <button key={s.value} onClick={() => setFilter(s.value)}
            className={`px-3 h-7 rounded-full text-xs font-semibold transition-colors ${
              filter === s.value ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}>
            {s.label}{s.value !== "all" && counts[s.value] ? ` (${counts[s.value]})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm italic">
          Aucune candidature dans cette catégorie.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const cfg = statutCfg(c.statut);
            const open = openId === c.id;
            const noteVal = notes[c.id] ?? c.notes_internes ?? "";
            return (
              <div key={c.id} className="bg-background border border-border rounded-2xl overflow-hidden">
                {/* En-tête cliquable */}
                <button onClick={() => setOpenId(open ? null : c.id)}
                  className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-muted/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {c.avatar_url
                      ? <img src={c.avatar_url} alt={c.full_name} className="w-full h-full object-cover" />
                      : <UserPlus className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{c.full_name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {labelOf(PROFILE_TYPES, c.profile_type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap text-xs text-muted-foreground">
                      <span>{c.email}</span>
                      <span>{labelOf(COUNTRIES, c.country_code)}</span>
                      <span>{labelOf(PROJECT_INTERESTS, c.project_interest)}</span>
                      <span>{new Date(c.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                  {open ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </button>

                {/* Détail */}
                {open && (
                  <div className="px-5 pb-5 pt-1 space-y-4 border-t border-border">
                    {/* Coordonnées rapides */}
                    <div className="flex flex-wrap gap-3 pt-3">
                      <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"><Mail className="w-3.5 h-3.5" /> {c.email}</a>
                      <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"><Phone className="w-3.5 h-3.5" /> {c.phone}</a>
                      {c.professional_link && <a href={c.professional_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"><ExternalLink className="w-3.5 h-3.5" /> Lien pro</a>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-x-6 gap-y-1">
                      <Line label="Titre / Poste" value={c.current_title} />
                      <Line label="Université" value={c.university && `${labelOf(UNIVERSITIES, c.university)}${c.study_year ? " · " + labelOf(STUDY_YEARS, c.study_year) : ""}`} />
                      <Line label="Spécialité" value={c.study_field} />
                      <Line label="Secteur d'emploi" value={c.employment_sector && labelOf(EMPLOYMENT_SECTORS, c.employment_sector)} />
                      <Line label="Expérience" value={c.years_experience != null ? `${c.years_experience} an(s)` : ""} />
                      <Line label="Langues" value={labelsOf(LANGUAGES, c.languages)} />
                      <Line label="Expertise" value={labelsOf(EXPERTISE_DOMAINS, c.expertise_domains)} />
                      <Line label="Domaines d'action" value={labelsOf(MISSION_TYPES, c.mission_types)} />
                      <Line label="Engagement" value={labelOf(ENGAGEMENT_LEVELS, c.engagement_level)} />
                      <Line label="Date de début" value={c.start_date && new Date(c.start_date + "T00:00:00").toLocaleDateString("fr-FR")} />
                      <Line label="Modalité" value={labelOf(MODALITIES, c.modality)} />
                      <Line label="Fuseau horaire" value={c.timezone && labelOf(TIMEZONES, c.timezone)} />
                      <Line label="Origine" value={labelOf(REFERRAL_SOURCES, c.referral_source)} />
                      <Line label="Recommandé par" value={c.referred_by} />
                      <Line label="Dispo événements" value={c.available_for_events ? "Oui" : null} />
                      <Line label="Newsletter" value={c.consent_newsletter ? labelOf(NEWSLETTER_FREQUENCIES, c.newsletter_frequency) : null} />
                      <Line label="Charte acceptée" value={c.charter_accepted_at ? `${c.charter_version || ""} le ${new Date(c.charter_accepted_at).toLocaleDateString("fr-FR")}` : null} />
                    </div>

                    {c.skills_description && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Compétences : </span>
                        <span className="text-foreground">{c.skills_description}</span>
                      </div>
                    )}
                    {c.motivation && (
                      <div className="text-xs bg-muted/30 rounded-xl p-3">
                        <span className="text-muted-foreground block mb-1">Motivation</span>
                        <span className="text-foreground italic">« {c.motivation} »</span>
                      </div>
                    )}

                    {/* Missions souhaitées par le candidat → affectations */}
                    {Array.isArray(c.mission_interets) && c.mission_interets.length > 0 && (
                      <div className="text-xs bg-primary/5 border border-primary/15 rounded-xl p-3 flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <span className="text-muted-foreground block mb-1">Missions souhaitées</span>
                          <span className="text-foreground">
                            {c.mission_interets.map((id) => missions.find((m) => m.id === id)?.titre || "Mission supprimée").join(", ")}
                          </span>
                        </div>
                        <button onClick={() => createInterestAssignments(c)} disabled={busy === c.id}
                          className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-primary/15 text-primary text-xs font-semibold hover:bg-primary/25 transition-colors disabled:opacity-50 flex-shrink-0">
                          <Target className="w-3.5 h-3.5" /> Créer les affectations
                        </button>
                      </div>
                    )}

                    {/* Consentements */}
                    <div className="flex flex-wrap gap-1.5">
                      <ConsentBadge ok={c.consent_contact}>Contact</ConsentBadge>
                      <ConsentBadge ok={c.consent_charter}>Charte</ConsentBadge>
                      <ConsentBadge ok={c.consent_data}>RGPD</ConsentBadge>
                      <ConsentBadge ok={c.consent_visibility}>Visibilité</ConsentBadge>
                      <ConsentBadge ok={c.consent_newsletter}>Newsletter</ConsentBadge>
                      <ConsentBadge ok={c.consent_photo}>Photo</ConsentBadge>
                      <ConsentBadge ok={c.consent_background_check}>Vérif. antécédents</ConsentBadge>
                    </div>

                    {/* Notes internes */}
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">Notes internes (bureau)</label>
                      <textarea
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 resize-none"
                        rows={2} value={noteVal}
                        onChange={(e) => setNotes((n) => ({ ...n, [c.id]: e.target.value }))}
                        placeholder="Observations, suite donnée…" />
                      <button onClick={() => saveNotes(c)} disabled={busy === c.id}
                        className="mt-1.5 text-xs font-semibold text-primary hover:underline disabled:opacity-50">
                        Enregistrer les notes
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
                      <select value={c.statut} onChange={(e) => setStatut(c, e.target.value)} disabled={busy === c.id}
                        className="h-8 px-2.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:border-primary/50">
                        {APPLICATION_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>

                      <button onClick={() => convertToBenevole(c)} disabled={busy === c.id || !!c.benevole_id}
                        className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 transition-colors disabled:opacity-50">
                        <UserCheck className="w-3.5 h-3.5" /> {c.benevole_id ? "Converti" : "Convertir en bénévole"}
                      </button>

                      <button onClick={() => genererFicheCandidature(c)}
                        className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-muted/50 text-foreground text-xs font-semibold hover:bg-muted transition-colors">
                        <Printer className="w-3.5 h-3.5" /> Imprimer / PDF
                      </button>

                      <button onClick={() => remove(c)}
                        className="ml-auto inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Supprimer
                      </button>
                    </div>
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
