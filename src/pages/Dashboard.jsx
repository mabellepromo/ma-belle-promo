import { useState, useMemo, useRef } from "react";
import { toast } from "sonner";
import { compressImage } from "../lib/imageUtils";
import { useMemberStore } from "../lib/memberStore";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useLocalAuth } from "../lib/LocalAuth";
import { useArticles } from "../hooks/useArticles";
import { useEvenements } from "../hooks/useEvenements";
import {
  Users, FileText, Clock, Check, X, Shield, LayoutDashboard, Lock,
  ExternalLink, Search, Image, Images, Mail, MapPin, Star,
  LogOut, AlertTriangle, Briefcase, Eye, Edit2, Trash2, Globe,
  UserCheck, Plus, Upload, Calendar, Tag, ChevronDown,
  Link2, Download, MessageSquare, PenSquare, BookOpen
} from "lucide-react";
import { FormPanel, ImgField, Field, inp } from "./dashboard/shared.jsx";
import { MessagesSection, ComposeModal } from "./dashboard/MessagesSection.jsx";
import {
  ArticlesSection, EvenementsSection, ProjetsSection, ProgrammesSection,
  EquipeSection, SponsorsSection, CommuniquesSection, MediathequeSection,
  DocumentsSection, RessourcesSection, GaleriesSection,
} from "./dashboard/CrudSections.jsx";

export default function Dashboard() {
  const { session, logout } = useLocalAuth();
  const navigate = useNavigate();

  const { articles } = useArticles();
  const { evenements } = useEvenements();

  const {
    allMembers, pendingMembers,
    updateMember, validateMember, rejectMember, deleteMember, addValidated,
    isSeeded, seedFromStatic, migrateFromOldStore, saving: memberSaving,
  } = useMemberStore({ realtime: true });

  const [tab,           setTab]          = useState("overview");
  const [search,        setSearch]       = useState("");
  const [compose,       setCompose]      = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [addingMember,  setAddingMember]  = useState(null);
  const csvInputRef = useRef(null);

  const filteredMembers = useMemo(() => {
    const q = search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return allMembers.filter(m => {
      const hay = [m.nom, m.profession, m.ville, m.pays].join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return !search || hay.includes(q);
    });
  }, [allMembers, search]);

  async function handleSaveEditMember() {
    if (!editingMember) return;
    await updateMember(editingMember, editingMember);
    setEditingMember(null);
  }

  async function handleSaveNewMember() {
    if (!addingMember?.nom?.trim()) { toast.error("Le nom est obligatoire."); return; }
    await addValidated(addingMember);
    setAddingMember(null);
  }

  function handleCsvUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split("\n").filter(l => l.trim());
      const headers = lines[0].split(";").map(h => h.trim().toLowerCase());
      let count = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(";").map(c => c.trim().replace(/^"|"$/g, ""));
        if (!cols[0]) continue;
        const row = {};
        headers.forEach((h, idx) => { row[h] = cols[idx] || ""; });
        addValidated({
          nom:           row["nom"]           || row["name"]    || "",
          profession:    row["profession"]    || row["metier"]  || "",
          ville:         row["ville"]         || row["city"]    || "",
          pays:          row["pays"]          || row["country"] || "",
          email:         row["email"]         || "",
          telephone:     row["telephone"]     || row["tel"]     || row["phone"] || "",
          linkedin:      row["linkedin"]      || "",
          anneeObtention: row["anneeObtention"] || row["promo"] || row["annee"] || "",
        });
        count++;
      }
      toast.success(`${count} membre(s) importé(s) avec succès.`);
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  }

  if (!session || session.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Accès refusé</h2>
          <p className="text-muted-foreground mb-6">Tableau de bord réservé aux administrateurs.</p>
          <button onClick={() => navigate("/login")}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-semibold text-sm">
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const TABS = [
    { key: "overview",    label: "Vue d'ensemble",  icon: LayoutDashboard },
    { key: "membres",     label: `Membres (${allMembers.length})`, icon: Users },
    { key: "pending",     label: `En attente${pendingMembers.length > 0 ? ` (${pendingMembers.length})` : ""}`, icon: Clock, alert: pendingMembers.length > 0 },
    { key: "messages",    label: "Messages", icon: MessageSquare },
    { key: "articles",    label: "Articles",    icon: FileText },
    { key: "evenements",  label: "Événements",  icon: Calendar },
    { key: "projets",     label: "Projets",     icon: Star },
    { key: "programmes",  label: "Programmes",  icon: Tag },
    { key: "equipe",      label: "Équipe",      icon: UserCheck },
    { key: "sponsors",    label: "Sponsors",    icon: Globe },
    { key: "communiques", label: "Communiqués", icon: Mail },
    { key: "mediatheque", label: "Médiathèque", icon: Image },
    { key: "documents",   label: "Documents",   icon: Download },
    { key: "galeries",    label: "Galeries",    icon: Images },
    { key: "ressources",  label: "Ressources",  icon: BookOpen },
  ];

  const stats = [
    { label: "Membres",    value: allMembers.length,     icon: Users,        color: "bg-blue-50 text-blue-600",   sub: `${allMembers.filter(m => m.bureau).length} au bureau`, onClick: () => setTab("membres") },
    { label: "En attente", value: pendingMembers.length, icon: Clock,        color: "bg-amber-50 text-amber-600", sub: "à valider", alert: pendingMembers.length > 0, onClick: () => setTab("pending") },
    { label: "Articles",   value: articles.length, icon: FileText, color: "bg-green-50 text-green-600", sub: "publications", onClick: () => setTab("articles") },
    { label: "Événements", value: evenements.length, icon: Calendar, color: "bg-indigo-50 text-indigo-600", sub: "planifiés", onClick: () => setTab("evenements") },
  ];

  const PROTECTED_PAGES = [
    { label: "Adhérents",    href: "/annuaire",                   icon: Users   },
    { label: "Médiathèque",  href: "/informations/mediatheque",   icon: Image   },
    { label: "Documents",    href: "/informations/documents",     icon: FileText },
  ];

  const NAV_GROUPS = [
    {
      label: null,
      items: [{ key: "overview", label: "Vue d'ensemble", icon: LayoutDashboard }],
    },
    {
      label: "Membres",
      items: [
        { key: "membres",  label: `Membres`, badge: allMembers.length, icon: Users },
        { key: "pending",  label: "En attente", badge: pendingMembers.length || null, badgeAlert: true, icon: Clock },
        { key: "messages", label: "Messages", icon: MessageSquare },
      ],
    },
    {
      label: "Contenu",
      items: [
        { key: "articles",    label: "Articles",    icon: FileText },
        { key: "evenements",  label: "Événements",  icon: Calendar },
        { key: "projets",     label: "Projets",     icon: Star },
        { key: "programmes",  label: "Programmes",  icon: Tag },
        { key: "communiques", label: "Communiqués", icon: Mail },
      ],
    },
    {
      label: "Médias",
      items: [
        { key: "galeries",    label: "Galeries",    icon: Images },
        { key: "mediatheque", label: "Médiathèque", icon: Image },
        { key: "documents",   label: "Documents",   icon: Download },
        { key: "ressources",  label: "Ressources",  icon: BookOpen },
      ],
    },
    {
      label: "Organisation",
      items: [
        { key: "equipe",   label: "Équipe",   icon: UserCheck },
        { key: "sponsors", label: "Sponsors", icon: Globe },
      ],
    },
  ];

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "#f0f2f5" }}>

      {compose && <ComposeModal onClose={() => setCompose(false)} />}

      {/* ── SIDEBAR ── */}
      <aside className="w-64 flex-shrink-0 sticky top-0 h-screen flex flex-col overflow-hidden"
        style={{ background: "var(--brand-dark)" }}>

        {/* Logo */}
        <div className="px-5 pt-6 pb-5 flex items-center gap-3 flex-shrink-0">
          <img src="https://media.base44.com/images/public/69da5bf6442b31e7eee54888/42e641694_LogoRedesign1.png"
            alt="MBP" className="w-10 h-10 rounded-full ring-2 flex-shrink-0" style={{ ringColor: "rgba(255,255,255,0.15)" }} />
          <div>
            <p className="font-heading font-bold text-white text-sm leading-tight">Ma Belle Promo</p>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>Tableau de bord</p>
          </div>
        </div>

        {/* Bouton Composer */}
        <div className="px-4 pb-4 flex-shrink-0">
          <button onClick={() => setCompose(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
            <PenSquare className="w-4 h-4" /> Composer un message
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-5">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.25)" }}>
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map(({ key, label, icon: Icon, badge, badgeAlert }) => {
                  const active = tab === key;
                  return (
                    <button key={key} onClick={() => setTab(key)}
                      className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                      style={{
                        background: active ? "rgba(255,255,255,0.12)" : "transparent",
                        color: active ? "#ffffff" : "rgba(255,255,255,0.55)",
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = active ? "#ffffff" : "rgba(255,255,255,0.55)"; }}
                    >
                      {active && (
                        <span className="absolute left-0 w-0.5 h-5 rounded-r-full" style={{ background: "hsl(var(--primary))" }} />
                      )}
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 truncate">{label}</span>
                      {badge != null && badge > 0 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                          badgeAlert
                            ? "bg-amber-500 text-white animate-pulse"
                            : "text-white/50"
                        }`} style={!badgeAlert ? { background: "rgba(255,255,255,0.12)" } : {}}>
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="flex-shrink-0 border-t px-4 py-4 space-y-1" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl mb-2" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--primary)/0.3)" }}>
              <Shield className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white/80 truncate">{session?.email?.split("@")[0]}</p>
              <p className="text-[10px] text-white/35 truncate capitalize">{session?.role || "admin"}</p>
            </div>
          </div>
          <Link to="/" target="_blank"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ color: "rgba(255,255,255,0.45)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.85)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.background = "transparent"; }}>
            <Globe className="w-3.5 h-3.5" /> Voir le site public
          </Link>
          <button onClick={() => { logout(); navigate("/login"); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ color: "rgba(255,255,255,0.45)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fca5a5"; e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.background = "transparent"; }}>
            <LogOut className="w-3.5 h-3.5" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* ── CONTENU PRINCIPAL ── */}
      <div className="flex-1 min-w-0 overflow-hidden" style={{ display: "grid", gridTemplateRows: "3.5rem 1fr 2.5rem" }}>
        {/* Topbar contenu */}
        <div className="z-30 flex items-center justify-between px-8 border-b"
          style={{ background: "rgba(240,242,245,0.85)", backdropFilter: "blur(8px)", borderColor: "#e2e8f0" }}>
          <h2 className="font-heading font-bold text-foreground text-base">
            {TABS.find(t => t.key === tab)?.label?.replace(/\s*\(\d+\)/, "") || "Vue d'ensemble"}
          </h2>
          <p className="text-xs text-muted-foreground">FDD · Université de Lomé · Promotion 1994–2000</p>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto">

          {/* ── VUE D'ENSEMBLE ── */}
          {tab === "overview" && (
            <div className="space-y-8">
              <div className="relative overflow-hidden rounded-2xl p-6 md:p-8" style={{ background: "var(--brand-dark-mid)" }}>
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 0%, transparent 60%)" }} />
                <div className="relative flex items-center gap-5">
                  <img src="https://media.base44.com/images/public/69da5bf6442b31e7eee54888/42e641694_LogoRedesign1.png"
                    alt="MBP" className="w-14 h-14 rounded-full ring-2 ring-white/20 flex-shrink-0 hidden sm:block" />
                  <div>
                    <p className="text-white/60 text-xs tracking-widest uppercase mb-1">Bienvenue</p>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-white leading-tight">Tableau de bord</h1>
                    <p className="text-white/60 text-sm mt-1">FDD — Ma Belle Promo · Lomé, Togo · Promotion 1994–2000</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, color, sub, alert, onClick }, i) => (
                  <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    onClick={onClick}
                    className={`relative overflow-hidden bg-background border rounded-2xl p-5 group ${alert ? "border-amber-200" : "border-border"} ${onClick ? "cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200" : ""}`}>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 bg-primary group-hover:opacity-10 transition-opacity" />
                    {alert && <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}><Icon className="w-5 h-5" /></div>
                    <div className="font-heading text-4xl font-black text-foreground tracking-tight">{value}</div>
                    <div className="text-sm font-bold text-foreground mt-1">{label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
                  </motion.div>
                ))}
              </div>

              {pendingMembers.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <h3 className="font-semibold text-amber-800">{pendingMembers.length} demande{pendingMembers.length > 1 ? "s" : ""} en attente</h3>
                    <button onClick={() => setTab("pending")} className="ml-auto text-sm text-amber-700 font-semibold hover:underline">Voir tout →</button>
                  </div>
                  {pendingMembers.slice(0, 2).map(m => (
                    <div key={m.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-amber-100 mb-2">
                      <div><p className="font-semibold text-sm">{m.nom}</p><p className="text-xs text-muted-foreground">{m.profession} · {m.ville}</p></div>
                      <div className="flex gap-2">
                        <button onClick={() => rejectMember(m.id)} className="w-7 h-7 rounded-full bg-red-50 border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-100"><X className="w-3.5 h-3.5" /></button>
                        <button onClick={() => validateMember(m)} className="w-7 h-7 rounded-full bg-green-50 border border-green-200 text-green-600 flex items-center justify-center hover:bg-green-100"><Check className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-background border border-border rounded-2xl p-5">
                  <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-primary" /> Pages privées</h3>
                  {PROTECTED_PAGES.map(({ label, href, icon: Icon }) => (
                    <Link key={href} to={href} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted transition-colors group mb-1">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="w-3.5 h-3.5 text-primary" /></div>
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary" />
                    </Link>
                  ))}
                </div>
                <div className="bg-background border border-border rounded-2xl p-5">
                  <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Session active</h3>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="font-mono text-xs text-foreground">{session?.email}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{session?.role || "admin"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Pour gérer les comptes : ouvrir le dashboard Supabase → Authentication → Users. Le champ <code className="text-primary font-mono">role</code> dans les métadonnées détermine les droits.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── MEMBRES ── */}
          {tab === "membres" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un membre..."
                    className="w-full pl-10 pr-4 h-10 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/8 rounded-xl border border-primary/15">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-semibold text-primary">{filteredMembers.length}</span>
                  <span className="text-xs text-primary/70">membre{filteredMembers.length !== 1 ? "s" : ""}</span>
                </div>
                <button onClick={() => setAddingMember({ nom: "", profession: "", ville: "", pays: "", email: "", telephone: "", linkedin: "", anneeObtention: "", photo: "" })}
                  className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                  <Plus className="w-4 h-4" /> Ajouter
                </button>
                <button onClick={() => csvInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-4 h-10 rounded-xl border border-border bg-background text-sm font-medium hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                  <Upload className="w-4 h-4" /> Importer CSV
                </button>
                <input ref={csvInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleCsvUpload} />
                {!isSeeded && (
                  <button onClick={seedFromStatic} disabled={memberSaving}
                    className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold hover:bg-amber-100 transition-colors disabled:opacity-60">
                    {memberSaving
                      ? <><div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /> Migration…</>
                      : <>☁️ Migrer les données initiales</>}
                  </button>
                )}
                <button onClick={migrateFromOldStore} disabled={memberSaving}
                  className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors disabled:opacity-60">
                  {memberSaving
                    ? <><div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> Récupération…</>
                    : <>🔄 Récupérer anciens membres</>}
                </button>
              </div>

              {addingMember && (
                <FormPanel title="Nouveau membre" onClose={() => setAddingMember(null)} onSave={handleSaveNewMember}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Nom complet" required><input className={inp} value={addingMember.nom} onChange={e => setAddingMember(p => ({ ...p, nom: e.target.value }))} placeholder="Prénom NOM" /></Field>
                    <Field label="Profession"><input className={inp} value={addingMember.profession} onChange={e => setAddingMember(p => ({ ...p, profession: e.target.value }))} /></Field>
                    <Field label="Ville"><input className={inp} value={addingMember.ville} onChange={e => setAddingMember(p => ({ ...p, ville: e.target.value }))} /></Field>
                    <Field label="Pays"><input className={inp} value={addingMember.pays} onChange={e => setAddingMember(p => ({ ...p, pays: e.target.value }))} /></Field>
                    <Field label="Email"><input className={inp} type="email" value={addingMember.email} onChange={e => setAddingMember(p => ({ ...p, email: e.target.value }))} /></Field>
                    <Field label="Téléphone"><input className={inp} value={addingMember.telephone} onChange={e => setAddingMember(p => ({ ...p, telephone: e.target.value }))} /></Field>
                    <Field label="Année d'obtention du diplôme"><input className={inp} value={addingMember.anneeObtention} onChange={e => setAddingMember(p => ({ ...p, anneeObtention: e.target.value }))} placeholder="ex: 2005" /></Field>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-foreground mb-1">LinkedIn</label>
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <input className={inp} type="url" placeholder="https://linkedin.com/in/..." value={addingMember.linkedin} onChange={e => setAddingMember(p => ({ ...p, linkedin: e.target.value }))} />
                      </div>
                    </div>
                    <div className="md:col-span-2"><ImgField label="Photo" value={addingMember.photo} onChange={v => setAddingMember(p => ({ ...p, photo: v }))} /></div>
                  </div>
                </FormPanel>
              )}

              {editingMember && (
                <FormPanel title={`Modifier — ${editingMember.nom}`} onClose={() => setEditingMember(null)} onSave={handleSaveEditMember}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Nom complet"><input className={inp} value={editingMember.nom || ""} onChange={e => setEditingMember(p => ({ ...p, nom: e.target.value }))} /></Field>
                    <Field label="Profession"><input className={inp} value={editingMember.profession || ""} onChange={e => setEditingMember(p => ({ ...p, profession: e.target.value }))} /></Field>
                    <Field label="Ville"><input className={inp} value={editingMember.ville || ""} onChange={e => setEditingMember(p => ({ ...p, ville: e.target.value }))} /></Field>
                    <Field label="Pays"><input className={inp} value={editingMember.pays || ""} onChange={e => setEditingMember(p => ({ ...p, pays: e.target.value }))} /></Field>
                    <Field label="Email"><input className={inp} type="email" value={editingMember.email || ""} onChange={e => setEditingMember(p => ({ ...p, email: e.target.value }))} /></Field>
                    <Field label="Téléphone"><input className={inp} value={editingMember.telephone || editingMember.tel || ""} onChange={e => setEditingMember(p => ({ ...p, telephone: e.target.value, tel: e.target.value }))} /></Field>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-foreground mb-1">LinkedIn</label>
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <input className={inp} type="url" placeholder="https://linkedin.com/in/..." value={editingMember.linkedin || ""} onChange={e => setEditingMember(p => ({ ...p, linkedin: e.target.value }))} />
                      </div>
                    </div>
                    <div className="md:col-span-2"><ImgField label="Photo" value={editingMember.photo} onChange={v => setEditingMember(p => ({ ...p, photo: v }))} /></div>
                  </div>
                </FormPanel>
              )}

              <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border px-5 py-3 grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 items-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Membre</span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:block">Profession</span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider hidden lg:block">Localisation</span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Statut</span>
                  <span></span>
                </div>
                <div className="divide-y divide-border/60">
                  {filteredMembers.map((m, i) => (
                    <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="group grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 items-center px-5 py-3.5 hover:bg-primary/[0.03] transition-all relative">
                      <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary rounded-r scale-y-0 group-hover:scale-y-100 transition-transform" />
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-border group-hover:ring-primary/20 transition-all">
                          <img
                            src={m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nom)}&background=064e3b&color=6ee7b7&size=40`}
                            alt={m.nom} className="w-full h-full object-cover" style={{ objectPosition: "center 20%" }}
                            onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nom)}&background=064e3b&color=6ee7b7&size=40`; }} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">{m.nom}</p>
                          <p className="text-xs text-muted-foreground truncate">{m.email || "—"}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 hidden md:block">{m.profession || "—"}</p>
                      <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{m.ville}{m.pays ? `, ${m.pays}` : ""}</span>
                      </div>
                      <div>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          m.bureau ? "bg-amber-100 text-amber-700 border border-amber-200" :
                          m.status === "validated" ? "bg-green-100 text-green-700 border border-green-200" :
                          "bg-primary/8 text-primary border border-primary/15"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${m.bureau ? "bg-amber-500" : m.status === "validated" ? "bg-green-500" : "bg-primary"}`} />
                          {m.bureau ? "Bureau" : m.status === "validated" ? "Validé" : "Actif"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingMember({ ...m })} className="w-7 h-7 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { if (confirm(`Supprimer ${m.nom} ?`)) deleteMember(m.id); }} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── EN ATTENTE ── */}
          {tab === "pending" && (
            <div className="space-y-4 max-w-2xl">
              <h2 className="font-heading text-xl font-bold text-foreground">
                {pendingMembers.length} demande{pendingMembers.length !== 1 ? "s" : ""} en attente
              </h2>
              {pendingMembers.length === 0 && (
                <div className="text-center py-20 text-muted-foreground bg-background border border-border rounded-2xl">
                  <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">Aucune demande en attente.</p>
                </div>
              )}
              {pendingMembers.map(m => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-background border border-border rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      <img src={m.photo} alt={m.nom} className="w-full h-full object-cover"
                        onError={e => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nom)}&background=064e3b&color=6ee7b7&size=56`; }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">{m.nom}</h3>
                      <p className="text-sm text-muted-foreground">{m.profession}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{m.ville}, {m.pays}</span>
                        {m.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{m.email}</span>}
                        {m.anneeObtention && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />Promo {m.anneeObtention}</span>}
                      </div>
                      {m.motivations && <p className="mt-2 text-xs italic bg-muted/40 rounded-lg p-2 line-clamp-2">"{m.motivations}"</p>}
                      <p className="mt-1 text-xs text-muted-foreground/50">
                        Soumis le {new Date(m.submittedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4 justify-end">
                    <button onClick={() => rejectMember(m.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-100">
                      <X className="w-4 h-4" /> Rejeter
                    </button>
                    <button onClick={() => validateMember(m)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold hover:bg-green-100">
                      <Check className="w-4 h-4" /> Valider
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {tab === "messages"    && <MessagesSection />}
          {tab === "articles"    && <ArticlesSection />}
          {tab === "evenements"  && <EvenementsSection />}
          {tab === "projets"     && <ProjetsSection />}
          {tab === "programmes"  && <ProgrammesSection />}
          {tab === "equipe"      && <EquipeSection />}
          {tab === "sponsors"    && <SponsorsSection />}
          {tab === "communiques" && <CommuniquesSection />}
          {tab === "mediatheque" && <MediathequeSection />}
          {tab === "documents"   && <DocumentsSection />}
          {tab === "galeries"    && <GaleriesSection />}
          {tab === "ressources"  && <RessourcesSection />}

        </div>

        {/* Footer contenu */}
        <div className="flex items-center justify-between px-8 border-t"
          style={{ background: "rgba(240,242,245,0.85)", backdropFilter: "blur(8px)", borderColor: "#e2e8f0" }}>
          <p className="text-[11px] text-muted-foreground">FDD Ma Belle Promo · Lomé, Togo · Promotion 1994–2000</p>
          <p className="text-[11px] text-muted-foreground">{new Date().getFullYear()} · Tableau de bord v2</p>
        </div>
      </div>
    </div>
  );
}

