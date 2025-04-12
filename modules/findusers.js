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
  const { page = 1, limit = 10 } = req.query; // Default to page 1, 10 users per page
  try {
    let data=await mongoose.connection.db.collection("Accounts").find({}).toArray()
    res.json(data);
    const count = await Accounts.countDocuments();
    res.json({
      data,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;