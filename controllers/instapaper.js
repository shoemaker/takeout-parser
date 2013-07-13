// http://www.instapaper.com/api/full
// http://stackoverflow.com/questions/7518795/instapaper-api-javascript-xauth/9645033#comment17242258_9645033

var OAuth = require('../lib/oauth/oauth').OAuth;
var c = require('../config').config;  // App configuration
var user = require('./user');

var tokenUrl = 'https://' + c.instapaper.rootUrl + c.instapaper.tokenPath;
var oa = new OAuth(
	tokenUrl, 
	tokenUrl, 
	c.instapaper.consumerKey,
	c.instapaper.consumerSecret,
	'1.0',
	null,
	'HMAC-SHA1'
);


exports.getAccessToken = function(username, password, callback) {
	var x_auth_params = {
	  'x_auth_mode': 'client_auth',
	  'x_auth_password': password,
	  'x_auth_username': username
	};

	oa.getOAuthRequestToken(x_auth_params, function(err, token, tokenSecret, results) {
		if (err) {
			callback(null, null, err);
		} else {
console.log('\nTOKEN: ' + token);
console.log('TOKEN SECRET: ' + tokenSecret);
console.log('RESULTS: ' + JSON.stringify(results));
			callback(token, tokenSecret, results);
		}	
	});	
};

// Populate the user record with details from Instapaper
// Async process (fire-and-forget), don't return anything. 
exports.populateUserDetails = function(userid, screenName) {
	// Get the record for this user
	user.getUser(userid, function(err, currUser) {		
		oa.get('https://' + c.instapaper.rootUrl + '/api/1/account/verify_credentials', currUser.services.instapaper.token, currUser.services.instapaper.tokenSecret, function(err, data, response) {
			data = JSON.parse(data);
			currUser.services.instapaper.username = data[0].username;
						
			// Save the user.
			user.updateUser(userid, currUser, function(){});
		});
	});
}