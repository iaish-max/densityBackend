const mongoose = require("mongoose");

const sellerSchema = mongoose.Schema({
  mode: {
    type: String,
    require: true,
  },
  quantity: {
    type: Number,
    require: true,
  },
  price: {
    type: Number,
    default: null,
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});

module.exports = mongoose.model("Seller", sellerSchema);
