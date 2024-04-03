const express = require('express');
const router = express.Router();
const { param, body } = require('express-validator');

const { connection, pool } = require('../db');
const { validate, jwtTokenCheck, channelAvailabilityEditCheck } = require('../middleware');

const { getUserById } = require('../services/user-service');


function send400(res, msg = 'An error occurred. Please try again.') {
    if (typeof msg === 'object') {
        return res.status(400).json(msg);
    }

    res.status(400).json({
        error: msg
    });
}

function send404(res, msg = 'Resource not found.') {
    if (typeof msg === 'object') {
        return res.status(404).json(msg);
    }
    
    res.status(404).json({
        error: msg
    });
}

/* API Routes */
router.route('/:id')
    // Update a channel
    .put(
        [
            jwtTokenCheck,
            channelAvailabilityEditCheck,
            param('id').notEmpty().isInt().withMessage('Provide a valid channel id.'),
            body('channelName').notEmpty().isString().withMessage('Provide a valid channel name.'),
            validate
        ],
        async (req, res) => {
            let { id } = req.params;
            const { channelName } = req.body;
            const query = 'UPDATE channels SET name = ? WHERE id = ?';
            const values = [channelName, id];

            try {
                const queryResult = await pool.query(query, values);
                if (queryResult[0].affectedRows > 0) {
                    return res.status(200).json({
                        message: 'Channel has been updated.'
                    });
                }
            } catch (error) {
                return send400(res, 'An error occurred. Please try again.');
            }
        }
    )
    // Delete a channel
    .delete(
        [
            jwtTokenCheck,
            channelAvailabilityEditCheck,
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
            jwtTokenCheck,
            body('channelName').notEmpty().isString().withMessage('Provide a valid channel name.'),
            validate
        ],
        async (req, res) => {
            const { channelName } = req.body;
            const { sub } = req.user;

            const user = await getUserById(sub);
            if (!user) {
                return send404(res, 'User not found.');
            }

            const query = 'INSERT INTO channels (user_id, name) VALUES (?, ?)';
            const values = [sub, channelName];

            try {
                const queryResult = await pool.query(query, values);
                if (queryResult[0].affectedRows > 0) {
                    return res.status(201).json({
                        message: 'Channel has been created.'
                    });
                }
            } catch (error) {
                return send400(res, 'An error occurred. Please try again.');
            }
    })
    // Get all channels for a user
    .get(
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