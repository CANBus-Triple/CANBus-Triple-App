

var connect = require('connect');
	connect.createServer(
		
		function(req, res, next) {
		  
		  console.log("URL: ", req.url);
		  
		  var paths = req.url.split('/');
			
			switch(paths[1]){
				case 'plugins':
				case 'cordova.js':
				case 'cordova_plugins.js':
					req.url = "/platforms/android/assets/www"+ req.url;
				break;
				default:
					req.url = "/www"+req.url;
				break;
			}
			
			
	    
	    next();
		  
		},
    
    connect.static(__dirname)
    
		).listen( 8000 );