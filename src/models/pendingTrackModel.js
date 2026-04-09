import pool from '../config/db.js';

// ── Lấy danh sách pending (lọc theo status) ───────────────────
export const getPendingTracks = async (status = 'pending') => {
    const [rows] = await pool.query(
        `SELECT p.*, u.name as submitted_by_name, u.email as submitted_by_email
         FROM pending_tracks p
         LEFT JOIN users u ON p.submitted_by = u.id
         WHERE p.status = ? ORDER BY p.created_at DESC`,
        [status]
    );
    return rows;
};

// ── Lấy pending theo ID ────────────────────────────────────────
export const getPendingById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM pending_tracks WHERE id = ?', [id]);
    return rows[0];
};

// ── User đề xuất nhạc ─────────────────────────────────────────
export const submitPendingTrack = async ({ title, artist, album, duration, preview_url, cover_url, deezer_id, genre }, userId) => {
    const [result] = await pool.query(
        `INSERT INTO pending_tracks (title, artist, album, duration, preview_url, cover_url, deezer_id, genre, submitted_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, artist, album || '', duration || 0, preview_url || '', cover_url || '', deezer_id || null, genre || '', userId]
    );
    return result.insertId;
};

// ── Duyệt pending → chuyển sang tracks ────────────────────────
export const approvePending = async (id) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [rows] = await conn.query('SELECT * FROM pending_tracks WHERE id = ?', [id]);
        if (!rows[0]) throw new Error('Không tìm thấy bản ghi pending này');
        const t = rows[0];

        const [ins] = await conn.query(
            `INSERT INTO tracks (title, artist, album, duration, preview_url, cover_url, deezer_id, genre, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [t.title, t.artist, t.album, t.duration, t.preview_url, t.cover_url, t.deezer_id, t.genre]
        );
        await conn.query("UPDATE pending_tracks SET status='approved' WHERE id=?", [id]);

        await conn.commit();
        return ins.insertId;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

// ── Từ chối pending ────────────────────────────────────────────
export const rejectPending = async (id, admin_note = '') => {
    const [result] = await pool.query(
        "UPDATE pending_tracks SET status='rejected', admin_note=? WHERE id=?",
        [admin_note, id]
    );
    return result.affectedRows;
};

// ── Xóa pending ────────────────────────────────────────────────
export const deletePending = async (id) => {
    const [result] = await pool.query('DELETE FROM pending_tracks WHERE id=?', [id]);
    return result.affectedRows > 0;
};

// ── Đếm số pending chờ duyệt ──────────────────────────────────
export const countPending = async () => {
    const [[{ count }]] = await pool.query("SELECT COUNT(*) as count FROM pending_tracks WHERE status='pending'");
    return count;
};
