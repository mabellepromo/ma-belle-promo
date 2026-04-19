import { motion } from "framer-motion";
import { BookOpen, Users, GraduationCap, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const values = [
  {
    icon: Users,
    title: "Amitié",
    desc: "Un réseau exclusif de diplômés unis par des liens durables, autour des valeurs de partage et de réciprocité.",
  },
  {
    icon: BookOpen,
    title: "Solidarité",
    desc: "Échange, partage et réciprocité au service des étudiants actuels et de la communauté.",
  },
  {
    icon: GraduationCap,
    title: "Entraide",
    desc: "Accompagner les futurs diplômés avec nos compétences, expertises et expériences.",
  },
  {
    icon: Shield,
    title: "Engagement",
    desc: "Des leaders engagés pour changer la vie des personnes destinataires de nos actions.",
  },
];

export default function MissionSection() {
  return (
    <section id="mission" className="py-24 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs font-semibold tracking-widest uppercase text-accent">Qui sommes-nous</span>
            <h2 className="mt-3 font-heading text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Nous sommes <span className="text-primary">MA BELLE PROMO</span>
              <br />
              <span className="text-2xl md:text-3xl text-muted-foreground font-medium">et… voici notre histoire !</span>
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed text-lg">
              Ma Belle Promo est un regroupement d'anciens étudiants de la Faculté de Droit de l'Université de Lomé
              <strong className="text-foreground"> (1994–2000)</strong>, mû par le désir de créer un cadre d'échange
              et de partage pour mener des actions concertées dans divers domaines d'activité.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Réunis en association depuis le <strong className="text-foreground">1er décembre 2018</strong>, le but
              ultime est de contribuer à l'épanouissement des membres autour des valeurs d'amitié, de solidarité
              et d'entraide, en plus de nous ouvrir sur notre communauté.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Reconnus par les autorités depuis le <strong className="text-foreground">03 octobre 2019</strong>, notre
              Récépissé de déclaration d'association porte le{" "}
              <strong className="text-foreground">N°0920/MATDCL-SG-DLPAP-DOCA</strong>.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                to="/association/credo"
                className="px-6 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                Notre Credo
              </Link>
              <Link
                to="/implications/soutenir"
                className="px-6 py-3 border border-border text-sm font-semibold rounded-full hover:bg-muted transition-colors text-foreground"
              >
                Nous soutenir
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                loading="lazy"
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=700&h=400&fit=crop"
                alt="Soirée de Gala Ma Belle Promo"
                className="w-full h-80 md:h-96 object-cover object-top"
              />
            </div>
            {/* Badge récépissé */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl p-4 shadow-xl"
            >
              <p className="text-xs text-muted-foreground font-medium">Association reconnue</p>
              <p className="text-sm font-bold text-foreground">depuis le 03 oct. 2019</p>
              <p className="text-xs text-primary mt-0.5">N°0920/MATDCL-SG-DLPAP-DOCA</p>
            </motion.div>
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-accent/20 -z-10" />
          </motion.div>
        </div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-accent">Notre raison d'être</span>
          <h3 className="mt-3 font-heading text-2xl md:text-3xl font-bold text-foreground">
            Nos valeurs fondamentales
          </h3>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="group bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                <v.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-heading text-lg font-semibold text-foreground mb-2">{v.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
