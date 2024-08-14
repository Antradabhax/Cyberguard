const nodemailer = require('nodemailer');
require('../config').config();

const transporter = nodemailer.createTransport({
    secure: true,
    port: 25,
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: process.env.EMAILSENDER, // poner cuenta gmail
        pass: process.env.EMAILPASSWORD  // contraseña cuenta IMPORTANTE HABILITAR acceso apps poco seguras google
    }
});



async function sendEmail(mailOptions) {
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return { status: 200, message: "Email enviado con éxito" };
    } catch (error) {
        console.log("Error envio mail: ", error);
        return { status: 400, message: "Error envio mail" };
    }
}

module.exports = {
    sendEmail
};
