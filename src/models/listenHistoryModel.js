import pool from "../config/db.js";

export const addHistoryRecord = async (userId, songId) => {
    const query = "INSERT INTO listening_history (user_id, song_id) VALUES (?, ?)";
    const [result] = await pool.query(query, [userId, songId]);
    return result.affectedRows > 0;
};

export const getRecentHistoryDB = async (userId, limit = 20) => {
    const query = `
        SELECT s.*, MAX(h.listened_at) as last_listened
        FROM songs s
        JOIN listening_history h ON s.id = h.song_id
        WHERE h.user_id = ?
        GROUP BY s.id
        ORDER BY last_listened DESC
        LIMIT ?
    `;
    const [rows] = await pool.query(query, [userId, Number(limit)]);
    return rows;
};