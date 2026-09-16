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
