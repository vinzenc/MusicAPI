import { addHistoryRecord, getRecentHistoryDB } from '../models/listenHistoryModel.js';

export const recordListen = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const songId = Number(req.body.songId);

        if (!songId) {
            return res.status(400).json({
                success: false,
                message: "Thiếu ID bài hát (songId)"
            });
        }

        const isRecorded = await addHistoryRecord(userId, songId);

        if (isRecorded) {
            return res.status(201).json({
                success: true,
                message: "Đã ghi nhận lịch sử nghe nhạc"
            });
        } else {
            throw new Error("Không thể insert vào DB");
        }

    } catch (error) {
        console.error("Lỗi ghi lịch sử:", error.message);
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi lưu lịch sử"
        });
    }
};

export const getHistory = async (req, res) => {
    try {
        const { id: userId } = req.user;
        
        // Gọi model lấy tối đa 20 bài hát gần nhất
        const historySongs = await getRecentHistoryDB(userId, 20);

        res.status(200).json({
            success: true,
            data: historySongs
        });

    } catch (error) {
        console.error("Lỗi lấy lịch sử:", error.message);
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi tải lịch sử nghe nhạc"
        });
    }
};