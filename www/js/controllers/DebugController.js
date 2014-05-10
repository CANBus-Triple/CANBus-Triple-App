'use strict';  


angular.module('cbt')
	.controller('DebugController', function ($scope, FirmwareService ,HardwareService) {
	
	  $scope.navTitle = "Debug";
	  
	  $scope.debugString = HardwareService.debugString;
	  
	  $scope.sendTest = function(){
		  
		  HardwareService.send( String.fromCharCode(0x01,0x01) );
		  
	  };
	  
	  $scope.sendFirmware = function(){
		  
		  FirmwareService.send();
		  
	  }
	  
	  $scope.sendReset = function(){
		  
		  HardwareService.reset();
		  
	  }
	  		
		
		
	});
