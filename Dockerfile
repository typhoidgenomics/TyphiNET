FROM node:14.15.5

WORKDIR /app

COPY . .

# Install yarn using official installation script
RUN curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version 1.22.10

# Add yarn to the PATH
ENV PATH="/root/.yarn/bin:${PATH}"

# Install server dependencies
RUN npm install --legacy-peer-deps

# Install client dependencies
RUN cd client/ && npm install --legacy-peer-deps

EXPOSE 3000
EXPOSE 8080

# Set up the environment variable named MONGO_URI and assign the value of the mongodb connection string
ENV MONGO_URI=mongodb://mongo:27017

# Run the app using the command yarn start:dev
CMD ["yarn", "start"]
