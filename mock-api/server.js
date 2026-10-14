const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 3001);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".md": "text/plain; charset=utf-8"
};

function sendJson(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept"
    });
    return res.end();
  }

  const url = new URL(req.url, "http://localhost");
  if (req.method === "POST" && url.pathname === "/api/session-check") {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 16_384) {
        sendJson(res, 413, { message: "Request body too large." });
        req.destroy();
      }
    });
    req.on("end", () => {
      let data;
      try { data = JSON.parse(raw || "{}"); }
      catch { return sendJson(res, 400, { message: "Request body must be valid JSON." }); }

      const pin = typeof data.pin === "string" ? data.pin.trim() : "";
      const name = typeof data.name === "string" ? data.name.trim() : "";
      const amount = Number(data.amount);

      if (!pin || !name || !Number.isInteger(amount) || amount < 1 || amount > 25) {
        return sendJson(res, 400, { message: "400 — Missing fields or invalid amount (must be 1–25)." });
      }
      if (pin === "404" || name.toLowerCase() === "taken") {
        return sendJson(res, 404, { message: "404 — Could not find game code or user already exists." });
      }
      return sendJson(res, 200, {
        ok: true,
        message: "Mock API accepted the test request.",
        data: { pin, name, amount }
      });
    });
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    return sendJson(res, 404, { message: "API route not found." });
  }

  const requestedPath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = path.resolve(root, "." + requestedPath);
  if (!filePath.startsWith(root + path.sep) && filePath !== root) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (error, bytes) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Not found");
    }
    res.writeHead(200, {
      "Content-Type": mime[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    if (req.method === "HEAD") return res.end();
    res.end(bytes);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log("School Games local mock API: http://localhost:" + port);
});
