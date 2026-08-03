import express from "express";
import cors from "cors";
import 'dotenv/config';
import http from "http";
import { Server } from "socket.io";

import Cache from 'ttl-mem-cache';
const cache = new Cache();

const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server,{
  cors: {
    origin: "https://desktop.wxcc-us1.cisco.com",
    methods: ["GET", "POST"],
    credentials: true
  }
} );

//needed for CommonJS
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(__dirname + "/src"));

// Log raw body on JSON parse failures (express.json runs before route handlers)
const jsonParser = express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
});

// POST / receives webhooks with invalid JSON (e.g. provider="value" in Headers);
// skip global JSON parser so the route can fix and parse the raw body itself.
app.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/') {
    return next();
  }
  jsonParser(req, res, next);
});

function logJsonParseError(err, req) {
  const raw = req.rawBody ?? '(raw body not captured)';
  const match = err.message.match(/position (\d+)/);
  const pos = match ? parseInt(match[1], 10) : null;
  console.error('JSON parse error on', req.method, req.originalUrl);
  console.error('Content-Type:', req.headers['content-type']);
  console.error('Error:', err.message);
  console.error('Raw body:', raw);
  if (pos != null && raw !== '(raw body not captured)') {
    const start = Math.max(0, pos - 60);
    const end = Math.min(raw.length, pos + 60);
    console.error(`Context around position ${pos}:`, raw.slice(start, end));
    console.error(`Character at position ${pos}:`, JSON.stringify(raw[pos]));
  }
}

const MAX_ATTEMPTS = 5; // TODO: Should calculate this based on the 4 second multiplier in the flow's hold music. i.e. 10 = 40 seconds -  not long enough.

function normalizeCacheNumber(num) {
  if (!num) return num;
  const digits = String(num).replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

function setTransferCache(number, entry, interactionId) {
  const key = normalizeCacheNumber(number);
  cache.set(key, entry, 3600 * 1000);
  if (interactionId) {
    cache.set(String(interactionId), entry, 3600 * 1000);
  }
  console.log('transfer cache set:', { key, interactionId: interactionId || null, entry });
  return key;
}

function lookupTransferCache({ number, interactionId }) {
  const keysToTry = [];
  if (interactionId) keysToTry.push(String(interactionId));
  if (number) {
    keysToTry.push(normalizeCacheNumber(number));
    keysToTry.push(String(number));
  }
  for (const key of keysToTry) {
    const hit = cache.get(key);
    if (hit) return { hit, key };
  }
  return { hit: null, key: null };
}

app.post('/transfer-hold', async (req, res) => {
  console.log('/transfer-hold POST body:');
  console.log(req.body);
  let response = {
    ready: false
  }
  if(req.body.attempt && !isNaN(parseInt(req.body.attempt))){
    try{
      let attempt = parseInt(req.body.attempt);
      if(attempt >= MAX_ATTEMPTS){
        response.ready = true;
      } else {
        response.attempt = attempt + 1;
      }
    }catch(e){
      console.log('Error checking attempt:');
      console.log(e);
    }
  }
  const { hit: cached, key: cacheHitKey } = lookupTransferCache({
    number: req.body.number,
    interactionId: req.body.interactionId || req.body.transferTaskId
  });
  console.log('transfer-hold lookup:', {
    requestNumber: req.body.number,
    interactionId: req.body.interactionId || req.body.transferTaskId,
    cacheHitKey,
    cached
  });
  if (cached) {
    response.agentNumber = cached.agentNumber;
    if (cached.agentReady) {
      response.ready = true;
    }
  } else if (req.body.agentNumber) {
    // Fallback when CallMerge flow echoes agentNumber from an earlier poll response
    response.agentNumber = req.body.agentNumber;
  }
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(response); // Using .json() instead of .send()
});

app.options('/transfer-merge', cors());
app.post('/transfer-merge', cors(), async (req, res) => {
  console.log('/transfer-merge POST body:');
  console.log(req.body);
  if (req.body?.number) {
    setTransferCache(req.body.number, {
      owner: req.body.owner,
      state: 'transfer-merge',
      agentNumber: req.body.agentNumber,
      agentReady: true
    }, req.body.transferTaskId);
  }
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ ok: true });
});

app.options('/transfer-hold-init', cors());
app.post('/transfer-hold-init', cors(), async (req, res) => {
  console.log('/transfer-hold-init POST body:');
  console.log(req.body);
  if (req.body?.number) {
    setTransferCache(req.body.number, {
      owner: req.body.owner,
      state: 'transfer-hold',
      agentNumber: req.body.agentNumber,
      agentReady: false
    }, req.body.transferTaskId);
  }
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ ok: true });
});

// Fix malformed Headers: provider="value" breaks JSON; normalize to provider=value
function fixProviderQuotes(str) {
  return str.replace(/provider="([^"]*)"/g, 'provider=$1');
}

app.post('/', express.raw({ type: () => true, limit: '1mb' }), async (req, res) => {
  let body = req.body.toString('utf8');
  console.log('/ POST raw body:');
  console.log(body);
  body = fixProviderQuotes(body);
  try {
    body = JSON.parse(body);
  } catch (e) {
    req.rawBody = body;
    logJsonParseError(e, req);
    return res.status(400).send('Invalid JSON');
  }
  console.log('/ POST body 2:');
  console.log(body);
  if (body?.InteractionId) {
    cache.set(body.InteractionId, body, 3600 * 1000);
    io.to(body.OrgId).emit('message', body);
    console.log("Cached", body.InteractionId);
  }
  res.status(200).send('OK');
});

app.options('/callerIds', cors());
app.post('/callerIds', cors(), async (req, res) => {
  try{
    let response = [];
    console.log('/callerIds body:');
    console.log(req.body);
    if(req.body?.taskIds && req.body.taskIds.length > 0){
      for(let t of req.body.taskIds){
        let callerId = cache.get(t);
        if(callerId){
          response.push(callerId);
        } else {
          response.push({InteractionId: t});
        }
      }
    }
    console.log('Found callerIds:');
    console.log(response);
    res.setHeader('Content-Type',"application/json");
    res.send(JSON.stringify(response));
  } catch (e) {
    console.log('Error getting callerIds:');
    console.log(e);
    res.status(500).send('Internal Server Error');
  }
});


io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);
  console.log(socket.handshake.auth);
  if(socket.handshake.auth.orgId){
    console.log("joining", socket.handshake.auth.orgId);
    socket.join(socket.handshake.auth.orgId);
  }
  socket.on('message', (msg) => {
    console.log(socket.id, "sent message:");
    console.log(msg);
    if(msg.command === "transfer-hold"){
      console.log('setting cache for', msg.number, 'to agentReady: false');
      setTransferCache(msg.number, {owner: msg.owner, state: msg.command, agentNumber: msg.agentNumber, agentReady: false}, msg.transferTaskId);
    }else if(msg.command === "transfer-merge"){
      console.log('setting cache for', msg.number, 'to agentReady: true');
      setTransferCache(msg.number, {owner: msg.owner, state: msg.command, agentNumber: msg.agentNumber, agentReady: true}, msg.transferTaskId);
    }
  });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logJsonParseError(err, req);
    return res.status(400).send('Invalid JSON');
  }
  next(err);
});

server.listen(port, () => {
  console.log(`listening on ${port}`);
  console.log('transfer-hold cache: in-memory (single process). For multiple replicas, use one pod or add shared cache.');
});
