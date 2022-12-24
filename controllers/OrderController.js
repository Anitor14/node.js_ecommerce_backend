const Order = require("../models/Order");
const Product = require("../models/Product");

const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermissions } = require("../utils");

const fakeStripeApi = async ({ amount, currency }) => {
  const client_secret = "someRandomValue";
  return { client_secret, amount };
};

const createOrder = async (req, res) => {
  // getting the tax, shippingFee, and items from the req.body.
  const { tax, shippingFee, items: cartItems } = req.body;

  // if there are no cartitems, or the cartItems.length is less than 0.
  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("No Cart Items provided");
  }

  // checking if there is no tax or shipping fee.
  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError(
      "Please provide tax and shipping fee"
    );
  }

  let orderItems = [];
  let subtotal = 0;

  //we cannot run an asynchronous await function inside a forEach or map function , so we utilize for of.
  for (const item of cartItems) {
    // getting the product from the Database with the id that is equals to the item.product.
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new CustomError.NotFoundError(
        `No product with id: ${item.product}`
      );
    }
    // we get the name, price, image and the id from the dbProduct
    const { name, price, image, _id } = dbProduct;

    console.log(name, price, image);

    // create a singleOrderItem object with the item.amount, name, price, image and product.
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    // add item to order
    // add items to the orderItems array by using the spread operator.
    orderItems = [...orderItems, singleOrderItem];
    // calculate subtotal
    subtotal += item.amount * price;
  }
  //calculating the total by adding the shippingFee, tax and subtotal.
  const total = tax + shippingFee + subtotal;
  // get client secret.
  const paymentIntent = await fakeStripeApi({
    amount: total,
    currency: "usd",
  });

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.clientSecret,
    user: req.user.userId,
  });
  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
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
