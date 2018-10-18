FROM mongo:3.7

RUN apt-get update && \
    apt-get install -y cron
    
COPY backup.sh /backup.sh
COPY start.sh /start.sh
RUN chmod +x /start.sh && chmod +x /backup.sh

VOLUME ["/backup"]

ENTRYPOINT ["/start.sh"]