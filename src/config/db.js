import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Tạo pool (thử MySQL, fallback sang mock nếu error)
let pool = null;

async function initializePool() {
    try {
        const mysqlPool = mysql.createPool({
            host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
            port: process.env.DB_PORT || 4000,
            user: process.env.DB_USER || '3acFA7vcYzmFMq8.root',
            password: process.env.DB_PASSWORD || 'CCeir0Fec7fd9FQV',
            database: process.env.DB_NAME || 'test',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            multipleStatements: true,
            ssl: {
                minVersion: 'TLSv1.2',
                rejectUnauthorized: true
            }
        });

        // Test connection
        const connection = await mysqlPool.getConnection();
        await connection.ping();
        connection.release();
        console.log('✅ Kết nối MySQL thành công');
        return mysqlPool;
    } catch (error) {
        console.warn('⚠️  Không thể kết nối MySQL - dùng Mock DB');
        
        // Import mock database
        const { default: mockDb } = await import('./mockDb.js');
        return mockDb;
    }
}

// Initialize pool ngay khi module load
pool = await initializePool();

export default pool;