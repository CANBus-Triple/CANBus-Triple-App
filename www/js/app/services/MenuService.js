'use strict';

angular.module('cbt')
	.factory('MenuService', function(SettingsService) {


	  var menuItems = [
      //{ text: 'Dashboard', iconClass: 'icon ion-speedometer', link: 'dashboard'},
      //{ text: 'Diagnostics', iconClass: 'icon ion-ios-pulse', link: 'diagnostics'},
      { text: 'Packet Logger', iconClass: 'icon ion-settings', link: 'logger'},
			{ text: 'Services', iconClass: 'icon ion-ios-timer-outline', link: 'services'},
			{ text: 'Hardware', iconClass: 'icon ion-usb', link: 'hardware.status'},
			{ text: 'Firmware', iconClass: 'icon ion-code-download', link: 'hardware.firmware'},
			// { text: 'Packet Pipe', iconClass: 'icon ion-arrow-right-c', link: 'pipe'},
      { text: 'Settings', iconClass: 'icon ion-gear-b', link: 'settings'}
	  ];

		if(typeof process != 'undefined')
			menuItems.splice(4, 0, { text: 'Packet Pipe', iconClass: 'icon ion-arrow-right-c', link: 'pipe'});


	  var pluginMenuItems = [];


	  return {
	    all: function() {

				var menu = angular.copy(menuItems);

			  if( SettingsService.getDebugMode() == "true" )
					menu.push({ text: 'Debug', iconClass: 'icon ion-bug', link: 'debug'});

			  return menu;

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
