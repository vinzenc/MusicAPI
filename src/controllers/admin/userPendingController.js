import * as PendingModel from '../../models/pendingTrackModel.js';

// POST /pending  — User đề xuất bài nhạc (cần đăng nhập)
export const submitTrack = async (req, res) => {
    try {
        const { title, artist } = req.body;
        if (!title || !artist) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập tên bài và nghệ sĩ!' });
        }
        const id = await PendingModel.submitPendingTrack(req.body, req.user.id);
        res.status(201).json({ success: true, message: 'Đã gửi đề xuất thành công! Chờ admin duyệt.', data: { id } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /pending/mine  — User xem các đề xuất của mình
export const getMySubmissions = async (req, res) => {
    try {
        const [rows] = await (await import('../../config/db.js')).default.query(
            'SELECT * FROM pending_tracks WHERE submitted_by = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
