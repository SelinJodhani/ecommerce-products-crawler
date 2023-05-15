import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      text: true,
    },
    is_second_hand: {
      type: Boolean,
      default: false,
    },
    total_review_count: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
    },
    website: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
