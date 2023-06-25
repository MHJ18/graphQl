import mongoose from "mongoose";

const QuotesSchema = new mongoose.Schema(
  {
    quote: {
      type: String,
      required: [true, "Please add a Quote"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Quotes", QuotesSchema);
