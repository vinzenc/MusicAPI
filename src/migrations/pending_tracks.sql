-- Bảng nhạc tạm (user đề xuất, admin duyệt)
CREATE TABLE IF NOT EXISTS pending_tracks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    album VARCHAR(255) DEFAULT '',
    duration INT DEFAULT 0,
    preview_url VARCHAR(500) DEFAULT '',
    cover_url VARCHAR(500) DEFAULT '',
    deezer_id VARCHAR(100) DEFAULT NULL,
    genre VARCHAR(100) DEFAULT '',
    submitted_by INT DEFAULT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_note TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL
);
