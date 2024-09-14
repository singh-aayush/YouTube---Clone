import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import connectDB from "./db/index.js";
import { app } from "./app.js";
// require("dotenv").config({ path: "./env" });

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log(`Error`, error);
      throw error;
    });
    app.listen(process.env.PORT || 6969, () => {
      console.log(`Server is running at port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MonoDB connection failed !!!", err);
  });

// ANOTHER WAYSS...............

/*
import express from "express";
const app = express();
(async () => {
  try {
    await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log(`Error`, error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`Server is listining on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error", error);
    throw error;
  }
})();
*/
