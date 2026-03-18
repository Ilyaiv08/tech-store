import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import walletRoutes from './routes/wallet.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import rentalRoutes from './routes/rentals.js';
import { initDb } from './db/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Инициализация БД
initDb();

// Middleware - разрешаем CORS для фронтенда
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173', 'http://127.0.0.1:4173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Раздача загруженных изображений
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/rentals', rentalRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Tech Store API is running' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: 'Internal server error: ' + err.message });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 API available at http://localhost:${PORT}/api`);
    console.log(`📷 Uploads available at http://localhost:${PORT}/uploads`);
    console.log(`💰 Wallet API: http://localhost:${PORT}/api/wallet`);
    console.log(`🛒 Cart API: http://localhost:${PORT}/api/cart`);
    console.log(`📦 Orders API: http://localhost:${PORT}/api/orders`);
    console.log(`🐘 Database: PostgreSQL (Prisma ORM)`);
});
