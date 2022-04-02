const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true,"Please enter product name."],
        trim: true
    },
    description:{
        type: String,
        required:[true,"Please enter product description."]
    },
    price:{
        type:Number,
        required:[true,"Price enter product price."],
        maxlength:[8,"Price cannot exceed 8 characters."]
    },
    ratings:{
        type:Number,
        default:0
    },
    images:[
        {
            uri:{
                type:String,
                required: true
            }
        }
    ],
    category:{
        type:String,
        required:[true,"Please enter product category."]
    },
    Stock:{
        type:String,
        required:[true,"Please enter product stock"],
        maxlength:[4,"Product can not exceed 4 characters."]
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews : [
        {
            user:{
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required:true
            },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true,
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],
    isFeatured : {
        type:Number,
        default:0
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
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

const Product = new mongoose.model("Product",productSchema);

module.exports = Product; 