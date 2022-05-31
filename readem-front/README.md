## production

    yarn build:prod

## development

    yarn build:dev
    
## docker

    docker build -f ./Dockerfile.dev -t frontend .

    docker run -p 3000:3000 -d frontend

    docker rm $(docker ps -a -q)


## dockerfile
    FROM docker.io/node:alpine AS builder
    ARG CURRENT_ENV

    RUN apk add git

    COPY . /frontend
    WORKDIR /frontend

    RUN yarn cache clean
    RUN yarn global add serve
    RUN yarn install --update-checksums 
    RUN NODE_OPTIONS=--openssl-legacy-provider yarn build:dev


    # FROM docker.io/busybox:latest

    EXPOSE 3000
    # COPY --from=builder /frontend/dist/* /build
    # RUN echo "E404:index.html" > /etc/httpd.conf
    # ENTRYPOINT ["httpd", "-f", "-p", "0.0.0.0:3000", "-h", "/build", "-c", "/etc/httpd.conf"]
    CMD ["/usr/local/bin/serve", "-p", "3000", "/frontend/dist"]
