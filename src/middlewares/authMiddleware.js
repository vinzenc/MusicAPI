import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secet_key_musicapp';

export const verifyToken=(req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token){
        return res.status(403),json({
            success:false,
            message:"Không tìm thấy token"
        });
    }

    try {
        const decoded = jwt.verify(token,JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token không hợp lệ"
        });
    }
};

export const checkRole = (roles) =>{
    return (req,res,next) => {
        if(!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền truy cập"
            });
        }
        next();
    };
};