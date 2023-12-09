
const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  headers: [{name: String, value: String}],
  body: String,
  lastHistoryId: Number,
  messageId: String,
  ownerId: String
});

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;
