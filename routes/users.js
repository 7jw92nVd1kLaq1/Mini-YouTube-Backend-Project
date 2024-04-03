const express = require('express');
const router = express.Router();
const { connection } = require('../db');
const { body } = require('express-validator');

const { validate, jwtTokenCheck } = require('../middleware');
const { createLoginToken } = require('../services/auth-service');
const { deleteUser, registerUser } = require('../services/user-service');


/* API Routes */
// Login
router.post(
    '/login', 
    [
        body('email').notEmpty().isEmail().withMessage('Provide a valid email.'),
        body('password').notEmpty().isString().withMessage('Provide a valid password.'),
        validate
    ], 
    (req, res) => {
        const {
            email,
            password
        } = req.body;

        const query = 'SELECT * FROM users WHERE email = ?';

        connection.query(
            query,
            [email],
            (errors, results, fields) => {
                if (errors) {
                    return res.status(500).json({
                        error: "An error occurred. Please try again."
                    });
                }

                if (results.length > 0) {
                    if (results[0].password === password)
                    {
                        const token = createLoginToken(results[0]);
                        res.cookie('token', token);
                        return res.status(200).json({
                            message: `Welcome back, ${results[0].email}!`
                        });
                    }
                }

                res.status(401).json({
                    error: "Provide the right credentials for log-in."
                });
            }
        )
    }
);

// Logout
router.post(
    '/logout',
    jwtTokenCheck,
    (req, res) => {
        res.clearCookie('token');
        res.status(200).json({
            message: 'You have been logged out.'
        });
    }
);

// Signup
router.post(
    '/signup',
    [
        body('email').notEmpty().isEmail().withMessage('Provide a valid email.'),
        body('password').notEmpty().isString().withMessage('Provide a valid password.'),
        body('name').notEmpty().isString().withMessage('Provide a valid name.'),
        validate
    ], 
    async (req, res) => {
        const {
            email,
            password,
            name,
        } = req.body;

        try { 
            const user = await registerUser(email, password, name);
            if (user) {
                const token = createLoginToken(user);
                res.cookie('token', token);

                return res.status(201).json({
                    message: `User with email ${email} has been created.`
                });
            }
            return res.status(409).json({
                error: `User with email ${email} already exists.`
            });
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || 'An error occurred. Please try again.';

            return res.status(status).json({
                error: message
            });
        }
    }
);

// Get a user by id
router.get(
    '/', 
    [
        body('email').notEmpty().isEmail().withMessage('Provide a valid email.'),
        validate
    ],
    (req, res) => {
        const { email } = req.body;

        const query = 'SELECT * FROM users WHERE email = ?';
        connection.query(
            query,
            [email],
            (error, results, fields) => {
                if (error) {
                    return res.status(500).json({
                        error: 'An error occurred. Please try again.'
                    });
                }

                if (results.length > 0) {
                    return res.status(200).json(results[0]);
                }

                res.status(404).json({
                    error: `User with username ${email} not found.`,
                });
            }
        );
    }
);

// Delete a user by id
router.delete(
    '/', 
    [
        jwtTokenCheck,
        validate
    ],
    async (req, res) => {
        const { sub, email } = req.user;
        try {
            const operationStatus = await deleteUser(sub);
            if (operationStatus) {
                res.clearCookie('token');
                return res.status(200).json({
                    message: `User with email ${email} has been deleted.`
                });
            }

            return res.status(404).json({
                error: `User with email ${email} not found.`
            });
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || 'An error occurred. Please try again.';

            return res.status(status).json({
                error: message
            });
        }
    }
);

module.exports = router;