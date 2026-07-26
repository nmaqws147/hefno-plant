const http = require('http');
require('dotenv').config({ path: require('path').join(__dirname, 'api', '.env') });

const blogHandler = require('./api/blog');
const aiHandler = require('./api/ai');
const weatherHandler = require('./api/weather');
const fertilizerPlannerHandler = require('./api/fertilizer-planner.js');
const analyzeImageHandler = require('./api/analyze-image');

function wrapRes(res) {
  return Object.assign(res, {
    status(code) { this.statusCode = code; return this; },
    json(data) {
      this.setHeader('Content-Type', 'application/json');
      this.end(JSON.stringify(data));
    }
  });
}

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
    const wr = wrapRes(res);

    try {
      const method = req.method;
      const path = url.pathname;

      if (path === '/api/ai') return aiHandler(req, wr);
      if (path === '/api/weather') { req.query = Object.fromEntries(url.searchParams.entries()); return await weatherHandler(req, wr); }
      if (path === '/api/analyze-image' && method === 'POST') return await analyzeImageHandler(req, wr);
      if (path === '/.netlify/functions/fertilizer-planner') return fertilizerPlannerHandler(req, wr);

      // Subscription & Payment routes
      if (path === '/api/create-checkout-session' && method === 'POST') {
        const h = require('./api/create-checkout-session');
        return h(req, wr);
      }
      if (path === '/api/stripe-webhook' && method === 'POST') {
        const h = require('./api/stripe-webhook');
        return h(req, wr);
      }
      if (path === '/api/vodafone-cash/initiate' && method === 'POST') {
        const h = require('./api/vodafone-cash/initiate');
        return h(req, wr);
      }
      if (path === '/api/vodafone-cash/verify' && method === 'POST') {
        const h = require('./api/vodafone-cash/verify');
        return h(req, wr);
      }
      if (path === '/api/subscription' && method === 'GET') {
        const h = require('./api/subscription');
        return h(req, wr);
      }
      if (path === '/api/check-expired') {
        const h = require('./api/check-expired');
        return h(req, wr);
      }
      if (path === '/api/knowledge-base' && method === 'POST') {
        const h = require('./api/knowledge-base');
        return h(req, wr);
      }
      if (path === '/api/check-quota' && method === 'POST') {
        const h = require('./api/check-quota');
        return h(req, wr);
      }

      blogHandler(req, res);
    } catch (err) {
      console.error('Server error:', err);
      wr.status(500).json({ error: err.message || 'Internal server error' });
    }
  });
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
