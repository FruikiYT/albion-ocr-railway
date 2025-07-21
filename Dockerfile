# Utilise une image Node.js légère
FROM node:18-alpine

# Définit le dossier de travail
WORKDIR /app

# Copie les fichiers de dépendances et installe
COPY package.json package-lock.json* ./
RUN npm install --production

# Copie le reste de l’application
COPY . .

# Expose le port (Railway lira automatiquement)
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]
