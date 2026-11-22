#!/bin/sh
# Maakt geluiden/geluiden.js opnieuw op basis van de opnames in de map geluiden/.
# Gebruik: sh update-geluiden.sh   (na het toevoegen of verwijderen van opnames)
cd "$(dirname "$0")/geluiden" || exit 1
{
  echo "// Lijst van eigen opnames in deze map. Wordt opnieuw gemaakt door ../update-geluiden.sh"
  echo "window.GELUIDEN = ["
  ls -1 | grep -iE '\.(m4a|mp3|wav|aac)$' | sed 's/"/\\"/g; s/.*/  "&",/' | sed '$ s/,$//'
  echo "];"
} > geluiden.js
echo "geluiden.js bijgewerkt: $(grep -c '^  "' geluiden.js) opname(s)"
