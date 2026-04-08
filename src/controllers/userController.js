import * as UserModel from '../models/userModel.js';
import bcrypt from 'bcrypt';

// Xử lý lấy danh sách user
// GET /users hoặc GET /users?role=collaborator
export const fetchUsers = async (req, res) => {
    try {
        const { role } = req.query; // ?role=collaborator
        const users = await UserModel.getAllUsers(role || null);
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const fetchUserById = async (req, res) => {
    try {
        const { id } = req.params; // Lấy con số trên URL
        
        const user = await UserModel.getUserById(id);
        
        // Nếu không tìm thấy ai (user bị undefined)
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy user này!" 
            });
        }

        // Trả về dữ liệu nếu tìm thấy
        res.status(200).json({ 
            success: true, 
            data: user 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xử lý thêm user mới (admin tạo thẳng)
export const addUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng điền đầy đủ tên, email và mật khẩu!" 
            });
        }

        // Nếu không truyền role → mặc định 'user'
        // Nếu có truyền role → chỉ cho phép 'user' hoặc 'collaborator'
        // Admin không thể tạo thêm admin khác qua đây
        const assignedRole = role === 'collaborator' ? 'collaborator' : 'user';
        //                    ↑
        //          Đây là chỗ "nâng quyền" lên CTV
        //          Chỉ có 2 lựa chọn, không thể tạo admin

        const existing = await UserModel.getUserByEmail(email);
        if (existing) {
            return res.status(400).json({ 
                success: false, 
                message: "Email này đã được sử dụng!" 
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = await UserModel.createUser(name, email, hashPassword, assignedRole);

        res.status(201).json({
            success: true,
            message: `Tạo tài khoản "${assignedRole}" thành công!`,
            data: newUser
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID từ trên đường dẫn URL xuống
        
        // Không cho phép tự xóa chính mình
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ success: false, message: "Không thể tự xóa tài khoản của mình!" });
        }

        const affectedRows = await UserModel.deleteUser(id);
        
        // Nếu affectedRows là 0, nghĩa là ID đó không tồn tại trong DB
        if (affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy user này để xóa!" 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Đã xóa user thành công!" 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /users/:id
export const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        if (!name && !email) {
            return res.status(400).json({ success: false, message: "Cần ít nhất tên hoặc email để cập nhật!" });
        }

        // Lấy thông tin cũ để giữ nguyên field không gửi lên
        const existing = await UserModel.getUserById(id);
        if (!existing) {
            return res.status(404).json({ success: false, message: "Không tìm thấy user!" });
        }

        const affectedRows = await UserModel.updateUser(
            id,
            name || existing.name,
            email || existing.email
        );

        res.status(200).json({
            success: true,
            message: "Cập nhật thành công!",
            data: { id, name: name || existing.name, email: email || existing.email }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /users/:id/role  — CHỈ ADMIN
export const changeUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp role mới!" });
        }

        // Không cho phép tự thay đổi role của mình
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ success: false, message: "Không thể tự thay đổi role của mình!" });
        }

        const user = await UserModel.getUserById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy user!" });
        }

        await UserModel.updateUserRole(id, role);

        res.status(200).json({
            success: true,
            message: `Đã thay đổi role của "${user.name}" thành "${role}"!`,
            data: { id, name: user.name, role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
//xử lý thay đổi mật khẩu cho user/ctv (admin thao tác)
export const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng nhập mật khẩu mới!" 
            });
        }

        const user = await UserModel.getUserById(id);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy user!" 
            });
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);
        await UserModel.updatePassword(id, hashPassword);

        res.status(200).json({
            success: true,
            message: `Đã đổi mật khẩu cho "${user.name}" thành công!`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};