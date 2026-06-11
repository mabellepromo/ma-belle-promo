import { Printer } from "lucide-react";
import PageHero from "../components/PageHero";
import SEO from "../components/SEO";
import CharteContent from "../components/CharteContent";
import { genererCharteBenevolat } from "../lib/documentGenerators";

export default function CharteBenevolat() {
  return (
    <div>
      <SEO
        title="Charte de bénévolat"
        description="La charte de bénévolat de Ma Belle Promo : droits et devoirs réciproques, RGPD, reconnaissance et résolution des différends. Applicable à toutes nos missions."
        path="/implications/charte-benevole"
      />
      <PageHero title="Charte de bénévolat" subtitle="Implications — Nos engagements réciproques" />

      <section className="py-12 sm:py-16 max-w-3xl mx-auto px-5 sm:px-6">
        <div className="flex justify-end mb-8">
          <button onClick={() => genererCharteBenevolat()}
            className="inline-flex items-center gap-1.5 px-5 h-10 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
            <Printer className="w-4 h-4" /> Imprimer / PDF
          </button>
        </div>
        <CharteContent />
      </section>
    </div>
  );
}
