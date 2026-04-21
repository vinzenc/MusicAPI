import pool from "../config/db.js";

export const checkFavorite = async (userId, songId) => {
    const query = "SELECT * FROM favorite_songs WHERE user_id = ? AND song_id =?"
    const [result] = await pool.query(query,[userId, songId]);
    return result > 0
};

export const addFavorite = async (userId, songId) => {
    const query = "INSERT INTO favorite_songs (user_id, song_id) VALUES (?, ?)";
    const [result] = await pool.query(query, [userId, songId]);
    return result.affectedRows > 0;
};

export const removeFavorites = async (userId, songId) => {
    const query = "DELETE FROM favorite_songs WHERE user_id = ? AND song_id = ?";
    const [result] = await pool.query(query, [userId, songId]);
    return result.affectedRows > 0; 
};

export const getFavoritesByUserId = async (userId) => {
    const query = 
    `   SELECT s.* FROM songs s
        JOIN favorite_songs f ON s.id = f.song_id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC`;
    const [rows] = await pool.query(query, [userId]);
    return rows;
};

