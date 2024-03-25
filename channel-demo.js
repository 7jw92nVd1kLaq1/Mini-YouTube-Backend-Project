const express = require('express');
const app = express();
const port = 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

/* Database */
let channelCount = 1;
const channels = new Map();

/* Middleware */
app.use(express.json());

/* API Routes */
app.route('/channels/:id')
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

        res.status(404).json({
            error: 'Channel not found'
        });
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

        res.status(404).json({
            error: 'Channel not found'
        });
    })
    // Get a channel
    .get((req, res) => {
        const { id } = req.params;
        const channel = channels.get(parseInt(id));
        
        // Check if channel exists
        if (channel) {
            return res.status(200).json(channel);
        }

        res.status(404).json({
            error: 'Channel not found'
        });
    });

app.route('/channels')
    // Create a new channel
    .post((req, res) => {
        const { channelName, description } = req.body;

        // Check if channel name is provided
        if (channelName) {
            channels.set(channelCount++, {
                channelName,
                description
            });
            return res.status(201).json({
                message: `Channel named ${channelName} has been created`
            });
        }
        
        res.status(400).json({
            error: 'Channel name is required'
        });
    })
    // Get all channels
    .get((req, res) => {
        // Check if there are channels
        if (channels.size) {
            // convert the map to an object
            const channelsObject = Object.fromEntries(channels.entries());
            return res.status(200).json(channelsObject)
        }

        res.status(404).json({
            error: 'No channels found'
        });
    });

app.route('/users/:id/channels')
    // Get all channels of a user
    .get((req, res) => {
        res.send('Get all channels of a user');
    })
    // Delete all channels of a user
    .delete((req, res) => {
        res.send('Delete all channels of a user');
    });