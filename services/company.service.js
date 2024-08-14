// Gettign the Newly created Mongoose Model we just created 
var Company = require('../models/Company.model');
_this = this

// Async function to get the User List
exports.getCompanies = async function (query, page, limit) {

    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var Companies = await Company.paginate(query, options)
        // Return the Userd list that was retured by the mongoose promise
        return Companies;

    } catch (e) {
        // return a Error message describing the reason 
        console.log("error services", e)
        throw Error('Error while Paginating Companies');
    }
}


exports.createCompany = async function (company) {
    // Check if the username is already in use
    const existingCompanyrByName = await Company.findOne({ name: company.name });
    if (existingCompanyrByName) {
        return {
            description: "Nombre de empresa en uso"
        };
    }
    var newCompany = new Company({
        name: company.name,
        domain: company.domain
    });

    try {
        // Saving the User 
        var savedCompany = await newCompany.save();
        return savedCompany;
    } catch (e) {
        // return an Error message describing the reason 
        console.log(e);
        throw Error("Error while Creating Company");
    }
};

exports.removeCompany = async function (id) {
    try {
        var deleted = await Company.deleteOne({ _id: id })
        if (deleted.n === 0) {
            // throw error that User was not found
            throw Error('Company not found');
        }
        return deleted;
    } catch (e) {
        throw Error(`Error while deleting Company: ${e.message}`);
    }
};
