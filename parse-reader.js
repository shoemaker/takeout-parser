var fs = require('fs');
var hogan = require('./lib/hogan.js/hogan.js');
var moment = require('./lib/moment.js');

var input, output, 
	format = 'text',
	sortOrder = 'descending',
	startDate, endDate;
	
var dateFormat = 'MMMM Do YYYY HH:mm';

var args = process.argv.slice(2);
if (args.length < 2) {
	console.log('\nMissing required parameters. \nUsage: ');
	console.log(' $ node parse-reader.js <PATH TO INPUT.json> <PATH TO OUTPUT> <FORMAT (text/html/markdown)> <SORT ORDER (ascending/descending)>  \nExamples: ' );
	console.log(' $ node parse-reader.js ./example/example.json ./example/output.txt text');
	console.log(' $ node parse-reader.js ./example/example.json ./example/output.html html');
	console.log(' $ node parse-reader.js ./example/example.json ./example/output.md markdown');
	
	process.exit();
} else {
	args.forEach(function(val, index, array) {
		input = args[0];
		output = args[1]
		if (args[2]) format = args[2].toLowerCase();
		if (args[3]) sortOrder = args[3].toLowerCase();
	});

	// Load the input json
	var inputData = fs.readFileSync(input, encoding='utf8');
	// Parse the json into an object
	var json = JSON.parse(inputData);

	// Sort items
	var reverseOrder = (sortOrder == 'ascending') ? false : true;
	json.items.sort(sort_by('published', reverseOrder, parseInt));
	
	// Data cleanup/preparation
	json.items.forEach(function(item, index, array) {
		// Human-readable dates.
		item.published = moment.unix(item.published).format(dateFormat);
		item.updated = moment.unix(item.updated).format(dateFormat);
		
		// Clean up categories
		var ii = item.categories.length;
		while (ii--) {
			if (item.categories[ii].indexOf('com.google') !== -1) {
				item.categories.splice(ii, 1);
			} else {
				catName = item.categories[ii];
				item.categories[ii] = { 'name' : catName };
			}
		}

		// Determine if any categories remain
		if (item.categories.length > 0) { 
			item.hasCategories = true;
			item.categories[item.categories.length-1].last = true;
		} else {
			item.hasCategories = false;
		}
		
	});

	// Load the template
	var msTemplate = fs.readFileSync('./views/' + format + '.ms', encoding='utf8');;
	// Compile the Moustache template. 
	var template = hogan.compile(msTemplate.toString());  
	// Transform the data using the template
	var rawOutput = template.render(json); 
	
	fs.writeFile(output, rawOutput, function (err) {
		if (err) throw err;

		console.log('\nCOMPLETE. \nProcessed ' + json.items.length + ' items to ' + output + '.');
		process.exit();
	});
}

// Sort an array of objects by a particular field
function sort_by(field, reverse, primer){
   var key = function (x) {return primer ? primer(x[field]) : x[field]};

   return function (a,b) {
       var A = key(a), B = key(b);
       return (A < B ? -1 : (A > B ? 1 : 0)) * [1,-1][+!!reverse];                
   }
}

