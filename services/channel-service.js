const { connection, pool } = require('../db');

const getChannelById = async (id) => {
    const query = 'SELECT * FROM channels WHERE id = ?';
    const channel = await pool.query(query, [id]);
    return channel[0][0];
};

const getChannelsByUserId = async (userId) => {
    const query = 'SELECT * FROM channels WHERE user_id = ?';
    const channels = await pool.query(query, [userId]);
    return channels[0];
};

const createChannel = async (userId, channelName) => {
    const query = 'INSERT INTO channels (user_id, name) VALUES (?, ?)';
    const values = [userId, channelName];
    const queryResult = await pool.query(query, values);
    return queryResult[0].affectedRows > 0;
};

const updateChannel = async (id, channelName) => {
    const query = 'UPDATE channels SET name = ? WHERE id = ?';
    const values = [channelName, id];
    const queryResult = await pool.query(query, values);
    return queryResult[0].affectedRows > 0;
};

const deleteChannel = async (id) => {
    const query = 'DELETE FROM channels WHERE id = ?';
    const queryResult = await pool.query(query, [id]);
    return queryResult[0].affectedRows > 0;
};

const deleteChannelsByUserId = async (userId) => {
    const query = 'DELETE FROM channels WHERE user_id = ?';
    const queryResult = await pool.query(query, [userId]);
    return queryResult[0].affectedRows > 0;
};

module.exports = {
    getChannelById,
    getChannelsByUserId,
    createChannel,
    updateChannel,
    deleteChannel,
    deleteChannelsByUserId
};