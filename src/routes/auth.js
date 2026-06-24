const express = require("express");
const { validateSignupData } = require("./utils/validation.js");
const bcrypt = require("bcrypt");
const User = require("./models/user.js");

const authRouter = express.Router();

authRouter.post("/signup", async(req, res) => {
    
    try {
        validateSignupData(req);
        
        const { firstName, lastName, emailId, password } = req.body;

        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash
        });

        await user.save();
        res.send("data updated successfully");
    } catch (error) {
        res.status(500).send(error.message);
    }
});

authRouter.post("/login", async(req, res) => {
    try {
        const { emailId, password } = req.body;

        const user = await User.findOne({emailId: emailId});
        if(!user) {
            throw new Error("Invalid credentials");
        }
        
        const isPasswordValid = await user.validatePassword(password);

        if(isPasswordValid) {
            // create jwt token:
            const token = await user.getJWT();

            res.cookie("token", token);
            res.send("Login Successfull !!!!!!");
        }
        else {
            throw new Error("Invalid credentials");
        }
    } catch (err) {
        res.status(400).send("Error" + err.message);
    }
})

module.exports = authRouter;