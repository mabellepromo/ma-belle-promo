import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import PageHero from "../components/PageHero";
import { Heart, Phone, Mail, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const montants = [5000, 10000, 25000, 50000, 100000];

const programmes = [
  { id: "general", label: "Fonds général MBP" },
  { id: "bourses", label: "Programme à destination des étudiants" },
  { id: "humanitaire", label: "Programme communautaire" },
  { id: "conference", label: "Conférence, colloque" },
  { id: "plaidoyer", label: "Plaidoyer et lobbying" },
  { id: "formation", label: "Formation et renforcement des capacités" },
  { id: "autre", label: "Autre" },
];

export default function Don() {
  const navigate = useNavigate();
  const [montantSelectionne, setMontantSelectionne] = useState(null);
  const [montantAutreActif, setMontantAutreActif] = useState(false);
  const [montantLibre, setMontantLibre] = useState("");
  const [programme, setProgramme] = useState("general");
  const [programmeAutre, setProgrammeAutre] = useState("");
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", tel: "", message: "" });
  const [mode, setMode] = useState("tmoney"); // tmoney | flooz | virement | especes
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const montantFinal = montantAutreActif
    ? (montantLibre ? parseInt(montantLibre) : null)
    : montantSelectionne;

  const update = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.email || !montantFinal) {
      toast.error("Veuillez indiquer votre nom, email et le montant du don.");
      return;
    }
    if (!consent) {
      toast.error("Veuillez accepter la politique de confidentialité pour continuer.");
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const programmeLabel = programme === "autre" ? (programmeAutre || "Autre") : programme;
    navigate("/don/merci", { state: { nom: form.prenom || form.nom, montant: montantFinal, programme: programmeLabel } });
  };

  const modesPaiement = [
    { id: "tmoney", label: "TMoney", detail: "+228 90 05 36 06" },
    { id: "flooz", label: "Flooz", detail: "+228 96 02 00 00" },
    { id: "virement", label: "Virement bancaire", detail: "Ecobank Togo — RIB disponible sur demande" },
    { id: "especes", label: "Espèces / en personne", detail: "12 BP 335 Baguida, Lomé", notice: "Un reçu de don sera établi et remis au donateur à titre de justificatif." },
  ];

  return (
    <div>
      <SEO title="Faire un Don" description="Faites un don à Ma Belle Promo et soutenez nos actions de solidarité, d'éducation et de santé au Togo." path="/don" />
      <PageHero title="Faire un Don" subtitle="Soutenir — Ma Belle Promo" />

      <section className="py-16 max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Votre générosité finance directement les bourses, les webinaires et les actions humanitaires de Ma Belle Promo. Chaque franc compte.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Montant */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-7">
            <h2 className="font-heading text-lg font-bold text-foreground mb-5 flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" /> Choisissez votre montant (F CFA)
            </h2>
            <div className="flex flex-wrap gap-3 mb-4">
              {montants.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMontantSelectionne(m); setMontantAutreActif(false); setMontantLibre(""); }}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                    montantSelectionne === m && !montantAutreActif
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {m.toLocaleString("fr-FR")} F CFA
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setMontantSelectionne(null); setMontantAutreActif(true); setMontantLibre(""); }}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                  montantAutreActif
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                Autre
              </button>
            </div>
            {montantAutreActif && (
              <div className="relative mb-2">
                <input
                  type="number"
                  placeholder="Précisez le montant (F CFA)"
                  value={montantLibre}
                  onChange={(e) => setMontantLibre(e.target.value)}
                  autoFocus
                  className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            )}
            {montantFinal > 0 && (
              <p className="mt-3 text-sm font-semibold text-primary">
                ✓ Montant sélectionné : {montantFinal.toLocaleString("fr-FR")} F CFA
              </p>
            )}
          </motion.div>

          {/* Programme */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-7">
            <h2 className="font-heading text-lg font-bold text-foreground mb-5">Affecter mon don à</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {programmes.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProgramme(p.id)}
                  className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    programme === p.id
                      ? "bg-primary/5 border-primary text-primary"
                      : "bg-background border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {programme === p.id && <span className="mr-2">✓</span>}
                  {p.label}
                </button>
              ))}
            </div>
            {programme === "autre" && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Veuillez préciser..."
                  value={programmeAutre}
                  onChange={(e) => setProgrammeAutre(e.target.value)}
                  autoFocus
                  className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            )}
          </motion.div>

          {/* Mode de paiement */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-7">
            <h2 className="font-heading text-lg font-bold text-foreground mb-5 flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" /> Mode de paiement
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {modesPaiement.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`text-left px-4 py-3 rounded-xl border transition-all ${
                    mode === m.id
                      ? "bg-primary/5 border-primary"
                      : "bg-background border-border hover:border-primary/40"
                  }`}
                >
                  <div className={`text-sm font-semibold ${mode === m.id ? "text-primary" : "text-foreground"}`}>{m.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{m.detail}</div>
                  {m.notice && (
                    <div className="text-xs text-muted-foreground mt-1.5 italic border-t border-border/50 pt-1.5">{m.notice}</div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Donateur */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-card border border-border rounded-2xl p-7">
            <h2 className="font-heading text-lg font-bold text-foreground mb-5 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" /> Vos informations
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Nom <span className="text-red-500">*</span></label>
                <Input placeholder="Votre nom" value={form.nom} onChange={update("nom")} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Prénom</label>
                <Input placeholder="Votre prénom" value={form.prenom} onChange={update("prenom")} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email <span className="text-red-500">*</span></label>
                <Input type="email" placeholder="votre@email.com" value={form.email} onChange={update("email")} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Téléphone</label>
                <Input placeholder="+228 00 00 00 00" value={form.tel} onChange={update("tel")} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-1.5 block">Message (optionnel)</label>
                <textarea
                  rows={3}
                  placeholder="Un mot d'encouragement pour l'association..."
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                  value={form.message}
                  onChange={update("message")}
                />
              </div>
            </div>
          </motion.div>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-border accent-primary flex-shrink-0 cursor-pointer"
            />
            <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
              J'accepte que mes données (nom, email, montant) soient traitées par Ma Belle Promo afin de traiter mon don, conformément à la{" "}
              <Link to="/confidentialite" className="text-primary hover:underline font-medium">
                politique de confidentialité
              </Link>.
            </span>
          </label>

          <Button type="submit" disabled={loading || !montantFinal || !consent} className="w-full h-13 rounded-full text-base font-bold gap-2 py-4">
            {loading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Heart className="w-5 h-5" />
            )}
            {loading ? "Traitement en cours..." : `Confirmer mon don${montantFinal ? ` de ${montantFinal.toLocaleString("fr-FR")} F CFA` : ""}`}
          </Button>
        </form>
      </section>
    </div>
  );
}
