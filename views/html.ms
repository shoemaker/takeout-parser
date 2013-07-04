<html>
	<head>
		<title>{{title}}</title>
		<style>
			.item {
				margin: 0 0 20px 0;
			}
		</style>
	</head>
	<body>
		<h2>{{title}}</h2>
		<h3>{{author}}</h3>
		
		<div id="itemsContainer">
			{{#items}}
				<p class="item">
					{{published}}{{#origin}} - <a href="{{htmlUrl}}">{{title}}</a>{{/origin}}
					<br />
					{{#alternate}}
						<a href="{{href}}">{{title}}</a>
					{{/alternate}}
					<br />
					{{#hasCategories}}
						Categories: {{#categories}}{{name}}{{^last}}, {{/last}}{{/categories}}
					{{/hasCategories}}
				</p>
			{{/items}}
		</div>
	</body>
</html>