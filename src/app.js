const express = require("express")
const connectDB = require("./config/database.js")
const User = require("./models/user.js");
const app = express();
const { validateSignupData } = require("./utils/validation.js");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { userAuth } = require("./middleware/auth.js");


app.use(express.json());
app.use(cookieParser());








app.get("/user", async(req, res) => {
    const userEmail = req.body.emailId;

    try {
        const user = await User.findOne({emailId: userEmail});

        if(user.length === 0) {
            res.status(404).send("user not found");
        }
        else {
            res.send(user);
        }
    } catch (error) {
        res.status(400).send("something went wrong");
    }
})

app.get("/feed", async(req, res) => {
    try {
        const users = await User.find({});

        if(users.length === 0) {
            res.status(404).send("user not found");
        }
        else {
            res.send(users);
        }
    } catch (error) {
         res.status(400).send("something went wrong");
    }
})

app.delete("/user", async (req, res) => {
    const userId = req.body?.userId;
    try {
        const user = await User.findByIdAndDelete(userId);
        
        res.send("User deleted successfully");

    } catch (error) {
        res.status(400).send("something went wrong");
    }    
})

app.patch("/user", async (req, res) => {
    const emailId = req.body.emailId;
    const data = req.body;

    try {
        const user = await User.findOneAndUpdate({emailId: emailId}, data);
        res.send("user udated successfully");
    } catch (error) {
        res.status(400).send("something went wrong");
    }
})

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


