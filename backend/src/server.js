import http from "node:http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { env, allowedOrigins } from "./config/env.js";
import { initRealtime } from "./services/realtime.service.js";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins.includes("null") ? "*" : allowedOrigins,
    credentials: true
  }
});

initRealtime(io);

server.listen(env.PORT, () => {
  console.log(`InvestMe API running at ${env.APP_URL}`);
  console.log(`Health check: ${env.APP_URL}/api/health`);
});
