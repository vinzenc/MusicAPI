import express from 'express';
import {
    fetchUsers, fetchUserById, addUser, editUser, deleteUser,
    changeRole, changePassword
} from '../../controllers/admin/adminUserController.js';
import { verifyToken, checkRole } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Tất cả route đều yêu cầu đăng nhập + là admin
router.use(verifyToken, checkRole(['admin']));

router.get('/', fetchUsers);                  // Lấy danh sách ?role=
router.get('/:id', fetchUserById);            // Lấy 1 user
router.post('/', addUser);                    // Tạo user mới
router.put('/:id', editUser);                 // Sửa tên/email
router.delete('/:id', deleteUser);            // Xóa user
router.patch('/:id/role', changeRole);        // Nâng/hạ role
router.put('/:id/password', changePassword);  // Đổi mật khẩu

export default router;
