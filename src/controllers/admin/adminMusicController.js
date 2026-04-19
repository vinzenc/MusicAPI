import * as TrackModel from '../../models/trackModel.js';
import * as PendingModel from '../../models/pendingTrackModel.js';

// ─────────────────────── QUẢN LÝ TRACKS ───────────────────────────

// GET /admin/music/tracks/:id
export const getTrackById = async (req, res) => {
    try {
        const track = await TrackModel.getTrackById(req.params.id);
        if (!track) return res.status(404).json({ success: false, message: 'Không tìm thấy track!' });
        res.status(200).json({ success: true, data: track });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /admin/music/tracks
export const addTrack = async (req, res) => {
    try {
        const { title, artist } = req.body;
        if (!title || !artist) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập tên bài và nghệ sĩ!' });
        }
        const id = await TrackModel.createTrack(req.body);
        res.status(201).json({ success: true, message: 'Thêm track thành công!', data: { id } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /admin/music/tracks/:id
export const editTrack = async (req, res) => {
    try {
        const { title, artist } = req.body;
        if (!title || !artist) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập tên bài và nghệ sĩ!' });
        }
        const affected = await TrackModel.updateTrack(req.params.id, req.body);
        if (!affected) return res.status(404).json({ success: false, message: 'Không tìm thấy track!' });
        res.status(200).json({ success: true, message: 'Cập nhật thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /admin/music/tracks/:id
export const removeTrack = async (req, res) => {
    try {
        const deleted = await TrackModel.deleteTrack(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Không tìm thấy track!' });
        res.status(200).json({ success: true, message: 'Đã xóa track thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ────────────────────── DUYỆT BÀI HÁT CHỜ ──────────────────────────

// GET /admin/music/pending?status=pending|approved|rejected
export const getPending = async (req, res) => {
    try {
        const { status = 'pending' } = req.query;
        const data = await PendingModel.getPendingTracks(status);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /admin/music/pending/:id/approve
export const approvePending = async (req, res) => {
    try {
        const newId = await PendingModel.approvePending(req.params.id);
        res.status(200).json({ success: true, message: 'Đã duyệt và thêm vào bảng tracks!', data: { id: newId } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /admin/music/pending/:id/reject
export const rejectPending = async (req, res) => {
    try {
        const { admin_note = '' } = req.body;
        const affected = await PendingModel.rejectPending(req.params.id, admin_note);
        if (!affected) return res.status(404).json({ success: false, message: 'Không tìm thấy bản ghi!' });
        res.status(200).json({ success: true, message: 'Đã từ chối bản đề xuất này!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /admin/music/pending/:id
export const deletePending = async (req, res) => {
    try {
        const deleted = await PendingModel.deletePending(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Không tìm thấy bản ghi!' });
        res.status(200).json({ success: true, message: 'Đã xóa!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /admin/music/stats
export const getStats = async (req, res) => {
    try {
        const trackStats = await TrackModel.getTrackStats();
        const pendingCount = await PendingModel.countPending();
        res.status(200).json({
            success: true,
            data: {
                total_tracks: trackStats.total,
                active_tracks: trackStats.active,
                pending_count: pendingCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
