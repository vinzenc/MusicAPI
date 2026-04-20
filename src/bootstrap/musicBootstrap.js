import { initSongsSchema } from '../models/songModel.js'

// Khoi tao schema cho module music khi server bat dau chay.
export async function bootstrapMusicSchema() {
  await initSongsSchema()
}
