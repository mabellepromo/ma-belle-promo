import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "../components/SEO";

const valeurs = [
  {
    numero: "01",
    titre: "Amitié",
    texte: "Ma Belle Promo est avant tout une famille. Les liens d'amitié tissés sur les bancs de la Faculté de Droit de Lomé sont indéfectibles. Nous cultivons ces liens au fil des années, à travers nos rencontres, retrouvailles et activités communes.",
    bg: "bg-rose-50 border-rose-100",
    accent: "bg-rose-400",
    filigrane: "text-rose-200/60",
  },
  {
    numero: "02",
    titre: "Solidarité",
    texte: "Échange, partage et réciprocité sont les valeurs qui animent Ma Belle Promo. Nous avons vocation à être non seulement des ambassadrices et ambassadeurs de l'institution mais, du fait de nos expériences et nos talents, à constituer avant tout une source d'inspiration pour les générations futures.",
    bg: "bg-amber-50 border-amber-100",
    accent: "bg-amber-400",
    filigrane: "text-amber-200/60",
  },
  {
    numero: "03",
    titre: "Entraide",
    texte: "Nous contribuons activement à l'épanouissement de nos membres et à l'accompagnement des étudiants actuels de la Faculté de Droit. Partage de compétences, mentorat, soutien : l'entraide est notre moteur quotidien.",
    bg: "bg-green-50 border-green-100",
    accent: "bg-green-400",
    filigrane: "text-green-200/60",
  },
  {
    numero: "04",
    titre: "Engagement communautaire",
    texte: "Ma Belle Promo s'ouvre sur sa communauté pour mener des actions concertées dans divers domaines : aide aux personnes vulnérables, soutien aux étudiants, actions solidaires. Nos leaders sont engagés pour changer la vie des personnes destinataires de nos actions.",
    bg: "bg-blue-50 border-blue-100",
    accent: "bg-blue-400",
    filigrane: "text-blue-200/60",
  },
  {
    numero: "05",
    titre: "Excellence",
    texte: "Diplômés de la Faculté de Droit de l'Université de Lomé, nous portons haut le flambeau de l'excellence académique et professionnelle. Notre réseau est composé d'avocats, de magistrats, d'universitaires, de cadres d'entreprises, d'experts internationaux — une force collective au service du droit.",
    bg: "bg-violet-50 border-violet-100",
    accent: "bg-violet-400",
    filigrane: "text-violet-200/60",
  },
  {
    numero: "06",
    titre: "Ouverture sur le monde",
    texte: "Ma Belle Promo se veut un réseau ouvert sur le monde, facilitant le retour et l'intégration des membres de la diaspora, et permettant à ses membres de développer leurs contacts personnels et professionnels au-delà des frontières togolaises.",
    bg: "bg-teal-50 border-teal-100",
    accent: "bg-teal-400",
    filigrane: "text-teal-200/60",
  },
];

export default function Credo() {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Notre Credo" description="Les valeurs fondatrices de Ma Belle Promo : amitié, solidarité et entraide au service des anciens diplômés de la FDD de l'Université de Lomé." path="/association/credo" />

      {/* ── Hero 80vh ── */}
      <div className="relative flex flex-col items-center justify-center h-[58vh] bg-foreground overflow-hidden px-6">

        {/* Logo en filigrane */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <img
            src="/Logo Redesign1.webp"
            alt=""
            className="w-[420px] max-w-[70%] opacity-[0.06] object-contain"
          />
        </div>

        {/* Ligne décorative top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-white/20" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-3xl"
        >
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 mb-6">
            Ma Belle Promo — FDD · Université de Lomé
          </p>

          <h1 className="font-heading text-5xl md:text-7xl font-black text-white leading-tight mb-10">
            Notre Credo
          </h1>

          <div className="w-12 h-px bg-primary mx-auto mb-10" />

          <blockquote>
            <p className="font-heading text-lg md:text-xl italic text-white/75 leading-relaxed">
              « Échange, partage et réciprocité sont les valeurs qui animent Ma Belle Promo.
              Nous avons vocation à être non seulement des ambassadrices et ambassadeurs de l'institution
              mais, du fait de nos expériences et nos talents, à constituer avant tout une source
              d'inspiration et de ressources pour les générations qui nous suivent. »
            </p>
            <footer className="mt-6 text-sm font-semibold text-primary/80">— Ma Belle Promo (MBP)</footer>
          </blockquote>
        </motion.div>

        {/* Ligne décorative bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16 bg-white/20" />
      </div>

      {/* ── Grille des valeurs ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="eyebrow text-primary text-center mb-12"
        >
          Six valeurs fondamentales
        </motion.p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {valeurs.map((v, i) => (
            <motion.div
              key={v.titre}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`group relative border rounded-2xl p-7 overflow-hidden hover:shadow-lg transition-all duration-300 ${v.bg}`}
            >
              {/* Numéro géant en filigrane */}
              <div className={`absolute -bottom-4 -right-2 font-heading text-[7rem] font-black leading-none select-none pointer-events-none ${v.filigrane}`}>
                {v.numero}
              </div>

              {/* Trait accent top */}
              <div className={`w-8 h-0.5 mb-5 group-hover:w-14 transition-all duration-300 ${v.accent}`} />

              <h3 className="font-heading text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {v.titre}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed relative z-10 text-justify">
                {v.texte}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Récépissé */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-muted/40 border border-border rounded-2xl"
        >
          <p className="text-sm text-muted-foreground text-center sm:text-left">
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
      </section>
    </div>
  );
}
