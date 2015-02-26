'use strict';

angular.module('cbt')
	.factory('MenuService', function(SettingsService) {
	
	  
	  var menuItems = [
      { text: 'Dashboard', iconClass: 'icon ion-speedometer', link: 'dashboard'},
      { text: 'Diagnostics', iconClass: 'icon ion-ios7-pulse', link: 'diagnostics'},
      { text: 'Packet Logger', iconClass: 'icon ion-settings', link: 'logger'},
      { text: 'Hardware', iconClass: 'icon ion-usb', link: 'hardware'},
      { text: 'Settings', iconClass: 'icon ion-gear-b', link: 'settings'}
	  ];
	  
	  var pluginMenuItems = [];
	  
	
	  return {
	    all: function() {
	    	
			  if( SettingsService.getDebugMode() == "true" )
			  	menuItems.push({ text: 'Debug', iconClass: 'icon ion-bug', link: 'debug'});
			  
			  return menuItems;

	    },
	    
	    allPlugins: function(){
		    return pluginMenuItems;
	    },
	    
	    addPlugin: function( label, icon, route ){
		    pluginMenuItems.push({ text: label, iconClass: 'icon '+icon, link: route});
	    },
	    removePlugin: function(){
		    // TODO
	    },
	    
	    
	  }
	});