import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
 

const userSchema=new mongoose.Schema({
    id:{
        type:string,
        required:true
    },
    watchHistory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'videos'
    },

    username:{
        type:string,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },

    email:{
        type:string,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },

    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },

    avatar:{
        type:String,
        required:true
    },

    coverImage:{
        type:String

    },

    password:{
        type:string,
        required:[true,"password is required"],
    },

    refreshToken:{
        type:String

    },

},{
    timestamps:true
}
) 

userschema.pre("save", async function(next){
    if(!this.isModified()) return next();

    this.password=await bcrypt.hash(this.password,10);
    next();

})

userSchema.methods.comparePassword=async function(passoword){

   return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function(){
    return jwt.sign({
        id:this._id,
        username:this.username,
        email:this.email,
        fullName:this.fullName,

    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }

)
}
userSchema.methods.generateRefreshToken=function(){

     return jwt.sign({
        id:this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }

)
}
    
export const user=mongoose.model("user",userSchema);