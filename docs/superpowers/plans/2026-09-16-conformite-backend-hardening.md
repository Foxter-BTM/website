# Conformité, backend formulaire et durcissement — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Couvrir les 20 points de la checklist (légal, backend formulaire, HTTPS, 404, liens, analytics, CTA unique) et anonymiser le chef d'atelier, sans toucher à la direction artistique.

**Architecture:** Site statique HTML/CSS/JS servi par Cloudflare Workers Static Assets. On ajoute un Worker (`worker/index.js`) qui ne prend la main que sur `/api/*` (`run_worker_first`) pour recevoir le formulaire, valider, vérifier Turnstile et envoyer par Resend ; tout le reste reste servi tel quel. Une page légale unique, une 404, un fichier `_headers` pour les en-têtes de sécurité, un script `scripts/check.sh` comme filet de non-régression.

**Tech Stack:** HTML/CSS/JS sans build, Cloudflare Workers (wrangler 4, ESM), Cloudflare Turnstile, Resend API, Cloudflare Web Analytics, `node:test` (Node 24) pour les tests unitaires du Worker, Chrome headless pour générer l'icône.

Spec : `docs/superpowers/specs/2026-09-16-conformite-backend-hardening-design.md`.

## Global Constraints

- Aucun style inline (`style=`) dans les HTML. Tout passe par `site.css`.
- Nav et footer sont dupliqués à la main dans chaque HTML : toute modification de nav/footer se répercute sur **toutes** les pages (5 existantes + `mentions-legales/` + `404.html`).
- Ne jamais remplacer les placeholders : téléphone `+33 00 00 00 00 00`, adresse (commentaires `<!-- TODO: remplacer par adresse définitive… -->`), photos, logos assureurs.
- Jamais d'`"address"` dans les schemas JSON-LD. Pas de Google Fonts (`googleapis`).
- Formulations interdites (CLAUDE.md §4.1/4.2) : « prenons en charge la déclaration », « de A à Z », « ouvrons le dossier », « référencé chez », « agréée ».
- Ton : vouvoiement, phrases courtes, pas de superlatif ni de jargon marketing. Commits en anglais, format `type(scope): description`.
- Après ce plan, `grep -ril "timoth\|dauzat"` sur les fichiers déployés doit renvoyer 0 résultat. `CLAUDE.md`, `docs/`, `BTM-Carrosserie-Contenu-Site-corrige.md` ne sont pas modifiés (non déployés).
- Chemins : depuis la racine (`index.html`, `404.html`) les liens internes sont absolus (`/contact/`) ou relatifs racine (`contact/`) ; depuis les sous-dossiers ils sont `../contact/`. `404.html` utilise **uniquement** des chemins absolus (`/tokens.css`, `/site.css`, `/site.js`, `/contact/`).
- Vérification à chaque tâche : `bash scripts/check.sh` doit passer (créé en Task 1).

## File Structure

| Fichier | Rôle |
|---------|------|
| `scripts/check.sh` (créer) | Non-régression : grep interdits, noms, liens internes, placeholders, styles inline |
| `.assetsignore` (modifier) | Exclure `docs/`, `scripts/`, `worker/`, `README-deploy.md`, `BTM-Carrosserie-Contenu-Site-corrige.md`, `*.test.js` |
| `index.html`, `services/index.html`, `assureurs/index.html`, `a-propos/index.html`, `contact/index.html` (modifier) | Anonymisation, CTA unique, footer légal, favicon, analytics |
| `images/og-src.html` (vérifier) | Aucune mention du nom (déjà le cas, vérifier) |
| `site.css` (modifier) | Retrait `.btn--disabled`, ajout `.hp`, `.form-success:target`, `.form-server-err`, `.legal`, `.err-page` |
| `mentions-legales/index.html` (créer) | Mentions légales, RGPD, CGU, cookies — ancres `#editeur #hebergeur #propriete #rgpd #cgu #cookies` |
| `404.html` (créer) | Page introuvable |
| `apple-touch-icon.png` (créer) | 180×180 généré via Chrome headless depuis `scripts/icon-src.html` |
| `_headers` (créer) | HSTS + en-têtes de sécurité + CSP |
| `README-deploy.md` (créer) | Réglages dashboard Cloudflare, secrets, token analytics |
| `wrangler.toml` (modifier) | `main`, `binding = "ASSETS"`, `run_worker_first` |
| `package.json` (modifier) | `"type": "module"`, scripts `test`, `dev`, devDependency `wrangler` |
| `worker/validate.js` (créer) | Fonctions pures : `validateContact(fields)`, `PRESTATIONS` |
| `worker/validate.test.js` (créer) | Tests `node:test` de la validation |
| `worker/index.js` (créer) | Routage `/api/contact`, honeypot, rate-limit, Turnstile, Resend, fallback `ASSETS` |
| `site.js` (modifier) | Envoi `fetch`, erreurs serveur, état envoi, succès via `?envoye=1` |

---

### Task 1 : Filet de non-régression `scripts/check.sh` + `.assetsignore`

**Files:**
- Create: `scripts/check.sh`
- Modify: `.assetsignore`

**Interfaces:**
- Produces: `bash scripts/check.sh` → exit 0 si tout passe, exit 1 avec la liste des échecs sinon. Toutes les tâches suivantes l'exécutent avant commit.

- [ ] **Step 1 : Écrire le script**

```bash
#!/usr/bin/env bash
# Non-régression BTM — à lancer depuis la racine du repo.
set -u
cd "$(dirname "$0")/.."
fail=0
say() { printf '  \033[31mFAIL\033[0m %s\n' "$1"; fail=1; }
ok()  { printf '  \033[32mok\033[0m   %s\n' "$1"; }

# Fichiers HTML déployés (hors sources exclues)
HTML=$(find . -name '*.html' -not -path './node_modules/*' -not -path './docs/*' -not -path './scripts/*' -not -path './images/og-src.html' -not -path './.wrangler/*')

echo "1. Nom du chef d'atelier absent"
if grep -ril "timoth\|dauzat" $HTML site.js site.css sitemap.xml robots.txt 2>/dev/null | grep -q .; then
  say "nom trouvé dans : $(grep -ril 'timoth\|dauzat' $HTML site.js site.css | tr '\n' ' ')"
else ok "aucune occurrence"; fi

echo "2. Formulations interdites"
BAD='prenons en charge la déclaration|de A à Z|ouvrons le dossier|référencé chez|agréée MAIF|Carrosserie agréée'
if grep -Eril "$BAD" $HTML | grep -q .; then say "formulation interdite : $(grep -Eril "$BAD" $HTML | tr '\n' ' ')"; else ok "aucune"; fi

echo "3. Pas de Google Fonts, pas d'address schema, pas de style inline"
grep -ril "googleapis" $HTML | grep -q . && say "googleapis présent" || ok "pas de googleapis"
grep -l '"address"' $HTML | grep -q . && say "\"address\" dans un schema" || ok "pas d'address schema"
grep -l ' style="' $HTML | grep -q . && say "style inline : $(grep -l ' style=\"' $HTML | tr '\n' ' ')" || ok "pas de style inline"

echo "4. Placeholders intacts"
for f in $HTML; do
  case "$f" in ./404.html) continue;; esac
  grep -q "+33 00 00 00 00 00" "$f" || say "téléphone placeholder absent de $f"
done
ok "téléphone placeholder vérifié"

echo "5. Liens internes"
for f in $HTML; do
  dir=$(dirname "$f")
  grep -o 'href="[^"#]*"' "$f" | sed 's/href="//;s/"$//' | while read -r h; do
    case "$h" in http*|mailto:*|tel:*|"") continue;; esac
    h="${h%%\?*}"
    if [[ "$h" == /* ]]; then p=".$h"; else p="$dir/$h"; fi
    if [[ "$p" == */ ]]; then p="${p}index.html"; fi
    [ -e "$p" ] || echo "  FAIL lien cassé dans $f : $h"
  done
done | tee /tmp/btm-links.txt
grep -q FAIL /tmp/btm-links.txt && fail=1 || ok "tous les liens internes existent"

echo "6. Ancres du footer légal"
for f in $HTML; do
  case "$f" in ./404.html|./mentions-legales/index.html) continue;; esac
  for a in rgpd cgu cookies; do
    grep -q "mentions-legales/#$a" "$f" || say "$f : lien footer #$a manquant"
  done
done
ok "ancres footer vérifiées"
for a in editeur hebergeur propriete rgpd cgu cookies; do
  [ -f mentions-legales/index.html ] && { grep -q "id=\"$a\"" mentions-legales/index.html || say "mentions-legales : ancre #$a absente"; }
done

echo "7. Titles ≤ 60 caractères et uniques"
for f in $HTML; do
  t=$(grep -o '<title>[^<]*</title>' "$f" | sed 's/<[^>]*>//g;s/&amp;/\&/g')
  [ "${#t}" -le 60 ] || say "$f : title ${#t} car. : $t"
done
dup=$(for f in $HTML; do grep -o '<title>[^<]*</title>' "$f"; done | sort | uniq -d)
[ -z "$dup" ] && ok "titles ok" || say "title dupliqué : $dup"

echo "8. « début 2027 » unique par page hors modale/bannière (indicatif)"
ok "vérif manuelle"

[ $fail -eq 0 ] && echo "TOUT PASSE" || { echo "ÉCHECS"; exit 1; }
```

- [ ] **Step 2 : Rendre exécutable et lancer**

Run: `chmod +x scripts/check.sh && bash scripts/check.sh`
Expected: `ÉCHECS` — au moins « nom trouvé », « lien cassé : /apple-touch-icon.png », « lien footer #rgpd manquant », title trop long sur `assureurs` (74 car.) et `services` (68 car.). C'est la baseline : ces échecs sont corrigés par les tâches suivantes.

- [ ] **Step 3 : Étendre `.assetsignore`**

Remplacer le contenu par :

```
node_modules/
.git/
.wrangler/
package.json
package-lock.json
bun.lockb
CLAUDE.md
.claude/
.gitignore
.assetsignore
wrangler.toml
images/og-src.html
docs/
scripts/
worker/
README-deploy.md
BTM-Carrosserie-Contenu-Site-corrige.md
```

- [ ] **Step 4 : Commit**

```bash
git add scripts/check.sh .assetsignore
git commit -m "chore(qa): add non-regression check script, exclude internal files from assets"
```

---

### Task 2 : Anonymisation du chef d'atelier

**Files:**
- Modify: `index.html:126,153,231`, `services/index.html:99`, `a-propos/index.html:7,39,108-121,183,230`, `site.css:939` (commentaire)

- [ ] **Step 1 : `index.html`**

Ligne 126 : `<p>Timothé est carrossier de métier, BTS Carrosserie. Il porte la qualité technique de chaque dossier.</p>`
→ `<p>Notre chef d'atelier est carrossier de métier, BTS Carrosserie. Il porte la qualité technique de chaque dossier.</p>`

Ligne 153 : `Chaque dossier passe par les mains de Timothé.` → `Chaque dossier passe par les mains du chef d'atelier.`

Ligne 231 : `<p>Timothé est carrossier-peintre de métier, BTS Carrosserie. Chaque dossier…` → `<p>Notre chef d'atelier est carrossier-peintre de métier, BTS Carrosserie. Chaque dossier…`

- [ ] **Step 2 : `services/index.html`**

Ligne 99 : `Chaque prestation est encadrée par Timothé, carrossier de métier.` → `Chaque prestation est encadrée par notre chef d'atelier, carrossier de métier.`

- [ ] **Step 3 : `a-propos/index.html`**

Ligne 7 (meta description) : `…fondé par Grégoire Bodin (direction, relation assureurs) et Timothé Dauzat (carrossier de métier).` → `…fondé par Grégoire Bodin (direction, relation assureurs) et un chef d'atelier carrossier de métier.`

Ligne 39 : `{ "@type": "Person", "name": "Timothé Dauzat", "jobTitle": "Chef d'atelier" }` → `{ "@type": "Person", "jobTitle": "Chef d'atelier" }`

Ligne 90 : `et Timothé, carrossier-peintre de métier, BTS Carrosserie.` → `et un carrossier-peintre de métier, BTS Carrosserie.`

Lignes 108–121, remplacer le bloc :

```html
      <!-- CHEF D'ATELIER -->
      <article class="founder reveal" id="chef-atelier">
        <div class="meta">
          <span><span class="role">01 / Atelier</span></span>
          <span>Carrossier-peintre · BTS Carrosserie</span>
        </div>
        <div class="portrait portrait--mono" role="img" aria-label="Portrait du chef d'atelier BTM Carrosserie (placeholder)">
          <!-- TODO: remplacer par photo portrait du chef d'atelier -->
          <span class="mono-shape mono-shape--circle" aria-hidden="true"></span>
        </div>
        <h2>Le chef d'atelier.<small>Technique · qualité · méthodes</small></h2>
        <p>
          Carrossier-peintre de métier, BTS Carrosserie. Il porte la qualité technique de chaque dossier BTM — choix de méthode, validation des pièces, contrôle final.
        </p>
```

(le `<span class="mono-initials">TD</span>` est supprimé ; le cercle seul reste.)

Ligne 183 : `Un dossier passe par Timothé avant d'entrer en cabine.` → `Un dossier passe par le chef d'atelier avant d'entrer en cabine.`

Ligne 230 : `— Grégoire &amp; Timothé, mai 2026` → `— L'équipe BTM, mai 2026`

Vérifier qu'aucun lien interne ne pointait vers `#timothe` : `grep -rn "#timothe" *.html */index.html` → aucun résultat attendu.

- [ ] **Step 4 : `site.css`**

Ligne ~939, commentaire `/* Timothé — cercle (atelier, peinture) */` → `/* Chef d'atelier — cercle (atelier, peinture) */`.

- [ ] **Step 5 : Vérifier**

Run: `grep -rin "timoth\|dauzat" index.html services/index.html assureurs/index.html a-propos/index.html contact/index.html site.css site.js images/og-src.html`
Expected: aucune ligne.

Ouvrir `a-propos/index.html` dans Chrome, vérifier que le portrait cercle seul reste lisible (cercle terracotta sur fond noir).

- [ ] **Step 6 : Commit**

```bash
git add index.html services/index.html a-propos/index.html site.css
git commit -m "content: refer to workshop lead by role only, drop name from copy, schema and monogram"
```

---

### Task 3 : CTA unique « Être informé de l'ouverture »

**Files:**
- Modify: `index.html:72,111-112,328,361-362`, `services/index.html:315-316` + nav `.cta`, `assureurs/index.html:91,317-318`, `a-propos/index.html:252` + nav `.cta`, `contact/index.html` (nav `.cta`, option `ouverture`), `site.css:1527-1542`

- [ ] **Step 1 : Boutons hero et bandeaux finaux**

Dans chaque bloc `<div class="actions">` listé, remplacer les deux lignes (span désactivé + lien ghost) par **une seule** ligne :

Racine (`index.html` lignes 111-112 et 361-362) :
```html
          <a href="contact/" class="btn">Être informé de l'ouverture <span class="arrow">→</span></a>
```
`index.html` ligne 328 (déjà un seul bouton) : `Poser une question` → `Être informé de l'ouverture`.

Sous-pages (`services` 315-316, `assureurs` 317-318) :
```html
          <a href="../contact/" class="btn">Être informé de l'ouverture <span class="arrow">→</span></a>
```
`a-propos` 251-252 (deux liens actifs) → une seule ligne identique à ci-dessus.

- [ ] **Step 2 : CTA de la nav**

Sur les 5 pages, `<a href="…contact/" class="cta">Poser une question <span class="arrow">→</span></a>` → `<a href="…contact/" class="cta">Être informé de l'ouverture <span class="arrow">→</span></a>` (garder le préfixe `../` sur les sous-pages).

Vérifier à 1024 px de large que la nav tient sur une ligne. Si elle casse, réduire à `Être informé <span class="arrow">→</span>` sur les 5 pages.

- [ ] **Step 3 : Présélection dans le formulaire**

`contact/index.html` : `<option value="ouverture">Être informé de l'ouverture</option>` → `<option value="ouverture" selected>Être informé de l'ouverture</option>`.

- [ ] **Step 4 : Retirer le CSS mort**

`site.css` : supprimer le bloc `/* ----- Bouton désactivé (pré-ouverture) --- */` jusqu'à la fin de `.cta-band .btn[disabled] { … }` (lignes ~1527-1542) **mais conserver** un sélecteur pour le bouton d'envoi désactivé (utilisé en Task 8) :

```css
/* ----- Bouton désactivé (envoi en cours) ------------------- */
.btn[disabled] {
  opacity: 0.6;
  cursor: progress;
  pointer-events: none;
}
```

- [ ] **Step 5 : Vérifier**

Run: `grep -rn "btn--disabled\|Poser une question\|Demande de devis —\|Déclaration de sinistre —" index.html */index.html site.css`
Expected: aucune ligne. Puis `bash scripts/check.sh` (les échecs restants doivent être uniquement apple-touch-icon, footer légal, titles).

- [ ] **Step 6 : Commit**

```bash
git add index.html services/index.html assureurs/index.html a-propos/index.html contact/index.html site.css
git commit -m "feat(cta): single call to action across pages, drop disabled quote button"
```

---

### Task 4 : Page `mentions-legales/` + liens footer

**Files:**
- Create: `mentions-legales/index.html`
- Modify: footer des 5 pages, `contact/index.html` (consentement), `site.css` (`.legal`)

- [ ] **Step 1 : CSS**

Ajouter à la fin de `site.css` :

```css
/* ----- Page légale ------------------------------------------ */
.legal .wrap { max-width: 820px; }
.legal section { padding: var(--s-7) 0; border-top: 1px solid var(--btm-rule); }
.legal section:first-of-type { border-top: 0; }
.legal h2 { font-size: var(--fs-h3, 24px); margin: var(--s-4) 0 var(--s-3); }
.legal h3 { font-size: var(--fs-body); text-transform: uppercase; letter-spacing: var(--trk-wide); font-weight: 500; margin: var(--s-5) 0 var(--s-2); }
.legal p, .legal li { max-width: 68ch; }
.legal ul { padding-left: 1.2em; margin: 0 0 var(--s-3); }
.legal li { margin-bottom: 6px; }
.legal .todo { color: var(--btm-stone); }
```

Vérifier que `--fs-h3`, `--s-2..7`, `--trk-wide` existent dans `tokens.css` (`grep -n "fs-h3\|--s-7\|trk-wide" tokens.css`) ; sinon remplacer par les tokens de titre déjà utilisés (`grep -n "^h3" site.css`).

- [ ] **Step 2 : Créer la page**

`mentions-legales/index.html`. Copier le `<head>` de `contact/index.html` (lignes 1-52) et adapter : title, description, robots `noindex, follow`, canonical `https://btm-carrosserie.fr/mentions-legales`, og:title/url, **supprimer** le bloc JSON-LD `ContactPage`. Copier `<header class="site-nav">…</header>` et la `preopen-banner` de `contact/index.html` (aucun `is-active`). Copier le `<footer>` de `contact/index.html`. **Pas** de modale `#preopen-modal`.

```html
<title>Mentions légales &amp; confidentialité — BTM Carrosserie</title>
<meta name="description" content="Mentions légales, politique de confidentialité (RGPD), conditions d'utilisation et cookies du site btm-carrosserie.fr."/>
<meta name="robots" content="noindex, follow"/>
<link rel="canonical" href="https://btm-carrosserie.fr/mentions-legales"/>
```

Corps :

```html
<main id="main" class="legal">

<section class="page-head">
  <div class="wrap">
    <div class="meta-row reveal">
      <span><span class="num">06 /</span> Mentions légales</span>
      <span class="right">Éditeur · confidentialité · CGU · cookies</span>
    </div>
    <h1 class="reveal">Mentions légales<br/>et confidentialité.</h1>
    <p class="lead reveal d1">Les informations que la loi nous demande d'afficher, et ce que nous faisons de vos données. Version du 16 septembre 2026.</p>
    <nav class="crumbs reveal d2" aria-label="Sommaire">
      <a href="#editeur" class="text-link">01 · Éditeur</a><span class="sep">·</span>
      <a href="#hebergeur" class="text-link">02 · Hébergeur</a><span class="sep">·</span>
      <a href="#propriete" class="text-link">03 · Propriété</a><span class="sep">·</span>
      <a href="#rgpd" class="text-link">04 · Données</a><span class="sep">·</span>
      <a href="#cgu" class="text-link">05 · CGU</a><span class="sep">·</span>
      <a href="#cookies" class="text-link">06 · Cookies</a>
    </nav>
  </div>
</section>

<div class="wrap">

<section id="editeur">
  <div class="meta-row"><span><span class="num">01 /</span> Éditeur du site</span></div>
  <h2>BTM Carrosserie</h2>
  <p>Société à responsabilité limitée (SARL) en cours d'immatriculation.</p>
  <!-- TODO: compléter à l'immatriculation — capital social, SIREN, RCS, siège social, TVA -->
  <ul>
    <li>Capital social : <span class="todo">à compléter</span></li>
    <li>SIREN / RCS : <span class="todo">à compléter</span></li>
    <li>Siège social : <span class="todo">à compléter</span> — Pays Basque (64)</li>
    <li>Directeur de la publication : Grégoire Bodin, gérant</li>
    <li>Contact : <a href="mailto:contact@btm-carrosserie.fr" class="text-link">contact@btm-carrosserie.fr</a> · +33 00 00 00 00 00 (ligne active à l'ouverture)</li>
  </ul>
</section>

<section id="hebergeur">
  <div class="meta-row"><span><span class="num">02 /</span> Hébergeur</span></div>
  <h2>Cloudflare, Inc.</h2>
  <p>101 Townsend Street, San Francisco, CA 94107, États-Unis — <a href="https://www.cloudflare.com" class="text-link" rel="noopener">cloudflare.com</a>. Le site est diffusé depuis les centres de données européens du réseau Cloudflare.</p>
</section>

<section id="propriete">
  <div class="meta-row"><span><span class="num">03 /</span> Propriété intellectuelle</span></div>
  <h2>Contenus du site</h2>
  <p>Les textes, la charte graphique, le logo et les visuels de ce site appartiennent à BTM Carrosserie. Toute reproduction, même partielle, sans accord écrit est interdite. Les marques des compagnies d'assurance citées appartiennent à leurs propriétaires respectifs et sont mentionnées à titre d'information.</p>
</section>

<section id="rgpd">
  <div class="meta-row"><span><span class="num">04 /</span> Données personnelles</span></div>
  <h2>Politique de confidentialité</h2>
  <h3>Responsable de traitement</h3>
  <p>BTM Carrosserie SARL, représentée par Grégoire Bodin — <a href="mailto:contact@btm-carrosserie.fr" class="text-link">contact@btm-carrosserie.fr</a>.</p>
  <h3>Données collectées</h3>
  <p>Uniquement celles que vous saisissez dans le formulaire de contact : nom, prénom, adresse email, téléphone (facultatif), véhicule (facultatif), assureur (facultatif) et le contenu de votre message.</p>
  <h3>Finalités et base légale</h3>
  <ul>
    <li>Répondre à votre demande et, si vous l'avez demandé, vous informer de l'ouverture de l'atelier — base légale : votre consentement (art. 6.1.a RGPD), donné en cochant la case du formulaire.</li>
    <li>Sécuriser le formulaire contre les envois automatisés — base légale : notre intérêt légitime (art. 6.1.f).</li>
  </ul>
  <h3>Destinataires</h3>
  <p>Grégoire Bodin et le chef d'atelier. Aucune donnée n'est vendue, louée ni transmise à un tiers à des fins commerciales.</p>
  <h3>Sous-traitants</h3>
  <ul>
    <li>Cloudflare, Inc. — hébergement du site, protection du formulaire (Turnstile), mesure d'audience sans cookie.</li>
    <li>Resend, Inc. — acheminement des messages du formulaire vers notre boîte email.</li>
  </ul>
  <p>Ces prestataires sont établis aux États-Unis. Les transferts sont encadrés par les clauses contractuelles types de la Commission européenne.</p>
  <h3>Durée de conservation</h3>
  <p>Douze mois après notre dernier échange, puis suppression. Si vous devenez client à l'ouverture, vos données rejoignent le dossier client, conservé selon les obligations comptables (dix ans).</p>
  <h3>Vos droits</h3>
  <p>Accès, rectification, effacement, limitation, opposition, portabilité, retrait du consentement à tout moment. Écrivez à <a href="mailto:contact@btm-carrosserie.fr" class="text-link">contact@btm-carrosserie.fr</a>. Nous répondons sous un mois. Vous pouvez aussi saisir la CNIL : <a href="https://www.cnil.fr" class="text-link" rel="noopener">cnil.fr</a>.</p>
</section>

<section id="cgu">
  <div class="meta-row"><span><span class="num">05 /</span> Conditions d'utilisation</span></div>
  <h2>CGU du site</h2>
  <h3>Objet</h3>
  <p>Ce site présente l'atelier BTM Carrosserie, dont l'ouverture est prévue début 2027 au Pays Basque. Il a un rôle d'information et de prise de contact.</p>
  <h3>Contenu</h3>
  <p>Les prestations, délais et procédés décrits sont donnés à titre indicatif. Seul un devis écrit, établi après examen du véhicule, engage BTM Carrosserie. Les informations sur les assureurs reflètent l'état des démarches à la date de mise à jour du site.</p>
  <h3>Accès</h3>
  <p>Le site est accessible en permanence, sauf maintenance ou incident chez l'hébergeur. BTM Carrosserie ne peut être tenue responsable d'une indisponibilité temporaire.</p>
  <h3>Liens</h3>
  <p>Les liens vers des sites tiers sont fournis pour information. BTM Carrosserie n'en contrôle pas le contenu.</p>
  <h3>Droit applicable</h3>
  <p>Droit français. En cas de litige et à défaut d'accord amiable, les tribunaux de Bayonne sont compétents.</p>
</section>

<section id="cookies">
  <div class="meta-row"><span><span class="num">06 /</span> Cookies</span></div>
  <h2>Aucun cookie de suivi</h2>
  <p>Ce site ne dépose ni cookie publicitaire ni cookie de suivi. C'est pourquoi aucune bannière ne vous est présentée.</p>
  <ul>
    <li>Mesure d'audience : Cloudflare Web Analytics, sans cookie ni identifiant individuel — exempté de consentement selon la CNIL.</li>
    <li>Sécurité du formulaire : Cloudflare Turnstile, strictement nécessaire au service.</li>
    <li>Mémoire de session : le navigateur retient, le temps de votre visite, que vous avez fermé le message d'ouverture. Rien n'est transmis.</li>
  </ul>
</section>

</div>
</main>
```

Après `</footer>` : `<script src="../site.js"></script>` puis `</body></html>`.

- [ ] **Step 3 : Footer des 5 pages**

Dans `index.html` (racine, préfixe vide) et les 4 sous-pages (préfixe `../`), remplacer :

```html
      <div class="legal">
        <a href="#mentions">Mentions légales</a>
        <a href="#cgu">CGU</a>
        <a href="#cookies">Cookies</a>
      </div>
```
par (exemple sous-page) :
```html
      <div class="legal">
        <a href="../mentions-legales/">Mentions légales</a>
        <a href="../mentions-legales/#rgpd">Confidentialité</a>
        <a href="../mentions-legales/#cgu">CGU</a>
        <a href="../mentions-legales/#cookies">Cookies</a>
      </div>
```
Racine : `mentions-legales/…` sans `../`. Dans `mentions-legales/index.html` lui-même : `../mentions-legales/…` (cohérent avec les sous-pages).

Note : le footer utilise déjà la classe `.legal` sur un `<div>` ; le nouveau `.legal` de Step 1 cible `main.legal` — vérifier que `.site-foot .legal` n'hérite pas des règles `.legal section` (les sélecteurs `.legal section`, `.legal h2` ne matchent rien dans le footer, mais **renommer** la classe de Step 1 en `.legal-page` et `<main id="main" class="legal-page">` si un conflit visuel apparaît).

- [ ] **Step 4 : Consentement du formulaire**

`contact/index.html`, label consentement :
```html
                <input type="checkbox" name="consent" required/>
                <span>J'accepte que mes données soient traitées pour répondre à ma demande. Aucune information n'est transmise à un tiers. Vous disposez d'un droit d'accès, de rectification et de suppression — voir notre <a href="../mentions-legales/#rgpd" class="text-link">politique de confidentialité</a>.</span>
```

- [ ] **Step 5 : Vérifier**

Run: `bash scripts/check.sh`
Expected : sections 5 et 6 passent (plus de lien cassé `#mentions`, ancres présentes). Ouvrir `mentions-legales/` dans Chrome à 360 px et 1280 px : lisible, nav/footer identiques aux autres pages, aucune formulation marketing.

- [ ] **Step 6 : Commit**

```bash
git add mentions-legales/index.html index.html services/index.html assureurs/index.html a-propos/index.html contact/index.html site.css
git commit -m "feat(legal): add legal notice, privacy policy, terms and cookies page; wire footer links"
```

---

### Task 5 : Page 404, apple-touch-icon, titles, alt

**Files:**
- Create: `404.html`, `scripts/icon-src.html`, `apple-touch-icon.png`
- Modify: `services/index.html:29`, `assureurs/index.html`, `a-propos/index.html`, `contact/index.html:29` (lien apple-touch-icon), `services/index.html:6`, `assureurs/index.html:6` (titles), `site.css` (`.err-page`)

- [ ] **Step 1 : CSS 404**

Ajouter à la fin de `site.css` :
```css
/* ----- Page 404 --------------------------------------------- */
.err-page { min-height: 60vh; display: flex; align-items: center; }
.err-page .actions { display: flex; gap: var(--s-3); flex-wrap: wrap; margin-top: var(--s-5); }
```

- [ ] **Step 2 : Créer `404.html`**

Copier le `<head>` de `index.html` et adapter (chemins **absolus**, `noindex`, pas de JSON-LD, pas d'OG) :

```html
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Page introuvable — BTM Carrosserie</title>
<meta name="robots" content="noindex, nofollow"/>
<link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png"/>
<link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
<link rel="preload" href="/fonts/archivo-vf.woff2" as="font" type="font/woff2" crossorigin/>
<link rel="stylesheet" href="/tokens.css"/>
<link rel="stylesheet" href="/site.css"/>
</head>
<body>
```
Puis copier `<header class="site-nav">` de `index.html` en remplaçant chaque `href="contact/"` etc. par `/contact/`, `/services/`, `/assureurs/`, `/a-propos/`, `/` (aucun `is-active`). Pas de bannière, pas de modale.

```html
<main id="main">
<section class="page-head err-page">
  <div class="wrap">
    <div class="meta-row"><span><span class="num">404 /</span> Page introuvable</span><span class="right">BTM Carrosserie · Pays Basque</span></div>
    <h1>Cette page<br/>n'existe pas.</h1>
    <p class="lead">L'adresse est peut-être erronée, ou la page a été déplacée. Le site tient en cinq pages — tout est accessible depuis le menu.</p>
    <div class="actions">
      <a href="/" class="btn">Retour à l'accueil <span class="arrow">→</span></a>
      <a href="/contact/" class="btn btn--ghost">Être informé de l'ouverture</a>
    </div>
  </div>
</section>
</main>
```
Puis le `<footer>` de `index.html` avec tous les liens en absolu (`/services/#sinistre`, `/mentions-legales/#rgpd`…), `<script src="/site.js"></script>`, `</body></html>`.

- [ ] **Step 3 : Générer `apple-touch-icon.png`**

Créer `scripts/icon-src.html` :
```html
<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:180px;height:180px;background:#F4EEDD}
body{display:flex;align-items:center;justify-content:center;font-family:Arial,Helvetica,sans-serif}
span{font-size:124px;font-weight:900;color:#B14A2A;line-height:1;transform:translateY(4px)}
</style></head><body><span>B</span></body></html>
```
Run :
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --window-size=180,180 --screenshot="$PWD/apple-touch-icon.png" "file://$PWD/scripts/icon-src.html"
file apple-touch-icon.png
```
Expected : `PNG image data, 180 x 180`. Ouvrir le PNG (`open apple-touch-icon.png`) : B terracotta centré sur crème, comme `favicon.svg`.

- [ ] **Step 4 : Uniformiser les liens favicon**

Sur `services`, `assureurs`, `a-propos`, `contact`, `mentions-legales` : remplacer `<link rel="apple-touch-icon" href="/favicon.svg"/>` par les deux lignes de `index.html` :
```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png"/>
<link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
```

- [ ] **Step 5 : Titles ≤ 60 caractères**

- `services/index.html:6` : `Services — Carrosserie &amp; peinture auto à Bayonne | BTM` (55)
- `assureurs/index.html:6` : `Sinistre auto &amp; assureurs — BTM Carrosserie Bayonne` (52)
- Autres titles déjà ≤ 60 (`index` 60, `a-propos` 55, `contact` 52). Ne pas toucher aux `og:title`.

- [ ] **Step 6 : Audit alt**

Run: `grep -n "<img" index.html */index.html 404.html`
Expected : aucune balise `<img>` (les visuels sont des blocs CSS). Si une apparaît, ajouter `alt=""` (décoratif) ou un `alt` descriptif. Vérifier que chaque `role="img"` a un `aria-label` : `grep -n 'role="img"' */index.html`.

- [ ] **Step 7 : Image OG**

Run: `ls -l images/og-btm.png && file images/og-btm.png`
Expected : `1200 x 630`, ~30 Ko. Sous 150 Ko → aucune compression nécessaire ; noter le poids dans le message de commit.

- [ ] **Step 8 : Vérifier**

Run: `bash scripts/check.sh`
Expected : `TOUT PASSE`. Puis `npx serve . -p 3000` et ouvrir `http://localhost:3000/nimportequoi` → `serve` renvoie sa propre 404, donc vérifier plutôt `http://localhost:3000/404.html` visuellement (la 404 réelle est testée en Task 9 avec `wrangler dev`).

- [ ] **Step 9 : Commit**

```bash
git add 404.html apple-touch-icon.png scripts/icon-src.html site.css services/index.html assureurs/index.html a-propos/index.html contact/index.html mentions-legales/index.html
git commit -m "feat(site): custom 404 page, apple-touch-icon, shorter titles, favicon links unified"
```

---

### Task 6 : En-têtes de sécurité, HTTPS, analytics, README déploiement

**Files:**
- Create: `_headers`, `README-deploy.md`
- Modify: les 7 HTML (`index`, 4 sous-pages, `mentions-legales`, `404`) avant `</body>`

- [ ] **Step 1 : `_headers`**

```
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Content-Security-Policy: default-src 'self'; script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com; frame-src https://challenges.cloudflare.com; connect-src 'self' https://cloudflareinsights.com; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=604800
```

`style-src 'unsafe-inline'` est conservé pour le widget Turnstile (il injecte des styles sur son conteneur). Les JSON-LD (`type="application/ld+json"`) ne sont pas exécutés et ne sont pas concernés par `script-src`.

- [ ] **Step 2 : Snippet analytics**

Sur les 7 HTML, juste avant `</body>` (après la modale quand elle existe) :

```html
<!-- TODO analytics: coller le token Cloudflare Web Analytics (dashboard > Analytics & Logs > Web Analytics) puis décommenter
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "TOKEN_ICI"}'></script>
-->
```

- [ ] **Step 3 : `README-deploy.md`**

```markdown
# Déploiement — btm-carrosserie.fr

Cloudflare Workers + Static Assets. `npx wrangler deploy` depuis la racine.

## Une fois, dans le dashboard Cloudflare (zone btm-carrosserie.fr)
1. SSL/TLS → Edge Certificates → **Always Use HTTPS** : On.
2. SSL/TLS → Edge Certificates → **HTTP Strict Transport Security** : activer, max-age 12 mois, include subdomains (le fichier `_headers` pose déjà l'en-tête ; le réglage dashboard couvre aussi les réponses servies avant le Worker).
3. SSL/TLS → mode **Full (strict)**.
4. Analytics & Logs → Web Analytics → ajouter le site → copier le token → le coller dans le snippet commenté avant `</body>` de chaque HTML, décommenter, déployer.
5. Turnstile → créer un widget « Managed » pour `btm-carrosserie.fr` → noter **site key** et **secret key**.

## Secrets du Worker
```
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET
```
Resend : créer le compte, vérifier le domaine `btm-carrosserie.fr` (enregistrements DNS SPF/DKIM fournis par Resend, à poser dans la zone Cloudflare), créer une clé API « sending ».

Site key Turnstile : remplacer `1x00000000000000000000AA` (clé de test, toujours valide) dans `contact/index.html` par la vraie site key.

## Test local
```
npm install
npm test          # tests unitaires de validation
npm run dev       # wrangler dev sur http://localhost:8787
```
En local, définir les secrets dans `.dev.vars` (non commité) :
```
RESEND_API_KEY=re_xxx
TURNSTILE_SECRET=1x0000000000000000000000000000000AA
```
Le secret Turnstile de test ci-dessus accepte toute réponse.

## Vérifications avant chaque déploiement
```
bash scripts/check.sh
```
```

Ajouter `.dev.vars` à `.gitignore`.

- [ ] **Step 4 : Vérifier**

Run: `bash scripts/check.sh && grep -c "beacon.min.js" index.html */index.html 404.html`
Expected : `TOUT PASSE` et `1` pour chacun des 7 fichiers.

- [ ] **Step 5 : Commit**

```bash
git add _headers README-deploy.md .gitignore index.html services/index.html assureurs/index.html a-propos/index.html contact/index.html mentions-legales/index.html 404.html
git commit -m "feat(security): HSTS and security headers, analytics snippet, deployment notes"
```

---

### Task 7 : Validation serveur (`worker/validate.js`) en TDD

**Files:**
- Create: `worker/validate.js`, `worker/validate.test.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `export const PRESTATIONS = ['sinistre','peinture','debosselage','pare-chocs','assureur','ouverture','autre']`
- Produces: `export function validateContact(fields: Record<string,string>) : { ok: true, data: {nom,prenom,email,tel,prestation,vehicule,assureur,message} } | { ok: false, errors: Record<string,string> }`

- [ ] **Step 1 : `package.json`**

```json
{
  "name": "btm-carrosserie",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "serve . -p $PORT",
    "test": "node --test worker/",
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  },
  "dependencies": {
    "serve": "^14.2.4"
  },
  "devDependencies": {
    "wrangler": "^4.0.0"
  }
}
```
Run: `npm install` (installe wrangler ; `package-lock.json` est gitignoré, ne pas le forcer).

- [ ] **Step 2 : Test qui échoue**

`worker/validate.test.js` :
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateContact, PRESTATIONS } from './validate.js';

const good = {
  nom: 'Etcheverry', prenom: 'Maialen', email: 'maialen@example.com', tel: '',
  prestation: 'ouverture', vehicule: '', assureur: '', message: 'Merci de me prévenir à l\'ouverture.', consent: 'on',
};

test('cas nominal → ok avec données nettoyées', () => {
  const r = validateContact({ ...good, nom: '  Etcheverry ' });
  assert.equal(r.ok, true);
  assert.equal(r.data.nom, 'Etcheverry');
  assert.equal(r.data.prestation, 'ouverture');
});

test('champs requis manquants → erreurs par champ', () => {
  const r = validateContact({ ...good, nom: '', email: '', message: '', consent: '' });
  assert.equal(r.ok, false);
  assert.deepEqual(Object.keys(r.errors).sort(), ['consent', 'email', 'message', 'nom']);
});

test('email invalide', () => {
  const r = validateContact({ ...good, email: 'pas-un-email' });
  assert.equal(r.ok, false);
  assert.equal(r.errors.email, 'Email invalide');
});

test('prestation hors liste', () => {
  const r = validateContact({ ...good, prestation: 'vidange' });
  assert.equal(r.ok, false);
  assert.ok(r.errors.prestation);
  assert.ok(PRESTATIONS.includes('ouverture'));
});

test('message trop court ou trop long', () => {
  assert.equal(validateContact({ ...good, message: 'court' }).ok, false);
  assert.equal(validateContact({ ...good, message: 'x'.repeat(3001) }).ok, false);
  assert.equal(validateContact({ ...good, message: 'x'.repeat(3000) }).ok, true);
});

test('longueurs max des champs optionnels', () => {
  assert.equal(validateContact({ ...good, tel: '1'.repeat(31) }).ok, false);
  assert.equal(validateContact({ ...good, vehicule: 'v'.repeat(121) }).ok, false);
  assert.equal(validateContact({ ...good, assureur: 'a'.repeat(120) }).ok, true);
});

test('valeurs non-string tolérées', () => {
  const r = validateContact({ ...good, tel: undefined, vehicule: null });
  assert.equal(r.ok, true);
  assert.equal(r.data.tel, '');
});
```

- [ ] **Step 3 : Lancer, vérifier l'échec**

Run: `npm test`
Expected : échec `Cannot find module … worker/validate.js`.

- [ ] **Step 4 : Implémenter**

`worker/validate.js` :
```js
// Validation serveur du formulaire de contact. Fonctions pures, sans dépendance.
export const PRESTATIONS = ['sinistre', 'peinture', 'debosselage', 'pare-chocs', 'assureur', 'ouverture', 'autre'];

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const str = (v) => (typeof v === 'string' ? v.trim() : '');

export function validateContact(fields) {
  const f = fields || {};
  const data = {
    nom: str(f.nom),
    prenom: str(f.prenom),
    email: str(f.email),
    tel: str(f.tel),
    prestation: str(f.prestation),
    vehicule: str(f.vehicule),
    assureur: str(f.assureur),
    message: str(f.message),
  };
  const errors = {};

  if (data.nom.length < 1 || data.nom.length > 80) errors.nom = 'Veuillez renseigner votre nom';
  if (data.prenom.length < 1 || data.prenom.length > 80) errors.prenom = 'Veuillez renseigner votre prénom';
  if (!EMAIL_RE.test(data.email) || data.email.length > 254) errors.email = 'Email invalide';
  if (data.tel.length > 30) errors.tel = 'Numéro trop long';
  if (!PRESTATIONS.includes(data.prestation)) errors.prestation = 'Sélectionnez une prestation';
  if (data.vehicule.length > 120) errors.vehicule = 'Texte trop long (120 caractères max.)';
  if (data.assureur.length > 120) errors.assureur = 'Texte trop long (120 caractères max.)';
  if (data.message.length < 10) errors.message = 'Veuillez décrire votre demande';
  else if (data.message.length > 3000) errors.message = 'Message trop long (3000 caractères max.)';
  if (str(f.consent) !== 'on') errors.consent = 'Votre accord est nécessaire pour traiter la demande';

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}
```

- [ ] **Step 5 : Lancer, vérifier le succès**

Run: `npm test`
Expected : 7 tests `pass`, 0 `fail`.

- [ ] **Step 6 : Commit**

```bash
git add package.json worker/validate.js worker/validate.test.js
git commit -m "feat(worker): server-side contact validation with unit tests"
```

---

### Task 8 : Worker `/api/contact` (honeypot, rate-limit, Turnstile, Resend)

**Files:**
- Create: `worker/index.js`
- Modify: `wrangler.toml`

**Interfaces:**
- Consumes: `validateContact`, `PRESTATIONS` de `worker/validate.js`
- Produces: `POST /api/contact` → JSON `{ok:true}` / `{ok:false, errors:{[champ]:string}}` quand `Accept` contient `application/json` ; sinon `303` vers `/contact/?envoye=1#form-success` (succès) ou `/contact/?erreur=1#contact-form` (échec). Env : `ASSETS`, `RESEND_API_KEY`, `TURNSTILE_SECRET`.

- [ ] **Step 1 : `wrangler.toml`**

```toml
name = "btm-carrosserie"
main = "worker/index.js"
compatibility_date = "2025-01-01"

[assets]
directory = "."
binding = "ASSETS"
not_found_handling = "404-page"
run_worker_first = ["/api/*"]
```

- [ ] **Step 2 : `worker/index.js`**

```js
// BTM Carrosserie — Worker : reçoit le formulaire de contact sur /api/contact,
// tout le reste est servi par les Static Assets.
import { validateContact } from './validate.js';

const TO = 'contact@btm-carrosserie.fr';
const FROM = 'BTM Carrosserie <site@btm-carrosserie.fr>';
const RATE_LIMIT = 10;      // requêtes
const RATE_WINDOW = 600;    // secondes
const LABELS = {
  sinistre: 'Réparation après sinistre', peinture: 'Peinture automobile', debosselage: 'Débosselage',
  'pare-chocs': 'Pare-chocs et plastiques', assureur: 'Dossier assureur',
  ouverture: "Être informé de l'ouverture", autre: 'Autre demande',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
      return handleContact(request, env, ctx);
    }
    if (url.pathname.startsWith('/api/')) return new Response('Not Found', { status: 404 });
    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env, ctx) {
  const wantsJson = (request.headers.get('Accept') || '').includes('application/json');
  const reply = (status, body) => {
    if (wantsJson) return Response.json(body, { status });
    const dest = body.ok ? '/contact/?envoye=1#form-success' : '/contact/?erreur=1#contact-form';
    return Response.redirect(new URL(dest, request.url).toString(), 303);
  };

  const ct = request.headers.get('Content-Type') || '';
  if (!ct.includes('application/x-www-form-urlencoded') && !ct.includes('multipart/form-data')) {
    return reply(415, { ok: false, errors: { _: 'Format de requête non pris en charge' } });
  }
  const form = await request.formData();
  const fields = Object.fromEntries([...form.entries()].map(([k, v]) => [k, typeof v === 'string' ? v : '']));

  // Honeypot : un robot remplit le champ caché → on répond OK sans rien envoyer.
  if (fields.website) return reply(200, { ok: true });

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (await isRateLimited(ip, ctx)) {
    return reply(429, { ok: false, errors: { _: 'Trop de tentatives. Réessayez dans quelques minutes.' } });
  }

  const turnstileOk = await verifyTurnstile(fields['cf-turnstile-response'], ip, env.TURNSTILE_SECRET);
  if (!turnstileOk) return reply(400, { ok: false, errors: { turnstile: 'Vérification anti-robot échouée. Rechargez la page et réessayez.' } });

  const v = validateContact(fields);
  if (!v.ok) return reply(400, { ok: false, errors: v.errors });

  const sent = await sendEmail(v.data, env.RESEND_API_KEY);
  if (!sent) return reply(502, { ok: false, errors: { _: `Envoi impossible pour le moment. Écrivez-nous directement à ${TO}.` } });

  return reply(200, { ok: true });
}

// Compteur par IP dans le cache edge (best effort : jamais bloquant en cas d'erreur).
async function isRateLimited(ip, ctx) {
  try {
    const cache = caches.default;
    const key = new Request(`https://rate.btm-carrosserie.internal/${encodeURIComponent(ip)}`);
    const hit = await cache.match(key);
    const count = hit ? parseInt(await hit.text(), 10) || 0 : 0;
    if (count >= RATE_LIMIT) return true;
    ctx.waitUntil(cache.put(key, new Response(String(count + 1), { headers: { 'Cache-Control': `max-age=${RATE_WINDOW}` } })));
    return false;
  } catch {
    return false;
  }
}

async function verifyTurnstile(token, ip, secret) {
  if (!token || !secret) return false;
  try {
    const body = new URLSearchParams({ secret, response: token, remoteip: ip });
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const json = await res.json();
    return json.success === true;
  } catch {
    return false;
  }
}

async function sendEmail(d, apiKey) {
  if (!apiKey) return false;
  const lines = [
    `Prestation : ${LABELS[d.prestation] || d.prestation}`,
    `Nom : ${d.prenom} ${d.nom}`,
    `Email : ${d.email}`,
    `Téléphone : ${d.tel || '—'}`,
    `Véhicule : ${d.vehicule || '—'}`,
    `Assureur : ${d.assureur || '—'}`,
    '',
    'Message :',
    d.message,
  ];
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: d.email,
        subject: `[Site] ${LABELS[d.prestation] || d.prestation} — ${d.prenom} ${d.nom}`,
        text: lines.join('\n'),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
```

- [ ] **Step 3 : Test local avec `wrangler dev`**

Créer `.dev.vars` (gitignoré) :
```
RESEND_API_KEY=
TURNSTILE_SECRET=1x0000000000000000000000000000000AA
```
Run (terminal 1) : `npm run dev` → `http://localhost:8787`.

Run (terminal 2) :
```bash
B=http://localhost:8787
# 1. Statique toujours servi
curl -s -o /dev/null -w "%{http_code}\n" $B/                       # 200
curl -s -o /dev/null -w "%{http_code}\n" $B/nimportequoi           # 404 (contenu = 404.html)
curl -s $B/nimportequoi | grep -c "Cette page"                     # 1
# 2. GET sur l'API
curl -s -o /dev/null -w "%{http_code}\n" $B/api/contact             # 405
# 3. Honeypot
curl -s -H "Accept: application/json" -d "website=spam&nom=x" $B/api/contact   # {"ok":true}
# 4. Champs manquants (Turnstile test secret accepte n'importe quel token)
curl -s -H "Accept: application/json" -d "cf-turnstile-response=x&nom=&email=bad" $B/api/contact
#   → 400 {"ok":false,"errors":{"nom":…,"prenom":…,"email":"Email invalide",…}}
# 5. Nominal sans clé Resend → 502 propre
curl -s -H "Accept: application/json" -d "cf-turnstile-response=x&nom=Etcheverry&prenom=Maialen&email=m@example.com&prestation=ouverture&message=Merci de me prévenir&consent=on" $B/api/contact
#   → 502 {"ok":false,"errors":{"_":"Envoi impossible…"}}
# 6. Sans Accept JSON → redirection 303
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -d "cf-turnstile-response=x&nom=" $B/api/contact
#   → 303 http://localhost:8787/contact/?erreur=1#contact-form
```
Expected : les codes indiqués. Si une vraie `RESEND_API_KEY` est disponible, rejouer le cas 5 → `{"ok":true}` et l'email arrive sur `contact@btm-carrosserie.fr` (domaine vérifié requis ; sinon Resend renvoie 403 → 502 attendu).

- [ ] **Step 4 : Commit**

```bash
git add wrangler.toml worker/index.js
git commit -m "feat(worker): contact endpoint with honeypot, rate limit, Turnstile and Resend delivery"
```

---

### Task 9 : Formulaire côté front (honeypot, Turnstile, fetch, états)

**Files:**
- Modify: `contact/index.html` (form), `site.js:44-88`, `site.css`

**Interfaces:**
- Consumes: `POST /api/contact` (Task 8) ; `?envoye=1` / `?erreur=1`.

- [ ] **Step 1 : CSS**

Ajouter à la fin de `site.css` :
```css
/* ----- Formulaire : honeypot, erreurs serveur, succès sans JS ----- */
.hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
.form-server-err { display: none; color: var(--accent); margin: var(--s-3) 0 0; }
.form-server-err.shown { display: block; }
.form-success:target { display: block; }
.cf-turnstile { margin-top: var(--s-2); }
```

- [ ] **Step 2 : HTML du formulaire**

`contact/index.html` :

1. Balise `<form>` : `<form id="contact-form" class="reveal d1 form-side__head-gap" action="/api/contact" method="post" novalidate>`.
2. Juste après `<div class="form-grid">`, ajouter le honeypot :
```html
            <div class="hp" aria-hidden="true">
              <label for="website">Site web</label>
              <input type="text" id="website" name="website" tabindex="-1" autocomplete="off"/>
            </div>
```
3. Avant `<div class="full form-actions">`, ajouter le widget :
```html
            <div class="field full">
              <!-- TODO: remplacer la site key de test par la vraie (dashboard Cloudflare > Turnstile) -->
              <div class="cf-turnstile" data-sitekey="1x00000000000000000000AA" data-language="fr" data-theme="light"></div>
              <span class="err" id="turnstile-err">Vérification anti-robot échouée. Rechargez la page et réessayez.</span>
            </div>
```
4. Dans `.form-actions`, après le bouton reset :
```html
              <p class="form-server-err" id="form-server-err" role="alert"></p>
```
5. Avant `</body>` (à côté du snippet analytics) : `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" defer></script>`.

- [ ] **Step 3 : `site.js` — remplacer le bloc `// ---- Contact form (light validation)` jusqu'à la fin de son `if (form) { … }`**

```js
  // ---- Contact form ------------------------------------------
  const form = document.querySelector('#contact-form');
  if (form) {
    const success = document.querySelector('#form-success');
    const serverErr = document.querySelector('#form-server-err');
    const submitBtn = form.querySelector('button[type="submit"]');
    const params = new URLSearchParams(window.location.search);

    const showSuccess = () => {
      form.hidden = true;
      if (success) success.classList.add('shown');
    };
    const setFieldError = (name, on) => {
      const field = form.querySelector(`[name="${name}"]`);
      const wrap = field ? field.closest('.field') : null;
      if (!wrap) return;
      wrap.classList.toggle('has-err', on);
      if (field) field.classList.toggle('invalid', on);
    };

    // Retour d'un envoi sans JS (redirection 303 du Worker)
    if (params.get('envoye') === '1') showSuccess();
    if (params.get('erreur') === '1' && serverErr) {
      serverErr.textContent = "L'envoi a échoué. Vérifiez les champs ou écrivez-nous à contact@btm-carrosserie.fr.";
      serverErr.classList.add('shown');
    }

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (serverErr) { serverErr.textContent = ''; serverErr.classList.remove('shown'); }

      let ok = true;
      form.querySelectorAll('[data-required]').forEach((field) => {
        const val = (field.value || '').trim();
        const isEmail = field.type === 'email';
        const valid = val.length > 0 && (!isEmail || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val));
        setFieldError(field.name, !valid);
        if (!valid) ok = false;
      });
      const consent = form.querySelector('[name="consent"]');
      if (consent && !consent.checked) { setFieldError('consent', true); ok = false; }
      if (!ok) {
        const firstErr = form.querySelector('.has-err input, .has-err textarea, .has-err select');
        if (firstErr) firstErr.focus();
        return;
      }

      const label = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi…';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
        });
        const json = await res.json().catch(() => ({ ok: false, errors: { _: 'Réponse illisible' } }));
        if (res.ok && json.ok) { showSuccess(); return; }
        const errors = json.errors || {};
        Object.keys(errors).forEach((name) => {
          if (name === 'turnstile') { document.querySelector('#turnstile-err')?.closest('.field')?.classList.add('has-err'); return; }
          if (name !== '_') setFieldError(name, true);
        });
        if (serverErr) {
          serverErr.textContent = errors._ || 'Certains champs sont à corriger.';
          serverErr.classList.add('shown');
        }
        if (window.turnstile) window.turnstile.reset();
      } catch {
        if (serverErr) {
          serverErr.innerHTML = 'Connexion impossible. Écrivez-nous à <a href="mailto:contact@btm-carrosserie.fr" class="text-link">contact@btm-carrosserie.fr</a>.';
          serverErr.classList.add('shown');
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = label;
      }
    });

    // Clear error on input
    form.querySelectorAll('[data-required], [name="consent"]').forEach((field) => {
      field.addEventListener('input', () => setFieldError(field.name, false));
      field.addEventListener('change', () => setFieldError(field.name, false));
    });
  }
```

Note : `form.hidden = true` remplace `form.style.display = 'none'` (pas de style inline, et `[hidden]` est géré par le navigateur). Vérifier qu'aucune règle `#contact-form { display: … }` dans `site.css` n'écrase `hidden` (`grep -n "#contact-form\|form {" site.css`) ; si oui, ajouter `#contact-form[hidden] { display: none; }`.

- [ ] **Step 4 : Le `.field` du consentement doit pouvoir afficher une erreur**

`contact/index.html`, dans le `<div class="field full">` du consentement, après le `</label>` :
```html
              <span class="err">Votre accord est nécessaire pour traiter la demande</span>
```

- [ ] **Step 5 : Test manuel**

`npm run dev`, ouvrir `http://localhost:8787/contact/` :
1. Envoyer vide → erreurs client sous nom/prénom/email/message/consentement, focus sur le premier champ. Pas de requête réseau (onglet Réseau).
2. Remplir correctement, cocher, valider le Turnstile de test → bouton « Envoi… » → réponse 502 (pas de clé Resend) → message rouge « Envoi impossible… contact@btm-carrosserie.fr », bouton réactivé, Turnstile réinitialisé.
3. Avec `RESEND_API_KEY` valide dans `.dev.vars` : succès → formulaire masqué, bloc « Message envoyé » visible.
4. `http://localhost:8787/contact/?envoye=1#form-success` → bloc succès visible, formulaire masqué.
5. Désactiver JS (DevTools > Settings > Disable JavaScript), envoyer un formulaire valide → redirection `…/contact/?envoye=1#form-success` et bloc succès visible via `:target`.
6. 360 px : le widget Turnstile ne déborde pas.

- [ ] **Step 6 : Vérifier et committer**

Run: `bash scripts/check.sh && npm test`
Expected : `TOUT PASSE`, 7 tests pass.

```bash
git add contact/index.html site.js site.css
git commit -m "feat(contact): real form submission with honeypot, Turnstile, server errors and no-JS fallback"
```

---

### Task 10 : Vérification finale (Lighthouse, responsive, checklist)

**Files:**
- Aucun nouveau. Corrections mineures éventuelles.

- [ ] **Step 1 : Non-régression**

Run: `bash scripts/check.sh && npm test && grep -rn "Timoth\|Dauzat" --include=*.html --include=*.js --include=*.css --include=*.xml --include=*.txt . | grep -v node_modules | grep -v "^./docs" | grep -v Contenu-Site`
Expected : `TOUT PASSE`, tests OK, grep vide.

- [ ] **Step 2 : Lighthouse**

`npm run dev`, puis Chrome DevTools > Lighthouse (mobile puis desktop) sur `/`, `/contact/`, `/mentions-legales/`, `/nimportequoi` (404).
Expected : performance ≥ 95, accessibilité ≥ 95, best practices 100 (CSP en en-tête : vérifier onglet Réseau que `content-security-policy` est présent et qu'aucune erreur CSP n'apparaît en console — en particulier Turnstile sur `/contact/`), SEO 100 sauf pages `noindex` (Lighthouse signale le `noindex` : attendu).

Si erreur CSP en console pour Turnstile, ajouter l'origine indiquée à la directive concernée dans `_headers` et re-tester.

- [ ] **Step 3 : Responsive**

Chrome, largeur 360 px : `/`, `/contact/`, `/mentions-legales/`, `/404.html`. Aucun débordement horizontal (`document.documentElement.scrollWidth === window.innerWidth` dans la console).

- [ ] **Step 4 : Checklist des 20 points**

Cocher dans le message de PR :
1 RGPD ✓ (`/mentions-legales/#rgpd`) · 2 CGU ✓ · 3 API ✓ (`/api/contact`) · 4 HTTPS ✓ (`_headers` + dashboard, README) · 5 Cookies ✓ (aucun cookie, `#cookies`) · 6 Titles ✓ · 7 OG ✓ · 8 Favicon ✓ · 9 Sitemap/robots ✓ · 10 Alt ✓ · 11 Images ✓ (OG 30 Ko) · 12 Vitesse ✓ · 13 Contraste ✓ · 14 Responsive ✓ · 15 404 ✓ · 16 Liens ✓ · 17 Validation ✓ · 18 Anti-spam ✓ · 19 Analytics ✓ (token à coller) · 20 CTA ✓ · Anonymisation ✓.

- [ ] **Step 5 : Commit des éventuelles corrections**

```bash
git add -A
git commit -m "fix(qa): post-verification adjustments"
```
(Uniquement s'il y a des changements.)

---

## Restes à faire par Grégoire (hors code)

- Dashboard Cloudflare : Always Use HTTPS, HSTS, Web Analytics (token), Turnstile (site key + secret).
- Resend : compte, domaine vérifié, clé API → `wrangler secret put`.
- Compléter les `TODO` de `mentions-legales/` à l'immatriculation.
- Témoignages fictifs (CLAUDE.md §4.3) : décision séparée.
