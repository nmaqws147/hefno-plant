
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { name, email, message } = req.body;

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
        });

        await transporter.sendMail({
            from: `"Hefno Contact" <${process.env.EMAIL_USER}>`, 
            to: "Elhfnaweedowidar21@gmail.com",
            replyTo: email,
            subject: `New Contact from ${name}`,
            html: `
                <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px;">
                    <h2 style="color: #00695c;">رسالة جديدة من الموقع</h2>
                    <p><strong>الاسم:</strong> ${name}</p>
                    <p><strong>الإيميل:</strong> ${email}</p>
                    <hr />
                    <p><strong>الرسالة:</strong></p>
                    <p>${message}</p>
                </div>
            `,
        });

        return res.status(200).json({ 
            success: true, 
            message: 'Email sent successfully!' 
        });

    } catch (error) {
        console.error("Email Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error', 
            detail: error.message 
        });
    }
};