var express = require('express')
var router = express.Router()
var CompanyController = require('../controllers/company.controller');

router.get('/test', function(req, res) {
    res.send('Llegaste a la ruta de users');
  });
router.post('/create', CompanyController.createCompany)
router.get('/', CompanyController.getCompanies)
router.get('/company', CompanyController.getCompanyByName)
router.delete('/', CompanyController.removeCompany)


// Export the Router
module.exports = router




