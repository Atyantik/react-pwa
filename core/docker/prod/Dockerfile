FROM node:latest

WORKDIR /app

COPY ./dist .

VOLUME ["/app"]

EXPOSE 3003

CMD [ "nodejs", "server.js" ]