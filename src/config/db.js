import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Tạo pool (thử MySQL, fallback sang mock nếu error)
let pool = null;

// Tao pool MySQL va ping thu de xac nhan ket noi hop le.
async function initializePool() {
    try {
        const mysqlPool = mysql.createPool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
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
        console.log('⚠️  Không thể kết nối MySQL',error);
    }
}

// Initialize pool ngay khi module load
pool = await initializePool();

export default pool;