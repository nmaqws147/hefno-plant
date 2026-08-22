const http = require('http');
require('dotenv').config({ path: require('path').join(__dirname, 'api', '.env') });

const blogHandler = require('./api/blog');
const aiHandler = require('./api/ai');
const weatherHandler = require('./api/weather');
const fertilizerPlannerHandler = require('./api/fertilizer-planner.js');
const analyzeImageHandler = require('./api/analyze-image');
const usersHandler = require('./api/users');

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
    req.rawBody = body;
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

      // Subscription & Payment routes — consolidated in billing.js
      if (path === '/api/create-checkout-session' || path === '/api/stripe-webhook' ||
          path === '/api/vodafone-cash/initiate' || path === '/api/vodafone-cash/verify' ||
          path === '/api/subscription' || path === '/api/check-expired' ||
          path === '/api/check-quota' || path === '/api/billing') {
        const h = require('./api/billing');
        return h(req, wr);
      }
      if (path === '/api/knowledge-base' && method === 'POST') {
        const h = require('./api/knowledge-base');
        return h(req, wr);
      }
      if (path === '/api/send-otp' || path === '/api/verify-otp' || path === '/api/forgot-password') {
        const h = require('./api/otp');
        return h(req, wr);
      }
      if (path === '/api/users' || path.startsWith('/api/users/')) {
        return usersHandler(req, wr);
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
