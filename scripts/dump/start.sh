#!/bin/bash

LOGFIFO='/var/log/cron.fifo'

export CRON_SCHEDULE=${CRON_SCHEDULE:-0 1 * * *}
export MONGO_HOST=${MONGO_HOST:-mongo}
export MONGO_PORT=${MONGO_PORT:-27017}

if [[ ! -e "$LOGFIFO" ]]; then
    mkfifo "$LOGFIFO"
fi

# Exec backup 1 time and then start crontask
/backup.sh

CRON_ENV="MONGO_HOST='$MONGO_HOST' \nMONGO_PORT='$MONGO_PORT'"

echo -e "$CRON_ENV\n$CRON_SCHEDULE /backup.sh > $LOGFIFO 2>&1" | crontab -
crontab -l
cron
tail -f "$LOGFIFO"