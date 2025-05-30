import {v2 as cloudinary} from cloudinary;
import fs from 'fs';


 cloudinary.config({ 
        cloud_name:process.env.CLOUDINARY_NAME, 
        api_key:process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECRET
    }); 

const uploadOnCloudinary= async (locaFilePath)=>{
try{
    if(!localFilePath) return null;
    const response=await cloudinary.uploader.upload(localFilePath,{
        resource_type:'auto'
    })

    console.log("file uploaded successfully",response.url);
    return response;
}
catch(error){
    fs.unlinkSync(localFilePath); //remove the  corrupted file if upload fails
return null;
}

}

export {uploadOnCloudinary}