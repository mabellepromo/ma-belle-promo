/**
 * Script de seed complet — toutes les tables Supabase
 * Usage : node scripts/seed-all.mjs
 *
 * Avant de lancer :
 *   1. Dans ton tableau de bord Supabase → Settings → API
 *   2. Copie le "service_role secret"
 *   3. Lance : SUPABASE_SERVICE_KEY=xxx node scripts/seed-all.mjs
 *
 * Ce script bypasse le RLS grâce à la clé service_role.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zbimhhgefmhliqiuwzvb.supabase.co";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_KEY) {
  console.error("❌  Manque la clé service_role.\n   Lance : SUPABASE_SERVICE_KEY=xxx node scripts/seed-all.mjs");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ─── Helpers galeries ────────────────────────────────────────────────────────
const G  = (folder, file) => `/Galeries/${folder}/${file}`;
const K  = (f) => G("Kanlé Obséques", f);
const R  = (f) => G("Rencontre avec Romuald  18.02.2018", f);
const T  = (f) => G("Rencontre avec Tata 28.07.18", f);
const L  = (f) => G("Retrouvailles avec  Line 10.2018", f);
const M  = (f) => G("Reunion 18.05.2019", f);
const GA = (f) => G("Soirée de Gala  et de Charité 30.07.22", f);

// ─── Données ─────────────────────────────────────────────────────────────────

const galeries = [
  {
    id: "gala-2022",
    titre: "Soirée de Gala et de Bienfaisance",
    date: "30 Juillet 2022",
    lieu: "Lomé, Togo",
    description: "Première Soirée de Gala de Ma Belle Promo — lancement du programme de bourses, retrouvailles et moments inoubliables.",
    cover: GA("WhatsApp Image 2022-07-31 at 13.07.52.jpeg"),
    access: "membres",
    photos: [
      GA("WhatsApp Image 2022-07-31 at 13.07.52.jpeg"),
      GA("WhatsApp Image 2022-07-31 at 13.07.53.jpeg"),
      GA("WhatsApp Image 2022-07-31 at 13.07.54.jpeg"),
      GA("WhatsApp Image 2022-07-31 at 13.07.55.jpeg"),
      GA("WhatsApp Image 2022-07-31 at 13.07.56.jpeg"),
      GA("WhatsApp Image 2022-07-31 at 13.07.57.jpeg"),
      GA("WhatsApp Image 2022-07-31 at 13.07.58.jpeg"),
      GA("WhatsApp Image 2022-07-31 at 13.07.59.jpeg"),
      GA("WhatsApp Image 2022-07-31 at 13.08.00.jpeg"),
      GA("WhatsApp Image 2022-07-31 at 01.22.50.jpeg"),
      GA("WhatsApp Image 2022-07-30 at 22.19.52.jpeg"),
      GA("WhatsApp Image 2022-07-30 at 19.44.51.jpeg"),
      GA("WhatsApp Image 2022-07-27 at 11.41.49.jpeg"),
      GA("WhatsApp Image 2022-07-27 at 11.41.51.jpeg"),
      GA("WhatsApp Image 2022-07-23 at 13.21.06.jpeg"),
      GA("WhatsApp Image 2022-07-23 at 13.21.08.jpeg"),
      GA("WhatsApp Image 2022-07-19 at 09.10.05.jpeg"),
      GA("WhatsApp Image 2022-07-15 at 13.39.25.jpeg"),
      GA("WhatsApp Image 2022-08-09 at 01.05.48.jpeg"),
      GA("WhatsApp Image 2022-08-09 at 01.05.49.jpeg"),
      GA("WhatsApp Image 2022-08-09 at 01.05.50.jpeg"),
      GA("WhatsApp Image 2022-08-09 at 01.05.51.jpeg"),
      GA("WhatsApp Image 2022-08-09 at 01.09.43.jpeg"),
      GA("WhatsApp Image 2022-08-09 at 01.09.44.jpeg"),
      GA("WhatsApp Image 2022-08-09 at 01.09.46.jpeg"),
      GA("WhatsApp Image 2022-08-09 at 01.09.47.jpeg"),
      GA("WhatsApp Image 2022-08-09 at 01.21.58.jpeg"),
      GA("WhatsApp Image 2022-08-09 at 10.36.33.jpeg"),
      GA("WhatsApp Image 2022-08-09 at 11.54.40.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 00.09.57.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 00.11.07.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 00.11.56.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 00.12.34.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 00.14.23.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 00.15.00.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 00.15.41.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 00.16.05.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 00.17.44.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 00.18.27.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 00.20.01.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 00.20.49.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 00.21.40.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 00.31.03.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 00.31.35.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 00.32.03.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 00.32.36.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 00.35.15.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 01.13.03.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 01.17.54.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 01.19.19.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 01.22.50.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 01.24.10.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 01.29.12.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 01.30.39.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 01.32.47.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 01.38.07.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 01.40.06.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 02.00.55.jpeg"),
      GA("WhatsApp Image 2022-08-13 at 02.02.02.jpeg"),
    ],
  },
  {
    id: "reunion-2019",
    titre: "Réunion du Bureau Exécutif",
    date: "18 Mai 2019",
    lieu: "Lomé, Togo",
    description: "Réunion de travail du Bureau Exécutif de Ma Belle Promo — échanges, planification et moments de convivialité.",
    cover: M("180519mbp-groupe.jpg"),
    access: "membres",
    photos: [
      M("180519mbp-groupe.jpg"),
      M("180519mbp-groupe1.jpg"),
      M("180519mbp-groupe2.jpg"),
      M("180519mbp-andrefabi.jpg"),
      M("180519mbp-fabedwifabi.jpg"),
      M("180519mbp-fabfirstopic.jpg"),
      M("180519mbp-fabjo.jpg"),
      M("180519mbp-fabrico.jpg"),
      M("180519mbp-franciekue.jpg"),
      M("180519mbp-franjoetiemp.jpg"),
      M("180519mbp-amizenbedjageorge.jpg"),
      M("180519mbp-doubleed.jpg"),
      M("180519mbp-eredw.jpg"),
      M("180519mbp-ricodoubleed.jpg"),
      M("180519mbp-samami.jpg"),
      M("180519mbp-samrol.jpg"),
      M("RB-23 03 19.jpeg"),
      M("RB-23 03 19-jsgjf.jpeg"),
      M("RB-23 03 19-jfgjf.bis.jpeg"),
      M("RB-230319.jpeg"),
    ],
  },
  {
    id: "rencontre-tata-2018",
    titre: "Rencontre avec Tata",
    date: "28 Juillet 2018",
    lieu: "Lomé, Togo",
    description: "Chaleureuse rencontre avec Tata de passage à Lomé — échanges, repas partagés et souvenirs précieux.",
    cover: T("rencontre.jpg"),
    access: "membres",
    photos: [
      T("rencontre.jpg"),
      T("Album-tatalomecalling1.jpg"),
      T("Album-tatalomecalling2.jpg"),
      T("Album-tatalomecalling3.jpg"),
      T("Album-tatalomecalling_cheerfulness.jpg"),
      T("Album-tatalomecalling_cheerfulness1.jpg"),
      T("Album-tatalomecalling_cheerfulness3.jpg"),
      T("Album-tatalomecalling_cheerfulness4.jpg"),
      T("Album-tatalomecalling_togotogo.jpg"),
      T("Album-tatachezrezo.jpg"),
      T("Album-tatachezrezo-admins.jpg"),
      T("Album-tatachezrezo-echange.jpg"),
      T("Album-tatachezrezo-serge.jpg"),
      T("Album-tatachezrezojosee.jpg"),
      T("Album-tatarlette.jpg"),
      T("album-th2807-00.jpg"),
      T("album-th2807-1.jpg"),
      T("album-th2807-23.jpg"),
      T("album-th2807-buf.jpg"),
      T("album-th2807-ech.jpg"),
      T("album-th2807-ftf.jpg"),
      T("album-th2807-ja.jpg"),
      T("album-th2807-jfes.jpg"),
      T("album-th2807-jj.jpg"),
      T("album-th2807-se.jpg"),
      T("album-th2807-td.jpg"),
      T("album-th2807-ts.jpg"),
      T("album-th2807-vens.jpg"),
      T("album-th2807-vens0.jpg"),
      T("album-th2807-vens00.jpg"),
      T("album-th2807-vens000.jpg"),
      T("album-th2807-vens0000.jpg"),
      T("album-th2807-vens1.jpg"),
      T("album-th2807-z.jpg"),
      T("album-th2807-z0.jpg"),
      T("album-th2807-z2.jpg"),
      T("album-th2907.jpg"),
    ],
  },
  {
    id: "rencontre-romuald-2018",
    titre: "Rencontre avec Romuald",
    date: "18 Février 2018",
    lieu: "Lomé, Togo",
    description: "Rencontre avec Romuald Afatchao de passage à Lomé — partage d'expériences et moments de fraternité.",
    cover: R("Album-romuachezrezo1.jpg"),
    access: "membres",
    photos: [
      R("Album-romuachezrezo1.jpg"),
      R("Album-romuachezrezo_tablee.jpg"),
      R("Album-romuachezrezo_tablee1.jpg"),
      R("Album-romuachezrezo_tablee2.jpg"),
      R("Album-romuachezrezo_tablee3.jpg"),
      R("Album-romuacalling1.jpg"),
      R("Album-romuacalling2.jpg"),
      R("Album-romuacalling3.jpg"),
      R("Album-romuacalling_notsehereweare.jpg"),
      R("Album-romuacalling_notsething.jpg"),
      R("Album-romuacalling_notsething1.jpg"),
      R("Album-romuacalling_notsething4.jpg"),
    ],
  },
  {
    id: "retrouvailles-line-2018",
    titre: "Retrouvailles avec Line",
    date: "Octobre 2018",
    lieu: "Lomé, Togo",
    description: "Retrouvailles avec Line de passage à Lomé — joie des retrouvailles entre membres de Ma Belle Promo.",
    cover: L("line1018-0.jpg"),
    access: "membres",
    photos: [
      L("line1018-0.jpg"),
      L("line1018-1.jpg"),
      L("line1018-2.jpg"),
      L("line1018-3.jpg"),
    ],
  },
  {
    id: "kanle-obseques",
    titre: "Obsèques de Kanlé",
    date: "2021",
    lieu: "Togo",
    description: "La famille MBP réunie pour accompagner l'un des nôtres dans ce moment douloureux — solidarité et soutien.",
    cover: K("Kanleobs.jpg"),
    access: "membres",
    photos: [
      K("Kanleobs.jpg"),
      K("kanleobs1.jpg"),
      K("kanleobs2.jpg"),
      K("kanleobs22.jpg"),
      K("kanleobs3.jpg"),
      K("Kanleobs4.jpg"),
      K("kanleobs5.jpg"),
      K("kanleobs6.jpg"),
      K("kanleobs7.jpg"),
      K("Kanleobs8.jpg"),
      K("Kanleobs9.jpg"),
      K("Kanleobs10.jpg"),
    ],
  },
  {
    id: "nuit-du-droit-2023",
    titre: "La Nuit du Droit à Lomé",
    date: "18 Novembre 2023",
    lieu: "Hôtel Sarakawa, Lomé",
    description: "La Nuit du Droit au Togo — MBP y a participé activement et co-décerné les prix du concours des meilleurs mémoires.",
    cover: "/images/nuit-du-droit/mv2.jpg",
    access: "public",
    photos: [
      "/images/nuit-du-droit/mv2.jpg",
      "/images/nuit-du-droit/2281mv2.jpg",
      "/images/nuit-du-droit/287af02.jpg",
      "/images/nuit-du-droit/28mv2.jpg",
      "/images/nuit-du-droit/bc5mv2.jpg",
      "/images/nuit-du-droit/bmv2.jpg",
      "/images/nuit-du-droit/emv2.jpg",
      "/images/nuit-du-droit/197af4f.jpg",
    ],
  },
];

const projets = [
  {
    id: "noel-enfants",
    titre: "Opération « Noël des enfants »",
    extrait: "Apporter la magie de Noël aux enfants de l'Orphelinat La Solution — cadeaux, sourires et moments partagés.",
    description: "Quoi de mieux que de voir un tout-petit avec les yeux brillants, tout émerveillé à l'approche de cette période si attendue ? Noël est la magie qui opère à l'Orphelinat La Solution grâce à Ma Belle Promo. MBP apporte le sourire aux enfants.",
    contenu: "<p>Ma Belle Promo a organisé cette opération pour apporter de la joie aux enfants résidant à l'Orphelinat « La Solution » à l'occasion des fêtes de fin d'année.</p><p>Des jouets, des habits et des repas ont été distribués aux enfants dans une ambiance festive. Les membres de l'association ont participé activement à l'organisation de la journée.</p><p>Cette action reflète l'une des valeurs fondamentales de Ma Belle Promo : la solidarité envers les personnes les plus vulnérables, et en particulier les enfants.</p>",
    date: "Décembre 2021",
    categorie: "Solidarité",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=700&h=400&fit=crop",
    photos: [],
    videos: [],
  },
  {
    id: "cartable-scolaire",
    titre: "Opération « Cartable Scolaire »",
    extrait: "Fournitures scolaires pour les enfants de l'Orphelinat La Solution à la rentrée 2021.",
    description: "Opération « Cartable Scolaire » de Ma Belle Promo (MBP) à l'Orphelinat « La Solution » dans le cadre de la rentrée scolaire. Une action concrète pour soutenir les enfants les plus vulnérables dans leur accès à l'éducation.",
    contenu: "<p>À l'occasion de la rentrée scolaire 2021, Ma Belle Promo a remis des cartables et des fournitures scolaires aux enfants de l'Orphelinat « La Solution ».</p><p>Cahiers, stylos, règles, crayons de couleur — tout le nécessaire pour aborder la nouvelle année scolaire dans les meilleures conditions.</p><p>L'accès à l'éducation est une priorité pour Ma Belle Promo, qui considère que chaque enfant mérite les mêmes chances de réussir.</p>",
    date: "Rentrée 2021",
    categorie: "Éducation",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=700&h=400&fit=crop",
    photos: [],
    videos: [],
  },
  {
    id: "distribution-repas",
    titre: "Distribution de repas — Quartier Zongo",
    extrait: "Une action de solidarité concrète envers les populations vulnérables du quartier Zongo à Lomé.",
    description: "Ma Belle Promo (MBP), dans sa tradition de soutien aux personnes démunies, a mené ce 30 septembre 2020 une action ponctuelle dans le quartier Zongo. Une solidarité concrète envers les populations vulnérables de Lomé.",
    contenu: "<p>Le 30 septembre 2020, les membres de Ma Belle Promo se sont mobilisés pour distribuer des repas chauds aux habitants les plus démunis du quartier Zongo à Lomé.</p><p>Cette action s'inscrit dans la mission de solidarité de l'association, qui entend s'engager au-delà de la sphère académique pour toucher directement les populations en difficulté.</p>",
    date: "30 Septembre 2020",
    categorie: "Solidarité",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=700&h=400&fit=crop",
    photos: [],
    videos: [],
  },
  {
    id: "covid-brigade-mineurs",
    titre: "Riposte Covid-19 — Brigade pour mineurs",
    extrait: "Dons de gels, masques et matériels de protection à la Brigade pour mineurs de Lomé.",
    description: "Ma Belle Promo (MBP) a concrétisé ce 16 juin 2020, à la Brigade pour mineurs de Lomé, une action visant à lutter contre la propagation du virus par la remise de dons (gel, masques, matériels de protection).",
    contenu: "<p>Dans le contexte de la pandémie de Covid-19, Ma Belle Promo s'est mobilisée pour soutenir les structures d'accueil des populations vulnérables.</p><p>Le 16 juin 2020, une délégation de l'association a remis à la Brigade pour mineurs de Lomé des kits de protection sanitaire : gels hydroalcooliques, masques chirurgicaux et autres équipements de protection individuelle.</p><p>Cette action témoigne de l'engagement citoyen des membres de Ma Belle Promo face à la crise sanitaire.</p>",
    date: "16 Juin 2020",
    categorie: "Santé publique",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=700&h=400&fit=crop",
    photos: [],
    videos: [],
  },
  {
    id: "covid-orphelinat",
    titre: "Riposte Covid-19 — Orphelinat « La Solution »",
    extrait: "Protection des enfants les plus vulnérables face à la pandémie par un don de matériels sanitaires.",
    description: "Ma Belle Promo (MBP) a concrétisé ce 12 juin 2020, à l'Orphelinat « La Solution », une action visant à lutter contre la propagation du virus par la remise de dons, protégeant ainsi les enfants les plus vulnérables.",
    contenu: "<p>Le 12 juin 2020, avant même l'action à la Brigade pour mineurs, Ma Belle Promo s'est rendue à l'Orphelinat « La Solution » pour y remettre des équipements de protection sanitaire.</p><p>Les enfants orphelins, particulièrement exposés aux risques sanitaires en raison de leur situation, ont ainsi pu bénéficier de masques et de gels hydroalcooliques.</p>",
    date: "12 Juin 2020",
    categorie: "Santé publique",
    image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=700&h=400&fit=crop",
    photos: [],
    videos: [],
  },
  {
    id: "videoprojecteur",
    titre: "Don d'un vidéoprojecteur au décanat FDD",
    extrait: "Un équipement offert à la Faculté de Droit pour améliorer les conditions d'enseignement.",
    description: "Remise de vidéoprojecteur pour le besoin des étudiants et du décanat de la Faculté de Droit. Une contribution directe à l'amélioration des conditions d'enseignement à l'Université de Lomé.",
    contenu: "<p>Fidèle à ses racines académiques, Ma Belle Promo a souhaité contribuer concrètement à l'amélioration des conditions d'enseignement à la Faculté de Droit (FDD) de l'Université de Lomé, berceau de la promotion.</p><p>Un vidéoprojecteur a été remis au décanat de la faculté, équipement qui permettra d'améliorer la qualité des enseignements dispensés aux étudiants.</p><p>Ce geste symbolise le lien fort que Ma Belle Promo entend maintenir avec son alma mater.</p>",
    date: "2020",
    categorie: "Éducation",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=700&h=400&fit=crop",
    photos: [],
    videos: [],
  },
];

const articles = [
  {
    id: "numerique-togo",
    titre: "Webinaire — Les enjeux du numérique au Togo : aperçu technique et juridique",
    extrait: "L'association MA BELLE PROMO et le CAJS de Kara ont conjointement organisé un webinaire sur les enjeux du numérique au Togo : protection des données, cybercriminalité et principes fondamentaux.",
    date: "11 Déc 2023",
    categorie: "Webinaire",
    image: "https://i.ytimg.com/vi/enhXRt8erJ0/sddefault.jpg",
    youtube: "https://www.youtube.com/watch?v=enhXRt8erJ0",
    photos: [
      "/images/evenements/webinaire-kara.jpg",
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=700&h=400&fit=crop",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=700&h=400&fit=crop",
    ],
    contenu: `L'association **MA BELLE PROMO (MBP)** et le **Centre d'actions juridiques et sociales (CAJS)** de Kara ont conjointement organisé un webinaire intitulé *« Les enjeux du numérique au Togo : regards croisés sur les principes fondamentaux, la protection des données et la cybercriminalité »*.

Cet événement, tenu le **samedi 9 décembre 2023 à 16h** à l'American Corner de l'Université de Kara, a rassemblé un panel d'experts pour discuter des défis et des opportunités liés à la révolution numérique au Togo.

## Les panélistes

- **Prof. Akuété SANTOS** — invité spécial, éclairage juridique
- **M. Kodjo Dagbedji AYENA** — modérateur et éthicien
- **M. Edem AMEGAKPO** — Président sortant d'ISOC Togo
- **M. Pawou BATANA** — Directeur Général de IPNET Université
- **M. Brice DOGBEH-AGBO** — CEO de Yalent Technologies

## Thèmes abordés

Les panélistes ont abordé la détection d'intrusion, les politiques de sécurité, la protection des données personnelles et la prévention des menaces cybernétiques. Le Professeur Santos a éclairé les aspects juridiques, notamment les deux lois principales :

1. **Loi n° 2019-014** du 29 octobre 2019 relative à la protection des données à caractère personnel
2. **Loi n° 2018-026** sur la Cybersécurité et la lutte contre la Cybercriminalité

Le webinaire s'est conclu par une session de questions-réponses, constituant une étape importante dans la sensibilisation des acteurs togolais aux défis du monde numérique.

🎥 [Voir la vidéo sur YouTube](https://www.youtube.com/watch?v=enhXRt8erJ0)`,
  },
  {
    id: "nuit-du-droit",
    titre: "La Nuit du Droit à Lomé : Le Droit au cœur des transformations socio-économiques",
    extrait: "Le 18 novembre 2023, l'Hôtel Sarakawa à Lomé a accueilli La Nuit du Droit au Togo. MBP y a participé activement et co-décerné les prix du concours des meilleurs mémoires sur les droits de l'homme.",
    date: "21 Nov 2023",
    categorie: "Événement",
    image: "/images/nuit-du-droit/mv2.jpg",
    youtube: null,
    photos: [
      "/images/nuit-du-droit/mv2.jpg",
      "/images/nuit-du-droit/2281mv2.jpg",
      "/images/nuit-du-droit/287af02.jpg",
      "/images/nuit-du-droit/28mv2.jpg",
      "/images/nuit-du-droit/bc5mv2.jpg",
      "/images/nuit-du-droit/bmv2.jpg",
      "/images/nuit-du-droit/emv2.jpg",
      "/images/nuit-du-droit/197af4f.jpg",
    ],
    contenu: `Le **18 novembre 2023**, l'Hôtel Sarakawa à Lomé a accueilli **La Nuit du Droit au Togo**, événement phare soulignant l'importance du droit dans les transformations socio-économiques et politiques.

MBP y a participé activement, notamment à travers **Edwige Kuagbenu**, enseignante à l'Université de Lomé et membre de l'association, qui a animé l'un des thèmes.

## Prix du concours « Meilleur Mémoire »

En marge de cette soirée, Ma Belle Promo et le **CDFDH** d'André Kangni AFANOU ont décerné les prix du concours des meilleurs mémoires. Lauréats :

- **DESC** — MIJIYAWA Rahile : *« Le contrat de consommation en droit togolais »*
- **DCP** — ALI Essoham : *« Protection des données à caractère personnelles à l'épreuve du numérique au Togo »*
- **DIDH** — SOUNDI Bob : *« Le contentieux de la protection de l'environnement devant la cour internationale de justice »*

La Nuit du Droit a également offert une précieuse opportunité de réseautage, permettant aux membres de MBP d'échanger avec des professionnels du droit, d'anciens professeurs et des personnalités de renom. Cet événement est parti pour devenir un rendez-vous incontournable pour la profession juridique au Togo.`,
  },
  {
    id: "metiers-droit-2",
    titre: "Les métiers du droit : deuxième partie",
    extrait: "Le 6 mai 2023, un webinaire organisé sur Zoom a permis à des étudiants en Faculté de Droit de découvrir la diversité des métiers juridiques à travers les témoignages de quatre experts.",
    date: "16 Mai 2023",
    categorie: "Webinaire",
    image: "https://i.ytimg.com/vi/8aXcufgyVxk/maxresdefault.jpg",
    youtube: "https://www.youtube.com/watch?v=8aXcufgyVxk",
    photos: [],
    contenu: `Le **6 mai 2023**, un webinaire exceptionnel a été organisé sur **Zoom** pour les étudiants en Faculté de Droit. Sous la modération d'**André Kangni AFANOU**, quatre panélistes ont partagé leurs parcours et conseils.

## Les panélistes

- **Sylvestre GOSSOU** — Avocat au barreau de Paris, expert en Compliance et Gouvernance entre la France et l'Afrique
- **Olga AKAKPOVI** — Fiscaliste et Associate Director chez Ernst & Young Sénégal
- **Joël AGBEMELO** — Directeur du bureau d'études JAT Consulting, expert judiciaire en Environnement
- **Fabrice EBEH** — Expert Anti-Corruption, président de l'ANCE-TOGO et coordinateur régional de Transparency International

## Les clés du succès partagées

- La passion pour leur domaine
- La persévérance face aux défis
- La formation continue
- La maîtrise de l'anglais pour les carrières internationales

Les panélistes ont encouragé les étudiants à planifier leurs objectifs, anticiper les tendances du marché juridique et développer des compétences connexes.

🎥 [Voir la vidéo sur YouTube](https://www.youtube.com/watch?v=8aXcufgyVxk)`,
  },
  {
    id: "reussir-impacter",
    titre: "Réussir et impacter sa communauté : quel investissement des jeunes pour relever le défi ?",
    extrait: "Le 2 décembre 2022 à l'Agora Senghor de Lomé, Ma Belle Promo a organisé une rencontre intergénérationnelle réunissant près de 200 participants autour des leviers pour réussir tout en impactant sa communauté.",
    date: "7 Mars 2023",
    categorie: "Conférence",
    image: "/images/evenements/dialogue-generations.jpg",
    youtube: null,
    photos: [],
    contenu: `Le **02 décembre 2022** à l'Agora Senghor de Lomé, Ma Belle Promo a organisé une rencontre de dialogue intergénérationnel sur le thème :

> **« Réussir et impacter sa communauté : quel investissement de la jeunesse pour relever le défi »**

Environ **200 participants** y ont assisté.

## Les intervenants

- **Me Laurent ASSIOBO** — Avocat au Barreau du Togo
- **Falila DOGO-TCHANILE** — Présidente de la Fédération Togolaise d'Athlétisme
- **Edwige KUAGBENU** — Enseignante à l'Université de Lomé
- **Corinne SODJADAN** — Juriste Sociologue
- **Sam AYEVA** — Assureur, Responsable local de la filiale togolaise du groupe Ascoma
- **Romuald AFATCHAO** — Enseignant à l'Université d'Idaho (USA)
- **Jean-Marie TESSI** — Directeur de GTA Assurance Vie Togo *(invité de marque)*

**Modérateur :** André Kangni AFANOU, Secrétaire de MBP et Coordonnateur Afrique du CCPR Centre.

## Les échanges

Les aînés ont partagé leurs conseils pour surmonter les obstacles culturels, sociaux et économiques, en insistant sur l'importance de se fixer des objectifs clairs et de rester connecté à sa communauté.

La rencontre s'est clôturée par les mots de **Me Sylvestre GOSSOU** et du **juge Florent MESSAN**.`,
  },
  {
    id: "gala-bienfaisance",
    titre: "Première Soirée de Gala et de Bienfaisance de Ma Belle Promo",
    extrait: "Le 30 juillet 2022 dans l'ancien immeuble Oro à Lomé, Ma Belle Promo s'est révélée au grand public lors de sa Soirée de Gala, lançant son programme de bourses avec un premier bénéficiaire.",
    date: "30 Juil 2022",
    categorie: "Gala",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=700&h=400&fit=crop",
    youtube: null,
    photos: [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=700&h=400&fit=crop",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=700&h=400&fit=crop",
    ],
    contenu: `L'association Ma Belle Promo s'est révélée au grand public lors de sa **Soirée de Gala et de bienfaisance**, tenue le **30 juillet 2022** à Lomé dans l'ancien immeuble Oro.

Plusieurs séquences ont rythmé la soirée, avec des intermèdes récréatifs d'un artiste de la place.

## Le programme de la soirée

La présidente **Fabienne SENAYA-ATAYI** a présenté Ma Belle Promo aux convives, suivie d'une présentation des actions de l'association par **Joël AGBEMELO**. Maître **Martial AKAKPO**, illustre invité, a conclu cette série d'interventions en encourageant l'initiative.

## Lancement du programme de bourses

Temps fort de la soirée : MBP a lancé son **programme d'octroi de bourses et d'aides**. Le premier bénéficiaire est **Edmond AKAMEBOU**, étudiant malvoyant actuellement en deuxième année de Droit.

Cette soirée a permis à l'association de tisser des liens avec d'autres structures et de jeter les bases de potentielles synergies. Au vu du succès de cette première édition, une deuxième soirée était déjà envisagée pour l'année suivante.`,
  },
  {
    id: "noel-enfants",
    titre: "Opération « Noël des enfants »",
    extrait: "Le 23 décembre 2021, Ma Belle Promo a rendu visite à l'Orphelinat « La Solution » avec des cadeaux plein les bras, maintenant sa tradition de soutien aux personnes en situation de précarité malgré la pandémie.",
    date: "23 Déc 2021",
    categorie: "Solidarité",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=700&h=400&fit=crop",
    youtube: null,
    photos: [
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=700&h=400&fit=crop",
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=700&h=400&fit=crop",
    ],
    contenu: `Quoi de mieux que de voir un tout-petit avec les yeux brillants, tout émerveillé à l'approche de cette période si attendue ? **Noël est assurément la fête des enfants**, peu importe leur situation, et il est important que cela perdure pour de multiples raisons.

Ma Belle Promo, pendant ces temps difficiles de pandémie, comme à son habitude, a songé aux personnes en situation de précarité. L'Orphelinat **« La Solution »** a reçu ce **23 décembre 2021** la visite de notre association, avec dans notre hotte plein de cadeaux pour les orphelins de l'institution et de quoi leur faire passer de bonnes fêtes.

Noël est décidément magique.

**Joyeux Noël à tous.**`,
  },
  {
    id: "metiers-classiques-droit",
    titre: "Les métiers classiques du Droit — premier webinaire d'une série",
    extrait: "Ma Belle Promo a organisé le 22 septembre 2021 son premier webinaire consacré aux métiers « classiques » du droit, premier d'une série de conférences destinées aux étudiants de la Faculté de Droit.",
    date: "22 Sept 2021",
    categorie: "Webinaire",
    image: "https://i.ytimg.com/vi/1Qdm3Sj_qOU/maxresdefault.jpg",
    youtube: "https://www.youtube.com/watch?v=1Qdm3Sj_qOU",
    photos: [],
    contenu: `Ma Belle Promo a le plaisir de partager l'enregistrement de son **webinaire du 22 septembre 2021**, premier d'une série de conférences destinées aux étudiants de la Faculté de Droit.

Ce webinaire était consacré aux métiers *« classiques »* du droit : magistrature, barreau, notariat, huissariat, et les métiers de la fonction publique juridique.

Les intervenants, membres ou proches de Ma Belle Promo, ont partagé leur parcours et leurs conseils pour aborder avec succès les concours et les premières années de pratique professionnelle.

La deuxième partie de cette série, consacrée aux **métiers émergents et non classiques du droit**, a été organisée en mai 2023.

🎥 [Voir la vidéo sur YouTube](https://www.youtube.com/watch?v=1Qdm3Sj_qOU)`,
  },
  {
    id: "partage-alg-connectogo",
    titre: "Partage d'expériences avec les jeunes de l'ALG et de ConnecTogo",
    extrait: "En collaboration avec le CDFDH, Ma Belle Promo a organisé une séance de partage d'expériences animée par Koffi Junior AOUGA, membre de la diaspora MBP, avec les jeunes de deux associations togolaises de leadership.",
    date: "29 Juil 2021",
    categorie: "Conférence",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=700&h=400&fit=crop",
    youtube: null,
    photos: [
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=700&h=400&fit=crop",
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=700&h=400&fit=crop",
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=700&h=400&fit=crop",
    ],
    contenu: `En collaboration avec le **Centre de Documentation et de Formation sur les Droits de l'Homme (CDFDH)** présidé par André Kangni Afanou, Ma Belle Promo a organisé une séance de partage d'expériences avec les jeunes de l'**Alternative Leadership Group (ALG)** et de **ConnecTogo**.

Ces deux associations togolaises œuvrent dans la formation de jeunes leaders et la promotion d'un cadre favorable pour encourager leurs initiatives en faveur d'une meilleure cohésion sociale.

## L'intervenant

La séance a été principalement animée par **M. Koffi Junior AOUGA**, membre de la diaspora MBP, de passage à Lomé. Il a partagé ses expériences professionnelles aux États-Unis en établissant des parallèles avec les parcours de grands leaders mondiaux.

Son message central : **s'imposer discipline et rigueur de tous les instants** dans ce que l'on entreprend.

Cet échange a été très apprécié par l'auditoire qui saura, on l'espère, faire de ces principes des repères dans l'accomplissement de leur propre destinée.`,
  },
  {
    id: "membre-fta",
    titre: "Un membre de Ma Belle Promo à la tête de la Fédération Togolaise d'Athlétisme",
    extrait: "Fraîchement élue Présidente de la Fédération Togolaise d'Athlétisme, Falilatou TCHANILE-DOGO, Trésorière Générale de MBP, représentait le Togo aux JO de Tokyo. On valorise le leadership et les talents à MBP.",
    date: "13 Juil 2021",
    categorie: "Événement",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=700&h=400&fit=crop",
    youtube: null,
    photos: ["https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=700&h=400&fit=crop"],
    contenu: `Madame **Falilatou TCHANILE-DOGO**, **Trésorière Générale de Ma Belle Promo**, a été nommée **Présidente de la Fédération Togolaise d'Athlétisme (FTA)**.

Elle et les athlètes togolais étaient à la Primature pour la remise du drapeau à la délégation en route pour les **Jeux Olympiques de Tokyo**, par la Cheffe du Gouvernement.

Cette nouvelle illustre l'engagement et le rayonnement des membres de l'association au-delà du cercle juridique.

*On valorise le leadership et les talents à MBP.*

Bonne chance à la délégation togolaise pour les JO de Tokyo !`,
  },
  {
    id: "premiere-ago",
    titre: "Première Assemblée Générale Ordinaire de Ma Belle Promo",
    extrait: "Le 3 juillet 2021, Ma Belle Promo a tenu sa première Assemblée Générale Ordinaire depuis sa création en 2018, dans un format hybride présentiel et Zoom Meeting imposé par les restrictions sanitaires.",
    date: "3 Juil 2021",
    categorie: "Association",
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=700&h=400&fit=crop",
    youtube: null,
    photos: [
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=700&h=400&fit=crop",
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=700&h=400&fit=crop",
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=700&h=400&fit=crop",
    ],
    contenu: `Le **3 juillet 2021**, Ma Belle Promo a tenu sa **première Assemblée Générale Ordinaire** depuis sa création en 2018, dans un **format hybride** (présentiel et Zoom Meeting) en raison des restrictions sanitaires liées à la Covid-19.

## Au programme

Cette journée dense a permis d'examiner :
- Les **rapports usuels** (rapport moral, rapport financier)
- L'adoption du **Règlement Intérieur**
- La discussion sur la **Caisse de Solidarité**
- Les nouvelles orientations stratégiques

Après plus de **quatre heures de discussions**, la plupart des sujets ont été traités, les autres renvoyés au Bureau pour suites.

Ces décisions ont ouvert de nouvelles orientations stratégiques pour l'association.

Un grand **MERCI** à tous.`,
  },
  {
    id: "remise-prix-memoires",
    titre: "Remise des prix — 1ère édition du concours « Meilleur Mémoire sur les Droits de l'Homme »",
    extrait: "L'association MBP et le CDFDH ont organisé la remise des prix aux lauréats de la première édition du concours, le 29 novembre 2019, dans la Salle Ahadzi-Nonou à l'Université de Lomé.",
    date: "29 Nov 2019",
    categorie: "Prix",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=700&h=400&fit=crop",
    youtube: null,
    photos: ["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=700&h=400&fit=crop"],
    contenu: `L'association **Ma Belle Promo (MBP)** et le **Centre de Formation sur les Droits de l'Homme (CDFDH)** ont organisé la remise des prix aux lauréats de la première édition du concours **« Meilleur Mémoire sur les Droits de l'Homme »**, le **29 novembre 2019** dans la Salle AHADZI-NONOU à la présidence de l'Université de Lomé.

## Un concours d'envergure nationale

Lancé le **09 septembre 2019**, ce concours a été co-organisé en partenariat avec le Ministère en charge des Droits de l'Homme et l'Université de Lomé, avec l'appui du **PNUD**.

La cérémonie s'est tenue en présence de :
- La représentante du **Ministre des Droits de l'Homme**
- Le **1er Vice-président de l'Université de Lomé**
- L'envoyée du représentant résident du **PNUD**

## Quatre catégories primées

- **Droits civils et politiques**
- **Droits économiques, sociaux et culturels**
- **Droit des groupes vulnérables**
- **Droit à la protection d'un environnement sain et la sauvegarde de la paix**

Les mémoires primés ont été **édités et publiés** en tant qu'ouvrages, mis en vente sur des plateformes numériques et disponibles dans la médiathèque du CDFDH.`,
  },
  {
    id: "semaine-jeune-fille-amegan",
    titre: "Ma Belle Promo célèbre la semaine de la jeune fille avec Maître Claude AMEGAN",
    extrait: "Dans le cadre de la Semaine de la Jeune Fille, Ma Belle Promo a organisé une rencontre au Campus universitaire de Lomé sur le thème « Séduction, Agression et Harcèlements sexuels : du permis à l'interdit ».",
    date: "30 Oct 2019",
    categorie: "Conférence",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=700&h=400&fit=crop",
    youtube: null,
    photos: ["https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=700&h=400&fit=crop"],
    contenu: `Dans le cadre de la **Semaine de la Jeune Fille**, des rencontres se sont tenues au **Campus universitaire de Lomé**, à l'initiative du **Groupe de réflexion et d'action Femmes, Démocratie et Développement (GF2D)**.

Un partenariat s'est noué avec le **CDFDH** de Kangni A. Afanou, qui œuvre dans la promotion des droits humains. C'est dans ce cadre que Ma Belle Promo a été sollicitée pour une conférence sur le thème :

> **« Séduction, Agression et Harcèlements sexuels : du permis à l'interdit »**

Le public cible : **jeunes collégiennes et lycéennes**, leaders de demain.

## La communication de Maître Claude AMEGAN

Très impliquée dans le renforcement du leadership de la femme — comme l'avait démontré l'émission *« Femme et environnement »* sur Nana FM — Ma Belle Promo a une fois encore fait montre de son expertise.

Maître **Claude AMEGAN** a fait le tour de la question, sensibilisant son auditoire sur le fait que des moyens légaux existent pour sanctionner ces actes et permettre aux victimes de recouvrer leur dignité.`,
  },
  {
    id: "rencontre-cdfdh",
    titre: "Rencontre entre MBP et le Centre de Documentation et de Formation sur les Droits de l'Homme",
    extrait: "Le 16 juillet 2019, Ma Belle Promo a rencontré le CDFDH pour poser les bases d'un partenariat actif, débouchant sur des actions communes importantes, notamment le concours du Meilleur Mémoire.",
    date: "17 Juil 2019",
    categorie: "Partenariat",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=700&h=400&fit=crop",
    youtube: null,
    photos: [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=700&h=400&fit=crop",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=700&h=400&fit=crop",
    ],
    contenu: `Dans le cadre de notre futur partenariat avec le **Centre de Documentation et de Formation sur les Droits de l'Homme (CDFDH)** d'André Kangni **AFANOU**, Ma Belle Promo a eu une séance de travail avec son équipe le **mardi 16 juillet 2019 à 17h30**.

La séance a été assez riche. Le CDFDH et MBP ont convenu de mettre sur pied un **Comité ad hoc** pour préparer et signer une Convention de partenariat.

## Les axes de travail identifiés

- Organisation d'une **vidéo-conférence avec le Prix Nobel Denis Mukwege**
- Offrir des **prix pour les meilleurs mémoires** portant sur les droits de l'homme à l'intention des Facultés de droit et de sociologie
- Élaborer et publier des **manuels sur les opportunités et les professions du droit**
- Renforcer les **capacités des jeunes et des femmes** sur l'engagement citoyen
- Travailler sur la **défense et la promotion du droit à un environnement sain**

Cette collaboration a depuis débouché sur des actions communes importantes, notamment le **concours du Meilleur Mémoire sur les Droits de l'Homme** (édition 2019).`,
  },
  {
    id: "rencontre-decanat",
    titre: "Première rencontre avec le décanat de la Faculté de Droit",
    extrait: "Le Bureau Exécutif de Ma Belle Promo a été reçu par le décanat de la Faculté de Droit de l'Université de Lomé pour présenter officiellement l'association et explorer les futures collaborations.",
    date: "4 Juil 2019",
    categorie: "Partenariat",
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=700&h=400&fit=crop",
    youtube: null,
    photos: [
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=700&h=400&fit=crop",
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=700&h=400&fit=crop",
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=700&h=400&fit=crop",
    ],
    contenu: `Le **Bureau Exécutif de Ma Belle Promo**, comme prévu, a été reçu par le décanat de la **Faculté de Droit de l'Université de Lomé**.

Cette prise de contact officielle marque le début de la relation entre l'association et la Faculté, confirmant l'ancrage de MBP dans son institution d'origine.

Cette rencontre avait pour objectifs de :

1. **Présenter officiellement** notre association aux responsables de la Faculté
2. **Partager notre vision** et nos ambitions pour les étudiants en droit
3. **Échanger** sur les futures collaborations dans le cadre de nos activités à l'endroit des étudiants`,
  },
  {
    id: "femmes-changements-climatiques",
    titre: "Femmes & Changements Climatiques — émission sur Nana FM",
    extrait: "Le 11 avril 2019 sur les ondes de Nana FM, Ma Belle Promo a participé à une émission pour sensibiliser la gente féminine, actrice centrale du développement durable, aux enjeux des changements climatiques.",
    date: "11 Avr 2019",
    categorie: "Médias",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=700&h=400&fit=crop",
    youtube: null,
    photos: ["https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=700&h=400&fit=crop"],
    contenu: `Le **11 avril 2019**, une émission diffusée sur les ondes de **Nana FM** a permis de sensibiliser la gente féminine — actrice centrale du développement durable — aux enjeux des changements climatiques. Ma Belle Promo y a participé pour mettre en lumière le rôle des femmes dans la lutte pour l'environnement.

L'émission avait pour buts :

- **Conscientiser les femmes** sur les dangers auxquels notre environnement fait face du fait de l'action humaine
- **Les amener à adopter** des comportements responsables allant dans la préservation de l'environnement
- **Souligner le rôle central** des femmes dans la transition écologique et le développement durable

Cette initiative illustre l'engagement de Ma Belle Promo à dépasser le cadre purement juridique pour s'investir dans les grands enjeux de société.`,
  },
  {
    id: "premiere-reunion-bureau",
    titre: "Première réunion du Bureau Exécutif de Ma Belle Promo",
    extrait: "La réunion du Bureau Exécutif du 23 mars 2019 a permis de dégager un plan d'action couvrant les formalités, le membership, la visibilité et les programmes de formation internes et publics.",
    date: "23 Mars 2019",
    categorie: "Association",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=700&h=400&fit=crop",
    youtube: null,
    photos: [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=700&h=400&fit=crop",
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=700&h=400&fit=crop",
    ],
    contenu: `La **première réunion du Bureau Exécutif de Ma Belle Promo (BE-MBP)** s'est tenue le **23 mars 2019**. Elle a permis de poser les jalons organisationnels de l'association, quelques mois après sa création officielle.

## Plan d'action dégagé

**À l'interne :**
- Formalités (enregistrement auprès des Ministères, récépissé)
- Renforcement et organisation interne
- Membership : identification des membres, registre
- Réseautage : Université de Lomé, FDD, médias, associations, ONGs, ambassades
- Visibilité : site web, page Facebook, Twitter, émissions

**Formations à l'interne :** vie associative, leadership, développement personnel, élaboration de projets, techniques de plaidoirie, e-réputation.

**Formations à l'endroit du public :** jeunes FDD, étudiants, stages, partage d'expériences, banque d'expertise.

**Axes d'activités :**
A — Citoyenneté et bonne gouvernance
B — Santé
C — Entrepreneuriat
D — Éducation (conférences, émissions, sensibilisation, productions vidéo)`,
  },
  {
    id: "mbp-en-gestation",
    titre: "Ma Belle Promo en gestation — le processus de légalisation suit son cours",
    extrait: "Après l'Assemblée Générale Constitutive du 1er décembre 2018, Ma Belle Promo confirme le dépôt officiel de son dossier de déclaration auprès des autorités togolaises le 1er mars 2019.",
    date: "1 Mars 2019",
    categorie: "Association",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=700&h=400&fit=crop",
    youtube: null,
    photos: ["https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=700&h=400&fit=crop"],
    contenu: `## Le processus de légalisation de Ma Belle Promo suit son cours

Après l'Assemblée Générale Constitutive du **1er Décembre 2018**, nous avons le plaisir de confirmer le **dépôt officiel et l'acceptation** auprès des autorités, le **1er Mars 2019**, de notre dossier de déclaration.

Quelques étapes restent encore à franchir avant que nous soyons intégrés légalement au tissu associatif togolais.

> L'association sera officiellement reconnue le **03 octobre 2019** sous le Récépissé N° **0920/MATDCL-SG-DLPAP-DOCA** — Enregistrement N°160 du 1er Mars 2019.

Merci à tous pour votre soutien et votre confiance.`,
  },
  {
    id: "hommage-professeur-tordjo",
    titre: "Un de nos professeurs s'en est allé — Hommage au Professeur Tordjo",
    extrait: "L'association Ma Belle Promo a été conviée à la cérémonie d'hommage rendu au Professeur Tordjo, « Papa Tordjo » pour ses étudiants, décédé le 19 janvier 2019 après des décennies au service de l'Université de Lomé.",
    date: "19 Jan 2019",
    categorie: "Hommage",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=700&h=400&fit=crop",
    youtube: null,
    photos: [
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=700&h=400&fit=crop",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=700&h=400&fit=crop",
    ],
    contenu: `**Hommage de la Faculté de Droit le 06 Février 2019 à « Papa Tordjo »**, auquel notre Association FDD MBP a été conviée.

C'est comme cela que la plupart d'entre nous, ses étudiants, l'appelions — car il était non seulement notre professeur, mais avait aussi figure de père pour nous. Il était un monument qui nous enseignait le droit avec **humour et simplicité**. Ses phrases cultes résonneront toujours dans nos têtes.

## La cérémonie d'hommage

Conviée par l'Université de Lomé, l'association **Ma Belle Promo** a eu la chance de rendre hommage au Professeur **Tordjo**, décédé le **19 janvier 2019**. Il aura passé des dizaines d'années à l'Université comme un éminent professeur de droit.

La cérémonie a connu la présence d'imminentes personnalités politiques et administratives, des autorités universitaires de Lomé, des juristes venus de toutes les contrées du Togo ainsi que la famille du défunt.

Pour les membres de l'association, **les acquis et les valeurs humaines** qu'ils ont reçus du défunt doivent être consolidés au bénéfice des générations futures.

*Merci aux amis (Kékéli, Edwige, Fabienne, Alexandre, Ami et Josée) qui ont pu faire le déplacement.*`,
  },
  {
    id: "agc-mbp",
    titre: "Assemblée Générale Constitutive de l'association Ma Belle Promo",
    extrait: "Ce 1er décembre 2018, ce qui n'était qu'un groupe d'amis regroupés sur une plateforme numérique s'est donné une structure officielle. L'association l'Association Ma Belle Promo (MBP) est officiellement née.",
    date: "1 Déc 2018",
    categorie: "Association",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=700&h=400&fit=crop",
    youtube: null,
    photos: ["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=700&h=400&fit=crop"],
    contenu: `Ce **1er décembre 2018**, ce qui n'était qu'un groupe d'amis regroupés sur une plateforme numérique s'est donné une **structure officielle** lors de cette Assemblée Générale Constitutive.

L'association **l'Association Ma Belle Promo (MBP)** — en abrégé **FDD MBP** — est officiellement née.

## Un acte fondateur

Cet acte fondateur marque le point de départ d'une aventure collective au service des étudiants de la Faculté de Droit de l'Université de Lomé et de la communauté.

Lors de cette AGC : adoption des statuts, élection du Bureau Exécutif, définition des grandes orientations de l'association.

L'association sera reconnue officiellement par les autorités le **03 octobre 2019**, sous le Récépissé N° **0920/MATDCL-SG-DLPAP-DOCA**.`,
  },
  {
    id: "retrouvailles-fdd-1994",
    titre: "Retrouvailles des anciens étudiants de la Faculté de Droit, promotion 1994-2000",
    extrait: "Plusieurs années après la fin de leurs études, les anciens étudiants de la FDD promotion 1994-2000 se retrouvent pour célébrer leurs années estudiantines — prémices d'une belle aventure associative.",
    date: "28 Juil 2018",
    categorie: "Histoire",
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=700&h=400&fit=crop",
    youtube: null,
    photos: ["https://images.unsplash.com/photo-1593113598332-cd288d649433?w=700&h=400&fit=crop"],
    contenu: `Plusieurs années après la fin de nos études, **nous revoilà** lors des retrouvailles pour célébrer nos années estudiantines et faire quelque chose de cette magnifique promotion.

## Les prémices d'une belle aventure

Les retrouvailles ont été **extraordinaires** et constituent les prémisses d'un projet d'association qui deviendra, quelques mois plus tard, **Ma Belle Promo**.

Ce moment de retrouvailles entre anciens étudiants de la Faculté de Droit de l'Université de Lomé, promotion **1994-2000**, a ravivé des souvenirs, renforcé des liens et semé les premières graines de ce qui allait devenir une association engagée au service des étudiants et de la communauté.

*C'est de cette belle journée que tout a commencé.*`,
  },
];

// ─── Seed functions ───────────────────────────────────────────────────────────

async function seed(table, rows, label) {
  console.log(`\n⏳  ${label} (${rows.length} lignes)…`);
  const { error } = await supabase
    .from(table)
    .upsert(rows, { onConflict: "id" });
  if (error) {
    console.error(`❌  Erreur ${table} :`, error.message);
  } else {
    console.log(`✅  ${label} OK`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log("🚀  Début du seed — MBP Supabase");
console.log(`    Projet : zbimhhgefmhliqiuwzvb`);

await seed("galeries", galeries, "Galeries (avec toutes les photos)");
await seed("projets",  projets,  "Projets (contenu complet)");
await seed("articles", articles, "Articles (20 articles)");

console.log("\n✨  Seed terminé !");
