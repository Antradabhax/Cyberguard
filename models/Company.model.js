var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate-v2')


var CompanySchema = new mongoose.Schema({
    name: { type: String, required: true },
    domain: { type: String, required: true },
})

CompanySchema.plugin(mongoosePaginate)
const Company = mongoose.model('Company', CompanySchema, "Empresas")

module.exports = Company;