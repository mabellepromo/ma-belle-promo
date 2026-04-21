// @ts-nocheck
import { motion } from "framer-motion";
import PageHero from "../components/PageHero";
import SEO from "../components/SEO";
import {
  Network, Heart, Landmark, Megaphone,
  Users, Mic2, Globe2, GraduationCap,
  CheckCircle2, UserCircle2, ChevronRight,
  Scale, MapPin, Handshake, CalendarDays, Radio,
  Building2, FileText, Award, Target,
  BookOpen, Briefcase, Shield, Plane,
  ClipboardList, AlertCircle, TrendingUp,
} from "lucide-react";

// ── Framer Motion ─────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.55, delay },
});

// ── Données ───────────────────────────────────────────────────────────────────

const OBJECTIFS_INSTITUTIONNELS = [
  { Icon: Network,       text: "Réseautage entre membres et avec l'écosystème juridique et professionnel togolais" },
  { Icon: Shield,        text: "Lobbying et défense des intérêts collectifs des membres" },
  { Icon: GraduationCap, text: "Soutien aux étudiant·es en droit : mentorat, aides, bourses, stages et emplois" },
  { Icon: Plane,         text: "Facilitation du retour et de l'intégration des promotionnaires de la diaspora" },
  { Icon: Globe2,        text: "Relations privilégiées entre membres résidents et membres de la diaspora" },
  { Icon: CalendarDays,  text: "Partage d'expériences par l'organisation d'événements fédérateurs" },
];

const AVANTAGES_ASSOCIATION = [
  "Clarté des priorités et des orientations",
  "Responsabilisation des membres coordinateurs",
  "Meilleure mobilisation des ressources",
  "Suivi et évaluation facilités",
  "Renforcement de la crédibilité institutionnelle",
];

const AVANTAGES_MEMBRES = [
  "Visibilité sur les actions à venir",
  "Rôles et responsabilités clairement définis",
  "Cadre de travail collaboratif et structuré",
  "Opportunité de contribuer concrètement",
  "Sentiment d'appartenance renforcé",
];

const OBJECTIFS_STRATEGIQUES = [
  {
    num: "O1", titre: "Réseautage & Mentorat",
    desc: "Connexions durables entre anciens et étudiants, programme formel de mentorat opérationnel, plateforme numérique active, webinaires réguliers organisés.",
    Icon: Network, color: "bg-primary/10 text-primary",
  },
  {
    num: "O2", titre: "Engagement Social & Communautaire",
    desc: "Trois communautés identifiées et engagées (Sanguera, Zalivé, Agbodrafo), cliniques juridiques gratuites organisées, réputation de MBP comme ressource juridique fiable consolidée.",
    Icon: Heart, color: "bg-rose-500/10 text-rose-600",
  },
  {
    num: "O3", titre: "Assise Institutionnelle",
    desc: "Gouvernance interne renforcée, assemblées générales tenues régulièrement, participation et engagement des membres maintenus à un niveau élevé.",
    Icon: Landmark, color: "bg-amber-500/10 text-amber-600",
  },
  {
    num: "O4", titre: "Visibilité & Communication",
    desc: "Présence en ligne professionnelle et régulière, site web actif, couverture sur les réseaux sociaux, membres valorisés à travers des publications de parcours.",
    Icon: Megaphone, color: "bg-blue-500/10 text-blue-600",
  },
];

const DOMAINES_AXE1 = [
  { num: "1", label: "Réseautage & Mentorat",          Icon: Network,      color: "bg-primary/10 text-primary" },
  { num: "2", label: "Soutien aux étudiants",           Icon: GraduationCap,color: "bg-green-500/10 text-green-600" },
  { num: "3", label: "Partenariat Faculté de Droit",    Icon: Landmark,     color: "bg-violet-500/10 text-violet-600" },
  { num: "4", label: "Engagement communautaire",        Icon: Heart,        color: "bg-rose-500/10 text-rose-600" },
  { num: "5", label: "Développement professionnel",     Icon: Briefcase,    color: "bg-amber-500/10 text-amber-600" },
  { num: "6", label: "Publications & Recherche",        Icon: BookOpen,     color: "bg-blue-500/10 text-blue-600" },
];

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
  "Barthélemy ABBEY",
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
  "Rabiatou Iyabo BELLO",
];

const COMMUNAUTES = [
  {
    nom: "Sanguera",
    responsable: "André Kangni AFANOU",
    desc: "Diagnostic participatif des besoins et mise en œuvre d'au moins une action concrète sur l'année.",
    color: "border-t-primary bg-primary/5",
  },
  {
    nom: "Zalivé",
    responsable: "Erick FIOKLOU-TOULAN · Joël AGBEMELO · Francisco KPODAR",
    desc: "Sensibilisation aux droits et projets communautaires en partenariat direct avec les populations.",
    color: "border-t-rose-400 bg-rose-500/5",
  },
  {
    nom: "Agbodrafo",
    responsable: "Francisco KPODAR",
    desc: "Contact avec les leaders locaux, identification des besoins prioritaires et actions de sensibilisation.",
    color: "border-t-amber-400 bg-amber-500/5",
  },
];

const ETAPES_COMMUNAUTE = [
  { num: "01", text: "Prendre contact avec les autorités locales et les leaders communautaires" },
  { num: "02", text: "Organiser une réunion de diagnostic participatif pour identifier les besoins prioritaires" },
  { num: "03", text: "Proposer et mettre en œuvre au moins une action concrète par communauté sur l'année" },
  { num: "04", text: "Rédiger un rapport d'activité à soumettre au Bureau" },
];

const OBLIGATIONS_RESPONSABLES = [
  {
    Icon: BookOpen,
    titre: "Prise de connaissance",
    desc: "Lire attentivement le présent document et la description de son activité.",
  },
  {
    Icon: ClipboardList,
    titre: "Plan de mise en œuvre",
    desc: "Préparer un plan détaillé incluant calendrier prévisionnel, budget estimatif et ressources nécessaires.",
  },
  {
    Icon: Target,
    titre: "Soumission au Bureau",
    desc: "Soumettre ce plan au Bureau dans un délai de deux (2) semaines à compter de la réception du présent document.",
  },
  {
    Icon: TrendingUp,
    titre: "Compte rendu régulier",
    desc: "Rendre compte de l'avancement de son activité lors de chaque réunion du Bureau.",
  },
  {
    Icon: AlertCircle,
    titre: "Alerte sans délai",
    desc: "Informer immédiatement le Bureau en cas de difficulté ou de besoin de soutien.",
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

function ActivityHeader({ barColor, title, coordinator }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="flex items-center gap-2">
        <div className={`w-1 h-6 rounded-full ${barColor}`} />
        <h3 className="font-heading text-2xl font-bold text-foreground">{title}</h3>
      </div>
      {coordinator && <Coordinator name={coordinator} />}
    </div>
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
        description="Feuille de route MBP 2026 : contexte, objectifs stratégiques, réseautage, mentorat, engagement communautaire, gouvernance et communication. Adopté en mars 2026."
        path="/activites/plan-action-2026"
      />

      <PageHero
        title="Plan d'Action 2026"
        subtitle="Feuille de route — Adoption mars 2026"
      />

      {/* ══════════════════════════════════════════════════════════════════════
          INTRO — Citation & Métadonnées
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 pt-14 pb-4">
        <motion.div {...fadeUp(0)} className="grid md:grid-cols-3 gap-6 items-start">

          <div className="md:col-span-2 bg-foreground text-white rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl translate-y-6 -translate-x-6" />
            <div className="relative z-10">
              <p className="text-3xl font-heading font-light text-accent mb-1 leading-none">"</p>
              <p className="text-white/85 text-sm leading-relaxed italic mb-5">
                Ce document constitue notre feuille de route commune. Il traduit notre ambition collective
                de faire de MBP une association plus active, plus structurée et plus utile à ses membres
                comme aux communautés que nous souhaitons servir. Il est à la fois un engagement
                vis-à-vis de nos valeurs fondatrices — solidarité, entraide, partage — et un outil pratique
                pour orienter et coordonner nos actions tout au long de l'année.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-accent" />
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">La Présidente de Ma Belle Promo</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: "Date d'adoption", value: "Mars 2026" },
              { label: "Période couverte", value: "Année 2026" },
              { label: "Axes stratégiques", value: "3 axes" },
              { label: "Objectifs stratégiques", value: "4 objectifs" },
              { label: "Activités planifiées", value: "5 activités" },
              { label: "Communautés cibles", value: "3 communautés" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-card border border-border rounded-xl px-4 py-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
                <p className="font-heading text-lg font-bold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CONTEXTE — Qui est MBP & Objectifs institutionnels
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <motion.div {...fadeUp(0)} className="mb-10">
          <p className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-2">Contexte</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Qui sommes-nous ?
          </h2>
          <p className="text-muted-foreground max-w-3xl leading-relaxed">
            Ma Belle Promo (MBP) est une association regroupant des ancien·nes étudiant·es de la
            Faculté de Droit de l'Université de Lomé, issus de la promotion 1994 à 2000.
            Fondée sur des valeurs cardinales de <strong className="text-foreground">solidarité, d'entraide et de fraternité</strong>,
            MBP a conduit un premier cycle d'activités sur la période 2023–2025 et adopte ce plan
            pour 2026 avec une ambition renouvelée de structuration, de professionnalisation
            et d'impact durable.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {OBJECTIFS_INSTITUTIONNELS.map((obj, i) => {
            const { Icon } = obj;
            return (
              <motion.div
                key={i}
                {...fadeUp(i * 0.07)}
                className="bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-foreground leading-relaxed group-hover:text-primary/90 transition-colors">
                  {obj.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          POURQUOI PLANIFIER — Avantages
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-muted/40 border-y border-border py-14">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp(0)} className="mb-10 text-center">
            <p className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-2">Gouvernance</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
              Pourquoi planifier nos actions ?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              La planification est un pilier de la bonne gouvernance associative. Elle permet à MBP
              d'agir de manière cohérente, prévisible et efficace, en optimisant les ressources
              humaines, financières et organisationnelles disponibles.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Pour l'association */}
            <motion.div {...fadeUp(0.05)} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground">Pour l'association</h3>
              </div>
              <ul className="space-y-3">
                {AVANTAGES_ASSOCIATION.map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Pour les membres */}
            <motion.div {...fadeUp(0.12)} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground">Pour les membres</h3>
              </div>
              <ul className="space-y-3">
                {AVANTAGES_MEMBRES.map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-accent" />
                    </div>
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          OBJECTIFS STRATÉGIQUES
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <motion.div {...fadeUp(0)} className="text-center mb-10">
          <p className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-2">Vision 2026</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Quatre objectifs stratégiques</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm">
            Chaque axe de travail contribue à l'un de ces objectifs fondamentaux, assortis de résultats mesurables.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {OBJECTIFS_STRATEGIQUES.map((obj, i) => {
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

      {/* ══════════════════════════════════════════════════════════════════════
          AXE 1 — ACTIVITÉS DE L'ASSOCIATION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-primary/[0.03] border-y border-border py-14">
        <div className="max-w-5xl mx-auto px-6">
          <SectionHeader
            num="01" label="Axe"
            titre="Activités de l'Association"
            desc="L'axe 1 regroupe l'ensemble des activités opérationnelles de MBP, organisées autour de six grands domaines d'action complémentaires."
            Icon={Network}
            tagClass="bg-primary/10 text-primary border-primary/20"
            iconClass="bg-primary/10 text-primary"
          />

          {/* 6 domaines d'action */}
          <motion.div {...fadeUp(0)} className="mb-12">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Six domaines d'action</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DOMAINES_AXE1.map((d, i) => {
                const { Icon } = d;
                return (
                  <motion.div
                    key={d.num}
                    {...fadeUp(i * 0.06)}
                    className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-primary/20 hover:shadow-sm transition-all duration-200"
                  >
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${d.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground block">#{d.num}</span>
                      <span className="text-xs font-semibold text-foreground leading-tight">{d.label}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* ── Activité 1.1 — Réseautage & Mentorat ── */}
          <motion.div {...fadeUp(0)} className="mb-12">
            <ActivityHeader
              barColor="bg-primary"
              title="Activité 1.1 — Réseautage & Mentorat"
              coordinator="Olive B.K. AYENA (coord.)"
            />
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              Cœur de la mission MBP. Créer et entretenir des liens solides entre membres
              et étudiants actuels en droit, via événements en présentiel, mentorat structuré
              et outils numériques.
            </p>

            <div className="space-y-5">
              <SubActivityCard num="1.1.a" titre="Événements de réseautage"
                Icon={Users} iconColor="bg-primary/10 text-primary" delay={0}>
                <div className="flex flex-wrap gap-2 mb-3 text-[11px] text-muted-foreground">
                  {["Rencontres informelles entre anciens et étudiants", "Cocktails et déjeuners de networking", "Conférences et ateliers thématiques"].map(t => (
                    <span key={t} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                      <ChevronRight className="w-3 h-3 text-primary" />{t}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Événements conviviaux organisés à intervalles réguliers. Olive B.K. AYENA planifie
                  les dates, identifie et réserve les lieux, constitue les listes d'invités et assure
                  la communication préalable. Chaque événement fait l'objet d'un compte rendu
                  et d'un suivi des contacts établis.
                </p>
                <ul className="space-y-1.5">
                  <ResultBadge>Connexions durables établies entre membres actuels et anciens</ResultBadge>
                  <ResultBadge>Étudiants bénéficiant de conseils pratiques et de l'expérience des membres</ResultBadge>
                </ul>
              </SubActivityCard>

              <SubActivityCard num="1.1.b" titre="Programme formel de mentorat"
                Icon={GraduationCap} iconColor="bg-green-500/10 text-green-600" delay={0.08}>
                <div className="flex flex-wrap gap-2 mb-3 text-[11px] text-muted-foreground">
                  {["Mise en relation formelle mentor–mentoré", "Conseils académiques et orientation professionnelle", "Suivi régulier des binômes"].map(t => (
                    <span key={t} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                      <ChevronRight className="w-3 h-3 text-green-600" />{t}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Dispositif structuré : membres volontaires de MBP servent de mentors à des étudiants
                  désignés. Au moins une rencontre par mois par binôme. Un guide du mentor est élaboré
                  pour harmoniser les pratiques.
                </p>
                <ul className="space-y-1.5">
                  <ResultBadge>Transition des étudiants vers le monde professionnel facilitée</ResultBadge>
                  <ResultBadge>Compétences et réseau développés grâce à l'accompagnement personnalisé</ResultBadge>
                </ul>
              </SubActivityCard>

              <SubActivityCard num="1.1.c" titre="Plateforme en ligne"
                Icon={Globe2} iconColor="bg-blue-500/10 text-blue-600" delay={0.16}>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Coordinator name="Olive B.K. AYENA — modération" />
                  <Coordinator name="Joël AGBEMELO — offres d'emploi & stages (2×/mois)" />
                </div>
                <div className="flex flex-wrap gap-2 mb-3 text-[11px] text-muted-foreground">
                  {["Espace d'interaction numérique", "Offres d'emploi et de stages", "Articles juridiques et ressources documentaires"].map(t => (
                    <span key={t} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                      <ChevronRight className="w-3 h-3 text-blue-600" />{t}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Espace numérique centralisé pour les échanges entre membres. Des règles
                  de publication et de bonne conduite sont définies pour garantir la qualité
                  des échanges.
                </p>
                <ul className="space-y-1.5">
                  <ResultBadge>Communication continue entre membres facilitée</ResultBadge>
                  <ResultBadge>Opportunités professionnelles partagées en temps réel et accessibles à tous</ResultBadge>
                </ul>
              </SubActivityCard>

              <SubActivityCard num="1.1.d" titre="Webinaires & Conférences en ligne"
                Icon={Mic2} iconColor="bg-violet-500/10 text-violet-600" delay={0.24}>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Coordinator name="Georges KOUTOH (coord.)" />
                  <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
                    <CalendarDays className="w-3.5 h-3.5" /> Début : avril 2026
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3 text-[11px] text-muted-foreground">
                  {["Thématiques juridiques d'actualité", "Experts membres ou extérieurs à MBP", "Sessions d'information professionnelles"].map(t => (
                    <span key={t} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                      <ChevronRight className="w-3 h-3 text-violet-600" />{t}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  À partir d'avril 2026, Georges KOUTOH organise des webinaires à périodicité
                  régulière (mensuelle ou bimensuelle). Il identifie les thèmes pertinents, mobilise
                  les intervenants et gère la logistique technique. Un compte rendu est produit
                  après chaque session.
                </p>
                <ul className="space-y-1.5">
                  <ResultBadge>Membres bénéficiant d'opportunités d'apprentissage continu</ResultBadge>
                  <ResultBadge>Information régulière sur les évolutions juridiques dans chaque domaine</ResultBadge>
                </ul>
              </SubActivityCard>
            </div>
          </motion.div>

          {/* ── Activité 1.2 — Publications valorisation ── */}
          <motion.div {...fadeUp(0)} className="mb-12">
            <ActivityHeader
              barColor="bg-accent"
              title="Activité 1.2 — Publications de valorisation des membres"
              coordinator="Coordination collective"
            />
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              Mettre en lumière les réussites professionnelles des membres à travers des publications
              régulières sur leurs parcours et accomplissements. Double finalité : inspirer les étudiants
              en droit et renforcer la fierté d'appartenance à MBP.
            </p>

            <div className="bg-card border border-border rounded-2xl p-6 mb-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                {MEMBRES_PUBLICATIONS.length} membres dont le parcours sera publié
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {MEMBRES_PUBLICATIONS.map((nom, i) => (
                  <motion.span
                    key={nom}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.025 }}
                    className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold hover:bg-primary/20 transition-colors cursor-default"
                  >
                    {nom}
                  </motion.span>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-5 border-t border-border">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Chaque publication inclura</p>
                  <div className="space-y-2">
                    {[
                      "Présentation du parcours académique et professionnel",
                      "Réussites notables",
                      "Témoignage ou citation inspirante",
                      "Photo professionnelle",
                    ].map(item => (
                      <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />{item}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Canaux de diffusion</p>
                  <div className="space-y-2">
                    {["Site web mabellepromo.org", "Réseaux sociaux MBP", "Newsletter mensuelle"].map(item => (
                      <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="w-3.5 h-3.5 text-accent flex-shrink-0" />{item}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-primary/5 border border-primary/15 rounded-xl">
                    <p className="text-xs text-primary font-semibold">
                      Un calendrier de publication est établi pour garantir une diffusion régulière et équilibrée.
                      Les membres concernés sont contactés en amont pour validation de leur contenu.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <ul className="space-y-1.5">
              <ResultBadge>Étudiants en droit inspirés par les succès de leurs pairs</ResultBadge>
              <ResultBadge>Cohésion interne de MBP renforcée et image de l'association valorisée</ResultBadge>
            </ul>
          </motion.div>

          {/* ── Activité 1.3 — Engagement communautaire ── */}
          <motion.div {...fadeUp(0)}>
            <ActivityHeader barColor="bg-rose-400" title="Activité 1.3 — Engagement Social & Communautaire" />
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              Dimension citoyenne et solidaire de MBP. Engagement direct dans trois communautés
              cibles du Togo à travers des actions concrètes et des cliniques juridiques gratuites.
            </p>

            {/* 3 communautés */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {COMMUNAUTES.map((c, i) => (
                <motion.div key={c.nom} {...fadeUp(i * 0.1)}
                  className={`border-t-4 border-border rounded-2xl p-5 bg-card hover:shadow-md transition-all duration-300 ${c.color}`}>
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

            {/* Process 4 étapes */}
            <motion.div {...fadeUp(0.1)} className="bg-card border border-border rounded-2xl p-6 mb-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5">
                Processus d'engagement — 4 étapes par communauté
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {ETAPES_COMMUNAUTE.map((e, i) => (
                  <div key={e.num} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center flex-shrink-0 font-heading font-bold text-sm">
                      {e.num}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed pt-1">{e.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Cliniques juridiques */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center bg-rose-500/10 text-rose-600">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-1">1.3.b</p>
                  <h4 className="font-heading text-lg font-bold text-foreground mb-2">Cliniques de conseils juridiques gratuits</h4>
                  <div className="flex flex-wrap gap-2 mb-3 text-[11px] text-muted-foreground">
                    {["Consultations gratuites pour les populations vulnérables", "Sensibilisation aux droits et aux procédures", "Orientation vers les structures compétentes"].map(t => (
                      <span key={t} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                        <ChevronRight className="w-3 h-3 text-rose-500" />{t}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    Cliniques itinérantes dans les trois communautés cibles. Membres juristes de MBP
                    assurant des consultations gratuites en droit civil, foncier, familial et pénal.
                    Le Bureau coordonne les inscriptions des membres volontaires et la logistique.
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

      {/* ══════════════════════════════════════════════════════════════════════
          AXE 2 — RENFORCEMENT INSTITUTIONNEL
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-amber-500/[0.03] border-b border-border py-14">
        <div className="max-w-5xl mx-auto px-6">
          <SectionHeader
            num="02" label="Axe"
            titre="Renforcement de l'Assise Institutionnelle"
            desc="Une association solide est une association bien gouvernée, dont les membres s'impliquent activement dans les instances de décision et dont le fonctionnement est transparent et régulier."
            Icon={Landmark}
            tagClass="bg-amber-500/10 text-amber-700 border-amber-200"
            iconClass="bg-amber-500/10 text-amber-600"
          />

          <motion.div {...fadeUp(0)} className="mb-8">
            <ActivityHeader barColor="bg-amber-400" title="Activité 2.1 — Consolidation de la gouvernance interne" coordinator="Bureau de MBP" />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 2.1.a Réunions du Bureau */}
            <motion.div {...fadeUp(0)} className="bg-card border border-border rounded-2xl p-6 hover:shadow-md hover:border-amber-400/30 transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center bg-amber-500/10 text-amber-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground tracking-widest uppercase mb-2">2.1.a</p>
                  <h3 className="font-heading text-xl font-bold text-foreground group-hover:text-amber-700 transition-colors mb-3">
                    Réunions du Bureau
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3 text-[11px] text-muted-foreground">
                    {["Tenue régulière des réunions", "Suivi du plan de travail", "Prises de décisions stratégiques"].map(t => (
                      <span key={t} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                        <ChevronRight className="w-3 h-3 text-amber-500" />{t}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Fréquence mensuelle recommandée. Chaque coordinateur d'activité présente
                    un point de situation. Procès-verbaux systématiquement rédigés et archivés.
                  </p>
                  <ul className="space-y-1.5 mb-4">
                    <ResultBadge>Gouvernance interne renforcée</ResultBadge>
                    <ResultBadge>Décisions stratégiques prises en temps utile</ResultBadge>
                    <ResultBadge>Suivi régulier du plan de travail assuré</ResultBadge>
                  </ul>
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Indicateurs</p>
                    <div className="flex flex-wrap gap-2">
                      {["Fréquence des réunions", "Taux de participation", "Respect du calendrier"].map(ind => (
                        <span key={ind} className="flex items-center gap-1 text-[11px] text-muted-foreground bg-amber-500/8 px-2 py-1 rounded-full">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />{ind}
                        </span>
                      ))}
                    </div>
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
                  <p className="text-[10px] font-black text-muted-foreground tracking-widest uppercase mb-2">2.1.b</p>
                  <h3 className="font-heading text-xl font-bold text-foreground group-hover:text-amber-700 transition-colors mb-3">
                    Assemblées Générales
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3 text-[11px] text-muted-foreground">
                    {["Convocation et tenue des AG ordinaires", "Information et consultation des membres", "Validation des grandes orientations"].map(t => (
                      <span key={t} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                        <ChevronRight className="w-3 h-3 text-amber-500" />{t}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Au moins une AG ordinaire dans l'année. Convocation avec ordre du jour
                    dans les délais statutaires. Bilan des activités, perspectives et décisions
                    formalisées dans un procès-verbal officiel.
                  </p>
                  <ul className="space-y-1.5 mb-4">
                    <ResultBadge>Membres informés et consultés sur les grandes orientations</ResultBadge>
                    <ResultBadge>Démocratie interne renforcée</ResultBadge>
                    <ResultBadge>Engagement des membres dans la vie associative stimulé</ResultBadge>
                  </ul>
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Indicateurs</p>
                    <div className="flex flex-wrap gap-2">
                      {["Nombre d'AG tenues", "Taux de participation et d'engagement"].map(ind => (
                        <span key={ind} className="flex items-center gap-1 text-[11px] text-muted-foreground bg-amber-500/8 px-2 py-1 rounded-full">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />{ind}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          AXE 3 — COMMUNICATION & VISIBILITÉ
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-blue-500/[0.03] border-b border-border py-14">
        <div className="max-w-5xl mx-auto px-6">
          <SectionHeader
            num="03" label="Axe"
            titre="Communication & Visibilité"
            desc="Présence externe de MBP : identité professionnelle en ligne, réseaux sociaux, newsletter et couverture photo/vidéo des événements. Le responsable Communication développe et met en œuvre une stratégie digitale cohérente."
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
                <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Médias & Réseaux Sociaux</h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  Un calendrier éditorial annuel est établi, précisant les types de contenus, les
                  plateformes cibles et la fréquence de publication. Les publications de valorisation
                  des membres (Activité 1.2) s'inscrivent dans ce plan de communication global.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  {[
                    { icon: Globe2,    label: "Site web", desc: "Création et mise à jour régulière — mabellepromo.org" },
                    { icon: Megaphone, label: "Réseaux sociaux", desc: "Facebook, LinkedIn, Twitter/X, Instagram, TikTok" },
                    { icon: FileText,  label: "Newsletter", desc: "Diffusion régulière et autres supports de communication" },
                    { icon: Award,     label: "Couverture événements", desc: "Photos, vidéos et comptes rendus de tous les événements MBP" },
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
                    {["Fréquence des publications", "Nombre d'abonnés et d'interactions", "Trafic sur le site web"].map(ind => (
                      <span key={ind} className="text-[11px] bg-blue-500/10 text-blue-700 border border-blue-200 px-3 py-1 rounded-full">
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

      {/* ══════════════════════════════════════════════════════════════════════
          DISPOSITIONS FINALES — 5 obligations
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <motion.div {...fadeUp(0)} className="mb-10">
          <p className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-2">Mise en œuvre</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
            Dispositions finales
          </h2>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Ce plan engage l'ensemble des membres et en particulier les coordinatrices et coordinateurs
            des différentes activités. Chaque responsable d'activité est invité à respecter
            les cinq obligations suivantes.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {OBLIGATIONS_RESPONSABLES.map((ob, i) => {
            const { Icon } = ob;
            return (
              <motion.div key={ob.titre} {...fadeUp(i * 0.08)}
                className="bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:border-primary/20 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center flex-shrink-0 ml-auto">
                    <span className="text-[10px] font-black text-background">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                </div>
                <h4 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors mb-2">{ob.titre}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{ob.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA final */}
        <motion.div {...fadeUp(0)}
          className="bg-foreground text-white rounded-2xl p-8 md:p-12 relative overflow-hidden text-center">
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
              Le Bureau est à la disposition de chaque coordinateur pour accompagner la préparation
              et la mise en œuvre des activités. N'hésitez pas à prendre contact pour tout besoin de soutien.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/implications/adhesion"
                className="px-6 py-3 bg-accent text-foreground text-sm font-bold rounded-full hover:opacity-90 transition-opacity">
                Rejoindre MBP
              </a>
              <a href="/informations/contacts"
                className="px-6 py-3 border border-white/20 text-white text-sm font-semibold rounded-full hover:bg-white/10 transition-colors">
                Contacter le Bureau
              </a>
            </div>
          </div>
        </motion.div>

        <motion.p {...fadeUp(0.1)} className="text-center text-xs text-muted-foreground mt-8">
          Document adopté collectivement lors de la réunion de planification · Lomé, mars 2026 ·{" "}
          <span className="text-primary font-semibold">www.mabellepromo.org</span>
        </motion.p>
      </section>
    </div>
  );
}
