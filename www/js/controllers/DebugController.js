'use strict';  


angular.module('cbt')
	.controller('DebugController', function ($scope, HardwareService) {
	
	  $scope.navTitle = "Debug";
	  
	  $scope.debugString = HardwareService.debugString;
	  
	  $scope.sendTest = function(){
		  
		  HardwareService.send( String.fromCharCode(0x01, 0x01) + "\n" );
		  
	  };
	  		
		
		
	});
