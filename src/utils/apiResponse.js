class ApiResponse{
    constructor(
        statuscode,data,message="success"
    ){
        this.statuscode=statuscode
        this.data=data
        this.message=message
        this.success=statuscode<400  
    }
}

export {ApiResponse};
// This code defines an ApiResponse class that is used to standardize API responses in a Node.js application.
