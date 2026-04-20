import nodemailer from 'nodemailer';

// Tao transport Gmail de gui email OTP/phuc hoi mat khau.
const tranporter = nodemailer.createTransport(
    {
        service: 'gmail',
        auth:{
            user: 'musicapp278@gmail.com',
            pass: 'pvhs oqto imjf svpz'
        }
    }
);

// Gui email chua ma OTP dat lai mat khau den nguoi dung.
export const sendResetEmail = async(toEmail, otp) => {
    // Cau hinh noi dung email gui den dia chi nhan.
    const mailOptions = {
        from: `"Music APP " <${'musicapp278@gmail.com'}>`,
        to: toEmail,
        subject: 'Mã xác nhận khôi phục mật khẩu',
        html: `<p>Xin chào,</p>
               <p>Mã OTP khôi phục mật khẩu của bạn là: <b>${otp}</b></p>
               <p>Mã này sẽ hết hạn trong 15 phút.</p>`
    }
    await tranporter.sendMail(mailOptions);
};


