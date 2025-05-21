import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config();


connectDB();



/*(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${db_name}`)
        app.on("error",(error)=>{
            console.log("error:",error);
        })

        app.listen(process.env.port ,()=>{
            console.log(`App is listening on port${process.env.port}`);
        })
    }
    catch(error){
        console.error("error :", error)
        throw err;

    }
    
})()*/