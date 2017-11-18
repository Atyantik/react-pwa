FROM node:latest

WORKDIR /app

COPY . .

RUN npm install

VOLUME ["/app/src", "/app/core"]

EXPOSE 3003

CMD [ "yarn", "start" ]