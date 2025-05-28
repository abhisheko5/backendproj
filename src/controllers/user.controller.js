import {asynchandler} from "../utils/asynchandler.js";

const registerUser=asynchandler(async(req,res)=>{
    console.log(req.body);
    res.status(200).json({
        message:"ok"
    })
})

export {registerUser}