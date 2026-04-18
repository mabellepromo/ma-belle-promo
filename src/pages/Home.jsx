import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import MissionSection from "../components/MissionSection";
import ActualitesSection from "../components/ActualitesSection";
import EvenementsSection from "../components/EvenementsSection";
import DonnezSection from "../components/DonnezSection";
import TestimonialsSection from "../components/TestimonialsSection";
import SoutenirSection from "../components/SoutenirSection";
import NewsletterSection from "../components/NewsletterSection";
import ContactSection from "../components/ContactSection";
import FooterSection from "../components/FooterSection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <MissionSection />
      <ActualitesSection />
      <EvenementsSection />
      <DonnezSection />
      <TestimonialsSection />
      <SoutenirSection />
      <NewsletterSection />
      <ContactSection />
      <FooterSection />
    </div>
  );
}
