'use strict';  


angular.module('cbt')
	.controller('DebugController', function ($scope, FirmwareService ,HardwareService) {
	
	  $scope.navTitle = "Debug";
	  
	  $scope.debugString = HardwareService.debugString;
	  
	  $scope.sendTest = function(){
		  
		  var buffer = new ArrayBuffer(2);
		  var v = new Uint8Array(buffer);
		  v[0] = 0x01;
		  v[1] = 0x01;
		  
		  HardwareService.send( v );
		  
	  };
	  
	  $scope.sendFirmware = function(){
		  
		  FirmwareService.send();
		  
	  }
	  
	  $scope.sendReset = function(){
		  
		  HardwareService.reset();
		  
	  }
	  		
		
		
	});
