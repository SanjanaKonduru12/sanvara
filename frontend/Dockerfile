FROM node:20-alpine AS build
WORKDIR /app
# Cache dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
# Set API URL to Render backend
ENV VITE_API_URL=https://sanvara-ecommerce.onrender.com/api
RUN npm run build

# Stage 2: Nginx for serving static files
FROM nginx:alpine
# Copy our custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
