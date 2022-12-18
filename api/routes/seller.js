const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Seller = require("../models/seller");
const Buyer = require("../models/buyer");
const Transaction = require("../models/transaction");
const MarketPrice = require("../models/marketPrice");

// get all seller
router.get("/", (req, res, next) => {
  Seller.find()
    .exec()
    .then((docs) => {
      res.status(200).json({ seller: docs });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

// create seller
router.post("/", (req, res, next) => {
  const seller = new Seller({
    mode: req.body.mode,
    quantity: req.body.quantity,
    price: req.body.price,
    userid: req.body.userid,
  });

  seller
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

// sell the stocks
router.get("/sell", async (req, res, next) => {
  try {
    let appropiateBuyer = [];
    let sellerPrice = req.body.price;
    let sellerQuantity = req.body.quantity;
    let sellerId = req.body._id;
    let buyerList = [];

    await Buyer.find()
      .then((result) => {
        buyerList = result;

        // for aggressive buyer make price 0.
        if (sellerPrice === 0) appropiateBuyer = buyerList;
      })
      .catch((e) => {
        console.log("e is: ", e);
      });

    if (sellerPrice !== null) {
      // not aggressive seller
      for (let i = 0; i < buyerList.length; i++) {
        let buyer = buyerList[i];
        if (buyer.price === sellerPrice) appropiateBuyer.push(buyer);
      }
    } else {
      //aggressive seller
      appropiateBuyer.sort((a, b) => a.price - b.price);
      appropiateBuyer.reverse();
    }

    let i = 0;

    while (sellerQuantity !== 0 && i < appropiateBuyer.length) {
      if (appropiateBuyer[i].quantity <= sellerQuantity) {
        let _id = appropiateBuyer[i]._id;

        Buyer.findByIdAndDelete(
          { _id: appropiateBuyer[i]._id },
          function (err, result) {
            if (err) console.log("err1 is: ", err);
            else console.log("buyer deleted successfully");
          }
        );

        let currentMarketPrice = await MarketPrice.find();
        MarketPrice.findByIdAndUpdate(
          { _id: currentMarketPrice[0]._id },
          { marketPriceValue: appropiateBuyer[i].price.toString() },
          function (err, result) {
            if (err) console.log("err is: ", err);
            else console.log("marketPrice Updated");
          }
        );

        const transaction = new Transaction({
          mode: "sell",
          quantity: appropiateBuyer[i].quantity,
          price: appropiateBuyer[i].price,
          buyerId: appropiateBuyer[i]._id,
          sellerId: sellerId,
        });

        await transaction.save();
        sellerQuantity -= appropiateBuyer[i].quantity;
        i++;
      } else {
        appropiateBuyer[i].quantity -= sellerQuantity;

        Buyer.findByIdAndUpdate(
          { _id: appropiateBuyer[i]._id },
          { quantity: appropiateBuyer[i].quantity },
          function (err, result) {
            if (err) console.log("err is: ", err);
            else console.log("buyer is updated successfully");
          }
        ).clone();

        let currentMarketPrice = await MarketPrice.find();
        MarketPrice.findByIdAndUpdate(
          { _id: currentMarketPrice[0]._id },
          { marketPriceValue: appropiateBuyer[i].price.toString() },
          function (err, result) {
            if (err) console.log("err is: ", err);
            else console.log("marketPrice Updated");
          }
        );

        const transaction = new Transaction({
          mode: "sell",
          quantity: sellerQuantity,
          price: appropiateBuyer[i].price,
          buyerId: appropiateBuyer[i]._id,
          sellerId: sellerId,
        });
        await transaction.save();

        sellerQuantity = 0;
        i++;
      }
    }

    if (sellerQuantity === 0) {
      // delete seller.
      Seller.findByIdAndDelete({ _id: sellerId }, function (err, result) {
        if (err) console.log("err is: ", err);
        else console.log("seller is deleted");
      });
    } else {
      Seller.findByIdAndUpdate(
        { _id: sellerId },
        { quantity: sellerQuantity },
        function (err, result) {
          if (err) console.log("err is: ", err);
          else console.log("seller is updated");
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
