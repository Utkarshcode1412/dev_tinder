const express = require("express")
const connectDB = require("./config/database.js")
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors")

app.use(cors(
    {
        origin: "http://localhost:5173",
        credentials: true,
    }
));
app.use(express.json());
app.use(cookieParser());


const authRouter = require("./routes/registerAuth.js");
const profileRouter = require("./routes/profile.js");
const requestRouter = require("./routes/request.js");
const userRouter = require("./routes/users.js");


app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);



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


