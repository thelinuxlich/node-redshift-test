var QueryStream = require('pg-query-stream');

exports.install = function(framework) {
	framework.route('/', test_db);
    framework.route('/pageviews', test_pageviews);
    framework.route('/creation', test_creation);
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

function test_creation() {
    var self = this;
    var complex_data;

    clearTimeout(self.subscribe.timeout);
    self.await(function(next) {
        self.database(function(err, client, done) {
            client.query("create table venue("+
                "venueid smallint not null distkey sortkey,"+
                "venuename varchar(100),"+
                "venuecity varchar(30),"+
                "venuestate char(2),"+
                "venueseats integer)", function(err, rows) {

                if(!err) {
                    console.log("Table venue created successfully");
                }

                client.query("insert into venue(venueid,venuename) values($1,$2)",[1,'bla'], function(err, rows) {
                    if(!err) {
                        console.log("Testing insertion with parameters");
                    } else {
                        console.log(err);
                    }
                    client.query("drop table venue", function(err, rows) {
                        if(!err) {
                            console.log("Table venue dropped");
                        }
                        next();
                    });
                });
                
            });
        });
    });

    self.complete(function(){
        self.view('creation');
    });
}