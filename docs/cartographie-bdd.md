# Cartographie de la base de données Supabase — MBP

> Projet Supabase `zbimhhgefmhliqiuwzvb` · schéma `public` · **60 tables** · RLS activé partout
> Généré le 2026-06-09 (le nombre de lignes est un instantané à cette date)

La base est organisée en **11 domaines fonctionnels**. La table pivot centrale est
`members` (48 lignes) : la plupart des relations pointent vers elle.

---

## 1. Membres & équipe dirigeante

| Table | Lignes | Rôle |
|---|---|---|
| **members** | 48 | Annuaire des diplômés (table pivot du projet) |
| equipe | 9 | Bureau / organigramme affiché sur le site → `member_id` |
| mandats | 0 | Historique des postes occupés → `member_id` |
| attestations | 9 | Attestations d'appartenance générées → `member_id` |

---

## 2. Contenu éditorial (site public)

| Table | Lignes | Rôle |
|---|---|---|
| articles | 23 | Actualités / blog |
| projets | 6 | Rubrique Projets |
| evenements | 5 | Agenda / actualités événementielles |
| communiques | 5 | Communiqués officiels |
| galeries | 9 | Albums photos |
| media_photos | 6 | Médiathèque photos |
| media_videos | 3 | Médiathèque vidéos (YouTube) |
| programmes | 3 | Programmes / chantiers |
| documents | 9 | Documents téléchargeables |
| ressources | 0 | Ressources documentaires (vide) |
| sponsors | 0 | Partenaires / sponsors (vide) |
| opportunites | 0 | Offres / opportunités pro (vide) |

---

## 3. Cotisations & trésorerie

| Table | Lignes | Rôle |
|---|---|---|
| cotisations | 3 | Suivi des cotisations par membre/année → `member_id` |
| payments | 0 | Transactions de paiement (FedaPay, en attente KYC) |
| tresorerie_transactions | 2 | Journal recettes/dépenses |
| tresorerie_budget | 0 | Budget prévisionnel par année |
| tresorerie_remboursements | 0 | Remboursements → `transaction_id` |
| tresorerie_subventions | 0 | Subventions reçues |
| factures | 1 | Facturation |
| commandes | 1 | Commandes (boutique) |

---

## 4. Gouvernance & vie associative

| Table | Lignes | Rôle |
|---|---|---|
| assemblees | 0 | Assemblées générales (PV, ordre du jour) |
| assemblee_presences | 0 | Émargement AG → `assemblee_id`, `member_id`, `procuration_pour` |
| assemblee_resolutions | 0 | Résolutions votées en AG → `assemblee_id` |
| elections | 0 | Élections du bureau |
| election_candidats | 0 | Candidats → `election_id`, `member_id` |
| election_votes | 0 | Bulletins → `election_id`, `candidat_id`, `voter_id` |
| conventions | 0 | Conventions de partenariat |
| registre_documents_legaux | 4 | Statuts, RI, documents légaux |
| registre_conflits | 0 | Registre des conflits d'intérêts |
| procedures | 0 | Procédures internes → `assemblee_id` |
| procedure_versions | 0 | Versionnage des procédures → `procedure_id` |
| passation_modeles | 1 | Modèles de passation de pouvoir |
| passations | 0 | Passations bureau sortant/entrant → `modele_id` |

---

## 5. Événements & présences

| Table | Lignes | Rôle |
|---|---|---|
| evenement_presences | 0 | Check-in événements → `evenement_id`, `membre_id` |
| event_registrations | 0 | Inscriptions → `event_id`, `member_id` |

---

## 6. Webinaires

| Table | Lignes | Rôle |
|---|---|---|
| webinar_events | 1 | Webinaires programmés |
| webinar_registrations | 13 | Inscriptions → `event_id` |
| webinar_mentors_auto | 0 | Mentors auto-inclus → `webinar_id`, `person_id`, `registration_id` |

---

## 7. Sondages (formulaires dynamiques)

| Table | Lignes | Rôle |
|---|---|---|
| sondages | 0 | Sondages / formulaires |
| sondage_sections | 0 | Sections → `sondage_id` |
| sondage_questions | 0 | Questions → `sondage_id`, `section_id` |
| sondage_invitations | 0 | Invitations nominatives → `sondage_id` |
| sondage_soumissions | 0 | Réponses soumises → `sondage_id`, `invitation_id` |
| sondage_reponses | 0 | Réponses détaillées → `soumission_id`, `question_id` |

---

## 8. Bénévolat

| Table | Lignes | Rôle |
|---|---|---|
| benevoles | 0 | Bénévoles |
| missions_benevoles | 0 | Missions |
| heures_benevoles | 0 | Heures effectuées → `benevole_id`, `mission_id` |

---

## 9. Communication & emailing

| Table | Lignes | Rôle |
|---|---|---|
| messages | 1 | Messages du formulaire de contact |
| newsletter_subscribers | 0 | Abonnés newsletter (double opt-in) |
| circulaires | 1 | Circulaires envoyées en masse |
| bulk_emails | 0 | Campagnes emails groupés |
| email_logs | 1 | Journal des envois |
| automations | 18 | Automatisations programmées (cron) |
| automation_logs | 0 | Journal des automatisations → `automation_id` |

---

## 10. Signatures électroniques

| Table | Lignes | Rôle |
|---|---|---|
| signatures | 4 | Suivi DocuSeal (registre manuel) |

---

## 11. Legacy / dette technique

| Table | Lignes | Rôle |
|---|---|---|
| mbp_store | 0 | Ancien store clé-valeur JSON — **plus utilisé**, conservé sans impact |

---

## Carte des relations (clés étrangères)

```
members  ◄──────────────┬── equipe.member_id
(pivot)                 ├── mandats.member_id
                        ├── attestations.member_id
                        ├── cotisations.member_id
                        ├── assemblee_presences.member_id / .procuration_pour
                        ├── election_candidats.member_id
                        ├── election_votes.voter_id
                        ├── event_registrations.member_id
                        ├── evenement_presences.membre_id
                        └── webinar_mentors_auto.person_id

assemblees ◄── assemblee_presences / assemblee_resolutions / procedures.assemblee_id
elections  ◄── election_candidats ◄── election_votes
evenements ◄── event_registrations / evenement_presences
webinar_events ◄── webinar_registrations ◄── webinar_mentors_auto
sondages   ◄── sondage_sections / sondage_questions / sondage_invitations / sondage_soumissions
sondage_soumissions ◄── sondage_reponses ──► sondage_questions
benevoles + missions_benevoles ◄── heures_benevoles
procedures ◄── procedure_versions
passation_modeles ◄── passations
automations ◄── automation_logs
tresorerie_transactions ◄── tresorerie_remboursements
```

---

## Observations

- **RLS activé sur les 60 tables** (cf. chantier sécurité RLS en cours — migration
  `user_metadata` → `app_metadata` à finaliser avant l'envoi des invitations membres).
- **Modules « vivants »** (données réelles) : `members` (48), `articles` (23),
  `automations` (18), `webinar_registrations` (13), `galeries`/`documents`/`equipe`/
  `attestations` (9), `evenements`/`communiques` (5), `signatures`/`registre_documents_legaux` (4).
- **Modules construits mais non encore alimentés** (0 ligne) : sondages, bénévolat,
  élections, assemblées, conventions, la majeure partie de la trésorerie, payments
  (FedaPay en attente KYC).
- `mbp_store` est vide et **abandonné** — candidat à suppression définitive.
- Incohérence de nommage de colonnes FK pour `members` selon les tables :
  `member_id` (la majorité), mais `membre_id` (evenement_presences),
  `person_id` (webinar_mentors_auto), `voter_id` (election_votes). Sans impact
  technique mais à garder en tête.
```
