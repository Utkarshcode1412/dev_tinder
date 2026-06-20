const mongoose = require("mongoose")

const connectDB = async() => {
    await mongoose.connect(
        "mongodb+srv://pawarutkarsh579_db_user:Utkarsh_db@cluster0.ncilmbg.mongodb.net/devTinder"
    );
};

module.exports = connectDB;
