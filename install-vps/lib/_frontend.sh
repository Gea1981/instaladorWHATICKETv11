#!/bin/bash
# 
# Funciones para configurar el frontend de la aplicación

#######################################
# Instala los paquetes de node
# Argumentos:
#   Ninguno
#######################################
frontend_node_dependencies() {
  print_banner
  printf "${WHITE} 💻 Instalando dependencias del frontend...${GRAY_LIGHT}"
  printf "\n\n"

  sleep 2

  sudo su - deploy <<EOF
  cd /home/deploy/${instancia_add}/frontend
  npm install --loglevel=error
EOF

  sleep 2
}

#######################################
# Compila el código del frontend
# Argumentos:
#   Ninguno
#######################################
frontend_node_build() {
  print_banner
  printf "${WHITE} 💻 Compilando el código del frontend...${GRAY_LIGHT}"
  printf "\n\n"

  sleep 2
  printf "${WHITE} 💻 EL PROCESO PUEDE TARDAR BASTANTE. PACIENCIA"

  FRONT_PATH="/home/deploy/${instancia_add}/frontend"
  
  ## -------- FRONTEND -------- ##
  echo -e "\n🔧 Frontend:"
  cd "$FRONT_PATH" || { echo "❌ No se pudo acceder al frontend en $FRONT_PATH"; return 1; }

  echo "🧹 Limpiando build anterior..."
  sudo -u deploy rm -rf build & 
  show_spinner $!

  echo "🏗️  Construyendo nueva versión del frontend..."
  sudo -u deploy npm run build & 
  show_spinner $!

  sleep 2
}

#######################################
# SPINNER
# Muestra un spinner mientras se ejecuta un proceso en segundo plano
#
#######################################
show_spinner() {
  local pid=$1
  local delay=0.1
  local spinstr='|/-\'
  while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
    local temp=${spinstr#?}
    printf " [%c]  " "$spinstr"
    local spinstr=$temp${spinstr%"$temp"}
    sleep $delay
    printf "\b\b\b\b\b\b"
  done
  printf "    \b\b\b\b"
}


#######################################
# Actualiza el código del frontend
# Argumentos:
#   Ninguno
#######################################
frontend_update() {
  print_banner
  printf "${WHITE} 💻 Actualizando el frontend...${GRAY_LIGHT}"
  printf "\n\n"

  sleep 2

  cd /home/deploy/${empresa_atualizar}

  echo "🚫 Deteniendo PM2..."
  sudo -u deploy pm2 stop ${empresa_atualizar}-frontend

  echo "🧹 Restaurando archivos versionados en build si existen..."
  sudo -u deploy git restore --staged --worktree frontend/build || true

  echo "🔄 Haciendo git fetch..."
  sudo -u deploy git fetch origin

  echo "🔍 Verificando cambios locales..."
  if [ -n "$(sudo -u deploy git status --porcelain)" ]; then
    echo "⚠️ Cambios locales detectados. Ejecutando reset forzado..."
    sudo -u deploy git reset --hard origin/main
  else
    echo "✅ No hay cambios locales, continuando con git pull..."
    PULL_OUTPUT=$(sudo -u deploy git pull)
    echo "$PULL_OUTPUT"

    if echo "$PULL_OUTPUT" | grep -q "Already up to date."; then
      echo "✅ No hay cambios para actualizar. Saliendo..."
      sudo -u deploy pm2 start ${empresa_atualizar}-frontend
      sudo -u deploy pm2 save
      return 0
    fi
  fi

  echo "🚀 Instalando dependencias..."
  cd /home/deploy/${empresa_atualizar}/frontend
  sudo -u deploy npx update-browserslist-db@latest

  sudo -u deploy npm install --loglevel=error &
  show_spinner $!

  echo "🧹 Limpiando build anterior..."
  sudo -u deploy rm -rf build

  echo "🏗️  Construyendo nueva versión..."
  sudo -u deploy npm run build &
  show_spinner $!

  echo "▶️ Iniciando PM2..."
  sudo -u deploy pm2 start ${empresa_atualizar}-frontend
  sudo -u deploy pm2 save

  sleep 2
}

#######################################
# Configura las variables de entorno del frontend
# Argumentos:
#   Ninguno
#######################################
frontend_set_env() {
  print_banner
  printf "${WHITE} 💻 Configurando variables de entorno (frontend)...${GRAY_LIGHT}"
  printf "\n\n"

  sleep 2

  # asegurar idempotencia
  backend_url=$(echo "${backend_url/https:\/\/}")
  backend_url=${backend_url%%/*}
  backend_url=https://$backend_url

sudo su - deploy << EOF
  cat <<[-]EOF > /home/deploy/${instancia_add}/frontend/.env
REACT_APP_BACKEND_URL=${backend_url}
REACT_APP_HOURS_CLOSE_TICKETS_AUTO = 24
[-]EOF
EOF

  sleep 2

sudo su - deploy << EOF
  cat <<[-]EOF > /home/deploy/${instancia_add}/frontend/server.js
// servidor express simple para ejecutar la versión de producción del frontend;
const express = require("express");
const path = require("path");
const app = express();
app.use(express.static(path.join(__dirname, "build")));
app.get("/*", function (req, res) {
	res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.listen(${frontend_port});

[-]EOF
EOF

  sleep 2
}

#######################################
# Inicia pm2 para el frontend
# Argumentos:
#   Ninguno
#######################################
frontend_start_pm2() {
  print_banner
  printf "${WHITE} 💻 Iniciando pm2 (frontend)...${GRAY_LIGHT}"
  printf "\n\n"

  sleep 2

  sudo su - deploy <<EOF
  cd /home/deploy/${instancia_add}/frontend
  pm2 start server.js --name ${instancia_add}-frontend
  pm2 save --force
EOF

 sleep 2
  
  sudo su - root <<EOF
   pm2 startup
  sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u deploy --hp /home/deploy
EOF
  sleep 2
}

#######################################
# Configura nginx para el frontend
# Argumentos:
#   Ninguno
#######################################
frontend_nginx_setup() {
  print_banner
  printf "${WHITE} 💻 Configurando nginx (frontend)...${GRAY_LIGHT}"
  printf "\n\n"

  sleep 2

  frontend_hostname=$(echo "${frontend_url/https:\/\/}")

sudo su - root << EOF

cat > /etc/nginx/sites-available/${instancia_add}-frontend << 'END'
server {
  server_name $frontend_hostname;

  location / {
    proxy_pass http://127.0.0.1:${frontend_port};
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_cache_bypass \$http_upgrade;
  }
}
END

ln -s /etc/nginx/sites-available/${instancia_add}-frontend /etc/nginx/sites-enabled
EOF

  sleep 2
}


