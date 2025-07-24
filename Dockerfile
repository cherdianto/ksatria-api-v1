# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code to the working directory
COPY . .

# Copy .env file to the container (make sure .env is in the root of your project)
COPY .env .env

# Set default PORT (optional)
ENV PORT=3000

# Command to run your application
CMD ["npm","run","start"]

# Expose the default port (optional)
EXPOSE $PORT
