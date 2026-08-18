FROM node:22-alpine AS build
WORKDIR /repo
COPY package.json ./
COPY web/app/package.json web/app/package.json
COPY web/app web/app
WORKDIR /repo/web/app
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=build /repo/web/app/dist /usr/share/nginx/html
COPY web/app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
