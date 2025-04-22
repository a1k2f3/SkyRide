import express from "express";
import bcrypt from "bcryptjs";
import Accounts from "../schema/user.js";
import validateSignup from "../middleware/MiddleWare.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import nodemailer from 'nodemailer';
import fetch from 'node-fetch';
const router = express.Router();
router.use(express.static("public"));
const imagesDir = path.join("public", "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  },
});

export default (io) => {
  const upload = multer({ storage });

  router.post('/signup', upload.single("image"), validateSignup, async (req, res) => {
    try {
      const { username, email, phone, date_of_birth, password, confirmpassword, country } = req.body;
      const file = req.file;
      if (!username || !email || !password || !date_of_birth || !confirmpassword || !country) {
        return res.status(400).json({ message: "All fields are required." });
      } 
      if (password !== confirmpassword) {
        return res.status(400).json({ message: "Passwords do not match." });
      }
  
      if (!email.endsWith("@gmail.com")) {
        return res.status(400).json({ message: "Only Gmail accounts are accepted." });
      }
      const verifyUrl = `http://apilayer.net/api/check?access_key=3566824110ee2c3cd94dcfb4397597c2&email=${email}&smtp=1&format=1`;

      const response = await fetch(verifyUrl);
      const data = await response.json();
  
      if (!data.smtp_check || !data.mx_found || !data.format_valid) {
        return res.status(400).json({ message: "Invalid or unreachable email address." });
      }
      const existingUser = await Accounts.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use." });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const transporter = nodemailer.createTransport({
        service: "gmail",
        secure: true,
        auth: {
          user: "akifbutt935@gmail.com",
          pass: "kmev dssf mton xgdh"
        }
      });
  
      const mailOptions = {
        from: "akifbutt935@gmail.com",
        to: email,
        subject: "Signup Confirmation - Welcome to Our Platform!",
        html: `
          <h2>Hi ${username},</h2>
          <p>Thank you for signing up on our platform.</p>
          <p>Your account has been created successfully.</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Country:</strong> ${country}</p>
          <br/>
          <p>Best regards,<br/>The Team</p>
        `
      };
  
      // Try sending email before creating account
      transporter.sendMail(mailOptions, async (err, info) => {
        if (err) {
          console.error("Email failed to send:", err);
          return res.status(400).json({ message: "Invalid or unreachable Gmail address." });
        }
        // 3566824110ee2c3cd94dcfb4397597c2
        // Create account only if email sent successfully
        const newUser = new Accounts({
          username,
          email,
          phone,
          date_of_birth,
          country,
          password: hashedPassword,
          image: file?.filename || ""
        });
  
        await newUser.save();
  
        io.emit("user signup", { email, name: username });
  
        res.status(201).json({ message: "Signup successful! Confirmation email sent." });
      });
  
    } catch (error) {
      console.error("Error in signup:", error);
      res.status(500).json({ message: "Server error." });
    }
  });
  
  return router;
};
