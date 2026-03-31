-- 1. Tạo bảng users nếu chưa có
Create table users (
    id Int auto_increment primary key,
    name nvarchar(100) not null,
    email varchar(255) not null unique,
    password varchar(255) not null,
    role Enum('admin', 'user','collaborator') default 'user',
    created_at timestamp default current_timestamp
);
-- 2. Tài khoản admin mặc định
Insert into users (name, email, password, role) values ('Admin', 'admin@example.com', 'admin123', 'admin');