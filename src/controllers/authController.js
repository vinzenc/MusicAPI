import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getUserByEmail, registerUser } from '../models/userModel.js';
import { sendResetEmail } from '../config/mailer.js';
import pool from '../config/db.js';
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secet_key_musicapp';

//Api dăng ký
export const register = async (req,res) => {
    try {
        const {name,email,password} = req.body;
        if(!name || !email || !password) {
            return res.status(400).json({
                message: "Vui lòng điền đầy đủ thông tin"
            });
        }
        const emalExist = await getUserByEmail(email);
        if(emalExist) {
            return res.status(400).json({
                message: "Email đã tồn tại"
            });
        }
        const hashPassword = await bcrypt.hash(password,10);
        const newUserId = await registerUser(name, email, hashPassword);
        res.status(201).json({
            success: true,
            message: "Đăng ký thành công",
        });
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        res.status(500).json({ message: "Lỗi đăng ký người dùng" });
    }
};

//Api đăng nhập
export const login = async (req,res) => {
    try {
        const {email,password} = req.body;
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
        const token = jwt.sign({id: user.id, role: user.role}, JWT_SECRET, {expiresIn: '1h'});
        res.status(200).json({
            success: true,
            message: "Đăng nhập thành công",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Lỗi đăng nhâp:", error);
        res.status(500).json({ message: "Lỗi đăng nhập người dùng" });
    }
};

//API gửi mã OTP
export const forgotPassword = async(req, res) => {
    try {
        const { email } = req.body;
        const user = await getUserByEmail(email);
        if (!user) return res.status(404).json({
            success: false,
            message: "Email không tồn tại!"
        });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60000);
        await pool.query(
            "UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE email = ?",
            [otp, expiresAt, email]
        );
        await sendResetEmail(email, otp);
        res.json({ success: true, message: "Mã OTP đã được gửi đến email của bạn!" });
    } catch (error) {
        console.log("Lỗi gửi mã OTP reset mật khẩu",error);
        res.status(500).json({
            success: false,
            message: 'Lỗi gửi mã OPT reset mật khẩu'
        });
    }
}

//APT đổi mật khẩu
export const resetPassword = async(req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        const user = rows[0];
        if (!user) return res.status(404).json({ message: "Tài khoản không tồn tại!" });
        if (user.reset_otp !== otp) {
            return res.status(400).json({ message: "Mã OTP không chính xác!" });
        }
        if (new Date() > new Date(user.reset_otp_expires)) {
            return res.status(400).json({ message: "Mã OTP đã hết hạn!" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await pool.query(
            "UPDATE users SET password = ?, reset_otp = NULL, reset_otp_expires = NULL WHERE email = ?",
            [hashedPassword, email]
        );
        res.json({ success: true, message: "Đặt lại mật khẩu thành công!" });
    } catch (error) {
        console.log("Lỗi reset password");
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}