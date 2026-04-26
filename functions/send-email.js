const nodemailer = require('nodemailer');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const { to, code } = JSON.parse(event.body);

        console.log("Sending email to:", to);

        // ✅ DÜZGÜN SMTP konfiqurasiyası (Gmail)
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",     // ← DƏYİŞDİRİLDİ!
            port: 587,                   // ← DƏYİŞDİRİLDİ!
            secure: false,               // ← 587 üçün false
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: `"Verify Swift" <${process.env.SMTP_USER}>`,
            to: to,
            subject: "Your Verification Code - Verify Swift",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #3498db;">Verify Swift</h2>
                    <p>Your verification code is:</p>
                    <div style="font-size: 32px; font-weight: bold; color: #2c3e50; letter-spacing: 5px; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                        ${code}
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: "Verification code sent successfully"
            })
        };

    } catch (error) {
        console.error("Email error:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: "Failed to send email: " + error.message
            })
        };
    }
};
