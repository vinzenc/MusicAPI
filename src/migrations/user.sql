-- 1. Tạo bảng users nếu chưa có
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- 2. Chèn 6 dữ liệu mẫu vào bảng
INSERT INTO users (name) VALUES 
('Trần Ái Quốc'),
('Trương Minh Thắng'),
('Phan Lực Vinh'),
('Châu Thanh Thuận'),
('Đặng Võ Quốc Trọng'),
('Nguyễn Đình Phước');