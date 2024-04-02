const express = require('express');
const router = express.Router();
const { param, body, validationResult } = require('express-validator');
const { connection } = require('../db');


/* Utility Functions */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }

    next();
}

function send400(res, msg) {
    res.status(400).json({
        error: msg
    });
}

function send404(res, msg) {
    res.status(404).json({
        error: msg
    });
}

/* API Routes */
router.route('/:id')
    // Update a channel
    .put(
        [
            body('channelName').notEmpty().isString().withMessage('Provide a valid channel name.'),
            param('id').notEmpty().isInt().withMessage('Provide a valid channel id.'),
            validate
        ],
        (req, res) => {
            let { id } = req.params;

            // Check if channel name is provided
            const { channelName } = req.body;
            const query = 'UPDATE channels SET name = ? WHERE id = ?';
            connection.query(
                query,
                [channelName, id],
                (error, results, fields) => {
                    if (error) {
                        return send400(res, 'An error occurred. Please try again.');
                    }

                    if (results.affectedRows > 0) {
                        return res.status(200).json({
                            message: 'Channel has been updated.'
                        });
                    } else if (results.affectedRows === 0) {
                        return res.status(204).json({
                            message: 'No changes were made.'
                        });
                    }

                    send404(res, 'Channel not found.');
                }
            );
        }
    )
    // Delete a channel
    .delete(
        [
            param('id').notEmpty().isInt().withMessage('Provide a valid channel id.'),
            validate
        ],        
        (req, res) => {
            let { id } = req.params;

            const query = 'DELETE FROM channels WHERE id = ?';
            connection.query(
                query,
                [id],
                (error, results, fields) => {
                    if (error) {
                        return send400(res, 'An error occurred. Please try again.');
                    }

                    if (results.affectedRows > 0) {
                        return res.status(200).json({
                            message: 'Channel has been deleted.'
                        });
                    } else if (results.affectedRows === 0) {
                        return res.status(204).json({
                            message: 'No changes were made.'
                        });
                    }

                    send404(res, 'Channel not found.');
                }
            );
        }
    )
    // Get a channel
    .get(
        [
            param('id').notEmpty().isInt().withMessage('Provide a valid channel id.'),
            validate
        ], 
        (req, res) => {
            const { id } = req.params;
            const query = 'SELECT * FROM channels WHERE id = ?'
            connection.query(
                query,
                [id],
                (error, results, fields) => {
                    if (error) {
                        return send400(res, 'An error occurred. Please try again.');
                    }

                    if (results.length > 0) {
                        return res.status(200).json(results[0]);
                    }

                    send404(res, 'Channel not found.');
                }
            );
        }
    );

router.route('/')
    // Create a new channel
    .post(
        [
            body('userId').notEmpty().isInt().withMessage('Provide a valid user id.'),
            body('channelName').notEmpty().isString().withMessage('Provide a valid channel name.'),
            validate
        ],
        (req, res) => {
            const { userId, channelName } = req.body;

            const query = 'INSERT INTO channels (user_id, name) VALUES (?, ?)';
            connection.query(
                query,
                [userId, channelName],
                (error, results, fields) => {
                    if (error) {
                        return send400(res, 'An error occurred. Please try again.');
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
    })
    // Get all channels for a user
    .get(
        [
            body('userId').notEmpty().isInt().withMessage('Provide a valid user id.'),
            validate
        ], 
        (req, res) => {
            const { userId } = req.body;

            // Check if there are channels
            const query = 'SELECT * FROM channels WHERE user_id = ?';
            connection.query(
                query,
                [userId],
                (error, results, fields) => {
                    if (error) {
                        return send400(res, 'An error occurred. Please try again.');
                    }

                    if (results.length > 0) {
                        return res.status(200).json(results);
                    }

                    send404(res, 'No channels found.');
                }
            );
        }
    );

module.exports = router;