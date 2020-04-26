FROM node:lts-alpine

ENV UID=1000
ENV GID=1000
ENV BUILD_ENV=demo

WORKDIR /app/

RUN apk update && \
  apk  --no-cache add --update \
  build-base \
  libtool \
  autoconf \
  automake \
  jq \
  openssh \
  python \
  zlib-dev \
  jpeg-dev \
  libpng-dev \
  tiff-dev \
  giflib-dev \
  nasm

COPY . /app/

RUN npm i --production

RUN npm run build:${BUILD_ENV}

# Clear extra files from we just need dist
RUN find . -not -path '**/dist/*' -exec rm -f {} + > /dev/null 2>&1 | echo 'OK'

# Remove build installs
RUN apk del \
  build-base \
  libtool \
  autoconf \
  automake \
  jq \
  openssh \
  python \
  zlib-dev \
  jpeg-dev \
  libpng-dev \
  tiff-dev \
  giflib-dev \
  nasm && \
  rm -rf /var/cache/apk/*

CMD ["node", "dist/server.js"]
