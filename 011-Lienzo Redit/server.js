/**
 * server.js
 *
 * A plain Node.js HTTP server (no Express) that manages:
 *   - Painted cells (non-white)
 *   - NPCs that spawn on random painted cells every 10s
 *   - NPCs that move every 1s to a random adjacent painted cell
 * 
 * Endpoints:
 *   GET    /            -> serves the index.html file (the front-end)
 *   GET    /celdas      -> returns all painted cells
 *   POST   /save-cell   -> create/update a painted cell
 *   GET    /npcs        -> returns current NPCs (id, x, y)
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

// In-memory storage (data is lost on restart)
let paintedCells = []; // Array of { x, y, color }
let npcs = [];         // Array of { id, x, y }

/* --- Utilities --- */

/** Checks if a color is non-white (so "#fff" or "#ffffff" is not painted). */
function isColored(color = "") {
  const c = color.trim().toLowerCase();
  return c !== "#fff" && c !== "#ffffff" && c !== "white";
}

/** Returns all painted (non-white) cells. */
function getAllPaintedCells() {
  return paintedCells.filter(cell => isColored(cell.color));
}

/** Pick a random painted cell (or return null if none exist). */
function getRandomPaintedCell() {
  const valid = getAllPaintedCells();
  if (valid.length === 0) return null;
  const idx = Math.floor(Math.random() * valid.length);
  return valid[idx];
}

/** Find a cell in paintedCells by (x,y). */
function findCell(x, y) {
  return paintedCells.find(c => c.x === x && c.y === y);
}

/** Return an array of valid neighboring positions that are painted (4 directions). */
function findColoredNeighbors(x, y) {
  const offsets = [
    { dx:  1, dy:  0 },
    { dx: -1, dy:  0 },
    { dx:  0, dy:  1 },
    { dx:  0, dy: -1 },
  ];
  const neighbors = [];
  offsets.forEach(({ dx, dy }) => {
    const nx = x + dx;
    const ny = y + dy;
    const cell = findCell(nx, ny);
    if (cell && isColored(cell.color)) {
      neighbors.push({ x: nx, y: ny });
    }
  });
  return neighbors;
}

/* --- NPC Spawning & Movement --- */

/** Spawn an NPC every 10 seconds on a random painted cell. */
setInterval(() => {
  const spawnCell = getRandomPaintedCell();
  if (spawnCell) {
    const newNPC = {
      id: Date.now() + "_" + Math.floor(Math.random() * 1000),
      x: spawnCell.x,
      y: spawnCell.y
    };
    npcs.push(newNPC);
    console.log("[Spawn NPC]", newNPC);
  }
}, 10000); // 10,000 ms = 10s

/** Move NPCs every 1 second. */
setInterval(() => {
  npcs.forEach(npc => {
    const neighbors = findColoredNeighbors(npc.x, npc.y);
    if (neighbors.length > 0) {
      const rand = Math.floor(Math.random() * neighbors.length);
      npc.x = neighbors[rand].x;
      npc.y = neighbors[rand].y;
    }
    // Else stays put
  });
}, 1000);

/* --- Create HTTP Server --- */
const PORT = 3000;

const server = http.createServer((req, res) => {
  // Set CORS headers to allow requests from any origin (if needed)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    return res.end();
  }

  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    // Serve the index.html file
    const filePath = path.join(__dirname, "index.html");
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        return res.end("Error loading index.html");
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  } else if (req.method === "GET" && req.url === "/celdas") {
    // Return painted cells as JSON
    const json = JSON.stringify(paintedCells);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(json);
  } else if (req.method === "GET" && req.url === "/npcs") {
    // Return NPCs as JSON
    const json = JSON.stringify(npcs);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(json);
  } else if (req.method === "POST" && req.url === "/save-cell") {
    // Save or update a painted cell
    let bodyData = "";
    req.on("data", chunk => { bodyData += chunk; });
    req.on("end", () => {
      try {
        const { x, y, color } = JSON.parse(bodyData);
        if (typeof x !== "number" || typeof y !== "number" || !color) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Invalid data" }));
        }
        // Update existing or add new cell
        const idx = paintedCells.findIndex(c => c.x === x && c.y === y);
        if (idx >= 0) {
          paintedCells[idx].color = color;
        } else {
          paintedCells.push({ x, y, color });
        }
        console.log(`[Save Cell] (${x}, ${y}) => ${color}`);
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ status: "ok" }));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Bad JSON format" }));
      }
    });
  } else {
    // If no matching route, return 404 Not Found.
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
