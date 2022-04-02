const mongoose = require("mongoose");
const bycrypt = require("bcryptjs");  // npm i bcryptjs
const jwt = require('jsonwebtoken');
const validator = require('validator'); // npm i validator
const crypto = require('crypto'); // no need to install it is an build in module

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: [true,"Please enter your name."],
        maxlength: [30,"Name cannot exceed 30 character"],
        minlength: [4, "Name should have more than 4 characters."]
    },
    email : {
        type: String,
        required: [true,"Please enter your email."],
        unique:true,
        validate: [validator.isEmail,"Please enter a valid email."]
    },
    phone : {
        type: Number,
        required: [true,"Please enter your mobile No."]
    },
    work : {
        type: String,
        required: [true,"Please enter your professional"]
    },
    password : {
        type: String,
        required: true,
        minlength:[7,"Password should be more than 8 characters"],
        select: false  // when we query.find() -> password will not be selected
    },
    profile_img : {
        public_id:{
            type:String
        },
        url:{
            type:String
        }
    },
    role:{
        type:String,
        default:"User"
    },
    resetPasswordToken:String,
    resetPasswordTokenExpire: Date,
    messages: [
        {
            name : {
                type: String,
                required: true
            },
            email : {
                type: String,
                required: true
            },
            subject : {
                type: String,
                required: true
            },
            message : {
                type: String,
                required: true
            }
        }
    ],
    tokens : [
        {
        token: {
            type: String,
            required: true
            }
        }
             ]
    ,
    created_at : {
        type: Date,
        default: Date.now
    }
    ,
    updated_at : {
        type: Date,
        default: Date.now
    }

});


userSchema.pre( 'save', async function ( next ){
    if( this.isModified('password') )
    {   
        this.password = await bycrypt.hash( this.password, 12 );
    
    }
    next();
} );

userSchema.methods.generateAuthToken = async function() {
    try
    {
        let token =  jwt.sign({ _id:this._id }, process.env.SECRET_KEY) 
        // 2 param - payload (shoud be unique)   and secret key 
        this.tokens = this.tokens.concat({ token:token });
        await this.save();
        return token;
    } 
    catch(err)
    {
        console.log(err);
    }
}

userSchema.methods.addMessageNSubject = async function( nameValue, emailValue, subjectValue, messageValue )
{
    try
    {
        this.messages = this.messages.concat({ name:nameValue, email:emailValue, subject:subjectValue, message:messageValue })
        await this.save();
        return this.messages;
    }
    catch(err)
    {
        console.log(err);
        res.status(401).json({"status":401,message:"Something went wrong",error:err});
    }
}

// Generate password reset token
userSchema.methods.getResetPasswordToken = function()
{
    const resetToken = crypto.randomBytes(20).toString("hex");

    //Hashing and add to userschema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordTokenExpire = Date.now() + 15 * 60 * 1000; // 15 min
    return resetToken;
}

const User = new mongoose.model("User",userSchema);

module.exports = User;