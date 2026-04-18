import { motion } from "framer-motion";
import PageHero from "../components/PageHero";

const valeurs = [
  {
    numero: "01",
    titre: "Amitié",
    texte: "Ma Belle Promo est avant tout une famille. Les liens d'amitié tissés sur les bancs de la Faculté de Droit de Lomé sont indéfectibles. Nous cultivons ces liens au fil des années, à travers nos rencontres, retrouvailles et activités communes.",
  },
  {
    numero: "02",
    titre: "Solidarité",
    texte: "Échange, partage et réciprocité sont les valeurs qui animent Ma Belle Promo. Nous avons vocation à être non seulement des ambassadrices et ambassadeurs de l'institution mais, du fait de nos expériences et nos talents, à constituer avant tout une source d'inspiration pour les générations futures.",
  },
  {
    numero: "03",
    titre: "Entraide",
    texte: "Nous contribuons activement à l'épanouissement de nos membres et à l'accompagnement des étudiants actuels de la Faculté de Droit. Partage de compétences, mentorat, soutien : l'entraide est notre moteur quotidien.",
  },
  {
    numero: "04",
    titre: "Engagement communautaire",
    texte: "Ma Belle Promo s'ouvre sur sa communauté pour mener des actions concertées dans divers domaines : aide aux personnes vulnérables, soutien aux étudiants, actions solidaires. Nos leaders sont engagés pour changer la vie des personnes destinataires de nos actions.",
  },
  {
    numero: "05",
    titre: "Excellence",
    texte: "Diplômés de la Faculté de Droit de l'Université de Lomé, nous portons haut le flambeau de l'excellence académique et professionnelle. Notre réseau est composé d'avocats, de magistrats, d'universitaires, de cadres d'entreprises, d'experts internationaux — une force collective au service du droit.",
  },
  {
    numero: "06",
    titre: "Ouverture sur le monde",
    texte: "Ma Belle Promo se veut un réseau ouvert sur le monde, facilitant le retour et l'intégration des membres de la diaspora, et permettant à ses membres de développer leurs contacts personnels et professionnels au-delà des frontières togolaises.",
  },
];

export default function Credo() {
  return (
    <div>
      <PageHero title="Notre Credo" subtitle="L'Association — Nos valeurs fondamentales" />

      <section className="py-20 max-w-5xl mx-auto px-6">

        {/* Citation */}
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 p-8 bg-primary/5 border-l-4 border-primary rounded-r-2xl"
        >
          <p className="font-heading text-xl md:text-2xl italic text-foreground leading-relaxed">
            « Échange, partage et réciprocité sont les valeurs qui animent Ma Belle Promo.
            Nous avons vocation à être non seulement des ambassadrices et ambassadeurs de l'institution
            mais, du fait de nos expériences et nos talents, à constituer avant tout une source
            d'inspiration et de ressources pour les générations qui nous suivent à la Faculté de Droit. »
          </p>
          <footer className="mt-4 text-sm font-semibold text-primary">— Ma Belle Promo (MBP)</footer>
        </motion.blockquote>

        {/* Valeurs */}
        <div className="space-y-8">
          {valeurs.map((v, i) => (
            <motion.div
              key={v.titre}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group flex gap-6 bg-card border border-border rounded-2xl p-7 hover:shadow-md hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="font-heading text-lg font-bold text-primary">{v.numero}</span>
                </div>
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-3">{v.titre}</h3>
                <p className="text-muted-foreground leading-relaxed">{v.texte}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Récépissé */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 p-6 bg-muted/50 border border-border rounded-2xl text-center"
        >
          <p className="text-sm text-muted-foreground">
            Association reconnue officiellement par les autorités togolaises depuis le{" "}
            <strong className="text-foreground">03 octobre 2019</strong>
          </p>
          <p className="text-sm font-semibold text-primary mt-1">
            Récépissé N°0920/MATDCL-SG-DLPAP-DOCA
          </p>
        </motion.div>
      </section>
    </div>
  );
}
