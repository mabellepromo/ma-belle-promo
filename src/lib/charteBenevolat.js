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
    "Chez Ma Belle Promo (MBP), le bénévolat est une contribution libre et volontaire au service de notre communauté d'alumni en droit et de ses futurs diplômés. Tu donnes du temps, des compétences ou de l'énergie, selon tes possibilités, sans attendre de rémunération en retour.",
    "Nos missions sont variées : formation, conférences, aide juridique, actions sociales, développement, logistique ou communication. Chacune est différente, et chacun·e peut contribuer à sa manière, ponctuellement ou durablement, à distance ou en présentiel, selon son profil et sa disponibilité.",
    "Cette charte pose un cadre simple et réciproque, fondé sur nos valeurs de solidarité, d'intégrité, d'excellence, d'inclusion, de responsabilité et de flexibilité. Elle a été pensée pour protéger l'association autant que toi, bénévole.",
    "Accepter cette charte, c'est prendre un engagement mutuel : tu t'engages à la respecter, et MBP s'engage en retour à te respecter et à t'accompagner tout au long de ta mission.",
  ],
  sections: [
    {
      id: "section-1", num: 1, title: "Droits du bénévole",
      subs: [
        { title: "1.1 Respect et dignité", items: [
          "Tu ne subiras aucune discrimination, qu'elle soit fondée sur le genre, l'origine, la religion, l'âge, le handicap ou l'orientation.",
          "Tu évolueras dans un environnement de travail sain, respectueux et sécurisé.",
          "Ta dignité et ta vie privée seront respectées en toutes circonstances.",
          "Tu seras écouté·e avec attention et bienveillance dans l'ensemble de nos échanges.",
        ]},
        { title: "1.2 Clarté et transparence", items: [
          "Tu recevras une information claire sur la mission dès ta candidature.",
          "Tu sauras précisément ce qu'on attend de toi, ainsi que les objectifs et les résultats visés.",
          "Tu seras tenu·e informé·e de tout changement qui te concerne.",
          "Tu pourras poser toutes tes questions avant de prendre ton engagement.",
        ]},
        { title: "1.3 Soutien et ressources", items: [
          "Tu disposeras des ressources nécessaires pour mener ta mission à bien.",
          "Un·e coordinateur·rice ou responsable de projet sera ton point de contact identifié.",
          "Tu bénéficieras d'une formation ou d'un accompagnement lorsque la mission le justifie.",
          "Tu recevras un appui technique et logistique adapté à ta mission.",
        ]},
        { title: "1.4 Retour et reconnaissance", items: [
          "Tu recevras un retour régulier sur la contribution que tu apportes.",
          "Le travail que tu accomplis sera reconnu de manière explicite.",
          "Une attestation de bénévolat te sera délivrée sur simple demande.",
          "Tes contributions pourront être mises en avant dans nos communications, si tu y consens.",
          "Une référence ou une recommandation professionnelle pourra t'être fournie sur demande.",
        ]},
        { title: "1.5 Protection et limites", items: [
          "MBP s'efforce de te couvrir en responsabilité civile, selon la nature de la mission et les moyens de l'association.",
          "Tes données personnelles sont protégées conformément au RGPD.",
          "Tu peux te retirer librement à tout moment, sans subir de pénalité.",
          "L'équilibre entre ta vie privée et ton engagement sera toujours respecté.",
        ]},
        { title: "1.6 Confidentialité", items: [
          "Le secret professionnel et la confidentialité des données sensibles seront respectés.",
          "Les informations te concernant, ou concernant les participant·e·s, ne seront pas divulguées.",
          "Tes données personnelles demeurent protégées conformément au RGPD.",
        ]},
      ],
    },
    {
      id: "section-2", num: 2, title: "Engagements du bénévole",
      subs: [
        { title: "2.1 Engagement et fiabilité", items: [
          "Tu t'engages à respecter les horaires et les échéances convenus ensemble.",
          "Tu préviens MBP dès que possible en cas d'absence, de retard ou d'imprévu.",
          "Tu tiens l'engagement de durée que tu as accepté pour la mission.",
          "Tu signales rapidement tout changement de ta situation susceptible d'affecter ta mission.",
        ]},
        { title: "2.2 Qualité et effort raisonnable", items: [
          "Tu fournis un travail de qualité, à la mesure de tes compétences.",
          "Tu respectes les directives et les standards définis par MBP.",
          "Tu fais preuve d'honnêteté et de sérieux dans ta contribution.",
          "Tu alertes MBP dès que tu rencontres une difficulté ou un doute.",
        ]},
        { title: "2.3 Respect et éthique", items: [
          "Tu respectes chacun·e : bénévoles, participant·e·s, équipe et partenaires.",
          "Tu t'abstiens de tout harcèlement, de toute violence et de toute discrimination.",
          "Tu adoptes une attitude bienveillante et constructive en toutes circonstances.",
          "Tu respectes les règles de bonne conduite numérique lors des missions à distance.",
        ]},
        { title: "2.4 Confidentialité et données", items: [
          "Tu protèges les données personnelles des participant·e·s.",
          "Tu ne divulgues aucune information sensible ou stratégique de MBP.",
          "Tu n'utilises les données que pour les seuls besoins de ta mission.",
          "Tu respectes le RGPD ainsi que les lois applicables au Togo et en France.",
        ]},
        { title: "2.5 Honnêteté et compétence", items: [
          "Tu déclares tes compétences réelles, sans les surévaluer.",
          "Tu signales lorsqu'une tâche dépasse tes capacités, afin qu'on puisse t'orienter autrement.",
          "Tu restes transparent·e sur ton expérience et sur tes limites.",
        ]},
        { title: "2.6 Conflits d'intérêts et neutralité", items: [
          "Tu déclares tout conflit d'intérêts, qu'il soit réel ou seulement potentiel.",
          "Tu n'utilises pas ta position au sein de MBP à des fins personnelles.",
          "Tu t'abstiens de tout prosélytisme politique ou religieux.",
          "Tu respectes la neutralité et l'inclusivité de l'association.",
        ]},
      ],
    },
    {
      id: "section-3", num: 3, title: "Engagements de MBP",
      subs: [
        { title: "3.1 Encadrement et soutien", items: [
          "MBP te désigne un·e interlocuteur·rice clairement identifié·e pour ta mission.",
          "MBP clarifie avec toi les attentes, les objectifs et les résultats à atteindre.",
          "MBP met à ta disposition les ressources dont tu as besoin.",
          "MBP reste disponible pour répondre à tes questions et t'aider en cas de difficulté.",
        ]},
        { title: "3.2 Traitement équitable", items: [
          "MBP ne pratique aucune discrimination envers ses bénévoles.",
          "MBP te traite avec justice et transparence.",
          "MBP écoute activement tes préoccupations.",
          "MBP traite les éventuels conflits avec équité et dans la confidentialité.",
        ]},
        { title: "3.3 Protection et sécurité", items: [
          "MBP veille à un environnement sûr, sur le plan physique comme numérique.",
          "MBP sécurise les données et en restreint l'accès aux seules personnes concernées.",
          "MBP te protège contre le harcèlement et les abus.",
          "MBP t'apporte soutien et ressources si un problème survient.",
        ]},
        { title: "3.4 Communication et retours", items: [
          "MBP communique avec toi de manière régulière et transparente.",
          "MBP te fait un retour sur ta contribution, au moins une fois par trimestre pour les missions durables.",
          "MBP t'explique les décisions qui te concernent.",
          "MBP accueille volontiers tes suggestions d'amélioration.",
        ]},
        { title: "3.5 Reconnaissance et valorisation", items: [
          "MBP met en avant tes contributions, avec ton accord préalable.",
          "MBP te délivre une attestation de participation sur demande.",
          "MBP te fournit une référence professionnelle si tu le souhaites.",
          "MBP organise, dans la mesure du possible, des temps de remerciement et de convivialité.",
        ]},
      ],
    },
    {
      id: "section-4", num: 4, title: "Durée et fin de l'engagement",
      subs: [
        { title: "4.1 Durée", items: [
          "La durée de ton engagement est définie lors de ta candidature : elle peut être ponctuelle, de trois, six ou douze mois, ou suivre une autre modalité.",
          "Elle reste souple et s'adapte à ta situation comme aux besoins du projet.",
          "Elle peut être renouvelée d'un commun accord.",
        ]},
        { title: "4.2 Départ à ton initiative", items: [
          "Tu peux te retirer librement, sans avoir à te justifier.",
          "Un préavis de deux semaines est apprécié, sauf en cas d'urgence ou de force majeure.",
          "Ton départ n'entraîne aucune pénalité financière.",
          "Tu restitues, le cas échéant, le matériel et les données de MBP en ta possession.",
        ]},
        { title: "4.3 Fin à l'initiative de MBP", items: [
          "MBP ne peut mettre fin à ton engagement que pour un motif valable : un manquement grave à la charte, une inactivité prolongée de trois mois ou plus, un conflit irréconciliable, ou la fin de la mission.",
          "Un préavis d'un mois s'applique, sauf en cas de faute grave.",
          "Tu as droit à une explication et à la possibilité de faire valoir ton point de vue.",
          "La décision est prise avec équité et le motif demeure confidentiel.",
        ]},
        { title: "4.4 Transition", items: [
          "MBP facilite la transition lorsque la mission se poursuit après ton départ.",
          "Une passation et une documentation sont prévues si le projet le nécessite.",
          "Dans tous les cas, la séparation se fait dans le respect mutuel.",
        ]},
      ],
    },
    {
      id: "section-5", num: 5, title: "Confidentialité et données personnelles (RGPD)",
      subs: [
        { title: "5.1 Données collectées", items: [
          "MBP collecte ton nom, ton adresse email, ton téléphone, tes compétences, tes domaines d'intérêt, ta disponibilité et ton niveau d'engagement.",
          "Ces données servent uniquement à la gestion des missions et à la communication de l'association.",
          "Elles ne sont jamais vendues ni partagées à des tiers sans ton consentement explicite.",
        ]},
        { title: "5.2 Sécurité des données", items: [
          "Tes données sont hébergées sur une infrastructure sécurisée (Supabase).",
          "Leur accès est restreint au bureau et aux coordinateur·rice·s concerné·e·s.",
          "Des sauvegardes régulières sont réalisées pour prévenir toute perte.",
          "En cas de violation de données, MBP s'engage à notifier les personnes concernées dans les meilleurs délais, avec un objectif de 72 heures conformément au RGPD.",
        ]},
        { title: "5.3 Tes droits", items: [
          "Tu peux accéder à tes données et en obtenir une copie.",
          "Tu peux demander la rectification de toute donnée inexacte te concernant.",
          "Tu peux demander l'effacement de tes données, sauf lorsqu'une obligation légale impose leur conservation.",
          "Tu peux récupérer tes données dans un format réutilisable, au titre de la portabilité.",
          "Tu peux t'opposer à un traitement particulier de tes données.",
          "MBP répond à toute demande dans un délai maximum de trente jours.",
        ]},
        { title: "5.4 Durée de conservation", items: [
          "Tes données actives sont conservées pendant la durée de ton engagement, puis pendant un an.",
          "Les données ayant une valeur légale ou comptable sont conservées jusqu'à cinq ans.",
          "En cas de demande de suppression, celle-ci est effectuée sous trente jours, hors obligations légales.",
        ]},
        { title: "5.5 Consentements séparés", items: [
          "Ton profil n'est visible par la communauté que si tu y consens explicitement.",
          "Aucune publication te concernant, sur le site ou les réseaux sociaux, n'est faite sans ton accord.",
          "L'utilisation de ta photo ou de ta vidéo fait l'objet d'un consentement à l'image distinct.",
          "L'inscription à la newsletter repose sur un consentement volontaire, jamais pré-coché.",
          "Chacun de ces consentements est tracé et peut être retiré à tout moment.",
        ]},
      ],
    },
    {
      id: "section-6", num: 6, title: "Responsabilité et assurance",
      subs: [
        { title: "6.1 Assurance responsabilité civile", items: [
          "MBP s'efforce de souscrire une assurance en responsabilité civile, dans la limite de ses moyens. [à confirmer]",
          "Cette assurance couvre les dommages corporels ou matériels involontaires causés dans le cadre d'une mission.",
          "Elle exclut les dommages volontaires, la négligence grave et la malveillance.",
        ]},
        { title: "6.2 Limites de responsabilité", items: [
          "MBP est responsable de l'encadrement, des ressources et du soutien qu'elle te fournit.",
          "Tu es responsable de fournir un effort raisonnable et de respecter la présente charte.",
          "La responsabilité de chacun reste proportionnée et s'exerce dans les limites prévues par la loi.",
        ]},
        { title: "6.3 Statut du bénévole", items: [
          "Le bénévolat n'est pas un emploi : il n'implique ni contrat de travail, ni lien de subordination salarial.",
          "Aucune cotisation sociale n'est due au titre du bénévolat.",
          "Le bénévolat ne génère aucun revenu imposable.",
        ]},
        { title: "6.4 Frais et reconnaissance", items: [
          "Les frais raisonnables que tu engages pour ta mission peuvent être remboursés sur justificatifs et après accord préalable : transport, matériel nécessaire, ou formation demandée par MBP.",
          "Pour être remboursé·e, tu adresses une demande écrite accompagnée des justificatifs.",
          "Le bénévolat n'est pas rémunéré, mais des marques de reconnaissance non monétaires restent possibles.",
        ]},
      ],
    },
    {
      id: "section-7", num: 7, title: "Résolution des différends",
      subs: [
        { title: "7.1 Dialogue direct (étape 1)", items: [
          "En cas de désaccord, commence par en parler directement avec la personne concernée ou avec ton·ta coordinateur·rice.",
          "Aborde cet échange dans un esprit d'ouverture et de bienveillance.",
          "Une réponse te sera apportée sous une semaine au maximum.",
        ]},
        { title: "7.2 Médiation (étape 2)", items: [
          "Si le dialogue n'aboutit pas, tu peux demander une médiation auprès du bureau.",
          "Une rencontre est alors organisée avec un·e médiateur·rice neutre et la partie concernée.",
          "L'objectif est de trouver une solution acceptable par tous, sous deux semaines.",
          "Chacun s'engage à respecter la confidentialité durant ce processus.",
        ]},
        { title: "7.3 Examen par le bureau (étape 3)", items: [
          "Si la médiation échoue, le bureau examine le dossier dans son ensemble.",
          "L'examen est équitable et tu as le droit d'y apporter une réponse écrite.",
          "Le bureau rend ensuite une décision motivée par écrit, sous un mois.",
        ]},
        { title: "7.4 Décision et dignité", items: [
          "La décision du bureau est définitive, sauf si un élément nouveau apparaît.",
          "La confidentialité est maintenue par toutes les parties.",
          "Aucune diffamation publique ni aucune représaille ne seront tolérées.",
        ]},
      ],
    },
    {
      id: "section-8", num: 8, title: "Dispositions finales",
      subs: [
        { title: "8.1 Droit applicable et juridiction", items: [
          "La présente charte est régie par le droit togolais. Pour la protection des données personnelles, MBP s'aligne en outre sur les standards du RGPD.",
          "En cas de litige, les tribunaux de Lomé, au Togo, sont seuls compétents.",
          "La médiation est toujours privilégiée avant tout recours contentieux.",
          "En cas de doute d'interprétation, la version française fait foi.",
        ]},
        { title: "8.2 Modifications de la charte", items: [
          "MBP peut modifier la charte en respectant un préavis d'un mois.",
          "Les bénévoles actifs sont informés de toute modification par email.",
          "Toute nouvelle candidature emporte acceptation de la version alors en vigueur.",
          "Les versions sont numérotées (v1.0, v1.1, etc.) et leurs évolutions sont suivies.",
          "Un·e bénévole en désaccord avec une nouvelle version peut se retirer sans pénalité.",
        ]},
        { title: "8.3 Non-discrimination et égalité", items: [
          "La charte s'applique de la même manière à toutes et à tous.",
          "MBP applique une tolérance zéro face au harcèlement et à la discrimination.",
          "Toute plainte pour discrimination peut être portée directement devant le bureau, au titre de l'étape 3.",
        ]},
        { title: "8.4 Entrée en vigueur", items: [
          `La présente charte, en version ${CHARTE_VERSION}, entre en vigueur le ${CHARTE_DATE}.`,
          "La version française fait référence ; une traduction anglaise pourra être fournie ultérieurement.",
          "Son acceptation est obligatoire pour toute nouvelle candidature.",
          "Elle est consultable à tout moment sur www.mabellepromo.org.",
        ]},
      ],
    },
  ],
};
