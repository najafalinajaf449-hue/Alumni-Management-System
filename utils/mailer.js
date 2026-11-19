const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function sendMail({ to, subject, html }) {
    return transporter.sendMail({
        from: `"AlumniConnect" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
    });
}
transporter.verify((error) => {
    if (error) {
        console.log("SMTP Connection FAILED:", error.message);
    } else {
        console.log("SMTP Server is ready to send emails");
    }
});

module.exports = { sendMail };