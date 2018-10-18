#!/bin/bash

echo "Cron start: $(date)"

DATE=$(date +%Y-%m-%d_%H:%M:%S)
FILE="/backup/backup-$DATE.tar.gz"

mongodump -h $MONGO_HOST -p $MONGO_PORT
tar -zcvf $FILE dump/
rm -rf dump/

echo "Cron end: $(date)"