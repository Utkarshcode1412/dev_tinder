const mongoose = require("mongoose")
require("dotenv").config();

const connectDB = async() => {
    console.log(process.env.DATABASE_KEY);
    await mongoose.connect(process.env.DATABASE_KEY);
};

module.exports = connectDB;
