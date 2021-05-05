const mongoose = require("mongoose");

async function db() {
  try {
    const db = await mongoose.connect(
      "mongodb://localhost:27017/ironbeers-store",
      {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("Connected to db: ", db.connections[0].name);
  } catch (err) {
    console.error("Database connection failed!", err);
  }
}

module.exports = db;
