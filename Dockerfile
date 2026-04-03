FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy dependency definition files
COPY package.json yarn.lock ./

# Install ONLY production dependencies and clean the yarn cache to save space
RUN yarn install --production --frozen-lockfile && yarn cache clean

# Copy the rest of the application code
COPY . .

# Create an images folder (in case app saves locally)
RUN mkdir -p images

# Expose the port the app runs on
EXPOSE 8000

# Start the application using Node directly
CMD ["yarn", "start"]