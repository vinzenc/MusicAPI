// src/models/historyModel.js
import pool from '../config/db.js';

// 1. Lưu từ khóa mới
export const saveKeyword = async (keyword) => {
    // Xóa từ khóa cũ nếu bị trùng (để đẩy nó lên lại vị trí đầu tiên)
    await pool.query("DELETE FROM search_history WHERE keyword = ?", [keyword]);
    
    // Thêm từ khóa vào DB
    await pool.query("INSERT INTO search_history (keyword) VALUES (?)", [keyword]);
};

// 2. Lấy danh sách 15 từ khóa tìm kiếm gần nhất
export const getRecentHistory = async () => {
    const [rows] = await pool.query("SELECT keyword FROM search_history ORDER BY created_at DESC LIMIT 15");
    // Biến mảng object [{keyword: "lofi"}, ...] thành mảng chuỗi ["lofi", ...] cho Frontend dễ dùng
    return rows.map(row => row.keyword); 
};

// 3. Xóa toàn bộ lịch sử
export const clearAllHistory = async () => {
    await pool.query("DELETE FROM search_history");
};

// Hàm xóa một từ khóa cụ thể (VD: "đen vâu")
export const deleteOneHistory = async (keyword) => {
    const [result] = await pool.query(
        "DELETE FROM search_history WHERE keyword = ?", 
        [keyword]
    );
    return result.affectedRows; // Trả về số dòng bị xóa
};