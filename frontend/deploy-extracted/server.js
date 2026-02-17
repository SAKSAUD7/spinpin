// Azure App Service startup wrapper for Next.js standalone with static file serving
const { spawn } = require('child_process');
const path = require('path');
const express = require('express');

const PORT = process.env.PORT || 8080;
const NEXT_PORT = 3001;

console.log('Starting Next.js server on port', PORT);
console.log('Current directory:', __dirname);

// Create Express app to serve static files
const app = express();

// Serve static files from .next/static
app.use('/_next/static', express.static(path.join(__dirname, '.next/static'), {
    maxAge: '1y',
    immutable: true
}));

// Serve public files
app.use(express.static(path.join(__dirname, 'public')));

// Proxy all other requests to Next.js standalone server
app.use((req, res) => {
    const http = require('http');
    const proxyReq = http.request({
        hostname: 'localhost',
        port: NEXT_PORT,
        path: req.url,
        method: req.method,
        headers: req.headers
    }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        console.error('Proxy error:', err);
        res.status(500).send('Proxy error');
    });

    req.pipe(proxyReq);
});

// Start Express server
app.listen(PORT, () => {
    console.log(`Express proxy server running on port ${PORT}`);
});

// Start the Next.js standalone server on different port
const server = spawn('node', [path.join(__dirname, '.next/standalone/frontend/server.js')], {
    env: { ...process.env, PORT: NEXT_PORT },
    stdio: 'inherit',
    cwd: __dirname
});

server.on('error', (err) => {
    console.error('Failed to start Next.js server:', err);
    process.exit(1);
});

server.on('exit', (code) => {
    console.log('Next.js server exited with code:', code);
    process.exit(code);
});
