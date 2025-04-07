FROM node:18-alpine

ENV NODE_ENV=production
ARG NPM_BUILD="pnpm install"
EXPOSE 3000/tcp

LABEL maintainer="epic-person-on"
LABEL description="Custom frontend for Ultraviolet."

WORKDIR /app

COPY . .
RUN apk add --upgrade --no-cache python3 make g++
RUN npm install -g pnpm
RUN $NPM_BUILD

ENTRYPOINT [ "node" ]
CMD ["src/index.js"]
