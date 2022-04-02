const userModel = require("./../../models/userSchema");



const getUserDetail = async( req, res ) => {
    try
    {
        const getUserDetailNoSql = await userModel.findById(req.params.id);
        if( !getUserDetailNoSql )
        {
            res.status(400).json({"status":400,message:"User not found"});
        }
        else
        {
            res.status(200).json({"status":200,message:"Data retrieve successfully.",data:getUserDetailNoSql});
        }
    }
    catch(err)
    {
        res.status(500).json({"status":500,message:"Something went wrong",error:err.message});
    }
    
}

const getAllUser = async( req, res ) => {
    try
    {
        const getAllUserNoSql = await userModel.find();
        res.status(200).json({"status":200,message:"Data retrieve successfully.",data:getAllUserNoSql});

    }
    catch(err)
    {
        res.status(400).json({"status":400,message:"Something went wrong",error:err.message});
    }
    
}

const updateUserRole = async( req, res ) => {
    try
    {
        const updateData = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role,
        }
      const getUserNoSql = await userModel.findByIdAndUpdate(req.body.userid, updateData,{
          new: true,
          runValidators: true,
          useFindAndModify: false,
      });

      res.status(200).json({status: 200,message:"User profile updated successfully"});

    }
    catch( err )
    {
        console.log(err);
        res.status(401).json({status: 401,message:"Something went wrong",error:err});

    }
}

const deleteUser = async( req, res ) => {
    try
    {
        const updateData = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role,
        }
      const delUserNoSql = await userModel.findByIdAndDelete({ _id:req.params.id });
      if( !delUserNoSql )  
      {
        res.status(200).json({status: 200,message:"User does not exists."});
      }
      else
      {
        res.status(200).json({status: 200,message:"User deleted successfully."});
      }     

    }
    catch( err )
    {
        console.log(err);
        res.status(401).json({status: 401,message:"Something went wrong",error:err});

    }
}

module.exports = {
      getUserDetail, getAllUser, updateUserRole, deleteUser
}
