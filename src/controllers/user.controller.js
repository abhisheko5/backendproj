import {asynchandler} from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/fileUpload.js";
import {ApiResponse} from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessTokenandRefreshToken=async(userId)=>{
    try{

        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();

        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave: false})

        return {accessToken,refreshToken};
    }
    catch(error){
        throw new ApiError(500,"Error generating tokens");
    }
}

const registerUser=asynchandler(async(req,res)=>{
    //will take input from the user
    //validate the user input
    //check if the user already exists
    //check for images,check for avatar
    // upload the images to cloudinary
    //if not, create a new user
    //if exists, return an error
    //create user object - create entry in the database
    //reurn the response to the user and remove the password and refresh token from the response
    //check for user creation
    //return res
    
    
    const{fullName,email,password,username}=req.body;
    //console.log("email:",email);

    if(
        [fullName, email, password, username].some(
    (field) =>field.trim() === ""
    )
){
        throw new ApiError(400,"All fields are required"); 
    }

    const existedUser = await User.findOne({
        $or: [{ username },{ email }
        ]
    });

    if(existedUser){
        throw new ApiError(409,"user already exists with this email or username")
    }
    //console.log("req.files:",req.files);
    const avatarLocalpath=req.files?.avatar[0]?.path;
    //const coverImageLocalpath=req.files?.coverImage[0]?.path;
    
    let coverImageLocalpath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalpath=req.files.coverImage[0].path;
    }

    if(!avatarLocalpath) {
        throw new ApiError(400,"Avatar file is required");
    }

    const avatar= await uploadOnCloudinary(avatarLocalpath);
    const coverImage= await uploadOnCloudinary(coverImageLocalpath);

    if(!avatar){
        throw new ApiError(400,"Avatar upload failed");
    }

    const user= await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase(),
        
    })

    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken");

        if(!createdUser){
            throw new ApiError(500,"User creation failed");
        }

        return res.status(201).json(
            new ApiResponse(200,createdUser,"User created successfully")
        );


    });


const loginUser=asynchandler(async(req,res)=>{
    //take input from the user from the request body
    //check if credentials are provided and valid
    //user input should have email or username and password
    //check if user exists
    //if user exists, check if password is correct
    //access and refresh token should be generated
    //send cookie 
    //send response to the user 

    const {email,username,password}=req.body;

    if(!email && !username )
    {
        throw new ApiError(400,"Email or username is required");
    }

     const user = await User.findOne({
        $or: [{email},{username}]
    })

    if(!user){
        throw new ApiError(404,"User not found");
    }

   const isPasswordvalid= await user.comparePassword(password);

   if(!isPasswordvalid){
        throw new ApiError(401,"Invalid password");
   }

   const {accessToken,refreshToken}= await 
    generateAccessTokenandRefreshToken(user._id)

    const option={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new ApiResponse(200,
            {user,accessToken,refreshToken},
            "User logged in successfully")
    );

})

const refreshAccessToken = asynchandler(async(req,res)=>{
  
    const incomingrefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingrefreshToken){
        throw new ApiError(401,"unauthorized request");
    }

    const decodedToken = jwt.verify(
        incomingrefreshToken,
        process.env.REFRESH_TOKEN_SECRET

    )

    const user = await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401,"invalid refresh token");
    }
    
    if(incomingrefreshToken !== user?.refreshToken){

        throw new ApiError(401,"invalid refresh token or expired");
    }

    const options = {
        httpOnly:true,
        secure:true
    }

    const {accessToken,refreshToken} = await generateAccessTokenandRefreshToken(user._id)

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,
            {accessToken,refreshToken},
            "access token refreshed successfully"
        )

    )
})


const logoutUser= asynchandler(async(req,res)=>{
    await User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken:undefined
    }
},
{
    new:true
})
const option={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(
        new ApiResponse(200,null,"User logged out successfully")
    );
})
export {registerUser,loginUser,logoutUser,refreshAccessToken}