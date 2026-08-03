
FROM node:21.5
# docker build -t cc-voice-cherry-picker .
# docker build --no-cache -t cc-voice-cherry-picker .   # force a full rebuild
# docker run -p 10031:10031 -i -t cc-voice-cherry-picker
#
# Cross-platform deploy (e.g. build on Apple Silicon for EKS amd64):
# docker buildx build --no-cache --platform linux/amd64 -t cc-voice-cherry-picker .

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Source only — no host node_modules, no committed bundle.js (see .dockerignore)
COPY . .

# prod.env is the source of truth for PORT + HOST_URI + TRANSFER_NUMBER (webpack build + runtime)
COPY prod.env .env
RUN rm -rf src/build \
    && npm run build \
    && node -e "\
      const fs = require('fs'); \
      const bundle = fs.readFileSync('src/build/bundle.js', 'utf8'); \
      const required = ['Initial call state', 'Updated buttons', 'Merge requested']; \
      const missing = required.filter(s => !bundle.includes(s)); \
      if (missing.length) { \
        console.error('Docker build produced stale/incomplete bundle.js. Missing:', missing.join(', ')); \
        process.exit(1); \
      } \
      console.log('bundle.js build verified'); \
    "

EXPOSE 10031
CMD [ "npm", "start" ]
