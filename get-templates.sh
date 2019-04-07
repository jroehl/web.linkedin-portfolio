#!/usr/bin/env bash
. ./.env

TEMPLATES="templates/index.pug templates/404.pug"
if [[ ! -z "$GAPI_API_KEY" && ! -z "$GAPI_CLIENT_ID" ]]; then
  TEMPLATES="$TEMPLATES templates/setup.pug"
fi
echo $TEMPLATES