import {asynchandler} from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/fileUpload.js";
import {ApiResponse} from "../utils/apiResponse.js";


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
export {registerUser}