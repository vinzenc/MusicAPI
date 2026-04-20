import multer from 'multer'

// Middleware gom loi upload tu multer va tra ve response de doc cho client.
export function uploadErrorMiddleware(err, _req, res, next) {
  if (!err) return next()

  // Xu ly cac ma loi dac thu do Multer phat sinh.
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File vuot qua gioi han dung luong' })
    }

    return res.status(400).json({ message: err.message })
  }

  return res.status(400).json({ message: err.message || 'Loi upload file' })
}
