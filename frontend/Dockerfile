FROM node:alpine

# ENV NODE_ENV=production

WORKDIR /frontend

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "start"]
