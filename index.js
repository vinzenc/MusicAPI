import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; 
import adminRoutes from './src/routes/adminRoutes.js';
import authRoutes from './src/routes/authRouters.js';
import favoriteRouters from './src/routes/favoriteRouters.js';
import musicRoutes from './src/routes/musicRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';
import { uploadErrorMiddleware } from './src/middlewares/uploadErrorMiddleware.js';
import { pingDatabase } from './src/utils/dbHealth.js';
import { bootstrapMusicSchema } from './src/bootstrap/musicBootstrap.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// Bat middleware co ban cho CORS va JSON body.
app.use(cors()); 
app.use(express.json());

// Health-check endpoint de theo doi trang thai server + database.
app.get('/health', async (_req, res) => {
    const db = await pingDatabase();
    if (!db.ok) {
        return res.status(503).json({ status: 'DEGRADED', message: 'Server is running', database: 'disconnected' });
    }

    res.status(200).json({ status: 'OK', message: 'Server is running', database: 'connected' });
});

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Music API Backend' });
});

// ── API routes
app.use('/admin/users', adminRoutes);
app.use('/auth', authRoutes);
app.use('/favorite',favoriteRouters);
app.use('/api', musicRoutes);
app.use('/profile', profileRoutes);
app.use(uploadErrorMiddleware);

// Server chạy backend
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});


