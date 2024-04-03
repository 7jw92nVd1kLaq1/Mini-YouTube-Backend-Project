const express = require('express');
const router = express.Router();
const { param, body } = require('express-validator');

const { validate, jwtTokenCheck, channelEditPermissionCheck } = require('../middleware');
const { getUserById } = require('../services/user-service');
const { 
    getChannelById, 
    getChannelsByUserId, 
    createChannel, 
    deleteChannel, 
    updateChannel 
} = require('../services/channel-service');


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
            channelEditPermissionCheck,
            param('id').notEmpty().isInt().withMessage('Provide a valid channel id.'),
            body('channelName').notEmpty().isString().withMessage('Provide a valid channel name.'),
            validate
        ],
        async (req, res) => {
            let { id } = req.params;
            const { channelName } = req.body;

            try {
                const updated = await updateChannel(id, channelName);
                if (updated) {
                    return res.status(200).json({
                        message: 'Channel has been updated.'
                    });
                }
                return send400(res, 'An error occurred. Please try again.');
            } catch (error) {
                const statusCode = error.status || 500;
                const message = error.message || 'An error occurred. Please try again.';

                return res.status(statusCode).json({
                    error: message
                });
            }
        }
    )
    // Delete a channel
    .delete(
        [
            jwtTokenCheck,
            channelEditPermissionCheck,
            param('id').notEmpty().isInt().withMessage('Provide a valid channel id.'),
            validate
        ],        
        async (req, res) => {
            let { id } = req.params;
            try {
                const deleted = await deleteChannel(id);
                if (deleted) {
                    return res.status(200).json({
                        message: 'Channel has been deleted.'
                    });
                }
                return send400(res, 'An error occurred. Please try again.');
            } catch (error) {
                const statusCode = error.status || 500;
                const message = error.message || 'An error occurred. Please try again.';

                return res.status(statusCode).json({
                    error: message
                });
            }
        }
    )
    // Get a channel
    .get(
        [
            param('id').notEmpty().isInt().withMessage('Provide a valid channel id.'),
            validate
        ], 
        async (req, res) => {
            const { id } = req.params;

            try {
                const channel = await getChannelById(id);
                return res.status(200).json(channel);
            } catch (error) {
                const statusCode = error.status || 500;
                const message = error.message || 'An error occurred. Please try again.';

                return res.status(statusCode).json({
                    error: message
                });
            }
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

            try {
                const created = await createChannel(sub, channelName);
                if (created) {
                    return res.status(201).json({
                        message: 'Channel has been created.'
                    });
                }
                return send400(res, 'An error occurred. Please try again.');
            } catch (error) {
                const statusCode = error.status || 500;
                const message = error.message || 'An error occurred. Please try again.';

                return res.status(statusCode).json({
                    error: message
                });
            }
    })
    // Get all channels for a user
    .get(
        async (req, res) => {
            const { userId } = req.body;
            // Check if there are channels
            try {
                const channels = await getChannelsByUserId(userId);
                return res.status(200).json(channels);
            } catch (error) {
                const statusCode = error.status || 500;
                const message = error.message || 'An error occurred. Please try again.';

                return res.status(statusCode).json({
                    error: message
                });
            }
        }
    );

module.exports = router;