FROM node:22-alpine AS build
WORKDIR /repo
COPY web/admin-panel web/admin-panel
WORKDIR /repo/web/admin-panel
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=build /repo/web/admin-panel/dist /usr/share/nginx/html
COPY web/app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
