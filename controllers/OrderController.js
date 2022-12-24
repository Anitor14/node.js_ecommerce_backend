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
      throw new CustomError.NotFoundError(`No product with id:${item.product}`);
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
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });
  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};
const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};
const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id:${orderId}`);
  }
  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};
const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};
const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;

  const order = await Order.findOne({ id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id: ${orderId}`);
  }
  checkPermissions(req.user, order.user);
  order.paymentIntentId = paymentIntentId;
  order.status = "paid";
  await order.save();

  res.status(StatusCodes.OK).json({ order });
};
module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
