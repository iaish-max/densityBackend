const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require("../models/user");

// create user
router.post("/", (req, res, next) => {
  const user = new User({
    username: req.body.username,
    stockcount: req.body.stockcount,
    fiat: req.body.fiat,
  });

  user
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

// get all users
router.get("/", (req, res, next) => {
  User.find()
    .exec()
    .then((docs) => {
      res.status(200).json({ users: docs });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

// get a particular user
router.get("/:userId", (req, res, next) => {
  const _id = req.params.userId;

  User.findById(_id)
    .exec()
    .then((result) => {
      res.status(200).json({ user: result });
    })
    .catch((err) => {
      res.status(409).json({ message: "user does not exist" });
    });
});

// modify a user
router.patch("/:userId", (req, res, next) => {
  const _id = req.params.userId;
  User.findByIdAndUpdate(
    _id,
    { $set: req.body },
    { new: true },
    function (err, result) {
      if (err) {
        console.log(err);
      }
      // console.log("result: ",result);
      res.status(200).json({ user: result });
    }
  );
});

// delete user
router.delete("/:userId", (req, res, next) => {
  const _id = req.params.userId;

  User.findByIdAndDelete(_id, function (err, result) {
    if (err) console.log("err is: ", err);
    else res.status(200).json({ message: "user deleted successfully" });
  });
});

module.exports = router;
