const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://Sulu:Sulagna21102003@sulagna21.ols2n.mongodb.net/?retryWrites=true&w=majority&appName=Sulagna21",
      {
        useUnifiedTopology: true,
      }
    );
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
