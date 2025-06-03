#!/bin/bash
#set -Eero pipe fail
# shellcheck disable=SC2164

# Update .env from docker image
if [ -n "$APP_URL" ]; then
  sed -i "s|^APP_URL=.*|APP_URL=$APP_URL|" /app/.env
else
  echo "APP_URL is not set; using the default value from .env"
fi

if [ -n "$APP_ENV" ]; then
  sed -i "s|^APP_ENV=.*|APP_ENV=$APP_ENV|" /app/.env
else
  echo "APP_ENV is not set; using the default value from .env"
fi

if [ -n "$DB_CONNECTION" ]; then
  sed -i "s|^DB_CONNECTION=.*|DB_CONNECTION=$DB_CONNECTION|" /app/.env
else
  echo "DB_CONNECTION is not set; using the default value from .env"
fi

if [ -n "$DB_HOST" ]; then
  sed -i "s|^DB_HOST=.*|DB_HOST=$DB_HOST|" /app/.env
else
  echo "DB_HOST is not set; using the default value from .env"
fi

if [ -n "$DB_PORT" ]; then
  sed -i "s|^DB_PORT=.*|DB_PORT=$DB_PORT|" /app/.env
else
  echo "DB_PORT is not set; using the default value from .env"
fi

if [ -n "$DB_DATABASE" ]; then
  sed -i "s|^DB_DATABASE=.*|DB_DATABASE=$DB_DATABASE|" /app/.env
else
  echo "DB_DATABASE is not set; using the default value from .env"
fi

if [ -n "$DB_USERNAME" ]; then
  sed -i "s|^DB_USERNAME=.*|DB_USERNAME=$DB_USERNAME|" /app/.env
else
  echo "DB_USERNAME is not set; using the default value from .env"
fi

if [ -n "$DB_PASSWORD" ]; then
  sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|" /app/.env
else
  echo "DB_PASSWORD is not set; using the default value from .env"
fi

if [ -n "$REDIS_HOST" ]; then
  sed -i "s|^REDIS_HOST=.*|REDIS_HOST=$REDIS_HOST|" /app/.env
else
  echo "REDIS_HOST is not set; using the default value from .env"
fi

if [ -n "$REDIS_PASSWORD" ]; then
  sed -i "s|^REDIS_PASSWORD=.*|REDIS_PASSWORD=$REDIS_PASSWORD|" /app/.env
else
  echo "REDIS_PASSWORD is not set; using the default value from .env"
fi

if [ -n "$REDIS_PORT" ]; then
  sed -i "s|^REDIS_PORT=.*|REDIS_PORT=$REDIS_PORT|" /app/.env
else
  echo "REDIS_PORT is not set; using the default value from .env"
fi

cd /app
yarn
yarn generate:proto
yarn build

service supervisor start
supervisorctl reread
supervisorctl update
supervisorctl start all

exec nginx -g "daemon off;"
