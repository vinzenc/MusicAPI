import { checkFavorite, addFavorites, removeFavorites, getFavoritesByUserId } from "../models/favoriteModel.js";


export const favoriteSong = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { songId } =req.body;

        if(!songId){
            return res.status(400).json({
                success: false,
                message: "Thiếu songId"
            });
        }

        const isFavorite = await checkFavorite(userId, songId);
        if(isFavorite){
            const reFavorite = await removeFavorites(userId, songId);
            if(reFavorite){
                return res.status(200).json({ 
                    success: true, 
                    message: "Đã bỏ thích bài hát", 
                    isLiked: false 
                });
            }
            else{
                throw new Error("Lỗi không thể xóa favorite");
            }
        }

        const isAdded = await addFavorites(userId, songId);
        if (isAdded) {
            return res.status(201).json({ 
                success: true, 
                message: "Đã thêm vào mục yêu thích", 
                isLiked: true 
            });
        } else {
            throw new Error("Không thể thêm vào cơ sở dữ liệu");
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống xử lý favorite"
        });
        console.log("Lỗi Favorite Song", error);
    }
};

export const getFavoriteSongs = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const favoriteSongs = await getFavoritesByUserId(userId);

        res.status(200).json({
            success: true,
            data: favoriteSongs
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách yêu thích:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi lấy danh sách nhạc" 
        });
    }
};