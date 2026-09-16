# Refonte visuelle btm-carrosserie.fr — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Appliquer intégralement la DA Bauhaus validée (spec `docs/superpowers/specs/2026-06-12-refonte-visuelle-design.md`) sur les 5 pages : Archivo Variable self-hosted unique, corps 16 px, motion scroll-driven, schema AutoBodyShop, Lighthouse ≥ 90.

**Architecture:** Le site existant est déjà structuré en bandes crème/noir avec méta-rows — la refonte est un **overhaul du système de design** (tokens, fonts, motion) + une **recomposition section par section** qui conserve le texte validé à l'identique. Astuce clé : `--font-mono` devient un alias d'Archivo dans tokens.css, ce qui bascule tout le site sur une seule famille sans toucher aux 1249 lignes de site.css.

**Tech Stack:** HTML/CSS/JS statique pur. Archivo Variable woff2 (fontsource). CSS scroll-driven animations + fallback IntersectionObserver. `serve` pour le local, Lighthouse CLI pour la vérification.

**Règle absolue (toutes tâches) :** ne jamais modifier le SENS du texte. Reformulations stylistiques interdites sauf indication explicite dans une tâche. Aucun contenu factuel ajouté (adresse, chiffres, agréments, CV). Dates : « début 2027 » uniquement.

---

### Task 1: Branche de travail

**Files:** aucun

- [ ] **Step 1: Créer la branche depuis l'état actuel**

```bash
git checkout -b design/refonte-visuelle
git status --short   # attendu : BTM-Carrosserie-Contenu-Site-corrige.md non suivi, rien d'autre
```

---

### Task 2: Archivo Variable self-hosted

**Files:**
- Create: `fonts/archivo-vf.woff2`, `fonts/archivo-vf-italic.woff2`
- Modify: `tokens.css` (lignes 1–13 : header + @import)

- [ ] **Step 1: Télécharger les fichiers variable depuis fontsource (CDN jsDelivr)**

```bash
mkdir -p fonts
curl -fL -o fonts/archivo-vf.woff2 "https://cdn.jsdelivr.net/fontsource/fonts/archivo:vf@latest/latin-wght-normal.woff2"
curl -fL -o fonts/archivo-vf-italic.woff2 "https://cdn.jsdelivr.net/fontsource/fonts/archivo:vf@latest/latin-wght-italic.woff2"
ls -la fonts/   # attendu : deux .woff2 de ~30–60 ko chacun
```

Si l'URL fontsource échoue, fallback : repo GitHub `https://github.com/fontsource/font-files/tree/main/fonts/variable/archivo/files` (mêmes noms de fichiers).

- [ ] **Step 2: Remplacer l'@import Google Fonts par les @font-face dans tokens.css**

Supprimer la ligne 13 (`@import url('https://fonts.googleapis.com...')`) et la remplacer par :

```css
@font-face {
  font-family: 'Archivo';
  src: url('/fonts/archivo-vf.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Archivo';
  src: url('/fonts/archivo-vf-italic.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-style: italic;
  font-display: swap;
}
```

- [ ] **Step 3: Vérifier qu'aucune référence Google Fonts ne subsiste**

```bash
grep -rn "fonts.googleapis\|fonts.gstatic\|IBM Plex" --include="*.css" --include="*.html" . | grep -v node_modules | grep -v docs/
# attendu : uniquement des hits dans tokens.css ligne --font-mono (corrigé en Task 3) ou rien
```

- [ ] **Step 4: Commit**

```bash
git add fonts/ tokens.css
git commit -m "feat(fonts): self-host Archivo variable woff2, drop Google Fonts import"
```

---

### Task 3: Tokens — famille unique, corps 16 px, motion

**Files:**
- Modify: `tokens.css`

- [ ] **Step 1: Basculer la typographie sur Archivo seul**

Dans `:root`, remplacer :

```css
  --font-display:  'Archivo', 'Helvetica Neue', Arial, sans-serif;
  --font-mono:     'IBM Plex Mono', ui-monospace, Menlo, monospace;
  /* Note : pas de --font-sans. Le mono porte aussi le corps. */
```

par :

```css
  --font-display:  'Archivo', 'Helvetica Neue', Arial, sans-serif;
  /* Une seule famille. --font-mono est conservé comme ALIAS pour compatibilité
     avec site.css — il pointe sur Archivo. La « voix atelier » des labels passe
     par uppercase + tracking large + graisse 500, plus par le mono. */
  --font-mono:     var(--font-display);
```

- [ ] **Step 2: Remonter l'échelle corps**

```css
  --fs-body:   16px;
  --fs-small:  13px;
  --fs-micro:  11px;
```

(`--fs-mega`, `--fs-h1`…`--fs-h4` inchangés.)

- [ ] **Step 3: Ajuster les primitives qui codaient des tailles en dur**

Dans `.btm-lead` : `font-size: 16px` → `font-size: 18px`. Les labels (`.btm-label`) passent en `font-weight: 500` (déjà le cas) — vérifier le rendu : avec Archivo, ajouter `font-weight: 500;` explicite si absent.

- [ ] **Step 4: Ajouter les tokens motion en fin de bloc `:root`**

```css
  /* ---------- Motion — révélation scroll ---------- */
  --reveal-distance: 24px;
  --reveal-dur: 600ms;
```

- [ ] **Step 5: Vérification visuelle rapide**

```bash
npx serve . -p 4173 &
# Ouvrir http://localhost:4173 — tout le texte doit être en Archivo (plus aucun mono),
# corps lisible à 16px, pas de FOUT prolongé.
```

- [ ] **Step 6: Commit**

```bash
git add tokens.css
git commit -m "feat(tokens): single Archivo family, 16px body scale, motion tokens"
```

---

### Task 4: Système de motion — scroll-driven + fallback IO + reduced-motion

**Files:**
- Modify: `site.css` (remplacer le bloc `.reveal` existant)
- Modify: `site.js` (lignes 17–34, bloc « Reveal on scroll »)

- [ ] **Step 1: Remplacer le CSS `.reveal` par le système complet**

Localiser le bloc `.reveal` dans site.css et le remplacer par :

```css
/* =========================================================
   MOTION — révélation au scroll
   Priorité : CSS scroll-driven. Fallback : IntersectionObserver (site.js).
   prefers-reduced-motion coupe tout.
   ========================================================= */
.reveal { opacity: 1; }

@media (prefers-reduced-motion: no-preference) {
  /* Fallback IO : état initial caché, .is-visible révèle */
  .js-reveal .reveal {
    opacity: 0;
    transform: translateY(var(--reveal-distance));
    transition: opacity var(--reveal-dur) var(--ease-out),
                transform var(--reveal-dur) var(--ease-out);
  }
  .js-reveal .reveal.is-visible { opacity: 1; transform: none; }
  .js-reveal .reveal.d1 { transition-delay: 90ms; }
  .js-reveal .reveal.d2 { transition-delay: 180ms; }
  .js-reveal .reveal.d3 { transition-delay: 270ms; }

  /* Scroll-driven natif : prend le dessus quand supporté */
  @supports (animation-timeline: view()) {
    .reveal, .js-reveal .reveal {
      opacity: 1; transform: none; transition: none;
      animation: btm-reveal both;
      animation-timeline: view();
      animation-range: entry 0% entry 45%;
    }
    @keyframes btm-reveal {
      from { opacity: 0; transform: translateY(var(--reveal-distance)); }
      to   { opacity: 1; transform: none; }
    }
    /* Parallaxe léger — blocs géométriques décoratifs uniquement */
    .parallax {
      animation: btm-parallax linear both;
      animation-timeline: view();
      animation-range: cover 0% cover 100%;
    }
    @keyframes btm-parallax {
      from { transform: translateY(32px); }
      to   { transform: translateY(-32px); }
    }
  }
}
```

- [ ] **Step 2: Adapter site.js — n'activer l'IO que si scroll-driven non supporté**

Remplacer le bloc « Reveal on scroll » (lignes 17–34) par :

```js
  // ---- Reveal on scroll (fallback si pas de scroll-driven CSS) ----
  const supportsScrollTimeline = CSS.supports('animation-timeline: view()');
  const targets = document.querySelectorAll('.reveal');
  if (!supportsScrollTimeline && 'IntersectionObserver' in window && targets.length) {
    document.documentElement.classList.add('js-reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach((t) => io.observe(t));
  }
```

(Note : la classe `js-reveal` est posée sur `<html>` par JS — sans JS, aucun masquage, contenu toujours visible.)

- [ ] **Step 3: Séquence d'entrée du hero (CSS pur, au chargement)**

Ajouter à site.css, sous le bloc motion :

```css
/* Séquence d'entrée hero — cascade au chargement, page d'accueil */
@media (prefers-reduced-motion: no-preference) {
  .hero .seq {
    opacity: 0;
    transform: translateY(20px);
    animation: btm-enter 700ms var(--ease-out) forwards;
  }
  .hero .seq-1 { animation-delay: 80ms; }
  .hero .seq-2 { animation-delay: 220ms; }
  .hero .seq-3 { animation-delay: 360ms; }
  .hero .seq-4 { animation-delay: 500ms; }
  @keyframes btm-enter {
    to { opacity: 1; transform: none; }
  }
}
```

- [ ] **Step 4: Vérifier les trois modes**

Avec `npx serve . -p 4173` actif :
1. Chrome récent (scroll-driven) : reveals pilotés par le scroll, parallaxe active.
2. DevTools → Rendering → « prefers-reduced-motion: reduce » : aucun mouvement, tout visible.
3. Console : `CSS.supports('animation-timeline: view()')` → si false (Safari), vérifier fallback IO.

- [ ] **Step 5: Commit**

```bash
git add site.css site.js
git commit -m "feat(motion): CSS scroll-driven reveals with IO fallback, hero entrance, reduced-motion"
```

---

### Task 5: Heads HTML — preload fonts, schema AutoBodyShop, nettoyage meta

**Files:**
- Modify: `index.html`, `services/index.html`, `assureurs/index.html`, `a-propos/index.html`, `contact/index.html` (sections `<head>` uniquement)

- [ ] **Step 1: Sur les 5 pages, ajouter le preload de la font AVANT les feuilles de style**

```html
<link rel="preload" href="/fonts/archivo-vf.woff2" as="font" type="font/woff2" crossorigin/>
```

(Pas de preload de l'italique — usage marginal, swap suffit.)

- [ ] **Step 2: Sur les 5 pages, supprimer la meta keywords**

Supprimer la ligne `<meta name="keywords" .../>` (obsolète, signal nul).

- [ ] **Step 3: Schema — `AutoRepair` → `AutoBodyShop` sur les 5 pages**

Dans chaque JSON-LD : `"@type": "AutoRepair"` → `"@type": "AutoBodyShop"`. Vérifier sur chaque page : noms exacts (Timothé Dauzat, Grégoire Bodin), **aucune** propriété `address`/`streetAddress`, `areaServed` conservé, description avec « début 2027 ».

- [ ] **Step 4: Références og-image — pointer vers le futur PNG**

Sur les 5 pages : `images/og-btm.jpg` → `images/og-btm.png` (le fichier est créé en Task 11).

- [ ] **Step 5: Vérification**

```bash
grep -rn "AutoRepair\|keywords\|og-btm.jpg" --include="*.html" . | grep -v node_modules | grep -v docs/
# attendu : aucun résultat
grep -c "preload" index.html services/index.html assureurs/index.html a-propos/index.html contact/index.html
# attendu : 1 par page
```

- [ ] **Step 6: Commit**

```bash
git add index.html services/index.html assureurs/index.html a-propos/index.html contact/index.html
git commit -m "feat(seo): font preload, AutoBodyShop schema, drop keywords meta"
```

---

### Task 6: Accueil — hero orchestré + recomposition

**Files:**
- Modify: `index.html` (body), `site.css`

Texte conservé à l'identique. Changements structurels :

- [ ] **Step 1: Hero — poser les classes de séquence**

Sur les enfants directs du hero, dans l'ordre d'apparition : méta-row → `class="seq seq-1"`, H1 → `seq seq-2`, lead + actions → `seq seq-3`, pillars → `seq seq-4`. Retirer les classes `reveal`/`d1`/`d2` du hero uniquement (le hero s'anime au chargement, pas au scroll). Supprimer le `<div style="height: 64px;"></div>` (spacer inline) au profit d'un margin dans site.css.

- [ ] **Step 2: Hero — élément signature**

Un seul élément rouge sur cet écran : le mot `indépendante.` du H1 (classe `terra` existante). Ajouter un bloc géométrique décoratif noir (`.btm-block--ink.parallax`, `aria-hidden="true"`) dans la colonne droite du hero-grid, au-dessus du lead. Vérifier qu'aucun autre élément rouge n'est visible au-dessus de la ligne de flottaison.

- [ ] **Step 3: Bande process « Pourquoi BTM » (on-ink) — typographie massive**

Section `#pourquoi-h` : monter le H2 à `--fs-h1`, numéros des items en `--fs-h2` graisse 200 (Archivo léger — contraste de graisse, signature Bauhaus). CSS :

```css
.band.on-ink .pillar .num,
.band.on-ink .why-item .num {
  font-size: var(--fs-h2);
  font-weight: 200;
  color: var(--accent);
  line-height: 1;
}
```

(Adapter le sélecteur aux classes réelles de la section.)

- [ ] **Step 4: Grille services asymétrique**

Section `#services-h` : passer les cartes sur la grille 12 colonnes avec décalages alternés (carte 1 : col 1–6, carte 2 : col 7–12 avec `margin-top`, etc. — composition asymétrique maîtrisée). Mobile : pile simple. Toucher uniquement le CSS + classes, pas le texte.

- [ ] **Step 5: Sections témoignages / assureurs / localisation — restyle léger**

Garder le contenu exact (la section avis affiche la mention pré-ouverture validée — ne pas y toucher). Sortir les styles inline repérés (`index.html:281–282` : `style="max-width: 56ch;"` et le style inline du lien `.more`) vers des classes site.css. La fausse carte `.map` existante (grille + pin « Secteur BAB · adresse à confirmer ») est conforme — restyle géométrique seulement.

- [ ] **Step 6: Vérification visuelle + contenu**

Avec serve actif : séquence hero fluide au chargement, un seul élément rouge par écran en scrollant, 360 px sans débordement horizontal (DevTools responsive).

```bash
grep -n "style=" index.html | grep -v "left: -9999px"
# attendu : 0 styles inline restants (hors hack visually-hidden)
```

- [ ] **Step 7: Commit**

```bash
git add index.html site.css
git commit -m "feat(home): orchestrated hero sequence, asymmetric services grid, inline style cleanup"
```

---

### Task 7: Services — sommaire ancré + compositions alternées 01–05

**Files:**
- Modify: `services/index.html`, `site.css`

Les 5 sections existent (`#sinistre`, `#peinture`, `#debosselage`, `#pare-chocs`, `#assureur`). Texte conservé.

- [ ] **Step 1: Sommaire ancré sous le page-head**

Ajouter après la section `.page-head` :

```html
<nav class="toc" aria-label="Sommaire des prestations">
  <ol>
    <li><a href="#sinistre"><span class="num">01 /</span> Réparation après sinistre</a></li>
    <li><a href="#peinture"><span class="num">02 /</span> Peinture automobile</a></li>
    <li><a href="#debosselage"><span class="num">03 /</span> Débosselage</a></li>
    <li><a href="#pare-chocs"><span class="num">04 /</span> Pare-chocs et plastiques</a></li>
    <li><a href="#assureur"><span class="num">05 /</span> Dossier assureur</a></li>
  </ol>
</nav>
```

CSS : liste horizontale à filets (hairline top/bottom), uppercase micro, `.num` en `--accent`, wrap en colonne sous 720 px. `html { scroll-behavior: smooth; }` derrière `@media (prefers-reduced-motion: no-preference)` + `scroll-margin-top` sur les sections ancrées.

- [ ] **Step 2: Compositions alternées**

Sections impaires (01, 03, 05) : titre massif colonne gauche (col 1–5), contenu droite. Sections paires (02, 04) : miroir. Numéro de section en `--fs-mega` graisse 200, posé en arrière-plan décoratif (`aria-hidden="true"`, `position: absolute`, couleur `--btm-sand` sur crème / `--btm-rule-inv` sur noir). Le numéro de la méta-row reste le seul élément rouge.

- [ ] **Step 3: Vérification**

Serve : ancres fonctionnelles au clavier (tab → enter), compositions alternées visibles, 360 px OK, aucun texte modifié :

```bash
git diff services/index.html | grep "^-" | grep -v "^---" | grep -iv "class\|div\|section\|nav\|span\|style\|<\|/"
# attendu : aucune ligne de texte supprimée
```

- [ ] **Step 4: Commit**

```bash
git add services/index.html site.css
git commit -m "feat(services): anchored TOC, alternating 01-05 compositions, mega section numbers"
```

---

### Task 8: Assureurs — timeline constructiviste + accordéons FAQ

**Files:**
- Modify: `assureurs/index.html`, `site.css`, `site.js`

- [ ] **Step 1: Timeline verticale des 5 étapes**

Restructurer la section « parcours sinistre » existante (texte des étapes inchangé — c'est le processus validé du CLAUDE.md §4.1) en :

```html
<ol class="timeline">
  <li class="timeline-step reveal">
    <span class="timeline-marker" aria-hidden="true"></span>
    <div class="timeline-body">
      <span class="btm-label">Étape 01</span>
      <h3>…titre existant…</h3>
      <p>…texte existant…</p>
    </div>
  </li>
  <!-- ×5 -->
</ol>
```

CSS : ligne verticale continue (`::before` sur `.timeline`, 1px ink), cercles aux jalons (`.timeline-marker` : 12px, border ink, fond crème ; étape active/première : fond `--accent` — unique rouge de l'écran). Desktop : alternance gauche/droite des corps autour de la ligne centrale ; mobile : ligne à gauche, corps à droite.

- [ ] **Step 2: FAQ en accordéons natifs**

Convertir chaque item FAQ en `<details>/<summary>` (accessible nativement au clavier) :

```html
<details class="faq-item">
  <summary><h3>…question existante…</h3><span class="faq-icon" aria-hidden="true">+</span></summary>
  <div class="faq-body"><p>…réponse existante…</p></div>
</details>
```

CSS : hairline entre items, `summary` en H4, icône `+` pivotée à 45° quand `[open]` (transition `transform` uniquement), `summary { list-style: none }` + `::-webkit-details-marker { display: none }`. Pas de JS nécessaire.

- [ ] **Step 3: Vérification**

Serve : timeline lisible aux 3 largeurs (desktop / 768 / 360), accordéons opérables au clavier (tab + enter), textes des étapes et FAQ strictement identiques (`git diff` comme en Task 7 Step 3).

- [ ] **Step 4: Commit**

```bash
git add assureurs/index.html site.css
git commit -m "feat(assureurs): constructivist vertical timeline, native details FAQ accordions"
```

---

### Task 9: À propos — monogrammes TD / GB + valeurs en méta-rows

**Files:**
- Modify: `a-propos/index.html`, `site.css`

- [ ] **Step 1: Portraits typographiques**

Remplacer le contenu des `.portrait` placeholders (les `aria-label` existants sont conservés) par des monogrammes géométriques :

```html
<div class="portrait portrait--mono" aria-label="Portrait de Timothé Dauzat, chef d'atelier BTM Carrosserie (placeholder)">
  <span class="mono-initials" aria-hidden="true">TD</span>
  <span class="mono-shape" aria-hidden="true"></span>
</div>
```

CSS : carré plein ink, initiales Archivo 900 en crème à `--fs-h1`, une forme géométrique par fondateur en `--accent` (Timothé : cercle — atelier/peinture ; Grégoire : bloc — gestion/structure), positionnée en débord du coin. C'est l'unique rouge de l'écran.

- [ ] **Step 2: Valeurs en méta-rows**

Section `#valeurs-h` (« Trois choses non négociables ») : chaque valeur ouvre par une méta-row (`01 /` rouge + hairline), titre H3 massif, paragraphe existant.

- [ ] **Step 3: Bios et engagement — restyle seulement**

Sections fondateurs, atelier (`#atelier-h`), engagement (`#engagement-h` — copywriting protégé CLAUDE.md §7) : aucune modification de texte. Sortir le style inline du H2 engagement (`a-propos/index.html:233`) vers une classe site.css. Supprimer le `style="position: absolute; left: -9999px;"` inline (ligne 105) au profit d'une classe utilitaire `.visually-hidden` dans site.css :

```css
.visually-hidden {
  position: absolute; width: 1px; height: 1px;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap;
}
```

- [ ] **Step 4: Vérification**

Serve : monogrammes nets aux 3 largeurs, noms « Timothé Dauzat » / « Grégoire Bodin » partout :

```bash
grep -rn "Maréchal" . --include="*.html" | grep -v node_modules
# attendu : aucun résultat
```

- [ ] **Step 5: Commit**

```bash
git add a-propos/index.html site.css
git commit -m "feat(about): TD/GB geometric monogram portraits, meta-row values, visually-hidden utility"
```

---

### Task 10: Contact — formulaire à filets + zone d'intervention

**Files:**
- Modify: `contact/index.html`, `site.css`

- [ ] **Step 1: Formulaire à filets nets**

Restyle des champs : pas de boîtes — `border: 0; border-bottom: var(--hairline-ink);`, labels uppercase micro au-dessus, focus : `border-bottom: 2px solid var(--accent); outline: none;` MAIS conserver un focus visible au clavier ailleurs (`:focus-visible { outline: 2px solid var(--btm-ink); outline-offset: 2px; }` sur boutons/liens — règle globale site.css). Champs et validation JS existants inchangés (mêmes `name`, `data-required`).

- [ ] **Step 2: Zone d'intervention en composition texte**

La section coordonnées garde ses placeholders exacts (téléphone `+33 5 59 00 00 00`, TODO adresse). Composer la zone d'intervention en bloc typographique : « Bayonne · Biarritz · Anglet » en `--fs-h2`, « Pays Basque » en méta. Pas d'embed map.

- [ ] **Step 3: Vérification**

Serve : soumission vide → erreurs visibles + focus sur premier champ en erreur ; soumission valide → message succès. Navigation clavier complète. Placeholders intacts :

```bash
grep -rn "+33 5 59 00 00 00" contact/index.html   # attendu : présent
grep -rn "TODO" contact/index.html                  # attendu : TODO adresse présent
```

- [ ] **Step 4: Commit**

```bash
git add contact/index.html site.css
git commit -m "feat(contact): hairline form fields, typographic service-area block, global focus-visible"
```

---

### Task 11: OG image statique

**Files:**
- Create: `images/og-btm.png` (1200×630), `images/og-src.html` (source, exclue du déploiement via `.assetsignore`)

- [ ] **Step 1: Créer le template HTML**

`images/og-src.html` — composition DA : fond crème `#F4EEDD`, « BTM » Archivo 900 massif ink avec le « M » en `#B14A2A`, méta-row « Carrosserie indépendante — Pays Basque · début 2027 », hairline. Police via `/fonts/archivo-vf.woff2`. Body exactement 1200×630, margin 0.

- [ ] **Step 2: Screenshot 1200×630**

Avec `npx serve . -p 4173` actif, utiliser agent-browser :

```bash
agent-browser open "http://localhost:4173/images/og-src.html" --viewport 1200x630
agent-browser screenshot images/og-btm.png
```

(Fallback si agent-browser indisponible : `npx -y playwright@latest screenshot --viewport-size=1200,630 "http://localhost:4173/images/og-src.html" images/og-btm.png`.)

- [ ] **Step 3: Vérifier et exclure la source du déploiement**

```bash
file images/og-btm.png        # attendu : PNG image data, 1200 x 630
echo "images/og-src.html" >> .assetsignore
```

- [ ] **Step 4: Commit**

```bash
git add images/ .assetsignore
git commit -m "feat(seo): static OG image 1200x630 in brand DA"
```

---

### Task 12: sitemap, robots, cohérence canonical

**Files:**
- Modify: `sitemap.xml`
- Verify: `robots.txt`, canonicals des 5 pages

- [ ] **Step 1: Harmoniser les URLs avec slash final + lastmod**

Les canonicals utilisent `…/services/` (avec slash). Mettre le sitemap en cohérence : `https://btm-carrosserie.fr/services/` etc. (slash final sur les 4 sous-pages), `lastmod` → date du jour pour les 5 entrées.

- [ ] **Step 2: Vérifier la cohérence canonical ↔ sitemap**

```bash
grep -h "canonical" index.html */index.html
grep "<loc>" sitemap.xml
# attendu : 5 URLs identiques deux à deux (même slash final)
```

- [ ] **Step 3: Commit**

```bash
git add sitemap.xml
git commit -m "fix(seo): sitemap trailing slashes aligned with canonicals, bump lastmod"
```

---

### Task 13: Accessibilité — passe contrastes + clavier

**Files:**
- Modify: `site.css` (corrections issues de la passe)

- [ ] **Step 1: Vérifier le ratio terracotta/crème**

`#B14A2A` sur `#F4EEDD` ≈ 4.5:1 (limite AA texte normal). Règle : terracotta autorisé pour texte ≥ 18.5px bold / ≥ 24px normal et éléments graphiques ; pour tout texte courant rouge (`.num` micro des méta-rows), vérifier au cas par cas — si < AA, passer ces numéros en graisse 700 ou taille 14px+. Outil :

```bash
npx -y wcag-contrast-cli "#B14A2A" "#F4EEDD" 2>/dev/null || echo "vérifier manuellement sur webaim.org/resources/contrastchecker"
```

- [ ] **Step 2: Audit clavier complet**

Sur chaque page avec serve : tab traverse nav (y compris toggle mobile avec `aria-expanded` mis à jour par site.js — l'ajouter si manquant), liens, accordéons, formulaire, modal (fermeture par Échap — ajouter le handler keydown dans site.js si absent :

```js
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        modal.classList.remove('is-open');
        sessionStorage.setItem('btm-modal-seen', '1');
      }
    });
```

). Focus visible partout via la règle `:focus-visible` globale de Task 10.

- [ ] **Step 3: Commit**

```bash
git add site.css site.js
git commit -m "fix(a11y): contrast-safe accent text, Escape closes modal, aria-expanded sync"
```

---

### Task 14: Lighthouse ≥ 90 ×4, mobile et desktop

**Files:** corrections éventuelles selon résultats

- [ ] **Step 1: Lancer Lighthouse sur les 5 pages**

```bash
npx serve . -p 4173 &
for p in "" "services/" "assureurs/" "a-propos/" "contact/"; do
  npx -y lighthouse "http://localhost:4173/$p" --quiet --chrome-flags="--headless=new" \
    --only-categories=performance,accessibility,best-practices,seo \
    --output=json --output-path="/tmp/lh-${p%/}.json" 2>/dev/null
  node -e "const r=require('/tmp/lh-${p%/}.json').categories; console.log('$p', Object.entries(r).map(([k,v])=>k+':'+Math.round(v.score*100)).join(' '))"
done
# attendu : tous les scores ≥ 90 (mode mobile par défaut)
npx -y lighthouse "http://localhost:4173/" --preset=desktop --quiet --chrome-flags="--headless=new" \
  --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=/tmp/lh-desktop.json
```

- [ ] **Step 2: Corriger les findings et relancer jusqu'à ≥ 90 partout**

Corrections types attendues : dimensions explicites, ordre de chargement CSS, contrastes signalés. Si le LCP du hero est pénalisé par le CSS externe, inliner le CSS critique du hero (tokens nécessaires + styles hero) dans un `<style>` du `<head>` de index.html uniquement.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "perf: lighthouse fixes to reach >=90 on all four axes"
```

---

### Task 15: CLAUDE.md + vérification finale de conformité

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Mettre à jour CLAUDE.md**

Ajouter/mettre à jour une section « Design system (refonte juin 2026) » : Archivo Variable self-hosted unique (`--font-mono` = alias compat), corps 16px, terracotta `#B14A2A` confirmé comme accent unique (1 élément/écran), système motion (scroll-driven + fallback IO + reduced-motion), nav/footer dupliqués dans les 5 HTML (toute modif × 5), schema `AutoBodyShop` sans adresse, og-image générée depuis `images/og-src.html`.

- [ ] **Step 2: Checklist de conformité finale**

```bash
# Formulations interdites (CLAUDE.md §4)
grep -rin "prenons en charge la déclaration\|de A à Z\|ouvrons le dossier\|référencé chez les principaux\|agréée MAIF" --include="*.html" . | grep -v node_modules
# attendu : rien
# Dates
grep -rin "début 2027" --include="*.html" . | grep -v node_modules | wc -l   # attendu : > 0
grep -rin "courant 2027\|fin 2027\|2026" --include="*.html" . | grep -v node_modules | grep -vi "copyright\|©"
# attendu : rien (hors copyright éventuel)
# Noms
grep -rn "Maréchal" --include="*.html" . | grep -v node_modules            # attendu : rien
grep -rln "Timothé Dauzat" --include="*.html" . | grep -v node_modules     # attendu : pages concernées
# Schema sans adresse
grep -rn '"address"\|streetAddress' --include="*.html" . | grep -v node_modules   # attendu : rien
# Placeholders intacts
grep -rn "+33 5 59 00 00 00" --include="*.html" . | grep -v node_modules | wc -l  # attendu : > 0
# Pas de Google Fonts runtime
grep -rn "googleapis\|gstatic" --include="*.html" --include="*.css" . | grep -v node_modules  # attendu : rien
```

- [ ] **Step 3: Vérification redirection .com (hors repo, simple contrôle)**

```bash
curl -sI https://btm-carrosserie.com | head -3   # attendu : 301 → https://btm-carrosserie.fr/
```

(Si KO : signaler à l'utilisateur, config DNS/Railway hors périmètre du repo.)

- [ ] **Step 4: Commit final**

```bash
git add CLAUDE.md
git commit -m "docs: record design system decisions in CLAUDE.md"
```
