import pool from '../config/db.js';

// ── Lấy danh sách tracks (có filter + phân trang) ──────────────
export const getAllTracks = async ({ search = '', status = '', page = 1, limit = 20 } = {}) => {
    let where = '1=1';
    const params = [];

    if (search) {
        where += ' AND (title LIKE ? OR artist LIKE ? OR album LIKE ?)';
        const s = `%${search}%`;
        params.push(s, s, s);
    }
    if (status) {
        where += ' AND status = ?';
        params.push(status);
    }

    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
        `SELECT * FROM tracks WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) as total FROM tracks WHERE ${where}`, params
    );
    return { rows, total };
};

// ── Lấy 1 track theo ID ────────────────────────────────────────
export const getTrackById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM tracks WHERE id = ?', [id]);
    return rows[0];
};

// ── Thêm track mới ─────────────────────────────────────────────
export const createTrack = async ({ title, artist, album, duration, preview_url, cover_url, deezer_id, genre, status }) => {
    const [result] = await pool.query(
        `INSERT INTO tracks (title, artist, album, duration, preview_url, cover_url, deezer_id, genre, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, artist, album || '', duration || 0, preview_url || '', cover_url || '', deezer_id || null, genre || '', status || 'active']
    );
    return result.insertId;
};

// ── Sửa track ──────────────────────────────────────────────────
export const updateTrack = async (id, { title, artist, album, duration, preview_url, cover_url, deezer_id, genre, status }) => {
    const [result] = await pool.query(
        `UPDATE tracks SET title=?, artist=?, album=?, duration=?, preview_url=?, cover_url=?, deezer_id=?, genre=?, status=?
         WHERE id=?`,
        [title, artist, album || '', duration || 0, preview_url || '', cover_url || '', deezer_id || null, genre || '', status || 'active', id]
    );
    return result.affectedRows;
};

// ── Xóa track ──────────────────────────────────────────────────
export const deleteTrack = async (id) => {
    const [result] = await pool.query('DELETE FROM tracks WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

// ── Thống kê ───────────────────────────────────────────────────
export const getTrackStats = async () => {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM tracks');
    const [[{ active }]] = await pool.query("SELECT COUNT(*) as active FROM tracks WHERE status='active'");
    return { total, active };
};
