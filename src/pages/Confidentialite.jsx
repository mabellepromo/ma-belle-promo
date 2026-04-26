import { motion } from "framer-motion";
import PageHero from "../components/PageHero";
import SEO from "../components/SEO";
import { Link } from "react-router-dom";

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="font-heading text-xl font-bold text-foreground mb-3 pb-2 border-b border-border">{title}</h2>
    <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
  </div>
);

const Table = ({ rows }) => (
  <div className="overflow-x-auto my-4">
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="bg-muted">
          {rows[0].map((cell, i) => (
            <th key={i} className="text-left px-3 py-2 border border-border font-semibold text-foreground">{cell}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.slice(1).map((row, i) => (
          <tr key={i} className="hover:bg-muted/50">
            {row.map((cell, j) => (
              <td key={j} className="px-3 py-2 border border-border">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function Confidentialite() {
  return (
    <div>
      <SEO title="Politique de confidentialité" description="Politique de confidentialité et protection des données personnelles — Ma Belle Promo FDD Lomé." path="/confidentialite" />
      <PageHero title="Politique de confidentialité" subtitle="Informations — Protection des données" />

      <section className="py-16 max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          <div className="mb-8 p-4 bg-primary/5 border border-primary/10 rounded-xl text-sm text-muted-foreground">
            Ma Belle Promo s'engage à protéger la vie privée de ses membres et visiteurs.
            Cette politique explique quelles données nous collectons, pourquoi, et comment vous pouvez exercer vos droits.
          </div>

          <Section title="1. Responsable du traitement">
            <p><strong className="text-foreground">Association Ma Belle Promo (MBP)</strong></p>
            <p>12 BP 335 Baguida, Lomé, Togo</p>
            <p>Email : <Link to="/informations/contacts" className="text-primary hover:underline">Formulaire de contact</Link></p>
            <p>Tél. : +228 90 05 36 06</p>
          </Section>

          <Section title="2. Données collectées et finalités">
            <Table rows={[
              ["Formulaire", "Données collectées", "Finalité", "Base légale"],
              ["Formulaire contact", "Nom, email, objet, message", "Répondre à votre demande", "Intérêt légitime"],
              ["Adhésion", "Identité complète, email, téléphone, formation, profession, photo", "Traitement de votre demande d'adhésion", "Consentement explicite"],
              ["Espace membre", "Email, nom, téléphone, ville, LinkedIn", "Gestion de votre profil", "Exécution du contrat d'adhésion"],
              ["Newsletter", "Email", "Envoi d'informations de l'association", "Consentement"],
              ["Don", "Nom, prénom, email, montant", "Traitement du don et accusé de réception", "Intérêt légitime"],
            ]} />
          </Section>

          <Section title="3. Durée de conservation">
            <Table rows={[
              ["Données", "Durée de conservation"],
              ["Messages de contact", "6 mois après réception, puis suppression"],
              ["Demandes d'adhésion en attente", "3 mois, puis suppression si sans suite"],
              ["Profil membre actif", "Durée de l'adhésion + 2 ans après départ"],
              ["Données de don", "10 ans (obligation légale comptable)"],
              ["Abonnement newsletter", "Jusqu'à désinscription"],
              ["Logs de connexion", "3 mois"],
            ]} />
          </Section>

          <Section title="4. Destinataires des données">
            <p>Vos données sont accessibles uniquement aux membres du bureau de l'association dans le cadre de leurs fonctions.</p>
            <p>Nous faisons appel aux sous-traitants suivants :</p>
            <Table rows={[
              ["Service", "Rôle", "Localisation"],
              ["Supabase", "Hébergement base de données et authentification", "Union Européenne"],
              ["Vercel", "Hébergement du site web", "États-Unis (SCC)"],
              ["Brevo (Sendinblue)", "Envoi des emails transactionnels", "Union Européenne"],
            ]} />
            <p>
              Pour les transferts vers les États-Unis (Vercel), nous nous assurons que ce prestataire
              respecte des garanties appropriées via les clauses contractuelles types (SCC) de la Commission européenne.
            </p>
          </Section>

          <Section title="5. Cookies">
            <p>Ce site utilise uniquement des cookies techniques, nécessaires à son fonctionnement :</p>
            <Table rows={[
              ["Cookie", "Finalité", "Durée"],
              ["Cookie de session Supabase", "Maintenir votre connexion", "Session (supprimé à la déconnexion)"],
              ["Préférences locales (localStorage)", "Cache des données pour réduire les chargements", "Jusqu'à la déconnexion"],
            ]} />
            <p>Aucun cookie publicitaire, de tracking ou d'analyse de comportement n'est utilisé.</p>
          </Section>

          <Section title="6. Vos droits">
            <p>Conformément à la <strong className="text-foreground">loi togolaise n° 2019-014 du 29 octobre 2019</strong> relative à la protection des données à caractère personnel et, pour les membres résidant dans l'Union Européenne, au <strong className="text-foreground">Règlement Général sur la Protection des Données (RGPD)</strong>, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-foreground">Droit d'accès</strong> — consulter vos données depuis votre <Link to="/espace-membre" className="text-primary hover:underline">espace membre</Link></li>
              <li><strong className="text-foreground">Droit de rectification</strong> — modifier votre profil depuis votre espace membre</li>
              <li><strong className="text-foreground">Droit à l'effacement</strong> — demander la suppression de votre compte via notre <Link to="/informations/contacts" className="text-primary hover:underline">formulaire de contact</Link></li>
              <li><strong className="text-foreground">Droit d'opposition</strong> — s'opposer à un traitement en nous contactant par email</li>
              <li><strong className="text-foreground">Droit à la portabilité</strong> — télécharger directement vos données depuis votre <Link to="/espace-membre" className="text-primary hover:underline">espace membre</Link> (onglet "Mes données") au format JSON</li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, utilisez notre{" "}
              <Link to="/informations/contacts" className="text-primary hover:underline">formulaire de contact</Link>.
              Nous répondrons dans un délai de 30 jours.
            </p>
          </Section>

          <Section title="7. Sécurité">
            <p>
              Vos données sont stockées sur des serveurs sécurisés (Supabase) avec chiffrement en transit (HTTPS/TLS).
              L'accès aux données est protégé par authentification et des politiques de sécurité au niveau des lignes (Row Level Security).
            </p>
            <p>
              En cas de violation de données susceptible d'engendrer un risque pour vos droits et libertés,
              vous en serez informé(e) dans les meilleurs délais.
            </p>
          </Section>

          <Section title="8. Modification de cette politique">
            <p>
              Cette politique peut être mise à jour pour refléter les évolutions légales ou techniques.
              La date de dernière mise à jour est indiquée en bas de page.
              En cas de modification substantielle, les membres seront informés par email.
            </p>
          </Section>

          <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-start gap-4">
            <p className="text-xs text-muted-foreground">Dernière mise à jour : Avril 2026</p>
            <Link to="/mentions-legales" className="text-xs text-primary hover:underline">
              Voir les mentions légales →
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
