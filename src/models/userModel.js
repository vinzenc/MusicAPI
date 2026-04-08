import pool from '../config/db.js';

// Hàm lấy tất cả người dùng
// Lấy tất cả users (có thể lọc theo role)
export const getAllUsers = async (role = null) => {
    if (role) {
        const [rows] = await pool.query("SELECT id, name, email, role, created_at FROM users WHERE role = ?", [role]);
        return rows;
    }
    const [rows] = await pool.query("SELECT id, name, email, role, created_at FROM users");
    return rows;
};


// Hàm lấy người dùng theo ID
// Lấy user theo ID
export const getUserById = async (id) => {
    const [rows] = await pool.query(
        "SELECT id, name, email, role, created_at FROM users WHERE id = ?", [id]
    );
    return rows[0];
};

// Hàm tạo người dùng mới (admin tạo thẳng)
export const createUser = async (name, email, hashPassword, role = 'user') => {
    const [result] = await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashPassword, role]
    );
    return { id: result.insertId, name, email, role };
};

export const deleteUser = async (id) => {
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
    return result.affectedRows > 0;
};

// Hàm cập nhật thông tin người dùng
export const updateUser = async (id, name, email) => {
    const [result] = await pool.query(
        "UPDATE users SET name = ?, email = ? WHERE id = ?", 
        [name, email, id]
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

// ==== ADMIN: Thay đổi role ====
export const updateUserRole = async (id, role) => {
    const VALID_ROLES = ['user', 'collaborator']; // Chỉ có 2 role hợp lệ
    if (!VALID_ROLES.includes(role)) {
        throw new Error("Role không hợp lệ");
    }
    const [result] = await pool.query(
        "UPDATE users SET role = ? WHERE id = ?",
        [role, id]
    );
    return result.affectedRows;
};
// ADMIN: thay đổi password cho user/ctv
export const updatePassword = async (id, hashPassword) => {
    const [result] = await pool.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashPassword, id]
    );
    return result.affectedRows;
};