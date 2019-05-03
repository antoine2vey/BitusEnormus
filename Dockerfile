FROM node:10.15-alpine

WORKDIR /usr/app
ADD package.json .
ADD yarn.lock .

RUN apk update && \
    apk upgrade && \
    apk add python make gcc g++ ffmpeg && \
    yarn

COPY . .
