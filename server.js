import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Express HTTP 서버 생성
const server = createServer(app);

// ✅ WebSocket 서버를 HTTP 위에 얹기
const wss = new WebSocketServer({ server });

app.get("/", (req, res) => {
  res.send("✅ Tank Duel WebSocket Server running");
});

// ✅ 룸 관리
const rooms = {};
wss.on("connection", (ws) => {
  console.log("🔵 클라이언트 접속");
  let roomId = "default";
  if (!rooms[roomId]) rooms[roomId] = [];
  rooms[roomId].push(ws);
  const myId = rooms[roomId].length === 1 ? "RED" : "BLUE";
  ws.send(JSON.stringify({ type: "init", id: myId }));

  ws.on("message", (data) => {
    const msg = JSON.parse(data);
    for (const client of rooms[roomId]) {
      if (client !== ws && client.readyState === 1) {
        client.send(JSON.stringify(msg));
      }
    }
  });

  ws.on("close", () => {
    console.log("❌ 연결 종료");
    rooms[roomId] = rooms[roomId].filter((c) => c !== ws);
  });
});

// ✅ Express + WS 서버 함께 실행
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
