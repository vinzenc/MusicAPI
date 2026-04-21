import express from 'express'
import {
  createSongJson,
  createSongMultipart,
  getAllSongs,
  getSingleSong,
  listenSong,
  likeSong,
  removeSong,
  reviewSongByModerator,
  updateSongJson,
  updateSongMultipart,
  uploadAudioOnly,
  uploadCoverOnly,
  getMusicList,
  searchMusic,
  getSearchHistory, 
  clearSearchHistory, 
  deleteHistoryItem
} from '../controllers/musicController.js'
import { requireModeratorRole } from '../middlewares/moderationMiddleware.js'
import { verifyToken } from '../middlewares/authMiddleware.js'
import { uploadAudio, uploadCover, uploadSongFiles } from '../middlewares/uploadMiddleware.js'

const router = express.Router()

router.get('/songs', getAllSongs)
router.get('/songs/:id/listen', listenSong)
router.get('/songs/:id', getSingleSong)

router.post('/songs', createSongJson)
router.put('/songs/:id', updateSongJson)
router.delete('/songs/:id', removeSong)

router.post('/songs/multipart', uploadSongFiles, createSongMultipart)
router.put('/songs/:id/multipart', uploadSongFiles, updateSongMultipart)
router.post('/songs/upload', uploadAudio.single('audio'), uploadAudioOnly)
router.post('/songs/upload-cover', uploadCover.single('cover'), uploadCoverOnly)

router.patch('/songs/:id/review', verifyToken, requireModeratorRole, reviewSongByModerator)
router.post('/songs/:id/like', likeSong)

// Các route cho List và Search (Không cần đăng nhập)
router.get('/list', getMusicList);
router.get('/search', searchMusic);

//router lay lich su tim kiem
router.get('/history', getSearchHistory); 
router.delete('/history', clearSearchHistory);

router.delete('/history/:keyword', deleteHistoryItem);




export default router
