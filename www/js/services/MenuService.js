'use strict';

angular.module('cbt')
	.factory('MenuService', function() {
	
	  var menuItems = [
	      { text: 'Dashboard', iconClass: 'icon ion-model-s', link: 'dashboard'},
	      { text: 'Connection', iconClass: 'icon ion-usb', link: 'connection'},
	      { text: 'Debug', iconClass: 'icon ion-gear-b', link: 'debug'}
	  ];
	
	  return {
	    all: function() {
	      return menuItems;
	    }
	  }
	});