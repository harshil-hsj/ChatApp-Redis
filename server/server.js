import {Redis} from "@upstash/redis";
import dotenv from "dotenv";
dotenv.config();
import express, { raw } from "express";
import cors from "cors";
const app = express();
const port = 3001
app.use(cors());

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
  
  await redis.zremrangebyscore(
    CHAT_KEY,
    0,
    msg.timestamp - TTL_SECONDS * 1000
  );
  
  res.json({ ok: true });
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

