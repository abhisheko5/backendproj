import express from "express"
import {registerUser,loginUser,logoutUser} from "../controllers/user.controller.js"
import {isAuthenticated} from "../middlewares/auth.middleware.js"


// Importing the router from express and the registerUser controller function
import {upload} from "../middlewares/multer.middleware.js"

const router = express.Router()
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)


//secured routes

router.route("/logout").post(isAuthenticated,logoutUser)


export default router;