var moment = require('../lib/moment.js');

var dateFormat = 'MMMM Do YYYY HH:mm';

exports.cleanupReaderItem = function(item) {
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
	
	return item;
};