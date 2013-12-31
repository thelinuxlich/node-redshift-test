var pg = require('pg');

framework.database = function(callback) {
    return pg.connect(framework.config['db_url'], callback);
};