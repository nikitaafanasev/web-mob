FROM node:18
COPY web-server/package.json ./web-server/
RUN cd web-server && npm install
COPY web-server/ ./web-server/
RUN  cd web-server && npm run build

COPY client/package.json ./client/
RUN cd client && npm install
COPY client/ ./client/
RUN cd client && npm run build

WORKDIR /web-server
EXPOSE 80:8080
CMD [ "npm", "run", "start:prod" ]