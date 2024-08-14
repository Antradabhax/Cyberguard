var express = require('express')
var router = express.Router()
var UserController = require('../controllers/users.controller');
var Authorization = require('../auth/authorization');

router.get('/test', function(req, res) {
    res.send('Llegaste a la ruta de users');
  });
router.post('/registration', UserController.createUser)
router.get('/activate/:token', UserController.activateUser);
router.post('/login', UserController.loginUser)
router.get('/',Authorization, UserController.getUsers)
router.post('/userByMail', Authorization, UserController.getUsersByMail)
router.post('/usersByCompany', UserController.getUsersByCompany)
router.put('/rol', UserController.updateRol)
router.put('/password', UserController.updatePassword)
router.post('/forgotPassword', UserController.forgotPassword)

// Export the Router
module.exports = router;




