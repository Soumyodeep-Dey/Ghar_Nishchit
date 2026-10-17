FROM node:22-alpine AS build

WORKDIR /workspace/frontend/UI
ARG VITE_API_BASE=http://localhost:5000
ARG VITE_BACKEND_URL=http://localhost:5000
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

COPY frontend/UI/package.json frontend/UI/package-lock.json ./
RUN npm ci
COPY frontend/UI ./
COPY Ai /workspace/Ai
RUN npm run build

FROM nginx:1.27-alpine
COPY frontend/UI/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/frontend/UI/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz >/dev/null || exit 1

