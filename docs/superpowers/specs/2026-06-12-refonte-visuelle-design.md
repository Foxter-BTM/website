# Spec — Refonte visuelle btm-carrosserie.fr

> Validée le 2026-06-12. Brief : DA Bauhaus/constructiviste, scroll fluide, SEO local, performance.
> Arbitrages utilisateur : terracotta `#B14A2A` conservé (pas `#c0392b`), typographie 100 % Archivo Variable, corps 16 px, doublon `website/` supprimé.

## 1. Contexte

Site vitrine 5 pages de BTM Carrosserie, atelier indépendant en création au Pays Basque (ouverture début 2027). HTML/CSS/JS statique, déployé sur Railway, domaine `btm-carrosserie.fr` (redirection 301 depuis `.com`, gérée hors repo). Contenu textuel audité et validé : reformulation stylistique permise, **aucun enrichissement factuel**.

## 2. Stack — décision

**HTML/CSS/JS statique pur, pas de migration.** 5 pages au contenu stable, déploiement Railway sans build déjà fonctionnel, maintenance lisible pour un non-développeur. Un SSG n'apporterait que la factorisation nav/footer — insuffisant pour justifier une chaîne de build. Le nav et le footer restent dupliqués à la main dans les 5 fichiers HTML ; toute modification doit être répercutée sur les 5 pages (à noter dans CLAUDE.md).

## 3. Direction artistique

### Palette (inchangée, tokens existants)
- Noir profond `#0E0E0C` (`--btm-ink`) — fond des sections inversées et footer, encre partout ailleurs
- Crème `#F4EEDD` (`--btm-paper`) + échelle de neutres chauds existante
- Terracotta `#B14A2A` (`--btm-terracotta`) — accent unique, **un seul élément signature par écran** (numéro de section, soulignement du mot-clé H1, ou bloc géométrique — jamais deux)

Rythme de page : alternance de bandes pleines crème / noir (hero crème, process et footer sur noir).

### Typographie
- **Une seule famille : Archivo Variable**, self-hosted en woff2 variable (axe wght 100–900 ; fichier italique séparé seulement si réellement utilisé), `preload` + `font-display: swap`. Suppression de l'`@import` Google Fonts et d'IBM Plex Mono.
- Échelle conservée : `--fs-mega` clamp 72→176 px, H1 48→96 px, H2 32→56 px.
- **Corps remonté à 16 px** (au lieu de 14), small 13 px, micro 11 px.
- Labels/eyebrows : Archivo 500, uppercase, tracking 0.18em — remplacent la « voix mono ».
- Le travail typographique porte l'identité : compositions en blocs, titres en cascade, numérotation massive, asymétries maîtrisées sur grille 12 colonnes.

### Élément signature
La « plaque » : méta-row numérotée (`01 /` en terracotta + hairline pleine largeur) ouvrant chaque section de chaque page, comme un marquage d'atelier. Trois formes géométriques seulement : ligne, bloc, cercle (déjà codifiées dans tokens.css).

### Anti-clichés (interdits)
Aucune silhouette/illustration de voiture, aucune palette bleu-gris, aucun folklore basque, aucune icône stock, aucune photo stock. Design 100 % typographique et géométrique (textures abstraites CSS/SVG autorisées).

## 4. Layout par page

- **Accueil** : hero typographique pleine hauteur avec séquence d'entrée orchestrée (méta-row → H1 ligne par ligne → lead → bloc rouge, ~800 ms en cascade) ; bande process sur noir ; prestations en grille asymétrique 12 col ; section libre choix du réparateur (L211-5-1 / L211-5-2 — conserver, ne pas en inventer d'autres) ; CTA final sur noir.
- **Services** : sommaire ancré en haut, 5 blocs numérotés 01–05 en compositions alternées (titre massif gauche/droite).
- **Assureurs** : timeline verticale constructiviste des 5 étapes du parcours sinistre (ligne continue + cercles aux jalons), FAQ en accordéons à filets.
- **À propos** : portraits typographiques des deux fondateurs — monogrammes géométriques TD / GB (pas de photos, placeholders respectés), valeurs en méta-rows.
- **Contact** : formulaire pleine largeur à filets nets, zone d'intervention en composition texte (pas d'embed map, placeholder respecté).

Mobile-first, responsive jusqu'à 360 px. Le banner pré-ouverture et le modal sessionStorage existants sont conservés et restylés.

## 5. Motion

- CSS scroll-driven animations (`animation-timeline: view()`) en priorité, derrière `@supports` ; fallback IntersectionObserver (généralisation du système `.reveal` existant dans site.js).
- Parallaxe léger sur les blocs géométriques uniquement, `transform` + `opacity` seulement, 60 fps.
- Pas de scroll-jacking, pas de librairie.
- `prefers-reduced-motion: reduce` désactive tout (contenu visible sans animation).

## 6. SEO local

- Schema.org : `AutoRepair` → **`AutoBodyShop`** sur chaque page. Noms exacts conservés (Grégoire Bodin, Timothé Dauzat). **Aucune adresse postale** — uniquement `areaServed` (Bayonne, Biarritz, Anglet, Pays Basque, Landes).
- Title + description uniques par page (existants, à affiner) ; meta `keywords` supprimée ; un seul H1 par page, hiérarchie propre.
- Canonical, Open Graph + Twitter cards par page ; og-image statique à générer (la référence actuelle `images/og-btm.jpg` pointe vers un fichier inexistant).
- sitemap.xml et robots.txt vérifiés/mis à jour.
- Dates d'ouverture : « début 2027 » partout, sans variation.

## 7. Performance

- Lighthouse ≥ 90 sur les 4 axes, mobile et desktop.
- Font variable self-hosted woff2 + preload (suppression du blocage Google Fonts).
- CSS critique du hero inline si nécessaire pour le LCP ; JS en `defer` ; poids par page < 500 ko hors fonts.
- Tout asset bitmap (og-image) en dimensions explicites.

## 8. Accessibilité

Focus visibles, contrastes AA (vérifier terracotta sur crème pour le texte — réserver le terracotta aux éléments graphiques ou textes larges si le ratio est insuffisant), navigation clavier complète (nav mobile, accordéons FAQ, modal), `aria-expanded` sur les toggles.

## 9. Contraintes de contenu — critique

- Interdiction absolue d'ajouter : adresse, équipements, partenariats/agréments assureurs, chiffres (délais, garanties, tarifs), éléments de CV.
- Placeholders intacts : téléphone `+33 5 59 00 00 00`, adresse TODO, photos, map, logos assureurs.
- Règles éditoriales du CLAUDE.md (formulations assureurs, témoignages, noms) inchangées.

## 10. Livrables et vérification finale

1. Refonte des 5 pages + tokens.css + site.css + site.js.
2. Mise à jour du CLAUDE.md (tokens, conventions, duplication nav/footer, choix actés).
3. Checklist de fin : aucun contenu inventé ; « début 2027 » partout ; noms corrects dans HTML et Schema.org ; schema sans adresse ; redirection `.com` intacte ; Lighthouse ≥ 90 ×4 ; `prefers-reduced-motion` OK ; 360 px OK.
