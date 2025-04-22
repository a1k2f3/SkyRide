const messageSchema = new mongoose.Schema({
    senderId: String,
    receiverId: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  });
  const Chats = mongoose.model('chats', messageSchema);
export default Chats;
  