// Mock Database for Development (quando MySQL não está disponível)
// Simula a interface MySQL2/Promise pool para desenvolvimento local

class MockPool {
    constructor() {
        this.tracks = [
            { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: 200, preview_url: '', cover_url: '', deezer_id: null, genre: 'Synthwave Pop', status: 'active', created_at: new Date(), updated_at: new Date() },
            { id: 2, title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: 203, preview_url: '', cover_url: '', deezer_id: null, genre: 'Disco Pop', status: 'active', created_at: new Date(), updated_at: new Date() },
            { id: 3, title: 'Anti-Hero', artist: 'Taylor Swift', album: 'Midnights', duration: 229, preview_url: '', cover_url: '', deezer_id: null, genre: 'Pop', status: 'active', created_at: new Date(), updated_at: new Date() },
        ];
        this.users = [
            { id: 1, name: 'Admin', email: 'admin@example.com', password: '$2b$10$0oT7l9oQhU6q7m5aob9ACu2pmVBhiS46DPFP8pJRYs8hDWnpjVZUG', role: 'admin', created_at: new Date() },
        ];
        this.searchHistory = [];
        this.pendingTracks = [];
    }

    async query(sql, params = []) {
        // Filter out dotenv logging
        if (!sql.includes('SELECT') && !sql.includes('INSERT') && !sql.includes('DELETE')) {
            return [[{}]];
        }
        
        console.log('📊 Mock Query:', sql.substring(0, 60) + '...');
        console.log('   Params:', params.slice(0, 3));
        
        // SELECT * FROM tracks WHERE 1=1 AND ... LIMIT ? OFFSET ?
        if (sql.includes('SELECT * FROM tracks') && sql.includes('WHERE')) {
            let results = [...this.tracks];
            let paramIndex = 0;
            
            console.log('   Total tracks in DB:', results.length);
            
            // Filter by search (title LIKE ? OR artist LIKE ? OR album LIKE ?)
            if (sql.includes('title LIKE ?')) {
                const pattern = params[paramIndex] || '';
                results = results.filter(t => 
                    t.title.toLowerCase().includes(pattern.toLowerCase().replace(/%/g, '')) || 
                    t.artist.toLowerCase().includes(pattern.toLowerCase().replace(/%/g, '')) || 
                    t.album.toLowerCase().includes(pattern.toLowerCase().replace(/%/g, ''))
                );
                paramIndex += 3; // 3 LIKE params
                console.log('   After search filter:', results.length);
            }
            
            // Filter by status
            if (sql.includes('status = ?')) {
                const status = params[paramIndex];
                console.log('   Filtering by status:', status);
                results = results.filter(t => t.status === status);
                paramIndex += 1;
                console.log('   After status filter:', results.length);
            }
            
            // Pagination
            const limit = params[params.length - 1] || 20;
            const offset = params[params.length - 2] || 0;
            console.log('   Pagination - Limit:', limit, 'Offset:', offset);
            const paginated = results.slice(offset, offset + limit);
            
            console.log('   Returning', paginated.length, 'tracks');
            console.log('   Sample data:', paginated[0]);
            
            return [[paginated]];
        }

        // COUNT * FROM tracks
        if (sql.includes('SELECT COUNT(*) as total FROM tracks')) {
            let count = this.tracks.length;
            if (sql.includes('WHERE')) {
                let results = [...this.tracks];
                let paramIndex = 0;
                
                // Filter by search
                if (sql.includes('title LIKE ?')) {
                    const pattern = params[paramIndex] || '';
                    results = results.filter(t => 
                        t.title.toLowerCase().includes(pattern.toLowerCase().replace(/%/g, '')) || 
                        t.artist.toLowerCase().includes(pattern.toLowerCase().replace(/%/g, '')) || 
                        t.album.toLowerCase().includes(pattern.toLowerCase().replace(/%/g, ''))
                    );
                    paramIndex += 3;
                }
                
                // Filter by status
                if (sql.includes('status = ?')) {
                    const status = params[paramIndex];
                    if (status) results = results.filter(t => t.status === status);
                }
                count = results.length;
            }
            return [[[{ total: count }]]];
        }

        // INSERT INTO tracks
        if (sql.includes('INSERT') && sql.includes('tracks')) {
            const newTrack = {
                id: Math.max(...this.tracks.map(t => t.id), 0) + 1,
                title: params[0],
                artist: params[1],
                album: params[2] || '',
                duration: params[3] || 0,
                preview_url: params[4] || '',
                cover_url: params[5] || '',
                deezer_id: params[6] || null,
                genre: params[7] || '',
                status: params[8] || 'active',
                created_at: new Date(),
                updated_at: new Date()
            };
            this.tracks.push(newTrack);
            return [{ affectedRows: 1, insertId: newTrack.id }];
        }

        // INSERT INTO search_history
        if (sql.includes('DELETE') && sql.includes('INSERT') && sql.includes('search_history')) {
            this.searchHistory = this.searchHistory.filter(h => h.keyword !== params[0]);
            this.searchHistory.unshift({ keyword: params[0], created_at: new Date() });
            return [{ affectedRows: 1 }];
        }

        // SELECT FROM search_history
        if (sql.includes('SELECT') && sql.includes('search_history')) {
            return [[this.searchHistory.slice(0, 10)]];
        }

        // DELETE FROM search_history (all)
        if (sql.includes('DELETE FROM search_history') && !sql.includes('WHERE')) {
            const count = this.searchHistory.length;
            this.searchHistory = [];
            return [{ affectedRows: count }];
        }

        // DELETE FROM search_history WHERE keyword
        if (sql.includes('DELETE FROM search_history WHERE')) {
            const keyword = params[0];
            const before = this.searchHistory.length;
            this.searchHistory = this.searchHistory.filter(h => h.keyword !== keyword);
            return [{ affectedRows: before - this.searchHistory.length }];
        }

        // Default fallback
        console.warn('⚠️  Unhandled query:', sql);
        return [[{}]];
    }
}

const mockPool = new MockPool();
export default mockPool;
