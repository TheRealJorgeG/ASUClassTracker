# Use Node.js base image with Python support
FROM node:18-bullseye

# Install Python and system dependencies for Playwright
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    wget \
    curl \
    unzip \
    gnupg \
    ca-certificates \
    xvfb \
    libglib2.0-0 \
    libnss3-dev \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libgtk-3-0 \
    libatspi2.0-0 \
    # Playwright specific dependencies
    libx11-6 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxtst6 \
    libxss1 \
    libasound2 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Create symlink for python command
RUN ln -s /usr/bin/python3 /usr/bin/python

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./
COPY requirements.txt ./

# Install Node.js dependencies
RUN npm install

# Install Python dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# Install Playwright browsers (this is the key step for Playwright)
# Set the browsers path before installation
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN python3 -m playwright install chromium
RUN python3 -m playwright install-deps chromium

# Copy application code
COPY . .

# Create directories for browser data with proper permissions
RUN mkdir -p /tmp/playwright_data && chmod 755 /tmp/playwright_data

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser \
    && chown -R appuser:appuser /app \
    && chown -R appuser:appuser /tmp/playwright_data

# Set environment variables for Playwright
ENV PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ENV DISPLAY=:99
ENV NODE_ENV=production
# Playwright specific environment variables (moved after browser install)
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0

# Change to the non-root user
USER appuser

# Expose port
EXPOSE 5000

# Command to run your application
CMD ["npm", "start"]