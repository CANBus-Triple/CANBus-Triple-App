'use strict';

angular.module('cbt')
	.factory('MenuService', function(SettingsService) {
	
	  
	
	  return {
	    all: function() {
	    
	    	var menuItems = [
		      { text: 'Dashboard', iconClass: 'icon ion-speedometer', link: 'dashboard'},
		      { text: 'Packet Logger', iconClass: 'icon ion-settings', link: 'logger'},
		      { text: 'Hardware', iconClass: 'icon ion-usb', link: 'hardware'},
		      { text: 'Settings', iconClass: 'icon ion-gear-b', link: 'settings'}
			  ];
			  
			  if( SettingsService.getDebugMode() == "true" )
			  	menuItems.push({ text: 'Debug', iconClass: 'icon ion-bug', link: 'debug'});
			  
			  return menuItems;
	    

	    }
	  }
	});