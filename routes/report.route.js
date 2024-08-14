var express = require('express')
var router = express.Router()
var ReportController = require('../controllers/report.controller');
var Authorization = require('../auth/authorization'); 

// Authorize each API with middleware and map to the Controller Functions
/* GET users listing. */
router.get('/test', function (req, res) {
    res.send('Llegaste a la ruta de reportes');
});
router.post('/create', Authorization,ReportController.createReport)
router.get('/',ReportController.getReports)
router.post('/reportsByUser',Authorization, ReportController.getReportByUser)
router.post('/reportByContent', ReportController.getReportByContent)
router.post('/reportsByCompany', ReportController.getReportsByCompany)
router.put('/like',Authorization, ReportController.likeReport)
router.put('/dislike',Authorization, ReportController.dislikeReport)
router.delete('/', Authorization, ReportController.removeReport)


// Export the Router
module.exports = router;