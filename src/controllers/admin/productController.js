const productModel = require("./../../models/productSchema");


const createProduct = async( req, res) => {
    try
    {
        // req.body.user = req.userId;
        productModel.create(req.body);
        res.status(200).json({"status":200,message:"Product created"});
    }
    catch(err)
    {
        res.status(400).json({"status":400,message:"Something went wrong",error:err});
    }
}

const updateManyProduct = async( req, res ) => {
    try
    {
        try
        {            
            let product = await productModel.updateMany( {},req.body,{new:true, runValidators: true, useFindAndModify:true } );     

            res.status(200).json({"status":200,message:"Product updated successfully", product: product});          
            
        }
        catch(err)
        {
            res.status(400).json({"status":400,message:"Something went wrong",error:err});
        }
    }
    catch(err)
    {
        res.status(400).json({"status":400,message:"Something went wrong",error:err});
    }
    
}

const updateProduct = async( req, res ) => {
    try
    {
        
        let productExists = await productModel.findById(req.params.id);
        if( !productExists )
        {
            res.status(500).json({"status":500,message:"Product not found"});
        }
        else
        {
            var _id = req.bodyyyy
            productExists = await productModel.findByIdAndUpdate( req.params.id, req.body,{new:true, runValidators: true, useFindAndModify:true } );     

            res.status(200).json({"status":200,message:"Product updated successfully", product: productExists});
           
        }

        
    }
    catch(err)
    {
        res.status(400).json({"status":400,message:"Something went wrong",error:err});
    }
    
}

const deleteProduct = async( req, res ) => {
    try
    {
      const getAllUserNoSql = await userSchema.find();
      res.status(200).json({"status":200,message:"Data retrieve",data:getAllUserNoSql});

    }
    catch(err)
    {
        res.status(400).json({"status":400,message:"Something went wrong",error:err});
    }
    
}

const getProductDetail = async( req, res ) => {
    try
    {
    
    }
    catch(err)
    {
        res.status(500).json({"status":500,message:"Something went wrong",error:err.message});
    }
    
}

const createUpdateReview = async(req, res) => {
    try
    {
        const review = {
            user: req.userId,
            name: req.authenticateUser.name,
            rating: Number(req.body.rating),
            comment: req.body.comment,
        }
        const getProductNoSql = await productModel.findById(req.body.product_id);
       
        const isReviewed =  getProductNoSql.reviews.find( rev => rev.user.toString() === req.userId.toString() );
        if( isReviewed )
        {
            getProductNoSql.reviews.forEach( rev => {
                if( rev.user.toString() === req.userId.toString() )
                {
                    rev.rating = req.body.rating,
                    rev.comment = req.body.comment
                }
            } )
        }
        else
        {  
            getProductNoSql.reviews.push(review);
            getProductNoSql.numOfReviews = getProductNoSql.reviews.length;
           
        }

        let ratingAvg = 0;
        getProductNoSql.reviews.forEach( rev =>{
            ratingAvg += rev.rating
        })

        getProductNoSql.ratings =  ratingAvg / product.reviews.length;

        await getProductNoSql.save({ validateBeforeSave: false });
        res.status(201).json({"status":201,message:"Review submitted successfully."});

    }
    catch(err)
    {
        res.status(500).json({"status":500,message:"Something went wrong",error:err.message});
    }
}

const getProductReviews = async(req, res) => {
    try
    {
        const getProductNoSql = await productModel.findById(req.query.product_id);
        if( !getProductNoSql )
        {
            res.status(404).json({"status":404,message:"Product not found"});
        }
        else
        {
            res.status(200).json({"status":200, message:"Data retrieve successfully", reviews:getProductNoSql.reviews});

        }
    }
    catch(err)
    {
        res.status(500).json({"status":500,message:"Something went wrong",error:err.message});
    }
}

const deleteReviews = async(req, res) => {
    try
    {
        const getProductNoSql = await productModel.findById(req.query.product_id);
        if( !getProductNoSql )
        {
            res.status(404).json({"status":404,message:"Product not found"});
        }
        else
        {
            const reviews = getProductNoSql.reviews.filter( rev => rev._id.toString() !== req.query.review_id.toString() );  

            let ratingAvg = 0;
            reviews.forEach( rev =>{
                ratingAvg += rev.rating
            })

            const ratings =  ratingAvg / product.reviews.length;
            const numOfReviews =  reviews.length;

            getProductNoSql.reviews = reviews;
            getProductNoSql.ratings = ratings;
            getProductNoSql.numOfReviews = numOfReviews;
            getProductNoSql.save({ validateBeforeSave: true });          


            res.status(200).json({"status":200, message:"Data retrieve successfully", reviews:getProductNoSql.reviews});

        }
    }
    catch(err)
    {
        res.status(500).json({"status":500,message:"Something went wrong",error:err.message});
    }
}
     

module.exports = {
    createProduct, updateManyProduct, updateProduct, deleteProduct, getProductDetail, createUpdateReview, getProductReviews,deleteReviews
}
