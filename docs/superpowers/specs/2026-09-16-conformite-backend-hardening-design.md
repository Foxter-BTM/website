# Conformité, backend formulaire et durcissement — design

Date : 2026-09-16. Branche : `design/refonte-visuelle`.

## Objectif

Couvrir les 20 points de la checklist site + anonymiser le chef d'atelier,
sans toucher à la direction artistique ni au copywriting validé.

| # | Point | Traitement |
|---|-------|-----------|
| 1 | Page RGPD | `/mentions-legales/#rgpd` |
| 2 | Page CGU | `/mentions-legales/#cgu` |
| 3 | API hors front-end | Worker `POST /api/contact` |
| 4 | Force HTTPS | HSTS via `_headers` + « Always Use HTTPS » (dashboard) |
| 5 | Bannière cookies | Non requise : aucun cookie de suivi (CF Web Analytics). Section `#cookies` |
| 6 | Meta title | Audit ≤ 60 car., unicité |
| 7 | Image réseaux | OG déjà en place ; vérif dimensions/poids |
| 8 | Favicon | `apple-touch-icon.png` manquant → généré |
| 9 | Sitemap + robots | Déjà en place ; vérif |
| 10 | Textes images | Audit `alt` / `aria-label` |
| 11 | Compresse images | `og-btm.png` optimisé si > 150 Ko |
| 12 | Vitesse pages | Lighthouse ≥ 95 perf sur 404 + légales (les 5 pages déjà à 100) |
| 13 | Contraste | Déjà AA ; les nouvelles pages réutilisent les tokens |
| 14 | Responsive | Nouvelles pages testées 360 px |
| 15 | Page 404 | `404.html` racine |
| 16 | Liens cassés | `apple-touch-icon.png`, `#mentions/#cgu/#cookies` |
| 17 | Validation formulaires | Client existante + serveur |
| 18 | Anti-spam | Honeypot + Turnstile + rate-limit |
| 19 | Analytics | Cloudflare Web Analytics (cookieless) |
| 20 | Un seul CTA | « Être informé de l'ouverture » |

Décisions prises avec Grégoire : Worker + Resend ; CF Web Analytics sans
bannière ; anonymisation par le rôle uniquement ; CTA unique « Être informé de
l'ouverture » ; SARL non immatriculée → placeholders TODO.

## 1. Anonymisation du chef d'atelier

Fichiers : `index.html`, `services/index.html`, `assureurs/index.html`,
`a-propos/index.html`, `contact/index.html`, `images/og-src.html`.

- Texte courant : « Timothé » → « le chef d'atelier » ou « notre carrossier »
  selon la phrase (accords grammaticaux revus).
- `a-propos` : meta description sans nom ; H2 « Le chef d'atelier. » ;
  `aria-label` du monogramme « Portrait du chef d'atelier BTM Carrosserie
  (placeholder) » ; commentaire TODO photo conservé sans le prénom ;
  signature « — L'équipe BTM, mai 2026 ».
- Schema `AboutPage` : `{"@type":"Person","jobTitle":"Chef d'atelier"}`
  sans `name`.
- Monogramme `.portrait--mono` TD → cercle seul (classe existante, glyphe
  vidé). GB inchangé.
- `CLAUDE.md` et `BTM-Carrosserie-Contenu-Site-corrige.md` non modifiés
  (non déployés, `.assetsignore`). Ajouter `BTM-Carrosserie-Contenu-Site-corrige.md`
  et `docs/` à `.assetsignore` pour qu'ils ne soient jamais servis.
- Critère : `grep -ril "timoth\|dauzat"` sur les fichiers déployés = 0.

## 2. CTA unique

- Supprimer tous les `<span class="btn btn--disabled">Demande de devis…</span>`.
- Un seul bouton par emplacement : `<a href="…/contact/" class="btn">Être
  informé de l'ouverture <span class="arrow">→</span></a>` (hero + section
  finale de chaque page). Les liens texte secondaires restent.
- Modale : libellé inchangé.
- `contact` : `<option value="ouverture" selected>`.
- CSS `.btn--disabled` retiré de `site.css` s'il n'a plus d'usage.

## 3. Page légale `/mentions-legales/index.html`

- Même `<head>` (preload font, favicon, tokens/site.css), nav, footer que les
  autres pages. `<meta name="robots" content="noindex,follow">`. Pas d'entrée
  sitemap. Titre : « Mentions légales — BTM Carrosserie ».
- Sections ancrées, chacune ouverte par une `.meta-row` numérotée :
  1. `#editeur` — BTM Carrosserie, SARL en cours d'immatriculation
     (`<!-- TODO: capital, SIREN, RCS, siège à l'immatriculation -->`),
     directeur de publication Grégoire Bodin, contact@btm-carrosserie.fr.
  2. `#hebergeur` — Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA.
  3. `#propriete` — propriété intellectuelle, marques.
  4. `#rgpd` — Politique de confidentialité : responsable de traitement (BTM
     Carrosserie SARL), finalité (répondre à la demande, informer de
     l'ouverture si demandé), base légale (consentement, art. 6.1.a), données
     (nom, prénom, email, téléphone, véhicule, assureur, message), destinataires
     (Grégoire Bodin, le chef d'atelier), sous-traitants (Cloudflare —
     hébergement, Turnstile, analytics ; Resend — acheminement email),
     transferts hors UE (Cloudflare/Resend, clauses contractuelles types),
     durée 12 mois après dernier contact, droits (accès, rectification,
     effacement, opposition, portabilité) via contact@btm-carrosserie.fr,
     réclamation CNIL.
  5. `#cgu` — objet, accès au site, contenu informatif non contractuel
     (devis = document séparé), responsabilité, liens, droit applicable
     (français), tribunaux compétents (Bayonne).
  6. `#cookies` — aucun cookie de suivi ni publicitaire ; `sessionStorage`
     technique pour la modale (exempté) ; Cloudflare Web Analytics sans cookie
     ni empreinte ; Turnstile (sécurité, exempté). Pas de bannière.
- Ton : phrases courtes, vouvoiement, aucune formule marketing.
- Footer des 6 pages : `Mentions légales` → `…/mentions-legales/`,
  `Confidentialité` → `…/mentions-legales/#rgpd`, `CGU` → `#cgu`,
  `Cookies` → `#cookies`. Chemins relatifs cohérents avec l'existant
  (`../` depuis les sous-dossiers).
- Consentement du formulaire : lien vers `../mentions-legales/#rgpd`.

## 4. Backend formulaire

### Worker `worker/index.js`

- `wrangler.toml` : `main = "worker/index.js"`, `[assets] binding = "ASSETS"`,
  `run_worker_first = ["/api/*"]`, `not_found_handling` inchangé.
- Routage : `POST /api/contact` → handler ; toute autre route → `env.ASSETS.fetch(request)`.
- Handler, dans l'ordre :
  1. `Content-Type` `application/x-www-form-urlencoded` ou `multipart/form-data`,
     sinon 415.
  2. Honeypot `website` non vide → `200 {ok:true}` sans envoi.
  3. Rate-limit : clé `CF-Connecting-IP`, compteur en Cache API
     (`caches.default`, TTL 600 s), > 10 → 429.
  4. Turnstile : `POST https://challenges.cloudflare.com/turnstile/v0/siteverify`
     avec `TURNSTILE_SECRET` ; échec → 400 `{ok:false, errors:{turnstile:…}}`.
  5. Validation : `nom`, `prenom` 1–80 car. ; `email` regex + ≤ 254 ;
     `tel` optionnel ≤ 30 ; `prestation` ∈ liste HTML ; `vehicule`, `assureur`
     optionnels ≤ 120 ; `message` 10–3000 ; `consent` = `on`. Erreurs
     agrégées → 400 `{ok:false, errors:{champ:message}}` (messages en
     français, identiques aux `.err` HTML).
  6. Envoi Resend : `from: "BTM Carrosserie <site@btm-carrosserie.fr>"`,
     `to: ["contact@btm-carrosserie.fr"]`, `reply_to: email`, sujet
     `[Site] <prestation> — <prénom> <nom>`, corps texte brut échappé.
     Erreur Resend → 502 `{ok:false, errors:{_:"Envoi impossible…"}}`.
  7. `200 {ok:true}`.
- Secrets : `RESEND_API_KEY`, `TURNSTILE_SECRET` via `wrangler secret put`.
  Variable publique `TURNSTILE_SITE_KEY` en dur dans le HTML (`<!-- TODO -->`
  si non fournie ; la clé de test Cloudflare `1x00000000000000000000AA` en
  attendant).
- Jamais de log du contenu des messages.

### Front

- `contact/index.html` : `action="/api/contact" method="post"`, champ
  honeypot `<input name="website" class="hp" tabindex="-1" autocomplete="off">`
  masqué en CSS, widget `<div class="cf-turnstile" data-sitekey="…">` +
  script `https://challenges.cloudflare.com/turnstile/v0/api.js` (`defer`),
  checkbox consent nommée `consent`.
- `site.js` : validation client existante conservée ; `fetch` `FormData` ;
  bouton en état `disabled` + « Envoi… » ; succès → `#form-success` ; 400 →
  mapping `errors` sur `.field` ; réseau/5xx → message générique + lien
  `mailto:contact@btm-carrosserie.fr` pré-rempli.
- Sans JS : Turnstile ne rend pas son widget, l'envoi n'aboutit donc pas. Un
  `<noscript>` dans le formulaire explique la situation et renvoie vers
  l'email. Le Worker conserve la redirection 303
  (`/contact/?envoye=1#form-success` / `/contact/?erreur=1#contact-form`) pour
  tout client qui poste sans `Accept: application/json`.

## 5. HTTPS et en-têtes

Fichier `_headers` racine (supporté par Workers Static Assets) :

```
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com; frame-src https://challenges.cloudflare.com; connect-src 'self' https://cloudflareinsights.com; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; base-uri 'self'; form-action 'self'
```

`style-src 'unsafe-inline'` : nécessaire uniquement si des attributs `style`
subsistent ; CLAUDE.md impose zéro style inline, donc vérifier et retirer si
possible. `README-deploy.md` (court) : activer « Always Use HTTPS » et
« HSTS » dans le dashboard, poser les secrets, coller le token analytics.

## 6. Page 404

`404.html` racine, même charte : `meta-row` « 404 », H1 « Page introuvable. »,
une phrase, deux liens (« Retour à l'accueil », « Être informé de l'ouverture »).
Chemins absolus (`/tokens.css`, `/site.css`, `/site.js`) car servie depuis
n'importe quel chemin. `noindex`.

## 7. Assets, SEO, analytics

- `apple-touch-icon.png` 180×180 rendu depuis `favicon.svg` (fond crème,
  glyphe centré). Vérifier le rendu à l'œil.
- `images/og-btm.png` : mesurer ; si > 150 Ko, `pngquant`/`oxipng` sans perte
  visible.
- Titles des 7 pages ≤ 60 caractères, uniques.
- Analytics : `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "TODO"}'></script>` avant `</body>` sur toutes les pages, token en `<!-- TODO -->`.
- `alt`/`aria-label` : audit, corriger les manques.

## 8. Vérification

`scripts/check.sh` (non déployé, ajouté à `.assetsignore`) :
- grep formulations interdites (CLAUDE.md §4.1/4.2) = 0 ;
- grep `timoth|dauzat` (insensible à la casse) sur `*.html` déployés = 0 ;
- chaque `href` interne pointe vers un fichier/dossier existant ;
- placeholders téléphone/adresse intacts ; « début 2027 » unique ;
- pas de `googleapis`, pas d'`"address"` dans les schemas, pas de `style=`.

Manuel : `wrangler dev` → tests `curl` (honeypot, champ manquant, Turnstile
test-key, nominal) ; Lighthouse 404 + mentions légales mobile/desktop ;
rendu 360 px des nouvelles pages.

## Hors périmètre

Témoignages fictifs (CLAUDE.md §4.3) : non traités, à décider séparément.
