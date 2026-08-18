FROM node:22-alpine
WORKDIR /app
COPY services/jobs/package.json ./
RUN npm install --ignore-scripts || true
COPY services/jobs .
CMD ["npx", "tsx", "src/index.ts"]
