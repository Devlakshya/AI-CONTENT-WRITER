FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.json tsconfig.node.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
