#!/bin/bash
#set -Eero pipe fail
# shellcheck disable=SC2164

cd /app
yarn
yarn build

service supervisor start
supervisorctl reread
supervisorctl update
supervisorctl start all

exec nginx -g "daemon off;"
