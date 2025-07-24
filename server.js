const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3030 });

wss.on('connection', ws => {
  console.log('Client connected');
  let price = 150 + Math.random() * 10;
  let interval = setInterval(() => {
    // Simulate price change
    price += (Math.random() - 0.5) * 2;
    ws.send(JSON.stringify({ symbol: 'AAPL', price: Number(price.toFixed(2)), time: new Date().toISOString() }));
  }, 2000);

  ws.on('close', () => clearInterval(interval));
});

console.log('WebSocket server running on ws://localhost:3030'); 