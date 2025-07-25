# Stage 1: Use the official Playwright image which comes with Python and all browser dependencies.
# This version is specifically chosen to match the playwright version in your requirements.txt.
# This resolves the "Executable doesn't exist" error.
FROM mcr.microsoft.com/playwright/python:v1.40.0-jammy

# Set the working directory for the application
WORKDIR /app

# Install Node.js and npm
# We are installing Node.js 18 to match your original Dockerfile.
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# First, copy over the dependency manifests to leverage Docker's build cache.
# This layer will only be rebuilt if these files change.
COPY package*.json ./
COPY requirements.txt ./

# Install Node.js dependencies
# Use --omit=dev to skip development dependencies for a smaller production image.
RUN npm install --omit=dev

# Install Python dependencies from requirements.txt
# This will also install the correct version of 'greenlet' for the Python environment.
RUN pip3 install --no-cache-dir -r requirements.txt

# The Playwright browsers are already included in the base image,
# so we don't need to run `playwright install`.
# We just need to ensure the environment variable is set so your app can find them.
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Copy the rest of your application code into the container
COPY . .

# Your application runs on port 5000, so we expose it.
EXPOSE 5000

# The command to start your Node.js server.
# This is taken from your original Dockerfile.
CMD ["npm", "start"]
