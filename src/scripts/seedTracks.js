import pool from '../config/db.js';

const popularTracks = [
    { title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: 200, genre: 'Synthwave Pop' },
    { title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: 203, genre: 'Disco Pop' },
    { title: 'Anti-Hero', artist: 'Taylor Swift', album: 'Midnights', duration: 229, genre: 'Pop' },
    { title: 'As It Was', artist: 'Harry Styles', album: "Harry's House", duration: 173, genre: 'Pop' },
    { title: 'Heat Waves', artist: 'Glass Animals', album: 'Dreamland', duration: 239, genre: 'Indie Pop' },
    { title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', duration: 354, genre: 'Rock' },
    { title: 'Hotel California', artist: 'Eagles', album: 'Hotel California', duration: 391, genre: 'Rock' },
    { title: 'Imagine', artist: 'John Lennon', album: 'Imagine', duration: 183, genre: 'Pop' },
    { title: 'Stairway to Heaven', artist: 'Led Zeppelin', album: 'Led Zeppelin IV', duration: 482, genre: 'Rock' },
    { title: 'Smells Like Teen Spirit', artist: 'Nirvana', album: 'Nevermind', duration: 301, genre: 'Grunge' },
    { title: 'Like a Virgin', artist: 'Madonna', album: 'Like a Virgin', duration: 309, genre: 'Pop' },
    { title: 'Money', artist: 'Pink Floyd', album: 'The Dark Side of the Moon', duration: 246, genre: 'Progressive Rock' },
    { title: 'Sweet Child o Mine', artist: "Guns N' Roses", album: 'Appetite for Destruction', duration: 356, genre: 'Hard Rock' },
    { title: 'Take On Me', artist: 'a-ha', album: 'Hunting High and Low', duration: 225, genre: 'Pop' },
    { title: 'Billie Jean', artist: 'Michael Jackson', album: 'Thriller', duration: 294, genre: 'Pop' },
    { title: 'Thriller', artist: 'Michael Jackson', album: 'Thriller', duration: 357, genre: 'Pop' },
    { title: 'Shape of You', artist: 'Ed Sheeran', album: '÷ (Divide)', duration: 234, genre: 'Pop' },
    { title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', album: 'Uptown Special', duration: 269, genre: 'Funk Pop' },
    { title: 'Shivers', artist: 'Ed Sheeran', album: '= (Equals)', duration: 190, genre: 'Pop' },
    { title: 'Good as Hell', artist: 'Lizzo', album: 'Cuz I Love You', duration: 196, genre: 'Pop' },
];

async function seedDatabase() {
    try {
        console.log('🌱 Bắt đầu thêm dữ liệu nhạc vào database...\n');
        
        let addedCount = 0;
        let skippedCount = 0;

        for (const track of popularTracks) {
            try {
                const [result] = await pool.query(
                    `INSERT IGNORE INTO tracks (title, artist, album, duration, genre, status, cover_url, preview_url)
                     VALUES (?, ?, ?, ?, ?, 'active', '', '')`,
                    [track.title, track.artist, track.album, track.duration, track.genre]
                );
                
                if (result.affectedRows > 0) {
                    console.log(`✅ Đã thêm: ${track.title} - ${track.artist}`);
                    addedCount++;
                } else {
                    console.log(`⏭️  Bỏ qua: ${track.title} (đã tồn tại)`);
                    skippedCount++;
                }
            } catch (error) {
                console.error(`❌ Lỗi khi thêm ${track.title}:`, error.message);
            }
        }

        console.log(`\n✨ Hoàn thành!`);
        console.log(`📊 Thêm mới: ${addedCount} | Bỏ qua: ${skippedCount}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi seed database:', error);
        process.exit(1);
    }
}

seedDatabase();
                                