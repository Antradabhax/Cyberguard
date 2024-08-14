let nodemailer = require('nodemailer');
const SMTPPool = require('nodemailer/lib/smtp-pool');


exports.sendEmail = async function (req, res, next) {
    console.log('REQ.BODY A VER',req.body)
    // Definimos el transporter
    var transporter = nodemailer.createTransport({
        //host: 'svp-02715.fibercorp.local',
        secure: true,
        port: 25,
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: '',//poner cuenta gmail
            pass: ''  //contraseña cuenta  IMPORTANTE HABILITAR acceso apps poco seguras google
        }
    });
    // Definimos el email

    if (req.body.obj.tipo == 1) {
        var mailOptions = {
            from: 'infoapiprofesor@gmail.com',
            to: req.body.obj.email,
            subject: req.body.obj.asunto,
            html: `<h1>Estimado/a ${req.body.obj.name} ${req.body.obj.apellido}</h1> </br> <h3> ${req.body.obj.mensaje}</h3> </br> <h4>Email: ${req.body.obj.email} </h4> </br> <h4> Telefono: ${req.body.obj.tel}</h4>`,
        };
    }
    else if (req.body.obj.tipo == 0) {
        var mailOptions = {
            from: 'infoapiprofesor@gmail.com',
            to: req.body.obj.email,
            subject: req.body.obj.asunto,
            html: `<h1>Estimado/a ${req.body.obj.name} ${req.body.obj.apellido}</h1> </br> <h3> ${req.body.obj.mensaje}</h3>`,

        };
    }
    else if (req.body.obj.tipo == 2) {
        var mailOptions = {
            from: 'infoapiprofesor@gmail.com',
            to: req.body.obj.email,
            subject: req.body.obj.asunto,
            html: `<h1>Estimado/a </h1> </br> <h3> ${req.body.obj.mensaje}</h3> </br> <h4>Motivo: ${req.body.obj.textoRechazo} </h4>`,

        };
    }

    else if (req.body.obj.tipo == 3) {
        var mailOptions = {
            from: 'infoapiprofesor@gmail.com',
            to: req.body.obj.email,
            subject: req.body.obj.asunto,
            html: `<h1>Estimado/a </h1> </br> <h3> ${req.body.obj.mensaje}</h3>`,

        };
    }

    else if (req.body.obj.tipo == 4) {
        var mailOptions = {
            from: 'infoapiprofesor@gmail.com',
            to: req.body.obj.email,
            subject: req.body.obj.asunto,
            html: `<h1>Estimado/a </h1> </br> <h3> ${req.body.obj.mensaje}</h3>  </br> <a>http://localhost:3000/nuevacontrasena/${req.body.obj.email}</a>`,

        };
    }


    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return res.status(200).json({ status: 200, message: "Email enviado con éxito" })
    }
    catch (error) {
        console.log("Error envio mail: ", error);
    }
};