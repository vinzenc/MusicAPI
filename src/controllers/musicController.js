import https from 'https';
import * as HistoryModel from '../models/historyModel.js';

// Hàm gọi Deezer API
function deezerGet(apiPath) {
    return new Promise((resolve, reject) => {
        https.get(`https://api.deezer.com${apiPath}`, res => {
            let raw = '';
            res.on('data', c => raw += c);
            res.on('end', () => {
                try { resolve(JSON.parse(raw)); } 
                catch { reject(new Error('Lỗi parse dữ liệu Deezer')); }
            });
        }).on('error', reject);
    });
}

// Tìm kiếm nhạc
export const searchMusic = async (req, res) => {
    try {
        const { q, limit = 20 } = req.query;

        if (!q || !q.trim()) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập từ khóa tìm kiếm!"
            });
        }

        const data = await deezerGet(
            `/search?q=${encodeURIComponent(q)}&limit=${limit}`
        );

        // ---> ĐOẠN CODE MỚI THÊM VÀO: LƯU LỊCH SỬ <---
        try {
            await HistoryModel.saveKeyword(q.trim());
        } catch (dbError) {
            console.error("Lỗi khi lưu lịch sử tìm kiếm vào DB:", dbError);
            // Dù lỗi lưu DB cũng không được làm sập chức năng trả nhạc về cho Frontend
        }
        // ----------------------------------------------

        res.status(200).json({
            success: true,
            query: q,
            total: data.total,
            data: data.data.map(track => ({
                id: track.id,
                title: track.title,
                artist: track.artist?.name,
                album: track.album?.title,
                cover: track.album?.cover_medium,
                preview: track.preview,    // link nghe thử 30 giây
                duration: track.duration
            }))
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Nhạc thịnh hành
export const getChartMusic = async (req, res) => {
    try {
        const data = await deezerGet('/chart/0/tracks?limit=20');

        res.status(200).json({
            success: true,
            data: data.data.map(track => ({
                id: track.id,
                title: track.title,
                artist: track.artist?.name,
                album: track.album?.title,
                cover: track.album?.cover_medium,
                preview: track.preview,
                duration: track.duration
            }))
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

//  CODE MỚI: HÀM LẤY LỊCH SỬ
export const getSearchHistory = async (req, res) => {
    try {
        const history = await HistoryModel.getRecentHistory();
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy lịch sử tìm kiếm" });
    }
};

//  CODE MỚI: HÀM XÓA LỊCH SỬ
export const clearSearchHistory = async (req, res) => {
    try {
        await HistoryModel.clearAllHistory();
        res.status(200).json({ success: true, message: "Đã xóa toàn bộ lịch sử tìm kiếm" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi khi xóa lịch sử" });
    }
};

// Xử lý API xóa 1 từ khóa
export const deleteHistoryItem = async (req, res) => {
    try {
        const { keyword } = req.params; // Lấy chữ "đen vâu" từ đuôi đường link
        const affectedRows = await HistoryModel.deleteOneHistory(keyword);

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy từ khóa này trong lịch sử" });
        }

        res.status(200).json({ success: true, message: `Đã xóa '${keyword}' khỏi lịch sử` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};