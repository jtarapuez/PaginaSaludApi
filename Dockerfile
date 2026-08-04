# ============================================================
#  PaginaSalud - Dockerfile
#  Multi-stage: Node build + nginx static
# ============================================================

FROM node:20-alpine AS builder

WORKDIR /app

# En redes corporativas (IESS) npm puede fallar por certificados intermedios.
# Solo aplica al build de la imagen, no al runtime nginx.
ARG NPM_CONFIG_STRICT_SSL=false
ENV NPM_CONFIG_STRICT_SSL=${NPM_CONFIG_STRICT_SSL}

COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY . .
RUN node node_modules/@angular/cli/bin/ng.js build --configuration=docker

FROM nginx:1.27-alpine AS runtime

LABEL application="PaginaSalud"
LABEL version="1.0.0"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/pagina-salud /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1
