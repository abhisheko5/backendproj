import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshaccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

// Importing the router from express and the registerUser controller function
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes

router.route("/logout").post(isAuthenticated, logoutUser);

router.route("/refresh-token").post(refreshaccessToken);

router.route("/changePassword").post(isAuthenticated, changeCurrentPassword);
router.route("/getcurrentuser").Get(isAuthenticated, getCurrentUser);
router.route("/updatedetails").post(isAuthenticated, updateAccountDetails);

export default router;
