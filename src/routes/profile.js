const express = require("express");
const { userAuth } = require("../middleware/auth.js");
const profileRouter = express.Router();
const { validateProfileEdit } = require("../utils/validation.js");
const bcrypt = require("bcrypt");



profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
    
        res.send(user);
    } catch (err) {
        res.status(400).send("Error" + err.message);
    }
})

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        if(!validateProfileEdit) {
            throw new Error("Invalid Edit request");
        }

        const loggedInUser = req.user;

        Object.keys(req.body).forEach((keys) => (loggedInUser[keys] = req.body[keys]));

        await loggedInUser.save();

        res.json({
            message: `${loggedInUser.firstName}, your profile updated successfuly`,
            data: loggedInUser,
        });


    } catch (err) {
        res.status(400).send("Error" + err.message);
    }
})


profileRouter.patch("/profile/editPassword", userAuth, async(req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
    
        const user = req.user;
        const isValid = await bcrypt.compare(
            oldPassword,
            user.password
        );
    
        if(!isValid) {
            return res.status(400).json({
                success: false,
                message: "Old password is incorrect"
            });
        }
    
        if(newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password should conatin atleast 8 characters"
            });
        }
    
        if(newPassword === oldPassword) {
            return res.status(400).json({
                success: false,
                message: "New password cannot be same as old password"
            });
        }
    
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
    
        return res.status(200).json({
            success: true,
            message: "New password updated successfully"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });    
    }
})

module.exports = profileRouter;