import cloudinary from '../config/cloudinary.js'
import * as HistoryModel from '../models/historyModel.js';

import {
  createSong,
  deleteSong,
  getSongById,
  getSongs,
  reviewSong,
  updateSong,
} from '../models/songModel.js'
import { uploadSongAssets } from '../services/songUploadService.js'

// Chuan hoa releaseYear: de trong -> null, khong hop le -> NaN.
function normalizeReleaseYear(value) {
  if (value === undefined || value === null || value === '') return null
  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : NaN
}

// Chuan hoa duration ve so nguyen khong am.
function normalizeDuration(value) {
  if (value === undefined || value === null || value === '') return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : NaN
}

// Kiem tra cac truong bat buoc cho bai hat.
function ensureRequiredFields({ title, artist }, res) {
  if (!title || !artist) {
    res.status(400).json({ message: 'title va artist la bat buoc' })
    return false
  }
  return true
}

// Gom xu ly loi de tra ve status code thong nhat.
function handleMusicError(res, err, message) {
  if (err?.code === 'DB_NOT_READY') {
    return res.status(503).json({ message: 'Database tam thoi khong kha dung' })
  }

  return res.status(500).json({ message, error: err.message })
}

// Lay danh sach bai hat, co the loc theo status duyet.
export async function getAllSongs(req, res) {
  try {
    const songs = await getSongs({ status: req.query.status })
    return res.json(songs)
  } catch (err) {
    return handleMusicError(res, err, 'Loi lay danh sach bai hat')
  }
}

// Lay chi tiet bai hat theo id.
export async function getSingleSong(req, res) {
  try {
    const song = await getSongById(req.params.id)
    if (!song) return res.status(404).json({ message: 'Khong tim thay bai hat' })
    return res.json(song)
  } catch (err) {
    return handleMusicError(res, err, 'Loi lay bai hat')
  }
}

// API nghe nhac theo id.
export async function listenSong(req, res) {
  try {
    // B1: Tim bai hat trong DB.
    const song = await getSongById(req.params.id)
    if (!song) return res.status(404).json({ message: 'Khong tim thay bai hat' })

    // B2: Kiem tra bai hat co audioUrl hop le.
    const sourceAudioUrl = String(song.audioUrl || '').trim()
    if (!sourceAudioUrl) {
      return res.status(404).json({ message: 'Bai hat chua co nguon audio' })
    }

    // B3: Chan truong hop link de quy ve chinh endpoint listen.
    const selfListenPath = `/api/songs/${song.id}/listen`
    if (sourceAudioUrl.includes(selfListenPath)) {
      return res.status(400).json({ message: 'Nguon audio khong hop le' })
    }

    // B4: Chuyen huong den nguon audio de client phat nhac.
    return res.redirect(302, sourceAudioUrl)
  } catch (err) {
    return handleMusicError(res, err, 'Loi phat nhac')
  }
}

// Them bai hat thu cong bang JSON.
export async function createSongJson(req, res) {
  // B1: Doc payload tu request body.
  const {
    title,
    artist,
    album = '',
    genre = '',
    duration = 0,
    releaseYear = null,
    audioUrl = null,
    coverUrl = null,
    cloudinaryId = null,
  } = req.body

  // B2: Validate du lieu dau vao.
  if (!ensureRequiredFields({ title, artist }, res)) return

  const normalizedDuration = normalizeDuration(duration)
  const normalizedReleaseYear = normalizeReleaseYear(releaseYear)

  if (Number.isNaN(normalizedDuration) || Number.isNaN(normalizedReleaseYear)) {
    return res.status(400).json({ message: 'duration hoac releaseYear khong hop le' })
  }

  try {
    // B3: Tao bai hat va gan trang thai pending de cho duyet.
    const songId = await createSong({
      title: title.trim(),
      artist: artist.trim(),
      album,
      genre,
      duration: normalizedDuration,
      releaseYear: normalizedReleaseYear,
      audioUrl,
      coverUrl,
      cloudinaryId,
      approvalStatus: 'pending',
      reviewedByRole: null,
      reviewedAt: null,
    })

    const song = await getSongById(songId)
    return res.status(201).json(song)
  } catch (err) {
    return handleMusicError(res, err, 'Loi tao bai hat')
  }
}

// Sua bai hat thu cong bang JSON.
export async function updateSongJson(req, res) {
  // B1: Nhan payload cap nhat.
  const { title, artist, album = '', genre = '', duration = 0, releaseYear = null, audioUrl, coverUrl } = req.body

  // B2: Validate cac truong bat buoc.
  if (!ensureRequiredFields({ title, artist }, res)) return

  const normalizedDuration = normalizeDuration(duration)
  const normalizedReleaseYear = normalizeReleaseYear(releaseYear)

  if (Number.isNaN(normalizedDuration) || Number.isNaN(normalizedReleaseYear)) {
    return res.status(400).json({ message: 'duration hoac releaseYear khong hop le' })
  }

  try {
    // B3: Update bai hat va reset trang thai ve pending.
    const affectedRows = await updateSong(req.params.id, {
      title: title.trim(),
      artist: artist.trim(),
      album,
      genre,
      duration: normalizedDuration,
      releaseYear: normalizedReleaseYear,
      audioUrl: audioUrl || null,
      coverUrl: coverUrl || null,
      cloudinaryId: null,
      approvalStatus: 'pending',
      reviewedByRole: null,
      reviewedAt: null,
    })

    if (!affectedRows) return res.status(404).json({ message: 'Khong tim thay bai hat' })

    const song = await getSongById(req.params.id)
    return res.json(song)
  } catch (err) {
    return handleMusicError(res, err, 'Loi cap nhat bai hat')
  }
}

// Them bai hat bang 1 request multipart (audio + cover + metadata).
export async function createSongMultipart(req, res) {
  // B1: Lay metadata va validate bat buoc.
  const { title, artist, album = '', genre = '' } = req.body
  if (!ensureRequiredFields({ title, artist }, res)) return

  // B2: Chuan hoa releaseYear.
  const releaseYear = normalizeReleaseYear(req.body.releaseYear)
  if (Number.isNaN(releaseYear)) {
    return res.status(400).json({ message: 'releaseYear khong hop le' })
  }

  // B3: Lay file audio/cover tu multipart va kiem tra kich thuoc cover.
  const audioFile = req.files?.audio?.[0]
  const coverFile = req.files?.cover?.[0]

  if (coverFile && coverFile.size > 10 * 1024 * 1024) {
    return res.status(400).json({ message: 'Anh bia vuot qua gioi han 10MB' })
  }

  try {
    // B4: Upload tai nguyen len cloud va luu bai hat vao DB.
    const uploadResult = await uploadSongAssets({ audioFile, coverFile })

    const songId = await createSong({
      title: title.trim(),
      artist: artist.trim(),
      album,
      genre,
      duration: uploadResult.duration || 0,
      releaseYear,
      audioUrl: uploadResult.audioUrl,
      coverUrl: uploadResult.coverUrl,
      cloudinaryId: uploadResult.cloudinaryId,
      approvalStatus: 'pending',
      reviewedByRole: null,
      reviewedAt: null,
    })

    const song = await getSongById(songId)
    return res.status(201).json(song)
  } catch (err) {
    return handleMusicError(res, err, 'Loi tao bai hat multipart')
  }
}

// Sua bai hat bang multipart, co the thay audio/cover trong cung request.
export async function updateSongMultipart(req, res) {
  // B1: Nhan metadata va validate du lieu chinh.
  const { title, artist, album = '', genre = '' } = req.body
  if (!ensureRequiredFields({ title, artist }, res)) return

  // B2: Chuan hoa releaseYear.
  const releaseYear = normalizeReleaseYear(req.body.releaseYear)
  if (Number.isNaN(releaseYear)) {
    return res.status(400).json({ message: 'releaseYear khong hop le' })
  }

  // B3: Lay file moi (neu co) va check gioi han dung luong cover.
  const audioFile = req.files?.audio?.[0]
  const coverFile = req.files?.cover?.[0]

  if (coverFile && coverFile.size > 10 * 1024 * 1024) {
    return res.status(400).json({ message: 'Anh bia vuot qua gioi han 10MB' })
  }

  try {
    // B4: Upload file moi va cap nhat DB, dong thoi reset ve pending.
    const uploadResult = await uploadSongAssets({ audioFile, coverFile })

    const affectedRows = await updateSong(req.params.id, {
      title: title.trim(),
      artist: artist.trim(),
      album,
      genre,
      duration: uploadResult.duration || 0,
      releaseYear,
      audioUrl: uploadResult.audioUrl,
      coverUrl: uploadResult.coverUrl,
      cloudinaryId: uploadResult.cloudinaryId,
      approvalStatus: 'pending',
      reviewedByRole: null,
      reviewedAt: null,
    })

    if (!affectedRows) return res.status(404).json({ message: 'Khong tim thay bai hat' })

    const song = await getSongById(req.params.id)
    return res.json(song)
  } catch (err) {
    return handleMusicError(res, err, 'Loi cap nhat bai hat multipart')
  }
}

// Xoa bai hat theo id va xoa audio tren Cloudinary neu co.
export async function removeSong(req, res) {
  try {
    // B1: Kiem tra bai hat ton tai.
    const song = await getSongById(req.params.id)
    if (!song) return res.status(404).json({ message: 'Khong tim thay bai hat' })

    // B2: Neu co cloudinaryId thi xoa file tren cloud.
    if (song.cloudinaryId) {
      await cloudinary.uploader.destroy(song.cloudinaryId, { resource_type: 'video' })
    }

    // B3: Xoa record bai hat trong DB.
    await deleteSong(req.params.id)
    return res.json({ message: 'Xoa bai hat thanh cong' })
  } catch (err) {
    return handleMusicError(res, err, 'Loi xoa bai hat')
  }
}

// Upload rieng audio, tra ve url cho truong hop can dung API tach file.
export async function uploadAudioOnly(req, res) {
  if (!req.file) return res.status(400).json({ message: 'Khong co file audio' })

  try {
    const uploadResult = await uploadSongAssets({ audioFile: req.file, coverFile: null })
    return res.json({
      audioUrl: uploadResult.audioUrl,
      cloudinaryId: uploadResult.cloudinaryId,
      duration: uploadResult.duration,
    })
  } catch (err) {
    return res.status(500).json({ message: 'Loi upload file', error: err.message })
  }
}

// Upload rieng cover, tra ve url cho truong hop can dung API tach file.
export async function uploadCoverOnly(req, res) {
  if (!req.file) return res.status(400).json({ message: 'Khong co file anh bia' })

  try {
    const uploadResult = await uploadSongAssets({ audioFile: null, coverFile: req.file })
    return res.json({
      coverUrl: uploadResult.coverUrl,
      coverPublicId: uploadResult.coverPublicId,
    })
  } catch (err) {
    return res.status(500).json({ message: 'Loi upload anh bia', error: err.message })
  }
}

// Duyet bai hat (admin/ctv): approved hoac rejected.
export async function reviewSongByModerator(req, res) {
  // B1: Validate status duyet.
  const status = String(req.body.status || '').trim().toLowerCase()
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'status phai la approved hoac rejected' })
  }

  try {
    // B2: Ghi ket qua duyet vao DB.
    const affectedRows = await reviewSong(req.params.id, status, req.moderatorRole)
    if (!affectedRows) return res.status(404).json({ message: 'Khong tim thay bai hat' })

    // B3: Tra ve ban ghi moi nhat sau khi duyet.
    const song = await getSongById(req.params.id)
    return res.json({ message: 'Duyet nhac thanh cong', data: song })
  } catch (err) {
    return handleMusicError(res, err, 'Loi duyet nhac')
  }
}



//  HÀM LẤY LỊCH SỬ
export const getSearchHistory = async (req, res) => {
    try {
        const history = await HistoryModel.getRecentHistory();
        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error("❌ Lỗi lấy lịch sử:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi lấy lịch sử tìm kiếm"
        });
    }
};

//  HÀM XÓA LỊCH SỬ_Thang
export const clearSearchHistory = async (req, res) => {
    try {
        await HistoryModel.clearAllHistory();
        res.status(200).json({
            success: true,
            message: "Đã xóa toàn bộ lịch sử tìm kiếm"
        });
    } catch (error) {
        console.error("❌ Lỗi xóa lịch sử:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi xóa lịch sử"
        });
    }
};

// Xử lý API xóa 1 từ khóa_Thang
export const deleteHistoryItem = async (req, res) => {
    try {
        const { keyword } = req.params;

        if (!keyword || !keyword.trim()) {
            return res.status(400).json({
                success: false,
                message: "Từ khóa không hợp lệ"
            });
        }

        const affectedRows = await HistoryModel.deleteOneHistory(keyword);

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy từ khóa này trong lịch sử"
            });
        }

        res.status(200).json({
            success: true,
            message: `Đã xóa '${keyword}' khỏi lịch sử`
        });
    } catch (error) {
        console.error("❌ Lỗi xóa từ khóa:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ──  DANH SÁCH NHẠC ──────────────────────────────
export async function getMusicList(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await getSongs({ status: 'approved', page, limit });

    return res.status(200).json({
      success: true,
      total: result.total,
      page,
      data: result.rows
    });
  } catch (err) {
    return handleMusicError(res, err, 'Lỗi lấy danh sách bài hát');
  }
}

// ── 2. TÌM KIẾM NHẠC ───────────────────────────────
export async function searchMusic(req, res) {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập từ khóa!" });
    }

    const result = await getSongs({ search: q.trim(), status: 'approved', page, limit });

    try {
      await HistoryModel.saveKeyword(q.trim());
    } catch (e) {
      console.error("Lỗi lưu lịch sử:", e);
    }

    return res.status(200).json({
      success: true,
      query: q,
      total: result.total,
      page,
      data: result.rows
    });
  } catch (err) {
    return handleMusicError(res, err, 'Lỗi tìm kiếm nhạc');
  }
}

