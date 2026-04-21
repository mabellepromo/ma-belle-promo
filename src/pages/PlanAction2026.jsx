// @ts-nocheck
import { motion } from "framer-motion";
import PageHero from "../components/PageHero";
import SEO from "../components/SEO";
import {
  Network, Heart, Landmark, Megaphone,
  Users, Mic2, Globe2, GraduationCap,
  CheckCircle2, UserCircle2, ChevronRight,
  Scale, MapPin, Handshake, CalendarDays, Radio,
  Building2, FileText, Award,
} from "lucide-react";

// ── Variants Framer Motion ────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.55, delay },
});

// ── Données ───────────────────────────────────────────────────────────────────
const OBJECTIFS = [
  {
    num: "O1", titre: "Réseautage & Mentorat",
    desc: "Connexions durables, programme formel de mentorat, webinaires réguliers.",
    Icon: Network, color: "bg-primary/10 text-primary",
  },
  {
    num: "O2", titre: "Engagement Social",
    desc: "Trois communautés engagées, cliniques juridiques gratuites organisées.",
    Icon: Heart, color: "bg-rose-500/10 text-rose-600",
  },
  {
    num: "O3", titre: "Assise Institutionnelle",
    desc: "Gouvernance renforcée, assemblées générales régulières, membres engagés.",
    Icon: Landmark, color: "bg-amber-500/10 text-amber-600",
  },
  {
    num: "O4", titre: "Visibilité & Communication",
    desc: "Site web actif, réseaux sociaux, parcours des membres valorisés.",
    Icon: Megaphone, color: "bg-blue-500/10 text-blue-600",
  },
];

// Noms complets issus de l'annuaire des membres (src/data/members.js)
const MEMBRES_PUBLICATIONS = [
  "Josée Aféfa SALOKOFFI",
  "Falilatou TCHANILE épse DOGO",
  "Georges KOUTOH",
  "Joël AGBEMELO",
  "Abidé BATABA",
  "Francisco KPODAR",
  "Erick FIOKLOU-TOULAN",
  "Edwige KUAGBENU",
  "Claude AMEGAN",
  "Laurent ASSIOBO",
  "Barthélemy",           // non trouvé dans l'annuaire actuel
  "Tata HOUNKANLI",
  "Essi DJEHA-AKUETE",
  "Jean-Yves AKUETE",
  "André Kangni AFANOU",
  "Jovite AGOUZOU épse SODJEDO",
  "Edwige AHONON",
  "Olive B.K. AYENA",
  "Sylvestre BIDE",
  "Sylvestre GOSSOU",
  "Romuald AFATCHAO",
  "Koffi Junior AOUGA",
  "Bibi Bellow",          // non trouvé dans l'annuaire actuel
];

const COMMUNAUTES = [
  {
    nom: "Sanguera",
    responsable: "André Kangni AFANOU",
    desc: "Diagnostic participatif des besoins et mise en œuvre d'au moins une action concrète sur l'année.",
    color: "border-t-primary bg-primary/5",
    dotColor: "bg-primary",
  },
  {
    nom: "Zalivé",
    responsable: "Erick FIOKLOU-TOULAN · Joël AGBEMELO · Francisco KPODAR",
    desc: "Sensibilisation aux droits et projets communautaires en partenariat direct avec les populations.",
    color: "border-t-rose-400 bg-rose-500/5",
    dotColor: "bg-rose-400",
  },
  {
    nom: "Agbodrafo",
    responsable: "Francisco KPODAR",
    desc: "Contact avec les leaders locaux, identification des besoins prioritaires et actions de sensibilisation.",
    color: "border-t-amber-400 bg-amber-500/5",
    dotColor: "bg-amber-400",
  },
];

// ── Composants utilitaires ────────────────────────────────────────────────────

function AxisBadge({ num, label, colorClass }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${colorClass}`}>
      <span>{label}</span>
      <span className="opacity-60">{num}</span>
    </div>
  );
}

function Coordinator({ name }) {
  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1 border border-border">
      <UserCircle2 className="w-3.5 h-3.5 text-primary" />
      <span className="font-medium">{name}</span>
    </div>
  );
}

function ResultBadge({ children }) {
  return (
    <li className="flex items-start gap-2 text-sm text-muted-foreground">
      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}

function SubActivityCard({ num, titre, Icon, iconColor, children, delay = 0 }) {
  return (
    <motion.div {...fadeUp(delay)} className="relative pl-8 before:absolute before:left-2.5 before:top-4 before:bottom-0 before:w-px before:bg-border last:before:hidden">
      <div className="absolute left-0 top-3 w-5 h-5 rounded-full bg-card border-2 border-primary flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
      </div>
      <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-md hover:border-primary/20 transition-all duration-300 group">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-1">{num}</p>
            <h4 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-3">{titre}</h4>
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SectionHeader({ num, label, titre, desc, Icon, tagClass, iconClass }) {
  return (
    <motion.div {...fadeUp(0)} className="mb-10">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <AxisBadge num={num} label={label} colorClass={tagClass} />
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconClass}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">{titre}</h2>
      <p className="text-muted-foreground max-w-2xl">{desc}</p>
      <div className="mt-5 h-px bg-gradient-to-r from-border to-transparent" />
    </motion.div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function PlanAction2026() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Plan d'Action 2026"
        description="Feuille de route MBP 2026 : réseautage, mentorat, engagement communautaire, gouvernance et communication. Plan de travail adopté en mars 2026."
        path="/activites/plan-action-2026"
      />

      <PageHero
        title="Plan d'Action 2026"
        subtitle="Feuille de route — Adoption mars 2026"
      />

      {/* ── Intro ──────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pt-14 pb-4">
        <motion.div {...fadeUp(0)} className="grid md:grid-cols-3 gap-6 items-start">

          {/* Citation présidente */}
          <div className="md:col-span-2 bg-foreground text-white rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl translate-y-6 -translate-x-6" />
            <div className="relative z-10">
              <p className="text-3xl font-heading font-light text-accent mb-1 leading-none">"</p>
              <p className="text-white/85 text-sm leading-relaxed italic mb-5">
                Ce document constitue notre feuille de route commune. Il traduit notre ambition collective
                de faire de MBP une association plus active, plus structurée et plus utile à ses membres
                comme aux communautés que nous souhaitons servir.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-accent" />
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">La Présidente de Ma Belle Promo</span>
              </div>
            </div>
          </div>

          {/* Métadonnées */}
          <div className="space-y-3">
            {[
              { label: "Date d'adoption", value: "Mars 2026" },
              { label: "Période couverte", value: "Année 2026" },
              { label: "Axes stratégiques", value: "3 axes" },
              { label: "Objectifs majeurs", value: "4 objectifs" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-card border border-border rounded-xl px-4 py-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
                <p className="font-heading text-lg font-bold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Objectifs stratégiques ─────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <motion.div {...fadeUp(0)} className="text-center mb-10">
          <p className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-2">Vision 2026</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Quatre objectifs stratégiques</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm">Chaque axe de travail contribue à l'un de ces objectifs fondamentaux.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {OBJECTIFS.map((obj, i) => {
            const { Icon } = obj;
            return (
              <motion.div
                key={obj.num}
                {...fadeUp(i * 0.08)}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${obj.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-muted-foreground tracking-widest">{obj.num}</span>
                      <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">{obj.titre}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{obj.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          AXE 1 — ACTIVITÉS DE L'ASSOCIATION
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-primary/[0.03] border-y border-border py-14">
        <div className="max-w-5xl mx-auto px-6">
          <SectionHeader
            num="01" label="Axe"
            titre="Activités de l'Association"
            desc="Six domaines d'action opérationnels : réseautage, mentorat, publications, partenariat avec la Faculté de Droit, engagement communautaire et publications de recherche."
            Icon={Network}
            tagClass="bg-primary/10 text-primary border-primary/20"
            iconClass="bg-primary/10 text-primary"
          />

          {/* ── Activité 1.1 — Réseautage & Mentorat ── */}
          <motion.div {...fadeUp(0)} className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-primary rounded-full" />
                <h3 className="font-heading text-2xl font-bold text-foreground">Activité 1.1 — Réseautage & Mentorat</h3>
              </div>
              <Coordinator name="Olive B.K. AYENA (coord.)" />
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              Cœur de la mission MBP. Créer et entretenir des liens solides entre membres
              et étudiants actuels en droit, via événements en présentiel, mentorat structuré
              et outils numériques.
            </p>

            <div className="space-y-5">
              <SubActivityCard
                num="1.1.a" titre="Événements de réseautage"
                Icon={Users} iconColor="bg-primary/10 text-primary" delay={0}
              >
                <p className="text-sm text-muted-foreground mb-3">
                  Rencontres informelles, cocktails de networking, conférences et ateliers thématiques
                  organisés à intervalles réguliers.
                </p>
                <ul className="space-y-1.5">
                  <ResultBadge>Connexions durables entre membres actuels et anciens</ResultBadge>
                  <ResultBadge>Conseils pratiques et partage d'expériences aux étudiants</ResultBadge>
                </ul>
              </SubActivityCard>

              <SubActivityCard
                num="1.1.b" titre="Programme formel de mentorat"
                Icon={GraduationCap} iconColor="bg-green-500/10 text-green-600" delay={0.08}
              >
                <p className="text-sm text-muted-foreground mb-3">
                  Dispositif structuré de mise en relation mentor–mentoré. Au moins une rencontre
                  mensuelle par binôme. Guide du mentor élaboré pour harmoniser les pratiques.
                </p>
                <ul className="space-y-1.5">
                  <ResultBadge>Transition vers le monde professionnel facilitée</ResultBadge>
                  <ResultBadge>Compétences et réseau développés grâce à l'accompagnement</ResultBadge>
                </ul>
              </SubActivityCard>

              <SubActivityCard
                num="1.1.c" titre="Plateforme en ligne"
                Icon={Globe2} iconColor="bg-blue-500/10 text-blue-600" delay={0.16}
              >
                <div className="flex flex-wrap gap-2 mb-3">
                  <Coordinator name="Olive B.K. AYENA — modération" />
                  <Coordinator name="Joël AGBEMELO — offres d'emploi & stages (2×/mois)" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Espace numérique centralisé pour les échanges entre membres.
                  Diffusion d'articles juridiques et de ressources documentaires.
                </p>
                <ul className="space-y-1.5">
                  <ResultBadge>Communication continue entre membres facilitée</ResultBadge>
                  <ResultBadge>Opportunités professionnelles accessibles en temps réel</ResultBadge>
                </ul>
              </SubActivityCard>

              <SubActivityCard
                num="1.1.d" titre="Webinaires & Conférences en ligne"
                Icon={Mic2} iconColor="bg-violet-500/10 text-violet-600" delay={0.24}
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Coordinator name="Georges KOUTOH (coord.)" />
                  <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
                    <CalendarDays className="w-3.5 h-3.5" /> Début : avril 2026
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Webinaires sur des thématiques juridiques d'actualité, conférences avec des experts
                  membres ou extérieurs à MBP. Périodicité mensuelle ou bimensuelle.
                </p>
                <ul className="space-y-1.5">
                  <ResultBadge>Apprentissage continu sur les évolutions juridiques</ResultBadge>
                  <ResultBadge>Compte rendu produit après chaque session</ResultBadge>
                </ul>
              </SubActivityCard>
            </div>
          </motion.div>

          {/* ── Activité 1.2 — Publications valorisation ── */}
          <motion.div {...fadeUp(0)} className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                <h3 className="font-heading text-2xl font-bold text-foreground">Activité 1.2 — Publications de valorisation</h3>
              </div>
              <Coordinator name="Coordination collective" />
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              Mettre en lumière les réussites professionnelles des membres à travers des publications
              régulières. Double finalité : inspirer les étudiants en droit et renforcer la fierté
              d'appartenance à MBP.
            </p>

            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                Membres dont le parcours sera publié ({MEMBRES_PUBLICATIONS.length} profils)
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {MEMBRES_PUBLICATIONS.map((nom, i) => (
                  <motion.span
                    key={nom}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    className="px-3 py-1.5 bg-primary/8 text-primary border border-primary/20 rounded-full text-xs font-semibold hover:bg-primary/15 transition-colors"
                  >
                    {nom}
                  </motion.span>
                ))}
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Chaque publication inclura</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    "Parcours académique et professionnel",
                    "Réussites notables",
                    "Témoignage ou citation inspirante",
                    "Photo professionnelle",
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Activité 1.3 — Engagement communautaire ── */}
          <motion.div {...fadeUp(0)}>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-rose-400 rounded-full" />
                <h3 className="font-heading text-2xl font-bold text-foreground">Activité 1.3 — Engagement Communautaire</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              Dimension citoyenne et solidaire de MBP. Engagement direct dans trois communautés
              cibles du Togo avec des actions concrètes et des cliniques juridiques gratuites.
            </p>

            {/* 3 communautés */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {COMMUNAUTES.map((c, i) => (
                <motion.div
                  key={c.nom}
                  {...fadeUp(i * 0.1)}
                  className={`border-t-4 border-border rounded-2xl p-5 bg-card hover:shadow-md transition-all duration-300 ${c.color}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <h4 className="font-heading text-lg font-bold text-foreground">{c.nom}</h4>
                  </div>
                  <div className="mb-3">
                    <Coordinator name={c.responsable} />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Cliniques juridiques */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center bg-rose-500/10 text-rose-600">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-1">1.3.b</p>
                  <h4 className="font-heading text-lg font-bold text-foreground mb-2">Cliniques de conseils juridiques gratuits</h4>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    Cliniques itinérantes organisées dans les trois communautés cibles. Membres juristes
                    de MBP assurant des consultations gratuites sur les questions de droit civil,
                    foncier, familial et pénal.
                  </p>
                  <ul className="space-y-1.5">
                    <ResultBadge>Accès à la justice promu pour les populations vulnérables</ResultBadge>
                    <ResultBadge>Réputation de MBP comme ressource juridique fiable consolidée</ResultBadge>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          AXE 2 — RENFORCEMENT INSTITUTIONNEL
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-amber-500/[0.03] border-b border-border py-14">
        <div className="max-w-5xl mx-auto px-6">
          <SectionHeader
            num="02" label="Axe"
            titre="Renforcement Institutionnel"
            desc="Consolidation interne de MBP. Gouvernance transparente, réunions régulières du Bureau et tenue des Assemblées Générales."
            Icon={Landmark}
            tagClass="bg-amber-500/10 text-amber-700 border-amber-200"
            iconClass="bg-amber-500/10 text-amber-600"
          />

          <div className="grid md:grid-cols-2 gap-6">
            {/* 2.1.a Réunions du Bureau */}
            <motion.div {...fadeUp(0)} className="bg-card border border-border rounded-2xl p-6 hover:shadow-md hover:border-amber-400/30 transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center bg-amber-500/10 text-amber-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">2.1.a</p>
                    <Coordinator name="Bureau de MBP" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-foreground group-hover:text-amber-700 transition-colors mb-3">
                    Réunions du Bureau
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Fréquence mensuelle recommandée. Chaque coordinateur d'activité présente
                    un point de situation. Procès-verbaux systématiquement rédigés et archivés.
                  </p>
                  <ul className="space-y-1.5">
                    <ResultBadge>Gouvernance interne renforcée</ResultBadge>
                    <ResultBadge>Décisions stratégiques prises en temps utile</ResultBadge>
                    <ResultBadge>Suivi régulier du plan de travail assuré</ResultBadge>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-2">
                    {["Fréquence des réunions", "Taux de participation", "Respect du calendrier"].map(ind => (
                      <div key={ind} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        {ind}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 2.1.b Assemblées Générales */}
            <motion.div {...fadeUp(0.1)} className="bg-card border border-border rounded-2xl p-6 hover:shadow-md hover:border-amber-400/30 transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center bg-amber-500/10 text-amber-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">2.1.b</p>
                    <Coordinator name="Bureau de MBP" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-foreground group-hover:text-amber-700 transition-colors mb-3">
                    Assemblées Générales
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Au moins une AG ordinaire dans l'année. Convocation avec ordre du jour dans
                    les délais statutaires. Bilan des activités, perspectives, décisions formalisées
                    dans un procès-verbal officiel.
                  </p>
                  <ul className="space-y-1.5">
                    <ResultBadge>Membres informés et consultés sur les grandes orientations</ResultBadge>
                    <ResultBadge>Démocratie interne renforcée</ResultBadge>
                    <ResultBadge>Engagement des membres dans la vie associative stimulé</ResultBadge>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-2">
                    {["Nombre d'AG tenues", "Taux de participation"].map(ind => (
                      <div key={ind} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        {ind}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          AXE 3 — COMMUNICATION & VISIBILITÉ
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-blue-500/[0.03] border-b border-border py-14">
        <div className="max-w-5xl mx-auto px-6">
          <SectionHeader
            num="03" label="Axe"
            titre="Communication & Visibilité"
            desc="Présence externe de MBP : identité professionnelle en ligne, réseaux sociaux, newsletter et couverture photo/vidéo des événements."
            Icon={Megaphone}
            tagClass="bg-blue-500/10 text-blue-700 border-blue-200"
            iconClass="bg-blue-500/10 text-blue-600"
          />

          <motion.div {...fadeUp(0)} className="bg-card border border-border rounded-2xl p-6 md:p-8 hover:shadow-md hover:border-blue-400/30 transition-all duration-300">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center bg-blue-500/10 text-blue-600">
                <Radio className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <p className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">Activité 3.1</p>
                  <Coordinator name="Responsable Communication MBP" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-foreground mb-4">Médias & Réseaux Sociaux</h3>

                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  {[
                    { icon: Globe2, label: "Site web", desc: "Création et mise à jour régulière du site de l'association" },
                    { icon: Megaphone, label: "Réseaux sociaux", desc: "Facebook, LinkedIn, Twitter/X, Instagram, TikTok" },
                    { icon: FileText, label: "Newsletter", desc: "Diffusion régulière et autres supports de communication" },
                    { icon: Award, label: "Couverture événements", desc: "Photos, vidéos et comptes rendus de tous les événements MBP" },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                      <Icon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-foreground mb-0.5">{label}</p>
                        <p className="text-[11px] text-muted-foreground leading-snug">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <ul className="space-y-1.5 mb-5">
                  <ResultBadge>Visibilité en ligne de MBP accrue</ResultBadge>
                  <ResultBadge>Engagement avec le public et les membres renforcé</ResultBadge>
                  <ResultBadge>Image professionnelle de l'association consolidée</ResultBadge>
                </ul>

                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Indicateurs de suivi</p>
                  <div className="flex flex-wrap gap-2">
                    {["Fréquence des publications", "Abonnés & interactions", "Trafic sur le site web"].map(ind => (
                      <span key={ind} className="text-[11px] bg-blue-500/8 text-blue-700 border border-blue-200 px-3 py-1 rounded-full">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA / Dispositions finales ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <motion.div
          {...fadeUp(0)}
          className="bg-foreground text-white rounded-2xl p-8 md:p-12 relative overflow-hidden text-center"
        >
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid2026" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <circle cx="30" cy="30" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid2026)" />
            </svg>
          </div>
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-accent/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center mx-auto mb-6">
              <Handshake className="w-6 h-6 text-accent" />
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              Ensemble, faisons de 2026<br />une année mémorable
            </h2>
            <p className="text-white/60 max-w-xl mx-auto text-sm leading-relaxed mb-8">
              Ce plan engage chaque coordinateur d'activité. Préparez votre plan de mise en œuvre
              détaillé avec calendrier et budget, et soumettez-le au Bureau dans les deux semaines.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/implications/adhesion"
                className="px-6 py-3 bg-accent text-foreground text-sm font-bold rounded-full hover:opacity-90 transition-opacity"
              >
                Rejoindre MBP
              </a>
              <a
                href="/informations/contacts"
                className="px-6 py-3 border border-white/20 text-white text-sm font-semibold rounded-full hover:bg-white/10 transition-colors"
              >
                Contacter le Bureau
              </a>
            </div>
          </div>
        </motion.div>

        {/* Mention */}
        <motion.p {...fadeUp(0.1)} className="text-center text-xs text-muted-foreground mt-8">
          Document adopté collectivement · Lomé, mars 2026 · <span className="text-primary font-semibold">www.mabellepromo.org</span>
        </motion.p>
      </section>
    </div>
  );
}
