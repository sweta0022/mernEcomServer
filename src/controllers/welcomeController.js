
require('../database/connection');
const User = require('../models/userSchema');
const productSchema = require('../models/productSchema');
const AllProductApiFeature = require("./../util/AllProductApiFeature");
const bcrypt = require('bcryptjs');
const cloudinary = require("cloudinary");


const contactus = async( req,res ) => {
    try
    {
        const { name, email, subject, message } = req.body;
        if( !name || !email || !subject || !message )
        {
            res.status(200).json({"status":201,message:"Please fill all the details."});
        }
        // console.log(req.userId);
        const userContact = await User.findOne({ _id:req.userId });
        
        if( userContact )
        {
            const userMessage = await userContact.addMessageNSubject(name, email, subject, message);
            await userContact.save();
            res.status(200).json({"status":200,message:"Request submitted successfully."});
        }
        else
        {
            res.status(200).json({"status":201,message:"User not found"});
        }
    }
    catch(err)
    {
        res.status(400).json({"status":400,message:"Something went wrong",error:err});
    }
}

const getUserDetail = ( req , res ) => { 
    res.status(200).json({status: 200,message:"Data retrieve successfully",result:req.authenticateUser});
}

const updateUserPassword = async( req, res ) => {
    try
    {   
        const getUserNoSql = await User.findById(req.userId).select("+password"); 
        const isMatch = await bcrypt.compare( req.body.oldPassword , getUserNoSql.password );
        if( !isMatch )
        {
            res.status(200).json({status:401,message:"Old password does not match."});
        }
        else
        {
            if( req.body.newPassword !== req.body.confirmPassword  )
            {
                res.status(200).json({status:401,message:"Password and confirm password does not match."});
            }
            else
            {
                 getUserNoSql.password = req.body.newPassword;
                 await getUserNoSql.save();
                 res.status(200).json({status:200,message:"Password updated successfully."});
            }
        }


    }
    catch(err)
    {
        res.status(500).json({"status":500,message:err.message});

    }
}

const updateUserProfile = async( req, res ) => {
    try
    {
        const newUserData = {
            name:req.body.name,
            email:req.body.email,
            phone:req.body.phone,
            work:req.body.work
        }
        
        if( req.body.avatar !== "")
        {   
            const user = await User.findById(req.userId);            
            const imageId = user.profile_img.public_id;
           
             await cloudinary.v2.uploader.destroy(imageId);
           
            
            const myCloud = await cloudinary.v2.uploader.upload( req.body.avatar, {
                folder: "profile_pic",
                width: 150,
                crop: "scale",
            });

           

             newUserData.profile_img = {
                public_id: myCloud.public_id,
                url:myCloud.secure_url
            }
        }

       
      const getUserNoSql = await User.findByIdAndUpdate(req.userId, newUserData,{
          new: true,
          runValidators: true,
          useFindAndModify: false,
      });

      res.status(200).json({status: 200,message:"User profile updated successfully",result:getUserNoSql});

    }
    catch( err )
    {
        console.log(err);
        res.status(401).json({status: 401,message:"Something went wrong",error:err.message});

    }
}

const getAllProduct = async(req, res) => {
    try
    {  
      const resultPerPage = 3;
      const allProductCount = await productSchema.countDocuments();
      const ApiFeature = new AllProductApiFeature( productSchema.find(),req.query ).search().filter().paginate(resultPerPage);
      const productList = await ApiFeature.query;
      res.status(200).json({status: 200,message:"Data retrieve successfully", allProductCount:allProductCount, productList:productList});

    }
    catch( err )
    {
        console.log(err);
        res.status(401).json({status: 401,message:"Something went wrong",error:err.message});

    }
}

const getProductDetail = async (req, res) => {
    try
    {  
      
        const product = await productSchema.findById(req.params.id);
        if (!product) {
            res.status(404).json({status: 404,message:"Product not found"});
          }
          else
          {
            res.status(200).json({status: 200,message:"Data retrieve successfully", result:product});
          }
      

    }
    catch( err )
    {
        console.log(err);
        res.status(500).json({status: 500,message:"Something went wrong",error:err.message});

    }
}

const getFeatureProduct = async(req, res) => {
    try
    {
      const productList = await productSchema.find({isFeatured:1});
      res.status(200).json({status: 200,message:"Data retrieve successfully",productList:productList});

    }
    catch( err )
    {
        console.log(err);
        res.status(401).json({status: 401,message:"Something went wrong",error:err});

    }
}



module.exports = {
    contactus, getUserDetail, getAllProduct, getFeatureProduct, updateUserPassword, updateUserProfile, getProductDetail
}