
const bcrypt = require('bcryptjs');
require('../database/connection');
const User = require('../models/userSchema');
const sendEmail = require("./../util/sendEmail");
const crypto = require('crypto'); // no need to install it is an build in module
const cloudinary = require("cloudinary");

// cloudinary.config(
//     {
//         cloud_name: 'dfetgu8rx',
//         api_key: '341644941828853', // from cloudinary.com
//         secret_key: 'hTd6q5ofAnY2bngRFlLA0bGrtz0',
//     }
// )


const signin = async( req,res ) => {
    const { email, password } = req.body;
   
    try
    {
        if( !email || !password )
        {
            res.status(200).json({ status:422,message:"Please provide email and password."});
        }
        else
        {
            const emailExist = await User.findOne({ email: email });
            if( !emailExist )
            {
               res.status(200).json({status:422, message:"Invalid User"});
            }
            else
            {
                // const isUserExists = await User.find({ $and: [ {email:email} , {password:password} ] });
                const isUserExists = await User.findOne({  email:email }).select("+password");
               
                if( isUserExists.length !== 0 )
                {
                   
                    const isMatch = await bcrypt.compare( password , isUserExists.password );
                    if( !isMatch )
                    {                        
                        res.status(200).json({status:422,message:"Invalid Credentials."});
                        // res.status(200).json({status:200,message:"Invalid Credentials."});
                    }
                    else    
                    {
                        const token = await isUserExists.generateAuthToken(); // calling function from model
                        res.cookie("jwtToken", token, {
                            expires: new Date(Date.now() + (5 * 24 * 60 * 60 * 1000)), // 5 days
                            httpOnly:true
                        });
                        
                        res.status(200).json({status:200,message:"Successfully logged In.",result:isUserExists});
                    }
                }
                else
                {
                    res.status(200).json({status:422,error:"Invalid User"});
                }
            }
        }
        
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
}

const signup = async( req, res ) => {  
    const { name, email, phone, work, password, avatar } = req.body;
   
   
    if( !name || !email || !phone || !work || !password )
    {
        res.status(422).json({ status:422, message: "All fields are required." });
    }
    else
    {
        try
        {

            const userExists = await User.findOne({email:email});
            if( userExists )
            {
                res.status(422).json({ status:422, message: "User already exists." });
            }
            else
            {
                const myCloud = await cloudinary.v2.uploader.upload( avatar, {
                    folder: "profile_pic",
                    width: 150,
                    crop: "scale",
                });

                const userIn = new User({ name:name, email:email, phone:phone, work:work, password:password, profile_img: {public_id: myCloud.public_id,url:myCloud.secure_url} });
                const userSave = await userIn.save();
                if( userSave )
                {
                    const token = await userSave.generateAuthToken(); // calling function from model
                        res.cookie("jwtToken", token, {
                            expires: new Date(Date.now() + (5 * 24 * 60 * 60 * 1000)), // 5 days
                            httpOnly:true
                        });
                    res.status(200).json({ status:200, message: "User registered successfully.", result:userSave });
                }

            }
        }
        catch( err )
        {          
            console.log(err);
            res.status(500).json({ status:500, message: err });
        }
        
       

        // WITH PROMISES

        // User.findOne({email:email})
        // .then( (userExists) => {
        //     if( userExists )
        //     {
        //         res.status(422).json({ error: "User already exists." });
        //     }
        //     else
        //     {
        //         const userIn = new User({ name:name, email:email, phone:phone, work:work, password:password });
        //         userIn.save()
        //         .then( (result) => {
        //             res.status(200).json({ message: "User registered successfully." });
        //         } )
        //         .catch( (err) => {
        //             res.status(422).json({ error: err });
        //         } )
        //     }
        // } )
        // .catch( (err) => {
        //     console.log(err);
        //     res.status(422).json({ error: err });
        // } )
    }
    
}

const forget_password = async ( req, res ) => {
    try
    {
        const userExist = await User.findOne({email: req.body.email});
        if( !userExist )
        {
            res.status(404).json({status: 403,message:"User Not Found"});
        }
        else
        {
            // get restpassword token
            const resetToken = await userExist.getResetPasswordToken();
            await userExist.save({ validateBeforeSave: false });

            const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
            const emailMessage = `Your password reset token is :- \n\n ${resetPasswordUrl}\n\n If you have not requested this email then please ignore it.`;

            // Send email
            try
            {
                await sendEmail({
                    email: userExist.email,
                    subject: `Forget Password Recovery Mail`,
                    // emailMessage,
                    message: emailMessage,
                });
                res.status(200).json({status: 200,message:`Email sent to ${userExist.email} successfully`});

            }
            catch(err)
            {
                userExist.resetPasswordToken = undefined;
                userExist.resetPasswordTokenExpire = undefined;

                await userExist.save({ validateBeforeSave: false })
                res.status(500).json({status: 500,message:"Something went wrong",error:err.stack});

            }

        }
    }
    catch(err)
    {
        res.status(401).json({status: 401,message:"Something went wrong",error:err.message});

    }

    
}

const logout = async( req, res ) => {
   
    try
    {
        res.clearCookie('jwtToken',{path: "/"});
        res.status(200).json({ status:200, message:"User successfully logout." });
        
         // another way
        // res.cookie("jwtToken", null, {
        //     expires: new Date( Date.now() ),
        //     httpOnly: true 
        // })
    }
    catch(err)
    {
        res.status(401).json({status: 401,message:"Something went wrong",error:err.message});

    }

   
}

//reset password

const resetPassword = async( req, res ) => {

    try
    {
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex"); // we are hasing because at the time of forget password we have hashed the token

        const getUser = await User.findOne({
            resetPasswordToken:resetPasswordToken, resetPasswordTokenExpire:{ $gt: Date.now() }
        });
    
        if( !getUser )
        {
            res.status(400).json({status: 400,message:"Reset password token is invalid or has been expired"});
        }
        else
        {
            if( req.body.password !== req.body.cpassword )
            {
                res.status(400).json({status: 400,message:"Password and confirm password did not match."});
            }
            else
            {
                getUser.password = req.body.password;
                getUser.resetPasswordToken = undefined;
                getUser.resetPasswordTokenExpire = undefined;
                await getUser.save();
                
                res.status(200).json({status: 200,message:"Successfully changed the password."});
    
            }
        }
    }
    catch( err )
    {
        res.status(500).json({status: 500,message:"Something went wrong",error:err.stack});

    }


   
}

module.exports = {
    signin, signup, forget_password, resetPassword, logout
}