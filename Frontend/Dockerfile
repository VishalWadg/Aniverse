# Step 1: Build the React Application
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency configs
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build
COPY . .
# Set the backend URL as relative so Nginx intercepts it
ENV VITE_BACKEND_URL=/api/v1
RUN npm run build

# Step 2: Serve using Nginx
FROM nginx:alpine
# Copy our custom configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy compiled static assets from Vite's output
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]