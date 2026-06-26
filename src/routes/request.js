const express = require("express");
const { userAuth } = require("../middleware/auth.js");
const User = require("../models/user.js");
const ConnectionRequest = require("../models/connectionRequest.js");
const requestRouter = express.Router();


requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const allowedStatus = ["interested", "ignored"];
        if(!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "Invalid status type " + status
            });
        }


        const toUser = await User.findById(toUserId);
        if(!toUser) {
            return res.status(404).json({message: "User not found"});
        }


        const existingConnectionRequest = await ConnectionRequest.findOne( 
            {
                $or: [
                    {fromUserId, toUserId},
                    {fromUserId: toUserId, toUserId: fromUserId}
                ]
            }
        )


        if(existingConnectionRequest) {
            return res.status(400).json(
                {
                    message: "Connection request already exist!!"
                }
            )
        };

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        const data = await connectionRequest.save();

        res.json({
        message:
          req.user.firstName + " is " + status + " in " + toUser.firstName,
        data,
      });


    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

requestRouter.post("/request/review/:status/:requestId", userAuth, async(req, res) => {
    try {
        
        const loggedInUser = req.user;
        const { status, requestId } = req.params;

        const allowedStatus = ["accepted", "rejected"];
        if(!allowedStatus.includes(status)) {
            return res.status(400).json(
                {
                    message: "Invlaid status type"
                }
            );
        }

        const connectionRequest = await ConnectionRequest.findById(
            {
                _id: requestId,
                requestId: loggedInUser._id,
                status: "interested"
            }
        )

        if(!connectionRequest) {
            return res.status(404).json(
                {
                    message: "Connection request not found"
                }
            )
        }

        connectionRequest.status = status;

        const data = await connectionRequest.save();

        res.status(200).json(
            {
                message: "Connection Request " + status, data
            }
        );

    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
}) 


module.exports = requestRouter;