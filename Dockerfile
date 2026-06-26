FROM node:18-alpine

WORKDIR /app

# Install yarn
RUN npm install -g yarn

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

# Generate Prisma client
RUN yarn prisma generate

# Check the actual path of your entry file and build accordingly
RUN yarn build

# Set environment variables
ENV NODE_ENV=production

# Check the actual path to your entry point file
# Update the CMD to point to your actual entry file
CMD ["node", "dist/server.js"]