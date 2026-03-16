FROM node:22-alpine

# better-sqlite3 requires native compilation
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && cp -r public dist/public

ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/api.js"]
