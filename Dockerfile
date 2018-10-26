FROM node:9.4-alpine

WORKDIR /usr/app
ADD package.json .
ADD package-lock.json .

RUN \
  apk update && \
  apk add --no-cache make gcc g++ python ffmpeg && \
  npm install -g node-gyp && \
  npm install

COPY . .
