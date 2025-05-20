FROM node:22-slim

RUN corepack enable
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile


COPY . .
COPY .env.example .env

RUN yarn build

EXPOSE 3000


CMD ["yarn", "start:dev"]
