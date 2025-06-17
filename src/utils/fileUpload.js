import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    //console.log("File uploaded successfully:", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);

    // Remove the corrupted file if upload fails
    try {
      fs.unlinkSync(localFilePath);
      console.log("Corrupted file removed:", localFilePath);
    } catch (unlinkError) {
      console.error("Error removing corrupted file:", unlinkError);
    }

    return null;
  }
};

export { uploadOnCloudinary };
