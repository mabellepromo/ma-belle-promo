import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Fabienne SENAYA-ATAYI",
    role: "Présidente de Ma Belle Promo · Juriste",
    promo: "Promotion 1998",
    photo: null,
    quote: "Ma Belle Promo, c'est bien plus qu'une association d'anciens. C'est une famille qui transcende les frontières et les années. Chaque membre porte en lui cette flamme de la FDD de Lomé, et ensemble, nous l'entretenons pour éclairer les générations suivantes.",
  },
  {
    name: "Koffi Junior AOUGA",
    role: "Professionnel du droit · Diaspora USA",
    promo: "Promotion 1997",
    photo: null,
    quote: "Quand j'ai eu l'occasion de revenir à Lomé et de partager mon expérience avec les jeunes de l'ALG et ConnecTogo, j'ai mesuré à quel point notre association joue un rôle de pont. Ma Belle Promo m'a rappelé que nos racines sont notre plus grande force.",
  },
  {
    name: "Edwige KUAGBENU",
    role: "Enseignante à l'Université de Lomé",
    promo: "Promotion 1996",
    photo: null,
    quote: "Animer des panels lors de La Nuit du Droit et dans le cadre des activités de MBP, c'est pour moi un devoir envers la prochaine génération. Ce que nos promoteurs ont construit à la FDD mérite d'être transmis avec fierté.",
  },
  {
    name: "Olga AKAKPOVI",
    role: "Associate Director · Ernst & Young Sénégal",
    promo: "Promotion 1999",
    photo: null,
    quote: "Le droit m'a ouvert des portes insoupçonnées. Aujourd'hui fiscaliste dans un cabinet international, je mesure combien la rigueur acquise à la FDD de Lomé est mon socle. Partager cela avec les étudiants via les webinaires MBP est une fierté immense.",
  },
  {
    name: "André Kangni AFANOU",
    role: "Président du CDFDH · Défenseur des droits humains",
    promo: "Promotion 1995",
    photo: null,
    quote: "S'engager pour les droits humains est un choix de vie. Ma Belle Promo incarne cette idée que nos études de droit ne sont pas une fin en soi, mais le point de départ d'une responsabilité citoyenne. Je suis fier d'appartenir à cette famille.",
  },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const go = (idx) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  };
  const next = () => {
    setDirection(1);
    setCurrent((c) => (c + 1) % testimonials.length);
  };

  const t = testimonials[current];

  return (
    <section className="py-20 bg-foreground overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-widest uppercase text-accent">Ils témoignent</span>
          <h2 className="mt-3 font-heading text-4xl md:text-5xl font-bold text-background leading-tight">
            Des parcours <span className="text-accent">inspirants</span>
          </h2>
          <p className="mt-4 text-background/50 max-w-xl mx-auto">
            Les membres de Ma Belle Promo partagent l'impact de l'association sur leur vie professionnelle.
          </p>
        </div>

        {/* Card */}
        <div className="relative min-h-[280px] flex items-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="w-full"
            >
              <div className="bg-background/5 border border-background/10 rounded-3xl p-8 md:p-12 relative">
                {/* Quote icon */}
                <Quote className="absolute top-8 right-8 w-10 h-10 text-accent/20" />

                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-primary/20 border-2 border-accent/30 shadow-lg">
                      {t.photo ? (
                        <img src={t.photo} alt={t.name} className="w-full h-full object-cover object-top" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-heading text-3xl font-bold text-accent">{t.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-background/85 text-lg md:text-xl leading-relaxed font-light italic mb-6">
                      « {t.quote} »
                    </p>
                    <div>
                      <div className="font-heading text-lg font-bold text-background">{t.name}</div>
                      <div className="text-sm text-accent mt-0.5">{t.role}</div>
                      <div className="text-xs text-background/40 mt-1">{t.promo} · FDD Lomé</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-8">
          <button onClick={prev} className="w-10 h-10 rounded-full border border-background/20 flex items-center justify-center text-background/60 hover:border-accent hover:text-accent transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`transition-all duration-300 rounded-full ${i === current ? "w-6 h-2 bg-accent" : "w-2 h-2 bg-background/20 hover:bg-background/40"}`}
              />
            ))}
          </div>

          <button onClick={next} className="w-10 h-10 rounded-full border border-background/20 flex items-center justify-center text-background/60 hover:border-accent hover:text-accent transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}