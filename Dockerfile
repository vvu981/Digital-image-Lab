# Dockerfile para TDI Image Lab
# Laboratorio interactivo de Tratamiento Digital de Imágenes

# Etapa de desarrollo
FROM node:20-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia package.json
COPY package.json ./

# Copia package-lock.json si existe, para instalaciones reproducibles
COPY package-lock.json* ./

# Instala dependencias
RUN npm ci || npm install

# Copia el código fuente
COPY . .

# Expone el puerto de Vite (por defecto 5173)
EXPOSE 5173

# Variables de entorno para Vite
ENV VITE_HOST=0.0.0.0

# Comando por defecto: ejecuta servidor de desarrollo
CMD ["npm", "run", "dev"]
