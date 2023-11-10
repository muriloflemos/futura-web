FROM node:14.19 as install
WORKDIR /usr/src/app
COPY ./backend/ .
RUN npm ci --unsafe-perm

FROM install as build
RUN npm run build

FROM node:14.19 as install-fe
WORKDIR /usr/src/app
COPY ./frontend/ .
RUN npm install

FROM install-fe as build-fe
RUN npm run build:prod

FROM node:14.19 as production

RUN apt-get update && apt-get install -y libaio1 wget unzip

WORKDIR /opt/oracle

RUN wget https://download.oracle.com/otn_software/linux/instantclient/instantclient-basiclite-linuxx64.zip && \
    unzip instantclient-basiclite-linuxx64.zip && rm -f instantclient-basiclite-linuxx64.zip && \
    cd /opt/oracle/instantclient* && rm -f *jdbc* *occi* *mysql* *mql1* *ipc1* *jar uidrvci genezi adrci && \
    echo /opt/oracle/instantclient* > /etc/ld.so.conf.d/oracle-instantclient.conf && ldconfig

WORKDIR /usr/src/app
COPY backend/package*.json ./

RUN npm ci --only=production --ignore-scripts

COPY --from=build /usr/src/app/node_modules/.prisma/ ./node_modules/.prisma/
COPY --from=build /usr/src/app/node_modules/prisma/ ./node_modules/prisma/
COPY --from=build /usr/src/app/node_modules/@prisma/ ./node_modules/@prisma/
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build-fe /usr/src/app/dist ./frontend/dist

CMD ["node", "dist/src/main.js"]
EXPOSE 3000