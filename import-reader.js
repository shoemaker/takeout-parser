var fs = require('fs');
var google = require('./controllers/google.js');
var instapaper = require('./controllers/instapaper.js');

var input, 
	destination = 'instapaper';

// Gather input params
var args = process.argv.slice(2);
if (args.length < 1) {
	console.log('\nMissing required parameters. \nUsage: ');
	console.log(' $ node import-reader.js <PATH TO INPUT.json> <IMPORT SERVICE> \nExample: ' );
	console.log(' $ node import-reader.js ./example/example.json instapaper');	
	process.exit();
} else {
	args.forEach(function(val, index, array) {
		input = args[0];
		if (args[1]) destination = args[1].toLowerCase();
	});

	// Prompt for the username and password
	instapaper.validateCredentials(function(err, username, password) {
		if (err) {
			console.log('Encountered error validating credentials. ', err);
			process.exit();
		} else {
			console.log('Username/password validated, starting import...\n');
			
			// Credentials looking good, proceed with import. 
			var newImport = new instapaper.Import(username, password);			
			// Load the input json
			var inputData = fs.readFileSync(input, encoding='utf8');
			// Parse the json into an object
			var json = JSON.parse(inputData);			
			// Iterate through the items
			json.items.forEach(function(item, index, array) {
				// Data cleanup
				item = google.cleanupReaderItem(item);
				// Push the item to the import queue
				newImport.queue.push(item);
			});

			// Subscribe (observe) to the import. Function to handle each import. 
			newImport.subscribe(function(err, item) { 
				if(err) {
					console.log('ERROR:', err);
				} else {
					console.log('Successfully imported "' + item.title + '".');
				}
			});
			
			// Perform the import
			newImport.start(function(err, result) { 
				console.log('\nCOMPLETE. \nProcessed ' + result.length + ' items.');
				process.exit();
			});
		}
	});	
}


