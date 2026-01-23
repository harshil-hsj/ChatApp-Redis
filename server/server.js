import {Redis} from "@upstash/redis";
import dotenv from "dotenv";
dotenv.config();
import express, { raw } from "express";
import cors from "cors";
const app = express();
const port = 3001
app.use(cors());

const clients = new Set();

app.use(express.json());

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const CHAT_KEY = "chat:global";
const TTL_SECONDS = 60*60*24;

const redis = new Redis({
  url: REDIS_URL,
  token: REDIS_TOKEN,
});



app.post("/api/chat/send", async (req, res) => {
  const {id, username, message, timestamp } = req.body;

  if (!username || !message) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const msg = {
    id,
    username,
    message,
    timestamp
  };
  
  await redis.zadd(CHAT_KEY, {
    score: msg.timestamp,
    member: msg,
  });

  for (const client of clients) {
    client.write(`data: ${JSON.stringify(msg)}\n\n`);
  }

  await redis.zremrangebyscore(
    CHAT_KEY,
    0,
    msg.timestamp - TTL_SECONDS * 1000
  );
  
  res.json({ ok: true });
});

app.get("/api/chat/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const now = Date.now();
  const threeSecondsAgo = now - 3000;

  const missedMessages = await redis.zrange(
    CHAT_KEY,
    threeSecondsAgo,
    "+inf",
    {byScore:true}
  );

  clients.add(res);
  for (const msg of missedMessages) {
    res.write(`data: ${JSON.stringify(msg)}\n\n`);
  }

  

  const timeout = setTimeout(() => {
    res.write(`event: close\ndata: {}\n\n`);
    res.end();
    clients.delete(res);
  }, 30000);

  req.on("close", () => {
    clearTimeout(timeout);
    clients.delete(res);
  });
});

app.get("/api/chat/messages", async (req, res) => {

  const after = Number(req.query.after || 0);
  const now = Date.now();
  await redis.zremrangebyscore(
    CHAT_KEY,
    0,
    now - TTL_SECONDS * 1000
  );
  
  const messages = await redis.zrange(CHAT_KEY, after+1, "+inf", {byScore:true});

  res.json({ messages });

});

app.listen(port, () => {
  console.log(`✅ Chat server running at http://localhost:${port}`);
});

