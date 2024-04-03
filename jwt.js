require('dotenv').config();
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

const sign = (payload) => {
    return jwt.sign(
        payload, 
        secret, 
        { 
            algorithm: "HS256", 
            expiresIn: '24h' 
        }
    );
};

const verify = (token) => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
};

const createLoginToken = (user) => {
    return sign({
        sub: user.id,
        email: user.email,
    });
};

module.exports = {
    sign,
    verify,
    createLoginToken
};