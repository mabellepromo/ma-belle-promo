import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Heart, 
  Handshake, 
  Users, 
  Globe, 
  Star, 
  Compass,
  ArrowRight 
} from "lucide-react";
import SEO from "../components/SEO";

const valeurs = [
  {
    numero: "01",
    titre: "Amitié",
    texte: "Ma Belle Promo est avant tout une famille. Les liens d'amitié tissés sur les bancs de la Faculté de Droit de Lomé sont indéfectibles. Nous cultivons ces liens au fil des années, transformant les rencontres académiques en relations durables et authentiques.",
    accent: "bg-rose-400",
    accentDark: "bg-rose-500",
    Icon: Heart,
    gradient: "from-rose-50 to-pink-50",
    borderColor: "border-rose-200",
    hoverBg: "hover:from-rose-100 hover:to-pink-100",
  },
  {
    numero: "02",
    titre: "Solidarité",
    texte: "Échange, partage et réciprocité sont les valeurs qui animent Ma Belle Promo. Nous avons vocation à être non seulement des ambassadrices et ambassadeurs de l'institution mais, du fait de nos expériences et talents, une source d'inspiration.",
    accent: "bg-amber-400",
    accentDark: "bg-amber-500",
    Icon: Handshake,
    gradient: "from-amber-50 to-yellow-50",
    borderColor: "border-amber-200",
    hoverBg: "hover:from-amber-100 hover:to-yellow-100",
  },
  {
    numero: "03",
    titre: "Entraide",
    texte: "Nous contribuons activement à l'épanouissement de nos membres et à l'accompagnement des étudiants actuels de la Faculté de Droit. Partage de compétences, mentorat, soutien : l'entraide est au cœur de notre démarche collective.",
    accent: "bg-emerald-500",
    accentDark: "bg-emerald-600",
    Icon: Users,
    gradient: "from-emerald-50 to-teal-50",
    borderColor: "border-emerald-200",
    hoverBg: "hover:from-emerald-100 hover:to-teal-100",
  },
  {
    numero: "04",
    titre: "Engagement communautaire",
    texte: "Ma Belle Promo s'ouvre sur sa communauté pour mener des actions concertées dans divers domaines : aide aux personnes vulnérables, soutien aux étudiants, actions solidaires. Nos leaders créent de l'impact positif et durable.",
    accent: "bg-blue-400",
    accentDark: "bg-blue-500",
    Icon: Globe,
    gradient: "from-blue-50 to-cyan-50",
    borderColor: "border-blue-200",
    hoverBg: "hover:from-blue-100 hover:to-cyan-100",
  },
  {
    numero: "05",
    titre: "Excellence",
    texte: "Diplômés de la Faculté de Droit de l'Université de Lomé, nous portons haut le flambeau de l'excellence académique et professionnelle. Notre réseau rassemble des avocats, magistrats et professionnels reconnus.",
    accent: "bg-violet-400",
    accentDark: "bg-violet-500",
    Icon: Star,
    gradient: "from-violet-50 to-purple-50",
    borderColor: "border-violet-200",
    hoverBg: "hover:from-violet-100 hover:to-purple-100",
  },
  {
    numero: "06",
    titre: "Ouverture sur le monde",
    texte: "Ma Belle Promo se veut un réseau ouvert sur le monde, facilitant le retour et l'intégration des membres de la diaspora, et permettant à ses membres de développer leurs contacts personnels et professionnels.",
    accent: "bg-teal-400",
    accentDark: "bg-teal-500",
    Icon: Compass,
    gradient: "from-teal-50 to-cyan-50",
    borderColor: "border-teal-200",
    hoverBg: "hover:from-teal-100 hover:to-cyan-100",
  },
];

export default function Credo() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEO 
        title="Notre Credo" 
        description="Les valeurs fondatrices de Ma Belle Promo : amitié, solidarité et entraide au service des anciens diplômés de la FDD de l'Université de Lomé." 
      />

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

      {/* ── Grille des valeurs REDESIGNÉE ── */}
      <section className="max-w-7xl mx-auto px-6 py-24 overflow-x-hidden">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="eyebrow text-primary mb-4">
            Six valeurs fondamentales
          </p>
          <h2 className="font-heading text-4xl font-bold text-foreground">
            Les piliers de Ma Belle Promo
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {valeurs.map((v, i) => {
            const IconComponent = v.Icon;
            return (
              <motion.div
                key={v.titre}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative h-full"
              >
                {/* Carte principale */}
                <div className={`relative h-full bg-gradient-to-br ${v.gradient} border ${v.borderColor} rounded-3xl p-8 overflow-hidden transition-all duration-500 ${v.hoverBg} hover:shadow-2xl hover:border-opacity-60 flex flex-col`}
                  style={{
                    perspective: '1200px',
                  }}>
                  
                  {/* Arrière-plan décoratif */}
                  <div className="absolute top-0 right-0 w-40 h-40 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                    <div className={`w-full h-full rounded-full ${v.accent}`} />
                  </div>

                  {/* Coin feuille - Haut droit */}
                  <motion.div 
                    className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
                    whileHover={{ 
                      rotateY: 20,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Triangle principal (coin plié) */}
                    <div className={`absolute top-0 right-0 w-0 h-0 border-l-16 border-b-16 border-l-transparent ${v.accent} opacity-70 shadow-lg`}
                      style={{
                        borderLeft: '40px solid transparent',
                        borderBottom: '40px solid currentColor',
                        filter: 'drop-shadow(-2px 2px 3px rgba(0,0,0,0.15))',
                      }}
                    />
                    
                    {/* Pli intérieur (effet de profondeur) */}
                    <div className={`absolute top-0 right-0 w-0 h-0 border-l-16 border-b-16 border-l-transparent opacity-50`}
                      style={{
                        borderLeft: '35px solid transparent',
                        borderBottom: '35px solid rgba(255,255,255,0.4)',
                      }}
                    />

                    {/* Ombre du pli */}
                    <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                      }}
                    />
                  </motion.div>

                  {/* Numéro en bas à droite - Transparent */}
                  <div className="absolute bottom-6 right-6 pointer-events-none select-none">
                    <span className="font-heading text-7xl font-black opacity-[0.15] transition-opacity group-hover:opacity-[0.25]">
                      {v.numero}
                    </span>
                  </div>

                  {/* Icône et accent bar */}
                  <div className="relative z-10 flex items-start justify-between mb-6">
                    <div className={`p-3 rounded-2xl ${v.accent} bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300 transform group-hover:scale-110`}>
                      <IconComponent className={`w-8 h-8 ${v.accent.replace('bg-', 'text-')}`} />
                    </div>
                    <div className={`w-1.5 h-12 ${v.accent} rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:h-16`} />
                  </div>

                  {/* Contenu */}
                  <div className="relative z-10 flex-1 flex flex-col pr-12">
                    <h3 className="font-heading text-2xl font-bold text-foreground mb-3 group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300" 
                        style={{
                          backgroundImage: `linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))`,
                        }}>
                      {v.titre}
                    </h3>
                    <p className="text-muted-foreground text-base leading-relaxed text-justify group-hover:text-foreground transition-colors duration-300">
                      {v.texte}
                    </p>
                  </div>
                </div>

                {/* Lueur au survol */}
                <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 ${v.accent} blur-xl transition-opacity duration-500 pointer-events-none -z-10`} />
              </motion.div>
            );
          })}
        </div>

        {/* Récépissé - Redesigné */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-24 relative"
        >
          <div className="relative bg-gradient-to-r from-primary/5 via-primary/3 to-primary/5 border border-primary/20 rounded-3xl p-8 md:p-12 overflow-hidden group">
            
            {/* Décoration arrière-plan */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <p className="text-lg text-foreground font-semibold mb-2">
                  🏛️ Reconnaissance officielle
                </p>
                <p className="text-muted-foreground">
                  Association officiellement reconnue par les autorités togolaises depuis le{" "}
                  <strong className="text-foreground font-bold">03 octobre 2019</strong>
                </p>
                <p className="text-sm text-primary font-semibold mt-3 bg-primary/10 w-fit px-4 py-2 rounded-full">
                  Récépissé N°0920/MATDCL-SG-DLPAP-DOCA
                </p>
              </div>
              <Link
                to="/implications/adhesion"
                className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-semibold rounded-full hover:shadow-lg hover:from-primary hover:to-primary transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
              >
                Nous rejoindre <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <style>{`
        @supports (clip-path: polygon(0 0, 100% 0, 0 100%)) {
          /* Support pour le coin plié */
        }
      `}</style>
    </div>
  );
}
