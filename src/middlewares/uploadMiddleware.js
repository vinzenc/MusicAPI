import multer from 'multer'

// Luu file tam trong RAM de xu ly tiep (khong ghi xuong o dia).
const memoryStorage = multer.memoryStorage()

// Upload 1 file audio (toi da 50MB), chi nhan mime audio hoac duoi .mp3.
export const uploadAudio = multer({
  storage: memoryStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    // Kiem tra dung dinh dang audio truoc khi chap nhan file.
    if (file.mimetype.startsWith('audio/') || file.originalname.toLowerCase().endsWith('.mp3')) {
      cb(null, true)
    } else {
      cb(new Error('Chi chap nhan file audio'))
    }
  },
})

// Upload 1 file anh cover (toi da 10MB).
export const uploadCover = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    // Chi chap nhan cac file co mime image/*.
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Chi chap nhan file anh'))
    }
  },
})

// Upload theo multipart cho 2 truong audio + cover (toi da 2 file).
export const uploadSongMultipart = multer({
  storage: memoryStorage,
  limits: { fileSize: 50 * 1024 * 1024, files: 2 },
  fileFilter: (_req, file, cb) => {
    // Nhanh audio: bat buoc la file audio.
    if (file.fieldname === 'audio') {
      if (file.mimetype.startsWith('audio/') || file.originalname.toLowerCase().endsWith('.mp3')) {
        cb(null, true)
      } else {
        cb(new Error('Chi chap nhan file audio cho truong audio'))
      }
      return
    }

    // Nhanh cover: bat buoc la file anh.
    if (file.fieldname === 'cover') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true)
      } else {
        cb(new Error('Chi chap nhan file anh cho truong cover'))
      }
      return
    }

    // Tu choi moi truong file khong nam trong danh sach hop le.
    cb(new Error('Truong file khong hop le'))
  },
})

// Middleware gan cu the ten field va so luong file cho multipart upload.
export const uploadSongFiles = uploadSongMultipart.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
])
