FROM node:7

# Bundle app source
COPY . /app

# Remove dockerdevelopment dependencies
RUN rm -rf /app/node_modules

# Install production app dependencies
RUN cd /app; npm install -g yarn
RUN cd /app; yarn install

EXPOSE  9651
