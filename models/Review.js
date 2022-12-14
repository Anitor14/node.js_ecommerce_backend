const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "please provide review title"],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, "please provide review text"],
      maxlength: 100,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

// this is to set up compound index, in this case the user can only review a product once.
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });
// the static method are created on the schema , not on the instance of the model like instance methods.
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    //  we first match the aggregate reviews based on the productId.
    { $match: { product: productId } },
    // then we group and find the average rating, and the number of reviews
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  console.log(result);
  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        // we are using optional chaining.
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.post("save", async function () {
  // we are calling the static method calculateAverageRating
  await this.constructor.calculateAverageRating(this.product);
});

ReviewSchema.post("remove", async function () {
  // we are calling the static method calculateAverageRating
  await this.constructor.calculateAverageRating(this.product);
});
module.exports = mongoose.model("Review", ReviewSchema);
