FROM node:latest
RUN apt-get install -y wget gnupg
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update
RUN apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends
RUN rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

EXPOSE 5000
USER root
RUN chmod +x /app/local_docker/entrypoint.sh
ENTRYPOINT ["/app/local_docker/entrypoint.sh"]


