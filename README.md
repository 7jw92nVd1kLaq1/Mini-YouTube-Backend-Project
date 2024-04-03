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