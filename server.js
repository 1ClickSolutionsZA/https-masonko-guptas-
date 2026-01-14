// Masonko Stokvel Backend Server
// Node.js + Express + SQLite

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'masonko-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// File upload configuration
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Database initialization
const db = new sqlite3.Database('./masonko_stokvel.db', (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database');
        initDatabase();
    }
});

// Initialize database tables
function initDatabase() {
    db.serialize(() => {
        // Users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'member',
                tier INTEGER NOT NULL,
                shares INTEGER NOT NULL,
                balance REAL DEFAULT 0,
                joined DATE NOT NULL,
                lastPayment DATE,
                status TEXT NOT NULL DEFAULT 'current',
                approved BOOLEAN DEFAULT 0,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Contributions table
        db.run(`
            CREATE TABLE IF NOT EXISTS contributions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                memberId INTEGER NOT NULL,
                amount REAL NOT NULL,
                method TEXT NOT NULL,
                reference TEXT,
                proofPath TEXT,
                date DATE NOT NULL,
                recordedBy TEXT,
                status TEXT DEFAULT 'confirmed',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (memberId) REFERENCES users(id)
            )
        `);
        
        // Loans table
        db.run(`
            CREATE TABLE IF NOT EXISTS loans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                memberId INTEGER NOT NULL,
                amount REAL NOT NULL,
                term INTEGER NOT NULL,
                interest REAL NOT NULL,
                outstanding REAL NOT NULL,
                nextPayment DATE,
                status TEXT DEFAULT 'pending',
                applicationDate DATE NOT NULL,
                applicationDetails TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (memberId) REFERENCES users(id)
            )
        `);
        
        // Pending Payments table
        db.run(`
            CREATE TABLE IF NOT EXISTS pendingPayments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                memberId INTEGER NOT NULL,
                memberName TEXT NOT NULL,
                amount REAL NOT NULL,
                method TEXT NOT NULL,
                reference TEXT,
                date DATE NOT NULL,
                notes TEXT,
                proofPath TEXT,
                status TEXT DEFAULT 'pending',
                submittedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                confirmedBy TEXT,
                confirmedDate DATETIME,
                FOREIGN KEY (memberId) REFERENCES users(id)
            )
        `);
        
        // Notifications table
        db.run(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                type TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                time TEXT NOT NULL,
                unread BOOLEAN DEFAULT 1,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id)
            )
        `);
        
        // Chat Messages table
        db.run(`
            CREATE TABLE IF NOT EXISTS chatMessages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender TEXT NOT NULL,
                message TEXT NOT NULL,
                time TEXT NOT NULL,
                isSent BOOLEAN DEFAULT 0,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Settings table
        db.run(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        `);
        
        // Seed default admin and treasurer if not exists
        db.get('SELECT COUNT(*) as count FROM users', async (err, row) => {
            if (row.count === 0) {
                const adminPassword = await bcrypt.hash('admin123', 10);
                const treasurerPassword = await bcrypt.hash('treasurer123', 10);
                
                db.run(`
                    INSERT INTO users (name, email, phone, password, role, tier, shares, balance, joined, lastPayment, status, approved)
                    VALUES 
                    ('Admin User', 'admin@masonko.com', '0821234567', ?, 'admin', 3, 3, 14400, '2024-01-15', '2026-01-13', 'current', 1),
                    ('Treasurer User', 'treasurer@masonko.com', '0832345678', ?, 'treasurer', 2, 2, 9600, '2024-02-20', '2026-01-13', 'current', 1)
                `, [adminPassword, treasurerPassword], (err) => {
                    if (err) {
                        console.error('Error seeding users:', err);
                    } else {
                        console.log('Default users created');
                    }
                });
                
                // Seed default settings
                const defaultSettings = [
                    ['clubName', 'Masonko Stokvel-Guptas'],
                    ['lateFee', '50'],
                    ['loanInterestRate', '10'],
                    ['paymentDueDay', '1']
                ];
                
                const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
                defaultSettings.forEach(setting => stmt.run(setting));
                stmt.finalize();
            }
        });
    });
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// Routes

// Register new user
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, phone, password, tier } = req.body;
        
        // Check if user exists
        db.get('SELECT * FROM users WHERE email = ? OR phone = ?', [email, phone], async (err, row) => {
            if (row) {
                return res.status(400).json({ error: 'User already exists' });
            }
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Calculate shares based on tier
            const shares = tier;
            
            db.run(`
                INSERT INTO users (name, email, phone, password, role, tier, shares, balance, joined, status, approved)
                VALUES (?, ?, ?, ?, 'member', ?, ?, 0, DATE('now'), 'pending', 0)
            `, [name, email, phone, hashedPassword, tier, shares], function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Registration failed' });
                }
                res.json({ 
                    message: 'Registration successful. Awaiting approval.',
                    userId: this.lastID
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/login', (req, res) => {
    const { identifier, password } = req.body;
    
    db.get('SELECT * FROM users WHERE email = ? OR phone = ?', [identifier, identifier], async (err, user) => {
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        if (!user.approved) {
            return res.status(403).json({ error: 'Account pending approval' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ 
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                tier: user.tier,
                shares: user.shares,
                balance: user.balance
            }
        });
    });
});

// Get all members (authenticated)
app.get('/api/members', authenticateToken, (req, res) => {
    db.all('SELECT id, name, email, phone, role, tier, shares, balance, joined, lastPayment, status FROM users WHERE approved = 1', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Get pending members (admin/treasurer only)
app.get('/api/pending-members', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'treasurer') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    db.all('SELECT * FROM users WHERE approved = 0', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Approve member
app.post('/api/approve-member/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'treasurer') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    db.run('UPDATE users SET approved = 1, status = ? WHERE id = ?', ['current', req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Member approved' });
    });
});

// Submit payment with proof
app.post('/api/submit-payment', authenticateToken, upload.single('proof'), (req, res) => {
    const { amount, method, reference, date, notes } = req.body;
    const proofPath = req.file ? req.file.path : null;
    
    db.run(`
        INSERT INTO pendingPayments (memberId, memberName, amount, method, reference, date, notes, proofPath, status)
        SELECT id, name, ?, ?, ?, ?, ?, ?, 'pending' FROM users WHERE id = ?
    `, [amount, method, reference, date, notes, proofPath, req.user.id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to submit payment' });
        }
        res.json({ message: 'Payment submitted', paymentId: this.lastID });
    });
});

// Get pending payments (treasurer/admin only)
app.get('/api/pending-payments', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'treasurer') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    db.all('SELECT * FROM pendingPayments WHERE status = ?', ['pending'], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Approve payment
app.post('/api/approve-payment/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'treasurer') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    db.get('SELECT * FROM pendingPayments WHERE id = ?', [req.params.id], (err, payment) => {
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        db.serialize(() => {
            // Update payment status
            db.run('UPDATE pendingPayments SET status = ?, confirmedBy = ?, confirmedDate = CURRENT_TIMESTAMP WHERE id = ?', 
                ['confirmed', req.user.name, req.params.id]);
            
            // Add to contributions
            db.run(`
                INSERT INTO contributions (memberId, amount, method, reference, proofPath, date, recordedBy, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed')
            `, [payment.memberId, payment.amount, payment.method, payment.reference, payment.proofPath, payment.date, req.user.name]);
            
            // Update member balance and status
            db.run('UPDATE users SET balance = balance + ?, lastPayment = ?, status = ? WHERE id = ?', 
                [payment.amount, payment.date, 'current', payment.memberId]);
            
            res.json({ message: 'Payment approved' });
        });
    });
});

// Submit loan application
app.post('/api/loans', authenticateToken, (req, res) => {
    const { amount, term, applicationDetails } = req.body;
    const interest = 10; // 10% per annum
    const outstanding = amount * (1 + (interest / 100) * (term / 52));
    
    db.run(`
        INSERT INTO loans (memberId, amount, term, interest, outstanding, applicationDate, applicationDetails, status)
        VALUES (?, ?, ?, ?, ?, DATE('now'), ?, 'pending')
    `, [req.user.id, amount, term, interest, outstanding, JSON.stringify(applicationDetails)], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to submit loan' });
        }
        res.json({ message: 'Loan application submitted', loanId: this.lastID });
    });
});

// Get loans
app.get('/api/loans', authenticateToken, (req, res) => {
    const query = req.user.role === 'admin' || req.user.role === 'loan-officer' 
        ? 'SELECT * FROM loans' 
        : 'SELECT * FROM loans WHERE memberId = ?';
    const params = req.user.role === 'admin' || req.user.role === 'loan-officer' 
        ? [] 
        : [req.user.id];
    
    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`Masonko Stokvel server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});
