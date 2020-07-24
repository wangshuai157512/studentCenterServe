FROM node:11.0.0

# Create app directory
RUN mkdir -p /home/Service
WORKDIR /home/Service

# Bundle app source
COPY . /home/Service
RUN npm install

EXPOSE 3002
CMD [ "npm", "start" ]