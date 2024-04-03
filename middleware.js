const { validationResult } = require('express-validator');
const { verify } = require('./services/auth-service');
const { getChannelById } = require('./services/channel-service');
const { pool } = require('./db');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }

    next();
};

const jwtTokenCheck = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }

    const payload = verify(token);
    if (!payload) {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }

    req.user = payload;
    next();
};

const channelAvailabilityEditCheck = async (req, res, next) => {
    const { id } = req.params;
    const { sub } = req.user;

    try {
        const channel = await getChannelById(id);
        if (channel.user_id !== sub) {
            return res.status(403).json({
                error: 'You are not authorized to perform this action.'
            });
        }
    } catch (error) {
        statusCode = error.status || 500;
        message = error.message || 'An error occurred. Please try again.';
        return res.status(statusCode).json({
            error: message
        });
    }

    next();
};

module.exports = {
    channelAvailabilityEditCheck,
    jwtTokenCheck,
    validate
};