import express from 'express';
import { fetchUsers, fetchUserById, addUser, editUser, deleteUser, changeUserRole,changePassword } from '../controllers/userController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Tất cả route bên dưới đều yêu cầu đăng nhập + là admin
router.use(verifyToken, checkRole(['admin']));

router.get('/', fetchUsers);          
router.get('/:id', fetchUserById); 
router.post('/add', addUser);         // Admin tạo thẳng tài khoản
router.delete('/:id', deleteUser);    
router.put('/:id', editUser);     
router.patch('/:id/role', changeUserRole);  // PATCH /users/:id/role  ← Nâng/hạ quyền    
router.put('/:id/password', changePassword); // Admin đổi mật khẩu cho user

export default router;