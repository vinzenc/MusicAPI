import express from 'express';
import { submitTrack, getMySubmissions } from '../../controllers/admin/userPendingController.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Tất cả cần đăng nhập (không cần là admin)
router.use(verifyToken);

router.post('/', submitTrack);         // Đề xuất bài nhạc mới
router.get('/mine', getMySubmissions); // Xem đề xuất của mình

export default router;
