FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine AS production
RUN apk --no-cache add curl
WORKDIR /app
COPY package*.json .
RUN npm ci --only=production
COPY --from=build /app/dist ./dist
HEALTHCHECK --interval=10s --timeout=10s --retries=3 --start-period=10s CMD curl --silent --fail http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
