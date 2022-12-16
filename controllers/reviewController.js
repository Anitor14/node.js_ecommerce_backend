const Review = require("../models/Review");
const User = require("../models/User");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const { checkPermissions } = require("../utils");

const createReview = async (req, res) => {
  const { product: productId } = req.body; // we gave our product an alias which is productId
  const { userId } = req.user;

  // find the product with the productId
  const isValidProduct = await Product.findOne({ _id: productId });

  // return a customError if the Product is not found.
  if (!isValidProduct) {
    throw new CustomError.NotFoundError(`No Product with id: ${productId}`);
  }

  // we want to check if this particular user has made a review concerning this particular product.

  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: userId,
  });
  //   throw new error if it has already been submitted.
  if (alreadySubmitted) {
    throw new CustomError.BadRequestError(
      "Already submitted review for this product"
    );
  }
  req.body.user = userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json(review);
};

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({});
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError.NotFoundError(`No Review with id: ${reviewId}`);
  }
  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOneAndUpdate({ _id: reviewId }, req.body, {
    new: true,
    runValidators: true,
  });
  res.send(" update review");
};

const deleteReview = async (req, res) => {
  res.send("delete review");
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
};
