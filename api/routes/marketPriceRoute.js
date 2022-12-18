const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const MarketPrice = require("../models/marketPrice");

// initialise marketPrice
router.post("/", (req, res, next) => {
  const marketPrice = new MarketPrice({
    marketPriceValue: "NA",
  });

  marketPrice.save();

  res.status(200).json({ message: "marketPrice Initialised with NA" });
});

// get marketPrice
router.get("/", (req, res, next) => {
  MarketPrice.find().then((result) => {
    res.status(200).json({ data: result });
  });
});

module.exports = router;
