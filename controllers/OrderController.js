const Order = require("../models/Order");
const Product = require("../models/Product");

const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermissions } = require("../utils");

const createOrder = async (req, res) => {
  const { tax, shippingFee, items: cartItems } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("No Cart Items provided");
  }

  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError(
      "Please provide tax and shipping fee"
    );
  }

  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.Product });
    if (!dbProduct) {
      throw new CustomError.NotFoundError(
        `No product with id: ${item.Product}`
      );
    }
  }

  //we cannot run an asynchronous await function inside a forEach or map function , so we utilize for of.

  res.send("create order");
};
const getAllOrders = async (req, res) => {
  res.send("get all orders");
};
const getSingleOrder = async (req, res) => {
  res.send("get single orders");
};
const getCurrentUserOrders = async (req, res) => {
  res.send("get current user orders");
};
const updateOrder = async (req, res) => {
  res.send("update order");
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
