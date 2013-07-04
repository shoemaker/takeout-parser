## Takeout Parser

With the demise of Google Reader I had to find an alternative RSS aggregator. Before Reader shut down I exported my content using [Google Takeout](https://www.google.com/takeout/#custom). 
Rather than import my old starred items into my [new home](http://feedbin.me) for RSS feeds, I wanted to save them in Evernote. 
I wrote this little app to parse the Google Takeout JSON into text, HTML or Markdown. 
You can use this with the `starred`, `shared`, `shared-by-followers`, `notes`, and `liked` JSON export files. 

### Usage
First, export your Reader data using [Google Takeout](https://www.google.com/takeout/#custom). 

Un-ZIP your exported data and look in the "Reader" folder. 

Parse your exported data like this:

	$ node parse-reader.js <PATH TO INPUT.json> <PATH TO OUTPUT> <FORMAT (text/html/markdown)> <SORT ORDER (ascending/descending)>

For example:
	
	$ node parse-reader.js ./example/example.json ./example/output.html html

Allowed values for the output format are `text`, `html` and `markdown`.  
Allowed values for the sort order are `ascending` and `descending`. 

### Customize
The templates used for text and html output use [mustache](http://mustache.github.io/) and are located in the /views folder. Customize them to suit your needs. 
