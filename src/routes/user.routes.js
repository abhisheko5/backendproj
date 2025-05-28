import express from "express"
import {registerUser} from "../controllers/user.controller.js"
// Importing the router from express and the registerUser controller function

const router = express.Router()
router.route("/register").post(registerUser)

export default router;