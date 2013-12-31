var QueryStream = require('pg-query-stream');

exports.install = function(framework) {
	framework.route('/', test_db);
    framework.route('/pageviews', test_pageviews);
    framework.websocket('/pageviews', socket_pageviews, ['json']);
};

function test_db() {
	var self = this;
    var complex_data;

    clearTimeout(self.subscribe.timeout);
    self.await(function(next) {
    	self.database(function(err, client, done) {
            client.query("SELECT top 10 referer, count(referer) AS referals FROM visits "+ 
                "LEFT OUTER JOIN pageviews ON visits.visit=pageviews.visit "+
                "WHERE pageviews.url='/some/pageview/2' "+
                "GROUP BY referer ORDER BY referals DESC", function(err, rows) {

                console.log(rows);
                complex_data = rows;

                next();
            });
        });
    });

    self.complete(function(){
        self.view('homepage', complex_data.rows);
    });
}

function test_pageviews() {
    this.view('pageviews');
}

function socket_pageviews() {
    var self = this;

    self.on('open', function(client) {

        console.log("Client connected");

        self.database(function(err, client, done) {

            var query = new QueryStream('SELECT top 10000 visit,url FROM pageviews');
            var stream = client.query(query);
            stream.on("data",function(chunk){
                self.send(chunk);
            });
        });
    });
}