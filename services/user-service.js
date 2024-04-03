const { pool } = require('../db');
const { 
    DuplicateEmailError,
    InvalidPasswordError,
    InvalidNameError,
    InternalServerError,
    NotFoundError
} = require('../errors');

const { deleteChannelsByUserId } = require('./channel-service');


/* RegEx Patterns */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)[A-Za-z\d\W]$/;
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

    // Delete all channels associated with the user
    await deleteChannelsByUserId(userId);
    try {
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
    let user = await getUserByEmail(email);
    if (user) {
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

    let result;
    try {
        const results = await pool.query(
            query,
            values
        );

        result = results[0];
    } catch (error) {
        throw new InternalServerError();
    }

    if (result.affectedRows === 0) {
        throw new InternalServerError();
    }

    user = await getUserByEmail(email);
    return user ? user : null;
};

const getUserByEmail = async (email) => {
    let users;
    try {
        const [rows, fields] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        users = rows;
    } catch (error) {
        throw new InternalServerError();
    }

    if (users.length === 0) {
        return null;
    }

    return users[0];
};

const getUserById = async (id) => {
    let users;
    try {
        const [rows, fields] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        users = rows;
    } catch (error) {
        throw new InternalServerError();
    }

    if (users.length === 0) {
        return null;
    }

    return users[0];
};

module.exports = {
    deleteUser,
    registerUser,
    getUserByEmail,
    getUserById
};