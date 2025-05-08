import express from "express";
import Location from "../schema/locationschems.js"; // ✅ Your model
import mongoose from "mongoose";
const router = express.Router();

export default (io) => {
  // POST: Share Location
  router.post("/location", async (req, res) => {
    const { senderId, latitude, longitude } = req.body;
    if (!senderId || !latitude || !longitude) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ success: false, message: "Invalid account ID." });
    }
  try {
      // Add timestamp if necessary (ensure the schema handles it)
      const newLocation = new Location({ senderId, latitude, longitude, timestamp: new Date() });
      await newLocation.save();

      // Emit real-time location to followers
      io.to(`follow-${senderId}`).emit("location-update", {
        senderId,
        latitude,
        longitude,
      });
      res.status(201).json({ message: "Location shared successfully" });
    } catch (error) {
      console.error("❌ Error saving location:", error.message);
      res.status(500).json({ error: "Server error" });
    }
  });

  // GET: Latest location for a user
  router.get("/location/:senderId", async (req, res) => {
    try {
      // Get latest location by senderId
      const latestLocation = await Location.findOne({ senderId: req.params.senderId })
        .sort({ timestamp: -1 });  // Sort by timestamp to get the latest location
      
      if (!latestLocation) {
        return res.status(404).json({ error: "Location not found" });
      }

      res.json(latestLocation);
    } catch (err) {
      console.error("❌ Error fetching location:", err.message);
      res.status(500).json({ error: "Error fetching location" });
    }
  });
  // Get machnic and fule
  return router;
};
