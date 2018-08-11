FROM node:9.4-alpine

WORKDIR /usr/app
COPY package*.json ./
COPY yarn.lock .

RUN \
  apk update && \
  apk add --no-cache make gcc g++ python ffmpeg && \
  npm install -g node-gyp && \
  npm install

COPY . .
