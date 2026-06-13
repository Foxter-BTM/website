# BTM Carrosserie — Mise en conformité pré-ouverture

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mettre le site en conformité avec la réalité du projet — retirer les fausses données, nuancer la partie assureurs, rendre explicite le statut pré-ouverture sur les 5 pages.

**Architecture:** Le site est en HTML/CSS/JS vanilla sans framework ni include partagé — chaque page est autonome. Les nouveaux composants partagés (bandeau, modal) sont ajoutés à site.css et site.js puis leur HTML est copié dans chacune des 5 pages. Les corrections de contenu sont faites fichier par fichier.

**Tech Stack:** HTML5 statique, CSS custom properties (tokens.css + site.css), vanilla JS (site.js). Pas de bundler, pas de npm.

**Source de vérité contenu :** `BTM-Carrosserie-Contenu-Site-corrige.md` à la racine du repo.

**Branche de travail :** créer `content/conformite-pre-ouverture` avant de commencer, ne pas push sans feu vert.

---

## Fichiers modifiés

| Fichier | Nature des changements |
|---|---|
| `site.css` | Ajout : `.preopen-banner`, `#preopen-modal`, `.btn--disabled` |
| `site.js` | Ajout : logique modal (sessionStorage) |
| `index.html` | Copie hero/assureurs/localisation/CTA + Schema.org + footer |
| `services/index.html` | Copie CTA + section 05 dossier assureur + footer |
| `assureurs/index.html` | Copie eyebrow/partenaires/FAQ Q3/CTA + Schema FAQ + footer |
| `a-propos/index.html` | Copie fondateurs/atelier/CTA + Schema.org + footer |
| `contact/index.html` | Copie H1/lead/formulaire/info-side/section map + Schema.org + footer |

---

## Task 1 — Branche Git

**Files:** repo git

- [ ] **Créer la branche de travail**

```bash
git checkout -b content/conformite-pre-ouverture
```

Expected : prompt qui confirme la branche créée.

---

## Task 2 — site.css : nouveaux composants partagés

**Files:**
- Modify: `site.css` (append à la fin)

Ajouter trois blocs CSS à la fin de `site.css`, après le bloc `/* FLAGS ÉDITORIAUX */`.

- [ ] **Ajouter le CSS du bandeau pré-ouverture**

Appender ce bloc à la fin de site.css :

```css
/* ----- Bandeau pré-ouverture -------------------------------- */
.preopen-banner {
  background: var(--btm-ink);
  color: var(--btm-bone);
  padding: 10px var(--s-7);
  text-align: center;
  font-family: var(--font-mono);
  font-size: var(--fs-micro);
  letter-spacing: var(--trk-wide);
  text-transform: uppercase;
  border-bottom: 1px solid var(--btm-rule-inv);
  position: relative;
  z-index: 49;
}
.preopen-banner strong { color: var(--accent); }
@media (max-width: 720px) {
  .preopen-banner { padding: 10px var(--s-5); }
}
```

- [ ] **Ajouter le CSS du modal pré-ouverture**

Appender ce bloc à la fin de site.css :

```css
/* ----- Modal pré-ouverture --------------------------------- */
#preopen-modal {
  display: none;
  position: fixed; inset: 0; z-index: 9000;
  background: rgba(14,14,12,0.72);
  align-items: center; justify-content: center;
  padding: var(--s-5);
}
#preopen-modal.is-open { display: flex; }
#preopen-modal .modal-box {
  background: var(--btm-paper);
  border: 1px solid var(--btm-ink);
  max-width: 540px; width: 100%;
  padding: var(--s-8) var(--s-7);
  display: grid; gap: var(--s-5);
}
#preopen-modal .modal-eyebrow {
  font-family: var(--font-mono); font-size: var(--fs-micro);
  letter-spacing: var(--trk-wide); text-transform: uppercase;
  color: var(--accent);
}
#preopen-modal h2 {
  font-family: var(--font-display); font-weight: 900;
  font-size: clamp(28px, 4vw, 40px); line-height: 1.05;
  letter-spacing: -0.015em; margin: 0;
}
#preopen-modal p {
  font-family: var(--font-mono); font-size: 14px; line-height: 1.75;
  color: var(--btm-graphite); max-width: 52ch;
}
#preopen-modal .modal-actions {
  display: flex; gap: var(--s-4); flex-wrap: wrap;
  margin-top: var(--s-3);
}
@media (max-width: 520px) {
  #preopen-modal .modal-box { padding: var(--s-6) var(--s-5); }
  #preopen-modal .modal-actions { flex-direction: column; }
}
```

- [ ] **Ajouter le CSS du bouton désactivé**

Appender ce bloc à la fin de site.css :

```css
/* ----- Bouton désactivé (pré-ouverture) --------------------- */
.btn--disabled,
.btn[disabled] {
  background: var(--btm-rule);
  border-color: var(--btm-rule);
  color: var(--btm-stone);
  cursor: not-allowed;
  opacity: 0.7;
  pointer-events: none;
}
.cta-band .btn--disabled,
.cta-band .btn[disabled] {
  background: rgba(244,238,221,0.3);
  border-color: rgba(244,238,221,0.3);
  color: rgba(244,238,221,0.5);
}
```

- [ ] **Commit Task 2**

```bash
git add site.css
git commit -m "style: add preopen banner, modal, and disabled button CSS"
```

---

## Task 3 — site.js : logique modal

**Files:**
- Modify: `site.js`

Ajouter le bloc modal **avant** la dernière ligne `})();` du fichier.

- [ ] **Ajouter la logique modal dans site.js**

Localiser la ligne `})();` (dernière ligne) et insérer avant elle :

```js
  // ---- Modal pré-ouverture (une fois par session) ----------
  const modal = document.querySelector('#preopen-modal');
  if (modal && !sessionStorage.getItem('btm-modal-seen')) {
    modal.classList.add('is-open');
    modal.querySelector('.modal-close')?.addEventListener('click', () => {
      modal.classList.remove('is-open');
      sessionStorage.setItem('btm-modal-seen', '1');
    });
    modal.querySelector('.modal-contact')?.addEventListener('click', () => {
      modal.classList.remove('is-open');
      sessionStorage.setItem('btm-modal-seen', '1');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('is-open');
        sessionStorage.setItem('btm-modal-seen', '1');
      }
    });
  }
```

- [ ] **Commit Task 3**

```bash
git add site.js
git commit -m "feat: add pre-opening modal with sessionStorage guard"
```

---

## Task 4 — Accueil `index.html`

**Files:**
- Modify: `index.html`

Appliquer les changements dans l'ordre suivant :

### 4.1 — Schema.org

- [ ] **Retirer address, geo, openingHours du JSON-LD ; mettre telephone en placeholder**

Remplacer le bloc JSON-LD `<script type="application/ld+json">` par :

```json
{
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  "name": "BTM Carrosserie",
  "description": "Carrosserie indépendante spécialisée en réparation sinistres, peinture automobile et débosselage. Secteur Bayonne · Biarritz · Anglet — Pays Basque. Ouverture début 2027.",
  "url": "https://btm-carrosserie.fr",
  "image": "https://btm-carrosserie.fr/images/og-btm.jpg",
  "logo": "https://btm-carrosserie.fr/images/logo-btm.svg",
  "areaServed": ["Bayonne", "Biarritz", "Anglet", "Pays Basque", "Landes"],
  "priceRange": "€€",
  "sameAs": []
}
```

### 4.2 — Bandeau pré-ouverture

- [ ] **Ajouter le bandeau après `</header>`**

Insérer immédiatement après la balise `</header>` (ligne ~104) :

```html
<div class="preopen-banner" role="note">
  <strong>Ouverture prévue début 2027</strong> · Ce site présente notre futur atelier.
</div>
```

### 4.3 — Hero

- [ ] **Corriger la date dans l'`<em>` du H1**

Remplacer :
```
<em>Atelier · ouverture mars 2027</em>
```
Par :
```
<em>Atelier · ouverture prévue début 2027</em>
```

- [ ] **Mettre à jour le lead du hero**

Remplacer :
```
Nous réparons les voitures abîmées, accompagnons le dossier assureur de bout en bout et restituons un véhicule fini avec le soin d'un atelier d'artisan. Pas de franchise, pas de promesse vide. Un travail bien fait, et un client tenu informé.
```
Par :
```
Nous réparons les voitures abîmées, gérons tout le volet technique de votre dossier assureur et restituons un véhicule fini avec le soin d'un atelier d'artisan. Pas d'enseigne franchisée, pas de promesse vide : un travail bien fait, et un client tenu informé.
```

- [ ] **Désactiver le CTA "Demander un devis" du hero, ajouter "Poser une question"**

Remplacer le bloc `.actions` du hero :
```html
<div class="actions">
  <a href="contact/" class="btn">Demander un devis <span class="arrow">→</span></a>
  <a href="services/" class="btn btn--ghost">Voir nos services</a>
</div>
```
Par :
```html
<div class="actions">
  <span class="btn btn--disabled" aria-disabled="true">Demande de devis — indisponible pour le moment</span>
  <a href="contact/" class="btn btn--ghost">Poser une question <span class="arrow">→</span></a>
</div>
```

### 4.4 — Section "Pourquoi BTM" (reason 02)

- [ ] **Retirer "dix ans d'atelier" de la reason 02**

Remplacer :
```
Timothé est carrossier de métier, BTS Carrosserie, dix ans d'atelier. Chaque dossier est validé techniquement avant d'entrer en cabine.
```
Par :
```
Timothé est carrossier-peintre de métier, BTS Carrosserie. Chaque dossier est validé techniquement avant d'entrer en cabine.
```

- [ ] **Corriger la reason 04 (retirer "Anglet")**

Remplacer :
```
Pas de plateau central à 400 km. Atelier basé à Anglet, restitution chez nous, et un appel direct quand vous avez une question.
```
Par :
```
Pas de plateau central à 400 km. Atelier au Pays Basque, restitution chez nous, et un interlocuteur direct quand vous avez une question.
```

### 4.5 — Section assureurs (05)

- [ ] **Remplacer la section assureurs entière**

Remplacer depuis `<section class="band" aria-labelledby="assureurs-h">` jusqu'à la `</section>` correspondante par :

```html
<!-- =====================================================
     ASSUREURS — Libre choix
====================================================== -->
<section class="band" aria-labelledby="assureurs-h">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="meta-row">
        <span><span class="num">05 /</span> Assureurs</span>
        <span class="right">Liberté de choix garantie par la loi</span>
      </div>
      <h2 id="assureurs-h">Quel que soit<br/>votre assureur.</h2>
      <p class="lead">BTM n'est pas un réparateur agréé d'un réseau d'assureurs — et c'est sans incidence pour vous. La loi vous garantit le libre choix de votre réparateur (article L211-5-1 du Code des assurances) : votre assureur peut recommander un garage partenaire, il ne peut pas vous l'imposer.</p>
    </div>

    <div style="margin-top: var(--s-6); display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 16px;">
      <p class="btm-small" style="max-width: 56ch;">Votre assureur n'est pas un partenaire agréé de BTM ? Aucune importance : nous gérons votre dossier de la même façon, et vous restez libre de votre choix.</p>
      <a href="assureurs/" class="more" style="font-family: var(--font-mono); font-size: 11px; letter-spacing: var(--trk-wide); text-transform: uppercase; border-bottom: 1px solid var(--btm-ink); padding-bottom: 4px;">Comment ça marche <span>→</span></a>
    </div>
  </div>
</section>
```

### 4.6 — Section localisation (06)

- [ ] **Remplacer la section localisation entière**

Remplacer depuis `<section class="band bone btm-flag" data-flag="LOCAL NON SIGNÉ...">` jusqu'à la `</section>` correspondante par :

```html
<!-- =====================================================
     LOCALISATION
====================================================== -->
<section class="band bone" aria-labelledby="localisation-h">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="meta-row">
        <span><span class="num">06 /</span> Atelier</span>
        <span class="right">Secteur Bayonne · Biarritz · Anglet</span>
      </div>
      <h2 id="localisation-h">Au cœur<br/>du Pays Basque.</h2>
      <p class="lead">L'atelier ouvrira début 2027 au Pays Basque, dans le secteur Bayonne · Biarritz · Anglet. L'adresse exacte sera communiquée à la signature du local.</p>
    </div>

    <div class="localisation reveal">
      <div class="info">
        <dl>
          <dt>Adresse</dt>
          <dd>
            <b>BTM Carrosserie</b><br/>
            Secteur Bayonne · Biarritz · Anglet<br/>
            Pays Basque — adresse communiquée à la signature du local
          </dd>

          <dt>Téléphone</dt>
          <dd>+33 00 00 00 00 00 <span style="font-size: 11px; color: var(--btm-stone);">(ligne active à l'ouverture)</span></dd>

          <dt>Email</dt>
          <dd><a href="mailto:contact@btm-carrosserie.fr" class="text-link">contact@btm-carrosserie.fr</a></dd>

          <dt>Horaires</dt>
          <dd>
            Horaires prévus à l'ouverture :<br/>
            Lun → Ven · 08 h → 18 h | Samedi · 09 h → 12 h
          </dd>

          <dt>Zone</dt>
          <dd>Bayonne · Biarritz · Anglet · Saint-Jean-de-Luz · Hendaye · Sud Landes</dd>
        </dl>

        <div style="display: flex; gap: 16px; margin-top: 16px; flex-wrap: wrap;">
          <a href="contact/" class="btn">Poser une question <span class="arrow">→</span></a>
        </div>
      </div>

      <div class="map" aria-label="Carte de localisation — adresse en cours de finalisation" role="img">
        <div class="grid-lines" aria-hidden="true"></div>
        <div class="pin" aria-hidden="true">
          <div class="dot"></div>
          <div class="label">BTM · Pays Basque</div>
        </div>
        <div class="coords" aria-hidden="true">Secteur BAB · adresse à confirmer</div>
      </div>
    </div>
  </div>
</section>
```

### 4.7 — CTA band (07)

- [ ] **Mettre à jour le CTA band final**

Remplacer le bloc `<div class="reveal d1">` dans le cta-band :
```html
<p class="lead">Quelques photos, le contexte du sinistre s'il y a lieu, et nous revenons sous 24 heures avec un premier avis et la marche à suivre. Aucun engagement avant le devis détaillé.</p>
<div class="actions">
  <a href="contact/" class="btn">Demander un devis <span class="arrow">→</span></a>
  <a href="tel:+33559000000" class="btn btn--ghost">Appeler · +33 5 59 00 00 00</a>
</div>
```
Par :
```html
<p class="lead">Quelques photos, le contexte du sinistre s'il y a lieu, et nous revenons vers vous. La prise de devis ouvrira avec l'atelier, début 2027 — en attendant, laissez-nous vos coordonnées pour être recontacté en priorité.</p>
<div class="actions">
  <span class="btn btn--disabled" aria-disabled="true">Demande de devis — indisponible pour le moment</span>
  <a href="contact/" class="btn btn--ghost">Poser une question <span class="arrow">→</span></a>
</div>
```

- [ ] **Mettre à jour la meta-row du CTA band**

Remplacer :
```
<span class="right">Réponse sous 24 h</span>
```
Par :
```
<span class="right">Réponse sous 24 à 48 h</span>
```

- [ ] **Mettre à jour le H2 du CTA band**

Remplacer :
```html
<h2 id="cta-h">Décrivez-nous<br/>votre voiture.</h2>
```
Par :
```html
<h2 id="cta-h">Une question<br/>sur votre véhicule ?</h2>
```

### 4.8 — Header CTA (nav)

- [ ] **Désactiver le CTA de navigation**

Remplacer dans le `<header>` :
```html
<a href="contact/" class="cta">Demander un devis <span class="arrow">→</span></a>
```
Par :
```html
<a href="contact/" class="cta">Poser une question <span class="arrow">→</span></a>
```

### 4.9 — Footer

- [ ] **Mettre à jour le footer (adresse + téléphone)**

Dans le footer `.col:first-child`, remplacer le contenu de `<div class="col">` (section Atelier) :
```html
<div class="col">
  <h4>Atelier</h4>
  <p class="btm-flag" data-flag="ADRESSE NON CONFIRMÉE">
    <b>BTM Carrosserie</b><br/>
    <!-- TODO: remplacer par adresse définitive -->
    Chemin de l'Industrie<br/>
    64600 Anglet<br/>
    Pays Basque · France
  </p>
  <p class="btm-flag btm-flag--warn" data-flag="TÉLÉPHONE PLACEHOLDER" style="margin-top: 16px;">
    <!-- TODO: remplacer par téléphone réel -->
    <a href="tel:+33559000000">+33 5 59 00 00 00</a><br/>
    <a href="mailto:contact@btm-carrosserie.fr">contact@btm-carrosserie.fr</a>
  </p>
</div>
```
Par :
```html
<div class="col">
  <h4>Atelier</h4>
  <p>
    <b>BTM Carrosserie</b><br/>
    Secteur Bayonne · Biarritz · Anglet<br/>
    Pays Basque · France<br/>
    <!-- TODO: remplacer par adresse définitive à la signature du local -->
  </p>
  <p style="margin-top: 16px;">
    +33 00 00 00 00 00 (ligne active à l'ouverture)<br/>
    <a href="mailto:contact@btm-carrosserie.fr">contact@btm-carrosserie.fr</a>
  </p>
</div>
```

### 4.10 — Modal

- [ ] **Ajouter le HTML modal avant `</body>`**

Insérer avant `</body>` :

```html
<!-- =====================================================
     MODAL PRÉ-OUVERTURE
====================================================== -->
<div id="preopen-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal-box">
    <div class="modal-eyebrow">Atelier en cours de création</div>
    <h2 id="modal-title">BTM Carrosserie<br/>ouvre début 2027</h2>
    <p>Notre atelier de carrosserie indépendant ouvrira ses portes au Pays Basque début 2027. Ce site présente notre futur atelier. Laissez-nous vos coordonnées pour être informé(e) de l'ouverture — et recontacté(e) en priorité.</p>
    <div class="modal-actions">
      <a href="contact/" class="btn modal-contact">Être informé de l'ouverture <span class="arrow">→</span></a>
      <button class="btn btn--ghost modal-close">Découvrir le site</button>
    </div>
  </div>
</div>
```

- [ ] **Commit Task 4**

```bash
git add index.html
git commit -m "content(home): pre-opening corrections — assurers, location, CTAs, schema"
```

---

## Task 5 — Services `services/index.html`

**Files:**
- Modify: `services/index.html`

### 5.1 — Bandeau + modal

- [ ] **Ajouter le bandeau après `</header>`**

```html
<div class="preopen-banner" role="note">
  <strong>Ouverture prévue début 2027</strong> · Ce site présente notre futur atelier.
</div>
```

- [ ] **Ajouter le modal avant `</body>`** (même HTML qu'en Task 4.10, liens relatifs avec `../`)

```html
<div id="preopen-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal-box">
    <div class="modal-eyebrow">Atelier en cours de création</div>
    <h2 id="modal-title">BTM Carrosserie<br/>ouvre début 2027</h2>
    <p>Notre atelier de carrosserie indépendant ouvrira ses portes au Pays Basque début 2027. Ce site présente notre futur atelier. Laissez-nous vos coordonnées pour être informé(e) de l'ouverture — et recontacté(e) en priorité.</p>
    <div class="modal-actions">
      <a href="../contact/" class="btn modal-contact">Être informé de l'ouverture <span class="arrow">→</span></a>
      <button class="btn btn--ghost modal-close">Découvrir le site</button>
    </div>
  </div>
</div>
```

### 5.2 — Section 05 dossier assureur — bloc "Liberté de choix"

- [ ] **Retirer la mention des assureurs nommés dans l'advantage block**

Remplacer dans le `<div class="advantage">` de la section `#assureur` :
```html
<span style="color: var(--btm-bone);">L'article L211-5-1 du Code des assurances vous garantit la liberté de choisir votre carrossier. Votre assureur peut recommander, il ne peut pas imposer. BTM est en cours de référencement chez MAIF, Groupama, AXA, MACIF, MATMUT, Allianz — et travaille avec tous les autres.</span>
```
Par :
```html
<span style="color: var(--btm-bone);">L'article L211-5-1 du Code des assurances vous garantit la liberté de choisir votre carrossier. Votre assureur peut recommander un réparateur agréé, il ne peut pas vous l'imposer. BTM n'est pas un réparateur agréé d'un réseau — vous restez libre de nous confier votre dossier, quelle que soit votre compagnie.</span>
```

### 5.3 — CTA band

- [ ] **Désactiver "Demander un devis", retirer le numéro de téléphone, ajouter "Poser une question"**

Remplacer le bloc `.actions` du cta-band :
```html
<div class="actions">
  <a href="../contact/" class="btn">Demander un devis <span class="arrow">→</span></a>
  <a href="tel:+33559000000" class="btn btn--ghost">+33 5 59 00 00 00</a>
</div>
```
Par :
```html
<div class="actions">
  <span class="btn btn--disabled" aria-disabled="true">Demande de devis — indisponible pour le moment</span>
  <a href="../contact/" class="btn btn--ghost">Poser une question <span class="arrow">→</span></a>
</div>
```

- [ ] **Mettre à jour le lead du CTA band**

Remplacer :
```
Décrivez-nous votre besoin avec deux ou trois photos. Nous revenons sous 24 heures avec un premier avis. Aucun engagement avant le devis détaillé.
```
Par :
```
Décrivez-nous votre besoin avec deux ou trois photos. La prise de devis ouvrira avec l'atelier, début 2027. En attendant, posez-nous votre question.
```

### 5.4 — Schema.org

- [ ] **Retirer l'address du JSON-LD de services**

Remplacer le bloc JSON-LD par :
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Carrosserie automobile",
  "provider": {
    "@type": "AutoRepair",
    "name": "BTM Carrosserie"
  },
  "areaServed": ["Bayonne", "Biarritz", "Anglet", "Pays Basque"],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Prestations BTM",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Réparation après sinistre" }},
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Peinture automobile" }},
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Débosselage sans peinture" }},
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Réparation pare-chocs" }},
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Gestion dossier assureur" }}
    ]
  }
}
```

### 5.5 — Footer

- [ ] **Mettre à jour le footer (adresse + téléphone)** — même correction que Task 4.9 mais sans les classes btm-flag

```html
<div class="col">
  <h4>Atelier</h4>
  <p>
    <b>BTM Carrosserie</b><br/>
    Secteur Bayonne · Biarritz · Anglet<br/>
    Pays Basque · France
  </p>
  <p style="margin-top: 16px;">
    +33 00 00 00 00 00 (ligne active à l'ouverture)<br/>
    <a href="mailto:contact@btm-carrosserie.fr">contact@btm-carrosserie.fr</a>
  </p>
</div>
```

- [ ] **Commit Task 5**

```bash
git add services/index.html
git commit -m "content(services): pre-opening corrections — insurer copy, CTA, schema, footer"
```

---

## Task 6 — Assureurs `assureurs/index.html`

**Files:**
- Modify: `assureurs/index.html`

### 6.1 — Bandeau + modal

- [ ] **Ajouter le bandeau après `</header>`** (même HTML Task 4.2)
- [ ] **Ajouter le modal avant `</body>`** (liens `../contact/`)

### 6.2 — Eyebrow page-head

- [ ] **Retirer la mention des assureurs nommés dans l'eyebrow**

Remplacer :
```html
<div class="eyebrow reveal"><span class="num">Référencement en cours</span> MAIF · Groupama · AXA · MACIF · MATMUT · Allianz</div>
```
Par :
```html
<div class="eyebrow reveal"><span class="num">Libre choix garanti par la loi</span> Article L211-5-1 du Code des assurances</div>
```

### 6.3 — Nav CTA

- [ ] **Changer le CTA de navigation**

Remplacer :
```html
<a href="../contact/" class="cta">Déclarer un sinistre <span class="arrow">→</span></a>
```
Par :
```html
<a href="../contact/" class="cta">Poser une question <span class="arrow">→</span></a>
```

### 6.4 — Section 02 "Conventions assureurs"

- [ ] **Remplacer entièrement la section partenaires**

Remplacer depuis `<section class="band lite" aria-labelledby="partenaires-h">` jusqu'à sa `</section>` par :

```html
<!-- ============= QUEL QUE SOIT VOTRE ASSUREUR ============= -->
<section class="band lite" aria-labelledby="partenaires-h">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="meta-row">
        <span><span class="num">02 /</span> Liberté de choix</span>
        <span class="right">Articles L211-5-1 et L211-5-2</span>
      </div>
      <h2 id="partenaires-h">Quel que soit<br/>votre assureur.</h2>
      <p class="lead">BTM n'est pas un réparateur agréé d'un réseau d'assureurs. La loi vous laisse libre de votre choix (article L211-5-1 du Code des assurances), et nous gérons votre dossier de la même façon, quelle que soit votre compagnie.</p>
    </div>

    <p class="btm-small reveal d1" style="margin-top: 24px; max-width: 64ch;">
      Vous faites appel à un réparateur non agréé ? La loi prévoit que vous n'avez pas à avancer les frais de réparation (articles L211-5-1 et L211-5-2 du Code des assurances), via une cession de créance que votre assureur ne peut pas vous refuser. Seule votre franchise reste à votre charge.
    </p>
  </div>
</section>
```

### 6.5 — Prise en charge BTM — "Facturation directe"

- [ ] **Corriger la mention de facturation directe dans la section 03**

Remplacer :
```html
<li style="border-color: var(--btm-rule-inv);"><span><b style="color: var(--btm-paper);">Facturation directe à l'assureur.</b></span></li>
```
Par :
```html
<li style="border-color: var(--btm-rule-inv);"><span><b style="color: var(--btm-paper);">Cession de créance et facturation à l'assureur</b> (selon contrat).</span></li>
```

### 6.6 — FAQ Q3

- [ ] **Mettre à jour la réponse Q3 (avancer les frais)**

Remplacer le contenu du `<div class="answer">` de la `<details class="faq-item">` Q3 :
```html
<div class="answer">
  <p>Dans la majorité des cas, non. Une fois l'expertise validée, nous facturons directement la compagnie d'assurance. Seule votre franchise contractuelle reste à régler à la restitution. Les modalités précises dépendent de votre contrat — nous vous les confirmons dès l'ouverture du dossier.</p>
</div>
```
Par :
```html
<div class="answer">
  <p>Dans la plupart des cas, non. Via une cession de créance, nous pouvons être réglés directement par votre assureur une fois l'expertise validée — vous n'avancez pas les frais de réparation (articles L211-5-1 et L211-5-2 du Code des assurances). Seule votre franchise contractuelle reste à régler à la restitution. Les modalités précises dépendent de votre contrat ; nous vous les confirmons à l'ouverture du dossier.</p>
</div>
```

### 6.7 — CTA band

- [ ] **Désactiver "Déclarer un sinistre", mettre à jour le contenu**

Remplacer la section `cta-band` entière :
```html
<section class="cta-band">
  <div class="wrap">
    <div class="meta-row reveal">
      <span><span class="num">05 /</span> Sinistre en cours</span>
      <span class="right">Appel direct · Réponse 24 h</span>
    </div>

    <div style="height: 48px;"></div>

    <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 64px; align-items: end;">
      <div class="reveal">
        <h2>Déclarez-nous<br/>votre sinistre.</h2>
      </div>
      <div class="reveal d1">
        <p class="lead">Deux ou trois photos, le nom de votre assureur, votre numéro de contrat si vous l'avez. Nous prenons la suite — dépôt, expertise, réparation, restitution.</p>
        <div class="actions">
          <a href="../contact/" class="btn">Déclarer un sinistre <span class="arrow">→</span></a>
          <a href="tel:+33559000000" class="btn btn--ghost">+33 5 59 00 00 00</a>
        </div>
      </div>
    </div>
  </div>
</section>
```
Par :
```html
<section class="cta-band">
  <div class="wrap">
    <div class="meta-row reveal">
      <span><span class="num">05 /</span> Une question sur votre sinistre ?</span>
      <span class="right">Réponse sous 24 à 48 h</span>
    </div>

    <div style="height: 48px;"></div>

    <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 64px; align-items: end;">
      <div class="reveal">
        <h2>Une question<br/>sur votre sinistre ?</h2>
      </div>
      <div class="reveal d1">
        <p class="lead">Deux ou trois photos, le nom de votre assureur, votre numéro de contrat si vous l'avez. La prise en charge des sinistres ouvrira avec l'atelier, début 2027. En attendant, posez-nous votre question.</p>
        <div class="actions">
          <span class="btn btn--disabled" aria-disabled="true">Déclaration de sinistre — indisponible pour le moment</span>
          <a href="../contact/" class="btn btn--ghost">Poser une question <span class="arrow">→</span></a>
        </div>
      </div>
    </div>
  </div>
</section>
```

### 6.8 — Schema.org FAQ

- [ ] **Mettre à jour la réponse Q3 dans le JSON-LD**

Remplacer dans le JSON-LD :
```json
{
  "@type": "Question",
  "name": "Faut-il avancer les frais ?",
  "acceptedAnswer": {
    "@type": "Answer",
    "text": "Non, pour les assureurs avec lesquels une convention est en place. Nous facturons directement votre compagnie. Seule la franchise éventuelle reste à votre charge."
  }
}
```
Par :
```json
{
  "@type": "Question",
  "name": "Faut-il avancer les frais ?",
  "acceptedAnswer": {
    "@type": "Answer",
    "text": "Dans la plupart des cas, non. Via une cession de créance, nous pouvons être réglés directement par votre assureur une fois l'expertise validée (articles L211-5-1 et L211-5-2 du Code des assurances). Seule votre franchise contractuelle reste à régler à la restitution."
  }
}
```

### 6.9 — Footer

- [ ] **Mettre à jour le footer** (même correction Task 4.9 simplifiée)

- [ ] **Commit Task 6**

```bash
git add assureurs/index.html
git commit -m "content(assureurs): remove insurer names, free-choice copy, FAQ Q3, CTA, schema"
```

---

## Task 7 — À propos `a-propos/index.html`

**Files:**
- Modify: `a-propos/index.html`

### 7.1 — Bandeau + modal

- [ ] **Ajouter bandeau + modal** (liens `../contact/`)

### 7.2 — Meta et Schema.org

- [ ] **Corriger la meta-row "mars 2027"**

Remplacer :
```
<span class="right">Fondation 2026 · Ouverture mars 2027</span>
```
Par :
```
<span class="right">Fondation 2026 · Ouverture début 2027</span>
```

- [ ] **Mettre à jour le Schema.org**

Remplacer le JSON-LD par :
```json
{
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "mainEntity": {
    "@type": "Organization",
    "name": "BTM Carrosserie",
    "foundingDate": "2027",
    "founders": [
      { "@type": "Person", "name": "Grégoire Bodin", "jobTitle": "Directeur Général" },
      { "@type": "Person", "name": "Timothé Dauzat", "jobTitle": "Chef d'atelier" }
    ]
  }
}
```

### 7.3 — Lead du page-head

- [ ] **Corriger le lead (parcours Grégoire)**

Remplacer :
```
BTM est né d'une conversation entre deux amis : Grégoire, qui gérait des dossiers assureurs depuis huit ans côté assurance, et Timothé, carrossier de métier, BTS Carrosserie en poche.
```
Par :
```
BTM est né d'une conversation entre deux amis : Grégoire, passé par le courtage en assurance et diplômé d'un MBA en entrepreneuriat et gestion des PME, et Timothé, carrossier-peintre de métier, BTS Carrosserie.
```

### 7.4 — Fondateur Timothé

- [ ] **Corriger le paragraphe biographique de Timothé**

Remplacer :
```html
<p class="btm-flag btm-flag--warn" data-flag="CV TIMOTHÉ — À VALIDER">
  Timothé est carrossier-peintre de métier. BTS Carrosserie obtenu au Québec, dix ans d'atelier dont quatre comme chef d'équipe chez un concessionnaire premium à Bordeaux. Il portera la qualité technique de chaque dossier BTM — choix de méthode, validation des pièces, contrôle final.
</p>
```
Par :
```html
<p>
  Timothé est carrossier-peintre de métier, BTS Carrosserie. Il porte la qualité technique de chaque dossier BTM — choix de méthode, validation des pièces, contrôle final.
</p>
```

- [ ] **Corriger la fiche specs de Timothé (retirer données non confirmées)**

Remplacer :
```html
<dl class="specs btm-flag btm-flag--warn" data-flag="SPECS TIMOTHÉ — À CONFIRMER">
  <div class="spec"><dt>Formation</dt><dd>BTS Carrosserie (Québec)</dd></div>
  <div class="spec"><dt>Expérience</dt><dd>10 ans atelier · 4 ans chef d'équipe</dd></div>
  <div class="spec"><dt>Spécialité</dt><dd>Peinture cabine · tôlerie haut de gamme</dd></div>
  <div class="spec"><dt>Origine</dt><dd>Hasparren · Pays Basque</dd></div>
</dl>
```
Par :
```html
<dl class="specs">
  <div class="spec"><dt>Métier</dt><dd>Carrossier-peintre</dd></div>
  <div class="spec"><dt>Formation</dt><dd>BTS Carrosserie</dd></div>
  <div class="spec"><dt>Rôle</dt><dd>Atelier · qualité · méthodes · stocks</dd></div>
</dl>
```

- [ ] **Corriger la meta de Timothé**

Remplacer :
```html
<span>Carrossier · BTS Carrosserie</span>
```
Par :
```html
<span>Carrossier-peintre · BTS Carrosserie</span>
```

### 7.5 — Fondateur Grégoire

- [ ] **Corriger le paragraphe biographique de Grégoire**

Remplacer :
```html
<p class="btm-flag btm-flag--warn" data-flag="CV GRÉGOIRE — À VALIDER">
  Grégoire vient de l'assurance. Huit ans chez une grande mutuelle, dont cinq comme gestionnaire de sinistres auto. Il connaît le métier de l'expert, les délais réels, les angles morts de l'expertise. Chez BTM, il gère la relation client, le dossier assureur, la finance et le commercial.
</p>
```
Par :
```html
<p>
  Grégoire vient du courtage en assurance : il connaît les rouages de l'indemnisation, le rôle de l'expert et la relation avec les compagnies. Diplômé d'un MBA en entrepreneuriat et gestion des PME, il pilote chez BTM la direction, la relation client, le dossier assureur, la finance et le commercial.
</p>
```

- [ ] **Corriger la fiche specs de Grégoire**

Remplacer :
```html
<dl class="specs btm-flag btm-flag--warn" data-flag="SPECS GRÉGOIRE — À CONFIRMER">
  <div class="spec"><dt>Formation</dt><dd>Master Management de l'assurance</dd></div>
  <div class="spec"><dt>Expérience</dt><dd>8 ans assurance · 5 ans sinistres auto</dd></div>
  <div class="spec"><dt>Rôle</dt><dd>Direction · relation client · finance</dd></div>
  <div class="spec"><dt>Origine</dt><dd>Anglet · Pays Basque</dd></div>
</dl>
```
Par :
```html
<dl class="specs">
  <div class="spec"><dt>Formation</dt><dd>MBA — entrepreneuriat et gestion des PME</dd></div>
  <div class="spec"><dt>Parcours</dt><dd>Courtage en assurance</dd></div>
  <div class="spec"><dt>Rôle</dt><dd>Direction · relation client · finance · commercial</dd></div>
</dl>
```

- [ ] **Corriger la meta de Grégoire**

Remplacer :
```html
<span>Master · 8 ans assurance</span>
```
Par :
```html
<span>MBA · courtage en assurance</span>
```

### 7.6 — Section atelier

- [ ] **Remplacer la section atelier entière**

Remplacer depuis `<section class="band bone btm-flag" data-flag="ATELIER FICTIF...">` jusqu'à sa `</section>` par :

```html
<!-- ============= ATELIER ============= -->
<section class="band bone" aria-labelledby="atelier-h">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="meta-row">
        <span><span class="num">03 /</span> L'atelier</span>
        <span class="right">Pays Basque · ouverture début 2027</span>
      </div>
      <h2 id="atelier-h">L'atelier ouvre<br/>début 2027.</h2>
      <p class="lead">L'atelier est en cours d'implantation au Pays Basque, dans le secteur Bayonne · Biarritz · Anglet. Il réunira un espace de tôlerie, une cabine de peinture pressurisée, une zone de finition et un bureau d'accueil. La surface et l'adresse exactes seront communiquées à la signature du local.</p>
    </div>

    <p class="btm-small reveal d1" style="margin-top: 24px; max-width: 64ch;">
      Les photographies de l'atelier et les visites sur rendez-vous seront proposées à l'approche de l'ouverture.
    </p>
  </div>
</section>
```

### 7.7 — CTA band

- [ ] **Corriger le CTA band (retirer "février 2027")**

Remplacer :
```html
<div class="meta-row reveal">
  <span><span class="num">05 /</span> Visite atelier</span>
  <span class="right">Sur rendez-vous · à partir de février 2027</span>
</div>
```
Par :
```html
<div class="meta-row reveal">
  <span><span class="num">05 /</span> Contact</span>
  <span class="right">Réponse sous 24 à 48 h</span>
</div>
```

- [ ] **Corriger le lead du CTA band**

Remplacer :
```
Vous pouvez visiter l'atelier en cours d'aménagement à partir de février 2027, sur rendez-vous. Ou simplement nous écrire — nous répondons en personne, pas par formulaire automatique.
```
Par :
```
Les visites de l'atelier seront possibles sur rendez-vous à l'approche de l'ouverture. En attendant, écrivez-nous — nous répondons en personne, pas par formulaire automatique.
```

- [ ] **Retirer le bouton téléphone du CTA band**

Remplacer :
```html
<div class="actions">
  <a href="../contact/" class="btn">Nous écrire <span class="arrow">→</span></a>
  <a href="tel:+33559000000" class="btn btn--ghost">+33 5 59 00 00 00</a>
</div>
```
Par :
```html
<div class="actions">
  <a href="../contact/" class="btn">Nous écrire <span class="arrow">→</span></a>
  <a href="../contact/" class="btn btn--ghost">Poser une question <span class="arrow">→</span></a>
</div>
```

### 7.8 — Footer

- [ ] **Mettre à jour le footer** (adresse + téléphone)

- [ ] **Commit Task 7**

```bash
git add a-propos/index.html
git commit -m "content(about): founders bios, workshop section, schema, CTAs, footer"
```

---

## Task 8 — Contact `contact/index.html`

**Files:**
- Modify: `contact/index.html`

### 8.1 — Bandeau + modal

- [ ] **Ajouter bandeau + modal** (liens `../contact/`)

### 8.2 — Meta et H1

- [ ] **Corriger la meta description**

Remplacer :
```
<meta name="description" content="Demander un devis carrosserie ou prendre rendez-vous chez BTM Carrosserie. Atelier indépendant à Anglet, Pays Basque. Réponse sous 24 heures."/>
```
Par :
```
<meta name="description" content="Contactez BTM Carrosserie — atelier indépendant, ouverture début 2027. Posez vos questions, laissez vos coordonnées pour être recontacté à l'ouverture. Secteur Bayonne, Biarritz, Anglet."/>
```

- [ ] **Corriger H1**

Remplacer :
```html
<h1 class="reveal">Décrivez-nous<br/>votre voiture.</h1>
```
Par :
```html
<h1 class="reveal">Une question ?<br/>Écrivez-nous.</h1>
```

- [ ] **Corriger le lead**

Remplacer :
```
Renseignez le formulaire avec quelques photos si possible — c'est ce qui nous aide le plus pour vous répondre précisément. Vous pouvez aussi nous appeler directement. Nous vous rappelons sous 24 heures, du lundi au samedi.
```
Par :
```
Renseignez le formulaire avec quelques photos si possible — c'est ce qui nous aide le plus pour vous répondre précisément. La prise de devis ouvrira avec l'atelier, début 2027 ; en attendant, laissez-nous vos coordonnées pour une réponse et pour être recontacté en priorité à l'ouverture.
```

- [ ] **Corriger l'eyebrow**

Remplacer :
```html
<div class="eyebrow reveal"><span class="num">Devis détaillé sous 48 h</span> Formulaire · téléphone · email · visite atelier</div>
```
Par :
```html
<div class="eyebrow reveal"><span class="num">Réponse sous 24 à 48 h</span> Formulaire · email</div>
```

### 8.3 — Nav CTA + header

- [ ] **Changer le CTA de navigation**

Remplacer :
```html
<a href="tel:+33559000000" class="cta">Appeler l'atelier <span class="arrow">→</span></a>
```
Par :
```html
<a href="mailto:contact@btm-carrosserie.fr" class="cta">Nous écrire <span class="arrow">→</span></a>
```

### 8.4 — Formulaire

- [ ] **Changer le label du champ "Type de prestation"**

Remplacer :
```html
<label for="prestation">Type de prestation <span class="req">*</span></label>
```
Par :
```html
<label for="prestation">Votre demande concerne <span class="req">*</span></label>
```

- [ ] **Mettre à jour les options du select et le placeholder**

Remplacer la `<select id="prestation">` entière :
```html
<select id="prestation" name="prestation" data-required required>
  <option value="">— Choisir une prestation —</option>
  <option value="sinistre">Réparation après sinistre</option>
  <option value="peinture">Peinture automobile</option>
  <option value="debosselage">Débosselage (avec ou sans peinture)</option>
  <option value="pare-chocs">Pare-chocs et éléments plastiques</option>
  <option value="assureur">Gestion dossier assureur</option>
  <option value="visite">Visite atelier (sur rendez-vous)</option>
  <option value="autre">Autre demande</option>
</select>
```
Par :
```html
<select id="prestation" name="prestation" data-required required>
  <option value="">— Choisir —</option>
  <option value="sinistre">Réparation après sinistre</option>
  <option value="peinture">Peinture automobile</option>
  <option value="debosselage">Débosselage</option>
  <option value="pare-chocs">Pare-chocs et plastiques</option>
  <option value="assureur">Dossier assureur</option>
  <option value="ouverture">Être informé de l'ouverture</option>
  <option value="autre">Autre demande</option>
</select>
```

- [ ] **Corriger le texte RGPD**

Remplacer :
```
J'accepte que mes données soient traitées dans le cadre de ma demande de devis. Aucune information ne sera transmise à un tiers. Conformément au RGPD, je dispose d'un droit d'accès, de rectification et de suppression.
```
Par :
```
J'accepte que mes données soient traitées dans le cadre de ma prise de contact. Aucune information ne sera transmise à un tiers. Conformément au RGPD, je dispose d'un droit d'accès, de rectification et de suppression.
```

- [ ] **Corriger le bouton submit**

Remplacer :
```html
<button type="submit" class="btn">Envoyer ma demande <span class="arrow">→</span></button>
```
Par :
```html
<button type="submit" class="btn">Envoyer mon message <span class="arrow">→</span></button>
```

### 8.5 — Message de confirmation

- [ ] **Mettre à jour le message de confirmation**

Remplacer le `<div class="form-success">` entier :
```html
<div class="form-success" id="form-success" role="status" aria-live="polite">
  <div class="eyebrow" style="color: var(--accent); margin-bottom: 16px;"><span class="num">01 /</span> Demande envoyée</div>
  <h3>Merci. Nous revenons vers vous sous 24 h.</h3>
  <p>Votre demande a bien été enregistrée. Grégoire vous rappelle ou répond par email sous 24 heures, du lundi au samedi. Vous pouvez compléter votre dossier en envoyant photos et documents à <a href="mailto:contact@btm-carrosserie.fr" class="text-link"><b>contact@btm-carrosserie.fr</b></a>.</p>
  <div style="margin-top: 24px; display: flex; gap: 16px; flex-wrap: wrap;">
    <a href="../" class="btn">Retour à l'accueil <span class="arrow">→</span></a>
    <a href="../services/" class="btn btn--ghost">Voir les services</a>
  </div>
</div>
```
Par :
```html
<div class="form-success" id="form-success" role="status" aria-live="polite">
  <div class="eyebrow" style="color: var(--accent); margin-bottom: 16px;"><span class="num">01 /</span> Message envoyé</div>
  <h3>Merci. Votre message est bien enregistré.</h3>
  <p>Grégoire vous répond sous 24 à 48 h, et nous vous tiendrons informé de l'ouverture. Vous pouvez compléter votre message en envoyant photos et documents à <a href="mailto:contact@btm-carrosserie.fr" class="text-link"><b>contact@btm-carrosserie.fr</b></a>.</p>
  <div style="margin-top: 24px; display: flex; gap: 16px; flex-wrap: wrap;">
    <a href="../" class="btn">Retour à l'accueil <span class="arrow">→</span></a>
    <a href="../services/" class="btn btn--ghost">Voir les services</a>
  </div>
</div>
```

### 8.6 — Info-side (coordonnées)

- [ ] **Corriger le groupe téléphone**

Remplacer dans `<div class="group reveal">` (téléphone) :
```html
<a href="tel:+33559000000" class="big">+33 5 59 00 00 00</a>
<p style="margin-top: 8px; font-size: 12px;">Lundi → samedi, 08 h → 18 h.<br/>Pour les sinistres en cours, appel direct conseillé.</p>
```
Par :
```html
<p class="big" style="font-family: var(--font-display); font-weight: 700; font-size: 24px; letter-spacing: -0.01em; line-height: 1.1; color: var(--btm-paper);">+33 00 00 00 00 00</p>
<p style="margin-top: 8px; font-size: 12px;">Ligne active à l'ouverture de l'atelier, début 2027.</p>
```

- [ ] **Corriger le groupe adresse**

Remplacer dans `<div class="group reveal d2 btm-flag" data-flag="ADRESSE PLACEHOLDER">` :
```html
<p>
  <b style="color: var(--btm-paper);">BTM Carrosserie</b><br/>
  Chemin de l'Industrie<br/>
  Zone Maignon<br/>
  64600 Anglet · Pays Basque
</p>
<p style="margin-top: 12px; font-size: 12px; color: var(--btm-stone);">Coordonnées · 43.4929° N · −1.4748° W</p>
```
Par :
```html
<p>
  <b style="color: var(--btm-paper);">BTM Carrosserie</b><br/>
  Secteur Bayonne · Biarritz · Anglet<br/>
  Pays Basque<br/>
  Adresse communiquée à la signature du local.
</p>
```

Et retirer l'attribut `class="btm-flag btm-flag--warn"` et `data-flag` du `<div>`.

- [ ] **Corriger le groupe horaires (label uniquement)**

Remplacer dans `<div class="hours btm-flag btm-flag--warn" data-flag="HORAIRES À CONFIRMER">` : retirer les attributs btm-flag.
Ajouter une mention "Horaires prévus à l'ouverture" avant la grille.

Remplacer :
```html
<div class="hours btm-flag btm-flag--warn" data-flag="HORAIRES À CONFIRMER" role="list">
```
Par :
```html
<p style="font-size: 12px; color: var(--btm-stone); margin-bottom: 8px;">Horaires prévus à l'ouverture :</p>
<div class="hours" role="list">
```

- [ ] **Corriger le groupe délai de réponse**

Remplacer :
```html
<p style="font-family: var(--font-display); font-weight: 800; font-size: 32px; line-height: 1; letter-spacing: -0.015em; color: var(--btm-paper); margin-top: 4px;">Nous vous rappelons sous 24 heures.</p>
<p style="margin-top: 12px; font-size: 12px;">Du lundi au samedi. Demandes du dimanche traitées le lundi matin.</p>
```
Par :
```html
<p style="font-family: var(--font-display); font-weight: 800; font-size: 32px; line-height: 1; letter-spacing: -0.015em; color: var(--btm-paper); margin-top: 4px;">Nous répondons sous 24 à 48 h.</p>
<p style="margin-top: 12px; font-size: 12px;">Messages traités du lundi au vendredi.</p>
```

### 8.7 — Section map (accès atelier)

- [ ] **Remplacer la section map entière**

Remplacer depuis `<section class="band bone" aria-labelledby="map-h">` jusqu'à sa `</section>` par :

```html
<!-- ============= ACCÈS ============= -->
<section class="band bone" aria-labelledby="map-h">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="meta-row">
        <span><span class="num">03 /</span> Accès atelier</span>
        <span class="right">Secteur Bayonne · Biarritz · Anglet</span>
      </div>
      <h2 id="map-h">Accès</h2>
      <p class="lead">L'adresse et les accès (voiture, transports, stationnement) seront communiqués à l'ouverture de l'atelier, début 2027.</p>
    </div>
  </div>
</section>
```

### 8.8 — Schema.org

- [ ] **Retirer address du JSON-LD contact**

Remplacer le JSON-LD par :
```json
{
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact BTM Carrosserie",
  "url": "https://btm-carrosserie.fr/contact",
  "mainEntity": {
    "@type": "AutoRepair",
    "name": "BTM Carrosserie",
    "email": "contact@btm-carrosserie.fr"
  }
}
```

### 8.9 — Footer

- [ ] **Mettre à jour le footer**

- [ ] **Commit Task 8**

```bash
git add contact/index.html
git commit -m "content(contact): H1, lead, form fields, info-side, access section, schema"
```

---

## Task 9 — Vérification finale

**Files:** tous les fichiers modifiés

- [ ] **Chercher toutes les occurrences résiduelles des données interdites**

```bash
grep -r "Chemin de l'Industrie\|Zone Maignon\|mars 2027\|printemps 2027\|janvier 2027\|février 2027\|Timothé Maréchal\|+33559000000\|+33 5 59\|MAIF.*référencement\|référencé chez" --include="*.html" .
```

Expected : 0 résultats.

- [ ] **Chercher toutes les occurrences de "Maréchal"**

```bash
grep -ri "maréchal\|marechal" --include="*.html" .
```

Expected : 0 résultats.

- [ ] **Vérifier que le bandeau est présent sur les 5 pages**

```bash
grep -l "preopen-banner" index.html services/index.html assureurs/index.html a-propos/index.html contact/index.html
```

Expected : 5 fichiers listés.

- [ ] **Vérifier que le modal est présent sur les 5 pages**

```bash
grep -l "preopen-modal" index.html services/index.html assureurs/index.html a-propos/index.html contact/index.html
```

Expected : 5 fichiers listés.

- [ ] **Vérifier que `.btn--disabled` est présent là où attendu**

```bash
grep -r "btn--disabled" --include="*.html" .
```

Expected : au moins 5 occurrences (une par page).

- [ ] **Commit de vérification**

```bash
git add -A
git commit -m "chore: final verification pass — no fictitious data remaining"
```

---

## Éléments non mappés / décisions ouvertes

Les éléments suivants du fichier de contenu n'ont pas été implémentés ici et nécessitent une décision :

1. **Nav "Demander un devis" (header)** sur les pages Services et À propos — conservé comme "Poser une question" ; à valider si un autre libellé est voulu.
2. **Durées de garantie FAQ Q6** — volontairement non chiffrées, à formaliser avant l'ouverture.
3. **Parcours détaillé de Timothé** (expérience, spécialité) — à ajouter une fois confirmé.
4. **Logos assureurs** — retirés. À réintroduire uniquement à la signature des conventions.
5. **Google Maps embed** — placeholder conservé ; à remplacer à la signature du bail.
6. **Numéro de téléphone réel** — placeholder `+33 00 00 00 00 00` partout jusqu'à l'ouverture de la ligne.
