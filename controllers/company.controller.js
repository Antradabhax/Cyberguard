var CompanyService = require('../services/company.service');


// Saving the context of this module inside the _the variable
_this = this;

exports.getCompanies = async function (req, res, next) {
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    try {
        var Companies = await CompanyService.getCompanies({}, page, limit)
        return res.status(200).json({ status: 200, data: Companies, message: "Succesfully Companies Recieved" });
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message });
    }
}

exports.getCompanyByName = async function (req, res) {
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 10;
    let filtro = { name: req.body.name }
    try {
        var Companies = await CompanyService.getCompanies(filtro, page, limit)
        return res.status(200).json({ status: 200, data: Companies, message: "Succesfully Companies Received" });
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message });
    }
}

exports.createCompany = async function (req, res) {
    function capitalizeWords(str) {
        return str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    var User = {
        name: capitalizeWords(req.body.name),
        domain: req.body.domain.toLowerCase()
    }
    try {
        var company = await CompanyService.createCompany(User)
        if (company.description) {
            return res.status(409).json({ status: 409, message: company.description })
        } else {
            return res.status(201).json({ status: 201, company, message: "Companía creada con éxito" });
        }
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message });
    }
}

exports.removeCompany = async function (req, res, next) {
    try {
        var deleted = await CompanyService.removeCompany(req.body.id)
        if (deleted) {
            return res.status(204).json({ status: 204, message: "Companía eliminada correctamente" });
        } else {
            return res.status(204).json({ status: 204, message: "Companía no encontrada" });
        }
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message });
    }
}
