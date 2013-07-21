// http://www.instapaper.com/api/simple
// http://www.instapaper.com/api/full

/*

Using the Instapaper simple API rather than the full API: 
* Simple API doesn't require user to have a Pro account. 
* User does not have to register an app and obtain consumer key/secret for xAuth. 

However, there are some limitations: 
* Imports are limited to 120 per hour. 
* The simple API seems to throttle "add" requests after the first 4 attempts. 

To mitigate these issues I've added a 5 second delay (see config file). 
However, I'm not sure how this import will perform for a large (50+) import attempt. 

*/

var https = require('https');
var querystring = require('querystring');
var readline = require('readline');
var async = require('../lib/async.js');
var moment = require('../lib/moment.js');
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

// Notify all subscribers
Import.prototype.notify = function(err, item) {
	for (var ii=0; ii<me.observers.length; ii++) {
		me.observers[ii](err, item);
	}
};

// Function to start the Instapaper import
Import.prototype.start = function(callback) {
	// Check the queue size
	if (this.queue.length > c.instapaper.maxQueueSize) {
		callback('Unable to perform import, queue size exceeds maximum of ' + c.instapaper.maxQueueSize + ' items.');
	}
	
	// Iterate through the queue, build up a collection of import requests.  
	var requestQueue = [];
	this.queue.forEach(function(item, index, array) {
		requestQueue.push(function(callback) { save(item, callback) } );
	});
	
	// Kick off the import. 
	var seriesStart = moment();
	async.series(requestQueue, function(err, results){
		console.log('TOTAL IMPORT TIME: ' + moment().diff(seriesStart, 'milliseconds') + 'ms');
		callback(err, results);
	});

};
module.exports.Import = Import;

// Function to validate the user's credentials. 
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

			// Encode user/password, stick in the header of the request. 
			var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
			options.headers = {'Host': options.host, 'Authorization': auth };

			// Make request to validate credentials. 
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

// Function to save an individual item to Instapaper. 
function save(item, callback) {
	// Define options for HTTP request
	var options = { 
		host: 'www.instapaper.com', 
		path: '/api/add',
		method: 'POST'
	};
	options.path += '?url=' + encodeURIComponent(item.alternate[0].href) + '&title=' + encodeURIComponent(item.title);
	
	// Encode user/password, stick in the header of the request. 
	var auth = 'Basic ' + new Buffer(me.username + ':' + me.password).toString('base64');
	options.headers = {'Host': options.host, 'Authorization': auth };
	
	var err;	
	var startTime = moment();
	var req = https.request(options, function(res){ 
		if (res.statusCode == 201) {
			err = null;
		} else if (res.statusCode == 400) {
			err = 'Bad request or exceeded the rate limit.';
		} else {
			err = 'The service encountered an error. Please try again later. [' + res.statusCode + ']';
		}
		
		me.notify(err, item); // notify all subscribers how the save went. 
		console.log('IMPORT TIME: ' + moment().diff(startTime, 'milliseconds') + 'ms\n');
		
		// Pause for X seconds to avoid Instapaper API throttling. 
		setTimeout(function() {
			callback(err, item);
		}, c.instapaper.importDelay);
	});
	
	req.on('error', function(err) {
		callback('The service encountered an error. Please try again later. ' + err);
	});

	req.end();  // Start the request.
}