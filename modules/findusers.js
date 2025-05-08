import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Accounts from "../schema/user.js"; // Adjust the path as per your project structure
import mongoose from "mongoose"; // Import mongoose
 // Adjust the path as per your project structure
const router = express.Router();
// Get the correct __dirname (because you're using ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the "public" directory
router.use("/public", express.static(path.join(__dirname, "../../public"))); // Adjust path as per your project structure

router.get("/alluser", async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1, 10 users per page
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  try {
    // Fetch paginated data
    const data = await Accounts.find()
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
      .select("-password"); // Exclude password field
    // Get the total count of documents
    const count = await mongoose.connection.db
      .collection("Accounts")
      .countDocuments();
    // Send the response
    res.json({
      data,
      totalPages: Math.ceil(count / limitNumber),
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
router.get("/getmechanicfuel", async (req, res) => {
  try {
    const { role } = req.query;

    // Validate role
    const allowedRoles = ["mechanic", "fuelpump"];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid or missing role. Must be 'mechanic' or 'fuel pump'." });
    }

    const users = await Accounts.find(
      { role },
      { username: 1, role: 1, location: 1, phone: 1, email: 1, _id: 1 }
    );

    if (!users.length) {
      return res.status(404).json({ message: `No users found with role: ${role}` });
    }

    res.status(200).json({ message: `Users with role '${role}' fetched successfully.`, users });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Server error." });
  }
});
export default router;