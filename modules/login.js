import express from "express";
import bcrypt from "bcryptjs";
import Accounts from "../schema/user.js"; // Verify this path
import jwt from "jsonwebtoken";
const router = express.Router();
export default(io,onlineUsers)=>{
router.post("/login", async (req, res) => {
  try {
    const { email,password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    const existingUser = await Accounts.findOne({ email });
    if (!existingUser) {
      return res.status(400).send("Invalid email or password");
    }
    const validation = await bcrypt.compare(password, existingUser.password);
    if (!validation) {
      return res.status(400).send("Invalid email or password");
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: existingUser._id, email: existingUser.email },
      process.env.JWT_SECRET || "your_jwt_secret", // Replace with your secret
      { expiresIn: '1h' } // Adjust the expiration time to something reasonable like 1 hour
    );
    res.status(200).json({ message: "User login successful",  user: existingUser, token, id:existingUser.id});
    for(const [SockId,user] of onlineUsers.entries()
    
    ){
      if(user.email !== email){
        io.to(SockId).emit("user_logged_in", {
          id: existingUser.id,
          email: existingUser.email,
        });
        console.log("User logged in", user.email);
      }
    }

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.put("/updateaccount/:id", async (req, res) => {
  try {
    const { username, email, password, role,phone } = req.body;
    const file = req.file; // assuming you're using multer

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const updateData = {
      ...(username && { username }),
      ...(email && { email }),
      ...(password && { password }),
      ...(role && { role }),
      ...(phone && { phone }),
      ...(file && { image: file.filename }),
    };

    const updatedAccount = await Accounts.findOneAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    if (!updatedAccount) {
      return res.status(404).json({ message: "Account not found." });
    }
    res.status(200).json({ message: "Account updated successfully.", account: updatedAccount });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error." });
  }
});
router.get("/getaccount", async (req, res) => {
  
  try {
    const { email } = req.body;
    const account = await Accounts.findOne({email});
    if (!account) {
      return res.status(404).json({ message: "Account not found." });
    }
    res.status(200).json({ account });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Server error." });
  }
});
router.delete("/deleteaccount/:id", async (req, res)  => {
  try {
    const { id } = req.params;
    const deletedAccount = await Accounts.findByIdAndDelete(id);
    if (!deletedAccount) {
      return res.status(404).json({ message: "Account not found." });
    }
    res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Server error." });
  }});
  return router;
}
