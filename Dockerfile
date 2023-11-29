# Use a base image with Node.js installed
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire NestJS project to the working directory
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Define the command to run your application
CMD ["/bin/sh", "-c","npm run migrate; npm run generate; npm run start:dev;"]
