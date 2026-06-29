const express = require("express");
const { validateSignupData } = require("../utils/validation.js");
const bcrypt = require("bcrypt");
const User = require("../models/user.js");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail.js");
const MailMessage = require("nodemailer/lib/mailer/mail-message.js");

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
            res.send(user);
        }
        else {
            throw new Error("Invalid credentials");
        }
    } catch (err) {
        res.status(400).send("Error" + err.message);
    }
})

authRouter.post("/logout", async(req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now())
    })

    res.send("Logged out successfully");
})

authRouter.post("/forgot-password", async(req, res) => {
    try {
        const { emailId } = req.body;
        const user = await User.findOne({ emailId });

        if(!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetLink =
            `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

         await sendEmail(
            user.emailId,
            "Reset Password",
            `
            <h2>Password Reset</h2>
            <p>Click below link:</p>

            <a href="${resetLink}">
                Reset Password
            </a>

            <p>Valid for 15 minutes.</p>
            `
        );

        res.status(200).json({
            success: true,
            message: "Reset link sent successfully"
        }); 

    } catch (error) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

authRouter.post("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        const user = await User.findOne({resetPasswordToken: token, resetPasswordExpires: {
                $gt: Date.now()
            }
        });

        if(!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired token"

            });
        }


        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 8 characters"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset succesful"
        });


    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
})



module.exports = authRouter;
