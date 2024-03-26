const express = require('express');
const send = require('send');
const router = express.Router();

/* Database */
let channelCount = 1;
const channels = new Map();

/* Utility Functions */
function send404(res) {
    res.status(404).json({
        error: 'Channel not found'
    });
}

/* API Routes */
router.route('/:id')
    // Update a channel
    .put((req, res) => {
        let { id } = req.params;
        id = parseInt(id);

        // Check if channel name is provided
        const { channelName, description } = req.body;
        if (channelName === undefined) {
            return res.status(400).json({
                error: "Provide the name of the channel."
            });
        } else if (
            typeof channelName === "string" && 
            channelName.length <= 0
        ) {
            return res.status(400).json({
                error: "The name of the channel must have at least alphanumeric character."
            });
        }
       
        // Check if channel exists
        if (channels.has(id)) {
            channels.set(id, {
                channelName,
                description
            })
            return res.status(200).json({
                message: 'Channel has been successfully updated.'
            });
        }

        send404(res);
    })
    // Delete a channel
    .delete((req, res) => {
        let { id } = req.params;
        id = parseInt(id);

        // Check if channel exists
        if (channels.has(id)) {
            channels.delete(id);
            return res.status(200).json({
                message: `Channel with an id ${id} has been deleted`
            });
        }

        send404(res);
    })
    // Get a channel
    .get((req, res) => {
        const { id } = req.params;
        const channel = channels.get(parseInt(id));
        
        // Check if channel exists
        if (channel) {
            return res.status(200).json(channel);
        }

        send404(res);
    });

router.route('/')
    // Create a new channel
    .post((req, res) => {
        const { username, channelName, description } = req.body;

        // Check if channel name is provided
        if (channelName) {
            channels.set(channelCount++, {
                username,
                channelName,
                description
            });
            return res.status(201).json({
                message: `Channel named ${channelName} for a user ${username} has been created`
            });
        }
        
        res.status(400).json({
            error: 'Channel name is required'
        });
    })
    // Get all channels for a user
    .get((req, res) => {
        const { username } = req.body;

        // Check if username is provided
        if (username === undefined) {
            return res.status(400).json({
                error: 'Login to get your channels.'
            });
        }

        // Check if there are channels
        if (channels.size) {
            const userChannels = [];
            // convert the map to an object
            for (let channel of channels.values()) {
                if (channel.username === username) 
                    userChannels.push(channel);
            }
            
            // Check if user has channels
            if (userChannels.length) {
                return res.status(200).json(userChannels);
            }
            
            return send404(res);
        }

        res.status(404).json({
            error: 'No channels found'
        });
    });

module.exports = router;