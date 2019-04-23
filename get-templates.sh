#!/usr/bin/env bash
if [ -f ./.env ]; then
  . ./.env
fi

TEMPLATES="templates/index.pug templates/404.pug templates/linkedin-portfolio-website.pug templates/imprint.pug"
if [ ! -z "$GOOGLE_ANALYTICS" ]; then
  TEMPLATES="$TEMPLATES templates/privacy-policy.pug"
fi

echo $TEMPLATES