import pool from '../config/db.js';

// Hàm lấy tất cả người dùng
export const getAllUsers = async () => {
    const [rows] = await pool.query("SELECT * FROM users");
    return rows;
};

// Hàm lấy người dùng theo ID
export const getUserById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0]; 
};

// Hàm tạo người dùng mới
export const createUser = async (name) => {
    const [result] = await pool.query("INSERT INTO users (name) VALUES (?)", [name]);
    return { id: result.insertId, name };
};

export const deleteUser = async (id) => {
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
    return result.affectedRows > 0;
};

// Hàm cập nhật thông tin người dùng
export const updateUser = async (id, name) => {
    const [result] = await pool.query(
        "UPDATE users SET name = ? WHERE id = ?", 
        [name, id]
    );
    return result.affectedRows; 
};

//Lấy người dùng  theo email
export const getUserByEmail = async (email) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?",[email]);
    return rows[0];
};

//Đăng ký người dùng mới
export const register = async (name,email,hashPassword) => {
    const [result] = await pool.query("INSERT INTO users (name,email,password) VALUES (?,?,?)", [name,email,hashPassword]);
    return result.insertId;
};