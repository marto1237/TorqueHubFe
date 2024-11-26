# Use a lightweight Node.js image for building the React app
FROM node:20.17.0 as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./ 

# Install ajv and ajv-keywords explicitly
RUN npm install ajv ajv-keywords --legacy-peer-deps

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Use an NGINX image to serve the built React app
FROM nginx:1.23.3-alpine

# Remove default NGINX configuration (optional if custom configuration is required)
RUN rm /etc/nginx/conf.d/default.conf

# Copy the build output to the NGINX HTML directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose the NGINX port
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
