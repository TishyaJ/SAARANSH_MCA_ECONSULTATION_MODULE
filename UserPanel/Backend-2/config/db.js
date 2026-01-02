// config/db.js — re-export existing pool so code can import from config
const pool = require('../db');

module.exports = pool;
