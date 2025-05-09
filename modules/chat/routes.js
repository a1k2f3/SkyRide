import express from 'express';
// import { sendMessage, getChatHistory } from '../controllers/chatController.mjs';
import { sendMessage, getChatHistory } from './controller.js'; // Adjust the import path as necessary

const router = express.Router();
import multer from "multer";
import fs from "fs";
import path from "path";
router.use(express.static("chat"));
const imagesDir = path.join("chat", "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imagesDir),
  filename: (req, file, cb) => {
    const uniqueName = `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};
const upload = multer({ storage, fileFilter });

// POST: Send a message
router.post('/send',upload.single("image"), sendMessage);

// GET: Fetch chat history
router.get('/history', getChatHistory);

export default router;
