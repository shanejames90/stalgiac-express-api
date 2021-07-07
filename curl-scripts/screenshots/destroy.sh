#!/bin/bash

API="http://localhost:4741"
URL_PATH="/screenshots"

curl "${API}${URL_PATH}/${ID}" \
  --include \
  --request DELETE \
  --header "Authorization: Bearer ${TOKEN}"

echo