var pg = require('pg.js');

framework.database = function(callback) {
    return new pg.connect(framework.config['db_url'], callback);
};