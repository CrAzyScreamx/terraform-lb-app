import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createRequestHandler } from '@react-router/express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// API Proxy middleware - must be before static file serving
app.use('/api', createProxyMiddleware({
    target: process.env.BACKEND_URL || 'http://localhost:8000',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '', // Remove /api from the path when forwarding
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying API request: ${req.method} ${req.url} -> ${proxyReq.path}`);
    },
    onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Proxy error', message: err.message });
    }
}));

// Serve static files from build/client
app.use('/', express.static(path.join(__dirname, 'build/client')));

// React Router request handler for SSR - must be last
app.all('*', createRequestHandler({
    // @ts-ignore
    build: () => import('./build/server/index.js'),
}));

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Backend URL: ${process.env.BACKEND_URL || 'http://localhost:8000'}`);
});
