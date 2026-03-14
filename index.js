import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // 1. Import thêm cors
import userRoutes from './src/routes/userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 2. Kích hoạt middleware CORS cho phép frontend gọi tới
// (Trong môi trường thực tế, bạn có thể truyền thêm origin của frontend vào đây để bảo mật hơn)
app.use(cors()); 

app.use(express.json());

// 3. SỬA LỖI 404: Thêm tiền tố '/api' để khớp với đường dẫn bên frontend
app.use('/users', userRoutes);

// Server chạy backend
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});