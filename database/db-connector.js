//Authors: Su Youn Jeon and Xinrui Hou
// Citation for the following code is modified from the template Github repository for CS 340:
//https://github.com/osu-cs340-ecampus/nodejs-starter-app/tree/main/ (Code & comments were copied)
// Date: Nov, 15th, 2023

require('dotenv').config();
var mysql = require('mysql')

// Create a 'connection pool' using the provided credentials
var pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, // Include this line to specify the port
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

// Export it for use in our applicaiton
module.exports.pool = pool;