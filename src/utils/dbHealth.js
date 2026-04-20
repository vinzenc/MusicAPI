import pool from '../config/db.js'

// Ping database de xac dinh backend co ket noi DB thanh cong hay khong.
export async function pingDatabase() {
  if (!pool || typeof pool.execute !== 'function') {
    return { ok: false, error: new Error('Database pool chua san sang') }
  }

  try {
    const [rows] = await pool.execute('SELECT 1 + 1 AS result')
    return { ok: true, rows }
  } catch (error) {
    return { ok: false, error }
  }
}
