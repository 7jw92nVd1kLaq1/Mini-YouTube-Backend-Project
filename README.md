# Mini-YouTube-Backend-Project

## Description
This is a mini project that simulates the backend of a video streaming platform "Youtube." The project is built using Express.js to handle various requests and responses. The project is also synchronized with a MySQL database to store and retrieve data. The project handles authentication and authorization using JSON Web Token.

## Features
- User can register and login
- User can create, retrieve, update, and delete a channel
- User can retrieve all its channel

## Technologies
- Node.js
- Express.js
- MySQL
- JSON Web Token

## Installation
1. Clone the repository
2. Run `npm install` to install all the dependencies
3. Create a `.env` file and add the following environment variables:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=mini_youtube

JWT_SECRET=secret
```
4. Run `node ./app.js` to start the server
5. The server will be running on `http://localhost:3000`

## API Endpoints
### User
1. Register a user
```
POST /users/signup
```
2. Login a user
```
POST /users/login
```
3. Logout a user
```
POST /users/logout
```
4. Get a user
```
GET /users
```
5. Delete a user
```
DELETE /users
```

### Channel
1. Create a channel
```
POST /channels
```
2. Get all channels of a user
```
GET /channels
```
3. Get a channel
```
GET /channels/:channelId
```
4. Update a channel
```
PUT /channels/:channelId
```
5. Delete a channel
```
DELETE /channels/:channelId
```