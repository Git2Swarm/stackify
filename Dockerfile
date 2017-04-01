FROM node:alpine

COPY src /app
WORKDIR /app
RUN npm install dockerode express
ENTRYPOINT ["node", "stackify.js"]
