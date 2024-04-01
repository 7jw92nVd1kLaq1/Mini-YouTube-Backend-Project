const express = require('express');
const router = express.Router();

const { connection } = require('../db');


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
        const { channelName } = req.body;
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
        
        const query = 'UPDATE channels SET name = ? WHERE id = ?';
        connection.query(
            query,
            [channelName, id],
            (error, results, fields) => {
                if (error) {
                    return res.status(500).json({
                        error: 'An error occurred. Please try again.'
                    });
                }

                if (results.affectedRows > 0) {
                    return res.status(200).json({
                        message: 'Channel has been updated.'
                    });
                }

                send404(res);
            }
        );
    })
    // Delete a channel
    .delete((req, res) => {
        let { id } = req.params;
        id = parseInt(id);

        const query = 'DELETE FROM channels WHERE id = ?';
        connection.query(
            query,
            [id],
            (error, results, fields) => {
                if (error) {
                    return res.status(500).json({
                        error: 'An error occurred. Please try again.'
                    });
                }

                if (results.affectedRows > 0) {
                    return res.status(200).json({
                        message: 'Channel has been deleted.'
                    });
                }

                send404(res);
            }
        );
    })
    // Get a channel
    .get((req, res) => {
        const { id } = req.params;
        const query = 'SELECT * FROM channels WHERE id = ?'
        connection.query(
            query,
            [id],
            (error, results, fields) => {
                if (error) {
                    return res.status(500).json({
                        error: 'An error occurred. Please try again.'
                    });
                }

                if (results.length > 0) {
                    return res.status(200).json(results[0]);
                }

                send404(res);
            }
        );
    });

router.route('/')
    // Create a new channel
    .post((req, res) => {
        const { userId, channelName } = req.body;

        const query = 'INSERT INTO channels (user_id, name) VALUES (?, ?)';
        if (userId && channelName) {
            connection.query(
                query,
                [userId, channelName],
                (error, results, fields) => {
                    if (error) {
                        return res.status(500).json({
                            error: 'An error occurred. Please try again.'
                        });
                    }

                    if (results.affectedRows > 0) {
                        return res.status(201).json({
                            message: 'Channel has been created.'
                        });
                    }

                    return res.status(400).json({
                        error: 'Channel could not be created.'
                    });
                }
            );
        }
        else {
            res.status(400).json({
                error: 'Provide user id and channel name.'
            });
        }
    })
    // Get all channels for a user
    .get((req, res) => {
        const { userId } = req.body;

        // Check if username is provided
        if (userId === undefined) {
            return res.status(400).json({
                error: 'Login to get your channels.'
            });
        }

        // Check if there are channels
        const query = 'SELECT * FROM channels WHERE user_id = ?';
        connection.query(
            query,
            [userId],
            (error, results, fields) => {
                if (error) {
                    return res.status(500).json({
                        error: 'An error occurred. Please try again.'
                    });
                }

                if (results.length > 0) {
                    return res.status(200).json(results);
                }

                res.status(404).json({
                    error: 'No channels found.'
                });
            }
        );
    });

module.exports = router;