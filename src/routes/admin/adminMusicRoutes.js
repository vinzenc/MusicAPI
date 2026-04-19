import express from 'express';
import {
    getTrackById,
    getPending, approvePending, rejectPending, deletePending,
    getStats
} from '../../controllers/admin/adminMusicController.js';
import { verifyToken, checkRole } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Tất cả route đều yêu cầu đăng nhập + là admin
router.use(verifyToken, checkRole(['admin']));

// ── Thống kê ───────────────────────────────────────────────────────────────────────
router.get('/stats', getStats); // GET /admin/music/stats - Lấy thống kê

// ── Quản lý Tracks ──────────────────────────────────────────────────────────────────
router.get('/tracks/:id', getTrackById);   // GET /admin/music/tracks/:id - Lấy chi tiết bài hát

// ── Duyệt Bài Hát Chờ ───────────────────────────────────────────────────────────────
router.get('/pending', getPending);                    // GET /admin/music/pending - Danh sách chờ duyệt
router.post('/pending/:id/approve', approvePending);   // POST /admin/music/pending/:id/approve - Duyệt bài
router.post('/pending/:id/reject', rejectPending);     // POST /admin/music/pending/:id/reject - Từ chối bài
router.delete('/pending/:id', deletePending);          // DELETE /admin/music/pending/:id - Xóa bài chờ duyệt

export default router;
