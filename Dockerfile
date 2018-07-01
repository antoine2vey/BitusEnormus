FROM node:9.4-alpine

WORKDIR /usr/app
COPY package*.json ./
COPY yarn.lock .

RUN \
  apk update && \
  apk add --no-cache make gcc g++ python && \
  yarn && \
  apk del make gcc g++ python

COPY . .
