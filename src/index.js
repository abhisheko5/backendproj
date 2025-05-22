import dotenv from "dotenv";
import connectDB from "./db/index.js";
import cookieparser from "cookie-par"

dotenv.config();


connectDB()
.then(()=>{
    app.listen(process.env.port || 8000,()=>{
       console.log(`server is running at port: ${process.env.port}`);  
    })
})
.catch((err)=>{
    console.log("mongo DB connection failed",err);
})



