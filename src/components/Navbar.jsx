import { useState, useEffect, useRef } from "react";
import {
  Menu, X, ChevronDown, Home, User, LayoutDashboard, LogOut,
  BookOpen, Target, Users, Building2,
  Calendar, FolderOpen, ListTodo,
  UserPlus, CreditCard, Heart,
  Newspaper, Image, Film, FileText, MessageSquare, Mail,
} from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalAuth } from "@/lib/LocalAuth";

const navItems = [
  {
    label: "L'Association",
    children: [
      { icon: BookOpen,  label: "Notre Credo",      href: "/association/credo",    desc: "Nos valeurs fondatrices" },
      { icon: Target,    label: "Notre Ambition",    href: "/association/ambition", desc: "But & objectifs" },
      { icon: Users,     label: "Notre Équipe",      href: "/association/equipe",   desc: "Le bureau directeur" },
      { icon: Building2, label: "Nos Partenaires",   href: "/association/sponsors", desc: "Institutions & soutiens" },
    ],
  },
  {
    label: "Activités",
    children: [
      { icon: Calendar,    label: "Événements", href: "/activites/evenements", desc: "Agenda et compte-rendus" },
      { icon: FolderOpen,  label: "Projets",    href: "/activites/projets",    desc: "Nos initiatives en cours" },
      { icon: ListTodo,    label: "Programmes", href: "/activites/programmes", desc: "Plan d'action 2026" },
    ],
  },
  {
    label: "Implications",
    children: [
      { icon: Users,       label: "Adhérents",      href: "/annuaire",                desc: "Annuaire des membres" },
      { icon: UserPlus,    label: "Adhésion",        href: "/implications/adhesion",   desc: "Rejoindre l'association" },
      { icon: CreditCard,  label: "Cotisation",      href: "/implications/cotisation", desc: "Gérer sa cotisation" },
      { icon: Heart,       label: "Nous Soutenir",   href: "/implications/soutenir",   desc: "Faire un don" },
    ],
  },
  {
    label: "Informations",
    children: [
      { icon: Newspaper,       label: "Actualités",       href: "/informations/actualites",  desc: "Dernières nouvelles" },
      { icon: Image,           label: "Galeries membres",  href: "/galeries", membersOnly: true, desc: "Photos & albums" },
      { icon: Film,            label: "Médiathèque",       href: "/informations/mediatheque", desc: "Vidéos & ressources" },
      { icon: FileText,        label: "Documents",         href: "/informations/documents",   desc: "Docs officiels" },
      { icon: MessageSquare,   label: "Communiqués",       href: "/informations/communiques", desc: "Communiqués officiels" },
      { icon: Mail,            label: "Contact",           href: "/informations/contacts",    desc: "Nous écrire" },
    ],
  },
];

function DesktopDropdown({ item }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const closeTimer = useRef(-1);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  };

  useEffect(() => () => cancelClose(), []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
    >
      {/* Bouton déclencheur */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold tracking-[0.10em] uppercase rounded-lg transition-all duration-200"
        style={{
          color: open ? "#ffffff" : "rgba(255,255,255,0.62)",
          background: open ? "rgba(52,211,153,0.10)" : "transparent",
          letterSpacing: "0.10em",
        }}
      >
        {item.label}
        <ChevronDown
          className="w-3 h-3 flex-shrink-0"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.32s cubic-bezier(0.22,1,0.36,1)",
            color: open ? "#6ee7b7" : "inherit",
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          /* Déroule comme un parchemin — clipPath de haut en bas */
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0 round 14px)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0 round 14px)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0 round 14px)", transition: { duration: 0.22, ease: "easeIn" } }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className="absolute top-full left-0 mt-2 w-max z-50"
            style={{ filter: "drop-shadow(0 12px 36px rgba(0,0,0,0.55))" }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(170deg, rgba(12,34,20,0.98) 0%, rgba(7,20,12,0.99) 100%)",
                border: "1px solid rgba(52,211,153,0.20)",
              }}
            >
              {/* Ligne décorative parchemin en haut */}
              <div style={{
                height: 2,
                background: "linear-gradient(to right, transparent 0%, #34d399 25%, #fbbf24 60%, #34d399 85%, transparent 100%)",
              }} />

              {/* Titre de catégorie */}
              <div className="px-6 pt-3 pb-1.5">
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase"
                  style={{ color: "rgba(110,231,183,0.50)" }}>
                  {item.label}
                </span>
              </div>

              {/* Séparateur */}
              <div className="mx-6 mb-1" style={{ height: "1px", background: "rgba(52,211,153,0.12)" }} />

              {/* Items en cascade */}
              <div className="py-1.5">
                {item.children.map((child, i) => {
                  const Icon = child.icon;
                  return (
                    <motion.div
                      key={child.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.10 + i * 0.055, duration: 0.25, ease: "easeOut" }}
                    >
                      <Link
                        to={child.href}
                        onClick={() => setOpen(false)}
                        className="group flex items-center gap-3 px-5 py-2.5 transition-all duration-150"
                        style={{ color: "rgba(255,255,255,0.65)" }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = "#ffffff";
                          e.currentTarget.style.background = "rgba(52,211,153,0.09)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {Icon && (
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(52,211,153,0.08)" }}
                          >
                            <Icon className="w-3.5 h-3.5" style={{ color: "rgba(52,211,153,0.65)" }} />
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium leading-tight whitespace-nowrap">{child.label}</span>
                          {child.desc && (
                            <span className="text-[11px] leading-tight mt-0.5 whitespace-nowrap" style={{ color: "rgba(255,255,255,0.32)" }}>
                              {child.desc}
                            </span>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Ligne décorative en bas */}
              <div style={{
                height: 1,
                margin: "0 24px 12px",
                background: "rgba(251,191,36,0.12)",
              }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileMenuItem({ item, onClose }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-foreground bg-card hover:bg-muted transition-colors"
      >
        <span>{item.label}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-muted/40"
          >
            {item.children.map((child) => (
              <button
                key={child.label}
                onClick={() => { onClose(); navigate(child.href); }}
                className="flex items-start gap-3 w-full text-left px-5 py-2.5 hover:bg-muted transition-colors border-t border-border/50"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{child.label}</div>
                  {child.desc && <div className="text-xs text-muted-foreground mt-0.5">{child.desc}</div>}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { session, logout } = useLocalAuth();
  const isAdmin = session?.role === "admin";

  useEffect(() => {
    setOpen(false);
  }, [location]);

  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 20);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(window.scrollY / h, 1) : 0);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      style={{
        background: scrolled ? "rgba(5,18,11,0.92)" : "var(--brand-dark-mid)",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        boxShadow: scrolled ? "0 2px 32px rgba(0,0,0,0.40)" : "none",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
      className="navbar-safe-area fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    >
      {/* Ligne d'accent supérieure */}
      <div className="h-px" style={{ background: "linear-gradient(to right, transparent, #34d399 15%, #fde047 50%, #10b981 85%, transparent)" }} />

      {/* Barre de progression scroll */}
      <div style={{ height: 2, background: "rgba(255,255,255,0.04)", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, height: "100%",
          width: `${progress * 100}%`,
          background: "linear-gradient(to right, #34d399, #fbbf24)",
          transition: "width 0.1s linear",
          boxShadow: progress > 0 ? "0 0 8px rgba(52,211,153,0.60)" : "none",
        }} />
      </div>

      <div className={`max-w-7xl mx-auto px-6 flex items-center transition-all duration-300 ${scrolled ? "py-2" : "py-3 md:py-5"}`}>

        {/* ── MOBILE : logo gauche ── */}
        <Link to="/" className="md:hidden flex items-center gap-3 group flex-shrink-0">
          <img
            src="/Logo Redesign1.webp"
            alt="Ma Belle Promo"
            className="w-10 h-10 rounded-full object-cover shadow-md group-hover:shadow-primary/30 transition-shadow"
          />
          <div className="hidden sm:block">
            <div className="font-heading text-base font-bold leading-tight tracking-tight" style={{ color: "#e2f5ed" }}>Ma Belle Promo</div>
            <div className="text-[10px] tracking-widest uppercase leading-tight" style={{ color: "rgba(255,255,255,0.40)" }}>FDD-MBP · Togo</div>
          </div>
        </Link>

        {/* ── DESKTOP : groupe nav gauche — Accueil + 2 menus ── */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-0.5">
          <Link
            to="/"
            className="flex items-center px-3 py-2 text-[11px] font-semibold tracking-[0.10em] uppercase rounded-lg transition-all duration-200"
            style={{ color: "rgba(255,255,255,0.62)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.background = "rgba(52,211,153,0.10)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.62)"; e.currentTarget.style.background = "transparent"; }}
          >
            Accueil
          </Link>
          {navItems.slice(0, 2).map((item) => (
            <DesktopDropdown key={item.label} item={item} />
          ))}
        </div>

        {/* Séparateur doré gauche */}
        <div className="hidden md:block flex-shrink-0 mx-5" style={{
          width: 1, height: 34,
          background: "linear-gradient(to bottom, transparent, rgba(251,191,36,0.38), transparent)",
        }} />

        {/* ── DESKTOP : logo centré ── */}
        <Link to="/" className="hidden md:flex flex-col items-center group flex-shrink-0">
          <img
            src="/Logo Redesign1.webp"
            alt="Ma Belle Promo"
            className="rounded-full object-cover shadow-lg group-hover:shadow-primary/40 transition-all duration-300"
            style={{ width: scrolled ? 34 : 48, height: scrolled ? 34 : 48 }}
          />
          <div style={{
            maxHeight: scrolled ? 0 : 36,
            opacity: scrolled ? 0 : 1,
            overflow: "hidden",
            transition: "max-height 0.3s ease, opacity 0.25s ease",
            marginTop: scrolled ? 0 : 4,
            textAlign: "center",
          }}>
            <div className="font-heading text-[11px] font-bold tracking-[0.14em] uppercase whitespace-nowrap" style={{ color: "#e2f5ed" }}>
              Ma Belle Promo
            </div>
            <div className="text-[8px] tracking-[0.28em] uppercase whitespace-nowrap" style={{ color: "rgba(255,255,255,0.32)" }}>
              FDD · MBP · Togo
            </div>
          </div>
        </Link>

        {/* Séparateur doré droit */}
        <div className="hidden md:block flex-shrink-0 mx-5" style={{
          width: 1, height: 34,
          background: "linear-gradient(to bottom, transparent, rgba(251,191,36,0.38), transparent)",
        }} />

        {/* ── DESKTOP : groupe nav droit — 2 menus + DON ── */}
        <div className="hidden md:flex flex-1 items-center gap-0.5">
          {navItems.slice(2).map((item) => (
            <DesktopDropdown key={item.label} item={item} />
          ))}
          <button
            onClick={() => navigate("/don")}
            className="ml-2 flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold rounded-full hover:opacity-90 active:scale-95 transition-all tracking-[0.10em] uppercase"
            style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#000" }}
          >
            ♥ Don
          </button>
        </div>

        {/* ── DESKTOP : icône utilisateur discrète ── */}
        <div className="hidden md:flex flex-shrink-0 ml-3 items-center gap-1.5">
          {session ? (
            <>
              {isAdmin && (
                <button
                  onClick={() => navigate("/dashboard")}
                  title="Tableau de bord"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  <LayoutDashboard className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center gap-1 px-2 py-1.5 rounded-full text-[10px]"
                style={{ border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.55)" }}>
                <User className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="max-w-[70px] truncate">{session.nom.split(" ")[0]}</span>
                <button onClick={() => { logout(); navigate("/"); }} title="Se déconnecter"
                  className="ml-0.5 hover:text-white transition-colors">
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => navigate("/espace-membre")}
              title="Mon espace"
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all duration-200"
              style={{ border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.55)" }}
            >
              <User className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── MOBILE : indicateur session + hamburger ── */}
        <div className="md:hidden ml-auto flex items-center gap-3">
          {session && (
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs"
              style={{ border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.75)" }}>
              <User className="w-3 h-3 flex-shrink-0" />
              <span className="max-w-[72px] truncate">{session.nom.split(" ")[0]}</span>
              <button
                onClick={() => { logout(); navigate("/"); }}
                title="Se déconnecter"
                className="ml-0.5 hover:text-white transition-colors"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-white/80"
          >
            <AnimatePresence mode="wait">
              {open ? (
                <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Backdrop — ferme le menu au tap en dehors */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Menu mobile */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="md:hidden bg-background border-t border-border relative z-50"
        >
          <div className="px-4 py-4 space-y-2 max-h-[75vh] overflow-y-auto">
            {/* Bloc utilisateur */}
            {session ? (
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#fecaca", background: "#fef2f2" }}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{session.nom}</p>
                    <p className="text-xs text-muted-foreground">{isAdmin ? "Administrateur" : "Membre"}</p>
                  </div>
                  <button
                    onClick={() => { setOpen(false); logout(); navigate("/"); }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    style={{ color: "#dc2626", background: "#fee2e2" }}
                  >
                    <LogOut className="w-3.5 h-3.5" /> Quitter
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setOpen(false); navigate("/login"); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-foreground bg-card rounded-xl border border-border hover:bg-muted transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                Se connecter / Mon espace
              </button>
            )}

            {/* Accueil */}
            <button
              onClick={() => { setOpen(false); navigate("/"); }}
              className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-medium text-foreground bg-card rounded-xl border border-border hover:bg-muted transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Home className="w-3.5 h-3.5 text-white" />
              </div>
              Accueil
            </button>

            {navItems.map((item) => (
              <MobileMenuItem key={item.label} item={item} onClose={() => setOpen(false)} />
            ))}

            {isAdmin && (
              <button
                onClick={() => { setOpen(false); navigate("/dashboard"); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-primary bg-primary/10 rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                  <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                </div>
                Tableau de bord
              </button>
            )}

            <button
              onClick={() => { setOpen(false); navigate("/implications/soutenir"); }}
              className="w-full mt-2 px-5 py-3.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-bold rounded-xl tracking-wide"
            >
              ♥ Faire un don
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
