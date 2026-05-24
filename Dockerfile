# === 阶段一：胖镜像编译 ===
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# === 阶段二：瘦镜像运行 ===
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*

# 直接拷贝到根目录
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
