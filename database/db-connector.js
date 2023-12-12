// Su Youn Jeon and Xinrui Hou
// CS340 Team 110 Project 110

// Citation for the following code:
// Date: 11/14/2023
// Copied from Node.JS Starter App guide, Step 1
// No originality, just using the provided code to
//   connect to our SQL database.
// Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app/tree/main/Step%201%20-%20Connecting%20to%20a%20MySQL%20Database

// ./database/db-connector.js

// Get an instance of mysql we can use in the app
var mysql = require('mysql')

// Create a 'connection pool' using the provided credentials
var pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'classmysql.engr.oregonstate.edu',
    user            : 'cs340_jeonsu',
    password        : 'DattJCrVbzBi',
    database        : 'cs340_jeonsu'
})

// Export it for use in our applicaiton
module.exports.pool = pool;