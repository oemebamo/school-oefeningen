#!/bin/sh
# Maakt afbeeldingen.js opnieuw aan in elke afbeeldingenmap, met alle .jpg/.jpeg/.png/.webp erin.
#   wiskunde/afbeeldingen/  -> pimpelmezen (Sommenpuzzel, Tafelpuzzel)
#   afbeeldingen-wolven/    -> wolven (Rekenpuzzel, Frans)
cd "$(dirname "$0")" || exit 1
for d in wiskunde/afbeeldingen afbeeldingen-wolven; do
  [ -d "$d" ] || continue
  {
    printf 'window.AFBEELDINGEN = [\n'
    ls "$d" | grep -iE '\.(jpe?g|png|webp)$' | sed 's/"/\\"/g; s/.*/  "&",/'
    printf '];\n'
  } > "$d/afbeeldingen.js"
  echo "$d: $(grep -c '",' "$d/afbeeldingen.js") afbeeldingen"
done
