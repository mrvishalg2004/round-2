// Register ts-node to handle TypeScript files
require('ts-node/register');

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const net = require('net');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const basePort = 8080;

// Find an available port
function findAvailablePort(startPort, callback) {
  const server = net.createServer();
  
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      findAvailablePort(startPort + 1, callback);
    } else {
      callback(err);
    }
  });
  
  server.once('listening', () => {
    const port = server.address().port;
    server.close(() => {
      callback(null, port);
    });
  });
  
  server.listen(startPort);
}

// Start server with available port
findAvailablePort(basePort, (err, port) => {
  if (err) {
    console.error('Error finding available port:', err);
    process.exit(1);
  }
  
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();
  
  app.prepare().then(() => {
    const server = createServer(async (req, res) => {
      try {
        // Parse the URL
        const parsedUrl = parse(req.url, true);
        
        // Let Next.js handle the request
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });
    
    // Initialize Socket.IO with the HTTP server
    try {
      // Use direct import with ts-node/register
      const socketModule = require('./src/utils/socket');
      socketModule.initSocket(server);
      console.log('Socket.IO initialized successfully');
    } catch (err) {
      console.error('Failed to initialize Socket.IO:', err);
    }
    
    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Admin panel at http://${hostname}:${port}/admin (password: admin123)`);
    });
  }).catch((err) => {
    console.error('Error preparing Next.js app:', err);
    process.exit(1);
  });
}); 