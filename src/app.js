const express = require("express")
const connectDB = require("./config/database.js")
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(cookieParser());


const authRouter = require("./routes/registerAuth.js");
const profileRouter = require("./routes/profile.js");
const requestRouter = require("./routes/request.js");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);



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


