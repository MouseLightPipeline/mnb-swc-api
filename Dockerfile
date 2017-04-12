FROM node:7.5

WORKDIR /app

RUN npm install -g yarn

COPY . .

RUN yarn install

RUN tsc

EXPOSE  9651
