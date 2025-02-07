FROM nginxinc/nginx-unprivileged:latest
user root
RUN apt-get update -y && apt-get install python3-pip nodejs -y
RUN python3 -m pip config set global.break-system-packages true && python3 -m pip install datarobot python-dotenv
COPY . /lineage
COPY default.conf /etc/nginx/conf.d/default.conf
# RUN mkdir -p /var/lib/nginx/body && mkdir -p /var/lib/nginx/fastcgi && mkdir -p /var/lib/nginx/proxy && mkdir -p /var/lib/nginx/scgi && mkdir -p /var/lib/nginx/uwsgi && chmod -R 777 /var/lib/nginx
# RUN mkdir -p /var/lib/nginx && cd /var/lib/nginx && mkdir body fastcgi proxy scgi uwsgi
# RUN chmod -R 777 /lineage /var/log /var/lib/nginx
# RUN mkdir -p /run && chmod -R 777 /run
# RUN mkdir -p /var/lib/nginx && chmod -R 777 /var/lib/nginx
# RUN apt-get update && apt-get install -y libcap2-bin
# # Allow NGINX to bind to port 80 without root
# RUN setcap 'cap_net_bind_service=+ep' /usr/sbin/nginx
# RUN apt-get install sudo -y
USER nginx
ENTRYPOINT nginx && cd /lineage &&  node server.js 