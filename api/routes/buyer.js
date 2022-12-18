const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Buyer = require("../models/buyer");
const { findByIdAndDelete, findByIdAndUpdate } = require("../models/seller");
const Seller = require("../models/seller");
const Transaction = require("../models/transaction");
const MarketPrice = require("../models/marketPrice");

// get all buyer.
router.get("/", (req, res, next) => {
  Buyer.find()
    .exec()
    .then((docs) => {
      res.status(200).json({ buyer: docs });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

// create buyer
router.post("/", (req, res, next) => {
  const buyer = new Buyer({
    mode: req.body.mode,
    quantity: req.body.quantity,
    price: req.body.price,
    userid: req.body.userid,
  });

  buyer
    .save()
    .then((result) => {
      res.status(200).json({
        message: "user created successfully",
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

// buy the stocks
router.get("/buy", async (req, res, next) => {
  try {
    let appropiateSeller = [];
    let buyerPrice = req.body.price;
    let buyerQuantity = req.body.quantity;
    let buyerId = req.body._id;
    let sellerList = [];

    await Seller.find()
      .then((result) => {
        sellerList = result;

        // for aggressive buyer make price 0.
        if (buyerPrice === 0) appropiateSeller = sellerList;
      })
      .catch((e) => {
        console.log("e is: ", e);
      });

    if (buyerPrice !== null) {
      // not aggressive buyer
      for (let i = 0; i < sellerList.length; i++) {
        let seller = sellerList[i];
        if (seller.price === buyerPrice) appropiateSeller.push(seller);
      }
    } else {
      //aggressive buyer
      appropiateSeller.sort((a, b) => a.price - b.price);
    }

    let i = 0;

    while (buyerQuantity !== 0 && i < appropiateSeller.length) {
      if (appropiateSeller[i].quantity <= buyerQuantity) {
        let _id = appropiateSeller[i]._id;

        Seller.findByIdAndDelete(
          { _id: appropiateSeller[i]._id },
          function (err, result) {
            if (err) console.log("err1 is: ", err);
            else console.log("seller deleted successfully");
          }
        );

        let currentMarketPrice = await MarketPrice.find();
        MarketPrice.findByIdAndUpdate(
          { _id: currentMarketPrice[0]._id },
          { marketPriceValue: appropiateSeller[i].price.toString() },
          function (err, result) {
            if (err) console.log("err is: ", err);
            else console.log("marketPrice Updated");
          }
        );

        const transaction = new Transaction({
          mode: "buy",
          quantity: appropiateSeller[i].quantity,
          price: appropiateSeller[i].price,
          buyerId: buyerId,
          sellerId: appropiateSeller[i]._id,
        });

        await transaction.save();
        buyerQuantity -= appropiateSeller[i].quantity;
        i++;
      } else {
        appropiateSeller[i].quantity -= buyerQuantity;

        Seller.findByIdAndUpdate(
          { _id: appropiateSeller[i]._id },
          { quantity: appropiateSeller[i].quantity },
          function (err, result) {
            if (err) console.log("err is: ", err);
            else console.log("seller is updated successfully");
          }
        ).clone();

        let currentMarketPrice = await MarketPrice.find();
        MarketPrice.findByIdAndUpdate(
          { _id: currentMarketPrice[0]._id },
          { marketPriceValue: appropiateSeller[i].price.toString() },
          function (err, result) {
            if (err) console.log("err is: ", err);
            else console.log("marketPrice Updated");
          }
        );

        const transaction = new Transaction({
          mode: "buy",
          quantity: buyerQuantity,
          price: appropiateSeller[i].price,
          buyerId: buyerId,
          sellerId: appropiateSeller[i]._id,
        });
        await transaction.save();

        buyerQuantity = 0;
        i++;
      }
    }

    if (buyerQuantity === 0) {
      // delete buyer.
      Buyer.findByIdAndDelete({ _id: buyerId }, function (err, result) {
        if (err) console.log("err is: ", err);
        else console.log("buyer is deleted");
      });
    } else {
      Buyer.findByIdAndUpdate(
        { _id: buyerId },
        { quantity: buyerQuantity },
        function (err, result) {
          if (err) console.log("err is: ", err);
          else console.log("buyer is updated");
        }
      );
    }

    res
      .status(200)
      .json({ message: "buyer and seller are updated successfully" });
  } catch (e) {
    console.log("err2 is: ", e);
  }
});

module.exports = router;
