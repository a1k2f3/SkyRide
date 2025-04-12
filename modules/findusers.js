import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Accounts from "../schema/user.js"; // Adjust the path as per your project structure
const router = express.Router();

// Get the correct __dirname (because you're using ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the "public" directory
router.use("/public", express.static(path.join(__dirname, "../../public"))); // Adjust path as per your project structure
router.get("/alluser", async (req, res) => {
  try {  
    const user = await Accounts.find();
    res.json(user);
  } catch (error) {
    console.log(error); // Log the error for debugging
    res.status(500).json(error); // Return a proper error response
  }
});

export default router;