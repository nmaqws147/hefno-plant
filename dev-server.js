const http = require('http');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const blogHandler = require('./api/blog');

const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', c => body += c);
  req.on('end', () => {
    req.body = body || undefined;
    blogHandler(req, res);
  });
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
