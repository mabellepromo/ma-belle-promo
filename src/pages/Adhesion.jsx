import { useState } from "react";
import { motion } from "framer-motion";
import PageHero from "../components/PageHero";
import SEO from "../components/SEO";
import { CheckCircle2, ArrowRight, User, Mail, Phone, Briefcase, MapPin, GraduationCap, FileText, Heart, Upload, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMemberStore } from "../lib/memberStore";
import { compressImage } from "../lib/imageUtils";

const etapes = [
  { num: "01", titre: "Formulaire en ligne", desc: "Remplissez le formulaire d'adhésion ci-dessous avec vos informations." },
  { num: "02", titre: "Examen du bureau", desc: "Le bureau exécutif vérifie votre éligibilité sous 48h." },
  { num: "03", titre: "Confirmation & cotisation", desc: "Vous recevez un email avec les modalités de paiement." },
  { num: "04", titre: "Bienvenue !", desc: "Vous êtes officiellement membre de Ma Belle Promo." },
];

export default function Adhesion() {
  const { addPending } = useMemberStore();
  const [form, setForm] = useState({
    civilite: "",
    nom: "",
    prenom: "",
    dateNaissance: "",
    lieuNaissance: "",
    nationalite: "Togolaise",
    adresse: "",
    ville: "",
    pays: "Togo",
    email: "",
    tel: "",
    telSecondaire: "",
    anneeObtention: "",
    mention: "",
    specialite: "",
    profession: "",
    employeur: "",
    fonctionActuelle: "",
    anneeDebutPoste: "",
    secteurActivite: "",
    situationFamiliale: "",
    cycleCotisation: "",
    motivations: "",
    competences: "",
    disponibilites: "",
    accepteStatuts: false,
    accepteCotisation: false,
  });
  const [photoFile, setPhotoFile]       = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [sent, setSent] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const compressed = await compressImage(file);
    setPhotoPreview(compressed);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.prenom || !form.email || !form.anneeObtention) {
      toast.error("Veuillez remplir tous les champs obligatoires (*).");
      return;
    }
    if (!form.cycleCotisation) {
      toast.error("Veuillez sélectionner un cycle de cotisation.");
      return;
    }
    if (!form.accepteStatuts || !form.accepteCotisation) {
      toast.error("Veuillez accepter les conditions d'adhésion.");
      return;
    }
    await new Promise(r => setTimeout(r, 1000));

    // Sauvegarde dans la file d'attente de l'Annuaire
    const nomComplet = `${form.prenom} ${form.nom}`.trim();
    addPending({
      nom: nomComplet,
      profession: [form.profession, form.fonctionActuelle].filter(Boolean).join(" — ") || "Non renseigné",
      ville: form.ville || "Non renseignée",
      pays: form.pays || "Togo",
      email: form.email,
      telephone: form.tel,
      anniversaire: "",
      role: "Membre actif",
      photo: photoPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(nomComplet)}&background=064e3b&color=6ee7b7&size=200`,
      employeur: form.employeur,
      specialite: form.specialite,
      anneeObtention: form.anneeObtention,
      cycleCotisation: form.cycleCotisation,
      motivations: form.motivations,
    });

    setSent(true);
    toast.success("Demande d'adhésion envoyée avec succès !");
  };

  const Field = ({ label, required, children }) => (
    <div>
      <label className="text-sm font-medium text-foreground mb-1.5 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );

  const Section = ({ icon: Icon, title, children }) => (
    <div className="mb-8">
      <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-heading text-base font-bold text-foreground">{title}</h3>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );

  return (
    <div>
      <SEO title="Adhésion" description="Rejoignez Ma Belle Promo, l'association des anciens diplômés de la Faculté de Droit du Développement de l'Université de Lomé (1994-2000)." path="/implications/adhesion" />
      <PageHero title="Adhésion" subtitle="Implications — Rejoignez-nous" />

      <section className="py-20 max-w-5xl mx-auto px-6">

        {/* Processus */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {etapes.map((e) => (
            <div key={e.num} className="relative text-center p-5 bg-card border border-border rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-foreground text-xs font-bold">{e.num}</span>
              </div>
              <h4 className="font-semibold text-foreground text-sm mb-1">{e.titre}</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">{e.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Formulaire */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-8"
        >
          <div className="mb-8">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Formulaire d'adhésion</h2>
            <p className="text-muted-foreground text-sm">Les champs marqués d'un <span className="text-red-500">*</span> sont obligatoires.</p>
          </div>

          {sent ? (
            <div className="text-center py-14">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-3">Demande envoyée !</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">Nous avons bien reçu votre dossier d'adhésion. Le bureau exécutif vous contactera dans les 48 heures.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">

              {/* Identité */}
              <Section icon={User} title="Identité & État civil">
                <Field label="Civilité" required>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm" value={form.civilite} onChange={update("civilite")}>
                    <option value="">Sélectionner</option>
                    <option>Madame</option>
                    <option>Monsieur</option>
                  </select>
                </Field>
                <Field label="Nom de famille" required><Input placeholder="Votre nom" value={form.nom} onChange={update("nom")} /></Field>
                <Field label="Prénom(s)" required><Input placeholder="Votre prénom" value={form.prenom} onChange={update("prenom")} /></Field>
                <Field label="Date de naissance"><Input type="date" value={form.dateNaissance} onChange={update("dateNaissance")} /></Field>
                <Field label="Lieu de naissance"><Input placeholder="Ville, Pays" value={form.lieuNaissance} onChange={update("lieuNaissance")} /></Field>
                <Field label="Nationalité"><Input placeholder="Togolaise" value={form.nationalite} onChange={update("nationalite")} /></Field>
                <Field label="Situation familiale">
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm" value={form.situationFamiliale} onChange={update("situationFamiliale")}>
                    <option value="">Sélectionner</option>
                    <option>Célibataire</option>
                    <option>Marié(e)</option>
                    <option>Divorcé(e)</option>
                    <option>Veuf/Veuve</option>
                  </select>
                </Field>
                <div className="md:col-span-2">
                  <Field label="Photo d'identité">
                    <div className="flex items-center gap-5">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Aperçu" className="w-20 h-20 rounded-xl object-cover border border-border flex-shrink-0" />
                      ) : (
                        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 flex-shrink-0">
                          <Upload className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <input type="file" accept="image/*" id="photoIdentite" className="hidden" onChange={handlePhoto} />
                        <label htmlFor="photoIdentite" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          {photoFile ? photoFile.name : "Choisir une photo"}
                        </label>
                        <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG · max 2 Mo</p>
                      </div>
                    </div>
                  </Field>
                </div>
              </Section>

              {/* Coordonnées */}
              <Section icon={MapPin} title="Coordonnées">
                <Field label="Adresse postale"><Input placeholder="Rue, quartier" value={form.adresse} onChange={update("adresse")} /></Field>
                <Field label="Ville de résidence"><Input placeholder="Ex: Lomé" value={form.ville} onChange={update("ville")} /></Field>
                <Field label="Pays de résidence"><Input placeholder="Ex: Togo" value={form.pays} onChange={update("pays")} /></Field>
                <Field label="Email principal" required><Input type="email" placeholder="votre@email.com" value={form.email} onChange={update("email")} /></Field>
                <Field label="Téléphone principal" required><Input placeholder="+228 00 00 00 00" value={form.tel} onChange={update("tel")} /></Field>
                <Field label="Téléphone secondaire"><Input placeholder="+228 00 00 00 00" value={form.telSecondaire} onChange={update("telSecondaire")} /></Field>
              </Section>

              {/* Formation */}
              <Section icon={GraduationCap} title="Parcours académique — FDD Lomé">
                <Field label="Année d'obtention du diplôme" required><Input placeholder="Ex: 1998" value={form.anneeObtention} onChange={update("anneeObtention")} /></Field>
                <Field label="Mention obtenue">
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm" value={form.mention} onChange={update("mention")}>
                    <option value="">Sélectionner</option>
                    <option>Passable</option>
                    <option>Assez Bien</option>
                    <option>Bien</option>
                    <option>Très Bien</option>
                  </select>
                </Field>
                <Field label="Spécialité / Filière"><Input placeholder="Ex: Droit privé, Droit public..." value={form.specialite} onChange={update("specialite")} /></Field>
              </Section>

              {/* Profession */}
              <Section icon={Briefcase} title="Situation professionnelle">
                <Field label="Profession / Métier" required><Input placeholder="Ex: Avocat, Magistrat, Juriste..." value={form.profession} onChange={update("profession")} /></Field>
                <Field label="Employeur / Structure"><Input placeholder="Cabinet, entreprise, institution..." value={form.employeur} onChange={update("employeur")} /></Field>
                <Field label="Fonction actuelle"><Input placeholder="Ex: Associé, Directeur..." value={form.fonctionActuelle} onChange={update("fonctionActuelle")} /></Field>
                <Field label="Année de début dans le poste actuel"><Input placeholder="Ex: 2019" value={form.anneeDebutPoste} onChange={update("anneeDebutPoste")} /></Field>
                <Field label="Secteur d'activité"><Input placeholder="Ex: Droit des affaires, Justice..." value={form.secteurActivite} onChange={update("secteurActivite")} /></Field>
              </Section>

              {/* Engagement */}
              <Section icon={Heart} title="Engagement associatif">
                <div className="md:col-span-2">
                  <Field label="Motivations pour rejoindre Ma Belle Promo">
                    <textarea
                      rows={3}
                      placeholder="Pourquoi souhaitez-vous adhérer à notre association ?"
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                      value={form.motivations}
                      onChange={update("motivations")}
                    />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Compétences / Domaines d'expertise à apporter">
                    <textarea
                      rows={3}
                      placeholder="Quelles compétences souhaitez-vous mettre au service de l'association ?"
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                      value={form.competences}
                      onChange={update("competences")}
                    />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Disponibilités pour les activités associatives">
                    <Input placeholder="Ex: weekends, soirées, activités ponctuelles..." value={form.disponibilites} onChange={update("disponibilites")} />
                  </Field>
                </div>
              </Section>

              {/* Cycle de cotisation */}
              <div className="mb-8">
                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-border">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-foreground">Modalités de cotisation</h3>
                </div>
                <Field label="Cycle de cotisation souhaité" required>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                    value={form.cycleCotisation}
                    onChange={update("cycleCotisation")}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="mensuel">Mensuel</option>
                    <option value="trimestriel">Trimestriel</option>
                    <option value="semestriel">Semestriel</option>
                    <option value="annuel">Annuel</option>
                  </select>
                </Field>
              </div>

              {/* Engagements */}
              <div className="mb-6 space-y-3">
                <h3 className="font-heading text-base font-bold text-foreground mb-4">Déclaration et engagements</h3>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={form.accepteStatuts} onChange={update("accepteStatuts")} className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    Je déclare avoir pris connaissance des <strong>statuts et du règlement intérieur</strong> de Ma Belle Promo et m'engage à les respecter. <span className="text-red-500">*</span>
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={form.accepteCotisation} onChange={update("accepteCotisation")} className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    Je m'engage à régler la <strong>cotisation annuelle</strong> selon les modalités en vigueur et à participer activement à la vie de l'association. <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>

              <Button type="submit" className="w-full h-12 rounded-full gap-2 text-sm font-semibold">
                Soumettre ma demande d'adhésion <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}
        </motion.div>
      </section>
    </div>
  );
}