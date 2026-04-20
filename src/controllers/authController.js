import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getUserByEmail, registerUser } from '../models/userModel.js';
import { sendResetEmail } from '../config/mailer.js';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secet_key_musicapp';
const OTP_EXPIRE_MINUTES = 15;

// Tao ma OTP 6 so de xac minh reset mat khau.
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Nhan dien loi khoi tao DB de tra ma 503 thay vi 500.
const isDbNotReady = (error) => error?.code === 'DB_NOT_READY';

// API đăng ký
export const register = async (req,res) => {
    try {
        const {name,email,password} = req.body;
        if(!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin"
            });
        }

        const emailExist = await getUserByEmail(email);
        if(emailExist) {
            return res.status(400).json({
                success: false,
                message: "Email đã tồn tại"
            });
        }

        const hashPassword = await bcrypt.hash(password,10);
        const newUserId = await registerUser(name, email, hashPassword);

        return res.status(201).json({
            success: true,
            message: "Đăng ký thành công",
            data: {
                id: newUserId,
                name,
                email,
            }
        });
    } catch (error) {
        if (isDbNotReady(error)) {
            return res.status(503).json({
                success: false,
                message: 'Database tam thoi khong kha dung'
            });
        }

        console.error("Lỗi đăng ký:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi đăng ký người dùng"
        });
    }
};

// API đăng nhập
export const login = async (req,res) => {
    try {
        const {email,password} = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập email và mật khẩu"
            });
        }

        const user = await getUserByEmail(email);
        if(!user) {
            return res.status(400).json({
                success: false,
                message: "Email hoặc mật khẩu không đúng"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Email hoặc mật khẩu không đúng"
            });
        }

        const token = await jwt.sign({id: user.id, role: user.role}, JWT_SECRET, {expiresIn: '1h'});

        return res.status(200).json({
            success: true,
            message: "Đăng nhập thành công",
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        if (isDbNotReady(error)) {
            return res.status(503).json({
                success: false,
                message: 'Database tam thoi khong kha dung'
            });
        }

        console.error("Lỗi đăng nhâp:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi đăng nhập người dùng server"
        });
    }
};

// API gửi mã OTP
export const forgotPassword = async(req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập email"
            });
        }

        if (!pool || typeof pool.query !== 'function') {
            return res.status(503).json({
                success: false,
                message: 'Database tam thoi khong kha dung'
            });
        }

        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Email không tồn tại!"
            });
        }

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60000);

        await pool.query(
            "UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE email = ?",
            [otp, expiresAt, email]
        );

        await sendResetEmail(email, otp);

        return res.json({
            success: true,
            message: "Mã OTP đã được gửi đến email của bạn!"
        });
    } catch (error) {
        console.log("Lỗi gửi mã OTP reset mật khẩu",error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi gửi mã OPT reset mật khẩu'
        });
    }
};

// API đổi mật khẩu bằng OTP
export const resetPassword = async(req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập email, OTP và mật khẩu mới"
            });
        }

        if (!pool || typeof pool.query !== 'function') {
            return res.status(503).json({
                success: false,
                message: 'Database tam thoi khong kha dung'
            });
        }

        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        const user = rows[0];
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Tài khoản không tồn tại!"
            });
        }

        if (String(user.reset_otp) !== String(otp)) {
            return res.status(400).json({
                success: false,
                message: "Mã OTP không chính xác!"
            });
        }

        if (!user.reset_otp_expires || new Date() > new Date(user.reset_otp_expires)) {
            return res.status(400).json({
                success: false,
                message: "Mã OTP đã hết hạn!"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.query(
            "UPDATE users SET password = ?, reset_otp = NULL, reset_otp_expires = NULL WHERE email = ?",
            [hashedPassword, email]
        );

        return res.json({
            success: true,
            message: "Đặt lại mật khẩu thành công!"
        });
    } catch (error) {
        console.log("Lỗi reset password");
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};