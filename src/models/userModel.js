import pool from '../config/db.js';

// Hàm lấy tất cả người dùng
export const getAllUsers = async () => {
    const [rows] = await pool.query("SELECT * FROM users");
    return rows;
};

// Hàm tạo người dùng mới
export const createUser = async (name) => {
    const [result] = await pool.query("INSERT INTO users (name) VALUES (?)", [name]);
    return { id: result.insertId, name };
};