exports.config = {
	instapaper : {
		rootUrl : 'www.instapaper.com',
		maxQueueSize : 120,  // The maximum number of items to import, governed by Instapaper rate limits. 
		importDelay : 5000  // Delay between import requests, in ms
	}
};