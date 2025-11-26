#!/bin/bash
# Script para aplicar fix de migración y seeds en instalación existente
# Ejecutar en el servidor como usuario deploy

echo "========================================="
echo " Fix: Migración y Seeds - Chasap v2.0"
echo "========================================="
echo ""

# Pedir nombre de instancia
read -p "Ingresa el nombre de tu instancia (ej: empresa1): " INSTANCIA

if [ -z "$INSTANCIA" ]; then
    echo "❌ Error: Debes ingresar el nombre de la instancia"
    exit 1
fi

BACKEND_DIR="/home/deploy/$INSTANCIA/backend"

# Verificar que existe el directorio
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Error: No se encuentra el directorio $BACKEND_DIR"
    exit 1
fi

echo "✅ Directorio encontrado: $BACKEND_DIR"
echo ""

cd $BACKEND_DIR

echo "🔧 Paso 1: Verificando compilación..."
if [ ! -d "dist" ]; then
    echo "⚠️  No existe carpeta dist, compilando..."
    npm run build
else
    echo "✅ Carpeta dist existe"
fi
echo ""

echo "🔧 Paso 2: Ejecutando migraciones..."
npx sequelize db:migrate
if [ $? -eq 0 ]; then
    echo "✅ Migraciones ejecutadas correctamente"
else
    echo "❌ Error en migraciones"
    exit 1
fi
echo ""

echo "🔧 Paso 3: Ejecutando seeds..."
npm run db:seed
if [ $? -eq 0 ]; then
    echo "✅ Seeds ejecutados correctamente"
else
    echo "⚠️  Error en seeds (puede ser normal si ya existen datos)"
fi
echo ""

echo "🔧 Paso 4: Verificando datos en base de datos..."
echo "Verificando Companies..."
sudo -u postgres psql -d $INSTANCIA -c "SELECT id, name FROM \"Companies\";" 2>/dev/null
echo ""
echo "Verificando Users..."
sudo -u postgres psql -d $INSTANCIA -c "SELECT id, name, email FROM \"Users\";" 2>/dev/null
echo ""

echo "🔧 Paso 5: Reiniciando backend..."
pm2 restart $INSTANCIA-backend
if [ $? -eq 0 ]; then
    echo "✅ Backend reiniciado"
else
    echo "❌ Error al reiniciar backend"
    exit 1
fi
echo ""

echo "========================================="
echo " ✅ Fix aplicado exitosamente!"
echo "========================================="
echo ""
echo "Credenciales de acceso:"
echo "  URL: https://tu-frontend.com"
echo "  Email: admin@admin.com"
echo "  Contraseña: 123456"
echo ""
echo "⚠️  IMPORTANTE: Cambiar la contraseña después del primer login"
echo ""
echo "Ver logs:"
echo "  pm2 logs $INSTANCIA-backend"
echo ""
