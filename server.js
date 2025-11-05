import express from "express";
import path from "path";
import { fileURLToPath } from "url";   // ✅ ESM 환경에서 __dirname 대신 필요
import { createServer } from "http";
import { WebSocketServer } from "ws";

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ 현재 파일 경로 계산 (ESM 환경용)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ index.html 및 정적 파일 서빙
app.use(express.static(__dirname));

// ✅ Express HTTP 서버 생성
const server = createServer(app);

// ✅ WebSocket 서버를 HTTP 위에 얹기
const wss = new WebSocketServer({ server });

// ✅ 기본 경로에 index.html 표시
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
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



