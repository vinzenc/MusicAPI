import cloudinary from '../config/cloudinary.js'

// Upload file audio dang buffer len Cloudinary.
function uploadAudioBuffer(buffer) {
  return new Promise((resolve, reject) => {
    // Cloudinary xu ly audio qua resource_type video va ep dinh dang mp3.
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: 'music_app',
        format: 'mp3',
      },
      (error, result) => {
        // Tra loi Promise theo ket qua upload tu callback.
        if (error) reject(error)
        else resolve(result)
      },
    )

    // Day du lieu buffer vao stream de bat dau upload.
    stream.end(buffer)
  })
}

// Upload file cover (anh) dang buffer len Cloudinary.
function uploadCoverBuffer(buffer) {
  return new Promise((resolve, reject) => {
    // Cover duoc luu trong thu muc rieng de de quan ly.
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'music_app/covers',
      },
      (error, result) => {
        // Tra loi Promise theo ket qua upload tu callback.
        if (error) reject(error)
        else resolve(result)
      },
    )

    // Day du lieu buffer vao stream de bat dau upload.
    stream.end(buffer)
  })
}

// Upload audio + cover song song (neu co), sau do chuan hoa du lieu tra ve.
export async function uploadSongAssets({ audioFile, coverFile }) {
  const [uploadedAudio, uploadedCover] = await Promise.all([
    // Neu co audio thi upload, khong co thi gan null.
    audioFile ? uploadAudioBuffer(audioFile.buffer) : Promise.resolve(null),
    // Neu co cover thi upload, khong co thi gan null.
    coverFile ? uploadCoverBuffer(coverFile.buffer) : Promise.resolve(null),
  ])

  // Chuan hoa output de phuc vu luu DB va tra ve client.
  return {
    // URL phat audio tren Cloudinary.
    audioUrl: uploadedAudio?.secure_url || null,
    // Public ID cua audio de xoa/cap nhat sau nay.
    cloudinaryId: uploadedAudio?.public_id || null,
    // URL anh cover tren Cloudinary.
    coverUrl: uploadedCover?.secure_url || null,
    // Thoi luong bai hat (lam tron ve so nguyen giay).
    duration: Math.round(uploadedAudio?.duration || 0),
    // Public ID cua cover de xoa/cap nhat sau nay.
    coverPublicId: uploadedCover?.public_id || null,
  }
}
