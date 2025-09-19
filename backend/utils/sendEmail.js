const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // TLS para 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"Quizz App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Correo enviado a', to);
  } catch (error) {
    console.error('Error enviando correo:', error);
  }
}

module.exports = sendEmail;
