require("dotenv").config();
const express = require("express");
const cloudinary = require("cloudinary"); // npm i cloudinary
const app = express();

const path = require("path");  // to use static folder for frontend
const static_path = path.join(__dirname, "./../public/productImg");
app.use('/public/productImg/', express.static(static_path));

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');

const cors = require('cors')
app.use(cors());

require('./database/connection'); // Database connection

// from cloudinary.com
cloudinary.config(
    {
        cloud_name: 'dfetgu8rx',
        api_key: '341644941828853', 
        api_secret: 'hTd6q5ofAnY2bngRFlLA0bGrtz0',
    }
)

app.use(express.json()); // whenever data will come in format of json it will convert it into object
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended:true }));
app.use(fileUpload());

app.use( require('./routes/auth') );
app.use( require('./routes/web') );

app.listen( 3001 , () => {
    console.log("Listening port on 3001");
} );