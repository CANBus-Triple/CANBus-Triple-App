'use strict';
/*
 *	CANBus Tripple App
 *	http://canb.us
 *
*/


angular.module('cbt', ['ionic', 'LocalStorageModule'])
	.config(function($stateProvider, $urlRouterProvider, localStorageServiceProvider) {
	
			// Ionic uses AngularUI Router which uses the concept of states
	    // Learn more here: https://github.com/angular-ui/ui-router
	    // Set up the various states which the app can be in.
	    // Each state's controller can be found in controllers.js
	    $stateProvider
	
	        .state('connection', {
	            url: '/connection',
	            controller: 'ConnectionController',
	            templateUrl: 'templates/connection.html'
	        })
	        .state('dashboard', {
	            url: '/dashboard',
	            controller: 'DashboardController',
	            templateUrl: 'templates/dashboard.html'
	        })
	        .state('settings', {
	            url: '/settings',
	            controller: 'SettingsController',
	            templateUrl: 'templates/settings.html'
	        })
	        .state('debug', {
	            url: '/debug',
	            controller: 'DebugController',
	            templateUrl: 'templates/debug.html'
	        });
			
	    // $urlRouterProvider.otherwise('/dashboard');
	    $urlRouterProvider.otherwise('/connection');
	    
	    // Set local storage prefix
	    localStorageServiceProvider.setPrefix('CBTSettings');
	    
	})
	
	.config(['$provide', function ($provide) {
	  $provide.decorator('$rootScope', function ($delegate) {
	    
	    var _emit = $delegate.$emit;
	    $delegate.$emit = function(){
	      console.log.apply(console, arguments);
	      _emit.apply(this, arguments);
	    };
	    
			var origBroadcast = $delegate.$broadcast;
			$delegate.$broadcast = function() {
	      // console.log("$broadcast: ", JSON.stringify(arguments));
	      console.log("$broadcast: ", arguments);
	      return origBroadcast.apply(this, arguments);
	    };
			
	    return $delegate;
	    
	  });
	}])
	
	;
	
	
/*
*		Node-Webkit Things
*/
/*

if( require || require instanceof Function ){

	var gui = require('nw.gui'),
    win = gui.Window.get();
	    
	$(function(){
	    win.show();
	    console.log('Showing main nw window');
	});	
	
}
*/












