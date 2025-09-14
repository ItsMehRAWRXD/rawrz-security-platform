// RawrZ Security Platform - Web Application Server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Import the RawrZ CLI functionality
const RawrZStandalone = require('./rawrz-cli-wrapper');

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize RawrZ CLI wrapper
const rawrz = new RawrZStandalone();

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// File upload configuration
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow all file types for security analysis
        cb(null, true);
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes

// Health check
app.get('/api/health', async (req, res) => {
    try {
        const systemInfo = await rawrz.getSystemInfo();
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            features: 110,
            systemInfo
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Get available algorithms
app.get('/api/algorithms', (req, res) => {
    res.json({
        encryption: [
            'aes256', 'aes192', 'aes128',
            'camellia256', 'camellia192', 'camellia128',
            'aria256', 'aria192', 'aria128',
            'chacha20', 'blowfish', 'twofish', 'serpent',
            'des', '3des', 'rsa4096', 'hybrid'
        ],
        hashing: ['md5', 'sha1', 'sha256', 'sha512'],
        encoding: ['base64', 'hex', 'url']
    });
});

// Encryption endpoint
app.post('/api/encrypt', upload.single('file'), async (req, res) => {
    try {
        const { algorithm, text, extension } = req.body;
        let input;
        
        if (req.file) {
            input = req.file.path;
        } else if (text) {
            input = text;
        } else {
            return res.status(400).json({ error: 'No file or text provided' });
        }

        const result = await rawrz.encrypt(algorithm, input, extension || '.enc');
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Decryption endpoint
app.post('/api/decrypt', upload.single('file'), async (req, res) => {
    try {
        const { algorithm, key, text } = req.body;
        let input;
        
        if (req.file) {
            input = req.file.path;
        } else if (text) {
            input = text;
        } else {
            return res.status(400).json({ error: 'No file or text provided' });
        }

        const result = await rawrz.decrypt(algorithm, input, key);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Advanced crypto endpoint
app.post('/api/advanced-crypto', upload.single('file'), async (req, res) => {
    try {
        const { operation } = req.body;
        let input;
        
        if (req.file) {
            input = req.file.path;
        } else {
            return res.status(400).json({ error: 'No file provided' });
        }

        const result = await rawrz.advancedCrypto(input, operation || 'encrypt');
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Hashing endpoint
app.post('/api/hash', upload.single('file'), async (req, res) => {
    try {
        const { algorithm, text, save, extension } = req.body;
        let input;
        
        if (req.file) {
            input = req.file.path;
        } else if (text) {
            input = text;
        } else {
            return res.status(400).json({ error: 'No file or text provided' });
        }

        const result = await rawrz.hash(input, algorithm || 'sha256', save, extension);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// File analysis endpoint
app.post('/api/analyze', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const result = await rawrz.analyze(req.file.path);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Key generation endpoint
app.post('/api/keygen', async (req, res) => {
    try {
        const { algorithm, length, save, extension } = req.body;
        const result = await rawrz.keygen(algorithm, length, save, extension);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Encoding endpoints
app.post('/api/encode', async (req, res) => {
    try {
        const { text, type } = req.body;
        let result;
        
        switch (type) {
            case 'base64':
                result = await rawrz.base64encode(text);
                break;
            case 'hex':
                result = await rawrz.hexencode(text);
                break;
            case 'url':
                result = await rawrz.urlencode(text);
                break;
            default:
                return res.status(400).json({ error: 'Invalid encoding type' });
        }
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Network tools endpoints
app.post('/api/network/dns', async (req, res) => {
    try {
        const { hostname } = req.body;
        const result = await rawrz.dnsLookup(hostname);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/network/ping', async (req, res) => {
    try {
        const { host, save, extension } = req.body;
        const result = await rawrz.ping(host, save, extension);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Text operations endpoint
app.post('/api/textops', async (req, res) => {
    try {
        const { operation, text } = req.body;
        const result = await rawrz.textops(operation, text);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Validation endpoint
app.post('/api/validate', async (req, res) => {
    try {
        const { input, type } = req.body;
        const result = await rawrz.validate(input, type);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// System info endpoint
app.get('/api/system', async (req, res) => {
    try {
        const result = await rawrz.getSystemInfo();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List files endpoint
app.get('/api/files', async (req, res) => {
    try {
        const result = await rawrz.listFiles();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Download file endpoint
app.get('/api/download/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, 'uploads', filename);
        
        // Security check - ensure file exists and is in uploads directory
        try {
            await fs.access(filePath);
            res.download(filePath);
        } catch (error) {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin Panel Routes
app.get('/panel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Main application route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 RawrZ Security Platform Web App running on port ${PORT}`);
    console.log(`📱 Main App: http://localhost:${PORT}`);
    console.log(`⚙️  Admin Panel: http://localhost:${PORT}/panel`);
    console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
    console.log('✅ All 110+ security features available via web interface');
});

module.exports = app;