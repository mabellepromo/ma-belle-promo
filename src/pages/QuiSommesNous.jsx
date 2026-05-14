import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Target, Network, GraduationCap, Globe, Heart, Building2 } from "lucide-react";
import SEO from "../components/SEO";

const valeurs = [
  {
    numero: "01",
    titre: "Amitié",
    texte: "Ma Belle Promo est avant tout une famille. Les liens tissés sur les bancs de la Faculté de Droit de Lomé sont indéfectibles. Nous les cultivons à travers nos rencontres, nos événements et notre engagement commun.",
    accent: "bg-rose-400",
  },
  {
    numero: "02",
    titre: "Solidarité",
    texte: "Chaque membre est à la fois bénéficiaire et contributeur du réseau. En partageant expériences, expertises et opportunités, nous sommes une source d'inspiration pour les générations qui nous suivent.",
    accent: "bg-amber-400",
  },
  {
    numero: "03",
    titre: "Entraide",
    texte: "Partage de compétences, mentorat, soutien moral et matériel : l'entraide est le moteur qui fait avancer chacun et renforce la cohésion de notre groupe face aux défis du quotidien.",
    accent: "bg-emerald-500",
  },
  {
    numero: "04",
    titre: "Engagement",
    texte: "Aide aux personnes vulnérables, soutien aux étudiants, initiatives citoyennes : nos membres s'engagent pour un impact positif et durable dans la société togolaise.",
    accent: "bg-blue-400",
  },
  {
    numero: "05",
    titre: "Excellence",
    texte: "Avocats, magistrats, notaires, entrepreneurs, cadres reconnus — notre réseau porte haut le flambeau de l'excellence académique et professionnelle issue de la FDD.",
    accent: "bg-violet-400",
  },
  {
    numero: "06",
    titre: "Ouverture",
    texte: "Un réseau sans frontières : MBP facilite le retour et l'intégration des membres de la diaspora et permet à chacun de tisser des liens professionnels au-delà du Togo.",
    accent: "bg-teal-400",
  },
];

const objectifs = [
  { icon: Network,      bg: "rgba(52,211,153,0.15)",  color: "text-emerald-400", titre: "Réseautage",         desc: "Partage d'expérience et réseautage entre membres" },
  { icon: GraduationCap,bg: "rgba(251,191,36,0.15)",  color: "text-amber-400",   titre: "Soutien FDD",        desc: "Mentorat, aides, bourses et stages pour les étudiants" },
  { icon: Globe,        bg: "rgba(96,165,250,0.15)",  color: "text-blue-400",    titre: "Diaspora",           desc: "Retour et intégration des membres diaspora" },
  { icon: Heart,        bg: "rgba(251,113,133,0.15)", color: "text-rose-400",    titre: "Liens privilégiés",  desc: "Relations durables entre les membres de la promotion" },
  { icon: Building2,    bg: "rgba(167,139,250,0.15)", color: "text-violet-400",  titre: "Communauté",         desc: "Actions de terrain pour les populations vulnérables" },
];

export default function QuiSommesNous() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Valeurs & Mission"
        description="Valeurs, mission et objectifs de L'association Ma Belle Promo (MBP) — anciens diplômés de la FDD de l'Université de Lomé, promotion 1994-2000."
        path="/association/qui-sommes-nous"
      />

      {/* ── Hero ── */}
      <div className="relative flex flex-col items-center justify-center h-[52vh] bg-foreground overflow-hidden px-6">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <img src="/Logo Redesign1.webp" alt="" className="w-[420px] max-w-[70%] opacity-[0.06] object-contain" />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-white/20" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-3xl"
        >
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 mb-5">
            Ma Belle Promo — FDD · Université de Lomé · Promotion 1994–2000
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-black text-white leading-tight mb-8">
            Valeurs & Mission
          </h1>
          <div className="w-12 h-px bg-primary mx-auto mb-8" />
          <p className="font-heading text-base md:text-lg italic text-white/60 leading-relaxed max-w-xl mx-auto">
            Une promotion, une famille, un réseau — au service des générations qui nous suivent.
          </p>
        </motion.div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16 bg-white/20" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">

        {/* ── Nos Valeurs ── */}
        <section>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="eyebrow text-primary text-center mb-10"
          >
            Six valeurs fondamentales
          </motion.p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {valeurs.map((v, i) => (
              <motion.div
                key={v.titre}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                className="group relative flex flex-col bg-card border border-border rounded-2xl p-6 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300"
              >
                <div className="absolute -bottom-3 -right-1 font-heading text-[6rem] font-black leading-none select-none pointer-events-none text-foreground/[0.04]">
                  {v.numero}
                </div>
                <div className={`w-8 h-0.5 mb-4 group-hover:w-14 transition-all duration-300 ${v.accent}`} />
                <h3 className="font-heading text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {v.titre}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed relative z-10flex-1">
                  {v.texte}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Notre Mission — carte unifiée ── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: "linear-gradient(135deg, rgba(5,18,11,0.98) 0%, rgba(10,35,20,0.98) 100%)",
            border: "1px solid rgba(52,211,153,0.20)",
          }}
        >
          {/* Ligne déco haut */}
          <div style={{ height: 2, background: "linear-gradient(to right, transparent, #34d399 30%, #fbbf24 60%, #34d399 85%, transparent)" }} />

          <div className="p-8 md:p-12">

            {/* En-tête */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.25)" }}>
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] mb-0.5"
                  style={{ color: "rgba(110,231,183,0.55)" }}>Raison d'être · Art. 5 des statuts</p>
                <h2 className="font-heading text-2xl md:text-3xl font-black text-white">Notre Mission</h2>
              </div>
            </div>

            {/* Texte mandat */}
            <p className="text-sm leading-relaxed mb-8"
              style={{ color: "rgba(255,255,255,0.62)" }}>
              MBP contribue à l'épanouissement de ses membres, à l'accompagnement des étudiants de la
              Faculté de Droit et à l'impact de la société togolaise — à travers un réseau exclusif de
              juristes qui maintient son lien vivant avec l'Université de Lomé.
            </p>

            {/* Objectifs — grille compacte */}
            <div className="grid sm:grid-cols-2 gap-3 mb-8"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "2rem" }}>
              {objectifs.map(({ icon: Icon, bg, color, titre, desc }, i) => (
                <motion.div
                  key={titre}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.3 }}
                  className={`flex items-start gap-3 p-4 rounded-xl${i === 4 ? " sm:col-span-2" : ""}`}
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: bg }}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${color} mb-0.5`}>{titre}</p>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.48)" }}>{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Vision 3/5 */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl"
              style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.18)" }}>
              <div className="text-center flex-shrink-0">
                <div className="font-heading font-black text-primary leading-none" style={{ fontSize: "3.5rem" }}>3/5</div>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1"
                  style={{ color: "rgba(110,231,183,0.55)" }}>étudiants visés</p>
              </div>
              <div>
                <p className="font-heading font-bold text-white text-sm mb-1">Vision à moyen terme</p>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.52)" }}>
                  Trois étudiants sur cinq de la FDD doivent nous identifier clairement et être
                  impactés positivement par l'une de nos actions. Toutes nos activités convergent vers cet objectif.
                </p>
              </div>
            </div>

          </div>
        </motion.section>

        {/* ── Récépissé + CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-muted/40 border border-border rounded-2xl"
        >
          <p className="text-muted-foreground text-center sm:text-left text-sm">
            Association officiellement reconnue par les autorités togolaises depuis le{" "}
            <strong className="text-foreground">03 octobre 2019</strong>
            <span className="block text-xs text-primary font-semibold mt-0.5">
              Récépissé N°0920/MATDCL-SG-DLPAP-DOCA
            </span>
          </p>
          <Link
            to="/implications/adhesion"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            Nous rejoindre <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
