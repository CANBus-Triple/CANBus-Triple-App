'use strict';

angular.module('cbt')
	.factory('MenuService', function() {
	
	  var menuItems = [
	      { text: 'Dashboard', iconClass: 'icon ion-model-s', link: 'dashboard'},
	      { text: 'Connection', iconClass: 'icon ion-usb', link: 'connection'},
	      { text: 'Settings', iconClass: 'icon ion-gear-b', link: 'settings'},
	      { text: 'Debug', iconClass: 'icon ion-bug', link: 'debug'}
	  ];
	
	  return {
	    all: function() {
	      return menuItems;
	    }
	  }
	});