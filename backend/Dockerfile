FROM node:20

WORKDIR /usr/src/todo_app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["node","app.js"]

