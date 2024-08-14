var UserService = require('../services/user.service');
var UserImgService = require('../services/userImg.service');
var EmailService = require('../services/email.service');
var User = require('../models/User.model');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');


// Saving the context of this module inside the _the variable
_this = this;

exports.getUsers = async function (req, res, next) {
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    try {
        var Users = await UserService.getUsers({}, page, limit)
        return res.status(200).json({ status: 200, data: Users, message: "Succesfully Users Recieved" });
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message });
    }
}

exports.getUsersByMail = async function (req, res) {
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 10;
    let filtro = { email: req.body.email }
    try {
        var Users = await UserService.getUsers(filtro, page, limit)
        return res.status(200).json({ status: 200, data: Users, message: "Succesfully Users Received" });
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message });
    }
}

exports.getUsersByCompany = async function (req, res) {
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 10;
    let filtro = { company: req.body.entidad }
    try {
        var Users = await UserService.getUsers(filtro, page, limit)
        return res.status(200).json({ status: 200, data: Users, message: "Succesfully Users Received" });
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message });
    }
}

exports.createUser = async function (req, res) {
    function capitalizeWords(str) {
        return str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    var User = {
        name: capitalizeWords(req.body.name),
        lastname: capitalizeWords(req.body.lastname),
        email: req.body.email.toLowerCase(),
        phone: req.body.phone,
        password: req.body.password,
        company: req.body.company,
        rol: req.body.rol
    }
    try {
        var token = await UserService.createUser(User)
        if (token.description) {
            return res.status(409).json({ status: 409, message: token.description })
        } else {
            // Enviar correo de bienvenida con diseño mejorado
            const mailOptions = {
                from: 'cyberguard.uade@gmail.com',
                to: req.body.email,
                subject: 'Activa tu cuenta',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            .email-container {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                color: #333;
                                max-width: 600px;
                                margin: auto;
                                padding: 20px;
                                border: 1px solid #ddd;
                                border-radius: 10px;
                                background-color: #f9f9f9;
                            }
                            .email-header {
                                text-align: center;
                                background-color: #4CAF50;
                                color: white;
                                padding: 10px 0;
                                border-top-left-radius: 10px;
                                border-top-right-radius: 10px;
                            }
                            .email-body {
                                padding: 20px;
                            }
                            .email-footer {
                                text-align: center;
                                margin-top: 20px;
                                font-size: 12px;
                                color: #888;
                            }
                            .btn {
                                display: inline-block;
                                padding: 10px 20px;
                                margin: 10px 0;
                                font-size: 16px;
                                color: white;
                                background-color: #4CAF50;
                                text-decoration: none;
                                border-radius: 5px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="email-container">
                            <div class="email-header">
                                <h1>¡Bienvenido a CyberGuard!</h1>
                            </div>
                            <div class="email-body">
                                <h2>Hola ${req.body.username},</h2>
                                <p>Gracias por registrarte en CyberGuard. Estamos encantados de tenerte con nosotros.</p>
                                <p>A continuación, te proporcionamos algunos detalles importantes sobre tu cuenta:</p>
                                <ul>
                                    <li><strong>Nombre:</strong> ${req.body.name} ${req.body.lastname}</li>
                                    <li><strong>Nombre de usuario:</strong> ${req.body.username}</li>
                                    <li><strong>Email:</strong> ${req.body.email}</li>
                                </ul>
                                <p>Para comenzar a utilizar CyberGuard, haz clic en el siguiente enlace para activar tu cuenta.</p>
                                <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
                                <p><a href="https://cyberguard-uade.onrender.com/activate/${token}" class="btn">Activar Cuenta</a></p>
                            </div>
                            <div class="email-footer">
                                <p>&copy; 2024 CyberGuard. Todos los derechos reservados.</p>
                                <p>Si no reconoces este correo, por favor ignóralo.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };
            await EmailService.sendEmail(mailOptions);
            return res.status(201).json({ status: 201, token, message: "Usuario creado y correo enviado con éxito" });
        }
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message });
    }
}

exports.activateUser = async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(400).send('Invalid token');
        }

        if (user.validated) {
            return res.status(400).send('Account already activated');
        }

        user.validated = true;
        await user.save();
        res.status(200).json({ status: 200, message: 'Account activated successfully' });
    } catch (err) {
        console.error('Error activating user:', err);
        res.status(500).send('Error activating user');
    }
};


exports.updateRol = async function (req, res, next) {
    var User = {_id: req.body.id, rol: req.body.rol}
    try {
        var updatedUser = await UserService.updateUser(User);
        return res.status(200).json({ status: 200, data: updatedUser, message: "Usuario actualizado y correo enviado con éxito" });
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message });
    }
}

exports.updatePassword = async function (req, res, next) {
    const { token, password } = req.body;


    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        const email = decoded.email;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        user.password = bcrypt.hashSync(password, 8);
        await user.save();

        res.status(200).send({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Invalid or expired token' });
    }
}

exports.forgotPassword = async function (req, res, next) {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const token = jwt.sign({ email: user.email }, process.env.SECRET, { expiresIn: '1h' });

        // Enviar correo de actualización de contraseña
        const mailOptions = {
            from: 'cyberguard.uade@gmail.com',
            to: req.body.email,
            subject: 'Actualización de Contraseña',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        .email-container {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: auto;
                            padding: 20px;
                            border: 1px solid #ddd;
                            border-radius: 10px;
                            background-color: #f9f9f9;
                        }
                        .email-header {
                            text-align: center;
                            background-color: #4CAF50;
                            color: white;
                            padding: 10px 0;
                            border-top-left-radius: 10px;
                            border-top-right-radius: 10px;
                        }
                        .email-body {
                            padding: 20px;
                        }
                        .email-footer {
                            text-align: center;
                            margin-top: 20px;
                            font-size: 12px;
                            color: #888;
                        }
                        .btn {
                            display: inline-block;
                            padding: 10px 20px;
                            margin: 10px 0;
                            font-size: 16px;
                            color: white;
                            background-color: #4CAF50;
                            text-decoration: none;
                            border-radius: 5px;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="email-header">
                            <h1>Actualización de Contraseña</h1>
                        </div>
                        <div class="email-body">
                            <h2>Hola ${user.username},</h2>
                            <p>Recibimos una solicitud para cambiar tu contraseña.</p>
                            <p>Clickea en el botón de abajo para actualizarla.</p>
                            <p><a href="https://cyberguard-uade.onrender.com/reestablecerContraseña/${token}" class="btn" style="color: white;">Actualizar Contraseña</a></p>
                        </div>
                        <div class="email-footer">
                            <p>&copy; 2024 CyberGuard. Todos los derechos reservados.</p>
                            <p>Si no reconoces este correo, por favor ignóralo.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        await EmailService.sendEmail(mailOptions);

        res.status(200).send({ message: 'Password reset link sent' });
    } catch (error) {
        res.status(500).send({ message: 'Error sending email' });
    }
}

exports.removeUser = async function (req, res, next) {
    var mail = req.body.email;
    try {
        var deleted = await UserService.deleteUser(mail);
        if (deleted.deletedCount != 0) return res.status(200).json({ status: 200, message: "Succesfully Deleted... " });
        else { throw new Error }
    } catch (e) {
        return res.status(400).json({ status: 400, message: "User not found" });
    }
}

exports.loginUser = async function (req, res) {
    var User = {
        email: req.body.email,
        password: req.body.password
    }
    try {
        var loginUser = await UserService.loginUser(User);
        if (loginUser === 0) {
            return res.status(400).json({ status: 400, message: "Error en la contraseña" });
        } else {
            // Configurar la cookie httpOnly con el token
            res.cookie('token', loginUser.token, {
                httpOnly: true, // La cookie no es accesible desde JavaScript
                secure: true, // La cookie solo se envía a través de HTTPS
                maxAge: 24 * 60 * 60 * 1000, // La cookie expira en 1 día
                sameSite: 'Strict' // Protección adicional contra ataques CSRF
            });
            return res.status(201).json({ loginUser, message: "Successfully logged in" });
        }
    } catch (e) {
        return res.status(400).json({ status: 400, message: "Invalid username or password" });
    }
}

