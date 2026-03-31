import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getUserByEmail } from '../models/userModel.js';

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
        const newUserId = await register(name,email,hashPassword);
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

