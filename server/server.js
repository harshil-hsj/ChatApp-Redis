import {Redis} from "@upstash/redis";
import dotenv from "dotenv";
dotenv.config();
import express from "express";

const app = express();
const port = 3001;

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
  const { userName, message } = req.body;

  if (!userName || !message) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const msg = {
    id: crypto.randomUUID(),
    userName,
    message,
    timestamp: Date.now(),
  };
  // Check if key exists
  const exists = await redis.exists(CHAT_KEY);

  // Push message
  await redis.lpush(CHAT_KEY, JSON.stringify(msg));

  // If first message → set TTL
  if (!exists) {
    await redis.expire(CHAT_KEY, TTL_SECONDS);
  }

  res.json({ ok: true });
});


app.get("/api/chat/messages", async (req, res) => {

  const after = req.query.after || 0;

  const rawMessages = await redis.lrange(CHAT_KEY, 0, -1);

  if (rawMessages.length === 0) {
    return res.json({ messages: [] });
  }

  const messages = rawMessages
    .filter(m => m.timestamp > after);

  res.json({ messages });
});

app.listen(port, () => {
  console.log(`✅ Chat server running at http://localhost:${port}`);
});
