import express from 'express';
import {
    getTracks, getTrackById, addTrack, editTrack, removeTrack,
    getPending, approvePending, rejectPending, deletePending,
    getStats
} from '../../controllers/admin/adminMusicController.js';
import { verifyToken, checkRole } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Tất cả route đều yêu cầu đăng nhập + là admin
router.use(verifyToken, checkRole(['admin']));

// ── Thống kê ───────────────────────────────────────────────────
router.get('/stats', getStats);

// ── CRUD Tracks ────────────────────────────────────────────────
router.get('/tracks', getTracks);         // Lấy danh sách (filter, phân trang)
router.get('/tracks/:id', getTrackById);  // Lấy 1 track
router.post('/tracks', addTrack);         // Thêm track
router.put('/tracks/:id', editTrack);     // Sửa track
router.delete('/tracks/:id', removeTrack);// Xóa track

// ── Duyệt Pending Tracks ───────────────────────────────────────
router.get('/pending', getPending);                    // Danh sách pending ?status=
router.post('/pending/:id/approve', approvePending);   // Duyệt → thêm vào tracks
router.post('/pending/:id/reject', rejectPending);     // Từ chối
router.delete('/pending/:id', deletePending);           // Xóa hẳn

export default router;
