#!/bin/sh
# Maakt wiskunde/afbeeldingen/afbeeldingen.js opnieuw aan met alle .jpg/.jpeg/.png/.webp in die map.
cd "$(dirname "$0")/wiskunde/afbeeldingen" || exit 1
{
  printf 'window.AFBEELDINGEN = [\n'
  ls | grep -iE '\.(jpe?g|png|webp)$' | sed 's/"/\\"/g; s/.*/  "&",/'
  printf '];\n'
} > afbeeldingen.js
echo "afbeeldingen.js bijgewerkt:"; cat afbeeldingen.js
