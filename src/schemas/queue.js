const { Schema, model } = require("mongoose");

const queueSchema = new Schema({
  name: { type: String, unique: true, required: true },
  messageId: { type: String, unique: true, required: true },
  channelId: { type: String, required: true },
  categoryId: { type: String, required: true },
  size: { type: Number, required: true },
  members: [{ type: String }],
});

module.exports = model("queueOriginal", queueSchema);
