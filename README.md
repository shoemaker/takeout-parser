## Takeout Parser

With the demise of Google Reader I had to find an alternative RSS aggregator. Before Reader shut down I exported my content using [Google Takeout](https://www.google.com/takeout/#custom). 
Rather than import my old starred items into my [new home](http://feedbin.me) for RSS feeds, I wanted to save them in Evernote. 
I wrote this little app to parse the Google Takeout JSON into text, HTML or Markdown. 
I also added the ability to import items into Instapaper. 
You can use this with the `starred`, `shared`, `shared-by-followers`, `notes`, and `liked` JSON export files. 

### Usage
First, export your Reader data using [Google Takeout](https://www.google.com/takeout/#custom). 

Un-ZIP your exported data and look in the "Reader" folder. 

#### Option 1: Parse Your Items

Parse your exported data like this:

	$ node parse-reader.js <PATH TO INPUT.json> <PATH TO OUTPUT> <FORMAT (text/html/markdown)> <SORT ORDER (ascending/descending)>

For example:
	
	$ node parse-reader.js ./example/example.json ./example/output.html html

Allowed values for the output format are `text`, `html` and `markdown`.  
Allowed values for the sort order are `ascending` and `descending`.  
The templates used for text and html output use [mustache](http://mustache.github.io/) and are located in the /views folder. Customize them to suit your needs. 

#### Option 2: Import Your Items

Import your items (into Instapaper) like this:

	$ node import-reader.js <PATH TO INPUT.json> <IMPORT SERVICE>

For example: 

	$ node import-reader.js ./example/example.json instapaper

Instapaper is the only supported service currently.  
The importer uses the Instapaper simple API rather than the full API: 
* Simple API doesn't require user to have a Pro account. 
* User does not have to register an app and obtain consumer key/secret for xAuth. 

However, there are some limitations: 
* Imports are limited to 120 per hour. 
* The simple API seems to throttle `add` requests after the first 4 attempts. 

To mitigate these issues I've added a 5 second delay (see config file). 
However, I'm not sure how this import will perform for a large (50+) import attempt. 
