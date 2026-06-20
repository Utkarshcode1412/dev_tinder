const express = require("express")
const connectDB = require("./config/database.js")
const User = require("./models/user.js");
const app = express();


app.post("/signup", async(req, res) => {
    const user = new User({
        firstName: "Utkarsh",
        lastName: "Pawar",
        emailId: "utk@test.com",
        password: "12345566"      
    })

    try {
        await user.save();
        res.send("data updated successfully");
    } catch (error) {
        res.status(500).send("Error occured:", err.message);
    }
});




connectDB()
    .then(() => {
        console.log("Database connected successfully");
        app.listen(8000, () => {
            console.log("server started");
        })
    })
    .catch(() => {
        console.log("Database cannot be connected ");
    });


