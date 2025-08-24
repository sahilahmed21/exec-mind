# STAGE 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application for production
RUN npm run build

# STAGE 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Copy the built files from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# When the container starts, Nginx will be started automatically
CMD ["nginx", "-g", "daemon off;"]