import express from 'express';
import {
    fetchUsers, fetchUserById
} from '../../controllers/admin/adminUserController.js';
import { verifyToken, checkRole } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Tất cả route đều yêu cầu đăng nhập + là admin
router.use(verifyToken, checkRole(['admin']));

router.get('/', fetchUsers);                  // Lấy danh sách ?role=
router.get('/:id', fetchUserById);            // Lấy 1 user

export default router;
