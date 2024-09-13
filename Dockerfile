# Usar una imagen base oficial de Node.js
FROM node:18 AS builder

# Configurar el directorio de trabajo
WORKDIR /app

# Copiar los archivos de package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar todo el código fuente
COPY . .

# Compilar el código TypeScript
RUN npm run build

# Usar una imagen base oficial de Node.js para la etapa de producción
FROM node:18

# Configurar el directorio de trabajo
WORKDIR /app

# Copiar los archivos necesarios desde la etapa de construcción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Exponer el puerto en el que la aplicación escuchará
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["node", "dist/server.js"]
