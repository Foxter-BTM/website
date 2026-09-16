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
