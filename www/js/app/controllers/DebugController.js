'use strict';  


angular.module('cbt')
	.controller('DebugController', function ($scope, $timeout, FirmwareService, HardwareService, UtilsService) {

	  $scope.navTitle = "Debug";

	  $scope.sendTest = function(){

		  HardwareService.send( String.fromCharCode(0x01,0x01) );

	  };

	  $scope.sendFirmware = function(){

		  FirmwareService.send();

	  }

	  $scope.sendReset = function(){

		  HardwareService.reset();

	  }


	  $scope.debugString = 'Debug Output';
	  $scope.readHandler = function(data){

			$timeout( function(){ $scope.debugString += UtilsService.ab2str(data); }, 10);

			console.log( UtilsService.ab2str(data) );

		}


		HardwareService.registerReadHandler($scope.readHandler);
		$scope.$on("$destroy", function() {
    	HardwareService.deregisterReadHandler($scope.readHandler);
    });



});
