import express from 'express';
import { 
    addPlaylist, 
    addSongToPlaylists, 
    removePlaylist, 
    getPlaylistSongs 
} from '../controllers/playlistController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(verifyToken);
router.post('/add', addPlaylist);
router.get('/:playlistId/songs', getPlaylistSongs);
router.post('/:playlistId/songs', addSongToPlaylists);
router.delete('/:playlistId', removePlaylist);

export default router;