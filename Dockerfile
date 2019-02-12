FROM node:10-alpine

RUN mkdir -p /app
WORKDIR /app
ADD package.json /app/

RUN npm install

COPY . /app/

EXPOSE 3000

CMD [ "npm", "start" ]
