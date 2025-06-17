import mongoose from "mongoose";
import { db_name } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${db_name}`
    );
    console.log(
      `\n mongodb connected successfully !! db host:${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("mongodb conection error", error);
    process.exit(1);
  }
};

export default connectDB;
