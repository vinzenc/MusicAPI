-- Bảng nhạc chính (admin quản lý)
CREATE TABLE IF NOT EXISTS tracks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    album VARCHAR(255) DEFAULT '',
    duration INT DEFAULT 0,
    preview_url VARCHAR(500) DEFAULT '',
    cover_url VARCHAR(500) DEFAULT '',
    deezer_id VARCHAR(100) DEFAULT NULL,
    genre VARCHAR(100) DEFAULT '',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
