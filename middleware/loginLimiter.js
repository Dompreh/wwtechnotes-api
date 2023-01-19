const rateLimit = require('express-rate-limit')
const {logEvents} =require('./logger')

const loginLimiter = rateLimit({
    windowsMs:60 * 1000, //limit
    max: 5, //Limit each IP to 5 login requests per 'window' per minute
    message:{
        message:'Too many login attempts from this IP, please try again after 60 second pause'
    },
    handler:(req, res, next, options) =>{
        logEvents(`Too Many Requests:${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
        res.status(options.statusCode).send(options.message)
    },
    standardHeaders:true,
    legacyHeaders:false,

})

module.exports = loginLimiter