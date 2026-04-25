import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import MissionSection from "../components/MissionSection";
import CredibiliteSection from "../components/CredibiliteSection";
import ActualitesSection from "../components/ActualitesSection";
import TestimonialsSection from "../components/TestimonialsSection";
import ContactSection from "../components/ContactSection";
import FooterSection from "../components/FooterSection";
import SEO from "../components/SEO";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Ma Belle Promo",
  "alternateName": "FDD-MBP",
  "url": "https://www.mabellepromo.org",
  "logo": "https://media.base44.com/images/public/69da5bf6442b31e7eee54888/42e641694_LogoRedesign1.png",
  "description": "Association des anciens diplômés de la Faculté de Droit du Développement de l'Université de Lomé (promotion 1994-2000).",
  "foundingDate": "2018-12-01",
  "address": { "@type": "PostalAddress", "addressLocality": "Lomé", "addressCountry": "TG" },
  "sameAs": [
    "https://www.facebook.com/mabellepromo",
    "https://www.instagram.com/mabellepromo",
    "https://x.com/mabellepromo",
    "https://www.linkedin.com/in/fdd-mbp/"
  ]
};

/* Dégradé de transition entre sections claire et sombre */
const light = "hsl(40,20%,98%)";
const dark  = "hsl(150,30%,10%)";
const muted = "hsl(40,20%,96%)";

function Fade({ from, to }) {
  return <div style={{ height: 80, background: `linear-gradient(to bottom, ${from}, ${to})` }} />;
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <SEO path="/" />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Navbar />
      <HeroSection />
      {/* Hero finit déjà avec un fondu vers bg-background — pas de Fade ici */}
      <MissionSection />
      <Fade from={light} to={dark} />
      <CredibiliteSection />
      <Fade from={dark} to={muted} />
      <ActualitesSection />
      <Fade from={muted} to={dark} />
      <TestimonialsSection />
      <Fade from={dark} to={muted} />
      <ContactSection />
      <Fade from={muted} to={dark} />
      <FooterSection />
    </div>
  );
}
