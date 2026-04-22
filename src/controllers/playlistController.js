import { 
    checkPlaylist,
    checkSongInPlaylist,
    createPlaylist,
    deletePlaylist,
    getSongsByPlaylistId,
    addSongToPlaylist  
} from '../models/playlistModel.js';

export const addPlaylist = async (req, res) => {
    try {
        const { id: userId } = req.user;
        let { playlistName } = req.body;

       
        if (!playlistName || playlistName.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập tên Playlist!"
            });
        }
        playlistName = playlistName.trim(); 
        const isExist = await checkPlaylist(userId, playlistName);
        if (isExist) {
            return res.status(400).json({
                success: false,
                message: "Bạn đã có Playlist với tên này rồi, vui lòng chọn tên khác!"
            });
        }

        const newPlaylistId = await createPlaylist(userId, playlistName);

        if (newPlaylistId) {
            return res.status(201).json({
                success: true,
                message: "Tạo Playlist thành công!",
                data: {
                    playlistId: newPlaylistId,
                    name: playlistName
                }
            });
        } else {
            throw new Error("Không thể tạo Playlist trong CSDL");
        }

    } catch (error) {
        console.error("Lỗi tạo Playlist:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi tạo Playlist"
        });
    }
};

export const addSongToPlaylists = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { playlistId } = req.params;
        const { songId } = req.body;       

        if (!songId) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng cung cấp ID bài hát!" 
            });
        }

        const isExist = await checkSongInPlaylist(playlistId, songId);
        if (isExist) {
            return res.status(400).json({ 
                success: false, 
                message: "Bài hát này đã có trong Playlist rồi!" 
            });
        }

        const isAdded = await addSongToPlaylist(playlistId, songId);
        if (isAdded) {
            return res.status(201).json({
                success: true,
                message: "Đã thêm bài hát vào Playlist!"
            });
        } else {
            throw new Error("Lỗi chèn dữ liệu vào bảng playlist_songs");
        }

    } catch (error) {
        console.error("Lỗi thêm nhạc vào Playlist:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi thêm bài hát"
        });
    }
};

export const removePlaylist = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { playlistId } = req.params; 
        const isDeleted = await deletePlaylist(playlistId, userId);

        if (isDeleted) {
            return res.status(200).json({
                success: true,
                message: "Xóa Playlist thành công!"
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Playlist hoặc bạn không có quyền thực hiện thao tác này!"
            });
        }

    } catch (error) {
        console.error("Lỗi xóa Playlist:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi xóa Playlist"
        });
    }
};

export const getPlaylistSongs = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { playlistId } = req.params;

        const songs = await getSongsByPlaylistIdy(playlistId);
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách bài hát thành công!",
            data: songs
        });

    } catch (error) {
        console.error("Lỗi lấy danh sách bài hát trong Playlist:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi tải danh sách Playlist"
        });
    }
};
