FROM alpine:latest

ADD pusher /usr/local/bin/

ENV NATS_HOST 127.0.0.1
ENV NATS_PORT 4222
ENV NATS_SUB content

ENTRYPOINT ["/usr/local/bin/pusher"]
