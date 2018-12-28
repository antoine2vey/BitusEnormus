#!/bin/sh

if [ -z "$1" ]; then
  BACKUP=`ls -t mongo-backup | head -n1`
else
  BACKUP=$1
fi

tar -xzvf mongo-backup/$BACKUP -C mongo-backup

docker-compose \
  -f ./scripts/docker-compose.yml \
  -f ./scripts/docker-compose.prod.yml \
  run --rm \
  -v $(pwd)/mongo-dump/dump:/backup \
  mongo bash -c "mongorestore /backup --host mongo:27017"
