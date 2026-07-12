const http = require('http');
require('dotenv').config({ path: require('path').join(__dirname, 'api', '.env') });

const blogHandler = require('./api/blog');
const aiHandler = require('./api/ai');
const weatherHandler = require('./api/weather');
const fertilizerPlannerHandler = require('./api/fertilizer-planner.js');
const analyzeImageHandler = require('./api/analyze-image');

const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', c => body += c);
  req.on('end', async () => {
    try {
      req.body = body ? JSON.parse(body) : undefined;
    } catch {
      req.body = body || undefined;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === '/api/ai') {
      const wrappedRes = Object.assign(res, {
        status(code) { this.statusCode = code; return this; },
        json(data) {
          this.setHeader('Content-Type', 'application/json');
          this.end(JSON.stringify(data));
        }
      });
      return aiHandler(req, wrappedRes);
    }

    if (url.pathname === '/api/weather') {
      req.query = Object.fromEntries(url.searchParams.entries());
      const wrappedRes = Object.assign(res, {
        status(code) { this.statusCode = code; return this; },
        json(data) {
          this.setHeader('Content-Type', 'application/json');
          this.end(JSON.stringify(data));
        }
      });
      try {
        return await weatherHandler(req, wrappedRes);
      } catch (err) {
        console.error('Weather handler error:', err);
        wrappedRes.status(500).json({ error: 'Internal server error' });
      }
      return;
    }

    if (url.pathname === '/api/analyze-image' && req.method === 'POST') {
      const wrappedRes = Object.assign(res, {
        status(code) { this.statusCode = code; return this; },
        json(data) {
          this.setHeader('Content-Type', 'application/json');
          this.end(JSON.stringify(data));
        }
      });
      try {
        return await analyzeImageHandler(req, wrappedRes);
      } catch (err) {
        console.error('Analyze image handler error:', err);
        wrappedRes.status(500).json({ error: 'Internal server error' });
      }
      return;
    }

    if (url.pathname === '/.netlify/functions/fertilizer-planner') {
      if (!fertilizerPlannerHandler) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Handler not loaded yet, try again' }));
      }
      const wrappedRes = Object.assign(res, {
        status(code) { this.statusCode = code; return this; },
        json(data) {
          this.setHeader('Content-Type', 'application/json');
          this.end(JSON.stringify(data));
        }
      });
      return fertilizerPlannerHandler(req, wrappedRes);
    }

    blogHandler(req, res);
  });
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
