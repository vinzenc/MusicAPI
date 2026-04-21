import express from 'express';
import { updateProfile, updateOwnPassword } from '../controllers/profileController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Tất cả đều cần đăng nhập, không cần phân biệt role
router.use(verifyToken);

router.put('/', updateProfile);              // Sửa tên/email
router.put('/password', updateOwnPassword);  // Đổi mật khẩu

export default router;