import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './src/routes/userRoutes.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());

//API Endpoints
app.use('/users', userRoutes);


//Server chạy backend
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});