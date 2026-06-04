# Déploiement DocuSeal sur Oracle Cloud Always Free

Guide pour héberger gratuitement l'instance de signature électronique **DocuSeal**
(open-source, AGPL) utilisée par le module « Signatures » du dashboard MBP.

> **Pourquoi Oracle Always Free ?** Une VM ARM (Ampere A1) « Always Free » est
> allumée en permanence (pas de mise en veille), gratuite à vie, et dispose d'un
> disque persistant — idéal pour que les liens de signature envoyés aux partenaires
> restent toujours réactifs. L'instance est **jetable** : toutes les données MBP de
> suivi restent dans Supabase (table `signatures`), donc on peut la recréer/migrer
> sans rien perdre côté MBP.

---

## 1. Créer la VM Oracle (Always Free)

1. Compte sur <https://www.oracle.com/cloud/free/> (une carte est demandée pour
   vérification — **non débitée** sur les ressources Always Free).
2. Créer une instance **Compute** :
   - Image : **Ubuntu 22.04** (ou 24.04).
   - Shape : **VM.Standard.A1.Flex** (ARM Ampere) — 1 OCPU / 6 Go RAM suffisent.
     *(Si « out of capacity », réessayer plus tard ou changer de domaine de disponibilité.)*
   - Ajouter votre clé SSH publique.
3. Réseau : dans la **VCN → Security List**, ouvrir les ports entrants **80** et **443**
   (HTTP/HTTPS) en plus du 22 (SSH).

## 2. Installer Docker

```bash
ssh ubuntu@<IP_PUBLIQUE>
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER && exit   # puis se reconnecter
```

Ouvrir aussi le pare-feu de l'OS (Oracle Ubuntu bloque par défaut) :

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80  -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

## 3. Lancer DocuSeal (docker-compose)

Créer `~/docuseal/docker-compose.yml` :

```yaml
services:
  docuseal:
    image: docuseal/docuseal:latest
    restart: unless-stopped
    ports:
      - "80:3000"
    volumes:
      - docuseal_data:/data        # stockage persistant des documents (disque VM)
    environment:
      # Postgres bundlé local (SQLite par défaut suffit aussi pour un faible volume).
      # Pour utiliser le Postgres Supabase à la place, renseigner DATABASE_URL.
      HOST: sign.mabellepromo.org   # nom de domaine prévu (cf. étape 5)
volumes:
  docuseal_data:
```

```bash
cd ~/docuseal && docker compose up -d
```

DocuSeal est accessible sur `http://<IP_PUBLIQUE>`. Créez le compte administrateur
au premier lancement.

## 4. Récupérer la clé API + créer les modèles

1. Dans DocuSeal → **Settings → API** : copier le **X-Auth-Token** (clé API).
2. Créer un **modèle** par document à signer (Convention, PV, statuts) :
   uploader le PDF, placer les champs de signature, noter l'**ID du modèle**
   (visible dans l'URL `/templates/<ID>`). C'est cet ID qu'on saisit dans le
   dashboard MBP au moment d'envoyer en signature.

## 5. (Recommandé) Nom de domaine + HTTPS

Pour des liens propres et sécurisés (`https://sign.mabellepromo.org`) :

1. Ajouter un enregistrement DNS **A** `sign` → IP publique de la VM.
2. Mettre un reverse-proxy **Caddy** (HTTPS auto via Let's Encrypt) devant DocuSeal,
   ou utiliser `HOST` + le proxy intégré. Exemple Caddy minimal :

```bash
# /etc/caddy/Caddyfile
sign.mabellepromo.org {
    reverse_proxy localhost:80
}
```

## 6. Configurer les secrets côté Supabase

Une fois l'instance en ligne, poser les secrets (jamais côté frontend) :

```bash
supabase secrets set DOCUSEAL_URL=https://sign.mabellepromo.org --project-ref zbimhhgefmhliqiuwzvb
supabase secrets set DOCUSEAL_API_KEY=<X-Auth-Token> --project-ref zbimhhgefmhliqiuwzvb
supabase secrets set DOCUSEAL_WEBHOOK_SECRET=<chaine-aleatoire-longue> --project-ref zbimhhgefmhliqiuwzvb
```

Les Edge Functions `docuseal` et `docuseal-webhook` sont déjà déployées et liront
ces secrets automatiquement.

## 7. Brancher le webhook DocuSeal

Dans DocuSeal → **Settings → Webhooks**, ajouter l'URL :

```
https://zbimhhgefmhliqiuwzvb.supabase.co/functions/v1/docuseal-webhook?token=<DOCUSEAL_WEBHOOK_SECRET>
```

Événements à cocher : **form.completed** et **submission.completed**.
À la signature complète, le statut passe automatiquement à « Signé » dans le dashboard.

---

## Limites / points d'attention

- **Always Free Oracle** : pas de mise en veille, mais surveiller le quota de
  trafic sortant (10 To/mois — largement suffisant ici).
- **URLs de documents signés** : elles expirent côté DocuSeal. Le dashboard ne les
  stocke pas durablement : le bouton « Document signé » redemande une URL fraîche à
  l'API via l'Edge Function `docuseal` (action `document`).
- **Sauvegardes** : pensez à sauvegarder le volume `docuseal_data` (les documents
  signés y résident). Le suivi MBP, lui, est dans Supabase.
- **Coût** : 0 € (VM Always Free + DocuSeal open-source + Supabase existant).
