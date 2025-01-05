const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb://linkshortner_somehowdry:352db43beb8b06bb916939a67cc8e93443ef2b46@mm8rj.h.filess.io:27018/linkshortner_somehowdry",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    );
    console.log("MongoDB Connected...");
  } catch (error) {
    console.error("Database Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
