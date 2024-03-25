const express = require('express');
const app = express();
const port = 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

/* Settings */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)[A-Za-z\d\W]{8,20}$/;
const invalidNameRegex = /[^A-Za-z- ]/;
const invalidUsernameRegex = /[^A-Za-z0-9]/;

/* Database */
let userCount = 1;
const users = new Map();


/* Middleware */
app.use(express.json());


/* Utility Functions */
// Check if a user exists
function getUser(username) {
    for (const existingUser of users.values()) {
        if (existingUser.username === username) {
            return existingUser;
        }
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
// Using app.route() to chain multiple HTTP methods
// app.route('/users').get((req, res) => {
// }).post((req, res) => {
// });

// Login
app.post('/login', (req, res) => {
    const {
        username,
        password
    } = req.body;

    // Check if username and password are provided
    let user = getUser(username);

    // If username exists
    if (user) {
        // Check if password is correct
        if (user.password === password) {
            return res.status(200).json({
                message: `Welcome back, ${user.username}!`
            });
        }

        // If password is incorrect
        return res.status(401).json({
            error: "Password is incorrect."
        });
    }

    // If username does not exist
    res.status(404).json({
        error: "There is no user with the provided username."
    });
});

// Signup
app.post('/signup', (req, res) => {
    const {
        username,
        password,
        name,
    } = req.body;

    // Check if username, password, and name are provided
    if (username && password && name) {
        const user = {
            username,
            password,
            name
        }

        // Check if username is invalid - alphabets and numbers only
        if (invalidUsernameRegex.test(username) === true) {
            return res.status(400).json({
                error: "Username must contain only alphabets and numbers."
            });
        }

        // Check if username already exists
        const userExists = getUser(user.username);
        if (userExists) {
            return res.status(409).json({
                error: "User with the username already exists."
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

        // Add user to the database
        users.set(userCount++, user);
        return res.status(201).json({
            message: `Welcome, ${user.username}!`,
        });
    }

    // If username, password, or name is not provided
    res.status(400).json({
        message: 'Please provide username, password, and name.',
    });
});

// Get a user by id
app.get('/users/:id', (req, res) => {
    const {id} = req.params;
    const user = users.get(parseInt(id));

    // Check if user exists
    if (user) {
        return res.status(200).json({
            message: `Hello, ${user.username}!`
        });
    }

    res.status(404).json({
        error: `User with id ${id} not found.`,
    });
});

// Delete a user by id
app.delete('/users/:id', (req, res) => {
    let {id} = req.params;
    id = parseInt(id);

    const user = users.get(id);

    // Check if user exists
    if (user) {
        users.delete(id);
        return res.status(200).json({
            message: `User with id ${id} has been deleted.`,
        });
    }

    // If user does not exist
    res.status(404).json({
        error: `User with id ${id} not found.`,
    });
});