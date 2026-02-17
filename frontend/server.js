// Simplified Azure App Service startup for Next.js standalone
// Directly runs Next.js standalone server on Azure's assigned PORT
const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 8080;

console.log('=== Azure Next.js Standalone Startup ===');
console.log('PORT:', PORT);
console.log('Working directory:', __dirname);
console.log('Node version:', process.version);
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || 'NOT SET');

// Path to Next.js standalone server
const standaloneServerPath = path.join(__dirname, '.next/standalone/frontend/server.js');
console.log('Starting Next.js from:', standaloneServerPath);

// Start the Next.js standalone server directly on Azure's PORT
const server = spawn('node', [standaloneServerPath], {
    env: {
        ...process.env,
        PORT: PORT,
        HOSTNAME: '0.0.0.0' // Listen on all interfaces for Azure
    },
    stdio: 'inherit',
    cwd: path.join(__dirname, '.next/standalone/frontend')
});

server.on('error', (err) => {
    console.error('❌ Failed to start Next.js server:', err);
    process.exit(1);
});

server.on('exit', (code) => {
    console.log(`Next.js server exited with code: ${code}`);
    process.exit(code || 0);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    server.kill('SIGINT');
});
