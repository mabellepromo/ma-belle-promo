import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import {
  User, Mail, Phone, MapPin, FileText, Lock, Edit2, Save, X,
  Download, Shield, Clock, CheckCircle, AlertCircle, Trash2,
  ShieldCheck, Linkedin, BookOpen, ChevronDown, ChevronRight,
  CreditCard, Vote, Calendar, UserPlus, UserMinus, CalendarCheck,
  Eye, Image, ExternalLink,
} from "lucide-react";
import { useDocuments } from "../hooks/useDocuments";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PageHero from "../components/PageHero";
import PaymentModal from "../components/PaymentModal";

const MONTANT_COTISATION = 30000; // FCFA — montant annuel attendu

const STATUT_CONFIG = {
  "payé":       { label: "Payé",       color: "bg-secondary text-primary", icon: CheckCircle, iconColor: "text-primary" },
  "partiel":    { label: "Partiel",    color: "bg-blue-100 text-blue-700",       icon: CreditCard,  iconColor: "text-blue-600"    },
  "en_attente": { label: "En attente", color: "bg-amber-100 text-amber-700",     icon: AlertCircle, iconColor: "text-amber-600"   },
  "exempté":    { label: "Exempté",    color: "bg-slate-100 text-slate-600",     icon: ShieldCheck, iconColor: "text-slate-500"   },
};

const tabs = [
  { id: "profil",       label: "Mon Profil",   icon: User      },
  { id: "cotisations",  label: "Cotisations",  icon: Clock     },
  { id: "evenements",   label: "Événements",   icon: Calendar  },
  { id: "elections",    label: "Élections",    icon: Vote      },
  { id: "documents",    label: "Documents",    icon: FileText  },
  { id: "donnees",      label: "Mes données",  icon: ShieldCheck },
];

export default function EspaceMembre() {
  const [user,            setUser]            = useState(null);
  const [member,          setMember]          = useState(null);
  const [cotisations,     setCotisations]     = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [editing,         setEditing]         = useState(false);
  const [profile,         setProfile]         = useState({
    phone: "", city: "", country: "Togo", profession: "",
  });
  const [saving,          setSaving]          = useState(false);
  const [tab,             setTab]             = useState("profil");
  const [deletionRequested, setDeletionRequested] = useState(false);
  const [paymentModal,    setPaymentModal]    = useState(false);
  const [expandedCot,     setExpandedCot]     = useState(null);
  const [evenements,      setEvenements]      = useState([]);
  const [myRegistrations, setMyRegistrations] = useState(new Set());
  const [openElections,   setOpenElections]   = useState([]);
  const [electionCandidats, setElectionCandidats] = useState({});
  const [myVotes,         setMyVotes]         = useState({});
  const [rsvpLoading,     setRsvpLoading]     = useState(null);
  const [voteLoading,     setVoteLoading]     = useState(null);
  const { documents: docsOfficials, loading: docsLoading } = useDocuments();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { setLoading(false); return; }

      const meta = u.user_metadata || {};

      const { data: m } = await supabase
        .from("members")
        .select("id, nom, telephone, ville, pays, profession, photo, bureau")
        .eq("email", u.email)
        .maybeSingle();

      setMember(m ?? null);
      setUser({ ...u, ...meta, full_name: meta.nom || meta.full_name || m?.nom || u.email });
      setProfile({
        phone:      meta.phone      || m?.telephone || "",
        city:       meta.city       || m?.ville     || "",
        country:    meta.country    || m?.pays      || "Togo",
        profession: meta.profession || m?.profession || "",
      });

      if (m?.id) {
        const { data: cots } = await supabase
          .from("cotisations")
          .select("*")
          .eq("member_id", String(m.id))
          .order("annee", { ascending: false });
        setCotisations(cots ?? []);
      }

      // Événements à venir / en cours
      const { data: evts } = await supabase
        .from("evenements")
        .select("id, titre, date, heures, lieu, type, statut, image")
        .neq("statut", "Passé")
        .order("created_at", { ascending: false });
      setEvenements(evts || []);

      if (m?.id) {
        const { data: regs } = await supabase
          .from("event_registrations")
          .select("event_id")
          .eq("member_id", m.id);
        setMyRegistrations(new Set((regs || []).map(r => r.event_id)));
      }

      // Élections ouvertes
      const { data: elections } = await supabase
        .from("elections")
        .select("*")
        .eq("statut", "ouverte")
        .order("created_at", { ascending: false });

      if (elections?.length) {
        const ids = elections.map(e => e.id);
        const [cRes, vRes] = await Promise.all([
          supabase.from("election_candidats").select("*, members(nom, photo)").in("election_id", ids),
          m?.id
            ? supabase.from("election_votes").select("election_id, candidat_id").in("election_id", ids).eq("voter_id", m.id)
            : Promise.resolve({ data: [] }),
        ]);
        const candsMap = {};
        (cRes.data || []).forEach(c => {
          if (!candsMap[c.election_id]) candsMap[c.election_id] = [];
          candsMap[c.election_id].push(c);
        });
        const votesMap = {};
        (vRes.data || []).forEach(v => { votesMap[v.election_id] = v.candidat_id; });
        setOpenElections(elections);
        setElectionCandidats(candsMap);
        setMyVotes(votesMap);
      }

      setLoading(false);
    }
    load();
  }, []);

  const currentYear     = new Date().getFullYear();
  const cotEnCours      = cotisations.find(c => c.annee === currentYear);
  const statutEnCours   = cotEnCours?.statut ?? "en_attente";
  const totalVerse      = cotisations.reduce((s, c) => s + (c.montant || 0), 0);
  const anneesPayes     = cotisations.filter(c => c.statut === "payé").length;
  const statutCfg       = STATUT_CONFIG[statutEnCours] ?? STATUT_CONFIG["en_attente"];

  async function handleSave() {
    setSaving(true);
    // 1. Mettre à jour les métadonnées Auth
    await supabase.auth.updateUser({ data: profile });
    // 2. Répercuter dans la table members (annuaire, dashboard, tout est synchronisé)
    if (member?.id) {
      await supabase.from("members").update({
        telephone:  profile.phone,
        ville:      profile.city,
        pays:       profile.country,
        profession: profile.profession,
      }).eq("id", member.id);
      setMember(p => ({ ...p, ...profile, telephone: profile.phone, ville: profile.city, pays: profile.country }));
    }
    setUser(u => ({ ...u, ...profile }));
    setEditing(false);
    setSaving(false);
    toast.success("Profil mis à jour — les changements sont visibles partout sur le site.");
  }

  async function toggleRegistration(eventId) {
    if (!member?.id) { toast.error("Vous devez être un membre enregistré pour vous inscrire."); return; }
    setRsvpLoading(eventId);
    if (myRegistrations.has(eventId)) {
      await supabase.from("event_registrations").delete().eq("event_id", eventId).eq("member_id", member.id);
      setMyRegistrations(prev => { const s = new Set(prev); s.delete(eventId); return s; });
      toast.success("Inscription annulée.");
    } else {
      const { error } = await supabase.from("event_registrations").insert({ event_id: eventId, member_id: member.id });
      if (error) toast.error("Erreur : " + error.message);
      else { setMyRegistrations(prev => new Set([...prev, eventId])); toast.success("Inscription confirmée !"); }
    }
    setRsvpLoading(null);
  }

  async function castVote(electionId, candidatId) {
    if (!member?.id) { toast.error("Vous devez être un membre enregistré pour voter."); return; }
    if (myVotes[electionId]) { toast.error("Vous avez déjà voté pour cette élection."); return; }
    setVoteLoading(electionId);
    const { error } = await supabase.from("election_votes").insert({ election_id: electionId, voter_id: member.id, candidat_id: candidatId });
    if (error) toast.error("Erreur : " + error.message);
    else { setMyVotes(prev => ({ ...prev, [electionId]: candidatId })); toast.success("Vote enregistré ! Merci pour votre participation."); }
    setVoteLoading(null);
  }

  const handleExport = async () => {
    const payload = {
      export_date: new Date().toISOString(),
      profil: { nom: user.full_name, email: user.email, ...profile },
      membre: member,
      cotisations,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mes-donnees-mbp-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export téléchargé !");
  };

  const handleDeleteRequest = async () => {
    await supabase.auth.updateUser({ data: { deletion_requested: true, deletion_requested_at: new Date().toISOString() } });
    fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "admin_alert", alertType: "deletion_request",
        nom: user.full_name || user.email, email: user.email,
        detail: `L'utilisateur a demandé la suppression de son compte le ${new Date().toLocaleString("fr-FR")}.`,
      }),
    }).catch(console.error);
    await supabase.auth.signOut();
    setDeletionRequested(true);
    toast.success("Demande envoyée. Vous avez été déconnecté(e).");
    setTimeout(() => navigate("/"), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="font-heading text-3xl font-bold text-foreground mb-3">Accès réservé aux membres</h2>
          <p className="text-muted-foreground mb-6">Connectez-vous pour accéder à votre espace membre.</p>
          <Button onClick={() => navigate("/login")} className="rounded-full gap-2">
            <Shield className="w-4 h-4" /> Se connecter
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <PageHero title="Espace Adhérent" subtitle="Ma Belle Promo — Accès privé" />

      <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6">

        {/* ── Carte identité ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-4 sm:p-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md">
              {member?.photo ? (
                <img
                  src={member.photo}
                  alt={user.full_name}
                  className="w-full h-full object-cover object-top"
                  onError={e => { e.target.onerror = null; e.target.style.display = "none"; const initial = (user.full_name?.charAt(0) || "M").replace(/[<>&"']/g, ""); e.target.parentElement.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center"><span class="text-primary-foreground font-bold text-3xl">${initial}</span></div>`; }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <span className="text-primary-foreground font-heading font-bold text-3xl">
                    {user.full_name?.charAt(0) || "M"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Infos */}
          <div className="text-center sm:text-left flex-1">
            <h2 className="font-heading text-2xl font-bold text-foreground">{user.full_name}</h2>
            <p className="text-muted-foreground text-sm mt-0.5">{user.email}</p>
            {profile.profession && <p className="text-sm text-foreground/70 mt-0.5">{profile.profession}</p>}
            <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
              <span className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">Adhérent MBP</span>
              {member?.bureau && <span className="px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">Bureau exécutif</span>}
              {user.role === "admin" && <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">Administrateur</span>}
            </div>
          </div>

          {/* Statut cotisation en cours */}
          <div className="text-center sm:text-right flex-shrink-0">
            <div className="text-xs text-muted-foreground mb-1.5">Cotisation {currentYear}</div>
            <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${statutCfg.color}`}>
              {statutCfg.label}
            </span>
            {(statutEnCours === "partiel") && cotEnCours && (
              <p className="text-xs text-muted-foreground mt-1">
                {(cotEnCours.montant || 0).toLocaleString("fr-FR")} / {MONTANT_COTISATION.toLocaleString("fr-FR")} FCFA
              </p>
            )}
          </div>
        </motion.div>

        {/* ── Accès rapide membres ── */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Link to="/annuaire"
            className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary/30 hover:shadow-sm transition-all">
            <User className="w-4 h-4 text-primary" />
            Annuaire des membres
          </Link>
          <Link to="/galeries"
            className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary/30 hover:shadow-sm transition-all">
            <Image className="w-4 h-4 text-primary" />
            Galeries photos
          </Link>
        </div>

        {/* ── Tabs ── */}
        <div className="w-full overflow-x-auto mb-8">
          <div className="flex gap-1 bg-muted rounded-xl p-1 w-max min-w-full">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                title={t.label}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-1 justify-center sm:flex-none sm:justify-start ${
                  tab === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}>
                <t.icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── PROFIL ── */}
        {tab === "profil" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-4 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
              <div>
                <h3 className="font-heading text-xl font-bold text-foreground">Mes informations</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Les modifications sont répercutées sur l'annuaire et dans tout le site.
                </p>
              </div>
              {!editing ? (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-2 rounded-full">
                  <Edit2 className="w-3.5 h-3.5" /> Modifier
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="gap-2 rounded-full">
                    <X className="w-3.5 h-3.5" /> Annuler
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2 rounded-full">
                    <Save className="w-3.5 h-3.5" /> {saving ? "Sauvegarde…" : "Enregistrer"}
                  </Button>
                </div>
              )}
            </div>

            {/* Section Identité — lecture seule */}
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Identité</p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { icon: User, label: "Nom complet",   value: user.full_name, note: "Contactez le bureau pour modifier votre nom." },
                  { icon: Mail, label: "Adresse email", value: user.email,     note: "L'email est géré par l'administrateur." },
                ].map(({ icon: Icon, label, value, note }) => (
                  <div key={label} className="flex items-start gap-3 p-4 bg-muted/40 rounded-xl">
                    <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                      <div className="text-sm font-medium text-foreground">{value}</div>
                      <div className="text-[10px] text-muted-foreground/60 mt-0.5 italic">{note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section Contact */}
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Coordonnées</p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { key: "phone",   label: "Téléphone",  icon: Phone,  placeholder: "+228 00 00 00 00" },
                  { key: "city",    label: "Ville",      icon: MapPin, placeholder: "Ex : Lomé" },
                  { key: "country", label: "Pays",       icon: MapPin, placeholder: "Ex : Togo" },
                ].map(({ key, label, icon: Icon, placeholder }) => (
                  <div key={key}>
                    {editing ? (
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
                        <Input placeholder={placeholder} value={profile[key]}
                          onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))} />
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 p-4 bg-muted/40 rounded-xl">
                        <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                          <div className="text-sm font-medium text-foreground">
                            {profile[key] || <span className="text-muted-foreground italic">Non renseigné</span>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section Professionnel */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Professionnel</p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { key: "profession",     label: "Profession / Fonction", icon: User,     placeholder: "Ex : Avocat, Magistrat…" },
                  { key: "anneeObtention", label: "Année d'obtention du diplôme", icon: BookOpen, placeholder: "Ex : 1999" },
                  { key: "linkedin",       label: "Profil LinkedIn", icon: Linkedin,  placeholder: "https://linkedin.com/in/…" },
                ].map(({ key, label, icon: Icon, placeholder }) => (
                  <div key={key} className={key === "linkedin" ? "md:col-span-2" : ""}>
                    {editing ? (
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
                        <Input placeholder={placeholder} value={profile[key]}
                          onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))} />
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 p-4 bg-muted/40 rounded-xl">
                        <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                          {key === "linkedin" && profile.linkedin ? (
                            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"
                              className="text-sm font-medium text-primary hover:underline truncate block">
                              {profile.linkedin}
                            </a>
                          ) : (
                            <div className="text-sm font-medium text-foreground">
                              {profile[key] || <span className="text-muted-foreground italic">Non renseigné</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {editing && (
              <p className="text-xs text-muted-foreground mt-5 bg-primary/5 rounded-xl p-3">
                Après enregistrement, vos informations seront mises à jour dans l'annuaire des membres et dans tout le site.
              </p>
            )}
          </motion.div>
        )}

        {/* ── COTISATIONS ── */}
        {tab === "cotisations" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-xl p-5 text-center">
                <div className="text-2xl font-bold text-primary font-heading">{anneesPayes}</div>
                <div className="text-xs text-muted-foreground mt-1">Années payées au complet</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-5 text-center">
                <div className="text-2xl font-bold text-foreground font-heading">{totalVerse.toLocaleString("fr-FR")}</div>
                <div className="text-xs text-muted-foreground mt-1">FCFA versés au total</div>
              </div>
              <div className={`rounded-xl p-5 text-center border ${statutCfg.color.replace("text-", "border-").split(" ")[0]} bg-card`}>
                <div className={`text-2xl font-bold font-heading ${statutCfg.color.split(" ")[1]}`}>
                  {statutCfg.label}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Statut cotisation {currentYear}</div>
              </div>
            </div>

            {/* Historique */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-border flex flex-wrap items-center justify-between gap-1">
                <h3 className="font-heading text-lg font-bold text-foreground">Historique des cotisations</h3>
                <span className="text-xs text-muted-foreground">Montant annuel : {MONTANT_COTISATION.toLocaleString("fr-FR")} FCFA</span>
              </div>

              {cotisations.length === 0 ? (
                <div className="px-6 py-10 text-center text-muted-foreground text-sm">
                  Aucune cotisation enregistrée pour le moment.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {cotisations.map((c, i) => {
                    const cfg      = STATUT_CONFIG[c.statut] ?? STATUT_CONFIG["en_attente"];
                    const CFGIcon  = cfg.icon;
                    const verse    = c.montant || 0;
                    const reste    = c.statut === "exempté" ? 0 : Math.max(0, MONTANT_COTISATION - verse);
                    const versements = c.versements ?? [];
                    const isOpen   = expandedCot === c.id;

                    return (
                      <div key={c.id || i}>
                        <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                            <CFGIcon className={`w-4 h-4 ${cfg.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-foreground">Cotisation {c.annee}</span>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                                {cfg.label}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {c.statut === "exempté" ? "Exempté(e) de cotisation" : (
                                <>
                                  Versé : <strong>{verse.toLocaleString("fr-FR")} FCFA</strong>
                                  {reste > 0 && (
                                    <> · Reste : <span className="font-semibold text-amber-600">{reste.toLocaleString("fr-FR")} FCFA</span></>
                                  )}
                                  {reste === 0 && verse > 0 && (
                                    <> · <span className="font-semibold text-primary">Complet ✓</span></>
                                  )}
                                </>
                              )}
                              {versements.length > 0 && (
                                <> · {versements.length} versement{versements.length > 1 ? "s" : ""}</>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {(c.statut === "en_attente" || c.statut === "partiel") && (
                              <button onClick={() => setPaymentModal(true)}
                                className="text-xs font-semibold text-primary hover:underline">
                                Contacter →
                              </button>
                            )}
                            {versements.length > 0 && (
                              <button onClick={() => setExpandedCot(isOpen ? null : c.id)}
                                className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                                {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Détail des versements */}
                        {isOpen && versements.length > 0 && (
                          <div className="px-6 pb-4 bg-muted/20">
                            <div className="border border-border rounded-xl overflow-hidden">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-muted/40 border-b border-border">
                                    <th className="text-left px-4 py-2 font-semibold text-muted-foreground">Date</th>
                                    <th className="text-left px-4 py-2 font-semibold text-muted-foreground">Montant</th>
                                    <th className="text-left px-4 py-2 font-semibold text-muted-foreground">Mode</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card">
                                  {versements.map((v, vi) => (
                                    <tr key={vi}>
                                      <td className="px-4 py-2 text-muted-foreground">{v.date}</td>
                                      <td className="px-4 py-2 font-semibold text-foreground">{Number(v.montant).toLocaleString("fr-FR")} FCFA</td>
                                      <td className="px-4 py-2 text-muted-foreground capitalize">{v.mode}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-primary/5 border border-primary/15 rounded-xl">
              <p className="text-xs text-muted-foreground text-center sm:text-left">
                Pour toute question ou signaler un paiement non enregistré, contactez le trésorier à{" "}
                <a href="mailto:contact@mabellepromo.org" className="text-primary hover:underline">contact@mabellepromo.org</a>
              </p>
              <Link to="/implications/cotisation"
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity whitespace-nowrap">
                <ExternalLink className="w-3.5 h-3.5" /> Régler ma cotisation
              </Link>
            </div>
          </motion.div>
        )}

        {/* ── ÉVÉNEMENTS ── */}
        {tab === "evenements" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-foreground">Événements à venir</h3>
              <Link to="/activites/evenements"
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                Voir tous les événements <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            {evenements.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium">Aucun événement à venir</p>
                <p className="text-sm mt-1">Revenez bientôt pour les prochains événements MBP.</p>
              </div>
            ) : evenements.map(e => {
              const isReg = myRegistrations.has(e.id);
              const busy = rsvpLoading === e.id;
              return (
                <div key={e.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {e.image && (
                    <div className="h-36 overflow-hidden">
                      <img src={e.image} alt={e.titre} className="w-full h-full object-cover object-top" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <h3 className="font-heading font-bold text-foreground">{e.titre}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        e.statut === "À venir" ? "bg-secondary text-primary" : "bg-blue-100 text-blue-700"
                      }`}>{e.statut}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {e.date}{e.heures ? ` · ${e.heures}` : ""}{e.lieu ? ` · ${e.lieu}` : ""}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      {isReg ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-muted border border px-3 py-1.5 rounded-full">
                          <CalendarCheck className="w-3.5 h-3.5" /> Inscrit(e)
                        </span>
                      ) : <span />}
                      <button onClick={() => toggleRegistration(e.id)} disabled={busy}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 ${
                          isReg
                            ? "border border-border text-muted-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}>
                        {busy
                          ? <div className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
                          : isReg
                            ? <><UserMinus className="w-4 h-4" /> Se désinscrire</>
                            : <><UserPlus className="w-4 h-4" /> Je participe</>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ── ÉLECTIONS ── */}
        {tab === "elections" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {openElections.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Vote className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium">Aucune élection en cours</p>
                <p className="text-sm mt-1">Les élections ouvertes apparaîtront ici.</p>
              </div>
            ) : openElections.map(el => {
              const cands = electionCandidats[el.id] || [];
              const myVote = myVotes[el.id];
              const busy = voteLoading === el.id;
              return (
                <div key={el.id} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-border bg-muted/10 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-heading font-bold text-foreground">{el.titre}</h3>
                      {el.description && <p className="text-xs text-muted-foreground mt-0.5">{el.description}</p>}
                      {el.date_fin && <p className="text-xs text-muted-foreground mt-0.5">Clôture : {new Date(el.date_fin).toLocaleDateString("fr-FR")}</p>}
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-primary flex-shrink-0">Ouverte</span>
                  </div>

                  {myVote && (
                    <div className="mx-5 mt-4 flex items-center gap-2 bg-muted border border rounded-xl px-4 py-2.5 text-sm text-primary">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" /> Vote enregistré — merci pour votre participation.
                    </div>
                  )}
                  {!member?.id && (
                    <div className="mx-5 mt-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> Votre profil n'est pas encore associé à un compte membre.
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    {cands.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">Aucun candidat déclaré.</p>
                    ) : cands.map(c => {
                      const isMyVote = myVote === c.id;
                      return (
                        <div key={c.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                          isMyVote ? "border-primary bg-primary/5" : "border-border bg-muted/10"
                        }`}>
                          {c.members?.photo ? (
                            <img src={c.members.photo} alt={c.members.full_name || "Photo du membre"} className="w-10 h-10 rounded-full object-cover object-top flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-primary">{(c.members?.nom || "?")[0]}</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground">{c.members?.nom || "—"}</p>
                            <p className="text-xs text-muted-foreground">{c.poste}</p>
                            {c.bio && <p className="text-xs text-muted-foreground italic mt-0.5">{c.bio}</p>}
                          </div>
                          {isMyVote ? (
                            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          ) : !myVote && member?.id ? (
                            <button onClick={() => castVote(el.id, c.id)} disabled={busy}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 flex-shrink-0">
                              {busy
                                ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                : <Vote className="w-3.5 h-3.5" />}
                              Voter
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ── DOCUMENTS ── */}
        {tab === "documents" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {docsLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : docsOfficials.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium">Aucun document disponible pour le moment.</p>
              </div>
            ) : docsOfficials.map((doc, i) => {
              const accessible = !!doc.url && (doc.acces === "public" || doc.acces === "members");
              return (
                <div key={doc.id || i} className="flex items-center justify-between gap-4 p-5 bg-card border border-border rounded-xl hover:border-primary/20 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{doc.titre}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {[doc.type, doc.taille, doc.date].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {accessible ? (
                      <>
                        <a href={doc.url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors">
                          <Eye className="w-3.5 h-3.5" /> Voir
                        </a>
                        <a href={doc.url} download target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors">
                          <Download className="w-3.5 h-3.5" /> Télécharger
                        </a>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground px-3 py-1.5 bg-muted rounded-lg">
                        {!doc.url ? "Bientôt disponible" : "Accès bureau"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ── MES DONNÉES ── */}
        {tab === "donnees" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-foreground mb-1">Télécharger mes données</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Exportez toutes vos données (profil, cotisations, versements) au format JSON — droit à la portabilité Art. 20 RGPD.
                  </p>
                  <button onClick={handleExport}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    <Download className="w-4 h-4" /> Exporter mes données
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-foreground mb-2">Vos droits RGPD</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong className="text-foreground">Accès & rectification</strong> — onglet "Mon Profil"</li>
                    <li>• <strong className="text-foreground">Portabilité</strong> — export ci-dessus</li>
                    <li>• <strong className="text-foreground">Suppression</strong> — ci-dessous</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-3">
                    Autre demande RGPD : <Link to="/informations/contacts" className="text-primary hover:underline">formulaire de contact</Link>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-red-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-foreground mb-1">Supprimer mon compte</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Demande de suppression de votre compte et de vos données (Art. 17 RGPD). Traitement sous 30 jours. Vous serez déconnecté(e) immédiatement.
                  </p>
                  {!deletionRequested ? (
                    <button onClick={() => {
                      if (window.confirm("Êtes-vous sûr(e) ? Cette action est irréversible.")) handleDeleteRequest();
                    }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
                      <Trash2 className="w-4 h-4" /> Demander la suppression
                    </button>
                  ) : (
                    <p className="text-sm font-medium text-primary">✓ Demande envoyée. Redirection…</p>
                  )}
                </div>
              </div>
            </div>

          </motion.div>
        )}

      </section>

      <PaymentModal open={paymentModal} onClose={() => setPaymentModal(false)} type="cotisation" user={user} />
    </div>
  );
}
