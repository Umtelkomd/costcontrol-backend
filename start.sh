#!/bin/bash

# Script de inicio para el backend
echo "Iniciando el servidor backend..."
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm install
fi

# Iniciar el servidor
echo "Iniciando servidor..."
node server.js 