FROM node:20-alpine

RUN apk add --no-cache ffmpeg yt-dlp tzdata dcron curl bash

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN chmod +x /app/scripts/run-import-with-lock.sh /app/scripts/start-scheduler.sh

ENV NODE_ENV=production

EXPOSE 3000
