
FROM node:21.5
#docker buildx build --platform linux/amd64 -t cc-voice-cherry-picker . 
#docker build -t cc-voice-cherry-picker .
#docker run -p 5000:5000 -i -t cc-voice-cherry-picker

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY prod.env .env
RUN npm run build

CMD [ "npm", "start" ]