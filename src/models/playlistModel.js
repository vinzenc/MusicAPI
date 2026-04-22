import pool from "../config/db.js";

export const checkPlaylist = async (useId, playlistName) => {
    const query = "SELECT * id FROM playlists WHERE user_id = ? AND playlist_name = ?";
    const [rows] = await pool.query(query,[useId, playlistName]);
    return rows.length > 0;  
};

export const createPlaylist = async (userId, playlistName) => {
    const query = "INSERT INTO playlists (user_id, playlist_name) VALUES (?,?)";
    const [result] = await pool.query(query,[userId, playlistName]);
    return result.affectedRows > 0;
};

export const checkSongInPlaylist = async (playlistId, songId) => {
    const query = "SELECT * FROM playlist_songs WHERE playlist_id = ? AND song_id = ?";
    const [rows] = await pool.query(query,[playlistId, songId]);
    return rows.length > 0;
};

export const addSongToPlaylist = async (playlistId, songId) => {
    const query = "INSERT INTO playlist_songs (playlist_id, song_id) VALUE (?,?)";
    const [result] = await pool.query(query,[playlistId, songId]);
    return result.affectedRows > 0;
};

export const deletePlaylist = async (playlistId, userId) => {
    const query = "DELETE FROM playlists WHERE id = ? AND user_id = ?";
    const [result] = await pool.query(query, [playlistId, userId]);
    return result.affectedRows > 0;
};

export const getSongsByPlaylistId = async (playlistId) => {
    const query = `
        SELECT s.*, ps.added_at 
        FROM songs s
        JOIN playlist_songs ps ON s.id = ps.song_id
        WHERE ps.playlist_id = ?
        ORDER BY ps.added_at DESC
    `;
    const [rows] = await pool.query(query, [playlistId]);
    return rows;
};