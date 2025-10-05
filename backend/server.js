// =============================================
// E-VOTING SYSTEM - COMPLETE SERVER
// =============================================

console.log('🚀 INITIALIZING E-VOTING SYSTEM SERVER...');

// Load environment variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// ======================
// MIDDLEWARE
// ======================
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});
app.use(limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ======================
// ENVIRONMENT CHECK
// ======================
console.log('🔧 Environment Configuration:');
console.log('   PORT:', process.env.PORT || 5000);
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Present' : '❌ Missing');
console.log('   ENCRYPTION_KEY:', process.env.ENCRYPTION_KEY ? '✅ Present' : '❌ Missing');
console.log('   MONGO_URI:', process.env.MONGO_URI ? '✅ Configured' : '❌ Missing');

// ======================
// DATABASE CONNECTION
// ======================
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.log('⚠️  MONGO_URI not set. Running without database...');
            return;
        }

        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/evoting', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
        console.log('⚠️  MongoDB Connection Failed:', error.message);
        console.log('💡 Server running in limited mode (no database)');
    }
};

// Initialize database
connectDB();

// ======================
// ROUTES
// ======================

// Import enhanced routes
const enhancedRoutes = require('./routes/enhancedRoutes');

// Import Maharashtra-specific routes
const maharashtraAuthRoutes = require('./routes/maharashtraAuth');
const maharashtraVoteRoutes = require('./routes/maharashtraVote');
const maharashtraResultsRoutes = require('./routes/maharashtraResults');
const adminRoutes = require('./routes/admin');

// Mount enhanced routes (v2 API)
app.use('/api/v2', enhancedRoutes);

// Mount Maharashtra-specific routes (v3 API)
app.use('/api/v3/auth', maharashtraAuthRoutes);
app.use('/api/v3/vote', maharashtraVoteRoutes);
app.use('/api/v3/results', maharashtraResultsRoutes);
app.use('/api/v3/admin', adminRoutes);

// 1. ROOT ENDPOINT
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🏛️ E-Voting System API',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        features: [
            'Aadhaar-based verification',
            'AI biometric authentication',
            'Device binding security',
            'Blockchain vote storage',
            'VVPAT digital audit trail',
            'Multi-language support',
            'WCAG 2.0 AA accessibility'
        ],
        endpoints: {
            'GET /': 'API Welcome',
            'GET /health': 'Health Check',
            'GET /api/info': 'System Information (v1)',
            'GET /api/v2/system/info': 'Enhanced System Info (v2)',
            'POST /api/v2/auth/register': 'Register with Aadhaar',
            'POST /api/v2/auth/verify-biometrics': 'Biometric Verification',
            'POST /api/v2/auth/bind-device': 'Device Binding',
            'POST /api/v2/auth/login': 'Multi-factor Login',
            'POST /api/v2/votes/cast': 'Cast Vote (Blockchain + VVPAT)',
            'GET /api/v2/votes/results': 'Election Results',
            'GET /api/v2/i18n/languages': 'Supported Languages'
        }
    });
});

// 2. HEALTH CHECK
app.get('/health', (req, res) => {
    const healthStatus = {
        success: true,
        status: '🟢 HEALTHY',
        timestamp: new Date().toISOString(),
        uptime: `${process.uptime().toFixed(2)} seconds`,
        memory: {
            used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
            total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`
        },
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    };
    res.json(healthStatus);
});

// 3. SYSTEM INFORMATION
app.get('/api/info', (req, res) => {
    res.json({
        success: true,
        data: {
            system: 'Secure E-Voting System',
            version: '1.0.0',
            description: 'A secure and transparent electronic voting platform',
            features: [
                'Secure voter authentication with JWT',
                'Encrypted vote casting',
                'Real-time results and analytics',
                'Audit trail for transparency',
                'One vote per voter enforcement'
            ],
            security: {
                authentication: 'JWT Tokens',
                encryption: 'AES-256 for votes',
                https: 'Required in production'
            },
            status: {
                server: 'Running',
                database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
                environment: process.env.NODE_ENV || 'development'
            }
        }
    });
});

// 4. CANDIDATES ENDPOINT
app.get('/api/candidates', (req, res) => {
    const candidates = [
        {
            id: 1,
            name: 'John Smith',
            party: 'Democratic Alliance',
            symbol: '🌹',
            description: 'Experienced leader with 10 years in public service',
            agenda: ['Education Reform', 'Healthcare Access', 'Economic Growth']
        },
        {
            id: 2,
            name: 'Sarah Johnson',
            party: 'Republican Front',
            symbol: '⭐',
            description: 'Advocate for economic reform and education',
            agenda: ['Tax Reduction', 'National Security', 'Job Creation']
        },
        {
            id: 3,
            name: 'Michael Chen',
            party: 'Green Progress',
            symbol: '🌿',
            description: 'Environmental activist and community organizer',
            agenda: ['Climate Action', 'Renewable Energy', 'Social Justice']
        },
        {
            id: 4,
            name: 'Emma Wilson',
            party: 'Liberal Union',
            symbol: '🕊️',
            description: 'Human rights advocate and legal expert',
            agenda: ['Civil Rights', 'Healthcare for All', 'Education Funding']
        }
    ];

    res.json({
        success: true,
        data: {
            candidates: candidates,
            total: candidates.length,
            election: '2024 General Election',
            lastUpdated: new Date().toISOString()
        }
    });
});

// 5. VOTING STATISTICS
app.get('/api/stats', (req, res) => {
    const stats = {
        totalVoters: 12500,
        voted: 7843,
        pending: 4657,
        turnout: '62.7%',
        timeRemaining: '12 hours 34 minutes',
        liveUpdates: true,
        lastUpdated: new Date().toISOString()
    };

    res.json({
        success: true,
        data: stats
    });
});

// 6. AUTHENTICATION TEST
app.get('/api/auth/test', (req, res) => {
    res.json({
        success: true,
        message: 'Authentication system ready',
        security: {
            jwtEnabled: !!process.env.JWT_SECRET,
            encryptionEnabled: !!process.env.ENCRYPTION_KEY,
            environment: process.env.NODE_ENV || 'development'
        },
        timestamp: new Date().toISOString()
    });
});

// 7. MOCK REGISTRATION ENDPOINT
app.post('/api/auth/register', (req, res) => {
    const { voterId, name, email, password } = req.body;

    if (!voterId || !name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required: voterId, name, email, password'
        });
    }

    // Mock response
    res.status(201).json({
        success: true,
        message: 'Voter registered successfully',
        data: {
            voter: {
                id: 'mock_' + Date.now(),
                voterId: voterId,
                name: name,
                email: email,
                hasVoted: false
            },
            token: 'mock_jwt_token_' + Date.now()
        }
    });
});

// 8. MOCK LOGIN ENDPOINT
app.post('/api/auth/login', (req, res) => {
    const { voterId, password } = req.body;

    if (!voterId || !password) {
        return res.status(400).json({
            success: false,
            message: 'Voter ID and password are required'
        });
    }

    // Mock response
    res.json({
        success: true,
        message: 'Login successful',
        data: {
            voter: {
                id: 'mock_user_123',
                voterId: voterId,
                name: 'John Doe',
                email: 'john@example.com',
                hasVoted: false
            },
            token: 'mock_jwt_token_' + Date.now()
        }
    });
});

// 9. MOCK VOTE CASTING
app.post('/api/votes/cast', (req, res) => {
    const { candidateId } = req.body;

    if (!candidateId) {
        return res.status(400).json({
            success: false,
            message: 'Candidate ID is required'
        });
    }

    res.status(201).json({
        success: true,
        message: 'Vote cast successfully',
        data: {
            voteId: 'vote_' + Date.now(),
            candidateId: candidateId,
            timestamp: new Date().toISOString(),
            confirmation: 'Your vote has been recorded securely'
        }
    });
});

// 10. ELECTION RESULTS
app.get('/api/results', (req, res) => {
    const results = {
        election: '2024 General Election',
        totalVotes: 7843,
        results: [
            { candidateId: 1, name: 'John Smith', party: 'Democratic Alliance', votes: 2456, percentage: '31.3%' },
            { candidateId: 2, name: 'Sarah Johnson', party: 'Republican Front', votes: 1987, percentage: '25.3%' },
            { candidateId: 3, name: 'Michael Chen', party: 'Green Progress', votes: 1876, percentage: '23.9%' },
            { candidateId: 4, name: 'Emma Wilson', party: 'Liberal Union', votes: 1524, percentage: '19.4%' }
        ],
        leading: 'John Smith - Democratic Alliance',
        turnout: '62.7%',
        lastUpdated: new Date().toISOString()
    };

    res.json({
        success: true,
        data: results
    });
});

// ======================
// ERROR HANDLING
// ======================

// 404 - Route not found
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        availableRoutes: [
            'GET    /',
            'GET    /health',
            'GET    /api/info',
            'GET    /api/candidates',
            'GET    /api/stats',
            'GET    /api/auth/test',
            'GET    /api/results',
            'POST   /api/auth/register',
            'POST   /api/auth/login',
            'POST   /api/votes/cast'
        ],
        timestamp: new Date().toISOString()
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('💥 Server Error:', err);
    
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!',
        timestamp: new Date().toISOString()
    });
});

// ======================
// START SERVER
// ======================
const server = app.listen(PORT, () => {
    console.log('\n🎉 E-VOTING SYSTEM SERVER STARTED SUCCESSFULLY!');
    console.log('================================================');
    console.log(`📍 PORT: ${PORT}`);
    console.log(`🌐 LOCAL: http://localhost:${PORT}`);
    console.log(`🌐 NETWORK: http://0.0.0.0:${PORT}`);
    console.log(`🕐 STARTED: ${new Date().toString()}`);
    console.log('================================================');
    console.log('✅ ALL ENDPOINTS AVAILABLE:');
    console.log('   GET    /                 - API Welcome');
    console.log('   GET    /health           - Health Check');
    console.log('   GET    /api/info         - System Information');
    console.log('   GET    /api/candidates   - List Candidates');
    console.log('   GET    /api/stats        - Voting Statistics');
    console.log('   GET    /api/auth/test    - Authentication Test');
    console.log('   GET    /api/results      - Election Results');
    console.log('   POST   /api/auth/register - Register Voter');
    console.log('   POST   /api/auth/login   - Login Voter');
    console.log('   POST   /api/votes/cast   - Cast Vote');
    console.log('================================================');
    console.log('💡 TIP: Open http://localhost:' + PORT + ' in your browser');
    console.log('⏹️  Press Ctrl+C to stop the server');
    console.log('================================================\n');
});

// ======================
// GRACEFUL SHUTDOWN
// ======================
process.on('SIGINT', () => {
    console.log('\n================================================');
    console.log('🛑 Received shutdown signal (Ctrl+C)');
    console.log('💤 Shutting down gracefully...');
    console.log('================================================');
    
    server.close(() => {
        console.log('✅ HTTP server closed');
        if (mongoose.connection.readyState === 1) {
            mongoose.connection.close(false, () => {
                console.log('✅ Database connection closed');
                console.log('🎯 E-Voting System stopped successfully');
                process.exit(0);
            });
        } else {
            console.log('🎯 E-Voting System stopped successfully');
            process.exit(0);
        }
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM - Shutting down...');
    server.close(() => {
        process.exit(0);
    });
});

// Handle unhandled rejections
process.on('unhandledRejection', (err, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', err);
});

process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    process.exit(1);
});

console.log('✅ Server initialization complete - Starting up...');