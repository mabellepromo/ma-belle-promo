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

export default function MentionsLegales() {
  return (
    <div>
      <SEO title="Mentions légales" description="Mentions légales du site de l'association Ma Belle Promo — FDD Lomé 1994–2000." path="/mentions-legales" />
      <PageHero title="Mentions légales" subtitle="Informations — Cadre juridique" />

      <section className="py-16 max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          <Section title="1. Éditeur du site">
            <p><strong className="text-foreground">Nom de l'association :</strong> Ma Belle Promo (MBP)</p>
            <p><strong className="text-foreground">Statut :</strong> Association à but non lucratif régie par la législation togolaise en vigueur, regroupant les anciens diplômés de la Faculté de Droit (FDD) de l'Université de Lomé, promotion 1994–2000. Régulièrement déclarée et reconnue par les autorités compétentes — Récépissé de déclaration N°0920/MATDCL-SG-DLPAP-DOCA, délivré le 03 octobre 2019.</p>
            <p><strong className="text-foreground">Siège social :</strong> 12 BP 335 Baguida, Lomé, Togo</p>
            <p><strong className="text-foreground">Email :</strong>{" "}contact@mabellepromo.org</p>
            <p><strong className="text-foreground">Téléphone :</strong> +228 90 05 36 06 / +228 90 03 63 43</p>
            <p><strong className="text-foreground">Directrice de la publication :</strong> Fabienne SENAYA-ATAYI, Présidente de Ma Belle Promo</p>
            <p><strong className="text-foreground">Responsable Communication :</strong> Eric MAMAN</p>
          </Section>

          <Section title="2. Hébergement">
            <p><strong className="text-foreground">Hébergeur :</strong> Vercel Inc.</p>
            <p><strong className="text-foreground">Adresse :</strong> 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis</p>
            <p><strong className="text-foreground">Site :</strong>{" "}
              <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">vercel.com</a>
            </p>
            <p><strong className="text-foreground">Base de données :</strong> Supabase — 970 Trestle Glen Rd, Oakland, CA 94610, États-Unis</p>
          </Section>

          <Section title="3. Propriété intellectuelle">
            <p>
              L'ensemble du contenu de ce site (textes, images, graphismes, logos, vidéos, documents) est la propriété exclusive de
              l'association Ma Belle Promo ou de ses membres, sauf mention contraire.
            </p>
            <p>
              Toute reproduction, distribution, modification ou utilisation du contenu sans autorisation écrite préalable de l'association
              est strictement interdite.
            </p>
            <p>
              Les photos des membres ont été fournies avec leur consentement explicite et restent leur propriété personnelle.
            </p>
          </Section>

          <Section title="4. Responsabilité">
            <p>
              Ma Belle Promo s'efforce de maintenir les informations publiées sur ce site à jour et exactes.
              Cependant, l'association ne peut être tenue responsable des erreurs ou omissions, ni des dommages
              directs ou indirects résultant de l'utilisation du site.
            </p>
            <p>
              Les liens vers des sites tiers sont proposés à titre informatif. Ma Belle Promo n'exerce aucun contrôle
              sur ces sites et décline toute responsabilité quant à leur contenu.
            </p>
          </Section>

          <Section title="5. Données personnelles">
            <p>
              Le traitement des données personnelles collectées sur ce site est décrit dans notre{" "}
              <Link to="/confidentialite" className="text-primary hover:underline font-medium">
                Politique de confidentialité
              </Link>.
            </p>
            <p>
              Conformément à la loi togolaise n° 2019-014 du 29 octobre 2019 relative à la protection des données
              à caractère personnel et, pour les membres résidant dans l'Union Européenne, au RGPD,
              vous disposez de droits sur vos données.
              Pour exercer ces droits, utilisez notre{" "}
              <Link to="/informations/contacts" className="text-primary hover:underline">formulaire de contact</Link>.
            </p>
          </Section>

          <Section title="6. Cookies">
            <p>
              Ce site utilise des cookies techniques nécessaires à son fonctionnement (authentification, préférences).
              Aucun cookie publicitaire ou de tracking n'est utilisé.
            </p>
            <p>
              Les cookies de session sont gérés par Supabase Auth et expirent à la déconnexion ou après une période d'inactivité.
              Vous pouvez configurer votre navigateur pour refuser les cookies, ce qui peut limiter certaines fonctionnalités du site.
            </p>
          </Section>

          <Section title="7. Droit applicable">
            <p>
              Le présent site et ses mentions légales sont soumis au <strong className="text-foreground">droit togolais</strong>,
              notamment la loi n° 2019-014 du 29 octobre 2019 relative à la protection des données à caractère personnel,
              placée sous le contrôle de l'<strong className="text-foreground">Instance de Protection des Données à Caractère Personnel (IPDCP)</strong>.
            </p>
            <p>
              Pour les membres résidant dans l'Union Européenne, le RGPD s'applique en complément.
              Tout litige relatif à l'utilisation du site relèvera de la compétence exclusive des tribunaux de Lomé, Togo.
            </p>
          </Section>

          <p className="text-xs text-muted-foreground mt-10 pt-6 border-t border-border">
            Dernière mise à jour : Avril 2026
          </p>
        </motion.div>
      </section>
    </div>
  );
}
