const express = require("express");
const { userAuth } = require("../middleware/auth.js");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest.js");
const user = require("../models/user");

const userRouter = express.Router();
const SAFE_USER_DATA = "firstName lastName photoUrl age gender about skills";

userRouter.get("/user/requests/received", userAuth, async (req, res)  => {
    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find(
            {
                toUserId: loggedInUser._id,
                status: "interested"
            }
        ).populate("fromUserId", SAFE_USER_DATA);

        res.status(200).json(
            {
                message: "All pending request fetched successfully",
                data: connectionRequests
            }
        );

    } catch (err) {
        req.statusCode(400).send("ERROR: " + err.message);
    }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequest = await ConnectionRequest.find(
            {
                $or: [
                    {toUserId: loggedInUser._id, status: "accepted"},
                    {fromUserId: loggedInUser._id, status: "accepted"}
                ]
            }
        )
        .populate("toUserId", SAFE_USER_DATA)
        .populate("fromUserId", SAFE_USER_DATA);

        const data = connectionRequest.map((row) => {
            if(row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId;
            }

            return row.fromUserId;
        })

        res.json(
            {
                data
            }
        )

    } catch (err) {
        req.statusCode(400).send("ERROR: " + err.message);
    }    
})

userRouter.get("/user/feed", userAuth, async (req, res) => {
    try {
        
        const loggedInUser = req.user;

        const connectionRequest = await ConnectionRequest.find(
            {
                $or: [
                    {fromUserId: loggedInUser._id},
                    {toUserId: loggedInUser._id}
                ]
            }
        ).select("fromUserId toUserId");

        const hideUserFromFeed = new Set();

        connectionRequest.forEach((req) => {
            hideUserFromFeed.add(req.fromUserId.toString());
            hideUserFromFeed.add(req.toUserId.toString());
        })

        const users = await User.find(
            {
                $and: [
                    { _id: { $nin: Array.from(hideUserFromFeed)}},
                    { _id: {$ne: loggedInUser._id}}
                ]
            }
        ).select(SAFE_USER_DATA);

        res.json(
            {
                data: users
            }
        );
    } catch (err) {
        res.status(400).json({ message: err.message });
    }    
})



module.exports = userRouter