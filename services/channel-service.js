const { connection, pool } = require('../db');
const { NotFoundError, InternalServerError } = require('../errors');

const getChannelById = async (id) => {
    let channels;
    const query = 'SELECT * FROM channels WHERE id = ?';
    try {
        const [ rows, fields ] = await pool.query(query, [id]);
        channels = rows;
    } catch (error) {
        throw new InternalServerError();
    }

    if (channels.length === 0) {
        throw new NotFoundError('Channel not found.');
    }

    return channels[0];
};

const getChannelsByUserId = async (userId) => {
    let channels;
    const query = 'SELECT * FROM channels WHERE user_id = ?';
    try {
        const [ rows, fields ] = await pool.query(query, [userId]);
        channels = rows;
    } catch (error) {
        throw new InternalServerError();
    }

    if (channels.length === 0) {
        throw new NotFoundError('No channels found.');
    }

    return channels;
};

const createChannel = async (userId, channelName) => {
    const query = 'INSERT INTO channels (user_id, name) VALUES (?, ?)';
    const values = [userId, channelName];

    try {
        const queryResult = await pool.query(query, values);
        return queryResult[0].affectedRows > 0;
    } catch (error) {
        throw new InternalServerError();
    }
};

const updateChannel = async (id, channelName) => {
    const query = 'UPDATE channels SET name = ? WHERE id = ?';
    const values = [channelName, id];

    try {
        const queryResult = await pool.query(query, values);
        return queryResult[0].affectedRows > 0;
    } catch (error) {
        throw new InternalServerError();
    }
};

const deleteChannel = async (id) => {
    const query = 'DELETE FROM channels WHERE id = ?';
    try {
        const queryResult = await pool.query(query, [id]);
        return queryResult[0].affectedRows > 0;
    } catch (error) {
        throw new InternalServerError();
    }
};

const deleteChannelsByUserId = async (userId) => {
    const query = 'DELETE FROM channels WHERE user_id = ?';
    try {
        const queryResult = await pool.query(query, [userId]);
        return queryResult[0].affectedRows > 0;
    } catch (error) {
        throw new InternalServerError();
    }
};

module.exports = {
    getChannelById,
    getChannelsByUserId,
    createChannel,
    updateChannel,
    deleteChannel,
    deleteChannelsByUserId
};