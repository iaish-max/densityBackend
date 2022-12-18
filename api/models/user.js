const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  stockcount: { type: Number, required: true },
  fiat: { type: Number, required: true },
});

module.exports = mongoose.model("User", userSchema);
