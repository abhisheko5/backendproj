const asynchandler=(requesthandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requesthandler(req,res,next)).
        catch((err)=>next(err));
    }
}






/*const asynchandler=(func)=> async(req,res,next)=>{
    try{

        await func(req,res,next)

    }
    catch(error){
        res.status(err.code || 400).json({
            success:false,
            message:err.message
        })
    }

}
*/
export {asynchandler}