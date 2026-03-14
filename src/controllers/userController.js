import * as UserModel from '../models/userModel.js';

// Xử lý lấy danh sách user
export const fetchUsers = async (req, res) => {
    try {
        const users = await UserModel.getAllUsers();
        res.status(200).json({
            success: true,
            data: users
        });
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

// Xử lý thêm user mới
export const addUser = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: "Thiếu tên rồi bạn ơi!" });
        }
        const newUser = await UserModel.createUser(name);
        res.status(201).json({
            success: true,
            message: "Tạo user thành công!",
            data: newUser
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID từ trên đường dẫn URL xuống
        
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

export const editUser = async (req, res) => {
    try {
        const { id } = req.params; // 1. Lấy ID từ URL (Sửa ai?)
        const { name } = req.body; // 2. Lấy tên mới từ Body (Sửa thành gì?)

        // Kiểm tra xem có gửi tên mới lên không
        if (!name) {
            return res.status(400).json({ success: false, message: "Bạn chưa nhập tên mới!" });
        }

        const affectedRows = await UserModel.updateUser(id, name);

        // Nếu ID không tồn tại trong DB
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy user này để cập nhật!" });
        }

        res.status(200).json({
            success: true,
            message: "Cập nhật tên user thành công!",
            data: { id, name } // Trả về data mới cho Frontend dễ dùng
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};