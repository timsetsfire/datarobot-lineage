FROM node:latest
# WORKDIR /lineage
RUN apt-get update -y && apt-get install python3-pip -y
RUN python3 -m pip config set global.break-system-packages true && python3 -m pip install datarobot python-dotenv
COPY . /lineage
RUN chmod -R 777 /lineage
ENTRYPOINT node /lineage/htmlFile2.js 