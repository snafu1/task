FROM node:latest
ADD .  /app/

ENV NATS_HOST 127.0.0.1
ENV NATS_PORT 4222
ENV NATS_SUB content
ENV NATS_QUEUE add

ENTRYPOINT ["/app/puller"]
