FROM node:alpine as builder

RUN apk --no-cache add git python2
RUN git clone https://github.com/dborowiec10/cube-ui /root/cube-ui
WORKDIR /root/cube-ui
RUN npm install
RUN npm install -g @angular/cli
RUN ng build --prod

FROM httpd:alpine
COPY --from=builder /root/cube-ui/dist/cube-editor/* /usr/local/apache2/htdocs/
WORKDIR /usr/local/apache2/htdocs/
EXPOSE 80