const express = require('express');
const router = express.Router();

const { pool, connection } = require('../db');

/* Settings */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)[A-Za-z\d\W]{8,20}$/;
const invalidNameRegex = /[^A-Za-z- ]/;
const invalidUsernameRegex = /[^a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~\.]/;


/* Utility Functions */
// Validate the user input for email
async function validateEmail(email) {
    if (email === undefined) {
        return false;
    }

    if (email.length > 255) {
        return false;
    }

    // Check if there are more than 2 @ symbols
    if (email.split('@').length > 2) {
        return false;
    }

    // Split the email by @ symbol
    const { local, domain } = email.split('@');

    // Check if the first or last character of the email is a dot
    if (local[0] === '.' || local[local.length - 1] === '.') {
        return false;
    }
    // Check if there are a substring of two or more dots
    if (local.includes('..') === true) {
        return false;
    }

    if (invalidUsernameRegex.test(local) === true) {
        return false;
    }
}

// Check if a user exists
async function getUser(username) {
    const [rows, fields] = await pool.query(
        'SELECT * FROM users WHERE email = ?', 
        [username]
    );
    if (rows.length > 0) {
        return rows[0];
    }

    return null;
}

// Check password requirements
function checkPasswordValidity(password) {
    // If password has less than 8 characters or more than 20 characters
    if (password.length < 8 || password.length > 20) {
        return false;
    }
    // If password has the following requirements
    // 1. At least one uppercase letter
    // 2. At least one lowercase letter
    // 3. At least one number
    // 4. At least one special character
    // 5. 8-20 characters
    if (passwordRegex.test(password) === false) {
        return false;
    }

    return true;
}


/* API Routes */
// Using router.route() to chain multiple HTTP methods
// router.route('/users').get((req, res) => {
// }).post((req, res) => {
// });

// Login
router.post('/login', (req, res) => {
    const {
        email,
        password
    } = req.body;

    // Check if email and password are provided
    if (email === undefined || password === undefined) {
        return res.status(400).json({
            error: "Provide both email and password."
        });
    }

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
                    return res.status(200).json(results[0]);
            }

            res.status(401).json({
                error: "Provide the right credentials for log-in."
            });
        }
    )
});

// Signup
router.post('/signup', async (req, res) => {
    const {
        email,
        password,
        name,
    } = req.body;

    if (email && password && name) {
        const user = {
            password,
            name
        }

        // Check if email is invalid

        // Check if username already exists
        const userExists = await getUser(email);
        if (userExists) {
            return res.status(409).json({
                error: "User with the email already exists."
            });
        }
       
        // Check if password meets the requirements
        // If password has less than 8 characters or more than 20 characters
        if (checkPasswordValidity(password) === false){
            return res.status(400).json({
                error: "Password must have the following requirements: 8-20 characters, at least one uppercase letter, one lowercase letter, one number, and one special character."
            });
        }

        // Check if name is invalid - alphabets, -, and spaces only
        if (invalidNameRegex.test(name) === true) {
            return res.status(400).json({
                error: "Name must contain only alphabets, hyphens, and spaces."
            });
        }

        const query = 'INSERT INTO users (email, password, name) VALUES (?, ?, ?)';
        const values = [email, password, name];
        try {
            await pool.query(
                query,
                values
            );

            return res.status(201).json({
                message: `Welcome, ${email}!`,
            });
        } catch (error) {
            return res.status(500).json({
                error: error.message
            });
        }
    }

    res.status(400).json({
        message: 'Please provide email, password, and name.',
    });
});

// Get a user by id
router.get('/', (req, res) => {
    const {email} = req.body;

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
});

// Delete a user by id
router.delete('/', (req, res) => {
    const { email } = req.body;

    const query = 'DELETE FROM users WHERE email = ?';
    connection.query(
        query,
        [email],
        (error, results, fields) => {
            if (error) {
                return res.status(500).json({
                    error: 'An error occurred. Please try again.'
                });
            }

            if (results.affectedRows > 0) {
                return res.status(200).json({
                    message: `User with email ${email} has been deleted.`
                });
            }

            res.status(404).json({
                error: `User with email ${email} not found.`,
            });
        }
    );
});

module.exports = router;