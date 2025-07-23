# Use Node.js base image with Python support
FROM node:18-bullseye

# Install Python and system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    wget \
    curl \
    unzip \
    gnupg \
    ca-certificates \
    xvfb \
    libxi6 \
    libgconf-2-4 \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    libvulkan1 \
    # Added common dependencies for headless Chrome
    libdbus-glib-1-2 \
    libxkbcommon0 \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Install ChromeDriver using the modern, reliable approach
RUN CHROME_VERSION=$(google-chrome --version | cut -d " " -f3) \
    && CHROME_MAJOR_VERSION=$(echo "$CHROME_VERSION" | cut -d "." -f1) \
    && LATEST_DRIVER_VERSION=$(curl -s "https://googlechromelabs.github.io/chrome-for-testing/LATEST_RELEASE_${CHROME_MAJOR_VERSION}") \
    && wget -O /tmp/chromedriver-linux64.zip "https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/${LATEST_DRIVER_VERSION}/linux64/chromedriver-linux64.zip" \
    && unzip /tmp/chromedriver-linux64.zip -d /usr/local/bin/ \
    && mv /usr/local/bin/chromedriver-linux64/chromedriver /usr/local/bin/ \
    && rm -rf /usr/local/bin/chromedriver-linux64 \
    && chmod +x /usr/local/bin/chromedriver \
    && rm /tmp/chromedriver-linux64.zip

# Verify ChromeDriver installation
RUN chromedriver --version

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

# Copy application code
COPY . .

# Create directories for Chrome with proper permissions
RUN mkdir -p /tmp/chrome_data && chmod 755 /tmp/chrome_data

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser \
    && chown -R appuser:appuser /app \
    && chown -R appuser:appuser /tmp/chrome_data

# Set environment variables for the appuser. This is a crucial step.
# The PATH should include /usr/local/bin
ENV PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ENV DISPLAY=:99
ENV NODE_ENV=production
ENV CHROME_BIN=/usr/bin/google-chrome-stable
ENV CHROMEDRIVER_PATH=/usr/local/bin/chromedriver

# Change to the non-root user
USER appuser

# Expose port
EXPOSE 5000

# Command to run your application
CMD ["npm", "start"]