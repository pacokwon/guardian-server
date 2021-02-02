FROM node:15-alpine AS builder
WORKDIR /usr/src/app
RUN apk add --no-cache git
COPY package* ./
RUN npm install
COPY . .
RUN npm run build

FROM node:15-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist .
COPY package* ./
RUN npm install --production
CMD ["node", "index.js"]
