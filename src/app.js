const express = require("express")

const app = express();

app.use("/user", (req, res) => {
    res.send("hi home page")
})

app.listen(8000, () => {
    console.log("server started");
})