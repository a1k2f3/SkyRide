import express from "express";
import bcrypt from "bcryptjs";
import Accounts from "../Schema/Signup.js"; // Verify this path
import validateSignup from "../middleware/MiddleWare.js";
import multer from "multer";
import path from "path";
import fs from 'fs'
// import nodemailer from 'nodemailer';
import { Server } from "socket.io";
const router = express.Router();
router.use(express.static( 'public'));
const imagesDir = path.join('public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}
const storage=multer.diskStorage({
  destination:(req,filr,cb)=>{
    cb(null,imagesDir)
  },filename:(req,file,cb)=>{
    cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))
  }
  }
)
export default(httpServer)=>{
  const io = new Server(httpServer, { /* options */ });

  io.on("connection", (socket) => {
    console.log("User connected to Signup API");

    socket.on("disconnect", () => {
      console.log("User disconnected from Signup API");
    });
  });
  const upload=multer({storage:storage})
router.post("/signup", upload.single('image'),validateSignup,async (req, res) => {

  try {
    const { username, email, phone, date_of_birth, password, country,Userbio } = req.body;
    const file=req.file
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required." });
    }
    const existingUser = await Accounts.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await Accounts.create({
      username,
      email,
      phone,
      date_of_birth,
      password: hashedPassword,
      country,
      image:file?file.filename:null,
      Userbio
    });
    io.emit("user signup",{emai:email, name:username})
  }  
     catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});
return router;
}