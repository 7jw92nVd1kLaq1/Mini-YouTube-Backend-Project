const { pool } = require('../db');

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
    getUserByEmail,
    getUserById
};