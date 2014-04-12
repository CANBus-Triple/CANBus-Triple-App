'use strict';

angular.module('cbt')
	.factory('MenuService', function(SettingsService) {
	
	  
	
	  return {
	    all: function() {
	    
	    	var menuItems = [
		      { text: 'Dashboard', iconClass: 'icon ion-model-s', link: 'dashboard'},
		      { text: 'Connection', iconClass: 'icon ion-usb', link: 'connection'},
		      { text: 'Settings', iconClass: 'icon ion-gear-b', link: 'settings'}
			  ];
			  
			  if( SettingsService.getDebugMode() == "true" )
			  	menuItems.push({ text: 'Debug', iconClass: 'icon ion-bug', link: 'debug'});
			  
			  return menuItems;
	    

	    }
	  }
	});