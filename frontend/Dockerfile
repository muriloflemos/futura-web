FROM node:14.16.1-alpine as node
WORKDIR /app
COPY package.json /app/
COPY package-lock.json /app/
RUN npm i npm@latest -g
RUN npm ci
COPY ./ /app/
RUN npm run build:prod

FROM nginx:1.13
COPY --from=node /app/dist/futura-estoque /usr/share/nginx/html
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf
