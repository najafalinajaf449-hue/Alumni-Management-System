// MySQL connection pool (Lab 5/6 used a single connection; a pool is the upgraded version)
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "alumni_node",
    password: process.env.DB_PASSWORD || "Node@123",
    database: process.env.DB_NAME || "alumni_management",
    waitForConnections: true,
    connectionLimit: 10,
    dateStrings: true // DATE columns come back as "YYYY-MM-DD" strings (easy to use in forms)
});

module.exports = pool;
