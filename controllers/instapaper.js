// http://www.instapaper.com/api/simple
// http://www.instapaper.com/api/full

var https = require('https');
var readline = require('readline');
var c = require('../config').config;  // App configuration

// Constructor
function Import(username, password) {
	this.username = username;
	this.password = password;
	this.queue = [];  // Array of objects to save to Instapaper. 
	this.observers = [];  // Array of observers monitoring the import. 
	me = this;  // Help control scope. 
}

// Function to add a new subscriber. 
Import.prototype.subscribe = function(fn) {
	this.observers.push(fn);
};

// Function to remove a subscriber. 
Import.prototype.unsubscribe = function(fn) {
	for (var ii=0; ii<this.observers.length; ii++) {
		if (this.observers[ii] == fn) {
			this.observers.splice(ii, 1);
			break;
		}
	}
};

// Function to start the Instapaper import
Import.prototype.start = function(callback) {
	// Check the queue size
	if (this.queue.length > c.maxQueueSize) {
		callback('Unable to perform import, queue size exceeds maximum of ' + c.maxQueueSize + ' items.');
	}
	
	// Define options for HTTP request
	var options = { 
		host: 'www.instapaper.com', 
		path: '/api/add'  
	};
	
	// Iterate through the queue, import each item. 
	this.queue.forEach(function(item, index, array) {
		console.log('Processing item ' + (index+1) + ' of ' + array.length + '.');
		
	});
	
	callback(null, this.queue);
};
module.exports.Import = Import;

exports.validateCredentials = function(callback) {
	var username, password;
	
	var rl = readline.createInterface({
		input: process.stdin, output: process.stdout
	});

	rl.question('What is your Instapaper username/email? ', function(username) {
		rl.question('What is your Instapaper password (if you have one)? ', function(password) {
			rl.close();

			// Define options for HTTP request
			var options = { 
				host: 'www.instapaper.com', 
				path: '/api/authenticate',
				method: 'POST'
			};

			var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
			options.headers = {'Host': options.host, 'Authorization': auth };

			var req = https.request(options, function(res){ 
				if (res.statusCode == 200) {
					callback(null, username, password);
				} else if (res.statusCode == 403) {
					callback('Invalid username or password.');
				} else {
					callback('The service encountered an error. Please try again later.');
				}
			});
			
			req.on('error', function(err) {
				callback('The service encountered an error. Please try again later. ' + err);
			});
			
			req.end();  // Start the request.
		});
	});
};