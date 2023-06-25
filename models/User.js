import mongoose from "mongoose";
import bcrypt from "bcrypt";
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is Required"],
    },
    email: {
      type: String,
      unique: [true, "Email already exists"],
      lowercase: true,
    },
    password: {
      type: String,
      minlength: 6,
      maxlength: 102,
      required: [true, "Enter a password for this user"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// Hash the passwords before

UserSchema.methods.generateHash = async function (password) {
  return await bcrypt.hash(password, 10);
  // eslint-disable-next-line no-underscore-dangle
};

export default mongoose.model("User", UserSchema);
