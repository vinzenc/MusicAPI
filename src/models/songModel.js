import pool from '../config/db.js'

// Dam bao pool DB san sang truoc khi query.
function getPoolOrThrow() {
  if (!pool || typeof pool.execute !== 'function') {
    const error = new Error('Database tam thoi khong kha dung')
    error.code = 'DB_NOT_READY'
    throw error
  }

  return pool
}

// Kiem tra va bo sung cot con thieu cho schema cu.
async function ensureColumnExists(columnName, definition) {
  const db = getPoolOrThrow()
  const databaseName = process.env.DB_NAME || process.env.TIDB_DATABASE || process.env.TIDB_NAME
  if (!databaseName) return

  const [rows] = await db.execute(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'songs' AND COLUMN_NAME = ?`,
    [databaseName, columnName],
  )

  if (rows.length === 0) {
    await db.execute(`ALTER TABLE songs ADD COLUMN ${columnName} ${definition}`)
  }
}

// Khoi tao schema phuc vu CRUD, duyet va like bai hat.
export async function initSongsSchema() {
  // B1: Neu DB chua san sang thi bo qua khoi tao schema.
  if (!pool || typeof pool.execute !== 'function') return
  const db = getPoolOrThrow()

  // B2: Tao bang songs neu chua ton tai.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS songs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      artist VARCHAR(255) NOT NULL,
      album VARCHAR(255) DEFAULT '',
      genre VARCHAR(100) DEFAULT '',
      duration INT DEFAULT 0,
      releaseYear INT DEFAULT NULL,
      audioUrl TEXT DEFAULT NULL,
      coverUrl TEXT DEFAULT NULL,
      cloudinaryId VARCHAR(255) DEFAULT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      approvalStatus VARCHAR(20) DEFAULT 'pending',
      reviewedByRole VARCHAR(20) DEFAULT NULL,
      reviewedAt DATETIME DEFAULT NULL,
      likeCount INT DEFAULT 0
    )
  `)

  // B3: Dam bao cac cot moi co mat tren he thong da ton tai tu truoc.
  await ensureColumnExists('approvalStatus', "VARCHAR(20) DEFAULT 'pending'")
  await ensureColumnExists('reviewedByRole', 'VARCHAR(20) DEFAULT NULL')
  await ensureColumnExists('reviewedAt', 'DATETIME DEFAULT NULL')
  await ensureColumnExists('likeCount', 'INT DEFAULT 0')

  // B4: Tao bang song_likes de rang buoc moi user like mot lan.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS song_likes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      songId INT NOT NULL,
      likedBy VARCHAR(255) NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_like (songId, likedBy),
      CONSTRAINT fk_song_likes_song FOREIGN KEY (songId) REFERENCES songs(id) ON DELETE CASCADE
    )
  `)
}

// Lay danh sach bai hat, cho phep loc theo trang thai duyet.
export async function getSongs({ status } = {}) {
  const db = getPoolOrThrow()
  const hasFilter = status && ['pending', 'approved', 'rejected'].includes(String(status).toLowerCase())

  if (hasFilter) {
    const [rows] = await db.execute('SELECT * FROM songs WHERE approvalStatus = ? ORDER BY id DESC', [
      String(status).toLowerCase(),
    ])
    return rows
  }

  const [rows] = await db.execute('SELECT * FROM songs ORDER BY id DESC')
  return rows
}

// Lay thong tin mot bai hat theo id.
export async function getSongById(id) {
  const db = getPoolOrThrow()
  const [rows] = await db.execute('SELECT * FROM songs WHERE id = ?', [id])
  return rows[0] || null
}

// Them bai hat moi vao database.
export async function createSong(payload) {
  // Ghi ban ghi bai hat moi vao bang songs.
  const db = getPoolOrThrow()
  const [result] = await db.execute(
    'INSERT INTO songs (title, artist, album, genre, duration, releaseYear, audioUrl, coverUrl, cloudinaryId, approvalStatus, reviewedByRole, reviewedAt, likeCount) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [
      payload.title,
      payload.artist,
      payload.album,
      payload.genre,
      payload.duration,
      payload.releaseYear,
      payload.audioUrl,
      payload.coverUrl,
      payload.cloudinaryId,
      payload.approvalStatus,
      payload.reviewedByRole,
      payload.reviewedAt,
      payload.likeCount,
    ],
  )

  return result.insertId
}

// Cap nhat thong tin bai hat.
export async function updateSong(id, payload) {
  // Cap nhat metadata + tai nguyen moi, giu tai nguyen cu neu khong truyen len.
  const db = getPoolOrThrow()
  const [result] = await db.execute(
    'UPDATE songs SET title=?, artist=?, album=?, genre=?, duration=?, releaseYear=?, audioUrl=COALESCE(?,audioUrl), coverUrl=COALESCE(?,coverUrl), cloudinaryId=COALESCE(?,cloudinaryId), approvalStatus=?, reviewedByRole=?, reviewedAt=? WHERE id=?',
    [
      payload.title,
      payload.artist,
      payload.album,
      payload.genre,
      payload.duration,
      payload.releaseYear,
      payload.audioUrl,
      payload.coverUrl,
      payload.cloudinaryId,
      payload.approvalStatus,
      payload.reviewedByRole,
      payload.reviewedAt,
      id,
    ],
  )

  return result.affectedRows
}

// Xoa bai hat theo id.
export async function deleteSong(id) {
  // Xoa bai hat trong bang songs.
  const db = getPoolOrThrow()
  const [result] = await db.execute('DELETE FROM songs WHERE id = ?', [id])
  return result.affectedRows
}

// Duyet bai hat theo trang thai approved/rejected.
export async function reviewSong(id, approvalStatus, reviewedByRole) {
  const db = getPoolOrThrow()
  const reviewedAt = new Date()
  const [result] = await db.execute(
    'UPDATE songs SET approvalStatus=?, reviewedByRole=?, reviewedAt=? WHERE id=?',
    [approvalStatus, reviewedByRole, reviewedAt, id],
  )

  return result.affectedRows
}

// Moi nguoi dung chi like mot lan tren moi bai hat.
export async function likeSongOnce(songId, likedBy) {
  const db = getPoolOrThrow()
  try {
    // B1: Chen ban ghi like de dam bao tinh duy nhat.
    await db.execute('INSERT INTO song_likes (songId, likedBy) VALUES (?, ?)', [songId, likedBy])

    // B2: Tang dem like trong bang songs.
    await db.execute('UPDATE songs SET likeCount = likeCount + 1 WHERE id = ?', [songId])
    return { liked: true }
  } catch (err) {
    // B3: Neu trung khoa unique => user da like truoc do.
    if (String(err?.code) === 'ER_DUP_ENTRY') {
      return { liked: false, message: 'Ban da like bai hat nay roi' }
    }
    throw err
  }
}
