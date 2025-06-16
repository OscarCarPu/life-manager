#!/bin/bash

echo "Deteniendo contenedores"

docker compose down

echo "Deteniendo supabase"

npx supabase stop
