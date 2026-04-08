import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; 
import userRoutes from './src/routes/userRoutes.js';
import authRoutes from './src/routes/authRouters.js';
import musicRoutes from './src/routes/musicRoutes.js';

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

//API routes
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/music', musicRoutes);

// Server chạy backend
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});