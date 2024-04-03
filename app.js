const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

// Importing the user and channel routers
const userRouter = require('./routes/users');
const channelRouter = require('./routes/channels');

app.use(express.json());
app.use(cookieParser());

app.use('/users', userRouter);
app.use('/channels', channelRouter);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});