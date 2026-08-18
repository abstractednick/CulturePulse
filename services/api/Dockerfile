FROM node:22-alpine AS deps
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY services/api/package.json services/api/package.json
RUN npm install --workspace=@culturepulse/api --include-workspace-root=false || npm install --prefix services/api

FROM node:22-alpine
WORKDIR /app
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/services/api/node_modules ./node_modules
COPY services/api .
ENV PORT=4000
EXPOSE 4000
CMD ["npx", "tsx", "src/index.ts"]
