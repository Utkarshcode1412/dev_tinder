const jwt = require("jsonwebtoken");
const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 20
        },
        lastName: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 20
        },
        emailId: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            validate(value) {
                if(!validator.isEmail(value)) {
                    throw new Error("Not a valid email" + value)
                }
            }
        },
        password: {
            type: String,
            required: true,
            validate(value) {
                if(!validator.isStrongPassword(value)) {
                    throw new Error("Write a string password" + value);
                }
            }
        },
        age: {
            type: Number,
            min: 18
        },
        gender: {
            type: String,
            enum: {
                values: ["male", "female", "other"],
                message: `{VALUE} is not a valid gender type`,
            }
        },
        photoUrl: {
            type: String,
            default: "https://geographyandyou.com/images/user-profile.png",
            validate(value) {
                if (!validator.isURL(value)) {
                    throw new Error("Invalid Photo URL: " + value);
                }
            }
        },
        about: {
            type: String,
            default: "Write about yourself",
            maxLength: 400
        },
        skills: {
            type: [String]
        },
        resetPasswordToken: {
            type: String
        },
        resetPasswordExpires: {
            type: Date
        }
    }, { timestamps: true }
);


userSchema.methods.getJWT = async function () {
    const user = this;

    const token = await jwt.sign({_id: user._id}, "DEV@Tinder909", {expiresIn: "1d"});

    return token;
};

userSchema.methods.validatePassword = async function (passwordInpuyByuser) {
    const user = this;
    const passwordhash = user.password;

    const isPasswordValid = await bcrypt.compare(passwordInpuyByuser, passwordhash);

    return isPasswordValid;
}


module.exports = mongoose.model("User", userSchema);