import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import MissionSection from "../components/MissionSection";
import CredibiliteSection from "../components/CredibiliteSection";
import ActualitesSection from "../components/ActualitesSection";
import TestimonialsSection from "../components/TestimonialsSection";
import ContactSection from "../components/ContactSection";
import FooterSection from "../components/FooterSection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <MissionSection />
      <CredibiliteSection />
      <ActualitesSection />
      <TestimonialsSection />
      <ContactSection />
      <FooterSection />
    </div>
  );
}
