exports.install = function(framework) {
	framework.route('/', test_db);
};

function test_db() {
	var self = this;

	self.database(function(err, client, done) {

        if(err != null) {
            self.view500(err);
            return;
        }

        client.query('SELECT * FROM users', function(err, rows) {

            done();

            if (err != null) {
                self.view500(err);
                return;
            }

            console.log(rows);

            self.view('homepage', rows);
        });
    });
}