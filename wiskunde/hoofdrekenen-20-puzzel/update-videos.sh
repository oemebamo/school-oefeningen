#!/bin/sh
# Maakt videos/videos.js opnieuw op basis van de video's in de map videos/.
# Gebruik: sh update-videos.sh   (na het toevoegen of verwijderen van video's)
cd "$(dirname "$0")/videos" || exit 1
{
  echo "// Lijst van video's in deze map. Wordt opnieuw gemaakt door ../update-videos.sh"
  echo "window.VIDEOS = ["
  ls -1 | grep -iE '\.(mp4|m4v|mov|webm)$' | sed 's/"/\\"/g; s/.*/  "&",/' | sed '$ s/,$//'
  echo "];"
} > videos.js
echo "videos.js bijgewerkt: $(grep -c '^  "' videos.js) video's"
