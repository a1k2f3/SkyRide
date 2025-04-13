import express from "express";
import bcrypt from "bcryptjs";
import Accounts from "../schema/user.js";
import validateSignup from "../middleware/MiddleWare.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Server } from "socket.io";

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

export default (httpServer) => {
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("User connected to Signup API");
    socket.on("disconnect", () => {
      console.log("User disconnected from Signup API");
    });
  });

  const upload = multer({ storage });

  router.post("/signup", upload.single("image"), validateSignup, async (req, res) => {
    try {
      const { username, email, phone, date_of_birth, password, confirmpassword, country } = req.body;
      const file = req.file;

      if (!username || !email || !password || !date_of_birth || !confirmpassword || !country) {
        return res.status(400).json({ message: "All fields are required." });
      }

      if (password !== confirmpassword) {
        return res.status(400).json({ message: "Passwords do not match." });
      }

      const existingUser = await Accounts.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await Accounts.create({
        username,
        email,
        phone,
        date_of_birth,
        password: hashedPassword,
        country,
        image: file ? file.filename : null,
      });

      io.emit("user signup", { email, name: username });

      res.status(201).json({ message: "Signup successful!" });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Server error." });
    }
  });

  return router;
};
// Note: Make sure to adjust the import paths according to your project structure.