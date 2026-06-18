import { useState, useMemo, useRef, useEffect, lazy, Suspense } from "react";
import { toast } from "sonner";
import { genererAttestation } from "../lib/documentGenerators";
import { useMemberStore } from "../lib/memberStore";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLocalAuth } from "../lib/LocalAuth";
import { useArticles } from "../hooks/useArticles";
import { useEvenements } from "../hooks/useEvenements";
import {
  Users, FileText, Clock, Check, X, Shield, LayoutDashboard, Lock, Image, Images, Mail, MapPin, Star, Search,
  LogOut, Briefcase, Edit2, Globe,
  UserCheck, Calendar, Tag,
  Link2, Download, MessageSquare, PenSquare, BookOpen, KeyRound, Banknote, BarChart2, Vote, Wallet, Building2, Send, TrendingUp, Receipt, ShoppingBag, Zap, QrCode, Cake, Menu, ScrollText, Video, Sparkles, Handshake, ClipboardList, PenTool, Scale
} from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import AttestationDialog from "../components/AttestationDialog";
// ComposeModal est rendu hors onglets (bouton « Composer ») -> reste statique,
// ce qui charge aussi MessagesSection depuis le même module : on le garde statique.
import { MessagesSection, ComposeModal } from "./dashboard/MessagesSection.jsx";
import { useCotisations } from "../hooks/useCotisations";
import { useMultiYearCotisations } from "../hooks/useMultiYearCotisations";
import { useNotifications } from "../hooks/useNotifications";
import OverviewSection from "./dashboard/OverviewSection.jsx";
import MembresSection from "./dashboard/MembresSection.jsx";
import CommandPalette from "../components/dashboard/CommandPalette.jsx";

// ── Sections chargées à la demande (code-splitting) ──
// Chaque module n'est téléchargé qu'à l'ouverture de son onglet : la première
// ouverture du dashboard reste légère (important sur connexion mobile lente).
const AutomatisationsSection = lazy(() => import("./dashboard/AutomatisationsSection.jsx"));
const AccesSection           = lazy(() => import("./dashboard/AccesSection.jsx"));
const CotisationsSection     = lazy(() => import("./dashboard/CotisationsSection.jsx"));
const RapportAnnuel          = lazy(() => import("./dashboard/RapportAnnuel.jsx"));
const SondagesSection        = lazy(() => import("./dashboard/SondagesSection"));
const TresorerieSection      = lazy(() => import("./dashboard/TresorerieSection"));
const VueComptableSection    = lazy(() => import("./dashboard/VueComptableSection.jsx"));
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

/*
 * Table de correspondance unique « clé d'onglet → composant de section ».
 * C'est la seule source de vérité pour le rendu des sections chargées à la
 * demande : ajouter un onglet = une ligne ici (+ son entrée dans NAV_GROUPS).
 * Les onglets overview / membres / pending ne figurent PAS ici : ils ont des
 * props lourdes ou du JSX inline et restent gérés explicitement.
 */
const SECTION_COMPONENTS = {
  messages:           MessagesSection,
  articles:           ArticlesSection,
  evenements:         EvenementsSection,
  webinaires:         WebinarsSection,
  checkin:            CheckinSection,
  projets:            ProjetsSection,
  programmes:         ProgrammesSection,
  equipe:             EquipeSection,
  sponsors:           SponsorsSection,
  conventions:        ConventionsSection,
  opportunites:       OpportunitesSection,
  memoire:            MemoireSection,
  signatures:         SignaturesSection,
  ventes:             VentesSection,
  tresorerie:         TresorerieSection,
  "vue-comptable":    VueComptableSection,
  factures:           FacturesSection,
  assemblees:         AssembleesSection,
  registre:           RegistreLegalSection,
  benevoles:          BenevolesSection,
  elections:          ElectionsSection,
  mandats:            MandatsSection,
  circulaire:         CirculaireSection,
  courrier:           CourrierSection,
  "bulk-email":       BulkEmailSection,
  "newsletter-email": NewsletterEmailSection,
  stats:              StatsSection,
  automatisations:    AutomatisationsSection,
  "assistant-ia":     AssistantIA,
  communiques:        CommuniquesSection,
  mediatheque:        MediathequeSection,
  documents:          DocumentsSection,
  galeries:           GaleriesSection,
  ressources:         RessourcesSection,
  sondages:           SondagesSection,
  cotisations:        CotisationsSection,
  rapport:            RapportAnnuel,
  acces:              AccesSection,
};

// Onglets dont le composant a besoin de la liste des membres en prop.
const SECTIONS_WITH_MEMBERS = new Set(["cotisations", "rapport"]);

// Onglets gérés directement dans Dashboard.jsx (JSX inline, hors table).
const STATIC_TAB_KEYS = ["overview", "membres", "pending"];

// Ensemble des clés d'onglet valides : sert à valider le segment d'URL
// (/dashboard/<tab>) et à retomber sur "overview" si l'URL est inconnue.
const ALL_TAB_KEYS = new Set([...STATIC_TAB_KEYS, ...Object.keys(SECTION_COMPONENTS)]);

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

  // L'onglet actif vit dans l'URL (/dashboard/<tab>) : F5 le conserve, les
  // liens sont partageables, le bouton Précédent fonctionne. setTab navigue
  // au lieu de muter un état local ; "overview" correspond à /dashboard nu.
  const { tab: tabParam } = useParams();
  const tab = ALL_TAB_KEYS.has(tabParam) ? tabParam : "overview";
  const setTab = (key) => navigate(key === "overview" ? "/dashboard" : `/dashboard/${key}`);

  const [sidebarOpen,        setSidebarOpen]       = useState(false);
  const [search,             setSearch]            = useState("");

  // Accordéon de la sidebar : groupes repliés (par libellé), mémorisés.
  // Plusieurs groupes peuvent rester ouverts simultanément.
  const [collapsedGroups, setCollapsedGroups] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("mbp_dash_collapsed") || "[]")); }
    catch { return new Set(); }
  });
  const toggleGroup = (label) => setCollapsedGroups(prev => {
    const next = new Set(prev);
    if (next.has(label)) next.delete(label); else next.add(label);
    try { localStorage.setItem("mbp_dash_collapsed", JSON.stringify([...next])); } catch { /* quota indispo */ }
    return next;
  });
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
  const [candCount,      setCandCount]      = useState(0);
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

  // Compteur de candidatures bénévoles « nouvelles » (badge sidebar).
  useEffect(() => {
    async function fetchCand() {
      const { count } = await supabase
        .from("candidatures_benevoles")
        .select("*", { count: "exact", head: true })
        .eq("statut", "nouvelle");
      setCandCount(count || 0);
    }
    fetchCand();
    const channel = supabase
      .channel("dashboard-candidatures-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "candidatures_benevoles" }, fetchCand)
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
        { key: "pending",      label: "En attente", badge: pendingMembers.length || null, badgeAlert: true, icon: Clock },
        { key: "messages",     label: "Messages", icon: MessageSquare, badge: unreadCount || null, badgeAlert: true },
        { key: "acces",        label: "Accès membres", icon: KeyRound },
      ],
    },
    {
      // Tout ce qui touche à l'argent regroupé pour une meilleure visibilité
      label: "Finances",
      items: [
        { key: "vue-comptable", label: "Vue comptable",  icon: Scale },
        { key: "cotisations",  label: "Cotisations",    icon: Banknote },
        { key: "tresorerie",   label: "Trésorerie",     icon: Wallet },
        { key: "factures",     label: "Factures",       icon: Receipt },
        { key: "ventes",       label: "Ventes",         icon: ShoppingBag },
        { key: "rapport",      label: "Rapport annuel", icon: BarChart2 },
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
        { key: "assemblees",    label: "Assemblées",     icon: Building2 },
        { key: "elections",     label: "Élections",      icon: Vote },
        { key: "mandats",       label: "Mandats",        icon: Shield },
        { key: "registre",      label: "Registre légal", icon: BookOpen },
        { key: "memoire",       label: "Mémoire / Passation", icon: ClipboardList },
        { key: "benevoles",     label: "Bénévoles",      icon: Briefcase, badge: candCount || null, badgeAlert: true },
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
  // Items à plat pour la palette Ctrl+K (chaque item garde son groupe d'origine).
  const paletteItems = NAV_GROUPS.flatMap(g => g.items.map(it => ({ ...it, groupLabel: g.label })));
  const currentNavItem = allNavItems.find(i => i.key === tab);
  const CurrentIcon = currentNavItem?.icon || LayoutDashboard;

  const STAT_COLORS = [
    { bar: "bg-blue-500",    iconBg: "bg-blue-500/15",    iconCl: "text-blue-400",    ring: "hover:ring-blue-500/70" },
    { bar: "bg-amber-500",   iconBg: "bg-amber-500/15",   iconCl: "text-amber-400",   ring: "hover:ring-amber-500/70" },
    { bar: "bg-emerald-500", iconBg: "bg-emerald-500/15", iconCl: "text-emerald-400", ring: "hover:ring-emerald-500/70" },
    { bar: "bg-indigo-500",  iconBg: "bg-indigo-500/15",  iconCl: "text-indigo-400",  ring: "hover:ring-indigo-500/70" },
  ];

  return (
    <div className="dark h-screen flex overflow-hidden bg-[#4a4a4a] text-foreground">

      <CommandPalette
        items={paletteItems}
        onSelect={(key) => { setTab(key); setSidebarOpen(false); }}
      />

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
            <img src="/Logo Redesign1.webp" alt="Ma Belle Promo"
              className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />

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
          {/* Déclencheur de la palette de recherche (raccourci Ctrl+K). */}
          <button onClick={() => window.dispatchEvent(new CustomEvent("mbp:open-palette"))}
            className="mt-2 w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-muted-foreground border border-border hover:bg-muted/40 hover:text-foreground transition-all">
            <Search className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="flex-1 text-left">Rechercher…</span>
            <kbd className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">Ctrl K</kbd>
          </button>
        </div>

        {/* Navigation */}
        <nav
          ref={sidebarNavRef}
          className="overflow-y-auto px-2 pb-4"
          style={{ maxHeight: "calc(100vh - 195px)" }}>
          {NAV_GROUPS.map((group, gi) => {
            const groupColors = [null, "text-blue-400", "text-green-400", "text-violet-400", "text-amber-400", "text-emerald-400", "text-pink-400"];
            const gc = groupColors[gi] || "text-muted-foreground";
            // Liseré coloré en haut de chaque carte de groupe (rappel des cartes de stats).
            const groupBars = [null, "border-t-blue-400", "border-t-green-400", "border-t-violet-400", "border-t-amber-400", "border-t-emerald-400", "border-t-pink-400"];
            const gbar = groupBars[gi] || "border-t-border";
            // Le groupe sans libellé (Vue d'ensemble) n'est pas repliable.
            const collapsible = !!group.label;
            const collapsed = collapsible && collapsedGroups.has(group.label);
            // Compteur d'alertes du groupe (badges d'alerte) pour rester visible une fois replié.
            const groupAlerts = group.items.reduce((n, it) => n + (it.badgeAlert && it.badge ? it.badge : 0), 0);
            return (
              <div key={gi} className={gi > 0 ? "mt-5" : ""}>
                {group.label && (
                  <button onClick={() => toggleGroup(group.label)}
                    className={`w-full group/hdr flex items-center gap-2 mb-1.5 px-2.5 py-1.5 rounded-lg bg-muted/50 border border-border/60 border-t-2 ${gbar} hover:bg-muted/70 transition-colors`}>
                    <span className={`flex-1 text-left text-[10px] font-semibold uppercase tracking-[0.12em] ${gc}`}>
                      {group.label}
                    </span>
                    {collapsed && groupAlerts > 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">{groupAlerts}</span>
                    )}
                    <svg viewBox="0 0 24 24" className={`w-3 h-3 flex-shrink-0 opacity-50 transition-transform ${collapsed ? "-rotate-90" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
                <div className={`space-y-0.5 ${collapsed ? "hidden" : ""}`}>
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
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 ring-1 ring-[#e3c46a]/30">
              <CurrentIcon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-heading font-bold text-foreground text-base leading-none">
                {currentNavItem?.label || "Vue d'ensemble"}
              </h2>
              <span className="mt-1 h-px w-8" style={{ background: "linear-gradient(to right, #e3c46a, transparent)" }} />
            </div>
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
            <OverviewSection
              stats={stats}
              STAT_COLORS={STAT_COLORS}
              pilotage={pilotage}
              currentYear={currentYear}
              pendingMembers={pendingMembers}
              setTab={setTab}
              notifPermission={notifPermission}
              setNotifPermission={setNotifPermission}
              cotStats={cotStats}
              prochainEvenement={prochainEvenement}
              tresoWidget={tresoWidget}
              prochaineAG={prochaineAG}
              prochainsAnniversaires={prochainsAnniversaires}
              membresDormants={membresDormants}
              repartitionGeo={repartitionGeo}
              agendaCombine={agendaCombine}
              rejectMember={rejectMember}
              validateMember={validateMember}
              session={session}
              exportBackup={exportBackup}
              PROTECTED_PAGES={PROTECTED_PAGES}
            />
          )}

          {/* ── MEMBRES ── */}
          {tab === "membres" && (
            <MembresSection
              search={search}
              setSearch={setSearch}
              filteredMembers={filteredMembers}
              cotisationsAnnee={cotisationsAnnee}
              currentYear={currentYear}
              allMembers={allMembers}
              addingMember={addingMember}
              setAddingMember={setAddingMember}
              handleSaveNewMember={handleSaveNewMember}
              editingMember={editingMember}
              setEditingMember={setEditingMember}
              handleSaveEditMember={handleSaveEditMember}
              setMemberDetail={setMemberDetail}
              setAttestationDialog={setAttestationDialog}
              setConfirmDialog={setConfirmDialog}
              deleteMember={deleteMember}
              csvInputRef={csvInputRef}
              handleCsvUpload={handleCsvUpload}
              exportMembresExcel={exportMembresExcel}
              setRenewDialog={setRenewDialog}
              isSeeded={isSeeded}
              seedFromStatic={seedFromStatic}
              memberSaving={memberSaving}
            />
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
                        onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nom)}&background=064e3b&color=6ee7b7&size=56`; }} />
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
          {(() => {
            const Section = SECTION_COMPONENTS[tab];
            if (!Section) return null;
            // Seuls cotisations et rapport ont besoin de la liste des membres.
            return SECTIONS_WITH_MEMBERS.has(tab)
              ? <Section members={allMembers} />
              : <Section />;
          })()}
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
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(memberDetail.nom)}&background=064e3b&color=6ee7b7&size=80`; }} />
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

