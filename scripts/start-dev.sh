#!/bin/bash

echo "Iniciando supabase"

npx supabase start

echo "Iniciando contenedores"

docker compose up -d --wait --build
