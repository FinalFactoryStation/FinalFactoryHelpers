FROM node:18
COPY ./package.json ./package-lock.json* /usr/src/app/
WORKDIR /usr/src/app
RUN npm install
WORKDIR /
COPY . /usr/src/app
CMD npm start
