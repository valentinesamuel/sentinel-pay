FROM alpine:3.20

WORKDIR /app

COPY package*.json ./

RUN npm i -g @nestjs/cli

RUN npm install --production

COPY . .

RUN npm run build

RUN npm run migration:run

EXPOSE 8080


CMD ["npm", "run", "start:prod"]