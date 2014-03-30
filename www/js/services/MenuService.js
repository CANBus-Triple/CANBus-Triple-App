'use strict';

angular.module('cbt')
	.factory('MenuService', function() {
	
	  var menuItems = [
	      { text: 'Dashboard', iconClass: 'icon ion-map', link: 'dashboard'},
	      { text: 'Connection', iconClass: 'icon ion-star', link: 'connection'},
	      { text: 'Debug', iconClass: 'icon ion-gear-b', link: 'debug'}
	  ];
	
	  return {
	    all: function() {
	      return menuItems;
	    }
	  }
	});