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

const changeCurrentPassword = asynchandler(async(req,res)=>{

    const {oldPassword, newPassword,confirmPassword}= req.body;
    
    if(newPassword!==confirmpassword){
        throw new ApiError(400, "new and confirm password dont match");
    }

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.comparePassword(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"invalid password"); 
    }

    user.password= newPassword;
    user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new apiresponse(200, "passowrd changed uccessfully")
    )





})

const getCurrentUser= asynchandler(async(req,res)=>{
    return res
    .status(200)
    .json(200,req.user,"current user fetched successfully");
})

const updateAccountDetails = asynchandler(async(req,res)=>{

    const{fullName,email}=req.body;
    
    if(!fullName || !email){
        throw new ApiError(400,"all fields are required");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email
            }

        },
        {new:true}
    ).select("-password" )

    return res
    .status(200)
    .json(200,"user details are updated successfully")

})

const UpdateUserAvatar = asynchandler(async(req,res)=>{
    const avatarlocalpath= req.files?.path

    if(!avatarlocalpath){
        throw new ApiError(400,"avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarlocalpath) 

        if(!avatar.url){
            throw new ApiError(400,"error while uploading avatar");
        }

    User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")
    
    return res
    .status(200)
    .json(200,"avatar uploaded successfully")
    

})

const UpdateUserCoverimage = asynchandler(async(req,res)=>{
    const coverImagelocalpath= req.files?.path

    if(!coverImagelocalpath){
        throw new ApiError(400,"coverImage file is missing");
    }

    const coverImage = await uploadOnCloudinary(coverImagelocalpath) 

        if(!coverImage.url){
            throw new ApiError(400,"error while uploading avatar");
        }

    const user =  await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(200,"coverimage uploaded successfully")
    


})

const getUserChannelProfile = asynchandler(async(req,res)=>{
    const {username} = req.params//fetch username from the url

    if(!username?.trim()){
        throw new ApiError(400,"username is missing");
    }

    const Channel = await User.aggregate([ //aggregation pipeline
        {
            $match: {   //filter document
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{ //join 
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            
            }
        },
        {
            $addFields:{//add new fiels to existing info
                subscribersCount:{
                    $size:"$subscribers"//count
                },
                ChannelsSubscribedToCount:{
                        $size:"$subscribedTo"
                    },
                isSubscribed:{
                    $cond:{
                        if: {$in: [req.user?._id,"$subscribers.subscriber"]},//check if true or false
                        then:true,
                        else:false
                    }
                }
                
            }
        },

        {
            $project:{  //the values to show if 1 yes and if 0 then no
                fullName:1,
                username:1,
                subscribersCount:1,
                ChannelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1,




            }
        }
    ])

    if(!Channel?.length){
        throw new ApiError(404,"channel does not exist")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200,Channel[0],"user channel fetched successfully")
    )

})

const getWatchHistory = asynchandler(async(req,res)=>{
    const user = await User.aggregate([
{
        $match:{
            _id:new mongoose.Types.ObjectId(req.user_id)
        }
    },
{
    $lookup:{
        from:"videos",
        localField:"WatchHistory",
        foreignField:"_id",
        as: "watchhistory",
        pipeline:[
            {
                 $lookup:{
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as :"owner",
                    pipeline:[{
                        $project:{
                            fullName:1,
                            username:1,
                            avatar:1

                        }
                    },{
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                
                ]
                 }
            }
        ]
    }
}

    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "watch history fetched successfully"
        ))  
})
export {registerUser,loginUser,logoutUser,refreshAccessToken,
    changeCurrentPassword, getCurrentUser,updateAccountDetails,
    UpdateUserAvatar,UpdateUserCoverimage,getUserChannelProfile
}