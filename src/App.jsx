import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { WindowFrame } from './components/WindowFrame'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SITE = "Ma Belle Promo";

const PAGE_TITLES = {
  "/":                           "Accueil",
  "/association/credo":          "Notre Credo",
  "/association/ambition":       "Notre Ambition",
  "/association/equipe":         "Notre Équipe",
  "/association/sponsors":       "Nos Sponsors",
  "/activites/evenements":       "Événements",
  "/activites/projets":          "Nos Réalisations",
  "/activites/programmes":       "Nos Programmes",
  "/activites/plan-action-2026": "Plan d'Action 2026",
  "/implications/adhesion":      "Adhésion",
  "/implications/cotisation":    "Cotisation",
  "/implications/soutenir":      "Nous Soutenir",
  "/informations/actualites":    "Actualités",
  "/informations/mediatheque":   "Médiathèque",
  "/informations/documents":     "Documents",
  "/informations/contacts":      "Contacts",
  "/informations/communiques":   "Communiqués",
  "/don":                        "Faire un Don",
  "/don/merci":                  "Merci !",
  "/espace-membre":              "Mon Espace",
  "/annuaire":                   "Annuaire des Membres",
  "/ressources":                 "Ressources Juridiques",
  "/login":                      "Connexion",
  "/dashboard":                  "Tableau de Bord",
  "/galeries":                   "Galeries photos",
};

function PageTitleUpdater() {
  const { pathname } = useLocation();
  useEffect(() => {
    const label =
      PAGE_TITLES[pathname] ??
      (pathname.startsWith("/actualites/") ? "Article" : null);
    document.title = label ? `${label} — ${SITE}` : SITE;
  }, [pathname]);
  return null;
}
import MaintenanceGate, { MAINTENANCE_MODE } from '@/components/MaintenanceGate';
import CookieBanner from '@/components/CookieBanner';
import PageNotFound from './lib/PageNotFound';
import { LocalAuthProvider, useLocalAuth } from '@/lib/LocalAuth';
import ScrollToTop from '@/components/ScrollToTop';

// Pages chargées immédiatement (chemin critique)
import Home from './pages/Home';
import Layout from './components/Layout';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Actualites from './pages/Actualites';
import Contacts from './pages/Contacts';

// Pages chargées à la demande (code splitting)
const Credo          = lazy(() => import('./pages/Credo'));
const Ambition       = lazy(() => import('./pages/Ambition'));
const Equipe         = lazy(() => import('./pages/Equipe'));
const Sponsors       = lazy(() => import('./pages/Sponsors'));
const Evenements     = lazy(() => import('./pages/Evenements'));
const Projets        = lazy(() => import('./pages/Projets'));
const ProjetDetail   = lazy(() => import('./pages/ProjetDetail'));
const Programmes     = lazy(() => import('./pages/Programmes'));
const Adhesion       = lazy(() => import('./pages/Adhesion'));
const Cotisation     = lazy(() => import('./pages/Cotisation'));
const NousSoutenir   = lazy(() => import('./pages/NousSoutenir'));
const Mediatheque    = lazy(() => import('./pages/Mediatheque'));
const Documents      = lazy(() => import('./pages/Documents'));
const Communiques    = lazy(() => import('./pages/Communiques'));
const ArticleDetail  = lazy(() => import('./pages/ArticleDetail'));
const Don            = lazy(() => import('./pages/Don'));
const MerciDon       = lazy(() => import('./pages/MerciDon'));
const EspaceMembre   = lazy(() => import('./pages/EspaceMembre'));
const AnnuaireMembres = lazy(() => import('./pages/AnnuaireMembres'));
const Ressources     = lazy(() => import('./pages/Ressources'));
const Dashboard      = lazy(() => import('./pages/Dashboard'));
const Galeries       = lazy(() => import('./pages/Galeries'));
const GalerieDetail  = lazy(() => import('./pages/GalerieDetail'));
const PlanAction2026   = lazy(() => import('./pages/PlanAction2026'));
const MentionsLegales    = lazy(() => import('./pages/MentionsLegales'));
const Confidentialite    = lazy(() => import('./pages/Confidentialite'));
const NewsletterConfirm  = lazy(() => import('./pages/NewsletterConfirm'));

function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );
}

function PrivateRoute({ children }) {
  const { session } = useLocalAuth();
  const location = useLocation();
  if (!session) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return children;
}

const AuthenticatedApp = () => {
  const location = useLocation();
  return (
    <>
    <PageTitleUpdater />
    <ScrollToTop />
    <Suspense fallback={<PageLoader />}>
    <AnimatePresence mode="wait" initial={false}>
    <motion.div
      key={location.key}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: "easeInOut" }}
    >
    <Routes location={location}>
      <Route path="/" element={<Home />} />
      <Route element={<Layout />}>
        <Route path="/association/credo" element={<Credo />} />
        <Route path="/association/ambition" element={<Ambition />} />
        <Route path="/association/equipe" element={<Equipe />} />
        <Route path="/association/sponsors" element={<Sponsors />} />
        <Route path="/activites/evenements" element={<Evenements />} />
        <Route path="/activites/projets" element={<Projets />} />
        <Route path="/activites/projets/:id" element={<ProjetDetail />} />
        <Route path="/activites/programmes" element={<Programmes />} />
        <Route path="/activites/plan-action-2026" element={<PlanAction2026 />} />
        <Route path="/implications/adherents" element={<Navigate to="/annuaire" replace />} />
        <Route path="/implications/adhesion" element={<Adhesion />} />
        <Route path="/implications/cotisation" element={<Cotisation />} />
        <Route path="/implications/soutenir" element={<NousSoutenir />} />
        <Route path="/informations/actualites" element={<Actualites />} />
        <Route path="/informations/mediatheque" element={<PrivateRoute><Mediatheque /></PrivateRoute>} />
        <Route path="/informations/documents" element={<PrivateRoute><Documents /></PrivateRoute>} />
        <Route path="/informations/contacts" element={<Contacts />} />
        <Route path="/informations/communiques" element={<Communiques />} />
        <Route path="/actualites/:id" element={<ArticleDetail />} />
        <Route path="/don" element={<Don />} />
        <Route path="/don/merci" element={<MerciDon />} />
        <Route path="/espace-membre" element={<PrivateRoute><EspaceMembre /></PrivateRoute>} />
        <Route path="/blog" element={<Navigate to="/informations/actualites" replace />} />
        <Route path="/annuaire" element={<PrivateRoute><AnnuaireMembres /></PrivateRoute>} />
        <Route path="/ressources" element={<PrivateRoute><Ressources /></PrivateRoute>} />
        <Route path="/galeries" element={<Galeries />} />
        <Route path="/galeries/:id" element={<GalerieDetail />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/confidentialite" element={<Confidentialite />} />
        <Route path="/newsletter/confirmer" element={<NewsletterConfirm />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </motion.div>
    </AnimatePresence>
    </Suspense>
    </>
  );
};

function App() {
  return (
    <HelmetProvider>
    <MaintenanceGate>
    <LocalAuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
            <CookieBanner />
          </Router>
          <Toaster />
          <SonnerToaster richColors position="top-right" />
        </QueryClientProvider>
        <WindowFrame />
      </LocalAuthProvider>
    </MaintenanceGate>
    </HelmetProvider>
  );
}

export default App
