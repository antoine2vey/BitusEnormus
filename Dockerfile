FROM node:alpine

WORKDIR /usr/app
COPY package.json .
RUN apk update && \
    apk add --no-cache make gcc g++ python && \
    npm i -g sqlite3 --unsafe-perm --build-from-source