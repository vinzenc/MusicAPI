import fs from 'fs';
import path from 'path';
import pool from './src/config/db.js';

const runMigration = async () => {
    // Lấy đối số thứ 3 từ terminal (ví dụ: node migrate.js user.sql -> lấy chữ 'user.sql')
    const fileName = process.argv[2];

    // Kiểm tra xem đã nhập tên file chưa
    if (!fileName) {
        console.error("❌ Lỗi: Bạn chưa nhập tên file cần chạy!");
        console.log("💡 Hướng dẫn: node migrate.js <tên_file.sql>");
        process.exit(1);
    }

    // Nối đường dẫn thẳng vào thư mục src/migrations/
    const filePath = path.join(process.cwd(), 'src', 'migrations', fileName);

    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Lỗi: Không tìm thấy file '${fileName}' trong thư mục src/migrations/`);
        process.exit(1);
    }

    try {
        console.log(`⏳ Đang thực thi: ${fileName}...`);
        
        // Đọc nội dung file SQL
        const sql = fs.readFileSync(filePath, 'utf8');

        // Chạy lệnh SQL
        await pool.query(sql);

        console.log(`✅ Thành công: Đã chạy xong ${fileName}!`);
    } catch (error) {
        console.error(`❌ Lỗi khi chạy database:`, error.message);
    } finally {
        // Tắt kết nối để terminal không bị treo
        process.exit(0); 
    }
};

runMigration();