FROM nginx:1.27.0-alpine3.19

# Copy custom NGINX config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files to the NGINX html directory
COPY /build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]