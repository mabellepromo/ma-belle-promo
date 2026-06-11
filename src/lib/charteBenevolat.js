// Charte de bénévolat MBP — source de vérité unique.
// Consommée par : la page publique, la modale du formulaire et le générateur PDF.
// Ton : clair, inclusif (« tu »/« nous »), équilibré (droits ET devoirs mutuels).
//
// ⚠️ MODÈLE à faire valider par le bureau. Les éléments [à confirmer] (juridiction,
// date d'entrée en vigueur, détails d'assurance) doivent être tranchés par MBP.
// Ceci n'est pas un avis juridique vérifié.

export const CHARTE_VERSION = "v1.0";
export const CHARTE_DATE = "11 juin 2026"; // [à confirmer]

export const CHARTE = {
  preambule: [
    "Chez Ma Belle Promo (MBP), le bénévolat est une contribution libre et volontaire au service de notre communauté d'alumni en droit et de ses futurs diplômés. Tu donnes du temps, des compétences ou de l'énergie, selon tes possibilités, sans attente de rémunération.",
    "Nos missions sont variées — formation, conférences, aide juridique, actions sociales, développement, logistique, communication, et plus encore. Chacun·e peut contribuer différemment : ponctuellement ou durablement, à distance ou en présentiel, selon son profil et sa disponibilité.",
    "Cette charte pose un cadre simple et réciproque, fondé sur nos valeurs : solidarité, intégrité, excellence, inclusion, responsabilité et flexibilité. Elle protège l'association autant que toi, bénévole.",
    "Accepter cette charte, c'est s'engager mutuellement : tu t'engages à la respecter, et MBP s'engage à te respecter et à t'accompagner.",
  ],
  sections: [
    {
      id: "section-1", num: 1, title: "Droits du bénévole",
      subs: [
        { title: "1.1 Respect & dignité", items: [
          "Aucune discrimination (genre, origine, religion, âge, handicap, orientation, etc.).",
          "Un environnement de travail sain, respectueux et sécurisé.",
          "Le respect de ta dignité et de ta vie privée.",
          "De l'écoute et de la bienveillance dans nos échanges.",
        ]},
        { title: "1.2 Clarté & transparence", items: [
          "Une information claire sur la mission dès la candidature.",
          "Une compréhension des attentes, objectifs et livrables.",
          "La communication des changements qui te concernent.",
          "Le droit de poser des questions avant de t'engager.",
        ]},
        { title: "1.3 Soutien & ressources", items: [
          "L'accès aux ressources nécessaires pour accomplir ta mission.",
          "Un·e coordinateur·rice ou responsable de projet identifié·e.",
          "Une formation ou un accompagnement, si la mission le justifie.",
          "Un appui technique et logistique adapté.",
        ]},
        { title: "1.4 Retour & reconnaissance", items: [
          "Un retour régulier sur ta contribution.",
          "La reconnaissance explicite du travail accompli.",
          "Une attestation de bénévolat sur demande.",
          "Une mention dans nos communications, si tu y consens.",
          "Une référence ou recommandation, sur demande.",
        ]},
        { title: "1.5 Protection & limites", items: [
          "Une couverture en responsabilité civile, selon la mission et les moyens de l'association.",
          "La protection de tes données personnelles (RGPD).",
          "Le droit de te retirer librement, sans pénalité.",
          "Le respect de l'équilibre entre ta vie privée et ton engagement.",
        ]},
        { title: "1.6 Confidentialité", items: [
          "Le respect du secret professionnel et des données sensibles.",
          "La non-divulgation des informations te concernant ou concernant les participant·e·s.",
          "La protection de tes données personnelles conformément au RGPD.",
        ]},
      ],
    },
    {
      id: "section-2", num: 2, title: "Obligations du bénévole",
      subs: [
        { title: "2.1 Engagement & fiabilité", items: [
          "Respecter les horaires et échéances convenus.",
          "Prévenir MBP en cas d'absence, de retard ou d'imprévu.",
          "Tenir l'engagement de durée convenu pour la mission.",
          "Signaler rapidement tout changement de ta situation.",
        ]},
        { title: "2.2 Qualité & effort raisonnable", items: [
          "Fournir un travail de qualité, à la mesure de tes compétences.",
          "Respecter les directives et standards de MBP.",
          "Faire preuve d'honnêteté et de sérieux dans ta contribution.",
          "Alerter MBP en cas de difficulté ou de doute.",
        ]},
        { title: "2.3 Respect & éthique", items: [
          "Respecter chacun·e : bénévoles, participant·e·s, équipe et partenaires.",
          "Proscrire tout harcèlement, violence ou discrimination.",
          "Adopter une attitude bienveillante et constructive.",
          "Respecter les règles de conduite numériques (missions à distance).",
        ]},
        { title: "2.4 Confidentialité & données", items: [
          "Protéger les données personnelles des participant·e·s.",
          "Ne pas divulguer d'informations sensibles ou stratégiques de MBP.",
          "N'utiliser les données que pour les besoins de la mission.",
          "Respecter le RGPD et les lois applicables (Togo / France).",
        ]},
        { title: "2.5 Honnêteté & compétence", items: [
          "Déclarer tes compétences réelles, sans les exagérer.",
          "Signaler si une tâche dépasse tes capacités.",
          "Rester transparent·e sur ton expérience et tes limites.",
        ]},
        { title: "2.6 Conflits d'intérêts & neutralité", items: [
          "Déclarer tout conflit d'intérêts potentiel.",
          "Ne pas utiliser MBP à des fins personnelles.",
          "S'abstenir de tout prosélytisme politique ou religieux.",
          "Respecter la neutralité et l'inclusivité de l'association.",
        ]},
      ],
    },
    {
      id: "section-3", num: 3, title: "Engagements de MBP",
      subs: [
        { title: "3.1 Encadrement & soutien", items: [
          "Te désigner un·e interlocuteur·rice clair·e pour ta mission.",
          "Clarifier les attentes, objectifs et livrables.",
          "Mettre à disposition les ressources nécessaires.",
          "Rester disponible pour tes questions et difficultés.",
        ]},
        { title: "3.2 Traitement équitable", items: [
          "Ne pratiquer aucune discrimination.",
          "Te traiter avec justice et transparence.",
          "Écouter activement tes préoccupations.",
          "Traiter les conflits avec équité et confidentialité.",
        ]},
        { title: "3.3 Protection & sécurité", items: [
          "Veiller à un environnement sûr, physique et numérique.",
          "Sécuriser les données (accès restreint, protection appropriée).",
          "Te protéger contre le harcèlement et les abus.",
          "T'apporter soutien et ressources en cas de problème.",
        ]},
        { title: "3.4 Communication & retours", items: [
          "Communiquer de manière régulière et transparente.",
          "Te donner un retour sur ta contribution (au moins 1 fois par trimestre pour les missions durables).",
          "Expliquer les décisions qui te concernent.",
          "Accueillir tes suggestions d'amélioration.",
        ]},
        { title: "3.5 Reconnaissance & valorisation", items: [
          "Mettre en avant tes contributions, avec ton accord.",
          "Délivrer une attestation de participation sur demande.",
          "Fournir une référence professionnelle, si tu le souhaites.",
          "Organiser, autant que possible, des temps de remerciement.",
        ]},
      ],
    },
    {
      id: "section-4", num: 4, title: "Durée & fin de l'engagement",
      subs: [
        { title: "4.1 Durée", items: [
          "Définie lors de la candidature (ponctuelle, 3 / 6 / 12 mois, ou autre).",
          "Souple, selon ta situation et le projet.",
          "Renouvelable d'un commun accord.",
        ]},
        { title: "4.2 Départ à ton initiative", items: [
          "Tu peux te retirer librement, sans avoir à te justifier.",
          "Un préavis de 2 semaines est apprécié (sauf urgence ou force majeure).",
          "Aucune pénalité financière.",
          "Restitution du matériel ou des données de MBP, le cas échéant.",
        ]},
        { title: "4.3 Fin à l'initiative de MBP", items: [
          "Pour motif valable : manquement grave à la charte, inactivité prolongée (3 mois et plus), conflit irréconciliable, ou fin de la mission.",
          "Préavis d'un mois (sauf faute grave).",
          "Droit à une explication et à une réponse de ta part.",
          "Traitement équitable et confidentialité du motif.",
        ]},
        { title: "4.4 Transition", items: [
          "MBP facilite la transition lorsque la mission se poursuit.",
          "Documentation et passation, si le projet le nécessite.",
          "Une séparation respectueuse, dans tous les cas.",
        ]},
      ],
    },
    {
      id: "section-5", num: 5, title: "Confidentialité & données (RGPD)",
      subs: [
        { title: "5.1 Données collectées", items: [
          "Nom, email, téléphone, compétences, domaines d'intérêt, disponibilité, engagement.",
          "Utilisées uniquement pour la gestion des missions et la communication de MBP.",
          "Jamais vendues ni partagées à des tiers sans ton consentement explicite.",
        ]},
        { title: "5.2 Sécurité", items: [
          "Données hébergées sur une infrastructure sécurisée (Supabase).",
          "Accès restreint au bureau et aux coordinateur·rice·s concerné·e·s.",
          "Sauvegardes régulières.",
          "En cas de violation de données, notification dans les meilleurs délais (objectif 72 h, RGPD).",
        ]},
        { title: "5.3 Tes droits", items: [
          "Accès : obtenir une copie de tes données.",
          "Rectification : corriger des données inexactes.",
          "Effacement : suppression de tes données (sauf obligation légale).",
          "Portabilité : récupérer tes données dans un format réutilisable.",
          "Opposition : refuser un traitement spécifique.",
          "Réponse sous 30 jours maximum.",
        ]},
        { title: "5.4 Conservation", items: [
          "Données actives : pendant l'engagement, puis 1 an.",
          "Données à valeur légale ou comptable : jusqu'à 5 ans.",
          "Suppression sur demande : sous 30 jours (hors obligations légales).",
        ]},
        { title: "5.5 Consentements séparés", items: [
          "Profil visible par la communauté : uniquement avec ton accord explicite.",
          "Publication (site, réseaux) : uniquement avec ton accord.",
          "Photo / vidéo : consentement à l'image distinct.",
          "Newsletter : opt-in volontaire (jamais pré-coché).",
          "Chaque consentement est tracé et réversible à tout moment.",
        ]},
      ],
    },
    {
      id: "section-6", num: 6, title: "Responsabilité & assurance",
      subs: [
        { title: "6.1 Assurance responsabilité civile", items: [
          "MBP s'efforce de souscrire une assurance responsabilité civile, selon ses moyens. [à confirmer]",
          "Couvre les dommages corporels ou matériels involontaires causés dans le cadre d'une mission.",
          "Exclut les dommages volontaires, la négligence grave et la malveillance.",
        ]},
        { title: "6.2 Limites de responsabilité", items: [
          "MBP est responsable de l'encadrement, des ressources et du soutien.",
          "Le ou la bénévole est responsable d'un effort raisonnable et du respect de la charte.",
          "La responsabilité de chacun reste proportionnée, dans les limites prévues par la loi.",
        ]},
        { title: "6.3 Statut", items: [
          "Le bénévolat n'est pas un emploi : aucun contrat de travail ni lien de subordination salarial.",
          "Aucune cotisation sociale n'est due au titre du bénévolat.",
          "Le bénévolat ne génère pas de revenu imposable.",
        ]},
        { title: "6.4 Frais & reconnaissance", items: [
          "Remboursement des frais raisonnables, sur justificatifs et accord préalable (transport, matériel nécessaire, formation demandée par MBP).",
          "Procédure : demande écrite accompagnée des justificatifs.",
          "Aucune rémunération ; des marques de reconnaissance non monétaires restent possibles.",
        ]},
      ],
    },
    {
      id: "section-7", num: 7, title: "Résolution des différends",
      subs: [
        { title: "7.1 Dialogue direct (étape 1)", items: [
          "En parler directement avec la personne concernée ou ton·ta coordinateur·rice.",
          "Dans un esprit d'ouverture et de bienveillance.",
          "Délai de réponse : 1 semaine maximum.",
        ]},
        { title: "7.2 Médiation (étape 2)", items: [
          "À défaut de solution, demander une médiation au bureau.",
          "Rencontre avec un·e médiateur·rice neutre et la partie concernée.",
          "Objectif : une solution mutuellement acceptable, sous 2 semaines.",
          "Confidentialité pour toutes les parties.",
        ]},
        { title: "7.3 Examen par le bureau (étape 3)", items: [
          "Si la médiation échoue, le bureau examine le dossier.",
          "Examen équitable, avec droit à une réponse écrite de ta part.",
          "Décision motivée par écrit, sous 1 mois.",
        ]},
        { title: "7.4 Décision & dignité", items: [
          "La décision du bureau est définitive, sauf élément nouveau.",
          "Confidentialité maintenue par toutes les parties.",
          "Aucune diffamation publique ni représailles.",
        ]},
      ],
    },
    {
      id: "section-8", num: 8, title: "Dispositions finales",
      subs: [
        { title: "8.1 Droit applicable", items: [
          "Charte régie par le droit français pour les aspects RGPD (CNIL), et respectueuse du droit togolais pour les actions locales.",
          "Juridiction compétente : [à confirmer — Lomé ou Paris].",
          "La médiation est privilégiée avant tout recours.",
          "En cas de doute d'interprétation, la version française fait référence.",
        ]},
        { title: "8.2 Modifications", items: [
          "MBP peut modifier la charte avec un préavis d'un mois.",
          "Notification par email aux bénévoles actifs.",
          "Les nouvelles candidatures acceptent la version en vigueur.",
          "Versionnage (v1.0, v1.1, …) avec suivi des changements.",
          "Droit de retrait sans pénalité pour les bénévoles existants en désaccord.",
        ]},
        { title: "8.3 Non-discrimination", items: [
          "La charte s'applique également à toutes et tous.",
          "Tolérance zéro pour le harcèlement et la discrimination.",
          "Une plainte pour discrimination peut être portée directement au bureau (étape 3).",
        ]},
        { title: "8.4 Entrée en vigueur", items: [
          `Version ${CHARTE_VERSION}, effective au ${CHARTE_DATE}.`,
          "Version française de référence ; une traduction anglaise pourra être fournie.",
          "Acceptation obligatoire pour toute nouvelle candidature.",
          "Disponible sur www.mabellepromo.org.",
        ]},
      ],
    },
  ],
};
