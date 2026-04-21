import * as UserModel from '../models/userModel.js';
import bcrypt from 'bcrypt';

// User/CTV tự sửa thông tin bản thân
export const updateProfile = async (req, res) => {
    try {
        // Lấy id từ token (không phải từ URL)
        const id = req.user.id;
        const { name, email } = req.body;

        if (!name && !email) {
            return res.status(400).json({
                success: false,
                message: "Cần ít nhất tên hoặc email để cập nhật!"
            });
        }

        const existing = await UserModel.getUserById(id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tài khoản!"
            });
        }

        // Kiểm tra email mới có bị trùng không
        if (email && email !== existing.email) {
            const emailExist = await UserModel.getUserByEmail(email);
            if (emailExist) {
                return res.status(400).json({
                    success: false,
                    message: "Email này đã được sử dụng!"
                });
            }
        }

        await UserModel.updateUser(
            id,
            name || existing.name,
            email || existing.email
        );

        res.status(200).json({
            success: true,
            message: "Cập nhật thông tin thành công!",
            data: {
                id,
                name: name || existing.name,
                email: email || existing.email,
                role: existing.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// User/CTV tự đổi mật khẩu của mình
export const updateOwnPassword = async (req, res) => {
    try {
        const id = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới!"
            });
        }

        // Lấy thông tin user kèm password
        const user = await UserModel.getUserByEmail(
            (await UserModel.getUserById(id)).email
        );

        // Kiểm tra mật khẩu hiện tại có đúng không
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu hiện tại không đúng!"
            });
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);
        await UserModel.updatePassword(id, hashPassword);

        res.status(200).json({
            success: true,
            message: "Đổi mật khẩu thành công!"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }

    // Lấy thông tin cá nhân của người dùng hiện tại
export const getProfile = async (req, res) => {
    try {
        // req.user.id lấy từ verifyToken middleware
        const id = req.user.id; 
        const user = await UserModel.getUserById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng!"
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
};