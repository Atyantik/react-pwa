FROM node:latest

WORKDIR /app

COPY . .

RUN yarn

VOLUME ["/app/src"]

EXPOSE 3003

CMD [ "yarn", "start" ]