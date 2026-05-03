import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import {
  User, Mail, Phone, MapPin, FileText, Lock, Edit2, Save, X,
  Download, Shield, Clock, CheckCircle, AlertCircle, Trash2,
  ShieldCheck, Camera, Linkedin, BookOpen, ChevronDown, ChevronRight,
  CreditCard,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PageHero from "../components/PageHero";
import PaymentModal from "../components/PaymentModal";
import { compressImage } from "../lib/imageUtils";

const MONTANT_COTISATION = 30000; // FCFA — montant annuel attendu

const STATUT_CONFIG = {
  "payé":       { label: "Payé",       color: "bg-emerald-100 text-emerald-700", icon: CheckCircle, iconColor: "text-emerald-600" },
  "partiel":    { label: "Partiel",    color: "bg-blue-100 text-blue-700",       icon: CreditCard,  iconColor: "text-blue-600"    },
  "en_attente": { label: "En attente", color: "bg-amber-100 text-amber-700",     icon: AlertCircle, iconColor: "text-amber-600"   },
  "exempté":    { label: "Exempté",    color: "bg-slate-100 text-slate-600",     icon: ShieldCheck, iconColor: "text-slate-500"   },
};

const documentsExclusifs = [
  { titre: "Statuts de l'association (2018)", type: "PDF", taille: "245 Ko", date: "Janv. 2018" },
  { titre: "Règlement intérieur MBP", type: "PDF", taille: "180 Ko", date: "Mars 2018" },
  { titre: "Rapport d'activités 2022-2023", type: "PDF", taille: "1.2 Mo", date: "Déc. 2023" },
  { titre: "Plan d'action 2023-2025", type: "PDF", taille: "890 Ko", date: "Janv. 2023" },
  { titre: "Compte-rendu AG 2023", type: "PDF", taille: "320 Ko", date: "Nov. 2023" },
  { titre: "Annuaire des membres", type: "PDF", taille: "—", date: "2024", restreint: true },
];

const tabs = [
  { id: "profil",       label: "Mon Profil",   icon: User      },
  { id: "cotisations",  label: "Cotisations",  icon: Clock     },
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
    phone: "", city: "", country: "Togo", profession: "", linkedin: "", anneeObtention: "",
  });
  const [saving,          setSaving]          = useState(false);
  const [tab,             setTab]             = useState("profil");
  const [deletionRequested, setDeletionRequested] = useState(false);
  const [uploadingPhoto,  setUploadingPhoto]  = useState(false);
  const [paymentModal,    setPaymentModal]    = useState(false);
  const [expandedCot,     setExpandedCot]     = useState(null);
  const photoInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { setLoading(false); return; }

      const meta = u.user_metadata || {};

      const { data: m } = await supabase
        .from("members")
        .select("id, nom, telephone, ville, pays, profession, photo, linkedin, anneeObtention, bureau")
        .eq("email", u.email)
        .maybeSingle();

      setMember(m ?? null);
      setUser({ ...u, ...meta, full_name: meta.nom || meta.full_name || m?.nom || u.email });
      setProfile({
        phone:           meta.phone          || m?.telephone      || "",
        city:            meta.city           || m?.ville          || "",
        country:         meta.country        || m?.pays           || "Togo",
        profession:      meta.profession     || m?.profession     || "",
        linkedin:        meta.linkedin       || m?.linkedin       || "",
        anneeObtention:  meta.anneeObtention || m?.anneeObtention || "",
      });

      if (m?.id) {
        const { data: cots } = await supabase
          .from("cotisations")
          .select("*")
          .eq("member_id", String(m.id))
          .order("annee", { ascending: false });
        setCotisations(cots ?? []);
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

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Image trop grande (max 10 Mo)."); return; }
    setUploadingPhoto(true);
    try {
      const dataUrl = await compressImage(file, 400, 0.85);
      if (member?.id) {
        await supabase.from("members").update({ photo: dataUrl }).eq("id", member.id);
      }
      setMember(p => ({ ...p, photo: dataUrl }));
      toast.success("Photo mise à jour !");
    } catch {
      toast.error("Erreur lors du changement de photo.");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    // 1. Mettre à jour les métadonnées Auth
    await supabase.auth.updateUser({ data: profile });
    // 2. Répercuter dans la table members (annuaire, dashboard, tout est synchronisé)
    if (member?.id) {
      await supabase.from("members").update({
        telephone:      profile.phone,
        ville:          profile.city,
        pays:           profile.country,
        profession:     profile.profession,
        linkedin:       profile.linkedin,
        anneeObtention: profile.anneeObtention,
      }).eq("id", member.id);
      setMember(p => ({ ...p, ...profile, telephone: profile.phone, ville: profile.city, pays: profile.country }));
    }
    setUser(u => ({ ...u, ...profile }));
    setEditing(false);
    setSaving(false);
    toast.success("Profil mis à jour — les changements sont visibles partout sur le site.");
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

      <section className="py-12 max-w-5xl mx-auto px-6">

        {/* ── Carte identité ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-5">

          {/* Avatar — cliquer pour changer la photo */}
          <div className="relative flex-shrink-0 cursor-pointer group"
            onClick={() => photoInputRef.current?.click()}
            title="Cliquer pour changer la photo">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md">
              {member?.photo ? (
                <img src={member.photo} alt={user.full_name} className="w-full h-full object-cover object-top" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <span className="text-primary-foreground font-heading font-bold text-3xl">
                    {user.full_name?.charAt(0) || "M"}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              {uploadingPhoto
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Camera className="w-5 h-5 text-white" />}
            </div>
          </div>
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />

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

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-8 w-fit overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PROFIL ── */}
        {tab === "profil" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-7">
            <div className="flex items-center justify-between mb-6">
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
                Votre photo se change en cliquant directement sur elle dans la carte en haut.
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
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
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
                        <div className="flex items-center gap-4 px-6 py-4">
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
                                    <> · <span className="font-semibold text-emerald-600">Complet ✓</span></>
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

            <p className="text-xs text-muted-foreground text-center">
              Pour toute question ou signaler un paiement non enregistré, contactez le trésorier à{" "}
              <a href="mailto:contact@mabellepromo.org" className="text-primary hover:underline">contact@mabellepromo.org</a>
            </p>
          </motion.div>
        )}

        {/* ── DOCUMENTS ── */}
        {tab === "documents" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {documentsExclusifs.map((doc, i) => (
              <div key={i} className={`flex items-center justify-between p-5 bg-card border rounded-xl transition-all ${
                doc.restreint ? "border-border opacity-60" : "border-border hover:border-primary/20 hover:shadow-sm"
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.restreint ? "bg-muted" : "bg-primary/10"}`}>
                    {doc.restreint ? <Lock className="w-4 h-4 text-muted-foreground" /> : <FileText className="w-4 h-4 text-primary" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{doc.titre}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{doc.type} · {doc.taille} · {doc.date}</div>
                  </div>
                </div>
                {doc.restreint ? (
                  <span className="text-xs text-muted-foreground px-3 py-1 bg-muted rounded-full">Accès bureau</span>
                ) : (
                  <button onClick={() => toast.info("Téléchargement disponible prochainement.")}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                    <Download className="w-3.5 h-3.5" /> Télécharger
                  </button>
                )}
              </div>
            ))}
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
                    <p className="text-sm font-medium text-green-600">✓ Demande envoyée. Redirection…</p>
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
