import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowUp } from "lucide-react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import MissionSection from "../components/MissionSection";
import CredibiliteSection from "../components/CredibiliteSection";
import ActualitesSection from "../components/ActualitesSection";
import TestimonialsSection from "../components/TestimonialsSection";
import ContactSection from "../components/ContactSection";
import FooterSection from "../components/FooterSection";
import MarqueeSection from "../components/MarqueeSection";
import SEO from "../components/SEO";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Ma Belle Promo",
  "alternateName": "FDD-MBP",
  "url": "https://www.mabellepromo.org",
  "logo": "https://media.base44.com/images/public/69da5bf6442b31e7eee54888/42e641694_LogoRedesign1.png",
  "description": "Association des anciens diplômés de la Faculté de Droit de l'Université de Lomé (promotion 1994-2000).",
  "foundingDate": "2018-12-01",
  "address": { "@type": "PostalAddress", "addressLocality": "Lomé", "addressCountry": "TG" },
  "sameAs": [
    "https://www.facebook.com/mabellepromo",
    "https://www.instagram.com/mabellepromo",
    "https://x.com/mabellepromo",
    "https://www.linkedin.com/in/fdd-mbp/"
  ]
};

function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Remonter en haut de la page"
      className="fixed bottom-6 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center shadow-lg md:hidden"
      style={{ background: "rgba(45,122,82,0.85)", color: "#fff", backdropFilter: "blur(8px)" }}
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
}

/* Dégradé de transition entre sections — même famille de teinte (150°) */
const dark  = "hsl(150,28%,12%)";
const muted = "hsl(150,10%,93%)";

function Fade({ from, to }) {
  return <div style={{ height: 140, background: `linear-gradient(to bottom, ${from}, ${to})` }} />;
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <SEO path="/" />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Navbar />
      {/* Hero + bandeau défilant = exactement un écran */}
      <div style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
        <HeroSection />
        <MarqueeSection />
      </div>
      <MissionSection />
      {/* Filet de séparation entre les deux sections sombres */}
      <div style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(45,122,82,0.18), rgba(251,191,36,0.12), transparent)" }} />
      <TestimonialsSection />
      <CredibiliteSection />
      <Fade from={dark} to={muted} />
      <ActualitesSection />
      <ContactSection />
      <Fade from={muted} to={dark} />
      <FooterSection />
      <ScrollToTop />
    </div>
  );
}
