# Deploying the APP

Run the following command locally to build the image:

```bash
export TAG=v1.1.0
docker build -t futura-web:$TAG . --platform=linux/amd64
```

Next, test running the container locally

```bash
docker run -p 80:3000 \
  --env DATABASE_URL=$FUTURA_DATABASE_URL \
  --env NODE_ORACLEDB_USER=$FUTURA_DB_USER \
  --env NODE_ORACLEDB_PASSWORD=$FUTURA_DB_PASSWORD \
  --env NODE_ORACLEDB_CONNECTIONSTRING=$FUTURA_ORACLE_CONNECTION_STRING futura-web:$TAG
```

Next, run the following command to save the image in a `.tar` file:

```bash
docker save futura-web:$TAG > futura-web-$TAG.tar
```

Next, push the image to the server:

```bash
sudo rsync -P -a futura-web-$TAG.tar <USER>@<SERVER_IP>:<PATH>
```

Next, make sure to get the `.tar` file in the server and run the command:

```bash
docker load < futura-web-$TAG.tar
```

Then, run the following command to start the container

```bash
docker run -d -p 8065:3000 --restart unless-stopped \
  --env TZ=America/Sao_Paulo \
  --env DATABASE_URL=$FUTURA_DATABASE_URL \
  --env NODE_ORACLEDB_USER=$FUTURA_DB_USER \
  --env NODE_ORACLEDB_PASSWORD=$FUTURA_DB_PASSWORD \
  --env NODE_ORACLEDB_CONNECTIONSTRING=$FUTURA_ORACLE_CONNECTION_STRING futura-web:$TAG
```
