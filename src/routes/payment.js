const express = require("express");
const { userAuth } = require("../middleware/auth");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

const razorpayInstance = require("../config/razorpay");
const Payment = require("../models/payment");
const User = require("../models/user");

const { membershipAmount } = require("../utils/constants");

const router = express.Router();

// Create Order
router.post("/create", userAuth, async (req, res) => {
  try {
    const { firstName, lastName, emailId } = req.user;
    const { membershipType } = req.body;

    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: { firstName, lastName, emailId, membershipType },
    });

    // Save it in the db
    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    // return to fe
    res.status(200).send({
      status: "success",
      message: "Order created successfully",
      data: { ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID },
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message || "Something went wrong",
    });
  }
});

// Razorpay webhook
router.post("/webhook", async (req, res) => {
  try {
    const webhookSignature = req.get("X-Razorpay-Signature");

    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      return res.status(400).send({
        status: "error",
        message: "Webhook signature is invalid",
      });
    }

    // Update the status in db
    const paymentDetails = req.body.payload.payment.entity;

    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
    payment.status = paymentDetails.status;
    await payment.save();

    // update user premium
    const user = await User.findOne({ _id: payment.userId });
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;

    await user.save();

    res.status(200).send({
      status: "success",
      message: "Order created successfully",
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message || "Something went wrong",
    });
  }
});

// Verify
router.get("/verify", userAuth, (req, res) => {
  const user = req.user;

  if (user.isPremium) {
    return res.json({ isPremium: true });
  }
  return res.json({ isPremium: false });
});
module.exports = router;
