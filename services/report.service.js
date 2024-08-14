// Gettign the Newly created Mongoose Model we just created 
var Report = require('../models/report.model')
const axios = require('axios');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
require('../config').config();


// Saving the context of this module inside the _the variable
_this = this

// Async function to get the User List
exports.getReports = async function (query, page, limit) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit,
        populate: [{
            path: 'user',
            select: 'name lastname email'
        },
        {
            path: 'company',
            select: ''
        }
        ]
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var Reports = await Report.paginate(query, options)
        // Return the Userd list that was retured by the mongoose promise
        return Reports;

    } catch (e) {
        // return a Error message describing the reason 
        console.log("error services", e)
        throw Error('Error while Paginating Reports');
    }
}

exports.getReportByContent = async function (query, page, limit) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit,
        populate: {
            path: 'user',
            select: 'username'
        }
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var Reports = await Report.paginate(query, options)
        // Return the Userd list that was retured by the mongoose promise
        return Reports.docs[0];

    } catch (e) {
        // return a Error message describing the reason 
        console.log("error services", e)
        throw Error('Error while Paginating Reports');
    }
}

exports.createReport = async function (report) {
    const existingReport = await Report.findOne({ "content": report.content });
    if (existingReport) {
        return { descriptionError: "The report is already created" };
    }

    function getGMTMinus3Date() {
        const now = new Date();
        const offset = -3 * 60; // GMT-3 en minutos
        const gmtMinus3Date = new Date(now.getTime() + offset * 60000);
        return gmtMinus3Date;
    }

    // Configurar las opciones para la solicitud a la API de moderación de texto
    const options = {
        method: 'POST',
        url: 'https://text-moderator.p.rapidapi.com/api/v1/moderate',
        headers: {
            'x-rapidapi-key': process.env.API_KEY_ANALYZER,
            'x-rapidapi-host': 'text-moderator.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: { input: report.description },
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
    };

    try {
        // Realizar la solicitud a la API de moderación de texto
        const response = await axios(options);

        // Verificar si alguno de los campos es mayor a 0.7
        const { toxic, offensive, spam, threat, indecent, erotic } = response.data;
        if ([toxic, offensive, spam, threat, indecent, erotic].some(value => value > 0.6)) {
            return { flaggedError: "Flagged" };
        }

        // Crear un nuevo reporte con la información proporcionada
        var newReport = new Report({
            user: report.user,
            type: report.type,
            description: report.description,
            content: report.content,
            company: report.company,
            pretends: report.pretends,
            date: getGMTMinus3Date(),
            likes: 0,
            dislikes: 0,
        });

        var savedReport = await newReport.save();
        return savedReport;

    } catch (error) {
        console.log(error);
        throw new Error("Error while Creating Report");
    }
}

exports.updateReport = async function (Reporto) {

    var _id = { _id: Reporto._id }

    try {
        //Find the old User Object by the Id    
        var oldReport = await Reporto.findOne(_id);
    } catch (e) {
        throw Error("Error occured while Finding the Report")
    }
    // If no old User Object exists return false
    if (!oldReport) {
        return false;
    }

    oldReport.estado = Reporto.estado
    oldReport.valoracion = Reporto.valoracion

    try {
        var savedReport = await oldReport.save()
        return savedReport;
    } catch (e) {
        throw Error("And Error occured while updating the Report");
    }
}

exports.likeReport = async function (report) {
    var _id = { _id: report._id }
    try {
        var oldReport = await Report.findOne(_id);
    } catch (e) {
        throw Error("Error occured while Finding the Report")
    }

    if (!oldReport) {
        return false;
    }

    // Verifica si el usuario ya dio dislike
    const dislikeIndex = oldReport.dislikesBy.indexOf(report.user);
    if (dislikeIndex !== -1) {
        oldReport.dislikes -= 1;
        oldReport.dislikesBy.splice(dislikeIndex, 1);
    }

    // Verifica si el usuario ya dio like
    const likeIndex = oldReport.likesBy.indexOf(report.user);
    if (likeIndex === -1) {
        oldReport.likes += 1;
        oldReport.likesBy.push(report.user);
    }

    try {
        var savedReport = await oldReport.save();
        return savedReport;
    } catch (e) {
        throw Error("An Error occured while updating the Report");
    }
}

exports.dislikeReport = async function (report) {
    var _id = { _id: report._id }
    try {
        var oldReport = await Report.findOne(_id);
    } catch (e) {
        throw Error("Error occured while Finding the Report")
    }

    if (!oldReport) {
        return false;
    }

    // Verifica si el usuario ya dio like
    const likeIndex = oldReport.likesBy.indexOf(report.user);
    if (likeIndex !== -1) {
        oldReport.likes -= 1;
        oldReport.likesBy.splice(likeIndex, 1);
    }

    // Verifica si el usuario ya dio dislike
    const dislikeIndex = oldReport.dislikesBy.indexOf(report.user);
    if (dislikeIndex === -1) {
        oldReport.dislikes += 1;
        oldReport.dislikesBy.push(report.user);
    }

    try {
        var savedReport = await oldReport.save();
        return savedReport;
    } catch (e) {
        throw Error("An Error occured while updating the Report");
    }
}


exports.finishReport = async function (Reporto) {

    var _id = { _id: Reporto._id }

    try {
        //Find the old User Object by the Id    
        var oldReport = await Reporto.findOne(_id);
    } catch (e) {
        throw Error("Error occured while Finding the Report")
    }
    // If no old User Object exists return false
    if (!oldReport) {
        return false;
    }

    oldReport.estado = Reporto.estado

    try {
        var savedReport = await oldReport.save()
        return savedReport;
    } catch (e) {
        throw Error("And Error occured while updating the Report");
    }
}


exports.deleteReport = async function (id) {

    try {
        var deleted = await Report.deleteOne({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Report Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Report")
    }
}