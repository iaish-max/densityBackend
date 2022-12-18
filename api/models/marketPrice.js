const mongoose = require("mongoose");

const marketPriceSchema = mongoose.Schema({
  marketPriceValue: {
    type: String,
    default: "NA",
  },
});

module.exports = mongoose.model("MarketPrice", marketPriceSchema);
