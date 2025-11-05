import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

const rooms = {}; // { roomId: [player1, player2] }

wss.on('connection', (ws) => {
  console.log('🔵 클라이언트 접속');

  // 방 참가 및 접속 순서에 따라 탱크 색상 설정
  let roomId = 'default';
  if (!rooms[roomId]) rooms[roomId] = [];
  rooms[roomId].push(ws);

  const myId = rooms[roomId].length === 1 ? 'RED' : 'BLUE';
  ws.send(JSON.stringify({ type: 'init', id: myId }));

  // 클라이언트로부터 상태 메시지 수신
  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    for (const client of rooms[roomId]) {
      if (client !== ws && client.readyState === 1) {
        client.send(JSON.stringify(msg));  // 다른 클라이언트에게 상태 전달
      }
    }
  });

  ws.on('close', () => {
    console.log('❌ 연결 종료');
    rooms[roomId] = (rooms[roomId] || []).filter(c => c !== ws);
  });
});



