import * as TrackModel from '../models/trackModel.js';
import * as HistoryModel from '../models/historyModel.js';

// ── TÌM KIẾM NHẠC (từ Database, không gọi API ngoài) ────────────
export const searchMusic = async (req, res) => {
    try {
        const { q, limit = 20, page = 1 } = req.query;

        // Kiểm tra từ khóa tìm kiếm
        if (!q || !q.trim()) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập từ khóa tìm kiếm!"
            });
        }

        // Lấy dữ liệu từ Database
        const { rows: trackData, total } = await TrackModel.getAllTracks({
            search: q.trim(),
            status: 'active',
            page: parseInt(page) || 1,
            limit: Math.min(parseInt(limit) || 20, 100)
        });

        // Lưu từ khóa vào lịch sử tìm kiếm (không làm sập nếu lỗi)
        try {
            await HistoryModel.saveKeyword(q.trim());
        } catch (dbError) {
            console.error("⚠️ Lỗi khi lưu lịch sử tìm kiếm:", dbError);
        }

        // Trả về kết quả
        res.status(200).json({
            success: true,
            query: q,
            total: total,
            page: parseInt(page) || 1,
            limit: Math.min(parseInt(limit) || 20, 100),
            data: trackData.map(track => ({
                id: track.id,
                title: track.title,
                artist: track.artist || 'Unknown',
                album: track.album || 'Unknown Album',
                cover: track.cover_url || '/default-cover.jpg',
                preview: track.preview_url || null,
                duration: track.duration || 0,
                genre: track.genre || ''
            }))
        });
    } catch (error) {
        console.error("❌ Lỗi tìm kiếm nhạc:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi tìm kiếm nhạc. Vui lòng thử lại!"
        });
    }
};

// ── LẤY NHẠC THỊNH HÀNH (Trending Tracks) ─────────────────────────
export const getChartMusic = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);

        // Lấy nhạc hoạt động từ Database, sắp xếp mới nhất
        const { rows: chartTracks } = await TrackModel.getAllTracks({
            status: 'active',
            page: 1,
            limit: limit
        });

        // Trả về dữ liệu
        res.status(200).json({
            success: true,
            total: chartTracks.length,
            data: chartTracks.map(track => ({
                id: track.id,
                title: track.title,
                artist: track.artist || 'Unknown',
                album: track.album || 'Unknown Album',
                cover: track.cover_url || '/default-cover.jpg',
                preview: track.preview_url || null,
                duration: track.duration || 0,
                genre: track.genre || ''
            }))
        });
    } catch (error) {
        console.error("❌ Lỗi lấy nhạc thịnh hành:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi lấy danh sách nhạc. Vui lòng thử lại!"
        });
    }
};

//  CODE MỚI: HÀM LẤY LỊCH SỬ
export const getSearchHistory = async (req, res) => {
    try {
        const history = await HistoryModel.getRecentHistory();
        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error("❌ Lỗi lấy lịch sử:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi lấy lịch sử tìm kiếm"
        });
    }
};

//  CODE MỚI: HÀM XÓA LỊCH SỬ
export const clearSearchHistory = async (req, res) => {
    try {
        await HistoryModel.clearAllHistory();
        res.status(200).json({
            success: true,
            message: "Đã xóa toàn bộ lịch sử tìm kiếm"
        });
    } catch (error) {
        console.error("❌ Lỗi xóa lịch sử:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi xóa lịch sử"
        });
    }
};

// Xử lý API xóa 1 từ khóa
export const deleteHistoryItem = async (req, res) => {
    try {
        const { keyword } = req.params;

        if (!keyword || !keyword.trim()) {
            return res.status(400).json({
                success: false,
                message: "Từ khóa không hợp lệ"
            });
        }

        const affectedRows = await HistoryModel.deleteOneHistory(keyword);

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy từ khóa này trong lịch sử"
            });
        }

        res.status(200).json({
            success: true,
            message: `Đã xóa '${keyword}' khỏi lịch sử`
        });
    } catch (error) {
        console.error("❌ Lỗi xóa từ khóa:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};