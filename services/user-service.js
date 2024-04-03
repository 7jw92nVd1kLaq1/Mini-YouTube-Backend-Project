const { pool } = require('../db');
const { 
    DuplicateEmailError,
    InvalidPasswordError,
    InvalidNameError,
    InternalServerError
} = require('../errors');

const { deleteChannelsByUserId } = require('./channel-service');


/* RegEx Patterns */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)[A-Za-z\d\W]{8,20}$/;
const invalidNameRegex = /[^A-Za-z- ]/;


/* Utility Functions */
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

const deleteUser = async (userId) => {
    const query = 'DELETE FROM users WHERE id = ?';
    const values = [userId];

    try {
        // Delete all channels associated with the user
        await deleteChannelsByUserId(userId);
        const results = await pool.query(
            query,
            values
        );

        if (results[0].affectedRows === 0) {
            return false;
        }

        return true;
    } catch (error) {
        throw new InternalServerError();
    }
};

const registerUser = async (email, password, name) => {
    // Check if username already exists
    const userExists = await getUserByEmail(email);
    if (userExists) {
        throw new DuplicateEmailError();
    }

    // Check if password meets the requirements
    // If password has less than 8 characters or more than 20 characters
    if (checkPasswordValidity(password) === false){
        throw new InvalidPasswordError();
    }

    // Check if name is invalid - alphabets, -, and spaces only
    if (invalidNameRegex.test(name) === true) {
        throw new InvalidNameError();
    }

    const query = 'INSERT INTO users (email, password, name) VALUES (?, ?, ?)';
    const values = [email, password, name];

    try {
        const results = await pool.query(
            query,
            values
        );

        if (results[0].affectedRows === 0) {
            throw new InternalServerError();
        }

        const user = await getUserByEmail(email);
        return user ? user : null;
    } catch (error) {
        throw new InternalServerError();
    }
};

const getUserByEmail = async (email) => {
    const [rows, fields] = await pool.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );
    if (rows.length > 0) {
        return rows[0];
    }

    return null;
};

const getUserById = async (id) => {
    const [rows, fields] = await pool.query(
        'SELECT * FROM users WHERE id = ?',
        [id]
    );
    if (rows.length > 0) {
        return rows[0];
    }

    return null;
};

module.exports = {
    deleteUser,
    registerUser,
    getUserByEmail,
    getUserById
};