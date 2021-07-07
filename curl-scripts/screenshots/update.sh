#!/bin/bash

API="http://localhost:4741"
URL_PATH="/screenshots"

curl "${API}${URL_PATH}/${ID}" \
  --include \
  --request PATCH \
  --header "Content-Type: application/json" \
--header "Authorization: Bearer ${TOKEN}" \
--data '{
    "screenshot": {
      "title": "'"${TITLE}"'",
      "description": "'"${DESCRIPTION}"'",
      "location": "'"${LOCATION}"'",
    }
  }'

echo