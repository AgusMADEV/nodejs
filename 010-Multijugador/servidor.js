const http = require('http');
const fs = require('fs');
const path = require('path');

const players = {};
let fruits = [];
const fruitEmojis = ['🍎','🍌','🍒','🍇','🍉','🍓','🍍','🥝','🍑','🍐'];

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function spawnFruit() {
  const x = Math.floor(Math.random() * 400);
  const y = Math.floor(Math.random() * 400);
  const emoji = fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)];
  fruits.push({ id: generateId(), x, y, emoji });
}

function placeInitialFruits(num = 5) {
  fruits = [];
  for (let i = 0; i < num; i++) {
    spawnFruit();
  }
}

// Cleanup inactive players
setInterval(() => {
  const now = Date.now();
  for (let id in players) {
    if (now - players[id].lastActivityTime > 60000) {
      delete players[id];
    }
  }
}, 5000);

// Spawn new fruit periodically
setInterval(() => {
  spawnFruit();
}, 10000);

placeInitialFruits();

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    // Serve index.html at root
    if (req.url === '/') {
      serveFile(path.join(__dirname, 'index.html'), res);
    } else {
      // Attempt to serve from 'public' folder
      const filePath = path.join(__dirname, 'public', req.url);
      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          return res.end('Not found');
        }
        serveFile(filePath, res);
      });
    }
  } else if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let data = {};
      try { data = JSON.parse(body); } catch {}

      if (req.url === '/login') {
        let pid = data.playerId || generateId();
        if (!players[pid]) {
          players[pid] = {
            username: data.username || 'Anonymous',
            animal: data.animal || '🐯',
            x: 20,
            y: 20,
            message: '',
            score: 0,
            lastActivityTime: Date.now()
          };
        } else {
          players[pid].lastActivityTime = Date.now();
        }

        return jsonResponse(res, {
          success: true,
          playerId: pid,
          players,
          fruits
        });

      } else if (req.url === '/move') {
        const { playerId, x, y } = data;
        if (players[playerId]) {
          players[playerId].x = x;
          players[playerId].y = y;
          players[playerId].lastActivityTime = Date.now();

          // BOUNDING-CIRCLE collision check instead of exact match
          const toRemove = [];
          for (let i = 0; i < fruits.length; i++) {
            const f = fruits[i];
            const dx = x - f.x;
            const dy = y - f.y;
            const distance = Math.sqrt(dx*dx + dy*dy);

            // If within 20px, "collect" fruit
            if (distance < 20) {
              players[playerId].score++;
              toRemove.push(i);
            }
          }
          for (let i of toRemove.reverse()) {
            fruits.splice(i, 1);
          }
        }
        return jsonResponse(res, { success: true, players, fruits });

      } else if (req.url === '/message') {
        const { playerId, message } = data;
        if (players[playerId]) {
          players[playerId].message = message || '';
          players[playerId].lastActivityTime = Date.now();
        }
        return jsonResponse(res, { success: true, players, fruits });
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Not found' }));
      }
    });
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
  }
});

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end('Internal Server Error');
    }
    let contentType = 'text/plain';
    if (filePath.endsWith('.html')) contentType = 'text/html';
    if (filePath.endsWith('.css'))  contentType = 'text/css';
    if (filePath.endsWith('.js'))   contentType = 'text/javascript';
    if (filePath.endsWith('.avif')) contentType = 'image/avif';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function jsonResponse(res, obj) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});

