const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Transaction = require("../models/transaction");

// get all transaction

router.get("/", (req, res, next) => {
  Transaction.find()
    .exec()
    .then((docs) => {
      res.status(200).json({
        transactions: docs,
      });
    })
    .catch((err) => {
      res.status(500).json({
        err: err,
      });
    });
});

module.exports = router;
