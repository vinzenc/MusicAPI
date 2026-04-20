# MusicAPI Backend

Backend API cho ung dung nghe nhac, xay dung bang Node.js + Express + MySQL.

## 1) Tong quan

- Runtime: Node.js (ESM)
- Framework: Express
- Database: MySQL (mysql2)
- Upload media: Cloudinary
- Auth: JWT
- Upload middleware: Multer

Server mount route nhu sau:

- `/auth/*` cho dang ky/dang nhap/quen mat khau
- `/users/*` cho quan tri user (chi admin)
- `/profile/*` cho user/ctv tu cap nhat thong tin
- `/music/*` cho nhac
- `/api/*` la alias cua `/music/*`

## 2) Cai dat nhanh

```bash
npm install
```

Chay dev:

```bash
npm run dev
```

Chay production:

```bash
npm start
```

## 3) Cau hinh .env

Tao file `.env` trong thu muc `MusicAPI`:

```env
PORT=3001
JWT_SECRET=your_super_secret

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=music_app

CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

Luu y:

- DB dang duoc config SSL trong `src/config/db.js` (`rejectUnauthorized: true`).
- Neu dung MySQL local khong SSL, can dieu chinh lai config SSL trong code.

## 4) Khoi tao database

### 4.1 Chay migration co san

```bash
node migrate.js user.sql
node migrate.js search_history.sql
```

### 4.2 Bang songs va song_likes

Khong can migration rieng. Server tu tao khi khoi dong thong qua bootstrap schema.

### 4.3 Cot OTP cho reset password (neu chua co)

Controller `forgotPassword/resetPassword` can 2 cot nay trong bang users:

```sql
ALTER TABLE users
ADD COLUMN reset_otp VARCHAR(10) NULL,
ADD COLUMN reset_otp_expires DATETIME NULL;
```

## 5) Kiem tra server da san sang

Sau khi chay server, test:

```bash
curl -i http://localhost:3001/health
```

Ket qua mong doi:

- `200 OK` + `database: connected`

Neu thay `503 DEGRADED`, backend dang len nhung DB chua ket noi.

## 6) Auth va phan quyen

- Header auth:

```http
Authorization: Bearer <JWT_TOKEN>
```

- Role lien quan:
	- Route `/users/*` can `admin`
	- Route review nhac chap nhan `admin`, `collaborator`, va `ctv` (neu token co role nay)

## 7) Danh sach endpoint chinh

### 7.1 Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

### 7.2 Music

- `GET /music/songs`
- `GET /music/songs/:id`
- `GET /music/songs/:id/listen`
- `POST /music/songs`
- `PUT /music/songs/:id`
- `DELETE /music/songs/:id`
- `POST /music/songs/multipart`
- `PUT /music/songs/:id/multipart`
- `POST /music/songs/upload`
- `POST /music/songs/upload-cover`
- `PATCH /music/songs/:id/review`
- `POST /music/songs/:id/like`

### 7.3 User (Admin only)

- `GET /users`
- `GET /users/:id`
- `POST /users/add`
- `PUT /users/:id`
- `DELETE /users/:id`
- `PATCH /users/:id/role`
- `PUT /users/:id/password`

### 7.4 Profile (user dang nhap)

- `PUT /profile`
- `PUT /profile/password`

## 8) Huong dan test thu cong chi tiet (Postman)

### 8.1 Chuan bi

1. Tao Postman Collection moi: `MusicAPI Manual Test`.
2. Tao environment variable:
	 - `base_url = http://localhost:3001`
	 - `token =` (de trong, se gan sau khi login)
3. Chac chan `/health` tra ve 200.

### 8.2 Auth flow

#### A. Dang ky

- Request: `POST {{base_url}}/auth/register`
- Body JSON:

```json
{
	"name": "Test User",
	"email": "testuser@example.com",
	"password": "123456"
}
```

Mong doi: `201`.

#### B. Dang nhap

- Request: `POST {{base_url}}/auth/login`
- Body JSON:

```json
{
	"email": "testuser@example.com",
	"password": "123456"
}
```

Mong doi: `200`, response co `token`.

Gan token vao environment `token`.

### 8.3 Chuan bi role de review nhac

Route review can role moderator.

Cach nhanh: nang role account test len collaborator trong DB:

```sql
UPDATE users SET role = 'collaborator' WHERE email = 'testuser@example.com';
```

Sau do login lai de lay token moi.

### 8.4 Music flow (JSON)

#### A. Tao bai hat

- Request: `POST {{base_url}}/music/songs`
- Body JSON:

```json
{
	"title": "Test Song",
	"artist": "Tester",
	"album": "Album A",
	"genre": "Pop",
	"duration": 123,
	"releaseYear": 2024,
	"audioUrl": "https://example.com/audio.mp3",
	"coverUrl": "https://example.com/cover.jpg"
}
```

Mong doi: `201`, luu lai `id` bai hat.

#### B. Lay danh sach va chi tiet

- `GET {{base_url}}/music/songs` -> `200`
- `GET {{base_url}}/music/songs/:id` -> `200`

#### C. Cap nhat bai hat

- Request: `PUT {{base_url}}/music/songs/:id`
- Body JSON:

```json
{
	"title": "Test Song Updated",
	"artist": "Tester",
	"album": "Album B",
	"genre": "Rock",
	"duration": 222,
	"releaseYear": 2025,
	"audioUrl": "https://example.com/audio2.mp3",
	"coverUrl": "https://example.com/cover2.jpg"
}
```

Mong doi: `200`.

### 8.5 Music flow (multipart upload)

#### A. Tao bai hat bang multipart

- Request: `POST {{base_url}}/music/songs/multipart`
- Body: `form-data`
	- `title` (Text)
	- `artist` (Text)
	- `album` (Text, optional)
	- `genre` (Text, optional)
	- `releaseYear` (Text/Number, optional)
	- `audio` (File, bat buoc de co nhac)
	- `cover` (File, optional)

Rule file:

- audio: toi da 50MB, mime `audio/*` hoac ten file `.mp3`
- cover: toi da 10MB, mime `image/*`

Mong doi: `201`, response co `audioUrl`, `coverUrl`, `cloudinaryId`.

#### B. Upload rieng audio/cover

- `POST {{base_url}}/music/songs/upload` (form-data key: `audio`)
- `POST {{base_url}}/music/songs/upload-cover` (form-data key: `cover`)

### 8.6 Review va like

#### A. Review bai hat

- Request: `PATCH {{base_url}}/music/songs/:id/review`
- Header: `Authorization: Bearer {{token}}`
- Body JSON:

```json
{
	"status": "approved"
}
```

Mong doi: `200`, `approvalStatus` doi thanh `approved`.

#### B. Like bai hat

- Request: `POST {{base_url}}/music/songs/:id/like`

Mong doi lan 1: `200`.
Mong doi lan 2 cung user/ip: `409` (da like truoc do).

### 8.7 Xoa bai hat

- Request: `DELETE {{base_url}}/music/songs/:id`

Mong doi: `200`.

## 9) Quick test bang curl

### Dang ky

```bash
curl -X POST http://localhost:3001/auth/register \
	-H "Content-Type: application/json" \
	-d '{"name":"Test User","email":"testuser@example.com","password":"123456"}'
```

### Dang nhap

```bash
curl -X POST http://localhost:3001/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"testuser@example.com","password":"123456"}'
```

### Tao bai hat JSON

```bash
curl -X POST http://localhost:3001/music/songs \
	-H "Content-Type: application/json" \
	-d '{"title":"Test Song","artist":"Tester"}'
```

### Upload multipart

```bash
curl -X POST http://localhost:3001/music/songs/multipart \
	-F "title=Multipart Song" \
	-F "artist=Tester" \
	-F "audio=@/path/to/file.mp3" \
	-F "cover=@/path/to/cover.png"
```

## 10) Loi thuong gap

- `503 Database tam thoi khong kha dung`:
	- Kiem tra DB dang chay.
	- Kiem tra `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME`.
	- Kiem tra SSL co phu hop DB hay khong.

- `Must supply api_key` hoac loi Cloudinary:
	- Kiem tra 3 bien `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

- `Token khong hop le`:
	- Login lai de lay token moi.
	- Kiem tra `JWT_SECRET` dung voi secret server dang chay.

- `Chi chap nhan file audio/anh`:
	- Dung dung field (`audio`, `cover`) va dung mime/duoi file.

## 11) Ghi chu

- Script `seed` trong `package.json` hien dang tro toi file khong ton tai (`src/scripts/seedTracks.js`).
- Neu can seed du lieu, hay tao script seed moi hoac cap nhat script cho dung file.
