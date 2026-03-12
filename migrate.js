import fs from 'fs';
import path from 'path';
import pool from './src/config/db.js'; // Nhớ tạo file này trước

const runMigrations = async () => {
    try {
        console.log("🚀 Bắt đầu quá trình Migration...");

        // 1. Đường dẫn đến thư mục chứa các file .sql
        const migrationsDir = path.join(process.cwd(), 'src', 'migrations');
        
        // 2. Đọc tất cả các file trong thư mục migrations
        const files = fs.readdirSync(migrationsDir).sort();

        for (const file of files) {
            if (file.endsWith('.sql')) {
                console.log(` đang chạy file: ${file}`);
                
                // Đọc nội dung file SQL
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                
                // Chạy lệnh SQL lên Aiven
                await pool.query(sql);
                
                console.log(`✅ Hoàn thành: ${file}`);
            }
        }

        console.log("✨ Tất cả bảng đã được tạo thành công trên TiDB Cloud!");
    } catch (error) {
        console.error("❌ Lỗi Migration:", error.message);
    } finally {
        await pool.end();
        process.exit();
    }
};

runMigrations();