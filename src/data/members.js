/**
 * Fallback statique des membres — FDD Ma Belle Promo (MBP)
 * Données non sensibles uniquement (sans email, téléphone, anniversaire).
 * Les données complètes sont dans Supabase (table members).
 * Ce fichier n'est utilisé que si Supabase est inaccessible.
 */

export const members = [
  { id: 1,  nom: "Abidé BATABA",                profession: "Juriste dans la régulation des industries de réseaux (électricité et eau)",           ville: "Lomé",            pays: "Togo",    role: "Trésorière Générale Adjointe",       bureau: true,  photo: "/images/membres/abide.png" },
  { id: 2,  nom: "Alice GLIKOU",                profession: "Enseignante",                                                                          ville: "New Jersey",      pays: "USA",     role: "Chargée de la Diaspora",             bureau: true,  photo: "/images/membres/alice.jpg",        photoPosition: "center" },
  { id: 3,  nom: "André Kangni AFANOU",         profession: "Coordonnateur Afrique du Centre pour les Droits Civils et Politiques (CCPR Centre)",  ville: "Lomé",            pays: "Togo",    role: "Secrétaire Général",                 bureau: true,  photo: "/images/membres/andre.png" },
  { id: 4,  nom: "Armand Pascal TCHEDJI",       profession: "Juriste en entreprise",                                                               ville: "Cotonou",         pays: "Bénin",   role: "Membre actif",                       bureau: false, photo: "/images/membres/armand.png" },
  { id: 5,  nom: "Booby OFEI",                  profession: "Consultant de divertissement / Propriétaire de boîte de nuit",                        ville: "Washington DC",   pays: "USA",     role: "Membre actif",                       bureau: false, photo: "/images/membres/bobby.png" },
  { id: 6,  nom: "Béatrice SEBOKA épse ZINSOU", profession: "Spécialiste en passation et contentieux des marchés publics, formatrice ARMP",        ville: "Cotonou",         pays: "Bénin",   role: "Membre active",                      bureau: false, photo: "/images/membres/beatrice.png" },
  { id: 7,  nom: "Chantal DOUGBAN-ETSE",        profession: "Femme d'affaires",                                                                    ville: "Lomé",            pays: "Togo",    role: "Membre active",                      bureau: false, photo: "/images/membres/chantal.png",      photoPosition: "center" },
  { id: 8,  nom: "Claude AMEGAN",               profession: "Avocat au Barreau du Togo",                                                           ville: "Lomé",            pays: "Togo",    role: "Membre actif",                       bureau: false, photo: "/images/membres/claude.png" },
  { id: 9,  nom: "Corinne SODJADAN",            profession: "Juriste sociologue",                                                                  ville: "Ottawa",          pays: "Canada",  role: "Membre active",                      bureau: false, photo: "/images/membres/corinne.png" },
  { id: 10, nom: "Edgar AKPO",                  profession: "Spécialiste du développement du secteur privé — Consultant Groupe Banque Mondiale",   ville: "Lomé",            pays: "Togo",    role: "Membre actif",                       bureau: false, photo: "/images/membres/edgar.png" },
  { id: 11, nom: "Edwige AHONON",               profession: "Chef département transit aérien — Bolloré Transport & Logistics",                     ville: "Cotonou",         pays: "Bénin",   role: "Membre active",                      bureau: false, photo: "/images/membres/edwige-ahonon.png" },
  { id: 12, nom: "Edwige KUAGBENU",             profession: "Enseignant-chercheur — Faculté de Droit, Université de Lomé",                         ville: "Lomé",            pays: "Togo",    role: "Membre active",                      bureau: false, photo: "/images/membres/edwige-kuagbenu.png", photoPosition: "center" },
  { id: 13, nom: "Emilie AZIBLI épse WOLOU",    profession: "Avocate au Barreau du Togo",                                                          ville: "Lomé",            pays: "Togo",    role: "Membre active",                      bureau: false, photo: "/images/membres/emilie.png" },
  { id: 14, nom: "Eric MAMAN",                  profession: "Réceptionniste — Hôtel ibis Crissier",                                               ville: "Lausanne",        pays: "Suisse",  role: "Chargé de Communication",            bureau: true,  photo: "/images/membres/eric.png" },
  { id: 15, nom: "Erick FIOKLOU-TOULAN",        profession: "Inspecteur de douane",                                                                ville: "Lomé",            pays: "Togo",    role: "Membre actif",                       bureau: false, photo: "/images/membres/erick.png" },
  { id: 16, nom: "Essi DJEHA-AKUETE",           profession: "Responsable Service Juridique — Total Togo",                                          ville: "Lomé",            pays: "Togo",    role: "Membre active",                      bureau: false, photo: "/images/membres/essi.png" },
  { id: 17, nom: "Etienne MAWOUEGNA",           profession: "Formateur en langue et communication — École Normale d'Instituteurs de Niamtougou",   ville: "Niamtougou",      pays: "Togo",    role: "Membre actif",                       bureau: false, photo: "/images/membres/etienne.png" },
  { id: 18, nom: "Fabienne SENAYA-ATAYI",       profession: "Responsable administrative et juridique — Navitrans Africa Togo",                     ville: "Lomé",            pays: "Togo",    role: "Présidente",                         bureau: true,  photo: "/images/membres/fabienne.png" },
  { id: 19, nom: "Fabrice EBEH",                profession: "Directeur Exécutif — ONG ANCE",                                                       ville: "Lomé",            pays: "Togo",    role: "Membre actif",                       bureau: false, photo: "/images/membres/fabrice.jpg" },
  { id: 20, nom: "Falilatou TCHANILE épse DOGO",profession: "Juriste — Vice-présidente Région II Afrique d'athlétisme / Présidente FTA",           ville: "Lomé",            pays: "Togo",    role: "Trésorière Générale",                bureau: true,  photo: "/images/membres/falilatou.png" },
  { id: 21, nom: "Ferdinand AMAZOHOUN",         profession: "Avocat au Barreau du Togo — Associé-Gérant SCPA FEMIZA Associés",                     ville: "Lomé",            pays: "Togo",    role: "Secrétaire Général Adjoint",         bureau: true,  photo: "/images/membres/ferdinand.png" },
  { id: 22, nom: "Florent Folly MENSAN",        profession: "Juriste — Nations-Unies",                                                             ville: "Bangui",          pays: "RCA",     role: "Membre actif",                       bureau: false, photo: "/images/membres/florent.png" },
  { id: 23, nom: "Francisco KPODAR",            profession: "Directeur Général Adjoint — MENSTRANS-TOGO",                                          ville: "Lomé",            pays: "Togo",    role: "Membre actif",                       bureau: false, photo: "/images/membres/francisco.png" },
  { id: 24, nom: "Georges KOUTOH",              profession: "Directeur Courtage et Bancassurance — Saham Assurance Togo",                          ville: "Lomé",            pays: "Togo",    role: "Membre actif",                       bureau: false, photo: "/images/membres/georges.png" },
  { id: 25, nom: "Jean-Yves AKUETE",            profession: "Directeur Général Adjoint — SOGEMEF",                                                 ville: "Lomé",            pays: "Togo",    role: "Membre actif",                       bureau: false, photo: "/images/membres/jean-yves.png" },
  { id: 26, nom: "Josée Aféfa SALOKOFFI",       profession: "Assistante Administrative — Comité International de la Croix-Rouge (CICR)",           ville: "Lomé",            pays: "Togo",    role: "Chargée de l'organisation",          bureau: true,  photo: "/images/membres/josee.png" },
  { id: 27, nom: "Jovite AGOUZOU épse SODJEDO", profession: "Chef Section Assurances — Togo Cellulaire",                                           ville: "Lomé",            pays: "Togo",    role: "Membre active",                      bureau: false, photo: "/images/membres/jovite.png" },
  { id: 28, nom: "Joël AGBEMELO",               profession: "Directeur JATS Consulting — Spécialiste en évaluation environnementale / Expert judiciaire", ville: "Lomé",     pays: "Togo",    role: "Membre actif",                       bureau: false, photo: "/images/membres/joel.png" },
  { id: 29, nom: "Koffi Junior AOUGA",          profession: "Financial Advisor — World Financial Group",                                           ville: "Minnesota",       pays: "USA",     role: "Membre actif",                       bureau: false, photo: "/images/membres/junior.png" },
  { id: 30, nom: "Kékéli ABOTSI-KLUTSE",        profession: "Responsable des Affaires Juridiques et Sociales — Conseil National du Patronnat du Togo", ville: "Lomé",       pays: "Togo",    role: "Membre active",                      bureau: false, photo: "/images/membres/kekeli.png" },
  { id: 31, nom: "Laurent ASSIOBO",             profession: "Avocat au Barreau du Togo",                                                           ville: "Lomé",            pays: "Togo",    role: "Membre actif",                       bureau: false, photo: "/images/membres/laurent.png" },
  { id: 32, nom: "Line ASSIGNON-AKPABLI",       profession: "Fonctionnaire — Tribunal de Grande Instance de Nanterre",                             ville: "Région parisienne",pays: "France",  role: "Membre active",                      bureau: false, photo: "/images/membres/line.png" },
  { id: 33, nom: "Olive Bonaventure Kodjo AYENA",profession: "Juriste-Éthicien — Spécialiste en règlement de conflits",                            ville: "Gatineau",        pays: "Canada",  role: "Membre actif",                       bureau: false, photo: "/images/membres/olive.png" },
  { id: 34, nom: "Rolande Ami AMEMASSOR",       profession: "Consultante en Droits Humains, Justice transitionnelle et administration électorale", ville: "Lomé",            pays: "Togo",    role: "Membre active",                      bureau: false, photo: "/images/membres/rolande.png",      photoPosition: "center" },
  { id: 35, nom: "Romuald AFATCHAO",            profession: "Professeur & Directeur Adjoint Martin Institute — University of Idaho / Directeur Exécutif ONG ICPSD", ville: "Idaho", pays: "USA", role: "Vice-Président",                bureau: true,  photo: "/images/membres/romuald.png" },
  { id: 36, nom: "Sam AYEVA",                   profession: "Assureur-conseil & Courtier en assurance — Responsable filiale Togo du Groupe Ascoma",ville: "Lomé",            pays: "Togo",    role: "Membre actif",                       bureau: false, photo: "/images/membres/sam.png" },
  { id: 37, nom: "Serge GAMADEKU",              profession: "Responsable planification Service",                                                    ville: "Cergy-Pontoise",  pays: "France",  role: "Membre actif",                       bureau: false, photo: "/images/membres/serge-gamadeku.png" },
  { id: 38, nom: "Serge LOKADI",                profession: "ASKY Airlines",                                                                        ville: "Lomé",            pays: "Togo",    role: "Membre actif",                       bureau: false, photo: "/images/membres/serge-lokadi.jpg" },
  { id: 39, nom: "Sophia TADE",                 profession: "Talent Management Consultant",                                                         ville: "Maryland",        pays: "USA",     role: "Membre active",                      bureau: false, photo: "/images/membres/sophia.png" },
  { id: 40, nom: "Sylvestre BIDE",              profession: "Commandant — École Nationale de Gendarmerie",                                          ville: "Lomé",            pays: "Togo",    role: "Membre actif",                       bureau: false, photo: "/images/membres/sylvestre-bide.png" },
  { id: 41, nom: "Sylvestre GOSSOU",            profession: "Juriste d'entreprise au BIDC — Enseignant à l'UCAO",                                  ville: "Lomé",            pays: "Togo",    role: "Membre actif",                       bureau: false, photo: "/images/membres/sylvestre-gossou.jpg" },
  { id: 42, nom: "Tata HOUNKANLI",              profession: "Head of Government Partnerships — Programme Alimentaire Mondial (PAM/ONU)",            ville: "Bangui",          pays: "RCA",     role: "Membre actif",                       bureau: false, photo: "/images/membres/tata.png" },
  { id: 43, nom: "Yannick TAMAKLOE",            profession: "Gestionnaire contentieux — BIA-Togo",                                                  ville: "Lomé",            pays: "Togo",    role: "Membre active",                      bureau: false, photo: "/images/membres/yannick.png",      photoPosition: "center" },
];

export const bureau = members.filter((m) => m.bureau);
export const membresActifs = members.filter((m) => !m.bureau);

export function searchMembers(query) {
  const q = query.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return members.filter((m) => {
    const haystack = [m.nom, m.profession, m.ville, m.pays, m.role]
      .join(" ").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return haystack.includes(q);
  });
}

export const stats = {
  total: members.length,
  bureau: bureau.length,
  pays: [...new Set(members.map((m) => m.pays))].length,
  villes: [...new Set(members.map((m) => m.ville))].length,
};
