const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema({
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
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
