# CLAUDE.md — BTM Carrosserie
> Contexte projet permanent pour Claude Code.
> À placer à la racine du repo (`/CLAUDE.md`).
> Mis à jour : mai 2026.

---

## 1. Le projet

BTM Carrosserie est un atelier de carrosserie indépendant en cours de création,
ouverture prévue **début 2027** au Pays Basque (64). Le site `btm-carrosserie.fr`
est en ligne avant l'ouverture pour asseoir la présence SEO locale et commencer
à construire la crédibilité auprès des assureurs et des particuliers.

Structure juridique : **SARL**. Pas de SAS, pas de groupe, pas de réseau.
Atelier indépendant, point.

---

## 2. Les fondateurs — noms exacts et rôles

**Timothé Dauzat** — Chef d'Atelier & Responsable Technique
- Carrossier-peintre de métier, BTS Carrosserie (obtenu au Québec)
- Responsable : réparations, peinture, qualité, organisation atelier, méthodes, stocks
- Originaire du Pays Basque

**Grégoire Bodin** — Directeur Général & Commercial
- Responsable : relation assureurs, devis, facturation, administratif, communication, finance
- En cours de MBA (Université Laval, Québec), spécialisation entrepreneuriat/gestion PME
- Retour définitif au Pays Basque fin 2026

### ⚠️ Erreurs de noms à corriger immédiatement

La page `a-propos/index.html` utilise le nom **"Timothé Maréchal"** — c'est FAUX.
Le vrai nom est **Timothé Dauzat**. À corriger partout dans le HTML et les métadonnées
Schema.org (`"name": "Timothé Maréchal"` → `"name": "Timothé Dauzat"`).

---

## 3. Périmètre métier — ce que fait (et ne fait pas) BTM

BTM est une **carrosserie pure** : tôlerie, peinture automobile, débosselage,
réparation après sinistre, éléments plastiques/pare-chocs.

**BTM ne fait pas** : mécanique, vidange, révision, pneus, vitrage, pare-brise.
Ne jamais ajouter ces prestations au site sans validation explicite.

---

## 4. Corrections de contenu — erreurs factuelles à rectifier

### 4.1 Gestion du dossier assureur — le processus réel

C'est le point le plus mal décrit sur le site. Plusieurs formulations actuelles
sont inexactes. Voici la réalité :

1. Le client déclare le sinistre **lui-même** à son assureur (téléphone ou appli),
   sous 5 jours ouvrés, en mentionnant BTM comme réparateur.
2. L'assureur mandate un **expert indépendant** qui vient évaluer les dommages
   à l'atelier.
3. BTM établit son devis. En cas de divergence avec le rapport d'expertise, BTM
   produit un **devis contradictoire** argumenté.
4. BTM suit les échanges avec l'expert, coordonne les délais de pièces,
   tient le client informé.
5. La **franchise** reste à la charge du client selon son contrat d'assurance —
   BTM ne la supprime pas et ne fait aucune promesse à ce sujet.

**Ce que BTM fait** : accueille l'expert, produit le devis et le contradictoire si
nécessaire, suit le dossier, tient le client informé, restitue la voiture réparée.

**Ce que BTM ne fait pas** : déclarer à la place du client, garantir l'issue de
l'expertise, supprimer la franchise.

**Formulations interdites** :
- "Nous prenons en charge la déclaration"
- "Nous gérons votre dossier de A à Z" (trop absolu)
- "Nous ouvrons le dossier auprès de votre assureur" (c'est le client qui déclare)

**Formulations correctes** :
- "Vous déclarez le sinistre à votre assureur — c'est la seule démarche qui vous
  revient. Nous prenons le relais pour l'expertise, le suivi et la restitution."
- "Nous accompagnons votre dossier assureur de l'expertise à la restitution."

### 4.2 Assureurs partenaires — état réel

**Aucune convention n'est signée à ce jour.** MAIF, Groupama, AXA, MACIF,
MATMUT, Allianz sont des **cibles commerciales**, pas des partenaires actés.

Formulations interdites :
- "BTM est référencé chez les principaux groupes français" (homepage, faux)
- "Carrosserie agréée MAIF, Groupama, AXA..." (assureurs/index.html, faux)
- Tout ce qui implique une convention existante

Formulation correcte (déjà présente dans assureurs/index.html, à uniformiser
sur toutes les pages) :
- "BTM est en cours de référencement chez ces compagnies"
- "Nous travaillons avec l'ensemble des assureurs — conventions en cours
  de finalisation pour 2027"

La FAQ assureurs contient aussi : "Non, pour les assureurs partenaires. Nous
facturons directement votre compagnie." — **à conditionner** : "pour les assureurs
avec lesquels une convention est en place" ou reformuler en futur.

### 4.3 Témoignages clients — section à retirer ou reformuler

Les trois témoignages de la homepage (M. Iturria, C. Etcheverry, F. Lartigue,
datés avril-juin 2026) sont **fictifs**. L'atelier n'est pas encore ouvert.
Les présenter comme de vrais clients constitue une pratique commerciale trompeuse
(faux avis — sanctionnable en droit français).

Options valides :
- **Retirer la section** jusqu'à l'ouverture réelle (recommandé avant ouverture)
- Remplacer par : "Les premiers avis seront publiés à l'ouverture de l'atelier
  en 2027."
- Afficher des témoignages de personnes ayant travaillé avec Timothé dans son
  atelier précédent, clairement identifiés comme tels

Ne jamais recréer de témoignages fictifs, même pour placeholder.

### 4.4 Formation de Timothé — confirmée

Formation confirmée : **BTS Carrosserie, obtenu au Québec**. Ne jamais écrire
"compagnonnage" (non confirmé), ni "CAP Carrosserie" ni "Brevet de Maîtrise"
(anciens placeholders incorrects).

### 4.5 Parcours de Grégoire — mentions assurance à vérifier

La page `a-propos` indique "huit ans chez une grande mutuelle, dont cinq comme
gestionnaire de sinistres auto" et "Master Management de l'assurance".
Ces éléments **ne sont pas confirmés** — ne pas les modifier sans validation,
mais ne pas les amplifier non plus.

### 4.6 Atelier — adresse et surface

L'adresse "Chemin de l'Industrie, Zone Maignon, 64600 Anglet" et la surface
"450 m²" sont des **placeholders fictifs**. L'implantation définitive n'est
pas encore décidée (deux scénarios en cours : location ou construction).

Les TODO dans le code (`<!-- TODO: remplacer par adresse définitive -->`)
sont corrects — les respecter. Ne jamais remplacer ces placeholders par une
adresse réelle sans confirmation explicite.

### 4.7 Garanties — engagements non formalisés

La FAQ assureurs mentionne "Garantie deux ans sur la peinture, garantie à vie
sur la tôlerie". Ces engagements **n'ont pas été formalisés**. Ne pas les
modifier sans validation, mais ne pas les étendre ou réutiliser dans d'autres
contextes sans confirmation.

---

## 5. Ton éditorial du site

### Positionnement
Atelier artisanal indépendant, ancré au Pays Basque. Pas une franchise, pas un
réseau, pas une PME qui cherche à paraître grande.

### Ton — ce qui fonctionne, à conserver
- Direct, sans emphase : "Voiture rendue droite, peinte, lustrée."
- Factuel et précis : délais chiffrés, procédés décrits étape par étape
- Légèrement personnel : "Timothé valide chaque dossier", "Grégoire gère la
  relation expert"
- Confiant sans être arrogant : l'indépendance comme argument technique, pas
  comme supériorité affichée

### Ce qu'il faut éviter
- Superlatifs non étayés : "les meilleurs", "excellence", "expertise inégalée"
- Promesses vagues : "service de qualité", "satisfaction garantie"
- Anglicismes ou jargon marketing : "customer journey", "full-service",
  "premium experience"
- Vocabulaire de franchise : "notre réseau", "notre groupe", "nos experts certifiés"
- Tournures trop commerciales ou trop anglo-saxonnes : "Nous sommes là pour vous",
  "Votre satisfaction est notre priorité"
- Ton condescendant ou surprotecteur envers le client

### Règles de langue
- Vouvoiement systématique avec le client
- Phrases courtes, verbes d'action
- Les chiffres sont toujours précis (pas "quelques jours" mais "cinq à quinze jours")
- Les noms propres Pays Basque, Bayonne, Biarritz, Anglet prennent une majuscule

---

## 6. Structure du site — pages existantes

```
/                       → Accueil (homepage)
/services/              → Détail des 5 prestations
/assureurs/             → Parcours sinistre + FAQ assureurs
/a-propos/              → Équipe + valeurs + atelier
/contact/               → Formulaire + coordonnées
```

Stack : HTML/CSS/JS statique. Pas de framework. Fichiers de tokens CSS dans
`tokens.css`, styles dans `site.css`, interactions dans `site.js`.

---

## 7. Éléments à ne pas modifier sans validation explicite

- Les noms des fondateurs (sauf correction du bug "Maréchal" → "Dauzat")
- La palette et la direction artistique (Bauhaus contemporain, noir/crème/terracotta)
- La structure de navigation (5 pages, ordre fixé)
- Les données Schema.org (sauf corrections de noms)
- Le copywriting des sections "Pourquoi BTM" et "Engagement" (ton validé)

---

## 8. Placeholders à ne jamais remplacer sans instruction

Les éléments suivants sont des placeholders intentionnels. Ne jamais les
remplacer par des données inventées :

- Adresse postale (tous les fichiers)
- Numéro de téléphone (`+33 5 59 00 00 00`)
- Photos portraits Timothé et Grégoire
- Embed Google Maps
- Logos assureurs (attente des conventions signées)

---

## 9. Ce que Claude Code peut faire sans demander

- Corriger le nom "Timothé Maréchal" → "Timothé Dauzat" partout
- Uniformiser les formulations sur les assureurs (retirer "référencé",
  utiliser "en cours de référencement")
- Corriger des fautes d'orthographe ou de typographie
- Ajuster le CSS sans changer la direction artistique
- Ajouter des balises d'accessibilité manquantes
- Optimiser les métadonnées SEO dans les limites du contenu validé

## 10. Ce que Claude Code doit demander avant de faire

- Modifier le contenu des sections témoignages
- Réécrire des paragraphes entiers
- Ajouter une nouvelle section ou page
- Modifier les garanties mentionnées
- Remplacer un placeholder par une vraie donnée
- Tout ce qui touche aux informations des fondateurs au-delà de la correction
  du nom

