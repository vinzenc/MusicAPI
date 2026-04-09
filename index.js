import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; 
import userRoutes from './src/routes/userRoutes.js';
import authRoutes from './src/routes/authRouters.js';
import musicRoutes from './src/routes/musicRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';
import adminMusicRoutes from './src/routes/admin/adminMusicRoutes.js';
import adminUserRoutes from './src/routes/admin/adminUserRoutes.js';
import pendingRoutes from './src/routes/admin/pendingRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); 
app.use(express.json());

// Health check endpoint cho Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Music API Backend' });
});

// ── API routes
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/music', musicRoutes);
app.use('/profile', profileRoutes);

// ── API routes Admin
app.use('/admin/music', adminMusicRoutes);   
app.use('/admin/users', adminUserRoutes);    
app.use('/pending', pendingRoutes);          

// Server chạy backend
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});