const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 25,
    secure: false,
    auth: {
        user: "10e8eedea04001",
        pass: "a402cc82409b85",
    },
});

module.exports = {
    sendmailFrogetPass: async function (to, URL) {
        return await transporter.sendMail({
            from: `NNPTUD@heeheheh`, // sender address
            to: to, // list of receivers
            subject: "MAIL MOI DU LICH CAM", // Subject line
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 500px; margin: auto;">
                <h2 style="color: #007bff; text-align: center;">MAIL MỚI DU LỊCH CAM</h2>
                <p style="font-size: 16px; color: #333;">Bạn có một yêu cầu đặt lại mật khẩu. Vui lòng nhấn vào nút bên dưới để tiếp tục:</p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${URL}" 
                       style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        CLICK VÀO ĐÂY
                    </a>
                </div>
                <p style="font-size: 14px; color: #666;">Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
            </div>
        `
        });
    }
}