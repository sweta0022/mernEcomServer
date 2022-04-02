const ErrorHandler = require("./../../util/ErrorHandler");

module.exports = ( err,req,res,next ) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error"; 
    
    //Wrong mongo db id error
    if(err.name === "CastError")
    {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // mongoose dublicate key error
    if(err.code === 11000)
    {
        const message = `Dublicate ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message, 400);
    }

    // json web token error
    if(err.name === 'JsonWebTokenError')
    {
        const message = `JsonWebToken is invalid, try again`;
        err = new ErrorHandler(message, 400);
    }

        // Jwt expire error
        if(err.name === 'TokenExpiredError')
        {
            const message = `JsonWebToken is expired, try again`;
            err = new ErrorHandler(message, 400);
        }

    res.status(err.statusCode).json({status: err.statusCode, message:err.message});
}