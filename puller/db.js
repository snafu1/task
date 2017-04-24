var Sequelize = require('sequelize');
var connected = false
var synced = false

process.env.PSQL_HOST ? db_host = process.env.PSQL_HOST  : db_host = '127.0.0.1';
process.env.PSQL_PORT ? db_port = process.env.PSQL_PORT : db_port = '5432';
process.env.PSQL_USERNAME ? db_user = process.env.PSQL_USERNAME : db_user = 'postgres';
process.env.PSQL_PASSWORD ? db_pass = process.env.PSQL_PASSWORD : db_pass = 'pass1234';
process.env.PSQL_DATABASE ? db_database = process.env.PSQL_DATABASE : db_database = 'uniqcast';

console.log('database connecting to ' + db_host + ':' + db_port + ' ...');

var reconnectOptions = {
  retry_on_reconnect: {
    transactions: true,
  },
  max_retries: 999,
  onRetry: function(count) {
    console.log("connection lost, trying to reconnect ("+count+")");
  }
};

var sequelize =  new Sequelize(db_database, db_user, db_pass, {
  dialect: 'postgres',
  port: db_port,
  host: db_host,
  logging: false,
  reconnect: true,
  autoreconnect: reconnectOptions || true,
  pool: { 
    maxConnections: 10,
    maxIdleTime: 30000
  },
});


var testConnection = function() {
	setTimeout(function() {
			sequelize.authenticate().then(function() {                                                             
				if (!connected) 
					console.log('database connection has been established successfully.');
	
				if (!synced) {
					sequelize.sync().then(function(err) {                                                                  
						console.log('DB sync successful');                                                                    
						synced = true
					}).catch( function(err) {                                                                                 
						console.log('failed to sync DB', err);                                                                
					});  
				}
				connected = true
			}).catch(function (err) {
				console.log('unable to connect to the database:', err);                                               
				connected = false
			})
			testConnection();
	}, 3000); 
}
testConnection();


var Content = sequelize.define('content', {
  	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
  	},
  	content_uid: Sequelize.STRING,
  	expires: Sequelize.DATE,
}, {
	timestamps: false,
	tableName: 'content',
})


Date.prototype.addDays = function(days) {
	this.setDate(this.getDate() + parseInt(days));
    return this;
};

module.exports = {
	sequelize: sequelize,

	saveContent: function(c, days) {
		var now =  new Date();
		c.expires = now.addDays(days)  
		var content = Content.build(c);

		content.save()
			.then(function(){
				console.log('content ' + c.content_uid + ' sucesfully saved');
			})
			.catch(function(error) {
				console.log('failed to save content ' + c.content_uid);
		})
	}
}



