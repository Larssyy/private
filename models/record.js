const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
  subdomain: { type: String, required: true, unique: true },
  domain: { type: String, required: true },
  recordType: { type: String, required: true },
  recordValue: { type: String, required: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Record", recordSchema);
