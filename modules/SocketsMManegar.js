const onlineUsers = new Map();

export default function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);
    // Register user after login
    socket.on("register-user", (user) => {
      onlineUsers.set(socket.id, user);
      console.log("✅ Registered user:", user);
    });
    // User comes online
    socket.on("user-online", ({ id, email }) => {
      onlineUsers.set(socket.id, { id, email });
      socket.broadcast.emit("user-status", { id, status: "online" });
    });
    // User follows another
    socket.on("follow-user", (targetUserId) => {
      socket.join(`follow-${targetUserId}`);
      console.log(`📡 ${socket.id} joined follow-${targetUserId}`);
    });

    // Share location
    socket.on("send-location", ({ id, latitude, longitude }) => {
      socket.broadcast.emit("location-update", { id, latitude, longitude });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      const user = onlineUsers.get(socket.id);
      if (user) {
        socket.broadcast.emit("user-status", { id: user.id, status: "offline" });
      }
      onlineUsers.delete(socket.id);
      console.log("❌ Disconnected:", socket.id);
    });
  });
}

export { onlineUsers };
