var ReportService = require('../services/report.service');
var UserImgService = require('../services/userImg.service');
var EmailService = require('../services/email.service');

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getReports = async function (req, res, next) {

    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    try {
        var Reports = await ReportService.getReports({}, page, limit)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, data: Reports, message: "Succesfully Reports Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(400).json({ status: 400, message: e.message });
    }
}
exports.getReportByUser = async function (req, res) {

    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;

    let filtro = req.body
    try {
        var Reports = await ReportService.getReports(filtro, page, limit)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, data: Reports, message: "Succesfully Reports Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(400).json({ status: 400, message: e.message });
    }
}

exports.getReportByContent = async function (req, res) {

    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1;

    let filtro = req.body
    try {
        var Reports = await ReportService.getReportByContent(filtro, page, limit)
        // Return the Users list with the appropriate HTTP password Code and Message.
        if (Reports == undefined) {
            return res.status(404).json({ status: 404, message: "Report not found" });
        }
        return res.status(200).json({ status: 200, data: Reports, message: "Succesfully Reports Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(400).json({ status: 400, message: e.message });
    }
}

exports.getReportsByCompany = async function (req, res) {

    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;

    let filtro = req.body
    try {
        var Reports = await ReportService.getReports(filtro, page, limit)
        // Return the Users list with the appropriate HTTP password Code and Message.
        if (Reports == undefined) {
            return res.status(404).json({ status: 404, message: "Report not found" });
        }
        return res.status(200).json({ status: 200, data: Reports, message: "Succesfully Reports Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(400).json({ status: 400, message: e.message });
    }
}


exports.createReport = async function (req, res) {

    var Report = {
        user: req.body.user,
        type: req.body.type,
        description: req.body.description,
        content: req.body.content,
        pretends: req.body.pretends,
        company: req.body.company
    }

    try {
        var createdReport = await ReportService.createReport(Report)

        if (createdReport.descriptionError) {
            return res.status(409).json({
                status: 409, message: "Report already exist"
            })
        }
        else if (createdReport.flaggedError) {
            return res.status(409).json({
                status: 409, message: "Report flagged"
            })
        }
        else {
            // Enviar correo de confirmación de reporte
            const mailOptions = {
                from: 'cyberguard.uade@gmail.com',
                to: req.body.email,
                subject: 'Reporte Creado Exitosamente',
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
                                <h1>Reporte Creado Exitosamente</h1>
                            </div>
                            <div class="email-body">
                                <h2>Hola ${req.body.user.name},</h2>
                                <p>Tu reporte ha sido creado con éxito. A continuación, te proporcionamos algunos detalles importantes sobre tu reporte:</p>
                                <ul>
                                    <li><strong>Tipo:</strong> ${req.body.type}</li>
                                    <li><strong>Descripción:</strong> ${req.body.description}</li>
                                    <li><strong>Contenido:</strong> ${req.body.content}</li>
                                    <li><strong>Intenciones:</strong> ${req.body.pretends}</li>
                                </ul>
                                <p>Si tienes alguna pregunta o necesitas más información, no dudes en contactarnos.</p>
                                <p><a href="https://cyberguard-uade.onrender.com/reportes" class="btn">Visualiza todos los reportes</a></p>
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
            return res.status(201).json({ status: 201, message: "Reporte creado y correo enviado con éxito", report: createdReport });
        }
    } catch (e) {
        console.log(e)
        return res.status(400).json({ status: 400, message: "La creación del reporte no fue exitosa" })
    }
}


exports.updateReport = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(400).json({ status: 400., message: "Id be present" })
    }

    var Report = {
        _id: req.body._id,
        estado: req.body.estado,
        valoracion: req.body.valoracion
    }
    try {
        var updatedReport = await ReportService.updateReport(Report)
        return res.status(200).json({ status: 200, data: updatedReport, message: "Succesfully Updated Report" })
    } catch (e) {
        return res.status(400).json({ status: 400., message: e.message })
    }
}

exports.likeReport = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body.reportId) {
        return res.status(400).json({ status: 400., message: "Id must be present" })
    }

    var Report = { _id: req.body.reportId, user: req.body.userId }

    try {
        var updatedReport = await ReportService.likeReport(Report)
        const mailOptions = {
            from: 'cyberguard.uade@gmail.com',
            to: req.body.email,
            subject: 'Reporte Aprobado',
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
                            background-color: #ff4c4c;
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
                            background-color: #ff4c4c;
                            text-decoration: none;
                            border-radius: 5px;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="email-header">
                            <h1>Reporte Desaprobado</h1>
                        </div>
                        <div class="email-body">
                            <h2>Hola,</h2>
                            <p>El reporte de contenido <strong>${req.body.content}</strong> ha sido aprobado.</p>
                            <p>Si tienes alguna pregunta o necesitas más información, no dudes en contactarnos.</p>
                            <p><a href="https://cyberguard-uade.onrender.com/contact" class="btn">Contactar Soporte</a></p>
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
        return res.status(200).json({ status: 200, message: "Succesfully Updated Report" })
    } catch (e) {
        return res.status(400).json({ status: 400., message: e.message })
    }
}

exports.dislikeReport = async function (req, res, next) {
    if (!req.body.reportId) {
        return res.status(400).json({ status: 400, message: "Id must be present" })
    }

    var Report = { _id: req.body.reportId, user: req.body.userId }

    try {
        var updatedReport = await ReportService.dislikeReport(Report)
        const mailOptions = {
            from: 'cyberguard.uade@gmail.com',
            to: req.body.email,
            subject: 'Reporte Desaprobado',
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
                            background-color: #ff4c4c;
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
                            background-color: #ff4c4c;
                            text-decoration: none;
                            border-radius: 5px;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="email-header">
                            <h1>Reporte Desaprobado</h1>
                        </div>
                        <div class="email-body">
                            <h2>Hola,</h2>
                            <p>El reporte de contenido <strong>${req.body.content}</strong> ha sido desaprobado.</p>
                            <p>Si tienes alguna pregunta o necesitas más información, no dudes en contactarnos.</p>
                            <p><a href="https://cyberguard-uade.onrender.com/contact" class="btn">Contactar Soporte</a></p>
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
        return res.status(200).json({ status: 200, message: "Successfully Disliked Report" });
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message });
    }
}


exports.removeReport = async function (req, res, next) {

    var id = req.body.reportId;
    try {
        var deleted = await ReportService.deleteReport(id);
        const mailOptions = {
            from: 'cyberguard.uade@gmail.com',
            to: req.body.email,
            subject: 'Eliminación de Reporte',
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
                            background-color: #ff4c4c;
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
                            background-color: #ff4c4c;
                            text-decoration: none;
                            border-radius: 5px;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="email-header">
                            <h1>Reporte Eliminado</h1>
                        </div>
                        <div class="email-body">
                            <h2>Hola, ${req.body.username}</h2>
                            <p>El reporte de contenido <strong>${req.body.content}</strong> ha sido eliminado.</p>
                            <p>Si tienes alguna pregunta o necesitas más información, no dudes en contactarnos.</p>
                            <p><a href="http://localhost:3000/reportes" class="btn">Visualizar Reportes</a></p>
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
        res.status(200).json({ status: 200, message: "Succesfully Deleted... " });
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message })
    }
}
