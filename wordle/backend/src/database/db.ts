const mongoose = require("mongoose");

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/");
    console.log("MongoDB connected successfully");
  } catch (e) {
    console.error("MongoDB connection failed");
    process.exit(1);
  }
};

module.exports = connectToDB;