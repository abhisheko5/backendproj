import dotenv from "dotenv";
import connectDB from "./db/index.js";
import cookieparser from "cookie-parser";
import express from "express";
import app from "./app.js";

dotenv.config();

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`server is running at port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("mongo DB connection failed", err);
  });
