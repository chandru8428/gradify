# Stage 1: Build the React application
FROM node:20-alpine as builder

WORKDIR /app

# Copy workspace package files
COPY package.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies for the workspace
RUN npm install

# Copy the rest of the frontend files
COPY frontend ./frontend

# Build the Vite application inside the frontend workspace
WORKDIR /app/frontend
RUN npm run build

# Stage 2: Serve the built application with Nginx
FROM nginx:alpine

# Copy the built assets to the Nginx html directory
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
