var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'mysql.eecs.oregonstate.edu',
  user            : '',
  password        : '',
  database        : '',
  dateStrings     : 'true'
});

module.exports.pool = pool;
