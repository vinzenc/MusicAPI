import express from 'express';
import { recordListen, getHistory } from '../controllers/listenHistoryController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.post('/', recordListen);
router.get('/', getHistory);

export default router;