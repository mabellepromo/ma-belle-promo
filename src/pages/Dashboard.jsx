import { useState, useMemo, useRef, useEffect, lazy, Suspense } from "react";
import { toast } from "sonner";
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
  LogOut, AlertTriangle, Briefcase, Edit2, Trash2, Globe,
  UserCheck, Plus, Upload, Calendar, Tag,
  Link2, Download, MessageSquare, PenSquare, BookOpen, KeyRound, Banknote, BarChart2,
  Bell, Vote, Wallet, Building2, Send, TrendingUp, TrendingDown, Minus, Receipt, ShoppingBag, Zap, QrCode, Cake, Menu, ScrollText, Video, Sparkles, Handshake, ClipboardList, PenTool
} from "lucide-react";
import { FormPanel, ImgField, Field, inp } from "./dashboard/shared.jsx";
import ConfirmDialog from "../components/ConfirmDialog";
import AttestationDialog from "../components/AttestationDialog";
// ComposeModal est rendu hors onglets (bouton « Composer ») -> reste statique,
// ce qui charge aussi MessagesSection depuis le même module : on le garde statique.
import { MessagesSection, ComposeModal } from "./dashboard/MessagesSection.jsx";
import { useCotisations } from "../hooks/useCotisations";
import { useMultiYearCotisations } from "../hooks/useMultiYearCotisations";
import { useNotifications, requestNotificationPermission } from "../hooks/useNotifications";
import WorldMembersMap from "../components/dashboard/WorldMembersMap.jsx";

// ── Sections chargées à la demande (code-splitting) ──
// Chaque module n'est téléchargé qu'à l'ouverture de son onglet : la première
// ouverture du dashboard reste légère (important sur connexion mobile lente).
const AutomatisationsSection = lazy(() => import("./dashboard/AutomatisationsSection.jsx"));
const AccesSection           = lazy(() => import("./dashboard/AccesSection.jsx"));
const CotisationsSection     = lazy(() => import("./dashboard/CotisationsSection.jsx"));
const RapportAnnuel          = lazy(() => import("./dashboard/RapportAnnuel.jsx"));
const SondagesSection        = lazy(() => import("./dashboard/SondagesSection"));
const TresorerieSection      = lazy(() => import("./dashboard/TresorerieSection"));
const AssembleesSection      = lazy(() => import("./dashboard/AssembleesSection"));
const CirculaireSection      = lazy(() => import("./dashboard/CirculaireSection"));
const CourrierSection        = lazy(() => import("./dashboard/CourrierSection"));
const BulkEmailSection       = lazy(() => import("./dashboard/BulkEmailSection"));
const NewsletterEmailSection = lazy(() => import("./dashboard/NewsletterEmailSection"));
const StatsSection           = lazy(() => import("./dashboard/StatsSection"));
const ElectionsSection       = lazy(() => import("./dashboard/ElectionsSection"));
const MandatsSection         = lazy(() => import("./dashboard/MandatsSection"));
const FacturesSection        = lazy(() => import("./dashboard/FacturesSection"));
const VentesSection          = lazy(() => import("./dashboard/VentesSection"));
const RegistreLegalSection   = lazy(() => import("./dashboard/RegistreLegalSection"));
const BenevolesSection       = lazy(() => import("./dashboard/BenevolesSection"));
const CheckinSection         = lazy(() => import("./dashboard/CheckinSection"));
const WebinarsSection        = lazy(() => import("./dashboard/WebinarsSection"));
const AssistantIA            = lazy(() => import("./dashboard/AssistantIA"));
const ConventionsSection     = lazy(() => import("./dashboard/ConventionsSection.jsx"));
const OpportunitesSection    = lazy(() => import("./dashboard/OpportunitesSection.jsx"));
const MemoireSection         = lazy(() => import("./dashboard/MemoireSection.jsx"));
const SignaturesSection      = lazy(() => import("./dashboard/SignaturesSection.jsx"));

// CrudSections regroupe 11 sections dans un seul fichier : on charge ce module
// une seule fois, au premier de ces onglets ouvert.
const ArticlesSection    = lazy(() => import("./dashboard/CrudSections.jsx").then(m => ({ default: m.ArticlesSection })));
const EvenementsSection  = lazy(() => import("./dashboard/CrudSections.jsx").then(m => ({ default: m.EvenementsSection })));
const ProjetsSection     = lazy(() => import("./dashboard/CrudSections.jsx").then(m => ({ default: m.ProjetsSection })));
const ProgrammesSection  = lazy(() => import("./dashboard/CrudSections.jsx").then(m => ({ default: m.ProgrammesSection })));
const EquipeSection      = lazy(() => import("./dashboard/CrudSections.jsx").then(m => ({ default: m.EquipeSection })));
const SponsorsSection    = lazy(() => import("./dashboard/CrudSections.jsx").then(m => ({ default: m.SponsorsSection })));
const CommuniquesSection = lazy(() => import("./dashboard/CrudSections.jsx").then(m => ({ default: m.CommuniquesSection })));
const MediathequeSection = lazy(() => import("./dashboard/CrudSections.jsx").then(m => ({ default: m.MediathequeSection })));
const DocumentsSection   = lazy(() => import("./dashboard/CrudSections.jsx").then(m => ({ default: m.DocumentsSection })));
const RessourcesSection  = lazy(() => import("./dashboard/CrudSections.jsx").then(m => ({ default: m.RessourcesSection })));
const GaleriesSection    = lazy(() => import("./dashboard/CrudSections.jsx").then(m => ({ default: m.GaleriesSection })));

// Spinner affiché le temps qu'une section se télécharge.
function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );
}

export default function Dashboard() {
  const { session, logout } = useLocalAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const nav = sidebarNavRef.current;
    if (!nav) return;
    const onWheel = (e) => {
      e.stopPropagation();
      e.preventDefault();
      nav.scrollTop += e.deltaY;
    };
    nav.addEventListener("wheel", onWheel, { passive: false });
    return () => nav.removeEventListener("wheel", onWheel);
  }, []);

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

  const sidebarNavRef = useRef(null);

  const [tab,                setTab]               = useState("overview");
  const [sidebarOpen,        setSidebarOpen]       = useState(false);
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
  const [tresoWidget,    setTresoWidget]    = useState(null);
  const [prochaineAG,   setProchaineAG]   = useState(null);
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

  useEffect(() => {
    async function fetchWidgets() {
      const yr = new Date().getFullYear();
      const [tresoRes, agRes] = await Promise.all([
        supabase
          .from("tresorerie_transactions")
          .select("type, montant")
          .eq("annee", yr),
        supabase
          .from("assemblees")
          .select("id, titre, date, lieu")
          .eq("statut", "planifiee")
          .gte("date", new Date().toISOString().slice(0, 10))
          .order("date", { ascending: true })
          .limit(1),
      ]);
      if (tresoRes.data) {
        const recettes = tresoRes.data.filter(r => r.type === "recette").reduce((s, r) => s + (r.montant || 0), 0);
        const depenses = tresoRes.data.filter(r => r.type === "depense").reduce((s, r) => s + (r.montant || 0), 0);
        setTresoWidget({ recettes, depenses, solde: recettes - depenses, annee: yr });
      }
      setProchaineAG(agRes.data?.[0] ?? null);
    }
    fetchWidgets();
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
   
  }, [allMembers, multiYearData]);

  const repartitionGeo = useMemo(() => {
    const counts = {};
    (allMembers ?? []).forEach(m => {
      const key = m.pays?.trim() || "Non renseigné";
      counts[key] = (counts[key] || 0) + 1;
    });
    const total = allMembers.length || 1;
    // On renvoie tous les pays (la carte mondiale les exploite tous) triés par effectif décroissant
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([pays, count]) => ({ pays, count, pct: Math.round((count / total) * 100) }));
  }, [allMembers]);

  /*
   * Indicateurs décisionnels (pilotage). Tous calculés depuis des données RÉELLES :
   *   - cotisations : profondeur historique réelle (annee + statut sur 3 ans via multiYearData)
   *   - created_at  : ATTENTION, les 48 membres ont été importés le même jour (base44).
   *     Le delta « nouveaux ce mois » vaut donc 0 aujourd'hui ; il deviendra exact dès les
   *     prochaines validations. On l'affiche tel quel — aucune valeur inventée.
   */
  const pilotage = useMemo(() => {
    const md    = multiYearData || {};
    const total = allMembers?.length || 0;
    const statut = (m, yr) => md[String(m.id)]?.[yr]?.statut;

    // Taux de cotisation d'une année donnée (payés / effectif hors exemptés)
    const tauxYear = (yr) => {
      const exempts = (allMembers ?? []).filter(m => statut(m, yr) === "exempté").length;
      const payes   = (allMembers ?? []).filter(m => statut(m, yr) === "payé").length;
      const effectif = total - exempts;
      return { payes, exempts, effectif, taux: effectif > 0 ? Math.round((payes / effectif) * 100) : 0 };
    };

    // Cotisations en retard sur l'année courante (ni payé ni exempté)
    const cur      = tauxYear(currentYear);
    const enRetard = Math.max(0, cur.effectif - cur.payes);
    const retardPct = cur.effectif > 0 ? Math.round((enRetard / cur.effectif) * 100) : 0;

    // Taux d'engagement (métrique documentée) : part des membres ayant payé OU partiellement
    // payé au moins une cotisation sur les 3 dernières années. C'est l'inverse des « dormants ».
    const engagedCount = (allMembers ?? []).filter(m =>
      [currentYear - 2, currentYear - 1, currentYear].some(
        yr => statut(m, yr) === "payé" || statut(m, yr) === "partiel"
      )
    ).length;
    const engagementPct = total > 0 ? Math.round((engagedCount / total) * 100) : 0;

    // Évolution du taux de cotisation vs année précédente (seul delta historiquement fiable)
    const prev      = tauxYear(currentYear - 1);
    const tauxDelta = cur.taux - prev.taux;

    // Nouveaux membres ce mois (created_at réel — vaut 0 tant qu'aucune validation récente)
    const now = new Date();
    const nouveauxMois = (allMembers ?? []).filter(m => {
      if (!m.created_at) return false;
      const d = new Date(m.created_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;

    return {
      total, enRetard, retardPct, engagementPct, engagedCount,
      tauxCur: cur.taux, tauxPrev: prev.taux, tauxDelta, nouveauxMois,
    };
   
  }, [allMembers, multiYearData, currentYear]);

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
      const [
        members_, cotisations_, articles_, evenements_, sondages_,
        tresoTx_, tresoBudget_, tresoRemb_, tresoSub_,
        elections_, candidats_, elecVotes_, mandats_,
        assemblees_, agPresences_, agResolutions_,
        factures_, commandes_, messages_,
        circulaires_, benevoles_, missions_, heures_,
        registreDocs_, registreConflits_,
        presences_, sondageSoumissions_, sondageReponses_,
      ] = await Promise.all([
        supabase.from("members").select("*"),
        supabase.from("cotisations").select("*"),
        supabase.from("articles").select("*"),
        supabase.from("evenements").select("*"),
        supabase.from("sondages").select("*"),
        supabase.from("tresorerie_transactions").select("*"),
        supabase.from("tresorerie_budget").select("*"),
        supabase.from("tresorerie_remboursements").select("*"),
        supabase.from("tresorerie_subventions").select("*"),
        supabase.from("elections").select("*"),
        supabase.from("election_candidats").select("*"),
        supabase.from("election_votes").select("*"),
        supabase.from("mandats").select("*"),
        supabase.from("assemblees").select("*"),
        supabase.from("assemblee_presences").select("*"),
        supabase.from("assemblee_resolutions").select("*"),
        supabase.from("factures").select("*"),
        supabase.from("commandes").select("*"),
        supabase.from("messages").select("*"),
        supabase.from("circulaires").select("*"),
        supabase.from("benevoles").select("*"),
        supabase.from("missions_benevoles").select("*"),
        supabase.from("heures_benevoles").select("*"),
        supabase.from("registre_documents_legaux").select("*"),
        supabase.from("registre_conflits").select("*"),
        supabase.from("evenement_presences").select("*"),
        supabase.from("sondage_soumissions").select("*"),
        supabase.from("sondage_reponses").select("*"),
      ]);
      const backup = {
        exportedAt: new Date().toISOString(),
        version: "3.0",
        project: "Association FDD Ma Belle Promo (MBP)",
        data: {
          members:                    members_.data              ?? [],
          cotisations:                cotisations_.data          ?? [],
          articles:                   articles_.data             ?? [],
          evenements:                 evenements_.data           ?? [],
          evenement_presences:        presences_.data            ?? [],
          sondages:                   sondages_.data             ?? [],
          sondage_soumissions:        sondageSoumissions_.data   ?? [],
          sondage_reponses:           sondageReponses_.data      ?? [],
          tresorerie_transactions:    tresoTx_.data              ?? [],
          tresorerie_budget:          tresoBudget_.data          ?? [],
          tresorerie_remboursements:  tresoRemb_.data            ?? [],
          tresorerie_subventions:     tresoSub_.data             ?? [],
          elections:                  elections_.data            ?? [],
          election_candidats:         candidats_.data            ?? [],
          election_votes:             elecVotes_.data            ?? [],
          mandats:                    mandats_.data              ?? [],
          assemblees:                 assemblees_.data           ?? [],
          assemblee_presences:        agPresences_.data          ?? [],
          assemblee_resolutions:      agResolutions_.data        ?? [],
          factures:                   factures_.data             ?? [],
          commandes:                  commandes_.data            ?? [],
          messages:                   messages_.data             ?? [],
          circulaires:                circulaires_.data          ?? [],
          benevoles:                  benevoles_.data            ?? [],
          missions_benevoles:         missions_.data             ?? [],
          heures_benevoles:           heures_.data               ?? [],
          registre_documents_legaux:  registreDocs_.data         ?? [],
          registre_conflits:          registreConflits_.data     ?? [],
        },
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json;charset=utf-8;" });
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement("a"), { href: url, download: `mbp-backup-${new Date().toISOString().slice(0, 10)}.json` });
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Backup v3.0 téléchargé — ${Object.keys(backup.data).length} tables exportées !`);
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

  // Accès réservé au bureau de l'association (admin ou bureau)
  if (!session || (session.role !== "admin" && session.role !== "bureau")) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Accès refusé</h2>
          <p className="text-muted-foreground mb-6">Tableau de bord réservé au bureau de l'association.</p>
          <button onClick={() => navigate("/login")}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-semibold text-sm">
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Membres",    value: allMembers.length,     icon: Users,        color: "bg-blue-500/15 text-blue-400",   sub: `${allMembers.filter(m => m.bureau).length} au bureau`, trend: { value: pilotage.nouveauxMois, label: "ce mois" }, onClick: () => setTab("membres") },
    { label: "En attente", value: pendingMembers.length, icon: Clock,        color: "bg-amber-500/15 text-amber-400", sub: "à valider", alert: pendingMembers.length > 0, onClick: () => setTab("pending") },
    { label: "Articles",   value: articles.length, icon: FileText, color: "bg-emerald-500/15 text-emerald-400", sub: "publications", onClick: () => setTab("articles") },
    { label: "Événements", value: evenements.length, icon: Calendar, color: "bg-indigo-500/15 text-indigo-400", sub: "planifiés", onClick: () => setTab("evenements") },
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
        { key: "webinaires",  label: "Webinaires",  icon: Video    },
        { key: "checkin",     label: "Check-in QR", icon: QrCode   },
        { key: "projets",     label: "Projets",     icon: Star },
        { key: "programmes",  label: "Programmes",  icon: Tag },
        { key: "communiques", label: "Communiqués", icon: Mail },
        { key: "sondages",    label: "Sondages",    icon: Vote },
        { key: "opportunites", label: "Opportunités", icon: Briefcase },
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
        { key: "equipe",      label: "Équipe",       icon: UserCheck },
        { key: "sponsors",    label: "Partenaires",  icon: Globe },
        { key: "conventions", label: "Conventions",  icon: Handshake },
        { key: "signatures",  label: "Signatures",   icon: PenTool },
        { key: "ventes",      label: "Ventes",       icon: ShoppingBag },
        { key: "tresorerie",  label: "Trésorerie",   icon: Wallet },
        { key: "factures",    label: "Factures",     icon: Receipt },
        { key: "assemblees",    label: "Assemblées",     icon: Building2 },
        { key: "elections",     label: "Élections",      icon: Vote },
        { key: "mandats",       label: "Mandats",        icon: Shield },
        { key: "registre",      label: "Registre légal", icon: BookOpen },
        { key: "memoire",       label: "Mémoire / Passation", icon: ClipboardList },
        { key: "benevoles",     label: "Bénévoles",      icon: Briefcase },
      ],
    },
    {
      label: "Communication",
      items: [
        { key: "circulaire",      label: "Circulaire",      icon: Send },
        { key: "courrier",        label: "Courrier",        icon: ScrollText },
        { key: "bulk-email",      label: "Email de masse",  icon: Mail },
        { key: "newsletter-email", label: "Newsletter",      icon: UserCheck },
        { key: "stats",           label: "Statistiques",    icon: TrendingUp },
        { key: "automatisations", label: "Automatisations", icon: Zap },
        { key: "assistant-ia",    label: "Assistant IA",    icon: Sparkles },
      ],
    },
  ];

  const allNavItems = NAV_GROUPS.flatMap(g => g.items);
  const currentNavItem = allNavItems.find(i => i.key === tab);
  const CurrentIcon = currentNavItem?.icon || LayoutDashboard;

  const STAT_COLORS = [
    { bar: "bg-blue-500",    iconBg: "bg-blue-500/15",    iconCl: "text-blue-400" },
    { bar: "bg-amber-500",   iconBg: "bg-amber-500/15",   iconCl: "text-amber-400" },
    { bar: "bg-emerald-500", iconBg: "bg-emerald-500/15", iconCl: "text-emerald-400" },
    { bar: "bg-indigo-500",  iconBg: "bg-indigo-500/15",  iconCl: "text-indigo-400" },
  ];

  return (
    <div className="dark h-screen flex overflow-hidden bg-[#4a4a4a] text-foreground">

      {compose && (
        <ComposeModal
          initialAttachment={pendingAttachment}
          onClose={() => { setCompose(false); setPendingAttachment(null); }}
        />
      )}

      {/* Backdrop mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 flex flex-col bg-card border-r border-border transition-transform duration-200 md:static md:translate-x-0 md:flex md:flex-shrink-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>

        {/* Logo */}
        <div className="px-4 pt-5 pb-4 flex-shrink-0 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary">
              <span className="text-[10px] font-black text-primary-foreground tracking-tight">MBP</span>
            </div>
            <div className="min-w-0">
              <p className="font-heading font-bold text-sm text-foreground leading-tight">Ma Belle Promo</p>
              <p className="text-[10px] text-muted-foreground">Admin · FDD Lomé</p>
            </div>
          </div>
        </div>

        {/* Composer */}
        <div className="px-3 py-3 flex-shrink-0">
          <button onClick={() => setCompose(true)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98]">
            <PenSquare className="w-3.5 h-3.5" /> Composer
          </button>
        </div>

        {/* Navigation */}
        <nav
          ref={sidebarNavRef}
          className="overflow-y-auto px-2 pb-4"
          style={{ maxHeight: "calc(100vh - 195px)" }}>
          {NAV_GROUPS.map((group, gi) => {
            const groupColors = [null, "text-blue-400", "text-violet-400", "text-amber-400", "text-emerald-400", "text-pink-400"];
            const gc = groupColors[gi] || "text-muted-foreground";
            return (
              <div key={gi} className={gi > 0 ? "mt-5" : ""}>
                {group.label && (
                  <p className={`px-3 pb-1.5 text-[9px] font-black uppercase tracking-[0.18em] ${gc}`}>
                    {group.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {group.items.map(({ key, label, icon: Icon, badge, badgeAlert }) => {
                    const active = tab === key;
                    return (
                      <button key={key} onClick={() => { setTab(key); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all text-left relative ${
                          active
                            ? "bg-primary/15 text-primary font-semibold"
                            : "text-muted-foreground hover:bg-muted/40 hover:text-foreground font-normal"
                        }`}>
                        {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-primary rounded-r-full" />}
                        <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-primary" : "opacity-50"}`} />
                        <span className="flex-1 truncate">{label}</span>
                        {badge != null && badge > 0 && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                            badgeAlert ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"
                          }`}>{badge}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Profil */}
        <div className="flex-shrink-0 px-3 pb-4 pt-3 border-t border-border">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-muted/30 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/15">
              <Shield className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate leading-tight">{session?.email?.split("@")[0]}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{session?.role || "admin"}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Link to="/" target="_blank"
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all">
              <Globe className="w-3 h-3" /> Site
            </Link>
            <button onClick={() => { logout(); navigate("/login"); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut className="w-3 h-3" /> Quitter
            </button>
          </div>
        </div>
      </aside>

      {/* ── CONTENU ── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Topbar */}
        <div className="flex-shrink-0 h-14 flex items-center justify-between px-4 md:px-8 bg-card border-b border-border">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-lg hover:bg-muted/40 text-foreground" onClick={() => setSidebarOpen(v => !v)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/10">
              <CurrentIcon className="w-3.5 h-3.5 text-primary" />
            </div>
            <h2 className="font-heading font-bold text-foreground text-sm tracking-wide">
              {currentNavItem?.label || "Vue d'ensemble"}
            </h2>
            {pendingMembers.length > 0 && tab !== "pending" && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
                {pendingMembers.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {unreadCount > 0 && tab !== "messages" && (
              <button onClick={() => setTab("messages")}
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                <MessageSquare className="w-3.5 h-3.5" /> {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
              </button>
            )}
            <p className="text-[11px] text-muted-foreground">
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-16">

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
                  <p className="text-sm mt-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>L'association Ma Belle Promo (MBP) · Lomé, Togo · Promotion 1994–2000</p>
                </div>
              </div>

              {/* Notifications navigateur */}
              {notifPermission !== "granted" && notifPermission !== "unsupported" && (
                <div className="flex items-center gap-3 bg-emerald-700/40 border border-emerald-600/50 rounded-2xl px-5 py-3.5">
                  <Bell className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <p className="text-sm text-emerald-200 flex-1">
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
                      className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                      Activer
                    </button>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, sub, alert, trend, onClick }, i) => (
                  <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    onClick={onClick}
                    className={`bg-card rounded-2xl overflow-hidden border border-border shadow-sm group ${onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200" : ""}`}>
                    <div className={`h-1 w-full ${STAT_COLORS[i].bar}`} />
                    <div className="p-5">
                      {alert && <span className="float-right w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1" />}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${STAT_COLORS[i].iconBg}`}>
                        <Icon className={`w-4 h-4 ${STAT_COLORS[i].iconCl}`} />
                      </div>
                      <div className="font-heading text-3xl font-black tracking-tight text-foreground">{value}</div>
                      <div className="text-sm font-semibold mt-0.5 text-foreground">{label}</div>
                      <div className="text-xs mt-0.5 text-muted-foreground">{sub}</div>
                      {trend && (
                        <div className={`flex items-center gap-1 text-xs font-semibold mt-1 ${trend.value > 0 ? "text-emerald-400" : "text-muted-foreground"}`}>
                          {trend.value > 0 ? <TrendingUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          {trend.value > 0 ? `+${trend.value}` : trend.value} {trend.label}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Indicateurs décisionnels — du constat à la décision */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(() => {
                  const retardAlerte = pilotage.retardPct > 50 ? "rouge" : pilotage.retardPct > 30 ? "ambre" : "ok";
                  const retardCls = retardAlerte === "rouge"
                    ? "border-red-500/30 bg-red-500/5"
                    : retardAlerte === "ambre"
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-border";
                  const retardTxt = retardAlerte === "rouge"
                    ? "text-red-400"
                    : retardAlerte === "ambre" ? "text-amber-400" : "text-foreground";
                  const engageBas = pilotage.engagementPct < 50;
                  return (
                    <>
                      {/* Cotisations en retard */}
                      <div className={`rounded-2xl border p-4 shadow-sm bg-card ${retardCls}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className={`w-4 h-4 ${retardTxt}`} />
                          <p className="text-xs font-semibold text-muted-foreground">Cotisations en retard {currentYear}</p>
                        </div>
                        <div className={`font-heading text-2xl font-black ${retardTxt}`}>{pilotage.retardPct}%</div>
                        <p className="text-xs text-muted-foreground mt-0.5">{pilotage.enRetard} membre{pilotage.enRetard > 1 ? "s" : ""} concerné{pilotage.enRetard > 1 ? "s" : ""}</p>
                      </div>

                      {/* Taux d'engagement */}
                      <div className={`rounded-2xl border p-4 shadow-sm bg-card ${engageBas ? "border-amber-500/30 bg-amber-500/5" : "border-border"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Users className={`w-4 h-4 ${engageBas ? "text-amber-400" : "text-emerald-400"}`} />
                          <p className="text-xs font-semibold text-muted-foreground" title="Part des membres ayant payé ou partiellement payé au moins une cotisation sur les 3 dernières années.">
                            Taux d'engagement (3 ans)
                          </p>
                        </div>
                        <div className={`font-heading text-2xl font-black ${engageBas ? "text-amber-400" : "text-emerald-400"}`}>{pilotage.engagementPct}%</div>
                        <p className="text-xs text-muted-foreground mt-0.5">{pilotage.engagedCount} / {pilotage.total} membres actifs</p>
                      </div>

                      {/* Évolution du taux de cotisation */}
                      <div className="rounded-2xl border border-border p-4 shadow-sm bg-card">
                        <div className="flex items-center gap-2 mb-1">
                          <BarChart2 className="w-4 h-4 text-cyan-400" />
                          <p className="text-xs font-semibold text-muted-foreground">Cotisations vs {currentYear - 1}</p>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <div className="font-heading text-2xl font-black text-foreground">{pilotage.tauxCur}%</div>
                          <span className={`flex items-center gap-0.5 text-xs font-semibold ${pilotage.tauxDelta > 0 ? "text-emerald-400" : pilotage.tauxDelta < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                            {pilotage.tauxDelta > 0 ? <TrendingUp className="w-3 h-3" /> : pilotage.tauxDelta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                            {pilotage.tauxDelta > 0 ? `+${pilotage.tauxDelta}` : pilotage.tauxDelta} pts
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">contre {pilotage.tauxPrev}% l'an dernier</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {pendingMembers.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <h3 className="font-semibold text-amber-300">{pendingMembers.length} demande{pendingMembers.length > 1 ? "s" : ""} en attente</h3>
                    <button onClick={() => setTab("pending")} className="ml-auto text-sm text-amber-400 font-semibold hover:underline">Voir tout →</button>
                  </div>
                  {pendingMembers.slice(0, 2).map(m => (
                    <div key={m.id} className="flex items-center justify-between bg-card rounded-xl p-3 border border-border mb-2">
                      <div><p className="font-semibold text-sm text-foreground">{m.nom}</p><p className="text-xs text-muted-foreground">{m.profession} · {m.ville}</p></div>
                      <div className="flex gap-2">
                        <button onClick={() => rejectMember(m.id)} className="w-7 h-7 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/20"><X className="w-3.5 h-3.5" /></button>
                        <button onClick={() => validateMember(m)} className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20"><Check className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cotisations + Prochain événement */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Taux de cotisation */}
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="h-1 w-full bg-emerald-500" />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                          <Banknote className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Cotisations {currentYear}</p>
                          <p className="text-xs text-muted-foreground">{cotStats.payes} / {cotStats.total} membres</p>
                        </div>
                      </div>
                      <span className="font-heading text-2xl font-black text-emerald-400">{cotStats.taux}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${cotStats.taux}%` }} />
                    </div>
                    <button onClick={() => setTab("cotisations")}
                      className="mt-3 text-xs font-semibold text-emerald-400 hover:underline">
                      Gérer les cotisations →
                    </button>
                  </div>
                </div>

                {/* Prochain événement */}
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="h-1 w-full bg-indigo-500" />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-indigo-400" />
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
                      className="mt-3 text-xs font-semibold text-indigo-400 hover:underline">
                      Gérer les événements →
                    </button>
                  </div>
                </div>
              </div>

              {/* Trésorerie + Prochaine AG */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Solde trésorerie */}
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="h-1 w-full bg-amber-500" />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Trésorerie {tresoWidget?.annee ?? currentYear}</p>
                        <p className="text-xs text-muted-foreground">Recettes · Dépenses</p>
                      </div>
                    </div>
                    {tresoWidget ? (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Recettes</span>
                          <span className="text-emerald-400 font-semibold">
                            +{new Intl.NumberFormat("fr-FR").format(tresoWidget.recettes)} FCFA
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Dépenses</span>
                          <span className="text-red-400 font-semibold">
                            −{new Intl.NumberFormat("fr-FR").format(tresoWidget.depenses)} FCFA
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-bold border-t border-border pt-1 mt-1">
                          <span>Solde</span>
                          <span className={tresoWidget.solde >= 0 ? "text-emerald-400" : "text-red-400"}>
                            {new Intl.NumberFormat("fr-FR").format(tresoWidget.solde)} FCFA
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Aucune transaction enregistrée.</p>
                    )}
                    <button onClick={() => setTab("tresorerie")}
                      className="mt-3 text-xs font-semibold text-amber-400 hover:underline">
                      Gérer la trésorerie →
                    </button>
                  </div>
                </div>

                {/* Prochaine AG */}
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="h-1 w-full bg-violet-500" />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-violet-400" />
                      </div>
                      <p className="text-sm font-bold text-foreground">Prochaine Assemblée</p>
                    </div>
                    {prochaineAG ? (
                      <>
                        <p className="font-semibold text-foreground text-sm leading-snug">{prochaineAG.titre}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(prochaineAG.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                          {prochaineAG.lieu ? ` · ${prochaineAG.lieu}` : ""}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Aucune assemblée planifiée.</p>
                    )}
                    <button onClick={() => setTab("assemblees")}
                      className="mt-3 text-xs font-semibold text-violet-400 hover:underline">
                      Gérer les assemblées →
                    </button>
                  </div>
                </div>
              </div>

              {/* Convention de partenariat */}
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="h-1 w-full" style={{ background: "linear-gradient(to right, #1b6b45, #9a7118)" }} />
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/15">
                      <FileText className="w-4 h-4 text-primary" />
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
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="h-1 w-full bg-pink-400" />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-pink-500/15 flex items-center justify-center">
                        <Cake className="w-4 h-4 text-pink-400" />
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        Anniversaires — 30 prochains jours
                        <span className="ml-2 text-xs font-semibold bg-pink-100 text-pink-400 px-2 py-0.5 rounded-full">{prochainsAnniversaires.length}</span>
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
                            <p className="text-xs font-bold text-pink-400">{m.dateStr}</p>
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
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="h-1 w-full bg-muted-foreground/50" />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        Membres dormants — {currentYear - 2} à {currentYear}
                        <span className="ml-2 text-xs font-semibold bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-full">{membresDormants.length}</span>
                      </p>
                      <button onClick={() => setTab("cotisations")} className="ml-auto text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline">Gérer →</button>
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
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="h-1 w-full bg-cyan-500" />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-cyan-400" />
                      </div>
                      <p className="text-sm font-bold text-foreground">Rayonnement géographique</p>
                    </div>
                    <WorldMembersMap data={repartitionGeo} />
                  </div>
                </div>

                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="h-1 w-full bg-violet-500" />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-violet-400" />
                      </div>
                      <p className="text-sm font-bold text-foreground">Agenda</p>
                    </div>
                    {agendaCombine.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">Aucune échéance à venir.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {agendaCombine.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === "event" ? "bg-indigo-500/15" : "bg-pink-500/15"}`}>
                              {item.type === "event"
                                ? <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                : <Cake className="w-3.5 h-3.5 text-pink-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{item.titre}</p>
                              <p className="text-xs text-muted-foreground truncate">{item.dateStr}{item.lieu ? ` · ${item.lieu}` : ""}</p>
                            </div>
                            {item.joursAvant !== null && (
                              <span className={`text-xs font-bold flex-shrink-0 ${item.joursAvant === 0 ? "text-red-400" : item.joursAvant <= 7 ? "text-amber-400" : "text-muted-foreground"}`}>
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
                  className="flex items-center gap-1.5 px-4 h-10 rounded-xl border border-emerald-500/25 bg-emerald-500/15 text-sm font-medium hover:bg-emerald-100 transition-colors text-emerald-400">
                  <Download className="w-4 h-4" /> Exporter Excel
                </button>
                <button onClick={() => genererTrombinoscope(allMembers)}
                  className="flex items-center gap-1.5 px-4 h-10 rounded-xl border border-indigo-500/25 bg-indigo-500/15 text-sm font-medium hover:bg-indigo-100 transition-colors text-indigo-400">
                  <Images className="w-4 h-4" /> Trombinoscope
                </button>
                <button onClick={() => setRenewDialog(true)}
                  className="flex items-center gap-1.5 px-4 h-10 rounded-xl border border-amber-500/25 bg-amber-500/15 text-sm font-medium hover:bg-amber-100 transition-colors text-amber-400"
                  title="Renouveler la date de validité de toutes les attestations">
                  <FileText className="w-4 h-4" /> Attestations
                </button>
                <input ref={csvInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleCsvUpload} />
                {!isSeeded && (
                  <button onClick={seedFromStatic} disabled={memberSaving}
                    className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 text-sm font-semibold hover:bg-amber-100 transition-colors disabled:opacity-60">
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
                      "payé":       { label: "Payé",       cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
                      "partiel":    { label: "Partiel",    cls: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
                      "en_attente": { label: "En attente", cls: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
                      "exempté":    { label: "Exempté",    cls: "bg-muted/60 text-muted-foreground border-border" },
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
                          m.bureau ? "bg-amber-500/15 text-amber-400 border border-amber-500/25" :
                          m.status === "validated" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" :
                          "bg-primary/8 text-primary border border-primary/15"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${m.bureau ? "bg-amber-500" : m.status === "validated" ? "bg-emerald-500" : "bg-primary"}`} />
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
                          className="w-7 h-7 rounded-lg hover:bg-amber-500/15 flex items-center justify-center text-muted-foreground hover:text-amber-400 transition-colors">
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditingMember({ ...m })} className="w-7 h-7 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setConfirmDialog({ title: `Supprimer ${m.nom} ?`, message: "Cette action est irréversible.", onConfirm: () => { deleteMember(m.id); setConfirmDialog(null); } })} className="w-7 h-7 rounded-lg hover:bg-red-500/15 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 text-sm font-semibold hover:bg-red-100">
                      <X className="w-4 h-4" /> Rejeter
                    </button>
                    <button onClick={() => validateMember(m)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm font-semibold hover:bg-green-100">
                      <Check className="w-4 h-4" /> Valider
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <Suspense fallback={<SectionLoader />}>
          {tab === "messages"    && <MessagesSection />}
          {tab === "articles"    && <ArticlesSection />}
          {tab === "evenements"  && <EvenementsSection />}
          {tab === "webinaires"  && <WebinarsSection />}
          {tab === "checkin"     && <CheckinSection />}
          {tab === "projets"     && <ProjetsSection />}
          {tab === "programmes"  && <ProgrammesSection />}
          {tab === "equipe"      && <EquipeSection />}
          {tab === "sponsors"    && <SponsorsSection />}
          {tab === "conventions" && <ConventionsSection />}
          {tab === "opportunites" && <OpportunitesSection />}
          {tab === "memoire"     && <MemoireSection />}
          {tab === "signatures"  && <SignaturesSection />}
          {tab === "ventes"      && <VentesSection />}
          {tab === "tresorerie"  && <TresorerieSection />}
          {tab === "factures"    && <FacturesSection />}
          {tab === "assemblees"  && <AssembleesSection />}
          {tab === "registre"    && <RegistreLegalSection />}
          {tab === "benevoles"   && <BenevolesSection />}
          {tab === "elections"   && <ElectionsSection />}
          {tab === "mandats"     && <MandatsSection />}
          {tab === "circulaire"      && <CirculaireSection />}
          {tab === "courrier"        && <CourrierSection />}
          {tab === "bulk-email"       && <BulkEmailSection />}
          {tab === "newsletter-email" && <NewsletterEmailSection />}
          {tab === "stats"           && <StatsSection />}
          {tab === "automatisations" && <AutomatisationsSection />}
          {tab === "assistant-ia"    && <AssistantIA />}
          {tab === "communiques" && <CommuniquesSection />}
          {tab === "mediatheque" && <MediathequeSection />}
          {tab === "documents"   && <DocumentsSection />}
          {tab === "galeries"    && <GaleriesSection />}
          {tab === "ressources"  && <RessourcesSection />}
          {tab === "sondages"    && <SondagesSection />}
          {tab === "cotisations" && <CotisationsSection members={allMembers} />}
          {tab === "rapport"     && <RapportAnnuel members={allMembers} />}
          {tab === "acces"       && <AccesSection />}
          </Suspense>

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
                <FileText className="w-5 h-5 text-amber-400" />
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
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${memberDetail.bureau ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${memberDetail.bureau ? "bg-amber-500" : "bg-emerald-500"}`} />
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
                  <Cake className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
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
                    "payé":       { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Payé" },
                    "partiel":    { bg: "bg-blue-500/15",    text: "text-blue-400",    label: "Partiel" },
                    "en_attente": { bg: "bg-amber-500/15",   text: "text-amber-400",   label: "En attente" },
                    "exempté":    { bg: "bg-muted/50",       text: "text-muted-foreground", label: "Exempté" },
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
                <p className="text-sm text-foreground bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 whitespace-pre-wrap">{memberDetail.notes_internes}</p>
              </div>
            )}

            <div className="p-5 flex gap-2 mt-auto sticky bottom-0 bg-background border-t border-border">
              <button onClick={() => { setAttestationDialog(memberDetail); setMemberDetail(null); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 text-sm font-semibold hover:bg-amber-500/20 transition-colors">
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

