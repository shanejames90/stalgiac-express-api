#!/bin/bash

API="http://localhost:4741"
URL_PATH="/screenshots"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "screenshot": {
      "title": "'"${TITLE}"'",
      "description": "'"${DESCRIPTION}"'",
      "location": "'"${LOCATION}"'"
    }
  }'

echo