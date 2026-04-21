import * as UserModel from '../models/userModel.js';
import { sendResetEmail } from '../config/mailer.js';
import bcrypt from 'bcrypt';

// GET /admin/users?role=
export const fetchUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const users = await UserModel.getAllUsers(role || null);
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /admin/users/:id
export const fetchUserById = async (req, res) => {
    try {
        const user = await UserModel.getUserById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user!' });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /admin/users
export const addUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ tên, email và mật khẩu!' });
        }
        const existing = await UserModel.getUserByEmail(email);
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email này đã được sử dụng!' });
        }
        // Chỉ cho phép tạo user hoặc collaborator, không tạo thêm admin
        const assignedRole = role === 'collaborator' ? 'collaborator' : 'user';
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = await UserModel.createUser(name, email, hashPassword, assignedRole);
        res.status(201).json({ success: true, message: `Tạo tài khoản "${assignedRole}" thành công!`, data: newUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /admin/users/:id
export const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;
        if (!name && !email) {
            return res.status(400).json({ success: false, message: 'Cần ít nhất tên hoặc email để cập nhật!' });
        }
        const existing = await UserModel.getUserById(id);
        if (!existing) return res.status(404).json({ success: false, message: 'Không tìm thấy user!' });

        await UserModel.updateUser(id, name || existing.name, email || existing.email);
        res.status(200).json({
            success: true,
            message: 'Cập nhật thành công!',
            data: { id, name: name || existing.name, email: email || existing.email }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /admin/users/:id
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ success: false, message: 'Không thể tự xóa tài khoản của mình!' });
        }
        const deleted = await UserModel.deleteUser(id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Không tìm thấy user!' });
        res.status(200).json({ success: true, message: 'Đã xóa user thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /admin/users/:id/role
export const changeRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!role) return res.status(400).json({ success: false, message: 'Vui lòng cung cấp role mới!' });
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ success: false, message: 'Không thể tự thay đổi role của mình!' });
        }
        const user = await UserModel.getUserById(id);
        if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user!' });

        await UserModel.updateUserRole(id, role);
        res.status(200).json({ success: true, message: `Đã thay đổi role của "${user.name}" thành "${role}"!` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /admin/users/:id/password
// export const changePassword = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { newPassword } = req.body;
//         if (!newPassword) return res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu mới!' });

//         const user = await UserModel.getUserById(id);
//         if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user!' });

//         const hashPassword = await bcrypt.hash(newPassword, 10);
//         await UserModel.updatePassword(id, hashPassword);
//         res.status(200).json({ success: true, message: `Đã đổi mật khẩu cho "${user.name}" thành công!` });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// POST /admin/users/:id/force-reset
export const forceResetPassword = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Tìm user theo id
        const user = await UserModel.getUserById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy user!' });
        }

        // 2. Tạo OTP và thời gian hết hạn
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60000); // 15 phút

        // 3. Lưu OTP vào DB — dùng pool.query trực tiếp như forgotPassword
        await pool.query(
            "UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE id = ?",
            [otp, expiresAt, id]
        );

        // 4. Gửi email OTP cho user
        await sendResetEmail(user.email, otp);

        res.status(200).json({
            success: true,
            message: `Đã gửi mã OTP khôi phục mật khẩu đến email của "${user.name}"!`
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};