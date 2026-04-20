import cloudinary from 'cloudinary'
import dotenv from 'dotenv'

// Nap bien moi truong Cloudinary tu file .env.
dotenv.config()

// Cau hinh thong so ket noi Cloudinary cho uploader.
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Export client da config de dung xuyen suot du an.
export default cloudinary.v2
