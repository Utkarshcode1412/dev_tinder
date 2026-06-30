const express = require("express");
const { userAuth } = require("../middleware/auth.js");
const User = require("../models/user.js");
const ConnectionRequest = require("../models/connectionRequest.js");


const userRouter = express.Router();
const SAFE_USER_DATA = "firstName lastName photoUrl age gender about skills";

userRouter.get("/user/requests/received", userAuth, async (req, res)  => {
    try {
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequest.find(
            {
                toUserId: loggedInUser._id,
                status: "interested",
            }
        ).populate("fromUserId", SAFE_USER_DATA);
        res.status(200).json(
            {
                message: "All interested requests fetched successfully",
                data: connectionRequests
            }
        );

    } catch (err) {
        res.status(400).json({ message: err.message });
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

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;

        limit = limit > 50 ? 50 : limit;
        const skip = (page-1) * limit;

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
                    {
                        _id: { 
                            $nin: [
                                ...hideUserFromFeed, loggedInUser._id
                            ]
                        }
                    }
                ]
            }
        )
        .select(SAFE_USER_DATA)
        .skip(skip)
        .limit(limit);

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