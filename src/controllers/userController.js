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
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};