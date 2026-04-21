import express from 'express';

import { getFavoriteSongs, favoriteSong } from '../controllers/favoriteController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.post('/like', favoriteSong);
router.get('/', getFavoriteSongs);

export default router;