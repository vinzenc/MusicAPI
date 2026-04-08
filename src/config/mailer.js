import nodemailer from 'nodemailer';

const tranporter = nodemailer.createTransport(
    {
        service: 'gmail',
        auth:{
            user: 'musicapp278@gmail.com',
            pass: 'rrae bwqy rxpn dppc'
        }
    }
);

export const sendResetEmail = async(toEmail, otp) => {
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


