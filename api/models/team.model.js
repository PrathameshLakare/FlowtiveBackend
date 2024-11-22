const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Team names must be unique
  description: { type: String },
});

module.exports = mongoose.model("Team", teamSchema);
