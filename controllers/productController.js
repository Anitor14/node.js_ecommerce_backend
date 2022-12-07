const User = require("../models/User");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const createProduct = (req, res) => {
  res.send("create product");
};

const getAllProducts = (req, res) => {
  res.send("get all products");
};

const getSingleProduct = (req, res) => {
  res.send("get single product");
};

const updateProduct = (req, res) => {
  res.send("update Product");
};

const deleteProduct = (req, res) => {
  res.send("delete Product");
};

const uploadImage = (req, res) => {
  res.send("upload Image");
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
