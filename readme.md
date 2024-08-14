# CyberGuard Backend

## Descripción

CyberGuard es una plataforma web que proporciona diversas funcionalidades relacionadas con la seguridad informática. Los usuarios pueden reportar incidentes de seguridad, acceder a recursos educativos, realizar pruebas de conocimiento y suscribirse a planes premium para obtener beneficios adicionales.
Este repositorio almacena lo necesario para almacenar y gestionar la información que alimenta a dicha página.
Permitiendo así que los usuarios logren realizar las acciones necesarias.

## Instalación
En primera instancia se requiere clonar el repositorio.

```bash
git clone https://github.com/MatheoLCaneva/BackendSeminario.git
```

### Dependencias
Para la instalación de dependencias ejecutaremos el siguiente comando.
```
npm install
```
## Inicialización
Para iniciar el proyecto ejecutamos.
```
nodemon
```

De esta forma, veremos nuestro servidor activo en el siguiente [link](http://localhost:4000/). 

El mismo se actualizará a medida que guardemos los cambios realizados.

## Rutas
> Cada acción sensible estará previamente validad por un jwt, el cual se validará en el componente [Authorization](https://github.com/MatheoLCaneva/BackendSeminario/blob/master/auth/authorization.js)
### /users
Utilizada para gestionar peticiones relacionadas con los usuarios, conteniendo los siguientes endpoints:

```javascript
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
router.put('/', Authorization, UserController.updateUser)
router.put('/password', UserController.updatePassword)
router.post('/forgotPassword', UserController.forgotPassword)

// Export the Router
module.exports = router;
```

### /reports
Utilizado para gestionar peticiones relacionados con las denuncias de usuarios, con los siguientes endpoints:

```javascript
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
router.put('/like',Authorization, ReportController.likeReport)
router.put('/dislike',Authorization, ReportController.dislikeReport)
router.delete('/', Authorization, ReportController.removeReport)


// Export the Router
module.exports = router;
```
 
## Variables de entorno
Existen campos que contienen información sensible, lo cual es consumido de un archivo .env, figurando con el siguiente aspecto:
```javascript
process.env.<nombre_secreto>
```
### Casos de uso

#### Conexión a base de datos
```javascript
//Database connection --
var mongoose = require('mongoose')
mongoose.Promise = bluebird;
let url = `${process.env.DATABASE1}${process.env.DATABASE2}=${process.env.DATABASE3}=${process.env.DATABASE4}`
```
En nuestro caso, utilizamos MongoDB Atlas para almacenar la información.

#### Puerto utilizado para inicializar el servidor

```javascript
var port = process.env.PORT || 8080;
// Escuchar en el puerto
app.listen(port,()=>{
    console.log('Servidor de ABM Users iniciado en el puerto ',port);
});
```
En caso de no setearse, se establece por defecto el 8080

#### Secreto JWT
```javascript
var savedUser = await newUser.save();
        var token = jwt.sign({
            id: savedUser._id
        }, process.env.SECRET, {
            expiresIn: 86400
        });
```
#### Casilla utilizada para enviar mails y contraseña de aplicaciones de dicho email
```javascript
const transporter = nodemailer.createTransport({
    secure: true,
    port: 25,
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: process.env.EMAILSENDER, // poner cuenta gmail
        pass: process.env.EMAILPASSWORD  // contraseña cuenta IMPORTANTE HABILITAR acceso apps poco seguras google
    }
});
```
#### API KEY de analizador de texto
```javascript
'x-rapidapi-key': process.env.API_KEY_ANALYZER,
```
Utilizada para poder consumir la API de moderar texto