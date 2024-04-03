const { validationResult } = require('express-validator');
const { verify } = require('./services/auth-service');
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
        const channelQuery = 'SELECT * FROM channels WHERE id = ?';
        const channel = await pool.query(channelQuery, [id]);
        if (channel[0].length === 0) {
            return res.status(404).json({
                error: 'Channel not found.'
            });
        }
        if (channel[0][0].user_id !== sub) {
            return res.status(403).json({
                error: 'You are not authorized to perform this action.'
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: 'An error occurred. Please try again.'
        });
    }

    next();
};

module.exports = {
    channelAvailabilityEditCheck,
    jwtTokenCheck,
    validate
};