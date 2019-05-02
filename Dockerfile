FROM node:10.15-alpine

WORKDIR /usr/app
ADD package.json .
ADD yarn.lock .

ENV FFMPEG_VERSION=4.1.1
RUN apk update && \
    apk upgrade && \

    apk add --update ca-certificates && \

    apk add make gcc g++ python gnutls-dev zlib-dev yasm-dev lame-dev libogg-dev \
    x264-dev libvpx-dev libvorbis-dev x265-dev freetype-dev \
    libass-dev libwebp-dev rtmpdump-dev libtheora-dev opus-dev git ffmpeg && \

    apk add --no-cache --virtual .build-dependencies \
    build-base coreutils tar bzip2 x264 gnutls nasm && \
    yarn

COPY . .
