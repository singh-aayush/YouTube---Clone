import mongoose, { Schema } from "mongoose";
import { video } from "../models/Video.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userDetails = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      // required: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "video",
      },
    ],
    refreshToken: {
      type: String,
    },
    sessionId: {
      type: String,
      default: null,
    },
    subscribers: { type: Number, default: 0 },
    subscriptions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Channel",
      },
    ],
    channel: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
    },
  },
  { timestamps: true }
);

userDetails.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userDetails.methods.isPasswordCorrect = async function (password) {
  console.log(await bcrypt.compare(password, this.password));
  return await bcrypt.compare(password, this.password);
};

userDetails.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      userName: this.userName,
      fullName: this.fullName,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userDetails.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userDetails);
