import { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";
import { compressImage } from "../lib/imageUtils";
import { genererAttestation, openDocUrl, genererTrombinoscope } from "../lib/documentGenerators";
import { useMemberStore } from "../lib/memberStore";
import { supabase } from "../lib/supabase";
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
  Link2, Download, MessageSquare, PenSquare, BookOpen, KeyRound, Banknote, BarChart2,
  Bell, Vote
} from "lucide-react";
import { FormPanel, ImgField, Field, inp } from "./dashboard/shared.jsx";
import ConfirmDialog from "../components/ConfirmDialog";
import AttestationDialog from "../components/AttestationDialog";
import { MessagesSection, ComposeModal } from "./dashboard/MessagesSection.jsx";
import AccesSection from "./dashboard/AccesSection.jsx";
import CotisationsSection from "./dashboard/CotisationsSection.jsx";
import RapportAnnuel from "./dashboard/RapportAnnuel.jsx";
import { useCotisations } from "../hooks/useCotisations";
import { useMultiYearCotisations } from "../hooks/useMultiYearCotisations";
import { useNotifications, requestNotificationPermission } from "../hooks/useNotifications";
import SondagesSection from "./dashboard/SondagesSection";
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
  const currentYear = new Date().getFullYear();
  const YEARS_3 = [currentYear - 2, currentYear - 1, currentYear];
  const { cotisations: cotisationsAnnee } = useCotisations(currentYear);
  const { data: multiYearData } = useMultiYearCotisations(YEARS_3);

  const {
    allMembers, pendingMembers,
    updateMember, validateMember, rejectMember, deleteMember, addValidated,
    isSeeded, seedFromStatic, saving: memberSaving,
  } = useMemberStore({ realtime: true });

  const [tab,                setTab]               = useState("overview");
  const [search,             setSearch]            = useState("");
  const [compose,            setCompose]           = useState(false);
  const [pendingAttachment,  setPendingAttachment] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [addingMember,  setAddingMember]  = useState(null);
  const [confirmDialog,     setConfirmDialog]     = useState(null);
  const [attestationDialog, setAttestationDialog] = useState(null);
  const [memberDetail,      setMemberDetail]      = useState(null);
  const [notifPermission,   setNotifPermission]   = useState(() =>
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );
  const [renewDialog,       setRenewDialog]       = useState(false);
  const [renewDate,         setRenewDate]         = useState(`${new Date().getFullYear()}-12-31`);
  const [renewLoading,      setRenewLoading]      = useState(false);
  const [unreadCount,    setUnreadCount]    = useState(0);
  const csvInputRef = useRef(null);

  useEffect(() => {
    async function fetchUnread() {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("read", false);
      setUnreadCount(count || 0);
    }
    fetchUnread();

    const channel = supabase
      .channel("dashboard-messages-unread")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, fetchUnread)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    function onAttachment(e) {
      setPendingAttachment(e.detail);
      setTab("messages");
      setCompose(true);
    }
    window.addEventListener("mbp:compose-with-attachment", onAttachment);
    return () => window.removeEventListener("mbp:compose-with-attachment", onAttachment);
  }, []);

  const cotStats = useMemo(() => {
    const rows    = (allMembers ?? []).map(m => {
      const cot = cotisationsAnnee.find(c => String(c.member_id) === String(m.id));
      return cot?.statut ?? "en_attente";
    });
    const payes   = rows.filter(s => s === "payé").length;
    const exempts = rows.filter(s => s === "exempté").length;
    const total   = allMembers.length;
    const effectif = total - exempts;
    return { payes, total, taux: effectif > 0 ? Math.round((payes / effectif) * 100) : 0 };
  }, [allMembers, cotisationsAnnee]);

  const prochainEvenement = useMemo(() =>
    evenements.filter(e => e.statut?.toLowerCase() !== "passé")[0] ?? null,
    [evenements]
  );

  const prochainsAnniversaires = useMemo(() => {
    const MOIS_FR = {
      "janvier": 0, "février": 1, "mars": 2, "avril": 3, "mai": 4, "juin": 5,
      "juillet": 6, "août": 7, "septembre": 8, "octobre": 9, "novembre": 10, "décembre": 11
    };
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return (allMembers ?? [])
      .map(m => {
        if (!m.anniversaire) return null;
        const parts = m.anniversaire.trim().split(" ");
        const jour = parseInt(parts[0]);
        const mois = MOIS_FR[parts.slice(1).join(" ").toLowerCase()];
        if (isNaN(jour) || mois === undefined) return null;
        let date = new Date(today.getFullYear(), mois, jour);
        if (date < today) date = new Date(today.getFullYear() + 1, mois, jour);
        const jours = Math.ceil((date - today) / 86400000);
        return { ...m, joursAvant: jours, dateStr: m.anniversaire };
      })
      .filter(Boolean)
      .filter(m => m.joursAvant <= 30)
      .sort((a, b) => a.joursAvant - b.joursAvant);
  }, [allMembers]);

  const membresDormants = useMemo(() => {
    if (!multiYearData || Object.keys(multiYearData).length === 0) return [];
    const yr3 = [currentYear - 2, currentYear - 1, currentYear];
    return (allMembers ?? []).filter(m => {
      const md = multiYearData[String(m.id)] ?? {};
      return !yr3.some(yr => {
        const s = md[yr]?.statut;
        return s === "payé" || s === "partiel";
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMembers, multiYearData]);

  const repartitionGeo = useMemo(() => {
    const counts = {};
    (allMembers ?? []).forEach(m => {
      const key = m.pays?.trim() || "Non renseigné";
      counts[key] = (counts[key] || 0) + 1;
    });
    const total = allMembers.length || 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([pays, count]) => ({ pays, count, pct: Math.round((count / total) * 100) }));
  }, [allMembers]);

  const agendaCombine = useMemo(() => {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const items = [];
    (evenements ?? []).filter(e => e.statut?.toLowerCase() !== "passé").forEach(e => {
      let joursAvant = null;
      try { const d = new Date(e.date); if (!isNaN(d)) joursAvant = Math.ceil((d - now) / 86400000); } catch {}
      items.push({ type: "event", titre: e.titre, dateStr: e.date, lieu: e.lieu ?? null, joursAvant });
    });
    prochainsAnniversaires.forEach(m => {
      items.push({ type: "anniv", titre: m.nom, dateStr: m.dateStr, joursAvant: m.joursAvant });
    });
    items.sort((a, b) => {
      if (a.joursAvant === null && b.joursAvant === null) return 0;
      if (a.joursAvant === null) return 1;
      if (b.joursAvant === null) return -1;
      return a.joursAvant - b.joursAvant;
    });
    return items.slice(0, 8);
  }, [evenements, prochainsAnniversaires]);

  const filteredMembers = useMemo(() => {
    const q = search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return allMembers.filter(m => {
      const hay = [m.nom, m.profession, m.ville, m.pays].join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return !search || hay.includes(q);
    });
  }, [allMembers, search]);

  async function exportBackup() {
    toast("Préparation du backup…");
    try {
      const [members_, cotisations_, articles_, evenements_, sondages_] = await Promise.all([
        supabase.from("members").select("*"),
        supabase.from("cotisations").select("*"),
        supabase.from("articles").select("*"),
        supabase.from("evenements").select("*"),
        supabase.from("sondages").select("*"),
      ]);
      const backup = {
        exportedAt: new Date().toISOString(),
        version: "1.0",
        project: "FDD Ma Belle Promo",
        data: {
          members:     members_.data     ?? [],
          cotisations: cotisations_.data ?? [],
          articles:    articles_.data    ?? [],
          evenements:  evenements_.data  ?? [],
          sondages:    sondages_.data    ?? [],
        },
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json;charset=utf-8;" });
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement("a"), { href: url, download: `mbp-backup-${new Date().toISOString().slice(0, 10)}.json` });
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup téléchargé !");
    } catch (err) {
      toast.error("Erreur backup : " + err.message);
    }
  }

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

  function exportMembresExcel() {
    const headers = ["Nom", "Profession", "Ville", "Pays", "Email", "Téléphone", "LinkedIn", "Année diplôme", "Statut"];
    const rows = allMembers.map(m => [
      m.nom || "",
      m.profession || "",
      m.ville || "",
      m.pays || "",
      m.email || "",
      m.telephone || m.tel || "",
      m.linkedin || "",
      m.anneeObtention || "",
      m.bureau ? "Bureau" : "Membre",
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(";"))
      .join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `membres-mbp-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCsvUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (max 5 Mo).");
      e.target.value = "";
      return;
    }
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

  useNotifications(allMembers, pendingMembers);

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
    { key: "messages",    label: unreadCount > 0 ? `Messages (${unreadCount})` : "Messages", icon: MessageSquare, alert: unreadCount > 0 },
    { key: "articles",    label: "Articles",    icon: FileText },
    { key: "evenements",  label: "Événements",  icon: Calendar },
    { key: "projets",     label: "Projets",     icon: Star },
    { key: "programmes",  label: "Programmes",  icon: Tag },
    { key: "equipe",      label: "Équipe",      icon: UserCheck },
    { key: "sponsors",    label: "Partenaires",  icon: Globe },
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
        { key: "membres",      label: `Membres`, badge: allMembers.length, icon: Users },
        { key: "cotisations",  label: "Cotisations",    icon: Banknote },
        { key: "rapport",      label: "Rapport annuel", icon: BarChart2 },
        { key: "pending",      label: "En attente", badge: pendingMembers.length || null, badgeAlert: true, icon: Clock },
        { key: "messages",     label: "Messages", icon: MessageSquare, badge: unreadCount || null, badgeAlert: true },
        { key: "acces",        label: "Accès membres", icon: KeyRound },
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
        { key: "sondages",    label: "Sondages",    icon: Vote },
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
        { key: "sponsors", label: "Partenaires", icon: Globe },
      ],
    },
  ];

  const allNavItems = NAV_GROUPS.flatMap(g => g.items);
  const currentNavItem = allNavItems.find(i => i.key === tab);
  const CurrentIcon = currentNavItem?.icon || LayoutDashboard;

  const STAT_COLORS = [
    { border: "#3b82f6", bg: "#eff6ff", text: "#2563eb" },
    { border: "#f59e0b", bg: "#fffbeb", text: "#d97706" },
    { border: "#10b981", bg: "#ecfdf5", text: "#059669" },
    { border: "#6366f1", bg: "#eef2ff", text: "#4f46e5" },
  ];

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "#f1f5f9" }}>

      {compose && (
        <ComposeModal
          initialAttachment={pendingAttachment}
          onClose={() => { setCompose(false); setPendingAttachment(null); }}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className="w-64 flex-shrink-0 h-screen flex flex-col"
        style={{ background: "var(--brand-dark)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>

        {/* En-tête */}
        <div className="px-6 py-5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="font-heading font-bold text-white text-base leading-tight tracking-tight">Ma Belle Promo</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--primary))" }} />
            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.30)" }}>Tableau de bord</p>
          </div>
        </div>

        {/* Composer */}
        <div className="px-4 py-4 flex-shrink-0">
          <button onClick={() => setCompose(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
            <PenSquare className="w-4 h-4" /> Composer
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-4 pb-4">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <div className="flex items-center gap-2 px-3 mb-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.20)" }}>{group.label}</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map(({ key, label, icon: Icon, badge, badgeAlert }) => {
                  const active = tab === key;
                  return (
                    <button key={key} onClick={() => setTab(key)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left"
                      style={{
                        background: active ? "hsl(var(--primary))" : "transparent",
                        color: active ? "#fff" : "rgba(255,255,255,0.50)",
                        fontWeight: active ? 600 : 400,
                      }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.50)"; }}}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ opacity: active ? 1 : 0.7 }} />
                      <span className="flex-1 truncate">{label}</span>
                      {badge != null && badge > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={badgeAlert
                            ? { background: "#f59e0b", color: "#fff" }
                            : { background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>
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

        {/* Profil + actions */}
        <div className="flex-shrink-0 px-4 pb-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-2" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--primary))" }}>
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold leading-tight truncate" style={{ color: "rgba(255,255,255,0.80)" }}>{session?.email?.split("@")[0]}</p>
              <p className="text-[9px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.30)" }}>{session?.role || "admin"}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Link to="/" target="_blank"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium transition-all"
              style={{ color: "rgba(255,255,255,0.40)", background: "rgba(255,255,255,0.04)" }}
              onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.80)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.40)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}>
              <Globe className="w-3 h-3" /> Site
            </Link>
            <button onClick={() => { logout(); navigate("/login"); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium transition-all"
              style={{ color: "rgba(255,255,255,0.40)", background: "rgba(255,255,255,0.04)" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fca5a5"; e.currentTarget.style.background = "rgba(239,68,68,0.10)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.40)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}>
              <LogOut className="w-3 h-3" /> Quitter
            </button>
          </div>
        </div>
      </aside>

      {/* ── CONTENU ── */}
      <div className="flex-1 min-w-0 overflow-hidden" style={{ display: "grid", gridTemplateRows: "3.5rem 1fr auto" }}>

        {/* Topbar */}
        <div className="flex items-center justify-between px-8"
          style={{ background: "var(--brand-dark)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)" }}>
              <CurrentIcon className="w-3.5 h-3.5 text-white/70" />
            </div>
            <h2 className="font-heading font-bold text-white text-sm tracking-wide">
              {currentNavItem?.label || "Vue d'ensemble"}
            </h2>
          </div>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.30)" }}>
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto" style={{ paddingBottom: "6rem" }}>

          {/* ── VUE D'ENSEMBLE ── */}
          {tab === "overview" && (
            <div className="space-y-6">

              {/* Bannière */}
              <div className="relative overflow-hidden rounded-2xl px-8 py-7"
                style={{ background: "linear-gradient(135deg, var(--brand-dark) 0%, #1a3d2b 60%, #0f2a1e 100%)" }}>
                <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 80% 50%, rgba(52,211,153,0.08) 0%, transparent 60%)" }} />
                <div className="absolute right-0 top-0 bottom-0 w-64 opacity-5"
                  style={{ backgroundImage: "repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 12px)" }} />
                <div className="relative">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: "hsl(var(--primary))" }}>Bienvenue</p>
                  <h1 className="font-heading text-2xl md:text-3xl font-bold text-white leading-tight">Tableau de bord</h1>
                  <p className="text-sm mt-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>FDD — Ma Belle Promo · Lomé, Togo · Promotion 1994–2000</p>
                </div>
              </div>

              {/* Notifications navigateur */}
              {notifPermission !== "granted" && notifPermission !== "unsupported" && (
                <div className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-2xl px-5 py-3.5">
                  <Bell className="w-4 h-4 text-violet-600 flex-shrink-0" />
                  <p className="text-sm text-violet-800 flex-1">
                    {notifPermission === "denied"
                      ? "Notifications bloquées — autorisez-les dans les paramètres de votre navigateur."
                      : "Activez les notifications pour recevoir les alertes anniversaires et nouvelles demandes."}
                  </p>
                  {notifPermission === "default" && (
                    <button
                      onClick={async () => {
                        const result = await requestNotificationPermission();
                        setNotifPermission(result);
                      }}
                      className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
                      Activer
                    </button>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, sub, alert, onClick }, i) => (
                  <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    onClick={onClick}
                    className={`bg-white rounded-2xl overflow-hidden shadow-sm group ${onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200" : ""}`}>
                    <div className="h-1 w-full" style={{ background: STAT_COLORS[i].border }} />
                    <div className="p-5">
                      {alert && <span className="float-right w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1" />}
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: STAT_COLORS[i].bg }}>
                        <Icon className="w-4 h-4" style={{ color: STAT_COLORS[i].text }} />
                      </div>
                      <div className="font-heading text-3xl font-black tracking-tight" style={{ color: "#0f172a" }}>{value}</div>
                      <div className="text-sm font-semibold mt-0.5" style={{ color: "#1e293b" }}>{label}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{sub}</div>
                    </div>
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

              {/* Cotisations + Prochain événement */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Taux de cotisation */}
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="h-1 w-full bg-emerald-500" />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                          <Banknote className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Cotisations {currentYear}</p>
                          <p className="text-xs text-muted-foreground">{cotStats.payes} / {cotStats.total} membres</p>
                        </div>
                      </div>
                      <span className="font-heading text-2xl font-black text-emerald-600">{cotStats.taux}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${cotStats.taux}%` }} />
                    </div>
                    <button onClick={() => setTab("cotisations")}
                      className="mt-3 text-xs font-semibold text-emerald-600 hover:underline">
                      Gérer les cotisations →
                    </button>
                  </div>
                </div>

                {/* Prochain événement */}
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="h-1 w-full bg-indigo-500" />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                      </div>
                      <p className="text-sm font-bold text-foreground">Prochain événement</p>
                    </div>
                    {prochainEvenement ? (
                      <>
                        <p className="font-semibold text-foreground text-sm leading-snug">{prochainEvenement.titre}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {prochainEvenement.date}{prochainEvenement.lieu ? ` · ${prochainEvenement.lieu}` : ""}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Aucun événement à venir.</p>
                    )}
                    <button onClick={() => setTab("evenements")}
                      className="mt-3 text-xs font-semibold text-indigo-600 hover:underline">
                      Gérer les événements →
                    </button>
                  </div>
                </div>
              </div>

              {/* Convention de partenariat */}
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="h-1 w-full" style={{ background: "linear-gradient(to right, #1b6b45, #9a7118)" }} />
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#e8f5ee" }}>
                      <FileText className="w-4 h-4" style={{ color: "#1b6b45" }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Convention de Partenariat</p>
                      <p className="text-xs text-muted-foreground">Document officiel — 13 articles + 4 annexes · à personnaliser avant signature</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => openDocUrl("/documents/Dossier_Partenariat_MBP.html", "Dossier-Partenariat-MBP.html")}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                      style={{ background: "#9a7118", color: "#fff" }}
                    >
                      <FileText className="w-3.5 h-3.5" /> Dossier
                    </button>
                    <button
                      onClick={() => openDocUrl("/documents/Convention_Partenariat_MBP.html", "Convention-Partenariat-MBP.html")}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                      style={{ background: "#1b6b45", color: "#fff" }}
                    >
                      <FileText className="w-3.5 h-3.5" /> Convention
                    </button>
                  </div>
                </div>
              </div>

              {/* Widget anniversaires prochains */}
              {prochainsAnniversaires.length > 0 && (
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="h-1 w-full bg-pink-400" />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                        <span className="text-base">🎂</span>
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        Anniversaires — 30 prochains jours
                        <span className="ml-2 text-xs font-semibold bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">{prochainsAnniversaires.length}</span>
                      </p>
                    </div>
                    <div className="space-y-2">
                      {prochainsAnniversaires.slice(0, 4).map(m => (
                        <div key={m.id} className="flex items-center gap-3">
                          <img
                            src={m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nom)}&background=064e3b&color=6ee7b7&size=32`}
                            alt={m.nom} className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{m.nom}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-bold text-pink-600">{m.dateStr}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {m.joursAvant === 0 ? "Aujourd'hui !" : m.joursAvant === 1 ? "Demain" : `dans ${m.joursAvant}j`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Widget membres dormants */}
              {membresDormants.length > 0 && (
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="h-1 w-full bg-slate-400" />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-slate-500" />
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        Membres dormants — {currentYear - 2} à {currentYear}
                        <span className="ml-2 text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{membresDormants.length}</span>
                      </p>
                      <button onClick={() => setTab("cotisations")} className="ml-auto text-xs font-semibold text-slate-600 hover:underline">Gérer →</button>
                    </div>
                    <div className="space-y-2">
                      {membresDormants.slice(0, 5).map(m => (
                        <div key={m.id} className="flex items-center gap-3">
                          <img
                            src={m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nom)}&background=475569&color=fff&size=32`}
                            alt={m.nom} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{m.nom}</p>
                          </div>
                          <span className="text-xs text-muted-foreground truncate flex-shrink-0">{m.profession || "—"}</span>
                        </div>
                      ))}
                    </div>
                    {membresDormants.length > 5 && (
                      <p className="text-xs text-muted-foreground mt-2">+{membresDormants.length - 5} autres membres dormants</p>
                    )}
                  </div>
                </div>
              )}

              {/* Répartition géo + Agenda combiné */}
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="h-1 w-full bg-cyan-500" />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-cyan-600" />
                      </div>
                      <p className="text-sm font-bold text-foreground">Répartition géographique</p>
                    </div>
                    <div className="space-y-2.5">
                      {repartitionGeo.map(({ pays, count, pct }) => (
                        <div key={pays}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-foreground truncate">{pays}</span>
                            <span className="text-muted-foreground ml-2 flex-shrink-0">{count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="h-1 w-full bg-violet-500" />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-violet-600" />
                      </div>
                      <p className="text-sm font-bold text-foreground">Agenda</p>
                    </div>
                    {agendaCombine.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">Aucune échéance à venir.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {agendaCombine.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === "event" ? "bg-indigo-50" : "bg-pink-50"}`}>
                              {item.type === "event"
                                ? <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                : <span className="text-xs">🎂</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{item.titre}</p>
                              <p className="text-xs text-muted-foreground truncate">{item.dateStr}{item.lieu ? ` · ${item.lieu}` : ""}</p>
                            </div>
                            {item.joursAvant !== null && (
                              <span className={`text-xs font-bold flex-shrink-0 ${item.joursAvant === 0 ? "text-red-500" : item.joursAvant <= 7 ? "text-amber-600" : "text-muted-foreground"}`}>
                                {item.joursAvant === 0 ? "Auj." : `J-${item.joursAvant}`}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

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
                  <div className="mt-4 pt-3 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Administration</p>
                    <button onClick={exportBackup}
                      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1">
                      <Download className="w-3 h-3" /> Backup JSON complet
                    </button>
                  </div>
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
                <button onClick={() => setAddingMember({ nom: "", profession: "", ville: "", pays: "", email: "", telephone: "", linkedin: "", anneeObtention: "", photo: "", notes_internes: "" })}
                  className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                  <Plus className="w-4 h-4" /> Ajouter
                </button>
                <button onClick={() => csvInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-4 h-10 rounded-xl border border-border bg-background text-sm font-medium hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                  <Upload className="w-4 h-4" /> Importer CSV
                </button>
                <button onClick={exportMembresExcel}
                  className="flex items-center gap-1.5 px-4 h-10 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-medium hover:bg-emerald-100 transition-colors text-emerald-700">
                  <Download className="w-4 h-4" /> Exporter Excel
                </button>
                <button onClick={() => genererTrombinoscope(allMembers)}
                  className="flex items-center gap-1.5 px-4 h-10 rounded-xl border border-indigo-200 bg-indigo-50 text-sm font-medium hover:bg-indigo-100 transition-colors text-indigo-700">
                  <Images className="w-4 h-4" /> Trombinoscope
                </button>
                <button onClick={() => setRenewDialog(true)}
                  className="flex items-center gap-1.5 px-4 h-10 rounded-xl border border-amber-200 bg-amber-50 text-sm font-medium hover:bg-amber-100 transition-colors text-amber-700"
                  title="Renouveler la date de validité de toutes les attestations">
                  <FileText className="w-4 h-4" /> Attestations
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
                    <div className="md:col-span-2">
                      <Field label="Notes internes (admin uniquement)">
                        <textarea className={inp} rows={2} placeholder="Notes confidentielles, visibles uniquement par l'admin…"
                          value={addingMember.notes_internes || ""}
                          onChange={e => setAddingMember(p => ({ ...p, notes_internes: e.target.value }))} />
                      </Field>
                    </div>
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
                    <div className="md:col-span-2">
                      <Field label="Notes internes (admin uniquement)">
                        <textarea className={inp} rows={2} placeholder="Notes confidentielles, visibles uniquement par l'admin…"
                          value={editingMember.notes_internes || ""}
                          onChange={e => setEditingMember(p => ({ ...p, notes_internes: e.target.value }))} />
                      </Field>
                    </div>
                  </div>
                </FormPanel>
              )}

              <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border px-5 py-3 grid grid-cols-[2fr_2fr_1fr_1fr_auto_auto] gap-4 items-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Membre</span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:block">Profession</span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider hidden lg:block">Localisation</span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Statut</span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider hidden xl:block">Cotis. {currentYear}</span>
                  <span></span>
                </div>
                <div className="divide-y divide-border/60">
                  {filteredMembers.map((m, i) => {
                    const cot = cotisationsAnnee.find(c => String(c.member_id) === String(m.id));
                    const cotStatut = cot?.statut ?? "en_attente";
                    const COT_CFG = {
                      "payé":       { label: "Payé",       cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
                      "partiel":    { label: "Partiel",    cls: "bg-blue-100 text-blue-700 border-blue-200" },
                      "en_attente": { label: "En attente", cls: "bg-amber-100 text-amber-700 border-amber-200" },
                      "exempté":    { label: "Exempté",    cls: "bg-slate-100 text-slate-600 border-slate-200" },
                    }[cotStatut] ?? { label: cotStatut, cls: "bg-muted text-muted-foreground border-border" };
                    return (
                    <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="group grid grid-cols-[2fr_2fr_1fr_1fr_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-primary/[0.03] transition-all relative">
                      <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary rounded-r scale-y-0 group-hover:scale-y-100 transition-transform" />
                      <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={() => setMemberDetail(m)}>
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-border group-hover:ring-primary/20 transition-all">
                          <img
                            src={m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nom)}&background=064e3b&color=6ee7b7&size=40`}
                            alt={m.nom} className="w-full h-full object-cover" style={{ objectPosition: "center 20%" }}
                            onError={e => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nom)}&background=064e3b&color=6ee7b7&size=40`; }} />
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
                      <div className="hidden xl:block">
                        <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full border ${COT_CFG.cls}`}>
                          {COT_CFG.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setAttestationDialog(m)} title="Attestation de membre"
                          className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-muted-foreground hover:text-amber-600 transition-colors">
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditingMember({ ...m })} className="w-7 h-7 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setConfirmDialog({ title: `Supprimer ${m.nom} ?`, message: "Cette action est irréversible.", onConfirm: () => { deleteMember(m.id); setConfirmDialog(null); } })} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </motion.div>
                    );
                  })}
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
          {tab === "sondages"    && <SondagesSection />}
          {tab === "cotisations" && <CotisationsSection members={allMembers} />}
          {tab === "rapport"     && <RapportAnnuel members={allMembers} />}
          {tab === "acces"       && <AccesSection />}

        </div>

        {/* Footer contenu */}
        <div className="fixed bottom-0 right-0 z-20"
          style={{ left: "16rem", background: "var(--brand-dark)" }}>
          <div className="flex items-center justify-between px-8 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div>
              <p className="text-xs font-bold text-white/70">Ma Belle Promo</p>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.30)" }}>FDD · Université de Lomé · Promotion 1994–2000</p>
            </div>
            <div className="flex items-center gap-8">
              <Link to="/" target="_blank" className="text-xs font-medium hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.45)" }}>Site public</Link>
              <button onClick={() => setTab("messages")} className="text-xs font-medium hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.45)" }}>Messages</button>
              <button onClick={() => setTab("membres")} className="text-xs font-medium hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.45)" }}>Membres</button>
              <button onClick={() => setTab("articles")} className="text-xs font-medium hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.45)" }}>Articles</button>
              <button onClick={() => setTab("evenements")} className="text-xs font-medium hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.45)" }}>Événements</button>
              <button onClick={() => setTab("galeries")} className="text-xs font-medium hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.45)" }}>Galeries</button>
            </div>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>© {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>

      <AttestationDialog
        member={attestationDialog}
        onConfirm={(validUntil) => { genererAttestation(attestationDialog, validUntil); setAttestationDialog(null); }}
        onCancel={() => setAttestationDialog(null)}
      />

      {/* Modale renouvellement attestations en masse */}
      {renewDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Renouveler toutes les attestations</h3>
                <p className="text-muted-foreground text-sm mt-0.5">{allMembers.length} membres · QR codes inchangés</p>
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                Nouvelle date de validité
              </label>
              <input type="date" value={renewDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={e => setRenewDate(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRenewDialog(false)} disabled={renewLoading}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-muted transition-colors disabled:opacity-50">
                Annuler
              </button>
              <button disabled={renewLoading} onClick={async () => {
                setRenewLoading(true);
                try {
                  const records = (allMembers ?? []).map(m => ({
                    ref: `ATT-${String(m.id).toUpperCase()}`,
                    member_id: String(m.id),
                    nom: m.nom,
                    statut: m.bureau ? "Membre du Bureau Exécutif" : "Membre actif",
                    profession: m.profession ?? null,
                    valid_until: renewDate,
                  }));
                  const { error } = await supabase.from("attestations").upsert(records, { onConflict: "ref" });
                  if (error) throw error;
                  toast.success(`${records.length} attestations renouvelées jusqu'au ${new Date(renewDate + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`);
                  setRenewDialog(false);
                } catch (err) {
                  toast.error("Erreur : " + err.message);
                } finally {
                  setRenewLoading(false);
                }
              }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors disabled:opacity-50">
                {renewLoading
                  ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Renouvellement…</>
                  : `Renouveler ${allMembers.length} attestations`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fiche détail membre ── */}
      {memberDetail && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setMemberDetail(null)} />
          <motion.div
            initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="w-96 bg-background shadow-2xl h-full overflow-y-auto flex flex-col border-l border-border">

            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-background z-10">
              <p className="font-heading font-bold text-foreground text-sm">Fiche membre</p>
              <button onClick={() => setMemberDetail(null)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 border-b border-border">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 ring-2 ring-border">
                  <img
                    src={memberDetail.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberDetail.nom)}&background=064e3b&color=6ee7b7&size=80`}
                    alt={memberDetail.nom} className="w-full h-full object-cover" style={{ objectPosition: "center 20%" }}
                    onError={e => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(memberDetail.nom)}&background=064e3b&color=6ee7b7&size=80`; }} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading font-bold text-foreground text-base leading-tight">{memberDetail.nom}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{memberDetail.profession || "—"}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${memberDetail.bureau ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${memberDetail.bureau ? "bg-amber-500" : "bg-green-500"}`} />
                      {memberDetail.bureau ? "Bureau" : "Membre actif"}
                    </span>
                    {memberDetail.anneeObtention && (
                      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                        Promo {memberDetail.anneeObtention}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-b border-border space-y-2.5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Contacts</p>
              {memberDetail.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <a href={`mailto:${memberDetail.email}`} className="text-sm text-foreground hover:text-primary truncate">{memberDetail.email}</a>
                </div>
              )}
              {(memberDetail.telephone || memberDetail.tel) && (
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 text-center text-xs flex-shrink-0">📞</span>
                  <span className="text-sm text-foreground">{memberDetail.telephone || memberDetail.tel}</span>
                </div>
              )}
              {(memberDetail.ville || memberDetail.pays) && (
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground">{[memberDetail.ville, memberDetail.pays].filter(Boolean).join(", ")}</span>
                </div>
              )}
              {memberDetail.linkedin && (
                <div className="flex items-center gap-2.5">
                  <Link2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <a href={memberDetail.linkedin} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline truncate">LinkedIn</a>
                </div>
              )}
              {memberDetail.anniversaire && (
                <div className="flex items-center gap-2.5">
                  <span className="text-xs flex-shrink-0">🎂</span>
                  <span className="text-sm text-foreground">{memberDetail.anniversaire}</span>
                </div>
              )}
            </div>

            <div className="p-5 border-b border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Cotisations récentes</p>
              <div className="space-y-2">
                {YEARS_3.map(yr => {
                  const cot = multiYearData[String(memberDetail.id)]?.[yr];
                  const s = cot?.statut ?? "en_attente";
                  const cfg = {
                    "payé":       { bg: "bg-emerald-100", text: "text-emerald-700", label: "Payé" },
                    "partiel":    { bg: "bg-blue-100",    text: "text-blue-700",    label: "Partiel" },
                    "en_attente": { bg: "bg-amber-100",   text: "text-amber-700",   label: "En attente" },
                    "exempté":    { bg: "bg-slate-100",   text: "text-slate-600",   label: "Exempté" },
                  }[s] ?? { bg: "bg-muted", text: "text-muted-foreground", label: s };
                  return (
                    <div key={yr} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{yr}</span>
                      <div className="flex items-center gap-2">
                        {cot?.montant > 0 && (
                          <span className="text-xs text-muted-foreground">{Number(cot.montant).toLocaleString("fr-FR")} F</span>
                        )}
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {memberDetail.notes_internes && (
              <div className="p-5 border-b border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Notes internes</p>
                <p className="text-sm text-foreground bg-amber-50 border border-amber-200 rounded-xl p-3 whitespace-pre-wrap">{memberDetail.notes_internes}</p>
              </div>
            )}

            <div className="p-5 flex gap-2 mt-auto sticky bottom-0 bg-background border-t border-border">
              <button onClick={() => { setAttestationDialog(memberDetail); setMemberDetail(null); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-sm font-semibold hover:bg-amber-100 transition-colors">
                <FileText className="w-3.5 h-3.5" /> Attestation
              </button>
              <button onClick={() => { setEditingMember({ ...memberDetail }); setMemberDetail(null); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold hover:bg-muted transition-colors">
                <Edit2 className="w-3.5 h-3.5" /> Modifier
              </button>
            </div>

          </motion.div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDialog}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        onConfirm={confirmDialog?.onConfirm}
        onCancel={() => setConfirmDialog(null)}
      />
    </div>
  );
}

